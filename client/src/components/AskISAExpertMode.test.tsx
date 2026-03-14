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
        decisionSummary: {
          summary:
            "Primary basis: CSRD. Supporting context: GS1 Digital Link.",
          evidenceChoice:
            "CSRD leads because it is the binding regulation basis, while GS1 Digital Link remains supporting implementation guidance.",
          freshnessSummary:
            "CSRD is the current evidence-ready basis in the live corpus, with GS1 Digital Link kept as fresh supporting implementation guidance.",
          conflictSummary:
            "If GS1 guidance and regulation wording diverge, treat the regulation as binding and use the GS1 material as supporting implementation guidance only.",
          nextStep:
            "Use CSRD to set the binding requirement baseline, then apply GS1 Digital Link for GS1 implementation details.",
          primaryEvidence: [
            {
              title: "CSRD",
              sourceType: "regulation",
              sourceRole: "normative_authority",
              authorityTier: "EU",
              evidenceReady: true,
              needsVerification: false,
              reasons: ["top-ranked decision basis", "normative authority"],
            },
          ],
          supportingEvidence: [
            {
              title: "GS1 Digital Link",
              sourceType: "gs1_standard",
              sourceRole: "normative_authority",
              authorityTier: "GS1_Global",
              evidenceReady: true,
              needsVerification: false,
              reasons: ["supporting implementation guidance"],
            },
          ],
          cautionFlags: [
            "Use normative regulations as the binding basis and GS1 standards as implementation guidance unless the regulation explicitly adopts the GS1 construct.",
          ],
        },
        gapTrigger: {
          requested: true,
          activated: true,
          mode: "auto",
          reason: "Gap analysis auto-activated from the strongest regulation match: CSRD.",
          regulationId: 1,
          regulationTitle: "CSRD",
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
            sourceRole: "canonical_technical_artifact",
            authorityTier: "EFRAG",
            evidenceRole: "primary",
            selectionReasons: [
              "top-ranked decision basis",
              "canonical technical source",
            ],
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
    expect(screen.getAllByText(/GS1 Digital Link/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/^Canonical Facts$/i)).not.toBeNull();
    expect(screen.getByText(/ke:fixture-esrs-e1-6:hash/i)).not.toBeNull();
    expect(screen.getByText(/^Decision Basis$/i)).not.toBeNull();
    expect(screen.getByText(/Why this source won/i)).not.toBeNull();
    expect(screen.getByText(/Freshness posture/i)).not.toBeNull();
    expect(screen.getByText(/Conflict posture/i)).not.toBeNull();
    expect(screen.getByText(/Recommended next step/i)).not.toBeNull();
    expect(screen.getByText(/^Gap Trigger$/i)).not.toBeNull();
    expect(screen.getAllByText(/normative_authority/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Evidence Sources/i)).not.toBeNull();
    expect(
      screen.getByText(/ESRS E1-6 Gross Scope 1, 2, and 3 emissions/i)
    ).not.toBeNull();
  });
});
