#!/usr/bin/env node
/**
 * ISA Coverage Strengthening — Phase 1: Schema + Regulation-Standard Mappings
 * Creates missing tables and populates regulation-standard mappings.
 * Idempotent: safe to re-run.
 */
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL_POSTGRES, { ssl: { rejectUnauthorized: false } });

// ─── Schema Creation ───────────────────────────────────────────────────────────

async function createMissingTables() {
  console.log('[SCHEMA] Creating missing tables...');

  // 1. Products
  await sql`CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    gtin VARCHAR(14),
    product_name TEXT,
    brand TEXT,
    gpc_brick_code VARCHAR(10),
    categories TEXT,
    net_content TEXT,
    net_content_uom VARCHAR(20),
    country_of_origin VARCHAR(3),
    target_market VARCHAR(3) DEFAULT 'NL',
    nutrition_grades VARCHAR(5),
    nutriments JSONB,
    allergens TEXT,
    ingredients_text TEXT,
    packaging TEXT,
    image_url TEXT,
    eco_score VARCHAR(5),
    source_system VARCHAR(50) NOT NULL DEFAULT 'unknown',
    source_url TEXT,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    trust_level VARCHAR(5) DEFAULT 'T4',
    license VARCHAR(100),
    loader_run_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gtin)
  )`;
  console.log('  ✓ products');

  // 2. Companies
  await sql`CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    kvk_number VARCHAR(8),
    trade_name TEXT,
    legal_form VARCHAR(100),
    sbi_code VARCHAR(10),
    sbi_description TEXT,
    registration_date DATE,
    status VARCHAR(50),
    address_street TEXT,
    address_postal_code VARCHAR(10),
    address_city TEXT,
    address_country VARCHAR(3) DEFAULT 'NL',
    gln VARCHAR(13),
    source_system VARCHAR(50) NOT NULL DEFAULT 'kvk_open',
    source_url TEXT,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    trust_level VARCHAR(5) DEFAULT 'T1',
    loader_run_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(kvk_number)
  )`;
  console.log('  ✓ companies');

  // 3. Safety Alerts
  await sql`CREATE TABLE IF NOT EXISTS safety_alerts (
    id SERIAL PRIMARY KEY,
    alert_id VARCHAR(100) UNIQUE NOT NULL,
    source_system VARCHAR(50) NOT NULL,
    alert_type VARCHAR(50),
    product_category TEXT,
    product_description TEXT,
    brand TEXT,
    risk_type TEXT,
    risk_level VARCHAR(50),
    notifying_country VARCHAR(3),
    measures_taken TEXT,
    date_published DATE,
    counterfeit_flag BOOLEAN DEFAULT FALSE,
    voluntary_flag BOOLEAN DEFAULT FALSE,
    distribution_countries TEXT,
    nl_relevant BOOLEAN DEFAULT FALSE,
    gpc_brick_heuristic VARCHAR(10),
    source_url TEXT,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    trust_level VARCHAR(5) DEFAULT 'T2',
    loader_run_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  console.log('  ✓ safety_alerts');

  // 4. GPC Classification
  await sql`CREATE TABLE IF NOT EXISTS gpc_classification (
    id SERIAL PRIMARY KEY,
    gpc_code VARCHAR(10) UNIQUE NOT NULL,
    level VARCHAR(20) NOT NULL,
    title_en TEXT NOT NULL,
    title_nl TEXT,
    definition TEXT,
    parent_code VARCHAR(10),
    includes_text TEXT,
    excludes_text TEXT,
    attribute_count INTEGER DEFAULT 0,
    gs1_sector VARCHAR(100),
    source_system VARCHAR(50) DEFAULT 'gs1_gpc',
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  console.log('  ✓ gpc_classification');

  // 5. Identifier Crosswalks
  await sql`CREATE TABLE IF NOT EXISTS identifier_crosswalks (
    id SERIAL PRIMARY KEY,
    source_system VARCHAR(50) NOT NULL,
    source_identifier VARCHAR(255) NOT NULL,
    target_system VARCHAR(50) NOT NULL,
    target_identifier VARCHAR(255) NOT NULL,
    linkage_type VARCHAR(20) NOT NULL DEFAULT 'deterministic',
    confidence NUMERIC(3,2) DEFAULT 1.00,
    source_of_linkage VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    UNIQUE(source_system, source_identifier, target_system, target_identifier)
  )`;
  console.log('  ✓ identifier_crosswalks');

  // 6. Source Run Logs
  await sql`CREATE TABLE IF NOT EXISTS source_run_logs (
    id SERIAL PRIMARY KEY,
    run_id VARCHAR(50) NOT NULL,
    source_system VARCHAR(50) NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'running',
    records_retrieved INTEGER DEFAULT 0,
    records_loaded INTEGER DEFAULT 0,
    records_skipped INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    validation_errors INTEGER DEFAULT 0,
    error_message TEXT,
    raw_payload_ref TEXT,
    metadata JSONB
  )`;
  console.log('  ✓ source_run_logs');

  // 7. Validation Errors
  await sql`CREATE TABLE IF NOT EXISTS validation_errors (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    field_name VARCHAR(100),
    rule_name VARCHAR(100),
    expected TEXT,
    actual TEXT,
    severity VARCHAR(10) DEFAULT 'warning',
    source VARCHAR(50),
    loader_run_id VARCHAR(50),
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
  )`;
  console.log('  ✓ validation_errors');

  // 8. Data Conflicts
  await sql`CREATE TABLE IF NOT EXISTS data_conflicts (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    field_name VARCHAR(100),
    canonical_value TEXT,
    canonical_source VARCHAR(50),
    canonical_trust_level VARCHAR(5),
    canonical_retrieved_at TIMESTAMPTZ,
    conflicting_value TEXT,
    conflicting_source VARCHAR(50),
    conflicting_trust_level VARCHAR(5),
    conflicting_retrieved_at TIMESTAMPTZ,
    resolution_status VARCHAR(20) DEFAULT 'pending_review',
    resolution_rule VARCHAR(100),
    resolved_at TIMESTAMPTZ,
    resolved_by VARCHAR(100)
  )`;
  console.log('  ✓ data_conflicts');

  console.log('[SCHEMA] All tables created/verified.');
}

// ─── Regulation-Standard Mappings ──────────────────────────────────────────────

async function seedRegulationStandardMappings() {
  console.log('[MAPPINGS] Seeding regulation-standard mappings...');

  // Evidence-based mapping matrix
  // Each mapping has: regulation_id, standard_id, mapping_type, confidence, rationale
  const mappings = [
    // CSRD (id:1) - requires sustainability reporting using GS1 identifiers
    { reg: 1, std: 1, type: 'enables_compliance', conf: 0.85, rat: 'GTIN enables product-level sustainability data tracking required by CSRD supply chain reporting' },
    { reg: 1, std: 2, type: 'enables_compliance', conf: 0.80, rat: 'GLN enables location/entity identification for CSRD value chain mapping' },
    { reg: 1, std: 6, type: 'enables_compliance', conf: 0.90, rat: 'EPCIS provides supply chain visibility events essential for CSRD scope 3 emissions tracking' },
    { reg: 1, std: 9, type: 'enables_compliance', conf: 0.85, rat: 'GDSN enables standardized product data exchange supporting CSRD product-level disclosures' },
    { reg: 1, std: 10, type: 'enables_compliance', conf: 0.75, rat: 'GPC classification enables product categorization for CSRD sector-specific reporting' },
    { reg: 1, std: 5, type: 'enables_compliance', conf: 0.70, rat: 'GS1 Digital Link provides product-level data access points for CSRD transparency requirements' },

    // ESRS (id:2) - sustainability reporting standards
    { reg: 2, std: 1, type: 'data_requirement', conf: 0.85, rat: 'ESRS datapoints require product identification via GTIN for granular sustainability metrics' },
    { reg: 2, std: 9, type: 'data_requirement', conf: 0.90, rat: 'GDSN attributes map directly to ESRS disclosure requirements for product sustainability data' },
    { reg: 2, std: 6, type: 'data_requirement', conf: 0.85, rat: 'EPCIS traceability events provide evidence for ESRS supply chain disclosures' },
    { reg: 2, std: 10, type: 'data_requirement', conf: 0.80, rat: 'GPC classification enables product-category-level ESRS aggregation' },

    // ESPR (id:3) - Digital Product Passport
    { reg: 3, std: 1, type: 'mandatory_identifier', conf: 0.95, rat: 'ESPR Digital Product Passport requires unique product identification; GTIN is the primary GS1 identifier' },
    { reg: 3, std: 5, type: 'mandatory_carrier', conf: 0.95, rat: 'ESPR DPP requires machine-readable data carrier; GS1 Digital Link is the designated carrier standard' },
    { reg: 3, std: 11, type: 'mandatory_carrier', conf: 0.90, rat: 'GS1 DataMatrix is a primary data carrier for DPP physical product marking' },
    { reg: 3, std: 6, type: 'enables_compliance', conf: 0.90, rat: 'EPCIS provides supply chain event data required by ESPR traceability obligations' },
    { reg: 3, std: 9, type: 'enables_compliance', conf: 0.85, rat: 'GDSN enables standardized product attribute exchange for DPP data population' },
    { reg: 3, std: 10, type: 'enables_compliance', conf: 0.85, rat: 'GPC classification determines which ESPR delegated acts apply to which products' },
    { reg: 3, std: 4, type: 'enables_compliance', conf: 0.90, rat: 'SGTIN enables serialized product identification required by ESPR for individual product passports' },
    { reg: 3, std: 7, type: 'enables_compliance', conf: 0.80, rat: 'CBV provides standardized business vocabulary for ESPR event semantics' },

    // EUDR (id:4) - Deforestation
    { reg: 4, std: 1, type: 'enables_compliance', conf: 0.85, rat: 'GTIN identifies products subject to EUDR deforestation-free requirements' },
    { reg: 4, std: 6, type: 'mandatory_data', conf: 0.90, rat: 'EPCIS provides geolocation and traceability events required by EUDR due diligence' },
    { reg: 4, std: 2, type: 'enables_compliance', conf: 0.80, rat: 'GLN identifies operators and traders in EUDR supply chains' },
    { reg: 4, std: 10, type: 'enables_compliance', conf: 0.85, rat: 'GPC classification identifies EUDR-relevant product categories (palm oil, soy, cocoa, coffee, rubber, cattle, wood)' },

    // CSDDD (id:9) - Due Diligence
    { reg: 9, std: 6, type: 'enables_compliance', conf: 0.85, rat: 'EPCIS provides supply chain visibility for CSDDD human rights and environmental due diligence' },
    { reg: 9, std: 2, type: 'enables_compliance', conf: 0.80, rat: 'GLN enables identification of business partners in CSDDD due diligence scope' },
    { reg: 9, std: 1, type: 'enables_compliance', conf: 0.75, rat: 'GTIN enables product-level traceability for CSDDD supply chain due diligence' },

    // EU Taxonomy (id:10)
    { reg: 10, std: 10, type: 'enables_compliance', conf: 0.80, rat: 'GPC classification enables mapping products/activities to EU Taxonomy economic activities' },
    { reg: 10, std: 9, type: 'enables_compliance', conf: 0.75, rat: 'GDSN product attributes support EU Taxonomy technical screening criteria assessment' },

    // SFDR (id:11)
    { reg: 11, std: 1, type: 'enables_compliance', conf: 0.70, rat: 'GTIN enables product-level ESG data aggregation for SFDR principal adverse impact indicators' },
    { reg: 11, std: 9, type: 'enables_compliance', conf: 0.75, rat: 'GDSN sustainability attributes support SFDR disclosure requirements' },

    // Batteries Regulation (id:12)
    { reg: 12, std: 1, type: 'mandatory_identifier', conf: 0.95, rat: 'Batteries Regulation requires unique battery identification; GTIN is the primary identifier' },
    { reg: 12, std: 5, type: 'mandatory_carrier', conf: 0.95, rat: 'Battery passport requires GS1 Digital Link as data carrier for battery DPP' },
    { reg: 12, std: 11, type: 'mandatory_carrier', conf: 0.90, rat: 'GS1 DataMatrix for physical battery marking with DPP data carrier' },
    { reg: 12, std: 4, type: 'mandatory_identifier', conf: 0.90, rat: 'SGTIN enables serialized battery identification for individual battery passports' },
    { reg: 12, std: 6, type: 'enables_compliance', conf: 0.85, rat: 'EPCIS provides battery lifecycle event tracking (manufacturing, use, recycling)' },

    // FIC (id:14) - Food Information to Consumers
    { reg: 14, std: 1, type: 'mandatory_identifier', conf: 0.95, rat: 'FIC requires product identification on food labels; GTIN is the standard barcode identifier' },
    { reg: 14, std: 9, type: 'mandatory_data', conf: 0.95, rat: 'GDSN is the primary channel for exchanging FIC-mandated food product attributes (nutrition, allergens, ingredients)' },
    { reg: 14, std: 10, type: 'enables_compliance', conf: 0.90, rat: 'GPC food classification determines which FIC requirements apply to specific food products' },
    { reg: 14, std: 12, type: 'enables_compliance', conf: 0.80, rat: 'LGTIN enables lot-level traceability for FIC allergen and recall management' },
    { reg: 14, std: 5, type: 'enables_compliance', conf: 0.75, rat: 'GS1 Digital Link enables consumer access to extended food information beyond label space' },

    // CBAM (id:15) - Carbon Border Adjustment
    { reg: 15, std: 1, type: 'enables_compliance', conf: 0.75, rat: 'GTIN identifies imported products subject to CBAM carbon pricing' },
    { reg: 15, std: 2, type: 'enables_compliance', conf: 0.80, rat: 'GLN identifies importers and production facilities for CBAM reporting' },
    { reg: 15, std: 10, type: 'enables_compliance', conf: 0.80, rat: 'GPC classification maps to CBAM product categories (cement, iron, steel, aluminium, fertilisers, electricity, hydrogen)' },

    // PPWR (id:16) - Packaging
    { reg: 16, std: 1, type: 'enables_compliance', conf: 0.85, rat: 'GTIN identifies packaged products subject to PPWR packaging requirements' },
    { reg: 16, std: 9, type: 'enables_compliance', conf: 0.90, rat: 'GDSN packaging attributes (material, weight, recyclability) directly support PPWR compliance data' },
    { reg: 16, std: 5, type: 'enables_compliance', conf: 0.80, rat: 'GS1 Digital Link enables consumer access to packaging recycling instructions as required by PPWR' },
    { reg: 16, std: 10, type: 'enables_compliance', conf: 0.75, rat: 'GPC classification determines PPWR packaging requirements by product category' },

    // WFD (id:17) - Waste Framework
    { reg: 17, std: 1, type: 'enables_compliance', conf: 0.75, rat: 'GTIN enables product identification for WFD extended producer responsibility schemes' },
    { reg: 17, std: 9, type: 'enables_compliance', conf: 0.80, rat: 'GDSN material composition attributes support WFD recyclability and waste classification' },
    { reg: 17, std: 15, type: 'enables_compliance', conf: 0.70, rat: 'GRAI enables tracking of returnable assets in WFD circular economy context' },

    // DPP Batteries Delegated Act (id:20)
    { reg: 20, std: 1, type: 'mandatory_identifier', conf: 0.95, rat: 'Battery DPP delegated act mandates GTIN as unique identifier for battery passport' },
    { reg: 20, std: 5, type: 'mandatory_carrier', conf: 0.95, rat: 'Battery DPP delegated act designates GS1 Digital Link as the data carrier' },
    { reg: 20, std: 4, type: 'mandatory_identifier', conf: 0.95, rat: 'SGTIN provides serialization for individual battery passport instances' },
    { reg: 20, std: 11, type: 'mandatory_carrier', conf: 0.90, rat: 'GS1 DataMatrix as physical marking carrier for battery DPP' },
    { reg: 20, std: 6, type: 'enables_compliance', conf: 0.85, rat: 'EPCIS captures battery lifecycle events required by DPP delegated act' },
    { reg: 20, std: 9, type: 'enables_compliance', conf: 0.85, rat: 'GDSN enables exchange of battery attributes required by DPP delegated act' },

    // REACH (id:21)
    { reg: 21, std: 1, type: 'enables_compliance', conf: 0.80, rat: 'GTIN identifies products containing REACH-regulated substances' },
    { reg: 21, std: 9, type: 'enables_compliance', conf: 0.85, rat: 'GDSN hazardous substance attributes support REACH SVHC communication requirements' },
    { reg: 21, std: 6, type: 'enables_compliance', conf: 0.80, rat: 'EPCIS enables traceability of REACH-regulated substances through supply chain' },

    // CPR (id:22) - Construction Products
    { reg: 22, std: 1, type: 'enables_compliance', conf: 0.85, rat: 'GTIN identifies construction products subject to CPR performance declarations' },
    { reg: 22, std: 9, type: 'enables_compliance', conf: 0.80, rat: 'GDSN enables exchange of CPR-mandated product performance attributes' },
    { reg: 22, std: 10, type: 'enables_compliance', conf: 0.85, rat: 'GPC construction classification determines CPR harmonized standards applicability' },
    { reg: 22, std: 5, type: 'enables_compliance', conf: 0.75, rat: 'GS1 Digital Link provides access to CPR Declaration of Performance documents' },

    // Energy Labelling (id:23)
    { reg: 23, std: 1, type: 'mandatory_identifier', conf: 0.90, rat: 'Energy labelling requires product identification; GTIN links to EPREL energy label registry' },
    { reg: 23, std: 9, type: 'enables_compliance', conf: 0.85, rat: 'GDSN energy efficiency attributes support energy labelling data exchange' },
    { reg: 23, std: 5, type: 'enables_compliance', conf: 0.80, rat: 'GS1 Digital Link enables consumer access to EPREL energy label data via product scan' },

    // Green Claims (id:24)
    { reg: 24, std: 1, type: 'enables_compliance', conf: 0.80, rat: 'GTIN enables product-level verification of green claims as required by the directive' },
    { reg: 24, std: 9, type: 'enables_compliance', conf: 0.85, rat: 'GDSN sustainability attributes provide substantiation data for green claims' },
    { reg: 24, std: 5, type: 'enables_compliance', conf: 0.80, rat: 'GS1 Digital Link enables consumer access to green claim evidence and verification' },
    { reg: 24, std: 6, type: 'enables_compliance', conf: 0.80, rat: 'EPCIS provides supply chain evidence to substantiate green claims' },
  ];

  let inserted = 0;
  let skipped = 0;
  for (const m of mappings) {
    try {
      await sql`
        INSERT INTO regulation_standard_mappings (regulation_id, standard_id, mapping_type, confidence, rationale, created_at)
        VALUES (${m.reg}, ${m.std}, ${m.type}, ${m.conf}, ${m.rat}, NOW())
        ON CONFLICT DO NOTHING
      `;
      inserted++;
    } catch (e) {
      // Check if it's a duplicate
      if (e.code === '23505') {
        skipped++;
      } else {
        console.error(`  ✗ mapping reg:${m.reg} std:${m.std} failed:`, e.message);
      }
    }
  }
  console.log(`[MAPPINGS] Inserted: ${inserted}, Skipped (duplicates): ${skipped}`);
  console.log(`[MAPPINGS] Total regulation-standard mappings: ${mappings.length}`);
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  try {
    await createMissingTables();
    await seedRegulationStandardMappings();
    
    // Verify counts
    const rsmCount = await sql`SELECT count(*) as c FROM regulation_standard_mappings`;
    console.log(`\n[VERIFY] regulation_standard_mappings: ${rsmCount[0].c} rows`);
    
    const prodCount = await sql`SELECT count(*) as c FROM products`;
    console.log(`[VERIFY] products table exists: ${prodCount[0].c} rows`);
    
    const compCount = await sql`SELECT count(*) as c FROM companies`;
    console.log(`[VERIFY] companies table exists: ${compCount[0].c} rows`);
    
    const saCount = await sql`SELECT count(*) as c FROM safety_alerts`;
    console.log(`[VERIFY] safety_alerts table exists: ${saCount[0].c} rows`);
    
    const gpcCount = await sql`SELECT count(*) as c FROM gpc_classification`;
    console.log(`[VERIFY] gpc_classification table exists: ${gpcCount[0].c} rows`);
    
  } catch (e) {
    console.error('[FATAL]', e.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
