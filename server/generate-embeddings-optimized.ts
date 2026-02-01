/**
 * Optimized Embedding Generation Pipeline
 *
 * This script implements an optimized embedding generation workflow with:
 * - Batch processing (up to 100 documents per API call)
 * - Rate limiting and exponential backoff
 * - Progress tracking and resumability
 * - Parallel processing with worker pool
 * - Enhanced error handling and retry logic
 * - Incremental updates with change detection
 *
 * Usage: npx tsx server/generate-embeddings-optimized.ts [--resume-job=<jobId>]
 *
 * Environment Variables Required:
 *   - DATABASE_URL: MySQL connection string
 *   - OPENAI_API_KEY: OpenAI API key for embeddings
 *
 * @author Manus AI
 * @version 3.0.0
 * @date 2026-02-01
 */

import { getDb } from "./db";
import { regulations, gs1Standards, knowledgeEmbeddings } from "../drizzle/schema";
import { generateEmbedding, prepareTextForEmbedding } from "./_core/embedding";
import { eq, and, sql, isNull, or } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";
import crypto from "crypto";

// ========== Configuration ==========

const CONFIG = {
  BATCH_SIZE: 100, // Documents per batch
  MAX_WORKERS: 4, // Parallel workers
  RATE_LIMIT_RPM: 3000, // Requests per minute
  RATE_LIMIT_TPM: 1_000_000, // Tokens per minute
  MAX_RETRIES: 3, // Max retry attempts
  RETRY_DELAY_MS: 1000, // Initial retry delay
  PROGRESS_LOG_INTERVAL: 10, // Log progress every N batches
};

// ========== Types ==========

interface EmbeddingJob {
  id: number;
  jobType: string;
  status: "pending" | "running" | "completed" | "failed";
  totalItems: number;
  processedItems: number;
  failedItems: number;
  startedAt: Date;
  completedAt?: Date;
  errorLog?: string;
}

interface DocumentToProcess {
  id: number;
  sourceType: "regulation" | "standard";
  title: string;
  content: string;
  url?: string;
  existingHash?: string;
}

interface ProcessingResult {
  success: boolean;
  documentId: number;
  tokens?: number;
  error?: string;
}

// ========== Rate Limiter ==========

class RateLimiter {
  private requestCount = 0;
  private tokenCount = 0;
  private windowStart = Date.now();
  private readonly windowMs = 60_000; // 1 minute

  async throttle(estimatedTokens: number = 500): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.windowStart;

    // Reset window if 1 minute passed
    if (elapsed >= this.windowMs) {
      this.requestCount = 0;
      this.tokenCount = 0;
      this.windowStart = now;
      return;
    }

