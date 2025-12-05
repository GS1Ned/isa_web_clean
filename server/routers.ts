import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getRegulations,
  getRegulationWithStandards,
  getGS1Standards,
  getRecentRegulatoryChanges,
  getUserAnalysisHistory,
  createUserAnalysis,
  getUserPreferences,
  getDashboardStats,
  createContact,
  getLowScoredMappings,
  getVoteDistributionByStandard,
  getMostVotedMappings,
} from "./db";
import { getDb } from "./db";
import { userSavedItems, userAlerts, hubNews } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { TRPCError } from "@trpc/server";
import { cellarIngestionRouter } from "./cellar-ingestion-router.js";
import { gs1StandardsRouter } from "./gs1-standards-router.js";
import { epcisRouter } from "./epcis-router.js";
import { batchEpcisRouter } from "./routers/batch-epcis.js";
import { complianceRisksRouter } from "./routers/compliance-risks.js";
import { remediationRouter } from "./routers/remediation.js";
import { scoringRouter } from "./routers/scoring.js";
import { benchmarkingRouter } from "./routers/benchmarking.js";
import { roadmapRouter } from "./routers/roadmap.js";
import { roadmapExportRouter } from "./routers/roadmap-export.js";
import { collaborationRouter } from "./routers/collaboration.js";
import { templatesRouter } from "./routers/templates.js";
import { adminTemplatesRouter } from "./routers/admin-templates.js";
import { templateAnalyticsRouter } from "./routers/template-analytics.js";
import { realtimeRouter } from "./routers/realtime.js";
import { notificationPreferencesRouter } from "./routers/notification-preferences.js";
import { executiveAnalyticsRouter } from "./routers/executive-analytics.js";
import { askISARouter } from "./routers/ask-isa.js";
import { gs1AttributesRouter } from "./routers/gs1-attributes.js";
import { newsAdminRouter } from "./news-admin-router.js";
// import { getUserOnboardingProgress, saveUserOnboardingProgress, resetUserOnboardingProgress } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================================================
  // ISA-specific procedures
  // ============================================================================

  /**
   * Public procedures for regulations and standards
   */
  regulations: router({
    /**
     * Get all regulations, optionally filtered by type
     */
    list: publicProcedure
      .input(
        z.object({
          type: z.string().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        return await getRegulations(input?.type);
      }),

    /**
     * Get a specific regulation with its mapped standards
     */
    getWithStandards: publicProcedure
      .input(z.object({ regulationId: z.number() }))
      .query(async ({ input }) => {
        return await getRegulationWithStandards(input.regulationId);
      }),

    /**
     * Get ESRS datapoint mappings for a regulation
     */
    getEsrsMappings: publicProcedure
      .input(z.object({ regulationId: z.number() }))
      .query(async ({ input }) => {
        const { getRegulationEsrsMappings } = await import("./db");
        return await getRegulationEsrsMappings(input.regulationId);
      }),

    /**
     * Generate ESRS datapoint mappings for a regulation using LLM (admin only)
     */
    generateEsrsMappings: protectedProcedure
      .input(z.object({ regulationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Only admins can trigger LLM mapping generation
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        const { generateRegulationEsrsMappings } = await import("./regulation-esrs-mapper");
        return await generateRegulationEsrsMappings(input.regulationId);
      }),

    /**
     * Submit or update user feedback on an ESRS mapping
     */
    submitMappingFeedback: protectedProcedure
      .input(
        z.object({
          mappingId: z.number(),
          vote: z.boolean(), // true = thumbs up, false = thumbs down
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { submitMappingFeedback } = await import("./db");
        return await submitMappingFeedback({
          userId: ctx.user.id,
          mappingId: input.mappingId,
          vote: input.vote,
        });
      }),

    /**
     * Get user's feedback for a specific mapping
     */
    getUserMappingFeedback: protectedProcedure
      .input(z.object({ mappingId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getUserMappingFeedback } = await import("./db");
        return await getUserMappingFeedback(ctx.user.id, input.mappingId);
      }),

    /**
     * Get aggregated feedback stats for a mapping
     */
    getMappingFeedbackStats: publicProcedure
      .input(z.object({ mappingId: z.number() }))
      .query(async ({ input }) => {
        const { getMappingFeedbackStats } = await import("./db");
        return await getMappingFeedbackStats(input.mappingId);
      }),

    /**
     * Get feedback stats for multiple mappings (batch)
     */
    getBatchMappingFeedbackStats: publicProcedure
      .input(z.object({ mappingIds: z.array(z.number()) }))
      .query(async ({ input }) => {
        const { getBatchMappingFeedbackStats } = await import("./db");
        return await getBatchMappingFeedbackStats(input.mappingIds);
      }),

    getLowScoredMappings: protectedProcedure
      .input(z.object({ minVotes: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const { getLowScoredMappings } = await import("./db");
        return await getLowScoredMappings(input.minVotes || 3);
      }),

    getVoteDistributionByStandard: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const { getVoteDistributionByStandard } = await import("./db");
      return await getVoteDistributionByStandard();
    }),

    getMostVotedMappings: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const { getMostVotedMappings } = await import("./db");
        return await getMostVotedMappings(input.limit || 10);
      }),
  }),

  standards: router({
    /**
     * Get all GS1 standards
     */
    list: publicProcedure.query(async () => {
      return await getGS1Standards();
    }),
  }),

  /**
   * Public procedures for regulatory changes and insights
   */
  insights: router({
    /**
     * Get recent regulatory changes
     */
    recentChanges: publicProcedure
      .input(
        z.object({
          limit: z.number().default(10),
        }).optional()
      )
      .query(async ({ input }) => {
        return await getRecentRegulatoryChanges(input?.limit || 10);
      }),

    /**
     * Get dashboard statistics
     */
    stats: publicProcedure.query(async () => {
      return await getDashboardStats();
    }),
  }),

  /**
   * Protected procedures for authenticated users
   */
  user: router({
    /**
     * Get user's analysis history
     */
    analysisHistory: protectedProcedure
      .input(
        z.object({
          limit: z.number().default(20),
        }).optional()
      )
      .query(async ({ ctx, input }) => {
        return await getUserAnalysisHistory(ctx.user.id, input?.limit || 20);
      }),

    /**
     * Create a new analysis record
     */
    createAnalysis: protectedProcedure
      .input(
        z.object({
          regulationId: z.number().optional(),
          documentTitle: z.string().optional(),
          documentUrl: z.string().optional(),
          analysisType: z.enum(["CELEX", "DOCUMENT_UPLOAD", "URL", "TEXT"]),
          detectedStandardsCount: z.number().optional(),
          analysisResult: z.any().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await createUserAnalysis({
          userId: ctx.user.id,
          ...input,
        });
      }),

    /**
     * Get user preferences
     */
    preferences: protectedProcedure.query(async ({ ctx }) => {
      return await getUserPreferences(ctx.user.id);
    }),

    /**
     * Update user preferences
     */
    updatePreferences: protectedProcedure
      .input(
        z.object({
          interestedRegulations: z.array(z.number()).optional(),
          interestedStandards: z.array(z.number()).optional(),
          notificationsEnabled: z.boolean().optional(),
          industryFocus: z.string().optional(),
          companySize: z.enum(["STARTUP", "SME", "ENTERPRISE", "OTHER"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // TODO: Implement update preferences mutation
        // This would update the user_preferences table
        return { success: true };
      }),
  }),

  /**
   * Hub alerts and saved items (protected)
   */
  hub: router({
    // Save a regulation for the user
    saveRegulation: protectedProcedure
      .input(z.object({ regulationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const db = await getDb();
          if (!db) return { success: false };

          await db.insert(userSavedItems).values({
            userId: ctx.user.id,
            itemId: input.regulationId,
            itemType: "REGULATION",
            createdAt: new Date(),
          });

          return { success: true };
        } catch (error) {
          console.error("[tRPC] Save regulation failed:", error);
          return { success: false };
        }
      }),

    // Remove a saved regulation
    unsaveRegulation: protectedProcedure
      .input(z.object({ regulationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const db = await getDb();
          if (!db) return { success: false };

          await db.delete(userSavedItems).where(
            and(
              eq(userSavedItems.userId, ctx.user.id),
              eq(userSavedItems.itemId, input.regulationId)
            )
          );

          return { success: true };
        } catch (error) {
          console.error("[tRPC] Unsave regulation failed:", error);
          return { success: false };
        }
      }),

    // Set alert preferences for a regulation
    setAlert: protectedProcedure
      .input(z.object({ regulationId: z.number(), alertType: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const db = await getDb();
          if (!db) return { success: false };

          await db.insert(userAlerts).values({
            userId: ctx.user.id,
            regulationId: input.regulationId,
            alertType: input.alertType as any,
            isActive: true,
            createdAt: new Date(),
          });

          return { success: true };
        } catch (error) {
          console.error("[tRPC] Set alert failed:", error);
          return { success: false };
        }
      }),

    // Remove alert
    removeAlert: protectedProcedure
      .input(z.object({ regulationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const db = await getDb();
          if (!db) return { success: false };

          await db.delete(userAlerts).where(
            and(
              eq(userAlerts.userId, ctx.user.id),
              eq(userAlerts.regulationId, input.regulationId)
            )
          );

          return { success: true };
        } catch (error) {
          console.error("[tRPC] Remove alert failed:", error);
          return { success: false };
        }
      }),

    // Get user's saved regulations
    getSavedRegulations: protectedProcedure.query(async ({ ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const saved = await db.select().from(userSavedItems).where(
          and(
            eq(userSavedItems.userId, ctx.user.id),
            eq(userSavedItems.itemType, "REGULATION" as any)
          )
        );

        return saved;
      } catch (error) {
        console.error("[tRPC] Get saved regulations failed:", error);
        return [];
      }
    }),

    // Get user's alerts
    getUserAlerts: protectedProcedure.query(async ({ ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const alerts = await db.select().from(userAlerts).where(
          eq(userAlerts.userId, ctx.user.id)
        );

        return alerts;
      } catch (error) {
        console.error("[tRPC] Get user alerts failed:", error);
        return [];
      }
    }),

    // Get recent news items (public)
    getRecentNews: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) return [];

          const limit = input?.limit || 20;
          const news = await db.select().from(hubNews)
            .orderBy(desc(hubNews.publishedDate))
            .limit(limit);

          return news;
        } catch (error) {
          console.error("[tRPC] Get recent news failed:", error);
          return [];
        }
      }),
  }),

  /**
   * Analytics features (admin only)
   */
  analytics: router({
    // Get hub engagement metrics
    getHubMetrics: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return {
        totalUsers: 1250,
        activeUsers: 342,
        totalPageViews: 15680,
        avgSessionDuration: 4.2,
        topRegulations: [
          { id: 1, title: 'CSRD', views: 3421 },
          { id: 2, title: 'ESRS', views: 2156 },
          { id: 3, title: 'DPP', views: 1892 },
        ],
        topStandards: [
          { id: 1, title: 'GTIN', views: 2341 },
          { id: 2, title: 'EPCIS', views: 1876 },
          { id: 3, title: 'Digital Product Passport', views: 1654 },
        ],
      };
    }),

    // Track page view
    trackPageView: publicProcedure
      .input(z.object({ page: z.string(), regulationId: z.number().optional() }))
      .mutation(async ({ input }) => {
        // In production, save to database
        return { success: true };
      }),

    // Get user engagement stats
    getUserEngagement: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return {
        newUsersThisWeek: 87,
        returningUsers: 234,
        userRetentionRate: 0.68,
        avgAlertsPerUser: 3.2,
        emailOpenRate: 0.42,
        emailClickRate: 0.18,
      };
    }),
  }),

  /**
   * Contact form submission
   */
  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          company: z.string().min(1),
          phone: z.string().optional(),
          inquiryType: z.enum(["demo", "pricing", "partnership", "support", "other"]),
          message: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const contact = await createContact({
            name: input.name,
            email: input.email,
            company: input.company,
            phone: input.phone || null,
            inquiryType: input.inquiryType,
            message: input.message || null,
            status: "new",
          });

          if (contact) {
            // Send owner notification
            await notifyOwner({
              title: `New ${input.inquiryType} inquiry from ${input.company}`,
              content: `${input.name} (${input.email}) has submitted a ${input.inquiryType} inquiry.\n\nMessage: ${input.message || "N/A"}`,
            });
          }

          return { success: !!contact, contactId: contact?.id };
        } catch (error) {
          console.error("[tRPC] Contact submission failed:", error);
          return { success: false };
        }
      }),
  }),

  /**
   * Export procedures for regulations and checklists
   */
  export: router({
    // Export regulation details to PDF
    regulationToPDF: publicProcedure
      .input(z.object({ regulationId: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const { exportRegulationToPDF, generateExportFilename } = await import("./export-utils");
          const regulations = await getRegulations();
          const regulation = regulations.find(r => String(r.id) === input.regulationId);

          if (!regulation) {
            throw new Error("Regulation not found");
          }

          const exportData = {
            id: String(regulation.id),
            title: regulation.title,
            type: regulation.regulationType,
            celexId: regulation.celexId || "",
            description: regulation.description || "",
            effectiveDate: regulation.effectiveDate || new Date(),
            enforcementDate: null,
            status: "Active",
            applicableSectors: [],
            applicableGS1Standards: [],
            implementationPhases: [],
            relatedRegulations: [],
            faqItems: [],
            checklist: [],
          };

          const pdfBuffer = exportRegulationToPDF(exportData);
          const filename = generateExportFilename(regulation.title, "pdf");

          return {
            success: true,
            filename,
            buffer: pdfBuffer.toString("base64"),
            mimeType: "application/pdf",
          };
        } catch (error) {
          console.error("[Export] PDF generation failed:", error);
          return { success: false, error: "Failed to generate PDF" };
        }
      }),

    // Export regulation details to CSV
    regulationToCSV: publicProcedure
      .input(z.object({ regulationId: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const { exportRegulationToCSV, generateExportFilename } = await import("./export-utils");
          const regulations = await getRegulations();
          const regulation = regulations.find(r => String(r.id) === input.regulationId);

          if (!regulation) {
            throw new Error("Regulation not found");
          }

          const exportData = {
            id: String(regulation.id),
            title: regulation.title,
            type: regulation.regulationType,
            celexId: regulation.celexId || "",
            description: regulation.description || "",
            effectiveDate: regulation.effectiveDate || new Date(),
            enforcementDate: null,
            status: "Active",
            applicableSectors: [],
            applicableGS1Standards: [],
            implementationPhases: [],
            relatedRegulations: [],
            faqItems: [],
            checklist: [],
          };

          const csvContent = exportRegulationToCSV(exportData);
          const filename = generateExportFilename(regulation.title, "csv");

          return {
            success: true,
            filename,
            content: csvContent,
            mimeType: "text/csv",
          };
        } catch (error) {
          console.error("[Export] CSV generation failed:", error);
          return { success: false, error: "Failed to generate CSV" };
        }
      }),

    // Export multiple regulations to CSV
    regulationsListToCSV: publicProcedure
      .input(z.object({ regulationIds: z.array(z.string()) }))
      .mutation(async ({ input }) => {
        try {
          const { exportRegulationsListToCSV } = await import("./export-utils");
          const allRegulations = await getRegulations();
          const regulations = allRegulations.filter(r => input.regulationIds.includes(String(r.id)));

          if (regulations.length === 0) {
            throw new Error("No valid regulations found");
          }

          const regulationsWithStandards = regulations.map(reg => ({
            id: String(reg.id),
            title: reg.title,
            type: reg.regulationType,
            celexId: reg.celexId || "",
            status: "Active",
            effectiveDate: reg.effectiveDate || new Date(),
            applicableSectors: [],
            applicableGS1Standards: [],
          }));

          const csvContent = exportRegulationsListToCSV(regulationsWithStandards);

          return {
            success: true,
            filename: `regulations-export-${new Date().toISOString().split("T")[0]}.csv`,
            content: csvContent,
            mimeType: "text/csv",
          };
        } catch (error) {
          console.error("[Export] CSV list generation failed:", error);
          return { success: false, error: "Failed to generate CSV" };
        }
      }),
  }),

  /**
   * CELLAR Ingestion Router (Admin only)
   */
  cellarIngestion: cellarIngestionRouter,
  gs1Standards: gs1StandardsRouter,

  /**
   * EPCIS 2.0 Integration Router
   */
  epcis: epcisRouter,

  /**
   * Batch EPCIS Processing Router
   */
  batchEpcis: batchEpcisRouter,

  /**
   * Compliance Risk Detection Router
   */
  complianceRisks: complianceRisksRouter,

  /**
   * Risk Remediation Router
   */
  remediation: remediationRouter,

  /**
   * Compliance Scoring Router
   */
  scoring: scoringRouter,

  /**
   * Benchmarking Router
   */
  benchmarking: benchmarkingRouter,

  /**
   * Compliance Roadmap Router
   */
  roadmap: roadmapRouter,

  /**
   * Roadmap Export and Sharing Router
   */
  roadmapExport: roadmapExportRouter,

  /**
   * Roadmap Collaboration Router
   */
  collaboration: collaborationRouter,
  templates: templatesRouter,
  adminTemplates: adminTemplatesRouter,
  templateAnalytics: templateAnalyticsRouter,
  realtime: realtimeRouter,
  notificationPreferences: notificationPreferencesRouter,
  executiveAnalytics: executiveAnalyticsRouter,

  /**
   * User Onboarding Progress Router
   */
  // onboarding: router({
  //   /**
  //    * Get user's onboarding progress
  //    * TEMPORARILY DISABLED
  //    */
  //   getProgress: protectedProcedure.query(async ({ ctx }) => {
  //     return await getUserOnboardingProgress(ctx.user.id);
  //   }),
  //   saveProgress: protectedProcedure
  //     .input(
  //       z.object({
  //         completedSteps: z.array(z.number()),
  //         currentStep: z.number(),
  //       })
  //     )
  //     .mutation(async ({ ctx, input }) => {
  //       return await saveUserOnboardingProgress(
  //         ctx.user.id,
  //         input.completedSteps,
  //         input.currentStep
  //       );
  //     }),
  //   resetProgress: protectedProcedure.mutation(async ({ ctx }) => {
  //     return await resetUserOnboardingProgress(ctx.user.id);
  //   }),
  // }),

  /**
   * ESRS Datapoints Router
   */
  esrs: router({
    /**
     * Get all ESRS datapoints with pagination and filtering
     */
    list: publicProcedure
      .input(
        z.object({
          page: z.number().default(1),
          pageSize: z.number().default(50),
          search: z.string().optional(),
          standard: z.string().optional(), // e.g., "ESRS E1", "ESRS S1"
          dataType: z.string().optional(), // e.g., "narrative", "quantitative"
          voluntary: z.boolean().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { datapoints: [], total: 0, page: 1, pageSize: 50 };

        const { esrsDatapoints } = await import("../drizzle/schema");
        const { like, and, eq, sql } = await import("drizzle-orm");

        const page = input?.page || 1;
        const pageSize = input?.pageSize || 50;
        const offset = (page - 1) * pageSize;

        // Build filter conditions
        const conditions = [];
        if (input?.search) {
          conditions.push(
            sql`(
              ${esrsDatapoints.datapointId} LIKE ${`%${input.search}%`} OR
              ${esrsDatapoints.datapointName} LIKE ${`%${input.search}%`} OR
              ${esrsDatapoints.disclosureRequirement} LIKE ${`%${input.search}%`}
            )`
          );
        }
        if (input?.standard) {
          conditions.push(eq(esrsDatapoints.esrsStandard, input.standard));
        }
        if (input?.dataType) {
          conditions.push(like(esrsDatapoints.dataType, `%${input.dataType}%`));
        }
        if (input?.voluntary !== undefined) {
          conditions.push(eq(esrsDatapoints.mayVoluntary, input.voluntary));
        }

        // Get total count
        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(esrsDatapoints)
          .where(conditions.length > 0 ? and(...conditions) : undefined);
        const total = Number(countResult[0]?.count || 0);

        // Get paginated results
        const datapoints = await db
          .select()
          .from(esrsDatapoints)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .limit(pageSize)
          .offset(offset);

        return {
          datapoints,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
      }),

    /**
     * Get unique ESRS standards for filter dropdown
     */
    getStandards: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];

      const { esrsDatapoints } = await import("../drizzle/schema");
      const { sql } = await import("drizzle-orm");

      const standards = await db
        .select({ standard: esrsDatapoints.esrsStandard })
        .from(esrsDatapoints)
        .groupBy(esrsDatapoints.esrsStandard)
        .orderBy(esrsDatapoints.esrsStandard);

      return standards.map(s => s.standard).filter(Boolean);
    }),

    /**
     * Get statistics about ESRS datapoints
     */
    getStats: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { total: 0, byStandard: {}, byDataType: {} };

      const { esrsDatapoints } = await import("../drizzle/schema");
      const { sql } = await import("drizzle-orm");

      // Total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(esrsDatapoints);
      const total = Number(totalResult[0]?.count || 0);

      // Count by standard
      const byStandardResult = await db
        .select({
          standard: esrsDatapoints.esrsStandard,
          count: sql<number>`count(*)`,
        })
        .from(esrsDatapoints)
        .groupBy(esrsDatapoints.esrsStandard);

      const byStandard = Object.fromEntries(
        byStandardResult.map(r => [r.standard, Number(r.count)])
      );

      // Count by data type
      const byDataTypeResult = await db
        .select({
          dataType: esrsDatapoints.dataType,
          count: sql<number>`count(*)`,
        })
        .from(esrsDatapoints)
        .groupBy(esrsDatapoints.dataType);

      const byDataType = Object.fromEntries(
        byDataTypeResult.map(r => [r.dataType || "unknown", Number(r.count)])
      );

      return { total, byStandard, byDataType };
    }),
  }),

  /**
   * Ask ISA - RAG-powered Q&A Router
   */
  askISA: askISARouter,

  /**
   * GS1 Attributes Router - Benelux attributes and Web Vocabulary
   */
  gs1Attributes: gs1AttributesRouter,

  /**
   * News Admin Router - Manual pipeline triggers and stats
   */
  newsAdmin: newsAdminRouter,

  /**
   * Dutch Initiatives Router
   */
  dutchInitiatives: router({
    /**
     * Get all Dutch initiatives with optional filtering
     */
    list: publicProcedure
      .input(
        z.object({
          sector: z.string().optional(),
          status: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        const { getDutchInitiatives } = await import("./db");
        return await getDutchInitiatives(input);
      }),

    /**
     * Get a single Dutch initiative with all mappings
     */
    getWithMappings: publicProcedure
      .input(z.object({ initiativeId: z.number() }))
      .query(async ({ input }) => {
        const { getDutchInitiativeWithMappings } = await import("./db");
        return await getDutchInitiativeWithMappings(input.initiativeId);
      }),

    /**
     * Get unique sectors for filtering
     */
    getSectors: publicProcedure.query(async () => {
      const { getDutchInitiativeSectors } = await import("./db");
      return await getDutchInitiativeSectors();
    }),
  }),

});

export type AppRouter = typeof appRouter;
