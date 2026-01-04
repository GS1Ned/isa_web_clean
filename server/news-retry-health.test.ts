/**
 * Tests for News Scraper Retry Logic and Health Monitoring
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { retryWithBackoff, retryWithResult } from "./news-retry-util";
import {
  recordScraperExecution,
  getSourceHealth,
  getAllSourcesHealth,
  type ScraperHealthMetrics,
} from "./news-health-monitor";

// Mock database to force using in-memory cache
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

describe("Retry Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should succeed on first attempt", async () => {
    const operation = vi.fn().mockResolvedValue("success");

    const result = await retryWithBackoff(operation, { maxAttempts: 3 }, "test");

    expect(result).toBe("success");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("should retry on failure and eventually succeed", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error("Fail 1"))
      .mockRejectedValueOnce(new Error("Fail 2"))
      .mockResolvedValue("success");

    const result = await retryWithBackoff(
      operation,
      { maxAttempts: 3, initialDelayMs: 10 },
      "test"
    );

    expect(result).toBe("success");
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it("should throw after max attempts", async () => {
    const operation = vi.fn().mockRejectedValue(new Error("Always fails"));

    await expect(
      retryWithBackoff(
        operation,
        { maxAttempts: 3, initialDelayMs: 10 },
        "test"
      )
    ).rejects.toThrow("Always fails");

    expect(operation).toHaveBeenCalledTimes(3);
  });

  it("should return result object instead of throwing", async () => {
    const operation = vi.fn().mockRejectedValue(new Error("Fail"));

    const result = await retryWithResult(
      operation,
      { maxAttempts: 2, initialDelayMs: 10 },
      "test"
    );

    expect(Boolean(result.success)).toBe(false);
    expect(result.error).toBe("Fail");
    expect(result.attempts).toBe(2);
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("should apply exponential backoff", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error("Fail 1"))
      .mockResolvedValue("success");

    const startTime = Date.now();
    await retryWithBackoff(
      operation,
      { maxAttempts: 2, initialDelayMs: 100, jitterMs: 0 },
      "test"
    );
    const duration = Date.now() - startTime;

    // Should wait at least 100ms (initial delay) between attempts
    expect(duration).toBeGreaterThanOrEqual(100);
    expect(operation).toHaveBeenCalledTimes(2);
  });
});

describe("Health Monitoring", () => {
  beforeEach(async () => {
    // Clear health history by resetting mocks
    vi.clearAllMocks();
    // Re-import to reset the module state (clear healthCache)
    vi.resetModules();
  });

  it("should record successful scraper execution", async () => {
    const metrics: ScraperHealthMetrics = {
      sourceId: "test-source",
      sourceName: "Test Source",
      success: true,
      itemsFetched: 10,
      attempts: 1,
      durationMs: 1000,
      timestamp: new Date(),
    };

    await recordScraperExecution(metrics);

    const health = await getSourceHealth("test-source");
    expect(health.successRate).toBe(100);
    expect(health.totalExecutions).toBe(1);
    expect(health.consecutiveFailures).toBe(0);
    expect(health.avgItemsFetched).toBe(10);
  });

  it("should record failed scraper execution", async () => {
    const metrics: ScraperHealthMetrics = {
      sourceId: "test-source-2",
      sourceName: "Test Source 2",
      success: false,
      itemsFetched: 0,
      error: "Network timeout",
      attempts: 3,
      durationMs: 5000,
      timestamp: new Date(),
    };

    await recordScraperExecution(metrics);

    const health = await getSourceHealth("test-source-2");
    expect(health.successRate).toBe(0);
    expect(health.totalExecutions).toBe(1);
    expect(health.consecutiveFailures).toBe(1);
    expect(health.lastExecution?.error).toBe("Network timeout");
  });

  it("should calculate success rate correctly", async () => {
    const sourceId = "test-source-3";

    // Record 3 successes and 1 failure
    for (let i = 0; i < 3; i++) {
      await recordScraperExecution({
        sourceId,
        sourceName: "Test Source 3",
        success: true,
        itemsFetched: 5,
        attempts: 1,
        durationMs: 1000,
        timestamp: new Date(),
      });
    }

    await recordScraperExecution({
      sourceId,
      sourceName: "Test Source 3",
      success: false,
      itemsFetched: 0,
      error: "Timeout",
      attempts: 3,
      durationMs: 5000,
      timestamp: new Date(),
    });

    const health = await getSourceHealth(sourceId);
    expect(health.successRate).toBe(75); // 3/4 = 75%
    expect(health.totalExecutions).toBe(4);
    expect(health.consecutiveFailures).toBe(1);
  });

  it("should track consecutive failures", async () => {
    const sourceId = "test-source-4";

    // Record 3 consecutive failures
    for (let i = 0; i < 3; i++) {
      await recordScraperExecution({
        sourceId,
        sourceName: "Test Source 4",
        success: false,
        itemsFetched: 0,
        error: `Failure ${i + 1}`,
        attempts: 3,
        durationMs: 5000,
        timestamp: new Date(),
      });
    }

    const health = await getSourceHealth(sourceId);
    expect(health.consecutiveFailures).toBe(3);
    expect(health.successRate).toBe(0);
  });

  it("should reset consecutive failures after success", async () => {
    const sourceId = "test-source-5";

    // Record 2 failures, then 1 success
    await recordScraperExecution({
      sourceId,
      sourceName: "Test Source 5",
      success: false,
      itemsFetched: 0,
      error: "Fail 1",
      attempts: 3,
      durationMs: 5000,
      timestamp: new Date(),
    });

    await recordScraperExecution({
      sourceId,
      sourceName: "Test Source 5",
      success: false,
      itemsFetched: 0,
      error: "Fail 2",
      attempts: 3,
      durationMs: 5000,
      timestamp: new Date(),
    });

    await recordScraperExecution({
      sourceId,
      sourceName: "Test Source 5",
      success: true,
      itemsFetched: 10,
      attempts: 1,
      durationMs: 1000,
      timestamp: new Date(),
    });

    const health = await getSourceHealth(sourceId);
    expect(health.consecutiveFailures).toBe(0);
    expect(health.successRate).toBe(33); // 1/3 ≈ 33%
  });

  it("should track all sources in health summary", async () => {
    await recordScraperExecution({
      sourceId: "source-a",
      sourceName: "Source A",
      success: true,
      itemsFetched: 5,
      attempts: 1,
      durationMs: 1000,
      timestamp: new Date(),
    });

    await recordScraperExecution({
      sourceId: "source-b",
      sourceName: "Source B",
      success: false,
      itemsFetched: 0,
      error: "Error",
      attempts: 3,
      durationMs: 5000,
      timestamp: new Date(),
    });

    const allHealth = await getAllSourcesHealth();
    expect(allHealth.size).toBeGreaterThanOrEqual(2);
    expect(allHealth.has("source-a")).toBe(true);
    expect(allHealth.has("source-b")).toBe(true);
  });
});
