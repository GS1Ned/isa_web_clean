/**
 * Tests for ASK_ISA v2 enhancements:
 *   E-04: classifyQueryIntent
 *   E-05: ESRS code extraction
 *   E-07: intent-aware retrieval planning and mapping-signal extraction
 */

import { describe, it, expect } from "vitest";
import {
  buildIntentRetrievalPlan,
  classifyQueryIntent,
  deriveMappingSignals,
  extractEsrsStandards,
  mapAskISAV2AuthorityLevel,
  mergeKnowledgeResults,
} from "../ask-isa-v2-intelligence";

describe("classifyQueryIntent (E-04)", () => {
  it("classifies change queries as REGULATORY_CHANGE", () => {
    expect(classifyQueryIntent("What changed in CSRD last month?")).toBe(
      "REGULATORY_CHANGE"
    );
    expect(classifyQueryIntent("Latest updates to EUDR?")).toBe(
      "REGULATORY_CHANGE"
    );
    expect(classifyQueryIntent("Has ESPR been amended?")).toBe(
      "REGULATORY_CHANGE"
    );
  });

  it("classifies gap queries as GAP_ANALYSIS", () => {
    expect(classifyQueryIntent("What is my coverage gap for ESRS E1?")).toBe(
      "GAP_ANALYSIS"
    );
    expect(
      classifyQueryIntent(
        "What gaps remain between GS1 standards and the EU Battery Regulation?"
      )
    ).toBe("GAP_ANALYSIS");
    expect(
      classifyQueryIntent("Which requirements are missing from our mapping?")
    ).toBe("GAP_ANALYSIS");
    expect(
      classifyQueryIntent("What are we lacking for CSRD compliance?")
    ).toBe("GAP_ANALYSIS");
  });

  it("classifies mapping/attribute queries as ESRS_MAPPING", () => {
    expect(classifyQueryIntent("Map our GS1 attributes to ESRS S1")).toBe(
      "ESRS_MAPPING"
    );
    expect(classifyQueryIntent("Which GTIN attributes apply to DPP?")).toBe(
      "ESRS_MAPPING"
    );
  });

  it("classifies news queries as NEWS_QUERY", () => {
    expect(classifyQueryIntent("Any news about the DPP regulation?")).toBe(
      "NEWS_QUERY"
    );
    expect(classifyQueryIntent("Show me the latest article on CSRD")).toBe(
      "NEWS_QUERY"
    );
  });

  it("falls back to GENERAL_QA for open questions", () => {
    expect(classifyQueryIntent("What is ESRS E1-6?")).toBe("GENERAL_QA");
    expect(
      classifyQueryIntent("Explain the materiality assessment process")
    ).toBe("GENERAL_QA");
    expect(classifyQueryIntent("How does CSRD relate to ESRS?")).toBe(
      "GENERAL_QA"
    );
  });
});

describe("ESRS code extraction (E-05)", () => {
  it("extracts a single ESRS code", () => {
    expect(
      extractEsrsStandards("This relates to ESRS E1 requirements.")
    ).toEqual(["ESRS E1"]);
  });

  it("extracts multiple distinct ESRS codes", () => {
    const text = "See ESRS E1 and ESRS S2 for details. ESRS G1 also applies.";
    expect(extractEsrsStandards(text)).toEqual([
      "ESRS E1",
      "ESRS S2",
      "ESRS G1",
    ]);
  });

  it("deduplicates repeated codes", () => {
    expect(
      extractEsrsStandards(
        "ESRS E1 covers this. Under ESRS E1, companies must..."
      )
    ).toEqual(["ESRS E1"]);
  });

  it("caps at 3 codes", () => {
    const text =
      "ESRS E1, ESRS E2, ESRS E3, ESRS E4, ESRS E5, ESRS G1, ESRS S1 all apply here.";
    expect(extractEsrsStandards(text)).toHaveLength(6);
  });

  it("returns empty array when no codes found", () => {
    expect(extractEsrsStandards("This answer contains no ESRS codes.")).toEqual(
      []
    );
  });

  it("handles sub-standard codes like ESRS E1-6", () => {
    expect(
      extractEsrsStandards("ESRS E1-6 defines scope 3 disclosures.")
    ).toEqual(["ESRS E1-6"]);
  });
});

describe("buildIntentRetrievalPlan (E-07)", () => {
  it("prioritizes regulation/news for regulatory change questions", () => {
    const plan = buildIntentRetrievalPlan("REGULATORY_CHANGE");

    expect(plan.label).toBe("binding-and-freshness-first");
    expect(plan.primary.sourceTypes).toEqual(["regulation", "news"]);
    expect(plan.primary.authorityLevels).toContain("binding");
  });

  it("prioritizes ESRS and GS1 sources for mapping questions", () => {
    const plan = buildIntentRetrievalPlan("ESRS_MAPPING");

    expect(plan.primary.sourceTypes).toEqual([
      "esrs_datapoint",
      "gs1_standard",
      "regulation",
    ]);
    expect(plan.promptGuidance).toMatch(
      /direct mappings, proxy mappings, and no-coverage/i
    );
  });
});

describe("deriveMappingSignals (E-07)", () => {
  it("extracts regulation ids and ESRS standards from question and retrieved evidence", () => {
    const signals = deriveMappingSignals(
      "Map ESRS E1-6 to GS1 attributes for CSRD",
      [
        {
          id: 1,
          sourceType: "regulation",
          sourceId: 42,
          title: "CSRD Regulation",
          content: "Corporate Sustainability Reporting Directive",
          similarity: 0.81,
        },
        {
          id: 2,
          sourceType: "esrs_datapoint",
          sourceId: 77,
          title: "ESRS E1-6 Gross Scope 1, 2, and 3 emissions",
          content: "Detailed emissions disclosure requirement under ESRS E1-6.",
          similarity: 0.74,
        },
      ]
    );

    expect(signals.regulationIds).toEqual([42]);
    expect(signals.esrsStandards).toContain("ESRS E1-6");
  });
});

describe("mergeKnowledgeResults (E-07)", () => {
  it("deduplicates by source type and source id while preserving the highest similarity", () => {
    const merged = mergeKnowledgeResults([
      [
        {
          id: 1,
          sourceType: "regulation",
          sourceId: 100,
          title: "CSRD",
          content: "First pass",
          similarity: 0.58,
        },
      ],
      [
        {
          id: 99,
          sourceType: "regulation",
          sourceId: 100,
          title: "CSRD",
          content: "Better pass",
          similarity: 0.84,
          authorityLevel: "binding",
        },
      ],
    ]);

    expect(merged).toHaveLength(1);
    expect(merged[0].similarity).toBe(0.84);
    expect(merged[0].content).toBe("Better pass");
    expect(merged[0].authorityLevel).toBe("binding");
  });
});

describe("mapAskISAV2AuthorityLevel", () => {
  it("maps v2 authority labels to the shared Ask ISA UI levels", () => {
    expect(mapAskISAV2AuthorityLevel("binding")).toBe("official");
    expect(mapAskISAV2AuthorityLevel("authoritative")).toBe("verified");
    expect(mapAskISAV2AuthorityLevel("guidance")).toBe("guidance");
    expect(mapAskISAV2AuthorityLevel("informational")).toBe("industry");
    expect(mapAskISAV2AuthorityLevel(undefined)).toBe("community");
  });
});
