/**
 * OpenAI Embeddings Integration
 *
 * Provides vector embedding generation for semantic search and similarity matching.
 * Uses OpenAI's text-embedding-3-small model (1536 dimensions, $0.02/1M tokens).
 *
 * Use cases:
 * - Ask ISA: Find relevant regulations/standards by semantic similarity
 * - Auto-tagging: Match regulations to GS1 standards
 * - Duplicate detection: Find similar content across documents
 *
 * Performance optimizations:
 * - Batch API calls: Up to 100 texts per request (vs 1 in sequential mode)
 * - Automatic chunking: Large batches split into optimal sub-batches
 * - Token budget management: Respects OpenAI's 8191 token limit per text
 */

import { ENV } from "./env";

/**
 * OpenAI embedding model configuration
 */
const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;
const OPENAI_API_URL = "https://api.openai.com/v1/embeddings";

/**
 * Batch processing configuration
 * OpenAI supports up to 2048 inputs per batch, but we use 100 for optimal performance
 * and to stay well within rate limits
 */
const BATCH_SIZE = 100;
const MAX_TEXT_LENGTH = 32000; // ~8000 tokens

/**
 * Embedding generation result
 */
export interface EmbeddingResult {
  embedding: number[];
  model: string;
  dimensions: number;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

/**
 * Batch embedding result with aggregated usage
 */
export interface BatchEmbeddingResult {
  embeddings: EmbeddingResult[];
  totalUsage: {
    prompt_tokens: number;
    total_tokens: number;
  };
  batchCount: number;
}

/**
 * OpenAI API response format
 */
interface OpenAIEmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

/**
 * Generate vector embedding for text using OpenAI API
 *
 * @param text - Input text to embed (max ~8000 tokens)
 * @returns Vector embedding (1536 dimensions)
 * @throws Error if API key not configured or API call fails
 */
export async function generateEmbedding(
  text: string
): Promise<EmbeddingResult> {
  // Validate API key
  if (!ENV.openaiApiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Please add it via Settings → Secrets."
    );
  }

