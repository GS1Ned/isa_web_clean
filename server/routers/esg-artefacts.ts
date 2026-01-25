/**
 * EU ESG to GS1 Mapping Artefact Router
 * 
 * IMMUTABILITY: These procedures expose frozen artefact data.
 * No interpretation, transformation, or extension is performed.
 * No write procedures. No generic list-all endpoints.
 * 
 * Source: EU_ESG_to_GS1_Mapping_v1.1 (frozen, audit-defensible baseline)
 * 
 * EXPOSED PROCEDURES (read-only):
 * - getTraceabilityChain: Full audit chain from instrument to GS1 mapping
 * - getGs1RelevanceSummary: Aggregated GS1 relevance per instrument
 * - getPriorityRecommendations: Top-scored data requirements
 * - getArtefactVersion: Schema/version check for immutability verification
 */

import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  getEsgTraceabilityChain,
  getEsgGs1RelevanceSummary,
  getEsgGs1Mappings,
  getEsgArtefactStats,
} from "../db-esg-artefacts";

// Artefact version for immutability verification
const ARTEFACT_VERSION = {
  id: "EU_ESG_to_GS1_Mapping_v1.1",
  status: "FROZEN",
  validatedAt: "2026-01-25",
  checksum: "validated-all-gates-passed",
  gs1Constraint: "GS1 is never legally required",
};

export const esgArtefactsRouter = router({
  /**
   * Immutability guard: Returns artefact version and status
   * Use this to verify the artefact set has not been modified
   */
  getArtefactVersion: publicProcedure.query(async () => {
    const stats = await getEsgArtefactStats();
    return {
      ...ARTEFACT_VERSION,
      stats,
      immutable: true,
      disclaimer: "This artefact set is frozen. GS1 is never legally required.",
    };
  }),

  /**
   * Get full traceability chain from instrument to GS1 mapping
   * This is the core function for audit-defensible claims
   * 
   * Returns: instrument → obligations → atomic requirements → data requirements → GS1 mappings
   */
  getTraceabilityChain: publicProcedure
    .input(z.object({ instrumentId: z.string() }))
    .query(async ({ input }) => {
      const chain = await getEsgTraceabilityChain(input.instrumentId);
      return {
        ...chain,
        disclaimer: "GS1 is never legally required. This data is for guidance only.",
      };
    }),

  /**
   * Get GS1 relevance summary for an instrument
   * Returns aggregated mapping strengths (strong | partial | none)
   */
  getGs1RelevanceSummary: publicProcedure
    .input(z.object({ instrumentId: z.string() }))
    .query(async ({ input }) => {
      const summary = await getEsgGs1RelevanceSummary(input.instrumentId);
      return {
        ...summary,
        disclaimer: "GS1 is never legally required. This data is for guidance only.",
      };
    }),

  /**
   * Get top priority data requirements based on scoring
   * Useful for compliance roadmap prioritisation
   */
  getPriorityRecommendations: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(20).default(10),
      minScore: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const mappings = await getEsgGs1Mappings({
        minScore: input?.minScore,
      });
      
      // Return top N by score
      const recommendations = mappings.slice(0, input?.limit || 10);
      
      return {
        recommendations,
        disclaimer: "GS1 is never legally required. Prioritisation is for guidance only.",
      };
    }),
});
