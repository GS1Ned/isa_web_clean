/**
 * Citation Validation Helper
 *
 * Validates knowledge chunk citations and flags deprecated sources
 */

import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";
import {
  getKnowledgeVerificationStatus,
} from "./knowledge-provenance";
import { resolveKnowledgeCitationProvenance } from "./source-provenance";
import { getRuntimeSchema } from "./db-runtime-schema";


/**
 * Check if a knowledge chunk is deprecated
 */
export async function isChunkDeprecated(chunkId: number): Promise<boolean> {
  try {
    const resolved = await resolveKnowledgeCitationProvenance(chunkId);
    return resolved?.isDeprecated ?? false;
  } catch (error) {
    serverLogger.error("[Citation] Failed to check deprecation status:", error);
    return false;
  }
}

/**
 * Check if a knowledge chunk needs verification (>90 days old)
 */
export async function needsVerification(chunkId: number): Promise<boolean> {
  try {
    const resolved = await resolveKnowledgeCitationProvenance(chunkId);
    return resolved?.needsVerification ?? false;
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
    verificationAgeDays?: number | null;
    isDeprecated: boolean;
    needsVerification: boolean;
    verificationReason?: "ok" | "missing_last_verified_date" | "invalid_last_verified_date" | "stale_last_verified_date";
    deprecationReason?: string;
    evidenceKey: string | null;
    evidenceKeyReason?:
      | "ok"
      | "missing_content_hash"
      | "missing_authoritative_chunk"
      | "chunk_not_found"
      | "db_unavailable";
    sourceRecordId?: number;
    sourceChunkId?: number;
    authorityTier?: string;
    sourceRole?: string;
    admissionBasis?: string;
    publicationStatus?: string;
    sourceLocator?: string;
    immutableUri?: string;
    citationLabel?: string;
    sourceChunkLocator?: string;
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
    const { knowledgeEmbeddings } = (await getRuntimeSchema()) as any;

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
        const resolved = await resolveKnowledgeCitationProvenance(source.id);
        const verificationStatus = getKnowledgeVerificationStatus(
          resolved?.lastVerifiedDate || chunk.lastVerifiedDate,
        );

        return {
          ...source,
          datasetId: resolved?.datasetId || chunk.datasetId || undefined,
          datasetVersion: resolved?.datasetVersion || chunk.datasetVersion || undefined,
          lastVerifiedDate: resolved?.lastVerifiedDate || chunk.lastVerifiedDate || undefined,
          verificationAgeDays: verificationStatus.verificationAgeDays,
          isDeprecated: resolved?.isDeprecated ?? (chunk.isDeprecated === 1 || chunk.isDeprecated === true),
          needsVerification: resolved?.needsVerification ?? verificationStatus.needsVerification,
          verificationReason: resolved?.verificationReason ?? verificationStatus.reason,
          deprecationReason: resolved?.deprecationReason || chunk.deprecationReason || undefined,
          evidenceKey: resolved?.evidenceKey ?? null,
          evidenceKeyReason: resolved?.evidenceKeyReason ?? "missing_authoritative_chunk",
          sourceRecordId: resolved?.sourceRecordId,
          sourceChunkId: resolved?.sourceChunkId,
          authorityTier: resolved?.authorityTier,
          sourceRole: resolved?.sourceRole,
          admissionBasis: resolved?.admissionBasis,
          publicationStatus: resolved?.publicationStatus,
          sourceLocator: resolved?.sourceLocator,
          immutableUri: resolved?.immutableUri,
          citationLabel: resolved?.citationLabel,
          sourceChunkLocator: resolved?.sourceChunkLocator,
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
