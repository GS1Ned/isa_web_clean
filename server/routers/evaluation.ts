/**
 * Evaluation Router
 * 
 * Backend procedures for running Ask ISA evaluation tests
 * against the golden set of curated questions.
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { serverLogger } from "../_core/logger-wiring";
import {
  GOLDEN_SET,
  getGoldenSetStats,
  type GoldenSetTestCase,
} from "../evaluation/golden-set";
import {
  evaluateResponse,
  generateReport,
  type TestCaseResult,
  type EvaluationReport,
  type AskISAResponse,
} from "../evaluation/evaluation-harness";
import { hybridSearch, buildContextFromHybridResults } from "../hybrid-search";
import { invokeLLM } from "../_core/llm";
import { assembleAskISAPrompt } from "../prompts/ask_isa";
import { verifyResponseClaims } from "../claim-citation-verifier";
import { calculateAuthorityScore } from "../authority-model";
import { saveEvaluationReport, getAllEvaluationReports, getLatestEvaluationReport, compareReports } from "../evaluation-history";

/**
 * Run a single test case against Ask ISA
 */
async function runTestCase(testCase: GoldenSetTestCase): Promise<TestCaseResult> {
  const startTime = Date.now();
  
  try {
    // 1. Run hybrid search
    const searchResults = await hybridSearch(testCase.question, { limit: 8 });
    
    // 2. Build context and chunks for prompt
    const relevantChunks = searchResults.map((r, i) => ({
      id: i + 1,
      sourceType: r.type as 'regulation' | 'standard',
      title: r.title,
      content: r.description || "",
      url: r.url,
      similarity: Math.round(r.hybridScore * 100),
    }));
    
    // 3. Calculate authority
    const authorityScore = calculateAuthorityScore(
      searchResults.map(r => ({
        authorityLevel: r.authorityLevel,
        authorityScore: r.authorityScore,
      }))
    );
    
    // 4. Assemble prompt
    const prompt = assembleAskISAPrompt({
      question: testCase.question,
      relevantChunks,
      conversationHistory: [],
    });
    
    // 5. Call LLM
    const llmResponse = await invokeLLM({
      messages: [
        { role: "user", content: prompt }
      ],
    });
    
    const rawContent = llmResponse.choices[0]?.message?.content;
    const answer = typeof rawContent === "string" ? rawContent : "";
    
    // 6. Verify claims
    const claimVerification = verifyResponseClaims(
      answer,
      searchResults.map((r, i) => ({
        id: i + 1,
        title: r.title,
        content: r.description || "",
      }))
    );
    
    // 7. Build response object
    const response: AskISAResponse = {
      answer,
      sources: searchResults.map((r, i) => ({
        id: i + 1,
        title: r.title,
        url: r.url,
        similarity: r.hybridScore,
        authorityLevel: r.authorityLevel,
        authorityScore: r.authorityScore,
      })),
      confidence: {
        score: 0.8,
        level: "high",
      },
      authority: {
        score: authorityScore.score,
        level: authorityScore.level,
      },
      claimVerification,
    };
    
    const duration = Date.now() - startTime;
    
    // 8. Evaluate response
    return evaluateResponse(testCase, response, duration);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    serverLogger.error("Test case execution failed", {
      testCaseId: testCase.id,
      error: error instanceof Error ? error.message : String(error),
    });
    
    return {
      testCase,
      passed: false,
      score: 0,
      metrics: {
        keywordCoverage: 0,
        citationCount: 0,
        authorityScore: 0,
        responseLength: 0,
        claimVerificationRate: 0,
      },
      issues: [`Execution error: ${error instanceof Error ? error.message : String(error)}`],
      warnings: [],
      duration,
    };
  }
}

