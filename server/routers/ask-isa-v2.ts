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
import { getDb } from "../db";
import { sql, eq, and, desc, like, inArray } from "drizzle-orm";
import { validateCitations } from "../citation-validation";
import { AbstentionReasonCode } from "../services/rag-tracing/failure-taxonomy";
import { findCanonicalFactsForQuery } from "../services/canonical-facts";
import { verifyResponseClaims } from "../claim-citation-verifier";
import {
  ASK_ISA_STAGE_A_ABSTENTION_MESSAGE,
  validateAskISAStageAAnswer,
} from "../ask-isa-stage-a";
import { getEsrsGs1MappingsByStandard } from "../db-esrs-gs1-mapping.js";

// ---------------------------------------------------------------------------
// E-04: Query intent classification
// ---------------------------------------------------------------------------

type QueryIntent = 'REGULATORY_CHANGE' | 'GAP_ANALYSIS' | 'ESRS_MAPPING' | 'NEWS_QUERY' | 'GENERAL_QA';

/**
 * Classifies the user's query intent using fast rule-based matching.
 * No LLM call — regex only for minimal latency overhead.
 */
function classifyQueryIntent(question: string): QueryIntent {
  if (/what changed|recent(ly)?|latest|updated?|amended|new rule|new regulation/i.test(question)) {
    return 'REGULATORY_CHANGE';
  }
  if (/\bgap\b|coverage|missing|uncovered|not covered|lack(ing)?/i.test(question)) {
    return 'GAP_ANALYSIS';
  }
  if (/\bmap\b|mapping|attribute|gs1\b|gtin\b|gln\b|gs1 attribute/i.test(question)) {
    return 'ESRS_MAPPING';
  }
  if (/\bnews\b|article|announcement|press release/i.test(question)) {
    return 'NEWS_QUERY';
  }
  return 'GENERAL_QA';
}

// ---------------------------------------------------------------------------
// E-06: Recent news article retrieval
// ---------------------------------------------------------------------------

/**
 * Queries hub_news for high-credibility articles published in the last 30 days
 * that keyword-match the query. Results are shaped to match KnowledgeEmbeddingResult
 * so they can be merged seamlessly into the main retrieval set.
 */
async function searchRecentNewsArticles(
  query: string,
  limit = 4
): Promise<KnowledgeEmbeddingResult[]> {
  const db = await getDb();
  if (!db) return [];

  // Extract up to 3 significant keywords (≥4 chars) from the query.
  const keywords = query
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, ''))
    .filter((w) => w.length >= 4)
    .slice(0, 3);

  if (keywords.length === 0) return [];

  try {
    const likeConditions = keywords
      .map((kw) => `(title LIKE '%${kw}%' OR content LIKE '%${kw}%' OR summary LIKE '%${kw}%')`)
      .join(' OR ');

    const rows = await db.execute(sql.raw(`
      SELECT
        id,
        title,
        COALESCE(summary, LEFT(content, 500)) as content,
        source_url as url,
        credibility_score,
        published_date,
        regulation_tags
      FROM hub_news
      WHERE published_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND credibility_score >= 0.7
        AND (${likeConditions})
      ORDER BY published_date DESC
      LIMIT ${limit}
    `));

    const articles = ((rows as any)[0] || []) as Record<string, unknown>[];

    return articles.map((a, idx) => {
      const credibility = parseFloat(String(a.credibility_score || 0));
      const authorityLevel =
        credibility >= 0.9 ? 'binding' :
        credibility >= 0.7 ? 'authoritative' :
        'guidance';
      return {
        id: -(idx + 1), // Negative IDs to distinguish from knowledge_embeddings
        sourceType: 'news',
        sourceId: Number(a.id),
        title: String(a.title || ''),
        content: String(a.content || ''),
        url: a.url ? String(a.url) : null,
        authorityLevel,
        semanticLayer: null,
        sourceAuthority: null,
        similarity: credibility * 0.75, // Normalize into [0,1] range
        publishedDate: a.published_date ? String(a.published_date) : undefined,
      } as KnowledgeEmbeddingResult & { publishedDate?: string };
    });
  } catch (error) {
    serverLogger.error('[AskISA-v2] Recent news retrieval failed:', error);
    return [];
  }
}

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
    mappings: Array<{ shortName: string; gs1Relevance: string; effectiveConfidence: string; decayReason: string | null }>;
  }>
