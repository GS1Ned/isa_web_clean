import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { readJson } = require("../scripts/eval/lib/common.cjs");
const { evaluate: evaluateKnowledgeBase } = require("../scripts/eval/adapters/knowledge-base.cjs");
const { evaluate: evaluateAskIsa } = require("../scripts/eval/adapters/ask-isa.cjs");
const { evaluate: evaluateEsrsMapping } = require("../scripts/eval/adapters/esrs-mapping.cjs");
const { evaluate: evaluateAdvisory } = require("../scripts/eval/adapters/advisory.cjs");

function getRegistryEntry(capability: string) {
  const registry = readJson("data/evaluation/golden/registry.json");
  return registry.capabilities.find((entry: { capability: string }) => entry.capability === capability);
}

function getStageDatasets(registryEntry: { fixture_tiers: Record<string, string[]>; datasets: Array<{ id: string }> }, stage: string) {
  const ids = new Set(registryEntry.fixture_tiers[stage] || []);
  return registryEntry.datasets.filter((dataset: { id: string }) => ids.has(dataset.id));
}

describe("Phase 1 capability evaluation extensions", () => {
  const thresholds = readJson("docs/quality/thresholds/isa-capability-thresholds.json");
  const stage = "stage_b";
  const thresholdsByMetric = thresholds.stages[stage].metrics;

  it("adds retrieval and provenance starter metrics for KNOWLEDGE_BASE", async () => {
    const registryEntry = getRegistryEntry("KNOWLEDGE_BASE");
    const evaluated = await evaluateKnowledgeBase({
      registryEntry,
      datasets: getStageDatasets(registryEntry, stage),
      stage,
      fixtureVersion: "v2",
      thresholdsByMetric,
    });

    const top3Metric = evaluated.metrics.find(
      (metric: { metric_id: string }) => metric.metric_id === "kb.retrieval.top3_hit_rate"
    );
    const top1Metric = evaluated.metrics.find(
      (metric: { metric_id: string }) => metric.metric_id === "kb.retrieval.top1_relevance"
    );
    const missingDetectionMetric = evaluated.metrics.find(
      (metric: { metric_id: string }) => metric.metric_id === "kb.provenance.missing_detection"
    );

    expect(top1Metric?.value).toBeGreaterThanOrEqual(0.8);
    expect(top3Metric?.value).toBeGreaterThanOrEqual(0.8);
    expect(missingDetectionMetric?.value).toBe(1);
    expect(evaluated.datasetIds).toContain("kb_retrieval_quality_v2");
  });

  it("adds abstention, provenance, and unsupported-answer metrics for ASK_ISA", async () => {
    const registryEntry = getRegistryEntry("ASK_ISA");
    const evaluated = await evaluateAskIsa({
      registryEntry,
      datasets: getStageDatasets(registryEntry, stage),
      stage,
      fixtureVersion: "v2",
      thresholdsByMetric,
      runId: "phase1-ask-isa-test",
    });

    const abstentionMetric = evaluated.metrics.find(
      (metric: { metric_id: string }) => metric.metric_id === "ask.abstention.correctness"
    );
    const unsupportedMetric = evaluated.metrics.find(
      (metric: { metric_id: string }) => metric.metric_id === "ask.unsupported_answer_rate"
    );

    expect(abstentionMetric?.value).toBe(1);
    expect(unsupportedMetric?.value).toBe(0);
    expect(evaluated.datasetIds).toContain("ask_isa_quality_v2");
  });

  it("adds decision-quality posture metrics for ESRS_MAPPING", async () => {
    const registryEntry = getRegistryEntry("ESRS_MAPPING");
    const evaluated = await evaluateEsrsMapping({
      registryEntry,
      datasets: getStageDatasets(registryEntry, stage),
      stage,
      fixtureVersion: "v2",
      thresholdsByMetric,
    });

    const applicabilityMetric = evaluated.metrics.find(
      (metric: { metric_id: string }) => metric.metric_id === "esrs.mapping.applicability_correctness"
    );
    const uncertaintyMetric = evaluated.metrics.find(
      (metric: { metric_id: string }) => metric.metric_id === "esrs.mapping.uncertainty_handling"
    );

    expect(applicabilityMetric?.value).toBe(1);
    expect(uncertaintyMetric?.value).toBe(1);
    expect(evaluated.datasetIds).toContain("esrs_mapping_decision_cases_v2");
  });

  it("adds advisory provenance and actionability metrics", async () => {
    const registryEntry = getRegistryEntry("ADVISORY");
    const evaluated = await evaluateAdvisory({
      registryEntry,
      datasets: getStageDatasets(registryEntry, stage),
      stage,
      fixtureVersion: "v2",
      thresholdsByMetric,
    });

    const provenanceMetric = evaluated.metrics.find(
      (metric: { metric_id: string }) => metric.metric_id === "advisory.provenance.traceability"
    );
    const actionabilityMetric = evaluated.metrics.find(
      (metric: { metric_id: string }) => metric.metric_id === "advisory.actionability.coverage"
    );

    expect(provenanceMetric?.value).toBeGreaterThanOrEqual(0.5);
    expect(actionabilityMetric?.value).toBe(1);
    expect(evaluated.datasetIds).toContain("advisory_quality_cases_v2");
  });
});
