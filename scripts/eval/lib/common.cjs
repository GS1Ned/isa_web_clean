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

function compareThreshold(value, op, threshold) {
  if (op === ">=") return value >= threshold;
  if (op === "<=") return value <= threshold;
  throw new Error(`Unsupported threshold operator: ${op}`);
}

function latencyNorm(latencyMs, thresholdMs) {
  if (!Number.isFinite(thresholdMs) || thresholdMs <= 0) return 0;
  return clamp01(1 - latencyMs / thresholdMs);
}

function computeCapabilityScore(rollups, weights) {
  const total =
    rollups.correctness * weights.correctness +
    rollups.coverage * weights.coverage +
    rollups.explainability * weights.explainability +
    rollups.authority * weights.authority +
    rollups.latency_norm * weights.latency_norm;
  return clamp01(total);
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

module.exports = {
  readJson,
  readJsonl,
  writeJson,
  writeText,
  avg,
  percentile,
  safeDiv,
  clamp01,
  compareThreshold,
  latencyNorm,
  computeCapabilityScore,
  scoreGrade,
  daysSince,
};
