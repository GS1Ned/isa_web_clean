import { generateEmbedding, cosineSimilarity } from "../_core/embedding";
import { serverLogger } from "../_core/logger-wiring";
import { getDb, getRawPgSql } from "../db";
import { getEsrsGs1MappingsByStandard } from "../db-esrs-gs1-mapping.js";
import {
  buildIntentRetrievalPlan,
  classifyQueryIntent,
  deriveMappingSignals,
  extractEsrsStandards,
  mergeKnowledgeResults,
  type KnowledgeEmbeddingResultLike,
  type KnowledgeEmbeddingSearchOptions,
  type MappingSignals,
  type QueryIntent,
} from "./ask-isa-v2-intelligence";

export interface AskISAV2KnowledgeResult
  extends KnowledgeEmbeddingResultLike {
  url: string | null;
  authorityLevel: string | null;
  semanticLayer: string | null;
  sourceAuthority: string | null;
  publishedDate?: string;
  rawSourceType?: string | null;
  rawAuthorityLevel?: string | null;
  rawSemanticLayer?: string | null;
}

export interface AskISAV2CandidateBundle {
  intent: QueryIntent;
  retrievalPlan: ReturnType<typeof buildIntentRetrievalPlan>;
  queryEmbedding: number[];
  pool: AskISAV2KnowledgeResult[];
  primaryResults: AskISAV2KnowledgeResult[];
  fallbackResults: AskISAV2KnowledgeResult[];
  newsResults: AskISAV2KnowledgeResult[];
  mergedResults: AskISAV2KnowledgeResult[];
  legacyRankedResults: AskISAV2KnowledgeResult[];
  rerankedResults: AskISAV2KnowledgeResult[];
  mappingSignals: MappingSignals;
}

type MappingRow = {
  mapping_id?: number;
  mappingId?: number;
  esrs_standard?: string;
  esrsStandard?: string;
  short_name?: string;
  shortName?: string;
  data_point_name?: string;
  dataPointName?: string;
  definition?: string;
  gs1_relevance?: string;
  gs1Relevance?: string;
  effectiveConfidence?: string;
  decayReason?: string | null;
};

type RetrievalSignals = {
  acronyms: string[];
  esrsStandards: string[];
  keywords: string[];
  mentionsGs1: boolean;
  mentionsTimeline: boolean;
  mentionsMapping: boolean;
  mentionsTraceability: boolean;
};

const DEFAULT_SIMILARITY_THRESHOLD = 0.2;
const VERSION_SCOPED_URI_PATTERN =
  /(\/eli\/|\/v?\d+\.\d+(?:\.\d+)?(?:\/|$)|\/\d{4}(?:-\d{2})?(?:\/|$))/i;

const STOPWORDS = new Set([
  "about",
  "across",
  "after",
  "apply",
  "applies",
  "because",
  "between",
  "digital",
  "does",
  "doesnt",
  "explain",
  "from",
  "have",
  "high",
  "into",
  "that",
  "their",
  "them",
  "this",
  "what",
  "when",
  "which",
  "with",
  "your",
]);

let hubNewsAvailability: boolean | null = null;
const ESRS_SIGNAL_PATTERN =
  /(?:^|[^A-Z0-9])(?:ESRS\s+)?([ESAG]\d+(?:-\d+)?)(?=[^A-Z0-9]|$)/gi;

function normalizeSourceType(value?: string | null): string {
  switch ((value || "").toLowerCase()) {
    case "standard":
    case "gs1_standard":
      return "gs1_standard";
    default:
      return (value || "").toLowerCase();
  }
}

function normalizeAuthorityLevel(value?: string | null): string | null {
  switch ((value || "").toLowerCase()) {
    case "binding":
    case "official":
    case "law":
    case "directive":
    case "regulation":
      return "binding";
    case "authoritative":
    case "standard":
      return "authoritative";
    case "guidance":
    case "technical":
      return "guidance";
    case "informational":
    case "industry":
    case "community":
      return "informational";
    default:
      return value ? (value || "").toLowerCase() : null;
  }
}

function normalizeSemanticLayer(value?: string | null): string | null {
  switch ((value || "").toLowerCase()) {
    case "legal":
    case "juridical":
    case "juridisch":
      return "juridisch";
    case "normative":
    case "normatief":
      return "normatief";
    case "operational":
    case "operationeel":
      return "operationeel";
    default:
      return value ? (value || "").toLowerCase() : null;
  }
}

