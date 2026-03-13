// @ts-nocheck
/**
 * Enhanced Ask ISA Router Procedures
 * 
 * Additional tRPC procedures that integrate the new Sprint 2 backend modules:
 * - Enhanced vector search with knowledge_embeddings
 * - Mapping-based context enrichment
 * - Reasoning engine for gap analysis
 */

import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { serverLogger } from "../_core/logger-wiring";

// Import the new Sprint 2 modules
import {
  searchKnowledgeEmbeddings,
  searchWithFilters,
  type KnowledgeSearchFilters,
  type KnowledgeSearchResult,
} from "../knowledge-vector-search";

import {
  handleEnhancedQuery,
  type EnhancedQueryResult,
} from "../ask-isa-enhanced";

import {
  analyzeComplianceGaps,
  generateRecommendations,
  buildEvidenceChain,
  type GapAnalysisResult,
  type Recommendation,
  type EvidenceChain,
} from "../reasoning-engine";

// Schema definitions
const sourceTypeEnum = z.enum([
  'regulation',
  'gs1_standard',
  'esrs_datapoint',
  'cbv_vocabulary',
  'dpp_component',
  'hub_news',
  'dutch_initiative',
]);

const semanticLayerEnum = z.enum(['juridisch', 'normatief', 'operationeel']);
const authorityLevelEnum = z.enum(['official', 'verified', 'guidance', 'industry', 'community']);

