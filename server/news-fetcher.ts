/**
 * News Fetcher Service
 * Fetches ESG regulatory news from configured RSS sources
 * Handles deduplication, validation, and error recovery
 */

import Parser from "rss-parser";
import { NEWS_SOURCES, type NewsSource } from "./news-sources";

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
    'User-Agent': 'ISA-News-Aggregator/1.0 (GS1 Netherlands ESG Intelligence)',
  },
});

/**
 * Fetch news from a single RSS source
 */
export async function fetchFromSource(source: NewsSource): Promise<FetchResult> {
  if (!source.enabled || !source.rssUrl) {
    return {
      success: false,
      sourceId: source.id,
      sourceName: source.name,
      itemsFetched: 0,
      items: [],
      error: "Source disabled or no RSS URL configured",
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
    console.error(`[news-fetcher] Error fetching from ${source.name}:`, error);
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
 * Fetch news from all enabled sources
 */
export async function fetchAllNews(): Promise<FetchResult[]> {
  const enabledSources = NEWS_SOURCES.filter(s => s.enabled);
  
  console.log(`[news-fetcher] Fetching from ${enabledSources.length} sources...`);
  
  const results = await Promise.all(
    enabledSources.map(source => fetchFromSource(source))
  );
  
  const totalItems = results.reduce((sum, r) => sum + r.itemsFetched, 0);
  const successCount = results.filter(r => r.success).length;
  
  console.log(`[news-fetcher] Completed: ${successCount}/${enabledSources.length} sources, ${totalItems} items`);
  
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
  ].join(" ").toLowerCase();
  
  // Check if any keyword appears in the text
  return keywords.some(keyword => 
    searchText.includes(keyword.toLowerCase())
  );
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
  
  console.log(`[news-fetcher] Deduplication: ${items.length} → ${unique.length} items`);
  return unique;
}

/**
 * Normalize URL for deduplication (remove query params, fragments, trailing slashes)
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(/\/$/, "");
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
export function filterByAge(items: RawNewsItem[], maxAgeDays: number): RawNewsItem[] {
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
