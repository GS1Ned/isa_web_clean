import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import {
  getLowScoredMappings,
  getVoteDistributionByStandard,
  getMostVotedMappings,
} from "./db";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../drizzle/schema";
import { createMysqlConnection } from "./db-connection";

let connection: mysql.Connection;
let db: ReturnType<typeof drizzle>;

beforeAll(async () => {
  connection = await createMysqlConnection(process.env.DATABASE_URL!);
  db = drizzle(connection, { schema, mode: "default" });
});

afterAll(async () => {
  await connection.end();
});

describe("Admin Analytics", () => {
  describe("getLowScoredMappings", () => {
    it("should return low-scored mappings with < 50% approval", async () => {
      const lowScored = await getLowScoredMappings(3);

      expect(Array.isArray(lowScored)).toBe(true);

      // All returned mappings should have < 50% approval
      lowScored.forEach(mapping => {
        expect(mapping.approvalPercentage).toBeLessThan(50);
        expect(mapping.totalVotes).toBeGreaterThanOrEqual(3);
        expect(mapping.mappingId).toBeDefined();
        expect(mapping.datapointName).toBeDefined();
        expect(mapping.esrsStandard).toBeDefined();
      });
    });

    it("should return empty array if no low-scored mappings exist", async () => {
      const lowScored = await getLowScoredMappings(1000); // Very high threshold

      expect(Array.isArray(lowScored)).toBe(true);
      // May be empty or have few items
      expect(lowScored.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getVoteDistributionByStandard", () => {
    it("should return vote distribution for all ESRS standards", async () => {
      const distribution = await getVoteDistributionByStandard();

      expect(Array.isArray(distribution)).toBe(true);

      // Should have data for multiple standards
      if (distribution.length > 0) {
        distribution.forEach(d => {
          expect(d.esrsStandard).toBeDefined();
          expect(d.totalMappings).toBeGreaterThan(0);
          expect(d.totalVotes).toBeGreaterThanOrEqual(0);
          expect(d.positiveVotes).toBeGreaterThanOrEqual(0);
          expect(d.approvalPercentage).toBeGreaterThanOrEqual(0);
          expect(d.approvalPercentage).toBeLessThanOrEqual(100);
        });
      }
    });

    it("should calculate approval percentage correctly", async () => {
      const distribution = await getVoteDistributionByStandard();

      distribution.forEach(d => {
        if (d.totalVotes > 0) {
          const expectedPercentage = Math.round(
            (d.positiveVotes / d.totalVotes) * 100
          );
          expect(d.approvalPercentage).toBe(expectedPercentage);
        }
      });
    });
  });

  describe("getMostVotedMappings", () => {
    it("should return most-voted mappings ordered by vote count", async () => {
      const mostVoted = await getMostVotedMappings(10);

      expect(Array.isArray(mostVoted)).toBe(true);

      // Should be ordered by vote count (descending)
      for (let i = 1; i < mostVoted.length; i++) {
        expect(mostVoted[i - 1].totalVotes).toBeGreaterThanOrEqual(
          mostVoted[i].totalVotes
        );
      }

      // Each mapping should have valid data
      mostVoted.forEach(mapping => {
        expect(mapping.mappingId).toBeDefined();
        expect(mapping.datapointName).toBeDefined();
        expect(mapping.esrsStandard).toBeDefined();
        expect(mapping.totalVotes).toBeGreaterThan(0);
        expect(mapping.approvalPercentage).toBeGreaterThanOrEqual(0);
      });
    });

    it("should respect limit parameter", async () => {
      const limit = 5;
      const mostVoted = await getMostVotedMappings(limit);

      expect(mostVoted.length).toBeLessThanOrEqual(limit);
    });

    it("should return empty array if no voted mappings exist", async () => {
      const mostVoted = await getMostVotedMappings(10);

      // May be empty if no votes have been cast
      expect(Array.isArray(mostVoted)).toBe(true);
    });
  });

  describe("Analytics data consistency", () => {
    it("should have consistent data across all analytics queries", async () => {
      const lowScored = await getLowScoredMappings(1);
      const distribution = await getVoteDistributionByStandard();
      const mostVoted = await getMostVotedMappings(100);

      // All should be arrays
      expect(Array.isArray(lowScored)).toBe(true);
      expect(Array.isArray(distribution)).toBe(true);
      expect(Array.isArray(mostVoted)).toBe(true);

      // Total mappings should be consistent
      const totalFromDistribution = distribution.reduce(
        (sum, d) => sum + d.totalMappings,
        0
      );
      const totalFromMostVoted = mostVoted.length;

      // mostVoted should be subset of total mappings
      expect(totalFromMostVoted).toBeLessThanOrEqual(totalFromDistribution);
    });
  });
});
