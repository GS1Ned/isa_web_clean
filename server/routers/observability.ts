/**
 * Observability tRPC Router
 * 
 * Exposes pipeline execution metrics and monitoring data.
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  getRecentPipelineExecutions,
  getPipelineSuccessRate,
  getAverageAiQualityScore,
  getSourceHealthMetrics,
  getPipelinePerformanceMetrics,
  getQualityMetricsDistribution,
  getFailedExecutions,
} from "../db-pipeline-observability";

export const observabilityRouter = router({
  /**
   * Get recent pipeline executions
   */
  getRecentExecutions: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      return getRecentPipelineExecutions(input.limit);
    }),

  /**
   * Get pipeline success rate over time period
   */
  getSuccessRate: publicProcedure
    .input(
      z.object({
        days: z.number().min(1).max(365).default(7),
      })
    )
    .query(async ({ input }) => {
      return getPipelineSuccessRate(input.days);
    }),

  /**
   * Get average AI quality score
   */
  getAverageQualityScore: publicProcedure
    .input(
      z.object({
        days: z.number().min(1).max(365).default(7),
      })
    )
    .query(async ({ input }) => {
      return getAverageAiQualityScore(input.days);
    }),

  /**
   * Get source reliability metrics
   */
  getSourceReliability: publicProcedure
    .input(
      z.object({
        days: z.number().min(1).max(365).default(7),
      })
    )
    .query(async ({ input }) => {
      return getSourceHealthMetrics(input.days);
    }),

  /**
   * Get pipeline performance metrics
   */
  getPerformanceMetrics: publicProcedure
    .input(
      z.object({
        days: z.number().min(1).max(365).default(7),
      })
    )
    .query(async ({ input }) => {
      return getPipelinePerformanceMetrics(input.days);
    }),

  /**
   * Get quality metrics distribution
   */
  getQualityDistribution: publicProcedure
    .input(
      z.object({
        days: z.number().min(1).max(365).default(7),
      })
    )
    .query(async ({ input }) => {
      return getQualityMetricsDistribution(input.days);
    }),

  /**
   * Get failed executions for debugging
   */
  getFailedExecutions: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      return getFailedExecutions(input.limit);
    }),
});
