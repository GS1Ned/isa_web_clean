import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import GapAnalyzer from "./GapAnalyzer";

const mockGetAvailableSectors = vi.fn();
const mockGetCompanySizeOptions = vi.fn();
const mockGetSampleAttributes = vi.fn();
const mockAnalyze = vi.fn();

vi.mock("../lib/trpc", () => ({
  trpc: {
    gapAnalyzer: {
      getAvailableSectors: {
        useQuery: (...args: unknown[]) => mockGetAvailableSectors(...args),
      },
      getCompanySizeOptions: {
        useQuery: (...args: unknown[]) => mockGetCompanySizeOptions(...args),
      },
      getSampleAttributes: {
        useQuery: (...args: unknown[]) => mockGetSampleAttributes(...args),
      },
      analyze: {
        useMutation: (...args: unknown[]) => mockAnalyze(...args),
      },
    },
  },
}));

vi.mock("wouter", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  useLocation: () => ["/tools/gap-analyzer", vi.fn()],
}));

const mockGapAnalysisResult = {
  input: {
    sector: "food_beverage",
    companySize: "large" as const,
    currentGs1Coverage: ["gtin"],
  },
  timestamp: "2026-03-06T12:00:00.000Z",
  summary: {
    totalRequirements: 12,
    coveredRequirements: 4,
    partialCoverage: 1,
    gaps: 3,
    coveragePercentage: 33,
  },
  criticalGaps: [
    {
      id: "gap-e1-1",
      esrsStandard: "ESRS E1",
      esrsTopic: "Climate Change",
      shortName: "E1-1",
      definition: "Disclose material climate transition actions.",
      gapType: "missing_attribute",
      explanation: "Current GS1 coverage does not include a mapped climate-impact attribute for this datapoint.",
      priority: "critical",
      suggestedAttributes: [
        {
          attributeId: "productCarbonFootprint",
          attributeName: "Product Carbon Footprint",
          mappingType: "direct",
          mappingConfidence: "high",
          implementationNotes: "Capture verified product-level carbon data.",
        },
      ],
      epistemic: {
        status: "inference",
        confidence: "medium",
        basis: "Derived from ESRS-to-GS1 mapping coverage and missing current attributes.",
      },
    },
  ],
  highGaps: [],
  mediumGaps: [],
  lowGaps: [],
  remediationPaths: [],
  overallEpistemic: {
    factCount: 6,
    inferenceCount: 4,
    uncertainCount: 2,
    overallConfidence: "medium",
  },
  decisionArtifact: {
    artifactVersion: "1.0",
    artifactType: "gap_analysis",
    capability: "ESRS_MAPPING",
    generatedAt: "2026-03-06T12:00:00.000Z",
    confidence: {
      level: "low",
      score: 0.41,
      basis: "Current coverage is incomplete and several conclusions depend on inferred mapping gaps.",
      reviewRecommended: true,
      uncertaintyClass: "insufficient_evidence",
      escalationAction: "human_review_required",
    },
    evidence: {
      codePaths: ["server/routers/gap-analyzer.ts"],
      dataSources: ["gs1_esrs_mappings", "gs1_attribute_esrs_mapping"],
    },
    summary: {
      totalRequirements: 12,
      coveragePercentage: 33,
      criticalGapIds: ["gap-e1-1"],
    },
  },
};

describe("GapAnalyzer", () => {
  beforeEach(() => {
    mockGetAvailableSectors.mockReset();
    mockGetCompanySizeOptions.mockReset();
    mockGetSampleAttributes.mockReset();
    mockAnalyze.mockReset();

    mockGetAvailableSectors.mockReturnValue({
      data: ["food_beverage", "healthcare"],
      isLoading: false,
    });

    mockGetCompanySizeOptions.mockReturnValue({
      data: [
        {
          value: "large",
          label: "Large Enterprise",
          csrdApplicable: true,
          phaseInYear: 2026,
        },
        {
          value: "sme",
          label: "SME",
          csrdApplicable: true,
          phaseInYear: 2028,
        },
      ],
      isLoading: false,
    });

    mockGetSampleAttributes.mockReturnValue({
      data: [
        {
          gs1_attribute_id: "gtin",
          gs1_attribute_name: "GTIN (Global Trade Item Number)",
          confidence: "high",
        },
        {
          gs1_attribute_id: "productCarbonFootprint",
          gs1_attribute_name: "Product Carbon Footprint",
          confidence: "medium",
        },
      ],
      isLoading: false,
    });

    mockAnalyze.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
    });
  });

  it("renders coverage-source trust text alongside the current GS1 coverage selector", () => {
    render(<GapAnalyzer />);

    expect(screen.getByText(/coverage source:/i)).not.toBeNull();
    expect(
      screen.getByText(/current attributes come from ISA's ESRS-to-GS1 mapping inventory/i)
    ).not.toBeNull();
    expect(
      screen.getByText(/confidence badges reflect mapping strength/i)
    ).not.toBeNull();
    expect(
      screen.getByText(/sector and company size scope which ESRS requirements are evaluated/i)
    ).not.toBeNull();

    expect(screen.getByText(/Current GS1 Coverage/i)).not.toBeNull();
    expect(screen.getByText(/0 attributes selected/i)).not.toBeNull();
    expect(screen.getByLabelText(/GTIN \(Global Trade Item Number\)/i)).not.toBeNull();
    expect(screen.getByLabelText(/Product Carbon Footprint/i)).not.toBeNull();
    expect(screen.getByRole("button", { name: /Analyze Gaps/i })).not.toBeNull();
  });

  it("renders a stable successful result state with decision-core trust signals", () => {
    mockAnalyze.mockReturnValueOnce({
      mutate: vi.fn(),
      isPending: false,
      data: mockGapAnalysisResult,
    });

    render(<GapAnalyzer />);

    expect(screen.getByText(/Coverage Summary/i)).not.toBeNull();
    expect(screen.getByText(/Decision Core Artifact/i)).not.toBeNull();
    expect(screen.getAllByText(/Human review required/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(
        /Current coverage is incomplete and several conclusions depend on inferred mapping gaps/i
      )
    ).not.toBeNull();
    expect(screen.getByText(/Critical Gaps \(1\)/i)).not.toBeNull();
    expect(screen.getByText("E1-1")).not.toBeNull();
    expect(screen.getByText(/ESRS E1 • Climate Change/i)).not.toBeNull();
    expect(screen.getByText(/Definition/i)).not.toBeNull();
    expect(screen.getByText(/Disclose material climate transition actions/i)).not.toBeNull();
    expect(screen.getByText(/Explanation/i)).not.toBeNull();
    expect(
      screen.getByText(
        /Current GS1 coverage does not include a mapped climate-impact attribute for this datapoint/i
      )
    ).not.toBeNull();
    expect(screen.getByText(/Suggested GS1 Attributes/i)).not.toBeNull();
    expect(screen.getAllByText(/Product Carbon Footprint/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/direct/i)).not.toBeNull();
    expect(screen.getByText(/high confidence/i)).not.toBeNull();
    expect(screen.getByText(/Basis:/i)).not.toBeNull();
    expect(
      screen.getByText(/Derived from ESRS-to-GS1 mapping coverage and missing current attributes/i)
    ).not.toBeNull();
  });
});
