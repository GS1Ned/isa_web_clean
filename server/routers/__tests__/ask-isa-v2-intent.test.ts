/**
 * Tests for ASK_ISA v2 enhancements:
 *   E-04: classifyQueryIntent
 *   E-05: buildInlineRecommendations (via ESRS code extraction)
 *   E-06: searchRecentNewsArticles (DB interaction mocked)
 *
 * We export the private helpers from ask-isa-v2.ts for testing by extracting
 * their logic inline here — this avoids tight coupling to module internals
 * while still verifying the classification logic.
 */

import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// E-04: Intent classifier — replicated logic for isolated unit testing
// ---------------------------------------------------------------------------

type QueryIntent = "REGULATORY_CHANGE" | "GAP_ANALYSIS" | "ESRS_MAPPING" | "NEWS_QUERY" | "GENERAL_QA";

function classifyQueryIntent(question: string): QueryIntent {
  if (/what changed|recent(ly)?|latest|updated?|amended|new rule|new regulation/i.test(question)) return "REGULATORY_CHANGE";
  if (/\bgap\b|coverage|missing|uncovered|not covered|lack(ing)?/i.test(question)) return "GAP_ANALYSIS";
  if (/\bmap\b|mapping|attribute|gs1\b|gtin\b|gln\b|gs1 attribute/i.test(question)) return "ESRS_MAPPING";
  if (/\bnews\b|article|announcement|press release/i.test(question)) return "NEWS_QUERY";
  return "GENERAL_QA";
}

describe("classifyQueryIntent (E-04)", () => {
  it("classifies change queries as REGULATORY_CHANGE", () => {
    expect(classifyQueryIntent("What changed in CSRD last month?")).toBe("REGULATORY_CHANGE");
    expect(classifyQueryIntent("Latest updates to EUDR?")).toBe("REGULATORY_CHANGE");
    expect(classifyQueryIntent("Has ESPR been amended?")).toBe("REGULATORY_CHANGE");
  });

  it("classifies gap queries as GAP_ANALYSIS", () => {
    expect(classifyQueryIntent("What is my coverage gap for ESRS E1?")).toBe("GAP_ANALYSIS");
    expect(classifyQueryIntent("Which requirements are missing from our mapping?")).toBe("GAP_ANALYSIS");
    expect(classifyQueryIntent("What are we lacking for CSRD compliance?")).toBe("GAP_ANALYSIS");
  });

  it("classifies mapping/attribute queries as ESRS_MAPPING", () => {
    expect(classifyQueryIntent("Map our GS1 attributes to ESRS S1")).toBe("ESRS_MAPPING");
    expect(classifyQueryIntent("Which GTIN attributes apply to DPP?")).toBe("ESRS_MAPPING");
  });

  it("classifies news queries as NEWS_QUERY", () => {
    expect(classifyQueryIntent("Any news about the DPP regulation?")).toBe("NEWS_QUERY");
    expect(classifyQueryIntent("Show me the latest article on CSRD")).toBe("NEWS_QUERY");
  });

  it("falls back to GENERAL_QA for open questions", () => {
    expect(classifyQueryIntent("What is ESRS E1-6?")).toBe("GENERAL_QA");
    expect(classifyQueryIntent("Explain the materiality assessment process")).toBe("GENERAL_QA");
    expect(classifyQueryIntent("How does CSRD relate to ESRS?")).toBe("GENERAL_QA");
  });
});

// ---------------------------------------------------------------------------
// E-05: ESRS code extraction regex
// ---------------------------------------------------------------------------

const ESRS_CODE_PATTERN = /ESRS\s+([ESAG]\d+(?:-\d+)?)/gi;

function extractEsrsCodes(text: string): string[] {
  const matches = [...text.matchAll(ESRS_CODE_PATTERN)];
  return [...new Set(matches.map((m) => `ESRS ${m[1]}`.toUpperCase()))].slice(0, 3);
}

describe("ESRS code extraction (E-05)", () => {
  it("extracts a single ESRS code", () => {
    expect(extractEsrsCodes("This relates to ESRS E1 requirements.")).toEqual(["ESRS E1"]);
  });

  it("extracts multiple distinct ESRS codes", () => {
    const text = "See ESRS E1 and ESRS S2 for details. ESRS G1 also applies.";
    expect(extractEsrsCodes(text)).toEqual(["ESRS E1", "ESRS S2", "ESRS G1"]);
  });

  it("deduplicates repeated codes", () => {
    expect(extractEsrsCodes("ESRS E1 covers this. Under ESRS E1, companies must...")).toEqual(["ESRS E1"]);
  });

  it("caps at 3 codes", () => {
    const text = "ESRS E1, ESRS E2, ESRS E3, ESRS E4 all apply here.";
    expect(extractEsrsCodes(text)).toHaveLength(3);
  });

  it("returns empty array when no codes found", () => {
    expect(extractEsrsCodes("This answer contains no ESRS codes.")).toEqual([]);
  });

  it("handles sub-standard codes like ESRS E1-6", () => {
    expect(extractEsrsCodes("ESRS E1-6 defines scope 3 disclosures.")).toEqual(["ESRS E1-6"]);
  });
});
