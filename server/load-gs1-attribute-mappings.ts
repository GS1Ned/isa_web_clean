/**
 * Load GS1 Attribute to ESRS Mappings
 * 
 * Populates the gs1_attribute_esrs_mapping table with initial mappings
 * based on GS1 Europe CSRD White Paper analysis and GS1 WebVoc attributes.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './db.js';
import { sql } from 'drizzle-orm';
import { serverLogger } from "./_core/logger-wiring";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface GS1AttributeMapping {
  gs1_attribute_id: string;
  gs1_attribute_name: string;
  esrs_mapping_id: number;
  mapping_type: 'direct' | 'calculated' | 'aggregated';
  mapping_notes: string;
  confidence: 'high' | 'medium' | 'low';
}

async function loadGS1AttributeMappings() {
  console.log('Loading GS1 attribute to ESRS mappings...');
  
  const db = await getDb();
  if (!db) {
    throw new Error('Database connection failed');
  }
  
  // First, create the table if it doesn't exist
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS gs1_attribute_esrs_mapping (
      id INT AUTO_INCREMENT PRIMARY KEY,
      gs1_attribute_id VARCHAR(255) NOT NULL,
      gs1_attribute_name VARCHAR(255) NOT NULL,
      esrs_mapping_id INT NOT NULL,
      mapping_type ENUM('direct', 'calculated', 'aggregated') NOT NULL,
      mapping_notes TEXT,
      confidence ENUM('high', 'medium', 'low') NOT NULL,
      validated_by VARCHAR(255),
      validated_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_gs1_attr (gs1_attribute_id),
      INDEX idx_esrs_mapping (esrs_mapping_id),
      INDEX idx_confidence (confidence)
    )
  `);
  
  console.log('✓ Table gs1_attribute_esrs_mapping created/verified');
  
  // Read mappings JSON
  const mappingsPath = join(__dirname, '../../isa_resources/gs1_attribute_esrs_initial_mappings.json');
  const mappingsJson = readFileSync(mappingsPath, 'utf-8');
  const mappings: GS1AttributeMapping[] = JSON.parse(mappingsJson);
  
  console.log(`Found ${mappings.length} GS1 attribute mappings to load`);
  
  let loaded = 0;
  let skipped = 0;
  
  for (const mapping of mappings) {
    try {
      await db.execute(sql`
        INSERT INTO gs1_attribute_esrs_mapping (
          gs1_attribute_id,
          gs1_attribute_name,
          esrs_mapping_id,
          mapping_type,
          mapping_notes,
          confidence
        ) VALUES (
          ${mapping.gs1_attribute_id},
          ${mapping.gs1_attribute_name},
          ${mapping.esrs_mapping_id},
          ${mapping.mapping_type},
          ${mapping.mapping_notes},
          ${mapping.confidence}
        )
      `);
      
      loaded++;
      console.log(`✓ Loaded: ${mapping.gs1_attribute_name} → ESRS mapping ${mapping.esrs_mapping_id} (${mapping.confidence} confidence)`);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log(`⊘ Skipped duplicate: ${mapping.gs1_attribute_name} → ESRS mapping ${mapping.esrs_mapping_id}`);
        skipped++;
      } else {
        serverLogger.error(`✗ Failed to load ${mapping.gs1_attribute_name}:`, error.message);
        skipped++;
      }
    }
  }
  
  console.log(`\nLoading complete:`);
  console.log(`  Loaded: ${loaded}/${mappings.length}`);
  console.log(`  Skipped: ${skipped}/${mappings.length}`);
  
  // Verify count
  const result = await db.execute(sql`SELECT COUNT(*) as count FROM gs1_attribute_esrs_mapping`);
  const count = (result[0] as any)[0].count;
  console.log(`\nTotal attribute mappings in database: ${count}`);
  
  // Show summary by confidence level
  const confidenceResult = await db.execute(sql`
    SELECT confidence, COUNT(*) as count 
    FROM gs1_attribute_esrs_mapping 
    GROUP BY confidence 
    ORDER BY FIELD(confidence, 'high', 'medium', 'low')
  `);
  
  console.log(`\nMappings by confidence level:`);
  const confidenceRows = confidenceResult[0] as any;
  if (Array.isArray(confidenceRows)) {
    for (const row of confidenceRows) {
      console.log(`  ${row.confidence}: ${row.count}`);
    }
  }
  
  process.exit(0);
}

loadGS1AttributeMappings().catch((error) => {
  serverLogger.error('Fatal error:', error);
  process.exit(1);
});
