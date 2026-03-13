export type QueryIntent =
  | "REGULATORY_CHANGE"
  | "GAP_ANALYSIS"
  | "ESRS_MAPPING"
  | "NEWS_QUERY"
  | "GENERAL_QA";

export interface KnowledgeEmbeddingSearchOptions {
  limit?: number;
  sourceTypes?: string[];
  semanticLayers?: string[];
  authorityLevels?: string[];
}

export interface KnowledgeEmbeddingResultLike {
  id: number;
  sourceType: string;
  sourceId: number;
  title: string;
  content: string;
  url?: string | null;
  authorityLevel?: string | null;
  semanticLayer?: string | null;
  sourceAuthority?: string | null;
  similarity: number;
}

export interface IntentRetrievalPlan {
  label: string;
  primary: KnowledgeEmbeddingSearchOptions;
  fallback: KnowledgeEmbeddingSearchOptions;
  promptGuidance: string;
}

export interface MappingSignals {
  regulationIds: number[];
  esrsStandards: string[];
}

export interface MappingContextLike {
  regulationMappings: Array<{
    regulationId: number;
    regulationName: string;
    esrsDatapointId: string;
    relevanceScore: number;
  }>;
  gs1Mappings: Array<{
    standardId: number;
    standardName: string;
    esrsStandard: string;
    coverageType: string;
  }>;
}

export type AskIsaUiAuthorityLevel =
  | "official"
  | "verified"
  | "guidance"
  | "industry"
  | "community";

const ESRS_CODE_PATTERN = /ESRS\s+([ESAG]\d+(?:-\d+)?)/gi;

export function classifyQueryIntent(question: string): QueryIntent {
  if (/\bnews\b|article|announcement|press release/i.test(question)) {
    return "NEWS_QUERY";
  }
  if (
    /what changed|recent(ly)?|latest|updated?|amended|new rule|new regulation/i.test(
      question
    )
  ) {
    return "REGULATORY_CHANGE";
  }
  if (
    /\bgap\b|coverage|missing|uncovered|not covered|lack(ing)?/i.test(question)
  ) {
    return "GAP_ANALYSIS";
  }
  if (
    /\bmap\b|mapping|attribute|gs1\b|gtin\b|gln\b|gs1 attribute/i.test(question)
  ) {
    return "ESRS_MAPPING";
  }
  return "GENERAL_QA";
}

export function buildIntentRetrievalPlan(
  intent: QueryIntent
): IntentRetrievalPlan {
  switch (intent) {
    case "REGULATORY_CHANGE":
      return {
        label: "binding-and-freshness-first",
        primary: {
          limit: 8,
          sourceTypes: ["regulation", "news"],
          semanticLayers: ["juridisch", "normatief"],
          authorityLevels: ["binding", "authoritative"],
        },
        fallback: {
          limit: 6,
          sourceTypes: ["regulation", "esrs_datapoint", "gs1_standard", "news"],
          authorityLevels: ["binding", "authoritative", "guidance"],
        },
        promptGuidance:
          "Prioritize what changed, when it applies, and which binding or authoritative sources support the change.",
      };
    case "GAP_ANALYSIS":
      return {
        label: "coverage-and-gap-first",
        primary: {
          limit: 8,
          sourceTypes: ["regulation", "esrs_datapoint", "gs1_standard"],
          semanticLayers: ["juridisch", "normatief", "operationeel"],
          authorityLevels: ["binding", "authoritative", "guidance"],
        },
        fallback: {
          limit: 6,
          sourceTypes: ["regulation", "esrs_datapoint", "gs1_standard", "news"],
          authorityLevels: [
            "binding",
            "authoritative",
            "guidance",
            "informational",
          ],
        },
        promptGuidance:
          "Distinguish clearly between covered, partially covered, and missing requirements. Explain why any mapping is only a proxy when the evidence is indirect.",
      };
    case "ESRS_MAPPING":
      return {
        label: "mapping-and-implementation-first",
        primary: {
          limit: 8,
          sourceTypes: ["esrs_datapoint", "gs1_standard", "regulation"],
          semanticLayers: ["normatief", "operationeel", "juridisch"],
          authorityLevels: ["authoritative", "guidance", "binding"],
        },
        fallback: {
          limit: 6,
          sourceTypes: ["esrs_datapoint", "gs1_standard", "regulation", "news"],
          authorityLevels: ["binding", "authoritative", "guidance"],
        },
        promptGuidance:
          "Explain direct mappings, proxy mappings, and no-coverage cases separately. Highlight the practical GS1 implications instead of only restating the ESRS datapoint.",
      };
    case "NEWS_QUERY":
      return {
        label: "news-with-regulatory-grounding",
        primary: {
          limit: 8,
          sourceTypes: ["news", "regulation"],
          authorityLevels: ["authoritative", "guidance", "binding"],
        },
        fallback: {
          limit: 6,
          sourceTypes: ["news", "regulation", "esrs_datapoint"],
          authorityLevels: [
            "binding",
            "authoritative",
            "guidance",
            "informational",
          ],
        },
        promptGuidance:
          "Use recent news for recency, but anchor the answer in the underlying regulation or standards context whenever possible.",
      };
    case "GENERAL_QA":
    default:
      return {
        label: "broad-grounded-exploration",
        primary: {
          limit: 8,
          sourceTypes: ["regulation", "esrs_datapoint", "gs1_standard"],
          authorityLevels: ["binding", "authoritative", "guidance"],
        },
        fallback: {
          limit: 6,
          sourceTypes: ["regulation", "esrs_datapoint", "gs1_standard", "news"],
          authorityLevels: [
            "binding",
            "authoritative",
            "guidance",
            "informational",
          ],
        },
        promptGuidance:
          "Answer at an expert-but-practical level, focusing on applicability, evidence, and next-step implications.",
      };
  }
}

