/**
 * Authority Model Tests
 * 
 * Tests for source authority classification and scoring.
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
  classifyAuthority,
  getAuthorityBadge,
  calculateAuthorityScore,
  formatAuthorityForContext,
  AUTHORITY_LEVELS,
  type AuthorityLevel,
} from './authority-model';

describe('Authority Model', () => {
  describe('classifyAuthority', () => {
    it('should classify EU regulations as official', () => {
      const result = classifyAuthority({
        type: 'regulation',
        title: 'CSRD - Corporate Sustainability Reporting Directive',
        regulationType: 'CSRD',
      });

      expect(result.level).toBe('official');
      expect(result.score).toBe(1.0);
    });

    it('should classify EUDR as official', () => {
      const result = classifyAuthority({
        type: 'regulation',
        title: 'EU Deforestation Regulation',
        regulationType: 'EUDR',
      });

      expect(result.level).toBe('official');
    });

    it('should classify GS1 standards as verified', () => {
      const result = classifyAuthority({
        type: 'standard',
        title: 'GS1 GTIN Standard',
        category: 'GS1 Identification',
      });

      expect(result.level).toBe('verified');
      expect(result.score).toBe(0.9);
    });

    it('should classify EUR-Lex URLs as official', () => {
      const result = classifyAuthority({
        type: 'regulation',
        title: 'Some Regulation',
        url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022L2464',
      });

      expect(result.level).toBe('official');
    });

    it('should classify GS1 standards with GS1 in title as verified', () => {
      const result = classifyAuthority({
        type: 'standard',
        title: 'GS1 GTIN Standard',
        url: 'https://www.gs1.org/standards/gtin',
      });

      expect(result.level).toBe('verified');
    });

    it('should classify implementation guides as guidance', () => {
      const result = classifyAuthority({
        type: 'standard',
        title: 'CSRD Implementation Guide for SMEs',
      });

      expect(result.level).toBe('guidance');
    });

    it('should default to industry for unclassified sources', () => {
      const result = classifyAuthority({
        type: 'regulation',
        title: 'Some Random Document',
      });

      expect(result.level).toBe('industry');
      expect(result.score).toBe(0.5);
    });

    it('should classify ESRS standards as official', () => {
      const result = classifyAuthority({
        type: 'regulation',
        title: 'ESRS 1 General Requirements',
        regulationType: 'ESRS',
      });

      expect(result.level).toBe('official');
    });
  });

  describe('getAuthorityBadge', () => {
    it('should return badge config for official level', () => {
      const badge = getAuthorityBadge('official');

      expect(badge.label).toBe('Official');
      expect(badge.color).toContain('blue');
      expect(badge.tooltip).toContain('EU legislation');
    });

    it('should return badge config for verified level', () => {
      const badge = getAuthorityBadge('verified');

      expect(badge.label).toBe('Verified');
      expect(badge.color).toContain('green');
    });

    it('should return badge config for all levels', () => {
      const levels: AuthorityLevel[] = ['official', 'verified', 'guidance', 'industry', 'community'];
      
      for (const level of levels) {
        const badge = getAuthorityBadge(level);
        expect(badge.label).toBeTruthy();
        expect(badge.color).toBeTruthy();
        expect(badge.bgColor).toBeTruthy();
      }
    });
  });

  describe('calculateAuthorityScore', () => {
    it('should return high score for official sources', () => {
      const result = calculateAuthorityScore([
        { authorityLevel: 'official', similarity: 0.9 },
        { authorityLevel: 'official', similarity: 0.8 },
      ]);

      expect(result.score).toBe(1.0);
      expect(result.level).toBe('official');
      expect(result.breakdown.official).toBe(2);
    });

    it('should return mixed score for mixed sources', () => {
      const result = calculateAuthorityScore([
        { authorityLevel: 'official', similarity: 0.9 },
        { authorityLevel: 'industry', similarity: 0.7 },
      ]);

      expect(result.score).toBeGreaterThan(0.5);
      expect(result.score).toBeLessThan(1.0);
      expect(result.breakdown.official).toBe(1);
      expect(result.breakdown.industry).toBe(1);
    });

    it('should handle empty sources', () => {
      const result = calculateAuthorityScore([]);

      expect(result.score).toBe(0);
      expect(result.level).toBe('community');
    });

    it('should weight by similarity when provided', () => {
      // High similarity official source should dominate
      const result = calculateAuthorityScore([
        { authorityLevel: 'official', similarity: 0.95 },
        { authorityLevel: 'community', similarity: 0.1 },
      ]);

      expect(result.score).toBeGreaterThan(0.8);
    });
  });

  describe('formatAuthorityForContext', () => {
    it('should format sources with authority labels', () => {
      const result = formatAuthorityForContext([
        { title: 'CSRD Regulation', authorityLevel: 'official', similarity: 0.9 },
        { title: 'GS1 GTIN', authorityLevel: 'verified', similarity: 0.8 },
      ]);

      expect(result).toContain('CSRD Regulation');
      expect(result).toContain('Official');
      expect(result).toContain('GS1 GTIN');
      expect(result).toContain('Verified');
      expect(result).toContain('90%');
    });

    it('should handle sources without similarity', () => {
      const result = formatAuthorityForContext([
        { title: 'Test Source', authorityLevel: 'industry' },
      ]);

      expect(result).toContain('Test Source');
      expect(result).toContain('Industry');
      expect(result).not.toContain('%');
    });
  });

  describe('AUTHORITY_LEVELS', () => {
    it('should have all required levels defined', () => {
      const levels: AuthorityLevel[] = ['official', 'verified', 'guidance', 'industry', 'community'];
      
      for (const level of levels) {
        expect(AUTHORITY_LEVELS[level]).toBeDefined();
        expect(AUTHORITY_LEVELS[level].score).toBeGreaterThanOrEqual(0);
        expect(AUTHORITY_LEVELS[level].score).toBeLessThanOrEqual(1);
        expect(AUTHORITY_LEVELS[level].label).toBeTruthy();
        expect(AUTHORITY_LEVELS[level].description).toBeTruthy();
      }
    });

    it('should have scores in descending order', () => {
      expect(AUTHORITY_LEVELS.official.score).toBeGreaterThan(AUTHORITY_LEVELS.verified.score);
      expect(AUTHORITY_LEVELS.verified.score).toBeGreaterThan(AUTHORITY_LEVELS.guidance.score);
      expect(AUTHORITY_LEVELS.guidance.score).toBeGreaterThan(AUTHORITY_LEVELS.industry.score);
      expect(AUTHORITY_LEVELS.industry.score).toBeGreaterThan(AUTHORITY_LEVELS.community.score);
    });
  });
});
