import { describe, expect, it } from "vitest";

import {
  buildAskIsaSourcePostureSummary,
  getAskIsaVerificationAgeBadgeLabel,
  getAskIsaVerificationAgeLabel,
  getAskIsaVerificationReasonBadgeLabel,
  getAskIsaVerificationReasonLabel,
} from "./ask-isa-source-posture";

describe("ask-isa-source-posture", () => {
  it("summarizes mixed verification posture consistently", () => {
    expect(
      buildAskIsaSourcePostureSummary([
        {
          isDeprecated: false,
          needsVerification: false,
          verificationReason: "ok",
          verificationAgeDays: 12,
        },
        {
          isDeprecated: false,
          needsVerification: true,
          verificationReason: "stale_last_verified_date",
          verificationAgeDays: 123,
        },
        {
          isDeprecated: true,
          needsVerification: false,
          verificationReason: "ok",
          verificationAgeDays: null,
        },
        {
          isDeprecated: false,
          needsVerification: true,
          verificationReason: "missing_last_verified_date",
        },
      ])
    ).toEqual({
      totalSources: 4,
      deprecatedCount: 1,
      needsVerificationCount: 2,
      allVerifiedWithinWindow: false,
      countsByReason: {
        ok: 2,
        missing_last_verified_date: 1,
        invalid_last_verified_date: 0,
        stale_last_verified_date: 1,
      },
      oldestVerificationAgeDays: 123,
    });
  });

  it("marks a clean source set as verified within window", () => {
    expect(
      buildAskIsaSourcePostureSummary([
        {
          isDeprecated: false,
          needsVerification: false,
          verificationReason: "ok",
          verificationAgeDays: 7,
        },
      ])
    ).toMatchObject({
      totalSources: 1,
      deprecatedCount: 0,
      needsVerificationCount: 0,
      allVerifiedWithinWindow: true,
      oldestVerificationAgeDays: 7,
    });
  });

  it("formats verification labels for summaries and compact badges", () => {
    expect(getAskIsaVerificationReasonLabel("stale_last_verified_date")).toBe(
      "Verification date is stale",
    );
    expect(getAskIsaVerificationReasonBadgeLabel("missing_last_verified_date")).toBe(
      "Missing date",
    );
    expect(getAskIsaVerificationReasonBadgeLabel("ok")).toBeNull();
    expect(getAskIsaVerificationAgeLabel(3)).toBe("verified 3 days ago");
    expect(getAskIsaVerificationAgeLabel(0)).toBe("verified today");
    expect(getAskIsaVerificationAgeBadgeLabel(14)).toBe("14d old");
    expect(getAskIsaVerificationAgeBadgeLabel(null)).toBeNull();
  });
});
