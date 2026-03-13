const fs = require("node:fs");
const {
  readJson,
  readJsonl,
  avg,
  safeDiv,
  clamp01,
  latencyNorm,
  selectDatasetByPrefix,
  hasMeaningfulValue,
  tokenizeText,
  fieldPresenceRatio,
  collectMissingFields,
} = require("../lib/common.cjs");
const { measureRuntimeProbe } = require("../lib/runtime-probes.cjs");

const CHECKSUM_RE = /^[a-f0-9]{64}$/;
const LOW_SIGNAL_PATH_TOKENS = new Set(["gs1", "ref", "org", "html", "http", "https", "www"]);

function retrievalText(row) {
  return [row?.id, row?.url, row?.file_path, row?.kind].filter(Boolean).join(" ");
}

function normalizedPathText(row) {
  return [row?.id, row?.url, row?.file_path]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[-_./:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function informativeQueryTokens(query) {
  return tokenizeText(query).filter((token) => !LOW_SIGNAL_PATH_TOKENS.has(token));
}

function lexicalScore(query, row) {
  const queryText = String(query || "").trim().toLowerCase();
  const queryTokens = informativeQueryTokens(queryText);
  if (!queryTokens.length) return 0;

  const rowText = retrievalText(row).toLowerCase();
  const rowTokens = new Set(tokenizeText(rowText));
  const pathText = normalizedPathText(row);
  const queryPhrase = queryTokens.join(" ");
  const rowPath = String(row?.file_path || row?.url || "");
  let score = queryText && rowText.includes(queryText) ? queryTokens.length : 0;

  for (const token of queryTokens) {
    if (rowTokens.has(token)) score += 1;
  }

  if (queryPhrase && pathText.includes(queryPhrase)) {
    score += queryTokens.length * 0.75;
  }

  if (rowPath.includes("/findings/") && !queryTokens.includes("findings")) {
    score -= 0.35;
  }

  if (rowText.includes("/archive")) score -= 0.25;
  if (rowText.endsWith("index.html")) score += 0.25;

  return score;
}

async function evaluate(context) {
  const { registryEntry, datasets, thresholdsByMetric, fixtureVersion } = context;
  const corpusDataset = selectDatasetByPrefix(datasets, "kb_corpus_slice_");
  const metadataDataset = selectDatasetByPrefix(datasets, "kb_metadata_gold_");
  const retrievalDataset = datasets.find((dataset) =>
    String(dataset.id || "").startsWith("kb_retrieval_quality_")
  );

  const corpusRows = readJsonl(corpusDataset.path);
  const metadataGold = readJson(metadataDataset.path);
  const requiredFields = Array.isArray(metadataGold.required_fields) ? metadataGold.required_fields : [];
  const retrievalPayload = retrievalDataset ? readJson(retrievalDataset.path) : null;
  const retrievalCases = Array.isArray(retrievalPayload?.cases) ? retrievalPayload.cases : [];
  const rowById = new Map(corpusRows.map((row) => [row.id, row]));

  const ingestionCorrectness = safeDiv(
    corpusRows.filter((row) => {
      return (
        typeof row.url === "string" &&
        row.url.startsWith("http") &&
        typeof row.file_path === "string" &&
        CHECKSUM_RE.test(String(row.checksum_sha256 || ""))
      );
    }).length,
    corpusRows.length,
    0
  );

  const metadataCompleteness = safeDiv(
    corpusRows.reduce((count, row) => {
      return (
        count +
        requiredFields.filter((field) => hasMeaningfulValue(row[field])).length
      );
    }, 0),
    corpusRows.length * Math.max(1, requiredFields.length),
    0
  );

  const chunkQuality = safeDiv(
    corpusRows.filter((row) => {
      return (
        hasMeaningfulValue(row.kind) &&
        hasMeaningfulValue(row.content_type) &&
        Array.isArray(row.intended_use) &&
        row.intended_use.length > 0
      );
    }).length,
    corpusRows.length,
    0
  );

  const linkingTarget = Number(metadataGold.linking_target_min || 2);
  const avgLinks = avg(corpusRows.map((row) => (Array.isArray(row.intended_use) ? row.intended_use.length : 0)));
  const linkingDensity = clamp01(safeDiv(avgLinks, linkingTarget, 0));

  const lifecycle = metadataGold.lifecycle || {};
  const lifecycleGovernance =
    hasMeaningfulValue(lifecycle.status) &&
    hasMeaningfulValue(lifecycle.cadence) &&
    typeof lifecycle.evidence === "string" &&
    fs.existsSync(lifecycle.evidence)
      ? 1
      : 0;

  const retrievalResults = retrievalCases.map((item) => {
    const expectedRow = rowById.get(item.expected_row_id);
    const topK = Number(item.top_k || 3);
    const ranked = [...corpusRows]
      .map((row) => ({
        row,
        score: lexicalScore(item.query, row),
      }))
      .sort((left, right) => right.score - left.score || String(left.row.id).localeCompare(String(right.row.id)));
    const topRows = ranked.slice(0, topK).map((entry) => entry.row);
    const topIds = topRows.map((row) => row.id);
    const expectedFields = Array.isArray(item.required_present_fields) ? item.required_present_fields : [];
    const expectedMissing = Array.isArray(item.expected_missing_fields) ? item.expected_missing_fields : [];
    const requiredUses = Array.isArray(item.required_intended_use) ? item.required_intended_use : [];
    const usefulContext = Boolean(
      expectedRow &&
        topIds.includes(item.expected_row_id) &&
        requiredUses.every((use) => Array.isArray(expectedRow.intended_use) && expectedRow.intended_use.includes(use))
    );

    return {
      top1_hit: topIds[0] === item.expected_row_id ? 1 : 0,
      topk_hit: topIds.includes(item.expected_row_id) ? 1 : 0,
      context_useful: usefulContext ? 1 : 0,
      provenance_completeness: fieldPresenceRatio(expectedRow || {}, expectedFields),
      missing_detection: safeDiv(
        collectMissingFields(expectedRow || {}, expectedMissing).length,
        expectedMissing.length,
        expectedMissing.length ? 0 : 1
      ),
    };
  });

  const retrievalTop1Relevance = Number(avg(retrievalResults.map((item) => item.top1_hit)).toFixed(4));
  const retrievalTopKHitRate = Number(avg(retrievalResults.map((item) => item.topk_hit)).toFixed(4));
  const contextUsefulness = Number(avg(retrievalResults.map((item) => item.context_useful)).toFixed(4));
  const provenanceCompleteness = Number(
    avg(retrievalResults.map((item) => item.provenance_completeness)).toFixed(4)
  );
  const provenanceMissingDetection = Number(
    avg(retrievalResults.map((item) => item.missing_detection)).toFixed(4)
  );

  const contractAdherence = Number(
    avg([
      ingestionCorrectness,
      metadataCompleteness,
      lifecycleGovernance,
    ]).toFixed(4)
  );
  const integrationCompleteness = Number(
    safeDiv(
      corpusRows.filter(
        (row) =>
          Array.isArray(row.intended_use) &&
          row.intended_use.includes("RAG") &&
          typeof row.source_manifest === "string" &&
          row.source_manifest.trim().length > 0
      ).length,
      corpusRows.length,
      0
    ).toFixed(4)
  );

  const latencyProbe = await measureRuntimeProbe({
    probeId: "kb.adapter.compute.v1",
    fn: () => {
      let linkedUses = 0;
      let completeFields = 0;
      for (const row of corpusRows) {
        linkedUses += Array.isArray(row.intended_use) ? row.intended_use.length : 0;
        for (const field of requiredFields) {
          if (hasMeaningfulValue(row[field])) completeFields += 1;
        }
      }
      return linkedUses + completeFields;
    },
  });

  const latencyP95Ms = latencyProbe.p95_ms;
  const latencyMeasurementMode = latencyProbe.measurement_mode;

  const metrics = [
    {
      dataset_id: corpusDataset.id,
      metric_id: "kb.ingestion.correctness",
      dimension: "ingestion correctness",
      kind: "correctness",
      value: Number(ingestionCorrectness.toFixed(4)),
      fixture_path: corpusDataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: metadataDataset.id,
      metric_id: "kb.metadata.completeness",
      dimension: "metadata completeness",
      kind: "coverage",
      value: Number(metadataCompleteness.toFixed(4)),
      fixture_path: metadataDataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: corpusDataset.id,
      metric_id: "kb.chunk.quality",
      dimension: "chunk quality",
      kind: "correctness",
      value: Number(chunkQuality.toFixed(4)),
      fixture_path: corpusDataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: corpusDataset.id,
      metric_id: "kb.linking.density",
      dimension: "linking density",
      kind: "explainability",
      value: Number(linkingDensity.toFixed(4)),
      fixture_path: corpusDataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: metadataDataset.id,
      metric_id: "kb.lifecycle.governance",
      dimension: "lifecycle governance adherence",
      kind: "authority",
      value: Number(lifecycleGovernance.toFixed(4)),
      fixture_path: metadataDataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: retrievalDataset?.id || corpusDataset.id,
      metric_id: "kb.retrieval.top1_relevance",
      dimension: "retrieval top1 relevance",
      kind: "correctness",
      value: retrievalTop1Relevance,
      fixture_path: retrievalDataset?.path || corpusDataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: retrievalDataset?.id || corpusDataset.id,
      metric_id: "kb.retrieval.top3_hit_rate",
      dimension: "retrieval top3 hit rate",
      kind: "coverage",
      value: retrievalTopKHitRate,
      fixture_path: retrievalDataset?.path || corpusDataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: retrievalDataset?.id || corpusDataset.id,
      metric_id: "kb.context.usefulness",
      dimension: "context usefulness",
      kind: "explainability",
      value: contextUsefulness,
      fixture_path: retrievalDataset?.path || corpusDataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: retrievalDataset?.id || corpusDataset.id,
      metric_id: "kb.provenance.completeness",
      dimension: "provenance completeness",
      kind: "authority",
      value: provenanceCompleteness,
      fixture_path: retrievalDataset?.path || corpusDataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: retrievalDataset?.id || corpusDataset.id,
      metric_id: "kb.provenance.missing_detection",
      dimension: "missing provenance detection",
      kind: "explainability",
      value: provenanceMissingDetection,
      fixture_path: retrievalDataset?.path || corpusDataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: metadataDataset.id,
      metric_id: "kb.contract.adherence",
      dimension: "contract adherence",
      kind: "contract_adherence",
      value: contractAdherence,
      fixture_path: metadataDataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: corpusDataset.id,
      metric_id: "kb.integration.completeness",
      dimension: "integration completeness",
      kind: "integration_completeness",
      value: integrationCompleteness,
      fixture_path: corpusDataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: corpusDataset.id,
      metric_id: "kb.latency.p95_ms",
      dimension: "latency",
      kind: "latency",
      value: latencyP95Ms,
      fixture_path: corpusDataset.path,
      measurement_mode: latencyMeasurementMode,
      fixture_version: fixtureVersion,
      runtime_probe_id: latencyProbe.runtime_probe_id,
      runtime_probe_samples: latencyProbe.samples,
    },
    {
      dataset_id: corpusDataset.id,
      metric_id: "kb.latency.measurement_mode_runtime",
      dimension: "latency measurement mode runtime",
      kind: "integration_completeness",
      value: latencyMeasurementMode === "runtime" ? 1 : 0,
      fixture_path: corpusDataset.path,
      measurement_mode: latencyMeasurementMode,
      fixture_version: fixtureVersion,
      runtime_probe_id: latencyProbe.runtime_probe_id,
      runtime_probe_samples: latencyProbe.samples,
    },
  ];

  const latencyThreshold = thresholdsByMetric["kb.latency.p95_ms"].value;
  const rollups = {
    correctness: Number(
      avg([ingestionCorrectness, chunkQuality, retrievalTop1Relevance, contextUsefulness]).toFixed(4)
    ),
    coverage: Number(avg([metadataCompleteness, retrievalTopKHitRate, provenanceCompleteness]).toFixed(4)),
    explainability: Number(avg([linkingDensity, contextUsefulness, provenanceMissingDetection]).toFixed(4)),
    authority: Number(avg([lifecycleGovernance, provenanceCompleteness]).toFixed(4)),
    contract_adherence: contractAdherence,
    integration_completeness: integrationCompleteness,
    latency_norm: Number(latencyNorm(latencyP95Ms, latencyThreshold).toFixed(4)),
  };

  const syntheticLatencyCount = metrics.filter(
    (metric) => metric.kind === "latency" && metric.measurement_mode === "synthetic"
  ).length;

  return {
    capability: "KNOWLEDGE_BASE",
    datasetIds: datasets.map((d) => d.id),
    fixtureVersion,
    sampleCount: corpusRows.length + 1 + retrievalCases.length,
    minimumSamples: datasets.reduce((sum, d) => sum + Number(d.minimum_samples || 0), 0),
    contractPath: registryEntry.contract_path,
    metrics,
    rollups,
    syntheticLatencyCount,
    diagnostics: retrievalCases.length
      ? {
          retrieval_quality: {
            case_count: retrievalCases.length,
            top1_hit_rate: retrievalTop1Relevance,
            top3_hit_rate: retrievalTopKHitRate,
            provenance_missing_detection: provenanceMissingDetection,
          },
        }
      : null,
  };
}

module.exports = { evaluate };
