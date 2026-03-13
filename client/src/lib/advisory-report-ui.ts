import type { DecisionArtifactCardData } from "@/components/DecisionArtifactCard";
import {
  getDecisionPostureSummary,
  type DecisionPostureSummary,
} from "@/lib/esrs-decision-posture";

export type AdvisoryBadgeVariant = "default" | "secondary" | "destructive" | "outline";

export interface AdvisoryBadgeTone {
  variant: AdvisoryBadgeVariant;
  className?: string;
}

export function formatAdvisoryEnumLabel(value: string) {
  return value.replace(/_/g, " ");
}

export function formatDecisionArtifactCount(count: number) {
  return `${count} decision artifact${count === 1 ? "" : "s"}`;
}

export function formatAdvisoryVersionLabel(version: string) {
  return version.startsWith("v") ? version : `v${version}`;
}

export function formatAdvisoryTimestamp(value?: string | Date | null) {
  if (!value) {
    return "N/A";
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
}

export function formatDecisionArtifactConfidenceDelta(value: number | null) {
  if (value == null) {
    return "N/A";
  }

  const percentage = Math.round(value * 100);
  return `${percentage > 0 ? "+" : ""}${percentage}%`;
}

export function getDecisionArtifactDiffTone(hasChanges: boolean): AdvisoryBadgeTone {
  if (hasChanges) {
    return {
      variant: "outline",
      className: "border-amber-300 bg-amber-50 text-amber-900",
    };
  }

  return {
    variant: "secondary",
    className: "bg-emerald-100 text-emerald-800 border-transparent",
  };
}

export function isDecisionArtifactCardData(value: unknown): value is DecisionArtifactCardData {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as DecisionArtifactCardData).artifactVersion === "string" &&
    typeof (value as DecisionArtifactCardData).artifactType === "string" &&
    typeof (value as DecisionArtifactCardData).capability === "string" &&
    typeof (value as DecisionArtifactCardData).confidence?.level === "string" &&
    typeof (value as DecisionArtifactCardData).confidence?.score === "number" &&
    typeof (value as DecisionArtifactCardData).confidence?.basis === "string"
  );
}

export function normalizeDecisionArtifacts(value: unknown): DecisionArtifactCardData[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isDecisionArtifactCardData);
}

function getDecisionArtifactSeverity(artifact: DecisionArtifactCardData) {
  if (artifact.confidence.escalationAction === "human_review_required") {
    return 3;
  }

  if (
    artifact.confidence.escalationAction === "analyst_review" ||
    artifact.confidence.reviewRecommended
  ) {
    return 2;
  }

  return 1;
}

export function getMostSevereDecisionArtifact(
  artifacts: DecisionArtifactCardData[]
) {
  if (artifacts.length === 0) {
    return null;
  }

  return artifacts.reduce((current, candidate) => {
    if (!current) {
      return candidate;
    }

    return getDecisionArtifactSeverity(candidate) >
      getDecisionArtifactSeverity(current)
      ? candidate
      : current;
  }, null as DecisionArtifactCardData | null);
}

export function getAdvisoryDecisionPostureSummary(
  value: unknown
): DecisionPostureSummary | null {
  const artifacts = normalizeDecisionArtifacts(value);
  const mostSevereArtifact = getMostSevereDecisionArtifact(artifacts);

  if (!mostSevereArtifact) {
    return null;
  }

  return getDecisionPostureSummary(mostSevereArtifact.confidence);
}

export function getAdvisoryReviewStatusTone(status: string): AdvisoryBadgeTone {
  switch (status) {
    case "PUBLISHED":
      return { variant: "default" };
    case "APPROVED":
      return {
        variant: "secondary",
        className: "bg-emerald-100 text-emerald-800 border-transparent",
      };
    case "UNDER_REVIEW":
      return {
        variant: "outline",
        className: "border-amber-300 bg-amber-50 text-amber-800",
      };
    case "ARCHIVED":
      return { variant: "destructive" };
    case "DRAFT":
    default:
      return { variant: "secondary" };
  }
}

export function getAdvisoryPublicationStatusTone(status: string): AdvisoryBadgeTone {
  switch (status) {
    case "PUBLISHED":
      return { variant: "default" };
    case "READY_FOR_PUBLICATION":
      return {
        variant: "secondary",
        className: "bg-emerald-100 text-emerald-800 border-transparent",
      };
    case "WITHDRAWN":
      return { variant: "destructive" };
    case "INTERNAL_ONLY":
    default:
      return { variant: "secondary" };
  }
}

export function getAdvisoryLaneStatusTone(status: string): AdvisoryBadgeTone {
  switch (status) {
    case "LANE_A":
      return {
        variant: "outline",
        className: "border-blue-300 bg-blue-50 text-blue-800",
      };
    case "LANE_B":
      return {
        variant: "outline",
        className: "border-violet-300 bg-violet-50 text-violet-800",
      };
    case "LANE_C":
    default:
      return {
        variant: "outline",
        className: "border-slate-300 bg-slate-50 text-slate-700",
      };
  }
}
