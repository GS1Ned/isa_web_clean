/**
 * Optimized Embedding Generation for All Database Records
 *
 * This script generates vector embeddings with the following optimizations:
 *   1. Batch API calls (up to 100 items per request)
 *   2. Parallel processing (configurable concurrency)
 *   3. Exponential backoff with jitter for rate limiting
 *   4. Progress persistence for resume capability
 *   5. Content hash-based change detection
 *
 * Usage: npx tsx server/generate-all-embeddings-optimized.ts
 *
 * Environment Variables:
 *   - DATABASE_URL: MySQL connection string
 *   - OPENAI_API_KEY: OpenAI API key for embeddings
 *   - DRY_RUN: Skip database writes (default: false)
 *   - FORCE_REGENERATE: Regenerate all embeddings (default: false)
 *   - BATCH_SIZE: Items per API call (default: 100)
 *   - CONCURRENCY: Parallel batches (default: 5)
 *
 * @author Manus AI
 * @version 3.0.0
 * @date 2026-02-01
 */

import { getDb } from "./db";
import { regulations, gs1Standards, knowledgeEmbeddings } from "../drizzle/schema";
import { prepareTextForEmbedding } from "./_core/embedding";
import { ENV } from "./_core/env";
import { eq, and, isNull, sql } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// ============ Configuration ============

const CONFIG = {
  BATCH_SIZE: parseInt(process.env.BATCH_SIZE || "100", 10),
  CONCURRENCY: parseInt(process.env.CONCURRENCY || "5", 10),
  MAX_RETRIES: 3,
  BASE_DELAY_MS: 1000,
  MAX_DELAY_MS: 30000,
  EMBEDDING_MODEL: "text-embedding-3-small",
  EMBEDDING_DIMENSIONS: 1536,
  OPENAI_API_URL: "https://api.openai.com/v1/embeddings",
  PROGRESS_FILE: "/tmp/embedding-progress.json",
  DRY_RUN: process.env.DRY_RUN === "true",
  FORCE_REGENERATE: process.env.FORCE_REGENERATE === "true",
};

// ============ Types ============

interface EmbeddingItem {
  id: number;
  type: "regulation" | "standard";
  identifier: string;
  title: string;
  text: string;
  contentHash: string;
  url?: string;
}

interface BatchResult {
  embeddings: number[][];
  tokens: number;
}

interface GenerationStats {
  totalItems: number;
  processed: number;
  skipped: number;
  errors: number;
  knowledgeCreated: number;
  knowledgeUpdated: number;
  totalTokens: number;
  estimatedCost: number;
  startTime: number;
  batchesProcessed: number;
}

interface ProgressState {
  lastProcessedId: number;
  lastProcessedType: "regulation" | "standard";
  stats: GenerationStats;
}

// ============ Utility Functions ============

