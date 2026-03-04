/**
 * Knowledge provenance helpers for retrieval and citation flows.
 *
 * Keep verification-window and evidence-key rules pure and shared so
 * downstream routers and validators stay aligned.
 */

export const KNOWLEDGE_VERIFICATION_MAX_AGE_DAYS = 90;

export type KnowledgeEvidenceKeyReason =
  | "ok"
  | "missing_content_hash";

export function doesKnowledgeChunkNeedVerification(
  lastVerifiedDate?: string | null,
  now: Date = new Date()
): boolean {
  if (!lastVerifiedDate) return true;

  const verifiedDate = new Date(lastVerifiedDate);
  if (Number.isNaN(verifiedDate.getTime())) return true;

  const daysSinceVerification =
    (now.getTime() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceVerification > KNOWLEDGE_VERIFICATION_MAX_AGE_DAYS;
}

export function buildKnowledgeEvidenceKey(
  chunkId: number,
  contentHash?: string | null
): {
  evidenceKey: string | null;
  evidenceKeyReason: KnowledgeEvidenceKeyReason;
} {
  if (!contentHash) {
    return {
      evidenceKey: null,
      evidenceKeyReason: "missing_content_hash",
    };
  }

  return {
    evidenceKey: `ke:${chunkId}:${contentHash}`,
    evidenceKeyReason: "ok",
  };
}
