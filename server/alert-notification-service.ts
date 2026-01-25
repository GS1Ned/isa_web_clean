/**
 * Alert Notification Service
 * 
 * Sends alert notifications via email and tracks alert history
 */

import { getDb } from "./db";
import { alertHistory, alertCooldowns } from "../drizzle/schema";
import { notifyOwner } from "./_core/notification";
import { broadcastAlert, AlertPayload } from "./webhook-notification-service";
import {
  AlertDetectionResult,
  AlertType,
  AlertSeverity,
  createCooldown,
  DEFAULT_THRESHOLDS,
} from "./alert-detection";
import { desc, eq, and, isNull } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";


/**
 * Alert notification result
 */
export interface AlertNotificationResult {
  success: boolean;
  alertId: number;
  notificationSent: boolean;
  error?: string;
}

/**
 * Format alert email subject line
 */
function formatEmailSubject(alert: AlertDetectionResult): string {
  const severityLabel = alert.severity.toUpperCase();
  return `[ISA Alert - ${severityLabel}] ${alert.title}`;
}

/**
 * Format alert email body
 */
function formatEmailBody(alert: AlertDetectionResult, dashboardUrl: string): string {
  const lines = [
    "ISA Monitoring Alert",
    "",
    `Alert Type: ${alert.alertType.replace(/_/g, " ").toUpperCase()}`,
    `Severity: ${alert.severity.toUpperCase()}`,
    `Time: ${new Date().toISOString()}`,
    "",
    alert.message,
    "",
    "Details:",
  ];

  // Format metadata as key-value pairs
  for (const [key, value] of Object.entries(alert.metadata)) {
    if (typeof value === "object" && value !== null) {
      lines.push(`  ${key}:`);
      for (const [subKey, subValue] of Object.entries(value)) {
        lines.push(`    ${subKey}: ${JSON.stringify(subValue)}`);
      }
    } else {
      lines.push(`  ${key}: ${value}`);
    }
  }

  lines.push("");
  lines.push(`View Dashboard: ${dashboardUrl}`);
  lines.push("");
  lines.push("---");
  lines.push("This is an automated alert from ISA System Monitoring.");

  return lines.join("\n");
}

/**
 * Send alert notification via email
 */
async function sendAlertEmail(alert: AlertDetectionResult): Promise<boolean> {
  try {
    const dashboardUrl = `${process.env.VITE_APP_URL || "https://isa.manus.space"}/admin/system-monitoring`;
    const subject = formatEmailSubject(alert);
    const body = formatEmailBody(alert, dashboardUrl);

    const success = await notifyOwner({
      title: subject,
      content: body,
    });

    return success;
  } catch (error) {
    serverLogger.error("[AlertNotification] Failed to send email:", error);
    return false;
  }
}

/**
 * Save alert to history
 */
async function saveAlertHistory(
  alert: AlertDetectionResult,
  notificationSent: boolean
): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(alertHistory).values({
    alertType: alert.alertType,
    severity: alert.severity,
    title: alert.title,
    message: alert.message,
    metadata: JSON.stringify(alert.metadata),
    notificationSent: notificationSent ? 1 : 0,
  });

  // Get the inserted ID from the result
  const insertId = (result as any).insertId || (result as any)[0]?.insertId;
  
  if (!insertId) {
    // Fallback: query for the most recent alert
    const [latest] = await db
      .select({ id: alertHistory.id })
      .from(alertHistory)
      .orderBy(desc(alertHistory.createdAt))
      .limit(1);
    return latest?.id || 0;
  }
  
  return insertId;
}

/**
 * Process and send alert notification
 * 
 * This function:
 * 1. Saves alert to history
 * 2. Sends email notification
 * 3. Creates cooldown to prevent duplicate alerts
 */
export async function processAlert(
  alert: AlertDetectionResult
): Promise<AlertNotificationResult> {
  try {
    // Send email notification
    const notificationSent = await sendAlertEmail(alert);

    // Send webhook notifications (Slack/Teams)
    const webhookPayload: AlertPayload = {
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      timestamp: new Date(),
      details: alert.metadata,
      actionUrl: `${process.env.VITE_APP_URL || "https://isa.manus.space"}/admin/system-monitoring`,
    };
    
    try {
      await broadcastAlert(webhookPayload);
    } catch (webhookError) {
      serverLogger.error("[AlertNotification] Webhook broadcast failed:", webhookError);
      // Continue processing even if webhook fails
    }

    // Save to alert history
    const alertId = await saveAlertHistory(alert, notificationSent);

    // Create cooldown to prevent duplicate alerts
    const cooldownMinutes = getCooldownMinutes(alert.alertType);
    const alertKey = getAlertKey(alert);
    await createCooldown(alert.alertType, alertKey, cooldownMinutes);

    return {
      success: true,
      alertId,
      notificationSent,
    };
  } catch (error) {
    serverLogger.error("[AlertNotification] Failed to process alert:", error);
    return {
      success: false,
      alertId: -1,
      notificationSent: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get cooldown duration for alert type
 */
function getCooldownMinutes(alertType: AlertType): number {
  switch (alertType) {
    case "error_rate":
      return DEFAULT_THRESHOLDS.errorRate.cooldownMinutes;
    case "critical_error":
      return DEFAULT_THRESHOLDS.criticalErrors.cooldownMinutes;
    case "performance_degradation":
      return DEFAULT_THRESHOLDS.performanceDegradation.cooldownMinutes;
    default:
      return 60; // Default 1 hour
  }
}

/**
 * Get alert key for cooldown tracking
 */
function getAlertKey(alert: AlertDetectionResult): string {
  if (alert.alertType === "performance_degradation") {
    return `${alert.alertType}:${alert.metadata.operation}`;
  }
  return alert.alertType;
}

/**
 * Get recent alert history
 */
export async function getAlertHistory(
  limit: number = 50,
  filterType?: AlertType,
  filterSeverity?: AlertSeverity,
  unacknowledgedOnly: boolean = false
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  let query = db.select().from(alertHistory);

  const conditions = [];
  if (filterType) {
    conditions.push(eq(alertHistory.alertType, filterType));
  }
  if (filterSeverity) {
    conditions.push(eq(alertHistory.severity, filterSeverity));
  }
  if (unacknowledgedOnly) {
    conditions.push(isNull(alertHistory.acknowledgedAt));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const results = await query.orderBy(desc(alertHistory.createdAt)).limit(limit);

  return results.map((row) => ({
    ...row,
    metadata: typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata,
  }));
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(alertId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db
      .update(alertHistory)
      .set({
        acknowledgedAt: new Date().toISOString(),
        acknowledgedBy: userId,
      })
      .where(eq(alertHistory.id, alertId));

    return true;
  } catch (error) {
    serverLogger.error("[AlertNotification] Failed to acknowledge alert:", error);
    return false;
  }
}

/**
 * Get unacknowledged alert count
 */
export async function getUnacknowledgedCount(): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const results = await db
    .select()
    .from(alertHistory)
    .where(isNull(alertHistory.acknowledgedAt));

  return results.length;
}
