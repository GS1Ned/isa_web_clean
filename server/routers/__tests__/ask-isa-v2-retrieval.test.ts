import { describe, expect, it } from "vitest";

import {
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
});
