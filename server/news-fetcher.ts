/**
 * News Fetcher Service
 * Fetches ESG regulatory news from configured RSS sources
 * Handles deduplication, validation, and error recovery
 */

import Parser from "rss-parser";
import { NEWS_SOURCES, type NewsSource } from "./news-sources";
import {
  scrapeGS1NetherlandsNewsPlaywright,
  scrapeArticleDetailPlaywright,
} from "./news-scraper-playwright";
import {
  scrapeEFRAGNewsPlaywright,
  scrapeEFRAGArticleDetail,
} from "./news-scraper-efrag";
import { scrapeGreenDealZorg } from "./news/news-scraper-greendeal";
import { scrapeZESNews } from "./news/news-scraper-zes";
import { scrapeGS1EuropeNews } from "./news/news-scraper-gs1eu";
import { fetchEURLexNews } from "./news/news-scraper-eurlex";
import { retryWithBackoff } from "./news-retry-util";
import { recordScraperExecution, printHealthSummary } from "./news-health-monitor";
import { serverLogger } from "./_core/logger-wiring";


export interface RawNewsItem {
  title: string;
  link: string;
  pubDate: string;
  content?: string;
  contentSnippet?: string;
  creator?: string;
  categories?: string[];
  guid?: string;
  source: NewsSource;
}

export interface FetchResult {
  success: boolean;
  sourceId: string;
  sourceName: string;
  itemsFetched: number;
  items: RawNewsItem[];
  error?: string;
}

const parser = new Parser({
  timeout: 10000, // 10 second timeout per feed
  headers: {
    "User-Agent": "ISA-News-Aggregator/1.0 (GS1 Netherlands ESG Intelligence)",
  },
});

/**
 * Fetch news from a single RSS source
 */
