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
import { deriveCatalogAuthorityTierFromUrl, resolveDatasetAdmission } from "../catalog-authority";

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
   * Get datasets needing verification (outside the shared verification window or never verified)
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
        authorityTier: z.string().optional(),
        sourceRole: z
          .enum([
            "normative_authority",
            "canonical_technical_artifact",
            "supplemental_source",
          ])
          .optional(),
        admissionBasis: z
          .enum([
            "official_publication",
            "registry_registered_artifact",
            "canonical_publication_evidence",
            "supplemental_only",
          ])
          .optional(),
        licenseType: z.string().optional(),
        publicationStatus: z.string().optional(),
        immutableUri: z.string().optional(),
        format: z.enum(["JSON", "CSV", "XML", "XLSX", "PDF", "API", "OTHER"]),
        version: z.string().optional(),
        recordCount: z.number().optional(),
        fileSize: z.number().optional(),
        downloadUrl: z.string().optional(),
        apiEndpoint: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
        canonicalPublicationUrl: z.string().optional(),
        normativeAuthorityUrl: z.string().optional(),
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

      const admission = resolveDatasetAdmission({
        source: input.source,
        downloadUrl: input.downloadUrl,
        apiEndpoint: input.apiEndpoint,
        authorityTier: input.authorityTier,
        metadata: {
          ...(input.metadata || {}),
          ...(input.sourceRole ? { sourceRole: input.sourceRole } : {}),
          ...(input.admissionBasis ? { admissionBasis: input.admissionBasis } : {}),
          ...(input.canonicalPublicationUrl
            ? { canonicalPublicationUrl: input.canonicalPublicationUrl }
            : {}),
          ...(input.normativeAuthorityUrl
            ? { normativeAuthorityUrl: input.normativeAuthorityUrl }
            : {}),
        },
      });
      return await createDataset({
        ...input,
        authorityTier: admission.authorityTier,
        publicationStatus: input.publicationStatus || "UNKNOWN",
        immutableUri: input.immutableUri || null,
        metadata: admission.metadata,
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
        source: z.string().optional(),
        authorityTier: z.string().optional(),
        sourceRole: z
          .enum([
            "normative_authority",
            "canonical_technical_artifact",
            "supplemental_source",
          ])
          .optional(),
        admissionBasis: z
          .enum([
            "official_publication",
            "registry_registered_artifact",
            "canonical_publication_evidence",
            "supplemental_only",
          ])
          .optional(),
        licenseType: z.string().optional(),
        publicationStatus: z.string().optional(),
        immutableUri: z.string().optional(),
        recordCount: z.number().optional(),
        downloadUrl: z.string().optional(),
        apiEndpoint: z.string().optional(),
        isActive: z.boolean().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
        canonicalPublicationUrl: z.string().optional(),
        normativeAuthorityUrl: z.string().optional(),
        tags: z.array(z.string()).optional(),
        governanceNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Admin access required");
      }

      const { id, ...updates } = input;
      const admission = resolveDatasetAdmission({
        source: updates.source,
        downloadUrl: updates.downloadUrl,
        apiEndpoint: updates.apiEndpoint,
        authorityTier:
          updates.authorityTier ||
          deriveCatalogAuthorityTierFromUrl(
            updates.source || updates.downloadUrl || updates.apiEndpoint,
          ),
        metadata: {
          ...(updates.metadata || {}),
          ...(updates.sourceRole ? { sourceRole: updates.sourceRole } : {}),
          ...(updates.admissionBasis ? { admissionBasis: updates.admissionBasis } : {}),
          ...(updates.canonicalPublicationUrl
            ? { canonicalPublicationUrl: updates.canonicalPublicationUrl }
            : {}),
          ...(updates.normativeAuthorityUrl
            ? { normativeAuthorityUrl: updates.normativeAuthorityUrl }
            : {}),
        },
      });
      return await updateDataset(id, {
        ...updates,
        authorityTier: admission.authorityTier,
        metadata: admission.metadata,
        ...(updates.publicationStatus ? { publicationStatus: updates.publicationStatus } : {}),
      } as any);
    }),
});
