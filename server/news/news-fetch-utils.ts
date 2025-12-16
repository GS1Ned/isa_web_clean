/**
 * News Fetch Utilities
 * Provides timeout handling, retry logic, and error recovery for news fetching
 */

export interface FetchWithTimeoutOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<FetchWithTimeoutOptions> = {
  timeout: 30000, // 30 seconds default
  retries: 2,
  retryDelay: 2000, // 2 seconds between retries
  onRetry: () => {}
};

/**
 * Execute a function with timeout
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${errorMessage} after ${timeoutMs}ms`));
    }, timeoutMs);

    fn()
      .then(result => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: FetchWithTimeoutOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= opts.retries + 1; attempt++) {
    try {
      return await withTimeout(fn, opts.timeout, 'Request');
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt <= opts.retries) {
        opts.onRetry(attempt, lastError);
        await sleep(opts.retryDelay * attempt); // Exponential backoff
      }
    }
  }

  throw lastError || new Error('Unknown error after retries');
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Source health tracking
 */
export interface SourceHealth {
  sourceId: string;
  lastSuccess: Date | null;
  lastFailure: Date | null;
  consecutiveFailures: number;
  totalRequests: number;
  totalFailures: number;
  averageResponseTime: number;
  isHealthy: boolean;
}

const sourceHealthMap = new Map<string, SourceHealth>();

/**
 * Get or create health record for a source
 */
export function getSourceHealth(sourceId: string): SourceHealth {
  if (!sourceHealthMap.has(sourceId)) {
    sourceHealthMap.set(sourceId, {
      sourceId,
      lastSuccess: null,
      lastFailure: null,
      consecutiveFailures: 0,
      totalRequests: 0,
      totalFailures: 0,
      averageResponseTime: 0,
      isHealthy: true
    });
  }
  return sourceHealthMap.get(sourceId)!;
}

/**
 * Record a successful fetch
 */
export function recordSuccess(sourceId: string, responseTimeMs: number): void {
  const health = getSourceHealth(sourceId);
  health.lastSuccess = new Date();
  health.consecutiveFailures = 0;
  health.totalRequests++;
  
  // Update average response time (rolling average)
  health.averageResponseTime = 
    (health.averageResponseTime * (health.totalRequests - 1) + responseTimeMs) / health.totalRequests;
  
  health.isHealthy = true;
}

/**
 * Record a failed fetch
 */
export function recordFailure(sourceId: string, error: Error): void {
  const health = getSourceHealth(sourceId);
  health.lastFailure = new Date();
  health.consecutiveFailures++;
  health.totalRequests++;
  health.totalFailures++;
  
  // Mark as unhealthy after 3 consecutive failures
  if (health.consecutiveFailures >= 3) {
    health.isHealthy = false;
  }
}

/**
 * Get all source health records
 */
export function getAllSourceHealth(): SourceHealth[] {
  return Array.from(sourceHealthMap.values());
}

/**
 * Check if a source should be skipped due to poor health
 */
export function shouldSkipSource(sourceId: string): boolean {
  const health = getSourceHealth(sourceId);
  
  // Skip if unhealthy and last failure was within 5 minutes
  if (!health.isHealthy && health.lastFailure) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return health.lastFailure > fiveMinutesAgo;
  }
  
  return false;
}

/**
 * Reset health for a source (e.g., after manual intervention)
 */
export function resetSourceHealth(sourceId: string): void {
  sourceHealthMap.delete(sourceId);
}

/**
 * Fetch with full error handling, timeout, and retry
 */
export async function fetchWithErrorHandling<T>(
  sourceId: string,
  fetchFn: () => Promise<T>,
  options: FetchWithTimeoutOptions = {}
): Promise<{ success: true; data: T; responseTimeMs: number } | { success: false; error: string }> {
  // Check if source should be skipped
  if (shouldSkipSource(sourceId)) {
    return {
      success: false,
      error: `Source ${sourceId} temporarily disabled due to repeated failures`
    };
  }

  const startTime = Date.now();
  
  try {
    const data = await withRetry(fetchFn, {
      ...options,
      onRetry: (attempt, error) => {
        console.log(`[news-fetch] Retry ${attempt} for ${sourceId}: ${error.message}`);
      }
    });
    
    const responseTimeMs = Date.now() - startTime;
    recordSuccess(sourceId, responseTimeMs);
    
    return { success: true, data, responseTimeMs };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    recordFailure(sourceId, error instanceof Error ? error : new Error(errorMessage));
    
    return { success: false, error: errorMessage };
  }
}
