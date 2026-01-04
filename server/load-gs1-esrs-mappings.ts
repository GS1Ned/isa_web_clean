/**
 * Load GS1-ESRS Mappings into Database
 * 
 * Source: GS1 Europe CSRD White Paper v1.0 (March 2025)
 * Authority: GS1 in Europe (Rank 2 - Official standards body)
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './db.js';
import { sql } from 'drizzle-orm';
import { serverLogger } from "./_core/logger-wiring";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface GS1EsrsMapping {
  mapping_id: number;
  level: 'product' | 'company';
  esrs_standard: string;
  esrs_topic: string;
  data_point_name: string;
  short_name: string;
  definition: string;
  gs1_relevance: string;
}

async function loadGS1EsrsMappings() {
  console.log('Loading GS1-ESRS mappings from white paper...');
  
  const db = await getDb();
  if (!db) {
    throw new Error('Database connection failed');
  }
  
  // Read mappings JSON
  const mappingsPath = join(__dirname, '../../isa_resources/gs1_europe_csrd/gs1_esrs_mappings.json');
  const mappingsJson = readFileSync(mappingsPath, 'utf-8');
  const mappings: GS1EsrsMapping[] = JSON.parse(mappingsJson);
  
  console.log(`Found ${mappings.length} GS1-ESRS mappings to load`);
  
  let loaded = 0;
  let skipped = 0;
  
  for (const mapping of mappings) {
    try {
      await db.execute(sql`
        INSERT INTO gs1_esrs_mappings (
          mapping_id,
          level,
          esrs_standard,
          esrs_topic,
          data_point_name,
          short_name,
          definition,
          gs1_relevance,
          source_document,
          source_date,
          source_authority
        ) VALUES (
          ${mapping.mapping_id},
          ${mapping.level},
          ${mapping.esrs_standard},
          ${mapping.esrs_topic},
          ${mapping.data_point_name},
          ${mapping.short_name},
          ${mapping.definition},
          ${mapping.gs1_relevance},
          'GS1 Europe CSRD White Paper v1.0',
          '2025-03-21',
          'GS1 in Europe'
        )
        ON DUPLICATE KEY UPDATE
          level = VALUES(level),
          esrs_standard = VALUES(esrs_standard),
          esrs_topic = VALUES(esrs_topic),
          data_point_name = VALUES(data_point_name),
          short_name = VALUES(short_name),
          definition = VALUES(definition),
          gs1_relevance = VALUES(gs1_relevance),
          updated_at = CURRENT_TIMESTAMP
      `);
      
      loaded++;
      console.log(`✓ Loaded mapping ${mapping.mapping_id}: ${mapping.short_name}`);
    } catch (error) {
      serverLogger.error(`✗ Failed to load mapping ${mapping.mapping_id}:`, error);
      skipped++;
    }
  }
  
  console.log(`\nLoading complete:`);
  console.log(`  Loaded: ${loaded}/${mappings.length}`);
  console.log(`  Skipped: ${skipped}/${mappings.length}`);
  
  // Verify count
  const result = await db.execute(sql`SELECT COUNT(*) as count FROM gs1_esrs_mappings`);
  const count = (result[0] as any)[0].count;
  console.log(`\nTotal mappings in database: ${count}`);
  
  process.exit(0);
}

loadGS1EsrsMappings().catch((error) => {
  serverLogger.error('Fatal error:', error);
  process.exit(1);
});
