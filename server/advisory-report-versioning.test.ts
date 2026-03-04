import { describe, expect, it } from "vitest";
import { resolveVersionDecisionArtifacts } from "./advisory-report-versioning";
import type { EsrsDecisionArtifact } from "./esrs-decision-artifacts";

const sourceArtifacts: EsrsDecisionArtifact[] = [
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
      level: "medium",
      score: 0.67,
      basis: "Coverage analysis across mapped requirements.",
    },
    evidence: {
      codePaths: ["server/routers/gap-analyzer.ts"],
      dataSources: ["gs1_esrs_mappings"],
    },
    summary: {
      totalRequirements: 12,
      coveragePercentage: 58,
      criticalGapCount: 2,
      highGapCount: 3,
      remediationPathCount: 1,
      criticalGapIds: ["gap-1"],
    },
  },
];

describe("resolveVersionDecisionArtifacts", () => {
  it("inherits artifacts from the source report when no explicit override is provided", () => {
    const resolved = resolveVersionDecisionArtifacts({
      sourceReport: {
        decisionArtifacts: sourceArtifacts,
      },
    });

    expect(resolved).toEqual(sourceArtifacts);
  });

  it("prefers explicit version artifacts over the source report snapshot", () => {
    const overrideArtifacts: EsrsDecisionArtifact[] = [
      {
        ...sourceArtifacts[0],
        artifactType: "attribute_recommendation",
        summary: {
          totalRecommendations: 3,
          highConfidenceCount: 2,
          regulationsCovered: ["CSRD"],
          topRecommendationIds: ["productCarbonFootprint"],
        },
      } as EsrsDecisionArtifact,
    ];

    const resolved = resolveVersionDecisionArtifacts({
      requestedArtifacts: overrideArtifacts,
      sourceReport: {
        decisionArtifacts: sourceArtifacts,
      },
    });

    expect(resolved).toEqual(overrideArtifacts);
  });

  it("returns undefined when neither source nor request contains artifacts", () => {
    const resolved = resolveVersionDecisionArtifacts({
      sourceReport: {
        decisionArtifacts: undefined,
      },
    });

    expect(resolved).toBeUndefined();
  });

  it("throws when the source report does not exist", () => {
    expect(() =>
      resolveVersionDecisionArtifacts({
        sourceReport: null,
      }),
    ).toThrow("Report not found");
  });
});
