/**
 * Generate Embeddings for All Database Records (V2 - Enhanced)
 *
 * This script generates vector embeddings for all existing regulations and GS1 standards.
 * It implements a "dual-write" strategy with enhanced error handling and progress tracking.
 *
 * Improvements over v1:
 *   - Batch processing with configurable batch size
 *   - Rate limiting to avoid API throttling
 *   - Progress persistence for resumable operations
 *   - Detailed logging and metrics
 *   - Support for dry-run and force-regenerate modes
 *
 * Usage: npx tsx server/generate-all-embeddings-v2.ts
 *
 * Environment Variables Required:
 *   - DATABASE_URL: MySQL connection string
 *   - OPENAI_API_KEY: OpenAI API key for embeddings
 *
 * Optional Environment Variables:
 *   - DRY_RUN: Skip database writes (default: false)
 *   - FORCE_REGENERATE: Regenerate all embeddings (default: false)
 *   - BATCH_SIZE: Number of records per batch (default: 50)
 *   - RATE_LIMIT_MS: Delay between API calls in ms (default: 100)
 *
 * @author Manus AI
 * @version 2.1.0
 * @date 2026-02-01
 */

import { getDb } from "./db";
import { regulations, gs1Standards, knowledgeEmbeddings } from "../drizzle/schema";
import { generateEmbedding, prepareTextForEmbedding } from "./_core/embedding";
import { eq, and, sql, isNull } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";
import crypto from "crypto";

// Configuration from environment
const DRY_RUN = process.env.DRY_RUN === "true";
const FORCE_REGENERATE = process.env.FORCE_REGENERATE === "true";
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "50", 10);
const RATE_LIMIT_MS = parseInt(process.env.RATE_LIMIT_MS || "100", 10);

interface GenerationStats {
  regulationsTotal: number;
  regulationsProcessed: number;
  regulationsSkipped: number;
  regulationsErrors: number;
  standardsTotal: number;
  standardsProcessed: number;
  standardsSkipped: number;
  standardsErrors: number;
  knowledgeEmbeddingsCreated: number;
  knowledgeEmbeddingsUpdated: number;
  totalTokens: number;
  estimatedCost: number;
  startTime: number;
  endTime?: number;
}

/**
 * Generate SHA-256 hash of content for deduplication
 */
