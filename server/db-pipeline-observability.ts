/**
 * Database helpers for pipeline observability
 * 
 * Provides CRUD operations for pipeline execution logs and metrics queries.
 */

import { getDb } from "./db";
import { pipelineExecutionLog } from "../drizzle/schema";
import { desc, eq, and, gte, lte, sql } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";


/**
 * Save pipeline execution log to database
 */
export async function savePipelineExecutionLog(data: {
  executionId: string;
  pipelineType: string;
  triggeredBy: string;
  startedAt: string;
  completedAt?: string | null;
  durationMs?: number | null;
  status: string;
  sourcesAttempted: number;
  sourcesSucceeded: number;
  sourcesFailed: number;
  itemsFetched: number;
  itemsDeduplicated: number;
  itemsProcessed: number;
  itemsSaved: number;
  itemsFailed: number;
  aiCallsMade: number;
  aiCallsSucceeded: number;
  aiCallsFailed: number;
  aiAvgQualityScore?: number | null;
  itemsWithSummary: number;
  itemsWithRegulationTags: number;
  itemsWithGs1ImpactTags: number;
  itemsWithSectorTags: number;
  itemsWithRecommendations: number;
  errorCount: number;
  errorMessages?: string | null;
  warnings?: string | null;
  configSnapshot?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  try {
    console.log('[savePipelineExecutionLog] Attempting to save execution log:', {
      executionId: data.executionId,
      pipelineType: data.pipelineType,
      status: data.status,
    });
    
    const result = await db.insert(pipelineExecutionLog).values(data);
    
    console.log('[savePipelineExecutionLog] Insert successful:', result);
    return result;
  } catch (error) {
    serverLogger.error('[savePipelineExecutionLog] Insert failed:', error);
    serverLogger.error(
      '[savePipelineExecutionLog] Data that failed to insert:',
      JSON.stringify(data, null, 2)
    );
    throw error;
  }
}

/**
 * Get recent pipeline execution logs
 */
export async function getRecentPipelineExecutions(limit = 50) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db
    .select()
    .from(pipelineExecutionLog)
    .orderBy(desc(pipelineExecutionLog.startedAt))
    .limit(limit);
}

/**
 * Get pipeline execution by ID
 */
export async function getPipelineExecutionById(executionId: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const [result] = await db
    .select()
    .from(pipelineExecutionLog)
    .where(eq(pipelineExecutionLog.executionId, executionId));
  return result;
}

/**
 * Get pipeline executions by date range
 */
export async function getPipelineExecutionsByDateRange(
  startDate: string,
  endDate: string,
  pipelineType?: string
) {
  const conditions = [
    gte(pipelineExecutionLog.startedAt, startDate),
    lte(pipelineExecutionLog.startedAt, endDate),
  ];
  
  if (pipelineType) {
    conditions.push(eq(pipelineExecutionLog.pipelineType, pipelineType));
  }
  
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db
    .select()
    .from(pipelineExecutionLog)
    .where(and(...conditions))
    .orderBy(desc(pipelineExecutionLog.startedAt));
}

/**
 * Get pipeline success rate over time period
 */
export async function getPipelineSuccessRate(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db
    .select({
      total: sql<number>`COUNT(*)`,
      successful: sql<number>`SUM(CASE WHEN ${pipelineExecutionLog.status} = 'success' THEN 1 ELSE 0 END)`,
    })
    .from(pipelineExecutionLog)
    .where(gte(pipelineExecutionLog.startedAt, startDate.toISOString()));
  
  const { total, successful } = result[0];
  return total > 0 ? (successful / total) * 100 : 0;
}

/**
 * Get average AI quality score over time period
 */
export async function getAverageAiQualityScore(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db
    .select({
      avgScore: sql<number>`AVG(${pipelineExecutionLog.aiAvgQualityScore})`,
    })
    .from(pipelineExecutionLog)
    .where(
      and(
        gte(pipelineExecutionLog.startedAt, startDate.toISOString()),
        sql`${pipelineExecutionLog.aiAvgQualityScore} IS NOT NULL`
      )
    );
  
  return result[0]?.avgScore || null;
}

/**
 * Get AI quality score trend (daily averages)
 */
