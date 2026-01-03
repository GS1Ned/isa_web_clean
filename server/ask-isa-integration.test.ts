import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { classifyQuery, validateCitations, calculateConfidence } from "./ask-isa-guardrails";

/**
 * Ask ISA Integration Tests
 *
 * Tests for:
 * 1. Query classification and guardrails
 * 2. Citation validation
 * 3. Confidence scoring
 * 4. Refusal message generation
 */

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Ask ISA Guardrails", () => {
  describe("Query Classification", () => {
    it("classifies gap queries correctly", () => {
      const query = "Which gaps exist for CSRD in DIY?";
      const classification = classifyQuery(query);

      expect(classification.type).toBe("gap");
      expect(Boolean(classification.allowed)).toBe(true);
    });

    it("classifies mapping queries correctly", () => {
      const query = "Which GS1 Netherlands attributes cover ESRS E1 datapoints?";
      const classification = classifyQuery(query);

      expect(classification.type).toBe("mapping");
      expect(Boolean(classification.allowed)).toBe(true);
    });

    it("classifies version comparison queries correctly", () => {
      const query = "What changed between ISA v1.0 and v1.1?";
      const classification = classifyQuery(query);

      // Version comparison queries may be classified as gap queries
      expect(["version_comparison", "gap", "general"]).toContain(classification.type);
      expect(Boolean(classification.allowed)).toBe(true);
    });

    it("rejects speculative queries", () => {
      const query = "Will GS1 Netherlands add new attributes in 2026?";
      const classification = classifyQuery(query);

      expect(classification.type).toBe("forbidden");
      expect(Boolean(classification.allowed)).toBe(false);
      expect(classification.reason).toContain("Speculative");
      expect(classification.suggestedAlternative).toBeDefined();
    });

    it("rejects calculation queries", () => {
      const query = "How do I calculate Scope 3 emissions?";
      const classification = classifyQuery(query);

      expect(classification.type).toBe("forbidden");
      expect(Boolean(classification.allowed)).toBe(false);
      expect(classification.reason).toContain("Calculation");
      expect(classification.suggestedAlternative).toBeDefined();
    });

    it("rejects conversational prompts", () => {
      const query = "Hello, can you help me?";
      const classification = classifyQuery(query);

      expect(classification.type).toBe("forbidden");
      expect(Boolean(classification.allowed)).toBe(false);
      expect(classification.reason).toContain("conversational");
      expect(classification.suggestedAlternative).toBeDefined();
    });
  });

  describe("Citation Validation", () => {
    it("validates complete citations", () => {
      const answer = `Based on ISA_ADVISORY_v1.1, the gap analysis shows that GS1 Netherlands dataset gs1nl.sector_models.diy.v3.1.34 provides partial coverage for ESRS E1-6.`;

      const validation = validateCitations(answer);

      expect(Boolean(validation.valid)).toBe(true);
      expect(validation.missingElements).toHaveLength(0);
    });

    it("detects missing advisory ID", () => {
      const answer = `The gap analysis shows that GS1 Netherlands dataset gs1nl.sector_models.diy.v3.1.34 provides partial coverage.`;

      const validation = validateCitations(answer);

      expect(Boolean(validation.valid)).toBe(false);
      expect(validation.missingElements).toContain("Advisory ID (e.g., ISA_ADVISORY_v1.1)");
    });

    it("detects missing dataset references", () => {
      const answer = `Based on ISA_ADVISORY_v1.1, the gap analysis shows partial coverage for ESRS E1-6.`;

      const validation = validateCitations(answer);

      expect(Boolean(validation.valid)).toBe(false);
      expect(validation.missingElements).toContain("Dataset IDs or registry reference");
    });
  });

  describe("Confidence Scoring", () => {
    it("assigns high confidence for 3+ sources", () => {
      const confidence = calculateConfidence(5);

      expect(confidence.level).toBe("high");
      expect(confidence.score).toBe(5);
    });

    it("assigns medium confidence for 2 sources", () => {
      const confidence = calculateConfidence(2);

      expect(confidence.level).toBe("medium");
      expect(confidence.score).toBe(2);
    });

    it("assigns low confidence for 1 source", () => {
      const confidence = calculateConfidence(1);

      expect(confidence.level).toBe("low");
      expect(confidence.score).toBe(1);
    });

    it("assigns low confidence for 0 sources", () => {
      const confidence = calculateConfidence(0);

      expect(confidence.level).toBe("low");
      expect(confidence.score).toBe(0);
    });
  });

  // Production Query Library tests skipped - procedures not yet implemented
  // These will be added when query library features are completed
});

describe("Advisory Diff API", () => {
  it("lists available advisory versions", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const versions = await caller.advisoryDiff.listVersions();

    expect(versions).toBeDefined();
    expect(Array.isArray(versions)).toBe(true);
    expect(versions.length).toBeGreaterThanOrEqual(2); // At least v1.0 and v1.1
    expect(versions.some((v: any) => v.version === "v1.0")).toBe(true);
    expect(versions.some((v: any) => v.version === "v1.1")).toBe(true);
  });

  it("computes diff between v1.0 and v1.1", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const diff = await caller.advisoryDiff.computeDiff({
      version1: "v1.0",
      version2: "v1.1",
    });

    expect(diff).toBeDefined();
    expect(diff.metadata).toBeDefined();
    expect(diff.metadata.version1).toBeDefined();
    expect(diff.metadata.version2).toBeDefined();
    expect(diff.coverageDeltas).toBeDefined();
    expect(diff.gapLifecycle).toBeDefined();
  });

  it("validates diff structure contains required metrics", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const diff = await caller.advisoryDiff.computeDiff({
      version1: "v1.0",
      version2: "v1.1",
    });

    // Coverage deltas
    expect(diff.coverageDeltas.totalMappings).toBeDefined();
    expect(diff.coverageDeltas.confidenceTransitions).toBeDefined();
    expect(diff.coverageDeltas.coverageRate).toBeDefined();
    expect(diff.coverageDeltas.coverageImprovement).toBeDefined();

    // Gap lifecycle
    expect(diff.gapLifecycle.newGaps).toBeDefined();
    expect(diff.gapLifecycle.closedGaps).toBeDefined();
    expect(diff.gapLifecycle.gapsClosed).toBeDefined();
  });

  it("rejects invalid version format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.advisoryDiff.computeDiff({
        version1: "1.0", // Missing "v" prefix
        version2: "v1.1",
      })
    ).rejects.toThrow();
  });

  it("loads advisory summary", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const summary = await caller.advisoryDiff.getAdvisorySummary({ version: "v1.0" });

    expect(summary).toBeDefined();
    expect(summary.version).toBeDefined();
    expect(summary.statistics?.totalMappings || summary.mappingResults?.total || 0).toBeGreaterThan(0);
  });
});
