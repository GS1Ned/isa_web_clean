import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getDb } from './db';
import { performanceLog } from '../drizzle/schema';
import {
  trackPerformance,
  getPerformanceStats,
  getSlowOperations,
  getPerformanceTrends,
} from './db-performance-tracking';
import { eq } from 'drizzle-orm';

// Use unique operation names per test to avoid cross-test pollution
const generateTestOperation = () => `test_perf_${Date.now()}_${Math.random().toString(36).slice(2)}`;

describe('Performance Tracking Database Helpers', () => {
  let testOperation: string;

  beforeEach(() => {
    testOperation = generateTestOperation();
  });

  afterEach(async () => {
    // Clean up test data after each test
    const db = await getDb();
    if (!db) return;
    await db.delete(performanceLog).where(eq(performanceLog.operation, testOperation));
  });

  describe('trackPerformance', () => {
    it('should track performance with all fields', async () => {
      const perfData = {
        operation: testOperation,
        duration: 1500,
        success: 1 as const,
        metadata: { endpoint: '/api/test', method: 'GET' },
        userId: 123,
      };

      await trackPerformance(perfData);

      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const records = await db
        .select()
        .from(performanceLog)
        .where(eq(performanceLog.operation, testOperation))
        .limit(1);

      expect(records).toHaveLength(1);
      expect(records[0].operation).toBe(testOperation);
      expect(records[0].duration).toBe(1500);
      expect(records[0].success).toBe(1);
      expect(records[0].userId).toBe(123);
    });

    it('should track a slow operation', async () => {
      await trackPerformance({
        operation: testOperation,
        duration: 5000,
        success: 1,
      });

      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const records = await db
        .select()
        .from(performanceLog)
        .where(eq(performanceLog.operation, testOperation))
        .limit(1);

      expect(records).toHaveLength(1);
      expect(records[0].duration).toBe(5000);
    });

    it('should track a failed operation', async () => {
      await trackPerformance({
        operation: testOperation,
        duration: 100,
        success: 0,
      });

      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const records = await db
        .select()
        .from(performanceLog)
        .where(eq(performanceLog.operation, testOperation))
        .limit(1);

      expect(records).toHaveLength(1);
      expect(records[0].success).toBe(0);
    });
  });

  describe('getPerformanceStats', () => {
    it('should return performance statistics', async () => {
      // Track multiple operations with different durations
      await trackPerformance({
        operation: testOperation,
        duration: 100,
        success: 1,
      });
      await trackPerformance({
        operation: testOperation,
        duration: 200,
        success: 1,
      });
      await trackPerformance({
        operation: testOperation,
        duration: 300,
        success: 1,
      });

      const stats = await getPerformanceStats(24);

      expect(stats.totalOperations).toBeGreaterThanOrEqual(3);
      expect(stats.avgDuration).toBeGreaterThanOrEqual(0);
      expect(stats.p50Duration).toBeGreaterThanOrEqual(0);
      expect(stats.p95Duration).toBeGreaterThanOrEqual(0);
      expect(stats.p99Duration).toBeGreaterThanOrEqual(0);
      expect(typeof stats.avgDuration).toBe('number');
    });

    it('should calculate percentiles correctly', async () => {
      // Track operations with known durations
      const durations = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
      for (const duration of durations) {
        await trackPerformance({
          operation: testOperation,
          duration,
          success: 1,
        });
      }

      const stats = await getPerformanceStats(24);

      expect(stats.p50Duration).toBeGreaterThanOrEqual(400);
      expect(stats.p50Duration).toBeLessThanOrEqual(600);
      expect(stats.p95Duration).toBeGreaterThanOrEqual(900);
      expect(stats.p99Duration).toBeGreaterThanOrEqual(900);
    });
  });

  describe('getSlowOperations', () => {
    it('should return operations exceeding threshold', async () => {
      // Track a slow operation
      await trackPerformance({
        operation: testOperation,
        duration: 3000,
        success: 1,
      });
      await trackPerformance({
        operation: testOperation,
        duration: 3500,
        success: 1,
      });

      const slowOps = await getSlowOperations(24, 2000, 10);

      const testOp = slowOps.find((op) => op.operation === testOperation);
      expect(testOp).toBeDefined();
      if (testOp) {
        expect(testOp.avgDuration).toBeGreaterThanOrEqual(3000);
        expect(testOp.count).toBeGreaterThanOrEqual(2);
      }
    });

    it('should order operations by average duration descending', async () => {
      // Create multiple slow operations
      for (let i = 0; i < 3; i++) {
        await trackPerformance({
          operation: testOperation,
          duration: 5000,
          success: 1,
        });
      }

      const slowOps = await getSlowOperations(24, 1000, 10);

      if (slowOps.length > 1) {
        // Verify descending order
        for (let i = 0; i < slowOps.length - 1; i++) {
          expect(slowOps[i].avgDuration).toBeGreaterThanOrEqual(
            slowOps[i + 1].avgDuration
          );
        }
      }
    });

    it('should include operation count', async () => {
      // Track multiple instances of the same operation
      for (let i = 0; i < 5; i++) {
        await trackPerformance({
          operation: testOperation,
          duration: 2500,
          success: 1,
        });
      }

      const slowOps = await getSlowOperations(24, 2000, 10);
      const testOp = slowOps.find((op) => op.operation === testOperation);

      expect(testOp).toBeDefined();
      if (testOp) {
        expect(testOp.count).toBeGreaterThanOrEqual(5);
      }
    });
  });

  describe('getPerformanceTrends', () => {
    it('should return performance trends grouped by hour', async () => {
      await trackPerformance({
        operation: testOperation,
        duration: 1000,
        success: 1,
      });

      const trends = await getPerformanceTrends(24);

      expect(Array.isArray(trends)).toBe(true);
      
      if (trends.length > 0) {
        expect(trends[0]).toHaveProperty('hour');
        expect(trends[0]).toHaveProperty('avgDuration');
        expect(trends[0]).toHaveProperty('maxDuration');
        expect(trends[0]).toHaveProperty('minDuration');
        expect(trends[0]).toHaveProperty('count');
      }
    });

    it('should include duration statistics in trends', async () => {
      // Track operations with different durations
      await trackPerformance({
        operation: testOperation,
        duration: 100,
        success: 1,
      });
      await trackPerformance({
        operation: testOperation,
        duration: 500,
        success: 1,
      });
      await trackPerformance({
        operation: testOperation,
        duration: 1000,
        success: 1,
      });

      const trends = await getPerformanceTrends(24);

      expect(Array.isArray(trends)).toBe(true);
      
      if (trends.length > 0) {
        const trend = trends[0];
        expect(typeof trend.avgDuration).toBe('number');
        expect(typeof trend.maxDuration).toBe('number');
        expect(typeof trend.minDuration).toBe('number');
        expect(typeof trend.count).toBe('number');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle null metadata', async () => {
      await trackPerformance({
        operation: testOperation,
        duration: 1000,
        success: 1,
        metadata: null,
      });

      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const records = await db
        .select()
        .from(performanceLog)
        .where(eq(performanceLog.operation, testOperation))
        .limit(1);

      expect(records).toHaveLength(1);
      expect(records[0].metadata).toBeNull();
    });

    it('should handle null user ID', async () => {
      await trackPerformance({
        operation: testOperation,
        duration: 1000,
        success: 1,
        userId: null,
      });

      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const records = await db
        .select()
        .from(performanceLog)
        .where(eq(performanceLog.operation, testOperation))
        .limit(1);

      expect(records).toHaveLength(1);
      expect(records[0].userId).toBeNull();
    });

    it('should handle zero duration', async () => {
      await trackPerformance({
        operation: testOperation,
        duration: 0,
        success: 1,
      });

      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const records = await db
        .select()
        .from(performanceLog)
        .where(eq(performanceLog.operation, testOperation))
        .limit(1);

      expect(records).toHaveLength(1);
      expect(records[0].duration).toBe(0);
    });
  });
});
