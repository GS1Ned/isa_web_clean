/**
 * Cron Router
 * Public endpoints for scheduled tasks (news ingestion, archival)
 * These can be triggered by external cron services like cron-job.org
 */

import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { dailyNewsIngestion, weeklyNewsArchival } from "../news-cron-scheduler";
import { serverLogger } from "../_core/logger-wiring";
import {
  authorizeAutomationRequest,
  isAutomationAuthError,
} from "../security/automation-auth";

const cronAuthInput = z.object({
  secret: z.string(),
  idempotencyKey: z.string().optional(),
  requestTimestamp: z.string().optional(),
  signature: z.string().optional(),
});

function toCronAuthError(source: string, error: unknown): Error {
  if (!isAutomationAuthError(error)) {
    return error instanceof Error ? error : new Error("Automation authorization failed");
  }

  serverLogger.warn(`[cron] ${source} denied`, {
    code: error.code,
    category: error.category,
    status: error.status,
    message: error.message,
  });
  return new Error(error.message);
}

export const cronRouter = router({
  /**
   * Daily news ingestion endpoint
   * Trigger: POST /api/trpc/cron.dailyNewsIngestion
   * Body: { "secret": "your-cron-secret", "idempotencyKey"?: "...", "requestTimestamp"?: "...", "signature"?: "sha256=..." }
   */
  dailyNewsIngestion: publicProcedure
    .input(cronAuthInput)
    .mutation(async ({ input, ctx }) => {
      try {
        await authorizeAutomationRequest({
          source: "trpc.cron.dailyNewsIngestion",
          traceId: ctx.traceId,
          actor: ctx.req.ip,
          secret: input.secret,
          idempotencyKey: input.idempotencyKey,
          requestTimestamp: input.requestTimestamp,
          signature: input.signature,
        });
      } catch (error) {
        throw toCronAuthError("dailyNewsIngestion", error);
      }

      serverLogger.info("[cron] Daily news ingestion triggered via API");

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
   * Body: { "secret": "your-cron-secret", "idempotencyKey"?: "...", "requestTimestamp"?: "...", "signature"?: "sha256=..." }
   */
  weeklyNewsArchival: publicProcedure
    .input(cronAuthInput)
    .mutation(async ({ input, ctx }) => {
      try {
        await authorizeAutomationRequest({
          source: "trpc.cron.weeklyNewsArchival",
          traceId: ctx.traceId,
          actor: ctx.req.ip,
          secret: input.secret,
          idempotencyKey: input.idempotencyKey,
          requestTimestamp: input.requestTimestamp,
          signature: input.signature,
        });
      } catch (error) {
        throw toCronAuthError("weeklyNewsArchival", error);
      }

      serverLogger.info("[cron] Weekly news archival triggered via API");

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
