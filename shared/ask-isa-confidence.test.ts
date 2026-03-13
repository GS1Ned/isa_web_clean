import { describe, expect, it } from "vitest";
import {
  calculateAskIsaConfidenceFromSourceCount,
  formatAskIsaConfidencePercent,
  formatAskIsaSourceCount,
  normalizeAskIsaConfidenceScore,
} from "./ask-isa-confidence";

describe("ask-isa-confidence", () => {
  it("returns a normalized confidence object with explicit source counts", () => {
    expect(calculateAskIsaConfidenceFromSourceCount(0)).toEqual({
      level: "low",
      score: 0,
      sourceCount: 0,
    });
    expect(calculateAskIsaConfidenceFromSourceCount(2)).toEqual({
      level: "medium",
      score: 0.65,
      sourceCount: 2,
    });
    expect(calculateAskIsaConfidenceFromSourceCount(5)).toEqual({
      level: "high",
      score: 0.85,
      sourceCount: 5,
    });
  });

  it("normalizes legacy stored source-count confidence values", () => {
    expect(normalizeAskIsaConfidenceScore(5, 5)).toBe(0.85);
    expect(normalizeAskIsaConfidenceScore(null, 2)).toBe(0.65);
    expect(normalizeAskIsaConfidenceScore(0.72, 4)).toBe(0.72);
  });

  it("formats confidence percentages and source labels for UI use", () => {
    expect(formatAskIsaConfidencePercent(0.85, 5)).toBe("85%");
    expect(formatAskIsaConfidencePercent(5, 5)).toBe("85%");
    expect(formatAskIsaSourceCount(1)).toBe("1 source");
    expect(formatAskIsaSourceCount(3)).toBe("3 sources");
  });
});
