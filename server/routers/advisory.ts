/**
 * ISA Advisory API Router
 * 
 * Minimal tRPC router for serving ISA advisory outputs.
 * Supports filtering by sector, regulation, gap severity, and confidence.
 */

import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { buildAdvisoryReadModel } from "../advisory-read-model";
import { computeAdvisoryDiffPayload } from "../advisory-diff-runtime";
import { buildAdvisoryOverview } from "../advisory-overview";
import {
  buildAdvisoryCompatibilityPayloads,
  filterAdvisoryCompatibilityPayloads,
} from "../advisory-compat";

export const advisoryRouter = router({
  /**
   * Get advisory diff between two versions
   */
  getDiff: publicProcedure
    .input(
      z.object({
        version1: z.string().optional().default("v1.0"),
        version2: z.string().optional().default("v1.0"),
      })
    )
    .query(async ({ input }) =>
      computeAdvisoryDiffPayload(
        input.version1,
        input.version2,
      ),
    ),

  /**
   * Get advisory summary (fast stats for UI)
   */
  getSummary: publicProcedure.query(async () => {
    const overview = await buildAdvisoryOverview();
    return overview.summary;
  }),

  /**
   * Get a normalized advisory overview bundle for active UI surfaces.
   */
  getOverview: publicProcedure.query(async () => buildAdvisoryOverview()),

  /**
   * Get full advisory JSON
   */
  getFull: publicProcedure.query(async () => {
    const readModel = await buildAdvisoryReadModel();
    return readModel.advisory;
  }),

  /**
   * Get mapping results with optional filters
   */
  getMappings: publicProcedure
    .input(
      z.object({
        sector: z.enum(["DIY", "FMCG", "Healthcare", "All"]).optional(),
        regulation: z.string().optional(), // e.g., "ESRS E1", "EUDR", "DPP"
        confidence: z.enum(["direct", "partial", "missing"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const readModel = await buildAdvisoryReadModel();
      const payloads = buildAdvisoryCompatibilityPayloads(readModel.advisory);
      const filtered = filterAdvisoryCompatibilityPayloads(payloads, input);

      return {
        total: filtered.mappings.length,
        mappings: filtered.mappings,
      };
    }),

  /**
   * Get gaps with optional filters
   */
  getGaps: publicProcedure
    .input(
      z.object({
        severity: z.enum(["critical", "moderate", "low-priority"]).optional(),
        sector: z.enum(["DIY", "FMCG", "Healthcare", "All"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const readModel = await buildAdvisoryReadModel();
      const payloads = buildAdvisoryCompatibilityPayloads(readModel.advisory);
      const filtered = filterAdvisoryCompatibilityPayloads(payloads, input);

      return {
        total: filtered.gaps.length,
        gaps: filtered.gaps,
      };
    }),

  /**
   * Get recommendations with optional filters
   */
  getRecommendations: publicProcedure
    .input(
      z.object({
        timeframe: z.enum(["short-term", "medium-term", "long-term"]).optional(),
        category: z.enum(["documentation", "data_model", "strategic"]).optional(),
        implementationStatus: z.enum(["proposed", "in_progress", "completed", "deferred"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const readModel = await buildAdvisoryReadModel();
      const payloads = buildAdvisoryCompatibilityPayloads(readModel.advisory);
      const filtered = filterAdvisoryCompatibilityPayloads(payloads, input);

      return {
        total: filtered.recommendations.length,
        recommendations: filtered.recommendations,
      };
    }),

  /**
   * Get regulations covered
   */
  getRegulations: publicProcedure.query(async () => {
    const readModel = await buildAdvisoryReadModel();
    const payloads = buildAdvisoryCompatibilityPayloads(readModel.advisory);
    return {
      total: payloads.regulations.length,
      regulations: payloads.regulations,
    };
  }),

  /**
   * Get sector models covered
   */
  getSectorModels: publicProcedure.query(async () => {
    const readModel = await buildAdvisoryReadModel();
    const payloads = buildAdvisoryCompatibilityPayloads(readModel.advisory);
    return {
      total: payloads.sectorModels.length,
      sectorModels: payloads.sectorModels,
    };
  }),

  /**
   * Get advisory metadata
   */
  getMetadata: publicProcedure.query(async () => {
    const overview = await buildAdvisoryOverview();
    return overview.metadata;
  }),
});
