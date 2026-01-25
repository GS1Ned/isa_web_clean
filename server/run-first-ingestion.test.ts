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
    serverLogger.info("\n=== ISA First CELLAR Ingestion ===\n");

    const startTime = Date.now();

    // Step 1: Test connection
    serverLogger.info("[1/6] Testing CELLAR connection...");
    const isConnected = await cellarConnector.testConnection();
    expect(isConnected).toBe(true);
    serverLogger.info("✓ CELLAR connected\n");

    // Step 2: Fetch regulations
    serverLogger.info("[2/6] Fetching ALL recent regulations (last 5 years)...");
    const acts = await cellarConnector.getAllRecentRegulations(5, 500);
    serverLogger.info(`✓ Retrieved ${acts.length} legal acts\n`);

    // Step 3: Normalize
    serverLogger.info("[3/6] Normalizing to ISA schema...");
    let normalized = normalizeEULegalActsBatch(acts);
    serverLogger.info(`✓ Normalized ${normalized.length} regulations`);
    serverLogger.info(`  (filtered ${acts.length - normalized.length} non-ESG)\n`);

    // Step 4: Deduplicate and validate
    serverLogger.info("[4/6] Deduplicating and validating...");
    normalized = deduplicateRegulations(normalized);
    const valid = normalized.filter(validateRegulation);
    serverLogger.info(`✓ ${valid.length} valid regulations\n`);

    // Step 5: Statistics
    const stats = calculateRegulationStats(valid);
    serverLogger.info("[5/6] Statistics:");
    serverLogger.info(`  Total: ${stats.total}`);
    serverLogger.info(`  With CELEX: ${stats.withCelex}`);
    serverLogger.info(`  Types:`);
    Object.entries(stats.byType).forEach(([type, count]) => {
      serverLogger.info(`    - ${type}: ${count}`);
    });
    serverLogger.info("");

    // Step 6: Insert into database
    serverLogger.info("[6/6] Inserting into database...");
    const db = await getDb();
    expect(db).toBeDefined();

    if (!db) {
      serverLogger.warn("⚠️  Database not available, skipping insertion");
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
        serverLogger.error(`\n  Error: ${regulation.celexId}`, error);
      }
    }

    serverLogger.info(`\n✓ Database insertion complete\n`);

    const duration = Date.now() - startTime;
    serverLogger.info("=== Ingestion Complete ===");
    serverLogger.info(`Duration: ${(duration / 1000).toFixed(2)}s`);
    serverLogger.info(`Inserted: ${inserted}`);
    serverLogger.info(`Updated: ${updated}`);
    serverLogger.info(`Errors: ${errors}`);
    serverLogger.info(`Total: ${inserted + updated}\n`);

    if (errors === 0) {
      serverLogger.info("✅ All regulations processed successfully!\n");
    } else {
      serverLogger.info(`⚠️  ${errors} regulations failed\n`);
    }

    // Assertions
    expect(inserted + updated).toBeGreaterThan(0);
    expect(errors).toBe(0);
  }, 180000); // 3 minute timeout
});
