/**
 * Attribute Recommender Tests
 * Phase 1: Test suite for GS1 Attribute Recommender
 */

import { describe, it, expect } from 'vitest';
import { generateAttributeRecommendations } from './attribute-recommender';

describe('Attribute Recommender Engine', () => {
  describe('generateAttributeRecommendations', () => {
    it('should generate recommendations for Food & Beverage sector', async () => {
      const result = await generateAttributeRecommendations({
        sector: 'Food & Beverage',
        targetRegulations: ['CSRD'],
      });

      expect(result).toBeDefined();
      expect(result.input.sector).toBe('Food & Beverage');
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should generate recommendations for Retail sector', async () => {
      const result = await generateAttributeRecommendations({
        sector: 'Retail',
        targetRegulations: ['DPP'],
      });

      expect(result).toBeDefined();
      expect(result.input.sector).toBe('Retail');
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should include summary statistics', async () => {
      const result = await generateAttributeRecommendations({
        sector: 'Manufacturing',
      });

      expect(result.summary).toBeDefined();
      expect(typeof result.summary.totalRecommendations).toBe('number');
      expect(typeof result.summary.highConfidenceCount).toBe('number');
      expect(typeof result.summary.mediumConfidenceCount).toBe('number');
      expect(typeof result.summary.lowConfidenceCount).toBe('number');
    });

    it('should assign priority ranks to recommendations', async () => {
      const result = await generateAttributeRecommendations({
        sector: 'Electronics',
        targetRegulations: ['ESPR'],
      });

      for (let i = 0; i < result.recommendations.length; i++) {
        expect(result.recommendations[i].priorityRank).toBe(i + 1);
      }
    });

    it('should sort recommendations by confidence score descending', async () => {
      const result = await generateAttributeRecommendations({
        sector: 'Textiles & Apparel',
      });

      for (let i = 0; i < result.recommendations.length - 1; i++) {
        expect(result.recommendations[i].confidenceScore)
          .toBeGreaterThanOrEqual(result.recommendations[i + 1].confidenceScore);
      }
    });

    it('should include epistemic markers for each recommendation', async () => {
      const result = await generateAttributeRecommendations({
        sector: 'Healthcare',
      });

      for (const rec of result.recommendations) {
        expect(rec.epistemic).toBeDefined();
        expect(['fact', 'inference', 'uncertain']).toContain(rec.epistemic.status);
        expect(['high', 'medium', 'low']).toContain(rec.epistemic.confidence);
        expect(typeof rec.epistemic.basis).toBe('string');
      }
    });

    it('should include implementation notes for recommendations', async () => {
      const result = await generateAttributeRecommendations({
        sector: 'Agriculture',
      });

      for (const rec of result.recommendations) {
        expect(rec.implementationNotes).toBeDefined();
        expect(typeof rec.implementationNotes).toBe('string');
      }
    });

    it('should include estimated effort for recommendations', async () => {
      const result = await generateAttributeRecommendations({
        sector: 'Manufacturing',
      });

      for (const rec of result.recommendations) {
        expect(['low', 'medium', 'high']).toContain(rec.estimatedEffort);
      }
    });

    it('should filter out current attributes from recommendations', async () => {
      const currentAttributes = ['productCarbonFootprint', 'waterFootprint'];
      const result = await generateAttributeRecommendations({
        sector: 'Manufacturing',
        currentAttributes,
      });

      for (const rec of result.recommendations) {
        expect(currentAttributes).not.toContain(rec.attributeId);
      }
    });

    it('should handle multiple target regulations', async () => {
      const result = await generateAttributeRecommendations({
        sector: 'Retail',
        targetRegulations: ['CSRD', 'DPP', 'EUDR'],
      });

      expect(result.summary.regulationsCovered.length).toBeGreaterThan(0);
    });

    it('should include overall epistemic marker for result', async () => {
      const result = await generateAttributeRecommendations({
        sector: 'Food & Beverage',
      });

      expect(result.epistemic).toBeDefined();
      expect(['fact', 'inference', 'uncertain']).toContain(result.epistemic.status);
    });

    it('should limit recommendations to top 20', async () => {
      const result = await generateAttributeRecommendations({
        sector: 'Manufacturing',
        targetRegulations: ['CSRD', 'DPP', 'EUDR', 'ESPR', 'CS3D'],
      });

      expect(result.recommendations.length).toBeLessThanOrEqual(20);
    });
  });
});

describe('Confidence Scoring', () => {
  it('should assign confidence levels based on score', async () => {
    const result = await generateAttributeRecommendations({
      sector: 'Retail',
      targetRegulations: ['CSRD'],
    });

    for (const rec of result.recommendations) {
      if (rec.confidenceScore >= 0.7) {
        expect(rec.confidenceLevel).toBe('high');
      } else if (rec.confidenceScore >= 0.4) {
        expect(rec.confidenceLevel).toBe('medium');
      } else {
        expect(rec.confidenceLevel).toBe('low');
      }
    }
  });

  it('should have confidence scores between 0 and 1', async () => {
    const result = await generateAttributeRecommendations({
      sector: 'Manufacturing',
    });

    for (const rec of result.recommendations) {
      expect(rec.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(rec.confidenceScore).toBeLessThanOrEqual(1);
    }
  });
});

describe('Recommendation Rationale', () => {
  it('should include rationale for each recommendation', async () => {
    const result = await generateAttributeRecommendations({
      sector: 'Textiles & Apparel',
      targetRegulations: ['DPP'],
    });

    for (const rec of result.recommendations) {
      expect(rec.recommendationRationale).toBeDefined();
      expect(typeof rec.recommendationRationale).toBe('string');
      expect(rec.recommendationRationale.length).toBeGreaterThan(0);
    }
  });
});
