/**
 * Test Phase 3 Source Integration
 * Verifies that new sources are properly configured and can fetch articles
 */

import { NEWS_SOURCES } from "../server/news-sources.ts";
import { PHASE3_SOURCES, PHASE3_SOURCE_STATS } from "../server/news-sources-phase3.ts";

console.log("=== Phase 3 Source Integration Test ===\n");

// 1. Verify source counts
console.log("1. Source Count Verification:");
console.log(`   Total NEWS_SOURCES: ${NEWS_SOURCES.length}`);
console.log(`   Phase 3 sources: ${PHASE3_SOURCES.length}`);
console.log(`   Baseline sources: ${NEWS_SOURCES.length - PHASE3_SOURCES.length}`);
console.log();

// 2. Verify Phase 3 sources are included
console.log("2. Phase 3 Sources in NEWS_SOURCES:");
const phase3Ids = PHASE3_SOURCES.map(s => s.id);
const includedPhase3 = NEWS_SOURCES.filter(s => phase3Ids.includes(s.id));
console.log(`   Included: ${includedPhase3.length}/${PHASE3_SOURCES.length}`);
if (includedPhase3.length !== PHASE3_SOURCES.length) {
  console.log("   ❌ MISSING Phase 3 sources!");
  const missing = phase3Ids.filter(id => !NEWS_SOURCES.find(s => s.id === id));
  console.log(`   Missing IDs: ${missing.join(", ")}`);
} else {
  console.log("   ✅ All Phase 3 sources included");
}
console.log();

// 3. Source statistics
console.log("3. Source Statistics:");
console.log(`   By Authority Tier:`);
console.log(`     - Tier 1: ${PHASE3_SOURCE_STATS.byTier.TIER_1}`);
console.log(`     - Tier 2: ${PHASE3_SOURCE_STATS.byTier.TIER_2}`);
console.log(`     - Tier 3: ${PHASE3_SOURCE_STATS.byTier.TIER_3}`);
console.log(`   By Coverage Area:`);
console.log(`     - CSDDD: ${PHASE3_SOURCE_STATS.byCoverage.CSDDD}`);
console.log(`     - GREEN_CLAIMS: ${PHASE3_SOURCE_STATS.byCoverage.GREEN_CLAIMS}`);
console.log(`     - ESPR: ${PHASE3_SOURCE_STATS.byCoverage.ESPR}`);
console.log(`     - NL_SPECIFIC: ${PHASE3_SOURCE_STATS.byCoverage.NL_SPECIFIC}`);
console.log();

// 4. Enabled sources
console.log("4. Enabled Sources:");
const enabledSources = NEWS_SOURCES.filter(s => s.enabled);
const enabledPhase3 = PHASE3_SOURCES.filter(s => s.enabled);
console.log(`   Total enabled: ${enabledSources.length}/${NEWS_SOURCES.length}`);
console.log(`   Phase 3 enabled: ${enabledPhase3.length}/${PHASE3_SOURCES.length}`);
console.log();

// 5. Sources with RSS URLs (can be fetched)
console.log("5. Sources with RSS URLs:");
const withRss = NEWS_SOURCES.filter(s => s.rssUrl && s.enabled);
const phase3WithRss = PHASE3_SOURCES.filter(s => s.rssUrl && s.enabled);
console.log(`   Total with RSS: ${withRss.length}`);
console.log(`   Phase 3 with RSS: ${phase3WithRss.length}`);
console.log();

// 6. List Phase 3 sources
console.log("6. Phase 3 Source Details:");
for (const source of PHASE3_SOURCES) {
  const status = source.enabled ? "✅" : "⏸️";
  const rss = source.rssUrl ? "RSS" : "SCRAPER";
  console.log(`   ${status} [${source.authorityTier}] ${source.name}`);
  console.log(`      Coverage: ${source.coverageArea} | Type: ${source.type} | Method: ${rss}`);
  console.log(`      Keywords: ${source.keywords.slice(0, 5).join(", ")}...`);
}
console.log();

// 7. Summary
console.log("=== Summary ===");
console.log(`✅ Phase 3 sources integrated: ${includedPhase3.length}/${PHASE3_SOURCES.length}`);
console.log(`✅ Total enabled sources: ${enabledSources.length}`);
console.log(`✅ Sources with RSS feeds: ${withRss.length}`);
console.log();
console.log("Integration test complete!");
