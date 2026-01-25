/**
 * News Archival Service
 * Moves news items older than 200 days to history table
 */

import { getDb } from "./db";
import { hubNews, hubNewsHistory } from "../drizzle/schema";
import { lt, sql } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";


export interface ArchivalResult {
  success: boolean;
  archived: number;
  errors: string[];
  duration: number;
}

/**
 * Archive news items older than specified days
 */
export async function archiveOldNews(
  daysThreshold: number = 200
): Promise<ArchivalResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  let archived = 0;

  console.log(
    `[news-archival] Starting archival for items older than ${daysThreshold} days...`
  );

  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);
    const cutoffDateStr = cutoffDate.toISOString();

    // Find old news items
    const oldNews = await db
      .select()
      .from(hubNews)
      .where(lt(hubNews.publishedDate, cutoffDateStr));

    console.log(`[news-archival] Found ${oldNews.length} items to archive`);

    if (oldNews.length === 0) {
      return {
        success: true,
        archived: 0,
        errors: [],
        duration: Date.now() - startTime,
      };
    }

    // Move items to history table
    for (const item of oldNews) {
      try {
        // Insert into history
        await db.insert(hubNewsHistory).values({
          originalId: item.id,
          title: item.title,
          summary: item.summary,
          content: item.content,
          newsType: item.newsType,
          relatedRegulationIds: item.relatedRegulationIds,
          regulationTags: item.regulationTags,
          impactLevel: item.impactLevel,
          sourceUrl: item.sourceUrl,
          sourceTitle: item.sourceTitle,
          sourceType: item.sourceType,
          credibilityScore: item.credibilityScore,
          publishedDate: item.publishedDate,
          retrievedAt: item.retrievedAt || new Date().toISOString(),
          isAutomated: item.isAutomated,
          archivedAt: new Date().toISOString(),
          originalCreatedAt: item.createdAt,
          originalUpdatedAt: item.updatedAt,
          sources: item.sources,
          sectorTags: item.sectorTags,
          relatedStandardIds: item.relatedStandardIds,
          gs1ImpactTags: item.gs1ImpactTags,
          gs1ImpactAnalysis: item.gs1ImpactAnalysis,
          suggestedActions: item.suggestedActions,
        });

        // Delete from main table
        await db.delete(hubNews).where(sql`id = ${item.id}`);

        archived++;
      } catch (error) {
        const errorMsg = `Failed to archive item ${item.id}: ${error instanceof Error ? error.message : "Unknown error"}`;
        serverLogger.error(`[news-archival] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    const duration = Date.now() - startTime;
    console.log(
      `[news-archival] Archival complete: ${archived} archived, ${errors.length} errors, ${duration}ms`
    );

    return {
      success: errors.length === 0,
      archived,
      errors,
      duration,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    serverLogger.error("[news-archival] Archival failed:", error);
    errors.push(errorMsg);

    return {
      success: false,
      archived,
      errors,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Get archival statistics
 */
export async function getArchivalStats() {
  try {
    const db = await getDb();
    if (!db) {
      return null;
    }

    const [activeCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(hubNews);
    const [archivedCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(hubNewsHistory);

    // Calculate oldest active news
    const oldestActive = await db
      .select({ publishedDate: hubNews.publishedDate })
      .from(hubNews)
      .orderBy(hubNews.publishedDate)
      .limit(1);

    return {
      activeCount: Number(activeCount.count),
      archivedCount: Number(archivedCount.count),
      oldestActiveDate: oldestActive[0]?.publishedDate || null,
    };
  } catch (error) {
    serverLogger.error("[news-archival] Failed to get stats:", error);
    return null;
  }
}
