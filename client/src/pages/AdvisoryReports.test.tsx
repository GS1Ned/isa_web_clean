import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdvisoryReports from "./AdvisoryReports";

const mockList = vi.fn();
const mockStats = vi.fn();
const mockSetLocation = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    advisoryReports: {
      list: {
        useQuery: (...args: unknown[]) => mockList(...args),
      },
      stats: {
        useQuery: (...args: unknown[]) => mockStats(...args),
      },
    },
  },
}));

vi.mock("wouter", () => ({
  useLocation: () => ["/advisory-reports", mockSetLocation],
}));

vi.mock("@/components/AdvisoryReportPdfExportButton", () => ({
  AdvisoryReportPdfExportButton: ({
    reportTitle,
  }: {
    reportTitle: string;
  }) => <button type="button">Export {reportTitle}</button>,
}));

const mockAdvisoryReports = [
  {
    id: 1,
    title: "Climate Compliance Advisory",
    reportType: "GAP_ANALYSIS",
    content: "Detailed report content",
    executiveSummary: "Decision-core posture should be visible on the list surface.",
    generatedDate: "2026-03-06T10:00:00.000Z",
    generatedBy: "AI System",
    version: "1.0.0",
    reviewStatus: "UNDER_REVIEW",
    publicationStatus: "INTERNAL_ONLY",
    laneStatus: "LANE_C",
    qualityScore: 0.88,
    viewCount: 7,
    sectorTags: ["RETAIL"],
    gs1ImpactTags: ["TRACEABILITY"],
    decisionArtifacts: [
      {
        artifactVersion: "1.0.0",
        artifactType: "gap_analysis",
        capability: "ESRS_MAPPING",
        confidence: {
          level: "high",
          score: 0.91,
          basis: "Mapped requirements are stable for routine use.",
          reviewRecommended: false,
          uncertaintyClass: "decision_grade",
          escalationAction: "none",
        },
      },
      {
        artifactVersion: "1.0.0",
        artifactType: "attribute_recommendation",
        capability: "ESRS_MAPPING",
        confidence: {
          level: "low",
          score: 0.42,
          basis: "Current evidence posture requires explicit validation before sign-off.",
          reviewRecommended: true,
          uncertaintyClass: "insufficient_evidence",
          escalationAction: "human_review_required",
        },
      },
    ],
  },
];

const mockAdvisoryStats = {
  total: 1,
  byReviewStatus: [{ status: "UNDER_REVIEW", count: 1 }],
  byPublicationStatus: [{ status: "INTERNAL_ONLY", count: 1 }],
  stale: { count: 0 },
};

describe("AdvisoryReports", () => {
  beforeEach(() => {
    mockList.mockReset();
    mockStats.mockReset();
    mockSetLocation.mockReset();

    mockList.mockReturnValue({
      data: mockAdvisoryReports,
      isLoading: false,
    });

    mockStats.mockReturnValue({
      data: mockAdvisoryStats,
      isLoading: false,
    });
  });

  it("renders compact decision-core posture on advisory report cards", () => {
    render(<AdvisoryReports />);

    expect(screen.getAllByText(/Climate Compliance Advisory/i).length).toBeGreaterThan(0);
    expect(screen.getByText("2 decision artifacts")).not.toBeNull();
    expect(screen.getByText(/Escalate to human review/i)).not.toBeNull();
    expect(screen.queryByText(/Decision-grade posture/i)).toBeNull();
    expect(screen.getByText(/Decision-core posture should be visible on the list surface/i)).not.toBeNull();
    expect(screen.getByRole("button", { name: /View Report/i })).not.toBeNull();
  });

  it("navigates from a report card to the advisory detail view", async () => {
    const user = userEvent.setup();

    render(<AdvisoryReports />);

    const viewReportButtons = screen.getAllByRole("button", {
      name: /View Report/i,
    });

    expect(viewReportButtons.length).toBeGreaterThan(0);

    await user.click(viewReportButtons[0]);

    expect(mockSetLocation).toHaveBeenCalledWith("/advisory-reports/1");
  });
});
