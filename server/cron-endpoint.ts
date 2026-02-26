/**
 * Simple REST endpoints for cron triggers
 * These are easier for external cron services to call than tRPC
 */

import type { Request, Response } from "express";
import { dailyNewsIngestion, weeklyNewsArchival } from "./news-cron-scheduler";
import { monitoredCronJob } from "./cron-monitoring-simple";
import { serverLogger } from "./_core/logger-wiring";
import {
  authorizeAutomationRequest,
  isAutomationAuthError,
} from "./security/automation-auth";

function firstHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function requestActor(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

async function authorizeCronRequest(
  req: Request,
  source: string
): Promise<void> {
  await authorizeAutomationRequest({
    source,
    actor: requestActor(req),
    traceId: firstHeaderValue(req.headers["x-trace-id"]),
    authorizationHeader: firstHeaderValue(req.headers.authorization),
    secret: typeof req.query.secret === "string" ? req.query.secret : undefined,
    idempotencyKey:
      firstHeaderValue(req.headers["x-idempotency-key"]) ||
      (typeof req.query.idempotencyKey === "string" ? req.query.idempotencyKey : undefined),
    requestTimestamp:
      firstHeaderValue(req.headers["x-request-timestamp"]) ||
      (typeof req.query.requestTimestamp === "string" ? req.query.requestTimestamp : undefined),
    signature:
      firstHeaderValue(req.headers["x-signature"]) ||
      (typeof req.query.signature === "string" ? req.query.signature : undefined),
  });
}

function handleAuthorizationError(res: Response, source: string, error: unknown): boolean {
  if (!isAutomationAuthError(error)) return false;

  serverLogger.warn(`[cron-endpoint] ${source} denied`, {
    code: error.code,
    category: error.category,
    status: error.status,
    message: error.message,
  });
  res.status(error.status).json({
    success: false,
    error: error.message,
    code: error.code,
    category: error.category,
  });
  return true;
}

/**
 * Daily news ingestion endpoint
 * GET /cron/daily-news-ingestion
 * Header: Authorization: Bearer <CRON_SECRET>
 * Strict mode headers: x-idempotency-key, x-request-timestamp, x-signature
 */
export async function handleDailyNewsIngestion(req: Request, res: Response) {
  try {
    await authorizeCronRequest(req, "rest.cron.daily-news-ingestion");
  } catch (error) {
    if (handleAuthorizationError(res, "daily-news-ingestion", error)) {
      return;
    }
    serverLogger.error("[cron-endpoint] Daily auth check failed unexpectedly:", error);
    res.status(500).json({
      success: false,
      error: "Authorization check failed",
    });
    return;
  }

  serverLogger.info("[cron-endpoint] Daily news ingestion triggered");

  try {
    const result = await monitoredCronJob(
      "daily-news-ingestion",
      dailyNewsIngestion,
      3 // Alert after 3 consecutive failures
    );

    res.status(200).json({
      success: true,
      message: "Daily news ingestion completed",
      stats: {
        fetched: result.fetched,
        inserted: result.inserted,
        skipped: result.skipped,
        errors: result.errors.length,
        duration: `${result.duration}ms`,
      },
    });
  } catch (error) {
    serverLogger.error("[cron-endpoint] Daily news ingestion failed:", error);

    res.status(500).json({
      success: false,
      message: "Daily news ingestion failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Weekly news archival endpoint
 * GET /cron/weekly-news-archival
 * Header: Authorization: Bearer <CRON_SECRET>
 * Strict mode headers: x-idempotency-key, x-request-timestamp, x-signature
 */
export async function handleWeeklyNewsArchival(req: Request, res: Response) {
  try {
    await authorizeCronRequest(req, "rest.cron.weekly-news-archival");
  } catch (error) {
    if (handleAuthorizationError(res, "weekly-news-archival", error)) {
      return;
    }
    serverLogger.error("[cron-endpoint] Weekly auth check failed unexpectedly:", error);
    res.status(500).json({
      success: false,
      error: "Authorization check failed",
    });
    return;
  }

  serverLogger.info("[cron-endpoint] Weekly news archival triggered");

  try {
    const result = await monitoredCronJob(
      "weekly-news-archival",
      weeklyNewsArchival,
      3 // Alert after 3 consecutive failures
    );

    res.status(200).json({
      success: true,
      message: "Weekly news archival completed",
      stats: {
        archived: result.archived,
        errors: result.errors.length,
        duration: `${result.duration}ms`,
      },
    });
  } catch (error) {
    serverLogger.error("[cron-endpoint] Weekly news archival failed:", error);

    res.status(500).json({
      success: false,
      message: "Weekly news archival failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Health check endpoint
 * GET /cron/health
 */
export function handleCronHealth(_req: Request, res: Response) {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "ISA News Cron",
  });
}
