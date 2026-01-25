import { z } from "zod";
import { publicProcedure, protectedProcedure, router, adminProcedure } from "./_core/trpc";
import {
  getPerformanceStats,
  getSlowOperations,
  getPerformanceTrends,
  getPerformanceByOperation,
} from "./db-performance-tracking";

/**
 * Performance Tracking Router
 * 
 * Provides tRPC procedures for accessing performance tracking data
 * Admin-only access for security
 */

export const performanceTrackingRouter = router({
  /**
   * Get performance statistics for a time period
   */
  getPerformanceStats: adminProcedure
    .input(
      z.object({
        hours: z.number().min(1).max(168).default(24), // Max 7 days
      })
    )
    .query(async ({ input }) => {
      return await getPerformanceStats(input.hours);
    }),

  /**
   * Get slow operations above threshold
   */
  getSlowOperations: adminProcedure
    .input(
      z.object({
        threshold: z.number().min(100).max(10000).default(1000), // milliseconds
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      return await getSlowOperations(input.threshold, input.limit);
    }),

  /**
   * Get performance trends over time
   */
  getPerformanceTrends: adminProcedure
    .input(
      z.object({
        hours: z.number().min(1).max(168).default(24),
        interval: z.enum(["hour", "day"]).default("hour"),
      })
    )
    .query(async ({ input }) => {
      return await getPerformanceTrends(input.hours, input.interval);
    }),

  /**
   * Get performance grouped by operation
   */
  getPerformanceByOperation: adminProcedure
    .input(
      z.object({
        hours: z.number().min(1).max(168).default(24),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      return await getPerformanceByOperation(input.hours, input.limit);
    }),
});