export async function fetchFromSource(
  source: NewsSource
): Promise<FetchResult> {
  if (!source.enabled) {
    return {
      success: false,
      sourceId: source.id,
      sourceName: source.name,
      itemsFetched: 0,
      items: [],
      error: "Source disabled",
    };
  }

  // Use web scraper for GS1 Netherlands
  if (source.id === "gs1-nl-news") {
    try {
      const articles = await retryWithBackoff(
        () => scrapeGS1NetherlandsNewsPlaywright(),
        { maxAttempts: 3, initialDelayMs: 2000 },
        "GS1 NL scraper"
      );

      // Fetch full content for each article (parallel)
      console.log(
        `[news-fetcher] Fetching full content for ${articles.length} GS1.nl articles...`
      );
      const articlesWithContent = await Promise.all(
        articles.map(async article => {
          const fullContent = await scrapeArticleDetailPlaywright(article.url);
          return {
            ...article,
            summary: fullContent || article.summary || "",
          };
        })
      );

      // Skip keyword filtering - articles are pre-filtered by GS1's sustainability category
      const relevantItems = articlesWithContent
        .filter(article => {
          // Only filter by date - keep articles from past 3 months
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          return article.publishedAt >= threeMonthsAgo;
        })
        .map(article => ({
          title: article.title,
          link: article.url,
          pubDate: article.publishedAt.toISOString(),
          content: article.summary || "",
          contentSnippet: article.summary || "",
          creator: source.name,
          categories: [],
          guid: article.url,
          source,
        }));

      return {
        success: true,
        sourceId: source.id,
        sourceName: source.name,
        itemsFetched: relevantItems.length,
        items: relevantItems,
      };
    } catch (error) {
      serverLogger.error(`[news-fetcher] Error scraping ${source.name}:`, error);
      return {
        success: false,
        sourceId: source.id,
        sourceName: source.name,
        itemsFetched: 0,
        items: [],
        error: error instanceof Error ? error.message : "Scraping failed",
      };
    }
  }

  // Use web scraper for Green Deal Zorg
  if (source.id === "greendeal-healthcare") {
    try {
      const articles = await retryWithBackoff(
        () => scrapeGreenDealZorg(),
        { maxAttempts: 3, initialDelayMs: 2000 },
        "Green Deal Zorg scraper"
      );
      return {
        success: true,
        sourceId: source.id,
        sourceName: source.name,
        itemsFetched: articles.length,
        items: articles,
      };
    } catch (error) {
      serverLogger.error(`[news-fetcher] Error scraping ${source.name}:`, error);
      return {
        success: false,
        sourceId: source.id,
        sourceName: source.name,
        itemsFetched: 0,
        items: [],
        error: error instanceof Error ? error.message : "Scraping failed",
      };
    }
  }

  // Use web scraper for ZES (Zero-Emission Zones)
  if (source.id === "zes-logistics") {
    try {
      const articles = await retryWithBackoff(
        () => scrapeZESNews(),
        { maxAttempts: 3, initialDelayMs: 2000 },
        "ZES scraper"
      );
      return {
        success: true,
        sourceId: source.id,
        sourceName: source.name,
        itemsFetched: articles.length,
        items: articles,
      };
    } catch (error) {
      serverLogger.error(`[news-fetcher] Error scraping ${source.name}:`, error);
      return {
        success: false,
        sourceId: source.id,
        sourceName: source.name,
        itemsFetched: 0,
        items: [],
        error: error instanceof Error ? error.message : "Scraping failed",
      };
    }
  }

  // Use Playwright scraper for EUR-Lex Official Journal
  if (source.id === "eurlex-oj") {
    try {
      const articles = await retryWithBackoff(
        () => fetchEURLexNews(),
        { maxAttempts: 3, initialDelayMs: 2000 },
        "EUR-Lex scraper"
      );
      return {
        success: true,
        sourceId: source.id,
        sourceName: source.name,
        itemsFetched: articles.length,
        items: articles,
      };
    } catch (error) {
      serverLogger.error(`[news-fetcher] Error scraping ${source.name}:`, error);
      return {
        success: false,
        sourceId: source.id,
        sourceName: source.name,
        itemsFetched: 0,
        items: [],
        error: error instanceof Error ? error.message : "Scraping failed",
      };
    }
  }

  // Use web scraper for GS1 Europe (RSS blocked by Cloudflare)
  if (source.id === "gs1-eu-updates") {
    try {
      const articles = await retryWithBackoff(
        () => scrapeGS1EuropeNews(),
        { maxAttempts: 3, initialDelayMs: 2000 },
        "GS1 Europe scraper"
      );
      return {
        success: true,
        sourceId: source.id,
        sourceName: source.name,
        itemsFetched: articles.length,
        items: articles,
      };
    } catch (error) {
      serverLogger.error(`[news-fetcher] Error scraping ${source.name}:`, error);
      return {
        success: false,
        sourceId: source.id,
        sourceName: source.name,
        itemsFetched: 0,
        items: [],
        error: error instanceof Error ? error.message : "Scraping failed",
      };
    }
  }

  // Use web scraper for EFRAG
  if (source.id === "efrag-sustainability") {
    try {
      const articles = await retryWithBackoff(
        () => scrapeEFRAGNewsPlaywright(),
        { maxAttempts: 3, initialDelayMs: 2000 },
        "EFRAG scraper"
      );

      // Fetch full content for each article (parallel)
      console.log(
        `[news-fetcher] Fetching full content for ${articles.length} EFRAG articles...`
      );
      const articlesWithContent = await Promise.all(
        articles.map(async article => {
          const fullContent = await scrapeEFRAGArticleDetail(article.url);
          return {
            ...article,
            summary: fullContent || article.summary || "",
          };
        })
      );

      const relevantItems = articlesWithContent
        .filter(article => {
          // Only filter by date - keep articles from past 3 months
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          return article.publishedAt >= threeMonthsAgo;
        })
        .map(article => ({
          title: article.title,
          link: article.url,
          pubDate: article.publishedAt.toISOString(),
          content: article.summary || "",
          contentSnippet: article.summary || "",
          creator: source.name,
          categories: [],
          guid: article.url,
          source,
        }));

      return {
        success: true,
        sourceId: source.id,
        sourceName: source.name,
        itemsFetched: relevantItems.length,
        items: relevantItems,
      };
    } catch (error) {
      serverLogger.error(`[news-fetcher] Error scraping ${source.name}:`, error);
      return {
        success: false,
        sourceId: source.id,
        sourceName: source.name,
        itemsFetched: 0,
        items: [],
        error: error instanceof Error ? error.message : "Scraping failed",
      };
    }
  }

  // Fall back to RSS for other sources
  if (!source.rssUrl) {
    return {
      success: false,
      sourceId: source.id,
      sourceName: source.name,
      itemsFetched: 0,
      items: [],
      error: "No RSS URL or scraper configured",
    };
  }

  try {
    const feed = await parser.parseURL(source.rssUrl);

    // Filter items by ESG keywords
    const relevantItems = feed.items
      .filter(item => isRelevant(item, source.keywords))
      .map(item => ({
        title: item.title || "Untitled",
        link: item.link || item.guid || "",
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        content: item.content || item["content:encoded"] || "",
        contentSnippet: item.contentSnippet || "",
        creator: item.creator || item.author || source.name,
        categories: item.categories || [],
        guid: item.guid || item.link || "",
        source,
      }));

    return {
      success: true,
      sourceId: source.id,
      sourceName: source.name,
      itemsFetched: relevantItems.length,
      items: relevantItems,
    };
  } catch (error) {
    serverLogger.error(`[news-fetcher] Error fetching from ${source.name}:`, error);
    return {
      success: false,
      sourceId: source.id,
      sourceName: source.name,
      itemsFetched: 0,
      items: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Fetch news from all enabled sources with health monitoring
 */
export async function fetchAllNews(): Promise<FetchResult[]> {
  const enabledSources = NEWS_SOURCES.filter(s => s.enabled);

  console.log(
    `[news-fetcher] Fetching from ${enabledSources.length} sources...`
  );

  // Fetch from all sources with individual timing
  const results = await Promise.all(
    enabledSources.map(async source => {
      const startTime = Date.now();
      
      try {
        const result = await fetchFromSource(source);
        
        // Estimate attempts from retry logic (if failed after retries, attempts = 3)
        const attempts = result.success ? 1 : 3;
        
        // Record health metrics
        recordScraperExecution({
          sourceId: source.id,
          sourceName: source.name,
          success: result.success,
          itemsFetched: result.itemsFetched,
          error: result.error,
          attempts,
          durationMs: Date.now() - startTime,
          timestamp: new Date(),
        });
        
        return result;
      } catch (error) {
        // Unexpected error outside fetchFromSource
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        
        recordScraperExecution({
          sourceId: source.id,
          sourceName: source.name,
          success: false,
          itemsFetched: 0,
          error: errorMessage,
          attempts: 3,
          durationMs: Date.now() - startTime,
          timestamp: new Date(),
        });
        
        return {
          success: false,
          sourceId: source.id,
          sourceName: source.name,
          itemsFetched: 0,
          items: [],
          error: errorMessage,
        };
      }
    })
  );

  const totalItems = results.reduce((sum, r) => sum + r.itemsFetched, 0);
  const successCount = results.filter(r => r.success).length;

  console.log(
    `[news-fetcher] Completed: ${successCount}/${enabledSources.length} sources, ${totalItems} items`
  );
  
  // Print health summary after each run
  printHealthSummary();

  return results;
}

/**
 * Check if a news item is relevant based on keywords
 */
function isRelevant(item: any, keywords: string[]): boolean {
  const searchText = [
    item.title || "",
    item.contentSnippet || "",
    item.content || "",
    ...(item.categories || []),
  ]
    .join(" ")
    .toLowerCase();

  // Check if any keyword appears in the text
  return keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
}

/**
 * Deduplicate news items by URL
 */
export function deduplicateByUrl(items: RawNewsItem[]): RawNewsItem[] {
  const seen = new Set<string>();
  const unique: RawNewsItem[] = [];

  for (const item of items) {
    const normalizedUrl = normalizeUrl(item.link);
    if (!seen.has(normalizedUrl)) {
      seen.add(normalizedUrl);
      unique.push(item);
    }
  }

  console.log(
    `[news-fetcher] Deduplication: ${items.length} → ${unique.length} items`
  );
  return unique;
}

/**
 * Normalize URL for deduplication (remove query params, fragments, trailing slashes)
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(
      /\/$/,
      ""
    );
  } catch {
    return url.toLowerCase().trim();
  }
}

/**
 * Validate that a news item has required fields
 */
export function validateNewsItem(item: RawNewsItem): boolean {
  return !!(
    item.title &&
    item.link &&
    item.pubDate &&
    (item.content || item.contentSnippet)
  );
}

/**
 * Filter out items older than specified days
 */
export function filterByAge(
  items: RawNewsItem[],
  maxAgeDays: number
): RawNewsItem[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

  return items.filter(item => {
    try {
      const itemDate = new Date(item.pubDate);
      return itemDate >= cutoffDate;
    } catch {
      return false; // Exclude items with invalid dates
    }
  });
}
