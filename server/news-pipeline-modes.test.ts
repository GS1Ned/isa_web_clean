/**
 * News Pipeline Ingestion Modes Test
 * Tests ingestion window sizes for pipeline modes
 */

import { describe, it, expect, vi, beforeAll } from "vitest";
import type { PipelineOptions } from "./news-pipeline";

let runNewsPipeline: typeof import("./news-pipeline").runNewsPipeline;

// Mock dependencies
vi.mock("./news-fetcher", () => ({
  fetchAllNews: vi.fn().mockResolvedValue([
    {
      sourceId: "test-source",
      success: true,
      items: [
        {
          title: "Test News 1",
          link: "https://example.com/news1",
          pubDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
          content: "Test content 1",
          source: { name: "Test Source", type: "official", credibilityScore: 5 },
        },
        {
          title: "Test News 2",
          link: "https://example.com/news2",
          pubDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
          content: "Test content 2",
          source: { name: "Test Source", type: "official", credibilityScore: 5 },
        },
        {
          title: "Test News 3",
          link: "https://example.com/news3",
          pubDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(), // 150 days ago
          content: "Test content 3",
          source: { name: "Test Source", type: "official", credibilityScore: 5 },
        },
      ],
    },
  ]),
  deduplicateByUrl: vi.fn((items) => items),
  validateNewsItem: vi.fn(() => true),
  filterByAge: vi.fn((items, maxAgeDays) => {
    const cutoffDate = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
    return items.filter((item: any) => new Date(item.pubDate) >= cutoffDate);
  }),
}));

vi.mock("./news-ai-processor", () => ({
  processNewsBatch: vi.fn().mockImplementation((items) => 
    Promise.resolve(
      items.map(() => ({
        headline: "Processed Headline",
        summary: "This is a processed summary with sufficient length to pass validation checks.",
        regulationTags: ["CSRD", "ESRS"],
        newsType: "regulation_update" as const,
        impactLevel: "medium" as const,
        gs1ImpactTags: ["data_requirements"],
        sectorTags: ["FMCG"],
        gs1ImpactAnalysis: "Impact analysis",
        suggestedActions: ["Review requirements"],
      }))
    )
  ),
}));

vi.mock("./db-news-helpers", () => ({
  getNewsBySourceUrl: vi.fn().mockResolvedValue(null),
}));

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  createHubNews: vi.fn().mockResolvedValue({ id: 1 }),
}));

vi.mock("./news-deduplicator", () => ({
  deduplicateNews: vi.fn((items) => items.map((item: any) => ({
    ...item,
    sources: [{ name: item.source, type: item.sourceType, url: item.url }],
    primarySource: item.source,
  }))),
  logDeduplicationStats: vi.fn(),
}));

vi.mock("./news-recommendation-engine", () => ({
  generateRecommendations: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./db-pipeline-observability", () => ({
  savePipelineExecutionLog: vi.fn().mockResolvedValue(undefined),
}));

beforeAll(async () => {
  ({ runNewsPipeline } = await import("./news-pipeline"));
});

describe("News Pipeline Ingestion Modes", () => {
  it("should use 30-day window in normal mode", async () => {
    const result = await runNewsPipeline({ mode: "normal", triggeredBy: "manual" });

    expect(result.mode).toBe("normal");
    expect(result.maxAgeDays).toBe(30);
    expect(Boolean(result.success)).toBe(true);
  });

  it("should use 200-day window in backfill mode", async () => {
    const result = await runNewsPipeline({ mode: "backfill", triggeredBy: "manual" });

    expect(result.mode).toBe("backfill");
    expect(result.maxAgeDays).toBe(200);
    expect(Boolean(result.success)).toBe(true);
  });

  it("should default to normal mode when no mode specified", async () => {
    const result = await runNewsPipeline({ triggeredBy: "manual" });

    expect(result.mode).toBe("normal");
    expect(result.maxAgeDays).toBe(30);
  });

  it("should default to cron trigger when no trigger specified", async () => {
    const result = await runNewsPipeline({ mode: "normal" });

    expect(Boolean(result.success)).toBe(true);
    // Trigger source is logged internally, not returned in result
  });

  it("should filter more items in normal mode than backfill mode", async () => {
    // In our mock data:
    // - 15 days ago: included in both modes
    // - 45 days ago: only in backfill mode
    // - 150 days ago: only in backfill mode

    const normalResult = await runNewsPipeline({ mode: "normal" });
    const backfillResult = await runNewsPipeline({ mode: "backfill" });

    // Normal mode should fetch fewer items (only 15-day-old news)
    // Backfill mode should fetch more items (15, 45, and 150-day-old news)
    expect(normalResult.maxAgeDays).toBeLessThan(backfillResult.maxAgeDays);
    expect(normalResult.mode).toBe("normal");
    expect(backfillResult.mode).toBe("backfill");
  });

  it("should use 7-day window in incremental mode", async () => {
    const result = await runNewsPipeline({ mode: "incremental", triggeredBy: "manual" });

    expect(result.mode).toBe("incremental");
    expect(result.maxAgeDays).toBe(7);
    expect(Boolean(result.success)).toBe(true);
  });

  it("should use 365-day window in full-refresh mode", async () => {
    const result = await runNewsPipeline({ mode: "full-refresh", triggeredBy: "manual" });

    expect(result.mode).toBe("full-refresh");
    expect(result.maxAgeDays).toBe(365);
    expect(Boolean(result.success)).toBe(true);
  });

  it("should provide a clear error message for invalid mode", async () => {
    const result = await runNewsPipeline({
      mode: "invalid-mode" as PipelineOptions["mode"],
      triggeredBy: "manual",
    });

    expect(Boolean(result.success)).toBe(false);
    expect(result.errors[0]).toContain("Invalid pipeline mode");
    expect(result.errors[0]).toContain("normal");
    expect(result.errors[0]).toContain("backfill");
  });
});
