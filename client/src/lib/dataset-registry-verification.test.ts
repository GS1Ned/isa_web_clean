import { describe, expect, it } from "vitest";
import {
  getDatasetVerificationBadgeLabel,
  getDatasetVerificationBadgeVariant,
  getDatasetVerificationDescription,
  getDatasetVerificationTitle,
} from "./dataset-registry-verification";

describe("dataset registry verification helper", () => {
  it("formats current verification copy", () => {
    expect(getDatasetVerificationTitle("ok")).toBe("Verification current");
    expect(getDatasetVerificationDescription("ok", 12)).toContain("12 days");
    expect(getDatasetVerificationBadgeLabel("fresh")).toBe("Fresh");
    expect(getDatasetVerificationBadgeVariant("fresh")).toBe("default");
  });

  it("formats missing verification copy", () => {
    expect(getDatasetVerificationTitle("missing_last_verified_date")).toBe("Verification missing");
    expect(getDatasetVerificationDescription("missing_last_verified_date", null)).toContain(
      "No verification timestamp"
    );
    expect(getDatasetVerificationBadgeVariant("unknown")).toBe("destructive");
  });

  it("formats stale verification copy", () => {
    expect(getDatasetVerificationTitle("stale_last_verified_date")).toBe("Verification stale");
    expect(getDatasetVerificationDescription("stale_last_verified_date", 120)).toContain(
      "outside the current verification window"
    );
    expect(getDatasetVerificationBadgeLabel("stale")).toBe("Stale");
    expect(getDatasetVerificationBadgeVariant("stale")).toBe("destructive");
  });
});
