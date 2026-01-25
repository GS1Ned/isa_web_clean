/**
 * Additional News Database Helpers for Regulatory Change Log Integration
 */

import { getDb } from "./db";
import { hubNews } from "../drizzle/schema";
import { eq, inArray, gte } from "drizzle-orm";
import type { HubNews } from "../drizzle/schema";

/**
 * Get high-impact news items (HIGH or CRITICAL impact level)
 */
export async function getHighImpactNews(
  threshold: "HIGH" | "CRITICAL" = "HIGH"
): Promise<HubNews[]> {
  const db = await getDb();
  if (!db) return [];

  const impactLevels = threshold === "CRITICAL" ? ["CRITICAL"] : ["HIGH", "CRITICAL"];

  const news = await db
    .select()
    .from(hubNews)
    .where(inArray(hubNews.impactLevel, impactLevels as any))
    .orderBy(hubNews.publishedDate);

  return news;
}

/**
 * Get news items by IDs
 */
export async function getNewsByIds(ids: number[]): Promise<HubNews[]> {
  const db = await getDb();
  if (!db) return [];

  if (ids.length === 0) return [];

  const news = await db
    .select()
    .from(hubNews)
    .where(inArray(hubNews.id, ids));

  return news;
}
