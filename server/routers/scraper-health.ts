/**
 * Scraper Health Monitoring Router
 * Provides tRPC procedures for querying news scraper health metrics
 */

import { z } from "zod";
import { publicProcedure, adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { scraperExecutions, scraperHealthSummary } from "../../drizzle/schema";
import { eq, desc, and, gte } from "drizzle-orm";

export const scraperHealthRouter = router({
  /**
   * Get health summary for all sources
   * Public endpoint for transparency
   */
  getAllSourcesHealth: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const summaries = await db
      .select()
      .from(scraperHealthSummary)
      .orderBy(desc(scraperHealthSummary.lastExecutionAt));

    return summaries.map((s) => ({
      sourceId: s.sourceId,
      sourceName: s.sourceName,
      successRate24h: s.successRate24h,
      totalExecutions24h: s.totalExecutions24h,
      failedExecutions24h: s.failedExecutions24h,
      avgItemsFetched24h: s.avgItemsFetched24h,
      avgDurationMs24h: s.avgDurationMs24h,
      lastExecutionSuccess: s.lastExecutionSuccess,
      lastExecutionAt: s.lastExecutionAt,
      lastSuccessAt: s.lastSuccessAt,
      lastErrorMessage: s.lastErrorMessage,
      consecutiveFailures: s.consecutiveFailures,
      alertSent: s.alertSent,
      alertSentAt: s.alertSentAt,
    }));
  }),

  /**
   * Get health summary for specific source
   */
  getSourceHealth: publicProcedure
    .input(
      z.object({
        sourceId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const summary = await db
        .select()
        .from(scraperHealthSummary)
        .where(eq(scraperHealthSummary.sourceId, input.sourceId))
        .limit(1);

      if (summary.length === 0) {
        return null;
      }

      return summary[0];
    }),

  /**
   * Get recent execution history for a source
   * Admin-only for detailed diagnostics
   */
  getExecutionHistory: adminProcedure
    .input(
      z.object({
        sourceId: z.string(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const executions = await db
        .select()
        .from(scraperExecutions)
        .where(eq(scraperExecutions.sourceId, input.sourceId))
        .orderBy(desc(scraperExecutions.startedAt))
        .limit(input.limit);

      return executions;
    }),

  /**
   * Get recent failures across all sources
   * Admin-only for quick diagnostics
   */
  getRecentFailures: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const failures = await db
        .select()
        .from(scraperExecutions)
        .where(eq(scraperExecutions.success, false))
        .orderBy(desc(scraperExecutions.startedAt))
        .limit(input.limit);

      return failures;
    }),

  /**
   * Get execution statistics for time range
   * Admin-only for trend analysis
   */
  getExecutionStats: adminProcedure
    .input(
      z.object({
        hoursBack: z.number().min(1).max(168).default(24), // Max 7 days
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const cutoffTime = new Date(Date.now() - input.hoursBack * 60 * 60 * 1000);

      const executions = await db
        .select()
        .from(scraperExecutions)
        .where(gte(scraperExecutions.startedAt, cutoffTime));

      const totalExecutions = executions.length;
      const successfulExecutions = executions.filter((e) => e.success).length;
      const failedExecutions = totalExecutions - successfulExecutions;
      const successRate =
        totalExecutions > 0
          ? Math.round((successfulExecutions / totalExecutions) * 100)
          : 100;

      const totalItemsFetched = executions.reduce(
        (sum, e) => sum + e.itemsFetched,
        0
      );
      const avgItemsPerExecution =
        totalExecutions > 0
          ? Math.round(totalItemsFetched / totalExecutions)
          : 0;

      const totalDuration = executions.reduce(
        (sum, e) => sum + (e.durationMs || 0),
        0
      );
      const avgDurationMs =
        totalExecutions > 0 ? Math.round(totalDuration / totalExecutions) : 0;

      // Get per-source breakdown
      const sourceStats = new Map<
        string,
        {
          sourceName: string;
          total: number;
          successful: number;
          failed: number;
          successRate: number;
        }
      >();

      for (const exec of executions) {
        if (!sourceStats.has(exec.sourceId)) {
          sourceStats.set(exec.sourceId, {
            sourceName: exec.sourceName,
            total: 0,
            successful: 0,
            failed: 0,
            successRate: 0,
          });
        }

        const stats = sourceStats.get(exec.sourceId)!;
        stats.total++;
        if (exec.success) {
          stats.successful++;
        } else {
          stats.failed++;
        }
      }

      // Calculate success rates
      sourceStats.forEach((stats) => {
        stats.successRate =
          stats.total > 0
            ? Math.round((stats.successful / stats.total) * 100)
            : 100;
      });

      // Convert Map to array for serialization
      const bySourceArray: Array<{
        sourceId: string;
        sourceName: string;
        total: number;
        successful: number;
        failed: number;
        successRate: number;
      }> = [];

      sourceStats.forEach((stats, sourceId) => {
        bySourceArray.push({
          sourceId,
          ...stats,
        });
      });

      return {
        timeRange: {
          hoursBack: input.hoursBack,
          startTime: cutoffTime,
          endTime: new Date(),
        },
        overall: {
          totalExecutions,
          successfulExecutions,
          failedExecutions,
          successRate,
          totalItemsFetched,
          avgItemsPerExecution,
          avgDurationMs,
        },
        bySource: bySourceArray,
      };
    }),

  /**
   * Clear alert status for a source
   * Admin-only for manual alert management
   */
  clearAlert: adminProcedure
    .input(
      z.object({
        sourceId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      await db
        .update(scraperHealthSummary)
        .set({
          alertSent: false,
          alertSentAt: null,
        })
        .where(eq(scraperHealthSummary.sourceId, input.sourceId));

      return { success: true };
    }),
});
