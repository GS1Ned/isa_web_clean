import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

// Mock context for testing
const mockContext: Context = {
  user: null,
  req: {} as any,
  res: {} as any,
};

const hasDb = Boolean(process.env.DATABASE_URL);
const describeDb = hasDb ? describe : describe.skip;

describeDb("ESRS Datapoints Router", () => {
  it("should list ESRS datapoints with pagination", async () => {
    const caller = appRouter.createCaller(mockContext);

    const result = await caller.esrs.list({
      page: 1,
      pageSize: 10,
    });

    expect(result).toBeDefined();
    expect(result.datapoints).toBeInstanceOf(Array);
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.totalPages).toBeGreaterThanOrEqual(0);
  });

  it("should filter datapoints by search keyword", async () => {
    const caller = appRouter.createCaller(mockContext);

    const result = await caller.esrs.list({
      page: 1,
      pageSize: 50,
      search: "emissions",
    });

    expect(result).toBeDefined();
    expect(result.datapoints).toBeInstanceOf(Array);
    // Should find some datapoints with "emissions" in name or ID
    if (result.datapoints.length > 0) {
      const hasEmissions = result.datapoints.some(
        dp =>
          dp.name?.toLowerCase().includes("emissions") ||
          dp.datapointId?.toLowerCase().includes("emissions") ||
          dp.disclosureRequirement?.toLowerCase().includes("emissions")
      );
      expect(hasEmissions).toBe(true);
    }
  });

  it("should filter datapoints by ESRS standard", async () => {
    const caller = appRouter.createCaller(mockContext);

    const result = await caller.esrs.list({
      page: 1,
      pageSize: 50,
      standard: "E1",
    });

    expect(result).toBeDefined();
    expect(result.datapoints).toBeInstanceOf(Array);
    // All results should be from E1
    if (result.datapoints.length > 0) {
      const allE1 = result.datapoints.every(
        dp => dp.esrsStandard === "E1"
      );
      expect(allE1).toBe(true);
    }
  });

  it("should filter datapoints by data type", async () => {
    const caller = appRouter.createCaller(mockContext);

    const result = await caller.esrs.list({
      page: 1,
      pageSize: 50,
      data_type: "narrative",
    });

    expect(result).toBeDefined();
    expect(result.datapoints).toBeInstanceOf(Array);
    // All results should contain "narrative" in data type
    if (result.datapoints.length > 0) {
      const allNarrative = result.datapoints.every(dp =>
        dp.dataType?.toLowerCase().includes("narrative")
      );
      expect(allNarrative).toBe(true);
    }
  });

  it("should filter datapoints by voluntary status", async () => {
    const caller = appRouter.createCaller(mockContext);

    const result = await caller.esrs.list({
      page: 1,
      pageSize: 50,
      voluntary: false, // Mandatory only
    });

    expect(result).toBeDefined();
    expect(result.datapoints).toBeInstanceOf(Array);
    // All results should be mandatory (voluntary = 0 or false)
    if (result.datapoints.length > 0) {
      const allMandatory = result.datapoints.every(
        dp => dp.voluntary === 0 || dp.voluntary === false
      );
      expect(allMandatory).toBe(true);
    }
  });

  it("should return unique ESRS standards", async () => {
    const caller = appRouter.createCaller(mockContext);

    const standards = await caller.esrs.getStandards();

    expect(standards).toBeInstanceOf(Array);
    // If data exists, validate structure
    if (standards.length > 0) {
      expect(standards).toContain("ESRS 2");
      expect(standards.some(s => s.startsWith("E"))).toBe(true); // Environmental (E1-E5)
      expect(standards.some(s => s.startsWith("S"))).toBe(true); // Social (S1-S4)
    }
  });

  it("should return statistics about ESRS datapoints", async () => {
    const caller = appRouter.createCaller(mockContext);

    const stats = await caller.esrs.getStats();

    expect(stats).toBeDefined();
    expect(stats.total).toBeGreaterThanOrEqual(0);
    expect(stats.byStandard).toBeDefined();
    expect(stats.byDataType).toBeDefined();
    // If data exists, validate structure
    if (stats.total > 0) {
      expect(Object.keys(stats.byStandard).length).toBeGreaterThan(0);
      expect(Object.keys(stats.byDataType).length).toBeGreaterThan(0);
    }
  });

  it("should handle pagination correctly", async () => {
    const caller = appRouter.createCaller(mockContext);

    // Get first page
    const page1 = await caller.esrs.list({
      page: 1,
      pageSize: 10,
    });

    // Get second page
    const page2 = await caller.esrs.list({
      page: 2,
      pageSize: 10,
    });

    expect(page1.datapoints).toBeInstanceOf(Array);
    expect(page2.datapoints).toBeInstanceOf(Array);

    // Pages should have different datapoints
    if (page1.datapoints.length > 0 && page2.datapoints.length > 0) {
      const page1Ids = page1.datapoints.map(dp => dp.id);
      const page2Ids = page2.datapoints.map(dp => dp.id);
      const overlap = page1Ids.filter(id => page2Ids.includes(id));
      expect(overlap.length).toBe(0); // No overlap between pages
    }
  });

  it("should return empty results for non-existent search", async () => {
    const caller = appRouter.createCaller(mockContext);

    const result = await caller.esrs.list({
      page: 1,
      pageSize: 50,
      search: "xyznonexistentterm123",
    });

    expect(result).toBeDefined();
    expect(result.datapoints).toBeInstanceOf(Array);
    expect(result.datapoints.length).toBe(0);
    expect(result.total).toBe(0);
  });

  it("should handle combined filters", async () => {
    const caller = appRouter.createCaller(mockContext);

    const result = await caller.esrs.list({
      page: 1,
      pageSize: 50,
      standard: "E1",
      data_type: "narrative",
      voluntary: false,
    });

    expect(result).toBeDefined();
    expect(result.datapoints).toBeInstanceOf(Array);

    // All results should match all filters
    if (result.datapoints.length > 0) {
      const allMatch = result.datapoints.every(
        dp =>
          dp.esrsStandard === "E1" &&
          dp.dataType?.toLowerCase().includes("narrative") &&
          (dp.voluntary === 0 || dp.voluntary === false)
      );
      expect(allMatch).toBe(true);
    }
  });
});
