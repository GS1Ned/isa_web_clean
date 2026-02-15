/**
 * News Scraper Health Monitoring
 * Tracks scraper execution results with database persistence
 * Provides health metrics and alerting for news scrapers
 */

import { notifyOwner } from "./_core/notification";
import { getDb } from "./db";
import { scraperExecutions, scraperHealthSummary } from "../drizzle/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";


export interface ScraperHealthMetrics {
  sourceId: string;
  sourceName: string;
  success: boolean;
  itemsFetched: number;
  error?: string;
  attempts: number;
  durationMs: number;
  timestamp: Date;
}

/**
 * Database-backed health tracking with in-memory cache for performance
 * Cache is used for quick access during pipeline execution
 */
const healthCache: Map<string, ScraperHealthMetrics[]> = new Map();
const CACHE_LIMIT = 20; // Keep last 20 executions per source in memory

/**
 * Record a scraper execution result to database and cache
 */
export async function recordScraperExecution(metrics: ScraperHealthMetrics): Promise<void> {
  const { sourceId, sourceName, success, itemsFetched, error, attempts, durationMs, timestamp } = metrics;
  
  // Emit a human-readable one-line status for operators.
  const status = success ? "✅ SUCCESS" : "❌ FAILED";
  const attemptsInfo = attempts > 1 ? ` (${attempts} attempts)` : "";
  const itemsInfo = success ? ` - ${itemsFetched} items` : "";
  const errorInfo = error ? ` - Error: ${error}` : "";
  const durationInfo = ` - ${durationMs}ms`;
  
  serverLogger.info(`[scraper-health] ${status} ${sourceName}${attemptsInfo}${itemsInfo}${errorInfo}${durationInfo}`);
  
  // Update cache regardless of DB availability.
  if (!healthCache.has(sourceId)) {
    healthCache.set(sourceId, []);
  }

  const cache = healthCache.get(sourceId)!;
  cache.push(metrics);

  if (cache.length > CACHE_LIMIT) {
    cache.shift();
  }

  try {
    const db = await getDb();
    if (!db) {
      serverLogger.warn("[scraper-health] Database not available, skipping persistence");
      return;
    }

    // Store in database
    await db.insert(scraperExecutions).values({
      sourceId,
      sourceName,
      success: success ? 1 : 0,
      itemsFetched,
      errorMessage: error || null,
      attempts,
      durationMs,
      triggeredBy: "cron",
      startedAt: timestamp?.toISOString(),
      completedAt: timestamp?.toISOString(),
    });

    // Update health summary
    await updateHealthSummary(sourceId, sourceName, success, itemsFetched, durationMs, error);

    // Check for persistent failures and alert
    await checkHealthAndAlert(sourceId, sourceName);
  } catch (dbError) {
    serverLogger.error(`[scraper-health] Failed to persist execution to database:`, dbError);
    // Continue execution even if database write fails
  }
}

/**
 * Update health summary in database after each execution
 */
