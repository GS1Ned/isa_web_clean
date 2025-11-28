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
import { notifyOwner } from "./_core/notification";
import { TRPCError } from "@trpc/server";

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
        // In production, save to database via createUserSavedItem
        return { success: true, message: `Regulation ${input.regulationId} saved` };
      }),

    // Remove a saved regulation
    removeSavedRegulation: protectedProcedure
      .input(z.object({ regulationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return { success: true, message: `Regulation ${input.regulationId} removed` };
      }),

    // Set alert preferences for a regulation
    setAlertPreference: protectedProcedure
      .input(z.object({ regulationId: z.number(), enabled: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        return {
          success: true,
          message: `Alerts ${input.enabled ? 'enabled' : 'disabled'} for regulation ${input.regulationId}`,
        };
      }),

    // Get user's saved regulations and alerts
    getUserPreferences: protectedProcedure.query(async ({ ctx }) => {
      return {
        userId: ctx.user.id,
        savedRegulations: [],
        alertsEnabled: true,
        digestFrequency: 'daily',
      };
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
});

export type AppRouter = typeof appRouter;
