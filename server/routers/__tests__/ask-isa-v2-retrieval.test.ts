import { describe, expect, it } from "vitest";

import {
  annotateAskISAV2DecisionRoles,
  buildAskISAV2DecisionSummary,
  expandEsrsStandardsForMappings,
  rerankAskISAV2Results,
  type AskISAV2KnowledgeResult,
} from "../ask-isa-v2-retrieval";

function buildResult(
  overrides: Partial<AskISAV2KnowledgeResult>
): AskISAV2KnowledgeResult {
  return {
    id: overrides.id ?? 1,
    sourceType: overrides.sourceType ?? "regulation",
    sourceId: overrides.sourceId ?? 1,
    title: overrides.title ?? "Untitled",
    content: overrides.content ?? "Generic supporting content.",
    url: overrides.url ?? null,
    authorityLevel: overrides.authorityLevel ?? "authoritative",
    semanticLayer: overrides.semanticLayer ?? "juridisch",
    sourceAuthority: overrides.sourceAuthority ?? null,
    similarity: overrides.similarity ?? 0.5,
    publishedDate: overrides.publishedDate,
    lastVerifiedDate: overrides.lastVerifiedDate,
    verificationAgeDays: overrides.verificationAgeDays,
    needsVerification: overrides.needsVerification,
    isDeprecated: overrides.isDeprecated,
    evidenceKey: overrides.evidenceKey,
    authorityTier: overrides.authorityTier,
    sourceRole: overrides.sourceRole,
    publicationStatus: overrides.publicationStatus,
    evidenceRole: overrides.evidenceRole,
    selectionReasons: overrides.selectionReasons,
    rawSourceType: overrides.rawSourceType,
    rawAuthorityLevel: overrides.rawAuthorityLevel,
    rawSemanticLayer: overrides.rawSemanticLayer,
  };
}

describe("expandEsrsStandardsForMappings", () => {
  it("normalizes prefixed and sub-clause ESRS codes to mapping keys", () => {
    expect(
      expandEsrsStandardsForMappings([
        "ESRS E1-6",
        "ESRS 2",
        "S1",
        "ESRS E1",
      ])
    ).toEqual(["E1", "ESRS 2", "S1"]);
  });
});

