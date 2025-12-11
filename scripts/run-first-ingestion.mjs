/**
 * Run First CELLAR Ingestion
 *
 * This script performs the initial ingestion of EU regulations from CELLAR
 * and populates the ISA database.
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { cellarConnector } from "../dist/server/cellar-connector.js";
import {
  normalizeEULegalActsBatch,
  deduplicateRegulations,
  validateRegulation,
  calculateRegulationStats,
} from "../dist/server/cellar-normalizer.js";
import { regulations } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

async function runFirstIngestion() {
  console.log("=== ISA First CELLAR Ingestion ===\n");

  const startTime = Date.now();

  try {
    // Step 1: Connect to database
    console.log("[1/7] Connecting to database...");
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    const db = drizzle(connection);
    console.log("✓ Database connected\n");

    // Step 2: Test CELLAR connection
    console.log("[2/7] Testing CELLAR connection...");
    const isConnected = await cellarConnector.testConnection();
    if (!isConnected) {
      throw new Error("Failed to connect to CELLAR endpoint");
    }
    console.log("✓ CELLAR connection successful\n");

    // Step 3: Fetch regulations
    console.log("[3/7] Fetching ESG regulations from CELLAR (last 5 years)...");
    const acts = await cellarConnector.getESGRegulations(5);
    console.log(`✓ Retrieved ${acts.length} legal acts\n`);

    // Step 4: Normalize
    console.log("[4/7] Normalizing data to ISA schema...");
    let normalized = normalizeEULegalActsBatch(acts);
    console.log(`✓ Normalized ${normalized.length} regulations`);
    console.log(
      `  (filtered out ${acts.length - normalized.length} non-ESG acts)\n`
    );

    // Step 5: Deduplicate and validate
    console.log("[5/7] Deduplicating and validating...");
    normalized = deduplicateRegulations(normalized);
    const valid = normalized.filter(validateRegulation);
    console.log(`✓ ${valid.length} valid unique regulations`);
    console.log(
      `  (removed ${normalized.length - valid.length} invalid entries)\n`
    );

    // Step 6: Calculate statistics
    const stats = calculateRegulationStats(valid);
    console.log("[6/7] Regulation statistics:");
    console.log(`  Total: ${stats.total}`);
    console.log(`  With CELEX: ${stats.withCelex}`);
    console.log(`  Types breakdown:`);
    Object.entries(stats.byType).forEach(([type, count]) => {
      console.log(`    - ${type}: ${count}`);
    });
    console.log("");

    // Step 7: Insert into database
    console.log("[7/7] Inserting regulations into database...");
    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const regulation of valid) {
      try {
        // Check if exists
        const existing = await db
          .select()
          .from(regulations)
          .where(eq(regulations.celexId, regulation.celexId))
          .limit(1);

        if (existing.length > 0) {
          // Update existing
          await db
            .update(regulations)
            .set(regulation)
            .where(eq(regulations.celexId, regulation.celexId));
          updated++;
        } else {
          // Insert new
          await db.insert(regulations).values(regulation);
          inserted++;
        }

        // Progress indicator
        if ((inserted + updated) % 10 === 0) {
          process.stdout.write(
            `\r  Progress: ${inserted + updated}/${valid.length}`
          );
        }
      } catch (error) {
        errors++;
        console.error(
          `\n  Error processing ${regulation.celexId}:`,
          error.message
        );
      }
    }

    console.log(`\n✓ Database insertion complete\n`);

    // Close connection
    await connection.end();

    // Final summary
    const duration = Date.now() - startTime;
    console.log("=== Ingestion Complete ===");
    console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`Inserted: ${inserted}`);
    console.log(`Updated: ${updated}`);
    console.log(`Errors: ${errors}`);
    console.log(`Total processed: ${inserted + updated}`);
    console.log("");

    if (errors > 0) {
      console.log("⚠️  Some regulations failed to process. Check logs above.");
    } else {
      console.log("✅ All regulations processed successfully!");
    }

    return {
      success: true,
      inserted,
      updated,
      errors,
      duration,
    };
  } catch (error) {
    console.error("\n❌ Ingestion failed:", error.message);
    console.error(error.stack);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runFirstIngestion()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runFirstIngestion };