  // Truncate text if too long (OpenAI limit: 8191 tokens ≈ 32,000 chars)
  const truncatedText = text.length > MAX_TEXT_LENGTH ? text.substring(0, MAX_TEXT_LENGTH) : text;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: truncatedText,
        encoding_format: "float",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenAI embeddings API failed: ${response.status} ${response.statusText} – ${errorText}`
      );
    }

    const data = (await response.json()) as OpenAIEmbeddingResponse;

    if (!data.data || data.data.length === 0) {
      throw new Error("OpenAI API returned no embeddings");
    }

    return {
      embedding: data.data[0].embedding,
      model: data.model,
      dimensions: EMBEDDING_DIMENSIONS,
      usage: data.usage,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts in a single API call
 * OpenAI's batch embedding API accepts multiple inputs and returns embeddings in order
 *
 * @param texts - Array of texts to embed (max 2048, recommended ≤100)
 * @returns Array of embeddings in same order as input
 * @throws Error if API call fails
 */
async function generateEmbeddingsBatchInternal(
  texts: string[]
): Promise<{ embeddings: number[][]; usage: { prompt_tokens: number; total_tokens: number } }> {
  if (!ENV.openaiApiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Please add it via Settings → Secrets."
    );
  }

  if (texts.length === 0) {
    return { embeddings: [], usage: { prompt_tokens: 0, total_tokens: 0 } };
  }

  // Truncate each text to max length
  const truncatedTexts = texts.map(text =>
    text.length > MAX_TEXT_LENGTH ? text.substring(0, MAX_TEXT_LENGTH) : text
  );

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ENV.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: truncatedTexts,
      encoding_format: "float",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI embeddings API failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  const data = (await response.json()) as OpenAIEmbeddingResponse;

  if (!data.data || data.data.length !== texts.length) {
    throw new Error(
      `OpenAI API returned ${data.data?.length ?? 0} embeddings, expected ${texts.length}`
    );
  }

  // Sort by index to ensure correct order (OpenAI may return out of order)
  const sortedData = [...data.data].sort((a, b) => a.index - b.index);

  return {
    embeddings: sortedData.map(d => d.embedding),
    usage: data.usage,
  };
}

/**
 * Generate embeddings for multiple texts in batch
 * Automatically chunks large arrays into optimal sub-batches
 *
 * Performance comparison (for 100 texts):
 * - Sequential: 100 API calls, ~30-60 seconds
 * - Batched: 1 API call, ~1-2 seconds
 *
 * @param texts - Array of texts to embed
 * @param options - Optional configuration
 * @returns Array of embeddings in same order as input
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  options: {
    batchSize?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<EmbeddingResult[]> {
  const { batchSize = BATCH_SIZE, onProgress } = options;

  if (texts.length === 0) {
    return [];
  }

  // For single text, use simple API
  if (texts.length === 1) {
    return [await generateEmbedding(texts[0])];
  }

  const results: EmbeddingResult[] = [];
  let totalPromptTokens = 0;
  let totalTokens = 0;
  let model = EMBEDDING_MODEL;

  // Process in batches
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    const { embeddings, usage } = await generateEmbeddingsBatchInternal(batch);

    // Convert to EmbeddingResult format
    for (const embedding of embeddings) {
      results.push({
        embedding,
        model,
        dimensions: EMBEDDING_DIMENSIONS,
        usage: {
          prompt_tokens: Math.round(usage.prompt_tokens / batch.length),
          total_tokens: Math.round(usage.total_tokens / batch.length),
        },
      });
    }

    totalPromptTokens += usage.prompt_tokens;
    totalTokens += usage.total_tokens;

    // Report progress
    if (onProgress) {
      onProgress(Math.min(i + batchSize, texts.length), texts.length);
    }
  }

  return results;
}

/**
 * Generate embeddings for multiple texts with detailed batch statistics
 *
 * @param texts - Array of texts to embed
 * @param options - Optional configuration
 * @returns Batch result with embeddings and aggregated usage statistics
 */
export async function generateEmbeddingsBatchWithStats(
  texts: string[],
  options: {
    batchSize?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<BatchEmbeddingResult> {
  const { batchSize = BATCH_SIZE, onProgress } = options;

  if (texts.length === 0) {
    return {
      embeddings: [],
      totalUsage: { prompt_tokens: 0, total_tokens: 0 },
      batchCount: 0,
    };
  }

  const embeddings: EmbeddingResult[] = [];
  let totalPromptTokens = 0;
  let totalTokens = 0;
  let batchCount = 0;

  // Process in batches
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    batchCount++;

    const { embeddings: batchEmbeddings, usage } = await generateEmbeddingsBatchInternal(batch);

    // Convert to EmbeddingResult format
    for (const embedding of batchEmbeddings) {
      embeddings.push({
        embedding,
        model: EMBEDDING_MODEL,
        dimensions: EMBEDDING_DIMENSIONS,
        usage: {
          prompt_tokens: Math.round(usage.prompt_tokens / batch.length),
          total_tokens: Math.round(usage.total_tokens / batch.length),
        },
      });
    }

    totalPromptTokens += usage.prompt_tokens;
    totalTokens += usage.total_tokens;

    // Report progress
    if (onProgress) {
      onProgress(Math.min(i + batchSize, texts.length), texts.length);
    }
  }

  return {
    embeddings,
    totalUsage: {
      prompt_tokens: totalPromptTokens,
      total_tokens: totalTokens,
    },
    batchCount,
  };
}

/**
 * Calculate cosine similarity between two embeddings
 *
 * @param a - First embedding vector
 * @param b - Second embedding vector
 * @returns Similarity score between 0 and 1 (1 = identical)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Embeddings must have same dimensions");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);

  if (magnitude === 0) {
    return 0;
  }

  return dotProduct / magnitude;
}

/**
 * Find top K most similar items by cosine similarity
 *
 * @param queryEmbedding - Query vector
 * @param candidateEmbeddings - Array of candidate vectors with metadata
 * @param topK - Number of top results to return
 * @returns Sorted array of matches with similarity scores
 */
export function findTopSimilar<T>(
  queryEmbedding: number[],
  candidateEmbeddings: Array<{ embedding: number[]; data: T }>,
  topK: number = 10
): Array<{ data: T; similarity: number }> {
  // Calculate similarities
  const similarities = candidateEmbeddings.map(candidate => ({
    data: candidate.data,
    similarity: cosineSimilarity(queryEmbedding, candidate.embedding),
  }));

  // Sort by similarity (descending) and take top K
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * Prepare text for embedding by cleaning and normalizing
 *
 * @param text - Raw text input
 * @returns Cleaned text ready for embedding
 */
export function prepareTextForEmbedding(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/\n+/g, " ") // Remove newlines
    .substring(0, MAX_TEXT_LENGTH); // Truncate to safe length
}
