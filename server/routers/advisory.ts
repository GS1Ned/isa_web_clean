/**
 * ISA Advisory API Router
 * 
 * Minimal tRPC router for serving ISA advisory outputs.
 * Supports filtering by sector, regulation, gap severity, and confidence.
 */

import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import fs from "fs";
import path from "path";

// Load advisory and summary JSON files
const ADVISORY_VERSION = process.env.ISA_ADVISORY_VERSION || "1.1"; // Default to v1.1
const ADVISORY_PATH = path.join(process.cwd(), `data/advisories/ISA_ADVISORY_v${ADVISORY_VERSION}.json`);
const SUMMARY_PATH = path.join(process.cwd(), `data/advisories/ISA_ADVISORY_v${ADVISORY_VERSION}.summary.json`);

let advisoryCache: any = null;
let summaryCache: any = null;

function loadAdvisory() {
  if (!advisoryCache) {
    advisoryCache = JSON.parse(fs.readFileSync(ADVISORY_PATH, "utf8"));
  }
  return advisoryCache;
}

function loadSummary() {
  if (!summaryCache) {
    summaryCache = JSON.parse(fs.readFileSync(SUMMARY_PATH, "utf8"));
  }
  return summaryCache;
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
      const diffPath = path.join(
        process.cwd(),
        `data/advisories/ISA_ADVISORY_DIFF_${input.version1}_to_${input.version2}.json`
      );
      
      if (!fs.existsSync(diffPath)) {
        throw new Error(`Diff file not found for ${input.version1} to ${input.version2}`);
      }
      
      return JSON.parse(fs.readFileSync(diffPath, "utf8"));
    }),

  /**
   * Get advisory summary (fast stats for UI)
   */
  getSummary: publicProcedure.query(() => {
    return loadSummary();
  }),

  /**
   * Get full advisory JSON
   */
  getFull: publicProcedure.query(() => {
    return loadAdvisory();
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
    .query(({ input }) => {
      const advisory = loadAdvisory();
      let mappings = advisory.mappingResults;

      // Filter by sector
      if (input.sector) {
        mappings = mappings.filter((m: any) =>
          m.sectors.includes(input.sector) || m.sectors.includes("All")
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
    .query(({ input }) => {
      const advisory = loadAdvisory();
      let gaps = advisory.gaps;

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
    .query(({ input }) => {
      const advisory = loadAdvisory();
      let recommendations = advisory.recommendations;

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
  getRegulations: publicProcedure.query(() => {
    const advisory = loadAdvisory();
    return {
      total: advisory.regulationsCovered.length,
      regulations: advisory.regulationsCovered,
    };
  }),

  /**
   * Get sector models covered
   */
  getSectorModels: publicProcedure.query(() => {
    const advisory = loadAdvisory();
    return {
      total: advisory.sectorModelsCovered.length,
      sectorModels: advisory.sectorModelsCovered,
    };
  }),

  /**
   * Get advisory metadata
   */
  getMetadata: publicProcedure.query(() => {
    const advisory = loadAdvisory();
    return {
      advisoryId: advisory.advisoryId,
      version: advisory.version,
      publicationDate: advisory.publicationDate,
      generatedAt: advisory.generatedAt,
      datasetRegistryVersion: advisory.datasetRegistryVersion,
      author: advisory.author,
      sourceArtifacts: advisory.sourceArtifacts,
      metadata: advisory.metadata,
    };
  }),
});