function hasVersionScopedUri(url?: string | null): boolean {
  return typeof url === "string" && VERSION_SCOPED_URI_PATTERN.test(url);
}

function legacyAuthorityWeight(authorityLevel?: string | null): number {
  switch ((authorityLevel || "unknown").toLowerCase()) {
    case "binding":
      return 0.2;
    case "authoritative":
      return 0.15;
    case "guidance":
      return 0.05;
    default:
      return 0;
  }
}

export function scoreAskISAV2LegacyResult(
  result: AskISAV2KnowledgeResult
): number {
  const versionBoost = hasVersionScopedUri(result.url) ? 0.05 : 0;
  return (
    (result.similarity || 0) +
    legacyAuthorityWeight(result.authorityLevel) +
    versionBoost
  );
}

function tokenize(text: string): string[] {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .map(token => token.trim())
    .filter(token => token.length >= 3 && !STOPWORDS.has(token));
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function extractEsrsSignalCodes(text: string): string[] {
  const matches = Array.from(String(text || "").matchAll(ESRS_SIGNAL_PATTERN));
  return unique(matches.map(match => String(match[1] || "").toUpperCase()));
}

function toRootEsrsStandard(standard: string): string {
  const normalized = String(standard || "")
    .trim()
    .toUpperCase()
    .replace(/^ESRS\s+/, "");

  if (normalized === "2" || normalized === "ESRS 2") {
    return "ESRS 2";
  }

  const match = normalized.match(/^([ESAG]\d+)(?:-\d+)?$/);
  return match ? match[1] : normalized;
}

export function expandEsrsStandardsForMappings(standards: string[]): string[] {
  return unique(
    standards
      .map(standard => String(standard || "").trim().toUpperCase())
      .filter(Boolean)
      .map(toRootEsrsStandard)
  );
}

function buildRetrievalSignals(question: string): RetrievalSignals {
  const original = String(question || "");
  const lower = original.toLowerCase();

  return {
    acronyms: unique(
      (original.match(/\b[A-Z]{3,6}\b/g) || []).map(token => token.trim())
    ),
    esrsStandards: extractEsrsStandards(original),
    keywords: unique(tokenize(original)).slice(0, 16),
    mentionsGs1: /\bgs1\b|\bgtin\b|\bgln\b|digital link|epcis|identifier/i.test(
      original
    ),
    mentionsTimeline:
      /what changed|recent|latest|updated?|amended|timeline|effective|when/i.test(
        lower
      ),
    mentionsMapping: /\bmap\b|mapping|attributes?|coverage|proxy/i.test(lower),
    mentionsTraceability:
      /traceability|passport|digital product passport|battery passport/i.test(
        lower
      ),
  };
}

function countMatches(tokens: string[], haystack: string): number {
  if (!tokens.length || !haystack) return 0;
  return tokens.reduce(
    (count, token) => count + (haystack.includes(token) ? 1 : 0),
    0
  );
}

function sourceTypeBoost(
  intent: QueryIntent,
  sourceType: string
): number {
  switch (intent) {
    case "REGULATORY_CHANGE":
      if (sourceType === "regulation") return 0.12;
      if (sourceType === "news") return 0.08;
      if (sourceType === "esrs_datapoint") return -0.03;
      return 0;
    case "GAP_ANALYSIS":
      if (sourceType === "regulation") return 0.1;
      if (sourceType === "esrs_datapoint") return 0.12;
      if (sourceType === "gs1_standard") return 0.07;
      return 0;
    case "ESRS_MAPPING":
      if (sourceType === "gs1_standard") return 0.12;
      if (sourceType === "esrs_datapoint") return 0.11;
      if (sourceType === "regulation") return 0.05;
      return 0;
    case "NEWS_QUERY":
      if (sourceType === "news") return 0.15;
      if (sourceType === "regulation") return 0.1;
      return 0;
    case "GENERAL_QA":
    default:
      if (sourceType === "regulation") return 0.06;
      if (sourceType === "esrs_datapoint") return 0.05;
      if (sourceType === "gs1_standard") return 0.05;
      return 0;
  }
}

function hasMatchingEsrsCode(
  result: AskISAV2KnowledgeResult,
  esrsStandards: string[]
): boolean {
  if (!esrsStandards.length) return false;
  const expectedCodes = new Set(
    esrsStandards.map(code => code.replace(/^ESRS\s+/i, "").toUpperCase())
  );
  const resultCodes = new Set(
    extractEsrsSignalCodes(`${result.title}\n${result.content}`)
  );
  return Array.from(expectedCodes).some(code => resultCodes.has(code));
}

function scoreAskISAV2Result(
  question: string,
  intent: QueryIntent,
  result: AskISAV2KnowledgeResult,
  mappingSignals?: MappingSignals
): number {
  const signals = buildRetrievalSignals(question);
  const title = result.title.toLowerCase();
  const content = result.content.toLowerCase();
  const titleMatches = countMatches(signals.keywords, title);
  const contentMatches = countMatches(signals.keywords, content);
  const acronymTitleMatches = countMatches(
    signals.acronyms.map(token => token.toLowerCase()),
    title
  );
  const acronymContentMatches = countMatches(
    signals.acronyms.map(token => token.toLowerCase()),
    content
  );

  let score = scoreAskISAV2LegacyResult(result);
  score += sourceTypeBoost(intent, result.sourceType);
  score += Math.min(titleMatches * 0.04, 0.18);
  score += Math.min(contentMatches * 0.01, 0.05);
  score += Math.min(acronymTitleMatches * 0.08, 0.16);
  score += Math.min(acronymContentMatches * 0.03, 0.06);

  if (signals.esrsStandards.length > 0) {
    if (hasMatchingEsrsCode(result, signals.esrsStandards)) {
      score += result.title.toUpperCase().includes(signals.esrsStandards[0])
        ? 0.28
        : 0.18;
    } else if (result.sourceType === "esrs_datapoint") {
      score -= 0.12;
    }
  }

  if (signals.mentionsGs1 && result.sourceType === "gs1_standard") {
    score += 0.11;
  }

  if (signals.mentionsMapping && result.sourceType === "gs1_standard") {
    score += 0.06;
  }

  if (signals.mentionsTimeline && result.sourceType === "news") {
    score += 0.05;
  }

  if (
    signals.mentionsTraceability &&
    /traceability|passport|digital link|epcis/i.test(
      `${result.title}\n${result.content}`
    )
  ) {
    score += 0.05;
  }

  if (mappingSignals?.regulationIds?.length && result.sourceType === "regulation") {
    score += 0.03;
  }

  if (mappingSignals?.esrsStandards?.length && result.sourceType === "gs1_standard") {
    score += 0.03;
  }

  return score;
}

function promoteFirstMatchingResult(
  ranked: AskISAV2KnowledgeResult[],
  predicate: (result: AskISAV2KnowledgeResult) => boolean,
  targetIndex: number,
  windowSize: number
): AskISAV2KnowledgeResult[] {
  if (ranked.slice(0, windowSize).some(predicate)) {
    return ranked;
  }

  const promotedIndex = ranked.findIndex(predicate);
  if (promotedIndex === -1) return ranked;

  const clone = ranked.slice();
  const [promoted] = clone.splice(promotedIndex, 1);
  clone.splice(Math.min(targetIndex, clone.length), 0, promoted);
  return clone;
}

function applyIntentCoveragePromotion(
  question: string,
  intent: QueryIntent,
  ranked: AskISAV2KnowledgeResult[],
  mappingSignals?: MappingSignals
): AskISAV2KnowledgeResult[] {
  let next = ranked.slice();
  const signals = buildRetrievalSignals(question);

  if (intent === "REGULATORY_CHANGE" || intent === "NEWS_QUERY") {
    next = promoteFirstMatchingResult(next, result => result.sourceType === "regulation", 0, 2);
  }

  if (intent === "ESRS_MAPPING" && signals.mentionsGs1) {
    next = promoteFirstMatchingResult(
      next,
      result => result.sourceType === "gs1_standard",
      signals.esrsStandards.length > 0 ? 1 : 0,
      signals.esrsStandards.length > 0 ? 3 : 1
    );
  }

  if (signals.esrsStandards.length > 0) {
    next = promoteFirstMatchingResult(
      next,
      result =>
        result.sourceType === "esrs_datapoint" &&
        hasMatchingEsrsCode(result, signals.esrsStandards),
      0,
      3
    );
  }

  if (signals.mentionsTraceability) {
    next = promoteFirstMatchingResult(
      next,
      result =>
        /traceability|passport|digital link|epcis/i.test(
          `${result.title}\n${result.content}`
        ),
      Math.min(1, next.length),
      3
    );
  }

  if (
    intent !== "ESRS_MAPPING" &&
    mappingSignals?.regulationIds?.length &&
    signals.esrsStandards.length === 0
  ) {
    next = promoteFirstMatchingResult(next, result => result.sourceType === "regulation", 0, 3);
  }

  return next;
}

export function rerankAskISAV2Results(
  question: string,
  intent: QueryIntent,
  results: AskISAV2KnowledgeResult[],
  mappingSignals?: MappingSignals
): AskISAV2KnowledgeResult[] {
  const ranked = results
    .slice()
    .sort(
      (left, right) =>
        scoreAskISAV2Result(question, intent, right, mappingSignals) -
          scoreAskISAV2Result(question, intent, left, mappingSignals) ||
        right.similarity - left.similarity
    );

  return applyIntentCoveragePromotion(question, intent, ranked, mappingSignals);
}

function parseEmbeddingValue(value: unknown): number[] | null {
  if (Array.isArray(value)) {
    return value.every(item => typeof item === "number")
      ? (value as number[])
      : null;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parseEmbeddingValue(parsed);
    } catch {
      return null;
    }
  }

  return null;
}

