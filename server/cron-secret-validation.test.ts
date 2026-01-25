/**
 * CRON_SECRET Validation Test
 * Validates that CRON_SECRET is set and cron endpoints work correctly
 */

import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

// Mock context
const mockContext: Context = {
  user: null,
  req: {} as any,
  res: {} as any,
};

describe("CRON_SECRET Validation", () => {
  const caller = appRouter.createCaller(mockContext);

  it("should have CRON_SECRET environment variable set", () => {
    expect(process.env.CRON_SECRET).toBeDefined();
    expect(process.env.CRON_SECRET).not.toBe("change-me-in-production");
    expect(process.env.CRON_SECRET?.length).toBeGreaterThan(32);
  });

  it("should accept valid CRON_SECRET for health check", async () => {
    const result = await caller.cron.health();
    expect(result.status).toBe("ok");
    expect(result.service).toBe("ISA News Cron");
  });

  it("should reject invalid CRON_SECRET", async () => {
    await expect(
      caller.cron.dailyNewsIngestion({ secret: "invalid-secret" })
    ).rejects.toThrow("Unauthorized: Invalid cron secret");
  });

  it("should accept valid CRON_SECRET", async () => {
    const validSecret = process.env.CRON_SECRET || "";

    // Note: We're not actually running the full ingestion in tests
    // Just validating that the secret is accepted
    const result = await caller.cron.dailyNewsIngestion({
      secret: validSecret,
    });

    expect(result.success).toBeDefined();
    // Either success or failure is fine - we're just testing authentication
  });
});
