import { describe, expect, it } from "vitest";

import {
  buildAdvisoryExplorerModel,
  normalizeExplorerRecommendation,
} from "./advisory-explorer";

describe("advisory-explorer", () => {
  it("normalizes advisory explorer model from mixed advisory payloads", () => {
    const result = buildAdvisoryExplorerModel({
      mappingResults: [
        {
          id: "legacy-mapping-1",
          topic: "Unique product identifier",
          regulationStandard: "DPP",
          gs1Attribute: "GTIN",
          sectors: ["All"],
          confidence: "direct",
          rationale: "Mapped directly.",
        },
      ],
      gapAnalysis: [
        {
          id: "legacy-gap-1",
          topic: "Supplier due diligence evidence",
          severity: "critical",
          description: "Gap still open.",
          sectors: ["FMCG"],
        },
      ],
      recommendations: [
        {
          id: "legacy-rec-1",
          title: "Capture supplier evidence",
          timeframe: "3-6 months",
          category: "data_model",
          estimatedEffort: "medium",
        },
      ],
    });

    expect(result.mappings[0]).toMatchObject({
      mappingId: "legacy-mapping-1",
      regulationDatapoint: "Unique product identifier",
      regulationStandard: "DPP",
    });
    expect(result.gaps[0]).toMatchObject({
      gapId: "legacy-gap-1",
      category: "critical",
      affectedSectors: ["FMCG"],
    });
    expect(result.recommendations[0]).toMatchObject({
      recommendationId: "legacy-rec-1",
      timeframe: "medium-term",
    });
  });

  it("normalizes recommendation timeframe buckets for explorer filters", () => {
    const result = normalizeExplorerRecommendation(
      {
        recommendationId: "REC-001",
        title: "Document attribute semantics",
        timeframe: "12-18 months",
      },
      0,
    );

    expect(result.timeframe).toBe("long-term");
  });
});
