/**
 * News Fetch Utilities Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  withTimeout,
  withRetry,
  getSourceHealth,
  recordSuccess,
  recordFailure,
  shouldSkipSource,
  resetSourceHealth,
  getAllSourceHealth,
  fetchWithErrorHandling,
} from "./news-fetch-utils";

describe("News Fetch Utilities", () => {
  beforeEach(() => {
    // Reset all source health before each test
    getAllSourceHealth().forEach(h => resetSourceHealth(h.sourceId));
  });

  describe("withTimeout", () => {
    it("should resolve if function completes within timeout", async () => {
      const result = await withTimeout(
        async () => "success",
        1000
      );
      expect(result).toBe("success");
    });

    it("should reject if function exceeds timeout", async () => {
      await expect(
        withTimeout(
          () => new Promise(resolve => setTimeout(resolve, 500)),
          100
        )
      ).rejects.toThrow("timed out");
    });
  });

  describe("withRetry", () => {
    it("should succeed on first attempt if no error", async () => {
      const fn = vi.fn().mockResolvedValue("success");
      const result = await withRetry(fn, { timeout: 1000, retries: 2 });
      
      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should retry on failure and eventually succeed", async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error("fail 1"))
        .mockResolvedValue("success");
      
      const result = await withRetry(fn, { timeout: 1000, retries: 2, retryDelay: 100 });
      
      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should throw after all retries exhausted", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("persistent failure"));
      
      await expect(
        withRetry(fn, { timeout: 1000, retries: 2, retryDelay: 100 })
      ).rejects.toThrow("persistent failure");
      
      expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });
  });

  describe("Source Health Tracking", () => {
    it("should create new health record for unknown source", () => {
      const health = getSourceHealth("test-source");
      
      expect(health.sourceId).toBe("test-source");
      expect(Boolean(health.isHealthy)).toBe(true);
      expect(health.consecutiveFailures).toBe(0);
    });

    it("should update health on success", () => {
      recordSuccess("test-source", 500);
      const health = getSourceHealth("test-source");
      
      expect(health.lastSuccess).toBeDefined();
      expect(health.totalRequests).toBe(1);
      expect(health.averageResponseTime).toBe(500);
      expect(Boolean(health.isHealthy)).toBe(true);
    });

    it("should track consecutive failures", () => {
      recordFailure("test-source", new Error("fail 1"));
      recordFailure("test-source", new Error("fail 2"));
      
      const health = getSourceHealth("test-source");
      
      expect(health.consecutiveFailures).toBe(2);
      expect(health.totalFailures).toBe(2);
      expect(Boolean(health.isHealthy)).toBe(true); // Still healthy (< 3 failures)
    });

    it("should mark source unhealthy after 3 consecutive failures", () => {
      recordFailure("test-source", new Error("fail 1"));
      recordFailure("test-source", new Error("fail 2"));
      recordFailure("test-source", new Error("fail 3"));
      
      const health = getSourceHealth("test-source");
      
      expect(Boolean(health.isHealthy)).toBe(false);
    });

    it("should reset consecutive failures on success", () => {
      recordFailure("test-source", new Error("fail 1"));
      recordFailure("test-source", new Error("fail 2"));
      recordSuccess("test-source", 300);
      
      const health = getSourceHealth("test-source");
      
      expect(health.consecutiveFailures).toBe(0);
      expect(Boolean(health.isHealthy)).toBe(true);
    });

    it("should skip unhealthy source within cooldown period", () => {
      // Mark source as unhealthy
      recordFailure("test-source", new Error("fail 1"));
      recordFailure("test-source", new Error("fail 2"));
      recordFailure("test-source", new Error("fail 3"));
      
      expect(shouldSkipSource("test-source")).toBe(true);
    });

    it("should reset source health", () => {
      recordFailure("test-source", new Error("fail"));
      resetSourceHealth("test-source");
      
      const health = getSourceHealth("test-source");
      
      expect(health.totalRequests).toBe(0);
      expect(health.consecutiveFailures).toBe(0);
    });
  });

  describe("fetchWithErrorHandling", () => {
    it("should return success result on successful fetch", async () => {
      const result = await fetchWithErrorHandling(
        "test-source",
        async () => ({ data: "test" }),
        { timeout: 1000 }
      );
      
      expect(Boolean(result.success)).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ data: "test" });
        expect(result.responseTimeMs).toBeGreaterThanOrEqual(0);
      }
    });

    it("should return error result on failed fetch", async () => {
      const result = await fetchWithErrorHandling(
        "test-source",
        async () => { throw new Error("fetch failed"); },
        { timeout: 1000, retries: 0 }
      );
      
      expect(Boolean(result.success)).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("fetch failed");
      }
    });

    it("should skip unhealthy sources", async () => {
      // Mark source as unhealthy
      recordFailure("test-source", new Error("fail 1"));
      recordFailure("test-source", new Error("fail 2"));
      recordFailure("test-source", new Error("fail 3"));
      
      const result = await fetchWithErrorHandling(
        "test-source",
        async () => ({ data: "test" }),
        { timeout: 1000 }
      );
      
      expect(Boolean(result.success)).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("temporarily disabled");
      }
    });
  });
});
