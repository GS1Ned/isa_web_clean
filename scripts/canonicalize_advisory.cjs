#!/usr/bin/env node
/**
 * Apply canonical ordering to advisory JSON (deterministic, idempotent).
 */

const fs = require('fs');

// Load advisory
const advisory = JSON.parse(fs.readFileSync('./data/advisories/ISA_ADVISORY_v1.0.json', 'utf8'));

// Apply canonical ordering
advisory.mappingResults = advisory.mappingResults.sort((a, b) => a.mappingId.localeCompare(b.mappingId));
advisory.gaps = advisory.gaps.sort((a, b) => a.gapId.localeCompare(b.gapId));
advisory.recommendations = advisory.recommendations.sort((a, b) => a.recommendationId.localeCompare(b.recommendationId));

// Ensure uniqueness
function ensureUnique(items, idField) {
  const seen = new Set();
  return items.filter(item => {
    if (seen.has(item[idField])) return false;
    seen.add(item[idField]);
    return true;
  });
}

advisory.mappingResults = ensureUnique(advisory.mappingResults, 'mappingId');
advisory.gaps = ensureUnique(advisory.gaps, 'gapId');
advisory.recommendations = ensureUnique(advisory.recommendations, 'recommendationId');

// Write back
fs.writeFileSync('./data/advisories/ISA_ADVISORY_v1.0.json', JSON.stringify(advisory, null, 2) + '\n', 'utf8');

console.log('✅ Advisory canonicalized');
console.log(`   Mappings: ${advisory.mappingResults.length} (sorted by mappingId)`);
console.log(`   Gaps: ${advisory.gaps.length} (sorted by gapId)`);
console.log(`   Recommendations: ${advisory.recommendations.length} (sorted by recommendationId)`);
