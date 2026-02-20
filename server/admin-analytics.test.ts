import { beforeEach, describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import { regulationsRouter } from "./routers/regulations";
import {
  getLowScoredMappings,
  getMostVotedMappings,
  getVoteDistributionByStandard,
} from "./db";

vi.mock("./db", () => ({
  getRegulations: vi.fn(),
  getRegulationWithStandards: vi.fn(),
  getLowScoredMappings: vi.fn(),
  getVoteDistributionByStandard: vi.fn(),
  getMostVotedMappings: vi.fn(),
}));

describe("Admin Analytics", () => {
  const adminContext = {
    user: { id: 1, role: "admin" },
  } as any;

  const userContext = {
    user: { id: 2, role: "user" },
  } as any;

  const adminCaller = regulationsRouter.createCaller(adminContext);
  const userCaller = regulationsRouter.createCaller(userContext);

  beforeEach(() => {
    vi.clearAllMocks();

    (getLowScoredMappings as any).mockResolvedValue([
      {
        mappingId: 101,
        regulationId: 11,
        datapointId: 501,
        datapointName: "GHG Scope 1",
        esrs_standard: "ESRS E1",
        relevanceScore: "0.72",
        reasoning: "Low confidence mapping",
        totalVotes: 6,
        positiveVotes: 2,
        approvalPercentage: 33,
      },
    ]);

    (getVoteDistributionByStandard as any).mockResolvedValue([
      {
        esrs_standard: "ESRS E1",
        totalMappings: 12,
        totalVotes: 20,
        positiveVotes: 14,
        approvalPercentage: 70,
      },
      {
        esrs_standard: "ESRS S1",
        totalMappings: 8,
        totalVotes: 10,
        positiveVotes: 7,
        approvalPercentage: 70,
      },
    ]);

    (getMostVotedMappings as any).mockResolvedValue([
      {
        mappingId: 201,
        regulationId: 12,
        datapointId: 601,
        datapointName: "Energy Consumption",
        esrs_standard: "ESRS E1",
        relevanceScore: "0.91",
        totalVotes: 12,
        positiveVotes: 10,
        approvalPercentage: 83,
      },
      {
        mappingId: 202,
        regulationId: 13,
        datapointId: 602,
        datapointName: "Workforce Diversity",
        esrs_standard: "ESRS S1",
        relevanceScore: "0.88",
        totalVotes: 9,
        positiveVotes: 7,
        approvalPercentage: 78,
      },
    ]);
  });

  it("returns low-scored mappings for admins", async () => {
    const result = await adminCaller.getLowScoredMappings({ minVotes: 5 });

    expect(getLowScoredMappings).toHaveBeenCalledWith(5);
    expect(result).toHaveLength(1);
    expect(result[0].approvalPercentage).toBeLessThan(50);
  });

  it("enforces admin access for low-scored mappings", async () => {
    await expect(
      userCaller.getLowScoredMappings({ minVotes: 3 })
    ).rejects.toMatchObject<Partial<TRPCError>>({
      code: "FORBIDDEN",
    });

    expect(getLowScoredMappings).not.toHaveBeenCalled();
  });

  it("returns vote distribution for admins", async () => {
    const distribution = await adminCaller.getVoteDistributionByStandard();

    expect(getVoteDistributionByStandard).toHaveBeenCalledTimes(1);
    expect(distribution).toHaveLength(2);

    for (const row of distribution) {
      expect(row.totalMappings).toBeGreaterThan(0);
      expect(row.approvalPercentage).toBeGreaterThanOrEqual(0);
      expect(row.approvalPercentage).toBeLessThanOrEqual(100);
    }
  });

  it("returns most-voted mappings with limit", async () => {
    const result = await adminCaller.getMostVotedMappings({ limit: 10 });

    expect(getMostVotedMappings).toHaveBeenCalledWith(10);
    expect(result).toHaveLength(2);
    expect(result[0].totalVotes).toBeGreaterThanOrEqual(result[1].totalVotes);
  });

  it("defaults most-voted limit to 10", async () => {
    await adminCaller.getMostVotedMappings({});
    expect(getMostVotedMappings).toHaveBeenCalledWith(10);
  });

  it("enforces admin access for vote-distribution and most-voted", async () => {
    await expect(userCaller.getVoteDistributionByStandard()).rejects.toMatchObject<
      Partial<TRPCError>
    >({ code: "FORBIDDEN" });

    await expect(userCaller.getMostVotedMappings({})).rejects.toMatchObject<
      Partial<TRPCError>
    >({ code: "FORBIDDEN" });

    expect(getVoteDistributionByStandard).not.toHaveBeenCalled();
    expect(getMostVotedMappings).not.toHaveBeenCalled();
  });
});
