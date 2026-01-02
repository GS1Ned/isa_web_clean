/**
 * News Scraper Health Monitoring
 * Tracks scraper execution results with database persistence
 * Provides health metrics and alerting for news scrapers
 */

import { notifyOwner } from "./_core/notification";
import { getDb } from "./db";
import { scraperExecutions, scraperHealthSummary } from "../drizzle/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";

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
  
  // Log to console
  const status = success ? "✅ SUCCESS" : "❌ FAILED";
  const attemptsInfo = attempts > 1 ? ` (${attempts} attempts)` : "";
  const itemsInfo = success ? ` - ${itemsFetched} items` : "";
  const errorInfo = error ? ` - Error: ${error}` : "";
  const durationInfo = ` - ${durationMs}ms`;
  
  console.log(
    `[scraper-health] ${status} ${sourceName}${attemptsInfo}${itemsInfo}${errorInfo}${durationInfo}`
  );
  
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[scraper-health] Database not available, skipping persistence");
      return;
    }
    
    // Store in database
    await db.insert(scraperExecutions).values({
      sourceId,
      sourceName,
      success,
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
    
    // Update cache
    if (!healthCache.has(sourceId)) {
      healthCache.set(sourceId, []);
    }
    
    const cache = healthCache.get(sourceId)!;
    cache.push(metrics);
    
    // Trim cache to limit
    if (cache.length > CACHE_LIMIT) {
      cache.shift();
    }
    
    // Check for persistent failures and alert
    await checkHealthAndAlert(sourceId, sourceName);
  } catch (dbError) {
    console.error(`[scraper-health] Failed to persist execution to database:`, dbError);
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
        gte(scraperExecutions.startedAt, twentyFourHoursAgo)
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
      successRate24h,
      totalExecutions24h,
      failedExecutions24h,
      avgItemsFetched24h,
      avgDurationMs24h,
      lastExecutionSuccess: success,
      lastExecutionAt: now,
      lastSuccessAt: success ? now : null,
      lastErrorMessage: error || null,
      consecutiveFailures,
      alertSent: false,
    });
  } else {
    // Update existing summary
    await db
      .update(scraperHealthSummary)
      .set({
        successRate24h,
        totalExecutions24h,
        failedExecutions24h,
        avgItemsFetched24h,
        avgDurationMs24h,
        lastExecutionSuccess: success,
        lastExecutionAt: now,
        lastSuccessAt: success ? now : existing[0].lastSuccessAt,
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
    return {
      successRate: 0,
      totalExecutions: 0,
      consecutiveFailures: 0,
      avgItemsFetched: 0,
      avgDurationMs: 0,
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
    successRate: s.successRate24h,
    totalExecutions: s.totalExecutions24h,
    consecutiveFailures: s.consecutiveFailures,
    avgItemsFetched: s.avgItemsFetched24h,
    avgDurationMs: s.avgDurationMs24h || 0,
  };
}

/**
 * Get health summary for all sources from database
 */
export async function getAllSourcesHealth(): Promise<Map<string, Awaited<ReturnType<typeof getSourceHealth>>>> {
  const db = await getDb();
  if (!db) return new Map();
  
  const allSummaries = await db.select().from(scraperHealthSummary);
  
  const summary = new Map();
  
  for (const s of allSummaries) {
    summary.set(s.sourceId, {
      successRate: s.successRate24h,
      totalExecutions: s.totalExecutions24h,
      consecutiveFailures: s.consecutiveFailures,
      avgItemsFetched: s.avgItemsFetched24h,
      avgDurationMs: s.avgDurationMs24h || 0,
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
    
    console.error(
      `[scraper-health] 🚨 ALERT: ${sourceName} has ${health.consecutiveFailures} consecutive failures!`
    );
    
    // Send notification to owner
    try {
      await notifyOwner({
        title: `News Scraper Alert: ${sourceName} Failing`,
        content: `The ${sourceName} news scraper has failed ${health.consecutiveFailures} times in a row.\n\nLast error: ${lastError}\n\nSuccess rate: ${health.successRate}%\nTotal executions: ${health.totalExecutions}\n\nPlease investigate the scraper configuration and source availability.`,
      });
      
      console.log(`[scraper-health] Alert notification sent for ${sourceName}`);
      
      // Mark alert as sent
      await db
        .update(scraperHealthSummary)
        .set({
          alertSent: true,
          alertSentAt: new Date().toISOString(),
        })
        .where(eq(scraperHealthSummary.sourceId, sourceId));
    } catch (notifyError) {
      console.error(
        `[scraper-health] Failed to send alert notification:`,
        notifyError
      );
    }
  }
}

/**
 * Print health summary to console (useful for debugging)
 */
export async function printHealthSummary(): Promise<void> {
  console.log("\n=== News Scraper Health Summary ===");
  
  const allHealth = await getAllSourcesHealth();
  
  if (allHealth.size === 0) {
    console.log("No scraper executions recorded yet.");
    return;
  }
  
  for (const [sourceId, health] of Array.from(allHealth.entries())) {
    const status = health.consecutiveFailures > 0 ? "⚠️" : "✅";
    console.log(
      `${status} ${sourceId}: ${health.successRate}% success (${health.totalExecutions} runs, ${health.consecutiveFailures} consecutive failures)`
    );
  }
  
  console.log("===================================\n");
}
