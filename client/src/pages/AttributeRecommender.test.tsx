import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AttributeRecommender from "./AttributeRecommender";

const mockGetAvailableSectors = vi.fn();
const mockGetAvailableRegulations = vi.fn();
const mockGetCompanySizeOptions = vi.fn();
const mockGetSampleAttributes = vi.fn();
const mockRecommend = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    attributeRecommender: {
      getAvailableSectors: {
        useQuery: (...args: unknown[]) => mockGetAvailableSectors(...args),
      },
      getAvailableRegulations: {
        useQuery: (...args: unknown[]) => mockGetAvailableRegulations(...args),
      },
      getCompanySizeOptions: {
        useQuery: (...args: unknown[]) => mockGetCompanySizeOptions(...args),
      },
      getSampleAttributes: {
        useQuery: (...args: unknown[]) => mockGetSampleAttributes(...args),
      },
      recommend: {
        useMutation: (...args: unknown[]) => mockRecommend(...args),
      },
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

if (!HTMLElement.prototype.hasPointerCapture) {
  Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", {
    value: () => false,
    configurable: true,
  });
}

if (!HTMLElement.prototype.setPointerCapture) {
  Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
    value: () => {},
    configurable: true,
  });
}

if (!HTMLElement.prototype.releasePointerCapture) {
  Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", {
    value: () => {},
    configurable: true,
  });
}

if (!HTMLElement.prototype.scrollIntoView) {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    value: () => {},
    configurable: true,
  });
}

const mockRecommendationResult = {
  input: {
    sector: "Food & Beverage",
    targetRegulations: ["CSRD", "DPP"],
    currentAttributes: ["gtin"],
    companySize: "medium" as const,
  },
  recommendations: [
    {
      attributeId: "productCarbonFootprint",
      attributeName: "Product Carbon Footprint",
      attributeCode: "PCF",
      dataType: "Measurement",
      confidenceScore: 0.82,
      confidenceLevel: "high" as const,
      priorityRank: 1,
      regulatoryRelevance: [
        {
          regulation: "CSRD",
          requirement: "Climate impact disclosure",
          mappingType: "direct" as const,
        },
      ],
      esrsDatapoints: ["E1-3", "E1-4"],
      implementationNotes: "Capture verified lifecycle emissions per product record.",
      gdsnXmlSnippet:
        '<productCarbonFootprint measurementUnitCode="KGM">2.5</productCarbonFootprint>',
      estimatedEffort: "medium" as const,
      recommendationRationale:
        "This attribute directly supports priority ESRS climate datapoints and downstream DPP readiness.",
      epistemic: {
        status: "inference",
        confidence: "high",
      },
    },
  ],
  summary: {
    totalRecommendations: 1,
    highConfidenceCount: 1,
    mediumConfidenceCount: 0,
    lowConfidenceCount: 0,
    regulationsCovered: ["CSRD", "DPP"],
    estimatedImplementationEffort: "medium",
  },
  epistemic: {
    status: "fact",
    confidence: "high",
  },
  generatedAt: "2026-03-06T12:00:00.000Z",
  decisionArtifact: {
    artifactVersion: "1.0",
    artifactType: "attribute_recommendation",
    capability: "ESRS_MAPPING",
    generatedAt: "2026-03-06T12:00:00.000Z",
    confidence: {
      level: "high",
      score: 0.82,
      basis: "Recommendation grounded in mapped ESRS requirements and GS1 attribute coverage.",
      reviewRecommended: false,
      uncertaintyClass: "decision_grade",
      escalationAction: "none",
    },
    evidence: {
      codePaths: ["server/routers/attribute-recommender.ts"],
      dataSources: ["gs1_attribute_esrs_mapping", "regulations"],
    },
    summary: {
      topRecommendationIds: ["productCarbonFootprint"],
      totalRecommendations: 1,
      regulationsCovered: ["CSRD", "DPP"],
    },
  },
};

