/**
 * Ask ISA Modular Prompt System Tests
 * 
 * Tests for prompt assembly, validation, and verification
 */

import { describe, it, expect } from 'vitest';
import {
  assembleAskISAPrompt,
  validateAskISAResponse,
  validateCitations,
  verifyAskISAResponse,
  type AskISAContextParams,
} from './index';

describe('Ask ISA Modular Prompt System', () => {
  describe('assembleAskISAPrompt', () => {
    it('should assemble v2_modular prompt with all 5 blocks', () => {
      const contextParams: AskISAContextParams = {
        question: 'What is ESRS E1?',
        relevantChunks: [
          {
            id: 1,
            sourceType: 'regulation',
            title: 'ESRS E1 - Climate Change',
            content: 'ESRS E1 covers climate change disclosures...',
            url: 'https://example.com/esrs-e1',
            similarity: 95,
          },
        ],
      };

      const prompt = assembleAskISAPrompt(contextParams, 'v2_modular');

      // Verify all 5 blocks are present
      expect(prompt).toContain('ESG compliance analyst'); // Block 1: System
      expect(prompt).toContain('What is ESRS E1?'); // Block 2: Context
      expect(prompt).toContain('ANALYZE'); // Block 3: Step Policy
      expect(prompt).toContain('Output Format'); // Block 4: Output Contracts
      expect(prompt).toContain('Before Finalizing'); // Block 5: Verification
    });

    it('should include all relevant chunks in context', () => {
      const contextParams: AskISAContextParams = {
        question: 'Test question',
        relevantChunks: [
          {
            id: 1,
            sourceType: 'regulation',
            title: 'Source 1',
            content: 'Content 1',
            similarity: 90,
          },
          {
            id: 2,
            sourceType: 'standard',
            title: 'Source 2',
            content: 'Content 2',
            similarity: 85,
          },
        ],
      };

      const prompt = assembleAskISAPrompt(contextParams);

      expect(prompt).toContain('[Source 1]');
      expect(prompt).toContain('[Source 2]');
      expect(prompt).toContain('Content 1');
      expect(prompt).toContain('Content 2');
    });
  });

  describe('validateCitations', () => {
    it('should pass when citations are valid', () => {
      const answer = 'ESRS E1 covers climate change [Source 1]. It requires disclosure of GHG emissions [Source 2].';
      const sourceCount = 2;

      const result = validateCitations(answer, sourceCount);

      expect(Boolean(result.valid)).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should fail when answer has no citations', () => {
      const answer = 'ESRS E1 covers climate change. It requires disclosure of GHG emissions.';
      const sourceCount = 2;

      const result = validateCitations(answer, sourceCount);

      expect(Boolean(result.valid)).toBe(false);
      expect(result.issues).toContain('Answer contains no citations - all factual claims must be cited');
    });

    it('should fail when citation number exceeds source count', () => {
      const answer = 'ESRS E1 covers climate change [Source 5].';
      const sourceCount = 2;

      const result = validateCitations(answer, sourceCount);

      expect(Boolean(result.valid)).toBe(false);
      expect(result.issues.some(i => i.includes('Invalid citation [Source 5]'))).toBe(true);
    });
  });

  describe('verifyAskISAResponse', () => {
    it('should pass verification for valid response', () => {
      const answer = 'ESRS E1 covers climate change disclosures [Source 1]. Companies must report GHG emissions across all scopes [Source 2].';
      const sources = [
        { id: 1, type: 'regulation', title: 'ESRS E1', description: 'Climate change', similarity: 0.95 },
        { id: 2, type: 'regulation', title: 'ESRS E1 Detail', description: 'GHG emissions', similarity: 0.90 },
      ];
      const confidence = 0.85;

      const result = verifyAskISAResponse(answer, sources, confidence);

      expect(Boolean(result.passed)).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should fail verification for too-short answer', () => {
      const answer = 'Yes.';
      const sources = [{ id: 1, type: 'regulation', title: 'Test', description: 'Test', similarity: 0.9 }];
      const confidence = 0.8;

      const result = verifyAskISAResponse(answer, sources, confidence);

      expect(Boolean(result.passed)).toBe(false);
      expect(result.issues).toContain('Answer is too short (< 50 characters)');
    });

    it('should warn when low confidence but no disclaimer', () => {
      const answer = 'ESRS E1 covers climate change [Source 1]. This is a detailed answer with sufficient length.';
      const sources = [{ id: 1, type: 'regulation', title: 'Test', description: 'Test', similarity: 0.9 }];
      const confidence = 0.6; // Low confidence

      const result = verifyAskISAResponse(answer, sources, confidence);

      expect(result.warnings).toContain('Confidence < 70% but no disclaimer found');
    });
  });

  describe('validateAskISAResponse', () => {
    it('should validate correct response structure', () => {
      const response = {
        answer: 'ESRS E1 covers climate change [Source 1].',
        sources: [
          {
            id: 1,
            title: 'ESRS E1',
            url: 'https://example.com',
            sourceType: 'regulation',
            relevance: 95,
          },
        ],
        confidence: 0.85,
      };

      const result = validateAskISAResponse(response);

      expect(Boolean(result.valid)).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toBeDefined();
    });

    it('should reject response with missing fields', () => {
      const response = {
        answer: 'Test answer',
        // Missing sources and confidence
      };

      const result = validateAskISAResponse(response);

      expect(Boolean(result.valid)).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject response with invalid confidence range', () => {
      const response = {
        answer: 'Test answer',
        sources: [],
        confidence: 1.5, // Invalid: > 1
      };

      const result = validateAskISAResponse(response);

      expect(Boolean(result.valid)).toBe(false);
    });
  });
});