> {
  const matches = [...answer.matchAll(ESRS_CODE_PATTERN)];
  const standards = [...new Set(matches.map((m) => `ESRS ${m[1]}`.toUpperCase()))].slice(0, 3);

  if (standards.length === 0) return [];

  const results = await Promise.all(
    standards.map(async (standard) => {
      try {
        const rows = await getEsrsGs1MappingsByStandard(standard) as Record<string, unknown>[];
        const top3 = rows.slice(0, 3).map((row) => ({
          shortName: String(row.short_name || row.data_point_name || ''),
          gs1Relevance: String(row.gs1_relevance || ''),
          effectiveConfidence: String(row.effectiveConfidence || row.confidence || 'unknown'),
          decayReason: row.decayReason ? String(row.decayReason) : null,
        }));
        return { esrsStandard: standard, mappings: top3 };
      } catch {
        return { esrsStandard: standard, mappings: [] };
      }
    })
  );

  return results.filter((r) => r.mappings.length > 0);
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

const VERSION_SCOPED_URI_PATTERN = /(\/eli\/|\/v?\d+\.\d+(?:\.\d+)?(?:\/|$)|\/\d{4}(?:-\d{2})?(?:\/|$))/i;

function hasVersionScopedUri(url?: string | null): boolean {
  return typeof url === 'string' && VERSION_SCOPED_URI_PATTERN.test(url);
}

function authorityWeight(authorityLevel?: string | null): number {
  switch ((authorityLevel || 'unknown').toLowerCase()) {
    case 'binding':
    case 'official':
      return 0.2;
    case 'authoritative':
    case 'regulatory':
      return 0.15;
    case 'industry':
      return 0.1;
    case 'guidance':
      return 0.05;
    default:
      return 0;
  }
}

function retrievalPriorityScore(result: KnowledgeEmbeddingResult): number {
  const versionBoost = hasVersionScopedUri(result.url) ? 0.05 : 0;
  return (result.similarity || 0) + authorityWeight(result.authorityLevel) + versionBoost;
}

function buildExplainersFromFacts(facts: Array<{
  subject: string;
  predicate: string;
  objectValue: string;
  evidenceKey: string;
  factType: string;
}>): {
  whatIsIt: string | null;
  whenToUse: string | null;
  howToValidate: string;
  whatChanged: string | null;
  relatedStandards: string[];
} {
  const primary = facts[0];
  const lifecycle = facts.find((fact) => fact.factType === "lifecycle_status");
  const relatedStandards = Array.from(
    new Set(
      facts
        .filter((fact) => fact.factType === "standard_reference")
        .map((fact) => fact.objectValue)
    )
  ).slice(0, 6);

  return {
    whatIsIt: primary ? `${primary.subject} ${primary.predicate} ${primary.objectValue}` : null,
    whenToUse: relatedStandards.length > 0
      ? `Use this guidance when your question touches ${relatedStandards.join(", ")}.`
      : null,
    howToValidate: primary
      ? `Validate against citation evidence key ${primary.evidenceKey} and the linked source URL.`
      : "Validate against the cited source URLs and evidence keys.",
    whatChanged: lifecycle ? `${lifecycle.subject} lifecycle status: ${lifecycle.objectValue}.` : null,
    relatedStandards,
  };
}

/**
 * Search knowledge embeddings with cosine similarity
 */
async function searchKnowledgeEmbeddings(
  queryEmbedding: number[],
  options: {
    limit?: number;
    sourceTypes?: string[];
    semanticLayers?: string[];
    authorityLevels?: string[];
  } = {}
): Promise<KnowledgeEmbeddingResult[]> {
  const db = await getDb();
  if (!db) return [];

  const { limit = 10, sourceTypes, semanticLayers, authorityLevels } = options;

  try {
    // Build the query with filters
    let whereConditions: string[] = [];
    
    if (sourceTypes && sourceTypes.length > 0) {
      whereConditions.push(`source_type IN (${sourceTypes.map(t => `'${t}'`).join(',')})`);
    }
    if (semanticLayers && semanticLayers.length > 0) {
      whereConditions.push(`semantic_layer IN (${semanticLayers.map(l => `'${l}'`).join(',')})`);
    }
    if (authorityLevels && authorityLevels.length > 0) {
      whereConditions.push(`authority_level IN (${authorityLevels.map(a => `'${a}'`).join(',')})`);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Use TiDB's vector search capability
    const embeddingStr = `[${queryEmbedding.join(',')}]`;
    
    const results = await db.execute(sql.raw(`
      SELECT 
        id,
        source_type as sourceType,
        source_id as sourceId,
        title,
        content,
        url,
        authority_level as authorityLevel,
        semantic_layer as semanticLayer,
        source_authority as sourceAuthority,
        1 - VEC_COSINE_DISTANCE(embedding, '${embeddingStr}') as similarity
      FROM knowledge_embeddings
      ${whereClause}
      ORDER BY similarity DESC
      LIMIT ${limit}
    `));

    return (results as any)[0] || [];
  } catch (error) {
    serverLogger.error('[AskISA-v2] Knowledge embedding search failed:', error);
    return [];
  }
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
    // Get regulation-ESRS mappings
    const regMappings = regulationIds.length > 0 
      ? await db.execute(sql.raw(`
          SELECT 
            rem.regulation_id as regulationId,
            r.name as regulationName,
            rem.esrs_datapoint_id as esrsDatapointId,
            rem.relevance_score as relevanceScore
          FROM regulation_esrs_mappings rem
          JOIN regulations r ON rem.regulation_id = r.id
          WHERE rem.regulation_id IN (${regulationIds.join(',')})
          ORDER BY rem.relevance_score DESC
          LIMIT 20
        `))
      : { 0: [] };

    // Get GS1-ESRS mappings
    const gs1Mappings = esrsStandards.length > 0
      ? await db.execute(sql.raw(`
          SELECT 
            gem.gs1_standard_id as standardId,
            gs.name as standardName,
            gem.esrs_standard as esrsStandard,
            gem.coverage_type as coverageType
          FROM gs1_esrs_mappings gem
          JOIN gs1_standards gs ON gem.gs1_standard_id = gs.id
          WHERE gem.esrs_standard IN (${esrsStandards.map(s => `'${s}'`).join(',')})
          LIMIT 20
        `))
      : { 0: [] };

    return {
      regulationMappings: (regMappings as any)[0] || [],
      gs1Mappings: (gs1Mappings as any)[0] || [],
    };
  } catch (error) {
    serverLogger.error('[AskISA-v2] Mapping context retrieval failed:', error);
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
    const regResult = await db.execute(sql.raw(`
      SELECT id, name, description FROM regulations WHERE id = ${regulationId}
    `));
    const regulation = (regResult as any)[0]?.[0];
    if (!regulation) return null;

    // Get all ESRS datapoints mapped to this regulation
    const mappingsResult = await db.execute(sql.raw(`
      SELECT 
        rem.esrs_datapoint_id,
        ed.name as datapoint_name,
        ed.esrs_standard,
        rem.relevance_score
      FROM regulation_esrs_mappings rem
      JOIN esrs_datapoints ed ON rem.esrs_datapoint_id = ed.datapoint_id
      WHERE rem.regulation_id = ${regulationId}
      ORDER BY rem.relevance_score DESC
    `));
    const mappings = (mappingsResult as any)[0] || [];

    // Get GS1 coverage for these ESRS standards
    const esrsStandards = [...new Set(mappings.map((m: any) => m.esrs_standard))];
    const coverageResult = esrsStandards.length > 0
      ? await db.execute(sql.raw(`
          SELECT esrs_standard, coverage_type, gs1_standard_id
          FROM gs1_esrs_mappings
          WHERE esrs_standard IN (${esrsStandards.map((s: string) => `'${s}'`).join(',')})
        `))
      : { 0: [] };
    const coverage = (coverageResult as any)[0] || [];

    // Calculate coverage
    const coveredStandards = new Set(coverage.map((c: any) => c.esrs_standard));
    const coveredDatapoints = mappings.filter((m: any) => coveredStandards.has(m.esrs_standard));

    // Identify gaps
    const gaps = mappings
      .filter((m: any) => !coveredStandards.has(m.esrs_standard))
      .slice(0, 10)
      .map((m: any) => ({
        datapointId: m.esrs_datapoint_id,
        datapointName: m.datapoint_name,
        priority: m.relevance_score > 0.8 ? 'high' : m.relevance_score > 0.5 ? 'medium' : 'low',
        recommendation: `Consider implementing GS1 standards to cover ${m.esrs_standard} requirements`,
      }));

    // Generate recommendations
    const recommendations = [
      `Focus on implementing GS1 standards for ${esrsStandards.filter((s: string) => !coveredStandards.has(s)).slice(0, 3).join(', ')} to improve coverage`,
      `Current GS1 coverage addresses ${Math.round((coveredDatapoints.length / mappings.length) * 100)}% of ${regulation.name} requirements`,
    ];

    return {
      regulation: regulation.name,
      totalDatapoints: mappings.length,
      coveredDatapoints: coveredDatapoints.length,
      coveragePercentage: mappings.length > 0 
        ? Math.round((coveredDatapoints.length / mappings.length) * 100)
        : 0,
      gaps,
      recommendations,
    };
  } catch (error) {
    serverLogger.error('[AskISA-v2] Gap analysis failed:', error);
    return null;
  }
}

/**
 * Generate query embedding using OpenAI
 */
async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
      }),
    });

    const data = await response.json();
    return data.data?.[0]?.embedding || [];
  } catch (error) {
    serverLogger.error('[AskISA-v2] Embedding generation failed:', error);
    return [];
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
        filters: z.object({
          sourceTypes: z.array(z.string()).optional(),
          semanticLayers: z.array(z.enum(['juridisch', 'normatief', 'operationeel'])).optional(),
          authorityLevels: z.array(z.enum(['binding', 'authoritative', 'guidance', 'informational'])).optional(),
        }).optional(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      const { query, filters, limit } = input;

      try {
        // Generate embedding for query
        const queryEmbedding = await generateQueryEmbedding(query);
        if (queryEmbedding.length === 0) {
          return { results: [], error: 'Failed to generate query embedding' };
        }

        // Search knowledge embeddings
        const results = await searchKnowledgeEmbeddings(queryEmbedding, {
          limit,
          sourceTypes: filters?.sourceTypes,
          semanticLayers: filters?.semanticLayers,
          authorityLevels: filters?.authorityLevels,
        });

        return {
          results: results.map(r => ({
            id: r.id,
            sourceType: r.sourceType,
            title: r.title,
            content: r.content?.substring(0, 500) + (r.content?.length > 500 ? '...' : ''),
            url: r.url,
            authorityLevel: r.authorityLevel,
            semanticLayer: r.semanticLayer,
            sourceAuthority: r.sourceAuthority,
            similarity: Math.round(r.similarity * 100),
          })),
          totalResults: results.length,
        };
      } catch (error) {
        serverLogger.error('[AskISA-v2] Enhanced search failed:', error);
        return { results: [], error: 'Search failed' };
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
        return { error: 'Regulation not found or analysis failed' };
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
      const result = await db.execute(sql.raw(`
        SELECT DISTINCT r.id, r.name, r.short_name, COUNT(rem.id) as datapoint_count
        FROM regulations r
        LEFT JOIN regulation_esrs_mappings rem ON r.id = rem.regulation_id
        GROUP BY r.id, r.name, r.short_name
        HAVING datapoint_count > 0
        ORDER BY datapoint_count DESC
      `));

      return (result as any)[0] || [];
    } catch (error) {
      serverLogger.error('[AskISA-v2] Failed to get regulations:', error);
      return [];
    }
  }),

  /**
   * Get knowledge base statistics
   */
  getKnowledgeStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return null;

    try {
      const stats = await db.execute(sql.raw(`
        SELECT 
          source_type,
          COUNT(*) as count,
          COUNT(DISTINCT source_authority) as unique_authorities
        FROM knowledge_embeddings
        GROUP BY source_type
      `));

      const totalResult = await db.execute(sql.raw(`
        SELECT COUNT(*) as total FROM knowledge_embeddings
      `));

      return {
        bySourceType: (stats as any)[0] || [],
        total: (totalResult as any)[0]?.[0]?.total || 0,
      };
    } catch (error) {
      serverLogger.error('[AskISA-v2] Failed to get knowledge stats:', error);
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
        // E-04: Classify query intent before retrieval.
        const intent = classifyQueryIntent(question);

        // Step 1: Generate query embedding
        const queryEmbedding = await generateQueryEmbedding(question);
        if (queryEmbedding.length === 0) {
          return { error: 'Failed to process question' };
        }

        // Step 2: Search knowledge embeddings + E-06 news augmentation.
        const [searchResultsRaw, newsResults] = await Promise.all([
          searchKnowledgeEmbeddings(queryEmbedding, { limit: 8 }),
          // E-06: For change/news intents, fetch recent high-credibility news articles.
          intent === 'REGULATORY_CHANGE' || intent === 'NEWS_QUERY'
            ? searchRecentNewsArticles(question, 4)
            : Promise.resolve([] as KnowledgeEmbeddingResult[]),
        ]);

        // Prepend news results so they appear first in context when relevant.
        const combinedResults = [...newsResults, ...searchResultsRaw];
        const searchResults = [...combinedResults].sort(
          (a, b) => retrievalPriorityScore(b) - retrievalPriorityScore(a)
        );
        const validatedSources = await validateCitations(
          searchResults.map(r => ({
            id: r.id,
            title: r.title,
            url: r.url || undefined,
            similarity: r.similarity,
          }))
        );
        const canonicalFacts = await findCanonicalFactsForQuery(question, 8);
        const canonicalFactsForOutput = canonicalFacts.map((fact) => ({
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
        const hasEvidenceCitation = validatedSources.some(v => typeof v.evidenceKey === "string" && v.evidenceKey.length > 0);
        if (!hasEvidenceCitation) {
          return {
            answer: "I cannot provide a compliance-grade answer because no verifiable evidence citations are available.",
            sources: [],
            abstained: true,
            abstentionReason: AbstentionReasonCode.SPECULATION_REQUIRED,
            factsUsed: canonicalFactsForOutput.length > 0,
            facts: canonicalFactsForOutput,
            explainers: buildExplainersFromFacts(canonicalFactsForOutput),
            uncertainty: canonicalFactsForOutput.length > 0
              ? null
              : "Canonical facts are not available for this query; no answer was generated.",
            gapAnalysis: null,
          };
        }

        // Step 3: Get gap analysis if requested
        let gapAnalysis: GapAnalysisResult | null = null;
        if (includeGapAnalysis && regulationId) {
          gapAnalysis = await performGapAnalysis(regulationId);
        }

        // Step 4: Build context for LLM
        // E-06: Format news results with their publication date for temporal grounding.
        const contextParts = searchResults.map((r, i) => {
          const isNews = r.sourceType === 'news';
          const dateTag = isNews && (r as any).publishedDate
            ? ` - ${String((r as any).publishedDate).slice(0, 10)}`
            : '';
          const label = isNews ? `[Recent News${dateTag}]` : `[Source ${i + 1}]`;
          return `${label} ${r.title}\n${r.content}\nAuthority: ${r.authorityLevel || 'unknown'}`;
        });

        let systemPrompt = `You are ISA, the Intelligent Standards Assistant. Answer questions about EU sustainability regulations and GS1 standards based on the provided context.

Context:
${contextParts.join('\n\n')}`;
        if (canonicalFactsForOutput.length > 0) {
          const factsContext = canonicalFactsForOutput
            .slice(0, 6)
            .map((fact, index) =>
              `[Fact ${index + 1}] ${fact.subject} ${fact.predicate} ${fact.objectValue} (evidenceKey: ${fact.evidenceKey})`
            )
            .join('\\n');
          systemPrompt += `\\n\\nCanonical facts (with provenance):\\n${factsContext}`;
        }

        if (gapAnalysis) {
          systemPrompt += `\n\nGap Analysis for ${gapAnalysis.regulation}:
- Coverage: ${gapAnalysis.coveragePercentage}%
- Total datapoints: ${gapAnalysis.totalDatapoints}
- Covered: ${gapAnalysis.coveredDatapoints}
- Key gaps: ${gapAnalysis.gaps.slice(0, 3).map(g => g.datapointName).join(', ')}`;
        }

        // Step 5: Generate answer
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question },
          ],
        });

        const answer = response.choices[0]?.message?.content || 'Unable to generate answer';

        // E-05: Build inline ESRS-GS1 recommendations from ESRS codes cited in the answer.
        const inlineRecommendations = await buildInlineRecommendations(answer);

        const claimVerification = verifyResponseClaims(
          answer,
          searchResults.map((r) => ({
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
            similarity: Math.round(r.similarity * 100),
            url: r.url,
            lastVerifiedDate: validated?.lastVerifiedDate,
            verificationAgeDays: validated?.verificationAgeDays,
            needsVerification: validated?.needsVerification ?? false,
            verificationReason: validated?.verificationReason,
            isDeprecated: validated?.isDeprecated ?? false,
            deprecationReason: validated?.deprecationReason,
            evidenceKey: validated?.evidenceKey ?? null,
            evidenceKeyReason: validated?.evidenceKeyReason ?? "chunk_not_found",
          };
        });

        const stageAValidation = validateAskISAStageAAnswer({
          answer,
          sourceCount: searchResults.length,
          evidenceReadySourceCount: validatedSources.filter(
            (source) => typeof source.evidenceKey === "string" && source.evidenceKey.length > 0
          ).length,
          verifiedEvidenceSourceCount: validatedSources.filter(
            (source) =>
              typeof source.evidenceKey === "string" &&
              source.evidenceKey.length > 0 &&
              !source.needsVerification &&
              !source.isDeprecated
          ).length,
          needsVerificationSourceCount: validatedSources.filter(
            (source) => source.needsVerification
          ).length,
          deprecatedSourceCount: validatedSources.filter(
            (source) => source.isDeprecated
          ).length,
          claimVerification,
        });

        if (!stageAValidation.passed) {
          return {
            answer: ASK_ISA_STAGE_A_ABSTENTION_MESSAGE,
            sources: responseSources,
            abstained: true,
            abstentionReason: AbstentionReasonCode.SPECULATION_REQUIRED,
            citationValid: false,
            missingCitations: stageAValidation.issues,
            claimVerification: {
              verificationRate: claimVerification.verificationRate,
              totalClaims: claimVerification.totalClaims,
              verifiedClaims: claimVerification.verifiedClaims,
              unverifiedClaims: claimVerification.unverifiedClaims,
              warnings: Array.from(
                new Set([...claimVerification.warnings, ...stageAValidation.warnings])
              ),
            },
            factsUsed: canonicalFactsForOutput.length > 0,
            facts: canonicalFactsForOutput,
            explainers: buildExplainersFromFacts(canonicalFactsForOutput),
            uncertainty: canonicalFactsForOutput.length > 0
              ? null
              : "Canonical facts are not available for this query; no answer was generated.",
            gapAnalysis: gapAnalysis ? {
              regulation: gapAnalysis.regulation,
              coveragePercentage: gapAnalysis.coveragePercentage,
              gapCount: gapAnalysis.gaps.length,
              recommendations: gapAnalysis.recommendations,
            } : null,
            intent, // E-04
            inlineRecommendations, // E-05
          };
        }

        return {
          answer,
          sources: responseSources,
          citationValid: stageAValidation.citationValid,
          missingCitations: stageAValidation.missingCitations,
          claimVerification: {
            verificationRate: claimVerification.verificationRate,
            totalClaims: claimVerification.totalClaims,
            verifiedClaims: claimVerification.verifiedClaims,
            unverifiedClaims: claimVerification.unverifiedClaims,
            warnings: Array.from(
              new Set([...claimVerification.warnings, ...stageAValidation.warnings])
            ),
          },
          factsUsed: canonicalFactsForOutput.length > 0,
          facts: canonicalFactsForOutput,
          explainers: buildExplainersFromFacts(canonicalFactsForOutput),
          uncertainty: canonicalFactsForOutput.length > 0
            ? null
            : "No canonical facts were found for this query; response is based on document retrieval only.",
          gapAnalysis: gapAnalysis ? {
            regulation: gapAnalysis.regulation,
            coveragePercentage: gapAnalysis.coveragePercentage,
            gapCount: gapAnalysis.gaps.length,
            recommendations: gapAnalysis.recommendations,
          } : null,
          intent, // E-04
          inlineRecommendations, // E-05
        };
      } catch (error) {
        serverLogger.error('[AskISA-v2] Enhanced ask failed:', error);
        return { error: 'Failed to process question' };
      }
    }),
});
