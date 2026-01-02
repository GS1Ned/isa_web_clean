/**
 * Alert Detection Module
 * 
 * Monitors error rates, critical errors, and performance degradation
 * to trigger alerts when thresholds are exceeded.
 */

import { getDb } from "./db";
import { errorLog, performanceLog, alertCooldowns } from "../drizzle/schema";
import { and, eq, gt, gte, sql } from "drizzle-orm";

/**
 * Alert severity levels
 */
export type AlertSeverity = "info" | "warning" | "critical";

/**
 * Alert types
 */
export type AlertType = "error_rate" | "critical_error" | "performance_degradation";

/**
 * Alert detection result
 */
export interface AlertDetectionResult {
  shouldAlert: boolean;
  alertType: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  metadata: Record<string, any>;
}

/**
 * Alert configuration thresholds
 */
export interface AlertThresholds {
  errorRate: {
    warningPerHour: number;
    criticalPerHour: number;
    cooldownMinutes: number;
  };
  criticalErrors: {
    countThreshold: number;
    timeWindowMinutes: number;
    cooldownMinutes: number;
  };
  performanceDegradation: {
    warningMultiplier: number;
    criticalMultiplier: number;
    cooldownMinutes: number;
  };
}

/**
 * Default alert thresholds
 */
export const DEFAULT_THRESHOLDS: AlertThresholds = {
  errorRate: {
    warningPerHour: 10,
    criticalPerHour: 50,
    cooldownMinutes: 60,
  },
  criticalErrors: {
    countThreshold: 5,
    timeWindowMinutes: 15,
    cooldownMinutes: 30,
  },
  performanceDegradation: {
    warningMultiplier: 2.0,
    criticalMultiplier: 5.0,
    cooldownMinutes: 60,
  },
};

/**
 * Check if an alert is currently in cooldown
 */
export async function isInCooldown(alertType: AlertType, alertKey: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const results = await db
    .select()
    .from(alertCooldowns)
    .where(
      and(
        eq(alertCooldowns.alertType, alertType),
        eq(alertCooldowns.alertKey, alertKey),
        gt(alertCooldowns.expiresAt, sql`NOW()`)
      )
    )
    .limit(1);
  return results.length > 0;
}

/**
 * Create a cooldown record to prevent duplicate alerts
 */
export async function createCooldown(
  alertType: AlertType,
  alertKey: string,
  durationMinutes: number
): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);

  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(alertCooldowns).values({
    alertType,
    alertKey,
    lastTriggeredAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });
}

/**
 * Check error rate thresholds
 * Counts errors in the last hour and compares against thresholds
 */
export async function checkErrorRateThreshold(
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): Promise<AlertDetectionResult | null> {
  const alertKey = "error_rate";

  // Check cooldown
  if (await isInCooldown("error_rate", alertKey)) {
    return null;
  }

  // Count errors in the last hour
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const result = await db
    .select({
      total: sql<number>`COUNT(*)`,
      critical: sql<number>`SUM(CASE WHEN ${errorLog.severity} = 'critical' THEN 1 ELSE 0 END)`,
      error: sql<number>`SUM(CASE WHEN ${errorLog.severity} = 'error' THEN 1 ELSE 0 END)`,
      warning: sql<number>`SUM(CASE WHEN ${errorLog.severity} = 'warning' THEN 1 ELSE 0 END)`,
    })
    .from(errorLog)
    .where(gte(errorLog.timestamp, oneHourAgo.toISOString()));

  const errorCount = Number(result[0]?.total || 0);
  const criticalCount = Number(result[0]?.critical || 0);
  const errorSeverityCount = Number(result[0]?.error || 0);
  const warningCount = Number(result[0]?.warning || 0);

  // Determine severity
  let severity: AlertSeverity | null = null;
  if (errorCount >= thresholds.errorRate.criticalPerHour) {
    severity = "critical";
  } else if (errorCount >= thresholds.errorRate.warningPerHour) {
    severity = "warning";
  }

  if (!severity) {
    return null;
  }

  // Get top operations by error count
  const topOperations = await db
    .select({
      operation: errorLog.operation,
      count: sql<number>`COUNT(*)`,
    })
    .from(errorLog)
    .where(gte(errorLog.timestamp, oneHourAgo.toISOString()))
    .groupBy(errorLog.operation)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(3);

  return {
    shouldAlert: true,
    alertType: "error_rate",
    severity,
    title: `High Error Rate Detected: ${errorCount} errors in the last hour`,
    message: `ISA has recorded ${errorCount} errors in the last hour, exceeding the ${
      severity === "critical" ? "critical" : "warning"
    } threshold of ${
      severity === "critical"
        ? thresholds.errorRate.criticalPerHour
        : thresholds.errorRate.warningPerHour
    } errors/hour.`,
    metadata: {
      errorCount,
      errorRate: errorCount,
      breakdown: {
        critical: criticalCount,
        error: errorSeverityCount,
        warning: warningCount,
      },
      topOperations: topOperations.map((op: any) => ({
        operation: op.operation,
        count: Number(op.count),
      })),
      threshold:
        severity === "critical"
          ? thresholds.errorRate.criticalPerHour
          : thresholds.errorRate.warningPerHour,
    },
  };
}

