/**
 * tRPC Router for Pipeline Observability
 * 
 * Provides procedures for querying pipeline execution logs, metrics, and health data.
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  getRecentPipelineExecutions,
  getPipelineExecutionById,
  getPipelineExecutionsByDateRange,
  getPipelineSuccessRate,
  getAverageAiQualityScore,
  getAiQualityScoreTrend,
  getSourceHealthMetrics,
  getPipelinePerformanceMetrics,
  getQualityMetricsDistribution,
  getFailedExecutions,
} from "../db-pipeline-observability";

export const pipelineObservabilityRouter = router({
  /**
   * Get recent pipeline executions
   */
  getRecentExecutions: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      return await getRecentPipelineExecutions(input.limit);
    }),

  /**
   * Get pipeline execution by ID
   */
  getExecutionById: protectedProcedure
    .input(
      z.object({
        executionId: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await getPipelineExecutionById(input.executionId);
    }),

  /**
   * Get pipeline executions by date range
   */
  getExecutionsByDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.string(), // ISO 8601 date string
        endDate: z.string(),
        pipelineType: z.enum(['news_ingestion', 'news_archival']).optional(),
      })
    )
    .query(async ({ input }) => {
      return await getPipelineExecutionsByDateRange(
        input.startDate,
        input.endDate,
        input.pipelineType
      );
    }),

  /**
   * Get pipeline success rate over time period
   */
  getSuccessRate: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(7),
      })
    )
    .query(async ({ input }) => {
      return await getPipelineSuccessRate(input.days);
    }),

  /**
   * Get average AI quality score over time period
   */
  getAverageQualityScore: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(7),
      })
    )
    .query(async ({ input }) => {
      return await getAverageAiQualityScore(input.days);
    }),

  /**
   * Get AI quality score trend (daily averages)
   */
  getQualityScoreTrend: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(30),
      })
    )
    .query(async ({ input }) => {
      return await getAiQualityScoreTrend(input.days);
    }),

  /**
   * Get source reliability metrics
   */
  getSourceReliability: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(7),
      })
    )
    .query(async ({ input }) => {
      return await getSourceHealthMetrics(input.days);
    }),

  /**
   * Get pipeline performance metrics
   */
  getPerformanceMetrics: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(7),
      })
    )
    .query(async ({ input }) => {
      return await getPipelinePerformanceMetrics(input.days);
    }),

  /**
   * Get quality metrics distribution
   */
  getQualityDistribution: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(7),
      })
    )
    .query(async ({ input }) => {
      return await getQualityMetricsDistribution(input.days);
    }),

  /**
   * Get failed executions for debugging
   */
  getFailedExecutions: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      return await getFailedExecutions(input.limit);
    }),

  /**
   * Get observability dashboard summary
   */
  getDashboardSummary: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(7),
      })
    )
    .query(async ({ input }) => {
      const [
        successRate,
        avgQualityScore,
        sourceReliability,
        performanceMetrics,
        qualityDistribution,
        recentExecutions,
      ] = await Promise.all([
        getPipelineSuccessRate(input.days),
        getAverageAiQualityScore(input.days),
        getSourceHealthMetrics(input.days),
        getPipelinePerformanceMetrics(input.days),
        getQualityMetricsDistribution(input.days),
        getRecentPipelineExecutions(10),
      ]);

      return {
        successRate,
        avgQualityScore,
        sourceReliability,
        performanceMetrics,
        qualityDistribution,
        recentExecutions,
      };
    }),
});
