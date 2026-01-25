import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { notificationPreferences } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const notificationPreferencesRouter = router({
  /**
   * Get user's notification preferences
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const prefs = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, ctx.user.id))
      .limit(1);

    if (prefs.length === 0) {
      // Create default preferences if they don't exist
      await db.insert(notificationPreferences).values({
        userId: ctx.user.id,
      });
      return {
        userId: ctx.user.id,
        riskDetected: true,
        remediationUpdated: true,
        commentAdded: true,
        approvalRequested: true,
        approvalDecision: true,
        templateUpdated: true,
        scoreChanged: true,
        milestoneAchieved: true,
        minSeverity: "low",
        inAppNotifications: true,
        emailNotifications: false,
        quietHoursEnabled: false,
        quietHoursStart: undefined,
        quietHoursEnd: undefined,
        batchNotifications: false,
        batchInterval: 60,
      };
    }

    return prefs[0];
  }),

  /**
   * Update notification type preferences
   */
  updateNotificationTypes: protectedProcedure
    .input(
      z.object({
        riskDetected: z.boolean().optional(),
        remediationUpdated: z.boolean().optional(),
        commentAdded: z.boolean().optional(),
        approvalRequested: z.boolean().optional(),
        approvalDecision: z.boolean().optional(),
        templateUpdated: z.boolean().optional(),
        scoreChanged: z.boolean().optional(),
        milestoneAchieved: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      // Convert boolean to number for tinyint columns
      const updateData: Record<string, number | undefined> = {};
      if (input.riskDetected !== undefined) updateData.riskDetected = input.riskDetected ? 1 : 0;
      if (input.remediationUpdated !== undefined) updateData.remediationUpdated = input.remediationUpdated ? 1 : 0;
      if (input.commentAdded !== undefined) updateData.commentAdded = input.commentAdded ? 1 : 0;
      if (input.approvalRequested !== undefined) updateData.approvalRequested = input.approvalRequested ? 1 : 0;
      if (input.approvalDecision !== undefined) updateData.approvalDecision = input.approvalDecision ? 1 : 0;
      if (input.templateUpdated !== undefined) updateData.templateUpdated = input.templateUpdated ? 1 : 0;
      if (input.scoreChanged !== undefined) updateData.scoreChanged = input.scoreChanged ? 1 : 0;
      if (input.milestoneAchieved !== undefined) updateData.milestoneAchieved = input.milestoneAchieved ? 1 : 0;
      
      await db
        .update(notificationPreferences)
        .set(updateData)
        .where(eq(notificationPreferences.userId, ctx.user.id));
      return { success: true };
    }),

  /**
   * Update severity filtering
   */
  updateSeverityFilter: protectedProcedure
    .input(
      z.object({
        minSeverity: z.enum(["low", "medium", "high", "critical"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      await db
        .update(notificationPreferences)
        .set({ minSeverity: input.minSeverity })
        .where(eq(notificationPreferences.userId, ctx.user.id));
      return { success: true };
    }),

  /**
   * Update delivery channels
   */
  updateDeliveryChannels: protectedProcedure
    .input(
      z.object({
        inAppNotifications: z.boolean().optional(),
        emailNotifications: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      // Convert boolean to number for tinyint columns
      const updateData: Record<string, number | undefined> = {};
      if (input.inAppNotifications !== undefined) updateData.inAppNotifications = input.inAppNotifications ? 1 : 0;
      if (input.emailNotifications !== undefined) updateData.emailNotifications = input.emailNotifications ? 1 : 0;
      
      await db
        .update(notificationPreferences)
        .set(updateData)
        .where(eq(notificationPreferences.userId, ctx.user.id));
      return { success: true };
    }),

  /**
   * Update quiet hours
   */
  updateQuietHours: protectedProcedure
    .input(
      z.object({
        quietHoursEnabled: z.boolean(),
        quietHoursStart: z
          .string()
          .regex(/^\d{2}:\d{2}$/)
          .optional(),
        quietHoursEnd: z
          .string()
          .regex(/^\d{2}:\d{2}$/)
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      await db
        .update(notificationPreferences)
        .set({
          quietHoursEnabled: input.quietHoursEnabled ? 1 : 0,
          quietHoursStart: input.quietHoursStart,
          quietHoursEnd: input.quietHoursEnd,
        })
        .where(eq(notificationPreferences.userId, ctx.user.id));
      return { success: true };
    }),

  /**
   * Update batch notification settings
   */
  updateBatchSettings: protectedProcedure
    .input(
      z.object({
        batchNotifications: z.boolean(),
        batchInterval: z.number().min(15).max(1440), // 15 minutes to 24 hours
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      await db
        .update(notificationPreferences)
        .set({
          batchNotifications: input.batchNotifications ? 1 : 0,
          batchInterval: input.batchInterval,
        })
        .where(eq(notificationPreferences.userId, ctx.user.id));
      return { success: true };
    }),

  /**
   * Reset to default preferences
   */
  resetToDefaults: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    await db
      .update(notificationPreferences)
      .set({
        riskDetected: 1,
        remediationUpdated: 1,
        commentAdded: 1,
        approvalRequested: 1,
        approvalDecision: 1,
        templateUpdated: 1,
        scoreChanged: 1,
        milestoneAchieved: 1,
        minSeverity: "low",
        inAppNotifications: 1,
        emailNotifications: 0,
        quietHoursEnabled: 0,
        quietHoursStart: null,
        quietHoursEnd: null,
        batchNotifications: 0,
        batchInterval: 60,
      })
      .where(eq(notificationPreferences.userId, ctx.user.id));
    return { success: true };
  }),
});
