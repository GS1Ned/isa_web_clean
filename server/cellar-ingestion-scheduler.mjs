/**
 * CELLAR Ingestion Scheduler
 *
 * Automated daily ingestion of EU regulations from CELLAR SPARQL endpoint.
 * Runs as a cron job to keep ISA database synchronized with latest EU legal acts.
 *
 * Usage:
 *   node server/cellar-ingestion-scheduler.mjs
 *
 * Cron schedule (daily at 3 AM):
 *   0 3 * * * cd /path/to/isa_web && node server/cellar-ingestion-scheduler.mjs >> logs/cellar-ingestion.log 2>&1
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { regulations } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

// Import connector and normalizer (will be transpiled from TypeScript)
import { CellarConnector } from "./cellar-connector.js";
import {
  normalizeEULegalActsBatch,
  deduplicateRegulations,
  mergeRegulationData,
  validateRegulation,
  calculateRegulationStats,
} from "./cellar-normalizer.js";

// Configuration
const INGESTION_CONFIG = {
  // How many years back to search for regulations
  yearsBack: 5,

  // Maximum regulations to process per run
  maxRegulations: 500,

  // Retry configuration
  maxRetries: 3,
  retryDelayMs: 5000,

  // Logging
  verbose: true,
};

/**
 * Logger utility
 */
function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...data,
  };
  console.log(JSON.stringify(logEntry));
}

/**
 * Main ingestion workflow
 */
async function runIngestion() {
  const startTime = Date.now();
  log("info", "Starting CELLAR ingestion workflow");

  try {
    // Initialize database connection
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    const db = drizzle(connection);
    log("info", "Database connection established");

    // Initialize CELLAR connector
    const connector = new CellarConnector();

    // Test connection
    const isConnected = await connector.testConnection();
    if (!isConnected) {
      throw new Error("Failed to connect to CELLAR endpoint");
    }
    log("info", "CELLAR connection verified");

    // Fetch ESG regulations from CELLAR
    log(
      "info",
      `Fetching ESG regulations from last ${INGESTION_CONFIG.yearsBack} years`
    );
    const acts = await connector.getESGRegulations(INGESTION_CONFIG.yearsBack);
    log("info", `Retrieved ${acts.length} legal acts from CELLAR`);

    // Normalize acts to ISA schema
    log("info", "Normalizing legal acts to ISA schema");
    let normalized = normalizeEULegalActsBatch(acts);
    log(
      "info",
      `Normalized ${normalized.length} regulations (filtered ${acts.length - normalized.length} non-ESG acts)`
    );

    // Deduplicate
    normalized = deduplicateRegulations(normalized);
    log("info", `After deduplication: ${normalized.length} unique regulations`);

    // Validate
    const valid = normalized.filter(validateRegulation);
    const invalid = normalized.length - valid.length;
    if (invalid > 0) {
      log("warn", `Filtered out ${invalid} invalid regulations`);
    }

    // Calculate statistics
    const stats = calculateRegulationStats(valid);
    log("info", "Regulation statistics", stats);

    // Process each regulation
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const regulation of valid) {
      try {
        // Check if regulation already exists
        const existing = await db
          .select()
          .from(regulations)
          .where(eq(regulations.celexId, regulation.celexId))
          .limit(1);

        if (existing.length > 0) {
          // Merge with existing data
          const merged = mergeRegulationData(existing[0], regulation);

          // Update if changed
          await db
            .update(regulations)
            .set(merged)
            .where(eq(regulations.celexId, regulation.celexId));

          updated++;
          if (INGESTION_CONFIG.verbose) {
            log("debug", `Updated regulation: ${regulation.celexId}`);
          }
        } else {
          // Insert new regulation
          await db.insert(regulations).values(regulation);
          inserted++;
          if (INGESTION_CONFIG.verbose) {
            log("debug", `Inserted regulation: ${regulation.celexId}`);
          }
        }
      } catch (error) {
        errors++;
        log("error", `Failed to process regulation: ${regulation.celexId}`, {
          error: error.message,
        });
      }
    }

    // Close database connection
    await connection.end();

    // Log summary
    const duration = Date.now() - startTime;
    log("info", "Ingestion workflow completed", {
      duration: `${duration}ms`,
      inserted,
      updated,
      skipped,
      errors,
      total: valid.length,
    });

    return {
      success: true,
      inserted,
      updated,
      errors,
      duration,
    };
  } catch (error) {
    log("error", "Ingestion workflow failed", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Retry wrapper with exponential backoff
 */
async function runWithRetry() {
  let lastError;

  for (let attempt = 1; attempt <= INGESTION_CONFIG.maxRetries; attempt++) {
    try {
      log(
        "info",
        `Ingestion attempt ${attempt}/${INGESTION_CONFIG.maxRetries}`
      );
      const result = await runIngestion();
      return result;
    } catch (error) {
      lastError = error;
      log("warn", `Attempt ${attempt} failed`, { error: error.message });

      if (attempt < INGESTION_CONFIG.maxRetries) {
        const delay = INGESTION_CONFIG.retryDelayMs * attempt;
        log("info", `Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  log("error", "All retry attempts exhausted", { error: lastError.message });
  throw lastError;
}

/**
 * Entry point
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  runWithRetry()
    .then(result => {
      log("info", "Scheduler completed successfully", result);
      process.exit(0);
    })
    .catch(error => {
      log("error", "Scheduler failed", { error: error.message });
      process.exit(1);
    });
}

export { runIngestion, runWithRetry };