describe("AttributeRecommender", () => {
  const mutateSpy = vi.fn();

  beforeEach(() => {
    mockGetAvailableSectors.mockReset();
    mockGetAvailableRegulations.mockReset();
    mockGetCompanySizeOptions.mockReset();
    mockGetSampleAttributes.mockReset();
    mockRecommend.mockReset();

    mockGetAvailableSectors.mockReturnValue({
      data: [
        {
          id: "food_beverage",
          name: "Food & Beverage",
          description: "Food products, beverages, and related packaging",
        },
      ],
      isLoading: false,
    });

    mockGetAvailableRegulations.mockReturnValue({
      data: [
        {
          id: "CSRD",
          name: "Corporate Sustainability Reporting Directive",
          shortName: "CSRD",
        },
        {
          id: "DPP",
          name: "Digital Product Passport",
          shortName: "DPP",
        },
      ],
      isLoading: false,
    });

    mockGetCompanySizeOptions.mockReturnValue({
      data: [
        { id: "small", name: "Small Enterprise", description: "Less than 50 employees" },
        { id: "medium", name: "Medium Enterprise", description: "50-250 employees" },
      ],
      isLoading: false,
    });

    mockGetSampleAttributes.mockReturnValue({
      data: [
        {
          id: "gtin",
          name: "GTIN (Global Trade Item Number)",
          category: "Identification",
        },
        {
          id: "productCarbonFootprint",
          name: "Product Carbon Footprint",
          category: "Sustainability",
        },
      ],
      isLoading: false,
    });

    mockRecommend.mockReturnValue({
      mutate: mutateSpy,
      isPending: false,
      data: undefined,
    });

    mutateSpy.mockReset();
  });

  it("renders provenance help text and sourcing-aware selector descriptions", () => {
    render(<AttributeRecommender />);

    expect(screen.getByText(/inventory sources:/i)).not.toBeNull();
    expect(
      screen.getByText(/sectors use ISA's curated taxonomy for readable labels/i)
    ).not.toBeNull();
    expect(
      screen.getByText(/regulation choices come from the current ISA regulation catalog/i)
    ).not.toBeNull();
    expect(
      screen.getByText(/current attributes come from ESRS-to-GS1 mapping coverage/i)
    ).not.toBeNull();

    expect(
      screen.getByText(/select your industry sector from ISA's curated decision-core taxonomy/i)
    ).not.toBeNull();
    expect(
      screen.getByText(/select regulations from the current ISA regulation inventory/i)
    ).not.toBeNull();
    expect(
      screen.getByText(/select attributes from the current ESRS-to-GS1 mapping inventory/i)
    ).not.toBeNull();
  });

  it("renders representative selector content on the happy path", () => {
    render(<AttributeRecommender />);

    expect(screen.getAllByRole("heading", { name: /GS1 Attribute Recommender/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("CSRD").length).toBeGreaterThan(0);
    expect(screen.getAllByText("DPP").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Identification").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sustainability").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/GTIN \(Global Trade Item Number\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/Product Carbon Footprint/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: /Generate Recommendations/i }).length
    ).toBeGreaterThan(0);
  });

  it("supports a minimal selector flow and keeps the recommendation CTA enabled", async () => {
    const user = userEvent.setup();

    render(<AttributeRecommender />);

    const generateButtons = screen.getAllByRole("button", {
      name: /Generate Recommendations/i,
    });
    const primaryGenerateButton = generateButtons[0] as HTMLButtonElement;

    expect(primaryGenerateButton.disabled).toBe(true);

    const sectorCombobox = screen.getAllByRole("combobox")[0];
    await user.click(sectorCombobox);
    await user.click(screen.getAllByText("Food & Beverage")[0]!);

    await user.click(screen.getAllByLabelText("CSRD")[0]!);
    await user.click(screen.getAllByLabelText(/GTIN \(Global Trade Item Number\)/i)[0]!);

    expect(primaryGenerateButton.disabled).toBe(false);

    await user.click(primaryGenerateButton);

    expect(mutateSpy).toHaveBeenCalledWith({
      sector: "food_beverage",
      companySize: "",
      targetRegulations: ["CSRD"],
      currentAttributes: ["gtin"],
    });
  });

  it("renders a stable recommendation result state with decision-core trust signals", async () => {
    const user = userEvent.setup();

    mockRecommend.mockReturnValueOnce({
      mutate: mutateSpy,
      isPending: false,
      data: mockRecommendationResult,
    });

    render(<AttributeRecommender />);

    expect(screen.getByText("Recommendation Summary")).not.toBeNull();
    expect(screen.getByText("Decision Core Artifact")).not.toBeNull();
    expect(
      screen.getByText(
        "Recommendation grounded in mapped ESRS requirements and GS1 attribute coverage."
      )
    ).not.toBeNull();
    expect(screen.getAllByText("Product Carbon Footprint").length).toBeGreaterThan(0);
    expect(screen.getByText(/Regulations covered:/i)).not.toBeNull();
    expect(screen.getAllByText("CSRD").length).toBeGreaterThan(0);
    expect(screen.getAllByText("DPP").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /Product Carbon Footprint/i }));

    expect(screen.getByText(/Recommendation Rationale/i)).not.toBeNull();
    expect(
      screen.getByText(
        "This attribute directly supports priority ESRS climate datapoints and downstream DPP readiness."
      )
    ).not.toBeNull();
    expect(screen.getByText(/Epistemic status:/i)).not.toBeNull();
  });
});
