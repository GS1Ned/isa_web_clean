/**
 * Claim-Citation Verification Tests
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
  extractClaims,
  extractCitations,
  verifyClaims,
  generateVerificationSummary,
  verifyResponseClaims,
} from './claim-citation-verifier';

describe('Claim-Citation Verifier', () => {
  describe('extractClaims', () => {
    it('should extract factual claims about regulations', () => {
      const text = 'The CSRD requires companies to report on sustainability matters. This regulation mandates double materiality assessment.';
      
      const claims = extractClaims(text);
      
      expect(claims.length).toBeGreaterThan(0);
      expect(claims.some(c => c.text.toLowerCase().includes('csrd'))).toBe(true);
    });

    it('should extract numerical claims', () => {
      const text = 'Companies must achieve a 55% reduction by 2030. The deadline is January 2025.';
      
      const claims = extractClaims(text);
      
      expect(claims.some(c => c.type === 'numerical' || c.text.includes('55%') || c.text.includes('2030'))).toBe(true);
    });

    it('should extract procedural claims', () => {
      const text = 'Companies must submit their sustainability reports annually. Organizations are required to conduct due diligence.';
      
      const claims = extractClaims(text);
      
      expect(claims.some(c => c.type === 'procedural' || c.text.includes('must'))).toBe(true);
    });

    it('should handle empty text', () => {
      const claims = extractClaims('');
      
      expect(claims).toHaveLength(0);
    });

    it('should skip very short sentences', () => {
      const text = 'Yes. No. OK. This is fine.';
      
      const claims = extractClaims(text);
      
      expect(claims).toHaveLength(0);
    });
  });

  describe('extractCitations', () => {
    const sources = [
      { id: 1, title: 'CSRD Regulation', url: 'https://example.com/csrd', authorityLevel: 'official' as const },
      { id: 2, title: 'GS1 GTIN Standard', url: 'https://example.com/gtin', authorityLevel: 'verified' as const },
    ];

    it('should extract bracket citations [1], [2]', () => {
      const text = 'The CSRD [1] requires sustainability reporting. GS1 standards [2] help with traceability.';
      
      const citations = extractCitations(text, sources);
      
      expect(citations.length).toBeGreaterThanOrEqual(2);
      expect(citations.some(c => c.sourceId === 1)).toBe(true);
      expect(citations.some(c => c.sourceId === 2)).toBe(true);
    });

    it('should extract inline source mentions', () => {
      const text = 'According to the CSRD Regulation, companies must report on sustainability.';
      
      const citations = extractCitations(text, sources);
      
      expect(citations.some(c => c.sourceTitle.includes('CSRD'))).toBe(true);
    });

    it('should handle no citations', () => {
      const text = 'This is a statement without any citations.';
      
      const citations = extractCitations(text, sources);
      
      // May still find inline mentions
      expect(Array.isArray(citations)).toBe(true);
    });
  });

  describe('verifyClaims', () => {
    it('should verify claims with nearby citations', () => {
      const claims = [
        {
          id: 'claim_1',
          text: 'The CSRD requires sustainability reporting',
          startIndex: 0,
          endIndex: 40,
          type: 'factual' as const,
          confidence: 0.8,
        },
      ];
      
      const citations = [
        {
          id: 1,
          sourceId: 1,
          sourceTitle: 'CSRD Regulation',
          authorityLevel: 'official' as const,
          position: 45,
        },
      ];
      
      const results = verifyClaims(claims, citations, 'The CSRD requires sustainability reporting [1]');
      
      expect(results).toHaveLength(1);
      expect(results[0].verified).toBe(true);
      expect(results[0].supportingCitations.length).toBeGreaterThan(0);
    });

    it('should flag claims without citations', () => {
      const claims = [
        {
          id: 'claim_1',
          text: 'Companies must report by 2025',
          startIndex: 0,
          endIndex: 30,
          type: 'temporal' as const,
          confidence: 0.7,
        },
      ];
      
      const results = verifyClaims(claims, [], 'Companies must report by 2025');
      
      expect(results).toHaveLength(1);
      expect(results[0].verified).toBe(false);
      expect(results[0].issues).toContain('No citation found for this claim');
    });

    it('should give higher scores to official sources', () => {
      const claims = [
        {
          id: 'claim_1',
          text: 'Test claim',
          startIndex: 0,
          endIndex: 10,
          type: 'factual' as const,
          confidence: 1.0,
        },
      ];
      
      const officialCitation = [{
        id: 1,
        sourceId: 1,
        sourceTitle: 'EU Regulation',
        authorityLevel: 'official' as const,
        position: 15,
      }];
      
      const industryCitation = [{
        id: 1,
        sourceId: 1,
        sourceTitle: 'Industry Report',
        authorityLevel: 'industry' as const,
        position: 15,
      }];
      
      const officialResult = verifyClaims(claims, officialCitation, 'Test claim [1]');
      const industryResult = verifyClaims(claims, industryCitation, 'Test claim [1]');
      
      expect(officialResult[0].verificationScore).toBeGreaterThan(industryResult[0].verificationScore);
    });
  });

  describe('generateVerificationSummary', () => {
    it('should calculate correct verification rate', () => {
      const claimResults = [
        {
          claim: { id: '1', text: 'Claim 1', startIndex: 0, endIndex: 10, type: 'factual' as const, confidence: 1.0 },
          verified: true,
          supportingCitations: [],
          verificationScore: 0.8,
          issues: [],
        },
        {
          claim: { id: '2', text: 'Claim 2', startIndex: 20, endIndex: 30, type: 'factual' as const, confidence: 1.0 },
          verified: false,
          supportingCitations: [],
          verificationScore: 0.2,
          issues: ['No citation'],
        },
      ];
      
      const summary = generateVerificationSummary(claimResults);
      
      expect(summary.totalClaims).toBe(2);
      expect(summary.verifiedClaims).toBe(1);
      expect(summary.unverifiedClaims).toBe(1);
      expect(summary.verificationRate).toBe(0.5);
    });

    it('should generate warnings for low verification rate', () => {
      const claimResults = [
        {
          claim: { id: '1', text: 'Claim 1', startIndex: 0, endIndex: 10, type: 'factual' as const, confidence: 1.0 },
          verified: false,
          supportingCitations: [],
          verificationScore: 0.1,
          issues: ['No citation'],
        },
        {
          claim: { id: '2', text: 'Claim 2', startIndex: 20, endIndex: 30, type: 'factual' as const, confidence: 1.0 },
          verified: false,
          supportingCitations: [],
          verificationScore: 0.1,
          issues: ['No citation'],
        },
      ];
      
      const summary = generateVerificationSummary(claimResults);
      
      expect(summary.warnings.length).toBeGreaterThan(0);
      expect(summary.warnings.some(w => w.includes('half'))).toBe(true);
    });

    it('should handle empty claims', () => {
      const summary = generateVerificationSummary([]);
      
      expect(summary.totalClaims).toBe(0);
      expect(summary.verificationRate).toBe(1);
      expect(summary.overallScore).toBe(1);
    });
  });

  describe('verifyResponseClaims (integration)', () => {
    it('should run full verification pipeline', () => {
      const responseText = `
        The CSRD [1] requires large companies to report on sustainability matters.
        According to ESRS standards [2], companies must conduct double materiality assessment.
        The deadline for compliance is January 2025.
      `;
      
      const sources = [
        { id: 1, title: 'CSRD Regulation', authorityLevel: 'official' as const },
        { id: 2, title: 'ESRS Standards', authorityLevel: 'official' as const },
      ];
      
      const summary = verifyResponseClaims(responseText, sources);
      
      expect(summary.totalClaims).toBeGreaterThan(0);
      expect(typeof summary.verificationRate).toBe('number');
      expect(typeof summary.overallScore).toBe('number');
    });

    it('should handle response without claims', () => {
      const responseText = 'Hello! How can I help you today?';
      
      const summary = verifyResponseClaims(responseText, []);
      
      expect(summary.totalClaims).toBe(0);
      expect(summary.verificationRate).toBe(1);
    });
  });
});
