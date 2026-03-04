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

export type KnowledgeVerificationFreshnessBucket =
  | "fresh"
  | "aging"
  | "stale"
  | "unknown";

export type KnowledgeEvidenceKeyReason =
  | "ok"
  | "missing_content_hash";

export interface KnowledgeVerificationStatus {
  needsVerification: boolean;
  reason: KnowledgeVerificationReason;
  verificationAgeDays: number | null;
}

export interface KnowledgeVerificationSummary {
  totalChecked: number;
  needsVerificationCount: number;
  countsByReason: Record<KnowledgeVerificationReason, number>;
  freshnessBuckets: Record<KnowledgeVerificationFreshnessBucket, number>;
  oldestVerificationAgeDays: number | null;
  medianVerificationAgeDays: number | null;
}

export function getKnowledgeVerificationAgeDays(
  lastVerifiedDate?: string | null,
  now: Date = new Date()
): number | null {
  if (!lastVerifiedDate) return null;

  const verifiedDate = new Date(lastVerifiedDate);
  if (Number.isNaN(verifiedDate.getTime())) return null;

  return Math.floor(
    (now.getTime() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24)
  );
}

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

export function getKnowledgeVerificationStatus(
  lastVerifiedDate?: string | null,
  now: Date = new Date()
): KnowledgeVerificationStatus {
  const reason = getKnowledgeVerificationReason(lastVerifiedDate, now);
  const verificationAgeDays = getKnowledgeVerificationAgeDays(lastVerifiedDate, now);

  return {
    reason,
    verificationAgeDays,
    needsVerification: reason !== "ok",
  };
}

export function getKnowledgeVerificationFreshnessBucket(
  lastVerifiedDate?: string | null,
  now: Date = new Date()
): KnowledgeVerificationFreshnessBucket {
  const status = getKnowledgeVerificationStatus(lastVerifiedDate, now);
  if (status.reason === "missing_last_verified_date" || status.reason === "invalid_last_verified_date") {
    return "unknown";
  }
  if (status.reason === "stale_last_verified_date") {
    return "stale";
  }
  if (status.verificationAgeDays !== null && status.verificationAgeDays <= 30) {
    return "fresh";
  }
  return "aging";
}

export function summarizeKnowledgeVerificationPosture(
  lastVerifiedDates: Array<string | null | undefined>,
  now: Date = new Date()
): KnowledgeVerificationSummary {
  const countsByReason: Record<KnowledgeVerificationReason, number> = {
    ok: 0,
    missing_last_verified_date: 0,
    invalid_last_verified_date: 0,
    stale_last_verified_date: 0,
  };
  const freshnessBuckets: Record<KnowledgeVerificationFreshnessBucket, number> = {
    fresh: 0,
    aging: 0,
    stale: 0,
    unknown: 0,
  };

  const ages = lastVerifiedDates
    .map((value) => {
      const status = getKnowledgeVerificationStatus(value, now);
      countsByReason[status.reason] += 1;
      freshnessBuckets[getKnowledgeVerificationFreshnessBucket(value, now)] += 1;
      return status.verificationAgeDays;
    })
    .filter((value): value is number => Number.isFinite(value));

  const sortedAges = [...ages].sort((left, right) => left - right);
  const medianVerificationAgeDays =
    sortedAges.length === 0
      ? null
      : sortedAges.length % 2 === 1
        ? sortedAges[(sortedAges.length - 1) / 2]
        : Math.round(
            (sortedAges[sortedAges.length / 2 - 1] + sortedAges[sortedAges.length / 2]) / 2
          );

  return {
    totalChecked: lastVerifiedDates.length,
    needsVerificationCount:
      countsByReason.missing_last_verified_date +
      countsByReason.invalid_last_verified_date +
      countsByReason.stale_last_verified_date,
    countsByReason,
    freshnessBuckets,
    oldestVerificationAgeDays: sortedAges.length ? sortedAges[sortedAges.length - 1] : null,
    medianVerificationAgeDays,
  };
}

export function doesKnowledgeChunkNeedVerification(
  lastVerifiedDate?: string | null,
  now: Date = new Date()
): boolean {
  return getKnowledgeVerificationStatus(lastVerifiedDate, now).needsVerification;
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
