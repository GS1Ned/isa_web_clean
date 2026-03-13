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
  type AskISAResponse,
} from "../evaluation/evaluation-harness";
import { hybridSearch } from "../hybrid-search";
import { invokeLLM } from "../_core/llm";
import { assembleAskISAPrompt } from "../prompts/ask_isa";
import { verifyResponseClaims } from "../claim-citation-verifier";
import { validateCitations } from "../citation-validation";
import { validateAskISAStageAAnswer } from "../ask-isa-stage-a";
import { calculateAuthorityScore } from "../authority-model";
import { saveEvaluationReport, getAllEvaluationReports, getLatestEvaluationReport, compareReports } from "../evaluation-history";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const CAPABILITY_EVAL_ARTIFACT = join(process.cwd(), "test-results", "ci", "isa-capability-eval.json");
const CAPABILITY_DRIFT_ARTIFACT = join(process.cwd(), "test-results", "ci", "isa-drift-report.json");

function readArtifactIfPresent<T>(artifactPath: string): T | null {
  if (!existsSync(artifactPath)) return null;
  return JSON.parse(readFileSync(artifactPath, "utf8")) as T;
}

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

    const validatedSources = await validateCitations(
      searchResults.map(r => ({
        id: r.id,
        title: r.title,
        url: r.url,
        similarity: r.hybridScore,
      }))
    );

    const stageAValidation = validateAskISAStageAAnswer({
      answer,
      sourceCount: relevantChunks.length,
      evidenceReadySourceCount: validatedSources.filter(
        source => typeof source.evidenceKey === "string" && source.evidenceKey.length > 0
      ).length,
      verifiedEvidenceSourceCount: validatedSources.filter(
        source =>
          typeof source.evidenceKey === "string" &&
          source.evidenceKey.length > 0 &&
          !source.needsVerification &&
          !source.isDeprecated
      ).length,
      needsVerificationSourceCount: validatedSources.filter(
        source => source.needsVerification
      ).length,
      deprecatedSourceCount: validatedSources.filter(
        source => source.isDeprecated
      ).length,
      claimVerification,
    });
    
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
    const result = evaluateResponse(testCase, response, duration);

    if (!stageAValidation.passed) {
      result.passed = false;
      result.score = Math.min(result.score, 0.59);
      result.issues = Array.from(new Set([...stageAValidation.issues, ...result.issues]));
      result.warnings = Array.from(
        new Set([...stageAValidation.warnings, ...result.warnings])
      );
    }

    return result;
    
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
   * Get latest unified capability evaluation summary (all ISA capabilities)
   */
  getCapabilityEvaluationSummary: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view evaluation history",
      });
    }

    const evalArtifact = readArtifactIfPresent<{
      run_id?: string;
      generated_at?: string;
      stage?: string;
      isa_quality_score?: { value?: number; grade?: string; confidence?: string };
      capabilities?: Array<{
        capability: string;
        stage?: string;
        fixture_version?: string;
        status: string;
        capability_score: { value: number; grade: string };
      }>;
      summary?: {
        total_metrics: number;
        fail: number;
        blocking_failures: number;
        warning_failures: number;
      };
      status?: string;
    }>(CAPABILITY_EVAL_ARTIFACT);

    const driftArtifact = readArtifactIfPresent<{
      status?: string;
      stage?: string;
      summary?: { major?: number; minor?: number; transition?: number; none?: number };
    }>(CAPABILITY_DRIFT_ARTIFACT);

    if (!evalArtifact) {
      return {
        available: false,
        reason: `Artifact not found: ${CAPABILITY_EVAL_ARTIFACT}`,
      };
    }

    return {
      available: true,
      runId: evalArtifact.run_id ?? null,
      generatedAt: evalArtifact.generated_at ?? null,
      stage: evalArtifact.stage ?? null,
      isaQualityScore: evalArtifact.isa_quality_score ?? null,
      status: evalArtifact.status ?? "unknown",
      summary: evalArtifact.summary ?? null,
      capabilities: evalArtifact.capabilities ?? [],
      drift: driftArtifact ?? {
        status: "unknown",
        stage: null,
        summary: { major: 0, minor: 0, transition: 0, none: 0 },
      },
    };
  }),

  /**
   * Get raw capability evaluation + drift artifacts.
   */
  getCapabilityEvaluationArtifacts: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view evaluation history",
      });
    }

    return {
      capabilityEval: readArtifactIfPresent(CAPABILITY_EVAL_ARTIFACT),
      driftReport: readArtifactIfPresent(CAPABILITY_DRIFT_ARTIFACT),
    };
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
    
    const latestAskIsaReport = await getLatestEvaluationReport();
    const capabilityEval = readArtifactIfPresent<{
      run_id?: string;
      generated_at?: string;
      stage?: string;
      isa_quality_score?: { value?: number; grade?: string; confidence?: string };
      summary?: unknown;
      status?: string;
    }>(CAPABILITY_EVAL_ARTIFACT);
    const driftReport = readArtifactIfPresent<{
      status?: string;
      summary?: unknown;
    }>(CAPABILITY_DRIFT_ARTIFACT);

    return {
      askIsa: latestAskIsaReport,
      capabilityEvaluation: capabilityEval
        ? {
          runId: capabilityEval.run_id ?? null,
          generatedAt: capabilityEval.generated_at ?? null,
          stage: capabilityEval.stage ?? null,
          isaQualityScore: capabilityEval.isa_quality_score ?? null,
          summary: capabilityEval.summary ?? null,
            status: capabilityEval.status ?? "unknown",
          }
        : null,
      driftStatus: driftReport?.status ?? "unknown",
      driftSummary: driftReport?.summary ?? null,
    };
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
