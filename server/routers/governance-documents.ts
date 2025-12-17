import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  getGovernanceDocuments,
  getGovernanceDocumentById,
  getGovernanceDocumentByCode,
  createGovernanceDocument,
  updateGovernanceDocument,
  updateDocumentVerification,
  getDocumentsNeedingVerification,
  getGovernanceDocumentStats,
  searchGovernanceDocuments,
  getDocumentsByRegulationIds,
  getDocumentsByStandardIds,
} from "../db-governance-documents";

/**
 * Governance Documents Router
 * 
 * Catalog of official GS1 and EU regulatory documents.
 * Supports Lane C governance with verification tracking.
 */
export const governanceDocumentsRouter = router({
  /**
   * List all governance documents with optional filtering
   */
  list: publicProcedure
    .input(
      z.object({
        documentType: z.string().optional(),
        category: z.string().optional(),
        status: z.string().optional(),
        laneStatus: z.string().optional(),
        searchTerm: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await getGovernanceDocuments(input);
    }),

  /**
   * Get a single governance document by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getGovernanceDocumentById(input.id);
    }),

  /**
   * Get governance document by document code
   */
  getByCode: publicProcedure
    .input(z.object({ documentCode: z.string() }))
    .query(async ({ input }) => {
      return await getGovernanceDocumentByCode(input.documentCode);
    }),

  /**
   * Search governance documents
   */
  search: publicProcedure
    .input(z.object({ searchTerm: z.string() }))
    .query(async ({ input }) => {
      return await searchGovernanceDocuments(input.searchTerm);
    }),

  /**
   * Get documents needing verification (90+ days old or never verified)
   */
  needingVerification: publicProcedure
    .query(async () => {
      return await getDocumentsNeedingVerification();
    }),

  /**
   * Get governance document statistics
   */
  stats: publicProcedure
    .query(async () => {
      return await getGovernanceDocumentStats();
    }),

  /**
   * Get documents by regulation IDs
   */
  byRegulations: publicProcedure
    .input(z.object({ regulationIds: z.array(z.number()) }))
    .query(async ({ input }) => {
      return await getDocumentsByRegulationIds(input.regulationIds);
    }),

  /**
   * Get documents by standard IDs
   */
  byStandards: publicProcedure
    .input(z.object({ standardIds: z.array(z.number()) }))
    .query(async ({ input }) => {
      return await getDocumentsByStandardIds(input.standardIds);
    }),

  /**
   * Create a new governance document (admin only)
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        documentType: z.enum([
          "GS1_STANDARD",
          "GS1_GUIDELINE",
          "GS1_WHITE_PAPER",
          "EU_REGULATION",
          "EU_DIRECTIVE",
          "EU_IMPLEMENTING_ACT",
          "EU_DELEGATED_ACT",
          "TECHNICAL_SPECIFICATION",
          "INDUSTRY_GUIDANCE",
          "OTHER",
        ]),
        category: z.enum([
          "IDENTIFICATION",
          "CAPTURE",
          "SHARE",
          "ESG_REPORTING",
          "TRACEABILITY",
          "DIGITAL_PRODUCT_PASSPORT",
          "CIRCULAR_ECONOMY",
          "DUE_DILIGENCE",
          "PACKAGING",
          "OTHER",
        ]),
        version: z.string().optional(),
        documentCode: z.string().optional(),
        publishedDate: z.date().optional(),
        effectiveDate: z.date().optional(),
        expiryDate: z.date().optional(),
        description: z.string().optional(),
        url: z.string(),
        downloadUrl: z.string().optional(),
        language: z.string().optional(),
        status: z.enum(["DRAFT", "PUBLISHED", "SUPERSEDED", "WITHDRAWN", "ARCHIVED"]).optional(),
        supersededBy: z.number().optional(),
        isOfficial: z.boolean().optional(),
        currencyDisclaimer: z.string().optional(),
        relatedRegulationIds: z.array(z.number()).optional(),
        relatedStandardIds: z.array(z.number()).optional(),
        tags: z.array(z.string()).optional(),
        keywords: z.array(z.string()).optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Admin access required");
      }

      return await createGovernanceDocument({
        ...input,
        laneStatus: "LANE_C", // Enforce Lane C governance
      } as any);
    }),

  /**
   * Update governance document (admin only)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        version: z.string().optional(),
        publishedDate: z.date().optional(),
        effectiveDate: z.date().optional(),
        expiryDate: z.date().optional(),
        description: z.string().optional(),
        url: z.string().optional(),
        downloadUrl: z.string().optional(),
        status: z.enum(["DRAFT", "PUBLISHED", "SUPERSEDED", "WITHDRAWN", "ARCHIVED"]).optional(),
        supersededBy: z.number().optional(),
        currencyDisclaimer: z.string().optional(),
        relatedRegulationIds: z.array(z.number()).optional(),
        relatedStandardIds: z.array(z.number()).optional(),
        tags: z.array(z.string()).optional(),
        keywords: z.array(z.string()).optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Admin access required");
      }

      const { id, ...updates } = input;
      return await updateGovernanceDocument(id, updates as any);
    }),

  /**
   * Update document verification (admin only)
   */
  updateVerification: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Admin access required");
      }

      return await updateDocumentVerification(
        input.id,
        ctx.user.name || ctx.user.email || "Unknown"
      );
    }),
});
