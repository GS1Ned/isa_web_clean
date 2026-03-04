import { describe, expect, it, vi, beforeEach } from "vitest";
import type { TrpcContext } from "../_core/context";
import * as dbModule from "../db.js";

vi.mock("../db.js", () => ({
  getDb: vi.fn(),
}));

const mockPublicContext: TrpcContext = {
  user: null,
  req: {} as any,
  res: {} as any,
  traceId: "test-trace-id",
};

describe("gapAnalyzerRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("emits a low-confidence decision artifact when coverage relies on weak mappings", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const mockDb = {
      execute: vi
        .fn()
        .mockResolvedValueOnce([
          [
            {
              mapping_id: 1,
              level: "topic",
              esrs_standard: "ESRS E1",
              esrs_topic: "Climate Change",
              data_point_name: "GHG emissions",
              short_name: "E1-1",
              definition: "Disclose GHG emissions.",
              gs1_relevance: "high",
              gs1_attribute_id: "productCarbonFootprint",
              gs1_attribute_name: "Product Carbon Footprint",
              mapping_type: "direct",
              mapping_notes: "Use existing carbon footprint field",
              confidence: "low",
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.analyze({
      sector: "general",
      companySize: "large",
      currentGs1Coverage: [],
    });

    expect(result.summary.gaps).toBe(1);
    expect(result.criticalGaps).toHaveLength(0);
    expect(result.highGaps).toHaveLength(1);
    expect(result.decisionArtifact.artifactType).toBe("gap_analysis");
    expect(result.decisionArtifact.confidence.level).toBe("low");
    expect(result.decisionArtifact.confidence.reviewRecommended).toBe(true);
    expect(result.decisionArtifact.confidence.uncertaintyClass).toBe(
      "insufficient_evidence"
    );
    expect(result.decisionArtifact.confidence.escalationAction).toBe(
      "human_review_required"
    );
  });
});
