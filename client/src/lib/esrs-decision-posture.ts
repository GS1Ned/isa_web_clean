export interface DecisionPostureInput {
  level: string;
  reviewRecommended?: boolean;
  uncertaintyClass?: string;
  escalationAction?: string;
}

export interface DecisionPostureSummary {
  title: string;
  description: string;
  badgeLabel: string;
  className: string;
}

export function formatDecisionPostureLabel(value?: string) {
  if (!value) return null;

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function getDecisionPostureSummary(
  confidence: DecisionPostureInput
): DecisionPostureSummary {
  if (confidence.escalationAction === "human_review_required") {
    return {
      title: "Human review required",
      description:
        "This output should not be treated as decision-grade without explicit human validation because the current evidence posture is insufficient.",
      badgeLabel: "Escalate to human review",
      className: "border-red-200 bg-red-50 text-red-950",
    };
  }

  if (
    confidence.escalationAction === "analyst_review" ||
    confidence.reviewRecommended
  ) {
    return {
      title: "Analyst review recommended",
      description:
        "This output is usable for guided analysis, but downstream sign-off should include an analyst check before operationalizing it.",
      badgeLabel: "Review before sign-off",
      className: "border-amber-200 bg-amber-50 text-amber-950",
    };
  }

  return {
    title: "Routine downstream use acceptable",
    description:
      "The current decision posture is strong enough for routine downstream use, assuming the surrounding workflow remains within the current evidence and scope boundaries.",
    badgeLabel: "Decision-grade posture",
    className: "border-green-200 bg-green-50 text-green-950",
  };
}
