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
  
  
  
} from "./db";
import { getDb } from "./db";
import { userSavedItems, userAlerts, hubNews, pipelineExecutionLog, regulatoryEvents } from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
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
import { askISAV2Router } from "./routers/ask-isa-v2.js";
import { citationAdminRouter } from "./routers/citation-admin.js";
import { gs1AttributesRouter } from "./routers/gs1-attributes.js";
import { newsAdminRouter } from "./news-admin-router.js";
import { cronRouter } from "./routers/cron.js";
import { advisoryRouter } from "./routers/advisory.js";
import { regulatoryChangeLogRouter } from "./routers/regulatory-change-log.js";
import { monitoringRouter } from "./routers/monitoring.js";
import { scraperHealthRouter } from "./routers/scraper-health.js";
import { esrsGs1MappingRouter } from "./routers/esrs-gs1-mapping.js";
import { esrsRoadmapRouter } from "./routers/esrs-roadmap.js";
import { advisoryDiffRouter } from "./routers/advisory-diff.js";
import { coverageAnalyticsRouter } from "./routers/coverage-analytics.js";
import { pipelineObservabilityRouter } from "./routers/pipeline-observability.js";
import { observabilityRouter } from "./routers/observability.js";
import { datasetRegistryRouter } from "./routers/dataset-registry.js";
import { advisoryReportsRouter } from "./routers/advisory-reports.js";
import { governanceDocumentsRouter } from "./routers/governance-documents.js";
import { stakeholderDashboardRouter } from "./routers/stakeholder-dashboard.js";
import { dataQualityRouter } from "./routers-data-quality.js";
import { standardsDirectoryRouter } from "./routers/standards-directory.js";
import { productionMonitoringRouter } from "./routers/production-monitoring.js";
import { errorTrackingRouter } from "./router-error-tracking.js";
import { performanceTrackingRouter } from "./router-performance-tracking.js";
import { webhookConfigRouter, webhookConfigSchemas } from "./routers-webhook-config.js";
import { gapAnalyzerRouter } from "./routers/gap-analyzer.js";
import { impactSimulatorRouter } from "./routers/impact-simulator.js";
import { attributeRecommenderRouter } from "./routers/attribute-recommender.js";
import { esgArtefactsRouter } from "./routers/esg-artefacts.js";
import { evaluationRouter } from "./routers/evaluation.js";
import { serverLogger } from "./_core/logger-wiring";