function hashContent(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateBackoff(attempt: number): number {
  const delay = Math.min(
    CONFIG.BASE_DELAY_MS * Math.pow(2, attempt),
    CONFIG.MAX_DELAY_MS
  );
  // Add jitter (±25%)
  const jitter = delay * 0.25 * (Math.random() * 2 - 1);
  return Math.round(delay + jitter);
}

function saveProgress(state: ProgressState): void {
  try {
    fs.writeFileSync(CONFIG.PROGRESS_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    serverLogger.warn("[Embeddings] Failed to save progress:", error);
  }
}

function loadProgress(): ProgressState | null {
  try {
    if (fs.existsSync(CONFIG.PROGRESS_FILE)) {
      const data = fs.readFileSync(CONFIG.PROGRESS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    serverLogger.warn("[Embeddings] Failed to load progress:", error);
  }
  return null;
}

function clearProgress(): void {
  try {
    if (fs.existsSync(CONFIG.PROGRESS_FILE)) {
      fs.unlinkSync(CONFIG.PROGRESS_FILE);
    }
  } catch (error) {
    serverLogger.warn("[Embeddings] Failed to clear progress:", error);
  }
}

// ============ OpenAI Batch Embedding ============

async function generateEmbeddingsBatch(
  texts: string[],
  attempt: number = 0
): Promise<BatchResult> {
  if (!ENV.openaiApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  try {
    const response = await fetch(CONFIG.OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: CONFIG.EMBEDDING_MODEL,
        input: texts,
        encoding_format: "float",
      }),
    });

    if (response.status === 429) {
      // Rate limited - retry with backoff
      if (attempt < CONFIG.MAX_RETRIES) {
        const backoff = calculateBackoff(attempt);
        serverLogger.warn(
          `[Embeddings] Rate limited, retrying in ${backoff}ms (attempt ${attempt + 1}/${CONFIG.MAX_RETRIES})`
        );
        await sleep(backoff);
        return generateEmbeddingsBatch(texts, attempt + 1);
      }
      throw new Error("Rate limit exceeded after max retries");
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenAI API failed: ${response.status} ${response.statusText} – ${errorText}`
      );
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      throw new Error("OpenAI API returned no embeddings");
    }

    // Sort by index to maintain order
    const sortedEmbeddings = data.data
      .sort((a: any, b: any) => a.index - b.index)
      .map((item: any) => item.embedding);

    return {
      embeddings: sortedEmbeddings,
      tokens: data.usage.total_tokens,
    };
  } catch (error) {
    if (attempt < CONFIG.MAX_RETRIES && !(error instanceof Error && error.message.includes("Rate limit"))) {
      const backoff = calculateBackoff(attempt);
      serverLogger.warn(
        `[Embeddings] API error, retrying in ${backoff}ms (attempt ${attempt + 1}/${CONFIG.MAX_RETRIES}):`,
        error
      );
      await sleep(backoff);
      return generateEmbeddingsBatch(texts, attempt + 1);
    }
    throw error;
  }
}

// ============ Database Operations ============

async function upsertKnowledgeEmbedding(
  db: any,
  item: EmbeddingItem,
  embedding: number[]
): Promise<"created" | "updated" | "skipped"> {
  if (CONFIG.DRY_RUN) {
    return "skipped";
  }

  // Check if entry already exists with same content hash
  const existing = await db
    .select({ id: knowledgeEmbeddings.id, contentHash: knowledgeEmbeddings.contentHash })
    .from(knowledgeEmbeddings)
    .where(
      and(
        eq(knowledgeEmbeddings.sourceType, item.type),
        eq(knowledgeEmbeddings.sourceId, item.id)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Skip if content hasn't changed (unless force regenerate)
    if (!CONFIG.FORCE_REGENERATE && existing[0].contentHash === item.contentHash) {
      return "skipped";
    }

    // Update existing entry
    await db
      .update(knowledgeEmbeddings)
      .set({
        content: item.text,
        contentHash: item.contentHash,
        embedding,
        title: item.title,
        url: item.url,
        embeddingModel: CONFIG.EMBEDDING_MODEL,
        isDeprecated: 0,
      })
      .where(eq(knowledgeEmbeddings.id, existing[0].id));
    return "updated";
  } else {
    // Insert new entry
    await db.insert(knowledgeEmbeddings).values({
      sourceType: item.type,
      sourceId: item.id,
      content: item.text,
      contentHash: item.contentHash,
      embedding,
      embeddingModel: CONFIG.EMBEDDING_MODEL,
      title: item.title,
      url: item.url,
      isDeprecated: 0,
    });
    return "created";
  }
}

async function updateSourceTableEmbedding(
  db: any,
  item: EmbeddingItem,
  embedding: number[]
): Promise<void> {
  if (CONFIG.DRY_RUN) {
    return;
  }

  if (item.type === "regulation") {
    await db
      .update(regulations)
      .set({ embedding })
      .where(eq(regulations.id, item.id));
  } else {
    await db
      .update(gs1Standards)
      .set({ embedding })
      .where(eq(gs1Standards.id, item.id));
  }
}

// ============ Item Preparation ============

function prepareRegulationItem(regulation: any): EmbeddingItem {
  const text = prepareTextForEmbedding(
    `${regulation.title} ${regulation.description || ""}`
  );
  return {
    id: regulation.id,
    type: "regulation",
    identifier: regulation.celexId || `REG-${regulation.id}`,
    title: regulation.title || `Regulation ${regulation.id}`,
    text,
    contentHash: hashContent(text),
    url: regulation.sourceUrl,
  };
}

function prepareStandardItem(standard: any): EmbeddingItem {
  const text = prepareTextForEmbedding(
    `${standard.standardName} ${standard.description || ""} ${standard.scope || ""}`
  );
  return {
    id: standard.id,
    type: "standard",
    identifier: standard.standardCode || `STD-${standard.id}`,
    title: standard.standardName || `Standard ${standard.id}`,
    text,
    contentHash: hashContent(text),
    url: standard.referenceUrl,
  };
}

// ============ Batch Processing ============

async function processBatch(
  db: any,
  items: EmbeddingItem[],
  stats: GenerationStats
): Promise<void> {
  if (items.length === 0) return;

  const texts = items.map(item => item.text);

  try {
    serverLogger.info(
      `[Embeddings] 🔄 Processing batch of ${items.length} items...`
    );

    const { embeddings, tokens } = await generateEmbeddingsBatch(texts);
    stats.totalTokens += tokens;

    // Process each item with its embedding
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const embedding = embeddings[i];

      try {
        // Update source table
        await updateSourceTableEmbedding(db, item, embedding);

        // Upsert to knowledge_embeddings
        const result = await upsertKnowledgeEmbedding(db, item, embedding);

        if (result === "created") {
          stats.knowledgeCreated++;
        } else if (result === "updated") {
          stats.knowledgeUpdated++;
        } else {
          stats.skipped++;
        }

        stats.processed++;
      } catch (error) {
        stats.errors++;
        serverLogger.error(
          `[Embeddings] ❌ Failed to save ${item.identifier}:`,
          error
        );
      }
    }

    stats.batchesProcessed++;
    serverLogger.info(
      `[Embeddings] ✅ Batch complete: ${items.length} items, ${tokens} tokens`
    );
  } catch (error) {
    // Mark all items in batch as errors
    stats.errors += items.length;
    serverLogger.error(
      `[Embeddings] ❌ Batch failed (${items.length} items):`,
      error
    );
  }
}

async function processItemsInParallel(
  db: any,
  items: EmbeddingItem[],
  stats: GenerationStats
): Promise<void> {
  // Split items into batches
  const batches: EmbeddingItem[][] = [];
  for (let i = 0; i < items.length; i += CONFIG.BATCH_SIZE) {
    batches.push(items.slice(i, i + CONFIG.BATCH_SIZE));
  }

  serverLogger.info(
    `[Embeddings] Processing ${items.length} items in ${batches.length} batches (concurrency: ${CONFIG.CONCURRENCY})`
  );

  // Process batches with limited concurrency
  for (let i = 0; i < batches.length; i += CONFIG.CONCURRENCY) {
    const concurrentBatches = batches.slice(i, i + CONFIG.CONCURRENCY);
    await Promise.all(
      concurrentBatches.map(batch => processBatch(db, batch, stats))
    );

    // Save progress after each concurrent group
    saveProgress({
      lastProcessedId: items[Math.min((i + CONFIG.CONCURRENCY) * CONFIG.BATCH_SIZE - 1, items.length - 1)].id,
      lastProcessedType: items[0].type,
      stats,
    });
  }
}

// ============ Main Execution ============

async function generateAllEmbeddingsOptimized() {
  const stats: GenerationStats = {
    totalItems: 0,
    processed: 0,
    skipped: 0,
    errors: 0,
    knowledgeCreated: 0,
    knowledgeUpdated: 0,
    totalTokens: 0,
    estimatedCost: 0,
    startTime: Date.now(),
    batchesProcessed: 0,
  };

  serverLogger.info("=".repeat(60));
  serverLogger.info("OPTIMIZED EMBEDDING GENERATION");
  serverLogger.info("=".repeat(60));
  serverLogger.info(`Configuration:`);
  serverLogger.info(`  - Batch Size: ${CONFIG.BATCH_SIZE}`);
  serverLogger.info(`  - Concurrency: ${CONFIG.CONCURRENCY}`);
  serverLogger.info(`  - Dry Run: ${CONFIG.DRY_RUN}`);
  serverLogger.info(`  - Force Regenerate: ${CONFIG.FORCE_REGENERATE}`);
  serverLogger.info("=".repeat(60));

  const db = await getDb();
  if (!db) {
    serverLogger.error("[Embeddings] Database not available");
    process.exit(1);
  }

  // ========== Collect Items to Process ==========

  serverLogger.info("[Embeddings] Collecting items to process...");

  // Get all regulations
  const allRegulations = await db.select().from(regulations);
  const regulationItems: EmbeddingItem[] = [];

  for (const regulation of allRegulations) {
    // Skip if embedding exists and not force regenerate
    if (
      !CONFIG.FORCE_REGENERATE &&
      regulation.embedding &&
      Array.isArray(regulation.embedding) &&
      regulation.embedding.length > 0
    ) {
      stats.skipped++;
      continue;
    }
    regulationItems.push(prepareRegulationItem(regulation));
  }

  // Get all standards
  const allStandards = await db.select().from(gs1Standards);
  const standardItems: EmbeddingItem[] = [];

  for (const standard of allStandards) {
    // Skip if embedding exists and not force regenerate
    if (
      !CONFIG.FORCE_REGENERATE &&
      standard.embedding &&
      Array.isArray(standard.embedding) &&
      standard.embedding.length > 0
    ) {
      stats.skipped++;
      continue;
    }
    standardItems.push(prepareStandardItem(standard));
  }

  const allItems = [...regulationItems, ...standardItems];
  stats.totalItems = allItems.length + stats.skipped;

  serverLogger.info(
    `[Embeddings] Found ${stats.totalItems} total items (${allItems.length} to process, ${stats.skipped} skipped)`
  );

  // ========== Cost Estimation ==========

  const estimatedTokens = allItems.length * 500; // ~500 tokens per item average
  const estimatedCost = (estimatedTokens / 1_000_000) * 0.02;

  serverLogger.info(`[Embeddings] Estimated cost: $${estimatedCost.toFixed(4)} (${estimatedTokens.toLocaleString()} tokens)`);

  if (allItems.length === 0) {
    serverLogger.info("[Embeddings] No items to process. Exiting.");
    clearProgress();
    process.exit(0);
  }

  // ========== Process Items ==========

  if (regulationItems.length > 0) {
    serverLogger.info(`[Embeddings] Processing ${regulationItems.length} regulations...`);
    await processItemsInParallel(db, regulationItems, stats);
  }

  if (standardItems.length > 0) {
    serverLogger.info(`[Embeddings] Processing ${standardItems.length} standards...`);
    await processItemsInParallel(db, standardItems, stats);
  }

  // ========== Summary ==========

  const duration = Math.round((Date.now() - stats.startTime) / 1000);
  stats.estimatedCost = (stats.totalTokens / 1_000_000) * 0.02;

  serverLogger.info("=".repeat(60));
  serverLogger.info("EMBEDDING GENERATION COMPLETE");
  serverLogger.info("=".repeat(60));
  serverLogger.info(`Duration: ${duration}s`);
  serverLogger.info(`Performance:`);
  serverLogger.info(`  - Items/second: ${(stats.processed / duration).toFixed(2)}`);
  serverLogger.info(`  - Batches processed: ${stats.batchesProcessed}`);
  serverLogger.info(`Results:`);
  serverLogger.info(`  - Total items: ${stats.totalItems}`);
  serverLogger.info(`  - Processed: ${stats.processed}`);
  serverLogger.info(`  - Skipped: ${stats.skipped}`);
  serverLogger.info(`  - Errors: ${stats.errors}`);
  serverLogger.info(`Knowledge Embeddings:`);
  serverLogger.info(`  - Created: ${stats.knowledgeCreated}`);
  serverLogger.info(`  - Updated: ${stats.knowledgeUpdated}`);
  serverLogger.info(`API Usage:`);
  serverLogger.info(`  - Total tokens: ${stats.totalTokens.toLocaleString()}`);
  serverLogger.info(`  - Actual cost: $${stats.estimatedCost.toFixed(4)}`);
  serverLogger.info("=".repeat(60));

  // Clear progress file on successful completion
  clearProgress();

  process.exit(stats.errors > 0 ? 1 : 0);
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllEmbeddingsOptimized();
}

export { generateAllEmbeddingsOptimized };
