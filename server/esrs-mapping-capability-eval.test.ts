import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { readJson } = require("../scripts/eval/lib/common.cjs");
const { evaluate } = require("../scripts/eval/adapters/esrs-mapping.cjs");

describe("ESRS mapping capability adapter", () => {
  it("reports negative-case coverage from the gold-set registry", async () => {
    const registry = readJson("data/evaluation/golden/registry.json");
    const thresholds = readJson("docs/quality/thresholds/isa-capability-thresholds.json");
    const registryEntry = registry.capabilities.find(
      (entry: { capability: string }) => entry.capability === "ESRS_MAPPING"
    );
    const datasets = registryEntry.datasets.filter((dataset: { id: string }) =>
      ["esrs_mapping_gold_v1", "esrs_mapping_negative_v1"].includes(dataset.id)
    );

    const evaluated = await evaluate({
      registryEntry,
      datasets,
      stage: "stage_a",
      fixtureVersion: "v1",
      thresholdsByMetric: thresholds.stages.stage_a.metrics,
    });

    const negativeMetric = evaluated.metrics.find(
      (metric: { metric_id: string }) => metric.metric_id === "esrs.mapping.negative_case_coverage"
    );

    expect(negativeMetric).toBeTruthy();
    expect(negativeMetric.value).toBe(1);
    expect(evaluated.datasetIds).toContain("esrs_mapping_negative_v1");
    expect(evaluated.sampleCount).toBeGreaterThan(20);
    expect(evaluated.rollups.coverage).toBeGreaterThanOrEqual(0.9);
    expect(evaluated.diagnostics.benchmark_mix.direct_case_count).toBeGreaterThan(0);
    expect(evaluated.diagnostics.benchmark_mix.partial_case_count).toBeGreaterThan(0);
    expect(evaluated.diagnostics.benchmark_mix.no_mapping_case_count).toBe(4);
    expect(evaluated.diagnostics.regulation_breakdown.negative["ESRS S1"]).toBe(2);
    expect(evaluated.diagnostics.decision_posture.total_case_count).toBe(evaluated.sampleCount);
    expect(evaluated.diagnostics.decision_posture.decision_grade_count).toBe(
      evaluated.diagnostics.benchmark_mix.direct_case_count
    );
    expect(evaluated.diagnostics.decision_posture.review_required_count).toBe(
      evaluated.diagnostics.benchmark_mix.partial_case_count
    );
    expect(evaluated.diagnostics.decision_posture.insufficient_evidence_count).toBe(
      evaluated.diagnostics.benchmark_mix.no_mapping_case_count
    );
    expect(evaluated.diagnostics.decision_posture.review_recommended_count).toBe(
      evaluated.diagnostics.decision_posture.review_required_count +
        evaluated.diagnostics.decision_posture.insufficient_evidence_count
    );
    expect(evaluated.diagnostics.decision_posture.human_review_required_share).toBeGreaterThan(0);
  });
});
