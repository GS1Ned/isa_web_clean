import { describe, expect, it } from "vitest";

import { buildAdvisoryReadModel } from "./advisory-read-model";

describe("advisory-read-model", () => {
  it("normalizes advisory summary to a stable compatibility shape", async () => {
    const result = await buildAdvisoryReadModel();

    expect(result.summary.mappingResults.total).toBeGreaterThan(0);
    expect(result.summary.mappingResults.byConfidence.direct).toBeTypeOf("number");
    expect(result.summary.gaps.bySeverity.critical).toBeTypeOf("number");
    expect(result.summary.recommendations.byTimeframe["short-term"]).toBeTypeOf("number");
    expect(result.summary.stats.totalMappings).toBeTypeOf("number");
    expect(result.summary.statistics.totalMappings).toBeTypeOf("number");
    expect(result.summary.migrationState.normalizedVersion).toMatch(/^v\d+\.\d+/);
  });

  it("normalizes advisory full payload for current hub consumers", async () => {
    const result = await buildAdvisoryReadModel();

    expect(Array.isArray(result.advisory.mappingResults)).toBe(true);
    expect(result.advisory.mappingResults[0]).toHaveProperty("id");
    expect(result.advisory.mappingResults[0]).toHaveProperty("topic");
    expect(Array.isArray(result.advisory.gapAnalysis)).toBe(true);
    expect(result.advisory.gapAnalysis[0]).toHaveProperty("id");
    expect(result.advisory.gapAnalysis[0]).toHaveProperty("severity");
    expect(Array.isArray(result.advisory.recommendations)).toBe(true);
    expect(result.advisory.recommendations[0]).toHaveProperty("recommendationId");
    expect(result.advisory.recommendations[0]).toHaveProperty("timeframe");
  });

  it("exposes migration-aware metadata", async () => {
    const result = await buildAdvisoryReadModel();

    expect(result.metadata.traceabilityStatus === "complete" || result.metadata.traceabilityStatus === "partial").toBe(true);
    expect(result.metadata.migrationState.snapshotBackedReportCount).toBeTypeOf("number");
  });
});
