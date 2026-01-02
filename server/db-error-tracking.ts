import { getDb } from "./db";
import { errorLog } from "../drizzle/schema";
import { desc, and, gte, eq, sql } from "drizzle-orm";

type ErrorLog = typeof errorLog.$inferSelect;
type InsertErrorLog = typeof errorLog.$inferInsert;

/**
 * Database helper functions for Error Tracking
 *
 * Provides query functions for error analytics and monitoring
 */

/**
 * Track an error in the database
 */
export async function trackError(error: InsertErrorLog): Promise<ErrorLog> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [created] = await db.insert(errorLog).values(error).$returningId() as any;
  const createdId = Array.isArray(created) ? created[0]?.id : created?.id;

  const [fullEntry] = await db
    .select()
    .from(errorLog)
    .where(eq(errorLog.id, createdId));

  return fullEntry;
}

/**
 * Get error statistics for a time period
 */
export async function getErrorStats(hours: number = 24) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const [stats] = await db
    .select({
      totalErrors: sql<number>`COUNT(*)`,
      criticalCount: sql<number>`SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END)`,
      errorCount: sql<number>`SUM(CASE WHEN severity = 'error' THEN 1 ELSE 0 END)`,
      warningCount: sql<number>`SUM(CASE WHEN severity = 'warning' THEN 1 ELSE 0 END)`,
      uniqueErrors: sql<number>`COUNT(DISTINCT ${errorLog.message})`,
      errorRate: sql<number>`COUNT(*) / ${hours}`,
    })
    .from(errorLog)
    .where(gte(errorLog.timestamp, since));

  return stats || {
    totalErrors: 0,
    criticalCount: 0,
    errorCount: 0,
    warningCount: 0,
    uniqueErrors: 0,
    errorRate: 0,
  };
}

/**
 * Get recent errors with optional filtering
 */
export async function getRecentErrors(
  limit: number = 50,
  severity?: string,
  operation?: string
): Promise<ErrorLog[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const conditions = [];
  if (severity) {
    conditions.push(eq(errorLog.severity, severity));
  }
  if (operation) {
    conditions.push(eq(errorLog.operation, operation));
  }

  const query = db
    .select()
    .from(errorLog)
    .orderBy(desc(errorLog.timestamp))
    .limit(limit);

  if (conditions.length > 0) {
    return await query.where(and(...conditions));
  }

  return await query;
}

/**
 * Get error trends over time
 */
export async function getErrorTrends(hours: number = 24, interval: "hour" | "day" = "hour") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const dateFormat = interval === "hour" 
    ? sql`DATE_FORMAT(${errorLog.timestamp}, '%Y-%m-%d %H:00:00')`
    : sql`DATE_FORMAT(${errorLog.timestamp}, '%Y-%m-%d')`;

  const trends = await db
    .select({
      hour: dateFormat,
      critical: sql<number>`SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END)`,
      error: sql<number>`SUM(CASE WHEN severity = 'error' THEN 1 ELSE 0 END)`,
      warning: sql<number>`SUM(CASE WHEN severity = 'warning' THEN 1 ELSE 0 END)`,
      total: sql<number>`COUNT(*)`,
    })
    .from(errorLog)
    .where(gte(errorLog.timestamp, since))
    .groupBy(dateFormat)
    .orderBy(dateFormat);

  return trends;
}

/**
 * Get errors grouped by operation
 */
export async function getErrorsByOperation(hours: number = 24, limit: number = 20) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const byOperation = await db
    .select({
      operation: errorLog.operation,
      errorCount: sql<number>`COUNT(*)`,
      criticalCount: sql<number>`SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END)`,
      lastOccurrence: sql<string>`MAX(${errorLog.timestamp})`,
    })
    .from(errorLog)
    .where(gte(errorLog.timestamp, since))
    .groupBy(errorLog.operation)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(limit);

  return byOperation;
}

/**
 * Clean up old error logs (retention policy)
 */
export async function cleanupOldErrors(daysToKeep: number = 30): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString();

  const result = await db
    .delete(errorLog)
    .where(sql`${errorLog.timestamp} < ${cutoff}`);

  return (result as any).rowsAffected || 0;
}
