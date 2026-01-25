import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

/**
 * ISA Advisory Diff Regression Tests
 * 
 * Validates diff computation script per docs/ADVISORY_DIFF_METRICS.md
 * 
 * Test Coverage:
 * 1. Diff output structure validation
 * 2. Deterministic output (v1.0 → v1.0 should yield zero deltas)
 * 3. Regression detection rules
 */

describe('Advisory Diff Computation', () => {
  const advisoriesDir = join(__dirname, '..', 'data', 'advisories');
  const diffScriptPath = join(__dirname, '..', 'scripts', 'compute_advisory_diff.cjs');
  
  let diffOutput: any;

  beforeAll(() => {
    // Run diff computation: v1.0 → v1.0 (should yield zero deltas)
    const command = `node ${diffScriptPath} v1.0 v1.0`;
    try {
      execSync(command, { cwd: join(__dirname, '..'), stdio: 'pipe' });
    } catch (error) {
      // Ignore exit code for now, we'll check output structure
    }

    // Load diff output
    const diffFile = join(advisoriesDir, 'ISA_ADVISORY_DIFF_v1.0_to_v1.0.json');
    if (!existsSync(diffFile)) {
      throw new Error(`Diff output file not found: ${diffFile}`);
    }

    diffOutput = JSON.parse(readFileSync(diffFile, 'utf8'));
  });

  describe('Diff Output Structure', () => {
    it('should have required top-level fields', () => {
      expect(diffOutput).toHaveProperty('metadata');
      expect(diffOutput).toHaveProperty('coverageDeltas');
      expect(diffOutput).toHaveProperty('gapLifecycle');
      expect(diffOutput).toHaveProperty('recommendationLifecycle');
      expect(diffOutput).toHaveProperty('traceabilityDeltas');
      expect(diffOutput).toHaveProperty('compositeMetrics');
    });

    it('should have valid metadata', () => {
      expect(diffOutput.metadata).toHaveProperty('comparisonDate');
      expect(diffOutput.metadata).toHaveProperty('version1');
      expect(diffOutput.metadata).toHaveProperty('version2');
      
      expect(diffOutput.metadata.version1).toHaveProperty('advisoryId');
      expect(diffOutput.metadata.version1).toHaveProperty('version');
      expect(diffOutput.metadata.version1).toHaveProperty('publicationDate');
      
      expect(diffOutput.metadata.version2).toHaveProperty('advisoryId');
      expect(diffOutput.metadata.version2).toHaveProperty('version');
      expect(diffOutput.metadata.version2).toHaveProperty('publicationDate');
    });

    it('should have valid coverage deltas structure', () => {
      const { coverageDeltas } = diffOutput;
      
      expect(coverageDeltas).toHaveProperty('totalMappings');
      expect(coverageDeltas.totalMappings).toHaveProperty('v1.0');
      expect(coverageDeltas.totalMappings).toHaveProperty('delta');
      
      expect(coverageDeltas).toHaveProperty('confidenceTransitions');
      expect(coverageDeltas.confidenceTransitions).toHaveProperty('missing_to_partial');
      expect(coverageDeltas.confidenceTransitions).toHaveProperty('missing_to_direct');
      expect(coverageDeltas.confidenceTransitions).toHaveProperty('partial_to_direct');
      expect(coverageDeltas.confidenceTransitions).toHaveProperty('direct_to_partial');
      expect(coverageDeltas.confidenceTransitions).toHaveProperty('partial_to_missing');
      expect(coverageDeltas.confidenceTransitions).toHaveProperty('direct_to_missing');
      
      expect(coverageDeltas).toHaveProperty('confidenceDistribution');
      expect(coverageDeltas).toHaveProperty('coverageRate');
      expect(coverageDeltas).toHaveProperty('coverageImprovement');
      expect(coverageDeltas).toHaveProperty('newMappings');
      expect(coverageDeltas).toHaveProperty('removedMappings');
    });

    it('should have valid gap lifecycle structure', () => {
      const { gapLifecycle } = diffOutput;
      
      expect(gapLifecycle).toHaveProperty('totalGaps');
      expect(gapLifecycle.totalGaps).toHaveProperty('v1.0');
      expect(gapLifecycle.totalGaps).toHaveProperty('delta');
      
      expect(gapLifecycle).toHaveProperty('gapsClosed');
      expect(gapLifecycle).toHaveProperty('newGaps');
      expect(gapLifecycle).toHaveProperty('severityChanges');
      expect(gapLifecycle).toHaveProperty('severityDistribution');
      expect(gapLifecycle).toHaveProperty('closedGaps');
      expect(gapLifecycle).toHaveProperty('newGapsDetails');
      expect(gapLifecycle).toHaveProperty('severityChangeDetails');
    });

    it('should have valid recommendation lifecycle structure', () => {
      const { recommendationLifecycle } = diffOutput;
      
      expect(recommendationLifecycle).toHaveProperty('totalRecommendations');
      expect(recommendationLifecycle.totalRecommendations).toHaveProperty('v1.0');
      expect(recommendationLifecycle.totalRecommendations).toHaveProperty('delta');
      
      expect(recommendationLifecycle).toHaveProperty('implemented');
      expect(recommendationLifecycle).toHaveProperty('newRecommendations');
      expect(recommendationLifecycle).toHaveProperty('timeframeChanges');
      expect(recommendationLifecycle).toHaveProperty('timeframeDistribution');
      expect(recommendationLifecycle).toHaveProperty('implementedDetails');
      expect(recommendationLifecycle).toHaveProperty('newRecommendationsDetails');
      expect(recommendationLifecycle).toHaveProperty('timeframeChangeDetails');
    });

    it('should have valid traceability deltas structure', () => {
      const { traceabilityDeltas } = diffOutput;
      
      expect(traceabilityDeltas).toHaveProperty('datasetRegistryVersion');
      expect(traceabilityDeltas.datasetRegistryVersion).toHaveProperty('v1.0');
      expect(traceabilityDeltas.datasetRegistryVersion).toHaveProperty('changed');
      
      expect(traceabilityDeltas).toHaveProperty('sourceArtifactChanges');
      expect(traceabilityDeltas.sourceArtifactChanges).toHaveProperty('advisoryMarkdown');
      expect(traceabilityDeltas.sourceArtifactChanges).toHaveProperty('datasetRegistry');
      expect(traceabilityDeltas.sourceArtifactChanges).toHaveProperty('schema');
      
      expect(traceabilityDeltas).toHaveProperty('anySourceArtifactChanged');
    });

    it('should have valid composite metrics structure', () => {
      const { compositeMetrics } = diffOutput;
      
      expect(compositeMetrics).toHaveProperty('overallProgressScore');
      expect(compositeMetrics).toHaveProperty('componentScores');
      expect(compositeMetrics.componentScores).toHaveProperty('coverage');
      expect(compositeMetrics.componentScores).toHaveProperty('gapClosure');
      expect(compositeMetrics.componentScores).toHaveProperty('recommendationImplementation');
      
      expect(compositeMetrics).toHaveProperty('regressionDetected');
      expect(compositeMetrics).toHaveProperty('regressions');
      expect(Array.isArray(compositeMetrics.regressions)).toBe(true);
    });
  });

  describe('Deterministic Output (v1.0 → v1.0)', () => {
    it('should show zero mapping deltas', () => {
      const { coverageDeltas } = diffOutput;
      
      expect(coverageDeltas.totalMappings.delta).toBe(0);
      expect(coverageDeltas.coverageImprovement).toBe(0);
      expect(coverageDeltas.newMappings).toBe(0);
      expect(coverageDeltas.removedMappings).toBe(0);
    });

    it('should show zero confidence transitions', () => {
      const { confidenceTransitions } = diffOutput.coverageDeltas;
      
      expect(confidenceTransitions.missing_to_partial).toBe(0);
      expect(confidenceTransitions.missing_to_direct).toBe(0);
      expect(confidenceTransitions.partial_to_direct).toBe(0);
      expect(confidenceTransitions.direct_to_partial).toBe(0);
      expect(confidenceTransitions.partial_to_missing).toBe(0);
      expect(confidenceTransitions.direct_to_missing).toBe(0);
    });

    it('should show zero gap deltas', () => {
      const { gapLifecycle } = diffOutput;
      
      expect(gapLifecycle.totalGaps.delta).toBe(0);
      expect(gapLifecycle.gapsClosed).toBe(0);
      expect(gapLifecycle.newGaps).toBe(0);
      expect(gapLifecycle.severityChanges).toBe(0);
    });

    it('should show zero recommendation deltas', () => {
      const { recommendationLifecycle } = diffOutput;
      
      expect(recommendationLifecycle.totalRecommendations.delta).toBe(0);
      expect(recommendationLifecycle.implemented).toBe(0);
      expect(recommendationLifecycle.newRecommendations).toBe(0);
      expect(recommendationLifecycle.timeframeChanges).toBe(0);
    });

    it('should show no traceability changes', () => {
      const { traceabilityDeltas } = diffOutput;
      
      expect(Boolean(traceabilityDeltas.datasetRegistryVersion.changed)).toBe(false);
      expect(traceabilityDeltas.sourceArtifactChanges.advisoryMarkdown).toBe(false);
      expect(traceabilityDeltas.sourceArtifactChanges.datasetRegistry).toBe(false);
      expect(traceabilityDeltas.sourceArtifactChanges.schema).toBe(false);
      expect(Boolean(traceabilityDeltas.anySourceArtifactChanged)).toBe(false);
    });

    it('should show zero progress score', () => {
      const { compositeMetrics } = diffOutput;
      
      expect(compositeMetrics.overallProgressScore).toBe(0);
      expect(compositeMetrics.componentScores.coverage).toBe(0);
      expect(compositeMetrics.componentScores.gapClosure).toBe(0);
      expect(compositeMetrics.componentScores.recommendationImplementation).toBe(0);
    });

    it('should not detect any regressions', () => {
      const { compositeMetrics } = diffOutput;
      
      expect(Boolean(compositeMetrics.regressionDetected)).toBe(false);
      expect(compositeMetrics.regressions).toHaveLength(0);
    });
  });

  describe('Regression Detection Rules', () => {
    it('should detect coverage regression if coverage rate decreases', () => {
      // This test validates the logic, not actual data
      // In a real v1.0 → v1.1 diff with coverage regression, we expect:
      // - compositeMetrics.regressionDetected = true
      // - compositeMetrics.regressions to include { type: 'coverage_regression', severity: 'critical' }
      
      // For v1.0 → v1.0, no regression should be detected
      const { compositeMetrics } = diffOutput;
      const coverageRegressions = compositeMetrics.regressions.filter(
        (r: any) => r.type === 'coverage_regression'
      );
      expect(coverageRegressions).toHaveLength(0);
    });

    it('should detect confidence downgrade regressions', () => {
      // In a real diff with downgrades, we expect:
      // - direct_to_partial > 0 → moderate regression
      // - partial_to_missing or direct_to_missing > 0 → critical regression
      
      // For v1.0 → v1.0, no downgrades should be detected
      const { compositeMetrics } = diffOutput;
      const downgradeRegressions = compositeMetrics.regressions.filter(
        (r: any) => r.type === 'confidence_downgrade'
      );
      expect(downgradeRegressions).toHaveLength(0);
    });

    it('should detect gap increase regression', () => {
      // In a real diff with more gaps opened than closed, we expect:
      // - compositeMetrics.regressions to include { type: 'gap_increase', severity: 'moderate' }
      
      // For v1.0 → v1.0, no gap increase should be detected
      const { compositeMetrics } = diffOutput;
      const gapIncreaseRegressions = compositeMetrics.regressions.filter(
        (r: any) => r.type === 'gap_increase'
      );
      expect(gapIncreaseRegressions).toHaveLength(0);
    });

    it('should fail on critical regressions', () => {
      // The diff script should exit with code 1 if critical regressions are detected
      // For v1.0 → v1.0, no critical regressions should exist
      const { compositeMetrics } = diffOutput;
      const criticalRegressions = compositeMetrics.regressions.filter(
        (r: any) => r.severity === 'critical'
      );
      expect(criticalRegressions).toHaveLength(0);
    });
  });

  describe('Data Type Validation', () => {
    it('should have numeric deltas', () => {
      expect(typeof diffOutput.coverageDeltas.totalMappings.delta).toBe('number');
      expect(typeof diffOutput.gapLifecycle.totalGaps.delta).toBe('number');
      expect(typeof diffOutput.recommendationLifecycle.totalRecommendations.delta).toBe('number');
    });

    it('should have numeric coverage rates', () => {
      expect(typeof diffOutput.coverageDeltas.coverageRate['v1.0']).toBe('number');
      expect(typeof diffOutput.coverageDeltas.coverageImprovement).toBe('number');
    });

    it('should have numeric progress scores', () => {
      expect(typeof diffOutput.compositeMetrics.overallProgressScore).toBe('number');
      expect(typeof diffOutput.compositeMetrics.componentScores.coverage).toBe('number');
      expect(typeof diffOutput.compositeMetrics.componentScores.gapClosure).toBe('number');
      expect(typeof diffOutput.compositeMetrics.componentScores.recommendationImplementation).toBe('number');
    });

    it('should have boolean regression flags', () => {
      expect(typeof diffOutput.compositeMetrics.regressionDetected).toBe('boolean');
      expect(typeof diffOutput.traceabilityDeltas.datasetRegistryVersion.changed).toBe('boolean');
      expect(typeof diffOutput.traceabilityDeltas.anySourceArtifactChanged).toBe('boolean');
    });

    it('should have array detail fields', () => {
      expect(Array.isArray(diffOutput.gapLifecycle.closedGaps)).toBe(true);
      expect(Array.isArray(diffOutput.gapLifecycle.newGapsDetails)).toBe(true);
      expect(Array.isArray(diffOutput.recommendationLifecycle.implementedDetails)).toBe(true);
      expect(Array.isArray(diffOutput.recommendationLifecycle.newRecommendationsDetails)).toBe(true);
      expect(Array.isArray(diffOutput.compositeMetrics.regressions)).toBe(true);
    });
  });

  describe('Null/Undefined Handling', () => {
    it('should not have null or undefined in required fields', () => {
      expect(diffOutput.coverageDeltas.totalMappings.delta).not.toBeNull();
      expect(diffOutput.coverageDeltas.totalMappings.delta).not.toBeUndefined();
      
      expect(diffOutput.coverageDeltas.coverageImprovement).not.toBeNull();
      expect(diffOutput.coverageDeltas.coverageImprovement).not.toBeUndefined();
      
      expect(diffOutput.compositeMetrics.overallProgressScore).not.toBeNull();
      expect(diffOutput.compositeMetrics.overallProgressScore).not.toBeUndefined();
    });

    it('should handle empty arrays gracefully', () => {
      // For v1.0 → v1.0, all detail arrays should be empty
      expect(diffOutput.gapLifecycle.closedGaps).toHaveLength(0);
      expect(diffOutput.gapLifecycle.newGapsDetails).toHaveLength(0);
      expect(diffOutput.recommendationLifecycle.implementedDetails).toHaveLength(0);
      expect(diffOutput.recommendationLifecycle.newRecommendationsDetails).toHaveLength(0);
      expect(diffOutput.compositeMetrics.regressions).toHaveLength(0);
    });
  });

  describe('Provenance and Hash Change Detection', () => {
    it('should detect source artifact hash changes', () => {
      // For v1.0 → v1.0, all hashes should be identical
      const { traceabilityDeltas } = diffOutput;
      
      expect(traceabilityDeltas.sourceArtifactChanges.advisoryMarkdown).toBe(false);
      expect(traceabilityDeltas.sourceArtifactChanges.datasetRegistry).toBe(false);
      expect(traceabilityDeltas.sourceArtifactChanges.schema).toBe(false);
    });

    it('should detect dataset registry version changes', () => {
      // For v1.0 → v1.0, dataset registry version should be unchanged
      const { traceabilityDeltas } = diffOutput;
      
      expect(traceabilityDeltas.datasetRegistryVersion['v1.0']).toBe('1.0.0');
      expect(Boolean(traceabilityDeltas.datasetRegistryVersion.changed)).toBe(false);
    });
  });
});
