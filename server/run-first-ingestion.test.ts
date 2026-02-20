/**
 * First CELLAR Ingestion Test (opt-in integration)
 *
 * This suite intentionally avoids static imports of CELLAR integration modules so
 * default CI can run deterministically even when optional integration artifacts are
 * unavailable.
 */

import { describe, expect, it } from "vitest";

const runCellarTests = process.env.RUN_CELLAR_TESTS === "true";
const integrationTest = runCellarTests ? it : it.skip;

describe("First CELLAR Ingestion", () => {
  it("is opt-in and disabled by default", () => {
    expect(runCellarTests).toBe(false);
  });

  integrationTest("runs the real CELLAR ingestion workflow when explicitly enabled", async () => {
    const { runWeeklyIngestion } = await import("./weekly-cellar-ingestion");

    const result = await runWeeklyIngestion();

    expect(result).toBeDefined();
    expect(result.fetched).toBeGreaterThanOrEqual(0);
    expect(result.normalized).toBeGreaterThanOrEqual(0);
    expect(result.new).toBeGreaterThanOrEqual(0);
    expect(result.skipped).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.errors)).toBe(true);
  });
});
