import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getRoadmapById } from "../roadmap-generator";

/**
 * Roadmap Export and Sharing Router
 * Provides roadmap export and sharing capabilities
 */

export const roadmapExportRouter = router({
  /**
   * Export roadmap as JSON
   */
  exportAsJSON: protectedProcedure
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
        filename: `roadmap-${roadmap.id}-${new Date().toISOString().split("T")[0]}.json`,
        data: JSON.stringify(
          {
            title: roadmap.title,
            strategy: roadmap.strategy,
            description: roadmap.description,
            currentScore: roadmap.currentScore,
            projectedScore: roadmap.projectedScore,
            estimatedEffort: roadmap.estimatedEffort,
            estimatedImpact: roadmap.estimatedImpact,
            status: roadmap.status,
            startDate: roadmap.startDate,
            targetCompletionDate: roadmap.targetCompletionDate,
            actions: roadmap.actions.map(a => ({
              sequenceNumber: a.sequenceNumber,
              title: a.title,
              description: a.description,
              actionType: a.actionType,
              priority: a.priority,
              estimatedEffort: a.estimatedEffort,
              estimatedImpact: a.estimatedImpact,
              startDate: a.startDate,
              targetDate: a.targetDate,
              successCriteria: a.successCriteria,
            })),
            milestones: roadmap.milestones.map(m => ({
              title: m.title,
              description: m.description,
              targetDate: m.targetDate,
              targetScore: m.targetScore,
            })),
          },
          null,
          2
        ),
      };
    }),

  /**
   * Export roadmap as CSV
   */
  exportAsCSV: protectedProcedure
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

      // Create CSV header
      const headers = [
        "Roadmap Title",
        "Strategy",
        "Current Score",
        "Projected Score",
        "Estimated Effort (hours)",
        "Estimated Impact (%)",
        "Status",
        "Start Date",
        "Target Completion Date",
      ];

      // Create roadmap summary row
      const summaryRow = [
        roadmap.title,
        roadmap.strategy,
        roadmap.currentScore,
        roadmap.projectedScore,
        roadmap.estimatedEffort,
        roadmap.estimatedImpact,
        roadmap.status,
        new Date(roadmap.startDate).toISOString().split("T")[0],
        new Date(roadmap.targetCompletionDate).toISOString().split("T")[0],
      ];

      // Create actions section
      const actionHeaders = [
        "Action #",
        "Title",
        "Type",
        "Priority",
        "Effort (hours)",
        "Impact (%)",
        "Start Date",
        "Target Date",
        "Success Criteria",
      ];

      const actionRows = roadmap.actions.map(a => [
        a.sequenceNumber,
        a.title,
        a.actionType,
        a.priority,
        a.estimatedEffort,
        a.estimatedImpact,
        new Date(a.startDate).toISOString().split("T")[0],
        new Date(a.targetDate).toISOString().split("T")[0],
        a.successCriteria || "",
      ]);

      // Create milestones section
      const milestoneHeaders = [
        "Milestone #",
        "Title",
        "Target Date",
        "Target Score (%)",
      ];
      const milestoneRows = roadmap.milestones.map((m, idx) => [
        idx + 1,
        m.title,
        new Date(m.targetDate).toISOString().split("T")[0],
        m.targetScore,
      ]);

      // Combine all sections
      const csv = [
        headers.join(","),
        summaryRow.map(v => `"${v}"`).join(","),
        "",
        actionHeaders.join(","),
        ...actionRows.map(row => row.map(v => `"${v}"`).join(",")),
        "",
        milestoneHeaders.join(","),
        ...milestoneRows.map(row => row.map(v => `"${v}"`).join(",")),
      ].join("\n");

      return {
        filename: `roadmap-${roadmap.id}-${new Date().toISOString().split("T")[0]}.csv`,
        data: csv,
      };
    }),

  /**
   * Generate roadmap summary report
   */
  generateSummaryReport: protectedProcedure
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
      const pendingActions =
        roadmap.actions.length -
        completedActions -
        inProgressActions -
        blockedActions;

      const completedMilestones = roadmap.milestones.filter(
        m => m.status === "completed"
      ).length;

      const scoreImprovement = roadmap.projectedScore - roadmap.currentScore;
      const completionPercentage = Math.round(
        (completedActions / roadmap.actions.length) * 100
      );

      return {
        title: roadmap.title,
        strategy: roadmap.strategy,
        summary: {
          currentScore: roadmap.currentScore,
          projectedScore: roadmap.projectedScore,
          scoreImprovement: scoreImprovement,
          scoreImprovementPercent: (
            (scoreImprovement / roadmap.currentScore) *
            100
          ).toFixed(1),
        },
        timeline: {
          startDate: roadmap.startDate,
          targetCompletionDate: roadmap.targetCompletionDate,
          daysRemaining: Math.max(
            0,
            Math.floor(
              (new Date(roadmap.targetCompletionDate).getTime() -
                new Date().getTime()) /
                (24 * 60 * 60 * 1000)
            )
          ),
        },
        effort: {
          totalHours: roadmap.estimatedEffort,
          estimatedImpact: roadmap.estimatedImpact,
        },
        progress: {
          completedActions,
          inProgressActions,
          blockedActions,
          pendingActions,
          completionPercentage,
          completedMilestones,
          totalMilestones: roadmap.milestones.length,
        },
        topActions: roadmap.actions
          .sort(
            (a, b) => (b.estimatedImpact as any) - (a.estimatedImpact as any)
          )
          .slice(0, 5)
          .map(a => ({
            title: a.title,
            impact: a.estimatedImpact,
            priority: a.priority,
          })),
        recommendations: generateRecommendations(roadmap, completionPercentage),
      };
    }),
});

/**
 * Generate recommendations based on roadmap status
 */
function generateRecommendations(
  roadmap: any,
  completionPercentage: number
): string[] {
  const recommendations = [];

  // Score-based recommendations
  const scoreGap = roadmap.projectedScore - roadmap.currentScore;
  if (scoreGap < 5) {
    recommendations.push(
      "Consider adding more high-impact actions to accelerate score improvement."
    );
  }

  // Progress-based recommendations
  if (completionPercentage < 20) {
    recommendations.push(
      "Roadmap is just starting. Focus on quick wins to build momentum."
    );
  } else if (completionPercentage > 80) {
    recommendations.push(
      "Excellent progress! Focus on completing final actions and milestones."
    );
  } else if (completionPercentage > 50) {
    recommendations.push(
      "Halfway there! Maintain current pace to stay on track."
    );
  }

  // Blocked actions
  const blockedActions = roadmap.actions.filter(
    (a: any) => a.status === "blocked"
  );
  if (blockedActions.length > 0) {
    recommendations.push(
      `Address ${blockedActions.length} blocked action(s) to prevent delays.`
    );
  }

  // Timeline recommendations
  const daysRemaining = Math.floor(
    (new Date(roadmap.targetCompletionDate).getTime() - new Date().getTime()) /
      (24 * 60 * 60 * 1000)
  );
  const actionsRemaining = roadmap.actions.filter(
    (a: any) => a.status !== "completed"
  ).length;

  if (daysRemaining > 0 && actionsRemaining > 0) {
    const daysPerAction = daysRemaining / actionsRemaining;
    if (daysPerAction < 3) {
      recommendations.push(
        "Timeline is tight. Consider extending deadline or reducing scope."
      );
    }
  }

  // Strategy recommendations
  if (roadmap.strategy === "quick_wins") {
    recommendations.push(
      "Quick wins strategy is effective for rapid score improvement. Plan follow-up comprehensive roadmap."
    );
  }

  return recommendations;
}
