/**
 * Citation Validation Helper
 *
 * Validates knowledge chunk citations and flags deprecated sources
 */

import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";
import {
  buildKnowledgeEvidenceKey,
  doesKnowledgeChunkNeedVerification,
} from "./knowledge-provenance";


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

    return doesKnowledgeChunkNeedVerification(chunk.lastVerifiedDate);
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
    evidenceKey: string | null;
    evidenceKeyReason?: "ok" | "missing_content_hash" | "chunk_not_found" | "db_unavailable";
  }>
> {
  const db = await getDb();
  if (!db) {
    return sources.map(s => ({
      ...s,
      isDeprecated: false,
      needsVerification: false,
      evidenceKey: null,
      evidenceKeyReason: "db_unavailable" as const,
    }));
  }

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
            evidenceKey: null,
            evidenceKeyReason: "chunk_not_found" as const,
          };
        }

        const chunk = chunks[0];
        const { evidenceKey, evidenceKeyReason } = buildKnowledgeEvidenceKey(
          source.id,
          chunk.contentHash || null
        );

        return {
          ...source,
          datasetId: chunk.datasetId || undefined,
          datasetVersion: chunk.datasetVersion || undefined,
          lastVerifiedDate: chunk.lastVerifiedDate || undefined,
          isDeprecated: chunk.isDeprecated === 1,
          needsVerification: doesKnowledgeChunkNeedVerification(
            chunk.lastVerifiedDate
          ),
          deprecationReason: chunk.deprecationReason || undefined,
          evidenceKey,
          evidenceKeyReason,
        };
      })
    );

    return validatedSources;
  } catch (error) {
    serverLogger.error("[Citation] Failed to validate citations:", error);
    return sources.map(s => ({
      ...s,
      isDeprecated: false,
      needsVerification: false,
      evidenceKey: null,
      evidenceKeyReason: "db_unavailable" as const,
    }));
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
