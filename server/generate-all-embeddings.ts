/**
 * Generate Embeddings for All Database Records
 *
 * One-time migration script to generate vector embeddings for all existing
 * regulations and GS1 standards. This enables fast semantic search via vector similarity.
 *
 * Usage: npx tsx server/generate-all-embeddings.ts
 */

import { getDb } from "./db";
import { regulations, gs1Standards } from "../drizzle/schema";
import { generateEmbedding, prepareTextForEmbedding } from "./_core/embedding";
import { eq } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";


interface GenerationStats {
  regulationsProcessed: number;
  regulationsSkipped: number;
  regulationsErrors: number;
  standardsProcessed: number;
  standardsSkipped: number;
  standardsErrors: number;
  totalTokens: number;
  estimatedCost: number;
}

/**
 * Generate embedding for a regulation
 */
async function generateRegulationEmbedding(
  regulation: any
): Promise<{ embedding: number[]; tokens: number }> {
  // Combine title and description for richer semantic representation
  const text = prepareTextForEmbedding(
    `${regulation.title} ${regulation.description || ""}`
  );

  const result = await generateEmbedding(text);
  return {
    embedding: result.embedding,
    tokens: result.usage.total_tokens,
  };
}

/**
 * Generate embedding for a GS1 standard
 */
async function generateStandardEmbedding(
  standard: any
): Promise<{ embedding: number[]; tokens: number }> {
  // Combine name, description, and scope for comprehensive representation
  const text = prepareTextForEmbedding(
    `${standard.standardName} ${standard.description || ""} ${standard.scope || ""}`
  );

  const result = await generateEmbedding(text);
  return {
    embedding: result.embedding,
    tokens: result.usage.total_tokens,
  };
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
    totalTokens: 0,
    estimatedCost: 0,
  };

  const startTime = Date.now();
  console.log("[Embeddings] Starting batch embedding generation...\n");

  const db = await getDb();
  if (!db) {
    serverLogger.error("[Embeddings] Database not available");
    process.exit(1);
  }

  // ========== Process Regulations ==========
  console.log("[Embeddings] Processing regulations...");
  const allRegulations = await db.select().from(regulations);
  console.log(`[Embeddings] Found ${allRegulations.length} regulations\n`);

  for (const regulation of allRegulations) {
    try {
      // Skip if embedding already exists
      if (
        regulation.embedding &&
        Array.isArray(regulation.embedding) &&
        regulation.embedding.length > 0
      ) {
        console.log(
          `[Embeddings] ⏭️  Skipping ${regulation.celexId} (embedding exists)`
        );
        stats.regulationsSkipped++;
        continue;
      }

      console.log(
        `[Embeddings] 🔄 Generating embedding for ${regulation.celexId}: ${regulation.title?.substring(0, 50)}...`
      );

      const { embedding, tokens } =
        await generateRegulationEmbedding(regulation);
      stats.totalTokens += tokens;

      // Update database with embedding
      await db
        .update(regulations)
        .set({ embedding })
        .where(eq(regulations.id, regulation.id));

      stats.regulationsProcessed++;
      console.log(
        `[Embeddings] ✅ Generated embedding for ${regulation.celexId} (${tokens} tokens)`
      );
    } catch (error) {
      stats.regulationsErrors++;
      serverLogger.error(
        `[Embeddings] ❌ Failed to generate embedding for ${regulation.celexId}:`,
        error
      );
    }
  }

  console.log(
    `\n[Embeddings] Regulations complete: ${stats.regulationsProcessed} processed, ${stats.regulationsSkipped} skipped, ${stats.regulationsErrors} errors\n`
  );

  // ========== Process GS1 Standards ==========
  console.log("[Embeddings] Processing GS1 standards...");
  const allStandards = await db.select().from(gs1Standards);
  console.log(`[Embeddings] Found ${allStandards.length} standards\n`);

  for (const standard of allStandards) {
    try {
      // Skip if embedding already exists
      if (
        standard.embedding &&
        Array.isArray(standard.embedding) &&
        standard.embedding.length > 0
      ) {
        console.log(
          `[Embeddings] ⏭️  Skipping ${standard.standardCode} (embedding exists)`
        );
        stats.standardsSkipped++;
        continue;
      }

      console.log(
        `[Embeddings] 🔄 Generating embedding for ${standard.standardCode}: ${standard.standardName?.substring(0, 50)}...`
      );

      const { embedding, tokens } = await generateStandardEmbedding(standard);
      stats.totalTokens += tokens;

      // Update database with embedding
      await db
        .update(gs1Standards)
        .set({ embedding })
        .where(eq(gs1Standards.id, standard.id));

      stats.standardsProcessed++;
      console.log(
        `[Embeddings] ✅ Generated embedding for ${standard.standardCode} (${tokens} tokens)`
      );
    } catch (error) {
      stats.standardsErrors++;
      serverLogger.error(
        `[Embeddings] ❌ Failed to generate embedding for ${standard.standardCode}:`,
        error
      );
    }
  }

  console.log(
    `\n[Embeddings] Standards complete: ${stats.standardsProcessed} processed, ${stats.standardsSkipped} skipped, ${stats.standardsErrors} errors\n`
  );

  // ========== Summary ==========
  const duration = Math.round((Date.now() - startTime) / 1000);
  stats.estimatedCost = (stats.totalTokens / 1_000_000) * 0.02; // $0.02 per 1M tokens

  console.log("=".repeat(60));
  console.log("EMBEDDING GENERATION COMPLETE");
  console.log("=".repeat(60));
  console.log(`Duration: ${duration}s`);
  console.log(`\nRegulations:`);
  console.log(`  - Processed: ${stats.regulationsProcessed}`);
  console.log(`  - Skipped: ${stats.regulationsSkipped}`);
  console.log(`  - Errors: ${stats.regulationsErrors}`);
  console.log(`\nGS1 Standards:`);
  console.log(`  - Processed: ${stats.standardsProcessed}`);
  console.log(`  - Skipped: ${stats.standardsSkipped}`);
  console.log(`  - Errors: ${stats.standardsErrors}`);
  console.log(`\nAPI Usage:`);
  console.log(`  - Total tokens: ${stats.totalTokens.toLocaleString()}`);
  console.log(`  - Estimated cost: $${stats.estimatedCost.toFixed(4)}`);
  console.log("=".repeat(60));

  const totalErrors = stats.regulationsErrors + stats.standardsErrors;
  process.exit(totalErrors > 0 ? 1 : 0);
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllEmbeddings();
}

export { generateAllEmbeddings };