async function updateHealthSummary(
  sourceId: string,
  sourceName: string,
  success: boolean,
  itemsFetched: number,
  durationMs: number,
  error?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  // Get or create health summary
  const existing = await db
    .select()
    .from(scraperHealthSummary)
    .where(eq(scraperHealthSummary.sourceId, sourceId))
    .limit(1);
  
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // Calculate 24h metrics from database
  const recent = await db
    .select()
    .from(scraperExecutions)
    .where(
      and(
        eq(scraperExecutions.sourceId, sourceId),
        gte(scraperExecutions.startedAt, twentyFourHoursAgo.toISOString())
      )
    );
  
  const totalExecutions24h = recent.length;
  const failedExecutions24h = recent.filter(r => !r.success).length;
  const successRate24h = totalExecutions24h > 0
    ? Math.round(((totalExecutions24h - failedExecutions24h) / totalExecutions24h) * 100)
    : 100;
  
  const avgItemsFetched24h = totalExecutions24h > 0
    ? Math.round(recent.reduce((sum, r) => sum + r.itemsFetched, 0) / totalExecutions24h)
    : 0;
  
  const avgDurationMs24h = totalExecutions24h > 0
    ? Math.round(recent.reduce((sum, r) => sum + (r.durationMs || 0), 0) / totalExecutions24h)
    : null;
  
  // Count consecutive failures
  const recentOrdered = await db
    .select()
    .from(scraperExecutions)
    .where(eq(scraperExecutions.sourceId, sourceId))
    .orderBy(desc(scraperExecutions.startedAt))
    .limit(10);
  
  let consecutiveFailures = 0;
  for (const exec of recentOrdered) {
    if (exec.success) break;
    consecutiveFailures++;
  }
  
  if (existing.length === 0) {
    // Create new summary
    await db.insert(scraperHealthSummary).values({
      sourceId,
      sourceName,
      successRate24H: successRate24h,
      totalExecutions24H: totalExecutions24h,
      failedExecutions24H: failedExecutions24h,
      avgItemsFetched24H: avgItemsFetched24h,
      avgDurationMs24H: avgDurationMs24h,
      lastExecutionSuccess: success ? 1 : 0,
      lastExecutionAt: now.toISOString(),
      lastSuccessAt: success ? now.toISOString() : null,
      lastErrorMessage: error || null,
      consecutiveFailures,
      alertSent: 0,
    });
  } else {
    // Update existing summary
    await db
      .update(scraperHealthSummary)
      .set({
        successRate24H: successRate24h,
        totalExecutions24H: totalExecutions24h,
        failedExecutions24H: failedExecutions24h,
        avgItemsFetched24H: avgItemsFetched24h,
        avgDurationMs24H: avgDurationMs24h,
        lastExecutionSuccess: success ? 1 : 0,
        lastExecutionAt: now.toISOString(),
        lastSuccessAt: success ? now.toISOString() : existing[0].lastSuccessAt,
        lastErrorMessage: error || null,
        consecutiveFailures,
      })
      .where(eq(scraperHealthSummary.sourceId, sourceId));
  }
}

/**
 * Get health metrics for a specific source from database
 */
export async function getSourceHealth(sourceId: string): Promise<{
  successRate: number;
  totalExecutions: number;
  consecutiveFailures: number;
  lastExecution?: ScraperHealthMetrics;
  avgItemsFetched: number;
  avgDurationMs: number;
}> {
  const db = await getDb();
  if (!db) {
    const cached = healthCache.get(sourceId) ?? [];
    if (cached.length === 0) {
      return {
        successRate: 0,
        totalExecutions: 0,
        consecutiveFailures: 0,
        avgItemsFetched: 0,
        avgDurationMs: 0,
      };
    }

    const totalExecutions = cached.length;
    const totalFailures = cached.filter(entry => !entry.success).length;
    let consecutiveFailures = 0;
    for (const entry of [...cached].reverse()) {
      if (entry.success) break;
      consecutiveFailures++;
    }
    const avgItemsFetched = Math.round(
      cached.reduce((sum, entry) => sum + entry.itemsFetched, 0) / totalExecutions
    );
    const avgDurationMs = Math.round(
      cached.reduce((sum, entry) => sum + entry.durationMs, 0) / totalExecutions
    );
    return {
      successRate:
        totalExecutions > 0
          ? Math.round(((totalExecutions - totalFailures) / totalExecutions) * 100)
          : 0,
      totalExecutions,
      consecutiveFailures,
      lastExecution: cached[cached.length - 1],
      avgItemsFetched,
      avgDurationMs,
    };
  }
  
  const summary = await db
    .select()
    .from(scraperHealthSummary)
    .where(eq(scraperHealthSummary.sourceId, sourceId))
    .limit(1);
  
  if (summary.length === 0) {
    return {
      successRate: 0,
      totalExecutions: 0,
      consecutiveFailures: 0,
      avgItemsFetched: 0,
      avgDurationMs: 0,
    };
  }
  
  const s = summary[0];
  
  return {
    successRate: s.successRate24H,
    totalExecutions: s.totalExecutions24H,
    consecutiveFailures: s.consecutiveFailures,
    avgItemsFetched: s.avgItemsFetched24H,
    avgDurationMs: s.avgDurationMs24H || 0,
  };
}

