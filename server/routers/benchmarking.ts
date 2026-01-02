import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { scoreHistory, scoringBenchmarks } from "../../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";

/**
 * Benchmarking Router
 * Provides score history and industry benchmarking
 */

export const benchmarkingRouter = router({
  /**
   * Get score history for a date range
   */
  getScoreHistory: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().default(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db
        .select()
        .from(scoreHistory)
        .where(eq(scoreHistory.userId, ctx.user.id));

      if (input.startDate || input.endDate) {
        const conditions = [];
        if (input.startDate) {
          conditions.push(gte(scoreHistory.createdAt, input.startDate.toISOString()));
        }
        if (input.endDate) {
          conditions.push(lte(scoreHistory.createdAt, input.endDate.toISOString()));
        }
        if (conditions.length > 0) {
          query = db
            .select()
            .from(scoreHistory)
            .where(and(eq(scoreHistory.userId, ctx.user.id), ...conditions));
        }
      }

      const history = await query.limit(input.limit);

      return history.map(h => ({
        id: h.id,
        overallScore: parseFloat(h.overallScore as any),
        riskManagementScore: parseFloat(h.riskManagementScore as any),
        remediationScore: parseFloat(h.remediationScore as any),
        evidenceScore: parseFloat(h.evidenceScore as any),
        regulationScore: parseFloat(h.regulationScore as any),
        changeReason: h.changeReason,
        createdAt: h.createdAt,
      }));
    }),

  /**
   * Get score statistics for a date range
   */
  getScoreStats: protectedProcedure
    .input(
      z.object({
        days: z.number().default(30),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - input.days);

      const history = await db
        .select()
        .from(scoreHistory)
        .where(
          and(
            eq(scoreHistory.userId, ctx.user.id),
            gte(scoreHistory.createdAt, cutoffDate.toISOString())
          )
        );

      if (history.length === 0) {
        return {
          count: 0,
          avgOverallScore: 0,
          avgRiskManagementScore: 0,
          avgRemediationScore: 0,
          avgEvidenceScore: 0,
          avgRegulationScore: 0,
          minOverallScore: 0,
          maxOverallScore: 0,
          trend: "stable",
        };
      }

      const scores = history.map(h => parseFloat(h.overallScore as any));
      const riskScores = history.map(h =>
        parseFloat(h.riskManagementScore as any)
      );
      const remediationScores = history.map(h =>
        parseFloat(h.remediationScore as any)
      );
      const evidenceScores = history.map(h =>
        parseFloat(h.evidenceScore as any)
      );
      const regulationScores = history.map(h =>
        parseFloat(h.regulationScore as any)
      );

      const avgOverallScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const avgRiskManagementScore =
        riskScores.reduce((a, b) => a + b, 0) / riskScores.length;
      const avgRemediationScore =
        remediationScores.reduce((a, b) => a + b, 0) / remediationScores.length;
      const avgEvidenceScore =
        evidenceScores.reduce((a, b) => a + b, 0) / evidenceScores.length;
      const avgRegulationScore =
        regulationScores.reduce((a, b) => a + b, 0) / regulationScores.length;

      const minOverallScore = Math.min(...scores);
      const maxOverallScore = Math.max(...scores);

      // Determine trend
      const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
      const secondHalf = scores.slice(Math.floor(scores.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg =
        secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      const trend =
        secondAvg > firstAvg
          ? "improving"
          : secondAvg < firstAvg
            ? "declining"
            : "stable";

      return {
        count: history.length,
        avgOverallScore: Math.round(avgOverallScore * 100) / 100,
        avgRiskManagementScore: Math.round(avgRiskManagementScore * 100) / 100,
        avgRemediationScore: Math.round(avgRemediationScore * 100) / 100,
        avgEvidenceScore: Math.round(avgEvidenceScore * 100) / 100,
        avgRegulationScore: Math.round(avgRegulationScore * 100) / 100,
        minOverallScore: Math.round(minOverallScore * 100) / 100,
        maxOverallScore: Math.round(maxOverallScore * 100) / 100,
        trend,
      };
    }),

  /**
   * Get industry benchmarks
   */
  getBenchmarks: protectedProcedure
    .input(
      z.object({
        industry: z.string().optional(),
        region: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let benchmarks;
      if (input.industry && input.region) {
        benchmarks = await db
          .select()
          .from(scoringBenchmarks)
          .where(
            and(
              eq(scoringBenchmarks.industry, input.industry),
              eq(scoringBenchmarks.region, input.region)
            )
          )
          .limit(10);
      } else if (input.industry) {
        benchmarks = await db
          .select()
          .from(scoringBenchmarks)
          .where(eq(scoringBenchmarks.industry, input.industry))
          .limit(10);
      } else if (input.region) {
        benchmarks = await db
          .select()
          .from(scoringBenchmarks)
          .where(eq(scoringBenchmarks.region, input.region))
          .limit(10);
      } else {
        benchmarks = await db.select().from(scoringBenchmarks).limit(10);
      }

      return benchmarks.map(b => ({
        id: b.id,
        industry: b.industry,
        region: b.region,
        avgOverallScore: parseFloat(b.avgOverallScore as any),
        avgRiskManagementScore: parseFloat(b.avgRiskManagementScore as any),
        avgRemediationScore: parseFloat(b.avgRemediationScore as any),
        avgEvidenceScore: parseFloat(b.avgEvidenceScore as any),
        avgRegulationScore: parseFloat(b.avgRegulationScore as any),
        percentile75: parseFloat(b.percentile75 as any),
        percentile90: parseFloat(b.percentile90 as any),
        dataPoints: b.dataPoints,
      }));
    }),

  /**
   * Get score comparison against benchmarks
   */
  compareWithBenchmark: protectedProcedure
    .input(
      z.object({
        industry: z.string(),
        region: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get user's current score
      const userHistory = await db
        .select()
        .from(scoreHistory)
        .where(eq(scoreHistory.userId, ctx.user.id))
        .limit(1);

      if (userHistory.length === 0) {
        return null;
      }

      const userScore = userHistory[0];

      // Get benchmark
      const benchmarks = await db
        .select()
        .from(scoringBenchmarks)
        .where(
          and(
            eq(scoringBenchmarks.industry, input.industry),
            eq(scoringBenchmarks.region, input.region)
          )
        )
        .limit(1);

      if (benchmarks.length === 0) {
        return null;
      }

      const benchmark = benchmarks[0];

      const userOverallScore = parseFloat(userScore.overallScore as any);
      const benchmarkAvg = parseFloat(benchmark.avgOverallScore as any);
      const percentile75 = parseFloat(benchmark.percentile75 as any);
      const percentile90 = parseFloat(benchmark.percentile90 as any);

      return {
        userScore: {
          overall: userOverallScore,
          riskManagement: parseFloat(userScore.riskManagementScore as any),
          remediation: parseFloat(userScore.remediationScore as any),
          evidence: parseFloat(userScore.evidenceScore as any),
          regulation: parseFloat(userScore.regulationScore as any),
        },
        benchmark: {
          industry: benchmark.industry,
          region: benchmark.region,
          avgOverallScore: benchmarkAvg,
          avgRiskManagementScore: parseFloat(
            benchmark.avgRiskManagementScore as any
          ),
          avgRemediationScore: parseFloat(benchmark.avgRemediationScore as any),
          avgEvidenceScore: parseFloat(benchmark.avgEvidenceScore as any),
          avgRegulationScore: parseFloat(benchmark.avgRegulationScore as any),
          percentile75,
          percentile90,
        },
        comparison: {
          vsAverage: userOverallScore - benchmarkAvg,
          vsPercentile75: userOverallScore - percentile75,
          vsPercentile90: userOverallScore - percentile90,
          percentileRank:
            userOverallScore >= percentile90
              ? "top 10%"
              : userOverallScore >= percentile75
                ? "top 25%"
                : "below 75th",
        },
      };
    }),

  /**
   * Get all available industries and regions for benchmarking
   */
  getBenchmarkCategories: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const benchmarks = await db.select().from(scoringBenchmarks);

    const industries = Array.from(new Set(benchmarks.map(b => b.industry)));
    const regions = Array.from(new Set(benchmarks.map(b => b.region)));

    return {
      industries,
      regions,
    };
  }),
});
