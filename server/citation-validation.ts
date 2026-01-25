/**
 * Citation Validation Helper
 *
 * Validates knowledge chunk citations and flags deprecated sources
 */

import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";


/**
 * Check if a knowledge chunk is deprecated
 */
export async function isChunkDeprecated(chunkId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const { knowledgeEmbeddings } = await import("../drizzle/schema");

    const chunks = await db
      .select()
      .from(knowledgeEmbeddings)
      .where(eq(knowledgeEmbeddings.id, chunkId))
      .limit(1);

    if (chunks.length === 0) return false;

    return chunks[0].isDeprecated === 1;
  } catch (error) {
    serverLogger.error("[Citation] Failed to check deprecation status:", error);
    return false;
  }
}

/**
 * Check if a knowledge chunk needs verification (>90 days old)
 */
export async function needsVerification(chunkId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const { knowledgeEmbeddings } = await import("../drizzle/schema");

    const chunks = await db
      .select()
      .from(knowledgeEmbeddings)
      .where(eq(knowledgeEmbeddings.id, chunkId))
      .limit(1);

    if (chunks.length === 0) return false;

    const chunk = chunks[0];

    // No verification date = needs verification
    if (!chunk.lastVerifiedDate) return true;

    // Check if >90 days old
    const verifiedDate = new Date(chunk.lastVerifiedDate);
    const now = new Date();
    const daysSinceVerification =
      (now.getTime() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceVerification > 90;
  } catch (error) {
    serverLogger.error("[Citation] Failed to check verification status:", error);
    return false;
  }
}

/**
 * Validate citations and add metadata
 */
export async function validateCitations(
  sources: Array<{
    id: number;
    title: string;
    url?: string;
    similarity: number;
  }>
): Promise<
  Array<{
    id: number;
    title: string;
    url?: string;
    similarity: number;
    datasetId?: string;
    datasetVersion?: string;
    lastVerifiedDate?: string;
    isDeprecated: boolean;
    needsVerification: boolean;
    deprecationReason?: string;
  }>
> {
  const db = await getDb();
  if (!db) return sources.map(s => ({ ...s, isDeprecated: false, needsVerification: false }));

  try {
    const { knowledgeEmbeddings } = await import("../drizzle/schema");

    const validatedSources = await Promise.all(
      sources.map(async source => {
        const chunks = await db
          .select()
          .from(knowledgeEmbeddings)
          .where(eq(knowledgeEmbeddings.id, source.id))
          .limit(1);

        if (chunks.length === 0) {
          return {
            ...source,
            isDeprecated: false,
            needsVerification: true,
          };
        }

        const chunk = chunks[0];

        // Check verification age
        let needsVerif = false;
        if (!chunk.lastVerifiedDate) {
          needsVerif = true;
        } else {
          const verifiedDate = new Date(chunk.lastVerifiedDate);
          const now = new Date();
          const daysSinceVerification =
            (now.getTime() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24);
          needsVerif = daysSinceVerification > 90;
        }

        return {
          ...source,
          datasetId: chunk.datasetId || undefined,
          datasetVersion: chunk.datasetVersion || undefined,
          lastVerifiedDate: chunk.lastVerifiedDate || undefined,
          isDeprecated: chunk.isDeprecated === 1,
          needsVerification: needsVerif,
          deprecationReason: chunk.deprecationReason || undefined,
        };
      })
    );

    return validatedSources;
  } catch (error) {
    serverLogger.error("[Citation] Failed to validate citations:", error);
    return sources.map(s => ({ ...s, isDeprecated: false, needsVerification: false }));
  }
}

/**
 * Mark a knowledge chunk as deprecated
 */
export async function markChunkDeprecated(
  chunkId: number,
  reason: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const { knowledgeEmbeddings } = await import("../drizzle/schema");

    await db
      .update(knowledgeEmbeddings)
      .set({
        isDeprecated: 1,
        deprecationReason: reason,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(knowledgeEmbeddings.id, chunkId));

    return true;
  } catch (error) {
    serverLogger.error("[Citation] Failed to mark chunk as deprecated:", error);
    return false;
  }
}

/**
 * Update verification date for a knowledge chunk
 */
export async function updateVerificationDate(chunkId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const { knowledgeEmbeddings } = await import("../drizzle/schema");

    await db
      .update(knowledgeEmbeddings)
      .set({
        lastVerifiedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(knowledgeEmbeddings.id, chunkId));

    return true;
  } catch (error) {
    serverLogger.error("[Citation] Failed to update verification date:", error);
    return false;
  }
}