/**
 * Get health summary for all sources from database
 */
export async function getAllSourcesHealth(): Promise<Map<string, Awaited<ReturnType<typeof getSourceHealth>>>> {
  const db = await getDb();
  if (!db) {
    const summary = new Map<string, Awaited<ReturnType<typeof getSourceHealth>>>();
    for (const sourceId of Array.from(healthCache.keys())) {
      summary.set(sourceId, await getSourceHealth(sourceId));
    }
    return summary;
  }
  
  const allSummaries = await db.select().from(scraperHealthSummary);
  
  const summary = new Map();
  
  for (const s of allSummaries) {
    summary.set(s.sourceId, {
      successRate: s.successRate24H,
      totalExecutions: s.totalExecutions24H,
      consecutiveFailures: s.consecutiveFailures,
      avgItemsFetched: s.avgItemsFetched24H,
      avgDurationMs: s.avgDurationMs24H || 0,
    });
  }
  
  return summary;
}

/**
 * Check scraper health and send alert if needed
 * Alert on 3 consecutive failures
 */
async function checkHealthAndAlert(sourceId: string, sourceName: string): Promise<void> {
  const health = await getSourceHealth(sourceId);
  
  // Alert threshold: 3 consecutive failures
  if (health.consecutiveFailures >= 3) {
    const db = await getDb();
    if (!db) return;
    
    // Check if alert already sent
    const summary = await db
      .select()
      .from(scraperHealthSummary)
      .where(eq(scraperHealthSummary.sourceId, sourceId))
      .limit(1);
    
    if (summary.length > 0 && summary[0].alertSent) {
      // Alert already sent, don't spam
      return;
    }
    
    const lastError = summary[0]?.lastErrorMessage || "Unknown error";
    
    serverLogger.error(
      `[scraper-health] 🚨 ALERT: ${sourceName} has ${health.consecutiveFailures} consecutive failures!`
    );
    
    // Send notification to owner
    try {
      await notifyOwner({
        title: `News Scraper Alert: ${sourceName} Failing`,
        content: `The ${sourceName} news scraper has failed ${health.consecutiveFailures} times in a row.\n\nLast error: ${lastError}\n\nSuccess rate: ${health.successRate}%\nTotal executions: ${health.totalExecutions}\n\nPlease investigate the scraper configuration and source availability.`,
      });
      
      serverLogger.info(`[scraper-health] Alert notification sent for ${sourceName}`);
      
      // Mark alert as sent
      await db
        .update(scraperHealthSummary)
        .set({
          alertSent: 1,
          alertSentAt: new Date().toISOString(),
        })
        .where(eq(scraperHealthSummary.sourceId, sourceId));
    } catch (notifyError) {
      serverLogger.error(`[scraper-health] Failed to send alert notification:`, notifyError);
    }
  }
}

/**
 * Print health summary to console (useful for debugging)
 */
export async function printHealthSummary(): Promise<void> {
  serverLogger.info("\n=== News Scraper Health Summary ===");
  
  const allHealth = await getAllSourcesHealth();
  
  if (allHealth.size === 0) {
    serverLogger.info("No scraper executions recorded yet.");
    return;
  }
  
  for (const [sourceId, health] of Array.from(allHealth.entries())) {
    const status = health.consecutiveFailures > 0 ? "⚠️" : "✅";
    serverLogger.info(`${status} ${sourceId}: ${health.successRate}% success (${health.totalExecutions} runs, ${health.consecutiveFailures} consecutive failures)`);
  }
  
  serverLogger.info("===================================\n");
}
