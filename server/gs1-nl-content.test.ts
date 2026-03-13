/**
 * GS1 Nederland Content Test Suite
 * 
 * Verifies that GS1 NL-specific content is properly ingested and searchable.
 * Tests cover:
 * - FMCG Benelux Datamodel attributes
 * - DIY Datamodel attributes
 * - Healthcare Datamodel attributes
 * - Sustainability guidance content
 * - Dutch language query support
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { vectorSearchKnowledge } from './db-knowledge-vector';
import { hybridSearch } from './hybrid-search';

describe('GS1 Nederland Content Integration', () => {
  
  describe('FMCG Benelux Datamodel', () => {
    it('should find GTIN-related attributes', async () => {
      const results = await vectorSearchKnowledge('GS1 artikelcode GTIN', 5);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => 
        r.title.toLowerCase().includes('gtin') || 
        r.title.toLowerCase().includes('artikelcode')
      )).toBe(true);
    });

    it('should find nutritional information attributes', async () => {
      const results = await vectorSearchKnowledge('voedingswaarde nutriënten', 5);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find allergen-related attributes', async () => {
      const results = await vectorSearchKnowledge('allergenen bevat', 5);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find packaging-related attributes', async () => {
      const results = await vectorSearchKnowledge('verpakking materiaal recycling', 5);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('DIY Datamodel', () => {
    it('should find DIY-specific attributes', async () => {
      const results = await vectorSearchKnowledge('doe-het-zelf tuin dier', 5);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find product dimension attributes', async () => {
      const results = await vectorSearchKnowledge('afmetingen breedte hoogte diepte', 5);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find hazardous material attributes', async () => {
      const results = await vectorSearchKnowledge('gevaarlijke stoffen ADR', 5);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Healthcare Datamodel', () => {
    it('should find healthcare-specific attributes', async () => {
      const results = await vectorSearchKnowledge('gezondheidszorg medische hulpmiddelen', 5);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find UDI-related attributes', async () => {
      const results = await vectorSearchKnowledge('UDI Unique Device Identification', 5);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find sterilization attributes', async () => {
      const results = await vectorSearchKnowledge('sterilisatie steriel', 5);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Sustainability Guidance', () => {
    it('should find Eco-score guidance', async () => {
      const results = await vectorSearchKnowledge('Eco-score milieuimpact', 5);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => 
        r.title.toLowerCase().includes('eco-score') || 
        r.description?.toLowerCase().includes('eco-score')
      )).toBe(true);
    });

    it('should find Carbon Footprint guidance', async () => {
      const results = await vectorSearchKnowledge('Product Carbon Footprint CO2', 5);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find SUP directive guidance', async () => {
      const results = await vectorSearchKnowledge('Single-Use Plastics wegwerpplastic', 5);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find Digital Product Passport guidance', async () => {
      const results = await vectorSearchKnowledge('Digital Product Passport DPP', 5);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find EUDR guidance', async () => {
      const results = await vectorSearchKnowledge('EUDR ontbossing traceerbaarheid', 5);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Dutch Language Query Support', () => {
    it('should understand Dutch queries about regulations', async () => {
      const results = await hybridSearch('Welke GS1 attributen zijn verplicht voor CSRD?', { limit: 5 });
      expect(results.length).toBeGreaterThan(0);
    });

    it('should understand Dutch queries about datamodels', async () => {
      const results = await hybridSearch('Hoe vul ik het Benelux datamodel in?', { limit: 5 });
      expect(results.length).toBeGreaterThan(0);
    });

    it('should understand Dutch queries about sustainability', async () => {
      const results = await hybridSearch('Wat is de Eco-score en hoe bereken ik deze?', { limit: 5 });
      expect(results.length).toBeGreaterThan(0);
    });

    it('should understand Dutch queries about sectors', async () => {
      const results = await hybridSearch('Welke attributen zijn specifiek voor de gezondheidszorg?', { limit: 5 });
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Hybrid Search Quality', () => {
    it('should return relevant results for mixed Dutch/English queries', async () => {
      const results = await hybridSearch('GTIN barcode GS1 artikelcode', { limit: 5 });
      expect(results.length).toBeGreaterThan(0);
      // Check that results have reasonable hybrid scores
      expect(results[0].hybridScore).toBeGreaterThan(0);
    });

    it('should prioritize GS1 NL content for Dutch queries', async () => {
      const results = await hybridSearch('GS1 Nederland datamodel attributen', { limit: 10 });
      expect(results.length).toBeGreaterThan(0);
      // At least some results should be from GS1 NL datamodels
      const gs1NlResults = results.filter(r => 
        r.title.includes('GS1 Benelux') || 
        r.title.includes('GS1 NL')
      );
      expect(gs1NlResults.length).toBeGreaterThan(0);
    });
  });
});

describe('GS1 NL Content Database Integrity', () => {
  it('should have minimum expected FMCG attributes', async () => {
    const results = await vectorSearchKnowledge('Benelux FMCG datamodel', 500);
    const fmcgResults = results.filter(r => 
      r.title.includes('FMCG') || r.title.includes('Levensmiddelen')
    );
    expect(fmcgResults.length).toBeGreaterThanOrEqual(100);
  });

  it('should have minimum expected DIY attributes', async () => {
    const results = await vectorSearchKnowledge('Benelux DIY datamodel', 500);
    const diyResults = results.filter(r => 
      r.title.includes('DIY') || r.title.includes('Doe-het-zelf')
    );
    expect(diyResults.length).toBeGreaterThanOrEqual(100);
  });

  it('should have minimum expected Healthcare attributes', async () => {
    const results = await vectorSearchKnowledge('Benelux Healthcare datamodel', 500);
    const healthcareResults = results.filter(r => 
      r.title.includes('Healthcare') || r.title.includes('Gezondheidszorg')
    );
    expect(healthcareResults.length).toBeGreaterThanOrEqual(50);
  });

  it('should have all 5 sustainability guidance items', async () => {
    const results = await vectorSearchKnowledge('duurzaamheid sustainability guidance', 50);
    const guidanceResults = results.filter(r => 
      r.title.includes('Guidance') || r.title.includes('Gids')
    );
    expect(guidanceResults.length).toBeGreaterThanOrEqual(5);
  });
});
