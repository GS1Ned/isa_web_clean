/**
 * Unit Tests for Gap Reasoning Primitives
 * 
 * Tests the shared types and helper functions used by both
 * Core 1 (Gap Analyzer) and Core 2 (Impact Simulator).
 */

import { describe, it, expect } from 'vitest';
import {
  determineGapPriority,
  createFactMarker,
  createInferenceMarker,
  createUncertainMarker,
  calculateOverallConfidence,
  generateGapExplanation,
  SECTOR_ESRS_RELEVANCE,
  COMPANY_SIZE_THRESHOLDS,
  type EpistemicMarker,
  type ComplianceGap,
  type SuggestedAttribute,
} from './gap-reasoning';

describe('Gap Reasoning Primitives', () => {
  describe('determineGapPriority', () => {
    it('should return critical for E1 standard without mapping', () => {
      const priority = determineGapPriority('ESRS E1', false, undefined);
      expect(priority).toBe('critical');
    });

    it('should return critical for E5 standard without mapping', () => {
      const priority = determineGapPriority('ESRS E5', false, undefined);
      expect(priority).toBe('critical');
    });

    it('should return critical for S1 standard without mapping', () => {
      const priority = determineGapPriority('ESRS S1', false, undefined);
      expect(priority).toBe('critical');
    });

    it('should return high for E2 standard without mapping', () => {
      const priority = determineGapPriority('ESRS E2', false, undefined);
      expect(priority).toBe('high');
    });

    it('should return high for G1 standard without mapping', () => {
      const priority = determineGapPriority('ESRS G1', false, undefined);
      expect(priority).toBe('high');
    });

    it('should return medium for other standards without mapping', () => {
      const priority = determineGapPriority('ESRS S3', false, undefined);
      expect(priority).toBe('medium');
    });

    it('should return high for critical standard with low confidence mapping', () => {
      const priority = determineGapPriority('ESRS E1', true, 'low');
      expect(priority).toBe('high');
    });

    it('should return medium for non-critical standard with low confidence mapping', () => {
      const priority = determineGapPriority('ESRS S3', true, 'low');
      expect(priority).toBe('medium');
    });

    it('should return low for any standard with high confidence mapping', () => {
      const priority = determineGapPriority('ESRS E1', true, 'high');
      expect(priority).toBe('low');
    });
  });

  describe('Epistemic Markers', () => {
    describe('createFactMarker', () => {
      it('should create a fact marker with high confidence', () => {
        const marker = createFactMarker('Database record XYZ');
        expect(marker.status).toBe('fact');
        expect(marker.confidence).toBe('high');
        expect(marker.basis).toBe('Database record XYZ');
      });
    });

    describe('createInferenceMarker', () => {
      it('should create an inference marker with specified confidence', () => {
        const marker = createInferenceMarker('Rule application', 'medium');
        expect(marker.status).toBe('inference');
        expect(marker.confidence).toBe('medium');
        expect(marker.basis).toBe('Rule application');
      });

      it('should accept different confidence levels', () => {
        const highMarker = createInferenceMarker('Test', 'high');
        const lowMarker = createInferenceMarker('Test', 'low');
        expect(highMarker.confidence).toBe('high');
        expect(lowMarker.confidence).toBe('low');
      });
    });

    describe('createUncertainMarker', () => {
      it('should create an uncertain marker with default low confidence', () => {
        const marker = createUncertainMarker('Future projection');
        expect(marker.status).toBe('uncertain');
        expect(marker.confidence).toBe('low');
        expect(marker.basis).toBe('Future projection');
      });

      it('should accept custom confidence level', () => {
        const marker = createUncertainMarker('Scenario analysis', 'medium');
        expect(marker.confidence).toBe('medium');
      });
    });
  });

  describe('calculateOverallConfidence', () => {
    it('should return low for empty markers array', () => {
      const confidence = calculateOverallConfidence([]);
      expect(confidence).toBe('low');
    });

    it('should return high when majority are high-confidence facts', () => {
      const markers: EpistemicMarker[] = [
        createFactMarker('Fact 1'),
        createFactMarker('Fact 2'),
        createFactMarker('Fact 3'),
        createInferenceMarker('Inference', 'medium'),
      ];
      const confidence = calculateOverallConfidence(markers);
      expect(confidence).toBe('high');
    });

    it('should return low when many uncertain markers', () => {
      const markers: EpistemicMarker[] = [
        createFactMarker('Fact 1'),
        createUncertainMarker('Uncertain 1'),
        createUncertainMarker('Uncertain 2'),
        createUncertainMarker('Uncertain 3'),
      ];
      const confidence = calculateOverallConfidence(markers);
      expect(confidence).toBe('low');
    });

    it('should return medium for mixed markers', () => {
      const markers: EpistemicMarker[] = [
        createFactMarker('Fact 1'),
        createFactMarker('Fact 2'),
        createInferenceMarker('Inference', 'medium'),
        createInferenceMarker('Inference', 'medium'),
      ];
      const confidence = calculateOverallConfidence(markers);
      expect(confidence).toBe('medium');
    });
  });

  describe('generateGapExplanation', () => {
    const suggestedAttrs: SuggestedAttribute[] = [
      {
        attributeId: 'attr1',
        attributeName: 'Carbon Footprint',
        mappingType: 'direct',
        mappingConfidence: 'high',
        implementationNotes: '',
      },
    ];

    it('should generate explanation for missing_attribute gap with suggestions', () => {
      const explanation = generateGapExplanation(
        'missing_attribute',
        'ESRS E1',
        'GHG Emissions',
        suggestedAttrs
      );
      expect(explanation).toContain('No GS1 attributes');
      expect(explanation).toContain('ESRS E1');
      expect(explanation).toContain('Carbon Footprint');
    });

    it('should generate explanation for missing_attribute gap without suggestions', () => {
      const explanation = generateGapExplanation(
        'missing_attribute',
        'ESRS E1',
        'GHG Emissions',
        []
      );
      expect(explanation).toContain('custom data collection');
    });

    it('should generate explanation for partial_coverage gap', () => {
      const explanation = generateGapExplanation(
        'partial_coverage',
        'ESRS E5',
        'Resource Use',
        suggestedAttrs
      );
      expect(explanation).toContain('partially addresses');
      expect(explanation).toContain('additional attributes');
    });

    it('should generate explanation for low_confidence_mapping gap', () => {
      const explanation = generateGapExplanation(
        'low_confidence_mapping',
        'ESRS S1',
        'Workforce',
        suggestedAttrs
      );
      expect(explanation).toContain('low');
      expect(explanation).toContain('Manual verification');
    });
  });

  describe('SECTOR_ESRS_RELEVANCE', () => {
    it('should have food_beverage sector with E1-E5 standards', () => {
      const foodSector = SECTOR_ESRS_RELEVANCE['food_beverage'];
      expect(foodSector).toContain('ESRS E1');
      expect(foodSector).toContain('ESRS E2');
      expect(foodSector).toContain('ESRS E3');
      expect(foodSector).toContain('ESRS E4');
      expect(foodSector).toContain('ESRS E5');
    });

    it('should have general sector as fallback', () => {
      const generalSector = SECTOR_ESRS_RELEVANCE['general'];
      expect(generalSector).toBeDefined();
      expect(generalSector.length).toBeGreaterThan(0);
    });

    it('should include S1 in most sectors', () => {
      const sectorsWithS1 = Object.values(SECTOR_ESRS_RELEVANCE)
        .filter(standards => standards.includes('ESRS S1'));
      expect(sectorsWithS1.length).toBeGreaterThan(5);
    });
  });

  describe('COMPANY_SIZE_THRESHOLDS', () => {
    it('should have large company thresholds', () => {
      const large = COMPANY_SIZE_THRESHOLDS.large;
      expect(large.employees).toBe(250);
      expect(Boolean(large.csrdApplicable)).toBe(true);
      expect(large.phaseInYear).toBe(2024);
    });

    it('should have SME thresholds', () => {
      const sme = COMPANY_SIZE_THRESHOLDS.sme;
      expect(sme.employees).toBe(50);
      expect(Boolean(sme.csrdApplicable)).toBe(true);
      expect(sme.phaseInYear).toBe(2026);
    });

    it('should have micro company thresholds', () => {
      const micro = COMPANY_SIZE_THRESHOLDS.micro;
      expect(micro.employees).toBe(10);
      expect(Boolean(micro.csrdApplicable)).toBe(false);
      expect(micro.phaseInYear).toBeNull();
    });
  });
});

describe('Type Definitions', () => {
  it('should allow valid EpistemicStatus values', () => {
    const statuses: Array<'fact' | 'inference' | 'uncertain'> = [
      'fact',
      'inference',
      'uncertain',
    ];
    expect(statuses).toHaveLength(3);
  });

  it('should allow valid ConfidenceLevel values', () => {
    const levels: Array<'high' | 'medium' | 'low'> = [
      'high',
      'medium',
      'low',
    ];
    expect(levels).toHaveLength(3);
  });
});
