import { buildDecisionArtifactDiffSummary } from "./advisory-report-decision-diff";
import { normalizeAdvisoryVersionTag } from "./advisory-legacy-compat";

type AdvisoryReportLike = {
  id: number;
  version?: string | null;
  generatedDate?: string | Date | null;
  decisionArtifacts?: unknown;
};

type AdvisoryReportVersionLike = {
  id: number;
  reportId: number;
  version?: string | null;
  createdAt?: string | Date | null;
  decisionArtifacts?: unknown;
};

interface SnapshotBackedDiffCandidate {
  report: AdvisoryReportLike;
  snapshot: AdvisoryReportVersionLike;
}

function toMillis(value: string | Date | null | undefined) {
  if (!value) {
    return 0;
  }

  const date = value instanceof Date ? value : new Date(value);
  const millis = date.getTime();
  return Number.isFinite(millis) ? millis : 0;
}

function compareDescendingTimestamp(
  left: string | Date | null | undefined,
  right: string | Date | null | undefined,
) {
  return toMillis(right) - toMillis(left);
}

export function findSnapshotBackedDiffCandidate(input: {
  version1: string;
  version2: string;
  reports: AdvisoryReportLike[];
  versionsByReportId: Map<number, AdvisoryReportVersionLike[]>;
}): SnapshotBackedDiffCandidate | null {
  const normalizedVersion1 = normalizeAdvisoryVersionTag(input.version1);
  const normalizedVersion2 = normalizeAdvisoryVersionTag(input.version2);

  const matchingReports = input.reports
    .filter(report => normalizeAdvisoryVersionTag(report.version ?? "") === normalizedVersion2)
    .sort((left, right) => compareDescendingTimestamp(left.generatedDate, right.generatedDate));

  for (const report of matchingReports) {
    const versions = input.versionsByReportId.get(report.id) ?? [];
    const snapshot = versions
      .filter(version => normalizeAdvisoryVersionTag(version.version ?? "") === normalizedVersion1)
      .sort((left, right) => compareDescendingTimestamp(left.createdAt, right.createdAt))[0];

    if (snapshot) {
      return { report, snapshot };
    }
  }

  return null;
}

export function enrichAdvisoryDiffWithSnapshot(input: {
  diffData: any;
  version1: string;
  version2: string;
  reports: AdvisoryReportLike[];
  versionsByReportId: Map<number, AdvisoryReportVersionLike[]>;
}) {
  const candidate = findSnapshotBackedDiffCandidate({
    version1: input.version1,
    version2: input.version2,
    reports: input.reports,
    versionsByReportId: input.versionsByReportId,
  });

  if (!candidate) {
    return {
      ...input.diffData,
      snapshotBacked: {
        matched: false,
        source: "legacy_file_only" as const,
      },
    };
  }

  const decisionArtifactDiff = buildDecisionArtifactDiffSummary({
    currentArtifacts: candidate.report.decisionArtifacts,
    snapshotArtifacts: candidate.snapshot.decisionArtifacts,
  });

  return {
    ...input.diffData,
    metadata: {
      ...input.diffData?.metadata,
      snapshotBacked: {
        matched: true,
        source: "current_report_vs_version_snapshot" as const,
        reportId: candidate.report.id,
        reportVersion: candidate.report.version ?? null,
        snapshotId: candidate.snapshot.id,
        snapshotVersion: candidate.snapshot.version ?? null,
      },
    },
    decisionArtifactDiff,
    snapshotBacked: {
      matched: true,
      source: "current_report_vs_version_snapshot" as const,
      reportId: candidate.report.id,
      reportVersion: candidate.report.version ?? null,
      snapshotId: candidate.snapshot.id,
      snapshotVersion: candidate.snapshot.version ?? null,
    },
  };
}
