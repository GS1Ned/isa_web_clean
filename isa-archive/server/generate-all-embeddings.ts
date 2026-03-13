/**
 * Generate Embeddings for All Database Records (Dual-Write Version)
 *
 * This script generates vector embeddings for all existing regulations and GS1 standards.
 * It implements a "dual-write" strategy:
 *   1. Updates the embedding column on the source table (regulations, gs1_standards)
 *   2. Inserts/updates a corresponding row in the knowledge_embeddings table
 *
 * The knowledge_embeddings table is the primary source for Ask ISA semantic search.
 *
 * Usage: npx tsx server/generate-all-embeddings.ts
 *
 * Environment Variables Required:
 *   - DATABASE_URL: MySQL connection string
 *   - OPENAI_API_KEY: OpenAI API key for embeddings
 *
 * @author Manus AI
 * @version 2.0.0
 * @date 2026-01-27
 */

import { getDb } from "./db";
import { regulations, gs1Standards, knowledgeEmbeddings } from "../drizzle/schema";
import { generateEmbedding, prepareTextForEmbedding } from "./_core/embedding";
import { eq, and, sql } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";
import crypto from "crypto";

interface GenerationStats {
  regulationsProcessed: number;
  regulationsSkipped: number;
  regulationsErrors: number;
  standardsProcessed: number;
  standardsSkipped: number;
  standardsErrors: number;
  knowledgeEmbeddingsCreated: number;
  knowledgeEmbeddingsUpdated: number;
  totalTokens: number;
  estimatedCost: number;
}

/**
 * Generate SHA-256 hash of content for deduplication
 */
function hashContent(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
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
 * Main execution function
 */
async function generateAllEmbeddings() {
  const stats: GenerationStats = {
    regulationsProcessed: 0,
    regulationsSkipped: 0,
    regulationsErrors: 0,
    standardsProcessed: 0,
    standardsSkipped: 0,
    standardsErrors: 0,
    knowledgeEmbeddingsCreated: 0,
    knowledgeEmbeddingsUpdated: 0,
    totalTokens: 0,
    estimatedCost: 0,
  };

  const startTime = Date.now();
  serverLogger.info("[Embeddings] Starting batch embedding generation (dual-write mode)...");

  const db = await getDb();
  if (!db) {
    serverLogger.error("[Embeddings] Database not available");
    process.exit(1);
  }

  // ========== Process Regulations ==========
  serverLogger.info("[Embeddings] Processing regulations...");
  const allRegulations = await db.select().from(regulations);
  serverLogger.info(`[Embeddings] Found ${allRegulations.length} regulations`);

  for (const regulation of allRegulations) {
    try {
      // Skip if embedding already exists on source table
      if (
        regulation.embedding &&
        Array.isArray(regulation.embedding) &&
        regulation.embedding.length > 0
      ) {
        serverLogger.info(
          `[Embeddings] ⏭️  Skipping ${regulation.celexId} (embedding exists)`
        );
        stats.regulationsSkipped++;
        continue;
      }

      serverLogger.info(
        `[Embeddings] 🔄 Generating embedding for ${regulation.celexId}: ${regulation.title?.substring(0, 50)}...`
      );

      const { embedding, tokens, text } =
        await generateRegulationEmbedding(regulation);
      stats.totalTokens += tokens;

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

      stats.regulationsProcessed++;
      serverLogger.info(
        `[Embeddings] ✅ Generated embedding for ${regulation.celexId} (${tokens} tokens, KE: ${keResult})`
      );
    } catch (error) {
      stats.regulationsErrors++;
      serverLogger.error(
        `[Embeddings] ❌ Failed to generate embedding for ${regulation.celexId}:`,
        error
      );
    }
  }

  serverLogger.info(
    `[Embeddings] Regulations complete: ${stats.regulationsProcessed} processed, ${stats.regulationsSkipped} skipped, ${stats.regulationsErrors} errors`
  );

  // ========== Process GS1 Standards ==========
  serverLogger.info("[Embeddings] Processing GS1 standards...");
  const allStandards = await db.select().from(gs1Standards);
  serverLogger.info(`[Embeddings] Found ${allStandards.length} standards`);

  for (const standard of allStandards) {
    try {
      // Skip if embedding already exists on source table
      if (
        standard.embedding &&
        Array.isArray(standard.embedding) &&
        standard.embedding.length > 0
      ) {
        serverLogger.info(
          `[Embeddings] ⏭️  Skipping ${standard.standardCode} (embedding exists)`
        );
        stats.standardsSkipped++;
        continue;
      }

      serverLogger.info(
        `[Embeddings] 🔄 Generating embedding for ${standard.standardCode}: ${standard.standardName?.substring(0, 50)}...`
      );

      const { embedding, tokens, text } = await generateStandardEmbedding(standard);
      stats.totalTokens += tokens;

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

      stats.standardsProcessed++;
      serverLogger.info(
        `[Embeddings] ✅ Generated embedding for ${standard.standardCode} (${tokens} tokens, KE: ${keResult})`
      );
    } catch (error) {
      stats.standardsErrors++;
      serverLogger.error(
        `[Embeddings] ❌ Failed to generate embedding for ${standard.standardCode}:`,
        error
      );
    }
  }

  serverLogger.info(
    `[Embeddings] Standards complete: ${stats.standardsProcessed} processed, ${stats.standardsSkipped} skipped, ${stats.standardsErrors} errors`
  );

  // ========== Summary ==========
  const duration = Math.round((Date.now() - startTime) / 1000);
  stats.estimatedCost = (stats.totalTokens / 1_000_000) * 0.02; // $0.02 per 1M tokens

  serverLogger.info("=".repeat(60));
  serverLogger.info("EMBEDDING GENERATION COMPLETE (DUAL-WRITE MODE)");
  serverLogger.info("=".repeat(60));
  serverLogger.info(`Duration: ${duration}s`);
  serverLogger.info(`Regulations:`);
  serverLogger.info(`  - Processed: ${stats.regulationsProcessed}`);
  serverLogger.info(`  - Skipped: ${stats.regulationsSkipped}`);
  serverLogger.info(`  - Errors: ${stats.regulationsErrors}`);
  serverLogger.info(`GS1 Standards:`);
  serverLogger.info(`  - Processed: ${stats.standardsProcessed}`);
  serverLogger.info(`  - Skipped: ${stats.standardsSkipped}`);
  serverLogger.info(`  - Errors: ${stats.standardsErrors}`);
  serverLogger.info(`Knowledge Embeddings:`);
  serverLogger.info(`  - Created: ${stats.knowledgeEmbeddingsCreated}`);
  serverLogger.info(`  - Updated: ${stats.knowledgeEmbeddingsUpdated}`);
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
