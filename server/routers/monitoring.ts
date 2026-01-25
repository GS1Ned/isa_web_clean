import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "../_core/notification";

/**
 * Monitoring Router
 *
 * Provides system health metrics for:
 * - Cron job execution history
 * - Source health (response times, failure rates)
 * - Data drift detection
 * - Email alert testing
 */

export const monitoringRouter = router({
  /**
   * Get cron job statistics (admin-only)
   */
  getCronStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only administrators can view monitoring data",
      });
    }

    // Mock data for now - replace with actual cron job tracking
    return [
      {
        jobName: "EUR-Lex CELLAR Sync",
        lastRun: new Date(Date.now() - 3600000).toISOString(),
        successRate: 95.5,
        totalRuns: 156,
        consecutiveFailures: 0,
      },
      {
        jobName: "News Pipeline",
        lastRun: new Date(Date.now() - 7200000).toISOString(),
        successRate: 88.2,
        totalRuns: 312,
        consecutiveFailures: 0,
      },
      {
        jobName: "EFRAG XBRL Sync",
        lastRun: new Date(Date.now() - 86400000 * 7).toISOString(),
        successRate: 100,
        totalRuns: 12,
        consecutiveFailures: 0,
      },
    ];
  }),

  /**
   * Get source health metrics (admin-only)
   */
  getSourceHealth: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only administrators can view monitoring data",
      });
    }

    // Mock data for now - replace with actual source health tracking
    return [
      {
        sourceName: "EUR-Lex CELLAR",
        avgResponseTime: 1250,
        failureRate: 2.3,
        lastCheck: new Date().toISOString(),
      },
      {
        sourceName: "EFRAG",
        avgResponseTime: 890,
        failureRate: 5.1,
        lastCheck: new Date().toISOString(),
      },
      {
        sourceName: "GS1 Netherlands",
        avgResponseTime: 450,
        failureRate: 1.2,
        lastCheck: new Date().toISOString(),
      },
      {
        sourceName: "GS1 Europe",
        avgResponseTime: 620,
        failureRate: 3.8,
        lastCheck: new Date().toISOString(),
      },
      {
        sourceName: "European Commission",
        avgResponseTime: 1100,
        failureRate: 8.5,
        lastCheck: new Date().toISOString(),
      },
      {
        sourceName: "Dutch Government",
        avgResponseTime: 780,
        failureRate: 4.2,
        lastCheck: new Date().toISOString(),
      },
    ];
  }),

  /**
   * Get data drift statistics (admin-only)
   */
  getDataDrift: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only administrators can view monitoring data",
      });
    }

    // Mock data for now - replace with actual data drift tracking
    return {
      newRecords: 47,
      updatedRecords: 12,
      unchangedRecords: 156,
    };
  }),

  /**
   * Test email alert (admin-only)
   */
  testEmailAlert: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only administrators can send test alerts",
      });
    }

    const success = await notifyOwner({
      title: "ISA Monitoring Test Alert",
      content: `This is a test alert from the ISA monitoring system.

Triggered by: ${ctx.user.name}
Time: ${new Date().toISOString()}

If you received this, email alerts are working correctly.`,
    });

    if (!success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to send test alert",
      });
    }

    return { success: true };
  }),
});