function normalizeKnowledgeRow(row: Record<string, unknown>): AskISAV2KnowledgeResult | null {
  const embedding = parseEmbeddingValue(row.embedding);
  if (!embedding || embedding.length === 0) return null;

  const rawSourceType =
    typeof row.sourceType === "string" ? row.sourceType : null;
  const rawAuthorityLevel =
    typeof row.authorityLevel === "string" ? row.authorityLevel : null;
  const rawSemanticLayer =
    typeof row.semanticLayer === "string" ? row.semanticLayer : null;

  return {
    id: Number(row.id),
    sourceType: normalizeSourceType(rawSourceType),
    sourceId: Number(row.sourceId),
    title: String(row.title || ""),
    content: String(row.content || ""),
    url: row.url ? String(row.url) : null,
    authorityLevel: normalizeAuthorityLevel(rawAuthorityLevel),
    semanticLayer: normalizeSemanticLayer(rawSemanticLayer),
    sourceAuthority: row.sourceAuthority ? String(row.sourceAuthority) : null,
    similarity: 0,
    rawSourceType,
    rawAuthorityLevel,
    rawSemanticLayer,
    // The embedding is carried temporarily on the object for scoring.
    embedding,
  } as AskISAV2KnowledgeResult & { embedding: number[] };
}

