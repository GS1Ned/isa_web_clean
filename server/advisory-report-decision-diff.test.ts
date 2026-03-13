import { describe, expect, it } from "vitest";

import { buildDecisionArtifactDiffSummary } from "./advisory-report-decision-diff";
import type { EsrsDecisionArtifact } from "./esrs-decision-artifacts";

const currentArtifacts: EsrsDecisionArtifact[] = [
  {
    artifactVersion: "1.0",
    artifactType: "gap_analysis",
    capability: "ESRS_MAPPING",
    generatedAt: "2026-03-04T12:00:00.000Z",
    subject: {
      sector: "Retail",
      companySize: "large",
      targetRegulations: ["CSRD"],
    },
    confidence: {
      level: "high",
      score: 0.82,
      basis: "Coverage improved after current mapping refresh.",
      reviewRecommended: false,
      uncertaintyClass: "decision_grade",
      escalationAction: "none",
    },
    evidence: {
      codePaths: ["server/routers/gap-analyzer.ts"],
      dataSources: ["gs1_esrs_mappings"],
    },
    summary: {
      totalRequirements: 15,
      coveragePercentage: 73,
      criticalGapCount: 1,
      highGapCount: 2,
      remediationPathCount: 3,
      criticalGapIds: ["gap-1"],
    },
  },
  {
    artifactVersion: "1.0",
    artifactType: "attribute_recommendation",
    capability: "ESRS_MAPPING",
    generatedAt: "2026-03-04T12:00:00.000Z",
    subject: {
      sector: "Retail",
      targetRegulations: ["CSRD"],
    },
    confidence: {
      level: "medium",
      score: 0.64,
      basis: "Recommendation coverage based on current attribute model.",
      reviewRecommended: true,
      uncertaintyClass: "review_required",
      escalationAction: "analyst_review",
    },
    evidence: {
      codePaths: ["server/attribute-recommender.ts"],
      dataSources: ["gs1_attribute_esrs_mapping"],
    },
    summary: {
      totalRecommendations: 4,
      highConfidenceCount: 2,
      regulationsCovered: ["CSRD"],
      topRecommendationIds: ["attr-1"],
    },
  },
];

const snapshotArtifacts: EsrsDecisionArtifact[] = [
  {
    ...currentArtifacts[0],
    confidence: {
      level: "medium",
      score: 0.58,
      basis: "Older snapshot before latest mapping update.",
      reviewRecommended: true,
      uncertaintyClass: "insufficient_evidence",
      escalationAction: "human_review_required",
    },
    summary: {
      totalRequirements: 14,
      coveragePercentage: 61,
      criticalGapCount: 2,
      highGapCount: 3,
      remediationPathCount: 2,
      criticalGapIds: ["gap-1", "gap-9"],
    },
  },
  {
    artifactVersion: "1.0",
    artifactType: "roadmap",
    capability: "ESRS_MAPPING",
    generatedAt: "2026-03-03T12:00:00.000Z",
    subject: {
      sector: "Retail",
      companySize: "large",
      esrsRequirements: ["ESRS E1"],
    },
    confidence: {
      level: "medium",
      score: 0.61,
      basis: "Snapshot roadmap.",
      reviewRecommended: true,
      uncertaintyClass: "review_required",
      escalationAction: "analyst_review",
    },
    evidence: {
      codePaths: ["server/routers/esrs-roadmap.ts"],
      dataSources: ["gs1_esrs_mappings"],
    },
    summary: {
      phaseCount: 3,
      criticalPhaseCount: 1,
      quickWinCount: 1,
      mappingCount: 7,
      topPhaseIds: ["phase-1"],
    },
  },
];

describe("buildDecisionArtifactDiffSummary", () => {
  it("detects added, removed, changed, and confidence drift across artifact snapshots", () => {
    const diff = buildDecisionArtifactDiffSummary({
      currentArtifacts,
      snapshotArtifacts,
    });

    expect(diff.currentArtifactCount).toBe(2);
    expect(diff.snapshotArtifactCount).toBe(2);
    expect(diff.addedArtifactTypes).toEqual(["attribute_recommendation"]);
    expect(diff.removedArtifactTypes).toEqual(["roadmap"]);
    expect(diff.changedArtifactTypes).toEqual(["gap_analysis"]);
    expect(diff.confidenceChangedArtifactTypes).toEqual(["gap_analysis"]);
    expect(diff.uncertaintyChangedArtifactTypes).toEqual(["gap_analysis"]);
    expect(diff.escalationChangedArtifactTypes).toEqual(["gap_analysis"]);
    expect(diff.unchangedArtifactTypes).toEqual([]);
    expect(diff.averageConfidenceDelta).toBe(0.14);
    expect(diff.hasChanges).toBe(true);
  });

  it("returns a stable empty diff summary when artifacts are absent", () => {
    const diff = buildDecisionArtifactDiffSummary({
      currentArtifacts: undefined,
      snapshotArtifacts: null,
    });

    expect(diff).toEqual({
      currentArtifactCount: 0,
      snapshotArtifactCount: 0,
      addedArtifactTypes: [],
      removedArtifactTypes: [],
      changedArtifactTypes: [],
      unchangedArtifactTypes: [],
      confidenceChangedArtifactTypes: [],
      uncertaintyChangedArtifactTypes: [],
      escalationChangedArtifactTypes: [],
      averageConfidenceDelta: null,
      hasChanges: false,
    });
  });
});
