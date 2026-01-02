/**
 * Health Check Tests
 * 
 * Verifies health check endpoint functionality for monitoring and alerting.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performHealthCheck } from './health';
import * as dbModule from './db';

// Mock the database module
vi.mock('./db', () => ({
  getDb: vi.fn(),
}));

describe('Health Check System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('performHealthCheck', () => {
    it('should return healthy status when database is connected', async () => {
      // Mock successful database connection
      const mockDb = {
        execute: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      const result = await performHealthCheck();

      expect(result.status).toBe('healthy');
      expect(result.checks.database.status).toBe('ok');
      expect(result.checks.database.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.checks.server.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
      expect(result.version).toBeDefined();
    });

    it('should return unhealthy status when database connection fails', async () => {
      // Mock database connection failure
      vi.mocked(dbModule.getDb).mockResolvedValue(null);

      const result = await performHealthCheck();

      expect(result.status).toBe('unhealthy');
      expect(result.checks.database.status).toBe('error');
      expect(result.checks.database.error).toBe('Database connection not available');
    });

    it('should return unhealthy status when database query fails', async () => {
      // Mock database query failure
      const mockDb = {
        execute: vi.fn().mockRejectedValue(new Error('Connection timeout')),
      };
      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      const result = await performHealthCheck();

      expect(result.status).toBe('unhealthy');
      expect(result.checks.database.status).toBe('error');
      expect(result.checks.database.error).toContain('Connection timeout');
    });

    it('should include server health metrics', async () => {
      // Mock successful database
      const mockDb = {
        execute: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      const result = await performHealthCheck();

      expect(result.checks.server.status).toBe('ok');
      expect(result.checks.server.uptime).toBeGreaterThan(0);
      expect(result.checks.server.memory.used).toBeGreaterThan(0);
      expect(result.checks.server.memory.total).toBeGreaterThan(0);
      expect(result.checks.server.memory.percentage).toBeGreaterThanOrEqual(0);
      expect(result.checks.server.memory.percentage).toBeLessThanOrEqual(100);
    });

    it('should return degraded status when memory usage is high', async () => {
      // Mock successful database
      const mockDb = {
        execute: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      // Mock high memory usage by manipulating process.memoryUsage
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = vi.fn().mockReturnValue({
        heapUsed: 95000000,
        heapTotal: 100000000,
        external: 0,
        arrayBuffers: 0,
        rss: 0,
      });

      const result = await performHealthCheck();

      // Restore original
      process.memoryUsage = originalMemoryUsage;

      expect(result.status).toBe('degraded');
      expect(result.checks.server.memory.percentage).toBeGreaterThan(90);
    });

    it('should include ISO 8601 timestamp', async () => {
      // Mock successful database
      const mockDb = {
        execute: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      const result = await performHealthCheck();

      // Verify ISO 8601 format
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      
      // Verify it's a valid date
      const date = new Date(result.timestamp);
      expect(date.getTime()).toBeGreaterThan(0);
    });
  });
});
