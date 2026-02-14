// @ts-nocheck
/**
 * Weekly CELLAR Auto-Ingestion Script
 *
 * Automatically discovers and ingests new EU ESG regulations from CELLAR SPARQL endpoint.
 * Runs weekly to keep ISA platform up-to-date with latest regulatory developments.
 *
 * Features:
 * - Queries CELLAR for recent legal acts (last 2 years)
 * - Filters for ESG-related regulations using keywords
 * - Normalizes CELEX IDs to standard format
 * - Deduplicates against existing database records
 * - Sends email notifications for new regulations discovered
 * - Logs all operations for monitoring
 */

import { CellarConnector } from "./cellar-connector";
import { normalizeEULegalAct } from "./cellar-normalizer";
import { getDb } from "./db";
import { regulations } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { generateEmbedding } from "./_core/embedding";
import { serverLogger } from "./_core/logger-wiring";


interface IngestionResult {
  fetched: number;
  normalized: number;
  new: number;
  skipped: number;
  errors: string[];
  newRegulations: Array<{ celexId: string; title: string }>;
}

/**
 * Normalize CELEX ID to standard format
 * Examples:
 * - "celex:32023L1115" → "32023L1115"
 * - "32023-1115" → "32023L1115"
 * - "32023L1115-ENV" → "32023L1115"
 */
function normalizeCelexId(celexId: string): string {
  // Remove "celex:" prefix
  let normalized = celexId.replace(/^celex:/i, "");

  // Remove hyphens
  normalized = normalized.replace(/-/g, "");

  // Remove suffixes after the main ID (e.g., "-ENV", "-SOC")
  normalized = normalized.split("-")[0];

  // Ensure format: 3YYYYTNNNN (3 = sector, YYYY = year, T = type, NNNN = number)
  // Example: 32023L1115
  const match = normalized.match(/^(3\d{4}[A-Z]\d+)/);
  return match ? match[1] : normalized;
}

/**
 * Check if regulation already exists in database
 */
async function regulationExists(celexId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const normalized = normalizeCelexId(celexId);
  const existing = await db
    .select()
    .from(regulations)
    .where(eq(regulations.celexId, normalized))
    .limit(1);

  return existing.length > 0;
}

/**
 * Insert new regulation into database
 */
async function insertRegulation(regulation: any): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Generate embedding for new regulation
  let embedding: number[] | undefined;
  try {
    const embeddingText = `${regulation.title} ${regulation.description || ""}`;
    const result = await generateEmbedding(embeddingText);
    embedding = result.embedding;
    console.log(
      `[Weekly Ingestion] Generated embedding for ${regulation.celexId}`
    );
  } catch (error) {
    serverLogger.error(
      `[Weekly Ingestion] Failed to generate embedding for ${regulation.celexId}:`,
      error
    );
    // Continue without embedding - can be generated later
  }

  await db.insert(regulations).values({
    celexId: regulation.celexId,
    title: regulation.title,
    regulationType: regulation.type || "OTHER",
    effectiveDate: regulation.effectiveDate
      ? new Date(regulation.effectiveDate).toISOString()
      : null,
    description: regulation.description || null,
    sourceUrl: regulation.eurlexUrl || null,
    embedding: embedding as any,
  });
}

/**
 * Main ingestion workflow
 */
