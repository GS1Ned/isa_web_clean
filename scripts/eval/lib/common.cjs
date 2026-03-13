const fs = require("node:fs");
const path = require("node:path");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readJsonl(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function writeText(filePath, text) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, text, "utf8");
}

function avg(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentile(values, pct) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.max(0, Math.ceil(pct * sorted.length) - 1);
  return sorted[rank];
}

function safeDiv(numerator, denominator, fallback = 0) {
  if (!denominator) return fallback;
  return numerator / denominator;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function hasMeaningfulValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value === null || value === undefined) return false;
  if (typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  return String(value).trim().length > 0;
}

function tokenizeText(value) {
  return String(value || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function textIncludesAllTerms(value, terms) {
  const haystack = new Set(tokenizeText(value));
  return (terms || []).every((term) => tokenizeText(term).every((token) => haystack.has(token)));
}

function fieldPresenceRatio(record, fields) {
  if (!Array.isArray(fields) || !fields.length) return 1;
  return safeDiv(
    fields.filter((field) => hasMeaningfulValue(record?.[field])).length,
    fields.length,
    1
  );
}

function collectMissingFields(record, fields) {
  return (fields || []).filter((field) => !hasMeaningfulValue(record?.[field]));
}

function compareThreshold(value, op, threshold) {
  if (op === ">=") return value >= threshold;
  if (op === "<=") return value <= threshold;
  throw new Error(`Unsupported threshold operator: ${op}`);
}

function latencyNorm(latencyMs, thresholdMs) {
  if (!Number.isFinite(thresholdMs) || thresholdMs <= 0) return 0;
  return clamp01(1 - latencyMs / thresholdMs);
}

function computeCapabilityScore(rollups, weights, options = {}) {
  const correctness = Number(rollups.correctness || 0);
  const coverage = Number(rollups.coverage || 0);
  const explainability = Number(rollups.explainability || 0);
  const authority = Number(rollups.authority || 0);
  const contractAdherence = Number(rollups.contract_adherence || 0);
  const integrationCompleteness = Number(rollups.integration_completeness || 0);
  const latencyNormValue = Number(rollups.latency_norm || 0);
  const total =
    correctness * Number(weights.correctness || 0) +
    coverage * Number(weights.coverage || 0) +
    explainability * Number(weights.explainability || 0) +
    authority * Number(weights.authority || 0) +
    contractAdherence * Number(weights.contract_adherence || 0) +
    integrationCompleteness * Number(weights.integration_completeness || 0) +
    latencyNormValue * Number(weights.latency_norm || 0);
  const syntheticPenalty = Number(options.syntheticPenalty || 0);
  return clamp01(total - syntheticPenalty);
}

function scoreGrade(score) {
  if (score >= 0.9) return "A";
  if (score >= 0.8) return "B";
  if (score >= 0.7) return "C";
  return "D";
}

function parseIsoOrNull(value) {
  if (typeof value !== "string") return null;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return null;
  return timestamp;
}

function daysSince(value, nowMs) {
  const ts = parseIsoOrNull(value);
  if (ts === null) return null;
  return Math.floor((nowMs - ts) / (24 * 60 * 60 * 1000));
}

function datasetVersionFromId(datasetId) {
  const match = String(datasetId || "").match(/_v(\d+)$/i);
  return match ? Number(match[1]) : 0;
}

function selectDatasetByPrefix(datasets, prefix) {
  const matches = (datasets || []).filter((dataset) => String(dataset.id || "").startsWith(prefix));
  if (!matches.length) {
    throw new Error(`Missing dataset for prefix: ${prefix}`);
  }
  return [...matches].sort((left, right) => datasetVersionFromId(right.id) - datasetVersionFromId(left.id))[0];
}

function inferFixtureVersion(datasetIds) {
  const highest = (datasetIds || []).reduce((max, id) => Math.max(max, datasetVersionFromId(id)), 0);
  return highest > 0 ? `v${highest}` : "v0";
}

module.exports = {
  readJson,
  readJsonl,
  writeJson,
  writeText,
  avg,
  percentile,
  safeDiv,
  clamp01,
  hasMeaningfulValue,
  tokenizeText,
  textIncludesAllTerms,
  fieldPresenceRatio,
  collectMissingFields,
  compareThreshold,
  latencyNorm,
  computeCapabilityScore,
  scoreGrade,
  daysSince,
  datasetVersionFromId,
  selectDatasetByPrefix,
  inferFixtureVersion,
};
