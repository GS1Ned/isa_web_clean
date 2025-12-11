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

/**
 * Setup all cron jobs
 */
export function setupCronJobs() {
  console.log("🕐 Setting up cron jobs for ESG Hub...");

  // Daily news ingestion at 2 AM (Playwright + RSS)
  // Format: minute hour day month dayOfWeek
  cron.schedule("0 2 * * *", async () => {
    console.log("📰 Running daily news ingestion (Playwright + RSS)...");
    try {
      await dailyNewsIngestion();
    } catch (error) {
      console.error("Error running news ingestion:", error);
    }
  });

  // Regulation change scanning at 3 AM (after RSS aggregation)
  cron.schedule("0 3 * * *", async () => {
    console.log("🔍 Scanning for regulation changes...");
    try {
      const result = await scanForRegulationChanges();
      console.log(
        `✓ Scan complete: ${result.scanned} regulations scanned, ${result.changesFound} changes found, ${result.usersNotified} users notified`
      );
    } catch (error) {
      console.error("Error scanning for changes:", error);
    }
  });

  // Daily digest emails at 8 AM
  cron.schedule("0 8 * * *", async () => {
    console.log("📧 Sending daily digest emails...");
    try {
      const count = await sendDailyDigests();
      console.log(`✓ Sent ${count} daily digests`);
    } catch (error) {
      console.error("Error sending daily digests:", error);
    }
  });

  // Process pending alerts at 9 AM
  cron.schedule("0 9 * * *", async () => {
    console.log("⏰ Processing pending alerts...");
    try {
      const result = await processPendingAlerts(7);
      console.log(
        `✓ Processed alerts: ${result.sent} sent, ${result.failed} failed`
      );
    } catch (error) {
      console.error("Error processing alerts:", error);
    }
  });

  // Weekly summary report on Monday at 10 AM
  cron.schedule("0 10 * * 1", async () => {
    console.log("📊 Generating weekly summary report...");
    try {
      const result = await scanForRegulationChanges();
      console.log(
        `✓ Weekly report: ${result.changesFound} changes detected this week`
      );
    } catch (error) {
      console.error("Error generating weekly report:", error);
    }
  });

  console.log("✅ Cron jobs configured:");
  console.log("  - 2:00 AM: Daily news ingestion (Playwright + RSS)");
  console.log("  - 3:00 AM: Regulation change scanning");
  console.log("  - 8:00 AM: Daily digest emails");
  console.log("  - 9:00 AM: Process pending alerts");
  console.log("  - 10:00 AM (Mon): Weekly summary report");
}

/**
 * Stop all cron jobs (for graceful shutdown)
 */
export function stopCronJobs() {
  console.log("🛑 Stopping all cron jobs...");
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