export const evaluationRouter = router({
  /**
   * Get golden set statistics
   */
  getStats: protectedProcedure.query(async () => {
    return getGoldenSetStats();
  }),
  
  /**
   * Get all golden set test cases
   */
  getTestCases: protectedProcedure.query(async () => {
    return GOLDEN_SET.map(tc => ({
      id: tc.id,
      question: tc.question,
      category: tc.category,
      difficulty: tc.difficulty,
      mustMentionKeywords: tc.mustMentionKeywords,
      minCitationCount: tc.minCitationCount,
      minAuthorityLevel: tc.minAuthorityLevel,
    }));
  }),
  
  /**
   * Run evaluation on a subset of test cases
   */
  runEvaluation: protectedProcedure
    .input(z.object({
      testCaseIds: z.array(z.string()).optional(),
      category: z.string().optional(),
      difficulty: z.enum(["basic", "intermediate", "advanced"]).optional(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .mutation(async ({ input, ctx }) => {
      // Check if user is admin
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can run evaluations",
        });
      }
      
      serverLogger.info("Starting evaluation run", {
        userId: ctx.user.id,
        input,
      });
      
      // Filter test cases
      let testCases = [...GOLDEN_SET];
      
      if (input.testCaseIds && input.testCaseIds.length > 0) {
        testCases = testCases.filter(tc => input.testCaseIds!.includes(tc.id));
      }
      
      if (input.category) {
        testCases = testCases.filter(tc => tc.category === input.category);
      }
      
      if (input.difficulty) {
        testCases = testCases.filter(tc => tc.difficulty === input.difficulty);
      }
      
      // Limit number of tests
      testCases = testCases.slice(0, input.limit);
      
      if (testCases.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No test cases match the specified criteria",
        });
      }
      
      // Run tests sequentially to avoid rate limiting
      const results: TestCaseResult[] = [];
      
      for (const testCase of testCases) {
        serverLogger.info("Running test case", { testCaseId: testCase.id });
        const result = await runTestCase(testCase);
        results.push(result);
        
        // Small delay between tests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Generate report
      const baseReport = generateReport(results);
      
      // Calculate average metrics from results
      const avgKeywordCoverage = results.reduce((sum, r) => sum + r.metrics.keywordCoverage, 0) / results.length;
      const avgCitationCount = results.reduce((sum, r) => sum + r.metrics.citationCount, 0) / results.length;
      const avgAuthorityScore = results.reduce((sum, r) => sum + r.metrics.authorityScore, 0) / results.length;
      const avgClaimVerificationRate = results.reduce((sum, r) => sum + r.metrics.claimVerificationRate, 0) / results.length;
      const avgResponseTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
      
      // Compare with previous report for regressions
      const previousReport = await getLatestEvaluationReport();
      let regressions: string[] = [];
      let improvements: string[] = [];
      
      if (previousReport) {
        const comparison = compareReports({
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          totalTests: baseReport.totalTests,
          passed: baseReport.passed,
          failed: baseReport.failed,
          averageScore: baseReport.averageScore,
          averageMetrics: {
            keywordCoverage: avgKeywordCoverage,
            citationCount: avgCitationCount,
            authorityScore: avgAuthorityScore,
            claimVerificationRate: avgClaimVerificationRate,
            responseTime: avgResponseTime,
          },
          byCategory: baseReport.byCategory,
          byDifficulty: baseReport.byDifficulty,
          results: baseReport.results,
          regressions: [],
          improvements: [],
          runBy: ctx.user.name || ctx.user.email || 'Unknown',
        }, previousReport);
        
        regressions = comparison.regressions;
        improvements = comparison.improvements;
      }
      
      // Create full report with history comparison
      const report = {
        ...baseReport,
        regressions,
        improvements,
      };
      
      // Save to file-based history
      await saveEvaluationReport({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        totalTests: report.totalTests,
        passed: report.passed,
        failed: report.failed,
        averageScore: report.averageScore,
        averageMetrics: {
          keywordCoverage: avgKeywordCoverage,
          citationCount: avgCitationCount,
          authorityScore: avgAuthorityScore,
          claimVerificationRate: avgClaimVerificationRate,
          responseTime: avgResponseTime,
        },
        byCategory: report.byCategory,
        byDifficulty: report.byDifficulty,
        results: report.results,
        regressions,
        improvements,
        runBy: ctx.user.name || ctx.user.email || 'Unknown',
      });
      
      serverLogger.info("Evaluation complete", {
        totalTests: report.totalTests,
        passed: report.passed,
        failed: report.failed,
        passRate: report.passRate,
      });
      
      return report;
    }),
  
  /**
   * Get evaluation history
   */
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view evaluation history",
      });
    }
    
    return getAllEvaluationReports();
  }),
  
  /**
   * Get latest evaluation report
   */
  getLatest: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view evaluation history",
      });
    }
    
    return getLatestEvaluationReport();
  }),
  
  /**
   * Run a single test case
   */
  runSingleTest: protectedProcedure
    .input(z.object({
      testCaseId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can run evaluations",
        });
      }
      
      const testCase = GOLDEN_SET.find(tc => tc.id === input.testCaseId);
      
      if (!testCase) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Test case "${input.testCaseId}" not found`,
        });
      }
      
      return runTestCase(testCase);
    }),
});
