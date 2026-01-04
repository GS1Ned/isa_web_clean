/**
 * Cron Router
 * Public endpoints for scheduled tasks (news ingestion, archival)
 * These can be triggered by external cron services like cron-job.org
 */

import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { dailyNewsIngestion, weeklyNewsArchival } from "../news-cron-scheduler";
import { serverLogger } from "../_core/logger-wiring";


/**
 * Simple secret token validation
 * Set CRON_SECRET in environment variables
 */
const CRON_SECRET = process.env.CRON_SECRET || "change-me-in-production";

function validateCronSecret(token: string | undefined): boolean {
  if (!token) return false;
  return token === CRON_SECRET;
}

export const cronRouter = router({
  /**
   * Daily news ingestion endpoint
   * Trigger: POST /api/trpc/cron.dailyNewsIngestion
   * Body: { "secret": "your-cron-secret" }
   */
  dailyNewsIngestion: publicProcedure
    .input(z.object({ secret: z.string() }))
    .mutation(async ({ input }) => {
      // Validate secret token
      if (!validateCronSecret(input.secret)) {
        throw new Error("Unauthorized: Invalid cron secret");
      }

      console.log("[cron] Daily news ingestion triggered via API");

      try {
        const result = await dailyNewsIngestion();
        return {
          success: true,
          message: "Daily news ingestion completed",
          stats: {
            fetched: result.fetched,
            inserted: result.inserted,
            skipped: result.skipped,
            errors: result.errors.length,
            duration: `${result.duration}ms`,
          },
        };
      } catch (error) {
        serverLogger.error("[cron] Daily news ingestion failed:", error);
        return {
          success: false,
          message: "Daily news ingestion failed",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Weekly news archival endpoint
   * Trigger: POST /api/trpc/cron.weeklyNewsArchival
   * Body: { "secret": "your-cron-secret" }
   */
  weeklyNewsArchival: publicProcedure
    .input(z.object({ secret: z.string() }))
    .mutation(async ({ input }) => {
      // Validate secret token
      if (!validateCronSecret(input.secret)) {
        throw new Error("Unauthorized: Invalid cron secret");
      }

      console.log("[cron] Weekly news archival triggered via API");

      try {
        const result = await weeklyNewsArchival();
        return {
          success: true,
          message: "Weekly news archival completed",
          stats: {
            archived: result.archived,
            errors: result.errors.length,
            duration: `${result.duration}ms`,
          },
        };
      } catch (error) {
        serverLogger.error("[cron] Weekly news archival failed:", error);
        return {
          success: false,
          message: "Weekly news archival failed",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Health check endpoint for cron services
   * Trigger: GET /api/trpc/cron.health
   */
  health: publicProcedure.query(() => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "ISA News Cron",
    };
  }),
});
