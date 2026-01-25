/**
 * Production Monitoring Router
 * 
 * Admin endpoints for viewing error tracking and performance metrics.
 */

import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import {
  getRecentErrors,
  getErrorById,
  getErrorStats,
  clearErrors,
} from "../_core/error-tracking";
import {
  getRecentMetrics,
  getPercentiles,
  getPerformanceSummary,
  clearMetrics,
} from "../_core/performance-monitoring";
import {
  getAlertHistory,
  acknowledgeAlert,
  getUnacknowledgedCount,
} from "../alert-notification-service";
import { detectAllAlerts, DEFAULT_THRESHOLDS } from "../alert-detection";

export const productionMonitoringRouter = router({
  /**
   * Get recent errors
   */
  getRecentErrors: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional().default(100),
        severity: z.enum(["info", "warning", "error", "critical"]).optional(),
      })
    )
    .query(({ input }) => {
      return getRecentErrors(input.limit, input.severity);
    }),

  /**
   * Get error by ID
   */
  getErrorById: adminProcedure
    .input(z.object({ errorId: z.string() }))
    .query(({ input }) => {
      return getErrorById(input.errorId);
    }),

  /**
   * Get error statistics
   */
  getErrorStats: adminProcedure.query(() => {
    return getErrorStats();
  }),

  /**
   * Clear all errors (for testing)
   */
  clearErrors: adminProcedure.mutation(() => {
    clearErrors();
    return { success: true };
  }),

  /**
   * Get recent performance metrics
   */
  getRecentMetrics: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional().default(100),
        operation: z.string().optional(),
      })
    )
    .query(({ input }) => {
      return getRecentMetrics(input.limit, input.operation);
    }),

  /**
   * Get performance percentiles
   */
  getPercentiles: adminProcedure
    .input(
      z.object({
        operation: z.string(),
        timeWindow: z.number().min(1).max(1440).optional().default(60),
      })
    )
    .query(({ input }) => {
      return getPercentiles(input.operation, input.timeWindow);
    }),

  /**
   * Get performance summary
   */
  getPerformanceSummary: adminProcedure.query(() => {
    return getPerformanceSummary();
  }),

  /**
   * Clear all metrics (for testing)
   */
  clearMetrics: adminProcedure.mutation(() => {
    clearMetrics();
    return { success: true };
  }),

  /**
   * Get alert history
   */
  getAlertHistory: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(200).optional().default(50),
        alertType: z.enum(["error_rate", "critical_error", "performance_degradation"]).optional(),
        severity: z.enum(["info", "warning", "critical"]).optional(),
        unacknowledgedOnly: z.boolean().optional().default(false),
      })
    )
    .query(async ({ input }) => {
      return getAlertHistory(
        input.limit,
        input.alertType,
        input.severity,
        input.unacknowledgedOnly
      );
    }),

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert: adminProcedure
    .input(
      z.object({
        alertId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const success = await acknowledgeAlert(input.alertId, ctx.user.id);
      return { success };
    }),

  /**
   * Get unacknowledged alert count
   */
  getUnacknowledgedAlertCount: adminProcedure.query(async () => {
    const count = await getUnacknowledgedCount();
    return { count };
  }),

  /**
   * Manually trigger alert detection (for testing)
   */
  triggerAlertDetection: adminProcedure.mutation(async () => {
    const alerts = await detectAllAlerts(DEFAULT_THRESHOLDS);
    return {
      success: true,
      alertsDetected: alerts.length,
      alerts: alerts.map((a) => ({
        type: a.alertType,
        severity: a.severity,
        title: a.title,
      })),
    };
  }),
});
