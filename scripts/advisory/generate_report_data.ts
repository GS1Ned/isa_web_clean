/**
 * Extract data from ISA database for advisory report generation
 */

import { db } from '../../server/db.js';
import { esrsDatapoints, gs1Attributes, dppRules, gs1Standards } from '../../drizzle/schema.js';
import { like, or, sql } from 'drizzle-orm';
import * as fs from 'fs';

async function main() {
  console.log('=== Extracting Data for ISA Advisory Report ===\n');

  // 1. Extract product-relevant ESRS datapoints
  console.log('1. ESRS Datapoints (Product/Supply-Chain Relevant)');
  const productKeywords = [
    '%product%', '%material%', '%packaging%', '%supply%', '%chain%',
    '%waste%', '%recycl%', '%circular%', '%emission%', '%footprint%',
    '%traceability%', '%origin%', '%composition%', '%substance%'
  ];

  const esrsData = await db
    .select({
      code: esrsDatapoints.code,
      standard: esrsDatapoints.esrsStandard,
      dr: esrsDatapoints.disclosureRequirement,
      name: esrsDatapoints.name,
      dataType: esrsDatapoints.dataType,
      conditional: esrsDatapoints.conditional,
      voluntary: esrsDatapoints.voluntary,
    })
    .from(esrsDatapoints)
    .where(
      or(
        ...productKeywords.map(kw => like(esrsDatapoints.name, kw))
      )
    )
    .limit(200);

  console.log(`   Found: ${esrsData.length} datapoints`);

  // Group by standard
  const byStandard: Record<string, typeof esrsData> = {};
  for (const dp of esrsData) {
    const std = dp.standard || 'Unknown';
    if (!byStandard[std]) byStandard[std] = [];
    byStandard[std].push(dp);
  }

  for (const [std, dps] of Object.entries(byStandard)) {
    console.log(`   - ${std}: ${dps.length} datapoints`);
  }

  // 2. Extract GS1 NL attributes by sector
  console.log('\n2. GS1 NL/Benelux Attributes by Sector');
  
  const gs1Data = await db
    .select({
      code: gs1Attributes.attributeCode,
      name: gs1Attributes.attributeName,
      sector: gs1Attributes.sector,
      definition: gs1Attributes.definition,
      format: gs1Attributes.format,
      esgRelevant: gs1Attributes.esgRelevant,
    })
    .from(gs1Attributes)
    .limit(5000);

  console.log(`   Total attributes: ${gs1Data.length}`);

  // Group by sector
  const bySector: Record<string, typeof gs1Data> = {};
  for (const attr of gs1Data) {
    const sector = attr.sector || 'Unknown';
    if (!bySector[sector]) bySector[sector] = [];
    bySector[sector].push(attr);
  }

  for (const [sector, attrs] of Object.entries(bySector)) {
    const esgCount = attrs.filter(a => a.esgRelevant).length;
    console.log(`   - ${sector}: ${attrs.length} attributes (${esgCount} ESG-relevant)`);
  }

  // 3. Extract DPP rules
  console.log('\n3. EU Digital Product Passport Rules');
  
  const dppData = await db
    .select({
      ruleId: dppRules.ruleId,
      category: dppRules.productCategory,
      identifierType: dppRules.identifierType,
      mandatory: dppRules.mandatory,
      description: dppRules.description,
    })
    .from(dppRules);

  console.log(`   Total rules: ${dppData.length}`);

  // 4. Extract GS1 CTEs/KDEs
  console.log('\n4. GS1 CTEs and KDEs');
  
  const gs1Stds = await db
    .select({
      code: gs1Standards.standardCode,
      name: gs1Standards.standardName,
      category: gs1Standards.category,
    })
    .from(gs1Standards);

  console.log(`   Total standards: ${gs1Stds.length}`);

  // 5. Perform basic mapping analysis
  console.log('\n5. Mapping Analysis');
  
  // Identify potential mappings based on keyword overlap
  const mappings: Array<{
    esrsCode: string;
    esrsName: string;
    gs1Code: string;
    gs1Name: string;
    sector: string;
    confidence: 'direct' | 'partial' | 'missing';
  }> = [];

  // Simple keyword-based matching
  for (const esrs of esrsData.slice(0, 50)) { // Top 50 for report
    const esrsKeywords = esrs.name.toLowerCase().split(/\s+/);
    
    for (const gs1 of gs1Data) {
      const gs1Keywords = (gs1.name || '').toLowerCase().split(/\s+/);
      const overlap = esrsKeywords.filter(k => gs1Keywords.some(gk => gk.includes(k) || k.includes(gk)));
      
      if (overlap.length >= 2) {
        mappings.push({
          esrsCode: esrs.code,
          esrsName: esrs.name,
          gs1Code: gs1.code || '',
          gs1Name: gs1.name || '',
          sector: gs1.sector || 'Unknown',
          confidence: overlap.length >= 3 ? 'direct' : 'partial',
        });
      }
    }
  }

  console.log(`   Found ${mappings.length} potential mappings`);
  console.log(`   - Direct: ${mappings.filter(m => m.confidence === 'direct').length}`);
  console.log(`   - Partial: ${mappings.filter(m => m.confidence === 'partial').length}`);

  // 6. Save results
  const output = {
    metadata: {
      generated: new Date().toISOString(),
      registryVersion: '1.0.0',
      datasetIds: [
        'esrs.datapoints.ig3',
        'gs1nl.benelux.diy_garden_pet.v3.1.33',
        'gs1nl.benelux.fmcg.v3.1.33.5',
        'gs1nl.benelux.healthcare.v3.1.33',
        'eu.dpp.identification_rules',
        'gs1.ctes_kdes',
      ],
    },
    esrs: {
      total: esrsData.length,
      byStandard,
      datapoints: esrsData.slice(0, 100), // Top 100 for report
    },
    gs1nl: {
      total: gs1Data.length,
      bySector,
      esgRelevantCount: gs1Data.filter(a => a.esgRelevant).length,
    },
    dpp: {
      total: dppData.length,
      rules: dppData,
    },
    gs1Standards: {
      total: gs1Stds.length,
      standards: gs1Stds,
    },
    mappings: {
      total: mappings.length,
      direct: mappings.filter(m => m.confidence === 'direct').length,
      partial: mappings.filter(m => m.confidence === 'partial').length,
      samples: mappings.slice(0, 50), // Top 50 for report
    },
  };

  fs.writeFileSync(
    '/home/ubuntu/isa_web/scripts/advisory/report_data.json',
    JSON.stringify(output, null, 2)
  );

  console.log('\n✅ Data extraction complete');
  console.log('   Output: scripts/advisory/report_data.json');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
