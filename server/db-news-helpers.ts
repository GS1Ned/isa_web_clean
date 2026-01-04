/**
 * Database helpers for news operations
 */

import { eq } from "drizzle-orm";
import { hubNews } from "../drizzle/schema";
import { getDb } from "./db";
import { serverLogger } from "./_core/logger-wiring";


/**
 * Get news item by source URL (for deduplication)
 */
export async function getNewsBySourceUrl(sourceUrl: string) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  try {
    const result = await db
      .select()
      .from(hubNews)
      .where(eq(hubNews.sourceUrl, sourceUrl))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    serverLogger.error("[Database] Failed to get news by source URL:", error);
    return null;
  }
}
