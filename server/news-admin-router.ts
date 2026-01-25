/**
 * News Admin Router
 * Admin-only procedures for managing news pipeline
 * Uses async execution with status tracking for long-running operations
 */

import { router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { manualNewsIngestion, manualNewsArchival } from "./news-cron-scheduler";
import { getArchivalStats } from "./news-archival";
import { getDb } from "./db";
import { hubNews } from "../drizzle/schema";
import { desc } from "drizzle-orm";
import {
  monitoredCronJob,
  getExecutionHistory,
  getExecutionStats,
  getMonitoringDashboard,
} from "./cron-monitoring-simple";
import { getAllSourceHealth, resetSourceHealth } from "./news/news-fetch-utils";
import { NEWS_SOURCES } from "./news-sources";
import { z } from "zod";
import { serverLogger } from "./_core/logger-wiring";
import type { PipelineMode } from "./news-pipeline-config";


// In-memory status tracking for async pipeline execution
interface PipelineStatus {
  status: "idle" | "running" | "completed" | "failed";
  startedAt?: string;
  completedAt?: string;
  result?: {
    success: boolean;
    fetched: number;
    processed: number;
    inserted: number;
    skipped: number;
    errors: string[];
    duration: number;
    mode: PipelineMode;
    maxAgeDays: number;
  };
  error?: string;
}

let pipelineStatus: PipelineStatus = { status: "idle" };

export const newsAdminRouter = router({
  /**
   * Manually trigger news ingestion pipeline (async - returns immediately)
   */
  triggerIngestion: protectedProcedure
    .input(z.object({
      mode: z.enum(['normal', 'backfill']).optional(),
    }).optional())
    .mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    // Check if already running
    if (pipelineStatus.status === "running") {
      return {
        success: false,
        message: "Pipeline is already running",
        status: pipelineStatus.status,
        startedAt: pipelineStatus.startedAt,
      };
    }

    // Start pipeline asynchronously
    pipelineStatus = {
      status: "running",
      startedAt: new Date().toISOString(),
    };

    // Run in background (don't await)
    (async () => {
      try {
        const mode = input?.mode || 'normal';
        console.log(`[news-admin] Starting async pipeline execution (mode: ${mode})...`);
        const result = await monitoredCronJob(
          "manual-news-ingestion",
          () => manualNewsIngestion({ mode }),
          3
        );
        
        pipelineStatus = {
          status: "completed",
          startedAt: pipelineStatus.startedAt,
          completedAt: new Date().toISOString(),
          result: {
            success: result.success,
            fetched: result.fetched,
            processed: result.processed,
            inserted: result.inserted,
            skipped: result.skipped,
            errors: result.errors,
            duration: result.duration,
            mode: result.mode,
            maxAgeDays: result.maxAgeDays,
          },
        };
        console.log("[news-admin] Pipeline completed successfully:", result);
      } catch (error) {
        pipelineStatus = {
          status: "failed",
          startedAt: pipelineStatus.startedAt,
          completedAt: new Date().toISOString(),
          error: error instanceof Error ? error.message : "Unknown error",
        };
        serverLogger.error("[news-admin] Pipeline failed:", error);
      }
    })();

    // Return immediately
    return {
      success: true,
      message: "Pipeline started. Check status for results.",
      status: "running",
      startedAt: pipelineStatus.startedAt,
    };
  }),

  /**
   * Get current pipeline execution status
   */
  getPipelineStatus: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    return {
      status: pipelineStatus.status,
      startedAt: pipelineStatus.startedAt,
      completedAt: pipelineStatus.completedAt,
      result: pipelineStatus.result,
      error: pipelineStatus.error,
      // Calculate elapsed time if running
      elapsedMs: pipelineStatus.startedAt && pipelineStatus.status === "running"
        ? Date.now() - new Date(pipelineStatus.startedAt).getTime()
        : undefined,
    };
  }),

  /**
   * Reset pipeline status (useful after viewing results)
   */
  resetPipelineStatus: protectedProcedure
    .input(z.object({ force: z.boolean().optional() }).optional())
    .mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    // Only reset if not running, unless forced
    if (pipelineStatus.status !== "running" || input?.force) {
      pipelineStatus = { status: "idle" };
      return { success: true, message: "Status reset" };
    }

    return { success: false, message: "Cannot reset while pipeline is running" };
  }),

  /**
   * Manually trigger news archival (async)
   */
  triggerArchival: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    try {
      const result = await monitoredCronJob(
        "manual-news-archival",
        manualNewsArchival,
        3
      );
      return {
        success: result.success,
        archived: result.archived,
        errors: result.errors,
        duration: result.duration,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Archival failed",
      });
    }
  }),

  /**
   * Get news pipeline statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    try {
      const archivalStats = await getArchivalStats();
      const db = await getDb();

      if (!db) {
        throw new Error("Database not available");
      }

      // Get recent news for preview
      const recentNews = await db
        .select()
        .from(hubNews)
        .orderBy(desc(hubNews.retrievedAt))
        .limit(5);

      return {
        archivalStats,
        recentNews,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to get stats",
      });
    }
  }),

  /**
   * Get execution history for a specific job
   */
  getExecutionHistory: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    try {
      const manualIngestion = getExecutionHistory("manual-news-ingestion", 7);
      const dailyIngestion = getExecutionHistory("daily-news-ingestion", 7);
      const weeklyArchival = getExecutionHistory("weekly-news-archival", 7);

      return {
        manualIngestion,
        dailyIngestion,
        weeklyArchival,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to get execution history",
      });
    }
  }),

  /**
   * Get source health status
   */
  getSourceHealth: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    const healthRecords = getAllSourceHealth();
    const sources = NEWS_SOURCES.filter(s => s.enabled);

    // Merge health data with source config
    const sourceStatus = sources.map(source => {
      const health = healthRecords.find(h => h.sourceId === source.id);
      return {
        id: source.id,
        name: source.name,
        type: source.type,
        enabled: source.enabled,
        credibilityScore: source.credibilityScore,
        hasRss: !!source.rssUrl,
        health: health || {
          sourceId: source.id,
          lastSuccess: null,
          lastFailure: null,
          consecutiveFailures: 0,
          totalRequests: 0,
          totalFailures: 0,
          averageResponseTime: 0,
          isHealthy: 1
        }
      };
    });

    // Calculate overall stats
    const totalSources = sources.length;
    const healthySources = sourceStatus.filter(s => s.health.isHealthy).length;
    const failingSources = sourceStatus.filter(s => !s.health.isHealthy).length;

    return {
      sources: sourceStatus,
      summary: {
        total: totalSources,
        healthy: healthySources,
        failing: failingSources,
        healthPercentage: totalSources > 0 ? Math.round((healthySources / totalSources) * 100) : 100
      }
    };
  }),

  /**
   * Reset health for a specific source
   */
  resetSourceHealthStatus: protectedProcedure
    .input(z.object({ sourceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      resetSourceHealth(input.sourceId);
      return { success: true, message: `Health reset for source: ${input.sourceId}` };
    }),

  /**
   * Get monitoring dashboard data
   */
  getMonitoringDashboard: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    try {
      const dashboard = getMonitoringDashboard();

      // Add manual ingestion stats
      const manualStats = getExecutionStats("manual-news-ingestion", 7);

      return {
        jobs: dashboard,
        manualIngestion: {
          jobName: "manual-news-ingestion",
          stats: manualStats,
          recentHistory: getExecutionHistory("manual-news-ingestion", 1).slice(
            0,
            5
          ),
        },
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to get monitoring dashboard",
      });
    }
  }),
});