export const askISAEnhancedRouter = router({
  /**
   * Enhanced search using the knowledge_embeddings table
   * Supports filtering by sourceType, semantic_layer, and authority_level
   */
  enhancedSearch: publicProcedure
    .input(
      z.object({
        query: z.string().min(3).max(1000),
        filters: z.object({
          sourceTypes: z.array(sourceTypeEnum).optional(),
          semanticLayers: z.array(semanticLayerEnum).optional(),
          authorityLevels: z.array(authorityLevelEnum).optional(),
          minSimilarity: z.number().min(0).max(1).optional(),
        }).optional(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      const { query, filters, limit } = input;

      try {
        serverLogger.info(`[AskISA Enhanced] Searching: "${query.slice(0, 50)}..." with filters:`, filters);

        const results = await searchWithFilters(query, {
          sourceTypes: filters?.sourceTypes,
          semanticLayers: filters?.semanticLayers,
          authorityLevels: filters?.authorityLevels,
          minSimilarity: filters?.minSimilarity || 0.3,
          limit,
        });

        return {
          results: results.map(r => ({
            id: r.id,
            sourceId: r.sourceId,
            sourceType: r.sourceType,
            title: r.title,
            content: r.content.slice(0, 500), // Truncate for response
            similarity: r.similarity,
            authorityLevel: r.authorityLevel,
            semanticLayer: r.semanticLayer,
            sourceAuthority: r.sourceAuthority,
          })),
          totalResults: results.length,
          query,
          appliedFilters: filters,
        };
      } catch (error) {
        serverLogger.error("[AskISA Enhanced] Search failed:", error);
        throw new Error("Enhanced search failed. Please try again.");
      }
    }),

  /**
   * Ask with enhanced context from mappings
   * Uses regulation-ESRS and GS1-ESRS mappings to enrich context
   */
  askWithContext: publicProcedure
    .input(
      z.object({
        question: z.string().min(3).max(1000),
        options: z.object({
          includeRelatedMappings: z.boolean().default(true),
          includeFollowUpQuestions: z.boolean().default(true),
          maxContextItems: z.number().min(1).max(20).default(10),
        }).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { question, options } = input;

      try {
        serverLogger.info(`[AskISA Enhanced] Processing question with context: "${question.slice(0, 50)}..."`);

        const result = await handleEnhancedQuery(question, {
          includeRelatedMappings: options?.includeRelatedMappings ?? true,
          includeFollowUpQuestions: options?.includeFollowUpQuestions ?? true,
          maxContextItems: options?.maxContextItems ?? 10,
        });

        return {
          answer: result.answer,
          sources: result.sources,
          relatedMappings: result.relatedMappings,
          followUpQuestions: result.followUpQuestions,
          queryIntent: result.queryIntent,
          confidence: result.confidence,
        };
      } catch (error) {
        serverLogger.error("[AskISA Enhanced] Context query failed:", error);
        throw new Error("Failed to process question with context. Please try again.");
      }
    }),

  /**
   * Perform compliance gap analysis for a specific regulation
   */
  analyzeGaps: publicProcedure
    .input(
      z.object({
        regulationId: z.number(),
        sector: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { regulationId, sector } = input;

      try {
        serverLogger.info(`[AskISA Enhanced] Analyzing gaps for regulation ${regulationId}, sector: ${sector || 'all'}`);

        const analysis = await analyzeComplianceGaps(regulationId, sector);

        return {
          regulationId,
          regulationName: analysis.regulationName,
          sector: sector || 'all',
          summary: {
            totalDatapoints: analysis.totalDatapoints,
            fullyCovered: analysis.fullyCovered,
            partiallyCovered: analysis.partiallyCovered,
            notCovered: analysis.notCovered,
            coveragePercentage: analysis.coveragePercentage,
          },
          gaps: analysis.gaps.map(gap => ({
            datapointId: gap.datapointId,
            datapointName: gap.datapointName,
            esrsStandard: gap.esrsStandard,
            coverageStatus: gap.coverageStatus,
            relatedStandards: gap.relatedStandards,
            priority: gap.priority,
          })),
          byEsrsStandard: analysis.byEsrsStandard,
        };
      } catch (error) {
        serverLogger.error("[AskISA Enhanced] Gap analysis failed:", error);
        throw new Error("Gap analysis failed. Please try again.");
      }
    }),

  /**
   * Get recommendations for closing compliance gaps
   */
  getRecommendations: publicProcedure
    .input(
      z.object({
        regulationId: z.number(),
        gapIds: z.array(z.number()).optional(),
        priorityFilter: z.enum(['high', 'medium', 'low']).optional(),
      })
    )
    .query(async ({ input }) => {
      const { regulationId, gapIds, priorityFilter } = input;

      try {
        serverLogger.info(`[AskISA Enhanced] Generating recommendations for regulation ${regulationId}`);

        const recommendations = await generateRecommendations(regulationId, {
          gapIds,
          priorityFilter,
        });

        return {
          regulationId,
          recommendations: recommendations.map(rec => ({
            id: rec.id,
            title: rec.title,
            description: rec.description,
            priority: rec.priority,
            timeframe: rec.timeframe,
            relatedGaps: rec.relatedGaps,
            suggestedStandards: rec.suggestedStandards,
            implementationSteps: rec.implementationSteps,
          })),
          totalRecommendations: recommendations.length,
        };
      } catch (error) {
        serverLogger.error("[AskISA Enhanced] Recommendations generation failed:", error);
        throw new Error("Failed to generate recommendations. Please try again.");
      }
    }),

  /**
   * Build evidence chain for a specific claim or recommendation
   */
  getEvidenceChain: publicProcedure
    .input(
      z.object({
        claim: z.string(),
        sourceIds: z.array(z.number()).optional(),
      })
    )
    .query(async ({ input }) => {
      const { claim, sourceIds } = input;

      try {
        serverLogger.info(`[AskISA Enhanced] Building evidence chain for claim: "${claim.slice(0, 50)}..."`);

        const evidenceChain = await buildEvidenceChain(claim, sourceIds);

        return {
          claim,
          evidenceChain: evidenceChain.steps.map(step => ({
            stepNumber: step.stepNumber,
            source: step.source,
            excerpt: step.excerpt,
            relevance: step.relevance,
            authorityLevel: step.authorityLevel,
          })),
          overallConfidence: evidenceChain.overallConfidence,
          gaps: evidenceChain.gaps,
        };
      } catch (error) {
        serverLogger.error("[AskISA Enhanced] Evidence chain building failed:", error);
        throw new Error("Failed to build evidence chain. Please try again.");
      }
    }),

  /**
   * Get available filter options based on current data
   */
  getFilterOptions: publicProcedure.query(async () => {
    try {
      // Return the available filter options
      return {
        sourceTypes: [
          { value: 'regulation', label: 'EU Regulations', count: 20 },
          { value: 'gs1_standard', label: 'GS1 Standards', count: 39 },
          { value: 'esrs_datapoint', label: 'ESRS Datapoints', count: 914 },
          { value: 'cbv_vocabulary', label: 'CBV Vocabularies', count: 36 },
          { value: 'dpp_component', label: 'DPP Components', count: 48 },
          { value: 'hub_news', label: 'News Articles', count: 15 },
          { value: 'dutch_initiative', label: 'Dutch Initiatives', count: 8 },
        ],
        semanticLayers: [
          { value: 'juridisch', label: 'Juridisch (Legal)', description: 'Legally binding requirements' },
          { value: 'normatief', label: 'Normatief (Normative)', description: 'Industry standards and norms' },
          { value: 'operationeel', label: 'Operationeel (Operational)', description: 'Implementation guidance' },
        ],
        authorityLevels: [
          { value: 'official', label: 'Official', description: 'Government/regulatory sources' },
          { value: 'verified', label: 'Verified', description: 'Verified by authoritative bodies' },
          { value: 'guidance', label: 'Guidance', description: 'Official guidance documents' },
          { value: 'industry', label: 'Industry', description: 'Industry publications' },
          { value: 'community', label: 'Community', description: 'Community contributions' },
        ],
      };
    } catch (error) {
      serverLogger.error("[AskISA Enhanced] Failed to get filter options:", error);
      throw new Error("Failed to get filter options.");
    }
  }),
});

export type AskISAEnhancedRouter = typeof askISAEnhancedRouter;
