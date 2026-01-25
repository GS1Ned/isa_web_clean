/**
 * Phase 3 News Sources Tests
 * Tests for coverage expansion and intelligence keyword detection
 */

import { describe, it, expect } from "vitest";
import {
  PHASE3_SOURCES,
  PHASE3_SOURCE_STATS,
  CSDDD_SOURCES,
  GREEN_CLAIMS_SOURCES,
  ESPR_SOURCES,
  NL_SPECIFIC_SOURCES,
  EXTENDED_OBLIGATION_KEYWORDS,
  EXTENDED_NEGATIVE_SIGNAL_KEYWORDS,
  detectObligations,
  detectExtendedNegativeSignals,
  getPhase3SourceById,
  getPhase3SourcesByCoverage,
  getPhase3SourcesByTier,
} from "./news-sources-phase3";

describe("Phase 3 Source Configuration", () => {
  describe("Source Count Requirements", () => {
    it("should have at least 8 new sources total", () => {
      expect(PHASE3_SOURCES.length).toBeGreaterThanOrEqual(8);
    });

    it("should have at least 3 CSDDD sources with 2+ Tier 1", () => {
      expect(CSDDD_SOURCES.length).toBeGreaterThanOrEqual(3);
      const tier1Count = CSDDD_SOURCES.filter(s => s.authorityTier === "TIER_1").length;
      expect(tier1Count).toBeGreaterThanOrEqual(2);
    });

    it("should have at least 2 Green Claims sources with 1+ Tier 1", () => {
      expect(GREEN_CLAIMS_SOURCES.length).toBeGreaterThanOrEqual(2);
      const tier1Count = GREEN_CLAIMS_SOURCES.filter(s => s.authorityTier === "TIER_1").length;
      expect(tier1Count).toBeGreaterThanOrEqual(1);
    });

    it("should have at least 2 ESPR sources with 1+ Tier 1", () => {
      expect(ESPR_SOURCES.length).toBeGreaterThanOrEqual(2);
      const tier1Count = ESPR_SOURCES.filter(s => s.authorityTier === "TIER_1").length;
      expect(tier1Count).toBeGreaterThanOrEqual(1);
    });

    it("should have NL-specific sources", () => {
      expect(NL_SPECIFIC_SOURCES.length).toBeGreaterThan(0);
    });
  });

  describe("Source Structure Validation", () => {
    it("all sources should have required fields", () => {
      for (const source of PHASE3_SOURCES) {
        expect(source.id).toBeDefined();
        expect(source.name).toBeDefined();
        expect(source.type).toBeDefined();
        expect(source.authorityTier).toMatch(/^TIER_[123]$/);
        expect(source.coverageArea).toBeDefined();
        expect(source.credibilityScore).toBeGreaterThanOrEqual(0);
        expect(source.credibilityScore).toBeLessThanOrEqual(1);
        expect(source.keywords).toBeInstanceOf(Array);
        expect(source.keywords.length).toBeGreaterThan(0);
        expect(source.addedInPhase).toBe(3);
      }
    });

    it("Tier 1 sources should have credibility score of 1.0", () => {
      const tier1Sources = PHASE3_SOURCES.filter(s => s.authorityTier === "TIER_1");
      for (const source of tier1Sources) {
        expect(source.credibilityScore).toBe(1.0);
      }
    });

    it("Tier 2 sources should have credibility score of 0.9", () => {
      const tier2Sources = PHASE3_SOURCES.filter(s => s.authorityTier === "TIER_2");
      for (const source of tier2Sources) {
        expect(source.credibilityScore).toBe(0.9);
      }
    });

    it("Tier 3 sources should have credibility score of 0.8", () => {
      const tier3Sources = PHASE3_SOURCES.filter(s => s.authorityTier === "TIER_3");
      for (const source of tier3Sources) {
        expect(source.credibilityScore).toBe(0.8);
      }
    });
  });

  describe("Source Statistics", () => {
    it("should have accurate total count", () => {
      expect(PHASE3_SOURCE_STATS.total).toBe(PHASE3_SOURCES.length);
    });

    it("should have accurate tier breakdown", () => {
      const tier1Count = PHASE3_SOURCES.filter(s => s.authorityTier === "TIER_1").length;
      const tier2Count = PHASE3_SOURCES.filter(s => s.authorityTier === "TIER_2").length;
      const tier3Count = PHASE3_SOURCES.filter(s => s.authorityTier === "TIER_3").length;
      
      expect(PHASE3_SOURCE_STATS.byTier.TIER_1).toBe(tier1Count);
      expect(PHASE3_SOURCE_STATS.byTier.TIER_2).toBe(tier2Count);
      expect(PHASE3_SOURCE_STATS.byTier.TIER_3).toBe(tier3Count);
    });

    it("should have accurate coverage breakdown", () => {
      expect(PHASE3_SOURCE_STATS.byCoverage.CSDDD).toBe(CSDDD_SOURCES.length);
      expect(PHASE3_SOURCE_STATS.byCoverage.GREEN_CLAIMS).toBe(GREEN_CLAIMS_SOURCES.length);
      expect(PHASE3_SOURCE_STATS.byCoverage.ESPR).toBe(ESPR_SOURCES.length);
      expect(PHASE3_SOURCE_STATS.byCoverage.NL_SPECIFIC).toBe(NL_SPECIFIC_SOURCES.length);
    });
  });

  describe("Helper Functions", () => {
    it("getPhase3SourceById should return correct source", () => {
      const source = getPhase3SourceById("ec-dg-just-csddd");
      expect(source).toBeDefined();
      expect(source?.name).toContain("DG JUST");
    });

    it("getPhase3SourceById should return undefined for unknown ID", () => {
      const source = getPhase3SourceById("unknown-source");
      expect(source).toBeUndefined();
    });

    it("getPhase3SourcesByCoverage should return correct sources", () => {
      const csdddSources = getPhase3SourcesByCoverage("CSDDD");
      expect(csdddSources.length).toBe(CSDDD_SOURCES.length);
      
      const greenClaimsSources = getPhase3SourcesByCoverage("GREEN_CLAIMS");
      expect(greenClaimsSources.length).toBe(GREEN_CLAIMS_SOURCES.length);
    });

    it("getPhase3SourcesByTier should return correct sources", () => {
      const tier1Sources = getPhase3SourcesByTier("TIER_1");
      expect(tier1Sources.every(s => s.authorityTier === "TIER_1")).toBe(true);
    });
  });
});

