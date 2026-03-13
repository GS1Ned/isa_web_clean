import {
  getKnowledgeVerificationFreshnessBucket,
  getKnowledgeVerificationStatus,
  summarizeKnowledgeVerificationPosture,
} from "./knowledge-provenance";

export interface VerificationRecord {
  lastVerifiedDate: string | null;
}

export function withVerificationPosture<T extends VerificationRecord>(record: T) {
  const verification = getKnowledgeVerificationStatus(record.lastVerifiedDate);

  return {
    ...record,
    needsVerification: verification.needsVerification,
    verificationReason: verification.reason,
    verificationAgeDays: verification.verificationAgeDays,
    verificationFreshnessBucket: getKnowledgeVerificationFreshnessBucket(record.lastVerifiedDate),
  };
}

export function summarizeVerificationPosture(
  records: Array<VerificationRecord | string | null | undefined>
) {
  return summarizeKnowledgeVerificationPosture(
    records.map((record) =>
      typeof record === "object" && record !== null ? record.lastVerifiedDate : record ?? null
    )
  );
}
