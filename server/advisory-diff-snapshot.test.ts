import { describe, expect, it } from "vitest";

import {
  enrichAdvisoryDiffWithSnapshot,
  findSnapshotBackedDiffCandidate,
} from "./advisory-diff-snapshot";

describe("advisory-diff-snapshot", () => {
  it("selects the latest report that matches the current advisory version and requested snapshot", () => {
    const candidate = findSnapshotBackedDiffCandidate({
      version1: "v1.0",
      version2: "v1.1",
      reports: [
        {
          id: 10,
          version: "1.1",
          generatedDate: "2026-03-01T10:00:00.000Z",
        },
        {
          id: 20,
          version: "1.1.0",
          generatedDate: "2026-03-02T10:00:00.000Z",
        },
      ],
      versionsByReportId: new Map([
        [
          10,
          [
            {
              id: 101,
              reportId: 10,
              version: "1.0",
              createdAt: "2026-03-01T09:00:00.000Z",
            },
          ],
        ],
        [
          20,
          [
            {
              id: 201,
              reportId: 20,
              version: "1.0.0",
              createdAt: "2026-03-02T09:00:00.000Z",
            },
          ],
        ],
      ]),
    });

    expect(candidate?.report.id).toBe(20);
    expect(candidate?.snapshot.id).toBe(201);
  });

  it("adds snapshot-backed decision artifact diff metadata when a matching report/snapshot exists", () => {
    const result = enrichAdvisoryDiffWithSnapshot({
      diffData: {
        metadata: {
          version1: { version: "1.0" },
          version2: { version: "1.1" },
        },
      },
      version1: "v1.0",
      version2: "v1.1",
      reports: [
        {
          id: 10,
          version: "1.1",
          generatedDate: "2026-03-02T10:00:00.000Z",
          decisionArtifacts: [
            {
              artifactVersion: "1.0",
              artifactType: "gap_analysis",
              capability: "ESRS_MAPPING",
              generatedAt: "2026-03-02T10:00:00.000Z",
              subject: {
                sector: "Retail",
                companySize: "large",
                targetRegulations: ["CSRD"],
              },
              confidence: {
                level: "high",
                score: 0.82,
                basis: "Current report.",
                reviewRecommended: false,
              },
              evidence: {
                codePaths: ["server/routers/gap-analyzer.ts"],
                dataSources: ["gs1_esrs_mappings"],
              },
              summary: {
                totalRequirements: 12,
                coveragePercentage: 58,
                criticalGapCount: 2,
                highGapCount: 3,
                remediationPathCount: 1,
                criticalGapIds: ["gap-1"],
              },
            },
          ],
        },
      ],
      versionsByReportId: new Map([
        [
          10,
          [
            {
              id: 101,
              reportId: 10,
              version: "1.0",
              createdAt: "2026-03-01T10:00:00.000Z",
              decisionArtifacts: [
                {
                  artifactVersion: "1.0",
                  artifactType: "gap_analysis",
                  capability: "ESRS_MAPPING",
                  generatedAt: "2026-03-01T10:00:00.000Z",
                  subject: {
                    sector: "Retail",
                    companySize: "large",
                    targetRegulations: ["CSRD"],
                  },
                  confidence: {
                    level: "medium",
                    score: 0.67,
                    basis: "Snapshot report.",
                    reviewRecommended: true,
                  },
                  evidence: {
                    codePaths: ["server/routers/gap-analyzer.ts"],
                    dataSources: ["gs1_esrs_mappings"],
                  },
                  summary: {
                    totalRequirements: 10,
                    coveragePercentage: 52,
                    criticalGapCount: 3,
                    highGapCount: 4,
                    remediationPathCount: 1,
                    criticalGapIds: ["gap-1", "gap-2"],
                  },
                },
              ],
            },
          ],
        ],
      ]),
    });

    expect(result.snapshotBacked).toMatchObject({
      matched: true,
      source: "current_report_vs_version_snapshot",
      reportId: 10,
      snapshotId: 101,
    });
    expect(result.metadata.snapshotBacked).toMatchObject({
      matched: true,
      reportVersion: "1.1",
      snapshotVersion: "1.0",
    });
    expect(result.decisionArtifactDiff).toBeDefined();
    expect(result.decisionArtifactDiff.confidenceChangedArtifactTypes).toContain("gap_analysis");
  });

  it("falls back cleanly when no snapshot-backed match exists", () => {
    const result = enrichAdvisoryDiffWithSnapshot({
      diffData: { metadata: {} },
      version1: "v1.0",
      version2: "v1.1",
      reports: [],
      versionsByReportId: new Map(),
    });

    expect(result.snapshotBacked).toEqual({
      matched: false,
      source: "legacy_file_only",
    });
    expect(result).not.toHaveProperty("decisionArtifactDiff");
  });
});
