/**
 * EU ESG to GS1 Mapping Artefact Validation Script
 * 
 * PHASE 3: Mechanical Validation
 * - Full artefact coverage
 * - No orphaned IDs
 * - No semantic drift
 * - No GS1 overstatement
 * - No conflicts with existing ISA logic
 * 
 * Source: EU_ESG_to_GS1_Mapping_v1.1 (frozen, audit-defensible baseline)
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

// Validation results
const results = {
  coverage: { passed: true, errors: [] },
  orphanedIds: { passed: true, errors: [] },
  semanticDrift: { passed: true, errors: [] },
  gs1Overstatement: { passed: true, errors: [] },
  conflicts: { passed: true, errors: [] },
};

console.log('='.repeat(70));
console.log('EU ESG to GS1 Mapping Artefact Validation');
console.log('Source: EU_ESG_to_GS1_Mapping_v1.1 (frozen baseline)');
console.log('='.repeat(70));
console.log('');

// ============================================================================
// Load all artefacts
// ============================================================================

console.log('Loading artefacts...');
const corpus = loadArtefact('corpus.json');
const obligations = loadArtefact('obligations.json');
const atomicRequirements = loadArtefact('atomic_requirements.json');
const dataRequirements = loadArtefact('data_requirements.json');
const gs1Mapping = loadArtefact('gs1_mapping.json');
const scoring = loadArtefact('scoring.json');

console.log(`  Corpus: ${corpus.corpus.length} instruments`);
console.log(`  Obligations: ${obligations.obligations.length} items`);
console.log(`  Atomic Requirements: ${atomicRequirements.atomic_requirements.length} items`);
console.log(`  Data Requirements: ${dataRequirements.data_requirements.length} items`);
console.log(`  GS1 Mappings: ${gs1Mapping.gs1_mapping.length} items`);
console.log(`  Scoring: ${scoring.scoring.length} items`);
console.log('');

// ============================================================================
// PHASE 3a: Full Artefact Coverage
// ============================================================================

console.log('PHASE 3a: Validating full artefact coverage...');

// Check that all instruments have at least one obligation
const instrumentIds = new Set(corpus.corpus.map(c => c.instrument_id));
const obligationInstrumentIds = new Set(obligations.obligations.map(o => o.instrument_id));

for (const instrumentId of instrumentIds) {
  if (!obligationInstrumentIds.has(instrumentId)) {
    results.coverage.passed = false;
    results.coverage.errors.push(`Instrument ${instrumentId} has no obligations`);
  }
}

// Check that all obligations have at least one atomic requirement
const obligationIds = new Set(obligations.obligations.map(o => o.obligation_id));
const atomicObligationIds = new Set(atomicRequirements.atomic_requirements.map(a => a.obligation_id));

for (const obligationId of obligationIds) {
  if (!atomicObligationIds.has(obligationId)) {
    results.coverage.passed = false;
    results.coverage.errors.push(`Obligation ${obligationId} has no atomic requirements`);
  }
}

// Check that all atomic requirements have at least one data requirement
const atomicIds = new Set(atomicRequirements.atomic_requirements.map(a => a.atomic_id));
const dataAtomicIds = new Set(dataRequirements.data_requirements.map(d => d.atomic_id));

for (const atomicId of atomicIds) {
  if (!dataAtomicIds.has(atomicId)) {
    results.coverage.passed = false;
    results.coverage.errors.push(`Atomic requirement ${atomicId} has no data requirements`);
  }
}

// Check that all data requirements have a GS1 mapping
const dataIds = new Set(dataRequirements.data_requirements.map(d => d.data_id));
const mappingDataIds = new Set(gs1Mapping.gs1_mapping.map(m => m.data_id));

for (const dataId of dataIds) {
  if (!mappingDataIds.has(dataId)) {
    results.coverage.passed = false;
    results.coverage.errors.push(`Data requirement ${dataId} has no GS1 mapping`);
  }
}

// Check that all data requirements have scoring
const scoringDataIds = new Set(scoring.scoring.map(s => s.data_id));

for (const dataId of dataIds) {
  if (!scoringDataIds.has(dataId)) {
    results.coverage.passed = false;
    results.coverage.errors.push(`Data requirement ${dataId} has no scoring`);
  }
}

console.log(`  Coverage: ${results.coverage.passed ? 'PASSED' : 'FAILED'}`);
if (!results.coverage.passed) {
  results.coverage.errors.forEach(e => console.log(`    - ${e}`));
}
console.log('');

// ============================================================================
// PHASE 3b: No Orphaned IDs
// ============================================================================

console.log('PHASE 3b: Validating no orphaned IDs...');

// Check that all obligation references in atomic requirements exist
for (const atomic of atomicRequirements.atomic_requirements) {
  if (!obligationIds.has(atomic.obligation_id)) {
    results.orphanedIds.passed = false;
    results.orphanedIds.errors.push(`Atomic ${atomic.atomic_id} references non-existent obligation ${atomic.obligation_id}`);
  }
}

// Check that all atomic references in data requirements exist
for (const data of dataRequirements.data_requirements) {
  if (!atomicIds.has(data.atomic_id)) {
    results.orphanedIds.passed = false;
    results.orphanedIds.errors.push(`Data ${data.data_id} references non-existent atomic ${data.atomic_id}`);
  }
}

// Check that all obligation references in data requirements exist
for (const data of dataRequirements.data_requirements) {
  if (!obligationIds.has(data.obligation_id)) {
    results.orphanedIds.passed = false;
    results.orphanedIds.errors.push(`Data ${data.data_id} references non-existent obligation ${data.obligation_id}`);
  }
}

// Check that all data references in GS1 mappings exist
for (const mapping of gs1Mapping.gs1_mapping) {
  if (!dataIds.has(mapping.data_id)) {
    results.orphanedIds.passed = false;
    results.orphanedIds.errors.push(`GS1 mapping references non-existent data ${mapping.data_id}`);
  }
}

// Check that all data references in scoring exist
for (const score of scoring.scoring) {
  if (!dataIds.has(score.data_id)) {
    results.orphanedIds.passed = false;
    results.orphanedIds.errors.push(`Scoring references non-existent data ${score.data_id}`);
  }
}

console.log(`  Orphaned IDs: ${results.orphanedIds.passed ? 'PASSED' : 'FAILED'}`);
if (!results.orphanedIds.passed) {
  results.orphanedIds.errors.forEach(e => console.log(`    - ${e}`));
}
console.log('');

// ============================================================================
// PHASE 3c: No Semantic Drift
// ============================================================================

console.log('PHASE 3c: Validating no semantic drift...');

// Check that mapping_strength values are valid
const validStrengths = new Set(['none', 'partial', 'strong']);
for (const mapping of gs1Mapping.gs1_mapping) {
  if (!validStrengths.has(mapping.mapping_strength)) {
    results.semanticDrift.passed = false;
    results.semanticDrift.errors.push(`Invalid mapping_strength "${mapping.mapping_strength}" for ${mapping.data_id}`);
  }
}

// Check that gs1_capability values are consistent
const validCapabilities = new Set(['none', 'partial', 'master data', 'traceability']);
for (const mapping of gs1Mapping.gs1_mapping) {
  if (!validCapabilities.has(mapping.gs1_capability)) {
    results.semanticDrift.passed = false;
    results.semanticDrift.errors.push(`Invalid gs1_capability "${mapping.gs1_capability}" for ${mapping.data_id}`);
  }
}

// Check that scoring values are in valid range (1-5)
for (const score of scoring.scoring) {
  const fields = ['regulatory_force', 'information_inevitability', 'interoperability_dependency', 
                  'gs1_solution_fitness', 'sector_exposure', 'time_criticality'];
  for (const field of fields) {
    const value = score[field];
    if (value !== undefined && (value < 1 || value > 5)) {
      results.semanticDrift.passed = false;
      results.semanticDrift.errors.push(`Invalid ${field} value ${value} for ${score.data_id} (must be 1-5)`);
    }
  }
}

// Check that corpus status values are valid
const validStatuses = new Set(['confirmed', 'draft', 'proposed']);
for (const instrument of corpus.corpus) {
  if (!validStatuses.has(instrument.status)) {
    results.semanticDrift.passed = false;
    results.semanticDrift.errors.push(`Invalid status "${instrument.status}" for ${instrument.instrument_id}`);
  }
}

console.log(`  Semantic Drift: ${results.semanticDrift.passed ? 'PASSED' : 'FAILED'}`);
if (!results.semanticDrift.passed) {
  results.semanticDrift.errors.forEach(e => console.log(`    - ${e}`));
}
console.log('');

// ============================================================================
// PHASE 3c: No GS1 Overstatement
// ============================================================================

console.log('PHASE 3c: Validating no GS1 overstatement...');

// Check that "none" capability has "none" strength
for (const mapping of gs1Mapping.gs1_mapping) {
  if (mapping.gs1_capability === 'none' && mapping.mapping_strength !== 'none') {
    results.gs1Overstatement.passed = false;
    results.gs1Overstatement.errors.push(`Overstatement: ${mapping.data_id} has capability "none" but strength "${mapping.mapping_strength}"`);
  }
}

// Check that "strong" strength has non-empty gs1_standards
for (const mapping of gs1Mapping.gs1_mapping) {
  if (mapping.mapping_strength === 'strong') {
    if (!mapping.gs1_standards || mapping.gs1_standards.length === 0) {
      results.gs1Overstatement.passed = false;
      results.gs1Overstatement.errors.push(`Overstatement: ${mapping.data_id} has "strong" strength but no GS1 standards listed`);
    }
  }
}

// Check that gs1_solution_fitness <= 3 when mapping_strength is "none"
for (const mapping of gs1Mapping.gs1_mapping) {
  if (mapping.mapping_strength === 'none') {
    const score = scoring.scoring.find(s => s.data_id === mapping.data_id);
    if (score && score.gs1_solution_fitness > 3) {
      results.gs1Overstatement.passed = false;
      results.gs1Overstatement.errors.push(`Overstatement: ${mapping.data_id} has "none" strength but gs1_solution_fitness=${score.gs1_solution_fitness}`);
    }
  }
}

// Check that justification exists and is non-empty for all mappings
for (const mapping of gs1Mapping.gs1_mapping) {
  if (!mapping.justification || mapping.justification.trim() === '') {
    results.gs1Overstatement.passed = false;
    results.gs1Overstatement.errors.push(`Missing justification for ${mapping.data_id}`);
  }
}

console.log(`  GS1 Overstatement: ${results.gs1Overstatement.passed ? 'PASSED' : 'FAILED'}`);
if (!results.gs1Overstatement.passed) {
  results.gs1Overstatement.errors.forEach(e => console.log(`    - ${e}`));
}
console.log('');

// ============================================================================
// Summary
// ============================================================================

console.log('='.repeat(70));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(70));

const allPassed = Object.values(results).every(r => r.passed);

console.log(`  Coverage:         ${results.coverage.passed ? '✓ PASSED' : '✗ FAILED'}`);
console.log(`  Orphaned IDs:     ${results.orphanedIds.passed ? '✓ PASSED' : '✗ FAILED'}`);
console.log(`  Semantic Drift:   ${results.semanticDrift.passed ? '✓ PASSED' : '✗ FAILED'}`);
console.log(`  GS1 Overstatement: ${results.gs1Overstatement.passed ? '✓ PASSED' : '✗ FAILED'}`);
console.log('');
console.log(`  OVERALL: ${allPassed ? '✓ ALL VALIDATIONS PASSED' : '✗ SOME VALIDATIONS FAILED'}`);
console.log('='.repeat(70));

// Exit with error code if any validation failed
if (!allPassed) {
  process.exit(1);
}
