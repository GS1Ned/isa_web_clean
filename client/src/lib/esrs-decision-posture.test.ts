import { describe, expect, it } from "vitest";

import {
  formatDecisionPostureLabel,
  getDecisionPostureSummary,
} from "./esrs-decision-posture";

describe("esrs decision posture helpers", () => {
  it("formats posture labels consistently", () => {
    expect(formatDecisionPostureLabel("human_review_required")).toBe(
      "Human Review Required"
    );
    expect(formatDecisionPostureLabel("decision_grade")).toBe("Decision Grade");
  });

  it("returns a human-review posture when escalation is required", () => {
    const summary = getDecisionPostureSummary({
      level: "low",
      reviewRecommended: true,
      uncertaintyClass: "insufficient_evidence",
      escalationAction: "human_review_required",
    });

    expect(summary.title).toBe("Human review required");
    expect(summary.badgeLabel).toBe("Escalate to human review");
    expect(summary.className).toContain("border-red-200");
  });

  it("returns an analyst-review posture when review is recommended", () => {
    const summary = getDecisionPostureSummary({
      level: "medium",
      reviewRecommended: true,
      uncertaintyClass: "review_required",
      escalationAction: "analyst_review",
    });

    expect(summary.title).toBe("Analyst review recommended");
    expect(summary.badgeLabel).toBe("Review before sign-off");
    expect(summary.className).toContain("border-amber-200");
  });

  it("returns a routine-use posture for high-confidence outputs", () => {
    const summary = getDecisionPostureSummary({
      level: "high",
      reviewRecommended: false,
      uncertaintyClass: "decision_grade",
      escalationAction: "none",
    });

    expect(summary.title).toBe("Routine downstream use acceptable");
    expect(summary.badgeLabel).toBe("Decision-grade posture");
    expect(summary.className).toContain("border-green-200");
  });
});
