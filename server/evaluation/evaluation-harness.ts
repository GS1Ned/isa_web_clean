/**
 * Evaluation Harness for Ask ISA
 * 
 * Automated testing framework to evaluate Ask ISA response quality
 * against the golden set of test questions.
 */

import { serverLogger } from '../_core/logger-wiring';
import { type GoldenSetTestCase, GOLDEN_SET, getGoldenSetStats } from './golden-set';
import { type AuthorityLevel, AUTHORITY_LEVELS } from '../authority-model';
import { type VerificationSummary } from '../claim-citation-verifier';

/**
 * Result of evaluating a single test case
 */
export interface TestCaseResult {
  testCase: GoldenSetTestCase;
  passed: boolean;
  score: number;
  metrics: {
    keywordCoverage: number;
    citationCount: number;
    authorityScore: number;
    responseLength: number;
    claimVerificationRate: number;
  };
  issues: string[];
  warnings: string[];
  duration: number;
}

/**
 * Overall evaluation report
 */
export interface EvaluationReport {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  passRate: number;
  averageScore: number;
  
  // Breakdown by category
  byCategory: Record<string, {
    total: number;
    passed: number;
    avgScore: number;
  }>;
  
  // Breakdown by difficulty
  byDifficulty: Record<string, {
    total: number;
    passed: number;
    avgScore: number;
  }>;
  
  // Individual results
  results: TestCaseResult[];
  
  // Regression detection
  regressions: string[];
  improvements: string[];
  
  // Recommendations
  recommendations: string[];
}

/**
 * Response structure from Ask ISA
 */
export interface AskISAResponse {
  answer: string;
  sources: Array<{
    id: number;
    title: string;
    url?: string;
    similarity: number;
    authorityLevel?: AuthorityLevel;
    authorityScore?: number;
  }>;
  confidence: {
    score: number;
    level: string;
  };
  authority?: {
    score: number;
    level: AuthorityLevel;
  };
  claimVerification?: VerificationSummary;
}

/**
 * Evaluate a single response against a test case
 */
export function evaluateResponse(
  testCase: GoldenSetTestCase,
  response: AskISAResponse,
  duration: number
): TestCaseResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  let score = 0;
  
  // 1. Keyword Coverage (30% of score)
  const keywordCoverage = calculateKeywordCoverage(
    response.answer,
    testCase.mustMentionKeywords
  );
  score += keywordCoverage * 0.3;
  
  if (keywordCoverage < 0.5) {
    issues.push(`Low keyword coverage: ${Math.round(keywordCoverage * 100)}%`);
  } else if (keywordCoverage < 0.8) {
    warnings.push(`Keyword coverage could be improved: ${Math.round(keywordCoverage * 100)}%`);
  }
  
  // Check for forbidden keywords
  if (testCase.mustNotMention) {
    for (const forbidden of testCase.mustNotMention) {
      if (response.answer.toLowerCase().includes(forbidden.toLowerCase())) {
        issues.push(`Response contains forbidden keyword: "${forbidden}"`);
        score -= 0.1;
      }
    }
  }
  
  // 2. Citation Count (20% of score)
  const citationCount = response.sources.length;
  const citationScore = Math.min(1, citationCount / testCase.minCitationCount);
  score += citationScore * 0.2;
  
  if (citationCount < testCase.minCitationCount) {
    issues.push(`Insufficient citations: ${citationCount} < ${testCase.minCitationCount}`);
  }
  
  // 3. Authority Score (20% of score)
  const authorityScore = calculateAuthorityScore(
    response.sources,
    testCase.minAuthorityLevel
  );
  score += authorityScore * 0.2;
  
  if (authorityScore < 0.5) {
    issues.push(`Authority level below requirement: expected ${testCase.minAuthorityLevel}`);
  }
  
  // 4. Claim Verification (15% of score)
  const claimVerificationRate = response.claimVerification?.verificationRate ?? 1;
  score += claimVerificationRate * 0.15;
  
  if (claimVerificationRate < 0.5) {
    warnings.push(`Low claim verification rate: ${Math.round(claimVerificationRate * 100)}%`);
  }
  
  // 5. Response Quality (15% of score)
  const responseLength = response.answer.length;
  let qualityScore = 1;
  
  // Check for minimum length (at least 100 chars for meaningful response)
  if (responseLength < 100) {
    qualityScore -= 0.3;
    issues.push('Response too short');
  }
  
  // Check for maximum length if specified
  if (testCase.maxResponseLength && responseLength > testCase.maxResponseLength) {
    qualityScore -= 0.2;
    warnings.push(`Response exceeds max length: ${responseLength} > ${testCase.maxResponseLength}`);
  }
  
  // Check for specific requirements
  if (testCase.requiresDeadline && !hasDeadline(response.answer)) {
    qualityScore -= 0.2;
    issues.push('Response missing required deadline information');
  }
  
  if (testCase.requiresNumericalData && !hasNumericalData(response.answer)) {
    qualityScore -= 0.2;
    issues.push('Response missing required numerical data');
  }
  
  if (testCase.requiresSpecificArticle && !hasArticleReference(response.answer)) {
    qualityScore -= 0.2;
    warnings.push('Response missing specific article reference');
  }
  
  score += Math.max(0, qualityScore) * 0.15;
  
  // Determine pass/fail
  const passed = score >= 0.6 && issues.length === 0;
  
  return {
    testCase,
    passed,
    score: Math.round(score * 100) / 100,
    metrics: {
      keywordCoverage: Math.round(keywordCoverage * 100) / 100,
      citationCount,
      authorityScore: Math.round(authorityScore * 100) / 100,
      responseLength,
      claimVerificationRate: Math.round(claimVerificationRate * 100) / 100,
    },
    issues,
    warnings,
    duration,
  };
}

