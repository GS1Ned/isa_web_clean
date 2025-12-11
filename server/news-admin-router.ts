/**
 * News Admin Router
 * Admin-only procedures for managing news pipeline
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

export const newsAdminRouter = router({
  /**
   * Manually trigger news ingestion pipeline (with monitoring)
   */
  triggerIngestion: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    try {
      const result = await monitoredCronJob(
        "manual-news-ingestion",
        manualNewsIngestion,
        3
      );
      return {
        success: result.success,
        fetched: result.fetched,
        processed: result.processed,
        inserted: result.inserted,
        skipped: result.skipped,
        errors: result.errors,
        duration: result.duration,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Ingestion failed",
      });
    }
  }),

  /**
   * Manually trigger news archival (with monitoring)
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