async function loadKnowledgeSimilarityPool(
  queryEmbedding: number[]
): Promise<AskISAV2KnowledgeResult[]> {
  await getDb();
  const pgSql = getRawPgSql();
  if (!pgSql) {
    serverLogger.warn(
      "[AskISA-v2] Raw PG client not available for knowledge similarity pool"
    );
    return [];
  }

  try {
    const rows = (await pgSql`
      SELECT
        id,
        source_type AS "sourceType",
        source_id AS "sourceId",
        title,
        content,
        url,
        authority_level AS "authorityLevel",
        semantic_layer AS "semanticLayer",
        source_authority AS "sourceAuthority",
        embedding
      FROM knowledge_embeddings
      WHERE embedding IS NOT NULL
    `) as Record<string, unknown>[];

    return rows
      .map(normalizeKnowledgeRow)
      .filter(
        (
          result
        ): result is AskISAV2KnowledgeResult & { embedding: number[] } =>
          Boolean(result && Array.isArray((result as { embedding?: number[] }).embedding))
      )
      .map(result => ({
        ...result,
        similarity: cosineSimilarity(queryEmbedding, result.embedding),
      }))
      .filter(result => Number.isFinite(result.similarity))
      .map(({ embedding, ...result }) => result);
  } catch (error) {
    serverLogger.error("[AskISA-v2] Failed to load knowledge similarity pool:", error);
    return [];
  }
}