export function extractEsrsStandards(text: string): string[] {
  const pattern = new RegExp(ESRS_CODE_PATTERN.source, ESRS_CODE_PATTERN.flags);
  const matches: string[] = [];
  let match: RegExpExecArray | null = pattern.exec(text);

  while (match) {
    matches.push(`ESRS ${match[1]}`.toUpperCase());
    match = pattern.exec(text);
  }

  return Array.from(new Set(matches)).slice(0, 6);
}

export function deriveMappingSignals(
  question: string,
  results: KnowledgeEmbeddingResultLike[]
): MappingSignals {
  const regulationIds: number[] = [];
  const regulationIdSet = new Set<number>();

  for (const result of results) {
    if (result.sourceType !== "regulation") continue;
    if (regulationIdSet.has(result.sourceId)) continue;
    regulationIdSet.add(result.sourceId);
    regulationIds.push(result.sourceId);
    if (regulationIds.length >= 3) break;
  }

  const esrsStandards = new Set<string>(extractEsrsStandards(question));
  for (const result of results) {
    const text = `${result.title || ""}\n${result.content || ""}`;
    for (const standard of extractEsrsStandards(text)) {
      esrsStandards.add(standard);
      if (esrsStandards.size >= 6) break;
    }
    if (esrsStandards.size >= 6) break;
  }

  return {
    regulationIds,
    esrsStandards: Array.from(esrsStandards),
  };
}

export function mergeKnowledgeResults(
  resultSets: Array<KnowledgeEmbeddingResultLike[]>
): KnowledgeEmbeddingResultLike[] {
  const merged = new Map<string, KnowledgeEmbeddingResultLike>();

  for (const resultSet of resultSets) {
    for (const result of resultSet) {
      const key = `${result.sourceType}:${result.sourceId}`;
      const existing = merged.get(key);

      if (!existing || result.similarity > existing.similarity) {
        merged.set(key, {
          ...existing,
          ...result,
        });
        continue;
      }

      merged.set(key, {
        ...existing,
        content: existing.content || result.content,
        url: existing.url || result.url,
        authorityLevel: existing.authorityLevel || result.authorityLevel,
        semanticLayer: existing.semanticLayer || result.semanticLayer,
        sourceAuthority: existing.sourceAuthority || result.sourceAuthority,
      });
    }
  }

  return Array.from(merged.values());
}

export function summarizeMappingContext(mappingContext: MappingContextLike) {
  const regulationMappings = mappingContext.regulationMappings
    .slice(0, 5)
    .map(mapping => ({
      regulationId: mapping.regulationId,
      regulationName: mapping.regulationName,
      esrsDatapointId: mapping.esrsDatapointId,
      relevanceScore: mapping.relevanceScore,
    }));

  const gs1Mappings = mappingContext.gs1Mappings.slice(0, 5).map(mapping => ({
    standardId: mapping.standardId,
    standardName: mapping.standardName,
    esrsStandard: mapping.esrsStandard,
    coverageType: mapping.coverageType,
  }));

  return {
    hasSignals: regulationMappings.length > 0 || gs1Mappings.length > 0,
    regulationMappings,
    gs1Mappings,
  };
}

export function buildMappingContextPrompt(
  mappingContext: MappingContextLike
): string | null {
  const summary = summarizeMappingContext(mappingContext);
  if (!summary.hasSignals) return null;

  const sections: string[] = [];

  if (summary.regulationMappings.length > 0) {
    sections.push(
      "Relevant regulation-to-ESRS mappings:\n" +
        summary.regulationMappings
          .map(
            mapping =>
              `- ${mapping.regulationName}: ${mapping.esrsDatapointId} (relevance ${Number(mapping.relevanceScore).toFixed(2)})`
          )
          .join("\n")
    );
  }

  if (summary.gs1Mappings.length > 0) {
    sections.push(
      "Relevant GS1 coverage signals:\n" +
        summary.gs1Mappings
          .map(
            mapping =>
              `- ${mapping.esrsStandard} -> ${mapping.standardName} (${mapping.coverageType})`
          )
          .join("\n")
    );
  }

  return sections.join("\n\n");
}

export function mapAskISAV2AuthorityLevel(
  level?: string | null
): AskIsaUiAuthorityLevel {
  switch ((level || "").toLowerCase()) {
    case "binding":
    case "official":
      return "official";
    case "authoritative":
      return "verified";
    case "guidance":
      return "guidance";
    case "informational":
      return "industry";
    default:
      return "community";
  }
}