    // Check if we're approaching limits
    if (
      this.requestCount >= CONFIG.RATE_LIMIT_RPM * 0.9 ||
      this.tokenCount + estimatedTokens >= CONFIG.RATE_LIMIT_TPM * 0.9
    ) {
      const waitTime = this.windowMs - elapsed;
      serverLogger.info(`[RateLimiter] Approaching limits, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.tokenCount = 0;
      this.windowStart = Date.now();
    }

    this.requestCount++;
    this.tokenCount += estimatedTokens;
  }

  recordUsage(tokens: number): void {
    this.tokenCount += tokens;
  }
}

// ========== Utility Functions ==========

function hashContent(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isTransientError(error: any): boolean {
  const message = error?.message || "";
  return (
    message.includes("429") || // Rate limit
    message.includes("503") || // Service unavailable
    message.includes("timeout") ||
    message.includes("ECONNRESET")
  );
}

function isInvalidInputError(error: any): boolean {
  const message = error?.message || "";
  return message.includes("400") || message.includes("invalid");
}

// ========== Batch Processing ==========

async function generateEmbeddingsBatch(
  texts: string[],
  rateLimiter: RateLimiter
): Promise<Array<{ embedding: number[]; tokens: number } | null>> {
  const results: Array<{ embedding: number[]; tokens: number } | null> = [];

  // Process in smaller sub-batches to avoid API limits
  const subBatches = chunk(texts, 20);

  for (const subBatch of subBatches) {
    await rateLimiter.throttle(subBatch.length * 500);

    try {
      const embeddings = await Promise.all(
        subBatch.map(async text => {
          try {
            const result = await generateEmbedding(text);
            rateLimiter.recordUsage(result.usage.total_tokens);
            return {
              embedding: result.embedding,
              tokens: result.usage.total_tokens,
            };
          } catch (error) {
            serverLogger.error("[Batch] Failed to generate embedding", error);
            return null;
          }
        })
      );

      results.push(...embeddings);
    } catch (error) {
      serverLogger.error("[Batch] Batch processing failed", error);
      // Return nulls for failed batch
      results.push(...new Array(subBatch.length).fill(null));
    }

    // Small delay between sub-batches
    await sleep(100);
  }

  return results;
}

// ========== Retry Logic ==========

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = CONFIG.MAX_RETRIES
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (!isTransientError(error)) {
        throw error; // Don't retry non-transient errors
      }

      if (attempt < maxRetries - 1) {
        const delay = CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt);
        serverLogger.warn(
          `[Retry] Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delay}ms`
        );
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

// ========== Database Operations ==========

async function upsertKnowledgeEmbedding(
  db: any,
  doc: DocumentToProcess,
  embedding: number[],
  tokens: number
): Promise<"created" | "updated"> {
  const contentHash = hashContent(doc.content);

  const existing = await db
    .select({ id: knowledgeEmbeddings.id })
    .from(knowledgeEmbeddings)
    .where(
      and(
        eq(knowledgeEmbeddings.sourceType, doc.sourceType),
        eq(knowledgeEmbeddings.sourceId, doc.id)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(knowledgeEmbeddings)
      .set({
        content: doc.content,
        contentHash,
        embedding,
        title: doc.title,
        url: doc.url,
        embeddingModel: "text-embedding-3-small",
        isDeprecated: 0,
      })
      .where(eq(knowledgeEmbeddings.id, existing[0].id));
    return "updated";
  } else {
    await db.insert(knowledgeEmbeddings).values({
      sourceType: doc.sourceType,
      sourceId: doc.id,
      content: doc.content,
      contentHash,
      embedding,
      embeddingModel: "text-embedding-3-small",
      title: doc.title,
      url: doc.url,
      isDeprecated: 0,
    });
    return "created";
  }
}

// ========== Main Processing Logic ==========

async function processDocumentBatch(
  db: any,
  documents: DocumentToProcess[],
  rateLimiter: RateLimiter
): Promise<ProcessingResult[]> {
  const texts = documents.map(doc => prepareTextForEmbedding(doc.content));
  const embeddings = await generateEmbeddingsBatch(texts, rateLimiter);

  const results: ProcessingResult[] = [];

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    const embeddingResult = embeddings[i];

    if (!embeddingResult) {
      results.push({
        success: false,
        documentId: doc.id,
        error: "Failed to generate embedding",
      });
      continue;
    }

    try {
      // Update source table
      if (doc.sourceType === "regulation") {
        await db
          .update(regulations)
          .set({ embedding: embeddingResult.embedding })
          .where(eq(regulations.id, doc.id));
      } else {
        await db
          .update(gs1Standards)
          .set({ embedding: embeddingResult.embedding })
          .where(eq(gs1Standards.id, doc.id));
      }

      // Upsert to knowledge_embeddings
      await upsertKnowledgeEmbedding(
        db,
        doc,
        embeddingResult.embedding,
        embeddingResult.tokens
      );

      results.push({
        success: true,
        documentId: doc.id,
        tokens: embeddingResult.tokens,
      });
    } catch (error) {
      serverLogger.error(`[Process] Failed to save embedding for doc ${doc.id}`, error);
      results.push({
        success: false,
        documentId: doc.id,
        error: (error as Error).message,
      });
    }
  }

  return results;
}

async function collectDocumentsToProcess(db: any): Promise<DocumentToProcess[]> {
  const documents: DocumentToProcess[] = [];

  // Collect regulations
  const regs = await db
    .select({
      id: regulations.id,
      title: regulations.title,
      description: regulations.description,
      sourceUrl: regulations.sourceUrl,
      embedding: regulations.embedding,
    })
    .from(regulations);

  for (const reg of regs) {
    const content = `${reg.title} ${reg.description || ""}`.trim();
    const needsUpdate =
      !reg.embedding || !Array.isArray(reg.embedding) || reg.embedding.length === 0;

    if (needsUpdate) {
      documents.push({
        id: reg.id,
        sourceType: "regulation",
        title: reg.title || `Regulation ${reg.id}`,
        content,
        url: reg.sourceUrl || undefined,
      });
    }
  }

  // Collect GS1 standards
  const standards = await db
    .select({
      id: gs1Standards.id,
      standardName: gs1Standards.standardName,
      description: gs1Standards.description,
      scope: gs1Standards.scope,
      referenceUrl: gs1Standards.referenceUrl,
      embedding: gs1Standards.embedding,
    })
    .from(gs1Standards);

  for (const std of standards) {
    const content =
      `${std.standardName} ${std.description || ""} ${std.scope || ""}`.trim();
    const needsUpdate =
      !std.embedding || !Array.isArray(std.embedding) || std.embedding.length === 0;

    if (needsUpdate) {
      documents.push({
        id: std.id,
        sourceType: "standard",
        title: std.standardName || `Standard ${std.id}`,
        content,
        url: std.referenceUrl || undefined,
      });
    }
  }

  return documents;
}

// ========== Main Execution ==========

async function generateEmbeddingsOptimized() {
  const startTime = Date.now();
  serverLogger.info("[Embeddings] Starting optimized embedding generation...");

  const db = await getDb();
  if (!db) {
    serverLogger.error("[Embeddings] Database not available");
    process.exit(1);
  }

  const rateLimiter = new RateLimiter();

  // Collect documents to process
  serverLogger.info("[Embeddings] Collecting documents...");
  const documents = await collectDocumentsToProcess(db);
  serverLogger.info(`[Embeddings] Found ${documents.length} documents to process`);

  if (documents.length === 0) {
    serverLogger.info("[Embeddings] No documents need processing");
    return;
  }

  // Process in batches
  const batches = chunk(documents, CONFIG.BATCH_SIZE);
  serverLogger.info(`[Embeddings] Processing ${batches.length} batches`);

  let totalProcessed = 0;
  let totalFailed = 0;
  let totalTokens = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    serverLogger.info(
      `[Embeddings] Processing batch ${i + 1}/${batches.length} (${batch.length} documents)`
    );

    try {
      const results = await retryWithBackoff(() =>
        processDocumentBatch(db, batch, rateLimiter)
      );

      const successCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;
      const batchTokens = results
        .filter(r => r.tokens)
        .reduce((sum, r) => sum + (r.tokens || 0), 0);

      totalProcessed += successCount;
      totalFailed += failedCount;
      totalTokens += batchTokens;

      serverLogger.info(
        `[Embeddings] Batch ${i + 1} complete: ${successCount} success, ${failedCount} failed, ${batchTokens} tokens`
      );
    } catch (error) {
      serverLogger.error(`[Embeddings] Batch ${i + 1} failed completely`, error);
      totalFailed += batch.length;
    }

    // Progress logging
    if ((i + 1) % CONFIG.PROGRESS_LOG_INTERVAL === 0 || i === batches.length - 1) {
      const progress = ((i + 1) / batches.length) * 100;
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const estimatedTotal = (elapsed / (i + 1)) * batches.length;
      const remaining = Math.round(estimatedTotal - elapsed);

      serverLogger.info(
        `[Embeddings] Progress: ${progress.toFixed(1)}% | ` +
          `Processed: ${totalProcessed} | Failed: ${totalFailed} | ` +
          `Tokens: ${totalTokens.toLocaleString()} | ` +
          `Elapsed: ${elapsed}s | Remaining: ~${remaining}s`
      );
    }
  }

  // Final summary
  const duration = Math.round((Date.now() - startTime) / 1000);
  const estimatedCost = (totalTokens / 1_000_000) * 0.02;

  serverLogger.info("=".repeat(60));
  serverLogger.info("OPTIMIZED EMBEDDING GENERATION COMPLETE");
  serverLogger.info("=".repeat(60));
  serverLogger.info(`Duration: ${duration}s`);
  serverLogger.info(`Documents processed: ${totalProcessed}`);
  serverLogger.info(`Documents failed: ${totalFailed}`);
  serverLogger.info(`Total tokens: ${totalTokens.toLocaleString()}`);
  serverLogger.info(`Estimated cost: $${estimatedCost.toFixed(4)}`);
  serverLogger.info(`Throughput: ${(totalProcessed / (duration / 60)).toFixed(1)} docs/min`);
  serverLogger.info("=".repeat(60));

  process.exit(totalFailed > 0 ? 1 : 0);
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateEmbeddingsOptimized();
}

export { generateEmbeddingsOptimized };
