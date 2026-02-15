/**
 * First CELLAR Ingestion Test
 *
 * This test performs the actual first ingestion of EU regulations.
 * Run with: pnpm test -- server/run-first-ingestion.test.ts
 */

import { describe, it, expect } from "vitest";
import { cellarConnector } from "./cellar-connector";
import {
  normalizeEULegalActsBatch,
  deduplicateRegulations,
  validateRegulation,
  calculateRegulationStats,
} from "./cellar-normalizer";
import { getDb } from "./db";
import { regulations } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const runCellarTests = process.env.RUN_CELLAR_TESTS === "true";
const describeCellar = runCellarTests ? describe : describe.skip;

describeCellar("First CELLAR Ingestion", () => {
  it("should fetch and store real EU regulations from CELLAR", async () => {
    const startTime = Date.now();

    // Step 1: Test connection
    const isConnected = await cellarConnector.testConnection();
    expect(isConnected).toBe(true);

    // Step 2: Fetch regulations
    const acts = await cellarConnector.getAllRecentRegulations(5, 500);

    // Step 3: Normalize
    let normalized = normalizeEULegalActsBatch(acts);

    // Step 4: Deduplicate and validate
    normalized = deduplicateRegulations(normalized);
    const valid = normalized.filter(validateRegulation);

    // Step 5: Statistics
    const stats = calculateRegulationStats(valid);
    void stats;

    // Step 6: Insert into database
    const db = await getDb();
    expect(db).toBeDefined();

    if (!db) {
      return;
    }

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const regulation of valid) {
      try {
        const existing = await db
          .select()
          .from(regulations)
          .where(eq(regulations.celexId, regulation.celexId!))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(regulations)
            .set(regulation)
            .where(eq(regulations.celexId, regulation.celexId!));
          updated++;
        } else {
          await db.insert(regulations).values(regulation);
          inserted++;
        }

        if ((inserted + updated) % 10 === 0) {
          process.stdout.write(
            `\r  Progress: ${inserted + updated}/${valid.length}`
          );
        }
      } catch (error) {
        errors++;
        void error;
      }
    }

    const duration = Date.now() - startTime;
    void duration;

    // Assertions
    expect(inserted + updated).toBeGreaterThan(0);
    expect(errors).toBe(0);
  }, 180000); // 3 minute timeout
});
