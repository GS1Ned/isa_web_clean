/**
 * Cron Job Scheduler for ESG Hub
 * Handles daily RSS aggregation, change detection, and email notifications
 *
 * Usage: Import and call setupCronJobs() in your server initialization
 */

import cron from "node-cron";
import { scanForRegulationChanges } from "./regulation-change-tracker";
import { sendDailyDigests, processPendingAlerts } from "./email-notifications";
import { dailyNewsIngestion } from "./news-cron-scheduler";
import { serverLogger } from "./_core/logger-wiring";


/**
 * Setup all cron jobs
 */
export function setupCronJobs() {
  serverLogger.info("🕐 Setting up cron jobs for ESG Hub...");

  // Daily news ingestion at 2 AM (Playwright + RSS)
  // Format: minute hour day month dayOfWeek
  cron.schedule("0 2 * * *", async () => {
    serverLogger.info("📰 Running daily news ingestion (Playwright + RSS)...");
    try {
      await dailyNewsIngestion();
    } catch (error) {
      serverLogger.error("Error running news ingestion:", error);
    }
  });

  // Regulation change scanning at 3 AM (after RSS aggregation)
  cron.schedule("0 3 * * *", async () => {
    serverLogger.info("🔍 Scanning for regulation changes...");
    try {
      const result = await scanForRegulationChanges();
      serverLogger.info(`✓ Scan complete: ${result.scanned} regulations scanned, ${result.changesFound} changes found, ${result.usersNotified} users notified`);
    } catch (error) {
      serverLogger.error("Error scanning for changes:", error);
    }
  });

  // Daily digest emails at 8 AM
  cron.schedule("0 8 * * *", async () => {
    serverLogger.info("📧 Sending daily digest emails...");
    try {
      const count = await sendDailyDigests();
      serverLogger.info(`✓ Sent ${count} daily digests`);
    } catch (error) {
      serverLogger.error("Error sending daily digests:", error);
    }
  });

  // Process pending alerts at 9 AM
  cron.schedule("0 9 * * *", async () => {
    serverLogger.info("⏰ Processing pending alerts...");
    try {
      const result = await processPendingAlerts(7);
      serverLogger.info(`✓ Processed alerts: ${result.sent} sent, ${result.failed} failed`);
    } catch (error) {
      serverLogger.error("Error processing alerts:", error);
    }
  });

  // Weekly summary report on Monday at 10 AM
  cron.schedule("0 10 * * 1", async () => {
    serverLogger.info("📊 Generating weekly summary report...");
    try {
      const result = await scanForRegulationChanges();
      serverLogger.info(`✓ Weekly report: ${result.changesFound} changes detected this week`);
    } catch (error) {
      serverLogger.error("Error generating weekly report:", error);
    }
  });

  serverLogger.info("✅ Cron jobs configured:");
  serverLogger.info("  - 2:00 AM: Daily news ingestion (Playwright + RSS)");
  serverLogger.info("  - 3:00 AM: Regulation change scanning");
  serverLogger.info("  - 8:00 AM: Daily digest emails");
  serverLogger.info("  - 9:00 AM: Process pending alerts");
  serverLogger.info("  - 10:00 AM (Mon): Weekly summary report");
}

/**
 * Stop all cron jobs (for graceful shutdown)
 */
export function stopCronJobs() {
  serverLogger.info("🛑 Stopping all cron jobs...");
  cron.getTasks().forEach((task: any) => {
    if (task && typeof task.stop === "function") {
      task.stop();
    }
  });
}

/**
 * Get status of all cron jobs
 */
export function getCronJobStatus() {
  const tasks = cron.getTasks();
  return {
    totalJobs: tasks.size,
    activeJobs: Array.from(tasks).filter((task: any) => task && !task.stopped)
      .length,
    stoppedJobs: Array.from(tasks).filter((task: any) => task && task.stopped)
      .length,
  };
}
