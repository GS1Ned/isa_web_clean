import { describe, expect, it, vi } from "vitest";

import type { TrpcContext } from "../_core/context";

const invokeLLMMock = vi.fn();
const getAllEsrsGs1MappingsMock = vi.fn();
const collectEvidenceRefsForTermsMock = vi.fn();

vi.mock("../_core/llm", () => ({
  invokeLLM: invokeLLMMock,
}));

vi.mock("../db-esrs-gs1-mapping", () => ({
  getAllEsrsGs1Mappings: getAllEsrsGs1MappingsMock,
}));

vi.mock("../source-provenance.js", () => ({
  collectEvidenceRefsForTerms: collectEvidenceRefsForTermsMock,
}));

vi.mock("../_core/logger-wiring", () => ({
  serverLogger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

const mockPublicContext: TrpcContext = {
  user: null,
  req: {} as any,
  res: {} as any,
  traceId: "test-trace-id",
};

describe("esrsRoadmapRouter", () => {
  it("returns a roadmap with a stable decision artifact envelope", async () => {
    const { esrsRoadmapRouter } = await import("./esrs-roadmap.js");

    collectEvidenceRefsForTermsMock.mockResolvedValue([
      {
        sourceChunkId: 3001,
        evidenceKey: "ke:3001:hash",
        citationLabel: "ESRS E1 — Climate Change",
        sourceLocator: "https://example.com/esrs-e1",
      },
    ]);

    getAllEsrsGs1MappingsMock.mockResolvedValue([
      {
        esrsStandard: "ESRS E1",
        esrs_topic: "Climate Change",
        data_point_name: "GHG emissions",
        gs1_relevance: "high",
        source_document: "test-source",
      },
    ]);

    invokeLLMMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              summary: "Prioritised roadmap for climate and circularity requirements.",
              totalDuration: "12 months",
              phases: [
                {
                  id: "phase-1",
                  title: "Foundation",
                  description: "Build the data baseline.",
                  timeframe: "quick_win",
                  duration: "1-3 months",
                  priority: "critical",
                  gs1Attributes: ["gtin"],
                  esrsRequirements: ["ESRS E1"],
                  implementationSteps: ["Assign GTINs"],
                  dependencies: [],
                  estimatedEffort: "Low",
                  expectedOutcome: "Trusted product identifiers in place",
                },
              ],
            }),
          },
        },
      ],
    });

    const caller = esrsRoadmapRouter.createCaller(mockPublicContext);
    const result = await caller.generate({
      sector: "electronics",
      esrsRequirements: ["ESRS E1"],
      companySize: "large",
      currentMaturity: "beginner",
    });

    expect(result.decisionArtifact).toBeDefined();
    expect(result.decisionArtifact.artifactType).toBe("roadmap");
    expect(result.decisionArtifact.capability).toBe("ESRS_MAPPING");
    expect(result.decisionArtifact.summary.phaseCount).toBe(1);
    expect(result.decisionArtifact.summary.mappingCount).toBe(1);
    expect(result.decisionArtifact.confidence.level).toBe("medium");
    expect(result.decisionArtifact.confidence.reviewRecommended).toBe(true);
    expect(result.decisionArtifact.confidence.uncertaintyClass).toBe("review_required");
    expect(result.decisionArtifact.confidence.escalationAction).toBe("analyst_review");
    expect(result.decisionArtifact.evidence.evidenceRefs?.[0]?.evidenceKey).toBe(
      "ke:3001:hash"
    );
  });

  it("falls back to a deterministic roadmap and still emits a decision artifact", async () => {
    const { esrsRoadmapRouter } = await import("./esrs-roadmap.js");

    getAllEsrsGs1MappingsMock.mockResolvedValue([
      {
        esrsStandard: "ESRS E5",
        esrs_topic: "Circular Economy",
        data_point_name: "Material circularity",
        gs1_relevance: "high",
        source_document: "test-source",
        short_name: "Circularity",
      },
    ]);

    invokeLLMMock.mockRejectedValue(new Error("LLM unavailable"));

    const caller = esrsRoadmapRouter.createCaller(mockPublicContext);
    const result = await caller.generate({
      sector: "retail",
      esrsRequirements: ["ESRS E5"],
      companySize: "sme",
      currentMaturity: "beginner",
    });

    expect(result.phases.length).toBeGreaterThan(0);
    expect(result.decisionArtifact.artifactType).toBe("roadmap");
    expect(result.decisionArtifact.confidence.level).toBe("medium");
    expect(result.decisionArtifact.confidence.reviewRecommended).toBe(true);
    expect(result.decisionArtifact.confidence.uncertaintyClass).toBe("review_required");
    expect(result.decisionArtifact.confidence.escalationAction).toBe("analyst_review");
    expect(result.decisionArtifact.summary.topPhaseIds[0]).toBe("phase-1");
  });
});
