#!/usr/bin/env node
/**
 * Validate ISA advisory JSON against schema and check dataset IDs against frozen registry.
 */

const { format: utilFormat } = require("node:util");
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);

const fs = require('fs');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Load schema
const schema = JSON.parse(fs.readFileSync('./shared/schemas/advisory-output.schema.json', 'utf8'));

// Load advisory
const advisory = JSON.parse(fs.readFileSync('./data/advisories/ISA_ADVISORY_v1.0.json', 'utf8'));

// Load frozen registry
const registry = JSON.parse(fs.readFileSync('./data/metadata/dataset_registry_v1.0_FROZEN.json', 'utf8'));

// Validate against schema
const validate = ajv.compile(schema);
const valid = validate(advisory);

if (!valid) {
  cliErr('❌ Schema validation FAILED:');
  validate.errors.forEach(err => {
    cliErr(`   ${err.instancePath}: ${err.message}`);
  });
  process.exit(1);
}

cliOut('✅ Schema validation PASSED');

// Check dataset IDs against frozen registry
const registryDatasetIds = new Set(registry.datasets.map(d => d.id));
const usedDatasetIds = new Set();

advisory.regulationsCovered.forEach(r => r.datasetIds.forEach(id => usedDatasetIds.add(id)));
advisory.sectorModelsCovered.forEach(s => usedDatasetIds.add(s.id));
advisory.mappingResults.forEach(m => m.datasetReferences.forEach(id => usedDatasetIds.add(id)));
advisory.gaps.forEach(g => g.datasetReferences.forEach(id => usedDatasetIds.add(id)));

const unknownDatasets = [...usedDatasetIds].filter(id => !registryDatasetIds.has(id));

if (unknownDatasets.length > 0) {
  cliErr('❌ Unknown dataset IDs found:');
  unknownDatasets.forEach(id => cliErr(`   ${id}`));
  process.exit(1);
}

cliOut('✅ All dataset IDs validated against frozen registry');
cliOut(`\n📊 Advisory Summary:`);
cliOut(`   Advisory ID: ${advisory.advisoryId}`);
cliOut(`   Version: ${advisory.version}`);
cliOut(`   Mappings: ${advisory.metadata.totalMappings} (${advisory.metadata.directMappings} direct, ${advisory.metadata.partialMappings} partial, ${advisory.metadata.missingMappings} missing)`);
cliOut(`   Gaps: ${advisory.metadata.totalGaps} (${advisory.metadata.criticalGaps} critical, ${advisory.metadata.moderateGaps} moderate, ${advisory.metadata.lowPriorityGaps} low)`);
cliOut(`   Recommendations: ${advisory.metadata.totalRecommendations}`);
