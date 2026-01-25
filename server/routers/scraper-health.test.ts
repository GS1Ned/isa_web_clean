/**
 * Tests for Scraper Health Router
 * Validates tRPC procedures for health monitoring
 */

import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "../routers";
import { getDb } from "../db";
import { scraperExecutions, scraperHealthSummary } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Scraper Health Router", () => {
  beforeEach(async () => {
    // Clean up test data
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.delete(scraperExecutions);
    await db.delete(scraperHealthSummary);
  });

  describe("getAllSourcesHealth", () => {
    it("should return empty array when no health data exists", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.scraperHealth.getAllSourcesHealth();
      expect(result).toEqual([]);
    });

    it("should return all sources health summaries", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Insert test health summaries
      await db.insert(scraperHealthSummary).values([
        {
          sourceId: "test-source-1",
          sourceName: "Test Source 1",
          successRate24H: 100,
          totalExecutions24H: 10,
          failedExecutions24H: 0,
          avgItemsFetched24H: 5,
          avgDurationMs24H: 1000,
          lastExecutionSuccess: true,
          lastExecutionAt: new Date(),
          lastSuccessAt: new Date(),
          consecutiveFailures: 0,
          alertSent: false,
        },
        {
          sourceId: "test-source-2",
          sourceName: "Test Source 2",
          successRate24H: 67,
          totalExecutions24H: 12,
          failedExecutions24H: 4,
          avgItemsFetched24H: 3,
          avgDurationMs24H: 1500,
          lastExecutionSuccess: false,
          lastExecutionAt: new Date(),
          lastSuccessAt: new Date(Date.now() - 3600000),
          consecutiveFailures: 3,
          alertSent: true,
          alertSentAt: new Date(),
        },
      ]);

      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.scraperHealth.getAllSourcesHealth();

      expect(result).toHaveLength(2);
      
      // Find sources in result (order may vary)
      const source1 = result.find(r => r.sourceId === "test-source-1");
      const source2 = result.find(r => r.sourceId === "test-source-2");
      
      expect(source1).toBeDefined();
      expect(source1?.successRate24h).toBe(100);
      expect(source1?.consecutiveFailures).toBe(0);
      
      expect(source2).toBeDefined();
      expect(source2?.successRate24h).toBe(67);
      expect(source2?.consecutiveFailures).toBe(3);
      expect(Boolean(source2?.alertSent)).toBe(true);
    });
  });

  describe("getSourceHealth", () => {
    it("should return null for non-existent source", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.scraperHealth.getSourceHealth({
        sourceId: "non-existent",
      });

      expect(result).toBeNull();
    });

    it("should return health summary for specific source", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(scraperHealthSummary).values({
        sourceId: "test-source",
        sourceName: "Test Source",
        successRate24H: 85,
        totalExecutions24H: 20,
        failedExecutions24H: 3,
        avgItemsFetched24H: 7,
        avgDurationMs24H: 2000,
        lastExecutionSuccess: true,
        lastExecutionAt: new Date(),
        lastSuccessAt: new Date(),
        consecutiveFailures: 0,
        alertSent: false,
      });

      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.scraperHealth.getSourceHealth({
        sourceId: "test-source",
      });

      expect(result).not.toBeNull();
      expect(result?.sourceId).toBe("test-source");
      expect(result?.successRate24H).toBe(85);
      expect(result?.totalExecutions24H).toBe(20);
    });
  });

  describe("getExecutionHistory", () => {
    it("should require admin role", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.scraperHealth.getExecutionHistory({
          sourceId: "test-source",
        })
      ).rejects.toThrow();
    });

    it("should return execution history for admin", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const now = new Date();

      // Insert test executions
      await db.insert(scraperExecutions).values([
        {
          sourceId: "test-source",
          sourceName: "Test Source",
          success: true,
          itemsFetched: 5,
          attempts: 1,
          durationMs: 1000,
          triggeredBy: "cron",
          startedAt: new Date(now.getTime() - 3600000),
          completedAt: new Date(now.getTime() - 3600000),
        },
        {
          sourceId: "test-source",
          sourceName: "Test Source",
          success: false,
          itemsFetched: 0,
          errorMessage: "Connection timeout",
          attempts: 3,
          durationMs: 5000,
          triggeredBy: "cron",
          startedAt: now,
          completedAt: now,
        },
      ]);

      const caller = appRouter.createCaller({
        user: {
          id: 1,
          openId: "test-admin",
          name: "Test Admin",
          email: "admin@test.com",
          role: "admin",
          createdAt: new Date(),
        },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.scraperHealth.getExecutionHistory({
        sourceId: "test-source",
        limit: 10,
      });

      expect(result).toHaveLength(2);
      expect(Boolean(result[0].success)).toBe(false); // Most recent first
      expect(result[0].errorMessage).toBe("Connection timeout");
      expect(Boolean(result[1].success)).toBe(true);
    });

    it("should respect limit parameter", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Insert 10 executions
      const executions = Array.from({ length: 10 }, (_, i) => ({
        sourceId: "test-source",
        sourceName: "Test Source",
        success: true,
        itemsFetched: 5,
        attempts: 1,
        durationMs: 1000,
        triggeredBy: "cron" as const,
        startedAt: new Date(Date.now() - i * 3600000),
        completedAt: new Date(Date.now() - i * 3600000),
      }));

      await db.insert(scraperExecutions).values(executions);

      const caller = appRouter.createCaller({
        user: {
          id: 1,
          openId: "test-admin",
          name: "Test Admin",
          email: "admin@test.com",
          role: "admin",
          createdAt: new Date(),
        },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.scraperHealth.getExecutionHistory({
        sourceId: "test-source",
        limit: 5,
      });

      expect(result).toHaveLength(5);
    });
  });

  describe("getRecentFailures", () => {
    it("should require admin role", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.scraperHealth.getRecentFailures({ limit: 10 })
      ).rejects.toThrow();
    });

    it("should return only failed executions", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(scraperExecutions).values([
        {
          sourceId: "source-1",
          sourceName: "Source 1",
          success: true,
          itemsFetched: 5,
          attempts: 1,
          durationMs: 1000,
          triggeredBy: "cron",
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          sourceId: "source-2",
          sourceName: "Source 2",
          success: false,
          itemsFetched: 0,
          errorMessage: "Network error",
          attempts: 3,
          durationMs: 5000,
          triggeredBy: "cron",
          startedAt: new Date(),
          completedAt: new Date(),
        },
      ]);

      const caller = appRouter.createCaller({
        user: {
          id: 1,
          openId: "test-admin",
          name: "Test Admin",
          email: "admin@test.com",
          role: "admin",
          createdAt: new Date(),
        },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.scraperHealth.getRecentFailures({
        limit: 10,
      });

      expect(result).toHaveLength(1);
      expect(Boolean(result[0].success)).toBe(false);
      expect(result[0].errorMessage).toBe("Network error");
    });
  });

  describe("getExecutionStats", () => {
    it("should require admin role", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.scraperHealth.getExecutionStats({ hoursBack: 24 })
      ).rejects.toThrow();
    });

    it("should calculate overall statistics correctly", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const now = Date.now();

      await db.insert(scraperExecutions).values([
        {
          sourceId: "source-1",
          sourceName: "Source 1",
          success: true,
          itemsFetched: 10,
          attempts: 1,
          durationMs: 1000,
          triggeredBy: "cron",
          startedAt: new Date(now - 3600000),
          completedAt: new Date(now - 3600000),
        },
        {
          sourceId: "source-1",
          sourceName: "Source 1",
          success: false,
          itemsFetched: 0,
          errorMessage: "Error",
          attempts: 3,
          durationMs: 3000,
          triggeredBy: "cron",
          startedAt: new Date(now),
          completedAt: new Date(now),
        },
        {
          sourceId: "source-2",
          sourceName: "Source 2",
          success: true,
          itemsFetched: 5,
          attempts: 1,
          durationMs: 2000,
          triggeredBy: "cron",
          startedAt: new Date(now),
          completedAt: new Date(now),
        },
      ]);

      const caller = appRouter.createCaller({
        user: {
          id: 1,
          openId: "test-admin",
          name: "Test Admin",
          email: "admin@test.com",
          role: "admin",
          createdAt: new Date(),
        },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.scraperHealth.getExecutionStats({
        hoursBack: 24,
      });

      expect(result.overall.totalExecutions).toBe(3);
      expect(result.overall.successfulExecutions).toBe(2);
      expect(result.overall.failedExecutions).toBe(1);
      expect(result.overall.successRate).toBe(67); // 2/3 = 66.67 -> 67
      expect(result.overall.totalItemsFetched).toBe(15);
      expect(result.overall.avgItemsPerExecution).toBe(5); // 15/3
      expect(result.overall.avgDurationMs).toBe(2000); // (1000+3000+2000)/3

      expect(result.bySource).toHaveLength(2);
    });

    it("should filter by time range", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const now = Date.now();

      await db.insert(scraperExecutions).values([
        {
          sourceId: "source-1",
          sourceName: "Source 1",
          success: true,
          itemsFetched: 5,
          attempts: 1,
          durationMs: 1000,
          triggeredBy: "cron",
          startedAt: new Date(now - 48 * 3600000), // 48 hours ago
          completedAt: new Date(now - 48 * 3600000),
        },
        {
          sourceId: "source-1",
          sourceName: "Source 1",
          success: true,
          itemsFetched: 5,
          attempts: 1,
          durationMs: 1000,
          triggeredBy: "cron",
          startedAt: new Date(now - 3600000), // 1 hour ago
          completedAt: new Date(now - 3600000),
        },
      ]);

      const caller = appRouter.createCaller({
        user: {
          id: 1,
          openId: "test-admin",
          name: "Test Admin",
          email: "admin@test.com",
          role: "admin",
          createdAt: new Date(),
        },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.scraperHealth.getExecutionStats({
        hoursBack: 24,
      });

      // Should only include the execution from 1 hour ago
      expect(result.overall.totalExecutions).toBe(1);
    });
  });

  describe("clearAlert", () => {
    it("should require admin role", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.scraperHealth.clearAlert({ sourceId: "test-source" })
      ).rejects.toThrow();
    });

    it("should clear alert status for source", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(scraperHealthSummary).values({
        sourceId: "test-source",
        sourceName: "Test Source",
        successRate24h: 50,
        totalExecutions24h: 10,
        failedExecutions24h: 5,
        avgItemsFetched24h: 3,
        avgDurationMs24h: 1000,
        lastExecutionSuccess: false,
        lastExecutionAt: new Date(),
        lastSuccessAt: new Date(),
        consecutiveFailures: 3,
        alertSent: true,
        alertSentAt: new Date(),
      });

      const caller = appRouter.createCaller({
        user: {
          id: 1,
          openId: "test-admin",
          name: "Test Admin",
          email: "admin@test.com",
          role: "admin",
          createdAt: new Date(),
        },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.scraperHealth.clearAlert({
        sourceId: "test-source",
      });

      expect(Boolean(result.success)).toBe(true);

      // Verify alert was cleared (MySQL returns 0/1 for boolean)
      const updated = await db
        .select()
        .from(scraperHealthSummary)
        .where(eq(scraperHealthSummary.sourceId, "test-source"))
        .limit(1);

      expect(Boolean(updated[0].alertSent)).toBe(false);
      expect(updated[0].alertSentAt).toBeNull();
    });
  });
});