export function filterKnowledgeSimilarityPool(
  pool: AskISAV2KnowledgeResult[],
  options: KnowledgeEmbeddingSearchOptions = {}
): AskISAV2KnowledgeResult[] {
  const {
    limit = 10,
    sourceTypes,
    semanticLayers,
    authorityLevels,
  } = options;

  return pool
    .filter(result => {
      if (sourceTypes?.length && !sourceTypes.includes(result.sourceType)) {
        return false;
      }
      if (
        semanticLayers?.length &&
        (!result.semanticLayer || !semanticLayers.includes(result.semanticLayer))
      ) {
        return false;
      }
      if (
        authorityLevels?.length &&
        (!result.authorityLevel ||
          !authorityLevels.includes(result.authorityLevel))
      ) {
        return false;
      }
      return result.similarity >= DEFAULT_SIMILARITY_THRESHOLD;
    })
    .sort((left, right) => right.similarity - left.similarity)
    .slice(0, limit);
}

async function ensureHubNewsAvailable(): Promise<boolean> {
  if (hubNewsAvailability !== null) return hubNewsAvailability;

  await getDb();
  const pgSql = getRawPgSql();
  if (!pgSql) {
    hubNewsAvailability = false;
    return hubNewsAvailability;
  }

  try {
    const rows = await pgSql`
      SELECT to_regclass('public.hub_news') AS table_name
    `;
    hubNewsAvailability = Boolean(rows?.[0]?.table_name);
  } catch {
    hubNewsAvailability = false;
  }

  return hubNewsAvailability;
}

export async function buildAskISAV2QueryEmbedding(
  question: string
): Promise<number[]> {
  try {
    const embedding = await generateEmbedding(question);
    return embedding.embedding;
  } catch (error) {
    serverLogger.error("[AskISA-v2] Embedding generation failed:", error);
    return [];
  }
}

export async function searchKnowledgeEmbeddings(
  queryEmbedding: number[],
  options: KnowledgeEmbeddingSearchOptions = {}
): Promise<AskISAV2KnowledgeResult[]> {
  const pool = await loadKnowledgeSimilarityPool(queryEmbedding);
  return filterKnowledgeSimilarityPool(pool, options);
}

export async function searchRecentNewsArticles(
  query: string,
  limit = 4
): Promise<AskISAV2KnowledgeResult[]> {
  const hasHubNews = await ensureHubNewsAvailable();
  if (!hasHubNews) return [];

  const db = await getDb();
  if (!db) return [];

  const keywords = unique(
    query
      .split(/\s+/)
      .map(token => token.replace(/[^a-zA-Z0-9]/g, ""))
      .filter(token => token.length >= 4)
      .slice(0, 4)
  );

  try {
    const rows = await db.execute(
      `
        SELECT
          id,
          title,
          COALESCE(summary, LEFT(content, 500)) AS content,
          source_url AS url,
          credibility_score,
          published_date
        FROM hub_news
        WHERE published_date >= CURRENT_DATE - INTERVAL '30 days'
          AND credibility_score >= 0.7
        ORDER BY published_date DESC
        LIMIT 150
      `
    );

    const articles = ((rows as unknown as { rows?: Record<string, unknown>[] })?.rows ||
      (rows as Record<number, Record<string, unknown>[]>)[0] ||
      []) as Record<string, unknown>[];

    const filtered = articles
      .filter(article => {
        if (!keywords.length) return true;
        const text = `${article.title || ""}\n${article.content || ""}`.toLowerCase();
        return keywords.some(keyword => text.includes(keyword.toLowerCase()));
      })
      .slice(0, limit);

    return filtered.map((article, index) => {
      const credibility = Number(article.credibility_score || 0);
      const authorityLevel =
        credibility >= 0.9
          ? "binding"
          : credibility >= 0.8
            ? "authoritative"
            : "guidance";

      return {
        id: -(index + 1),
        sourceType: "news",
        sourceId: Number(article.id),
        title: String(article.title || ""),
        content: String(article.content || ""),
        url: article.url ? String(article.url) : null,
        authorityLevel,
        semanticLayer: "juridisch",
        sourceAuthority: null,
        similarity: Number(Math.min(credibility, 1).toFixed(4)),
        publishedDate: article.published_date
          ? String(article.published_date)
          : undefined,
      };
    });
  } catch (error) {
    serverLogger.error("[AskISA-v2] Recent news retrieval failed:", error);
    return [];
  }
}

