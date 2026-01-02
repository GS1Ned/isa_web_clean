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
      successRate24h: s.successRate24H,
      totalExecutions24h: s.totalExecutions24H,
      failedExecutions24h: s.failedExecutions24H,
      avgItemsFetched24h: s.avgItemsFetched24H,
      avgDurationMs24h: s.avgDurationMs24H,
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
        .where(eq(scraperExecutions.success, 0))
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
        hoursBack: z.number().min(1).max(720).default(24), // Max 30 days
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
        .where(gte(scraperExecutions.startedAt, cutoffTime.toISOString()));

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
          endTime: new Date().toISOString(),
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
          alertSent: 0,
          alertSentAt: null,
        })
        .where(eq(scraperHealthSummary.sourceId, input.sourceId));

      return { success: true };
    }),

  /**
   * Get trend data for visualization
   * Returns time-bucketed metrics for charting
   * Admin-only for performance monitoring
   */
  getTrendData: adminProcedure
    .input(
      z.object({
        hoursBack: z.number().min(1).max(720).default(24),
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
        .where(gte(scraperExecutions.startedAt, cutoffTime.toISOString()))
        .orderBy(scraperExecutions.startedAt);

      // Determine bucket size based on time range
      // 24h: 1-hour buckets (24 points)
      // 48h: 2-hour buckets (24 points)
      // 7d: 6-hour buckets (28 points)
      // 30d: 1-day buckets (30 points)
      let bucketSizeMs: number;
      if (input.hoursBack <= 24) {
        bucketSizeMs = 60 * 60 * 1000; // 1 hour
      } else if (input.hoursBack <= 48) {
        bucketSizeMs = 2 * 60 * 60 * 1000; // 2 hours
      } else if (input.hoursBack <= 168) {
        bucketSizeMs = 6 * 60 * 60 * 1000; // 6 hours
      } else {
        bucketSizeMs = 24 * 60 * 60 * 1000; // 1 day
      }

      // Create time buckets
      const buckets = new Map<
        number,
        Map<
          string,
          {
            sourceName: string;
            executions: number;
            successful: number;
            failed: number;
            totalItems: number;
            totalDuration: number;
          }
        >
      >();

      // Initialize buckets
      const startBucket = Math.floor(cutoffTime.getTime() / bucketSizeMs) * bucketSizeMs;
      const endBucket = Math.floor(Date.now() / bucketSizeMs) * bucketSizeMs;
      for (let bucket = startBucket; bucket <= endBucket; bucket += bucketSizeMs) {
        buckets.set(bucket, new Map());
      }

      // Aggregate executions into buckets
      for (const exec of executions) {
        const bucketTime = Math.floor(new Date(exec.startedAt).getTime() / bucketSizeMs) * bucketSizeMs;
        
        if (!buckets.has(bucketTime)) {
          buckets.set(bucketTime, new Map());
        }

        const bucket = buckets.get(bucketTime)!;
        
        if (!bucket.has(exec.sourceId)) {
          bucket.set(exec.sourceId, {
            sourceName: exec.sourceName,
            executions: 0,
            successful: 0,
            failed: 0,
            totalItems: 0,
            totalDuration: 0,
          });
        }

        const sourceData = bucket.get(exec.sourceId)!;
        sourceData.executions++;
        if (exec.success) {
          sourceData.successful++;
        } else {
          sourceData.failed++;
        }
        sourceData.totalItems += exec.itemsFetched;
        sourceData.totalDuration += exec.durationMs || 0;
      }

      // Convert to chart-friendly format
      const trendData: Array<{
        timestamp: number;
        timestampLabel: string;
        overall: {
          successRate: number;
          itemsFetched: number;
          avgDuration: number;
        };
        bySource: Array<{
          sourceId: string;
          sourceName: string;
          successRate: number;
          itemsFetched: number;
          avgDuration: number;
        }>;
      }> = [];

      const sortedBuckets = Array.from(buckets.keys()).sort((a, b) => a - b);

      for (const bucketTime of sortedBuckets) {
        const bucket = buckets.get(bucketTime)!;
        
        // Calculate overall metrics
        let overallExecs = 0;
        let overallSuccessful = 0;
        let overallItems = 0;
        let overallDuration = 0;

        const bySource: Array<{
          sourceId: string;
          sourceName: string;
          successRate: number;
          itemsFetched: number;
          avgDuration: number;
        }> = [];

        bucket.forEach((data, sourceId) => {
          overallExecs += data.executions;
          overallSuccessful += data.successful;
          overallItems += data.totalItems;
          overallDuration += data.totalDuration;

          const successRate = data.executions > 0 
            ? Math.round((data.successful / data.executions) * 100)
            : 100;
          const avgDuration = data.executions > 0
            ? Math.round(data.totalDuration / data.executions)
            : 0;

          bySource.push({
            sourceId,
            sourceName: data.sourceName,
            successRate,
            itemsFetched: data.totalItems,
            avgDuration,
          });
        });

        const overallSuccessRate = overallExecs > 0
          ? Math.round((overallSuccessful / overallExecs) * 100)
          : 100;
        const overallAvgDuration = overallExecs > 0
          ? Math.round(overallDuration / overallExecs)
          : 0;

        trendData.push({
          timestamp: bucketTime,
          timestampLabel: new Date(bucketTime).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          overall: {
            successRate: overallSuccessRate,
            itemsFetched: overallItems,
            avgDuration: overallAvgDuration,
          },
          bySource,
        });
      }

      return {
        bucketSizeMs,
        trendData,
      };
    }),
});
