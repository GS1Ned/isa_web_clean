/**
 * News Cron Scheduler
 * Schedules daily news ingestion and weekly archival
 */

import { runNewsPipeline, type PipelineOptions } from "./news-pipeline";
import { archiveOldNews } from "./news-archival";
import { serverLogger } from "./_core/logger-wiring";


/**
 * Daily news ingestion job
 * Runs every day at 2 AM
 */
export async function dailyNewsIngestion() {
  console.log("[news-cron] Starting daily news ingestion...");

  try {
    const result = await runNewsPipeline({ mode: 'normal', triggeredBy: 'cron' });

    console.log("[news-cron] Daily ingestion complete:", {
      success: result.success,
      fetched: result.fetched,
      inserted: result.inserted,
      skipped: result.skipped,
      errors: result.errors.length,
      duration: `${result.duration}ms`,
    });

    // Log errors if any
    if (result.errors.length > 0) {
      serverLogger.error("[news-cron] Errors during ingestion:", result.errors);
    }

    return result;
  } catch (error) {
    serverLogger.error("[news-cron] Daily ingestion failed:", error);
    throw error;
  }
}

/**
 * Weekly archival job
 * Runs every Sunday at 3 AM
 */
export async function weeklyNewsArchival() {
  console.log("[news-cron] Starting weekly news archival...");

  try {
    const result = await archiveOldNews(200);

    console.log("[news-cron] Weekly archival complete:", {
      success: result.success,
      archived: result.archived,
      errors: result.errors.length,
      duration: `${result.duration}ms`,
    });

    // Log errors if any
    if (result.errors.length > 0) {
      serverLogger.error("[news-cron] Errors during archival:", result.errors);
    }

    return result;
  } catch (error) {
    serverLogger.error("[news-cron] Weekly archival failed:", error);
    throw error;
  }
}

/**
 * Manual trigger for testing
 * @param options Pipeline execution options
 */
export async function manualNewsIngestion(options?: PipelineOptions) {
  console.log("[news-cron] Manual news ingestion triggered", options);
  
  try {
    const result = await runNewsPipeline({
      mode: options?.mode || 'normal',
      triggeredBy: 'manual',
    });

    console.log("[news-cron] Manual ingestion complete:", {
      success: result.success,
      fetched: result.fetched,
      inserted: result.inserted,
      skipped: result.skipped,
      errors: result.errors.length,
      duration: `${result.duration}ms`,
      mode: result.mode,
      maxAgeDays: result.maxAgeDays,
    });

    return result;
  } catch (error) {
    serverLogger.error("[news-cron] Manual ingestion failed:", error);
    throw error;
  }
}

/**
 * Manual trigger for archival testing
 */
export async function manualNewsArchival() {
  console.log("[news-cron] Manual news archival triggered");
  return await weeklyNewsArchival();
}
