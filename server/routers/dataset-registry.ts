// @ts-nocheck
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  getDatasets,
  getDatasetById,
  createDataset,
  updateDatasetVerification,
  updateDataset,
  getDatasetsNeedingVerification,
  getDatasetStats,
} from "../db-dataset-registry";

/**
 * Dataset Registry Router
 * 
 * Implements Decision 3: Dataset registry with last_verified_date tracking.
 * Supports governance with additive-only schema changes.
 */
export const datasetRegistryRouter = router({
  /**
   * List all datasets with optional filtering
   */
  list: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        format: z.string().optional(),
        isActive: z.boolean().optional(),
        needsVerification: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await getDatasets(input);
    }),

  /**
   * Get a single dataset by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getDatasetById(input.id);
    }),

  /**
   * Get datasets needing verification (90+ days old or never verified)
   */
  needingVerification: publicProcedure
    .query(async () => {
      return await getDatasetsNeedingVerification();
    }),

  /**
   * Get dataset statistics
   */
  stats: publicProcedure
    .query(async () => {
      return await getDatasetStats();
    }),

  /**
   * Create a new dataset entry (admin only)
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        category: z.enum([
          "GS1_STANDARDS",
          "GDSN_DATA",
          "ESRS_DATAPOINTS",
          "CBV_VOCABULARIES",
          "DPP_RULES",
          "EU_REGULATIONS",
          "INDUSTRY_DATASETS",
          "OTHER",
        ]),
        source: z.string(),
        format: z.enum(["JSON", "CSV", "XML", "XLSX", "PDF", "API", "OTHER"]),
        version: z.string().optional(),
        recordCount: z.number().optional(),
        fileSize: z.number().optional(),
        downloadUrl: z.string().optional(),
        apiEndpoint: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
        tags: z.array(z.string()).optional(),
        relatedRegulationIds: z.array(z.number()).optional(),
        relatedStandardIds: z.array(z.number()).optional(),
        governanceNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Lane C governance: require admin role
      if (ctx.user?.role !== "admin") {
        throw new Error("Admin access required");
      }

      return await createDataset({
        ...input,
        sourceUrl: input.source,
      });
    }),

  /**
   * Update dataset verification date (Decision 3: additive only)
   */
  updateVerification: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Admin access required");
      }

      return await updateDatasetVerification(
        input.id,
        ctx.user.name || ctx.user.email || "Unknown",
        input.notes
      );
    }),

  /**
   * Update dataset metadata (admin only)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        version: z.string().optional(),
        recordCount: z.number().optional(),
        downloadUrl: z.string().optional(),
        apiEndpoint: z.string().optional(),
        isActive: z.boolean().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
        tags: z.array(z.string()).optional(),
        governanceNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Admin access required");
      }

      const { id, ...updates } = input;
      return await updateDataset(id, updates as any);
    }),
});
