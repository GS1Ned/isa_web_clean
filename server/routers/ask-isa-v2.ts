// @ts-nocheck
/**
 * Ask ISA v2 Router - Enhanced with Knowledge Embeddings and Reasoning Engine
 *
 * This module extends the Ask ISA functionality with:
 * - Enhanced vector search using the knowledge_embeddings table
 * - Mapping-based context enrichment
 * - Reasoning engine for gap analysis and recommendations
 */

import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { serverLogger } from "../_core/logger-wiring";
import { getDb, getRawPgSql } from "../db";
import { sql, eq, and, desc, like, inArray } from "drizzle-orm";
import { validateCitations } from "../citation-validation";
import { AbstentionReasonCode } from "../services/rag-tracing/failure-taxonomy";
import { findCanonicalFactsForQuery } from "../services/canonical-facts";
import { verifyResponseClaims } from "../claim-citation-verifier";
import { calculateAuthorityScore } from "../authority-model";
import {
  ASK_ISA_STAGE_A_ABSTENTION_MESSAGE,
  validateAskISAStageAAnswer,
} from "../ask-isa-stage-a";
import { getEsrsGs1MappingsByStandard } from "../db-esrs-gs1-mapping.js";
import { withSpan } from "../_core/tracer";
import { calculateAskIsaConfidenceFromSourceCount } from "@shared/ask-isa-confidence";
import {
  buildIntentRetrievalPlan,
  buildMappingContextPrompt,
  classifyQueryIntent,
  mapAskISAV2AuthorityLevel,
  summarizeMappingContext,
} from "./ask-isa-v2-intelligence";
import {
  buildAskISAV2QueryEmbedding,
  expandEsrsStandardsForMappings,
  rerankAskISAV2Results,
  retrieveAskISAV2Candidates,
  searchKnowledgeEmbeddings,
} from "./ask-isa-v2-retrieval";

// ---------------------------------------------------------------------------
// E-05: Inline ESRS-GS1 recommendation extraction
// ---------------------------------------------------------------------------

const ESRS_CODE_PATTERN = /ESRS\s+([ESAG]\d+(?:-\d+)?)/gi;

/**
 * Extracts ESRS standard codes mentioned in the LLM answer and fetches the
 * top GS1 attribute mappings for each, returning them as inline recommendations.
 */
async function buildInlineRecommendations(answer: string): Promise<
  Array<{
    esrsStandard: string;
    mappings: Array<{
      shortName: string;
      gs1Relevance: string;
      effectiveConfidence: string;
      decayReason: string | null;
    }>;
  }>
> {
  const matches = [...answer.matchAll(ESRS_CODE_PATTERN)];
  const standards = [
    ...new Set(matches.map(m => `ESRS ${m[1]}`.toUpperCase())),
  ].slice(0, 3);

  if (standards.length === 0) return [];

  const results = await Promise.all(
    standards.map(async standard => {
      try {
        const rows = (await getEsrsGs1MappingsByStandard(standard)) as Record<
          string,
          unknown
        >[];
        const top3 = rows.slice(0, 3).map(row => ({
          shortName: String(row.short_name || row.data_point_name || ""),
          gs1Relevance: String(row.gs1_relevance || ""),
          effectiveConfidence: String(
            row.effectiveConfidence || row.confidence || "unknown"
          ),
          decayReason: row.decayReason ? String(row.decayReason) : null,
        }));
        return { esrsStandard: standard, mappings: top3 };
      } catch {
        return { esrsStandard: standard, mappings: [] };
      }
    })
  );

  return results.filter(r => r.mappings.length > 0);
}

// Types for enhanced search
interface KnowledgeEmbeddingResult {
  id: number;
  sourceType: string;
  sourceId: number;
  title: string;
  content: string;
  url: string | null;
  authorityLevel: string | null;
  semanticLayer: string | null;
  sourceAuthority: string | null;
  similarity: number;
}