describe("rerankAskISAV2Results", () => {
  it("rescues exact ESRS clause matches above generic semantic neighbors", () => {
    const ranked = rerankAskISAV2Results("Explain ESRS E1-6 at a high level.", "GENERAL_QA", [
      buildResult({
        id: 1,
        sourceType: "regulation",
        title: "European Sustainability Reporting Standards (ESRS)",
        content: "Delegated regulation for ESRS.",
        similarity: 0.58,
      }),
      buildResult({
        id: 2,
        sourceType: "esrs_datapoint",
        title: "SBM-1_24 - ESRS 2",
        content: "Generic ESRS 2 datapoint.",
        similarity: 0.59,
        semanticLayer: "normatief",
      }),
      buildResult({
        id: 3,
        sourceType: "esrs_datapoint",
        title: "E1-6_02 - E1",
        content: "Exact E1-6 greenhouse gas emissions datapoint.",
        similarity: 0.55,
        semanticLayer: "normatief",
      }),
    ]);

    expect(ranked[0].title).toBe("European Sustainability Reporting Standards (ESRS)");
    expect(ranked[1].title).toBe("E1-6_02 - E1");
  });

  it("promotes a GS1 source to the top of broad mapping questions", () => {
    const ranked = rerankAskISAV2Results(
      "Which GS1 identifiers are relevant for a Digital Product Passport?",
      "ESRS_MAPPING",
      [
        buildResult({
          id: 1,
          sourceType: "regulation",
          title: "ESPR - Digital Product Passport Delegated Act",
          content: "Regulatory framework for the digital product passport.",
          similarity: 0.63,
        }),
        buildResult({
          id: 2,
          sourceType: "gs1_standard",
          title: "Digital Product Passport Framework",
          content: "GS1 identifier and resolver support for digital product passports.",
          similarity: 0.61,
          semanticLayer: "normatief",
        }),
      ]
    );

    expect(ranked[0].sourceType).toBe("gs1_standard");
    expect(ranked[0].title).toBe("Digital Product Passport Framework");
  });

  it("prefers a binding regulation as the primary basis for trust questions", () => {
    const ranked = rerankAskISAV2Results(
      "Which source should I trust for Digital Product Passport identifiers?",
      "GENERAL_QA",
      [
        buildResult({
          id: 1,
          sourceType: "gs1_standard",
          title: "Digital Product Passport Framework",
          content: "GS1 implementation guidance for product passport identifiers.",
          similarity: 0.62,
          sourceRole: "normative_authority",
          authorityTier: "GS1_Global",
          evidenceKey: "ke:1:hash",
          needsVerification: false,
        }),
        buildResult({
          id: 2,
          sourceType: "regulation",
          title: "ESPR - Digital Product Passport Delegated Act",
          content: "Binding delegated act for digital product passport requirements.",
          similarity: 0.58,
          sourceRole: "normative_authority",
          authorityTier: "EU",
          publicationStatus: "in_force",
          evidenceKey: "ke:2:hash",
          needsVerification: false,
        }),
      ]
    );

    expect(ranked[0].sourceType).toBe("regulation");
    expect(ranked[0].title).toContain("Delegated Act");
  });

  it("rescues the newest authoritative DPP source ahead of stale ESRS datapoints", () => {
    const ranked = rerankAskISAV2Results(
      "What is the newest authoritative source for DPP identifiers?",
      "GENERAL_QA",
      [
        buildResult({
          id: 1,
          sourceType: "esrs_datapoint",
          title: "BP-2_20 - ESRS 2",
          content: "Generic governance datapoint.",
          similarity: 0.77,
          authorityTier: "EFRAG",
          sourceRole: "canonical_technical_artifact",
          evidenceKey: "ke:1:hash",
          needsVerification: true,
          verificationAgeDays: 120,
        }),
        buildResult({
          id: 2,
          sourceType: "regulation",
          title: "ESPR - Digital Product Passport Delegated Act",
          content: "Binding Digital Product Passport identifier requirements.",
          similarity: 0.58,
          sourceRole: "normative_authority",
          authorityTier: "EU",
          publicationStatus: "in_force",
          evidenceKey: "ke:2:hash",
          needsVerification: false,
          verificationAgeDays: 20,
        }),
        buildResult({
          id: 3,
          sourceType: "gs1_standard",
          title: "Digital Product Passport Framework",
          content: "GS1 identifier guidance for DPP implementation.",
          similarity: 0.56,
          sourceRole: "normative_authority",
          authorityTier: "GS1_Global",
          evidenceKey: "ke:3:hash",
          needsVerification: false,
          verificationAgeDays: 18,
        }),
      ]
    );

    expect(ranked[0].title).toBe("ESPR - Digital Product Passport Delegated Act");
    expect(ranked[1].title).toBe("Digital Product Passport Framework");
  });

  it("pins the binding regulation ahead of GS1 guidance on explicit conflict questions", () => {
    const ranked = rerankAskISAV2Results(
      "Should I follow ESPR delegated act requirements or GS1 guidance when they differ on DPP identifiers?",
      "GENERAL_QA",
      [
        buildResult({
          id: 1,
          sourceType: "gs1_standard",
          title: "GS1 Electronics Passport Implementation",
          content: "Implementation guidance for DPP identifiers.",
          similarity: 0.67,
          sourceRole: "normative_authority",
          authorityTier: "GS1_Global",
          evidenceKey: "ke:1:hash",
          needsVerification: false,
        }),
        buildResult({
          id: 2,
          sourceType: "regulation",
          title: "ESPR - Digital Product Passport Delegated Act",
          content: "Binding delegated act requirements for DPP identifiers.",
          similarity: 0.61,
          sourceRole: "normative_authority",
          authorityTier: "EU",
          publicationStatus: "in_force",
          evidenceKey: "ke:2:hash",
          needsVerification: false,
        }),
      ]
    );

    expect(ranked[0].sourceType).toBe("regulation");
    expect(ranked[0].title).toContain("Delegated Act");
    expect(ranked[1].sourceType).toBe("gs1_standard");
  });

  it("keeps the delegated act ahead of the broader regulation on freshness-sensitive change questions", () => {
    const ranked = rerankAskISAV2Results(
      "What changed most recently for battery passport carbon footprint requirements?",
      "REGULATORY_CHANGE",
      [
        buildResult({
          id: 1,
          sourceType: "regulation",
          title: "EU Battery Regulation",
          content: "Battery passport framework requirements.",
          similarity: 0.66,
          sourceRole: "normative_authority",
          authorityTier: "EU",
          publicationStatus: "in_force",
          evidenceKey: "ke:1:hash",
          needsVerification: false,
          verificationAgeDays: 25,
        }),
        buildResult({
          id: 2,
          sourceType: "regulation",
          title: "Battery Regulation - Carbon Footprint Delegated Act",
          content: "Most recent carbon footprint delegated act for battery passports.",
          similarity: 0.61,
          sourceRole: "normative_authority",
          authorityTier: "EU",
          publicationStatus: "in_force",
          evidenceKey: "ke:2:hash",
          needsVerification: false,
          verificationAgeDays: 20,
        }),
      ]
    );

    expect(ranked[0].title).toBe(
      "Battery Regulation - Carbon Footprint Delegated Act"
    );
  });

  it("prefers the DPP delegated act over the broader ESPR regulation on newest-source questions", () => {
    const ranked = rerankAskISAV2Results(
      "What is the newest authoritative source for DPP identifiers?",
      "GENERAL_QA",
      [
        buildResult({
          id: 1,
          sourceType: "regulation",
          title: "Ecodesign for Sustainable Products Regulation (ESPR)",
          content: "Broader ecodesign regulation with DPP context.",
          similarity: 0.68,
          sourceRole: "normative_authority",
          authorityTier: "EU",
          publicationStatus: "in_force",
          evidenceKey: "ke:1:hash",
          needsVerification: false,
          verificationAgeDays: 25,
        }),
        buildResult({
          id: 2,
          sourceType: "regulation",
          title: "ESPR - Digital Product Passport Delegated Act",
          content: "Specific delegated act for Digital Product Passport identifiers.",
          similarity: 0.62,
          sourceRole: "normative_authority",
          authorityTier: "EU",
          publicationStatus: "in_force",
          evidenceKey: "ke:2:hash",
          needsVerification: false,
          verificationAgeDays: 20,
        }),
      ]
    );

    expect(ranked[0].title).toBe("ESPR - Digital Product Passport Delegated Act");
  });

  it("keeps exact ESRS evidence first while injecting GS1 support into mapping top-3", () => {
    const ranked = rerankAskISAV2Results(
      "Map GS1 attributes to ESRS E1-6 emissions disclosures.",
      "ESRS_MAPPING",
      [
        buildResult({
          id: 1,
          sourceType: "esrs_datapoint",
          title: "E1-6_07 - E1",
          content: "Exact E1-6 emissions disclosure datapoint.",
          similarity: 0.7,
          semanticLayer: "normatief",
        }),
        buildResult({
          id: 2,
          sourceType: "esrs_datapoint",
          title: "E1-6_11 - E1",
          content: "Another exact E1-6 datapoint.",
          similarity: 0.69,
          semanticLayer: "normatief",
        }),
        buildResult({
          id: 3,
          sourceType: "gs1_standard",
          title: "SSCC enables logistics emissions tracking for E1",
          content: "GS1 support signal for emissions traceability.",
          similarity: 0.56,
          authorityLevel: "guidance",
          semanticLayer: "operationeel",
        }),
      ]
    );

    expect(ranked[0].title).toBe("E1-6_07 - E1");
    expect(ranked.slice(0, 3).some(result => result.sourceType === "gs1_standard")).toBe(true);
  });

  it("demotes proxy-only GS1 support when the question asks for current verified evidence", () => {
    const ranked = rerankAskISAV2Results(
      "Map GS1 attributes to ESRS E1-6 emissions disclosures using only current verified evidence.",
      "ESRS_MAPPING",
      [
        buildResult({
          id: 1,
          sourceType: "gs1_standard",
          title: "SSCC enables logistics emissions tracking for E1",
          content: "Internal mapping proxy support signal.",
          similarity: 0.62,
          sourceAuthority: "internal_mapping",
          authorityLevel: "guidance",
          needsVerification: true,
          evidenceKey: null,
        }),
        buildResult({
          id: 2,
          sourceType: "gs1_standard",
          title: "Digital Product Passport Framework",
          content: "GS1 normative implementation guidance with current provenance.",
          similarity: 0.56,
          sourceRole: "normative_authority",
          authorityTier: "GS1_Global",
          evidenceKey: "ke:2:hash",
          needsVerification: false,
        }),
      ]
    );

    expect(ranked[0].title).toBe("Digital Product Passport Framework");
  });

  it("pins the binding regulation ahead of GS1 support for gap analysis questions", () => {
    const ranked = rerankAskISAV2Results(
      "What gaps remain between GS1 standards and the EU Battery Regulation?",
      "GAP_ANALYSIS",
      [
        buildResult({
          id: 1,
          sourceType: "gs1_standard",
          title: "GS1 Battery Passport Implementation",
          content: "GS1 implementation guidance for battery passport support.",
          similarity: 0.64,
          sourceRole: "normative_authority",
          authorityTier: "GS1_Global",
          evidenceKey: "ke:1:hash",
          needsVerification: false,
        }),
        buildResult({
          id: 2,
          sourceType: "regulation",
          title: "EU Battery Regulation",
          content: "Binding battery regulation requirements for product passports.",
          similarity: 0.6,
          sourceRole: "normative_authority",
          authorityTier: "EU",
          publicationStatus: "in_force",
          evidenceKey: "ke:2:hash",
          needsVerification: false,
        }),
      ]
    );

    expect(ranked[0].sourceType).toBe("regulation");
    expect(ranked[0].title).toBe("EU Battery Regulation");
    expect(ranked[1].sourceType).toBe("gs1_standard");
  });
});

