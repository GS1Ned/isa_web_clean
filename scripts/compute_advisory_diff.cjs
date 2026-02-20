#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

function normalizeVersion(input) {
  const value = String(input || "").trim();
  if (!/^v\d+\.\d+$/.test(value)) {
    throw new Error(`Invalid advisory version: ${value}. Expected format v<major>.<minor>`);
  }
  return value;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function toVersionedObject(version1Label, value1, version2Label, value2) {
  const obj = { [version1Label]: value1 };
  if (version2Label !== version1Label) {
    obj[version2Label] = value2;
  }
  return obj;
}

function mappingId(mapping, idx) {
  return String(mapping.mappingId || mapping.id || `MAPPING-${idx}`);
}

function gapId(gap, idx) {
  return String(gap.gapId || gap.id || `GAP-${idx}`);
}

function recommendationId(recommendation, idx) {
  return String(recommendation.recommendationId || recommendation.id || `REC-${idx}`);
}

function confidenceValue(value) {
  const normalized = String(value || "missing").toLowerCase();
  if (["direct", "partial", "missing"].includes(normalized)) return normalized;
  return "missing";
}

function confidenceDistribution(mappings) {
  const out = { direct: 0, partial: 0, missing: 0 };
  for (const mapping of mappings) {
    out[confidenceValue(mapping.confidence)] += 1;
  }
  return out;
}

function coverageRate(dist) {
  const total = dist.direct + dist.partial + dist.missing;
  if (!total) return 0;
  return (dist.direct + dist.partial) / total;
}

function toMap(items, keyFn) {
  const map = new Map();
  items.forEach((item, idx) => {
    map.set(keyFn(item, idx), item);
  });
  return map;
}

function severityValue(gap) {
  return String(gap.category || gap.severity || "low-priority").toLowerCase();
}

function timeframeDistribution(recommendations) {
  const counts = {};
  for (const recommendation of recommendations) {
    const timeframe = String(recommendation.timeframe || "unknown");
    counts[timeframe] = (counts[timeframe] || 0) + 1;
  }
  return counts;
}

function compareSourceArtifact(source1, source2, key) {
  const a = source1?.[key];
  const b = source2?.[key];
  if (!a || !b) return false;

  const hashA = typeof a.sha256 === "string" ? a.sha256 : "";
  const hashB = typeof b.sha256 === "string" ? b.sha256 : "";
  const pathA = typeof a.path === "string" ? a.path : "";
  const pathB = typeof b.path === "string" ? b.path : "";

  return hashA !== hashB || pathA !== pathB;
}

function round(value, decimals = 4) {
  const power = 10 ** decimals;
  return Math.round(value * power) / power;
}

function buildDiff(advisory1, advisory2, version1Label, version2Label) {
  const mappings1 = Array.isArray(advisory1.mappingResults) ? advisory1.mappingResults : [];
  const mappings2 = Array.isArray(advisory2.mappingResults) ? advisory2.mappingResults : [];
  const map1 = toMap(mappings1, mappingId);
  const map2 = toMap(mappings2, mappingId);

  const transitions = {
    missing_to_partial: 0,
    missing_to_direct: 0,
    partial_to_direct: 0,
    direct_to_partial: 0,
    partial_to_missing: 0,
    direct_to_missing: 0,
  };

  for (const [id, mappingV1] of map1.entries()) {
    if (!map2.has(id)) continue;
    const from = confidenceValue(mappingV1.confidence);
    const to = confidenceValue(map2.get(id).confidence);
    const transitionKey = `${from}_to_${to}`;
    if (Object.prototype.hasOwnProperty.call(transitions, transitionKey)) {
      transitions[transitionKey] += 1;
    }
  }

  const dist1 = confidenceDistribution(mappings1);
  const dist2 = confidenceDistribution(mappings2);
  const coverageRate1 = coverageRate(dist1);
  const coverageRate2 = coverageRate(dist2);

  const newMappings = [];
  const removedMappings = [];

  for (const [id, mapping] of map2.entries()) {
    if (!map1.has(id)) {
      newMappings.push({ id, regulationStandard: mapping.regulationStandard || null });
    }
  }

  for (const [id, mapping] of map1.entries()) {
    if (!map2.has(id)) {
      removedMappings.push({ id, regulationStandard: mapping.regulationStandard || null });
    }
  }

  const gaps1 = Array.isArray(advisory1.gaps) ? advisory1.gaps : [];
  const gaps2 = Array.isArray(advisory2.gaps) ? advisory2.gaps : [];
  const gapsMap1 = toMap(gaps1, gapId);
  const gapsMap2 = toMap(gaps2, gapId);

  const closedGaps = [];
  const newGapsDetails = [];
  const severityChangeDetails = [];

  for (const [id, gap] of gapsMap1.entries()) {
    if (!gapsMap2.has(id)) {
      closedGaps.push({
        gapId: id,
        title: gap.title || null,
        category: severityValue(gap),
      });
      continue;
    }

    const before = severityValue(gap);
    const after = severityValue(gapsMap2.get(id));
    if (before !== after) {
      severityChangeDetails.push({ gapId: id, [version1Label]: before, [version2Label]: after });
    }
  }

  for (const [id, gap] of gapsMap2.entries()) {
    if (!gapsMap1.has(id)) {
      newGapsDetails.push({
        gapId: id,
        title: gap.title || null,
        category: severityValue(gap),
      });
    }
  }

  const severityDistribution1 = { critical: 0, moderate: 0, "low-priority": 0 };
  const severityDistribution2 = { critical: 0, moderate: 0, "low-priority": 0 };

  for (const gap of gaps1) {
    const severity = severityValue(gap);
    if (severityDistribution1[severity] !== undefined) severityDistribution1[severity] += 1;
  }

  for (const gap of gaps2) {
    const severity = severityValue(gap);
    if (severityDistribution2[severity] !== undefined) severityDistribution2[severity] += 1;
  }

  const recommendations1 = Array.isArray(advisory1.recommendations) ? advisory1.recommendations : [];
  const recommendations2 = Array.isArray(advisory2.recommendations) ? advisory2.recommendations : [];
  const recMap1 = toMap(recommendations1, recommendationId);
  const recMap2 = toMap(recommendations2, recommendationId);

  const implementedDetails = [];
  const newRecommendationsDetails = [];
  const timeframeChangeDetails = [];

  for (const [id, recommendation] of recMap1.entries()) {
    if (!recMap2.has(id)) {
      implementedDetails.push({
        recommendationId: id,
        title: recommendation.title || null,
        timeframe: recommendation.timeframe || null,
      });
      continue;
    }

    const before = String(recommendation.timeframe || "");
    const after = String(recMap2.get(id).timeframe || "");
    if (before !== after) {
      timeframeChangeDetails.push({ recommendationId: id, [version1Label]: before, [version2Label]: after });
    }
  }

  for (const [id, recommendation] of recMap2.entries()) {
    if (!recMap1.has(id)) {
      newRecommendationsDetails.push({
        recommendationId: id,
        title: recommendation.title || null,
        timeframe: recommendation.timeframe || null,
      });
    }
  }

  const sourceArtifacts1 = advisory1.sourceArtifacts || {};
  const sourceArtifacts2 = advisory2.sourceArtifacts || {};

  const sourceArtifactChanges = {
    advisoryMarkdown: compareSourceArtifact(sourceArtifacts1, sourceArtifacts2, "advisoryMarkdown"),
    datasetRegistry: compareSourceArtifact(sourceArtifacts1, sourceArtifacts2, "datasetRegistry"),
    schema: compareSourceArtifact(sourceArtifacts1, sourceArtifacts2, "schema"),
  };

  const anySourceArtifactChanged =
    sourceArtifactChanges.advisoryMarkdown ||
    sourceArtifactChanges.datasetRegistry ||
    sourceArtifactChanges.schema;

  const coverageImprovement = coverageRate2 - coverageRate1;

  const coverageScore = Math.max(0, coverageImprovement * 100);
  const gapClosureScore = gaps1.length ? Math.max(0, (closedGaps.length / gaps1.length) * 100) : 0;
  const recommendationImplementationScore = recommendations1.length
    ? Math.max(0, (implementedDetails.length / recommendations1.length) * 100)
    : 0;

  const regressions = [];

  if (coverageImprovement < 0) {
    regressions.push({ type: "coverage_regression", severity: "critical", detail: "coverage rate decreased" });
  }

  const downgradeCount =
    transitions.direct_to_partial + transitions.partial_to_missing + transitions.direct_to_missing;
  if (downgradeCount > 0) {
    const critical = transitions.partial_to_missing + transitions.direct_to_missing > 0;
    regressions.push({
      type: "confidence_downgrade",
      severity: critical ? "critical" : "moderate",
      detail: `${downgradeCount} mapping confidence downgrades detected`,
    });
  }

  if (gaps2.length > gaps1.length) {
    regressions.push({
      type: "gap_increase",
      severity: "moderate",
      detail: `gaps increased from ${gaps1.length} to ${gaps2.length}`,
    });
  }

  const regressionDetected = regressions.length > 0;
  const overallProgressScore = round(
    coverageScore * 0.5 + gapClosureScore * 0.25 + recommendationImplementationScore * 0.25,
    2
  );

  const datasetRegistryVersionObj = toVersionedObject(
    version1Label,
    advisory1.datasetRegistryVersion || null,
    version2Label,
    advisory2.datasetRegistryVersion || null
  );
  datasetRegistryVersionObj.changed =
    (advisory1.datasetRegistryVersion || null) !== (advisory2.datasetRegistryVersion || null);

  return {
    metadata: {
      comparisonDate: new Date().toISOString(),
      version1: {
        advisoryId: advisory1.advisoryId || `ISA_ADVISORY_${version1Label}`,
        version: advisory1.version || version1Label.replace("v", ""),
        publicationDate: advisory1.publicationDate || null,
      },
      version2: {
        advisoryId: advisory2.advisoryId || `ISA_ADVISORY_${version2Label}`,
        version: advisory2.version || version2Label.replace("v", ""),
        publicationDate: advisory2.publicationDate || null,
      },
    },
    coverageDeltas: {
      totalMappings: {
        ...toVersionedObject(version1Label, mappings1.length, version2Label, mappings2.length),
        delta: mappings2.length - mappings1.length,
      },
      confidenceTransitions: transitions,
      confidenceDistribution: toVersionedObject(version1Label, dist1, version2Label, dist2),
      coverageRate: toVersionedObject(version1Label, round(coverageRate1), version2Label, round(coverageRate2)),
      coverageImprovement: round(coverageImprovement),
      newMappings: newMappings.length,
      removedMappings: removedMappings.length,
    },
    gapLifecycle: {
      totalGaps: {
        ...toVersionedObject(version1Label, gaps1.length, version2Label, gaps2.length),
        delta: gaps2.length - gaps1.length,
      },
      gapsClosed: closedGaps.length,
      newGaps: newGapsDetails.length,
      severityChanges: severityChangeDetails.length,
      severityDistribution: toVersionedObject(version1Label, severityDistribution1, version2Label, severityDistribution2),
      closedGaps,
      newGapsDetails,
      severityChangeDetails,
    },
    recommendationLifecycle: {
      totalRecommendations: {
        ...toVersionedObject(version1Label, recommendations1.length, version2Label, recommendations2.length),
        delta: recommendations2.length - recommendations1.length,
      },
      implemented: implementedDetails.length,
      newRecommendations: newRecommendationsDetails.length,
      timeframeChanges: timeframeChangeDetails.length,
      timeframeDistribution: toVersionedObject(
        version1Label,
        timeframeDistribution(recommendations1),
        version2Label,
        timeframeDistribution(recommendations2)
      ),
      implementedDetails,
      newRecommendationsDetails,
      timeframeChangeDetails,
    },
    traceabilityDeltas: {
      datasetRegistryVersion: datasetRegistryVersionObj,
      sourceArtifactChanges,
      anySourceArtifactChanged,
    },
    compositeMetrics: {
      overallProgressScore,
      componentScores: {
        coverage: round(coverageScore, 2),
        gapClosure: round(gapClosureScore, 2),
        recommendationImplementation: round(recommendationImplementationScore, 2),
      },
      regressionDetected,
      regressions,
    },
  };
}

function main() {
  const version1 = normalizeVersion(process.argv[2]);
  const version2 = normalizeVersion(process.argv[3]);
  const version1Label = version1;
  const version2Label = version2;

  const advisoryPath1 = path.join(process.cwd(), "data", "advisories", `ISA_ADVISORY_${version1}.json`);
  const advisoryPath2 = path.join(process.cwd(), "data", "advisories", `ISA_ADVISORY_${version2}.json`);

  if (!fs.existsSync(advisoryPath1)) {
    throw new Error(`Missing advisory file: ${advisoryPath1}`);
  }
  if (!fs.existsSync(advisoryPath2)) {
    throw new Error(`Missing advisory file: ${advisoryPath2}`);
  }

  const advisory1 = readJson(advisoryPath1);
  const advisory2 = readJson(advisoryPath2);

  const diff = buildDiff(advisory1, advisory2, version1Label, version2Label);

  const outPath = path.join(
    process.cwd(),
    "data",
    "advisories",
    `ISA_ADVISORY_DIFF_${version1}_to_${version2}.json`
  );

  writeJson(outPath, diff);
  process.stdout.write(`DONE=advisory_diff_written:${outPath}\n`);

  const hasCriticalRegression = (diff.compositeMetrics.regressions || []).some(
    (regression) => regression.severity === "critical"
  );

  if (hasCriticalRegression) {
    process.exit(1);
  }
}

try {
  main();
} catch (error) {
  process.stderr.write(`STOP=advisory_diff_error:${String(error?.message || error)}\n`);
  process.exit(1);
}
