import { describe, expect, it } from "vitest";

import { appRouter } from "../routers";
import type { Context } from "../_core/context";
import { normalizeAdvisoryVersionTag } from "../advisory-legacy-compat";

const mockContext: Context = {
  user: null,
  req: {} as any,
  res: {} as any,
};

describe("advisory router", () => {
  it("serves mappings from the normalized advisory read model", async () => {
    const caller = appRouter.createCaller(mockContext);

    const result = await caller.advisory.getMappings({
      confidence: "direct",
    });

    expect(result.total).toBeGreaterThanOrEqual(0);
    if (result.mappings.length > 0) {
      expect(result.mappings[0]).toHaveProperty("mappingId");
      expect(result.mappings[0]).toHaveProperty("regulationDatapoint");
      expect(result.mappings[0]).toHaveProperty("confidence", "direct");
    }
  });

  it("serves gaps from the normalized advisory read model", async () => {
    const caller = appRouter.createCaller(mockContext);

    const result = await caller.advisory.getGaps({
      severity: "critical",
    });

    expect(result.total).toBeGreaterThanOrEqual(0);
    if (result.gaps.length > 0) {
      expect(result.gaps[0]).toHaveProperty("gapId");
      expect(result.gaps[0]).toHaveProperty("category", "critical");
    }
  });

  it("serves recommendations from the normalized advisory read model", async () => {
    const caller = appRouter.createCaller(mockContext);

    const result = await caller.advisory.getRecommendations({
      timeframe: "medium-term",
    });

    expect(result.total).toBeGreaterThanOrEqual(0);
    if (result.recommendations.length > 0) {
      expect(result.recommendations[0]).toHaveProperty("recommendationId");
      expect(result.recommendations[0]).toHaveProperty("timeframe", "medium-term");
    }
  });

  it("returns regulations and sector models from the advisory read model", async () => {
    const caller = appRouter.createCaller(mockContext);

    const regulations = await caller.advisory.getRegulations();
    const sectorModels = await caller.advisory.getSectorModels();

    expect(regulations.total).toBeGreaterThan(0);
    expect(Array.isArray(regulations.regulations)).toBe(true);
    expect(
      regulations.regulations.some((regulation: any) =>
        String(regulation?.name ?? regulation?.id ?? "").includes("ESRS E1"),
      ),
    ).toBe(true);
    expect(sectorModels.total).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(sectorModels.sectorModels)).toBe(true);
  });

  it("serves an overview bundle for active advisory UI surfaces", async () => {
    const caller = appRouter.createCaller(mockContext);

    const result = await caller.advisory.getOverview();

    expect(result.summary).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect(result.summary.version).toBeDefined();
    expect(result.metadata.advisoryId).toBeDefined();
    expect(result.latestReport == null || typeof result.latestReport.id === "number").toBe(true);
  });

  it("keeps summary and metadata aligned with the overview bundle", async () => {
    const caller = appRouter.createCaller(mockContext);

    const [overview, summary, metadata] = await Promise.all([
      caller.advisory.getOverview(),
      caller.advisory.getSummary(),
      caller.advisory.getMetadata(),
    ]);

    expect(summary).toEqual(overview.summary);
    expect(metadata).toEqual(overview.metadata);
  });

  it("keeps advisory.getDiff aligned with the snapshot-aware diff runtime", async () => {
    const caller = appRouter.createCaller(mockContext);

    const diff = await caller.advisory.getDiff({
      version1: "v1.0",
      version2: "v1.1",
    });

    expect(diff.metadata).toBeDefined();
    expect(diff.coverageDeltas).toBeDefined();
    expect(diff.gapLifecycle).toBeDefined();
    expect(diff.recommendationLifecycle).toBeDefined();
    expect(diff.snapshotBacked).toBeDefined();
  });

  it("serves the active advisory summary from the normalized current version", async () => {
    const caller = appRouter.createCaller(mockContext);
    const overview = await caller.advisory.getOverview();
    const activeVersion = normalizeAdvisoryVersionTag(String(overview.summary.version));

    const summary = await caller.advisoryDiff.getAdvisorySummary({
      version: activeVersion,
    });

    expect(summary.version).toBe(overview.summary.version);
    expect(summary.advisoryId).toBe(overview.summary.advisoryId);
  });
});
