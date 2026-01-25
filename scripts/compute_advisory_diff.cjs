#!/usr/bin/env node

/**
 * ISA Advisory Diff Computation Script
 * 
 * Computes canonical diff metrics between two advisory versions per docs/ADVISORY_DIFF_METRICS.md
 * 
 * Usage:
 *   node scripts/compute_advisory_diff.cjs v1.0 v1.1
 *   pnpm diff:advisory v1.0 v1.1
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Usage: node compute_advisory_diff.cjs <version1> <version2>');
  console.error('Example: node compute_advisory_diff.cjs v1.0 v1.1');
  process.exit(1);
}

const [version1, version2] = args;

// Construct file paths
const advisoriesDir = path.join(__dirname, '..', 'data', 'advisories');
const file1 = path.join(advisoriesDir, `ISA_ADVISORY_${version1}.json`);
const file2 = path.join(advisoriesDir, `ISA_ADVISORY_${version2}.json`);

// Check if files exist
if (!fs.existsSync(file1)) {
  console.error(`❌ Advisory file not found: ${file1}`);
  console.error(`   Hint: Advisory ${version1} does not exist yet.`);
  process.exit(1);
}

if (!fs.existsSync(file2)) {
  console.error(`❌ Advisory file not found: ${file2}`);
  console.error(`   Hint: Advisory ${version2} does not exist yet.`);
  console.error(`   To create v1.1, run a new advisory analysis and save as ISA_ADVISORY_v1.1.json`);
  process.exit(1);
}

// Load advisory JSON files
let advisory1, advisory2;
try {
  advisory1 = JSON.parse(fs.readFileSync(file1, 'utf8'));
  advisory2 = JSON.parse(fs.readFileSync(file2, 'utf8'));
} catch (error) {
  console.error(`❌ Failed to parse advisory JSON: ${error.message}`);
  process.exit(1);
}

console.log(`\n📊 Computing diff: ${version1} → ${version2}\n`);

// ============================================================================
// 1. Coverage Deltas
// ============================================================================

function computeCoverageDeltas(adv1, adv2) {
  const mappings1 = new Map(adv1.mappingResults.map(m => [m.mappingId, m]));
  const mappings2 = new Map(adv2.mappingResults.map(m => [m.mappingId, m]));

  // Confidence transitions
  const transitions = {
    missing_to_partial: 0,
    missing_to_direct: 0,
    partial_to_direct: 0,
    direct_to_partial: 0,
    partial_to_missing: 0,
    direct_to_missing: 0,
  };

  // Track new and removed mappings
  const newMappings = [];
  const removedMappings = [];

  // Compare mappings present in both versions
  for (const [id, m1] of mappings1) {
    if (mappings2.has(id)) {
      const m2 = mappings2.get(id);
      const conf1 = m1.confidence;
      const conf2 = m2.confidence;
      
      if (conf1 !== conf2) {
        const transitionKey = `${conf1}_to_${conf2}`;
        if (transitions.hasOwnProperty(transitionKey)) {
          transitions[transitionKey]++;
        }
      }
    } else {
      removedMappings.push(id);
    }
  }

  // Find new mappings in v2
  for (const [id, m2] of mappings2) {
    if (!mappings1.has(id)) {
      newMappings.push(id);
    }
  }

  // Confidence distribution
  const countConfidence = (mappings) => {
    const counts = { direct: 0, partial: 0, missing: 0 };
    for (const m of mappings) {
      counts[m.confidence]++;
    }
    return counts;
  };

  const dist1 = countConfidence(adv1.mappingResults);
  const dist2 = countConfidence(adv2.mappingResults);

  // Coverage rates
  const coverageRate1 = (dist1.direct + dist1.partial) / adv1.mappingResults.length;
  const coverageRate2 = (dist2.direct + dist2.partial) / adv2.mappingResults.length;
  const coverageImprovement = coverageRate2 - coverageRate1;

  return {
    totalMappings: {
      [version1]: adv1.mappingResults.length,
      [version2]: adv2.mappingResults.length,
      delta: adv2.mappingResults.length - adv1.mappingResults.length,
    },
    confidenceTransitions: transitions,
    confidenceDistribution: {
      [version1]: dist1,
      [version2]: dist2,
    },
    coverageRate: {
      [version1]: parseFloat(coverageRate1.toFixed(4)),
      [version2]: parseFloat(coverageRate2.toFixed(4)),
    },
    coverageImprovement: parseFloat(coverageImprovement.toFixed(4)),
    newMappings: newMappings.length,
    removedMappings: removedMappings.length,
  };
}

// ============================================================================
// 2. Gap Lifecycle
// ============================================================================

function computeGapLifecycle(adv1, adv2) {
  // Handle missing gaps field gracefully
  const gaps1 = new Map((adv1.gaps || []).map(g => [g.gapId, g]));
  const gaps2 = new Map((adv2.gaps || []).map(g => [g.gapId, g]));

  const closed = [];
  const newGaps = [];
  const severityChanges = [];

  // Find closed gaps (in v1 but not v2)
  for (const [id, g1] of gaps1) {
    if (!gaps2.has(id)) {
      closed.push({ gapId: id, title: g1.title, category: g1.category });
    } else {
      const g2 = gaps2.get(id);
      if (g1.category !== g2.category) {
        severityChanges.push({
          gapId: id,
          title: g1.title,
          from: g1.category,
          to: g2.category,
        });
      }
    }
  }

  // Find new gaps (in v2 but not v1)
  for (const [id, g2] of gaps2) {
    if (!gaps1.has(id)) {
      newGaps.push({ gapId: id, title: g2.title, category: g2.category });
    }
  }

  // Count by severity
  const countBySeverity = (gaps) => {
    const counts = { critical: 0, moderate: 0, 'low-priority': 0 };
    for (const g of (gaps || [])) {
      counts[g.category]++;
    }
    return counts;
  };

  const severity1 = countBySeverity(adv1.gaps);
  const severity2 = countBySeverity(adv2.gaps);

  return {
    totalGaps: {
      [version1]: (adv1.gaps || []).length,
      [version2]: (adv2.gaps || []).length,
      delta: (adv2.gaps || []).length - (adv1.gaps || []).length,
    },
    gapsClosed: closed.length,
    newGaps: newGaps.length,
    severityChanges: severityChanges.length,
    severityDistribution: {
      [version1]: severity1,
      [version2]: severity2,
    },
    closedGaps: closed,
    newGapsDetails: newGaps,
    severityChangeDetails: severityChanges,
  };
}

// ============================================================================
// 3. Recommendation Lifecycle
// ============================================================================

function computeRecommendationLifecycle(adv1, adv2) {
  const recs1 = new Map(adv1.recommendations.map(r => [r.recommendationId, r]));
  const recs2 = new Map(adv2.recommendations.map(r => [r.recommendationId, r]));

  const implemented = [];
  const newRecs = [];
  const timeframeChanges = [];

  // Find implemented recommendations (in v1 but not v2)
  for (const [id, r1] of recs1) {
    if (!recs2.has(id)) {
      implemented.push({ recommendationId: id, title: r1.title, timeframe: r1.timeframe });
    } else {
      const r2 = recs2.get(id);
      if (r1.timeframe !== r2.timeframe) {
        timeframeChanges.push({
          recommendationId: id,
          title: r1.title,
          from: r1.timeframe,
          to: r2.timeframe,
        });
      }
    }
  }

  // Find new recommendations (in v2 but not v1)
  for (const [id, r2] of recs2) {
    if (!recs1.has(id)) {
      newRecs.push({ recommendationId: id, title: r2.title, timeframe: r2.timeframe });
    }
  }

  // Count by timeframe
  const countByTimeframe = (recs) => {
    const counts = { 'short-term': 0, 'medium-term': 0, 'long-term': 0 };
    for (const r of recs) {
      counts[r.timeframe]++;
    }
    return counts;
  };

  const timeframe1 = countByTimeframe(adv1.recommendations);
  const timeframe2 = countByTimeframe(adv2.recommendations);

  return {
    totalRecommendations: {
      [version1]: adv1.recommendations.length,
      [version2]: adv2.recommendations.length,
      delta: adv2.recommendations.length - adv1.recommendations.length,
    },
    implemented: implemented.length,
    newRecommendations: newRecs.length,
    timeframeChanges: timeframeChanges.length,
    timeframeDistribution: {
      [version1]: timeframe1,
      [version2]: timeframe2,
    },
    implementedDetails: implemented,
    newRecommendationsDetails: newRecs,
    timeframeChangeDetails: timeframeChanges,
  };
}

// ============================================================================
// 4. Traceability Deltas
// ============================================================================

function computeTraceabilityDeltas(adv1, adv2) {
  const hashChanged = (artifact1, artifact2) => {
    if (!artifact1 || !artifact2) return false;
    return artifact1.sha256 !== artifact2.sha256;
  };

  const changes = {
    advisoryMarkdown: hashChanged(
      adv1.sourceArtifacts?.advisoryMarkdown,
      adv2.sourceArtifacts?.advisoryMarkdown
    ),
    datasetRegistry: hashChanged(
      adv1.sourceArtifacts?.datasetRegistry,
      adv2.sourceArtifacts?.datasetRegistry
    ),
    schema: hashChanged(
      adv1.sourceArtifacts?.schema,
      adv2.sourceArtifacts?.schema
    ),
  };

  const datasetRegistryVersionChanged = 
    adv1.datasetRegistryVersion !== adv2.datasetRegistryVersion;

  return {
    datasetRegistryVersion: {
      [version1]: adv1.datasetRegistryVersion,
      [version2]: adv2.datasetRegistryVersion,
      changed: datasetRegistryVersionChanged,
    },
    sourceArtifactChanges: changes,
    anySourceArtifactChanged: Object.values(changes).some(c => c),
  };
}

// ============================================================================
// 5. Composite Metrics
// ============================================================================

function computeCompositeMetrics(coverageDeltas, gapLifecycle, recLifecycle) {
  // Overall progress score (0-100)
  // Formula: weighted average of coverage improvement, gap closure, and recommendation implementation
  const coverageWeight = 0.5;
  const gapWeight = 0.3;
  const recWeight = 0.2;

  const coverageScore = coverageDeltas.coverageImprovement * 100; // Convert to percentage
  const gapScore = gapLifecycle.totalGaps[version1] > 0
    ? (gapLifecycle.gapsClosed / gapLifecycle.totalGaps[version1]) * 100
    : 0;
  const recScore = recLifecycle.totalRecommendations[version1] > 0
    ? (recLifecycle.implemented / recLifecycle.totalRecommendations[version1]) * 100
    : 0;

  const overallProgressScore = 
    coverageWeight * coverageScore +
    gapWeight * gapScore +
    recWeight * recScore;

  // Regression detection
  const regressions = [];
  
  if (coverageDeltas.coverageImprovement < 0) {
    regressions.push({
      type: 'coverage_regression',
      severity: 'critical',
      message: `Coverage rate decreased by ${Math.abs(coverageDeltas.coverageImprovement * 100).toFixed(2)}%`,
    });
  }

  if (coverageDeltas.confidenceTransitions.direct_to_partial > 0) {
    regressions.push({
      type: 'confidence_downgrade',
      severity: 'moderate',
      message: `${coverageDeltas.confidenceTransitions.direct_to_partial} mappings downgraded from direct to partial`,
    });
  }

  if (coverageDeltas.confidenceTransitions.partial_to_missing > 0 || 
      coverageDeltas.confidenceTransitions.direct_to_missing > 0) {
    regressions.push({
      type: 'confidence_downgrade',
      severity: 'critical',
      message: `Mappings downgraded to missing`,
    });
  }

  if (gapLifecycle.newGaps > gapLifecycle.gapsClosed) {
    regressions.push({
      type: 'gap_increase',
      severity: 'moderate',
      message: `More gaps opened (${gapLifecycle.newGaps}) than closed (${gapLifecycle.gapsClosed})`,
    });
  }

  return {
    overallProgressScore: parseFloat(overallProgressScore.toFixed(2)),
    componentScores: {
      coverage: parseFloat(coverageScore.toFixed(2)),
      gapClosure: parseFloat(gapScore.toFixed(2)),
      recommendationImplementation: parseFloat(recScore.toFixed(2)),
    },
    regressionDetected: regressions.length > 0,
    regressions,
  };
}

// ============================================================================
// Main Computation
// ============================================================================

const coverageDeltas = computeCoverageDeltas(advisory1, advisory2);
const gapLifecycle = computeGapLifecycle(advisory1, advisory2);
const recLifecycle = computeRecommendationLifecycle(advisory1, advisory2);
const traceabilityDeltas = computeTraceabilityDeltas(advisory1, advisory2);
const compositeMetrics = computeCompositeMetrics(coverageDeltas, gapLifecycle, recLifecycle);

// ============================================================================
// Output
// ============================================================================

const diffOutput = {
  metadata: {
    comparisonDate: new Date().toISOString(),
    version1: {
      advisoryId: advisory1.advisoryId,
      version: advisory1.version,
      publicationDate: advisory1.publicationDate,
    },
    version2: {
      advisoryId: advisory2.advisoryId,
      version: advisory2.version,
      publicationDate: advisory2.publicationDate,
    },
  },
  coverageDeltas,
  gapLifecycle,
  recommendationLifecycle: recLifecycle,
  traceabilityDeltas,
  compositeMetrics,
};

// Write diff output to file
const outputFile = path.join(advisoriesDir, `ISA_ADVISORY_DIFF_${version1}_to_${version2}.json`);
fs.writeFileSync(outputFile, JSON.stringify(diffOutput, null, 2) + '\n');

// Print summary
console.log('✅ Diff computation complete\n');
console.log('📈 Coverage Deltas:');
console.log(`   Total mappings: ${coverageDeltas.totalMappings[version1]} → ${coverageDeltas.totalMappings[version2]} (${coverageDeltas.totalMappings.delta >= 0 ? '+' : ''}${coverageDeltas.totalMappings.delta})`);
console.log(`   Coverage rate: ${(coverageDeltas.coverageRate[version1] * 100).toFixed(1)}% → ${(coverageDeltas.coverageRate[version2] * 100).toFixed(1)}% (${coverageDeltas.coverageImprovement >= 0 ? '+' : ''}${(coverageDeltas.coverageImprovement * 100).toFixed(1)}%)`);
console.log(`   Confidence transitions:`);
console.log(`     missing → partial: ${coverageDeltas.confidenceTransitions.missing_to_partial}`);
console.log(`     missing → direct: ${coverageDeltas.confidenceTransitions.missing_to_direct}`);
console.log(`     partial → direct: ${coverageDeltas.confidenceTransitions.partial_to_direct}`);

console.log('\n🔍 Gap Lifecycle:');
console.log(`   Total gaps: ${gapLifecycle.totalGaps[version1]} → ${gapLifecycle.totalGaps[version2]} (${gapLifecycle.totalGaps.delta >= 0 ? '+' : ''}${gapLifecycle.totalGaps.delta})`);
console.log(`   Gaps closed: ${gapLifecycle.gapsClosed}`);
console.log(`   New gaps: ${gapLifecycle.newGaps}`);

console.log('\n✅ Recommendation Lifecycle:');
console.log(`   Total recommendations: ${recLifecycle.totalRecommendations[version1]} → ${recLifecycle.totalRecommendations[version2]} (${recLifecycle.totalRecommendations.delta >= 0 ? '+' : ''}${recLifecycle.totalRecommendations.delta})`);
console.log(`   Implemented: ${recLifecycle.implemented}`);
console.log(`   New recommendations: ${recLifecycle.newRecommendations}`);

console.log('\n🔒 Traceability Deltas:');
console.log(`   Dataset registry version: ${traceabilityDeltas.datasetRegistryVersion[version1]} → ${traceabilityDeltas.datasetRegistryVersion[version2]} ${traceabilityDeltas.datasetRegistryVersion.changed ? '(CHANGED)' : '(unchanged)'}`);
console.log(`   Source artifact changes: ${traceabilityDeltas.anySourceArtifactChanged ? 'YES' : 'NO'}`);

console.log('\n📊 Composite Metrics:');
console.log(`   Overall progress score: ${compositeMetrics.overallProgressScore}/100`);
console.log(`   Regression detected: ${compositeMetrics.regressionDetected ? 'YES ⚠️' : 'NO ✅'}`);
if (compositeMetrics.regressions.length > 0) {
  console.log('   Regressions:');
  compositeMetrics.regressions.forEach(r => {
    console.log(`     - [${r.severity.toUpperCase()}] ${r.message}`);
  });
}

console.log(`\n📄 Diff output saved to: ${outputFile}\n`);

// Exit with error code if regressions detected
if (compositeMetrics.regressionDetected) {
  const criticalRegressions = compositeMetrics.regressions.filter(r => r.severity === 'critical');
  if (criticalRegressions.length > 0) {
    console.error('❌ CRITICAL REGRESSIONS DETECTED - diff computation failed');
    process.exit(1);
  }
}

console.log('✅ Diff computation passed (no critical regressions)\n');
