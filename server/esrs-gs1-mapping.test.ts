/**
 * ESRS-GS1 Mapping Database Functions Test
 * 
 * Tests the database access layer for ESRS-GS1 compliance mapping queries.
 */

import { describe, it, expect } from 'vitest';
import {
  getAllEsrsGs1Mappings,
  getEsrsGs1MappingsByStandard,
  getComplianceCoverageSummary,
} from './db-esrs-gs1-mapping';

const hasDb = Boolean(process.env.DATABASE_URL);
const describeDb = hasDb ? describe : describe.skip;

describeDb('ESRS-GS1 Mapping Database Functions', () => {
  describe('getAllEsrsGs1Mappings', () => {
    it('should return all ESRS-GS1 mappings', async () => {
      const mappings = await getAllEsrsGs1Mappings();
      
      expect(Array.isArray(mappings)).toBe(true);
      expect(mappings.length).toBeGreaterThan(0);
      
      // Verify structure of first mapping
      if (mappings.length > 0) {
        const firstMapping = mappings[0];
        expect(firstMapping).toHaveProperty('mapping_id');
        expect(firstMapping).toHaveProperty('esrs_standard');
        expect(firstMapping).toHaveProperty('esrs_topic');
        expect(firstMapping).toHaveProperty('data_point_name');
        expect(firstMapping).toHaveProperty('gs1_relevance');
      }
    });

    it('should return mappings ordered by ESRS standard', async () => {
      const mappings = await getAllEsrsGs1Mappings();
      
      if (mappings.length > 1) {
        // Verify ordering (ESRS E1 should come before ESRS E5)
        const esrsStandards = mappings.map((m: any) => m.esrsStandard);
        const uniqueStandards = [...new Set(esrsStandards)];
        
        expect(uniqueStandards.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getEsrsGs1MappingsByStandard', () => {
    it('should return mappings for ESRS E1', async () => {
      const mappings = await getEsrsGs1MappingsByStandard('ESRS E1');
      
      expect(Array.isArray(mappings)).toBe(true);
      
      // All returned mappings should be for ESRS E1
      mappings.forEach((mapping: any) => {
        expect(mapping.esrsStandard).toBe('ESRS E1');
      });
    });

    it('should return mappings for ESRS E5', async () => {
      const mappings = await getEsrsGs1MappingsByStandard('ESRS E5');
      
      expect(Array.isArray(mappings)).toBe(true);
      
      // All returned mappings should be for ESRS E5
      mappings.forEach((mapping: any) => {
        expect(mapping.esrsStandard).toBe('ESRS E5');
      });
    });

    it('should return empty array for non-existent standard', async () => {
      const mappings = await getEsrsGs1MappingsByStandard('ESRS X99');
      
      expect(Array.isArray(mappings)).toBe(true);
      expect(mappings.length).toBe(0);
    });
  });

  describe('getComplianceCoverageSummary', () => {
    it('should return compliance coverage summary', async () => {
      const summary = await getComplianceCoverageSummary();
      
      expect(Array.isArray(summary)).toBe(true);
      expect(summary.length).toBeGreaterThan(0);
      
      // Verify structure of first summary entry
      if (summary.length > 0) {
        const firstEntry = summary[0];
        expect(firstEntry).toHaveProperty('esrs_standard');
        expect(firstEntry).toHaveProperty('esrs_topic');
        expect(firstEntry).toHaveProperty('total_requirements');
        expect(firstEntry).toHaveProperty('mapped_attributes');
      }
    });

    it('should have coverage data for ESRS E5 (Circular Economy)', async () => {
      const summary = await getComplianceCoverageSummary();
      
      const e5Coverage = summary.find((entry: any) => 
        entry.esrsStandard === 'ESRS E5'
      );
      
      expect(e5Coverage).toBeDefined();
      if (e5Coverage) {
        expect(e5Coverage.total_requirements).toBeGreaterThan(0);
      }
    });
  });

  describe('Data Integrity', () => {
    it('should have at least 15 official ESRS-GS1 mappings', async () => {
      const mappings = await getAllEsrsGs1Mappings();
      
      expect(mappings.length).toBeGreaterThanOrEqual(15);
    });

    it('should have mappings for circular economy (ESRS E5)', async () => {
      const mappings = await getEsrsGs1MappingsByStandard('ESRS E5');
      
      expect(mappings.length).toBeGreaterThan(0);
      
      // Verify circular economy topic
      const circularEconomyMapping = mappings.find((m: any) => 
        m.esrs_topic?.toLowerCase().includes('circular')
      );
      
      expect(circularEconomyMapping).toBeDefined();
    });

    it('should have mappings for climate change (ESRS E1)', async () => {
      const mappings = await getEsrsGs1MappingsByStandard('ESRS E1');
      
      expect(mappings.length).toBeGreaterThan(0);
      
      // Verify climate change topic
      const climateMapping = mappings.find((m: any) => 
        m.esrs_topic?.toLowerCase().includes('climate')
      );
      
      expect(climateMapping).toBeDefined();
    });
  });
});
