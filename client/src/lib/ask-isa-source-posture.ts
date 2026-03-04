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
