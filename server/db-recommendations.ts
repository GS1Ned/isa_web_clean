/**
 * Database helpers for news recommendations
 */

import { getDb } from "./db";
import { newsRecommendations } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export async function getRecommendationsByNewsId(newsId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const recs = await db
      .select()
      .from(newsRecommendations)
      .where(eq(newsRecommendations.newsId, newsId));

    return recs.map((rec) => ({
      ...rec,
      relevanceScore: Number(rec.relevanceScore),
      matchedKeywords: rec.matchedKeywords ? JSON.parse(rec.matchedKeywords) : [],
    }));
  } catch (error) {
    console.error("[db-recommendations] Failed to fetch recommendations:", error);
    return [];
  }
}
