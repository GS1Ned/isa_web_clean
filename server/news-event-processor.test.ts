/**
 * Unit tests for Regulatory Event Processor
 * Phase 2: Hard-Gate Closure - Check 5 & Check 6
 */

import { describe, it, expect } from 'vitest';
import {
  getQuarter,
  generateDedupKey,
  detectEventType,
  detectPrimaryRegulation,
  detectAffectedRegulations,
  validateDelta
} from './news-event-processor';

describe('Event Processor - Quarter Calculation', () => {
  it('should calculate Q1 correctly', () => {
    expect(getQuarter(new Date('2025-01-15'))).toBe('2025-Q1');
    expect(getQuarter(new Date('2025-02-28'))).toBe('2025-Q1');
    expect(getQuarter(new Date('2025-03-31'))).toBe('2025-Q1');
  });

  it('should calculate Q2 correctly', () => {
    expect(getQuarter(new Date('2025-04-01'))).toBe('2025-Q2');
    expect(getQuarter(new Date('2025-05-15'))).toBe('2025-Q2');
    expect(getQuarter(new Date('2025-06-30'))).toBe('2025-Q2');
  });

  it('should calculate Q3 correctly', () => {
    expect(getQuarter(new Date('2025-07-01'))).toBe('2025-Q3');
    expect(getQuarter(new Date('2025-08-15'))).toBe('2025-Q3');
    expect(getQuarter(new Date('2025-09-30'))).toBe('2025-Q3');
  });

  it('should calculate Q4 correctly', () => {
    expect(getQuarter(new Date('2025-10-01'))).toBe('2025-Q4');
    expect(getQuarter(new Date('2025-11-15'))).toBe('2025-Q4');
    expect(getQuarter(new Date('2025-12-31'))).toBe('2025-Q4');
  });
});

describe('Event Processor - Dedup Key Generation', () => {
  it('should generate correct dedup key format', () => {
    expect(generateDedupKey('CSRD', 'ADOPTION', '2025-Q1')).toBe('CSRD_ADOPTION_2025-Q1');
    expect(generateDedupKey('csddd', 'proposal', '2025-Q2')).toBe('CSDDD_PROPOSAL_2025-Q2');
  });

  it('should handle special characters', () => {
    expect(generateDedupKey('EU_TAXONOMY', 'DELEGATED_ACT_DRAFT', '2025-Q3')).toBe('EU_TAXONOMY_DELEGATED_ACT_DRAFT_2025-Q3');
  });
});

describe('Event Processor - Event Type Detection', () => {
  it('should detect ADOPTION events', () => {
    expect(detectEventType('The regulation was formally adopted by the Council')).toBe('ADOPTION');
    expect(detectEventType('Final adoption of the CSRD directive')).toBe('ADOPTION');
  });

  it('should detect PROPOSAL events', () => {
    expect(detectEventType('Commission publishes draft proposal for new regulation')).toBe('PROPOSAL');
    expect(detectEventType('Legislative proposal submitted to Parliament')).toBe('PROPOSAL');
  });

  it('should detect POLITICAL_AGREEMENT events', () => {
    expect(detectEventType('Trilogue negotiations conclude with political agreement')).toBe('POLITICAL_AGREEMENT');
    expect(detectEventType('Council and Parliament reach provisional agreement')).toBe('POLITICAL_AGREEMENT');
  });

  it('should detect POSTPONEMENT events', () => {
    expect(detectEventType('The regulation has been postponed by two years')).toBe('POSTPONEMENT');
    expect(detectEventType('Implementation delayed until 2027')).toBe('POSTPONEMENT');
    expect(detectEventType('Uitstel van de rapportageverplichting')).toBe('POSTPONEMENT');
  });

  it('should detect GUIDANCE_PUBLICATION events', () => {
    expect(detectEventType('EFRAG publishes new guidance on ESRS reporting')).toBe('GUIDANCE_PUBLICATION');
    expect(detectEventType('FAQ document released for CSRD implementation')).toBe('GUIDANCE_PUBLICATION');
  });

  it('should detect ENFORCEMENT_START events', () => {
    expect(detectEventType('Regulation comes into effect on January 1st')).toBe('ENFORCEMENT_START');
    expect(detectEventType('New requirements applicable from 2026')).toBe('ENFORCEMENT_START');
  });

  it('should return null for unrecognized content', () => {
    expect(detectEventType('General news about sustainability')).toBeNull();
    expect(detectEventType('Company announces new product')).toBeNull();
  });
});

describe('Event Processor - Regulation Detection', () => {
  it('should detect primary regulation from text', () => {
    expect(detectPrimaryRegulation('The CSRD requires companies to report')).toBe('CSRD');
    expect(detectPrimaryRegulation('CSDDD implementation timeline')).toBe('CSDDD');
    expect(detectPrimaryRegulation('New ESPR requirements for products')).toBe('ESPR');
  });

  it('should prioritize regulation tags over text detection', () => {
    expect(detectPrimaryRegulation('General sustainability news', ['PPWR', 'CSRD'])).toBe('PPWR');
  });

  it('should detect multiple affected regulations', () => {
    const regulations = detectAffectedRegulations('The CSRD and CSDDD both require supply chain data');
    expect(regulations).toContain('CSRD');
    expect(regulations).toContain('CSDDD');
  });

  it('should combine tags and text detection', () => {
    const regulations = detectAffectedRegulations('ESPR requirements', ['CSRD']);
    expect(regulations).toContain('CSRD');
    expect(regulations).toContain('ESPR');
  });
});