async function fetchGs1MappingCandidates(
  esrsStandards: string[]
): Promise<AskISAV2KnowledgeResult[]> {
  const rootStandards = expandEsrsStandardsForMappings(esrsStandards).slice(0, 3);
  if (!rootStandards.length) return [];

  const rows = (
    await Promise.all(
      rootStandards.map(async standard => {
        try {
          return (await getEsrsGs1MappingsByStandard(standard)) as MappingRow[];
        } catch {
          return [] as MappingRow[];
        }
      })
    )
  ).flat();

  return rows.slice(0, 9).map((row, index) => {
    const effectiveConfidence = String(row.effectiveConfidence || "").toLowerCase();
    const similarity =
      effectiveConfidence === "high"
        ? 0.72
        : effectiveConfidence === "medium"
          ? 0.64
          : 0.56;
    const shortName = String(
      row.short_name || row.shortName || row.data_point_name || row.dataPointName || "GS1 mapping"
    );
    const esrsStandard = String(
      row.esrsStandard || row.esrs_standard || ""
    ).toUpperCase();
    const relevance = String(row.gs1Relevance || row.gs1_relevance || "mapped");

    return {
      id: -(5000 + index),
      sourceType: "gs1_standard",
      sourceId: -(5000 + index),
      title: `${shortName} for ${esrsStandard}`,
      content: [
        `GS1 mapping candidate for ${esrsStandard}.`,
        row.definition ? String(row.definition) : null,
        `GS1 relevance: ${relevance}.`,
      ]
        .filter(Boolean)
        .join(" "),
      url: null,
      authorityLevel: "guidance",
      semanticLayer: "operationeel",
      sourceAuthority: "internal_mapping",
      similarity,
    };
  });
}

export async function retrieveAskISAV2Candidates(
  question: string,
  intent?: QueryIntent
): Promise<AskISAV2CandidateBundle> {
  const resolvedIntent = intent ?? classifyQueryIntent(question);
  const retrievalPlan = buildIntentRetrievalPlan(resolvedIntent);
  const questionSignals = buildRetrievalSignals(question);
  const queryEmbedding = await buildAskISAV2QueryEmbedding(question);

  if (queryEmbedding.length === 0) {
    return {
      intent: resolvedIntent,
      retrievalPlan,
      queryEmbedding,
      pool: [],
      primaryResults: [],
      fallbackResults: [],
      newsResults: [],
      mergedResults: [],
      legacyRankedResults: [],
      rerankedResults: [],
      mappingSignals: { regulationIds: [], esrsStandards: [] },
    };
  }

  const pool = await loadKnowledgeSimilarityPool(queryEmbedding);
  const primaryResults = filterKnowledgeSimilarityPool(pool, {
    ...retrievalPlan.primary,
    limit: Math.max((retrievalPlan.primary.limit || 8) * 4, 24),
  });
  const fallbackResults = filterKnowledgeSimilarityPool(pool, {
    ...retrievalPlan.fallback,
    limit: Math.max((retrievalPlan.fallback.limit || 6) * 4, 18),
  });
  const mappingCandidates =
    resolvedIntent === "ESRS_MAPPING" && questionSignals.mentionsGs1
      ? await fetchGs1MappingCandidates(questionSignals.esrsStandards)
      : [];
  const newsResults =
    resolvedIntent === "REGULATORY_CHANGE" || resolvedIntent === "NEWS_QUERY"
      ? await searchRecentNewsArticles(question, 4)
      : [];

  const mergedResults = mergeKnowledgeResults([
    mappingCandidates,
    newsResults,
    primaryResults,
    fallbackResults,
  ]) as AskISAV2KnowledgeResult[];

  const mappingSignals = deriveMappingSignals(question, mergedResults);
  const legacyRankedResults = mergedResults
    .slice()
    .sort(
      (left, right) =>
        scoreAskISAV2LegacyResult(right) - scoreAskISAV2LegacyResult(left)
    );
  const rerankedResults = rerankAskISAV2Results(
    question,
    resolvedIntent,
    mergedResults,
    mappingSignals
  );

  return {
    intent: resolvedIntent,
    retrievalPlan,
    queryEmbedding,
    pool,
    primaryResults,
    fallbackResults,
    newsResults,
    mergedResults,
    legacyRankedResults,
    rerankedResults,
    mappingSignals,
  };
}
