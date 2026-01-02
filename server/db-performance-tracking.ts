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

  // MySQL doesn't have PERCENTILE_CONT, use subquery approximation
  const [stats] = await db
    .select({
      totalOperations: sql<number>`COUNT(*)`,
      avgDuration: sql<number>`AVG(duration)`,
      minDuration: sql<number>`MIN(duration)`,
      maxDuration: sql<number>`MAX(duration)`,
      successRate: sql<number>`(SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*))`,
    })
    .from(performanceLog)
    .where(gte(performanceLog.timestamp, since));

  if (!stats) {
    return {
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

  // Calculate percentiles using ORDER BY LIMIT approach
  const totalCount = Number(stats.totalOperations) || 0;
  
  let p50 = 0, p95 = 0, p99 = 0;
  
  if (totalCount > 0) {
    const p50Offset = Math.floor(totalCount * 0.5);
    const p95Offset = Math.floor(totalCount * 0.95);
    const p99Offset = Math.floor(totalCount * 0.99);

    const [p50Row] = await db
      .select({ duration: performanceLog.duration })
      .from(performanceLog)
      .where(gte(performanceLog.timestamp, since))
      .orderBy(performanceLog.duration)
      .limit(1)
      .offset(p50Offset);
    
    const [p95Row] = await db
      .select({ duration: performanceLog.duration })
      .from(performanceLog)
      .where(gte(performanceLog.timestamp, since))
      .orderBy(performanceLog.duration)
      .limit(1)
      .offset(p95Offset);
    
    const [p99Row] = await db
      .select({ duration: performanceLog.duration })
      .from(performanceLog)
      .where(gte(performanceLog.timestamp, since))
      .orderBy(performanceLog.duration)
      .limit(1)
      .offset(p99Offset);

    p50 = p50Row?.duration || 0;
    p95 = p95Row?.duration || 0;
    p99 = p99Row?.duration || 0;
  }

  // Convert string values to numbers (MySQL returns strings for aggregates)
  return {
    totalOperations: Number(stats.totalOperations) || 0,
    avgDuration: Number(stats.avgDuration) || 0,
    minDuration: Number(stats.minDuration) || 0,
    maxDuration: Number(stats.maxDuration) || 0,
    p50Duration: Number(p50) || 0,
    p95Duration: Number(p95) || 0,
    p99Duration: Number(p99) || 0,
    successRate: Number(stats.successRate) || 100,
  };
}

/**
 * Get slow operations (above threshold)
 */
export async function getSlowOperations(
  hours: number = 24,
  threshold: number = 1000,
  limit: number = 20
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const slowOps = await db
    .select({
      operation: performanceLog.operation,
      avgDuration: sql<number>`AVG(${performanceLog.duration})`,
      maxDuration: sql<number>`MAX(${performanceLog.duration})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(performanceLog)
    .where(and(
      gte(performanceLog.timestamp, since),
      gte(performanceLog.duration, threshold)
    ))
    .groupBy(performanceLog.operation)
    .orderBy(sql`AVG(${performanceLog.duration}) DESC`)
    .limit(limit);

  // Convert string values to numbers (MySQL returns strings for aggregates)
  return slowOps.map((op) => ({
    operation: op.operation,
    avgDuration: Number(op.avgDuration) || 0,
    maxDuration: Number(op.maxDuration) || 0,
    count: Number(op.count) || 0,
  }));
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

  // Use raw SQL to satisfy MySQL's only_full_group_by mode
  const dateFormatPattern = interval === "hour" 
    ? '%Y-%m-%d %H:00:00'
    : '%Y-%m-%d';

  const query = sql`
    SELECT 
      DATE_FORMAT(${performanceLog.timestamp}, ${dateFormatPattern}) as hour,
      AVG(${performanceLog.duration}) as avgDuration,
      MIN(${performanceLog.duration}) as minDuration,
      MAX(${performanceLog.duration}) as maxDuration,
      COUNT(*) as count,
      (SUM(CASE WHEN ${performanceLog.success} = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as successRate
    FROM ${performanceLog}
    WHERE ${performanceLog.timestamp} >= ${since}
    GROUP BY hour
    ORDER BY hour
  `;

  const result = await db.execute(query);
  
  // db.execute() returns [rows, fields], we want just the rows
  const rows = Array.isArray(result[0]) ? result[0] : result;
  
  // Convert string values to numbers (MySQL returns strings for aggregates)
  return rows.map((row: any) => ({
    hour: row.hour,
    avgDuration: Number(row.avgDuration) || 0,
    minDuration: Number(row.minDuration) || 0,
    maxDuration: Number(row.maxDuration) || 0,
    count: Number(row.count) || 0,
    successRate: Number(row.successRate) || 0,
  }));
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
