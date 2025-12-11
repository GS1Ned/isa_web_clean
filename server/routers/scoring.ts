import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  calculateComplianceMetrics,
  updateComplianceScore,
  getUserComplianceScore,
  getUserScoreHistory,
  getUserMilestones,
} from "../compliance-scoring";

/**
 * Compliance Scoring Router
 * Provides access to compliance scores and metrics
 */

export const scoringRouter = router({
  /**
   * Get current compliance score
   */
  getScore: protectedProcedure.query(async ({ ctx }) => {
    const score = await getUserComplianceScore(ctx.user.id);

    if (!score) {
      // Calculate and create score if it doesn't exist
      const metrics = await calculateComplianceMetrics(ctx.user.id);
      await updateComplianceScore(ctx.user.id, "initial_calculation");
      return {
        overallScore: metrics.overallScore,
        riskManagementScore: metrics.riskManagementScore,
        remediationScore: metrics.remediationScore,
        evidenceScore: metrics.evidenceScore,
        regulationScore: metrics.regulationScore,
        totalRisks: metrics.totalRisks,
        resolvedRisks: metrics.resolvedRisks,
        totalRemediationPlans: metrics.totalRemediationPlans,
        completedPlans: metrics.completedPlans,
        totalEvidence: metrics.totalEvidence,
        verifiedEvidence: metrics.verifiedEvidence,
        regulationsCovered: metrics.regulationsCovered,
      };
    }

    return {
      overallScore: parseFloat(score.overallScore as any),
      riskManagementScore: parseFloat(score.riskManagementScore as any),
      remediationScore: parseFloat(score.remediationScore as any),
      evidenceScore: parseFloat(score.evidenceScore as any),
      regulationScore: parseFloat(score.regulationScore as any),
      totalRisks: score.totalRisks,
      resolvedRisks: score.resolvedRisks,
      totalRemediationPlans: score.totalRemediationPlans,
      completedPlans: score.completedPlans,
      totalEvidence: score.totalEvidence,
      verifiedEvidence: score.verifiedEvidence,
      regulationsCovered: score.regulationsCovered,
      lastUpdated: score.lastUpdated,
    };
  }),

  /**
   * Recalculate and update compliance score
   */
  recalculateScore: protectedProcedure
    .input(
      z.object({
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await updateComplianceScore(
        ctx.user.id,
        input.reason || "manual_recalculation"
      );
      const score = await getUserComplianceScore(ctx.user.id);

      return {
        success: true,
        score: score
          ? {
              overallScore: parseFloat(score.overallScore as any),
              riskManagementScore: parseFloat(score.riskManagementScore as any),
              remediationScore: parseFloat(score.remediationScore as any),
              evidenceScore: parseFloat(score.evidenceScore as any),
              regulationScore: parseFloat(score.regulationScore as any),
            }
          : null,
      };
    }),

  /**
   * Get score history
   */
  getScoreHistory: protectedProcedure
    .input(
      z.object({
        days: z.number().default(30),
      })
    )
    .query(async ({ input, ctx }) => {
      const history = await getUserScoreHistory(ctx.user.id, input.days);

      return history.map(h => ({
        overallScore: parseFloat(h.overallScore as any),
        riskManagementScore: parseFloat(h.riskManagementScore as any),
        remediationScore: parseFloat(h.remediationScore as any),
        evidenceScore: parseFloat(h.evidenceScore as any),
        regulationScore: parseFloat(h.regulationScore as any),
        changeReason: h.changeReason,
        createdAt: h.createdAt,
      }));
    }),

  /**
   * Get user's milestones
   */
  getMilestones: protectedProcedure.query(async ({ ctx }) => {
    const milestones = await getUserMilestones(ctx.user.id);

    return milestones.map(m => ({
      id: m.id,
      milestoneType: m.milestoneType,
      milestoneTitle: m.milestoneTitle,
      description: m.description,
      badge: m.badge,
      achievedAt: m.achievedAt,
    }));
  }),

  /**
   * Get compliance metrics (for admin dashboard)
   */
  getMetrics: protectedProcedure.query(async ({ ctx }) => {
    const metrics = await calculateComplianceMetrics(ctx.user.id);

    return {
      overallScore: metrics.overallScore,
      riskManagementScore: metrics.riskManagementScore,
      remediationScore: metrics.remediationScore,
      evidenceScore: metrics.evidenceScore,
      regulationScore: metrics.regulationScore,
      totalRisks: metrics.totalRisks,
      resolvedRisks: metrics.resolvedRisks,
      resolutionRate:
        metrics.totalRisks > 0
          ? (metrics.resolvedRisks / metrics.totalRisks) * 100
          : 0,
      totalRemediationPlans: metrics.totalRemediationPlans,
      completedPlans: metrics.completedPlans,
      completionRate:
        metrics.totalRemediationPlans > 0
          ? (metrics.completedPlans / metrics.totalRemediationPlans) * 100
          : 0,
      totalEvidence: metrics.totalEvidence,
      verifiedEvidence: metrics.verifiedEvidence,
      verificationRate:
        metrics.totalEvidence > 0
          ? (metrics.verifiedEvidence / metrics.totalEvidence) * 100
          : 0,
      regulationsCovered: metrics.regulationsCovered,
    };
  }),
});