interface MappingContext {
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

interface GapAnalysisResult {
  regulation: string;
  totalDatapoints: number;
  coveredDatapoints: number;
  coveragePercentage: number;
  gaps: Array<{
    datapointId: string;
    datapointName: string;
    priority: string;
    recommendation: string;
  }>;
  recommendations: string[];
}

function extractDbRows(result: unknown): Record<string, unknown>[] {
  if (Array.isArray(result)) {
    if (result.length === 0) return [];
    if (
      result[0] &&
      typeof result[0] === "object" &&
      !Array.isArray(result[0])
    ) {
      return result as Record<string, unknown>[];
    }
    if (Array.isArray(result[0])) {
      return result[0] as Record<string, unknown>[];
    }
  }

  if (
    result &&
    typeof result === "object" &&
    "rows" in result &&
    Array.isArray((result as { rows?: unknown[] }).rows)
  ) {
    return ((result as { rows: unknown[] }).rows ?? []) as Record<
      string,
      unknown
    >[];
  }

  return [];
}

function buildExplainersFromFacts(
  facts: Array<{
    subject: string;
    predicate: string;
    objectValue: string;
    evidenceKey: string;
    factType: string;
  }>
): {
  whatIsIt: string | null;
  whenToUse: string | null;
  howToValidate: string;
  whatChanged: string | null;
  relatedStandards: string[];
} {
  const primary = facts[0];
  const lifecycle = facts.find(fact => fact.factType === "lifecycle_status");
  const relatedStandards = Array.from(
    new Set(
      facts
        .filter(fact => fact.factType === "standard_reference")
        .map(fact => fact.objectValue)
    )
  ).slice(0, 6);

  return {
    whatIsIt: primary
      ? `${primary.subject} ${primary.predicate} ${primary.objectValue}`
      : null,
    whenToUse:
      relatedStandards.length > 0
        ? `Use this guidance when your question touches ${relatedStandards.join(", ")}.`
        : null,
    howToValidate: primary
      ? `Validate against citation evidence key ${primary.evidenceKey} and the linked source URL.`
      : "Validate against the cited source URLs and evidence keys.",
    whatChanged: lifecycle
      ? `${lifecycle.subject} lifecycle status: ${lifecycle.objectValue}.`
      : null,
    relatedStandards,
  };
}

function buildStructuredMappingFallbackAnswer(
  sources: KnowledgeEmbeddingResult[],
  mappingContextSummary: ReturnType<typeof summarizeMappingContext>
): string | null {
  const exactEsrsSource = sources.find(source => source.sourceType === "esrs_datapoint");
  const gs1Sources = sources
    .filter(source => source.sourceType === "gs1_standard")
    .slice(0, 3);

  if (!exactEsrsSource || gs1Sources.length === 0) return null;

  const citationFor = (source: KnowledgeEmbeddingResult) => {
    const index = sources.findIndex(item => item.id === source.id);
    return index >= 0 ? `[Source ${index + 1}]` : "[Source 1]";
  };

  const topGs1Statements = gs1Sources
    .map(
      source =>
        `${source.title} ${citationFor(source)}`
    )
    .join(", ");

  const mappedSignals = mappingContextSummary.gs1Mappings
    .slice(0, 3)
    .map(
      mapping =>
        `${mapping.standardName} (${mapping.esrsStandard})`
    )
    .join(", ");

  return [
    `ISA can support a partial GS1 mapping answer for this request, but not a fully verified one-to-one attribute claim.`,
    `The exact ESRS disclosure context comes from ${exactEsrsSource.title} ${citationFor(exactEsrsSource)}.`,
    `The strongest GS1 implementation signals in the current corpus are ${topGs1Statements}.`,
    mappedSignals
      ? `Structured mapping context also points to ${mappedSignals} as relevant support signals.`
      : null,
    `Use those GS1 signals as supporting or proxy evidence, then validate the final disclosure design against the cited ESRS datapoints rather than assuming a single GS1 field fully satisfies the disclosure requirement ${citationFor(exactEsrsSource)}.`,
  ]
    .filter(Boolean)
    .join(" ");
}


/**
 * Get mapping context for a question
 */
async function getMappingContext(
  regulationIds: number[],
  esrsStandards: string[]
): Promise<MappingContext> {
  const db = await getDb();
  if (!db) return { regulationMappings: [], gs1Mappings: [] };

  try {
    const mappingStandards = expandEsrsStandardsForMappings(esrsStandards);

    // Get regulation-ESRS mappings
    const regMappings =
      regulationIds.length > 0
        ? await db.execute(
            sql.raw(`
          SELECT 
            rem.regulation_id as "regulationId",
            r.title as "regulationName",
            ed.code as "esrsDatapointId",
            rem.relevance_score as "relevanceScore"
          FROM regulation_esrs_mappings rem
          JOIN regulations r ON rem.regulation_id = r.id
          JOIN esrs_datapoints ed ON rem.datapoint_id = ed.id
          WHERE rem.regulation_id IN (${regulationIds.join(",")})
          ORDER BY rem.relevance_score DESC
          LIMIT 20
        `)
          )
        : [];

    // Get GS1-ESRS mappings
    const gs1Mappings =
      mappingStandards.length > 0
        ? await db.execute(
            sql.raw(`
          SELECT 
            gem.mapping_id as "standardId",
            COALESCE(gem.short_name, gem.data_point_name) as "standardName",
            gem.esrs_standard as "esrsStandard",
            gem.gs1_relevance as "coverageType"
          FROM gs1_esrs_mappings gem
          WHERE gem.esrs_standard IN (${mappingStandards.map(s => `'${s}'`).join(",")})
          LIMIT 20
        `)
          )
        : [];

    return {
      regulationMappings: extractDbRows(regMappings) as any[],
      gs1Mappings: extractDbRows(gs1Mappings) as any[],
    };
  } catch (error) {
    serverLogger.error("[AskISA-v2] Mapping context retrieval failed:", error);
    return { regulationMappings: [], gs1Mappings: [] };
  }
}

/**
 * Perform gap analysis for a regulation
 */
async function performGapAnalysis(
  regulationId: number
): Promise<GapAnalysisResult | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Get regulation info
    const regResult = await db.execute(
      sql.raw(`
      SELECT id, title, description FROM regulations WHERE id = ${regulationId}
    `)
    );
    const regulation = extractDbRows(regResult)[0] as
      | Record<string, unknown>
      | undefined;
    if (!regulation) return null;

