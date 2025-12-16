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
   * Export roadmap as PDF
   */
  exportAsPDF: protectedProcedure
    .input(
      z.object({
        roadmapId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const roadmap = await getRoadmapById(input.roadmapId);

      if (!roadmap || roadmap.userId !== ctx.user.id) {
        throw new Error("Roadmap not found or access denied");
      }

      // Generate markdown content
      const markdown = generateRoadmapMarkdown(roadmap);

      // Write markdown to temp file
      const { writeFile, unlink } = await import("fs/promises");
      const { tmpdir } = await import("os");
      const { join } = await import("path");
      const { randomBytes } = await import("crypto");
      const { exec } = await import("child_process");
      const { promisify } = await import("util");
      const execAsync = promisify(exec);

      const tempId = randomBytes(8).toString("hex");
      const mdPath = join(tmpdir(), `roadmap-${tempId}.md`);
      const pdfPath = join(tmpdir(), `roadmap-${tempId}.pdf`);

      try {
        await writeFile(mdPath, markdown, "utf-8");

        // Convert to PDF using manus-md-to-pdf
        await execAsync(`manus-md-to-pdf ${mdPath} ${pdfPath}`);

        // Read PDF file
        const { readFile } = await import("fs/promises");
        const pdfBuffer = await readFile(pdfPath);

        // Clean up temp files
        await unlink(mdPath).catch(() => {});
        await unlink(pdfPath).catch(() => {});

        return {
          filename: `roadmap-${roadmap.id}-${new Date().toISOString().split("T")[0]}.pdf`,
          data: pdfBuffer.toString("base64"),
          mimeType: "application/pdf",
        };
      } catch (error) {
        // Clean up on error
        await unlink(mdPath).catch(() => {});
        await unlink(pdfPath).catch(() => {});
        throw error;
      }
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

/**
 * Generate markdown content for roadmap PDF export
 */
function generateRoadmapMarkdown(roadmap: any): string {
  const formatDate = (date: any) => new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const completedActions = roadmap.actions.filter(
    (a: any) => a.status === "completed"
  ).length;
  const progressPercent = Math.round(
    (completedActions / roadmap.actions.length) * 100
  );

  let md = `# ${roadmap.title}\n\n`;
  md += `**Strategy:** ${roadmap.strategy}\n\n`;
  md += `**Status:** ${roadmap.status}\n\n`;
  md += `---\n\n`;

  // Executive Summary
  md += `## Executive Summary\n\n`;
  md += `This compliance roadmap outlines a structured path to improve your organization's compliance score from **${roadmap.currentScore}%** to **${roadmap.projectedScore}%** over a ${Math.ceil((new Date(roadmap.targetCompletionDate).getTime() - new Date(roadmap.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000))}-week period.\n\n`;
  md += `- **Current Progress:** ${progressPercent}% complete (${completedActions}/${roadmap.actions.length} actions)\n`;
  md += `- **Estimated Effort:** ${roadmap.estimatedEffort} hours\n`;
  md += `- **Projected Impact:** +${roadmap.estimatedImpact}% compliance score\n`;
  md += `- **Timeline:** ${formatDate(roadmap.startDate)} to ${formatDate(roadmap.targetCompletionDate)}\n\n`;
  md += `---\n\n`;

  // Actions
  md += `## Action Plan\n\n`;
  md += `The following ${roadmap.actions.length} actions are prioritized to maximize compliance impact:\n\n`;

  roadmap.actions.forEach((action: any, idx: number) => {
    md += `### ${idx + 1}. ${action.title}\n\n`;
    md += `**Priority:** ${action.priority} | **Type:** ${action.actionType} | **Status:** ${action.status || "pending"}\n\n`;
    md += `${action.description}\n\n`;
    md += `- **Effort:** ${action.estimatedEffort} hours\n`;
    md += `- **Impact:** +${(action.estimatedImpact as any).toFixed(1)}% compliance score\n`;
    md += `- **Timeline:** ${formatDate(action.startDate)} to ${formatDate(action.targetDate)}\n`;
    if (action.successCriteria) {
      md += `- **Success Criteria:** ${action.successCriteria}\n`;
    }
    md += `\n`;
  });

  md += `---\n\n`;

  // Milestones
  md += `## Milestones\n\n`;
  md += `Key checkpoints to track progress:\n\n`;

  roadmap.milestones.forEach((milestone: any, idx: number) => {
    md += `### Milestone ${idx + 1}: ${milestone.title}\n\n`;
    md += `- **Target Date:** ${formatDate(milestone.targetDate)}\n`;
    md += `- **Target Score:** ${(milestone.targetScore as any).toFixed(1)}%\n`;
    if (milestone.description) {
      md += `- **Description:** ${milestone.description}\n`;
    }
    md += `- **Status:** ${milestone.status || "pending"}\n\n`;
  });

  md += `---\n\n`;
  md += `*Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}*\n`;

  return md;
}
