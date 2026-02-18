import { z } from "zod";

import { router, protectedProcedure } from "../_core/trpc";
import {
  createUserAnalysis,
  getUserAnalysisHistory,
  getUserPreferences,
} from "../db";

export const userRouter = router({
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
    .mutation(async () => {
      // TODO: Implement update preferences mutation
      // This would update the user_preferences table
      return { success: true };
    }),
});

