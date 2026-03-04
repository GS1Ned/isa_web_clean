import { describe, expect, it } from "vitest";

import {
  formatAdvisoryEnumLabel,
  formatDecisionArtifactCount,
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
});