describe("decision summary helpers", () => {
  it("labels primary and supporting evidence and emits caution flags", () => {
    const annotated = annotateAskISAV2DecisionRoles("Which source should I trust for Digital Product Passport identifiers?", [
      buildResult({
        id: 1,
        sourceType: "regulation",
        title: "ESPR - Digital Product Passport Delegated Act",
        sourceRole: "normative_authority",
        authorityTier: "EU",
        evidenceKey: "ke:1:hash",
        needsVerification: false,
      }),
      buildResult({
        id: 2,
        sourceType: "gs1_standard",
        title: "Digital Product Passport Framework",
        sourceRole: "normative_authority",
        authorityTier: "GS1_Global",
        evidenceKey: null,
        needsVerification: true,
        sourceAuthority: "internal_mapping",
      }),
    ]);

    const summary = buildAskISAV2DecisionSummary(
      "Which source should I trust for Digital Product Passport identifiers?",
      annotated
    );

    expect(summary?.primaryEvidence[0]?.title).toContain("Delegated Act");
    expect(summary?.supportingEvidence[0]?.title).toContain("Framework");
    expect(summary?.cautionFlags.join(" ")).toMatch(/verification/i);
    expect(summary?.cautionFlags.join(" ")).toMatch(/proxy/i);
  });

  it("builds explicit evidence choice, freshness, conflict, and next-step summaries for source-selection questions", () => {
    const annotated = annotateAskISAV2DecisionRoles(
      "What is the newest authoritative source for DPP identifiers?",
      [
        buildResult({
          id: 1,
          sourceType: "regulation",
          title: "ESPR - Digital Product Passport Delegated Act",
          sourceRole: "normative_authority",
          authorityTier: "EU",
          evidenceKey: "ke:1:hash",
          needsVerification: false,
        }),
        buildResult({
          id: 2,
          sourceType: "gs1_standard",
          title: "Digital Product Passport Framework",
          sourceRole: "normative_authority",
          authorityTier: "GS1_Global",
          evidenceKey: "ke:2:hash",
          needsVerification: false,
        }),
      ]
    );

    const summary = buildAskISAV2DecisionSummary(
      "What is the newest authoritative source for DPP identifiers?",
      annotated
    );

    expect(summary?.evidenceChoice).toMatch(/binding regulation basis/i);
    expect(summary?.freshnessSummary).toMatch(/current evidence-ready/i);
    expect(summary?.conflictSummary).toMatch(/regulation as binding/i);
    expect(summary?.nextStep).toMatch(/GS1 implementation details/i);
  });
});
