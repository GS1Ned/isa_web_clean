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
} from "./db";

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
});

export type AppRouter = typeof appRouter;
