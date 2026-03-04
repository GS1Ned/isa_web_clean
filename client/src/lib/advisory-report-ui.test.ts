import { describe, expect, it } from "vitest";

import {
  formatAdvisoryVersionLabel,
  formatAdvisoryEnumLabel,
  formatDecisionArtifactConfidenceDelta,
  formatDecisionArtifactCount,
  getDecisionArtifactDiffTone,
  getAdvisoryPublicationStatusTone,
  getAdvisoryReviewStatusTone,
} from "./advisory-report-ui";

describe("advisory-report-ui", () => {
  it("formats advisory enum labels for display", () => {
    expect(formatAdvisoryEnumLabel("READY_FOR_PUBLICATION")).toBe(
      "READY FOR PUBLICATION",
    );
  });

  it("formats decision artifact counts with correct pluralization", () => {
    expect(formatDecisionArtifactCount(1)).toBe("1 decision artifact");
    expect(formatDecisionArtifactCount(3)).toBe("3 decision artifacts");
  });

  it("formats advisory version labels with a v-prefix", () => {
    expect(formatAdvisoryVersionLabel("1.0")).toBe("v1.0");
    expect(formatAdvisoryVersionLabel("v1.1")).toBe("v1.1");
  });

  it("formats decision artifact confidence delta for display", () => {
    expect(formatDecisionArtifactConfidenceDelta(0.14)).toBe("+14%");
    expect(formatDecisionArtifactConfidenceDelta(-0.08)).toBe("-8%");
    expect(formatDecisionArtifactConfidenceDelta(null)).toBe("N/A");
  });

  it("maps advisory statuses to supported badge tones", () => {
    expect(getAdvisoryReviewStatusTone("APPROVED")).toEqual({
      variant: "secondary",
      className: "bg-emerald-100 text-emerald-800 border-transparent",
    });

    expect(getAdvisoryPublicationStatusTone("READY_FOR_PUBLICATION")).toEqual({
      variant: "secondary",
      className: "bg-emerald-100 text-emerald-800 border-transparent",
    });
  });

  it("maps decision artifact diff state to supported badge tones", () => {
    expect(getDecisionArtifactDiffTone(true)).toEqual({
      variant: "outline",
      className: "border-amber-300 bg-amber-50 text-amber-900",
    });

    expect(getDecisionArtifactDiffTone(false)).toEqual({
      variant: "secondary",
      className: "bg-emerald-100 text-emerald-800 border-transparent",
    });
  });
});