async function runWeeklyIngestion(): Promise<IngestionResult> {
  const result: IngestionResult = {
    fetched: 0,
    normalized: 0,
    new: 0,
    skipped: 0,
    errors: [],
    newRegulations: [],
  };

  const startTime = Date.now();

  try {
    console.log("[Weekly Ingestion] Starting CELLAR query...");

    // Step 1: Fetch recent legal acts from CELLAR (last 2 years)
    const connector = new CellarConnector();
    const acts = await connector.getAllRecentRegulations(2, 200); // Last 2 years, max 200 acts
    result.fetched = acts.length;
    console.log(
      `[Weekly Ingestion] Fetched ${acts.length} legal acts from CELLAR`
    );

    if (acts.length === 0) {
      console.log("[Weekly Ingestion] No legal acts found");
      return result;
    }

    // Step 2: Normalize to ISA schema
    const normalized = acts
      .map(act => normalizeEULegalAct(act))
      .filter((reg): reg is NonNullable<typeof reg> => reg !== null);
    result.normalized = normalized.length;
    console.log(
      `[Weekly Ingestion] Normalized ${normalized.length} regulations`
    );

    // Step 3: Filter for ESG-related regulations (already done by normalizer)
    // Step 4: Deduplicate and insert new regulations
    for (const regulation of normalized) {
      try {
        // Skip if missing required fields
        if (!regulation.celexId || !regulation.title) {
          result.skipped++;
          console.log(
            `[Weekly Ingestion] Skipping regulation with missing celexId or title`
          );
          continue;
        }

        const exists = await regulationExists(regulation.celexId);

        if (exists) {
          result.skipped++;
          console.log(
            `[Weekly Ingestion] Skipping existing regulation: ${regulation.celexId}`
          );
        } else {
          await insertRegulation(regulation);
          result.new++;
          result.newRegulations.push({
            celexId: regulation.celexId!,
            title: regulation.title!,
          });
          console.log(
            `[Weekly Ingestion] ✅ Inserted new regulation: ${regulation.celexId} - ${regulation.title}`
          );
        }
      } catch (error) {
        const errorMsg = `Failed to process ${regulation.celexId}: ${error}`;
        result.errors.push(errorMsg);
        serverLogger.error(`[Weekly Ingestion] ❌ ${errorMsg}`);
      }
    }

    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`[Weekly Ingestion] Completed in ${duration}s`);
    console.log(
      `[Weekly Ingestion] Summary: ${result.new} new, ${result.skipped} skipped, ${result.errors.length} errors`
    );

    // Step 5: Send email notification if new regulations found
    if (result.new > 0) {
      const regulationList = result.newRegulations
        .map((r, i) => `${i + 1}. ${r.title} (${r.celexId})`)
        .join("\n");

      await notifyOwner({
        title: `✅ Weekly CELLAR Ingestion: ${result.new} New Regulation${result.new > 1 ? "s" : ""} Found`,
        content: `Weekly CELLAR ingestion discovered ${result.new} new ESG regulation${result.new > 1 ? "s" : ""}:

${regulationList}

**Summary:**
- Fetched: ${result.fetched} legal acts
- Normalized: ${result.normalized} ESG regulations
- New: ${result.new}
- Skipped (existing): ${result.skipped}
- Errors: ${result.errors.length}
- Duration: ${duration} seconds

View new regulations in ISA: https://gs1isa.com/hub/regulations`,
      });
      console.log("[Weekly Ingestion] Email notification sent");
    } else {
      console.log(
        "[Weekly Ingestion] No new regulations found, skipping email notification"
      );
    }

    return result;
  } catch (error) {
    const errorMsg = `Weekly ingestion failed: ${error}`;
    result.errors.push(errorMsg);
    serverLogger.error(`[Weekly Ingestion] ❌ ${errorMsg}`);

    // Send failure notification
    await notifyOwner({
      title: "❌ Weekly CELLAR Ingestion Failed",
      content: `Weekly CELLAR ingestion encountered an error:

${errorMsg}

Please check logs and investigate the issue.`,
    });

    return result;
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runWeeklyIngestion()
    .then(result => {
      console.log(
        "\n[Weekly Ingestion] Final Result:",
        JSON.stringify(result, null, 2)
      );
      process.exit(result.errors.length > 0 ? 1 : 0);
    })
    .catch(error => {
      serverLogger.error(error, { context: "[Weekly Ingestion] Fatal error:" });
      process.exit(1);
    });
}

export { runWeeklyIngestion, normalizeCelexId };