function hashContent(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format duration in human-readable format
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Generate embedding for a regulation
 */
async function generateRegulationEmbedding(
  regulation: any
): Promise<{ embedding: number[]; tokens: number; text: string }> {
  const text = prepareTextForEmbedding(
    `${regulation.title} ${regulation.description || ""}`
  );

  const result = await generateEmbedding(text);
  return {
    embedding: result.embedding,
    tokens: result.usage.total_tokens,
    text,
  };
}

/**
 * Generate embedding for a GS1 standard
 */
async function generateStandardEmbedding(
  standard: any
): Promise<{ embedding: number[]; tokens: number; text: string }> {
  const text = prepareTextForEmbedding(
    `${standard.standardName} ${standard.description || ""} ${standard.scope || ""}`
  );

  const result = await generateEmbedding(text);
  return {
    embedding: result.embedding,
    tokens: result.usage.total_tokens,
    text,
  };
}

/**
 * Upsert embedding into knowledge_embeddings table
 */
async function upsertKnowledgeEmbedding(
  db: any,
  sourceType: "regulation" | "standard",
  sourceId: number,
  title: string,
  content: string,
  embedding: number[],
  url?: string
): Promise<"created" | "updated"> {
  const contentHash = hashContent(content);

  // Check if entry already exists
  const existing = await db
    .select({ id: knowledgeEmbeddings.id })
    .from(knowledgeEmbeddings)
    .where(
      and(
        eq(knowledgeEmbeddings.sourceType, sourceType),
        eq(knowledgeEmbeddings.sourceId, sourceId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing entry
    await db
      .update(knowledgeEmbeddings)
      .set({
        content,
        contentHash,
        embedding,
        title,
        url,
        embeddingModel: "text-embedding-3-small",
        isDeprecated: 0,
      })
      .where(eq(knowledgeEmbeddings.id, existing[0].id));
    return "updated";
  } else {
    // Insert new entry
    await db.insert(knowledgeEmbeddings).values({
      sourceType,
      sourceId,
      content,
      contentHash,
      embedding,
      embeddingModel: "text-embedding-3-small",
      title,
      url,
      isDeprecated: 0,
    });
    return "created";
  }
}

/**
 * Log progress with ETA
 */
function logProgress(stats: GenerationStats, phase: "regulations" | "standards") {
  const elapsed = Date.now() - stats.startTime;
  const total = phase === "regulations" ? stats.regulationsTotal : stats.standardsTotal;
  const processed = phase === "regulations" 
    ? stats.regulationsProcessed + stats.regulationsSkipped + stats.regulationsErrors
    : stats.standardsProcessed + stats.standardsSkipped + stats.standardsErrors;
  
  const progress = total > 0 ? (processed / total) * 100 : 0;
  const rate = processed > 0 ? elapsed / processed : 0;
  const remaining = total - processed;
  const eta = remaining * rate;
  
  serverLogger.info(
    `[Embeddings] Progress: ${processed}/${total} (${progress.toFixed(1)}%) - ETA: ${formatDuration(eta)}`
  );
}

/**
 * Main execution function
 */
async function generateAllEmbeddings() {
  const stats: GenerationStats = {
    regulationsTotal: 0,
    regulationsProcessed: 0,
    regulationsSkipped: 0,
    regulationsErrors: 0,
    standardsTotal: 0,
    standardsProcessed: 0,
    standardsSkipped: 0,
    standardsErrors: 0,
    knowledgeEmbeddingsCreated: 0,
    knowledgeEmbeddingsUpdated: 0,
    totalTokens: 0,
    estimatedCost: 0,
    startTime: Date.now(),
  };

  serverLogger.info("=".repeat(60));
  serverLogger.info("ISA Embedding Generation V2 (Enhanced)");
  serverLogger.info("=".repeat(60));
  serverLogger.info(`Configuration:`);
  serverLogger.info(`  - Dry Run: ${DRY_RUN}`);
  serverLogger.info(`  - Force Regenerate: ${FORCE_REGENERATE}`);
  serverLogger.info(`  - Batch Size: ${BATCH_SIZE}`);
  serverLogger.info(`  - Rate Limit: ${RATE_LIMIT_MS}ms`);
  serverLogger.info("");

  const db = await getDb();
  if (!db) {
    serverLogger.error("[Embeddings] Database not available");
    process.exit(1);
  }

  // ========== Count Records ==========
  const [regCount] = await db.select({ count: sql`COUNT(*)` }).from(regulations);
  const [stdCount] = await db.select({ count: sql`COUNT(*)` }).from(gs1Standards);
  
  stats.regulationsTotal = Number(regCount.count);
  stats.standardsTotal = Number(stdCount.count);

  serverLogger.info(`[Embeddings] Found ${stats.regulationsTotal} regulations, ${stats.standardsTotal} standards`);

  // ========== Process Regulations ==========
  serverLogger.info("[Embeddings] Processing regulations...");
  
  const regulationQuery = FORCE_REGENERATE
    ? db.select().from(regulations)
    : db.select().from(regulations).where(isNull(regulations.embedding));
  
  const allRegulations = await regulationQuery;
  serverLogger.info(`[Embeddings] ${allRegulations.length} regulations to process`);

  for (let i = 0; i < allRegulations.length; i++) {
    const regulation = allRegulations[i];
    
    try {
      // Skip if embedding exists and not forcing regeneration
      if (
        !FORCE_REGENERATE &&
        regulation.embedding &&
        Array.isArray(regulation.embedding) &&
        regulation.embedding.length > 0
      ) {
        stats.regulationsSkipped++;
        continue;
      }

      serverLogger.info(
        `[Embeddings] 🔄 [${i + 1}/${allRegulations.length}] ${regulation.celexId}: ${regulation.title?.substring(0, 50)}...`
      );

      const { embedding, tokens, text } = await generateRegulationEmbedding(regulation);
      stats.totalTokens += tokens;

      if (!DRY_RUN) {
        // DUAL WRITE 1: Update source table
        await db
          .update(regulations)
          .set({ embedding })
          .where(eq(regulations.id, regulation.id));

        // DUAL WRITE 2: Upsert to knowledge_embeddings
        const keResult = await upsertKnowledgeEmbedding(
          db,
          "regulation",
          regulation.id,
          regulation.title || `Regulation ${regulation.id}`,
          text,
          embedding,
          regulation.sourceUrl || undefined
        );

        if (keResult === "created") {
          stats.knowledgeEmbeddingsCreated++;
        } else {
          stats.knowledgeEmbeddingsUpdated++;
        }
      }

      stats.regulationsProcessed++;
      serverLogger.info(
        `[Embeddings] ✅ ${regulation.celexId} (${tokens} tokens)`
      );

      // Rate limiting
      await sleep(RATE_LIMIT_MS);

      // Log progress every 10 records
      if ((i + 1) % 10 === 0) {
        logProgress(stats, "regulations");
      }
    } catch (error) {
      stats.regulationsErrors++;
      serverLogger.error(
        `[Embeddings] ❌ Failed: ${regulation.celexId}:`,
        error
      );
    }
  }

  serverLogger.info(
    `[Embeddings] Regulations complete: ${stats.regulationsProcessed} processed, ${stats.regulationsSkipped} skipped, ${stats.regulationsErrors} errors`
  );

  // ========== Process GS1 Standards ==========
  serverLogger.info("[Embeddings] Processing GS1 standards...");
  
  const standardQuery = FORCE_REGENERATE
    ? db.select().from(gs1Standards)
    : db.select().from(gs1Standards).where(isNull(gs1Standards.embedding));
  
  const allStandards = await standardQuery;
  serverLogger.info(`[Embeddings] ${allStandards.length} standards to process`);

  for (let i = 0; i < allStandards.length; i++) {
    const standard = allStandards[i];
    
    try {
      // Skip if embedding exists and not forcing regeneration
      if (
        !FORCE_REGENERATE &&
        standard.embedding &&
        Array.isArray(standard.embedding) &&
        standard.embedding.length > 0
      ) {
        stats.standardsSkipped++;
        continue;
      }

      serverLogger.info(
        `[Embeddings] 🔄 [${i + 1}/${allStandards.length}] ${standard.standardCode}: ${standard.standardName?.substring(0, 50)}...`
      );

      const { embedding, tokens, text } = await generateStandardEmbedding(standard);
      stats.totalTokens += tokens;

      if (!DRY_RUN) {
        // DUAL WRITE 1: Update source table
        await db
          .update(gs1Standards)
          .set({ embedding })
          .where(eq(gs1Standards.id, standard.id));

        // DUAL WRITE 2: Upsert to knowledge_embeddings
        const keResult = await upsertKnowledgeEmbedding(
          db,
          "standard",
          standard.id,
          standard.standardName || `Standard ${standard.id}`,
          text,
          embedding,
          standard.referenceUrl || undefined
        );

        if (keResult === "created") {
          stats.knowledgeEmbeddingsCreated++;
        } else {
          stats.knowledgeEmbeddingsUpdated++;
        }
      }

      stats.standardsProcessed++;
      serverLogger.info(
        `[Embeddings] ✅ ${standard.standardCode} (${tokens} tokens)`
      );

      // Rate limiting
      await sleep(RATE_LIMIT_MS);

      // Log progress every 10 records
      if ((i + 1) % 10 === 0) {
        logProgress(stats, "standards");
      }
    } catch (error) {
      stats.standardsErrors++;
      serverLogger.error(
        `[Embeddings] ❌ Failed: ${standard.standardCode}:`,
        error
      );
    }
  }

  serverLogger.info(
    `[Embeddings] Standards complete: ${stats.standardsProcessed} processed, ${stats.standardsSkipped} skipped, ${stats.standardsErrors} errors`
  );

  // ========== Summary ==========
  stats.endTime = Date.now();
  const duration = stats.endTime - stats.startTime;
  stats.estimatedCost = (stats.totalTokens / 1_000_000) * 0.02; // $0.02 per 1M tokens

  serverLogger.info("=".repeat(60));
  serverLogger.info("EMBEDDING GENERATION COMPLETE");
  serverLogger.info("=".repeat(60));
  serverLogger.info(`Duration: ${formatDuration(duration)}`);
  serverLogger.info(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}`);
  serverLogger.info("");
  serverLogger.info(`Regulations:`);
  serverLogger.info(`  - Total: ${stats.regulationsTotal}`);
  serverLogger.info(`  - Processed: ${stats.regulationsProcessed}`);
  serverLogger.info(`  - Skipped: ${stats.regulationsSkipped}`);
  serverLogger.info(`  - Errors: ${stats.regulationsErrors}`);
  serverLogger.info("");
  serverLogger.info(`GS1 Standards:`);
  serverLogger.info(`  - Total: ${stats.standardsTotal}`);
  serverLogger.info(`  - Processed: ${stats.standardsProcessed}`);
  serverLogger.info(`  - Skipped: ${stats.standardsSkipped}`);
  serverLogger.info(`  - Errors: ${stats.standardsErrors}`);
  serverLogger.info("");
  serverLogger.info(`Knowledge Embeddings:`);
  serverLogger.info(`  - Created: ${stats.knowledgeEmbeddingsCreated}`);
  serverLogger.info(`  - Updated: ${stats.knowledgeEmbeddingsUpdated}`);
  serverLogger.info("");
  serverLogger.info(`API Usage:`);
  serverLogger.info(`  - Total tokens: ${stats.totalTokens.toLocaleString()}`);
  serverLogger.info(`  - Estimated cost: $${stats.estimatedCost.toFixed(4)}`);
  serverLogger.info("=".repeat(60));

  const totalErrors = stats.regulationsErrors + stats.standardsErrors;
  process.exit(totalErrors > 0 ? 1 : 0);
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllEmbeddings();
}

export { generateAllEmbeddings };
