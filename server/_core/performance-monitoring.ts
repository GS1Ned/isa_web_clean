/**
 * Performance Monitoring Infrastructure
 * 
 * Tracks performance metrics for critical operations:
 * - API response times
 * - Database query times
 * - LLM invocation times
 * - News pipeline execution times
 * 
 * Provides percentile calculations (p50, p95, p99) and alerts for slow operations.
 */

import { trackError } from "./error-tracking";
import { serverLogger } from "./logger-wiring";

export interface PerformanceMetric {
  operation: string;
  duration: number; // milliseconds
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// In-memory metrics storage (last 10,000 metrics)
const metricsStore: PerformanceMetric[] = [];
const MAX_METRICS = 10000;

// Performance thresholds (milliseconds)
const THRESHOLDS = {
  api: 500, // API requests should complete in <500ms
  database: 100, // Database queries should complete in <100ms
  llm: 5000, // LLM invocations should complete in <5s
  pipeline: 60000, // News pipeline should complete in <60s
};

/**
 * Track performance metric
 * 
 * @param operation - Operation name (e.g., "api.trpc.news.list", "db.query.regulations")
 * @param duration - Duration in milliseconds
 * @param metadata - Additional metadata
 */
export function trackPerformance(
  operation: string,
  duration: number,
  metadata?: Record<string, unknown>
): void {
  const metric: PerformanceMetric = {
    operation,
    duration,
    timestamp: new Date(),
    metadata,
  };
  
  // Add to store
  metricsStore.unshift(metric);
  
  // Trim store if too large
  if (metricsStore.length > MAX_METRICS) {
    metricsStore.pop();
  }
  
  // Check thresholds and alert if slow
  checkThresholds(metric);
}

/**
 * Check performance thresholds and alert if exceeded
 */
function checkThresholds(metric: PerformanceMetric): void {
  const operationType = metric.operation.split(".")[0];
  const threshold = THRESHOLDS[operationType as keyof typeof THRESHOLDS];
  
  if (threshold && metric.duration > threshold) {
    trackError(
      `Slow operation: ${metric.operation} took ${metric.duration}ms (threshold: ${threshold}ms)`,
      "warning",
      {
        operation: metric.operation,
        duration: metric.duration,
        threshold,
        metadata: metric.metadata,
        timestamp: metric.timestamp,
      }
    ).catch((error) => {
      serverLogger.error(error, {
        context: "[performance-monitoring] Failed to track slow-operation warning:",
      });
    });
  }
}

/**
 * Measure async operation performance
 * 
 * @param operation - Operation name
 * @param fn - Async function to measure
 * @param metadata - Additional metadata
 * @returns Result of the async function
 */
export async function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    trackPerformance(operation, duration, metadata);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    trackPerformance(operation, duration, { ...metadata, error: true });
    throw error;
  }
}

/**
 * Measure sync operation performance
 * 
 * @param operation - Operation name
 * @param fn - Sync function to measure
 * @param metadata - Additional metadata
 * @returns Result of the sync function
 */
export function measurePerformanceSync<T>(
  operation: string,
  fn: () => T,
  metadata?: Record<string, unknown>
): T {
  const startTime = Date.now();
  
  try {
    const result = fn();
    const duration = Date.now() - startTime;
    trackPerformance(operation, duration, metadata);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    trackPerformance(operation, duration, { ...metadata, error: true });
    throw error;
  }
}

/**
 * Get recent metrics
 * 
 * @param limit - Maximum number of metrics to return
 * @param operation - Filter by operation name (supports wildcards)
 * @returns Array of performance metrics
 */
export function getRecentMetrics(
  limit: number = 100,
  operation?: string
): PerformanceMetric[] {
  let metrics = metricsStore;
  
  if (operation) {
    const pattern = operation.replace(/\*/g, ".*");
    const regex = new RegExp(`^${pattern}$`);
    metrics = metrics.filter(m => regex.test(m.operation));
  }
  
  return metrics.slice(0, limit);
}

/**
 * Calculate percentiles for an operation
 * 
 * @param operation - Operation name (supports wildcards)
 * @param timeWindow - Time window in minutes (default: 60)
 * @returns Percentile statistics
 */
export function getPercentiles(
  operation: string,
  timeWindow: number = 60
): {
  count: number;
  p50: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  avg: number;
} {
  const cutoff = new Date(Date.now() - timeWindow * 60 * 1000);
  const pattern = operation.replace(/\*/g, ".*");
  const regex = new RegExp(`^${pattern}$`);
  
  const metrics = metricsStore
    .filter(m => regex.test(m.operation) && m.timestamp >= cutoff)
    .map(m => m.duration)
    .sort((a, b) => a - b);
  
  if (metrics.length === 0) {
    return { count: 0, p50: 0, p95: 0, p99: 0, min: 0, max: 0, avg: 0 };
  }
  
  const getPercentile = (p: number) => {
    const index = Math.ceil((p / 100) * metrics.length) - 1;
    return metrics[Math.max(0, index)];
  };
  
  return {
    count: metrics.length,
    p50: getPercentile(50),
    p95: getPercentile(95),
    p99: getPercentile(99),
    min: metrics[0],
    max: metrics[metrics.length - 1],
    avg: metrics.reduce((sum, d) => sum + d, 0) / metrics.length,
  };
}

/**
 * Get performance summary by operation type
 */
export function getPerformanceSummary(): Record<
  string,
  {
    count: number;
    avgDuration: number;
    p95Duration: number;
    slowCount: number;
  }
> {
  const summary: Record<string, any> = {};
  
  // Group metrics by operation type
  const grouped = new Map<string, number[]>();
  
  metricsStore.forEach(metric => {
    const operationType = metric.operation.split(".")[0];
    if (!grouped.has(operationType)) {
      grouped.set(operationType, []);
    }
    grouped.get(operationType)!.push(metric.duration);
  });
  
  // Calculate statistics for each operation type
  grouped.forEach((durations, operationType) => {
    const sorted = durations.sort((a, b) => a - b);
    const p95Index = Math.ceil(0.95 * sorted.length) - 1;
    const threshold = THRESHOLDS[operationType as keyof typeof THRESHOLDS] || Infinity;
    
    summary[operationType] = {
      count: durations.length,
      avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      p95Duration: sorted[Math.max(0, p95Index)],
      slowCount: durations.filter(d => d > threshold).length,
    };
  });
  
  return summary;
}

/**
 * Clear all metrics (for testing)
 */
export function clearMetrics(): void {
  metricsStore.length = 0;
}

/**
 * Express middleware for tracking API response times
 */
export function performanceMiddleware(req: any, res: any, next: any): void {
  const startTime = Date.now();
  
  // Track response time when request finishes
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const operation = `api.${req.method}.${req.path.replace(/\//g, ".")}`;
    
    trackPerformance(operation, duration, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
    });
  });
  
  next();
}
