import { beforeEach, describe, expect, it, vi } from "vitest";
import { regulationsRouter } from "./routers/regulations";
import {
  getBatchMappingFeedbackStats,
  getMappingFeedbackStats,
  getRegulationEsrsMappings,
  getUserMappingFeedback,
  submitMappingFeedback,
} from "./db";

type FeedbackRow = {
  id: number;
  userId: number;
  mappingId: number;
  vote: number;
};

const feedbackState = vi.hoisted(() => ({
  rows: new Map<string, FeedbackRow>(),
  nextId: 1,
  mappingsByRegulation: {
    1: [
      { id: 101, regulationId: 1, datapointId: 1001, datapointName: "E1-1" },
      { id: 102, regulationId: 1, datapointId: 1002, datapointName: "E1-2" },
    ],
    2: [{ id: 201, regulationId: 2, datapointId: 2001, datapointName: "S1-1" }],
  } as Record<number, Array<Record<string, unknown>>>,
}));

vi.mock("./db", () => ({
  getRegulations: vi.fn(),
  getRegulationWithStandards: vi.fn(),
  getRegulationEsrsMappings: vi.fn(async (regulationId: number) => {
    return feedbackState.mappingsByRegulation[regulationId] ?? [];
  }),
  submitMappingFeedback: vi.fn(
    async ({
      userId,
      mappingId,
      vote,
    }: {
      userId: number;
      mappingId: number;
      vote: boolean;
    }) => {
      const key = `${userId}:${mappingId}`;
      const existing = feedbackState.rows.get(key);
      const normalizedVote = vote ? 1 : 0;

      if (existing) {
        const updated = { ...existing, vote: normalizedVote };
        feedbackState.rows.set(key, updated);
        return updated;
      }

      const created: FeedbackRow = {
        id: feedbackState.nextId++,
        userId,
        mappingId,
        vote: normalizedVote,
      };
      feedbackState.rows.set(key, created);
      return created;
    }
  ),
  getUserMappingFeedback: vi.fn(async (userId: number, mappingId: number) => {
    return feedbackState.rows.get(`${userId}:${mappingId}`) ?? null;
  }),
  getMappingFeedbackStats: vi.fn(async (mappingId: number) => {
    const rows = [...feedbackState.rows.values()].filter(
      row => row.mappingId === mappingId
    );

    if (rows.length === 0) {
      return { totalVotes: 0, positiveVotes: 0, positivePercentage: 0 };
    }

    const totalVotes = rows.length;
    const positiveVotes = rows.filter(row => row.vote === 1).length;
    return {
      totalVotes,
      positiveVotes,
      positivePercentage: Math.round((positiveVotes / totalVotes) * 100),
    };
  }),
  getBatchMappingFeedbackStats: vi.fn(async (mappingIds: number[]) => {
    const result: Record<
      number,
      { totalVotes: number; positiveVotes: number; positivePercentage: number }
    > = {};

    for (const mappingId of mappingIds) {
      const rows = [...feedbackState.rows.values()].filter(
        row => row.mappingId === mappingId
      );
      const totalVotes = rows.length;
      const positiveVotes = rows.filter(row => row.vote === 1).length;
      result[mappingId] = {
        totalVotes,
        positiveVotes,
        positivePercentage:
          totalVotes > 0 ? Math.round((positiveVotes / totalVotes) * 100) : 0,
      };
    }

    return result;
  }),
  getLowScoredMappings: vi.fn(),
  getVoteDistributionByStandard: vi.fn(),
  getMostVotedMappings: vi.fn(),
}));

describe("Mapping Feedback Procedures", () => {
  const adminContext = {
    user: { id: 1, name: "Admin User", email: "admin@test.com", role: "admin" },
  } as any;

  const userContext = {
    user: { id: 2, name: "Test User", email: "user@test.com", role: "user" },
  } as any;

  const adminCaller = regulationsRouter.createCaller(adminContext);
  const userCaller = regulationsRouter.createCaller(userContext);

  const testMappingId = 101;

  beforeEach(() => {
    feedbackState.rows.clear();
    feedbackState.nextId = 1;
    vi.clearAllMocks();
  });

  it("returns deterministic mappings for regulation", async () => {
    const mappings = await adminCaller.getEsrsMappings({ regulationId: 1 });
    expect(getRegulationEsrsMappings).toHaveBeenCalledWith(1);
    expect(mappings).toHaveLength(2);
    expect(mappings[0].id).toBe(101);
  });

  it("submits and reads feedback", async () => {
    const submitted = await adminCaller.submitMappingFeedback({
      mappingId: testMappingId,
      vote: true,
    });

    expect(submitMappingFeedback).toHaveBeenCalledWith({
      userId: 1,
      mappingId: testMappingId,
      vote: true,
    });
    expect(Boolean(submitted?.vote)).toBe(true);

    const feedback = await adminCaller.getUserMappingFeedback({
      mappingId: testMappingId,
    });
    expect(getUserMappingFeedback).toHaveBeenCalledWith(1, testMappingId);
    expect(Boolean(feedback?.vote)).toBe(true);
    expect(feedback?.userId).toBe(1);
  });

  it("updates existing feedback instead of duplicating", async () => {
    await adminCaller.submitMappingFeedback({ mappingId: testMappingId, vote: true });

    const updated = await adminCaller.submitMappingFeedback({
      mappingId: testMappingId,
      vote: false,
    });

    expect(Boolean(updated?.vote)).toBe(false);
    expect(feedbackState.rows.size).toBe(1);
  });

  it("aggregates single-mapping stats", async () => {
    await adminCaller.submitMappingFeedback({ mappingId: testMappingId, vote: false });
    await userCaller.submitMappingFeedback({ mappingId: testMappingId, vote: true });

    const stats = await adminCaller.getMappingFeedbackStats({
      mappingId: testMappingId,
    });

    expect(getMappingFeedbackStats).toHaveBeenCalledWith(testMappingId);
    expect(stats).toEqual({
      totalVotes: 2,
      positiveVotes: 1,
      positivePercentage: 50,
    });
  });

  it("aggregates batch stats", async () => {
    await adminCaller.submitMappingFeedback({ mappingId: 101, vote: true });
    await userCaller.submitMappingFeedback({ mappingId: 101, vote: true });
    await adminCaller.submitMappingFeedback({ mappingId: 102, vote: false });

    const batchStats = await adminCaller.getBatchMappingFeedbackStats({
      mappingIds: [101, 102, 201],
    });

    expect(getBatchMappingFeedbackStats).toHaveBeenCalledWith([101, 102, 201]);
    expect(batchStats[101]).toEqual({
      totalVotes: 2,
      positiveVotes: 2,
      positivePercentage: 100,
    });
    expect(batchStats[102]).toEqual({
      totalVotes: 1,
      positiveVotes: 0,
      positivePercentage: 0,
    });
    expect(batchStats[201]).toEqual({
      totalVotes: 0,
      positiveVotes: 0,
      positivePercentage: 0,
    });
  });
});
