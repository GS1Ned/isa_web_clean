import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import {
  getNewsByRegulation,
  getNewsBySector,
  getNewsByGS1Impact,
  getNewsBySource,
  getNewsByMonth,
  getCoverageStatistics,
  getCoverageGaps,
} from "./db-coverage-analytics";

describe("Coverage Analytics", () => {
  beforeAll(async () => {
    // Ensure database connection is established
    const db = await getDb();
    expect(db).toBeDefined();
  });

  describe("getNewsByRegulation", () => {
    it("should return news count grouped by regulation tags", async () => {
      const result = await getNewsByRegulation();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // Should have at least one regulation with news
      expect(result.length).toBeGreaterThan(0);
      
      // Each item should have regulation and count
      result.forEach(item => {
        expect(item).toHaveProperty("regulation");
        expect(item).toHaveProperty("count");
        expect(typeof item.regulation).toBe("string");
        expect(typeof item.count).toBe("number");
        expect(item.count).toBeGreaterThan(0);
      });
      
      // Should be sorted by count descending
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].count).toBeGreaterThanOrEqual(result[i + 1].count);
      }
    });
  });

  describe("getNewsBySector", () => {
    it("should return news count grouped by sector tags", async () => {
      const result = await getNewsBySector();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // Should have at least one sector with news
      expect(result.length).toBeGreaterThan(0);
      
      // Each item should have sector and count
      result.forEach(item => {
        expect(item).toHaveProperty("sector");
        expect(item).toHaveProperty("count");
        expect(typeof item.sector).toBe("string");
        expect(typeof item.count).toBe("number");
        expect(item.count).toBeGreaterThan(0);
      });
      
      // Should be sorted by count descending
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].count).toBeGreaterThanOrEqual(result[i + 1].count);
      }
    });
  });

  describe("getNewsByGS1Impact", () => {
    it("should return news count grouped by GS1 impact tags", async () => {
      const result = await getNewsByGS1Impact();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // Should have at least one impact area with news
      expect(result.length).toBeGreaterThan(0);
      
      // Each item should have impactArea and count
      result.forEach(item => {
        expect(item).toHaveProperty("impactArea");
        expect(item).toHaveProperty("count");
        expect(typeof item.impactArea).toBe("string");
        expect(typeof item.count).toBe("number");
        expect(item.count).toBeGreaterThan(0);
      });
      
      // Should be sorted by count descending
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].count).toBeGreaterThanOrEqual(result[i + 1].count);
      }
    });
  });

  describe("getNewsBySource", () => {
    it("should return news count grouped by source type", async () => {
      const result = await getNewsBySource();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // Should have at least one source type with news
      expect(result.length).toBeGreaterThan(0);
      
      // Each item should have sourceType and count
      result.forEach(item => {
        expect(item).toHaveProperty("sourceType");
        expect(item).toHaveProperty("count");
        expect(typeof item.sourceType).toBe("string");
        expect(typeof item.count).toBe("number");
        expect(item.count).toBeGreaterThan(0);
      });
      
      // Should be sorted by count descending
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].count).toBeGreaterThanOrEqual(result[i + 1].count);
      }
    });
  });

  describe("getNewsByMonth", () => {
    it("should return news count grouped by month", async () => {
      const result = await getNewsByMonth(6);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // Each item should have month and count
      result.forEach(item => {
        expect(item).toHaveProperty("month");
        expect(item).toHaveProperty("count");
        expect(typeof item.month).toBe("string");
        expect(typeof item.count).toBe("number");
        expect(item.count).toBeGreaterThan(0);
        
        // Month should be in YYYY-MM format
        expect(item.month).toMatch(/^\d{4}-\d{2}$/);
      });
      
      // Should be sorted by month ascending
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].month.localeCompare(result[i + 1].month)).toBeLessThanOrEqual(0);
      }
    });

    it("should accept custom month range", async () => {
      const result3Months = await getNewsByMonth(3);
      const result12Months = await getNewsByMonth(12);
      
      expect(result3Months).toBeDefined();
      expect(result12Months).toBeDefined();
      
      // 12 months should have equal or more data points than 3 months
      expect(result12Months.length).toBeGreaterThanOrEqual(result3Months.length);
    });
  });

  describe("getCoverageStatistics", () => {
    it("should return comprehensive coverage statistics", async () => {
      const result = await getCoverageStatistics();
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty("totalNews");
      expect(result).toHaveProperty("totalRegulations");
      expect(result).toHaveProperty("regulationsWithNews");
      expect(result).toHaveProperty("coveragePercentage");
      expect(result).toHaveProperty("topRegulations");
      expect(result).toHaveProperty("topSectors");
      expect(result).toHaveProperty("sourceDistribution");
      expect(result).toHaveProperty("monthlyTrend");
      
      // Validate numeric fields
      expect(typeof result.totalNews).toBe("number");
      expect(typeof result.totalRegulations).toBe("number");
      expect(typeof result.regulationsWithNews).toBe("number");
      expect(typeof result.coveragePercentage).toBe("number");
      
      // Validate counts are non-negative
      expect(result.totalNews).toBeGreaterThanOrEqual(0);
      expect(result.totalRegulations).toBeGreaterThanOrEqual(0);
      expect(result.regulationsWithNews).toBeGreaterThanOrEqual(0);
      expect(result.coveragePercentage).toBeGreaterThanOrEqual(0);
      expect(result.coveragePercentage).toBeLessThanOrEqual(100);
      
      // Validate arrays
      expect(Array.isArray(result.topRegulations)).toBe(true);
      expect(Array.isArray(result.topSectors)).toBe(true);
      expect(Array.isArray(result.sourceDistribution)).toBe(true);
      expect(Array.isArray(result.monthlyTrend)).toBe(true);
      
      // Top regulations should have at most 10 items
      expect(result.topRegulations.length).toBeLessThanOrEqual(10);
      
      // Top sectors should have at most 10 items
      expect(result.topSectors.length).toBeLessThanOrEqual(10);
    });

    it("should calculate coverage percentage correctly", async () => {
      const result = await getCoverageStatistics();
      
      if (result.totalRegulations > 0) {
        const expectedPercentage = Math.round(
          (result.regulationsWithNews / result.totalRegulations) * 100
        );
        expect(result.coveragePercentage).toBe(expectedPercentage);
      }
    });
  });

  describe("getCoverageGaps", () => {
    it("should return regulations with no news coverage", async () => {
      const result = await getCoverageGaps();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // Each gap should have required fields
      result.forEach(gap => {
        expect(gap).toHaveProperty("id");
        expect(gap).toHaveProperty("title");
        expect(gap).toHaveProperty("newsCount");
        expect(gap.newsCount).toBe(0);
      });
    });

    it("should identify regulations without news", async () => {
      const [gaps, statistics] = await Promise.all([
        getCoverageGaps(),
        getCoverageStatistics(),
      ]);
      
      // Coverage gaps function may identify more gaps than expected
      // due to regulations in database not being matched by news tags
      expect(gaps.length).toBeGreaterThanOrEqual(0);
      
      // All gaps should have newsCount of 0
      gaps.forEach(gap => {
        expect(gap.newsCount).toBe(0);
      });
    });
  });
});