import {
  getUserOnboardingProgress,
  resetUserOnboardingProgress,
  saveUserOnboardingProgress,
} from "./onboarding-progress";

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
        z
          .object({
            type: z.string().optional(),
          })
          .optional()
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
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const { generateRegulationEsrsMappings } = await import(
          "./regulation-esrs-mapper"
        );
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
        if (ctx.user?.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN" });
        const { getLowScoredMappings } = await import("./db");
        return await getLowScoredMappings(input.minVotes || 3);
      }),

    getVoteDistributionByStandard: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin")
        throw new TRPCError({ code: "FORBIDDEN" });
      const { getVoteDistributionByStandard } = await import("./db");
      return await getVoteDistributionByStandard();
    }),

    getMostVotedMappings: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN" });
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
        z
          .object({
            limit: z.number().default(10),
          })
          .optional()
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
        z
          .object({
            limit: z.number().default(20),
          })
          .optional()
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
          companySize: z
            .enum(["STARTUP", "SME", "ENTERPRISE", "OTHER"])
            .optional(),
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
            createdAt: new Date().toISOString(),
          });

          return { success: true };
        } catch (error) {
          serverLogger.error("[tRPC] Save regulation failed:", error);
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

          await db
            .delete(userSavedItems)
            .where(
              and(
                eq(userSavedItems.userId, ctx.user.id),
                eq(userSavedItems.itemId, input.regulationId)
              )
            );

          return { success: true };
        } catch (error) {
          serverLogger.error("[tRPC] Unsave regulation failed:", error);
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
            isActive: 1,
            createdAt: new Date().toISOString(),
          });

          return { success: true };
        } catch (error) {
          serverLogger.error("[tRPC] Set alert failed:", error);
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

          await db
            .delete(userAlerts)
            .where(
              and(
                eq(userAlerts.userId, ctx.user.id),
                eq(userAlerts.regulationId, input.regulationId)
              )
            );

          return { success: true };
        } catch (error) {
          serverLogger.error("[tRPC] Remove alert failed:", error);
          return { success: false };
        }
      }),

    // Get user's saved regulations
    getSavedRegulations: protectedProcedure.query(async ({ ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const saved = await db
          .select()
          .from(userSavedItems)
          .where(
            and(
              eq(userSavedItems.userId, ctx.user.id),
              eq(userSavedItems.itemType, "REGULATION" as any)
            )
          );

        return saved;
      } catch (error) {
        serverLogger.error("[tRPC] Get saved regulations failed:", error);
        return [];
      }
    }),

    // Get user's alerts
    getUserAlerts: protectedProcedure.query(async ({ ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const alerts = await db
          .select()
          .from(userAlerts)
          .where(eq(userAlerts.userId, ctx.user.id));

        return alerts;
      } catch (error) {
        serverLogger.error("[tRPC] Get user alerts failed:", error);
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
          const news = await db
            .select()
            .from(hubNews)
            .orderBy(desc(hubNews.publishedDate))
            .limit(limit);

          return news;
        } catch (error) {
          serverLogger.error("[tRPC] Get recent news failed:", error);
          return [];
        }
      }),

    // Get last pipeline run status (public)
    getLastPipelineRun: publicProcedure.query(async () => {
      try {
        const db = await getDb();
        if (!db) return null;

        const lastRun = await db
          .select()
          .from(pipelineExecutionLog)
          .where(eq(pipelineExecutionLog.pipelineType, "news_ingestion"))
          .orderBy(desc(pipelineExecutionLog.startedAt))
          .limit(1);

        return lastRun[0] || null;
      } catch (error) {
        serverLogger.error("[tRPC] Get last pipeline run failed:", error);
        return null;
      }
    }),

    // Get AI recommendations for a news article
    getNewsRecommendations: publicProcedure
      .input(z.object({ newsId: z.number() }))
      .query(async ({ input }) => {
        try {
          const { getRecommendationsByNewsId } = await import(
            "./db-recommendations"
          );
          const recommendations = await getRecommendationsByNewsId(
            input.newsId
          );
          return recommendations;
        } catch (error) {
          serverLogger.error("[tRPC] Get news recommendations failed:", error);
          return [];
        }
      }),

    // Get regulatory events (Phase 2: Check 5 - Event-Based Aggregation)
    getEvents: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(20),
        status: z.enum(['COMPLETE', 'INCOMPLETE', 'DRAFT', 'all']).default('all'),
        regulation: z.string().optional(),
      }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) return [];

          let query = db.select().from(regulatoryEvents);
          
          // Apply filters
          const conditions = [];
          if (input.status !== 'all') {
            conditions.push(eq(regulatoryEvents.status, input.status));
          }
          if (input.regulation) {
            conditions.push(eq(regulatoryEvents.primaryRegulation, input.regulation));
          }
          
          if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
          }
          
          const events = await query
            .orderBy(desc(regulatoryEvents.eventDateLatest))
            .limit(input.limit);

          return events;
        } catch (error) {
          serverLogger.error("[tRPC] Get events failed:", error);
          return [];
        }
      }),

    // Get single event with linked articles
    getEventById: publicProcedure
      .input(z.object({ eventId: z.number() }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) return null;

          const events = await db
            .select()
            .from(regulatoryEvents)
            .where(eq(regulatoryEvents.id, input.eventId))
            .limit(1);

          if (!events[0]) return null;

          // Get linked articles
          const articleIds = (events[0].sourceArticleIds as number[]) || [];
          let linkedArticles: typeof hubNews.$inferSelect[] = [];
          
          if (articleIds.length > 0) {
            linkedArticles = await db
              .select()
              .from(hubNews)
              .where(sql`${hubNews.id} IN (${articleIds.join(',')})`);
          }

          return {
            ...events[0],
            linkedArticles,
          };
        } catch (error) {
          serverLogger.error("[tRPC] Get event by ID failed:", error);
          return null;
        }
      }),

    // Get event statistics
    getEventStats: publicProcedure.query(async () => {
      try {
        const { getEventStats } = await import("./news-event-processor");
        return await getEventStats();
      } catch (error) {
        serverLogger.error("[tRPC] Get event stats failed:", error);
        return {
          total: 0,
          complete: 0,
          incomplete: 0,
          draft: 0,
          byRegulation: {},
          byEventType: {},
        };
      }
    }),

    // Get event for a specific article
    getEventForArticle: publicProcedure
      .input(z.object({ articleId: z.number() }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) return null;

          // Get the article's event ID
          const articles = await db
            .select({ regulatoryEventId: hubNews.regulatoryEventId })
            .from(hubNews)
            .where(eq(hubNews.id, input.articleId))
            .limit(1);

          if (!articles[0]?.regulatoryEventId) return null;

          // Get the event
          const events = await db
            .select()
            .from(regulatoryEvents)
            .where(eq(regulatoryEvents.id, articles[0].regulatoryEventId))
            .limit(1);

          return events[0] || null;
        } catch (error) {
          serverLogger.error("[tRPC] Get event for article failed:", error);
          return null;
        }
      }),
  }),

  /**
   * Analytics features (admin only)
   */
  analytics: router({
    // Get hub engagement metrics
    getHubMetrics: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return {
        totalUsers: 1250,
        activeUsers: 342,
        totalPageViews: 15680,
        avgSessionDuration: 4.2,
        topRegulations: [
          { id: 1, title: "CSRD", views: 3421 },
          { id: 2, title: "ESRS", views: 2156 },
          { id: 3, title: "DPP", views: 1892 },
        ],
        topStandards: [
          { id: 1, title: "GTIN", views: 2341 },
          { id: 2, title: "EPCIS", views: 1876 },
          { id: 3, title: "Digital Product Passport", views: 1654 },
        ],
      };
    }),

    // Track page view
    trackPageView: publicProcedure
      .input(
        z.object({ page: z.string(), regulationId: z.number().optional() })
      )
      .mutation(async ({ input }) => {
        // In production, save to database
        return { success: true };
      }),

    // Get user engagement stats
    getUserEngagement: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
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
          inquiryType: z.enum([
            "demo",
            "pricing",
            "partnership",
            "support",
            "other",
          ]),
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
          serverLogger.error("[tRPC] Contact submission failed:", error);
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
          const { exportRegulationToPDF, generateExportFilename } =
            await import("./export-utils");
          const regulations = await getRegulations();
          const regulation = regulations.find(
            r => String(r.id) === input.regulationId
          );

          if (!regulation) {
            throw new Error("Regulation not found");
          }

          const exportData = {
            id: String(regulation.id),
            title: regulation.title,
            type: regulation.regulationType,
            celexId: regulation.celexId || "",
            description: regulation.description || "",
            effectiveDate: regulation.effectiveDate ? new Date(regulation.effectiveDate) : new Date(),
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
          serverLogger.error("[Export] PDF generation failed:", error);
          return { success: false, error: "Failed to generate PDF" };
        }
      }),

    // Export regulation details to CSV
    regulationToCSV: publicProcedure
      .input(z.object({ regulationId: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const { exportRegulationToCSV, generateExportFilename } =
            await import("./export-utils");
          const regulations = await getRegulations();
          const regulation = regulations.find(
            r => String(r.id) === input.regulationId
          );

          if (!regulation) {
            throw new Error("Regulation not found");
          }

          const exportData = {
            id: String(regulation.id),
            title: regulation.title,
            type: regulation.regulationType,
            celexId: regulation.celexId || "",
            description: regulation.description || "",
            effectiveDate: regulation.effectiveDate ? new Date(regulation.effectiveDate) : new Date(),
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
          serverLogger.error("[Export] CSV generation failed:", error);
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
          const regulations = allRegulations.filter(r =>
            input.regulationIds.includes(String(r.id))
          );

          if (regulations.length === 0) {
            throw new Error("No valid regulations found");
          }

          const regulationsWithStandards = regulations.map(reg => ({
            id: String(reg.id),
            title: reg.title,
            type: reg.regulationType,
            celexId: reg.celexId || "",
            status: "Active",
            effectiveDate: reg.effectiveDate ? new Date(reg.effectiveDate) : new Date(),
            applicableSectors: [],
            applicableGS1Standards: [],
          }));

          const csvContent = exportRegulationsListToCSV(
            regulationsWithStandards
          );

          return {
            success: true,
            filename: `regulations-export-${new Date().toISOString().split("T")[0]}.csv`,
            content: csvContent,
            mimeType: "text/csv",
          };
        } catch (error) {
          serverLogger.error("[Export] CSV list generation failed:", error);
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
  onboarding: router({
    /**
     * Get user's onboarding progress
     */
    getProgress: protectedProcedure.query(async ({ ctx }) => {
      return await getUserOnboardingProgress(ctx.user.id);
    }),
    saveProgress: protectedProcedure
      .input(
        z.object({
          completedSteps: z.array(z.number()),
          currentStep: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await saveUserOnboardingProgress(
          ctx.user.id,
          input.completedSteps,
          input.currentStep
        );
      }),
    resetProgress: protectedProcedure.mutation(async ({ ctx }) => {
      return await resetUserOnboardingProgress(ctx.user.id);
    }),
  }),

  /**
   * ESRS Datapoints Router
   */
  esrs: router({
    /**
     * Get all ESRS datapoints with pagination and filtering
     */
    list: publicProcedure
      .input(
        z
          .object({
            page: z.number().default(1),
            pageSize: z.number().default(50),
            search: z.string().optional(),
            standard: z.string().optional(), // e.g., "ESRS E1", "ESRS S1"
            data_type: z.string().optional(), // e.g., "narrative", "quantitative"
            voluntary: z.boolean().optional(),
          })
          .optional()
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
              ${esrsDatapoints.code} LIKE ${`%${input.search}%`} OR
              ${esrsDatapoints.name} LIKE ${`%${input.search}%`} OR
              ${esrsDatapoints.disclosureRequirement} LIKE ${`%${input.search}%`}
            )`
          );
        }
        if (input?.standard) {
          conditions.push(eq(esrsDatapoints.esrsStandard, input.standard));
        }
        if (input?.data_type) {
          conditions.push(like(esrsDatapoints.dataType, `%${input.data_type}%`));
        }
        if (input?.voluntary !== undefined) {
          conditions.push(eq(esrsDatapoints.voluntary, input.voluntary ? 1 : 0));
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
          data_type: esrsDatapoints.dataType,
          count: sql<number>`count(*)`,
        })
        .from(esrsDatapoints)
        .groupBy(esrsDatapoints.dataType);

      const byDataType = Object.fromEntries(
        byDataTypeResult.map(r => [r.data_type || "unknown", Number(r.count)])
      );

      return { total, byStandard, byDataType };
    }),
  }),

  /**
   * Ask ISA - RAG-powered Q&A Router
   */
  askISA: askISARouter,
  
  /**
   * Ask ISA v2 - Enhanced with Knowledge Embeddings and Reasoning
   */
  askISAV2: askISAV2Router,
  
  /**
   * Evaluation - Golden set testing for Ask ISA
   */
  evaluation: evaluationRouter,

  /**
   * Citation Administration - Provenance and Deprecation Management
   */
  citationAdmin: citationAdminRouter,

  /**
   * GS1 Attributes Router - Benelux attributes and Web Vocabulary
   */
  gs1Attributes: gs1AttributesRouter,

  /**
   * News Admin Router - Manual pipeline triggers and stats
   */
  newsAdmin: newsAdminRouter,

  /**
   * Cron Router - Public endpoints for scheduled tasks
   */
  cron: cronRouter,

  /**
   * ISA Advisory API Router
   */
  advisory: advisoryRouter,

  /**
   * Monitoring Router
   */
  regulatoryChangeLog: regulatoryChangeLogRouter,
  monitoring: monitoringRouter,
  coverageAnalytics: coverageAnalyticsRouter,

  /**
   * Scraper Health Router - News scraper health monitoring
   */
  scraperHealth: scraperHealthRouter,

  /**
   * Pipeline Observability Router - News pipeline execution monitoring
   */
  pipelineObservability: pipelineObservabilityRouter,

  /**
   * Observability Router - Pipeline metrics and monitoring
   */
  observability: observabilityRouter,

  /**
   * Dataset Registry Router (Decision 3)
   */
  datasetRegistry: datasetRegistryRouter,

  /**
   * Advisory Reports Router (Decision 4)
   */
  advisoryReports: advisoryReportsRouter,

  /**
   * Governance Documents Router
   */
  governanceDocuments: governanceDocumentsRouter,

  /**
   * ESRS-GS1 Mapping Router
   */
  esrsGs1Mapping: esrsGs1MappingRouter,

  /**
   * ESRS-GS1 Compliance Roadmap Generator
   */
  esrsRoadmap: esrsRoadmapRouter,

  /**
   * Advisory Diff Router
   */
  advisoryDiff: advisoryDiffRouter,

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

  /**
   * Stakeholder Dashboard - Live project status and metrics
   */
  stakeholderDashboard: stakeholderDashboardRouter,

  /**
   * Data Quality - Track B Priority 1
   */
  dataQuality: dataQualityRouter,

  /**
   * Standards Directory - Track B Priority 3
   * Deterministic discovery of standards without interpretation
   */
  standardsDirectory: standardsDirectoryRouter,
  /**
   * Production Monitoring - Error tracking and performance metrics
   */
  productionMonitoring: productionMonitoringRouter,
  errorTracking: errorTrackingRouter,
  performanceTracking: performanceTrackingRouter,
  /**
   * Webhook Configuration - Slack/Teams integration
   */
  /**
   * Gap Analyzer - Core 1 of Dual-Core PoC
   * Compliance gap analysis with epistemic markers
   */
  gapAnalyzer: gapAnalyzerRouter,
  /**
   * Impact Simulator - Core 2 of Dual-Core PoC
   * Regulatory change impact simulation with uncertainty markers
   */
  impactSimulator: impactSimulatorRouter,
  /**
   * Attribute Recommender - AI-powered GS1 attribute suggestions
   * Provides recommendations with confidence scoring and epistemic markers
   */
  attributeRecommender: attributeRecommenderRouter,

  /**
   * EU ESG to GS1 Mapping Artefacts
   * Frozen, audit-defensible baseline from EU_ESG_to_GS1_Mapping_v1.1
   */
  esgArtefacts: esgArtefactsRouter,

  webhookConfig: router({
    getConfigurations: protectedProcedure.query(() => webhookConfigRouter.getConfigurations()),
    saveConfiguration: protectedProcedure
      .input(webhookConfigSchemas.saveConfiguration)
      .mutation(({ input }) => webhookConfigRouter.saveConfiguration(input)),
    deleteConfiguration: protectedProcedure
      .input(webhookConfigSchemas.deleteConfiguration)
      .mutation(({ input }) => webhookConfigRouter.deleteConfiguration(input)),
    testWebhook: protectedProcedure
      .input(webhookConfigSchemas.testWebhook)
      .mutation(({ input }) => webhookConfigRouter.testWebhook(input)),
    getDeliveryHistory: protectedProcedure
      .input(webhookConfigSchemas.getDeliveryHistory)
      .query(({ input }) => webhookConfigRouter.getDeliveryHistory(input)),
    getDeliveryStats: protectedProcedure
      .input(webhookConfigSchemas.getDeliveryStats)
      .query(({ input }) => webhookConfigRouter.getDeliveryStats(input)),
  }),
});

export type AppRouter = typeof appRouter;
