#!/usr/bin/env node
/**
 * ESRS Datapoints Ingestion Script
 * 
 * Parses EFRAG IG 3 Excel workbook and populates esrs_datapoints table
 * Source: https://www.skatturinn.is/media/arsreikningaskra/EFRAG-IG-3-List-of-ESRS-Data-Points.xlsx
 * 
 * Usage: node server/ingest-esrs-datapoints.mjs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';
import ExcelJS from 'exceljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection
const connection = await mysql.createConnection(process.env.DATABASE_URL!);

const db = drizzle(connection, { schema, mode: 'default' });

/**
 * Parse ESRS datapoint from Excel row
 */
function parseDatapoint(row, esrsStandard) {
  // ExcelJS row.values is a sparse array starting at index 1
  // Structure: [empty, ID, ESRS, DR, Paragraph, Related AR, Name, Data Type, Conditional, May [V], Appendix B, ...]
  const datapointId = row.getCell(1).value;
  const disclosureRequirement = row.getCell(3).value;
  const paragraph = row.getCell(4).value;
  const relatedAr = row.getCell(5).value;
  const nameCell = row.getCell(6).value;
  const dataType = row.getCell(7).value;
  const conditionalOrAlternative = row.getCell(8).value;
  const voluntary = row.getCell(9).value;
  const sfdrPillar3 = row.getCell(10).value;

  // Skip header rows and empty rows
  if (!datapointId || typeof datapointId !== 'string' || datapointId.includes('ID') || datapointId.includes('INSTRUCTIONS')) {
    return null;
  }

  // Handle hyperlink objects in name field
  const name = typeof nameCell === 'object' && nameCell?.text ? nameCell.text : nameCell;

  return {
    datapointId: datapointId.trim(),
    esrsStandard: esrsStandard,
    disclosureRequirement: disclosureRequirement?.toString().trim() || null,
    paragraph: paragraph?.toString().trim() || null,
    relatedAr: relatedAr?.toString().trim() || null,
    name: name?.toString().trim() || '',
    dataType: dataType?.toString().trim() || null,
    conditionalOrAlternative: conditionalOrAlternative?.toString().trim() || null,
    voluntary: voluntary ? true : false,
    sfdrPillar3: sfdrPillar3 ? true : false,
  };
}

/**
 * Ingest datapoints from all ESRS sheets
 */
async function ingestESRSDatapoints() {
  console.log('[ESRS Ingestion] Starting EFRAG IG 3 datapoints ingestion...\n');

  const excelPath = join(dirname(__dirname), 'efrag_ig3_datapoints.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);

  // Sheet names to process (skip Index sheet)
  const sheetNames = [
    'ESRS 2',
    'ESRS 2 MDR',
    'ESRS E1',
    'ESRS E2',
    'ESRS E3',
    'ESRS E4',
    'ESRS E5',
    'ESRS S1',
    'ESRS S2',
    'ESRS S3',
    'ESRS S4',
    'ESRS G1',
  ];

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const sheetName of sheetNames) {
    const worksheet = workbook.getWorksheet(sheetName);
    if (!worksheet) {
      console.log(`[ESRS Ingestion] ⚠️  Sheet "${sheetName}" not found, skipping...`);
      continue;
    }

    console.log(`[ESRS Ingestion] Processing sheet: ${sheetName}`);
    let sheetInserted = 0;
    let sheetSkipped = 0;

    // Iterate through rows (skip first 2 rows - instructions and headers)
    const rows = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 2) return; // Skip instructions and header
      rows.push(row);
    });

    for (const row of rows) {
      const datapoint = parseDatapoint(row, sheetName);
      if (!datapoint) {
        sheetSkipped++;
        continue;
      }
      
      // Debug first datapoint
      if (sheetInserted === 0 && sheetSkipped === 0) {
        console.log(`[DEBUG] First datapoint: ${JSON.stringify(datapoint, null, 2)}`);
      }

      try {
        // Insert into database
        await db.insert(schema.esrsDatapoints).values(datapoint).execute();
        sheetInserted++;
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          // Duplicate entry, skip silently
          sheetSkipped++;
        } else {
          console.error(`[ESRS Ingestion] ❌ Error inserting ${datapoint.datapointId}:`, error.message);
          sheetSkipped++;
        }
      }
    }

    console.log(`[ESRS Ingestion]   ✅ ${sheetName}: ${sheetInserted} inserted, ${sheetSkipped} skipped\n`);
    totalInserted += sheetInserted;
    totalSkipped += sheetSkipped;
  }

  console.log(`[ESRS Ingestion] ✅ Ingestion complete!`);
  console.log(`[ESRS Ingestion]   Total inserted: ${totalInserted}`);
  console.log(`[ESRS Ingestion]   Total skipped: ${totalSkipped}`);
  console.log(`[ESRS Ingestion]   Total processed: ${totalInserted + totalSkipped}\n`);

  await connection.end();
}

// Run ingestion
ingestESRSDatapoints().catch((error) => {
  console.error('[ESRS Ingestion] ❌ Fatal error:', error);
  process.exit(1);
});
