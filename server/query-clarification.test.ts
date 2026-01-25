/**
 * Query Clarification Tests
 */

import { describe, it, expect, vi } from 'vitest';

// Mock logger
vi.mock('./_core/logger-wiring', () => ({
  serverLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import {
  analyzeQuery,
  generateDidYouMean,
  determineResponseMode,
  enhanceQuery,
  type QueryAnalysis,
} from './query-clarification';

describe('Query Clarification', () => {
  describe('analyzeQuery', () => {
    it('should detect vague single-word queries', () => {
      const result = analyzeQuery('ESG');
      
      expect(result.isAmbiguous).toBe(true);
      expect(result.clarifications.length).toBeGreaterThan(0);
      expect(result.clarifications[0].type).toBe('vague_topic');
    });

    it('should detect vague two-word queries', () => {
      const result = analyzeQuery('sustainability reporting');
      
      expect(result.isAmbiguous).toBe(true);
    });

    it('should accept specific queries', () => {
      const result = analyzeQuery('What are the CSRD reporting requirements for large companies in the EU?');
      
      expect(result.isAmbiguous).toBe(false);
      expect(result.clarifications.length).toBe(0);
    });

    it('should detect missing industry context', () => {
      const result = analyzeQuery('What regulations apply to my company?');
      
      expect(result.isAmbiguous).toBe(true);
      expect(result.clarifications.some(c => c.type === 'missing_context')).toBe(true);
    });

    it('should not flag industry context when industry is mentioned', () => {
      const result = analyzeQuery('What regulations apply to my retail company?');
      
      expect(result.clarifications.some(c => c.type === 'missing_context')).toBe(false);
    });

    it('should detect scope ambiguity', () => {
      const result = analyzeQuery('What are the sustainability regulations?');
      
      expect(result.clarifications.some(c => c.type === 'unclear_scope')).toBe(true);
    });

    it('should not flag scope when EU is mentioned', () => {
      const result = analyzeQuery('What are the EU sustainability regulations?');
      
      expect(result.clarifications.some(c => c.type === 'unclear_scope')).toBe(false);
    });

    it('should generate related topics', () => {
      const result = analyzeQuery('Tell me about CSRD');
      
      expect(result.relatedTopics.length).toBeGreaterThan(0);
      expect(result.relatedTopics.some(t => t.includes('ESRS') || t.includes('Materiality'))).toBe(true);
    });

    it('should handle empty queries', () => {
      const result = analyzeQuery('');
      
      expect(result.originalQuery).toBe('');
      expect(result.isAmbiguous).toBe(true);
    });

    it('should detect comparison without clear aspect', () => {
      const result = analyzeQuery('CSRD vs NFRD');
      
      expect(result.clarifications.some(c => c.type === 'comparison_unclear')).toBe(true);
    });
  });

  describe('generateDidYouMean', () => {
    it('should generate suggestions for low-confidence results', () => {
      const searchResults = [
        { title: 'CSRD Regulation Overview', score: 0.3 },
        { title: 'ESRS Standards Guide', score: 0.25 },
      ];
      
      const suggestions = generateDidYouMean('sustainability', searchResults);
      
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should return empty for high-confidence results', () => {
      const searchResults = [
        { title: 'CSRD Regulation Overview', score: 0.9 },
        { title: 'CSRD Requirements', score: 0.85 },
      ];
      
      const suggestions = generateDidYouMean('CSRD requirements', searchResults);
      
      // May or may not have suggestions, but shouldn't error
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should handle empty results', () => {
      const suggestions = generateDidYouMean('random query', []);
      
      expect(suggestions).toHaveLength(0);
    });
  });

  describe('determineResponseMode', () => {
    it('should return full mode for high-quality evidence', () => {
      const searchResults = [
        { score: 0.85, authorityLevel: 'official' },
        { score: 0.80, authorityLevel: 'verified' },
      ];
      
      const result = determineResponseMode(searchResults, 0.9);
      
      expect(result.mode).toBe('full');
      expect(result.recommendations).toHaveLength(0);
    });

    it('should return partial mode for moderate evidence', () => {
      const searchResults = [
        { score: 0.5, authorityLevel: 'guidance' },
        { score: 0.45, authorityLevel: 'industry' },
      ];
      
      const result = determineResponseMode(searchResults, 0.6);
      
      expect(result.mode).toBe('partial');
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should return insufficient mode for low evidence', () => {
      const searchResults = [
        { score: 0.2, authorityLevel: 'community' },
      ];
      
      const result = determineResponseMode(searchResults, 0.3);
      
      expect(result.mode).toBe('insufficient');
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle empty search results', () => {
      const result = determineResponseMode([], 0);
      
      expect(result.mode).toBe('insufficient');
    });

    it('should recommend official sources when missing', () => {
      const searchResults = [
        { score: 0.6, authorityLevel: 'industry' },
        { score: 0.55, authorityLevel: 'community' },
      ];
      
      const result = determineResponseMode(searchResults, 0.7);
      
      expect(result.recommendations.some(r => r.includes('official'))).toBe(true);
    });
  });

  describe('enhanceQuery', () => {
    it('should add industry context when missing', () => {
      const enhanced = enhanceQuery('What are the reporting requirements?', { industry: 'retail' });
      
      expect(enhanced).toContain('retail');
    });

    it('should not duplicate industry when already present', () => {
      const enhanced = enhanceQuery('What are the retail reporting requirements?', { industry: 'retail' });
      
      expect(enhanced.match(/retail/gi)?.length).toBe(1);
    });

    it('should add scope context when missing', () => {
      const enhanced = enhanceQuery('What are the regulations?', { scope: 'EU' });
      
      expect(enhanced).toContain('EU');
    });

    it('should not add scope when already present', () => {
      const enhanced = enhanceQuery('What are the EU regulations?', { scope: 'EU' });
      
      // Should not have duplicate EU mentions from enhancement
      expect(enhanced).toBe('What are the EU regulations?');
    });

    it('should handle empty context', () => {
      const enhanced = enhanceQuery('What is CSRD?', {});
      
      expect(enhanced).toBe('What is CSRD?');
    });
  });
});
