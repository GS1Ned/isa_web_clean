import { beforeEach, describe, expect, it } from "vitest";
import {
  cacheResponse,
  getCachedResponse,
  getCacheStats,
  invalidateCache,
} from "./ask-isa-cache";

function buildCachedResponse() {
  return {
    answer: "Test answer",
    sources: [
      {
        id: 1,
        type: "regulation",
        title: "CSRD",
        url: "https://example.com/csrd",
        similarity: 92,
      },
    ],
    confidence: {
      level: "high" as const,
      score: 0.85,
      sourceCount: 5,
    },
    claimVerification: {
      verificationRate: 0.8,
      totalClaims: 5,
      verifiedClaims: 4,
      unverifiedClaims: 1,
      warnings: [],
    },
    queryType: "gap",
    citationValid: true,
    missingCitations: [],
    authority: {
      score: 0.78,
      level: "verified",
    },
    responseMode: {
      mode: "full" as const,
      reason: "Evidence is sufficient",
      recommendations: [],
    },
    queryAnalysis: {
      isAmbiguous: false,
      relatedTopics: ["CSRD"],
    },
  };
}

describe("ask-isa-cache", () => {
  beforeEach(() => {
    invalidateCache();
  });

  it("scopes cache hits by sector", () => {
    cacheResponse("Which gaps exist for CSRD?", buildCachedResponse(), {
      sector: "diy",
    });

    expect(
      getCachedResponse("Which gaps exist for CSRD", {
        sector: "diy",
      })?.answer,
    ).toBe("Test answer");
    expect(
      getCachedResponse("Which gaps exist for CSRD", {
        sector: "fmcg",
      }),
    ).toBeNull();
  });

  it("bypasses caching for conversation-scoped queries", () => {
    cacheResponse("Follow up on that", buildCachedResponse(), {
      sector: "all",
      conversationId: 42,
    });

    expect(getCacheStats().totalEntries).toBe(0);
    expect(
      getCachedResponse("Follow up on that", {
        sector: "all",
        conversationId: 42,
      }),
    ).toBeNull();
  });

  it("preserves metadata needed for cache-hit parity", () => {
    cacheResponse("Which gaps exist for CSRD?", buildCachedResponse(), {
      sector: "all",
    });

    const cached = getCachedResponse("Which gaps exist for CSRD?", {
      sector: "all",
    });

    expect(cached?.confidence).toEqual({
      level: "high",
      score: 0.85,
      sourceCount: 5,
    });
    expect(cached?.queryType).toBe("gap");
    expect(cached?.authority).toEqual({
      score: 0.78,
      level: "verified",
    });
    expect(cached?.responseMode?.mode).toBe("full");
  });
});
