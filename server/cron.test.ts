/**
 * Cron Router Tests
 * Tests for news ingestion and archival cron endpoints
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

// Mock context
const mockContext: Context = {
  user: null,
  req: {} as any,
  res: {} as any,
};

// Mock news-cron-scheduler functions
vi.mock("./news-cron-scheduler", () => ({
  dailyNewsIngestion: vi.fn().mockResolvedValue({
    success: true,
    fetched: 10,
    inserted: 5,
    skipped: 5,
    errors: [],
    duration: 2345,
  }),
  weeklyNewsArchival: vi.fn().mockResolvedValue({
    success: true,
    archived: 50,
    errors: [],
    duration: 1234,
  }),
}));

describe("Cron Router", () => {
  const caller = appRouter.createCaller(mockContext);
  const VALID_SECRET = process.env.CRON_SECRET || "change-me-in-production";

  describe("health", () => {
    it("should return health status without authentication", async () => {
      const result = await caller.cron.health();

      expect(result).toMatchObject({
        status: "ok",
        service: "ISA News Cron",
      });
      expect(result.timestamp).toBeDefined();
    });
  });

  describe("dailyNewsIngestion", () => {
    it("should reject invalid secret", async () => {
      await expect(
        caller.cron.dailyNewsIngestion({ secret: "wrong-secret" })
      ).rejects.toThrow("Unauthorized: Invalid cron secret");
    });

    it("should accept valid secret and trigger ingestion", async () => {
      const result = await caller.cron.dailyNewsIngestion({
        secret: VALID_SECRET,
      });

      expect(Boolean(result.success)).toBe(true);
      expect(result.message).toBe("Daily news ingestion completed");
      expect(result.stats).toMatchObject({
        fetched: 10,
        inserted: 5,
        skipped: 5,
        errors: 0,
        duration: "2345ms",
      });
    });

    it("should handle ingestion errors gracefully", async () => {
      const { dailyNewsIngestion } = await import("./news-cron-scheduler");
      vi.mocked(dailyNewsIngestion).mockRejectedValueOnce(
        new Error("Network error")
      );

      const result = await caller.cron.dailyNewsIngestion({
        secret: VALID_SECRET,
      });

      expect(Boolean(result.success)).toBe(false);
      expect(result.message).toBe("Daily news ingestion failed");
      expect(result.error).toBe("Network error");
    });
  });

  describe("weeklyNewsArchival", () => {
    it("should reject invalid secret", async () => {
      await expect(
        caller.cron.weeklyNewsArchival({ secret: "wrong-secret" })
      ).rejects.toThrow("Unauthorized: Invalid cron secret");
    });

    it("should accept valid secret and trigger archival", async () => {
      const result = await caller.cron.weeklyNewsArchival({
        secret: VALID_SECRET,
      });

      expect(Boolean(result.success)).toBe(true);
      expect(result.message).toBe("Weekly news archival completed");
      expect(result.stats).toMatchObject({
        archived: 50,
        errors: 0,
        duration: "1234ms",
      });
    });

    it("should handle archival errors gracefully", async () => {
      const { weeklyNewsArchival } = await import("./news-cron-scheduler");
      vi.mocked(weeklyNewsArchival).mockRejectedValueOnce(
        new Error("Database error")
      );

      const result = await caller.cron.weeklyNewsArchival({
        secret: VALID_SECRET,
      });

      expect(Boolean(result.success)).toBe(false);
      expect(result.message).toBe("Weekly news archival failed");
      expect(result.error).toBe("Database error");
    });
  });
});
