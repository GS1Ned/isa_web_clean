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
 */

import { ENV } from "./env";

/**
 * OpenAI embedding model configuration
 */
const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;
const OPENAI_API_URL = "https://api.openai.com/v1/embeddings";

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
  const truncatedText = text.length > 32000 ? text.substring(0, 32000) : text;

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
 * Generate embeddings for multiple texts in batch
 *
 * @param texts - Array of texts to embed
 * @returns Array of embeddings in same order as input
 */
export async function generateEmbeddingsBatch(
  texts: string[]
): Promise<EmbeddingResult[]> {
  // OpenAI supports batch embedding but we'll do sequential for simplicity
  // Can optimize later with Promise.all if needed
  const results: EmbeddingResult[] = [];

  for (const text of texts) {
    const result = await generateEmbedding(text);
    results.push(result);
  }

  return results;
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
    .substring(0, 32000); // Truncate to safe length
}
