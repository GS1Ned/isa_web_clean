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
  });
});
