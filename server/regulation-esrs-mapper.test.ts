import { describe, it, expect, beforeAll, vi } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";
import { generateRegulationEsrsMappings } from "./regulation-esrs-mapper";

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            mappings: [
              {
                code: "BP-1_01",
                esrs_standard: "ESRS E1",
                relevanceScore: 8,
                reasoning: "Test mapping",
              },
            ],
          }),
        },
      },
    ],
  }),
}));

// Mock admin context for testing
const mockAdminContext: Context = {
  user: {
    id: 1,
    openId: "test-admin",
    name: "Test Admin",
    email: "admin@test.com",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {} as any,
  res: {} as any,
};

// Mock non-admin context
const mockUserContext: Context = {
  user: {
    id: 2,
    openId: "test-user",
    name: "Test User",
    email: "user@test.com",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {} as any,
  res: {} as any,
};

const hasDb = Boolean(process.env.DATABASE_URL);
const describeDb = hasDb ? describe : describe.skip;

describeDb("Regulation-ESRS Mapping", () => {
  let testRegulationId: number;

  beforeAll(async () => {
    // Find a regulation to test with (should have at least one from CELLAR sync)
    const caller = appRouter.createCaller(mockAdminContext);
    const regulations = await caller.regulations.list();

    if (regulations.length === 0) {
      testRegulationId = 0;
      return;
    }

    const datapoints = await caller.esrs.list({ page: 1, pageSize: 1 });
    if (!datapoints.total) {
      testRegulationId = 0;
      return;
    }

    testRegulationId = regulations[0].id;
    console.log(
      `[Test] Using regulation ID ${testRegulationId}: ${regulations[0].title}`
    );
  });

  it("should fetch ESRS mappings for a regulation (empty initially)", async () => {
    if (!testRegulationId) return;
    const caller = appRouter.createCaller(mockAdminContext);

    const mappings = await caller.regulations.getEsrsMappings({
      regulationId: testRegulationId,
    });

    expect(mappings).toBeInstanceOf(Array);
    // Initially empty until we generate mappings
  });

  it("should prevent non-admin users from generating mappings", async () => {
    if (!testRegulationId) return;
    const caller = appRouter.createCaller(mockUserContext);

    await expect(
      caller.regulations.generateEsrsMappings({
        regulationId: testRegulationId,
      })
    ).rejects.toThrow("FORBIDDEN");
  });

  it("should generate ESRS mappings using LLM (admin only)", async () => {
    if (!testRegulationId) return;
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.regulations.generateEsrsMappings({
      regulationId: testRegulationId,
    });

    expect(result).toBeDefined();
    expect(Boolean(result.success)).toBe(true);
    expect(result.mappingsCount).toBeGreaterThan(0);

    console.log(`[Test] Generated ${result.mappingsCount} ESRS mappings`);
  }, 60000); // 60s timeout for LLM call

  it("should fetch generated ESRS mappings with datapoint details", async () => {
    if (!testRegulationId) return;
    const caller = appRouter.createCaller(mockAdminContext);

    const mappings = await caller.regulations.getEsrsMappings({
      regulationId: testRegulationId,
    });

    expect(mappings).toBeInstanceOf(Array);
    expect(mappings.length).toBeGreaterThan(0);

    // Validate mapping structure
    const firstMapping = mappings[0];
    expect(firstMapping).toHaveProperty("regulationId");
    expect(firstMapping).toHaveProperty("datapointId");
    expect(firstMapping).toHaveProperty("relevanceScore");
    expect(firstMapping).toHaveProperty("reasoning");
    expect(firstMapping).toHaveProperty("datapoint");

    // Validate datapoint details
    expect(firstMapping.datapoint).toHaveProperty("datapointId");
    expect(firstMapping.datapoint).toHaveProperty("esrs_standard");
    expect(firstMapping.datapoint).toHaveProperty("name");

    // Validate relevance score range
    expect(firstMapping.relevanceScore).toBeGreaterThanOrEqual(1);
    expect(firstMapping.relevanceScore).toBeLessThanOrEqual(10);

    console.log(
      `[Test] Sample mapping: ${firstMapping.datapoint?.datapointId} (${firstMapping.datapoint?.esrsStandard}) - Relevance: ${firstMapping.relevanceScore}/10`
    );
  });

  it("should group mappings by ESRS standard", async () => {
    if (!testRegulationId) return;
    const caller = appRouter.createCaller(mockAdminContext);

    const mappings = await caller.regulations.getEsrsMappings({
      regulationId: testRegulationId,
    });

    const mappingsByStandard = mappings.reduce(
      (acc, mapping) => {
        const standard = mapping.datapoint?.esrsStandard || "Unknown";
        if (!acc[standard]) {
          acc[standard] = 0;
        }
        acc[standard]++;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log(`[Test] Mappings by standard:`, mappingsByStandard);

    // Should have at least one standard
    expect(Object.keys(mappingsByStandard).length).toBeGreaterThan(0);
  });

  it("should regenerate mappings (replace existing)", async () => {
    if (!testRegulationId) return;
    const caller = appRouter.createCaller(mockAdminContext);

    // Get current count
    const beforeMappings = await caller.regulations.getEsrsMappings({
      regulationId: testRegulationId,
    });
    const beforeCount = beforeMappings.length;

    // Regenerate
    const result = await caller.regulations.generateEsrsMappings({
      regulationId: testRegulationId,
    });

    expect(Boolean(result.success)).toBe(true);

    // Get new count
    const afterMappings = await caller.regulations.getEsrsMappings({
      regulationId: testRegulationId,
    });
    const afterCount = afterMappings.length;

    console.log(
      `[Test] Before: ${beforeCount} mappings, After: ${afterCount} mappings`
    );

    // Should have mappings (count may vary due to LLM)
    expect(afterCount).toBeGreaterThan(0);
  }, 60000); // 60s timeout for LLM call

  it("should handle invalid regulation ID gracefully", async () => {
    const result = await generateRegulationEsrsMappings(999999);

    expect(Boolean(result.success)).toBe(false);
    expect(result.mappingsCount).toBe(0);
    expect(result.error).toBeDefined();
  });
});
