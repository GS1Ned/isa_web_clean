import { describe, expect, it } from "vitest";

import {
  buildAdvisoryCompatibilityPayloads,
  filterAdvisoryCompatibilityPayloads,
} from "./advisory-compat";

describe("advisory-compat", () => {
  it("derives covered regulations from normalized advisory content when legacy arrays are absent", () => {
    const payloads = buildAdvisoryCompatibilityPayloads({
      mappingResults: [
        { regulationStandard: "ESRS E1", confidence: "direct", sectors: ["All"] },
        { regulationStandard: "DPP", confidence: "partial", sectors: ["All"] },
      ],
      gapAnalysis: [
        { regulationStandard: "ESRS S1", severity: "moderate", sectors: ["All"] },
      ],
    });

    expect(payloads.regulations).toEqual([
      expect.objectContaining({ name: "ESRS E1" }),
      expect.objectContaining({ name: "DPP" }),
      expect.objectContaining({ name: "ESRS S1" }),
    ]);
  });

  it("keeps compatibility filters centralized for mappings, gaps, and recommendations", () => {
    const payloads = buildAdvisoryCompatibilityPayloads({
      mappingResults: [
        { regulationStandard: "DPP", confidence: "direct", sectors: ["All"] },
        { regulationStandard: "ESRS E1", confidence: "partial", sectors: ["DIY"] },
      ],
      gapAnalysis: [
        { severity: "critical", sectors: ["DIY"] },
        { severity: "moderate", sectors: ["All"] },
      ],
      recommendations: [
        { timeframe: "short-term", category: "strategic", implementationStatus: "proposed" },
        { timeframe: "long-term", category: "data_model", implementationStatus: "completed" },
      ],
    });

    const filtered = filterAdvisoryCompatibilityPayloads(payloads, {
      sector: "DIY",
      confidence: "partial",
      severity: "critical",
      timeframe: "short-term",
    });

    expect(filtered.mappings).toHaveLength(1);
    expect(filtered.mappings[0]).toMatchObject({ regulationStandard: "ESRS E1" });
    expect(filtered.gaps).toHaveLength(1);
    expect(filtered.gaps[0]).toMatchObject({ category: "critical" });
    expect(filtered.recommendations).toHaveLength(1);
    expect(filtered.recommendations[0]).toMatchObject({ timeframe: "short-term" });
  });
});
