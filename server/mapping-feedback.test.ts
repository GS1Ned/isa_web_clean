import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

describe("Mapping Feedback Procedures", () => {
  const mockAdminContext: Context = {
    user: { id: 1, name: "Admin User", email: "admin@test.com", role: "admin" },
  };

  const mockUserContext: Context = {
    user: { id: 2, name: "Test User", email: "user@test.com", role: "user" },
  };

  const caller = appRouter.createCaller(mockAdminContext);
  const userCaller = appRouter.createCaller(mockUserContext);

  let testMappingId: number;

  beforeAll(async () => {
    // Get a mapping ID from existing data (from Phase 69 batch generation)
    const mappings = await caller.regulations.getEsrsMappings({
      regulationId: 1,
    });
    if (mappings && mappings.length > 0) {
      testMappingId = mappings[0].id;
    } else {
      throw new Error(
        "No ESRS mappings found for testing. Run batch generation first."
      );
    }
  });

  it("should submit positive feedback (thumbs up)", async () => {
    const result = await caller.regulations.submitMappingFeedback({
      mappingId: testMappingId,
      vote: true,
    });

    expect(result).toBeTruthy();
    expect(Boolean(result?.vote)).toBe(true);
    expect(result?.mappingId).toBe(testMappingId);
  });

  it("should retrieve user's feedback", async () => {
    const feedback = await caller.regulations.getUserMappingFeedback({
      mappingId: testMappingId,
    });

    expect(feedback).toBeTruthy();
    expect(Boolean(feedback?.vote)).toBe(true); // From previous test
    expect(feedback?.userId).toBe(1);
  });

  it("should update existing feedback (change vote)", async () => {
    // Change from thumbs up to thumbs down
    const result = await caller.regulations.submitMappingFeedback({
      mappingId: testMappingId,
      vote: false,
    });

    expect(result).toBeTruthy();
    expect(Boolean(result?.vote)).toBe(false);

    // Verify it was updated, not duplicated
    const feedback = await caller.regulations.getUserMappingFeedback({
      mappingId: testMappingId,
    });
    expect(Boolean(feedback?.vote)).toBe(false);
  });

  it("should get aggregated feedback stats", async () => {
    const stats = await caller.regulations.getMappingFeedbackStats({
      mappingId: testMappingId,
    });

    expect(stats).toBeTruthy();
    expect(stats?.totalVotes).toBeGreaterThan(0);
    expect(stats?.positiveVotes).toBeGreaterThanOrEqual(0);
    expect(stats?.positivePercentage).toBeGreaterThanOrEqual(0);
    expect(stats?.positivePercentage).toBeLessThanOrEqual(100);
  });

  it("should handle multiple users voting", async () => {
    // User 2 votes thumbs up
    await userCaller.regulations.submitMappingFeedback({
      mappingId: testMappingId,
      vote: true,
    });

    const stats = await caller.regulations.getMappingFeedbackStats({
      mappingId: testMappingId,
    });

    expect(stats?.totalVotes).toBeGreaterThanOrEqual(2); // Admin + User
    expect(stats?.positiveVotes).toBeGreaterThanOrEqual(1); // User voted positive
  });

  it("should get batch feedback stats", async () => {
    const mappings = await caller.regulations.getEsrsMappings({
      regulationId: 1,
    });
    const mappingIds = mappings?.slice(0, 5).map(m => m.id) || [];

    const batchStats = await caller.regulations.getBatchMappingFeedbackStats({
      mappingIds,
    });

    expect(batchStats).toBeTruthy();
    expect(typeof batchStats).toBe("object");
    // Should have stats for at least the mapping we voted on
    expect(batchStats[testMappingId]).toBeTruthy();
  });

  it("should return empty stats for mapping with no votes", async () => {
    const mappings = await caller.regulations.getEsrsMappings({
      regulationId: 2,
    });
    if (mappings && mappings.length > 0) {
      const unmappedId = mappings[0].id;
      const stats = await caller.regulations.getMappingFeedbackStats({
        mappingId: unmappedId,
      });

      expect(stats?.totalVotes).toBe(0);
      expect(stats?.positivePercentage).toBe(0);
    }
  });
});
