/**
 * Evaluation Harness Tests
 */

import { describe, it, expect, vi } from 'vitest';

// Mock logger
vi.mock('../_core/logger-wiring', () => ({
  serverLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import {
  evaluateResponse,
  generateReport,
  detectRegressions,
  getEvaluationStats,
  GOLDEN_SET,
  type GoldenSetTestCase,
  type AskISAResponse,
} from './evaluation-harness';

describe('Evaluation Harness', () => {
  describe('Golden Set', () => {
    it('should have at least 40 test cases', () => {
      expect(GOLDEN_SET.length).toBeGreaterThanOrEqual(40);
    });

    it('should have test cases for all categories', () => {
      const categories = new Set(GOLDEN_SET.map(tc => tc.category));
      expect(categories.size).toBeGreaterThanOrEqual(5);
      expect(categories.has('regulation')).toBe(true);
      expect(categories.has('standard')).toBe(true);
      expect(categories.has('compliance')).toBe(true);
    });

    it('should have test cases for all difficulty levels', () => {
      const difficulties = new Set(GOLDEN_SET.map(tc => tc.difficulty));
      expect(difficulties.has('basic')).toBe(true);
      expect(difficulties.has('intermediate')).toBe(true);
      expect(difficulties.has('advanced')).toBe(true);
    });

    it('should have valid test case structure', () => {
      for (const tc of GOLDEN_SET) {
        expect(tc.id).toBeTruthy();
        expect(tc.question).toBeTruthy();
        expect(tc.mustMentionKeywords.length).toBeGreaterThan(0);
        expect(tc.minCitationCount).toBeGreaterThan(0);
      }
    });
  });

  describe('evaluateResponse', () => {
    const sampleTestCase: GoldenSetTestCase = {
      id: 'test-001',
      question: 'What is CSRD?',
      category: 'regulation',
      difficulty: 'basic',
      expectedTopics: ['CSRD'],
      expectedRegulations: ['CSRD'],
      minAuthorityLevel: 'official',
      mustMentionKeywords: ['Corporate Sustainability Reporting Directive', 'companies'],
      minCitationCount: 1,
    };

    it('should pass a good response', () => {
      const response: AskISAResponse = {
        answer: 'The Corporate Sustainability Reporting Directive (CSRD) is an EU regulation that requires large companies to report on sustainability matters. It expands the scope of the previous NFRD.',
        sources: [
          { id: 1, title: 'CSRD Regulation', similarity: 90, authorityLevel: 'official', authorityScore: 1.0 },
        ],
        confidence: { score: 0.85, level: 'high' },
        authority: { score: 1.0, level: 'official' },
        claimVerification: {
          totalClaims: 2,
          verifiedClaims: 2,
          unverifiedClaims: 0,
          verificationRate: 1.0,
          overallScore: 0.9,
          claimResults: [],
          warnings: [],
          recommendations: [],
        },
      };

      const result = evaluateResponse(sampleTestCase, response, 500);

      expect(result.passed).toBe(true);
      expect(result.score).toBeGreaterThan(0.6);
      expect(result.issues).toHaveLength(0);
    });

    it('should fail a response with missing keywords', () => {
      const response: AskISAResponse = {
        answer: 'CSRD is a regulation about sustainability.',
        sources: [
          { id: 1, title: 'CSRD Regulation', similarity: 90, authorityLevel: 'official' },
        ],
        confidence: { score: 0.5, level: 'medium' },
      };

      const result = evaluateResponse(sampleTestCase, response, 500);

      expect(result.passed).toBe(false);
      expect(result.metrics.keywordCoverage).toBeLessThan(1);
      expect(result.issues.some(i => i.includes('keyword'))).toBe(true);
    });

    it('should fail a response with insufficient citations', () => {
      const testCaseWithMoreCitations: GoldenSetTestCase = {
        ...sampleTestCase,
        minCitationCount: 3,
      };

      const response: AskISAResponse = {
        answer: 'The Corporate Sustainability Reporting Directive requires companies to report.',
        sources: [
          { id: 1, title: 'CSRD Regulation', similarity: 90, authorityLevel: 'official' },
        ],
        confidence: { score: 0.7, level: 'medium' },
      };

      const result = evaluateResponse(testCaseWithMoreCitations, response, 500);

      expect(result.issues.some(i => i.includes('citation'))).toBe(true);
    });

    it('should penalize low authority sources', () => {
      const response: AskISAResponse = {
        answer: 'The Corporate Sustainability Reporting Directive requires companies to report on sustainability.',
        sources: [
          { id: 1, title: 'Blog Post', similarity: 90, authorityLevel: 'community', authorityScore: 0.3 },
        ],
        confidence: { score: 0.5, level: 'medium' },
      };

      const result = evaluateResponse(sampleTestCase, response, 500);

      expect(result.metrics.authorityScore).toBeLessThan(0.5);
      expect(result.issues.some(i => i.includes('Authority'))).toBe(true);
    });

    it('should check for deadline requirements', () => {
      const testCaseWithDeadline: GoldenSetTestCase = {
        ...sampleTestCase,
        requiresDeadline: true,
      };

      const responseWithoutDeadline: AskISAResponse = {
        answer: 'The Corporate Sustainability Reporting Directive requires companies to report on sustainability matters.',
        sources: [
          { id: 1, title: 'CSRD Regulation', similarity: 90, authorityLevel: 'official' },
        ],
        confidence: { score: 0.7, level: 'medium' },
      };

      const result = evaluateResponse(testCaseWithDeadline, responseWithoutDeadline, 500);

      expect(result.issues.some(i => i.includes('deadline'))).toBe(true);
    });
  });

  describe('generateReport', () => {
    it('should generate a valid report structure', () => {
      const results = [
        {
          testCase: GOLDEN_SET[0],
          passed: true,
          score: 0.85,
          metrics: { keywordCoverage: 1, citationCount: 2, authorityScore: 1, responseLength: 200, claimVerificationRate: 1 },
          issues: [],
          warnings: [],
          duration: 500,
        },
        {
          testCase: GOLDEN_SET[1],
          passed: false,
          score: 0.45,
          metrics: { keywordCoverage: 0.5, citationCount: 1, authorityScore: 0.5, responseLength: 100, claimVerificationRate: 0.5 },
          issues: ['Low keyword coverage'],
          warnings: [],
          duration: 600,
        },
      ];

      const report = generateReport(results);

      expect(report.totalTests).toBe(2);
      expect(report.passed).toBe(1);
      expect(report.failed).toBe(1);
      expect(report.passRate).toBe(0.5);
      expect(report.timestamp).toBeTruthy();
    });

    it('should generate recommendations for weak areas', () => {
      const results = GOLDEN_SET.slice(0, 5).map(tc => ({
        testCase: tc,
        passed: false,
        score: 0.3,
        metrics: { keywordCoverage: 0.3, citationCount: 0, authorityScore: 0.3, responseLength: 50, claimVerificationRate: 0.3 },
        issues: ['Low keyword coverage: 30%'],
        warnings: [],
        duration: 500,
      }));

      const report = generateReport(results);

      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('detectRegressions', () => {
    it('should detect pass rate regression', () => {
      const current = {
        timestamp: new Date().toISOString(),
        totalTests: 10,
        passed: 5,
        failed: 5,
        passRate: 0.5,
        averageScore: 0.5,
        byCategory: {},
        byDifficulty: {},
        results: [],
        regressions: [],
        improvements: [],
        recommendations: [],
      };

      const previous = {
        ...current,
        passed: 8,
        failed: 2,
        passRate: 0.8,
      };

      const { regressions, improvements } = detectRegressions(current, previous);

      expect(regressions.some(r => r.includes('Pass rate'))).toBe(true);
    });

    it('should detect improvements', () => {
      const current = {
        timestamp: new Date().toISOString(),
        totalTests: 10,
        passed: 9,
        failed: 1,
        passRate: 0.9,
        averageScore: 0.85,
        byCategory: {},
        byDifficulty: {},
        results: [],
        regressions: [],
        improvements: [],
        recommendations: [],
      };

      const previous = {
        ...current,
        passed: 5,
        failed: 5,
        passRate: 0.5,
      };

      const { regressions, improvements } = detectRegressions(current, previous);

      expect(improvements.some(i => i.includes('improved'))).toBe(true);
    });
  });

  describe('getEvaluationStats', () => {
    it('should return valid statistics', () => {
      const stats = getEvaluationStats();

      expect(stats.total).toBe(GOLDEN_SET.length);
      expect(Object.keys(stats.byCategory).length).toBeGreaterThan(0);
      expect(Object.keys(stats.byDifficulty).length).toBe(3);
    });
  });
});
