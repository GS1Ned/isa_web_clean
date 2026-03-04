import { describe, expect, it } from "vitest";
import {
  getVerificationAgeLabel,
  getVerificationBadgeLabel,
  getVerificationBadgeVariant,
  getVerificationDescription,
  getVerificationTitle,
} from "./verification-posture";

describe("verification posture helper", () => {
  it("formats current verification state", () => {
    expect(getVerificationTitle("ok")).toBe("Verification current");
    expect(getVerificationDescription("ok", 12)).toContain("12 days");
    expect(getVerificationBadgeLabel("fresh")).toBe("Fresh");
    expect(getVerificationBadgeVariant("fresh")).toBe("default");
    expect(getVerificationAgeLabel(12)).toBe("verified 12 days ago");
  });

  it("formats missing verification state", () => {
    expect(getVerificationTitle("missing_last_verified_date")).toBe("Verification missing");
    expect(getVerificationDescription("missing_last_verified_date", null)).toContain(
      "No verification timestamp"
    );
    expect(getVerificationBadgeLabel("unknown")).toBe("Unknown");
    expect(getVerificationBadgeVariant("unknown")).toBe("destructive");
    expect(getVerificationAgeLabel(null)).toBeNull();
  });

  it("formats stale verification state", () => {
    expect(getVerificationTitle("stale_last_verified_date")).toBe("Verification stale");
    expect(getVerificationDescription("stale_last_verified_date", 120)).toContain(
      "outside the current verification window"
    );
    expect(getVerificationBadgeLabel("stale")).toBe("Stale");
    expect(getVerificationBadgeVariant("stale")).toBe("destructive");
    expect(getVerificationAgeLabel(1)).toBe("verified 1 day ago");
  });
});
