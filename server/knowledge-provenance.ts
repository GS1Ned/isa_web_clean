/**
 * Knowledge provenance helpers for retrieval and citation flows.
 *
 * Keep verification-window and evidence-key rules pure and shared so
 * downstream routers and validators stay aligned.
 */

export const KNOWLEDGE_VERIFICATION_MAX_AGE_DAYS = 90;

export type KnowledgeVerificationReason =
  | "ok"
  | "missing_last_verified_date"
  | "invalid_last_verified_date"
  | "stale_last_verified_date";

export type KnowledgeEvidenceKeyReason =
  | "ok"
  | "missing_content_hash";

export function getKnowledgeVerificationReason(
  lastVerifiedDate?: string | null,
  now: Date = new Date()
): KnowledgeVerificationReason {
  if (!lastVerifiedDate) return "missing_last_verified_date";

  const verifiedDate = new Date(lastVerifiedDate);
  if (Number.isNaN(verifiedDate.getTime())) return "invalid_last_verified_date";

  const daysSinceVerification =
    (now.getTime() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceVerification > KNOWLEDGE_VERIFICATION_MAX_AGE_DAYS) {
    return "stale_last_verified_date";
  }

  return "ok";
}

export function doesKnowledgeChunkNeedVerification(
  lastVerifiedDate?: string | null,
  now: Date = new Date()
): boolean {
  return getKnowledgeVerificationReason(lastVerifiedDate, now) !== "ok";
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