describe("Extended Obligation Keywords", () => {
  it("should have at least 20 obligation keywords", () => {
    expect(EXTENDED_OBLIGATION_KEYWORDS.length).toBeGreaterThanOrEqual(20);
  });

  it("should include core obligation terms", () => {
    const coreTerms = ["shall", "must", "required", "mandatory"];
    for (const term of coreTerms) {
      expect(EXTENDED_OBLIGATION_KEYWORDS).toContain(term);
    }
  });

  it("should include prohibition terms", () => {
    const prohibitionTerms = ["prohibited", "shall not", "must not"];
    for (const term of prohibitionTerms) {
      expect(EXTENDED_OBLIGATION_KEYWORDS).toContain(term);
    }
  });
});

describe("Extended Negative Signal Keywords", () => {
  it("should have at least 5 categories", () => {
    const categories = Object.keys(EXTENDED_NEGATIVE_SIGNAL_KEYWORDS);
    expect(categories.length).toBeGreaterThanOrEqual(5);
  });

  it("should have at least 15 total keywords across categories", () => {
    let totalKeywords = 0;
    for (const keywords of Object.values(EXTENDED_NEGATIVE_SIGNAL_KEYWORDS)) {
      totalKeywords += keywords.length;
    }
    expect(totalKeywords).toBeGreaterThanOrEqual(15);
  });

  it("should include DELAY category with relevant keywords", () => {
    expect(EXTENDED_NEGATIVE_SIGNAL_KEYWORDS.DELAY).toBeDefined();
    expect(EXTENDED_NEGATIVE_SIGNAL_KEYWORDS.DELAY).toContain("delay");
    expect(EXTENDED_NEGATIVE_SIGNAL_KEYWORDS.DELAY).toContain("postpone");
  });

  it("should include EXEMPTION category with relevant keywords", () => {
    expect(EXTENDED_NEGATIVE_SIGNAL_KEYWORDS.EXEMPTION).toBeDefined();
    expect(EXTENDED_NEGATIVE_SIGNAL_KEYWORDS.EXEMPTION).toContain("exemption");
    expect(EXTENDED_NEGATIVE_SIGNAL_KEYWORDS.EXEMPTION).toContain("waiver");
  });

  it("should include SOFTENING category with relevant keywords", () => {
    expect(EXTENDED_NEGATIVE_SIGNAL_KEYWORDS.SOFTENING).toBeDefined();
    expect(EXTENDED_NEGATIVE_SIGNAL_KEYWORDS.SOFTENING).toContain("softened");
    expect(EXTENDED_NEGATIVE_SIGNAL_KEYWORDS.SOFTENING).toContain("relaxed");
  });
});

