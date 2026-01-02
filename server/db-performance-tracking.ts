import { getDb } from "./db";
import { performanceLog } from "../drizzle/schema";
import { desc, and, gte, eq, sql, lte } from "drizzle-orm";

type PerformanceLog = typeof performanceLog.$inferSelect;
type InsertPerformanceLog = typeof performanceLog.$inferInsert;

/**
 * Database helper functions for Performance Tracking
 *
 * Provides query functions for performance analytics and monitoring
 */

/**
 * Track a performance metric in the database
 */
export async function trackPerformance(perf: InsertPerformanceLog): Promise<PerformanceLog> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [created] = await db.insert(performanceLog).values(perf).$returningId() as any;
  const createdId = Array.isArray(created) ? created[0]?.id : created?.id;

  const [fullEntry] = await db
    .select()
    .from(performanceLog)
    .where(eq(performanceLog.id, createdId));

  return fullEntry;
}

/**
 * Get performance statistics for a time period
 */
export async function getPerformanceStats(hours: number = 24) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const [stats] = await db
    .select({
      totalOperations: sql<number>`COUNT(*)`,
      avgDuration: sql<number>`AVG(duration)`,
      minDuration: sql<number>`MIN(duration)`,
      maxDuration: sql<number>`MAX(duration)`,
      p50Duration: sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration)`,
      p95Duration: sql<number>`PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration)`,
      p99Duration: sql<number>`PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration)`,
      successRate: sql<number>`(SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*))`,
    })
    .from(performanceLog)
    .where(gte(performanceLog.timestamp, since));

  return stats || {
    totalOperations: 0,
    avgDuration: 0,
    minDuration: 0,
    maxDuration: 0,
    p50Duration: 0,
    p95Duration: 0,
    p99Duration: 0,
    successRate: 100,
  };
}

/**
 * Get slow operations (above threshold)
 */
export async function getSlowOperations(
  threshold: number = 1000,
  limit: number = 20
): Promise<PerformanceLog[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db
    .select()
    .from(performanceLog)
    .where(gte(performanceLog.duration, threshold))
    .orderBy(desc(performanceLog.duration))
    .limit(limit);
}

/**
 * Get performance trends over time
 */
export async function getPerformanceTrends(hours: number = 24, interval: "hour" | "day" = "hour") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const dateFormat = interval === "hour" 
    ? sql`DATE_FORMAT(${performanceLog.timestamp}, '%Y-%m-%d %H:00:00')`
    : sql`DATE_FORMAT(${performanceLog.timestamp}, '%Y-%m-%d')`;

  const trends = await db
    .select({
      hour: dateFormat,
      avgDuration: sql<number>`AVG(duration)`,
      minDuration: sql<number>`MIN(duration)`,
      maxDuration: sql<number>`MAX(duration)`,
      operationCount: sql<number>`COUNT(*)`,
      successRate: sql<number>`(SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*))`,
    })
    .from(performanceLog)
    .where(gte(performanceLog.timestamp, since))
    .groupBy(dateFormat)
    .orderBy(dateFormat);

  return trends;
}

/**
 * Get performance by operation
 */
export async function getPerformanceByOperation(hours: number = 24, limit: number = 20) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const byOperation = await db
    .select({
      operation: performanceLog.operation,
      avgDuration: sql<number>`AVG(duration)`,
      maxDuration: sql<number>`MAX(duration)`,
      operationCount: sql<number>`COUNT(*)`,
      successRate: sql<number>`(SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*))`,
    })
    .from(performanceLog)
    .where(gte(performanceLog.timestamp, since))
    .groupBy(performanceLog.operation)
    .orderBy(sql`AVG(duration) DESC`)
    .limit(limit);

  return byOperation;
}

/**
 * Clean up old performance logs (retention policy)
 */
export async function cleanupOldPerformanceLogs(daysToKeep: number = 30): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString();

  const result = await db
    .delete(performanceLog)
    .where(sql`${performanceLog.timestamp} < ${cutoff}`);

  return (result as any).rowsAffected || 0;
}