/**
 * Calculate keyword coverage
 */
function calculateKeywordCoverage(text: string, keywords: string[]): number {
  if (keywords.length === 0) return 1;
  
  const lowerText = text.toLowerCase();
  let found = 0;
  
  for (const keyword of keywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      found++;
    }
  }
  
  return found / keywords.length;
}

/**
 * Calculate authority score based on sources
 */
function calculateAuthorityScore(
  sources: Array<{ authorityLevel?: AuthorityLevel; authorityScore?: number }>,
  minLevel: AuthorityLevel
): number {
  if (sources.length === 0) return 0;
  
  const minScore = AUTHORITY_LEVELS[minLevel].score;
  
  // Check if any source meets the minimum authority level
  const meetsMinimum = sources.some(s => {
    const sourceScore = s.authorityScore ?? AUTHORITY_LEVELS[s.authorityLevel || 'industry'].score;
    return sourceScore >= minScore;
  });
  
  if (!meetsMinimum) return 0.3;
  
  // Calculate average authority score
  const avgScore = sources.reduce((sum, s) => {
    return sum + (s.authorityScore ?? AUTHORITY_LEVELS[s.authorityLevel || 'industry'].score);
  }, 0) / sources.length;
  
  return avgScore;
}

/**
 * Check if response contains deadline information
 */
function hasDeadline(text: string): boolean {
  return /\b(20\d{2}|January|February|March|April|May|June|July|August|September|October|November|December)\b/i.test(text) &&
         /\b(deadline|by|before|from|until|effective|entry into force)\b/i.test(text);
}

/**
 * Check if response contains numerical data
 */
function hasNumericalData(text: string): boolean {
  return /\d+(?:\.\d+)?%|\d{1,3}(?:,\d{3})+|\d+\s+(?:companies|employees|entities|products)/i.test(text);
}

/**
 * Check if response contains article reference
 */
function hasArticleReference(text: string): boolean {
  return /Article\s+\d+|Section\s+\d+|Chapter\s+\d+|Annex\s+[A-Z0-9]+/i.test(text);
}

/**
 * Generate evaluation report from results
 */
