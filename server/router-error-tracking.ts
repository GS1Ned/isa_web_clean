import { z } from "zod";
import { publicProcedure, protectedProcedure, router, adminProcedure } from "./_core/trpc";
import {
  getErrorStats,
  getRecentErrors,
  getErrorTrends,
  getErrorsByOperation,
} from "./db-error-tracking";

/**
 * Error Tracking Router
 * 
 * Provides tRPC procedures for accessing error tracking data
 * Admin-only access for security
 */

export const errorTrackingRouter = router({
  /**
   * Get error statistics for a time period
   */
  getErrorStats: adminProcedure
    .input(
      z.object({
        hours: z.number().min(1).max(168).default(24), // Max 7 days
      })
    )
    .query(async ({ input }) => {
      return await getErrorStats(input.hours);
    }),

  /**
   * Get recent errors with optional filtering
   */
  getRecentErrors: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        severity: z.enum(["critical", "error", "warning", "info"]).optional(),
        operation: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getRecentErrors(input.limit, input.severity, input.operation);
    }),

  /**
   * Get error trends over time
   */
  getErrorTrends: adminProcedure
    .input(
      z.object({
        hours: z.number().min(1).max(168).default(24),
        interval: z.enum(["hour", "day"]).default("hour"),
      })
    )
    .query(async ({ input }) => {
      return await getErrorTrends(input.hours, input.interval);
    }),

  /**
   * Get errors grouped by operation
   */
  getErrorsByOperation: adminProcedure
    .input(
      z.object({
        hours: z.number().min(1).max(168).default(24),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      return await getErrorsByOperation(input.hours, input.limit);
    }),
});
