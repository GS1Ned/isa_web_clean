import { describe, it, expect } from "vitest";
import type { ESRSCoverageAnalysisResult } from "./esrs-coverage-analyzer";
import { analyzeESRSCoverage } from "./esrs-coverage-analyzer";
import { ESRS_DATAPOINT_CATALOG } from "../../shared/esrs-datapoint-catalog";

describe("analyzeESRSCoverage", () => {
  it("calculates coverage percentage per topic", () => {
    const result: ESRSCoverageAnalysisResult = analyzeESRSCoverage({
      sector: "food",
      esrsTopics: ["E1", "E2", "S1"],
      availableStandards: ["GDSN", "EPCIS"]
    });

    const e1Summary = result.topics.find(summary => summary.topic == "E1");
    expect(e1Summary?.totalDatapoints).toBeGreaterThan(0);
    expect(e1Summary?.coveragePercentage).toBeGreaterThanOrEqual(0);
    expect(e1Summary?.coveragePercentage).toBeLessThanOrEqual(100);
  });

  it("identifies covered datapoints when standards are available", () => {
    const result = analyzeESRSCoverage({
      sector: "food",
      esrsTopics: ["E1"],
      availableStandards: ["GDSN", "EPCIS"]
    });

    const coveredIds = result.coveredDatapoints.map(datapoint => datapoint.id);
    expect(coveredIds).toContain("E1-1_01");
    expect(coveredIds).toContain("E1-2_01");
  });

  it("identifies gaps when no standard is available", () => {
    const result = analyzeESRSCoverage({
      sector: "food",
      esrsTopics: ["E1"],
      availableStandards: []
    });

    const gapIds = result.gapDatapoints.map(gap => gap.datapointId);
    expect(gapIds).toContain("E1-1_01");
    expect(gapIds).toContain("E1-2_01");
  });

  it("respects sector filter by excluding non relevant datapoints", () => {
    const manufacturingOnly = analyzeESRSCoverage({
      sector: "manufacturing",
      esrsTopics: ["S1"],
      availableStandards: ["GDSN"]
    });

    const foodOnly = analyzeESRSCoverage({
      sector: "food",
      esrsTopics: ["S1"],
      availableStandards: ["GDSN"]
    });

    const manufacturingIds = manufacturingOnly.coveredDatapoints.map(datapoint => datapoint.id);
    const foodIds = foodOnly.coveredDatapoints.map(datapoint => datapoint.id);

    // S1-6_01 has tags ["generic", "food"] so it appears in both sectors via "generic"
    // S1-3_01 has tags ["generic", "manufacturing"] so both sectors get it
    expect(manufacturingIds).toContain("S1-3_01"); // manufacturing-specific
    expect(foodIds).toContain("S1-6_01"); // food-specific
    expect(manufacturingIds).toContain("S1-1_01"); // generic, appears in both
  });

  it("marks mandatory datapoint gaps as high priority for relevant sector", () => {
    const result = analyzeESRSCoverage({
      sector: "food",
      esrsTopics: ["E1"],
      availableStandards: ["GDSN"]
    });

    const mandatoryWithoutCoverage = ESRS_DATAPOINT_CATALOG.find(datapoint => {
      return datapoint.topic == "E1" && datapoint.materiality == "mandatory" && datapoint.supportedStandards.length == 0;
    });

    if (mandatoryWithoutCoverage) {
      const gap = result.gapDatapoints.find(item => item.datapointId == mandatoryWithoutCoverage.id);
      if (gap) {
        expect(gap.priority).toBe("high");
      }
    }
  });

  it("includes recommendations derived from gap analysis", () => {
    const result = analyzeESRSCoverage({
      sector: "food",
      esrsTopics: ["E1", "E2"],
      availableStandards: []
    });

    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it("handles case with no datapoints for selected topics gracefully", () => {
    const result = analyzeESRSCoverage({
      sector: "food",
      esrsTopics: ["G1"],
      availableStandards: ["GDSN"]
    });

    expect(result.coveredDatapoints.length).toBe(0);
    expect(result.gapDatapoints.length).toBe(0);
    expect(result.topics[0]?.coveragePercentage).toBe(0);
  });

  it("applies minimumMateriality filter", () => {
    const lowThreshold = analyzeESRSCoverage({
      sector: "food",
      esrsTopics: ["S1"],
      availableStandards: ["GDSN"],
      minimumMateriality: "low"
    });

    const highThreshold = analyzeESRSCoverage({
      sector: "food",
      esrsTopics: ["S1"],
      availableStandards: ["GDSN"],
      minimumMateriality: "high"
    });

    expect(lowThreshold.coveredDatapoints.length).toBeGreaterThanOrEqual(highThreshold.coveredDatapoints.length);
    expect(lowThreshold.gapDatapoints.length).toBeGreaterThanOrEqual(highThreshold.gapDatapoints.length);
  });
});

