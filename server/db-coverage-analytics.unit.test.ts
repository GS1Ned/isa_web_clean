import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "./db";
import {
  getCoverageGaps,
  getCoverageStatistics,
  getNewsByRegulation,
} from "./db-coverage-analytics";

const mockGetDb = vi.mocked(getDb);

function makeDb(selectResponses: unknown[][]) {
  const queue = [...selectResponses];
  return {
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockImplementation(async () => queue.shift() ?? []),
    })),
  };
}

describe("db-coverage-analytics (unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aggregates regulation tags deterministically", async () => {
    mockGetDb.mockResolvedValue(
      makeDb([
        [
          { regulationTags: ["CSRD", "ESRS"] },
          { regulationTags: ["CSRD"] },
          { regulationTags: null },
        ],
      ]) as never
    );

    const result = await getNewsByRegulation();
    expect(result).toEqual([
      { regulation: "CSRD", count: 2 },
      { regulation: "ESRS", count: 1 },
    ]);
  });

  it("returns coverage statistics with expected percentages", async () => {
    mockGetDb.mockResolvedValue(
      makeDb([
        [{ count: 4 }], // totalNews
        [{ count: 10 }], // totalRegulations
        [{ regulationTags: ["CSRD", "ESRS"] }, { regulationTags: ["CSRD"] }], // byRegulation
        [{ sectorTags: ["RETAIL"] }, { sectorTags: ["RETAIL", "HEALTHCARE"] }], // bySector
        [{ sourceType: "EU_OFFICIAL" }, { sourceType: "EU_OFFICIAL" }], // bySource
        [{ publishedDate: "2026-03-01T00:00:00Z", createdAt: "2026-03-01T00:00:00Z" }], // byMonth
      ]) as never
    );

    const result = await getCoverageStatistics();

    expect(result.totalNews).toBe(4);
    expect(result.totalRegulations).toBe(10);
    expect(result.regulationsWithNews).toBe(2);
    expect(result.coveragePercentage).toBe(20);
    expect(result.topRegulations[0]).toEqual({ regulation: "CSRD", count: 2 });
    expect(result.topSectors[0]).toEqual({ sector: "RETAIL", count: 2 });
    expect(result.sourceDistribution[0]).toEqual({
      sourceType: "EU_OFFICIAL",
      count: 2,
    });
    expect(result.monthlyTrend.length).toBe(1);
  });

  it("identifies regulations without news coverage", async () => {
    mockGetDb.mockResolvedValue(
      makeDb([
        [
          { id: 1, title: "CSRD", celexId: "32022R", regulationType: "REGULATION" },
          { id: 2, title: "EUDR", celexId: "32023R", regulationType: "REGULATION" },
        ], // allRegulations
        [{ regulationTags: ["CSRD"] }], // byRegulation source rows
      ]) as never
    );

    const gaps = await getCoverageGaps();
    expect(gaps).toEqual([
      {
        id: 2,
        title: "EUDR",
        celexId: "32023R",
        type: "REGULATION",
        newsCount: 0,
      },
    ]);
  });
});
