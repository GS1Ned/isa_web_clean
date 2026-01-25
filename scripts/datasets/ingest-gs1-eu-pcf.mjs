/**
 * GS1 EU Carbon Footprint Attributes Ingestion Script
 * 
 * Source: GDSN Implementation Guideline for exchanging Carbon Footprint Data v1.0
 * Publisher: GS1 in Europe
 * Publication Date: Feb 2025
 * Status: Ratified
 * 
 * Ingests:
 * - 9 GDSN attributes (3 CarbonFootPrintHeader + 6 CarbonFootprintDetail)
 * - 28 code list values across 5 code lists
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load extracted data
const dataPath = join(__dirname, '../../data/standards/gs1-eu/gdsn/carbon-footprint/v1.0/gs1_eu_pcf_attributes_extracted.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

async function ingest() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    console.log('Starting GS1 EU Carbon Footprint ingestion...\n');
    
    let attributeCount = 0;
    let codeValueCount = 0;
    
    // Ingest attributes from both classes
    for (const classData of data.classes) {
      console.log(`Ingesting ${classData.className} attributes...`);
      
      for (const attr of classData.attributes) {
        // Insert attribute
        await connection.query(`
          INSERT INTO gs1_eu_carbon_footprint_attributes (
            bmsId, gdsnName, attributeName, className, definition, instruction, businessUsage,
            dataType, codeList, example, mandatory, repeatable
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            gdsnName = VALUES(gdsnName),
            attributeName = VALUES(attributeName),
            definition = VALUES(definition),
            instruction = VALUES(instruction),
            businessUsage = VALUES(businessUsage),
            dataType = VALUES(dataType),
            codeList = VALUES(codeList),
            example = VALUES(example),
            mandatory = VALUES(mandatory),
            repeatable = VALUES(repeatable),
            updatedAt = CURRENT_TIMESTAMP
        `, [
          attr.bmsId,
          attr.gdsnName,
          attr.attributeName,
          classData.className,
          attr.definition,
          attr.instruction,
          attr.businessUsage,
          attr.dataType,
          attr.codeList,
          attr.example,
          attr.mandatory,
          attr.repeatable
        ]);
        
        attributeCount++;
        
        // Insert code values if present
        if (attr.codeValues && attr.codeValues.length > 0) {
          for (let i = 0; i < attr.codeValues.length; i++) {
            const codeValue = attr.codeValues[i];
            await connection.query(`
              INSERT INTO gs1_eu_carbon_footprint_code_lists (
                codeListName, attributeBmsId, code, definition, sortOrder
              ) VALUES (?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
                definition = VALUES(definition),
                sortOrder = VALUES(sortOrder)
            `, [
              attr.codeList,
              attr.bmsId,
              codeValue.code,
              codeValue.definition,
              i + 1
            ]);
            
            codeValueCount++;
          }
        }
      }
      
      console.log(`✓ ${classData.attributes.length} ${classData.className} attributes ingested`);
    }
    
    // Verify counts
    const [attrs] = await connection.query('SELECT COUNT(*) as count FROM gs1_eu_carbon_footprint_attributes');
    const [codes] = await connection.query('SELECT COUNT(*) as count FROM gs1_eu_carbon_footprint_code_lists');
    
    console.log('\n=== Ingestion Summary ===');
    console.log(`Source: ${data.metadata.source}`);
    console.log(`Version: ${data.metadata.version} (${data.metadata.status})`);
    console.log(`Publication Date: ${data.metadata.publicationDate}`);
    console.log(`\nRecords Ingested:`);
    console.log(`- Attributes: ${attributeCount} (verified: ${attrs[0].count})`);
    console.log(`- Code Values: ${codeValueCount} (verified: ${codes[0].count})`);
    console.log(`\nTotal: ${attributeCount + codeValueCount} records`);
    
    // Show sample attributes
    const [samples] = await connection.query(`
      SELECT bmsId, gdsnName, attributeName, className, dataType
      FROM gs1_eu_carbon_footprint_attributes
      ORDER BY className, bmsId
      LIMIT 5
    `);
    
    console.log('\n=== Sample Attributes ===');
    samples.forEach(s => {
      console.log(`${s.bmsId} (${s.className}): ${s.attributeName} [${s.dataType}]`);
    });
    
  } finally {
    await connection.end();
  }
}

ingest().catch(console.error);