describe("detectObligations Function", () => {
  it("should detect strong obligation keywords", () => {
    const result = detectObligations("Companies shall report their emissions annually");
    expect(result.hasObligation).toBe(true);
    expect(result.keywords).toContain("shall");
    expect(result.strength).toBe("strong");
  });

  it("should detect mandatory requirements", () => {
    const result = detectObligations("This is a mandatory requirement for all entities");
    expect(result.hasObligation).toBe(true);
    expect(result.keywords).toContain("mandatory");
    expect(result.strength).toBe("strong");
  });

  it("should detect prohibition terms", () => {
    const result = detectObligations("Companies must not make unsubstantiated claims");
    expect(result.hasObligation).toBe(true);
    expect(result.keywords).toContain("must not");
    expect(result.strength).toBe("strong");
  });

  it("should detect moderate obligation keywords", () => {
    const result = detectObligations("Companies must comply with the new deadline");
    expect(result.hasObligation).toBe(true);
    expect(result.keywords).toContain("comply");
    expect(result.keywords).toContain("deadline");
  });

  it("should return no obligation for neutral text", () => {
    const result = detectObligations("The Commission discussed potential approaches");
    expect(result.hasObligation).toBe(false);
    expect(result.keywords).toHaveLength(0);
    expect(result.strength).toBe("weak");
  });

  it("should handle case-insensitive matching", () => {
    const result = detectObligations("COMPANIES SHALL REPORT");
    expect(result.hasObligation).toBe(true);
    expect(result.keywords).toContain("shall");
  });

  it("should detect multiple obligation keywords", () => {
    const result = detectObligations("Companies shall comply with mandatory requirements by the deadline");
    expect(result.hasObligation).toBe(true);
    expect(result.keywords.length).toBeGreaterThan(1);
  });
});

describe("detectExtendedNegativeSignals Function", () => {
  it("should detect delay signals", () => {
    const result = detectExtendedNegativeSignals("Implementation has been delayed until 2026");
    expect(result.isNegative).toBe(true);
    expect(result.categories).toContain("DELAY");
    expect(result.keywords).toContain("delayed");
  });

  it("should detect exemption signals", () => {
    const result = detectExtendedNegativeSignals("SMEs are exempt from these requirements");
    expect(result.isNegative).toBe(true);
    expect(result.categories).toContain("EXEMPTION");
    expect(result.keywords).toContain("exempt");
  });

  it("should detect softening signals", () => {
    const result = detectExtendedNegativeSignals("Requirements have been relaxed for smaller companies");
    expect(result.isNegative).toBe(true);
    expect(result.categories).toContain("SOFTENING");
    expect(result.keywords).toContain("relaxed");
  });

  it("should detect rollback signals with high severity", () => {
    const result = detectExtendedNegativeSignals("The proposal has been withdrawn");
    expect(result.isNegative).toBe(true);
    expect(result.categories).toContain("ROLLBACK");
    expect(result.severity).toBe("high");
  });

  it("should detect exemption signals with high severity", () => {
    const result = detectExtendedNegativeSignals("A waiver has been granted for certain sectors");
    expect(result.isNegative).toBe(true);
    expect(result.categories).toContain("EXEMPTION");
    expect(result.severity).toBe("high");
  });

  it("should detect delay signals with medium severity", () => {
    const result = detectExtendedNegativeSignals("The deadline has been postponed");
    expect(result.isNegative).toBe(true);
    expect(result.categories).toContain("DELAY");
    expect(result.severity).toBe("medium");
  });

  it("should return no negative signals for positive text", () => {
    const result = detectExtendedNegativeSignals("The regulation has been adopted and enters into force");
    expect(result.isNegative).toBe(false);
    expect(result.categories).toHaveLength(0);
    expect(result.severity).toBe("low");
  });

  it("should handle case-insensitive matching", () => {
    const result = detectExtendedNegativeSignals("THE DEADLINE HAS BEEN POSTPONED");
    expect(result.isNegative).toBe(true);
    expect(result.keywords).toContain("postponed");
  });

  it("should detect multiple categories", () => {
    const result = detectExtendedNegativeSignals("The requirement has been delayed and exemptions have been added");
    expect(result.isNegative).toBe(true);
    expect(result.categories.length).toBeGreaterThan(1);
  });

  it("should detect uncertainty signals", () => {
    const result = detectExtendedNegativeSignals("The scope remains unclear and is pending clarification");
    expect(result.isNegative).toBe(true);
    expect(result.categories).toContain("UNCERTAINTY");
  });
});
