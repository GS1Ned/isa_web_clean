/**
 * EU ESG to GS1 Mapping Artefact Router
 * 
 * IMMUTABILITY: These procedures expose frozen artefact data.
 * No interpretation, transformation, or extension is performed.
 * 
 * Source: EU_ESG_to_GS1_Mapping_v1.1 (frozen, audit-defensible baseline)
 */

import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  getEsgCorpus,
  getEsgInstrument,
  getEsgObligations,
  getEsgObligation,
  getEsgAtomicRequirements,
  getEsgAtomicRequirement,
  getEsgDataRequirements,
  getEsgDataRequirement,
  getEsgGs1Mappings,
  getEsgGs1Mapping,
  getEsgTraceabilityChain,
  getEsgGs1RelevanceSummary,
  getEsgArtefactStats,
} from "../db-esg-artefacts";

export const esgArtefactsRouter = router({
  /**
   * Get artefact statistics for dashboard
   */
  getStats: publicProcedure.query(async () => {
    return await getEsgArtefactStats();
  }),

  // ============================================================================
  // Corpus (Regulatory Instruments)
  // ============================================================================

  /**
   * Get all regulatory instruments from the corpus
   */
  getCorpus: publicProcedure.query(async () => {
    return await getEsgCorpus();
  }),

  /**
   * Get a specific instrument by ID
   */
  getInstrument: publicProcedure
    .input(z.object({ instrumentId: z.string() }))
    .query(async ({ input }) => {
      return await getEsgInstrument(input.instrumentId);
    }),

  // ============================================================================
  // Obligations
  // ============================================================================

  /**
   * Get obligations, optionally filtered by instrument
   */
  getObligations: publicProcedure
    .input(z.object({ instrumentId: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return await getEsgObligations(input?.instrumentId);
    }),

  /**
   * Get a specific obligation by ID
   */
  getObligation: publicProcedure
    .input(z.object({ obligationId: z.string() }))
    .query(async ({ input }) => {
      return await getEsgObligation(input.obligationId);
    }),

  // ============================================================================
  // Atomic Requirements
  // ============================================================================

  /**
   * Get atomic requirements, optionally filtered by obligation
   */
  getAtomicRequirements: publicProcedure
    .input(z.object({ obligationId: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return await getEsgAtomicRequirements(input?.obligationId);
    }),

  /**
   * Get a specific atomic requirement by ID
   */
  getAtomicRequirement: publicProcedure
    .input(z.object({ atomicId: z.string() }))
    .query(async ({ input }) => {
      return await getEsgAtomicRequirement(input.atomicId);
    }),

  // ============================================================================
  // Data Requirements
  // ============================================================================

  /**
   * Get data requirements, optionally filtered
   */
  getDataRequirements: publicProcedure
    .input(z.object({
      atomicId: z.string().optional(),
      obligationId: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      return await getEsgDataRequirements(input);
    }),

  /**
   * Get a specific data requirement by ID
   */
  getDataRequirement: publicProcedure
    .input(z.object({ dataId: z.string() }))
    .query(async ({ input }) => {
      return await getEsgDataRequirement(input.dataId);
    }),

  // ============================================================================
  // GS1 Mappings
  // ============================================================================

  /**
   * Get GS1 mappings, optionally filtered
   */
  getGs1Mappings: publicProcedure
    .input(z.object({
      mappingStrength: z.enum(['none', 'partial', 'strong']).optional(),
      minScore: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      return await getEsgGs1Mappings(input);
    }),

  /**
   * Get GS1 mapping for a specific data requirement
   */
  getGs1Mapping: publicProcedure
    .input(z.object({ dataId: z.string() }))
    .query(async ({ input }) => {
      return await getEsgGs1Mapping(input.dataId);
    }),

  // ============================================================================
  // Full Traceability Chain
  // ============================================================================

  /**
   * Get full traceability chain from instrument to GS1 mapping
   * This is the core function for audit-defensible claims
   */
  getTraceabilityChain: publicProcedure
    .input(z.object({ instrumentId: z.string() }))
    .query(async ({ input }) => {
      return await getEsgTraceabilityChain(input.instrumentId);
    }),

  /**
   * Get GS1 relevance summary for an instrument
   * Returns aggregated mapping strengths and top recommendations
   */
  getGs1RelevanceSummary: publicProcedure
    .input(z.object({ instrumentId: z.string() }))
    .query(async ({ input }) => {
      return await getEsgGs1RelevanceSummary(input.instrumentId);
    }),

  // ============================================================================
  // Priority Recommendations
  // ============================================================================

  /**
   * Get top priority data requirements based on scoring
   * Useful for compliance roadmap prioritisation
   */
  getPriorityRecommendations: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
      minScore: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const mappings = await getEsgGs1Mappings({
        minScore: input?.minScore,
      });
      
      // Return top N by score
      return mappings.slice(0, input?.limit || 10);
    }),
});
