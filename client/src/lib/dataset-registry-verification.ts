import {
  getVerificationBadgeLabel,
  getVerificationBadgeVariant,
  getVerificationDescription,
  getVerificationTitle,
  type VerificationFreshnessBucket,
  type VerificationReason,
} from "./verification-posture";

export type DatasetVerificationReason = VerificationReason;
export type DatasetVerificationFreshnessBucket = VerificationFreshnessBucket;

export function getDatasetVerificationTitle(reason: DatasetVerificationReason): string {
  return getVerificationTitle(reason);
}

export function getDatasetVerificationDescription(
  reason: DatasetVerificationReason,
  verificationAgeDays: number | null
): string {
  if (reason === "missing_last_verified_date") {
    return "No verification timestamp is recorded for this dataset.";
  }

  return getVerificationDescription(reason, verificationAgeDays);
}

export function getDatasetVerificationBadgeLabel(
  freshnessBucket: DatasetVerificationFreshnessBucket
): string {
  return getVerificationBadgeLabel(freshnessBucket);
}

export function getDatasetVerificationBadgeVariant(
  freshnessBucket: DatasetVerificationFreshnessBucket
): "default" | "secondary" | "destructive" | "outline" {
  return getVerificationBadgeVariant(freshnessBucket);
}
