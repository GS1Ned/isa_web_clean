export type DatasetVerificationReason =
  | "ok"
  | "missing_last_verified_date"
  | "invalid_last_verified_date"
  | "stale_last_verified_date";

export type DatasetVerificationFreshnessBucket =
  | "fresh"
  | "aging"
  | "stale"
  | "unknown";

export function getDatasetVerificationTitle(reason: DatasetVerificationReason): string {
  switch (reason) {
    case "ok":
      return "Verification current";
    case "missing_last_verified_date":
      return "Verification missing";
    case "invalid_last_verified_date":
      return "Verification invalid";
    case "stale_last_verified_date":
      return "Verification stale";
  }
}

export function getDatasetVerificationDescription(
  reason: DatasetVerificationReason,
  verificationAgeDays: number | null
): string {
  if (reason === "missing_last_verified_date") {
    return "No verification timestamp is recorded for this dataset.";
  }

  if (reason === "invalid_last_verified_date") {
    return "The stored verification timestamp is invalid and needs correction.";
  }

  if (verificationAgeDays === null) {
    return "Verification age is unavailable.";
  }

  const daysLabel = verificationAgeDays === 1 ? "1 day" : `${verificationAgeDays} days`;

  if (reason === "stale_last_verified_date") {
    return `Last verification was ${daysLabel} ago and is outside the current verification window.`;
  }

  return `Last verification was ${daysLabel} ago.`;
}

export function getDatasetVerificationBadgeLabel(
  freshnessBucket: DatasetVerificationFreshnessBucket
): string {
  switch (freshnessBucket) {
    case "fresh":
      return "Fresh";
    case "aging":
      return "Aging";
    case "stale":
      return "Stale";
    case "unknown":
      return "Unknown";
  }
}

export function getDatasetVerificationBadgeVariant(
  freshnessBucket: DatasetVerificationFreshnessBucket
): "default" | "secondary" | "destructive" | "outline" {
  switch (freshnessBucket) {
    case "fresh":
      return "default";
    case "aging":
      return "secondary";
    case "stale":
    case "unknown":
      return "destructive";
  }
}
