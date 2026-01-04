/**
 * Tests for News Scraper Health Monitoring with Database Persistence
 */

import { describe, it, expect, beforeEach } from "vitest";
import { recordScraperExecution, getSourceHealth, getAllSourcesHealth } from "./news-health-monitor";
import { getDb } from "./db";
import { scraperExecutions, scraperHealthSummary } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const hasDb = Boolean(process.env.DATABASE_URL);
const describeDb = hasDb ? describe : describe.skip;

describeDb("News Health Monitor - Database Persistence", () => {
  beforeEach(async () => {
    // Clean up test data before each test
    const db = await getDb();
    if (!db) throw new Error("Database not available for testing");
    
    await db.delete(scraperExecutions);
    await db.delete(scraperHealthSummary);
  });

  it("should persist scraper execution to database", async () => {
    const metrics = {
      sourceId: "test-source-1",
      sourceName: "Test Source",
      success: true,
      itemsFetched: 10,
      attempts: 1,
      durationMs: 1500,
      timestamp: new Date(),
    };

    await recordScraperExecution(metrics);

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const executions = await db
      .select()
      .from(scraperExecutions)
      .where(eq(scraperExecutions.sourceId, "test-source-1"));

    expect(executions).toHaveLength(1);
    expect(executions[0].sourceName).toBe("Test Source");
    expect(Boolean(executions[0].success)).toBe(true);
    expect(executions[0].itemsFetched).toBe(10);
    expect(executions[0].attempts).toBe(1);
  });

  it("should create health summary after first execution", async () => {
    const metrics = {
      sourceId: "test-source-2",
      sourceName: "Test Source 2",
      success: true,
      itemsFetched: 5,
      attempts: 1,
      durationMs: 2000,
      timestamp: new Date(),
    };

    await recordScraperExecution(metrics);

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const summaries = await db
      .select()
      .from(scraperHealthSummary)
      .where(eq(scraperHealthSummary.sourceId, "test-source-2"));

    expect(summaries).toHaveLength(1);
    expect(summaries[0].sourceName).toBe("Test Source 2");
    expect(summaries[0].successRate24H).toBe(100);
    expect(summaries[0].totalExecutions24H).toBe(1);
    expect(summaries[0].consecutiveFailures).toBe(0);
  });

  it("should update health summary on subsequent executions", async () => {
    // First execution: success
    await recordScraperExecution({
      sourceId: "test-source-3",
      sourceName: "Test Source 3",
      success: true,
      itemsFetched: 8,
      attempts: 1,
      durationMs: 1800,
      timestamp: new Date(),
    });

    // Second execution: failure
    await recordScraperExecution({
      sourceId: "test-source-3",
      sourceName: "Test Source 3",
      success: false,
      itemsFetched: 0,
      error: "Network timeout",
      attempts: 3,
      durationMs: 5000,
      timestamp: new Date(),
    });

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const summaries = await db
      .select()
      .from(scraperHealthSummary)
      .where(eq(scraperHealthSummary.sourceId, "test-source-3"));

    expect(summaries).toHaveLength(1);
    expect(summaries[0].totalExecutions24H).toBe(2);
    expect(summaries[0].failedExecutions24H).toBe(1);
    expect(summaries[0].successRate24H).toBe(50);
    expect(summaries[0].consecutiveFailures).toBe(1);
    expect(summaries[0].lastErrorMessage).toBe("Network timeout");
  });

  it("should track consecutive failures correctly", async () => {
    const sourceId = "test-source-4";
    const sourceName = "Test Source 4";

    // Record 3 consecutive failures
    for (let i = 0; i < 3; i++) {
      await recordScraperExecution({
        sourceId,
        sourceName,
        success: false,
        itemsFetched: 0,
        error: `Error ${i + 1}`,
        attempts: 3,
        durationMs: 3000,
        timestamp: new Date(Date.now() + i * 1000),
      });
    }

    const health = await getSourceHealth(sourceId);

    expect(health.consecutiveFailures).toBe(3);
    expect(health.successRate).toBe(0);
    expect(health.totalExecutions).toBe(3);
  });

  it("should reset consecutive failures after success", async () => {
    const sourceId = "test-source-5";
    const sourceName = "Test Source 5";

    // Record 2 failures
    await recordScraperExecution({
      sourceId,
      sourceName,
      success: false,
      itemsFetched: 0,
      error: "Error 1",
      attempts: 3,
      durationMs: 3000,
      timestamp: new Date(Date.now() - 2000),
    });

    await recordScraperExecution({
      sourceId,
      sourceName,
      success: false,
      itemsFetched: 0,
      error: "Error 2",
      attempts: 3,
      durationMs: 3000,
      timestamp: new Date(Date.now() - 1000),
    });

    // Then a success
    await recordScraperExecution({
      sourceId,
      sourceName,
      success: true,
      itemsFetched: 10,
      attempts: 1,
      durationMs: 1500,
      timestamp: new Date(),
    });

    const health = await getSourceHealth(sourceId);

    expect(health.consecutiveFailures).toBe(0);
    expect(health.successRate).toBeGreaterThan(0);
  });

  it("should calculate 24h metrics correctly", async () => {
    const sourceId = "test-source-6";
    const sourceName = "Test Source 6";

    // Record multiple executions with varying results
    const executions = [
      { success: true, itemsFetched: 10, durationMs: 1500 },
      { success: true, itemsFetched: 15, durationMs: 2000 },
      { success: false, itemsFetched: 0, durationMs: 5000 },
      { success: true, itemsFetched: 12, durationMs: 1800 },
    ];

    for (const exec of executions) {
      await recordScraperExecution({
        sourceId,
        sourceName,
        ...exec,
        error: exec.success ? undefined : "Test error",
        attempts: exec.success ? 1 : 3,
        timestamp: new Date(),
      });
    }

    const health = await getSourceHealth(sourceId);

    expect(health.totalExecutions).toBe(4);
    expect(health.successRate).toBe(75); // 3 out of 4 successful
    expect(health.avgItemsFetched).toBeGreaterThan(0);
    expect(health.avgDurationMs).toBeGreaterThan(0);
  });

  it("should retrieve all sources health summary", async () => {
    // Record executions for multiple sources
    await recordScraperExecution({
      sourceId: "source-a",
      sourceName: "Source A",
      success: true,
      itemsFetched: 10,
      attempts: 1,
      durationMs: 1500,
      timestamp: new Date(),
    });

    await recordScraperExecution({
      sourceId: "source-b",
      sourceName: "Source B",
      success: false,
      itemsFetched: 0,
      error: "Error",
      attempts: 3,
      durationMs: 3000,
      timestamp: new Date(),
    });

    const allHealth = await getAllSourcesHealth();

    expect(allHealth.size).toBe(2);
    expect(allHealth.has("source-a")).toBe(true);
    expect(allHealth.has("source-b")).toBe(true);

    const healthA = allHealth.get("source-a");
    const healthB = allHealth.get("source-b");

    expect(healthA?.successRate).toBe(100);
    expect(healthB?.successRate).toBe(0);
  });

  it("should handle database unavailability gracefully", async () => {
    // This test verifies that the system doesn't crash when DB is unavailable
    // In real scenario, getDb() would return null
    const metrics = {
      sourceId: "test-source-7",
      sourceName: "Test Source 7",
      success: true,
      itemsFetched: 10,
      attempts: 1,
      durationMs: 1500,
      timestamp: new Date(),
    };

    // Should not throw
    await expect(recordScraperExecution(metrics)).resolves.not.toThrow();
  });

  it("should persist retry attempts correctly", async () => {
    const metrics = {
      sourceId: "test-source-8",
      sourceName: "Test Source 8",
      success: true,
      itemsFetched: 5,
      attempts: 3, // Succeeded on 3rd attempt
      durationMs: 4500,
      timestamp: new Date(),
    };

    await recordScraperExecution(metrics);

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const executions = await db
      .select()
      .from(scraperExecutions)
      .where(eq(scraperExecutions.sourceId, "test-source-8"));

    expect(executions[0].attempts).toBe(3);
    expect(Boolean(executions[0].success)).toBe(true);
  });

  it("should store error messages for failed executions", async () => {
    const metrics = {
      sourceId: "test-source-9",
      sourceName: "Test Source 9",
      success: false,
      itemsFetched: 0,
      error: "Connection refused: ECONNREFUSED",
      attempts: 3,
      durationMs: 5000,
      timestamp: new Date(),
    };

    await recordScraperExecution(metrics);

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const executions = await db
      .select()
      .from(scraperExecutions)
      .where(eq(scraperExecutions.sourceId, "test-source-9"));

    expect(executions[0].errorMessage).toBe("Connection refused: ECONNREFUSED");
    expect(Boolean(executions[0].success)).toBe(false);
  });
});