describe('Event Processor - Delta Validation (Check 6)', () => {
  it('should pass validation for complete delta', () => {
    const result = validateDelta({
      previousAssumption: 'Before this event, companies expected the deadline to be in 2025. This was based on the original proposal timeline.',
      newInformation: 'The European Commission has officially confirmed a two-year postponement of the compliance deadline to 2027.',
      whatChanged: 'The compliance deadline has moved from 2025 to 2027, giving companies an additional two years to prepare their systems.',
      whatDidNotChange: 'The core reporting requirements remain the same.',
      decisionImpact: 'Companies can now extend their implementation timelines and reallocate resources to other priorities.'
    });
    
    expect(result.isValid).toBe(true);
    expect(result.completenessScore).toBeGreaterThanOrEqual(80);
    expect(result.missingFields).toHaveLength(0);
  });

  it('should fail validation for missing fields', () => {
    const result = validateDelta({
      previousAssumption: 'Before this event, companies expected the deadline to be in 2025.',
      newInformation: null,
      whatChanged: 'The deadline changed.',
      whatDidNotChange: null,
      decisionImpact: 'Companies should update their plans.'
    });
    
    expect(result.isValid).toBe(false);
    expect(result.missingFields).toContain('newInformation');
    expect(result.missingFields).toContain('whatDidNotChange');
  });

  it('should fail validation for too short content', () => {
    const result = validateDelta({
      previousAssumption: 'Short.',
      newInformation: 'Too short.',
      whatChanged: 'Changed.',
      whatDidNotChange: 'Same.',
      decisionImpact: 'Impact.'
    });
    
    expect(result.isValid).toBe(false);
    expect(result.missingFields.length).toBeGreaterThan(0);
  });

  it('should detect forbidden placeholders', () => {
    const result = validateDelta({
      previousAssumption: 'To be determined later when more information is available from the Commission.',
      newInformation: 'This information is pending further clarification from regulatory bodies.',
      whatChanged: 'The specific changes are not applicable at this time and will be updated.',
      whatDidNotChange: 'Unknown at this point in time.',
      decisionImpact: 'TBD - awaiting further guidance from industry associations.'
    });
    
    expect(result.forbiddenPlaceholders.length).toBeGreaterThan(0);
  });

  it('should calculate completeness score correctly', () => {
    // All fields complete = 100
    const fullResult = validateDelta({
      previousAssumption: 'Before this event, companies expected the deadline to be in 2025. This was based on the original proposal.',
      newInformation: 'The European Commission has officially confirmed a two-year postponement of the compliance deadline.',
      whatChanged: 'The compliance deadline has moved from 2025 to 2027, giving companies additional preparation time.',
      whatDidNotChange: 'The core reporting requirements remain unchanged.',
      decisionImpact: 'Companies can now extend their implementation timelines and reallocate resources accordingly.'
    });
    expect(fullResult.completenessScore).toBe(100);
    
    // Missing 2 fields = ~60
    const partialResult = validateDelta({
      previousAssumption: 'Before this event, companies expected the deadline to be in 2025. This was based on the original proposal.',
      newInformation: null,
      whatChanged: 'The compliance deadline has moved from 2025 to 2027, giving companies additional preparation time.',
      whatDidNotChange: null,
      decisionImpact: 'Companies can now extend their implementation timelines and reallocate resources accordingly.'
    });
    expect(partialResult.completenessScore).toBe(60);
  });
});

describe('Event Processor - Integration Scenarios', () => {
  it('should handle CSDDD adoption scenario', () => {
    const text = 'The EU Parliament has formally adopted the Corporate Sustainability Due Diligence Directive (CSDDD). This marks a significant milestone in EU sustainability regulation.';
    
    const eventType = detectEventType(text);
    const primaryReg = detectPrimaryRegulation(text);
    const affectedRegs = detectAffectedRegulations(text);
    
    expect(eventType).toBe('ADOPTION');
    expect(primaryReg).toBe('CSDDD');
    expect(affectedRegs).toContain('CSDDD');
  });

  it('should handle CSRD guidance scenario', () => {
    const text = 'EFRAG has published new FAQ guidance on ESRS implementation for CSRD reporting. The clarification addresses common questions about materiality assessment.';
    
    const eventType = detectEventType(text);
    const primaryReg = detectPrimaryRegulation(text);
    const affectedRegs = detectAffectedRegulations(text);
    
    expect(eventType).toBe('GUIDANCE_PUBLICATION');
    // CSRD appears first in the regulation codes list, so it's detected as primary
    expect(primaryReg).toBe('CSRD');
    expect(affectedRegs).toContain('ESRS');
    expect(affectedRegs).toContain('CSRD');
  });

  it('should handle postponement scenario', () => {
    const text = 'The European Commission has announced that the ESPR delegated acts will be delayed by 18 months. Implementation has been postponed to allow more industry consultation.';
    
    const eventType = detectEventType(text);
    const primaryReg = detectPrimaryRegulation(text);
    
    expect(eventType).toBe('POSTPONEMENT');
    expect(primaryReg).toBe('ESPR');
  });
});
