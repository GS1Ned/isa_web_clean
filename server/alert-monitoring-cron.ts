/**
 * Alert Monitoring Cron Job
 * 
 * Runs every 5 minutes to check for alert conditions
 * and send notifications when thresholds are exceeded
 */

import { detectAllAlerts, DEFAULT_THRESHOLDS } from "./alert-detection";
import { processAlert } from "./alert-notification-service";
import { serverLogger } from "./_core/logger-wiring";


/**
 * Run alert detection and send notifications
 */
export async function runAlertMonitoring(): Promise<void> {
  serverLogger.info("[AlertMonitoring] Starting alert detection...");

  try {
    // Detect all alerts
    const alerts = await detectAllAlerts(DEFAULT_THRESHOLDS);

    if (alerts.length === 0) {
      serverLogger.info("[AlertMonitoring] No alerts detected");
      return;
    }

    serverLogger.info(`[AlertMonitoring] Detected ${alerts.length} alert(s)`);

    // Process each alert
    for (const alert of alerts) {
      serverLogger.info(`[AlertMonitoring] Processing ${alert.alertType} alert (${alert.severity}): ${alert.title}`);

      const result = await processAlert(alert);

      if (result.success) {
        serverLogger.info(`[AlertMonitoring] Alert processed successfully (ID: ${result.alertId}, Notification sent: ${result.notificationSent})`);
      } else {
        serverLogger.error(`[AlertMonitoring] Failed to process alert: ${result.error}`);
      }
    }

    serverLogger.info("[AlertMonitoring] Alert detection complete");
  } catch (error) {
    serverLogger.error("[AlertMonitoring] Error during alert detection:", error);
  }
}

/**
 * Schedule alert monitoring to run every 5 minutes
 * 
 * This function should be called from the main server startup
 */
export function scheduleAlertMonitoring(): void {
  // Run immediately on startup
  runAlertMonitoring().catch((error) => {
    serverLogger.error("[AlertMonitoring] Initial run failed:", error);
  });

  // Schedule to run every 5 minutes
  const FIVE_MINUTES = 5 * 60 * 1000;
  setInterval(() => {
    runAlertMonitoring().catch((error) => {
      serverLogger.error("[AlertMonitoring] Scheduled run failed:", error);
    });
  }, FIVE_MINUTES);

  serverLogger.info("[AlertMonitoring] Scheduled to run every 5 minutes");
}
