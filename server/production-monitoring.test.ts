/**
 * Production Monitoring Tests
 * 
 * Tests for error tracking and performance monitoring infrastructure.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  trackError,
  getRecentErrors,
  getErrorStats,
  clearErrors,
} from "./_core/error-tracking";
import {
  trackPerformance,
  getRecentMetrics,
  getPercentiles,
  getPerformanceSummary,
  clearMetrics,
  measurePerformance,
} from "./_core/performance-monitoring";

describe("Error Tracking", () => {
  beforeEach(() => {
    clearErrors();
  });

  it("should track errors with context", async () => {
    const errorId = await trackError(
      new Error("Test error"),
      "error",
      {
        userId: "user123",
        requestPath: "/api/test",
      }
    );

    expect(errorId).toMatch(/^err_/);

    const errors = getRecentErrors(10);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe("Test error");
    expect(errors[0].context.userId).toBe("user123");
  });

  it("should deduplicate identical errors", async () => {
    // Use string errors for consistent deduplication (no stack trace variation)
    await trackError("Duplicate error", "error");
    await trackError("Duplicate error", "error");
    await trackError("Duplicate error", "error");

    const errors = getRecentErrors(10);
    expect(errors).toHaveLength(1);
    expect(errors[0].count).toBe(3);
  });

  it("should track different severity levels", async () => {
    await trackError("Info message", "info");
    await trackError("Warning message", "warning");
    await trackError(new Error("Error message"), "error");

    const stats = getErrorStats();
    expect(stats.bySeverity.info).toBeGreaterThan(0);
    expect(stats.bySeverity.warning).toBeGreaterThan(0);
    expect(stats.bySeverity.error).toBeGreaterThan(0);
  });

  it("should filter errors by severity", async () => {
    await trackError("Critical error", "critical");
    await trackError("Regular error", "error");

    const criticalErrors = getRecentErrors(10, "critical");
    expect(criticalErrors).toHaveLength(1);
    expect(criticalErrors[0].severity).toBe("critical");
  });

  it("should provide error statistics", async () => {
    await trackError("Error 1", "error");
    await trackError("Error 2", "warning");
    await trackError("Error 3", "error");

    const stats = getErrorStats();
    expect(stats.total).toBe(3);
    expect(stats.topErrors).toHaveLength(3);
  });
});

describe("Performance Monitoring", () => {
  beforeEach(() => {
    clearMetrics();
  });

  it("should track performance metrics", () => {
    trackPerformance("api.test", 150);
    trackPerformance("api.test", 200);
    trackPerformance("api.test", 100);

    const metrics = getRecentMetrics(10, "api.test");
    expect(metrics).toHaveLength(3);
    expect(metrics[0].duration).toBe(100); // Most recent first
  });

  it("should calculate percentiles", () => {
    // Add 100 metrics with varying durations
    for (let i = 1; i <= 100; i++) {
      trackPerformance("api.test", i * 10);
    }

    const percentiles = getPercentiles("api.test", 60);
    expect(percentiles.count).toBe(100);
    expect(percentiles.p50).toBeGreaterThan(0);
    expect(percentiles.p95).toBeGreaterThan(percentiles.p50);
    expect(percentiles.p99).toBeGreaterThan(percentiles.p95);
    expect(percentiles.min).toBe(10);
    expect(percentiles.max).toBe(1000);
  });

  it("should filter metrics by operation pattern", () => {
    trackPerformance("api.users.list", 100);
    trackPerformance("api.users.get", 50);
    trackPerformance("api.posts.list", 200);

    const userMetrics = getRecentMetrics(10, "api.users.*");
    expect(userMetrics).toHaveLength(2);
  });

  it("should provide performance summary", () => {
    trackPerformance("api.test", 100);
    trackPerformance("api.test", 200);
    trackPerformance("database.query", 50);

    const summary = getPerformanceSummary();
    expect(summary.api).toBeDefined();
    expect(summary.api.count).toBe(2);
    expect(summary.database).toBeDefined();
    expect(summary.database.count).toBe(1);
  });

  it("should measure async operation performance", async () => {
    const result = await measurePerformance(
      "test.async",
      async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return "success";
      }
    );

    expect(result).toBe("success");

    const metrics = getRecentMetrics(10, "test.async");
    expect(metrics).toHaveLength(1);
    expect(metrics[0].duration).toBeGreaterThanOrEqual(10);
  });

  it("should track errors in measured operations", async () => {
    try {
      await measurePerformance(
        "test.error",
        async () => {
          throw new Error("Test error");
        }
      );
    } catch (error) {
      // Expected error
    }

    const metrics = getRecentMetrics(10, "test.error");
    expect(metrics).toHaveLength(1);
    expect(metrics[0].metadata?.error).toBe(true);
  });
});

describe("Performance Thresholds", () => {
  beforeEach(() => {
    clearMetrics();
    clearErrors();
  });

  it("should warn on slow API operations", async () => {
    // Track a slow API operation (>500ms threshold)
    trackPerformance("api.slow", 600);

    // Should generate a warning error
    const errors = getRecentErrors(10, "warning");
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain("Slow operation");
  });

  it("should not warn on fast operations", () => {
    trackPerformance("api.fast", 100);

    const errors = getRecentErrors(10, "warning");
    expect(errors).toHaveLength(0);
  });
});

describe("Monitoring Integration", () => {
  beforeEach(() => {
    clearErrors();
    clearMetrics();
  });

  it("should track both errors and performance", async () => {
    // Track performance
    trackPerformance("api.test", 150);

    // Track error
    await trackError("Test error", "error");

    // Verify both are tracked
    const metrics = getRecentMetrics(10);
    const errors = getRecentErrors(10);

    expect(metrics).toHaveLength(1);
    expect(errors).toHaveLength(1);
  });

  it("should provide comprehensive monitoring data", async () => {
    // Simulate some activity
    trackPerformance("api.users", 100);
    trackPerformance("api.posts", 200);
    await trackError("API error", "error");
    await trackError("Database error", "warning");

    // Get monitoring data
    const perfSummary = getPerformanceSummary();
    const errorStats = getErrorStats();

    expect(perfSummary.api.count).toBe(2);
    expect(errorStats.total).toBe(2);
  });
});
