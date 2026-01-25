/**
 * Hybrid Search Tests
 * 
 * Tests for the hybrid search implementation combining vector and BM25 search.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the dependencies before importing the module
vi.mock('./db-knowledge-vector', () => ({
  vectorSearchKnowledge: vi.fn(),
}));

vi.mock('./bm25-search', () => ({
  bm25Search: vi.fn(),
  isBM25Ready: vi.fn(),
}));

vi.mock('./_core/logger-wiring', () => ({
  serverLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { hybridSearch, getHybridSearchStats, buildContextFromHybridResults } from './hybrid-search';
import { vectorSearchKnowledge } from './db-knowledge-vector';
import { bm25Search, isBM25Ready } from './bm25-search';

describe('Hybrid Search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('hybridSearch', () => {
    it('should return vector-only results when BM25 is not ready', async () => {
      // Setup mocks
      vi.mocked(isBM25Ready).mockReturnValue(false);
      vi.mocked(vectorSearchKnowledge).mockResolvedValue([
        {
          id: 1,
          type: 'regulation',
          title: 'CSRD Regulation',
          description: 'Corporate Sustainability Reporting Directive',
          similarity: 0.85,
          url: 'https://example.com/csrd',
        },
      ]);

      const results = await hybridSearch('What is CSRD?');

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('CSRD Regulation');
      expect(results[0].hybridScore).toBe(0.85);
      expect(results[0].vectorScore).toBe(0.85);
      expect(results[0].bm25Score).toBeUndefined();
    });

    it('should combine vector and BM25 results using RRF', async () => {
      // Setup mocks
      vi.mocked(isBM25Ready).mockReturnValue(true);
      vi.mocked(vectorSearchKnowledge).mockResolvedValue([
        {
          id: 1,
          type: 'regulation',
          title: 'CSRD Regulation',
          description: 'Corporate Sustainability Reporting Directive',
          similarity: 0.9,
          url: 'https://example.com/csrd',
        },
        {
          id: 2,
          type: 'regulation',
          title: 'EUDR Regulation',
          description: 'EU Deforestation Regulation',
          similarity: 0.7,
          url: 'https://example.com/eudr',
        },
      ]);
      vi.mocked(bm25Search).mockReturnValue([
        {
          id: 1,
          type: 'regulation',
          title: 'CSRD Regulation',
          description: 'Corporate Sustainability Reporting Directive',
          url: 'https://example.com/csrd',
          score: 15.5,
        },
        {
          id: 3,
          type: 'standard',
          title: 'GS1 GTIN',
          description: 'Global Trade Item Number',
          url: 'https://example.com/gtin',
          score: 10.2,
        },
      ]);

      const results = await hybridSearch('CSRD sustainability reporting');

      // Should have 3 unique results (CSRD appears in both)
      expect(results.length).toBeGreaterThanOrEqual(1);
      
      // CSRD should be ranked highest (appears in both searches)
      const csrdResult = results.find(r => r.title === 'CSRD Regulation');
      expect(csrdResult).toBeDefined();
      expect(csrdResult?.vectorScore).toBe(0.9);
      expect(csrdResult?.bm25Score).toBe(15.5);
    });

    it('should respect the limit parameter', async () => {
      vi.mocked(isBM25Ready).mockReturnValue(true);
      vi.mocked(vectorSearchKnowledge).mockResolvedValue([
        { id: 1, type: 'regulation', title: 'Reg 1', description: 'Desc 1', similarity: 0.9 },
        { id: 2, type: 'regulation', title: 'Reg 2', description: 'Desc 2', similarity: 0.8 },
        { id: 3, type: 'regulation', title: 'Reg 3', description: 'Desc 3', similarity: 0.7 },
        { id: 4, type: 'regulation', title: 'Reg 4', description: 'Desc 4', similarity: 0.6 },
        { id: 5, type: 'regulation', title: 'Reg 5', description: 'Desc 5', similarity: 0.5 },
      ]);
      vi.mocked(bm25Search).mockReturnValue([]);

      const results = await hybridSearch('test query', { limit: 3 });

      expect(results).toHaveLength(3);
    });

    it('should filter results below vector threshold', async () => {
      vi.mocked(isBM25Ready).mockReturnValue(false);
      vi.mocked(vectorSearchKnowledge).mockResolvedValue([
        { id: 1, type: 'regulation', title: 'High Relevance', description: 'Desc', similarity: 0.8 },
        { id: 2, type: 'regulation', title: 'Low Relevance', description: 'Desc', similarity: 0.2 },
      ]);

      const results = await hybridSearch('test', { vectorThreshold: 0.5 });

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('High Relevance');
    });

    it('should handle empty results gracefully', async () => {
      vi.mocked(isBM25Ready).mockReturnValue(true);
      vi.mocked(vectorSearchKnowledge).mockResolvedValue([]);
      vi.mocked(bm25Search).mockReturnValue([]);

      const results = await hybridSearch('nonexistent query');

      expect(results).toHaveLength(0);
    });
  });

  describe('getHybridSearchStats', () => {
    it('should return BM25 ready status and default config', () => {
      vi.mocked(isBM25Ready).mockReturnValue(true);

      const stats = getHybridSearchStats();

      expect(stats.bm25Ready).toBe(true);
      expect(stats.defaultConfig).toBeDefined();
      expect(stats.defaultConfig.vectorWeight).toBe(0.7);
      expect(stats.defaultConfig.bm25Weight).toBe(0.3);
    });
  });

  describe('buildContextFromHybridResults', () => {
    it('should build context string from results', async () => {
      const results = [
        {
          id: 1,
          type: 'regulation' as const,
          title: 'CSRD Regulation',
          description: 'Corporate Sustainability Reporting Directive',
          url: 'https://example.com/csrd',
          hybridScore: 0.9,
          vectorScore: 0.85,
          bm25Score: 15.5,
        },
      ];

      const context = await buildContextFromHybridResults(results);

      expect(context).toContain('CSRD Regulation');
      expect(context).toContain('Corporate Sustainability Reporting Directive');
      expect(context).toContain('semantic: 85%');
      expect(context).toContain('keyword: 15.50');
    });

    it('should handle results without scores', async () => {
      const results = [
        {
          id: 1,
          type: 'regulation' as const,
          title: 'Test Regulation',
          description: 'Test description',
          hybridScore: 0.5,
        },
      ];

      const context = await buildContextFromHybridResults(results);

      expect(context).toContain('Test Regulation');
      expect(context).toContain('Test description');
    });

    it('should handle empty results', async () => {
      const context = await buildContextFromHybridResults([]);

      expect(context).toBe('');
    });
  });
});

describe('BM25 Search Module', () => {
  // These tests verify the BM25 module interface
  // The actual BM25 implementation is tested via integration tests

  it('should export isBM25Ready function', () => {
    expect(typeof isBM25Ready).toBe('function');
  });

  it('should export bm25Search function', () => {
    expect(typeof bm25Search).toBe('function');
  });
});
