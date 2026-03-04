/**
 * ISA Advisory API Router
 * 
 * Minimal tRPC router for serving ISA advisory outputs.
 * Supports filtering by sector, regulation, gap severity, and confidence.
 */

import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { buildAdvisoryReadModel } from "../advisory-read-model";
import {
  loadLegacyAdvisoryDiff,
  normalizeAdvisoryVersionTag,
} from "../advisory-legacy-compat";

function toLegacyMappingShape(mapping: any) {
  return {
    ...mapping,
    mappingId: mapping?.mappingId ?? mapping?.id,
    regulationDatapoint: mapping?.regulationDatapoint ?? mapping?.topic,
    title: mapping?.title ?? mapping?.topic,
    datasetReferences: Array.isArray(mapping?.datasetReferences) ? mapping.datasetReferences : [],
  };
}

function toLegacyGapShape(gap: any) {
  return {
    ...gap,
    gapId: gap?.gapId ?? gap?.id,
    title: gap?.title ?? gap?.topic,
    category: gap?.category ?? gap?.severity,
    affectedSectors: Array.isArray(gap?.affectedSectors) ? gap.affectedSectors : gap?.sectors ?? ["All"],
    datasetReferences: Array.isArray(gap?.datasetReferences) ? gap.datasetReferences : [],
  };
}

function toLegacyRecommendationShape(recommendation: any, index: number) {
  return {
    ...recommendation,
    recommendationId:
      recommendation?.recommendationId ??
      recommendation?.id ??
      `REC-${String(index + 1).padStart(3, "0")}`,
    datasetReferences: Array.isArray(recommendation?.datasetReferences)
      ? recommendation.datasetReferences
      : [],
  };
}

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
    .query(({ input }) => {
      return loadLegacyAdvisoryDiff(
        normalizeAdvisoryVersionTag(input.version1),
        normalizeAdvisoryVersionTag(input.version2),
      );
    }),

  /**
   * Get advisory summary (fast stats for UI)
   */
  getSummary: publicProcedure.query(async () => {
    const readModel = await buildAdvisoryReadModel();
    return readModel.summary;
  }),

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
      let mappings = Array.isArray(readModel.advisory.mappingResults)
        ? readModel.advisory.mappingResults.map(toLegacyMappingShape)
        : [];

      // Filter by sector
      if (input.sector) {
        mappings = mappings.filter((m: any) =>
          m.sectors?.includes(input.sector) || m.sectors?.includes("All")
        );
      }

      // Filter by regulation
      if (input.regulation) {
        mappings = mappings.filter((m: any) =>
          m.regulationStandard === input.regulation
        );
      }

      // Filter by confidence
      if (input.confidence) {
        mappings = mappings.filter((m: any) =>
          m.confidence === input.confidence
        );
      }

      return {
        total: mappings.length,
        mappings,
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
      let gaps = Array.isArray(readModel.advisory.gapAnalysis)
        ? readModel.advisory.gapAnalysis.map(toLegacyGapShape)
        : [];

      // Filter by severity
      if (input.severity) {
        gaps = gaps.filter((g: any) => g.category === input.severity);
      }

      // Filter by sector
      if (input.sector) {
        gaps = gaps.filter((g: any) =>
          g.affectedSectors.includes(input.sector) || g.affectedSectors.includes("All")
        );
      }

      return {
        total: gaps.length,
        gaps,
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
      let recommendations = Array.isArray(readModel.advisory.recommendations)
        ? readModel.advisory.recommendations.map(toLegacyRecommendationShape)
        : [];

      // Filter by timeframe
      if (input.timeframe) {
        recommendations = recommendations.filter((r: any) =>
          r.timeframe === input.timeframe
        );
      }

      // Filter by category
      if (input.category) {
        recommendations = recommendations.filter((r: any) =>
          r.category === input.category
        );
      }

      // Filter by implementation status
      if (input.implementationStatus) {
        recommendations = recommendations.filter((r: any) =>
          r.implementationStatus === input.implementationStatus
        );
      }

      return {
        total: recommendations.length,
        recommendations,
      };
    }),

  /**
   * Get regulations covered
   */
  getRegulations: publicProcedure.query(async () => {
    const readModel = await buildAdvisoryReadModel();
    const regulations = Array.isArray(readModel.advisory.regulationsCovered)
      ? readModel.advisory.regulationsCovered
      : [];
    return {
      total: regulations.length,
      regulations,
    };
  }),

  /**
   * Get sector models covered
   */
  getSectorModels: publicProcedure.query(async () => {
    const readModel = await buildAdvisoryReadModel();
    const sectorModels = Array.isArray(readModel.advisory.sectorModelsCovered)
      ? readModel.advisory.sectorModelsCovered
      : [];
    return {
      total: sectorModels.length,
      sectorModels,
    };
  }),

  /**
   * Get advisory metadata
   */
  getMetadata: publicProcedure.query(async () => {
    const readModel = await buildAdvisoryReadModel();
    return readModel.metadata;
  }),
});
