/**
 * News Deduplication Module
 * Detects and merges duplicate news articles from different sources
 * Uses title similarity and content overlap to identify duplicates
 */

import { serverLogger } from "./_core/logger-wiring";

export interface NewsItem {
  title: string;
  url: string;
  content: string;
  source: string;
  sourceType: string;
  publishedAt: string;
  regulationTags?: string[];
}

export interface DeduplicatedNewsItem extends NewsItem {
  sources: Array<{
    name: string;
    type: string;
    url: string;
  }>;
  primarySource: string;
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for title similarity comparison
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate title similarity score (0-1, where 1 is identical)
 */
function titleSimilarity(title1: string, title2: string): number {
  const normalized1 = title1.toLowerCase().trim();
  const normalized2 = title2.toLowerCase().trim();

  if (normalized1 === normalized2) return 1.0;

  const distance = levenshteinDistance(normalized1, normalized2);
  const maxLength = Math.max(normalized1.length, normalized2.length);

  return 1 - distance / maxLength;
}

/**
 * Calculate content overlap score based on shared regulation tags
 */
function contentOverlap(item1: NewsItem, item2: NewsItem): number {
  const tags1 = new Set(item1.regulationTags || []);
  const tags2 = new Set(item2.regulationTags || []);

  if (tags1.size === 0 && tags2.size === 0) return 0;

  const intersection = new Set(Array.from(tags1).filter(tag => tags2.has(tag)));
  const union = new Set([...Array.from(tags1), ...Array.from(tags2)]);

  return intersection.size / union.size; // Jaccard similarity
}

/**
 * Check if two news items are duplicates
 * Returns true if they cover the same topic from different sources
 */
function isDuplicate(item1: NewsItem, item2: NewsItem): boolean {
  // Don't compare items from the same source
  if (item1.source === item2.source) return false;

  // Check title similarity (threshold: 0.7)
  const titleSim = titleSimilarity(item1.title, item2.title);
  if (titleSim >= 0.7) return true;

  // Check content overlap via regulation tags (threshold: 0.6)
  const contentSim = contentOverlap(item1, item2);
  if (contentSim >= 0.6 && titleSim >= 0.5) return true;

  // Check if titles share significant keywords
  const words1 = item1.title
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 4);
  const words2 = item2.title
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 4);
  const sharedWords = words1.filter(w => words2.includes(w));

  if (sharedWords.length >= 3 && contentSim >= 0.5) return true;

  return false;
}

/**
 * Merge duplicate news items into a single item with multi-source attribution
 */
function mergeNewsItems(items: NewsItem[]): DeduplicatedNewsItem {
  // Sort by source priority: EU_OFFICIAL > GS1_OFFICIAL > others
  const sorted = items.sort((a, b) => {
    const priority = { EU_OFFICIAL: 3, GS1_OFFICIAL: 2 };
    const aPriority = priority[a.sourceType as keyof typeof priority] || 1;
    const bPriority = priority[b.sourceType as keyof typeof priority] || 1;
    return bPriority - aPriority;
  });

  const primary = sorted[0];

  return {
    ...primary,
    sources: items.map(item => ({
      name: item.source,
      type: item.sourceType,
      url: item.url,
    })),
    primarySource: primary.source,
  };
}

/**
 * Deduplicate news items across sources
 * Groups duplicate items and merges them with multi-source attribution
 */
export function deduplicateNews(items: NewsItem[]): DeduplicatedNewsItem[] {
  const groups: NewsItem[][] = [];
  const processed = new Set<number>();

  // Group duplicates
  for (let i = 0; i < items.length; i++) {
    if (processed.has(i)) continue;

    const group: NewsItem[] = [items[i]];
    processed.add(i);

    for (let j = i + 1; j < items.length; j++) {
      if (processed.has(j)) continue;

      if (isDuplicate(items[i], items[j])) {
        group.push(items[j]);
        processed.add(j);
      }
    }

    groups.push(group);
  }

  // Merge each group
  return groups.map(group => mergeNewsItems(group));
}

/**
 * Log deduplication statistics
 */
export function logDeduplicationStats(
  originalCount: number,
  deduplicatedCount: number,
  mergedItems: DeduplicatedNewsItem[]
): void {
  const duplicatesFound = originalCount - deduplicatedCount;
  const multiSourceItems = mergedItems.filter(item => item.sources.length > 1);

  // Intentionally info-level: these are operational metrics for the ingestion pipeline.
  serverLogger.info(`[Deduplication] Original items: ${originalCount}`);
  serverLogger.info(`[Deduplication] After deduplication: ${deduplicatedCount}`);
  serverLogger.info(`[Deduplication] Duplicates merged: ${duplicatesFound}`);
  serverLogger.info(`[Deduplication] Multi-source items: ${multiSourceItems.length}`);

  if (multiSourceItems.length > 0) {
    serverLogger.info("\n[Deduplication] Multi-source articles:");
    multiSourceItems.forEach(item => {
      const sourceNames = item.sources.map(s => s.name).join(", ");
      serverLogger.info(`  - "${item.title}" (${sourceNames})`);
    });
  }
}