/**
 * Check critical error thresholds
 * Counts critical errors in a short time window
 */
export async function checkCriticalErrorThreshold(
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): Promise<AlertDetectionResult | null> {
  const alertKey = "critical_error";

  // Check cooldown
  if (await isInCooldown("critical_error", alertKey)) {
    return null;
  }

  // Count critical errors in the time window
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const windowStart = new Date(
    Date.now() - thresholds.criticalErrors.timeWindowMinutes * 60 * 1000
  );
  const result = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(errorLog)
    .where(
      and(
        eq(errorLog.severity, "critical"),
        gte(errorLog.timestamp, windowStart.toISOString())
      )
    );

  const criticalCount = Number(result[0]?.count || 0);

  if (criticalCount < thresholds.criticalErrors.countThreshold) {
    return null;
  }

  // Get affected operations
  const operations = await db
    .select({
      operation: errorLog.operation,
      count: sql<number>`COUNT(*)`,
      latestMessage: sql<string>`MAX(${errorLog.message})`,
    })
    .from(errorLog)
    .where(
      and(
        eq(errorLog.severity, "critical"),
        gte(errorLog.timestamp, windowStart.toISOString())
      )
    )
    .groupBy(errorLog.operation)
    .orderBy(sql`COUNT(*) DESC`);

  return {
    shouldAlert: true,
    alertType: "critical_error",
    severity: "critical",
    title: `Critical Error Spike: ${criticalCount} critical errors in ${thresholds.criticalErrors.timeWindowMinutes} minutes`,
    message: `ISA has recorded ${criticalCount} critical errors in the last ${thresholds.criticalErrors.timeWindowMinutes} minutes, exceeding the threshold of ${thresholds.criticalErrors.countThreshold}.`,
    metadata: {
      criticalCount,
      timeWindowMinutes: thresholds.criticalErrors.timeWindowMinutes,
      threshold: thresholds.criticalErrors.countThreshold,
      affectedOperations: operations.map((op: any) => ({
        operation: op.operation,
        count: Number(op.count),
        latestMessage: op.latestMessage,
      })),
    },
  };
}

/**
 * Check performance degradation thresholds
 * Compares current p95 duration against 7-day baseline
 */
