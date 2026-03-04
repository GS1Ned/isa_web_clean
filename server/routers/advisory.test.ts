import { describe, expect, it } from "vitest";

import { appRouter } from "../routers";
import type { Context } from "../_core/context";

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

    expect(regulations.total).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(regulations.regulations)).toBe(true);
    expect(sectorModels.total).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(sectorModels.sectorModels)).toBe(true);
  });
});
