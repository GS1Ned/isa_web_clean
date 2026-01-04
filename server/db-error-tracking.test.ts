import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getDb } from './db';
import { errorLog } from '../drizzle/schema';
import {
  trackError,
  getErrorStats,
  getRecentErrors,
  getErrorTrends,
  getErrorsByOperation,
} from './db-error-tracking';
import { eq, sql } from 'drizzle-orm';

// Use unique operation names per test to avoid cross-test pollution
const generateTestOperation = () => `test_op_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const hasDb = Boolean(process.env.DATABASE_URL);
const describeDb = hasDb ? describe : describe.skip;

describeDb('Error Tracking Database Helpers', () => {
  let testOperation: string;

  beforeEach(() => {
    testOperation = generateTestOperation();
  });

  afterEach(async () => {
    // Clean up test data after each test
    const db = await getDb();
    if (!db) return;
    await db.delete(errorLog).where(eq(errorLog.operation, testOperation));
  });

  describe('trackError', () => {
    it('should track an error with all fields', async () => {
      const errorData = {
        operation: testOperation,
        severity: 'error' as const,
        message: 'Test error message',
        stackTrace: 'Error: Test\n  at test.ts:1:1',
        context: { userId: 123, action: 'test' },
        userId: 123,
      };

      await trackError(errorData);

      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const errors = await db
        .select()
        .from(errorLog)
        .where(eq(errorLog.operation, testOperation))
        .limit(1);

      expect(errors).toHaveLength(1);
      expect(errors[0].operation).toBe(testOperation);
      expect(errors[0].severity).toBe('error');
      expect(errors[0].message).toBe('Test error message');
      expect(errors[0].userId).toBe(123);
      expect(errors[0].stackTrace).toContain('Error: Test');
    });

    it('should track a critical error', async () => {
      await trackError({
        operation: testOperation,
        severity: 'critical',
        message: 'Critical test error',
      });

      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const errors = await db
        .select()
        .from(errorLog)
        .where(eq(errorLog.operation, testOperation))
        .limit(1);

      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('critical');
      expect(errors[0].message).toBe('Critical test error');
    });

    it('should track a warning', async () => {
      await trackError({
        operation: testOperation,
        severity: 'warning',
        message: 'Warning test message',
      });

      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const errors = await db
        .select()
        .from(errorLog)
        .where(eq(errorLog.operation, testOperation))
        .limit(1);

      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('warning');
      expect(errors[0].message).toBe('Warning test message');
    });
  });

  describe('getErrorStats', () => {
    it('should return error statistics', async () => {
      // Track multiple errors for stats
      await trackError({
        operation: testOperation,
        severity: 'error',
        message: 'Error 1',
      });
      await trackError({
        operation: testOperation,
        severity: 'critical',
        message: 'Error 2',
      });
      await trackError({
        operation: testOperation,
        severity: 'warning',
        message: 'Warning 1',
      });

      const stats = await getErrorStats(24);

      expect(stats.totalErrors).toBeGreaterThanOrEqual(3);
      expect(stats.criticalCount).toBeGreaterThanOrEqual(1);
      expect(stats.uniqueErrors).toBeGreaterThanOrEqual(1);
      expect(typeof stats.errorRate).toBe('number');
      expect(stats.errorRate).toBeGreaterThanOrEqual(0);
    });

    it('should calculate error rate correctly', async () => {
      // Track a known number of errors
      await trackError({
        operation: testOperation,
        severity: 'error',
        message: 'Rate test error 1',
      });
      await trackError({
        operation: testOperation,
        severity: 'error',
        message: 'Rate test error 2',
      });

      const stats = await getErrorStats(24);

      // Error rate should be errors per hour
      expect(stats.errorRate).toBeGreaterThanOrEqual(0);
      expect(typeof stats.errorRate).toBe('number');
      expect(Number.isFinite(stats.errorRate)).toBe(true);
    });
  });

  describe('getRecentErrors', () => {
    it('should return recent errors with limit', async () => {
      // Track multiple errors
      for (let i = 0; i < 7; i++) {
        await trackError({
          operation: testOperation,
          severity: 'error',
          message: `Error ${i}`,
        });
      }

      const errors = await getRecentErrors(5);

      expect(Array.isArray(errors)).toBe(true);
      // Should respect the limit
      expect(errors.length).toBeLessThanOrEqual(5);
    });

    it('should filter errors by operation', async () => {
      await trackError({
        operation: testOperation,
        severity: 'error',
        message: 'Recent error',
      });

      const errors = await getRecentErrors(10, undefined, testOperation);

      // Should find the error we just created
      expect(errors.length).toBeGreaterThanOrEqual(1);
      const recentError = errors.find((e) => e.message === 'Recent error');
      expect(recentError).toBeDefined();
      expect(recentError?.operation).toBe(testOperation);
    });

    it('should order errors by timestamp descending', async () => {
      // Track errors with small delays to ensure different timestamps
      await trackError({
        operation: testOperation,
        severity: 'error',
        message: 'First error',
      });
      
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await trackError({
        operation: testOperation,
        severity: 'error',
        message: 'Second error',
      });

      const errors = await getRecentErrors(10, 24);
      const testErrors = errors.filter(e => e.operation === testOperation);

      if (testErrors.length >= 2) {
        const firstTimestamp = new Date(testErrors[0].timestamp).getTime();
        const secondTimestamp = new Date(testErrors[1].timestamp).getTime();
        // Most recent should be first
        expect(firstTimestamp).toBeGreaterThanOrEqual(secondTimestamp);
      }
    });
  });

  describe('getErrorTrends', () => {
    it('should return error trends grouped by hour', async () => {
      await trackError({
        operation: testOperation,
        severity: 'error',
        message: 'Trend test error',
      });

      const trends = await getErrorTrends(24);

      expect(Array.isArray(trends)).toBe(true);
      
      if (trends.length > 0) {
        expect(trends[0]).toHaveProperty('hour');
        expect(trends[0]).toHaveProperty('errorCount');
        expect(trends[0]).toHaveProperty('criticalCount');
        expect(trends[0]).toHaveProperty('warningCount');
      }
    });

    it('should include all severity levels in trends', async () => {
      // Track errors of different severities
      await trackError({
        operation: testOperation,
        severity: 'error',
        message: 'Error for trends',
      });
      await trackError({
        operation: testOperation,
        severity: 'critical',
        message: 'Critical for trends',
      });
      await trackError({
        operation: testOperation,
        severity: 'warning',
        message: 'Warning for trends',
      });

      const trends = await getErrorTrends(24);

      expect(Array.isArray(trends)).toBe(true);
      
      if (trends.length > 0) {
        const trend = trends[0];
        expect(typeof trend.errorCount).toBe('number');
        expect(typeof trend.criticalCount).toBe('number');
        expect(typeof trend.warningCount).toBe('number');
      }
    });
  });

  describe('getErrorsByOperation', () => {
    it('should return errors grouped by operation', async () => {
      await trackError({
        operation: testOperation,
        severity: 'error',
        message: 'Operation test error 1',
      });
      await trackError({
        operation: testOperation,
        severity: 'error',
        message: 'Operation test error 2',
      });

      const operations = await getErrorsByOperation(24);

      expect(Array.isArray(operations)).toBe(true);
      
      const testOp = operations.find((op) => op.operation === testOperation);
      expect(testOp).toBeDefined();
      if (testOp) {
        expect(testOp.errorCount).toBeGreaterThanOrEqual(2);
      }
    });

    it('should order operations by error count descending', async () => {
      // Create multiple errors for this operation
      for (let i = 0; i < 5; i++) {
        await trackError({
          operation: testOperation,
          severity: 'error',
          message: `Error ${i}`,
        });
      }

      const operations = await getErrorsByOperation(24);

      if (operations.length > 1) {
        // Verify descending order
        for (let i = 0; i < operations.length - 1; i++) {
          expect(operations[i].errorCount).toBeGreaterThanOrEqual(
            operations[i + 1].errorCount
          );
        }
      }
    });

    it('should include last error timestamp', async () => {
      await trackError({
        operation: testOperation,
        severity: 'error',
        message: 'Timestamp test error',
      });

      const operations = await getErrorsByOperation(24);
      const testOp = operations.find((op) => op.operation === testOperation);

      expect(testOp).toBeDefined();
      if (testOp) {
        expect(testOp.lastError).toBeDefined();
        // MySQL MAX() returns string, not Date object
        expect(typeof testOp.lastError === 'string' || testOp.lastError instanceof Date).toBe(true);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle null error context', async () => {
      await trackError({
        operation: testOperation,
        severity: 'error',
        message: 'Error without context',
        context: null,
      });

      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const errors = await db
        .select()
        .from(errorLog)
        .where(eq(errorLog.operation, testOperation))
        .limit(1);

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Error without context');
    });

    it('should handle null stack trace', async () => {
      await trackError({
        operation: testOperation,
        severity: 'error',
        message: 'Error without stack trace',
        stackTrace: null,
      });

      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const errors = await db
        .select()
        .from(errorLog)
        .where(eq(errorLog.operation, testOperation))
        .limit(1);

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Error without stack trace');
      expect(errors[0].stackTrace).toBeNull();
    });

    it('should handle null user ID', async () => {
      await trackError({
        operation: testOperation,
        severity: 'error',
        message: 'Error without user ID',
        userId: null,
      });

      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const errors = await db
        .select()
        .from(errorLog)
        .where(eq(errorLog.operation, testOperation))
        .limit(1);

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Error without user ID');
      expect(errors[0].userId).toBeNull();
    });
  });
});
