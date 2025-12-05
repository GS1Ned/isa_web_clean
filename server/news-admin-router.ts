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

export const newsAdminRouter = router({
  /**
   * Manually trigger news ingestion pipeline
   */
  triggerIngestion: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    }

    try {
      const result = await manualNewsIngestion();
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
   * Manually trigger news archival
   */
  triggerArchival: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    }

    try {
      const result = await manualNewsArchival();
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
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
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
});
