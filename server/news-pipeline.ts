/**
 * News Pipeline Orchestrator
 * Coordinates fetching, processing, deduplication, and database storage
 */

import { fetchAllNews, deduplicateByUrl, validateNewsItem, filterByAge } from "./news-fetcher";
import { processNewsBatch } from "./news-ai-processor";
import { createHubNews } from "./db";
import { getNewsBySourceUrl } from "./db-news-helpers";
import { generateRecommendations } from "./news-recommendation-engine";
import type { InsertHubNews } from "../drizzle/schema";

export interface PipelineResult {
  success: boolean;
  fetched: number;
  processed: number;
  inserted: number;
  skipped: number;
  errors: string[];
  duration: number;
}

/**
 * Run the complete news ingestion pipeline
 */
export async function runNewsPipeline(): Promise<PipelineResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  
  console.log("[news-pipeline] Starting news ingestion pipeline...");
  
  try {
    // Step 1: Fetch from all sources
    const fetchResults = await fetchAllNews();
    const allItems = fetchResults.flatMap(r => r.items);
    console.log(`[news-pipeline] Fetched ${allItems.length} items from ${fetchResults.length} sources`);
    
    // Step 2: Deduplicate by URL
    const uniqueItems = deduplicateByUrl(allItems);
    
    // Step 3: Filter by age (only last 30 days)
    const recentItems = filterByAge(uniqueItems, 30);
    console.log(`[news-pipeline] Filtered to ${recentItems.length} recent items (last 30 days)`);
    
    // Step 4: Validate items
    const validItems = recentItems.filter(validateNewsItem);
    console.log(`[news-pipeline] ${validItems.length} valid items after validation`);
    
    // Step 5: Check for existing items in database (deduplication)
    const newItems = [];
    for (const item of validItems) {
      const existing = await getNewsBySourceUrl(item.link);
      if (!existing) {
        newItems.push(item);
      }
    }
    console.log(`[news-pipeline] ${newItems.length} new items (${validItems.length - newItems.length} already in database)`);
    
    if (newItems.length === 0) {
      return {
        success: true,
        fetched: allItems.length,
        processed: 0,
        inserted: 0,
        skipped: validItems.length,
        errors: [],
        duration: Date.now() - startTime,
      };
    }
    
    // Step 6: Process with AI
    const processedItems = await processNewsBatch(newItems);
    
    // Step 7: Insert into database
    let inserted = 0;
    for (let i = 0; i < newItems.length; i++) {
      const raw = newItems[i];
      const processed = processedItems[i];
      
      try {
        const newsItem = {
          title: processed.headline,
          summary: processed.summary,
          content: raw.content || raw.contentSnippet || "",
          newsType: processed.newsType,
          regulationTags: processed.regulationTags,
          impactLevel: processed.impactLevel,
          sourceUrl: raw.link,
          sourceTitle: raw.source.name,
          sourceType: raw.source.type,
          credibilityScore: raw.source.credibilityScore.toString(),
          publishedDate: new Date(raw.pubDate),
          retrievedAt: new Date(),
          isAutomated: true,
        };
        
        const createdNews = await createHubNews(newsItem);
        inserted++;
        
        // Generate AI recommendations for this news article
        if (createdNews && createdNews.id) {
          try {
            await generateRecommendations(
              createdNews.id,
              newsItem.title,
              newsItem.summary,
              newsItem.content
            );
            console.log(`[news-pipeline] Generated recommendations for news ${createdNews.id}`);
          } catch (recError) {
            console.error(`[news-pipeline] Failed to generate recommendations for news ${createdNews.id}:`, recError);
            // Don't fail the whole pipeline if recommendations fail
          }
        }
      } catch (error) {
        const errorMsg = `Failed to insert: ${raw.link} - ${error instanceof Error ? error.message : "Unknown error"}`;
        console.error(`[news-pipeline] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(`[news-pipeline] Pipeline complete: ${inserted} inserted, ${errors.length} errors, ${duration}ms`);
    
    return {
      success: errors.length === 0,
      fetched: allItems.length,
      processed: processedItems.length,
      inserted,
      skipped: validItems.length - newItems.length,
      errors,
      duration,
    };
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[news-pipeline] Pipeline failed:", error);
    errors.push(errorMsg);
    
    return {
      success: false,
      fetched: 0,
      processed: 0,
      inserted: 0,
      skipped: 0,
      errors,
      duration: Date.now() - startTime,
    };
  }
}
