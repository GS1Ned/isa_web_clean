/**
 * Integration test: News pipeline with database-backed health monitoring
 * Verifies that health tracking persists across pipeline executions
 */

import { describe, it, expect, beforeEach } from "vitest";
import { retryWithBackoff } from "./news-retry-util";
import { recordScraperExecution, getSourceHealth, getAllSourcesHealth } from "./news-health-monitor";
import { getDb } from "./db";
import { scraperExecutions, scraperHealthSummary } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const hasDb = Boolean(process.env.DATABASE_URL);
const describeDb = hasDb ? describe : describe.skip;

describeDb("News Pipeline - Database Integration", () => {
  beforeEach(async () => {
    // Clean up test data
    const db = await getDb();
    if (!db) throw new Error("Database not available for testing");
    
    await db.delete(scraperExecutions);
    await db.delete(scraperHealthSummary);
  });

  it("should persist health metrics after successful fetch", async () => {
    const mockFetcher = async () => {
      return [
        {
          title: "Test Article",
          url: "https://example.com/test",
          publishedAt: new Date().toISOString(),
          summary: "Test summary",
        },
      ];
    };

    const startTime = Date.now();
    const items = await retryWithBackoff(mockFetcher, {}, "test-source-integration");
    
    // Record execution (simulating what news-fetcher does)
    await recordScraperExecution({
      sourceId: "test-source-integration",
      sourceName: "Test Integration Source",
      success: true,
      itemsFetched: items.length,
      attempts: 1,
      durationMs: Date.now() - startTime,
      timestamp: new Date(),
    });

    expect(items).toHaveLength(1);

    // Verify database persistence
    const health = await getSourceHealth("test-source-integration");
    expect(health.totalExecutions).toBe(1);
    expect(health.successRate).toBe(100);
    expect(health.consecutiveFailures).toBe(0);

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const executions = await db
      .select()
      .from(scraperExecutions)
      .where(eq(scraperExecutions.sourceId, "test-source-integration"));
    expect(executions).toHaveLength(1);
    expect(Boolean(executions[0].success)).toBe(true);
    expect(executions[0].itemsFetched).toBe(1);
  });

  it("should persist health metrics after failed fetch with retries", async () => {
    let attemptCount = 0;
    const mockFetcher = async () => {
      attemptCount++;
      throw new Error("Simulated network error");
    };

    const startTime = Date.now();
    let error: string | undefined;
    
    try {
      await retryWithBackoff(mockFetcher, { maxAttempts: 3 }, "test-source-failure");
    } catch (e) {
      error = e instanceof Error ? e.message : "Unknown error";
    }
    
    // Record execution (simulating what news-fetcher does)
    await recordScraperExecution({
      sourceId: "test-source-failure",
      sourceName: "Test Failure Source",
      success: false,
      itemsFetched: 0,
      error,
      attempts: 3,
      durationMs: Date.now() - startTime,
      timestamp: new Date(),
    });

    expect(error).toContain("Simulated network error");
    expect(attemptCount).toBe(3); // Should retry 3 times

    // Verify database persistence
    const health = await getSourceHealth("test-source-failure");
    expect(health.totalExecutions).toBe(1);
    expect(health.successRate).toBe(0);
    expect(health.consecutiveFailures).toBe(1);

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const executions = await db
      .select()
      .from(scraperExecutions)
      .where(eq(scraperExecutions.sourceId, "test-source-failure"));
    expect(executions).toHaveLength(1);
    expect(Boolean(executions[0].success)).toBe(false);
    expect(executions[0].attempts).toBe(3);
    expect(executions[0].errorMessage).toContain("Simulated network error");
  });

  it("should track health across multiple pipeline runs", async () => {
    const mockFetcher = async () => {
      return [{ title: "Test", url: "https://example.com", publishedAt: new Date().toISOString(), summary: "Test" }];
    };

    // Run 1: Success
    const items1 = await retryWithBackoff(mockFetcher);
    await recordScraperExecution({
      sourceId: "multi-run-source",
      sourceName: "Multi Run Source",
      success: true,
      itemsFetched: items1.length,
      attempts: 1,
      durationMs: 100,
      timestamp: new Date(),
    });

    // Run 2: Success
    const items2 = await retryWithBackoff(mockFetcher);
    await recordScraperExecution({
      sourceId: "multi-run-source",
      sourceName: "Multi Run Source",
      success: true,
      itemsFetched: items2.length,
      attempts: 1,
      durationMs: 100,
      timestamp: new Date(),
    });

    // Run 3: Failure
    try {
      await retryWithBackoff(async () => { throw new Error("Temporary failure"); });
    } catch (e) {
      await recordScraperExecution({
        sourceId: "multi-run-source",
        sourceName: "Multi Run Source",
        success: false,
        itemsFetched: 0,
        error: "Temporary failure",
        attempts: 3,
        durationMs: 100,
        timestamp: new Date(),
      });
    }

    const health = await getSourceHealth("multi-run-source");
    expect(health.totalExecutions).toBe(3);
    expect(health.successRate).toBeGreaterThan(50); // 2 out of 3 successful
    expect(health.consecutiveFailures).toBe(1); // Last one failed

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const executions = await db
      .select()
      .from(scraperExecutions)
      .where(eq(scraperExecutions.sourceId, "multi-run-source"));
    expect(executions).toHaveLength(3);
  });

  it("should maintain separate health tracking for different sources", async () => {
    const mockFetcher1 = async () => [{ title: "A", url: "https://a.com", publishedAt: new Date().toISOString(), summary: "A" }];

    const items1 = await retryWithBackoff(mockFetcher1);
    await recordScraperExecution({
      sourceId: "source-1",
      sourceName: "Source 1",
      success: true,
      itemsFetched: items1.length,
      attempts: 1,
      durationMs: 100,
      timestamp: new Date(),
    });

    try {
      await retryWithBackoff(async () => { throw new Error("Source 2 error"); });
    } catch (e) {
      await recordScraperExecution({
        sourceId: "source-2",
        sourceName: "Source 2",
        success: false,
        itemsFetched: 0,
        error: "Source 2 error",
        attempts: 3,
        durationMs: 100,
        timestamp: new Date(),
      });
    }

    const allHealth = await getAllSourcesHealth();
    expect(allHealth.size).toBe(2);

    const health1 = await getSourceHealth("source-1");
    const health2 = await getSourceHealth("source-2");

    expect(health1.successRate).toBe(100);
    expect(health2.successRate).toBe(0);
  });

  it("should persist duration metrics correctly", async () => {
    const mockFetcher = async () => {
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 100));
      return [{ title: "Test", url: "https://example.com", publishedAt: new Date().toISOString(), summary: "Test" }];
    };

    const startTime = Date.now();
    const items = await retryWithBackoff(mockFetcher);
    const durationMs = Date.now() - startTime;
    
    await recordScraperExecution({
      sourceId: "duration-test",
      sourceName: "Duration Test Source",
      success: true,
      itemsFetched: items.length,
      attempts: 1,
      durationMs,
      timestamp: new Date(),
    });

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const executions = await db
      .select()
      .from(scraperExecutions)
      .where(eq(scraperExecutions.sourceId, "duration-test"));
    expect(executions).toHaveLength(1);
    expect(executions[0].durationMs).toBeGreaterThan(0);
    expect(executions[0].durationMs).toBeLessThan(10000); // Should complete in reasonable time
  });
});
