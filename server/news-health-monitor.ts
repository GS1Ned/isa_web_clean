/**
 * News Scraper Health Monitoring
 * Tracks scraper execution results and provides health metrics
 * Currently console-based; database persistence can be added later
 */

import { notifyOwner } from "./_core/notification";

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
 * In-memory health tracking (resets on server restart)
 * For production, persist to database using schema_scraper_health.ts
 */
const healthHistory: Map<string, ScraperHealthMetrics[]> = new Map();
const HISTORY_LIMIT = 100; // Keep last 100 executions per source

/**
 * Record a scraper execution result
 */
export function recordScraperExecution(metrics: ScraperHealthMetrics): void {
  const { sourceId, sourceName, success, itemsFetched, error, attempts, durationMs } = metrics;
  
  // Log to console
  const status = success ? "✅ SUCCESS" : "❌ FAILED";
  const attemptsInfo = attempts > 1 ? ` (${attempts} attempts)` : "";
  const itemsInfo = success ? ` - ${itemsFetched} items` : "";
  const errorInfo = error ? ` - Error: ${error}` : "";
  const durationInfo = ` - ${durationMs}ms`;
  
  console.log(
    `[scraper-health] ${status} ${sourceName}${attemptsInfo}${itemsInfo}${errorInfo}${durationInfo}`
  );
  
  // Store in memory
  if (!healthHistory.has(sourceId)) {
    healthHistory.set(sourceId, []);
  }
  
  const history = healthHistory.get(sourceId)!;
  history.push(metrics);
  
  // Trim history to limit
  if (history.length > HISTORY_LIMIT) {
    history.shift();
  }
  
  // Check for persistent failures and alert
  checkHealthAndAlert(sourceId, sourceName);
}

/**
 * Get health metrics for a specific source
 */
export function getSourceHealth(sourceId: string): {
  successRate: number;
  totalExecutions: number;
  consecutiveFailures: number;
  lastExecution?: ScraperHealthMetrics;
  avgItemsFetched: number;
  avgDurationMs: number;
} {
  const history = healthHistory.get(sourceId) || [];
  
  if (history.length === 0) {
    return {
      successRate: 0,
      totalExecutions: 0,
      consecutiveFailures: 0,
      avgItemsFetched: 0,
      avgDurationMs: 0,
    };
  }
  
  const successfulExecutions = history.filter(h => h.success).length;
  const successRate = (successfulExecutions / history.length) * 100;
  
  // Count consecutive failures from most recent
  let consecutiveFailures = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].success) break;
    consecutiveFailures++;
  }
  
  const avgItemsFetched = history.reduce((sum, h) => sum + h.itemsFetched, 0) / history.length;
  const avgDurationMs = history.reduce((sum, h) => sum + h.durationMs, 0) / history.length;
  
  return {
    successRate: Math.round(successRate),
    totalExecutions: history.length,
    consecutiveFailures,
    lastExecution: history[history.length - 1],
    avgItemsFetched: Math.round(avgItemsFetched),
    avgDurationMs: Math.round(avgDurationMs),
  };
}

/**
 * Get health summary for all sources
 */
export function getAllSourcesHealth(): Map<string, ReturnType<typeof getSourceHealth>> {
  const summary = new Map();
  
  for (const sourceId of Array.from(healthHistory.keys())) {
    summary.set(sourceId, getSourceHealth(sourceId));
  }
  
  return summary;
}

/**
 * Check scraper health and send alert if needed
 * Alert on 3 consecutive failures
 */
async function checkHealthAndAlert(sourceId: string, sourceName: string): Promise<void> {
  const health = getSourceHealth(sourceId);
  
  // Alert threshold: 3 consecutive failures
  if (health.consecutiveFailures >= 3) {
    const lastError = health.lastExecution?.error || "Unknown error";
    
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
export function printHealthSummary(): void {
  console.log("\n=== News Scraper Health Summary ===");
  
  const allHealth = getAllSourcesHealth();
  
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
