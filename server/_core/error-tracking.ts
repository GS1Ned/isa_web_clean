/**
 * Error Tracking Infrastructure
 * 
 * Provides centralized error logging, tracking, and notification system.
 * Captures errors with context (user, request, stack trace) for debugging.
 * 
 * Features:
 * - In-memory error storage (last 1000 errors)
 * - Error severity levels (info, warning, error, critical)
 * - Email notifications for critical errors
 * - Performance metrics tracking
 * - Error aggregation and deduplication
 */

import { notifyOwner } from "./notification";
import { serverLogger } from "./logger-wiring";


export type ErrorSeverity = "info" | "warning" | "error" | "critical";

export interface ErrorContext {
  userId?: string;
  userEmail?: string;
  requestPath?: string;
  requestMethod?: string;
  requestBody?: unknown;
  userAgent?: string;
  ip?: string;
  timestamp: Date;
  [key: string]: unknown;
}

export interface TrackedError {
  id: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  context: ErrorContext;
  count: number; // Number of times this error occurred
  firstSeen: Date;
  lastSeen: Date;
}

// In-memory error storage (last 1000 errors)
const errorStore: TrackedError[] = [];
const MAX_ERRORS = 1000;

// Error deduplication map (message + stack -> error ID)
const errorSignatures = new Map<string, string>();

/**
 * Generate error signature for deduplication
 */
function getErrorSignature(message: string, stack?: string): string {
  const stackLines = stack?.split("\n").slice(0, 3).join("\n") || "";
  return `${message}::${stackLines}`;
}

/**
 * Generate unique error ID
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Track an error with context
 * 
 * @param error - Error object or message
 * @param severity - Error severity level
 * @param context - Additional context (user, request, etc.)
 * @returns Tracked error ID
 */
export async function trackError(
  error: Error | string,
  severity: ErrorSeverity = "error",
  context: Partial<ErrorContext> = {}
): Promise<string> {
  const message = typeof error === "string" ? error : error.message;
  const stack = typeof error === "string" ? undefined : error.stack;
  
  const signature = getErrorSignature(message, stack);
  const existingErrorId = errorSignatures.get(signature);
  
  const timestamp = new Date();
  
  // If error already exists, increment count
  if (existingErrorId) {
    const existingError = errorStore.find(e => e.id === existingErrorId);
    if (existingError) {
      existingError.count++;
      existingError.lastSeen = timestamp;
      existingError.context = { ...existingError.context, ...context, timestamp };
      
      // Notify for critical errors (but not every occurrence)
      if (severity === "critical" && existingError.count <= 3) {
        await notifyCriticalError(existingError);
      }
      
      return existingErrorId;
    }
  }
  
  // Create new tracked error
  const errorId = generateErrorId();
  const trackedError: TrackedError = {
    id: errorId,
    message,
    stack,
    severity,
    context: { ...context, timestamp },
    count: 1,
    firstSeen: timestamp,
    lastSeen: timestamp,
  };
  
  // Add to store
  errorStore.unshift(trackedError);
  
  // Trim store if too large
  if (errorStore.length > MAX_ERRORS) {
    const removed = errorStore.pop();
    if (removed) {
      errorSignatures.delete(getErrorSignature(removed.message, removed.stack));
    }
  }
  
  // Update signature map
  errorSignatures.set(signature, errorId);
  
  // Notify for critical errors
  if (severity === "critical") {
    await notifyCriticalError(trackedError);
  }
  
  // Log to console
  serverLogger.error(`[${severity.toUpperCase()}] ${message}`, {
    errorId,
    context,
    stack,
  });
  
  return errorId;
}

/**
 * Send notification for critical errors
 */
async function notifyCriticalError(error: TrackedError): Promise<void> {
  try {
    const title = `🚨 Critical Error: ${error.message}`;
    const content = `
**Error ID:** ${error.id}
**Severity:** ${error.severity}
**Count:** ${error.count}
**First Seen:** ${error.firstSeen.toISOString()}
**Last Seen:** ${error.lastSeen.toISOString()}

**Context:**
- User: ${error.context.userEmail || error.context.userId || "Anonymous"}
- Path: ${error.context.requestPath || "N/A"}
- Method: ${error.context.requestMethod || "N/A"}

**Stack Trace:**
\`\`\`
${error.stack || "No stack trace available"}
\`\`\`
    `.trim();
    
    await notifyOwner({ title, content });
  } catch (notifyError) {
    serverLogger.error("Failed to send critical error notification:", notifyError);
  }
}

/**
 * Get recent errors
 * 
 * @param limit - Maximum number of errors to return
 * @param severity - Filter by severity level
 * @returns Array of tracked errors
 */
export function getRecentErrors(
  limit: number = 100,
  severity?: ErrorSeverity
): TrackedError[] {
  let errors = errorStore;
  
  if (severity) {
    errors = errors.filter(e => e.severity === severity);
  }
  
  return errors.slice(0, limit);
}

/**
 * Get error by ID
 */
export function getErrorById(errorId: string): TrackedError | undefined {
  return errorStore.find(e => e.id === errorId);
}

/**
 * Get error statistics
 */
export function getErrorStats(): {
  total: number;
  bySeverity: Record<ErrorSeverity, number>;
  topErrors: Array<{ message: string; count: number; severity: ErrorSeverity }>;
} {
  const bySeverity: Record<ErrorSeverity, number> = {
    info: 0,
    warning: 0,
    error: 0,
    critical: 0,
  };
  
  errorStore.forEach(error => {
    bySeverity[error.severity] += error.count;
  });
  
  const topErrors = errorStore
    .slice(0, 10)
    .map(e => ({
      message: e.message,
      count: e.count,
      severity: e.severity,
    }));
  
  return {
    total: errorStore.reduce((sum, e) => sum + e.count, 0),
    bySeverity,
    topErrors,
  };
}

/**
 * Clear all errors (for testing)
 */
export function clearErrors(): void {
  errorStore.length = 0;
  errorSignatures.clear();
}

/**
 * Express error handler middleware
 * 
 * Catches unhandled errors and tracks them
 */
export function errorHandlerMiddleware(
  error: Error,
  req: any,
  res: any,
  next: any
): void {
  const context: ErrorContext = {
    requestPath: req.path,
    requestMethod: req.method,
    userAgent: req.get("user-agent"),
    ip: req.ip,
    userId: req.user?.id,
    userEmail: req.user?.email,
    timestamp: new Date(),
  };
  
  trackError(error, "error", context).catch((trackErrorFailure) => {
    serverLogger.error(trackErrorFailure, {
      context: "[error-tracking] Failed to track error from middleware:",
    });
  });
  
  // Send error response
  res.status(500).json({
    error: {
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    },
  });
}
