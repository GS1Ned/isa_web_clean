/**
 * Observability System Tests
 * 
 * Tests pipeline execution logging, metrics calculation, and dashboard data retrieval.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { getDb } from './db';
import { pipelineExecutionLog } from '../drizzle/schema';
import { 
  savePipelineExecutionLog,
  getRecentPipelineExecutions,
  getPipelineSuccessRate,
  getAverageAiQualityScore,
  getSourceHealthMetrics,
  getPipelinePerformanceMetrics,
  getQualityMetricsDistribution,
} from './db-pipeline-observability';
import { PipelineExecutionContext, calculateQualityScore } from './utils/pipeline-logger';

describe('Observability System', () => {
  const hasDb = Boolean(process.env.DATABASE_URL);
  const describeDb = hasDb ? describe : describe.skip;
  let testExecutionId: string;

  beforeAll(async () => {
    // Clean up any existing test data
    if (!hasDb) return;
    const db = await getDb();
    if (db) {
      await db.delete(pipelineExecutionLog).execute();
    }
  });

  describe('PipelineExecutionContext', () => {
    it('should create execution context with unique ID', () => {
      const ctx = new PipelineExecutionContext('news_ingestion', 'manual');
      
      expect(ctx.executionId).toBeDefined();
      expect(ctx.executionId).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
      expect(ctx.pipelineType).toBe('news_ingestion');
      expect(ctx.triggeredBy).toBe('manual');
    });

    it('should track source fetch attempts', () => {
      const ctx = new PipelineExecutionContext('news_ingestion', 'cron');
      
      ctx.recordSourceAttempt('source1', true, 10);
      ctx.recordSourceAttempt('source2', true, 5);
      ctx.recordSourceAttempt('source3', false);
      
      const summary = ctx.getSummary();
      expect(summary.sourcesAttempted).toBe(3);
      expect(summary.sourcesSucceeded).toBe(2);
      expect(summary.sourcesFailed).toBe(1);
      expect(summary.itemsFetched).toBe(15);
    });

    it('should track AI processing with quality scores', () => {
      const ctx = new PipelineExecutionContext('news_ingestion', 'api');
      
      ctx.recordAiProcessing(true, 0.85);
      ctx.recordAiProcessing(true, 0.92);
      ctx.recordAiProcessing(false);
      
      const summary = ctx.getSummary();
      expect(summary.aiCallsMade).toBe(3);
      expect(summary.aiCallsSucceeded).toBe(2);
      expect(summary.aiCallsFailed).toBe(1);
      expect(summary.aiAvgQualityScore).toBeCloseTo(0.885, 2);
    });

    it('should track item processing with quality flags', () => {
      const ctx = new PipelineExecutionContext('news_ingestion', 'manual');
      
      ctx.recordItemProcessed(true, {
        hasSummary: true,
        hasRegulationTags: true,
        hasGs1ImpactTags: false,
        hasSectorTags: true,
        hasRecommendations: true,
      });
      
      ctx.recordItemProcessed(true, {
        hasSummary: true,
        hasRegulationTags: false,
        hasGs1ImpactTags: false,
        hasSectorTags: false,
        hasRecommendations: false,
      });
      
      const summary = ctx.getSummary();
      expect(summary.itemsProcessed).toBe(2);
      expect(summary.itemsSaved).toBe(2);
      expect(summary.itemsWithSummary).toBe(2);
      expect(summary.itemsWithRegulationTags).toBe(1);
      expect(summary.itemsWithGs1ImpactTags).toBe(0);
      expect(summary.itemsWithSectorTags).toBe(1);
      expect(summary.itemsWithRecommendations).toBe(1);
    });

    it('should complete pipeline and calculate duration', async () => {
      const ctx = new PipelineExecutionContext('news_ingestion', 'cron');
      
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 100));
      
      ctx.complete('success');
      
      const summary = ctx.getSummary();
      expect(summary.status).toBe('success');
      expect(summary.completedAt).toBeDefined();
      expect(summary.durationMs).toBeGreaterThanOrEqual(100);
    });
  });

  describe('Quality Score Calculation', () => {
    it('should calculate high quality score for complete item', () => {
      const score = calculateQualityScore({
        summary: 'This is a well-formed summary with multiple sentences. It provides clear information about the topic.',
        regulationTags: ['CSRD', 'ESRS'],
        gs1ImpactTags: ['supply-chain', 'traceability'],
        sectorTags: ['retail', 'logistics'],
        suggestedActions: ['action1', 'action2'],
        relatedStandardIds: ['std1', 'std2'],
      });
      
      expect(score).toBeGreaterThan(0.8);
      expect(score).toBeLessThanOrEqual(1.0);
    });

    it('should calculate low quality score for incomplete item', () => {
      const score = calculateQualityScore({
        summary: 'Short',
        regulationTags: [],
        gs1ImpactTags: [],
        sectorTags: [],
        suggestedActions: [],
        relatedStandardIds: [],
      });
      
      expect(score).toBeLessThan(0.3);
    });

    it('should calculate medium quality score for partial item', () => {
      const score = calculateQualityScore({
        summary: 'This is a decent summary with some information provided.',
        regulationTags: ['CSRD'],
        gs1ImpactTags: [],
        sectorTags: ['retail'],
        suggestedActions: [],
        relatedStandardIds: [],
      });
      
      expect(score).toBeGreaterThan(0.3);
      expect(score).toBeLessThan(0.7);
    });
  });

  describeDb('Database Operations', () => {
    it('should save pipeline execution log', async () => {
      const ctx = new PipelineExecutionContext('news_ingestion', 'manual');
      ctx.recordSourceAttempt('test-source', true, 5);
      ctx.recordAiProcessing(true, 0.9);
      ctx.recordItemProcessed(true, {
        hasSummary: true,
        hasRegulationTags: true,
        hasGs1ImpactTags: true,
        hasSectorTags: true,
        hasRecommendations: true,
      });
      ctx.complete('success');
      
      const summary = ctx.getSummary();
      testExecutionId = summary.executionId;
      
      await savePipelineExecutionLog(summary);
      
      // Verify it was saved
      const executions = await getRecentPipelineExecutions(1);
      expect(executions).toHaveLength(1);
      expect(executions[0].executionId).toBe(testExecutionId);
      expect(executions[0].status).toBe('success');
    });

    it('should retrieve recent pipeline executions', async () => {
      const executions = await getRecentPipelineExecutions(10);
      
      expect(Array.isArray(executions)).toBe(true);
      expect(executions.length).toBeGreaterThan(0);
      expect(executions[0]).toHaveProperty('executionId');
      expect(executions[0]).toHaveProperty('status');
      expect(executions[0]).toHaveProperty('durationMs');
    });

    it('should calculate pipeline success rate', async () => {
      const successRate = await getPipelineSuccessRate(7);
      
      expect(typeof successRate).toBe('number');
      expect(successRate).toBeGreaterThanOrEqual(0);
      expect(successRate).toBeLessThanOrEqual(100);
    });

    it('should calculate average AI quality score', async () => {
      const avgScore = await getAverageAiQualityScore(7);
      
      if (avgScore !== null) {
        expect(typeof avgScore).toBe('number');
        expect(avgScore).toBeGreaterThanOrEqual(0);
        expect(avgScore).toBeLessThanOrEqual(1);
      }
    });

    it('should calculate source reliability metrics', async () => {
      const metrics = await getSourceHealthMetrics(7);
      
      expect(metrics).toHaveProperty('totalAttempts');
      expect(metrics).toHaveProperty('totalSucceeded');
      expect(metrics).toHaveProperty('totalFailed');
      expect(metrics).toHaveProperty('successRate');
      expect(metrics.successRate).toBeGreaterThanOrEqual(0);
      expect(metrics.successRate).toBeLessThanOrEqual(100);
    });

    it('should calculate pipeline performance metrics', async () => {
      const metrics = await getPipelinePerformanceMetrics(7);
      
      expect(metrics).toHaveProperty('avgDurationMs');
      expect(metrics).toHaveProperty('avgItemsProcessed');
      expect(metrics).toHaveProperty('avgItemsSaved');
      expect(metrics).toHaveProperty('totalErrors');
    });

    it('should calculate quality metrics distribution', async () => {
      const distribution = await getQualityMetricsDistribution(7);
      
      expect(distribution).toHaveProperty('totalProcessed');
      expect(distribution).toHaveProperty('summaryRate');
      expect(distribution).toHaveProperty('regulationTagsRate');
      expect(distribution).toHaveProperty('gs1ImpactTagsRate');
      expect(distribution).toHaveProperty('sectorTagsRate');
      expect(distribution).toHaveProperty('recommendationsRate');
      
      // All rates should be percentages
      expect(distribution.summaryRate).toBeGreaterThanOrEqual(0);
      expect(distribution.summaryRate).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle pipeline failures gracefully', async () => {
      const ctx = new PipelineExecutionContext('news_ingestion', 'cron');
      
      ctx.log({
        eventType: 'error',
        level: 'error',
        message: 'Test error',
        error: {
          message: 'Something went wrong',
          stack: 'Error stack trace',
        },
      });
      
      ctx.complete('failed');
      
      const summary = ctx.getSummary();
      expect(summary.status).toBe('failed');
      expect(summary.errorCount).toBe(1);
      expect(summary.errorMessages).toContain('Something went wrong');
    });

    it('should handle partial success status', async () => {
      const ctx = new PipelineExecutionContext('news_ingestion', 'api');
      
      ctx.recordItemProcessed(true, {
        hasSummary: true,
        hasRegulationTags: true,
        hasGs1ImpactTags: true,
        hasSectorTags: true,
        hasRecommendations: true,
      });
      
      ctx.log({
        eventType: 'error',
        level: 'error',
        message: 'Partial failure',
        error: { message: 'Some items failed' },
      });
      
      ctx.complete('partial_success');
      
      const summary = ctx.getSummary();
      expect(summary.status).toBe('partial_success');
      expect(summary.itemsSaved).toBe(1);
      expect(summary.errorCount).toBe(1);
    });
  });
});
