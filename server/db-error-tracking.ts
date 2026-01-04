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

  // Filter out null values to avoid MySQL text() field issues
  const cleanedError = Object.fromEntries(
    Object.entries(error).filter(([_, v]) => v !== null)
  ) as InsertErrorLog;

  const [created] = await db.insert(errorLog).values(cleanedError).$returningId() as any;
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

  if (!stats) {
    return {
      totalErrors: 0,
      criticalCount: 0,
      errorCount: 0,
      warningCount: 0,
      uniqueErrors: 0,
      errorRate: 0,
    };
  }

  // Convert string values to numbers (MySQL returns strings for aggregates)
  return {
    totalErrors: Number(stats.totalErrors) || 0,
    criticalCount: Number(stats.criticalCount) || 0,
    errorCount: Number(stats.errorCount) || 0,
    warningCount: Number(stats.warningCount) || 0,
    uniqueErrors: Number(stats.uniqueErrors) || 0,
    errorRate: Number(stats.errorRate) || 0,
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
    // Cast to enum type to satisfy Drizzle ORM type checking
    conditions.push(eq(errorLog.severity, severity as "critical" | "error" | "warning" | "info"));
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

  // Use raw SQL to satisfy MySQL's only_full_group_by mode
  const dateFormatPattern = interval === "hour" 
    ? '%Y-%m-%d %H:00:00'
    : '%Y-%m-%d';

  const query = sql`
    SELECT 
      DATE_FORMAT(${errorLog.timestamp}, ${dateFormatPattern}) as hour,
      SUM(CASE WHEN ${errorLog.severity} = 'critical' THEN 1 ELSE 0 END) as criticalCount,
      SUM(CASE WHEN ${errorLog.severity} = 'error' THEN 1 ELSE 0 END) as errorCount,
      SUM(CASE WHEN ${errorLog.severity} = 'warning' THEN 1 ELSE 0 END) as warningCount,
      COUNT(*) as total
    FROM ${errorLog}
    WHERE ${errorLog.timestamp} >= ${since}
    GROUP BY hour
    ORDER BY hour
  `;

  const result = await db.execute(query);
  
  // db.execute() returns [rows, fields], we want just the rows
  const rows = Array.isArray(result[0]) ? result[0] : result;
  
  // Convert string values to numbers (MySQL returns strings for aggregates)
  return rows.map((row: any) => ({
    hour: row.hour,
    criticalCount: Number(row.criticalCount) || 0,
    errorCount: Number(row.errorCount) || 0,
    warningCount: Number(row.warningCount) || 0,
    total: Number(row.total) || 0,
  }));
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
      lastError: sql<Date>`MAX(${errorLog.timestamp})`,
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
