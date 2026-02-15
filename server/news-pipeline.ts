/**
 * News Pipeline Orchestrator
 * Coordinates fetching, processing, deduplication, and database storage
 */

import {
  fetchAllNews,
  deduplicateByUrl,
  validateNewsItem,
  filterByAge,
} from "./news-fetcher";
import { processNewsBatch } from "./news-ai-processor";
import { createHubNews } from "./db";
import {
  deduplicateNews,
  logDeduplicationStats,
  type NewsItem as DeduplicatorNewsItem,
} from "./news-deduplicator";
import { getNewsBySourceUrl } from "./db-news-helpers";
import { generateRecommendations } from "./news-recommendation-engine";
import type { InsertHubNews } from "../drizzle/schema";
import { PipelineExecutionContext, calculateQualityScore } from "./utils/pipeline-logger";
import { savePipelineExecutionLog } from "./db-pipeline-observability";
import { serverLogger } from "./_core/logger-wiring";
import {
  DEFAULT_PIPELINE_MODE,
  PIPELINE_MODE_CONFIGS,
  resolvePipelineModeConfig,
  type PipelineMode,
} from "./news-pipeline-config";
import { detectEventFromArticle, createOrUpdateEvent } from "./news-event-processor";

export interface PipelineOptions {
  /** Ingestion mode: normal, backfill, incremental, or full-refresh. */
  mode?: PipelineMode;
  /** Who triggered the pipeline */
  triggeredBy?: 'cron' | 'manual' | 'api';
}

export interface PipelineResult {
  success: boolean;
  fetched: number;
  processed: number;
  inserted: number;
  skipped: number;
  errors: string[];
  duration: number;
  mode: PipelineMode;
  maxAgeDays: number;
}

/**
 * Run the complete news ingestion pipeline
 * @param options Pipeline execution options
 * @param options.mode Ingestion mode: normal, backfill, incremental, or full-refresh.
 * @param options.triggeredBy Who triggered the pipeline
 */
