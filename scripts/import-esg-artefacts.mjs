/**
 * EU ESG to GS1 Mapping Artefact Import Script
 * 
 * IMMUTABILITY: This script imports artefact data VERBATIM.
 * No interpretation, transformation, or extension is performed.
 * 
 * Source: EU_ESG_to_GS1_Mapping_v1.1 (frozen, audit-defensible baseline)
 * Integration Date: 2026-01-25
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARTEFACT_DIR = join(__dirname, '..', 'EU_ESG_to_GS1_Mapping_v1.1', 'data');

// Load artefact JSON files
function loadArtefact(filename) {
  const path = join(ARTEFACT_DIR, filename);
  const content = readFileSync(path, 'utf-8');
  return JSON.parse(content);
}

// Import corpus (regulatory instruments)
async function importCorpus(db, schema) {
  const data = loadArtefact('corpus.json');
  const records = data.corpus.map(item => ({
    instrumentId: item.instrument_id,
    name: item.name,
    status: item.status,
    scope: item.scope,
    authoritySource: item.authority?.source || null,
    authorityReference: item.authority?.reference || null,
    eliUrl: item.eli_url || null,
    celex: item.celex || null,
    lastVerified: item.last_verified || null,
    formats: item.formats || null,
    effectStatus: item.effect_status || null,
  }));
  
  console.log(`Importing ${records.length} corpus instruments...`);
  
  for (const record of records) {
    await db.insert(schema.esgCorpus).values(record).onDuplicateKeyUpdate({
      set: record
    });
  }
  
  return records.length;
}

// Import obligations
async function importObligations(db, schema) {
  const data = loadArtefact('obligations.json');
  const records = data.obligations.map(item => ({
    obligationId: item.obligation_id,
    instrumentId: item.instrument_id,
    article: item.article,
    obligationText: item.text,
  }));
  
  console.log(`Importing ${records.length} obligations...`);
  
  for (const record of records) {
    await db.insert(schema.esgObligations).values(record).onDuplicateKeyUpdate({
      set: record
    });
  }
  
  return records.length;
}

// Import atomic requirements
async function importAtomicRequirements(db, schema) {
  const data = loadArtefact('atomic_requirements.json');
  const records = data.atomic_requirements.map(item => ({
    atomicId: item.atomic_id,
    obligationId: item.obligation_id,
    obligationRefInstrumentId: item.obligation_ref?.instrument_id || null,
    obligationRefArticle: item.obligation_ref?.article || null,
    subject: item.subject,
    action: item.action,
    object: item.object || null,
    scope: item.scope || null,
    timing: item.timing || null,
    enforcement: item.enforcement || null,
  }));
  
  console.log(`Importing ${records.length} atomic requirements...`);
  
  for (const record of records) {
    await db.insert(schema.esgAtomicRequirements).values(record).onDuplicateKeyUpdate({
      set: record
    });
  }
  
  return records.length;
}

// Import data requirements
async function importDataRequirements(db, schema) {
  const data = loadArtefact('data_requirements.json');
  const records = data.data_requirements.map(item => ({
    dataId: item.data_id,
    atomicId: item.atomic_id,
    obligationId: item.obligation_id,
    dataClass: item.data_class,
    dataElements: item.data_elements,
  }));
  
  console.log(`Importing ${records.length} data requirements...`);
  
  for (const record of records) {
    await db.insert(schema.esgDataRequirements).values(record).onDuplicateKeyUpdate({
      set: record
    });
  }
  
  return records.length;
}

// Import GS1 mappings with scoring
async function importGs1Mappings(db, schema) {
  const mappingData = loadArtefact('gs1_mapping.json');
  const scoringData = loadArtefact('scoring.json');
  
  // Create scoring lookup
  const scoringLookup = {};
  for (const item of scoringData.scoring) {
    scoringLookup[item.data_id] = item;
  }
  
  const records = mappingData.gs1_mapping.map(item => {
    const scoring = scoringLookup[item.data_id] || {};
    return {
      dataId: item.data_id,
      gs1Capability: item.gs1_capability,
      gs1Standards: item.gs1_standards,
      mappingStrength: item.mapping_strength,
      justification: item.justification,
      sectorRelevance: item.sector_relevance || null,
      regulatoryForce: scoring.regulatory_force || null,
      informationInevitability: scoring.information_inevitability || null,
      interoperabilityDependency: scoring.interoperability_dependency || null,
      gs1SolutionFitness: scoring.gs1_solution_fitness || null,
      sectorExposure: scoring.sector_exposure || null,
      timeCriticality: scoring.time_criticality || null,
      totalScore: scoring.total || null,
      scoreRationale: scoring.rationale || null,
    };
  });
  
  console.log(`Importing ${records.length} GS1 mappings with scoring...`);
  
  for (const record of records) {
    await db.insert(schema.esgGs1Mappings).values(record).onDuplicateKeyUpdate({
      set: record
    });
  }
  
  return records.length;
}

// Main import function
export async function importAllArtefacts(db, schema) {
  console.log('='.repeat(60));
  console.log('EU ESG to GS1 Mapping Artefact Import');
  console.log('Source: EU_ESG_to_GS1_Mapping_v1.1 (frozen baseline)');
  console.log('='.repeat(60));
  
  const results = {
    corpus: await importCorpus(db, schema),
    obligations: await importObligations(db, schema),
    atomicRequirements: await importAtomicRequirements(db, schema),
    dataRequirements: await importDataRequirements(db, schema),
    gs1Mappings: await importGs1Mappings(db, schema),
  };
  
  console.log('='.repeat(60));
  console.log('Import Summary:');
  console.log(`  Corpus instruments: ${results.corpus}`);
  console.log(`  Obligations: ${results.obligations}`);
  console.log(`  Atomic requirements: ${results.atomicRequirements}`);
  console.log(`  Data requirements: ${results.dataRequirements}`);
  console.log(`  GS1 mappings: ${results.gs1Mappings}`);
  console.log('='.repeat(60));
  
  return results;
}

// Standalone execution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Standalone import not yet configured.');
  console.log('Use: import { importAllArtefacts } from "./scripts/import-esg-artefacts.mjs"');
}
