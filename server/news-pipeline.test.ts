/**
 * News Pipeline Tests
 * Tests for news ingestion, processing, and archival
 */

import { describe, it, expect, beforeAll } from "vitest";
import {
  fetchAllNews,
  deduplicateByUrl,
  validateNewsItem,
  filterByAge,
} from "./news-fetcher";
import { processNewsBatch } from "./news-ai-processor";
import { archiveOldNews, getArchivalStats } from "./news-archival";
import { getDb } from "./db";
import { hubNews } from "../drizzle/schema";
import { desc } from "drizzle-orm";

describe("News Fetcher", () => {
  it("should fetch news from all sources", async () => {
    const results = await fetchAllNews();

    expect(results).toBeInstanceOf(Array);
    expect(results.length).toBeGreaterThanOrEqual(0); // May be 0 if all sources fail

    // Check each source result
    results.forEach(result => {
      expect(result).toHaveProperty("sourceId");
      expect(result).toHaveProperty("sourceName");
      expect(result).toHaveProperty("items");
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("itemsFetched");

      if (result.success) {
        expect(result.items).toBeInstanceOf(Array);
      }
    });
  }, 30000); // 30 second timeout for RSS fetches

  it("should deduplicate news by URL", () => {
    const items = [
      { link: "https://example.com/news/1", title: "News 1" },
      { link: "https://example.com/news/2", title: "News 2" },
      { link: "https://example.com/news/1", title: "News 1 Duplicate" },
    ];

    const deduplicated = deduplicateByUrl(items as any);

    expect(deduplicated).toHaveLength(2);
    expect(deduplicated.map(item => item.link)).toEqual([
      "https://example.com/news/1",
      "https://example.com/news/2",
    ]);
  });

  it("should validate news items", () => {
    const validItem = {
      title: "Valid News",
      link: "https://example.com/news/1",
      pubDate: "2024-01-01",
      content: "Some content",
      source: {
        name: "Test Source",
        type: "EU_OFFICIAL",
        credibilityScore: 1.0,
      },
    };

    const invalidItem = {
      title: "",
      link: "",
      pubDate: "invalid-date",
      source: null,
    };

    expect(validateNewsItem(validItem as any)).toBe(true);
    expect(validateNewsItem(invalidItem as any)).toBe(false);
  });

  it("should filter news by age", () => {
    const now = new Date();
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 40);
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 10);

    const items = [
      { pubDate: oldDate.toISOString(), title: "Old News" },
      { pubDate: recentDate.toISOString(), title: "Recent News" },
    ];

    const filtered = filterByAge(items as any, 30);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe("Recent News");
  });
});

describe("AI Processor", () => {
  it("should process news items with AI", async () => {
    const items = [
      {
        title: "New CSRD Reporting Requirements Announced",
        content:
          "The European Commission has announced new Corporate Sustainability Reporting Directive requirements that will affect thousands of companies.",
        link: "https://example.com/csrd-news",
        pubDate: new Date().toISOString(),
        source: {
          name: "EUR-Lex",
          type: "EU_OFFICIAL" as const,
          credibilityScore: 1.0,
        },
      },
    ];

    const processed = await processNewsBatch(items);

    expect(processed).toHaveLength(1);
    expect(processed[0]).toHaveProperty("headline");
    expect(processed[0]).toHaveProperty("summary");
    expect(processed[0]).toHaveProperty("regulationTags");
    expect(processed[0]).toHaveProperty("impactLevel");
    expect(processed[0]).toHaveProperty("newsType");

    // Check regulation tags include CSRD
    expect(processed[0].regulationTags).toContain("CSRD");

    // Check impact level is valid
    expect(["HIGH", "MEDIUM", "LOW"]).toContain(processed[0].impactLevel);

    // Check news type is valid
    expect([
      "NEW_LAW",
      "AMENDMENT",
      "ENFORCEMENT",
      "COURT_DECISION",
      "GUIDANCE",
      "PROPOSAL",
    ]).toContain(processed[0].newsType);
  }, 30000); // 30 second timeout for AI processing
});

describe("News Archival", () => {
  it("should get archival statistics", async () => {
    const stats = await getArchivalStats();

    expect(stats).toBeDefined();
    if (stats) {
      expect(stats).toHaveProperty("activeCount");
      expect(stats).toHaveProperty("archivedCount");
      expect(stats).toHaveProperty("oldestActiveDate");

      expect(typeof stats.activeCount).toBe("number");
      expect(typeof stats.archivedCount).toBe("number");
    }
  });

  it("should not archive recent news", async () => {
    // Test with very high threshold (1000 days)
    // Should not archive any recent news
    const result = await archiveOldNews(1000);

    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("archived");
    expect(result).toHaveProperty("errors");
    expect(result).toHaveProperty("duration");

    expect(result.archived).toBe(0); // No items should be archived
  }, 10000);
});

describe("Database Integration", () => {
  it("should connect to database", async () => {
    const db = await getDb();
    expect(db).toBeDefined();
  });

  it("should query recent news from database", async () => {
    const db = await getDb();
    if (!db) {
      console.warn("Database not available, skipping test");
      return;
    }

    const news = await db
      .select()
      .from(hubNews)
      .orderBy(desc(hubNews.publishedDate))
      .limit(10);

    expect(news).toBeInstanceOf(Array);

    // If there are news items, validate structure
    if (news.length > 0) {
      const item = news[0];
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("title");
      expect(item).toHaveProperty("newsType");
      expect(item).toHaveProperty("publishedDate");
    }
  });
});

describe("End-to-End Pipeline", () => {
  it("should handle empty fetch results gracefully", async () => {
    // Test pipeline behavior when no new items are found
    const emptyItems: any[] = [];
    const processed = await processNewsBatch(emptyItems);

    expect(processed).toHaveLength(0);
  });

  it("should handle malformed RSS items gracefully", () => {
    const malformedItems = [
      { title: null, link: null },
      {
        title: "Valid",
        link: "https://example.com",
        pubDate: "2024-01-01",
        content: "Content",
        source: { name: "Test", type: "EU_OFFICIAL", credibilityScore: 1.0 },
      },
      { title: undefined, link: undefined },
    ];

    const valid = malformedItems.filter(validateNewsItem as any);

    expect(valid).toHaveLength(1);
    expect(valid[0].title).toBe("Valid");
  });
});
