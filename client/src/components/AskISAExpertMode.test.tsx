import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AskISAExpertMode } from "./AskISAExpertMode";

const mockAskEnhanced = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    askISAV2: {
      askEnhanced: {
        useMutation: (...args: unknown[]) => mockAskEnhanced(...args),
      },
    },
  },
}));

vi.mock("streamdown", () => ({
  Streamdown: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("AskISAExpertMode", () => {
  beforeEach(() => {
    mockAskEnhanced.mockReset();
    mockAskEnhanced.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
    });
  });

  it("renders the expert answer surface with structured context and evidence cards", () => {
    mockAskEnhanced.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: {
        answer:
          "Only partially. ESRS E1-6 can be supported through GS1-linked emissions attributes, but the current mappings still rely on proxy coverage for some disclosure elements.",
        queryIntent: "ESRS_MAPPING",
        retrievalProfile: {
          strategy: "mapping-and-implementation-first",
          guidance:
            "Explain direct mappings, proxy mappings, and no-coverage cases separately.",
        },
        confidence: {
          level: "medium",
          score: 0.65,
          sourceCount: 2,
        },
        authority: {
          score: 0.88,
          level: "verified",
          breakdown: {
            official: 0,
            verified: 2,
            guidance: 1,
            industry: 0,
            community: 0,
          },
        },
        explainers: {
          whatIsIt: "ESRS E1-6 covers greenhouse gas emissions disclosures.",
          whenToUse:
            "Use this guidance when your question touches ESRS E1 and GS1 standards.",
          howToValidate:
            "Validate against citation evidence key ke:fixture-esrs-e1-6.",
          whatChanged: "ESRS E1 lifecycle status: active.",
          relatedStandards: ["ESRS E1", "GS1 EPCIS"],
        },
        gapAnalysis: {
          regulation: "CSRD",
          coveragePercentage: 61,
          gapCount: 3,
          recommendations: [
            "Prioritize verified product-level emissions attributes.",
          ],
        },
        mappingContext: {
          hasSignals: true,
          regulationMappings: [
            {
              regulationId: 1,
              regulationName: "CSRD",
              esrsDatapointId: "E1-6",
              relevanceScore: 0.93,
            },
          ],
          gs1Mappings: [
            {
              standardId: 9,
              standardName: "GS1 Digital Link",
              esrsStandard: "ESRS E1-6",
              coverageType: "partial",
            },
          ],
        },
        inlineRecommendations: [
          {
            esrsStandard: "ESRS E1-6",
            mappings: [
              {
                shortName: "Product Carbon Footprint",
                gs1Relevance: "Supports emissions disclosure at item level.",
                effectiveConfidence: "high",
                decayReason: null,
              },
            ],
          },
        ],
        facts: [
          {
            id: 1,
            subject: "ESRS E1-6",
            predicate: "references_standard",
            objectValue: "ESRS E1",
            evidenceKey: "ke:fixture-esrs-e1-6:hash",
          },
        ],
        sources: [
          {
            id: 1,
            title: "ESRS E1-6 Gross Scope 1, 2, and 3 emissions",
            sourceType: "esrs_datapoint",
            authorityLevel: "authoritative",
            uiAuthorityLevel: "verified",
            similarity: 84,
            url: "https://example.com/esrs-e1-6",
            evidenceKey: "ke:fixture-esrs-e1-6:hash",
            needsVerification: false,
          },
        ],
      },
    });

    render(<AskISAExpertMode />);

    expect(screen.getByText(/Expert Ask ISA/i)).not.toBeNull();
    expect(screen.getByText(/ESRS Mapping/i)).not.toBeNull();
    expect(
      screen.getByText(/mapping-and-implementation-first/i)
    ).not.toBeNull();
    expect(screen.getByText(/Inline GS1 Recommendations/i)).not.toBeNull();
    expect(screen.getByText(/Product Carbon Footprint/i)).not.toBeNull();
    expect(screen.getByText(/Structured Context/i)).not.toBeNull();
    expect(screen.getAllByText(/^CSRD$/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/GS1 Digital Link/i)).not.toBeNull();
    expect(screen.getByText(/^Canonical Facts$/i)).not.toBeNull();
    expect(screen.getByText(/ke:fixture-esrs-e1-6:hash/i)).not.toBeNull();
    expect(screen.getByText(/Evidence Sources/i)).not.toBeNull();
    expect(
      screen.getByText(/ESRS E1-6 Gross Scope 1, 2, and 3 emissions/i)
    ).not.toBeNull();
  });
});