export async function checkPerformanceDegradation(
  operation: string,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): Promise<AlertDetectionResult | null> {
  const alertKey = `performance_degradation:${operation}`;

  // Check cooldown
  if (await isInCooldown("performance_degradation", alertKey)) {
    return null;
  }

  // Calculate 7-day baseline (p95 duration)
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Calculate p95 using MySQL-compatible percentile approximation
  const baselineResult = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(performanceLog)
    .where(
      and(
        eq(performanceLog.operation, operation),
        gte(performanceLog.timestamp, sevenDaysAgo.toISOString()),
        sql`${performanceLog.timestamp} < ${oneDayAgo.toISOString()}`
      )
    );

  const baselineSampleCount = Number(baselineResult[0]?.count || 0);

  // Need at least 100 samples for reliable baseline
  if (baselineSampleCount < 100) {
    return null;
  }

  // Get all durations for p95 calculation
  const baselineDurations = await db
    .select({ duration: performanceLog.duration })
    .from(performanceLog)
    .where(
      and(
        eq(performanceLog.operation, operation),
        gte(performanceLog.timestamp, sevenDaysAgo.toISOString()),
        sql`${performanceLog.timestamp} < ${oneDayAgo.toISOString()}`
      )
    )
    .orderBy(performanceLog.duration);

  const p95Index = Math.floor(baselineDurations.length * 0.95);
  const baselineP95 = baselineDurations[p95Index]?.duration || 0;



  // Calculate current p95 (last hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  // Get current durations
  const currentDurations = await db
    .select({ 
      duration: performanceLog.duration,
      success: performanceLog.success,
    })
    .from(performanceLog)
    .where(
      and(
        eq(performanceLog.operation, operation),
        gte(performanceLog.timestamp, oneHourAgo.toISOString())
      )
    )
    .orderBy(performanceLog.duration);

  if (currentDurations.length === 0) {
    return null;
  }

  const currentP95Index = Math.floor(currentDurations.length * 0.95);
  const currentP95 = currentDurations[currentP95Index]?.duration || 0;
  
  const successCount = currentDurations.filter(d => d.success === 1).length;
  const successRate = (successCount / currentDurations.length) * 100;



  // Determine severity
  let severity: AlertSeverity | null = null;
  const multiplier = currentP95 / baselineP95;

  if (multiplier >= thresholds.performanceDegradation.criticalMultiplier) {
    severity = "critical";
  } else if (multiplier >= thresholds.performanceDegradation.warningMultiplier) {
    severity = "warning";
  }

  if (!severity) {
    return null;
  }

  return {
    shouldAlert: true,
    alertType: "performance_degradation",
    severity,
    title: `Performance Degradation: ${operation}`,
    message: `Operation "${operation}" is experiencing ${multiplier.toFixed(
      1
    )}x slower performance than baseline (p95: ${currentP95}ms vs ${baselineP95}ms baseline).`,
    metadata: {
      operation,
      currentP95,
      baselineP95,
      multiplier: parseFloat(multiplier.toFixed(2)),
      successRate: parseFloat(successRate.toFixed(2)),
      threshold:
        severity === "critical"
          ? thresholds.performanceDegradation.criticalMultiplier
          : thresholds.performanceDegradation.warningMultiplier,
    },
  };
}

/**
 * Run all alert detection checks
 * Returns array of alerts that should be triggered
 */
export async function detectAllAlerts(
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): Promise<AlertDetectionResult[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const alerts: AlertDetectionResult[] = [];

  // Check error rate
  const errorRateAlert = await checkErrorRateThreshold(thresholds);
  if (errorRateAlert) {
    alerts.push(errorRateAlert);
  }

  // Check critical errors
  const criticalErrorAlert = await checkCriticalErrorThreshold(thresholds);
  if (criticalErrorAlert) {
    alerts.push(criticalErrorAlert);
  }

  // Check performance degradation for top operations
  const recentOperations = await db
    .selectDistinct({ operation: performanceLog.operation })
    .from(performanceLog)
    .where(gte(performanceLog.timestamp, new Date(Date.now() - 60 * 60 * 1000).toISOString()))
    .limit(10);

  for (const { operation } of recentOperations) {
    const perfAlert = await checkPerformanceDegradation(operation, thresholds);
    if (perfAlert) {
      alerts.push(perfAlert);
    }
  }

  return alerts;
}