    // Get all ESRS datapoints mapped to this regulation
    const mappingsResult = await db.execute(
      sql.raw(`
      SELECT 
        rem.datapoint_id as "esrsDatapointId",
        ed.name as "datapointName",
        ed.esrs_standard as "esrsStandard",
        rem.relevance_score as "relevanceScore"
      FROM regulation_esrs_mappings rem
      JOIN esrs_datapoints ed ON rem.datapoint_id = ed.id
      WHERE rem.regulation_id = ${regulationId}
      ORDER BY rem.relevance_score DESC
    `)
    );
    const mappings = extractDbRows(mappingsResult);

    // Get GS1 coverage for these ESRS standards
    const esrsStandards = [
      ...new Set(mappings.map((m: any) => m.esrsStandard)),
    ];
    const coverageResult =
      esrsStandards.length > 0
        ? await db.execute(
            sql.raw(`
          SELECT
            esrs_standard as "esrsStandard",
            gs1_relevance as "coverageType",
            mapping_id as "gs1StandardId"
          FROM gs1_esrs_mappings
          WHERE esrs_standard IN (${esrsStandards.map((s: string) => `'${s}'`).join(",")})
        `)
          )
        : [];
    const coverage = extractDbRows(coverageResult);

    // Calculate coverage
    const coveredStandards = new Set(coverage.map((c: any) => c.esrsStandard));
    const coveredDatapoints = mappings.filter((m: any) =>
      coveredStandards.has(m.esrsStandard)
    );

