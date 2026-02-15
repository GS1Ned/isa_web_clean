import { serverLogger } from "./_core/logger-wiring";

/**
 * Retry Utility for News Scrapers
 * Implements exponential backoff with jitter for transient error recovery
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  jitterMs?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 1000, // 1 second
  maxDelayMs: 10000, // 10 seconds
  backoffMultiplier: 2,
  jitterMs: 500,
};

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  options: Required<RetryOptions>
): number {
  const exponentialDelay =
    options.initialDelayMs * Math.pow(options.backoffMultiplier, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, options.maxDelayMs);
  const jitter = Math.random() * options.jitterMs;
  return cappedDelay + jitter;
}

/**
 * Retry an async operation with exponential backoff
 * 
 * @param operation - Async function to retry
 * @param options - Retry configuration
 * @param context - Context string for logging (e.g., "GS1 NL scraper")
 * @returns Result of the operation
 * @throws Last error if all attempts fail
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
  context: string = "operation"
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      serverLogger.info(`[retry] ${context}: Attempt ${attempt}/${opts.maxAttempts}`);
      const result = await operation();
      
      if (attempt > 1) {
        serverLogger.info(`[retry] ${context}: Succeeded on attempt ${attempt}`);
      }
      
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      serverLogger.warn(
        `[retry] ${context}: Attempt ${attempt}/${opts.maxAttempts} failed:`,
        lastError.message
      );

      // Don't sleep after the last attempt
      if (attempt < opts.maxAttempts) {
        const delayMs = calculateDelay(attempt, opts);
        serverLogger.info(`[retry] ${context}: Waiting ${Math.round(delayMs)}ms before retry...`);
        await sleep(delayMs);
      }
    }
  }

  // All attempts failed
  serverLogger.error(
    `[retry] ${context}: All ${opts.maxAttempts} attempts failed. Last error:`,
    lastError
  );
  throw lastError || new Error(`${context} failed after ${opts.maxAttempts} attempts`);
}

/**
 * Retry with backoff and return a result object instead of throwing
 * Useful for batch operations where you want to continue despite failures
 */
export async function retryWithResult<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
  context: string = "operation"
): Promise<{ success: boolean; data?: T; error?: string; attempts: number }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      const result = await operation();
      return {
        success: true,
        data: result,
        attempts: attempt,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      serverLogger.warn(
        `[retry] ${context}: Attempt ${attempt}/${opts.maxAttempts} failed:`,
        lastError.message
      );

      if (attempt < opts.maxAttempts) {
        const delayMs = calculateDelay(attempt, opts);
        await sleep(delayMs);
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || "Unknown error",
    attempts: opts.maxAttempts,
  };
}
