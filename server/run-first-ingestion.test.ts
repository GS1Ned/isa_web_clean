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
    console.log("\n=== ISA First CELLAR Ingestion ===\n");

    const startTime = Date.now();

    // Step 1: Test connection
    console.log("[1/6] Testing CELLAR connection...");
    const isConnected = await cellarConnector.testConnection();
    expect(isConnected).toBe(true);
    console.log("✓ CELLAR connected\n");

    // Step 2: Fetch regulations
    console.log("[2/6] Fetching ALL recent regulations (last 5 years)...");
    const acts = await cellarConnector.getAllRecentRegulations(5, 500);
    console.log(`✓ Retrieved ${acts.length} legal acts\n`);

    // Step 3: Normalize
    console.log("[3/6] Normalizing to ISA schema...");
    let normalized = normalizeEULegalActsBatch(acts);
    console.log(`✓ Normalized ${normalized.length} regulations`);
    console.log(`  (filtered ${acts.length - normalized.length} non-ESG)\n`);

    // Step 4: Deduplicate and validate
    console.log("[4/6] Deduplicating and validating...");
    normalized = deduplicateRegulations(normalized);
    const valid = normalized.filter(validateRegulation);
    console.log(`✓ ${valid.length} valid regulations\n`);

    // Step 5: Statistics
    const stats = calculateRegulationStats(valid);
    console.log("[5/6] Statistics:");
    console.log(`  Total: ${stats.total}`);
    console.log(`  With CELEX: ${stats.withCelex}`);
    console.log(`  Types:`);
    Object.entries(stats.byType).forEach(([type, count]) => {
      console.log(`    - ${type}: ${count}`);
    });
    console.log("");

    // Step 6: Insert into database
    console.log("[6/6] Inserting into database...");
    const db = await getDb();
    expect(db).toBeDefined();

    if (!db) {
      console.warn("⚠️  Database not available, skipping insertion");
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
        console.error(`\n  Error: ${regulation.celexId}`, error);
      }
    }

    console.log(`\n✓ Database insertion complete\n`);

    const duration = Date.now() - startTime;
    console.log("=== Ingestion Complete ===");
    console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`Inserted: ${inserted}`);
    console.log(`Updated: ${updated}`);
    console.log(`Errors: ${errors}`);
    console.log(`Total: ${inserted + updated}\n`);

    if (errors === 0) {
      console.log("✅ All regulations processed successfully!\n");
    } else {
      console.log(`⚠️  ${errors} regulations failed\n`);
    }

    // Assertions
    expect(inserted + updated).toBeGreaterThan(0);
    expect(errors).toBe(0);
  }, 180000); // 3 minute timeout
});
