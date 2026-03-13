#!/usr/bin/env node
/**
 * ISA Coverage Strengthening — Phase 2A: ESRS-Standard Mappings
 * Creates esrs_standard_mappings table and populates it.
 * Idempotent: safe to re-run.
 */
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL_POSTGRES, { ssl: { rejectUnauthorized: false } });

async function createEsrsStandardMappingsTable() {
  console.log('[SCHEMA] Creating esrs_standard_mappings table...');
  await sql`CREATE TABLE IF NOT EXISTS esrs_standard_mappings (
    id SERIAL PRIMARY KEY,
    esrs_datapoint_id INTEGER NOT NULL,
    standard_id INTEGER NOT NULL,
    mapping_type VARCHAR(50) NOT NULL DEFAULT 'data_enablement',
    confidence NUMERIC(3,2) DEFAULT 0.80,
    rationale TEXT,
    review_status VARCHAR(20) DEFAULT 'provisional',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(esrs_datapoint_id, standard_id)
  )`;
  console.log('  ✓ esrs_standard_mappings');
}

async function seedEsrsStandardMappings() {
  console.log('[MAPPINGS] Loading ESRS datapoints...');
  const esrs = await sql`SELECT id, code, esrs_standard, name FROM esrs_datapoints ORDER BY id`;
  console.log(`  Found ${esrs.length} ESRS datapoints`);

  // Standards reference: 1=GTIN, 2=GLN, 3=SSCC, 4=SGTIN, 5=Digital Link, 6=EPCIS, 7=CBV, 8=EDI, 9=GDSN, 10=GPC, 11=DataMatrix, 12=LGTIN, 13=GDTI, 14=GSRN, 15=GRAI
  
  // Evidence-based ESRS-to-GS1 standard mappings
  // Grouped by ESRS standard
  const mappingRules = [
    // ESRS E1 (Climate Change) - emissions tracking needs supply chain visibility
    { esrsPattern: 'E1', standards: [
      { id: 6, conf: 0.90, type: 'data_enablement', rat: 'EPCIS supply chain events enable Scope 3 emissions calculation per ESRS E1' },
      { id: 1, conf: 0.80, type: 'data_enablement', rat: 'GTIN enables product-level carbon footprint tracking for E1 disclosures' },
      { id: 9, conf: 0.85, type: 'data_enablement', rat: 'GDSN product attributes (weight, packaging) support E1 emissions factor calculations' },
      { id: 2, conf: 0.75, type: 'data_enablement', rat: 'GLN identifies facilities for E1 Scope 1/2 emissions attribution' },
    ]},
    // ESRS E2 (Pollution) - substance tracking
    { esrsPattern: 'E2', standards: [
      { id: 9, conf: 0.85, type: 'data_enablement', rat: 'GDSN hazardous substance attributes support E2 pollution disclosures' },
      { id: 6, conf: 0.80, type: 'data_enablement', rat: 'EPCIS tracks movement of polluting substances through supply chain for E2' },
      { id: 1, conf: 0.75, type: 'data_enablement', rat: 'GTIN identifies products containing polluting substances for E2 reporting' },
    ]},
    // ESRS E3 (Water) - water usage in supply chain
    { esrsPattern: 'E3', standards: [
      { id: 2, conf: 0.80, type: 'data_enablement', rat: 'GLN identifies water-stressed locations for E3 water risk assessment' },
      { id: 6, conf: 0.75, type: 'data_enablement', rat: 'EPCIS enables supply chain water footprint tracking for E3' },
    ]},
    // ESRS E4 (Biodiversity) - deforestation, land use
    { esrsPattern: 'E4', standards: [
      { id: 6, conf: 0.85, type: 'data_enablement', rat: 'EPCIS geolocation events support E4 biodiversity impact assessment via supply chain origin tracking' },
      { id: 10, conf: 0.80, type: 'data_enablement', rat: 'GPC classification identifies biodiversity-sensitive product categories for E4' },
      { id: 1, conf: 0.70, type: 'data_enablement', rat: 'GTIN enables product-level deforestation-free verification for E4' },
    ]},
    // ESRS E5 (Circular Economy) - packaging, waste, recycling
    { esrsPattern: 'E5', standards: [
      { id: 9, conf: 0.90, type: 'data_enablement', rat: 'GDSN packaging attributes (material, recyclability, weight) directly support E5 circular economy disclosures' },
      { id: 1, conf: 0.85, type: 'data_enablement', rat: 'GTIN enables product-level circularity tracking for E5' },
      { id: 15, conf: 0.80, type: 'data_enablement', rat: 'GRAI tracks returnable assets for E5 circular economy metrics' },
      { id: 6, conf: 0.80, type: 'data_enablement', rat: 'EPCIS captures recycling/reuse events for E5 end-of-life tracking' },
      { id: 5, conf: 0.75, type: 'data_enablement', rat: 'GS1 Digital Link provides consumer access to E5 recycling instructions' },
    ]},
    // ESRS S1 (Own Workforce) - limited GS1 relevance
    { esrsPattern: 'S1', standards: [
      { id: 2, conf: 0.60, type: 'indirect_enablement', rat: 'GLN identifies workplace locations relevant for S1 workforce disclosures' },
    ]},
    // ESRS S2 (Workers in Value Chain) - supply chain visibility
    { esrsPattern: 'S2', standards: [
      { id: 6, conf: 0.80, type: 'data_enablement', rat: 'EPCIS supply chain visibility supports S2 value chain worker due diligence' },
      { id: 2, conf: 0.75, type: 'data_enablement', rat: 'GLN identifies supply chain partners for S2 worker assessment' },
    ]},
    // ESRS G1 (Business Conduct) - limited direct GS1 relevance
    { esrsPattern: 'G1', standards: [
      { id: 2, conf: 0.60, type: 'indirect_enablement', rat: 'GLN identifies business entities for G1 governance and anti-corruption disclosures' },
    ]},
  ];

  let inserted = 0;
  let skipped = 0;
  
  for (const rule of mappingRules) {
    // Find all ESRS datapoints matching this pattern
    const matchingEsrs = esrs.filter(e => e.esrs_standard && e.esrs_standard.includes(rule.esrsPattern));
    
    for (const dp of matchingEsrs) {
      for (const std of rule.standards) {
        try {
          await sql`
            INSERT INTO esrs_standard_mappings (esrs_datapoint_id, standard_id, mapping_type, confidence, rationale, review_status)
            VALUES (${dp.id}, ${std.id}, ${std.type}, ${std.conf}, ${std.rat}, 'provisional')
            ON CONFLICT (esrs_datapoint_id, standard_id) DO NOTHING
          `;
          inserted++;
        } catch (e) {
          if (e.code !== '23505') {
            console.error(`  ✗ esrs:${dp.id} std:${std.id} failed:`, e.message);
          }
          skipped++;
        }
      }
    }
  }
  
  console.log(`[MAPPINGS] ESRS-Standard: Inserted: ${inserted}, Skipped: ${skipped}`);
}

async function main() {
  try {
    await createEsrsStandardMappingsTable();
    await seedEsrsStandardMappings();
    
    const count = await sql`SELECT count(*) as c FROM esrs_standard_mappings`;
    console.log(`\n[VERIFY] esrs_standard_mappings: ${count[0].c} rows`);
    
    // Show distribution by standard
    const dist = await sql`
      SELECT s.standard_code, count(*) as cnt 
      FROM esrs_standard_mappings m 
      JOIN gs1_standards s ON s.id = m.standard_id 
      GROUP BY s.standard_code 
      ORDER BY cnt DESC
    `;
    console.log('[VERIFY] Distribution by standard:');
    dist.forEach(d => console.log(`  ${d.standard_code}: ${d.cnt} mappings`));
    
  } catch (e) {
    console.error('[FATAL]', e.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