    // Identify gaps
    const gaps = mappings
      .filter((m: any) => !coveredStandards.has(m.esrsStandard))
      .slice(0, 10)
      .map((m: any) => ({
        datapointId: m.esrsDatapointId,
        datapointName: m.datapointName,
        priority:
          m.relevanceScore > 0.8
            ? "high"
            : m.relevanceScore > 0.5
              ? "medium"
              : "low",
        recommendation: `Consider implementing GS1 standards to cover ${m.esrsStandard} requirements`,
      }));

    // Generate recommendations
    const recommendations = [
      `Focus on implementing GS1 standards for ${esrsStandards
        .filter((s: string) => !coveredStandards.has(s))
        .slice(0, 3)
        .join(", ")} to improve coverage`,
      `Current GS1 coverage addresses ${Math.round((coveredDatapoints.length / mappings.length) * 100)}% of ${regulation.title} requirements`,
    ];

    return {
      regulation: regulation.title,
      totalDatapoints: mappings.length,
      coveredDatapoints: coveredDatapoints.length,
      coveragePercentage:
        mappings.length > 0
          ? Math.round((coveredDatapoints.length / mappings.length) * 100)
          : 0,
      gaps,
      recommendations,
    };
  } catch (error) {
    serverLogger.error("[AskISA-v2] Gap analysis failed:", error);
    return null;
  }
}

