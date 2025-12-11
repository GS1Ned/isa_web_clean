import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  generateComplianceRoadmap,
  getRoadmapById,
  getUserRoadmaps,
  updateRoadmapStatus,
} from "../roadmap-generator";
import { getDb } from "../db";
import { roadmapActions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Compliance Roadmap Router
 * Provides roadmap generation and management
 */

export const roadmapRouter = router({
  /**
   * Generate new compliance roadmap
   */
  generateRoadmap: protectedProcedure
    .input(
      z.object({
        strategy: z.enum([
          "risk_first",
          "quick_wins",
          "balanced",
          "comprehensive",
        ]),
        currentScore: z.number().min(0).max(100),
        targetScore: z.number().min(0).max(100),
        timelineWeeks: z.number().min(1).max(52),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const roadmap = await generateComplianceRoadmap({
        userId: ctx.user.id,
        strategy: input.strategy,
        currentScore: input.currentScore,
        targetScore: input.targetScore,
        timelineWeeks: input.timelineWeeks,
      });

      return {
        success: true,
        roadmap: {
          id: roadmap.roadmapId,
          title: roadmap.title,
          strategy: roadmap.strategy,
          currentScore: roadmap.currentScore,
          projectedScore: roadmap.projectedScore,
          estimatedEffort: roadmap.estimatedEffort,
          estimatedImpact: roadmap.estimatedImpact,
          startDate: roadmap.startDate,
          targetCompletionDate: roadmap.targetCompletionDate,
          actionCount: roadmap.actions.length,
          milestoneCount: roadmap.milestones.length,
        },
      };
    }),

  /**
   * Get roadmap by ID
   */
  getRoadmap: protectedProcedure
    .input(
      z.object({
        roadmapId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const roadmap = await getRoadmapById(input.roadmapId);

      if (!roadmap || roadmap.userId !== ctx.user.id) {
        return null;
      }

      return {
        id: roadmap.id,
        title: roadmap.title,
        strategy: roadmap.strategy,
        currentScore: roadmap.currentScore,
        projectedScore: roadmap.projectedScore,
        estimatedEffort: roadmap.estimatedEffort,
        estimatedImpact: roadmap.estimatedImpact,
        status: roadmap.status,
        progressPercentage: roadmap.progressPercentage,
        startDate: roadmap.startDate,
        targetCompletionDate: roadmap.targetCompletionDate,
        actions: roadmap.actions.map(a => ({
          id: a.id,
          title: a.title,
          description: a.description,
          actionType: a.actionType,
          priority: a.priority,
          sequenceNumber: a.sequenceNumber,
          estimatedEffort: a.estimatedEffort,
          estimatedImpact: a.estimatedImpact,
          startDate: a.startDate,
          targetDate: a.targetDate,
          status: a.status,
          successCriteria: a.successCriteria,
        })),
        milestones: roadmap.milestones.map(m => ({
          id: m.id,
          title: m.title,
          description: m.description,
          targetDate: m.targetDate,
          targetScore: m.targetScore,
          status: m.status,
        })),
      };
    }),

  /**
   * Get user's roadmaps
   */
  listRoadmaps: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const roadmaps = await getUserRoadmaps(ctx.user.id);

      let filtered = roadmaps;
      if (input.status) {
        filtered = roadmaps.filter(r => r.status === input.status);
      }

      return filtered.slice(0, input.limit).map(r => ({
        id: r.id,
        title: r.title,
        strategy: r.strategy,
        currentScore: r.currentScore,
        projectedScore: r.projectedScore,
        status: r.status,
        progressPercentage: r.progressPercentage,
        startDate: r.startDate,
        targetCompletionDate: r.targetCompletionDate,
      }));
    }),

  /**
   * Update roadmap action status
   */
  updateActionStatus: protectedProcedure
    .input(
      z.object({
        actionId: z.number(),
        status: z.enum(["pending", "in_progress", "completed", "blocked"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(roadmapActions)
        .set({ status: input.status })
        .where(eq(roadmapActions.id, input.actionId));

      return { success: true };
    }),

  /**
   * Update roadmap status and progress
   */
  updateRoadmapStatus: protectedProcedure
    .input(
      z.object({
        roadmapId: z.number(),
        status: z.enum(["draft", "active", "completed"]),
        progressPercentage: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await updateRoadmapStatus(
        input.roadmapId,
        input.status,
        input.progressPercentage
      );

      return { success: true };
    }),

  /**
   * Get roadmap statistics
   */
  getRoadmapStats: protectedProcedure
    .input(
      z.object({
        roadmapId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const roadmap = await getRoadmapById(input.roadmapId);

      if (!roadmap || roadmap.userId !== ctx.user.id) {
        return null;
      }

      const completedActions = roadmap.actions.filter(
        a => a.status === "completed"
      ).length;
      const inProgressActions = roadmap.actions.filter(
        a => a.status === "in_progress"
      ).length;
      const blockedActions = roadmap.actions.filter(
        a => a.status === "blocked"
      ).length;

      const completedMilestones = roadmap.milestones.filter(
        m => m.status === "completed"
      ).length;

      return {
        totalActions: roadmap.actions.length,
        completedActions,
        inProgressActions,
        blockedActions,
        pendingActions:
          roadmap.actions.length -
          completedActions -
          inProgressActions -
          blockedActions,
        completionPercentage: Math.round(
          (completedActions / roadmap.actions.length) * 100
        ),
        totalMilestones: roadmap.milestones.length,
        completedMilestones,
        estimatedEffort: roadmap.estimatedEffort,
        estimatedImpact: roadmap.estimatedImpact,
        projectedScore: roadmap.projectedScore,
      };
    }),
});
