import { describe, expect, it } from "vitest";
import {
  summarizeVerificationPosture,
  withVerificationPosture,
} from "./verification-posture";

describe("verification posture", () => {
  it("projects verification posture fields onto a record", () => {
    const projected = withVerificationPosture({
      id: 1,
      lastVerifiedDate: null,
      name: "GS1 Registry Snapshot",
    });

    expect(projected.needsVerification).toBe(true);
    expect(projected.verificationReason).toBe("missing_last_verified_date");
    expect(projected.verificationFreshnessBucket).toBe("unknown");
    expect(projected.verificationAgeDays).toBeNull();
  });

  it("summarizes freshness and reason buckets", () => {
    const summary = summarizeVerificationPosture([
      { lastVerifiedDate: new Date().toISOString() },
      { lastVerifiedDate: null },
      { lastVerifiedDate: "not-a-date" },
    ]);

    expect(summary.totalChecked).toBe(3);
    expect(summary.countsByReason.ok).toBe(1);
    expect(summary.countsByReason.missing_last_verified_date).toBe(1);
    expect(summary.countsByReason.invalid_last_verified_date).toBe(1);
    expect(summary.freshnessBuckets.fresh).toBe(1);
    expect(summary.freshnessBuckets.unknown).toBe(2);
  });
});