export const askISAV2Router = router({
  /**
   * Enhanced search using knowledge embeddings with filtering
   */
  enhancedSearch: publicProcedure
    .input(
      z.object({
        query: z.string().min(3).max(1000),
        filters: z
          .object({
            sourceTypes: z.array(z.string()).optional(),
            semanticLayers: z
              .array(z.enum(["juridisch", "normatief", "operationeel"]))
              .optional(),
            authorityLevels: z
              .array(
                z.enum([
                  "binding",
                  "authoritative",
                  "guidance",
                  "informational",
                ])
              )
              .optional(),
          })
          .optional(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      const { query, filters, limit } = input;

      try {
        const intent = classifyQueryIntent(query);
        const retrievalPlan = buildIntentRetrievalPlan(intent);
        const hasExplicitFilters = Boolean(
          filters?.sourceTypes?.length ||
            filters?.semanticLayers?.length ||
            filters?.authorityLevels?.length
        );

        let results: KnowledgeEmbeddingResult[] = [];

        if (hasExplicitFilters) {
          const queryEmbedding = await buildAskISAV2QueryEmbedding(query);
          if (queryEmbedding.length === 0) {
            return { results: [], error: "Failed to generate query embedding" };
          }

          const filteredResults = await searchKnowledgeEmbeddings(
            queryEmbedding,
            {
              limit: Math.max(limit * 4, 24),
              sourceTypes: filters?.sourceTypes,
              semanticLayers: filters?.semanticLayers,
              authorityLevels: filters?.authorityLevels,
            }
          );
          results = rerankAskISAV2Results(query, intent, filteredResults).slice(
            0,
            limit
          ) as KnowledgeEmbeddingResult[];
        } else {
          const candidateBundle = await retrieveAskISAV2Candidates(query, intent);
          results = candidateBundle.rerankedResults.slice(
            0,
            limit
          ) as KnowledgeEmbeddingResult[];
        }

        return {
          results: results.map(r => ({
            id: r.id,
            sourceType: r.sourceType,
            title: r.title,
            content:
              r.content?.substring(0, 500) +
              (r.content?.length > 500 ? "..." : ""),
            url: r.url,
            authorityLevel: r.authorityLevel,
            semanticLayer: r.semanticLayer,
            sourceAuthority: r.sourceAuthority,
            similarity: Math.round(r.similarity * 100),
          })),
          totalResults: results.length,
          queryIntent: intent,
          retrievalStrategy: retrievalPlan.label,
        };
      } catch (error) {
        serverLogger.error("[AskISA-v2] Enhanced search failed:", error);
        return { results: [], error: "Search failed" };
      }
    }),

  /**
   * Get gap analysis for a specific regulation
   */
  gapAnalysis: publicProcedure
    .input(
      z.object({
        regulationId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const result = await performGapAnalysis(input.regulationId);
      if (!result) {
        return { error: "Regulation not found or analysis failed" };
      }
      return result;
    }),

  /**
   * Get available regulations for gap analysis
   */
  getRegulationsForAnalysis: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    try {
      const result = await db.execute(
        sql.raw(`
        SELECT DISTINCT
          r.id,
          r.title as name,
          r.celex_id as short_name,
          COUNT(rem.id) as datapoint_count
        FROM regulations r
        LEFT JOIN regulation_esrs_mappings rem ON r.id = rem.regulation_id
        GROUP BY r.id, r.title, r.celex_id
        HAVING datapoint_count > 0
        ORDER BY datapoint_count DESC
      `)
      );

      return extractDbRows(result);
    } catch (error) {
      serverLogger.error("[AskISA-v2] Failed to get regulations:", error);
      return [];
    }
  }),

  /**
   * Get knowledge base statistics
   */
  getKnowledgeStats: publicProcedure.query(async () => {
    const rawSql = getRawPgSql();
    if (!rawSql) return null;

    try {
      const stats = await rawSql`
        SELECT 
          source_type,
          COUNT(*)::int as count,
          COUNT(DISTINCT source_authority)::int as unique_authorities
        FROM knowledge_embeddings
        GROUP BY source_type
      `;

      const totalResult = await rawSql`
        SELECT COUNT(*)::int as total FROM knowledge_embeddings
      `;

      return {
        bySourceType: stats || [],
        total: totalResult[0]?.total || 0,
      };
    } catch (error) {
      serverLogger.error("[AskISA-v2] Failed to get knowledge stats:", error);
      return null;
    }
  }),

  /**
   * Ask with enhanced context (uses mappings and reasoning)
   */
  askEnhanced: publicProcedure
    .input(
      z.object({
        question: z.string().min(3).max(1000),
        includeGapAnalysis: z.boolean().default(false),
        regulationId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { question, includeGapAnalysis, regulationId } = input;

      try {
        return await withSpan(
          "isa.ask_enhanced",
          {
            "question.length": question.length,
            include_gap_analysis: includeGapAnalysis,
          },
          async span => {
            const intent = classifyQueryIntent(question);
            const retrievalPlan = buildIntentRetrievalPlan(intent);
            const retrievalProfile = {
              intent,
              strategy: retrievalPlan.label,
              guidance: retrievalPlan.promptGuidance,
            };
            span.setAttribute("intent", intent);
            span.setAttribute("retrieval.strategy", retrievalPlan.label);

            const candidateBundle = await retrieveAskISAV2Candidates(
              question,
              intent
            );
            if (candidateBundle.queryEmbedding.length === 0) {
              return { error: "Failed to process question" };
            }

            const searchResults = candidateBundle.rerankedResults.slice(
              0,
              12
            ) as KnowledgeEmbeddingResult[];
            const mappingSignals = candidateBundle.mappingSignals;
            const shouldFetchMappingContext =
              mappingSignals.regulationIds.length > 0 ||
              mappingSignals.esrsStandards.length > 0;
            const mappingContext = shouldFetchMappingContext
              ? await getMappingContext(
                  mappingSignals.regulationIds,
                  mappingSignals.esrsStandards
                )
              : { regulationMappings: [], gs1Mappings: [] };
            const mappingContextSummary =
              summarizeMappingContext(mappingContext);

            const validatedSources = await validateCitations(
              searchResults.map(r => ({
                id: r.id,
                title: r.title,
                url: r.url || undefined,
                similarity: r.similarity,
              }))
            );
            const canonicalFacts = await findCanonicalFactsForQuery(
              question,
              8
            );
            const canonicalFactsForOutput = canonicalFacts.map(fact => ({
              id: fact.id,
              sourceId: fact.sourceId,
              sourceChunkId: fact.sourceChunkId,
              evidenceKey: fact.evidenceKey,
              factType: fact.factType,
              subject: fact.subject,
              predicate: fact.predicate,
              objectValue: fact.objectValue,
              confidence: fact.confidence,
            }));
            const explainers = buildExplainersFromFacts(
              canonicalFactsForOutput
            );

            const hasEvidenceCitation = validatedSources.some(
              v => typeof v.evidenceKey === "string" && v.evidenceKey.length > 0
            );
            const hasHighSimilaritySources =
              searchResults.length > 0 &&
              searchResults.some(r => r.similarity > 0.4);
            const hasCanonicalFacts = canonicalFactsForOutput.length > 0;

            let gapAnalysis: GapAnalysisResult | null = null;
            const effectiveGapRegulationId =
              regulationId ??
              (intent === "GAP_ANALYSIS" &&
              mappingSignals.regulationIds.length > 0
                ? mappingSignals.regulationIds[0]
                : undefined);
            if (
              (includeGapAnalysis || intent === "GAP_ANALYSIS") &&
              effectiveGapRegulationId
            ) {
              gapAnalysis = await performGapAnalysis(effectiveGapRegulationId);
            }
            const gapAnalysisSummary = gapAnalysis
              ? {
                  regulation: gapAnalysis.regulation,
                  coveragePercentage: gapAnalysis.coveragePercentage,
                  gapCount: gapAnalysis.gaps.length,
                  recommendations: gapAnalysis.recommendations,
                }
              : null;

            if (
              !hasEvidenceCitation &&
              !hasHighSimilaritySources &&
              !hasCanonicalFacts
            ) {
              return {
                answer:
                  "I cannot provide a compliance-grade answer because no verifiable evidence citations are available.",
                sources: [],
                abstained: true,
                abstentionReason: AbstentionReasonCode.SPECULATION_REQUIRED,
                confidence: calculateAskIsaConfidenceFromSourceCount(0),
                authority: calculateAuthorityScore([]),
                factsUsed: false,
                facts: [],
                explainers: {
                  whatIsIt: null,
                  whenToUse: null,
                  howToValidate:
                    "Validate against cited authoritative sources once retrieval finds them.",
                  whatChanged: null,
                  relatedStandards: [],
                },
                uncertainty:
                  "No knowledge embeddings or canonical facts matched this query.",
                gapAnalysis: gapAnalysisSummary,
                mappingContext: mappingContextSummary,
                retrievalProfile,
                queryIntent: intent,
                intent,
                inlineRecommendations: [],
              };
            }

            // Step 3: Build context for LLM
            const contextParts = searchResults.map((r, i) => {
              const isNews = r.sourceType === "news";
              const dateTag =
                isNews && (r as any).publishedDate
                  ? ` - ${String((r as any).publishedDate).slice(0, 10)}`
                  : "";
              const label = isNews
                ? `[Recent News${dateTag}]`
                : `[Source ${i + 1}]`;
              return `${label} ${r.title}\n${r.content}\nAuthority: ${r.authorityLevel || "unknown"}`;
            });

            let systemPrompt = `You are ISA, the Intelligent Standards Assistant for GS1 Nederland. Answer questions about EU sustainability regulations and GS1 standards based ONLY on the provided context.

IMPORTANT RULES:
- Cite every factual claim using [Source N] notation matching the source numbers below.
- If the context does not contain enough information, say so explicitly.
- Be specific about regulation names, standard codes, and compliance requirements.
- Write at least 150 words for substantive questions.
- ${retrievalPlan.promptGuidance}

Context:
${contextParts.join("\n\n")}`;

            const mappingContextPrompt =
              buildMappingContextPrompt(mappingContext);
            if (mappingContextPrompt) {
              systemPrompt += `\n\nStructured mapping context:\n${mappingContextPrompt}`;
            }

            if (canonicalFactsForOutput.length > 0) {
              const factsContext = canonicalFactsForOutput
                .slice(0, 6)
                .map(
                  (fact, index) =>
                    `[Fact ${index + 1}] ${fact.subject} ${fact.predicate} ${fact.objectValue} (evidenceKey: ${fact.evidenceKey})`
                )
                .join("\n");
              systemPrompt += `\n\nCanonical facts (with provenance):\n${factsContext}`;
            }

            if (gapAnalysis) {
              systemPrompt += `\n\nGap Analysis for ${gapAnalysis.regulation}:
- Coverage: ${gapAnalysis.coveragePercentage}%
- Total datapoints: ${gapAnalysis.totalDatapoints}
- Covered: ${gapAnalysis.coveredDatapoints}
- Key gaps: ${gapAnalysis.gaps
                .slice(0, 3)
                .map(g => g.datapointName)
                .join(", ")}`;
            }

            // Step 4: Generate answer
            const response = await invokeLLM({
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: question },
              ],
            });

            const answer =
              response.choices[0]?.message?.content ||
              "Unable to generate answer";
            const inlineRecommendations =
              await buildInlineRecommendations(answer);

            const claimVerification = verifyResponseClaims(
              answer,
              searchResults.map(r => ({
                id: r.id,
                title: r.title,
                url: r.url,
                authorityLevel: r.authorityLevel,
              }))
            );

            const responseSources = searchResults.map((r, index) => {
              const validated = validatedSources[index];
              return {
                id: r.id,
                title: r.title,
                sourceType: r.sourceType,
                authorityLevel: r.authorityLevel,
                uiAuthorityLevel: mapAskISAV2AuthorityLevel(r.authorityLevel),
                similarity: Math.round(r.similarity * 100),
                url: r.url,
                lastVerifiedDate: validated?.lastVerifiedDate,
                verificationAgeDays: validated?.verificationAgeDays,
                needsVerification: validated?.needsVerification ?? false,
                verificationReason: validated?.verificationReason,
                isDeprecated: validated?.isDeprecated ?? false,
                deprecationReason: validated?.deprecationReason,
                evidenceKey: validated?.evidenceKey ?? null,
                evidenceKeyReason:
                  validated?.evidenceKeyReason ?? "chunk_not_found",
                sourceRecordId: validated?.sourceRecordId,
                sourceChunkId: validated?.sourceChunkId,
                authorityTier: validated?.authorityTier,
                sourceRole: validated?.sourceRole,
                admissionBasis: validated?.admissionBasis,
                publicationStatus: validated?.publicationStatus,
                sourceLocator: validated?.sourceLocator,
                immutableUri: validated?.immutableUri,
                citationLabel: validated?.citationLabel,
                sourceChunkLocator: validated?.sourceChunkLocator,
              };
            });

            const evidenceReadySourceCount = validatedSources.filter(
              source =>
                typeof source.evidenceKey === "string" &&
                source.evidenceKey.length > 0
            ).length;
            const verifiedEvidenceSourceCount = validatedSources.filter(
              source =>
                typeof source.evidenceKey === "string" &&
                source.evidenceKey.length > 0 &&
                !source.needsVerification &&
                !source.isDeprecated
            ).length;
            const needsVerificationSourceCount = validatedSources.filter(
              source => source.needsVerification
            ).length;
            const deprecatedSourceCount = validatedSources.filter(
              source => source.isDeprecated
            ).length;

            const expertConfidence = calculateAskIsaConfidenceFromSourceCount(
              verifiedEvidenceSourceCount > 0
                ? verifiedEvidenceSourceCount
                : Math.min(searchResults.length, 3)
            );
            const authoritySummary = calculateAuthorityScore(
              searchResults.map(result => ({
                authorityLevel: mapAskISAV2AuthorityLevel(
                  result.authorityLevel
                ),
                similarity: result.similarity,
              }))
            );

            const stageAValidation = validateAskISAStageAAnswer({
              answer,
              sourceCount: searchResults.length,
              evidenceReadySourceCount,
              verifiedEvidenceSourceCount,
              needsVerificationSourceCount,
              deprecatedSourceCount,
              claimVerification,
              knowledgeEmbeddingMode:
                hasHighSimilaritySources && !hasEvidenceCitation,
            });

            const claimVerificationPayload = {
              verificationRate: claimVerification.verificationRate,
              totalClaims: claimVerification.totalClaims,
              verifiedClaims: claimVerification.verifiedClaims,
              unverifiedClaims: claimVerification.unverifiedClaims,
              warnings: Array.from(
                new Set([
                  ...claimVerification.warnings,
                  ...stageAValidation.warnings,
                ])
              ),
            };

            const sharedPayload = {
              confidence: expertConfidence,
              authority: authoritySummary,
              factsUsed: canonicalFactsForOutput.length > 0,
              facts: canonicalFactsForOutput,
              explainers,
              uncertainty:
                canonicalFactsForOutput.length > 0
                  ? null
                  : "No canonical facts were found for this query; response is based on document retrieval and structured mapping context only.",
              gapAnalysis: gapAnalysisSummary,
              mappingContext: mappingContextSummary,
              retrievalProfile,
              queryIntent: intent,
              intent,
              inlineRecommendations,
            };

            if (!stageAValidation.passed) {
              if (intent === "ESRS_MAPPING") {
                const fallbackAnswer = buildStructuredMappingFallbackAnswer(
                  searchResults,
                  mappingContextSummary
                );

                if (fallbackAnswer) {
                  const fallbackClaimVerification = verifyResponseClaims(
                    fallbackAnswer,
                    searchResults.map(r => ({
                      id: r.id,
                      title: r.title,
                      url: r.url,
                      authorityLevel: r.authorityLevel,
                    }))
                  );

                  const fallbackStageAValidation = validateAskISAStageAAnswer({
                    answer: fallbackAnswer,
                    sourceCount: searchResults.length,
                    evidenceReadySourceCount,
                    verifiedEvidenceSourceCount,
                    needsVerificationSourceCount,
                    deprecatedSourceCount,
                    claimVerification: fallbackClaimVerification,
                    knowledgeEmbeddingMode:
                      hasHighSimilaritySources && !hasEvidenceCitation,
                  });

                  if (fallbackAnswer) {
                    return {
                      answer: fallbackAnswer,
                      sources: responseSources,
                      citationValid: fallbackStageAValidation.citationValid,
                      missingCitations:
                        fallbackStageAValidation.missingCitations,
                      claimVerification: {
                        verificationRate:
                          fallbackClaimVerification.verificationRate,
                        totalClaims: fallbackClaimVerification.totalClaims,
                        verifiedClaims: fallbackClaimVerification.verifiedClaims,
                        unverifiedClaims:
                          fallbackClaimVerification.unverifiedClaims,
                        warnings: Array.from(
                          new Set([
                            ...fallbackClaimVerification.warnings,
                            ...fallbackStageAValidation.warnings,
                          ])
                        ),
                      },
                      ...sharedPayload,
                    };
                  }
                }
              }

              return {
                answer: ASK_ISA_STAGE_A_ABSTENTION_MESSAGE,
                sources: responseSources,
                abstained: true,
                abstentionReason: AbstentionReasonCode.SPECULATION_REQUIRED,
                citationValid: false,
                missingCitations: stageAValidation.issues,
                claimVerification: claimVerificationPayload,
                ...sharedPayload,
              };
            }

            return {
              answer,
              sources: responseSources,
              citationValid: stageAValidation.citationValid,
              missingCitations: stageAValidation.missingCitations,
              claimVerification: claimVerificationPayload,
              ...sharedPayload,
            };
          }
        ); // end withSpan
      } catch (error) {
        serverLogger.error("[AskISA-v2] Enhanced ask failed:", error);
        return { error: "Failed to process question" };
      }
    }),
});
