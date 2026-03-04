type SourceVerificationReason =
  | "ok"
  | "missing_last_verified_date"
  | "invalid_last_verified_date"
  | "stale_last_verified_date";

interface AskIsaSourcePostureSource {
  isDeprecated?: boolean;
  needsVerification?: boolean;
  verificationReason?: SourceVerificationReason;
  verificationAgeDays?: number | null;
}

export interface AskIsaSourcePostureSummary {
  totalSources: number;
  deprecatedCount: number;
  needsVerificationCount: number;
  allVerifiedWithinWindow: boolean;
  countsByReason: Record<SourceVerificationReason, number>;
  oldestVerificationAgeDays: number | null;
}

export function getAskIsaVerificationReasonLabel(
  reason?: SourceVerificationReason,
) {
  switch (reason) {
    case "missing_last_verified_date":
      return "No verification date recorded";
    case "invalid_last_verified_date":
      return "Invalid verification date";
    case "stale_last_verified_date":
      return "Verification date is stale";
    case "ok":
      return "Verification status OK";
    default:
      return "Verification details unavailable";
  }
}

export function getAskIsaVerificationReasonBadgeLabel(
  reason?: SourceVerificationReason,
) {
  switch (reason) {
    case "missing_last_verified_date":
      return "Missing date";
    case "invalid_last_verified_date":
      return "Invalid date";
    case "stale_last_verified_date":
      return "Stale verification";
    default:
      return null;
  }
}

export function getAskIsaVerificationAgeLabel(
  ageDays?: number | null,
) {
  if (typeof ageDays !== "number") return null;
  if (ageDays <= 0) return "verified today";
  if (ageDays === 1) return "verified 1 day ago";
  return `verified ${ageDays} days ago`;
}

export function getAskIsaVerificationAgeBadgeLabel(
  ageDays?: number | null,
) {
  if (typeof ageDays !== "number") return null;
  if (ageDays <= 0) return "Today";
  return `${ageDays}d old`;
}

export function buildAskIsaSourcePostureSummary(
  sources: AskIsaSourcePostureSource[] = []
): AskIsaSourcePostureSummary {
  const countsByReason: Record<SourceVerificationReason, number> = {
    ok: 0,
    missing_last_verified_date: 0,
    invalid_last_verified_date: 0,
    stale_last_verified_date: 0,
  };

  const verificationAges: number[] = [];
  let deprecatedCount = 0;
  let needsVerificationCount = 0;

  for (const source of sources) {
    if (source.isDeprecated) {
      deprecatedCount += 1;
    }

    if (source.needsVerification) {
      needsVerificationCount += 1;
    }

    const reason = source.verificationReason || "ok";
    countsByReason[reason] += 1;

    if (Number.isFinite(source.verificationAgeDays)) {
      verificationAges.push(Number(source.verificationAgeDays));
    }
  }

  return {
    totalSources: sources.length,
    deprecatedCount,
    needsVerificationCount,
    allVerifiedWithinWindow: sources.length > 0 && deprecatedCount === 0 && needsVerificationCount === 0,
    countsByReason,
    oldestVerificationAgeDays: verificationAges.length ? Math.max(...verificationAges) : null,
  };
}
