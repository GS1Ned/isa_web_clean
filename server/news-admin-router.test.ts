/**
 * Tests for News Admin Router
 * Validates manual trigger, execution history, and monitoring dashboard
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { newsAdminRouter } from "./news-admin-router";
import type { Context } from "./_core/context";

// Mock dependencies
vi.mock("./news-cron-scheduler", () => ({
  manualNewsIngestion: vi.fn().mockResolvedValue({
    success: true,
    fetched: 10,
    processed: 10,
    inserted: 5,
    skipped: 5,
    errors: 0,
    duration: 1000,
  }),
  manualNewsArchival: vi.fn().mockResolvedValue({
    success: true,
    archived: 3,
    errors: 0,
    duration: 500,
  }),
}));

vi.mock("./news-archival", () => ({
  getArchivalStats: vi.fn().mockResolvedValue({
    activeCount: 100,
    archivedCount: 50,
    oldestActiveDate: new Date("2024-01-01"),
  }),
}));

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              id: 1,
              title: "Test News 1",
              summary: "Test summary 1",
              sources: ["Test Source"],
              retrievedAt: new Date(),
            },
            {
              id: 2,
              title: "Test News 2",
              summary: "Test summary 2",
              sources: ["Test Source"],
              retrievedAt: new Date(),
            },
          ]),
        }),
      }),
    }),
  }),
}));

vi.mock("./cron-monitoring-simple", () => ({
  monitoredCronJob: vi.fn().mockImplementation(async (name, job) => {
    return await job();
  }),
  getExecutionHistory: vi.fn().mockReturnValue([
    {
      jobName: "manual-news-ingestion",
      status: "success",
      duration: 1000,
      stats: JSON.stringify({ inserted: 5, skipped: 5 }),
      timestamp: new Date().toISOString(),
    },
  ]),
  getExecutionStats: vi.fn().mockReturnValue({
    total: 10,
    successful: 9,
    failed: 1,
    avgDuration: 1200,
    successRate: 90,
  }),
  getMonitoringDashboard: vi.fn().mockReturnValue([
    {
      jobName: "daily-news-ingestion",
      stats: {
        total: 7,
        successful: 7,
        failed: 0,
        avgDuration: 30000,
        successRate: 100,
      },
      recentHistory: [],
    },
    {
      jobName: "weekly-news-archival",
      stats: {
        total: 1,
        successful: 1,
        failed: 0,
        avgDuration: 500,
        successRate: 100,
      },
      recentHistory: [],
    },
  ]),
}));

// Helper to create mock context
function createMockContext(role: "admin" | "user" = "admin"): Context {
  return {
    user: {
      id: 1,
      openId: "test-open-id",
      name: "Test Admin",
      email: "admin@test.com",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      loginMethod: "oauth",
    },
  };
}

describe("News Admin Router", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const caller = newsAdminRouter.createCaller(createMockContext("admin"));
    await caller.resetPipelineStatus({ force: true });
  });

  describe("triggerIngestion", () => {
    it("should successfully trigger manual news ingestion for admin", async () => {
      const ctx = createMockContext("admin");
      const caller = newsAdminRouter.createCaller(ctx);

      const result = await caller.triggerIngestion();

      expect(Boolean(result.success)).toBe(true);
      expect(result.status).toBe("running");
      expect(result.startedAt).toBeDefined();
    });

    it("should reject non-admin users", async () => {
      const ctx = createMockContext("user");
      const caller = newsAdminRouter.createCaller(ctx);

      await expect(caller.triggerIngestion()).rejects.toThrow(
        "Admin access required"
      );
    });

    it("should wrap ingestion with monitoring", async () => {
      const { monitoredCronJob } = await import("./cron-monitoring-simple");
      const ctx = createMockContext("admin");
      const caller = newsAdminRouter.createCaller(ctx);

      await caller.triggerIngestion();

      expect(monitoredCronJob).toHaveBeenCalledWith(
        "manual-news-ingestion",
        expect.any(Function),
        3
      );
    });
  });

  describe("triggerArchival", () => {
    it("should successfully trigger manual news archival for admin", async () => {
      const ctx = createMockContext("admin");
      const caller = newsAdminRouter.createCaller(ctx);

      const result = await caller.triggerArchival();

      expect(Boolean(result.success)).toBe(true);
      expect(result.archived).toBe(3);
      expect(result.duration).toBeDefined();
    });

    it("should reject non-admin users", async () => {
      const ctx = createMockContext("user");
      const caller = newsAdminRouter.createCaller(ctx);

      await expect(caller.triggerArchival()).rejects.toThrow(
        "Admin access required"
      );
    });

    it("should wrap archival with monitoring", async () => {
      const { monitoredCronJob } = await import("./cron-monitoring-simple");
      const ctx = createMockContext("admin");
      const caller = newsAdminRouter.createCaller(ctx);

      await caller.triggerArchival();

      expect(monitoredCronJob).toHaveBeenCalledWith(
        "manual-news-archival",
        expect.any(Function),
        3
      );
    });
  });

  describe("getStats", () => {
    it("should return pipeline statistics for admin", async () => {
      const ctx = createMockContext("admin");
      const caller = newsAdminRouter.createCaller(ctx);

      const result = await caller.getStats();

      expect(result.archivalStats).toBeDefined();
      expect(result.archivalStats.activeCount).toBe(100);
      expect(result.archivalStats.archivedCount).toBe(50);
      expect(result.recentNews).toHaveLength(2);
    });

    it("should reject non-admin users", async () => {
      const ctx = createMockContext("user");
      const caller = newsAdminRouter.createCaller(ctx);

      await expect(caller.getStats()).rejects.toThrow("Admin access required");
    });
  });

  describe("getExecutionHistory", () => {
    it("should return execution history for all job types", async () => {
      const ctx = createMockContext("admin");
      const caller = newsAdminRouter.createCaller(ctx);

      const result = await caller.getExecutionHistory();

      expect(result.manualIngestion).toBeDefined();
      expect(result.dailyIngestion).toBeDefined();
      expect(result.weeklyArchival).toBeDefined();
      expect(result.manualIngestion[0].jobName).toBe("manual-news-ingestion");
      expect(result.manualIngestion[0].status).toBe("success");
    });

    it("should reject non-admin users", async () => {
      const ctx = createMockContext("user");
      const caller = newsAdminRouter.createCaller(ctx);

      await expect(caller.getExecutionHistory()).rejects.toThrow(
        "Admin access required"
      );
    });

    it("should include execution stats in history", async () => {
      const ctx = createMockContext("admin");
      const caller = newsAdminRouter.createCaller(ctx);

      const result = await caller.getExecutionHistory();

      expect(result.manualIngestion[0].stats).toBeDefined();
      const stats = JSON.parse(result.manualIngestion[0].stats as string);
      expect(stats.inserted).toBe(5);
      expect(stats.skipped).toBe(5);
    });
  });

  describe("getMonitoringDashboard", () => {
    it("should return comprehensive monitoring dashboard", async () => {
      const ctx = createMockContext("admin");
      const caller = newsAdminRouter.createCaller(ctx);

      const result = await caller.getMonitoringDashboard();

      expect(result.jobs).toHaveLength(2);
      expect(result.manualIngestion).toBeDefined();
      expect(result.manualIngestion.stats).toBeDefined();
    });

    it("should include success rates in dashboard", async () => {
      const ctx = createMockContext("admin");
      const caller = newsAdminRouter.createCaller(ctx);

      const result = await caller.getMonitoringDashboard();

      expect(result.jobs[0].stats?.successRate).toBe(100);
      expect(result.manualIngestion.stats?.successRate).toBe(90);
    });

    it("should reject non-admin users", async () => {
      const ctx = createMockContext("user");
      const caller = newsAdminRouter.createCaller(ctx);

      await expect(caller.getMonitoringDashboard()).rejects.toThrow(
        "Admin access required"
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle ingestion failures gracefully", async () => {
      const { manualNewsIngestion } = await import("./news-cron-scheduler");
      vi.mocked(manualNewsIngestion).mockRejectedValueOnce(
        new Error("Network error")
      );

      const ctx = createMockContext("admin");
      const caller = newsAdminRouter.createCaller(ctx);

      await caller.triggerIngestion();
      await new Promise((resolve) => setTimeout(resolve, 0));

      const status = await caller.getPipelineStatus();
      expect(status.status).toBe("failed");
      expect(status.error).toBe("Network error");
    });

    it("should handle archival failures gracefully", async () => {
      const { manualNewsArchival } = await import("./news-cron-scheduler");
      vi.mocked(manualNewsArchival).mockRejectedValueOnce(
        new Error("Database error")
      );

      const ctx = createMockContext("admin");
      const caller = newsAdminRouter.createCaller(ctx);

      await expect(caller.triggerArchival()).rejects.toThrow("Database error");
    });
  });
});
