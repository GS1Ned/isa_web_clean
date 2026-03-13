#!/usr/bin/env node
/**
 * ISA Coverage Strengthening — Phase 2D + Phase 3
 * EUR-Lex enrichment, identifier crosswalks, provenance hardening, KPI computation.
 */
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL_POSTGRES, { ssl: { rejectUnauthorized: false } });

// ─── STEP 1: EUR-Lex Regulatory Enrichment ─────────────────────────────────────

async function enrichRegulations() {
  console.log('[EUR-LEX] Enriching regulations with CELEX identifiers and EUR-Lex URLs...');
  
  const enrichments = [
    { code: 'CSRD', celex: '32022L2464', eurlex: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022L2464', oj_ref: 'OJ L 322, 16.12.2022', entry_force: '2023-01-05', status: 'in_force' },
    { code: 'ESPR', celex: '32024R0904', eurlex: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R0904', oj_ref: 'OJ L, 2024/904, 28.6.2024', entry_force: '2024-07-18', status: 'in_force' },
    { code: 'EUDR', celex: '32023R1115', eurlex: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1115', oj_ref: 'OJ L 150, 9.6.2023', entry_force: '2023-06-29', status: 'in_force' },
    { code: 'GPSR', celex: '32023R0988', eurlex: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R0988', oj_ref: 'OJ L 135, 23.5.2023', entry_force: '2023-06-12', status: 'in_force' },
    { code: 'PPWR', celex: '32025R0040', eurlex: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32025R0040', oj_ref: 'OJ L, 2025/40', entry_force: '2025-02-11', status: 'in_force' },
    { code: 'CBAM', celex: '32023R0956', eurlex: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R0956', oj_ref: 'OJ L 130, 16.5.2023', entry_force: '2023-05-17', status: 'in_force' },
    { code: 'MDR', celex: '32017R0745', eurlex: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32017R0745', oj_ref: 'OJ L 117, 5.5.2017', entry_force: '2017-05-25', status: 'in_force' },
    { code: 'IVDR', celex: '32017R0746', eurlex: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32017R0746', oj_ref: 'OJ L 117, 5.5.2017', entry_force: '2017-05-25', status: 'in_force' },
    { code: 'FMD', celex: '32011L0062', eurlex: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32011L0062', oj_ref: 'OJ L 174, 1.7.2011', entry_force: '2011-07-21', status: 'in_force' },
    { code: 'FIC', celex: '32011R1169', eurlex: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32011R1169', oj_ref: 'OJ L 304, 22.11.2011', entry_force: '2011-12-12', status: 'in_force' },
    { code: 'REACH', celex: '32006R1907', eurlex: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32006R1907', oj_ref: 'OJ L 396, 30.12.2006', entry_force: '2007-06-01', status: 'in_force' },
    { code: 'CLP', celex: '32008R1272', eurlex: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32008R1272', oj_ref: 'OJ L 353, 31.12.2008', entry_force: '2009-01-20', status: 'in_force' },
    { code: 'BATTERY_REG', celex: '32023R1542', eurlex: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1542', oj_ref: 'OJ L 191, 28.7.2023', entry_force: '2023-08-17', status: 'in_force' },
    { code: 'CSDDD', celex: '32024L1760', eurlex: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024L1760', oj_ref: 'OJ L, 2024/1760', entry_force: '2024-07-25', status: 'in_force' },
    { code: 'SFDR', celex: '32019R2088', eurlex: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32019R2088', oj_ref: 'OJ L 317, 9.12.2019', entry_force: '2019-12-29', status: 'in_force' },
    { code: 'EU_TAXONOMY', celex: '32020R0852', eurlex: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32020R0852', oj_ref: 'OJ L 198, 22.6.2020', entry_force: '2020-07-12', status: 'in_force' },
    { code: 'WASTE_FRAMEWORK', celex: '32008L0098', eurlex: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32008L0098', oj_ref: 'OJ L 312, 22.11.2008', entry_force: '2008-12-12', status: 'in_force' },
    { code: 'WEEE', celex: '32012L0019', eurlex: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32012L0019', oj_ref: 'OJ L 197, 24.7.2012', entry_force: '2012-08-13', status: 'in_force' },
    { code: 'ROHS', celex: '32011L0065', eurlex: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32011L0065', oj_ref: 'OJ L 174, 1.7.2011', entry_force: '2011-07-21', status: 'in_force' },
    { code: 'EPREL', celex: '32017R1369', eurlex: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32017R1369', oj_ref: 'OJ L 198, 28.7.2017', entry_force: '2017-08-01', status: 'in_force' },
  ];
  
  // Add CELEX columns if missing
  await sql`ALTER TABLE regulations ADD COLUMN IF NOT EXISTS celex_id VARCHAR(20)`;
  await sql`ALTER TABLE regulations ADD COLUMN IF NOT EXISTS eurlex_url TEXT`;
  await sql`ALTER TABLE regulations ADD COLUMN IF NOT EXISTS oj_reference VARCHAR(100)`;
  await sql`ALTER TABLE regulations ADD COLUMN IF NOT EXISTS entry_into_force DATE`;
  await sql`ALTER TABLE regulations ADD COLUMN IF NOT EXISTS legal_status VARCHAR(30)`;
  
  let ok = 0;
  for (const e of enrichments) {
    try {
      const result = await sql`UPDATE regulations SET 
        celex_id = ${e.celex}, eurlex_url = ${e.eurlex}, oj_reference = ${e.oj_ref},
        entry_into_force = ${e.entry_force}, legal_status = ${e.status}
        WHERE regulation_type = ${e.code} AND (eurlex_url IS NULL OR eurlex_url = '')`;
      if (result.count > 0) ok++;
    } catch(err) { console.error(`  ✗ ${e.code}: ${err.message}`); }
  }
  console.log(`  Enriched: ${ok} regulations with CELEX/EUR-Lex data`);
}

// ─── STEP 2: Identifier Crosswalks ─────────────────────────────────────────────

async function buildCrosswalks() {
  console.log('\n[CROSSWALK] Building identifier crosswalks...');
  
  let ok = 0;
  
  // 1. Product GTIN → GPC (via categories)
  const products = await sql`SELECT id, gtin, categories FROM products WHERE gtin IS NOT NULL`;
  for (const p of products) {
    // Map product categories to GPC codes
    const cats = (p.categories || '').toLowerCase();
    let gpcCode = null;
    if (cats.includes('cheese') || cats.includes('kaas') || cats.includes('fromage')) gpcCode = '10000100';
    else if (cats.includes('bread') || cats.includes('brood') || cats.includes('pain')) gpcCode = '10000500';
    else if (cats.includes('chocolate') || cats.includes('chocolade')) gpcCode = '10000700';
    else if (cats.includes('beer') || cats.includes('bier')) gpcCode = '10000600';
    else if (cats.includes('yogurt') || cats.includes('yoghurt')) gpcCode = '10000100';
    else if (cats.includes('meat') || cats.includes('vlees')) gpcCode = '10000200';
    else if (cats.includes('fish') || cats.includes('vis')) gpcCode = '10000300';
    
    if (gpcCode) {
      try {
        await sql`INSERT INTO identifier_crosswalks (source_system, source_id, target_system, target_id, link_type, confidence)
          VALUES ('gtin', ${p.gtin}, 'gpc', ${gpcCode}, 'heuristic', 0.75)
          ON CONFLICT (source_system, source_id, target_system, target_id) DO NOTHING`;
        ok++;
      } catch(e) {}
    }
  }
  
  // 2. Company KVK → GS1 sector
  const companies = await sql`SELECT id, kvk_number, sbi_code FROM companies WHERE kvk_number IS NOT NULL`;
  for (const c of companies) {
    const sbi = c.sbi_code || '';
    let sector = null;
    if (sbi.startsWith('10') || sbi.startsWith('11') || sbi.startsWith('47')) sector = 'Levensmiddelen & Drogisterij';
    else if (sbi.startsWith('20') || sbi.startsWith('21')) sector = 'Levensmiddelen & Drogisterij';
    else if (sbi.startsWith('26') || sbi.startsWith('27') || sbi.startsWith('28')) sector = 'Techniek & Industrie';
    else if (sbi.startsWith('46')) sector = 'Cross-sector';
    else if (sbi.startsWith('47')) sector = 'Levensmiddelen & Drogisterij';
    
    if (sector) {
      try {
        await sql`INSERT INTO identifier_crosswalks (source_system, source_id, target_system, target_id, link_type, confidence)
          VALUES ('kvk', ${c.kvk_number}, 'gs1_sector', ${sector}, 'deterministic', 0.90)
          ON CONFLICT (source_system, source_id, target_system, target_id) DO NOTHING`;
        ok++;
      } catch(e) {}
    }
  }
  
  // 3. Regulation CELEX → regulation ID
  const regs = await sql`SELECT id, regulation_type, celex_id FROM regulations WHERE celex_id IS NOT NULL`;
  for (const r of regs) {
    try {
      await sql`INSERT INTO identifier_crosswalks (source_system, source_id, target_system, target_id, link_type, confidence)
        VALUES ('celex', ${r.celex_id}, 'isa_regulation', ${String(r.id)}, 'deterministic', 1.00)
        ON CONFLICT (source_system, source_id, target_system, target_id) DO NOTHING`;
      ok++;
    } catch(e) {}
  }
  
  // 4. Safety Alert → product category → GPC
  const alerts = await sql`SELECT id, alert_id, product_category FROM safety_alerts`;
  for (const a of alerts) {
    const cat = (a.product_category || '').toLowerCase();
    let gpcCode = null;
    if (cat.includes('toy')) gpcCode = '10000000'; // broad mapping
    else if (cat.includes('electrical') || cat.includes('lighting')) gpcCode = '62000000';
    else if (cat.includes('cosmetic')) gpcCode = '51000000';
    else if (cat.includes('clothing') || cat.includes('textile')) gpcCode = '53000000';
    else if (cat.includes('food')) gpcCode = '10000000';
    else if (cat.includes('motor') || cat.includes('vehicle')) gpcCode = '82000000';
    else if (cat.includes('furniture')) gpcCode = '58000000';
    
    if (gpcCode) {
      try {
        await sql`INSERT INTO identifier_crosswalks (source_system, source_id, target_system, target_id, link_type, confidence)
          VALUES ('safety_gate', ${a.alert_id}, 'gpc_segment', ${gpcCode}, 'heuristic', 0.70)
          ON CONFLICT (source_system, source_id, target_system, target_id) DO NOTHING`;
        ok++;
      } catch(e) {}
    }
  }
  
  console.log(`  Created: ${ok} crosswalks`);
}

// ─── STEP 3: KPI Computation ───────────────────────────────────────────────────

async function computeKPIs() {
  console.log('\n[KPI] Computing coverage KPIs...');
  
  // Create KPI storage table
  await sql`CREATE TABLE IF NOT EXISTS coverage_kpis (
    id SERIAL PRIMARY KEY,
    kpi_name VARCHAR(100) UNIQUE,
    kpi_value NUMERIC(10,2),
    kpi_target NUMERIC(10,2),
    kpi_unit VARCHAR(30),
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    details JSONB
  )`;
  
  // KPI 1: Entity Coverage (how many entity types have data)
  const entityTypes = ['regulations', 'gs1_standards', 'esrs_datapoints', 'products', 'companies', 'locations', 'safety_alerts', 'food_composition', 'gpc_classification', 'gs1_web_vocabulary'];
  let populated = 0;
  for (const t of entityTypes) {
    try {
      const r = await sql`SELECT count(*) as c FROM ${sql(t)}`;
      if (parseInt(r[0].c) > 0) populated++;
    } catch(e) {}
  }
  const entityCoverage = (populated / entityTypes.length * 100);
  await upsertKPI('entity_coverage_pct', entityCoverage, 100, '%', { populated, total: entityTypes.length });
  
  // KPI 2: Regulation-Standard Mapping Coverage
  const regCount = await sql`SELECT count(*) as c FROM regulations`;
  const mappedRegs = await sql`SELECT count(DISTINCT regulation_id) as c FROM regulation_standard_mappings WHERE regulation_id IS NOT NULL`;
  const regMappingPct = parseInt(regCount[0].c) > 0 ? (parseInt(mappedRegs[0].c) / parseInt(regCount[0].c) * 100) : 0;
  await upsertKPI('regulation_mapping_pct', regMappingPct, 100, '%', { mapped: mappedRegs[0].c, total: regCount[0].c });
  
  // KPI 3: ESRS-Standard Mapping Coverage
  const esrsCount = await sql`SELECT count(*) as c FROM esrs_datapoints`;
  const mappedEsrs = await sql`SELECT count(DISTINCT esrs_datapoint_id) as c FROM esrs_standard_mappings`;
  const esrsMappingPct = parseInt(esrsCount[0].c) > 0 ? (parseInt(mappedEsrs[0].c) / parseInt(esrsCount[0].c) * 100) : 0;
  await upsertKPI('esrs_mapping_pct', esrsMappingPct, 100, '%', { mapped: mappedEsrs[0].c, total: esrsCount[0].c });
  
  // KPI 4: Product GTIN Coverage
  const prodCount = await sql`SELECT count(*) as c FROM products`;
  const prodWithGtin = await sql`SELECT count(*) as c FROM products WHERE gtin IS NOT NULL AND gtin != ''`;
  const gtinPct = parseInt(prodCount[0].c) > 0 ? (parseInt(prodWithGtin[0].c) / parseInt(prodCount[0].c) * 100) : 0;
  await upsertKPI('product_gtin_coverage_pct', gtinPct, 95, '%', { with_gtin: prodWithGtin[0].c, total: prodCount[0].c });
  
  // KPI 5: GPC Sector Coverage
  const sectorCount = await sql`SELECT count(DISTINCT gs1_sector) as c FROM gpc_classification WHERE gs1_sector IS NOT NULL`;
  await upsertKPI('gpc_sector_coverage', parseInt(sectorCount[0].c), 6, 'sectors', { covered: sectorCount[0].c });
  
  // KPI 6: Crosswalk Density
  const crossCount = await sql`SELECT count(*) as c FROM identifier_crosswalks`;
  await upsertKPI('crosswalk_count', parseInt(crossCount[0].c), 500, 'links', {});
  
  // KPI 7: Source Diversity
  const sourceCount = await sql`SELECT count(DISTINCT source_system) as c FROM source_run_logs`;
  await upsertKPI('source_diversity', parseInt(sourceCount[0].c), 15, 'sources', {});
  
  // KPI 8: NL-Specific Content
  const nlAlerts = await sql`SELECT count(*) as c FROM safety_alerts WHERE notifying_country = 'NLD'`;
  const nlCompanies = await sql`SELECT count(*) as c FROM companies`;
  const nlProducts = await sql`SELECT count(*) as c FROM products WHERE target_market = 'NL'`;
  const nlTotal = parseInt(nlAlerts[0].c) + parseInt(nlCompanies[0].c) + parseInt(nlProducts[0].c);
  await upsertKPI('nl_specific_content', nlTotal, 200, 'items', { alerts: nlAlerts[0].c, companies: nlCompanies[0].c, products: nlProducts[0].c });
  
  // KPI 9: Provenance Coverage (records with trust_level set)
  const withTrust = await sql`
    SELECT 'products' as t, count(*) as c FROM products WHERE trust_level IS NOT NULL
    UNION ALL SELECT 'safety_alerts', count(*) FROM safety_alerts WHERE trust_level IS NOT NULL
    UNION ALL SELECT 'companies', count(*) FROM companies WHERE trust_level IS NOT NULL
    UNION ALL SELECT 'food_composition', count(*) FROM food_composition WHERE trust_level IS NOT NULL
  `;
  const totalWithTrust = withTrust.reduce((s, r) => s + parseInt(r.c), 0);
  await upsertKPI('provenance_coverage', totalWithTrust, 100, 'records', {});
  
  // KPI 10: Total Database Records
  const totalRecords = await sql`
    SELECT sum(c) as total FROM (
      SELECT count(*) as c FROM regulations UNION ALL
      SELECT count(*) FROM gs1_standards UNION ALL
      SELECT count(*) FROM esrs_datapoints UNION ALL
      SELECT count(*) FROM products UNION ALL
      SELECT count(*) FROM companies UNION ALL
      SELECT count(*) FROM safety_alerts UNION ALL
      SELECT count(*) FROM food_composition UNION ALL
      SELECT count(*) FROM gpc_classification UNION ALL
      SELECT count(*) FROM gs1_web_vocabulary UNION ALL
      SELECT count(*) FROM regulation_standard_mappings UNION ALL
      SELECT count(*) FROM regulation_esrs_mappings UNION ALL
      SELECT count(*) FROM esrs_standard_mappings UNION ALL
      SELECT count(*) FROM identifier_crosswalks UNION ALL
      SELECT count(*) FROM hub_news
    ) sub
  `;
  await upsertKPI('total_database_records', parseInt(totalRecords[0].total), 1000, 'records', {});
  
  // Print all KPIs
  const kpis = await sql`SELECT kpi_name, kpi_value, kpi_target, kpi_unit FROM coverage_kpis ORDER BY kpi_name`;
  console.log('\n  ┌─────────────────────────────────┬──────────┬──────────┬──────────┐');
  console.log('  │ KPI                             │ Current  │ Target   │ Unit     │');
  console.log('  ├─────────────────────────────────┼──────────┼──────────┼──────────┤');
  for (const k of kpis) {
    const name = k.kpi_name.padEnd(31);
    const val = String(k.kpi_value).padStart(8);
    const tgt = String(k.kpi_target).padStart(8);
    const unit = k.kpi_unit.padEnd(8);
    const pct = k.kpi_target > 0 ? Math.round(k.kpi_value / k.kpi_target * 100) : 0;
    const bar = pct >= 80 ? '✓' : pct >= 50 ? '◐' : '○';
    console.log(`  │ ${name} │ ${val} │ ${tgt} │ ${unit} │ ${bar} ${pct}%`);
  }
  console.log('  └─────────────────────────────────┴──────────┴──────────┴──────────┘');
}

async function upsertKPI(name, value, target, unit, details) {
  await sql`INSERT INTO coverage_kpis (kpi_name, kpi_value, kpi_target, kpi_unit, details, computed_at)
    VALUES (${name}, ${value}, ${target}, ${unit}, ${JSON.stringify(details)}, NOW())
    ON CONFLICT (kpi_name) DO UPDATE SET kpi_value=EXCLUDED.kpi_value, kpi_target=EXCLUDED.kpi_target, details=EXCLUDED.details, computed_at=NOW()`;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  try {
    await enrichRegulations();
    await buildCrosswalks();
    await computeKPIs();
    
    // Final verify
    console.log('\n[FINAL] Complete database inventory:');
    const tables = [
      'regulations', 'gs1_standards', 'esrs_datapoints', 'hub_news',
      'regulation_standard_mappings', 'regulation_esrs_mappings', 'esrs_standard_mappings',
      'gs1_web_vocabulary', 'gpc_classification',
      'products', 'companies', 'safety_alerts', 'food_composition',
      'identifier_crosswalks', 'source_run_logs', 'coverage_kpis',
    ];
    for (const t of tables) {
      try {
        const r = await sql`SELECT count(*) as c FROM ${sql(t)}`;
        console.log(`  ${parseInt(r[0].c) > 0 ? '✓' : '○'} ${t}: ${r[0].c}`);
      } catch(e) { console.log(`  ✗ ${t}: ERROR`); }
    }
    
  } catch (e) {
    console.error('[FATAL]', e.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
