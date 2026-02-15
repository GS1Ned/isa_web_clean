/**
 * Simple REST endpoints for cron triggers
 * These are easier for external cron services to call than tRPC
 */

import type { Request, Response } from "express";
import { dailyNewsIngestion, weeklyNewsArchival } from "./news-cron-scheduler";
import { monitoredCronJob } from "./cron-monitoring-simple";
import { serverLogger } from "./_core/logger-wiring";


const CRON_SECRET = process.env.CRON_SECRET || "change-me-in-production";

function validateCronSecret(req: Request): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;

  // Support both "Bearer <token>" and direct token
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : authHeader;

  return token === CRON_SECRET;
}

/**
 * Daily news ingestion endpoint
 * GET /cron/daily-news-ingestion
 * Header: Authorization: Bearer <CRON_SECRET>
 */
export async function handleDailyNewsIngestion(req: Request, res: Response) {
  // Validate secret
  if (!validateCronSecret(req)) {
    res.status(401).json({
      success: false,
      error: "Unauthorized: Invalid or missing authorization token",
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
 */
export async function handleWeeklyNewsArchival(req: Request, res: Response) {
  // Validate secret
  if (!validateCronSecret(req)) {
    res.status(401).json({
      success: false,
      error: "Unauthorized: Invalid or missing authorization token",
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
export function handleCronHealth(req: Request, res: Response) {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "ISA News Cron",
  });
}