export async function getAiQualityScoreTrend(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db
    .select({
      date: sql<string>`DATE(${pipelineExecutionLog.startedAt})`,
      avgQualityScore: sql<number>`AVG(${pipelineExecutionLog.aiAvgQualityScore})`,
      executionCount: sql<number>`COUNT(*)`,
    })
    .from(pipelineExecutionLog)
    .where(
      and(
        gte(pipelineExecutionLog.startedAt, startDate.toISOString()),
        sql`${pipelineExecutionLog.aiAvgQualityScore} IS NOT NULL`
      )
    )
    .groupBy(sql`DATE(${pipelineExecutionLog.startedAt})`)
    .orderBy(sql`DATE(${pipelineExecutionLog.startedAt}) ASC`);
}

/**
 * Get source reliability metrics
 */
export async function getSourceHealthMetrics(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db
    .select({
      totalAttempts: sql<number>`SUM(${pipelineExecutionLog.sourcesAttempted})`,
      totalSucceeded: sql<number>`SUM(${pipelineExecutionLog.sourcesSucceeded})`,
      totalFailed: sql<number>`SUM(${pipelineExecutionLog.sourcesFailed})`,
    })
    .from(pipelineExecutionLog)
    .where(gte(pipelineExecutionLog.startedAt, startDate.toISOString()));
  
  const { totalAttempts, totalSucceeded, totalFailed } = result[0];
  const successRate = totalAttempts > 0 ? (totalSucceeded / totalAttempts) * 100 : 0;
  
  return {
    totalAttempts,
    totalSucceeded,
    totalFailed,
    successRate,
  };
}

export const getSourceReliabilityMetrics = getSourceHealthMetrics;

/**
 * Get pipeline performance metrics
 */
export async function getPipelinePerformanceMetrics(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db
    .select({
      avgDurationMs: sql<number>`AVG(${pipelineExecutionLog.durationMs})`,
      avgItemsProcessed: sql<number>`AVG(${pipelineExecutionLog.itemsProcessed})`,
      avgItemsSaved: sql<number>`AVG(${pipelineExecutionLog.itemsSaved})`,
      totalErrors: sql<number>`SUM(${pipelineExecutionLog.errorCount})`,
    })
    .from(pipelineExecutionLog)
    .where(
      and(
        gte(pipelineExecutionLog.startedAt, startDate.toISOString()),
        sql`${pipelineExecutionLog.durationMs} IS NOT NULL`
      )
    );
  
  return result[0];
}

/**
 * Get quality metrics distribution
 */
export async function getQualityMetricsDistribution(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db
    .select({
      totalProcessed: sql<number>`SUM(${pipelineExecutionLog.itemsProcessed})`,
      withSummary: sql<number>`SUM(${pipelineExecutionLog.itemsWithSummary})`,
      withRegulationTags: sql<number>`SUM(${pipelineExecutionLog.itemsWithRegulationTags})`,
      withGs1ImpactTags: sql<number>`SUM(${pipelineExecutionLog.itemsWithGs1ImpactTags})`,
      withSectorTags: sql<number>`SUM(${pipelineExecutionLog.itemsWithSectorTags})`,
      withRecommendations: sql<number>`SUM(${pipelineExecutionLog.itemsWithRecommendations})`,
    })
    .from(pipelineExecutionLog)
    .where(gte(pipelineExecutionLog.startedAt, startDate.toISOString()));
  
  const metrics = result[0];
  const total = metrics.totalProcessed || 1; // Avoid division by zero
  
  return {
    totalProcessed: metrics.totalProcessed,
    summaryRate: (metrics.withSummary / total) * 100,
    regulationTagsRate: (metrics.withRegulationTags / total) * 100,
    gs1ImpactTagsRate: (metrics.withGs1ImpactTags / total) * 100,
    sectorTagsRate: (metrics.withSectorTags / total) * 100,
    recommendationsRate: (metrics.withRecommendations / total) * 100,
  };
}

/**
 * Get failed executions for debugging
 */
export async function getFailedExecutions(limit = 20) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db
    .select()
    .from(pipelineExecutionLog)
    .where(eq(pipelineExecutionLog.status, 'failed'))
    .orderBy(desc(pipelineExecutionLog.startedAt))
    .limit(limit);
}

/**
 * Delete old pipeline execution logs (retention policy)
 */
export async function cleanupOldExecutionLogs(retentionDays = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db
    .delete(pipelineExecutionLog)
    .where(lte(pipelineExecutionLog.startedAt, cutoffDate.toISOString()));
  
  return result;
}