export async function runNewsPipeline(options: PipelineOptions = {}): Promise<PipelineResult> {
  const { mode: requestedMode, triggeredBy = 'cron' } = options;
  const startTime = Date.now();
  const errors: string[] = [];
  let mode: PipelineMode = DEFAULT_PIPELINE_MODE;
  let maxAgeDays = PIPELINE_MODE_CONFIGS[DEFAULT_PIPELINE_MODE].maxAgeDays;

  try {
    ({ mode, maxAgeDays } = resolvePipelineModeConfig(requestedMode));
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    errors.push(errorMsg);
    return {
      success: false,
      fetched: 0,
      processed: 0,
      inserted: 0,
      skipped: 0,
      errors,
      duration: Date.now() - startTime,
      mode,
      maxAgeDays,
    };
  }
  const ctx = new PipelineExecutionContext('news_ingestion', triggeredBy);

  serverLogger.info(`[news-pipeline] Starting news ingestion pipeline (execution: ${ctx.executionId})...`);
  ctx.log({
    eventType: 'pipeline_start',
    level: 'info',
    message: 'News ingestion pipeline started',
    data: { triggeredBy },
  });

  try {
    // Step 1: Fetch from all sources
    const fetchResults = await fetchAllNews();
    const allItems = fetchResults.flatMap(r => r.items);
    serverLogger.info(`[news-pipeline] Fetched ${allItems.length} items from ${fetchResults.length} sources`);
    
    // Record source fetch metrics
    for (const result of fetchResults) {
      ctx.recordSourceAttempt(
        result.sourceId,
        result.success,
        result.items.length
      );
    }

    // Step 2: Deduplicate by URL
    const uniqueItems = deduplicateByUrl(allItems);
    const urlDuplicates = allItems.length - uniqueItems.length;
    if (urlDuplicates > 0) {
      ctx.recordDeduplication(urlDuplicates);
    }

    // Step 3: Filter by age
    const recentItems = filterByAge(uniqueItems, maxAgeDays);
    serverLogger.info(`[news-pipeline] Filtered to ${recentItems.length} recent items (last ${maxAgeDays} days, mode: ${mode})`);
    ctx.log({
      eventType: 'age_filter',
      level: 'info',
      message: `Filtered items by age: ${mode} mode`,
      data: { maxAgeDays, mode, itemsBeforeFilter: uniqueItems.length, itemsAfterFilter: recentItems.length },
    });

    // Step 4: Validate items
    const validItems = recentItems.filter(validateNewsItem);
    serverLogger.info(`[news-pipeline] ${validItems.length} valid items after validation`);

    // Step 5: Check for existing items in database (deduplication)
    const newItems = [];
    for (const item of validItems) {
      const existing = await getNewsBySourceUrl(item.link);
      if (!existing) {
        newItems.push(item);
      }
    }
    serverLogger.info(`[news-pipeline] ${newItems.length} new items (${validItems.length - newItems.length} already in database)`);

    if (newItems.length === 0) {
      const duration = Date.now() - startTime;
      serverLogger.info(`[news-pipeline] Pipeline complete: 0 inserted, ${validItems.length} skipped (already in database), 0 errors, ${duration}ms`);
      
      // Mark pipeline as complete and save execution log
      ctx.complete('success');
      
      try {
        await savePipelineExecutionLog(ctx.getSummary());
        serverLogger.info(`[news-pipeline] Execution log saved: ${ctx.executionId}`);
      } catch (logError) {
        serverLogger.error('[news-pipeline] Failed to save execution log:', logError);
        // Don't fail pipeline if logging fails
      }
      
      return {
        success: true,
        fetched: allItems.length,
        processed: 0,
        inserted: 0,
        skipped: validItems.length,
        errors: [],
        duration,
        mode,
        maxAgeDays,
      };
    }

    // Step 6: Process with AI
    const processedItems = await processNewsBatch(newItems);

    // Step 6.5: Cross-source deduplication
    const itemsForDedup: DeduplicatorNewsItem[] = newItems.map((raw, i) => ({
      title: processedItems[i].headline,
      url: raw.link,
      content: raw.content || raw.contentSnippet || "",
      source: raw.source.name,
      sourceType: raw.source.type,
      publishedAt: new Date(raw.pubDate).toISOString(),
      regulationTags: processedItems[i].regulationTags,
    }));

    const deduplicated = deduplicateNews(itemsForDedup);
    logDeduplicationStats(newItems.length, deduplicated.length, deduplicated);
    const crossSourceDuplicates = newItems.length - deduplicated.length;
    if (crossSourceDuplicates > 0) {
      ctx.recordDeduplication(crossSourceDuplicates);
    }

    // Step 7: Insert into database (with ESG relevance filtering)
    let inserted = 0;
    let skippedNonESG = 0;
    for (const deduplicatedItem of deduplicated) {
      // Find original items
      const rawIndex = newItems.findIndex(
        item => item.link === deduplicatedItem.url
      );
      if (rawIndex === -1) continue;

      const raw = newItems[rawIndex];
      const processed = processedItems[rawIndex];

      // Filter out non-ESG articles
      const isESGRelevant =
        processed.regulationTags.length > 0 && // Must have at least one regulation tag
        !processed.summary.toLowerCase().includes("no relevant") && // Reject placeholder summaries
        !processed.headline.toLowerCase().includes("no relevant") && // Reject placeholder headlines
        processed.summary.length > 50; // Must have substantial summary

      if (!isESGRelevant) {
        serverLogger.info(`[news-pipeline] Skipping non-ESG article: ${processed.headline}`);
        skippedNonESG++;
        continue;
      }

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
          sources:
            deduplicatedItem.sources.length > 1
              ? deduplicatedItem.sources
              : undefined, // Multi-source attribution
          credibilityScore: raw.source.credibilityScore.toString(),
          publishedDate: new Date(raw.pubDate).toISOString(),
          retrievedAt: new Date().toISOString(),
          isAutomated: 1,

          // GS1-specific fields
          gs1ImpactTags: processed.gs1ImpactTags,
          sectorTags: processed.sectorTags,
          gs1ImpactAnalysis: processed.gs1ImpactAnalysis,
          suggestedActions: processed.suggestedActions,

          // ChatGPT-recommended regulatory intelligence fields
          regulatoryState: processed.regulatoryState,
          isNegativeSignal: processed.isNegativeSignal ? 1 : 0,
          confidenceLevel: processed.confidenceLevel,
          negativeSignalKeywords: processed.negativeSignalKeywords,
        };

        const createdNews = await createHubNews(newsItem);
        inserted++;
        
        // Record item processing with quality metrics
        const qualityScore = calculateQualityScore({
          summary: processed.summary,
          regulationTags: processed.regulationTags,
          gs1ImpactTags: processed.gs1ImpactTags,
          sectorTags: processed.sectorTags,
          suggestedActions: processed.suggestedActions,
          relatedStandardIds: [], // Not yet implemented
        });
        
        ctx.recordAiProcessing(true, qualityScore);
        ctx.recordItemProcessed(true, {
          hasSummary: !!processed.summary && processed.summary.length > 0,
          hasRegulationTags: processed.regulationTags.length > 0,
          hasGs1ImpactTags: processed.gs1ImpactTags.length > 0,
          hasSectorTags: processed.sectorTags.length > 0,
          hasRecommendations: processed.suggestedActions.length > 0,
        });

        // Generate AI recommendations for this news article
        if (createdNews && createdNews.id) {
          try {
            await generateRecommendations(
              createdNews.id,
              newsItem.title,
              newsItem.summary,
              newsItem.content
            );
            serverLogger.info(`[news-pipeline] Generated recommendations for news ${createdNews.id}`);
          } catch (recError) {
            serverLogger.error(
              `[news-pipeline] Failed to generate recommendations for news ${createdNews.id}:`,
              recError
            );
            // Don't fail the whole pipeline if recommendations fail
          }
          
          // Phase 2: Create/update regulatory event for this article
          try {
            const eventDetection = await detectEventFromArticle({
              id: createdNews.id,
              title: newsItem.title,
              content: newsItem.content,
              summary: newsItem.summary,
              regulationTags: newsItem.regulationTags,
              publishedDate: newsItem.publishedDate,
              sourceType: newsItem.sourceType,
            });
            
            if (eventDetection) {
              const eventResult = await createOrUpdateEvent(createdNews.id, eventDetection);
              serverLogger.info(`[news-pipeline] ${eventResult.isNew ? 'Created' : 'Updated'} event for news ${createdNews.id} (status: ${eventResult.status})`);
            } else {
              serverLogger.info(`[news-pipeline] No regulatory event detected for news ${createdNews.id}`);
            }
          } catch (eventError) {
            serverLogger.error(
              `[news-pipeline] Failed to process event for news ${createdNews.id}:`,
              eventError
            );
            // Don't fail the whole pipeline if event processing fails
          }
        }
      } catch (error) {
        const errorMsg = `Failed to insert: ${raw.link} - ${error instanceof Error ? error.message : "Unknown error"}`;
        serverLogger.error(`[news-pipeline] ${errorMsg}`);
        errors.push(errorMsg);
        
        // Record failed item processing
        ctx.recordItemProcessed(false, {
          hasSummary: false,
          hasRegulationTags: false,
          hasGs1ImpactTags: false,
          hasSectorTags: false,
          hasRecommendations: false,
        });
        
        ctx.log({
          eventType: 'error',
          level: 'error',
          message: 'Failed to save news item',
          error: error instanceof Error ? {
            message: error.message,
            stack: error.stack,
          } : { message: errorMsg },
        });
      }
    }

    const duration = Date.now() - startTime;
    serverLogger.info(`[news-pipeline] Pipeline complete: ${inserted} inserted, ${skippedNonESG} non-ESG filtered, ${errors.length} errors, ${duration}ms`);
    
    // Mark pipeline as complete and save execution log
    const status = errors.length === 0 ? 'success' : inserted > 0 ? 'partial_success' : 'failed';
    ctx.complete(status);
    
    try {
      await savePipelineExecutionLog(ctx.getSummary());
      serverLogger.info(`[news-pipeline] Execution log saved: ${ctx.executionId}`);
    } catch (logError) {
      serverLogger.error('[news-pipeline] Failed to save execution log:', logError);
      // Don't fail pipeline if logging fails
    }

    return {
      success: errors.length === 0,
      fetched: allItems.length,
      processed: processedItems.length,
      inserted,
      skipped: validItems.length - newItems.length + skippedNonESG,
      errors,
      duration,
      mode,
      maxAgeDays,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    serverLogger.error("[news-pipeline] Pipeline failed:", error);
    errors.push(errorMsg);
    
    // Log catastrophic failure
    ctx.log({
      eventType: 'error',
      level: 'error',
      message: 'Pipeline failed with unhandled error',
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
      } : { message: errorMsg },
    });
    
    ctx.complete('failed');
    
    try {
      await savePipelineExecutionLog(ctx.getSummary());
    } catch (logError) {
      serverLogger.error('[news-pipeline] Failed to save error execution log:', logError);
    }

    return {
      success: false,
      fetched: 0,
      processed: 0,
      inserted: 0,
      skipped: 0,
      errors,
      duration: Date.now() - startTime,
      mode,
      maxAgeDays,
    };
  }
}
