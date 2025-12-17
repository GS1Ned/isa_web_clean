import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getNewsByRegulation,
  getNewsBySector,
  getNewsByGS1Impact,
  getNewsBySource,
  getNewsByMonth,
  getCoverageStatistics,
  getCoverageGaps,
} from "../db-coverage-analytics";

/**
 * Coverage Analytics Router
 *
 * Provides news coverage analytics for:
 * - News count per regulation
 * - News count per sector
 * - News count per GS1 impact area
 * - News count per source type
 * - Time series trends
 * - Coverage gaps
 */

export const coverageAnalyticsRouter = router({
  /**
   * Get news count by regulation (admin-only)
   */
  getByRegulation: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only administrators can view coverage analytics",
      });
    }

    return await getNewsByRegulation();
  }),

  /**
   * Get news count by sector (admin-only)
   */
  getBySector: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only administrators can view coverage analytics",
      });
    }

    return await getNewsBySector();
  }),

  /**
   * Get news count by GS1 impact area (admin-only)
   */
  getByGS1Impact: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only administrators can view coverage analytics",
      });
    }

    return await getNewsByGS1Impact();
  }),

  /**
   * Get news count by source type (admin-only)
   */
  getBySource: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only administrators can view coverage analytics",
      });
    }

    return await getNewsBySource();
  }),

  /**
   * Get news count by month (time series) (admin-only)
   */
  getByMonth: protectedProcedure
    .input(
      z.object({
        months: z.number().min(1).max(24).default(6),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only administrators can view coverage analytics",
        });
      }

      return await getNewsByMonth(input.months);
    }),

  /**
   * Get comprehensive coverage statistics (admin-only)
   */
  getStatistics: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only administrators can view coverage analytics",
      });
    }

    return await getCoverageStatistics();
  }),

  /**
   * Get coverage gaps (regulations with no news) (admin-only)
   */
  getGaps: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only administrators can view coverage analytics",
      });
    }

    return await getCoverageGaps();
  }),
});
