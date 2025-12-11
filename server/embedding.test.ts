/**
 * Vitest test for OpenAI embeddings integration
 * Validates that OPENAI_API_KEY is correctly configured and functional
 */

import { describe, it, expect } from "vitest";
import { generateEmbedding, cosineSimilarity } from "./_core/embedding";

describe("OpenAI Embeddings Integration", () => {
  it("should generate embedding for simple text", async () => {
    const text = "Corporate Sustainability Reporting Directive (CSRD)";

    const result = await generateEmbedding(text);

    // Validate embedding structure
    expect(result).toBeDefined();
    expect(result.embedding).toBeInstanceOf(Array);
    expect(result.embedding.length).toBe(1536); // text-embedding-3-small dimensions
    expect(result.model).toContain("text-embedding");
    expect(result.dimensions).toBe(1536);
    expect(result.usage.total_tokens).toBeGreaterThan(0);

    // Validate embedding values are numbers
    expect(result.embedding.every(v => typeof v === "number")).toBe(true);

    // Validate embedding is normalized (values between -1 and 1)
    expect(result.embedding.every(v => v >= -1 && v <= 1)).toBe(true);
  }, 15000); // 15s timeout for API call

  it("should generate similar embeddings for similar texts", async () => {
    const text1 = "Environmental sustainability reporting requirements";
    const text2 = "Sustainability disclosure and environmental reporting";
    const text3 = "Financial accounting standards for revenue recognition";

    const [result1, result2, result3] = await Promise.all([
      generateEmbedding(text1),
      generateEmbedding(text2),
      generateEmbedding(text3),
    ]);

    // Calculate similarities
    const similarity12 = cosineSimilarity(result1.embedding, result2.embedding);
    const similarity13 = cosineSimilarity(result1.embedding, result3.embedding);

    // Similar texts should have higher similarity
    expect(similarity12).toBeGreaterThan(0.7); // text1 and text2 are similar
    expect(similarity13).toBeLessThan(0.6); // text1 and text3 are different
    expect(similarity12).toBeGreaterThan(similarity13);
  }, 30000); // 30s timeout for multiple API calls

  it("should handle empty text gracefully", async () => {
    const text = "";

    const result = await generateEmbedding(text);

    // OpenAI should still return an embedding for empty string
    expect(result.embedding).toBeInstanceOf(Array);
    expect(result.embedding.length).toBe(1536);
  }, 15000);
});

describe("Cosine Similarity", () => {
  it("should return 1.0 for identical vectors", () => {
    const vec = [0.1, 0.2, 0.3, 0.4];
    const similarity = cosineSimilarity(vec, vec);
    expect(similarity).toBeCloseTo(1.0, 5);
  });

  it("should return 0.0 for orthogonal vectors", () => {
    const vec1 = [1, 0, 0];
    const vec2 = [0, 1, 0];
    const similarity = cosineSimilarity(vec1, vec2);
    expect(similarity).toBeCloseTo(0.0, 5);
  });

  it("should throw error for different dimensions", () => {
    const vec1 = [1, 2, 3];
    const vec2 = [1, 2];
    expect(() => cosineSimilarity(vec1, vec2)).toThrow("same dimensions");
  });
});
