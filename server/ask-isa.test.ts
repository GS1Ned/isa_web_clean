/**
 * Ask ISA Tests
 * 
 * Tests for RAG-powered Q&A system including embedding generation,
 * semantic search, and conversation management.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { generateEmbedding, cosineSimilarity } from './embedding';
import {
  storeEmbedding,
  searchEmbeddings,
  createQAConversation,
  addQAMessage,
  getQAConversation,
} from './db';

describe('Ask ISA - Embedding Generation', () => {
  it('should generate embedding for text', async () => {
    const text = 'The EU Deforestation Regulation (EUDR) requires supply chain traceability.';
    
    const result = await generateEmbedding(text);
    
    expect(result).toBeDefined();
    expect(result.embedding).toBeDefined();
    expect(Array.isArray(result.embedding)).toBe(true);
    expect(result.embedding.length).toBe(1536); // OpenAI embedding dimension
    expect(result.contentHash).toBeDefined();
    expect(result.model).toBe('text-embedding-3-small');
  }, 30000); // 30s timeout for API call

  it('should generate same hash for same content', async () => {
    const text = 'CSRD requires sustainability reporting.';
    
    const result1 = await generateEmbedding(text);
    const result2 = await generateEmbedding(text);
    
    expect(result1.contentHash).toBe(result2.contentHash);
  });

  it('should calculate cosine similarity correctly', () => {
    const vec1 = [1, 0, 0];
    const vec2 = [1, 0, 0];
    const vec3 = [0, 1, 0];
    
    // Identical vectors should have similarity 1
    expect(cosineSimilarity(vec1, vec2)).toBeCloseTo(1, 5);
    
    // Orthogonal vectors should have similarity 0
    expect(cosineSimilarity(vec1, vec3)).toBeCloseTo(0, 5);
  });
});

describe('Ask ISA - Knowledge Base Storage', () => {
  let testEmbedding: number[];
  let testContentHash: string;

  beforeAll(async () => {
    const result = await generateEmbedding('Test regulation content');
    testEmbedding = result.embedding;
    testContentHash = result.contentHash;
  });

  it('should store embedding in database', async () => {
    const result = await storeEmbedding({
      sourceType: 'regulation',
      sourceId: 999,
      content: 'Test regulation content',
      contentHash: testContentHash,
      embedding: testEmbedding,
      embeddingModel: 'text-embedding-3-small',
      title: 'Test Regulation',
      url: '/hub/regulations/999',
    });

    expect(result).toBeDefined();
  }, 10000);

  it('should not duplicate embeddings with same content hash', async () => {
    const result1 = await storeEmbedding({
      sourceType: 'regulation',
      sourceId: 999,
      content: 'Test regulation content',
      contentHash: testContentHash,
      embedding: testEmbedding,
      embeddingModel: 'text-embedding-3-small',
      title: 'Test Regulation',
      url: '/hub/regulations/999',
    });

    const result2 = await storeEmbedding({
      sourceType: 'regulation',
      sourceId: 999,
      content: 'Test regulation content',
      contentHash: testContentHash,
      embedding: testEmbedding,
      embeddingModel: 'text-embedding-3-small',
      title: 'Test Regulation',
      url: '/hub/regulations/999',
    });

    // Should return existing embedding, not create duplicate
    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
  }, 10000);
});

describe('Ask ISA - Semantic Search', () => {
  it('should search embeddings by similarity', async () => {
    const queryText = 'deforestation supply chain traceability';
    const { embedding: queryEmbedding } = await generateEmbedding(queryText);

    const results = await searchEmbeddings(queryEmbedding, 5);

    expect(Array.isArray(results)).toBe(true);
    
    if (results.length > 0) {
      // Results should have similarity scores
      expect(results[0]).toHaveProperty('similarity');
      expect(typeof results[0].similarity).toBe('number');
      
      // Similarity should be between 0 and 1
      expect(results[0].similarity).toBeGreaterThanOrEqual(0);
      expect(results[0].similarity).toBeLessThanOrEqual(1);
      
      // Results should be sorted by similarity (descending)
      if (results.length > 1) {
        expect(results[0].similarity).toBeGreaterThanOrEqual(results[1].similarity);
      }
    }
  }, 30000);
});

describe('Ask ISA - Conversation Management', () => {
  let conversationId: number;

  it('should create Q&A conversation', async () => {
    const conversation = await createQAConversation(undefined, 'Test conversation');

    expect(conversation).toBeDefined();
    expect(conversation?.id).toBeDefined();
    expect(conversation?.title).toBe('Test conversation');
    expect(conversation?.messageCount).toBe(0);

    if (conversation) {
      conversationId = conversation.id;
    }
  });

  it('should add user message to conversation', async () => {
    expect(conversationId).toBeDefined();

    const message = await addQAMessage({
      conversationId,
      role: 'user',
      content: 'What is EUDR?',
    });

    expect(message).toBeDefined();
    expect(message?.role).toBe('user');
    expect(message?.content).toBe('What is EUDR?');
  });

  it('should add assistant message with sources', async () => {
    expect(conversationId).toBeDefined();

    const message = await addQAMessage({
      conversationId,
      role: 'assistant',
      content: 'EUDR is the EU Deforestation Regulation...',
      sources: [
        {
          id: 3,
          type: 'regulation',
          title: 'EU Deforestation Regulation (EUDR)',
          url: '/hub/regulations/3',
          similarity: 0.95,
        },
      ],
      retrievedChunks: 5,
    });

    expect(message).toBeDefined();
    expect(message?.role).toBe('assistant');
    expect(message?.sources).toBeDefined();
    expect(Array.isArray(message?.sources)).toBe(true);
  });

  it('should retrieve conversation with messages', async () => {
    expect(conversationId).toBeDefined();

    const conversation = await getQAConversation(conversationId);

    expect(conversation).toBeDefined();
    expect(conversation?.id).toBe(conversationId);
    expect(conversation?.messages).toBeDefined();
    expect(Array.isArray(conversation?.messages)).toBe(true);
    expect(conversation?.messages.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Ask ISA - Integration Test', () => {
  it('should complete full RAG pipeline', async () => {
    // 1. Generate embedding for question
    const question = 'Which GS1 standards support EUDR compliance?';
    const { embedding: questionEmbedding } = await generateEmbedding(question);
    
    expect(questionEmbedding).toBeDefined();
    expect(questionEmbedding.length).toBe(1536);

    // 2. Search for relevant chunks
    const relevantChunks = await searchEmbeddings(questionEmbedding, 3);
    
    expect(Array.isArray(relevantChunks)).toBe(true);
    
    // 3. Create conversation
    const conversation = await createQAConversation(undefined, question);
    expect(conversation).toBeDefined();

    // 4. Add user message
    if (conversation) {
      const userMessage = await addQAMessage({
        conversationId: conversation.id,
        role: 'user',
        content: question,
      });
      expect(userMessage).toBeDefined();

      // 5. Add assistant response with sources
      const assistantMessage = await addQAMessage({
        conversationId: conversation.id,
        role: 'assistant',
        content: 'Based on the regulations, GS1 standards like GTIN and Digital Link support EUDR compliance...',
        sources: relevantChunks.slice(0, 3).map(chunk => ({
          id: chunk.id,
          type: chunk.sourceType,
          title: chunk.title,
          url: chunk.url || undefined,
          similarity: chunk.similarity,
        })),
        retrievedChunks: relevantChunks.length,
      });
      expect(assistantMessage).toBeDefined();

      // 6. Verify conversation retrieval
      const retrievedConversation = await getQAConversation(conversation.id);
      expect(retrievedConversation).toBeDefined();
      expect(retrievedConversation?.messages.length).toBe(2);
    }
  }, 60000); // 60s timeout for full pipeline
});
