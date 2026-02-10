import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  getAdvisoryReports,
  getAdvisoryReportById,
  createAdvisoryReport,
  updateAdvisoryReport,
  updateReportReviewStatus,
  incrementReportViewCount,
  getReportVersions,
  createReportVersion,
  getAdvisoryReportStats,
  getReportsByRegulationIds,
  getReportsByStandardIds,
} from "../db-advisory-reports";
import { generateReportHtmlForPdf } from "../advisory-report-export";

/**
 * Advisory Reports Router
 * 
 * Implements Decision 4: Advisory report generation with publication deferred to Phase 9.
 * Supports governance with internal-only status by default.
 */
export const advisoryReportsRouter = router({
  /**
   * List all advisory reports with optional filtering
   */
  list: publicProcedure
    .input(
      z.object({
        reportType: z.string().optional(),
        reviewStatus: z.string().optional(),
        publicationStatus: z.string().optional(),
        laneStatus: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await getAdvisoryReports(input);
    }),

  /**
   * Get a single advisory report by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      // Increment view count
      await incrementReportViewCount(input.id);
      return await getAdvisoryReportById(input.id);
    }),

  /**
   * Get advisory report statistics
   */
  stats: publicProcedure
    .query(async () => {
      return await getAdvisoryReportStats();
    }),

  /**
   * Get reports by regulation IDs
   */
  byRegulations: publicProcedure
    .input(z.object({ regulationIds: z.array(z.number()) }))
    .query(async ({ input }) => {
      return await getReportsByRegulationIds(input.regulationIds);
    }),

  /**
   * Get reports by standard IDs
   */
  byStandards: publicProcedure
    .input(z.object({ standardIds: z.array(z.number()) }))
    .query(async ({ input }) => {
      return await getReportsByStandardIds(input.standardIds);
    }),

  /**
   * Get report versions
   */
  versions: publicProcedure
    .input(z.object({ reportId: z.number() }))
    .query(async ({ input }) => {
      return await getReportVersions(input.reportId);
    }),

  /**
   * Create a new advisory report (admin only)
   * Decision 4: Publication deferred, defaults to INTERNAL_ONLY
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        reportType: z.enum([
          "COMPLIANCE_ASSESSMENT",
          "STANDARDS_MAPPING",
          "REGULATION_IMPACT",
          "IMPLEMENTATION_GUIDE",
          "GAP_ANALYSIS",
          "SECTOR_ADVISORY",
          "CUSTOM",
        ]),
        executiveSummary: z.string().optional(),
        content: z.string(),
        findings: z.array(
          z.object({
            category: z.string(),
            severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
            description: z.string(),
            recommendation: z.string(),
          })
        ).optional(),
        recommendations: z.array(z.string()).optional(),
        targetRegulationIds: z.array(z.number()).optional(),
        targetStandardIds: z.array(z.number()).optional(),
        sectorTags: z.array(z.string()).optional(),
        gs1ImpactTags: z.array(z.string()).optional(),
        version: z.string(),
        generationPrompt: z.string().optional(),
        llmModel: z.string().optional(),
        qualityScore: z.number().optional(),
        governanceNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Admin access required");
      }

      return await createAdvisoryReport({
        ...input,
        generatedBy: ctx.user.name || ctx.user.email || "Unknown",
        reviewStatus: "DRAFT",
        publicationStatus: "INTERNAL_ONLY", // Decision 4: Defer publication
      } as any);
    }),

  /**
   * Update advisory report (admin only)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        executiveSummary: z.string().optional(),
        content: z.string().optional(),
        findings: z.array(
          z.object({
            category: z.string(),
            severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
            description: z.string(),
            recommendation: z.string(),
          })
        ).optional(),
        recommendations: z.array(z.string()).optional(),
        qualityScore: z.number().optional(),
        governanceNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Admin access required");
      }

      const { id, ...updates } = input;
      return await updateAdvisoryReport(id, updates as any);
    }),

  /**
   * Update report review status (admin only)
   */
  updateReviewStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        reviewStatus: z.enum(["DRAFT", "UNDER_REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"]),
        reviewNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Admin access required");
      }

      return await updateReportReviewStatus(
        input.id,
        input.reviewStatus,
        ctx.user.name || ctx.user.email || "Unknown",
        input.reviewNotes
      );
    }),

  /**
   * Create a new version of a report (admin only)
   */
  createVersion: protectedProcedure
    .input(
      z.object({
        reportId: z.number(),
        version: z.string(),
        content: z.string(),
        changeLog: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Admin access required");
      }

      return await createReportVersion({
        ...input,
        createdBy: ctx.user.name || ctx.user.email || "Unknown",
      });
    }),

  /**
   * Export report as HTML (for PDF rendering)
   */
  exportHtml: publicProcedure
    .input(
      z.object({
        id: z.number(),
        includeMetadata: z.boolean().optional(),
        includeGovernanceNotice: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const result = await generateReportHtmlForPdf(input.id, {
        includeMetadata: input.includeMetadata,
        includeGovernanceNotice: input.includeGovernanceNotice,
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate export');
      }
      
      return {
        html: result.html,
        filename: result.filename,
        mimeType: result.mimeType,
      };
    }),
});