export function generateReport(results: TestCaseResult[]): EvaluationReport {
  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;
  
  // Calculate averages
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  
  // Breakdown by category
  const byCategory: Record<string, { total: number; passed: number; avgScore: number }> = {};
  for (const result of results) {
    const cat = result.testCase.category;
    if (!byCategory[cat]) {
      byCategory[cat] = { total: 0, passed: 0, avgScore: 0 };
    }
    byCategory[cat].total++;
    if (result.passed) byCategory[cat].passed++;
    byCategory[cat].avgScore += result.score;
  }
  for (const cat of Object.keys(byCategory)) {
    byCategory[cat].avgScore = Math.round((byCategory[cat].avgScore / byCategory[cat].total) * 100) / 100;
  }
  
  // Breakdown by difficulty
  const byDifficulty: Record<string, { total: number; passed: number; avgScore: number }> = {};
  for (const result of results) {
    const diff = result.testCase.difficulty;
    if (!byDifficulty[diff]) {
      byDifficulty[diff] = { total: 0, passed: 0, avgScore: 0 };
    }
    byDifficulty[diff].total++;
    if (result.passed) byDifficulty[diff].passed++;
    byDifficulty[diff].avgScore += result.score;
  }
  for (const diff of Object.keys(byDifficulty)) {
    byDifficulty[diff].avgScore = Math.round((byDifficulty[diff].avgScore / byDifficulty[diff].total) * 100) / 100;
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  // Find weak categories
  for (const [cat, stats] of Object.entries(byCategory)) {
    if (stats.avgScore < 0.6) {
      recommendations.push(`Improve responses for "${cat}" category questions (avg score: ${stats.avgScore})`);
    }
  }
  
  // Find common issues
  const issueCounts: Record<string, number> = {};
  for (const result of results) {
    for (const issue of result.issues) {
      const key = issue.split(':')[0];
      issueCounts[key] = (issueCounts[key] || 0) + 1;
    }
  }
  
  for (const [issue, count] of Object.entries(issueCounts)) {
    if (count >= 3) {
      recommendations.push(`Address recurring issue: "${issue}" (${count} occurrences)`);
    }
  }
  
  return {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passed,
    failed,
    passRate: Math.round((passed / results.length) * 100) / 100,
    averageScore: Math.round(avgScore * 100) / 100,
    byCategory,
    byDifficulty,
    results,
    regressions: [], // Would be populated by comparing to previous run
    improvements: [],
    recommendations,
  };
}

/**
 * Compare two evaluation reports for regression detection
 */
export function detectRegressions(
  current: EvaluationReport,
  previous: EvaluationReport
): { regressions: string[]; improvements: string[] } {
  const regressions: string[] = [];
  const improvements: string[] = [];
  
  // Compare overall pass rate
  if (current.passRate < previous.passRate - 0.05) {
    regressions.push(`Pass rate decreased: ${previous.passRate * 100}% → ${current.passRate * 100}%`);
  } else if (current.passRate > previous.passRate + 0.05) {
    improvements.push(`Pass rate improved: ${previous.passRate * 100}% → ${current.passRate * 100}%`);
  }
  
  // Compare by category
  for (const [cat, currentStats] of Object.entries(current.byCategory)) {
    const prevStats = previous.byCategory[cat];
    if (prevStats) {
      if (currentStats.avgScore < prevStats.avgScore - 0.1) {
        regressions.push(`${cat} category score decreased: ${prevStats.avgScore} → ${currentStats.avgScore}`);
      } else if (currentStats.avgScore > prevStats.avgScore + 0.1) {
        improvements.push(`${cat} category score improved: ${prevStats.avgScore} → ${currentStats.avgScore}`);
      }
    }
  }
  
  // Compare individual test cases
  const prevResultMap = new Map(previous.results.map(r => [r.testCase.id, r]));
  for (const result of current.results) {
    const prevResult = prevResultMap.get(result.testCase.id);
    if (prevResult) {
      if (prevResult.passed && !result.passed) {
        regressions.push(`Test "${result.testCase.id}" now failing`);
      } else if (!prevResult.passed && result.passed) {
        improvements.push(`Test "${result.testCase.id}" now passing`);
      }
    }
  }
  
  return { regressions, improvements };
}

/**
 * Get golden set statistics
 */
export function getEvaluationStats() {
  return getGoldenSetStats();
}

/**
 * Export golden set for external use
 */
export { GOLDEN_SET, type GoldenSetTestCase };
