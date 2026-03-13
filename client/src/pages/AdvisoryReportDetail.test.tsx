import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdvisoryReportDetail from "./AdvisoryReportDetail";

const mockGetById = vi.fn();
const mockVersions = vi.fn();
const mockNavigate = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    advisoryReports: {
      getById: {
        useQuery: (...args: unknown[]) => mockGetById(...args),
      },
      versions: {
        useQuery: (...args: unknown[]) => mockVersions(...args),
      },
    },
  },
}));

vi.mock("wouter", () => ({
  useRoute: () => [true, { id: "1" }],
  useLocation: () => ["/advisory-reports/1", mockNavigate],
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));

vi.mock("@/components/AdvisoryReportPdfExportButton", () => ({
  AdvisoryReportPdfExportButton: ({
    reportTitle,
  }: {
    reportTitle: string;
  }) => <button type="button">Export {reportTitle}</button>,
}));

const mockReport = {
  id: 1,
  title: "Climate Compliance Advisory",
  reportType: "GAP_ANALYSIS",
  content: "Advisory content for governed review.",
  executiveSummary:
    "Stakeholder-ready summary grounded in ESRS decision-core artifacts.",
  generatedDate: "2026-03-06T10:00:00.000Z",
  generatedBy: "AI System",
  version: "1.0.0",
  reviewStatus: "UNDER_REVIEW",
  publicationStatus: "INTERNAL_ONLY",
  laneStatus: "LANE_C",
  qualityScore: 0.88,
  viewCount: 7,
  targetRegulationIds: [1, 2],
  targetStandardIds: [3],
  sectorTags: ["RETAIL"],
  gs1ImpactTags: ["TRACEABILITY"],
  reviewNotes: "Review this report before downstream publication.",
  governanceNotes: "Lane C review remains active.",
  findings: [
    {
      category: "Climate Disclosure",
      severity: "HIGH",
      description: "Current disclosure coverage is incomplete for climate metrics.",
      recommendation: "Fill identified climate reporting gaps before publication.",
    },
  ],
  recommendations: ["Prioritize mapped climate attributes in the next reporting cycle."],
  decisionArtifacts: [
    {
      artifactVersion: "1.0.0",
      artifactType: "gap_analysis",
      capability: "ESRS_MAPPING",
      generatedAt: "2026-03-06T10:00:00.000Z",
      confidence: {
        level: "low",
        score: 0.42,
        basis: "Current evidence posture requires explicit validation before sign-off.",
        reviewRecommended: true,
        uncertaintyClass: "insufficient_evidence",
        escalationAction: "human_review_required",
      },
      evidence: {
        codePaths: ["server/routers/gap-analyzer.ts"],
        dataSources: ["gs1_attribute_esrs_mapping"],
        evidenceRefs: [
          {
            sourceChunkId: 1001,
            evidenceKey: "ke:1001:hash",
            citationLabel: "CSRD — Article 19a",
            sourceLocator:
              "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022L2464",
          },
        ],
      },
      summary: {
        criticalGapCount: 2,
        coveragePercentage: 58,
      },
    },
  ],
};

const mockVersionsWithDrift = [
  {
    id: 11,
    reportId: 1,
    version: "0.9.0",
    createdAt: "2026-03-05T09:00:00.000Z",
    createdBy: "AI System",
    changeLog: "Snapshot before the latest mapping refresh.",
    decisionArtifacts: [
      {
        artifactVersion: "1.0.0",
        artifactType: "gap_analysis",
        capability: "ESRS_MAPPING",
        generatedAt: "2026-03-05T09:00:00.000Z",
        confidence: {
          level: "medium",
          score: 0.58,
          basis: "Older snapshot before latest mapping refresh.",
          reviewRecommended: true,
          uncertaintyClass: "review_required",
          escalationAction: "analyst_review",
        },
      },
    ],
    decisionArtifactDiff: {
      currentArtifactCount: 2,
      snapshotArtifactCount: 1,
      addedArtifactTypes: ["attribute_recommendation"],
      removedArtifactTypes: [],
      changedArtifactTypes: ["gap_analysis"],
      unchangedArtifactTypes: [],
      confidenceChangedArtifactTypes: ["gap_analysis"],
      uncertaintyChangedArtifactTypes: ["gap_analysis"],
      escalationChangedArtifactTypes: ["gap_analysis"],
      averageConfidenceDelta: 0.14,
      hasChanges: true,
    },
  },
];

describe("AdvisoryReportDetail", () => {
  beforeEach(() => {
    mockGetById.mockReset();
    mockVersions.mockReset();
    mockNavigate.mockReset();

    mockGetById.mockReturnValue({
      data: mockReport,
      error: null,
      isLoading: false,
    });

    mockVersions.mockReturnValue({
      data: [],
      isLoading: false,
    });
  });

  it("renders the detail landing surface with decision-artifact trust signals", () => {
    render(<AdvisoryReportDetail />);

    expect(screen.getAllByText(/Climate Compliance Advisory/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Stakeholder-ready summary grounded in ESRS decision-core artifacts/i),
    ).not.toBeNull();
    expect(screen.getByText(/Internal Use Only:/i)).not.toBeNull();
    expect(screen.getByText("1 decision artifact")).not.toBeNull();
    expect(screen.getByText(/Decision Artifacts/i)).not.toBeNull();
    expect(screen.getByText(/Persisted decision-core snapshot attached to this advisory report/i)).not.toBeNull();
    expect(screen.getByText(/low 42%/i)).not.toBeNull();
    expect(screen.getByText(/Insufficient Evidence/i)).not.toBeNull();
    expect(screen.getByText(/Review recommended/i)).not.toBeNull();
    expect(
      screen.getByText(/Current evidence posture requires explicit validation before sign-off/i),
    ).not.toBeNull();
    expect(screen.getByText(/Escalation: Human Review Required/i)).not.toBeNull();
    expect(screen.getByText(/Evidence Data Sources/i)).not.toBeNull();
    expect(screen.getByText(/gs1_attribute_esrs_mapping/i)).not.toBeNull();
    expect(screen.getByText(/Evidence Ref Traceability/i)).not.toBeNull();
    expect(screen.getByText(/Reviewer-usable refs: 1\/1/i)).not.toBeNull();
    expect(screen.getByText(/CSRD — Article 19a/i)).not.toBeNull();
  });

  it("renders version-history artifact drift signals for prior report snapshots", () => {
    mockVersions.mockReturnValueOnce({
      data: mockVersionsWithDrift,
      isLoading: false,
    });

    render(<AdvisoryReportDetail />);

    expect(screen.getAllByText(/Version History/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Snapshot before the latest mapping refresh/i)).not.toBeNull();
    expect(screen.getByText(/Diff vs current report/i)).not.toBeNull();
    expect(screen.getByText(/Artifact drift detected/i)).not.toBeNull();
    expect(screen.getByText(/Confidence delta \+14%/i)).not.toBeNull();
    expect(screen.getAllByText(/attribute_recommendation/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/gap_analysis/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Older snapshot before latest mapping refresh/i)).not.toBeNull();
  });
});
