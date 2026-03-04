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
