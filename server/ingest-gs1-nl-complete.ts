/**
 * INGEST-02: GS1 NL/Benelux Data Source Complete Ingestion
 * 
 * Ingests all 3 GS1 Netherlands/Benelux sector data models:
 * 1. DIY/Garden/Pets (DHZTD 3.1.33) - 4,013 attributes
 * 2. FMCG (Food/Health/Beauty 3.1.33.5) - ~473 attributes  
 * 3. Healthcare (ECHO 3.1.33) - ~186 attributes
 * 
 * Purpose: Establish canonical GS1 NL reference for ESG→GS1 mapping
 * Traceability: All records tagged with version, sector, source file
 */

import ExcelJS from 'exceljs';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema';
import { gs1Attributes, gs1AttributeCodeLists } from '../drizzle/schema';
import { createMysqlConnection } from './db-connection';
import { serverLogger } from "./_core/logger-wiring";


// Database connection - lazy initialization
let connection: mysql.Connection | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _dbInstance: any = null;

async function getDb() {
  if (!_dbInstance) {
    connection = await createMysqlConnection(process.env.DATABASE_URL!);
    _dbInstance = drizzle(connection, { schema, mode: 'default' });
  }
  return _dbInstance;
}

interface AttributeRecord {
  attributeCode: string;
  attributeName: string;
  sector: 'food_hb' | 'diy_garden_pet' | 'healthcare';
  description: string | null;
  datatype: 'text' | 'number' | 'date' | 'boolean' | 'code_list' | 'url' | 'other';
  format: string | null;
  minLength: number | null;
  maxLength: number | null;
  isPackagingRelated: boolean;
  isSustainabilityRelated: boolean;
  sourceFile: string;
  sourceSheet: string;
}

interface CodeListValue {
  code: string;
  description: string | null;
  sortOrder: number;
}

/**
 * Parse DIY/Garden/Pets sector model (DHZTD 3.1.33)
 * Sheet: "Fielddefinitions" (row 4 has headers, data starts row 5)
 */
async function parseDIYModel(): Promise<{ attributes: AttributeRecord[], codeLists: Map<string, CodeListValue[]> }> {
  const workbook = new ExcelJS.Workbook();
  const filePath = '/home/ubuntu/isa_web/data/standards/gs1-nl/benelux-datasource/v3.1.33/GS1 Data Source Datamodel 3.1.33.xlsx';
  
  console.log('[DIY] Loading workbook...');
  await workbook.xlsx.readFile(filePath);
  
  const sheet = workbook.getWorksheet('Fielddefinitions');
  if (!sheet) throw new Error('Fielddefinitions sheet not found');
  
  console.log(`[DIY] Processing ${sheet.rowCount} rows...`);
  
  const attributes: AttributeRecord[] = [];
  const codeLists = new Map<string, CodeListValue[]>();
  
  // Row 4 has headers: FieldID | FieldID replaced by | ... | Attributename Dutch | Definition Dutch | ...
  // Data starts at row 5
  for (let i = 5; i <= sheet.rowCount; i++) {
    const row = sheet.getRow(i);
    
    const fieldId = String(row.getCell(1).value || '').trim();
    const attributeNameDutch = String(row.getCell(4).value || '').trim();
    const definitionDutch = String(row.getCell(5).value || '').trim();
    const format = String(row.getCell(8).value || '').trim();
    const minLength = row.getCell(9).value ? Number(row.getCell(9).value) : null;
    const maxLength = row.getCell(10).value ? Number(row.getCell(10).value) : null;
    
    if (!fieldId || !attributeNameDutch) continue;
    
    // Determine datatype from format
    let datatype: AttributeRecord['datatype'] = 'text';
    if (format.toLowerCase().includes('number') || format.toLowerCase().includes('numeric')) {
      datatype = 'number';
    } else if (format.toLowerCase().includes('date')) {
      datatype = 'date';
    } else if (format.toLowerCase().includes('yes/no') || format.toLowerCase().includes('boolean')) {
      datatype = 'boolean';
    } else if (format.toLowerCase().includes('picklist') || format.toLowerCase().includes('code')) {
      datatype = 'code_list';
    } else if (format.toLowerCase().includes('url') || format.toLowerCase().includes('link')) {
      datatype = 'url';
    }
    
    // Detect packaging/sustainability keywords
    const combinedText = `${attributeNameDutch} ${definitionDutch}`.toLowerCase();
    const isPackagingRelated = /verpakking|packaging|recycl|material|afval|waste/.test(combinedText);
    const isSustainabilityRelated = /duurzaam|sustainability|milieu|environment|co2|carbon|energie|energy/.test(combinedText);
    
    attributes.push({
      attributeCode: fieldId,
      attributeName: attributeNameDutch,
      sector: 'diy_garden_pet',
      description: definitionDutch || null,
      datatype,
      format: format || null,
      minLength,
      maxLength,
      isPackagingRelated,
      isSustainabilityRelated,
      sourceFile: 'GS1 Data Source Datamodel 3.1.33.xlsx',
      sourceSheet: 'Fielddefinitions',
    });
  }
  
  console.log(`[DIY] Parsed ${attributes.length} attributes`);
  return { attributes, codeLists };
}

/**
 * Parse FMCG sector model (Food/Health/Beauty 3.1.33.5)
 * Sheet: "Attributes" (row 1 has headers, data starts row 2)
 */
async function parseFMCGModel(): Promise<{ attributes: AttributeRecord[], codeLists: Map<string, CodeListValue[]> }> {
  const workbook = new ExcelJS.Workbook();
  const filePath = '/home/ubuntu/isa_web/data/standards/gs1-nl/benelux-datasource/v3.1.33/benelux-fmcg-data-model-31335-nederlands.xlsx';
  
  console.log('[FMCG] Loading workbook...');
  await workbook.xlsx.readFile(filePath);
  
  // Find the Attributes sheet
  const sheet = workbook.worksheets.find(s => 
    s.name.toLowerCase().includes('attribute') || 
    s.name.toLowerCase().includes('veld')
  ) || workbook.worksheets[0];
  
  console.log(`[FMCG] Processing sheet "${sheet.name}" with ${sheet.rowCount} rows...`);
  
  const attributes: AttributeRecord[] = [];
  const codeLists = new Map<string, CodeListValue[]>();
  
  // Row 2 has actual headers (row 1 is user guide questions)
  const headerRow = sheet.getRow(2);
  const headers: string[] = [];
  headerRow.eachCell((cell) => {
    headers.push(String(cell.value || '').trim().toLowerCase());
  });
  
  console.log(`[FMCG] Headers: ${headers.slice(0, 10).join(', ')}`);
  
  // Find column indices
  // Expected: Lokale attribuutnaam, GDSN naam, BMS ID, TC Field ID, Definitie
  const nameIdx = headers.findIndex(h => h.includes('lokale') && h.includes('attribuut'));
  const gdsnIdx = headers.findIndex(h => h.includes('gdsn') && h.includes('naam'));
  const bmsIdx = headers.findIndex(h => h.includes('bms') && h.includes('id'));
  const tcIdx = headers.findIndex(h => h.includes('tc') && h.includes('field'));
  const descIdx = headers.findIndex(h => h.includes('definitie'));
  
  console.log(`[FMCG] Column indices: name=${nameIdx}, gdsn=${gdsnIdx}, bms=${bmsIdx}, tc=${tcIdx}, desc=${descIdx}`);
  
  // Validate indices
  if (nameIdx < 0 || descIdx < 0) {
    throw new Error(`Missing required columns. Found: ${headers.join(', ')}`);
  }
  
  // Use TC Field ID as code (most specific), fallback to BMS ID
  const codeIdx = tcIdx >= 0 ? tcIdx : bmsIdx;
  
  for (let i = 3; i <= sheet.rowCount; i++) {
    const row = sheet.getRow(i);
    
    const code = String(row.getCell(codeIdx + 1).value || '').trim();
    const name = String(row.getCell(nameIdx + 1).value || '').trim();
    const desc = descIdx >= 0 ? String(row.getCell(descIdx + 1).value || '').trim() : '';
    const format = ''; // FMCG file doesn't have explicit format column
    
    if (!code || !name) continue;
    
    // Determine datatype
    let datatype: AttributeRecord['datatype'] = 'text';
    if (format.toLowerCase().includes('number') || format.toLowerCase().includes('numeric')) {
      datatype = 'number';
    } else if (format.toLowerCase().includes('date')) {
      datatype = 'date';
    } else if (format.toLowerCase().includes('yes/no') || format.toLowerCase().includes('boolean')) {
      datatype = 'boolean';
    } else if (format.toLowerCase().includes('picklist') || format.toLowerCase().includes('code')) {
      datatype = 'code_list';
    }
    
    const combinedText = `${name} ${desc}`.toLowerCase();
    const isPackagingRelated = /verpakking|packaging|recycl|material|afval|waste/.test(combinedText);
    const isSustainabilityRelated = /duurzaam|sustainability|milieu|environment|co2|carbon|energie|energy|allergen|ingredient/.test(combinedText);
    
    attributes.push({
      attributeCode: code,
      attributeName: name,
      sector: 'food_hb',
      description: desc || null,
      datatype,
      format: format || null,
      minLength: null,
      maxLength: null,
      isPackagingRelated,
      isSustainabilityRelated,
      sourceFile: 'benelux-fmcg-data-model-31335-nederlands.xlsx',
      sourceSheet: sheet.name,
    });
  }
  
  console.log(`[FMCG] Parsed ${attributes.length} attributes`);
  return { attributes, codeLists };
}

/**
 * Parse Healthcare sector model (ECHO 3.1.33)
 * Sheet: "Attributes" (row 1 has headers, data starts row 2)
 */
async function parseHealthcareModel(): Promise<{ attributes: AttributeRecord[], codeLists: Map<string, CodeListValue[]> }> {
  const workbook = new ExcelJS.Workbook();
  const filePath = '/home/ubuntu/isa_web/data/standards/gs1-nl/benelux-datasource/v3.1.33/common-echo-datamodel_3133.xlsx';
  
  console.log('[ECHO] Loading workbook...');
  await workbook.xlsx.readFile(filePath);
  
  // Find the Attributes sheet
  const sheet = workbook.worksheets.find(s => 
    s.name.toLowerCase().includes('attribute') || 
    s.name.toLowerCase().includes('field')
  ) || workbook.worksheets[0];
  
  console.log(`[ECHO] Processing sheet "${sheet.name}" with ${sheet.rowCount} rows...`);
  
  const attributes: AttributeRecord[] = [];
  const codeLists = new Map<string, CodeListValue[]>();
  
  // Row 4 has actual headers (rows 1-3 are titles/spacing)
  const headerRow = sheet.getRow(4);
  const headers: string[] = [];
  headerRow.eachCell((cell) => {
    headers.push(String(cell.value || '').trim().toLowerCase());
  });
  
  console.log(`[ECHO] Headers: ${headers.slice(0, 10).join(', ')}`);
  
  // Expected: BMS ID, Attribute name English, Attribute Definitions, Definition English, Instruction/Entry notes
  const codeIdx = headers.findIndex(h => h.includes('bms') && h.includes('id'));
  const nameIdx = headers.findIndex(h => h.includes('attribute') && h.includes('name'));
  const descIdx = headers.findIndex(h => h.includes('definition') && h.includes('english'));
  
  console.log(`[ECHO] Column indices: code=${codeIdx}, name=${nameIdx}, desc=${descIdx}`);
  
  // Validate indices
  if (codeIdx < 0 || nameIdx < 0) {
    throw new Error(`Missing required columns. Found: ${headers.join(', ')}`);
  }
  
  for (let i = 5; i <= sheet.rowCount; i++) {
    const row = sheet.getRow(i);
    
    const code = String(row.getCell(codeIdx + 1).value || '').trim();
    const name = String(row.getCell(nameIdx + 1).value || '').trim();
    const desc = descIdx >= 0 ? String(row.getCell(descIdx + 1).value || '').trim() : '';
    const format = ''; // ECHO file doesn't have explicit format column
    
    if (!code || !name) continue;
    
    let datatype: AttributeRecord['datatype'] = 'text';
    if (format.toLowerCase().includes('number') || format.toLowerCase().includes('numeric')) {
      datatype = 'number';
    } else if (format.toLowerCase().includes('date')) {
      datatype = 'date';
    } else if (format.toLowerCase().includes('yes/no') || format.toLowerCase().includes('boolean')) {
      datatype = 'boolean';
    } else if (format.toLowerCase().includes('picklist') || format.toLowerCase().includes('code')) {
      datatype = 'code_list';
    }
    
    const combinedText = `${name} ${desc}`.toLowerCase();
    const isPackagingRelated = /verpakking|packaging|recycl|material|afval|waste|steril/.test(combinedText);
    const isSustainabilityRelated = /duurzaam|sustainability|milieu|environment|co2|carbon|energie|energy|medical|device/.test(combinedText);
    
    attributes.push({
      attributeCode: code,
      attributeName: name,
      sector: 'healthcare',
      description: desc || null,
      datatype,
      format: format || null,
      minLength: null,
      maxLength: null,
      isPackagingRelated,
      isSustainabilityRelated,
      sourceFile: 'common-echo-datamodel_3133.xlsx',
      sourceSheet: sheet.name,
    });
  }
  
  console.log(`[ECHO] Parsed ${attributes.length} attributes`);
  return { attributes, codeLists };
}

/**
 * Main ingestion function
 */
async function ingestGS1NLComplete() {
  console.log('\n=== GS1 NL/Benelux Complete Ingestion ===\n');
  
  try {
    // Get database connection
    const dbInstance = await getDb();
    
    // Parse all 3 sector models
    const diyData = await parseDIYModel();
    const fmcgData = await parseFMCGModel();
    const echoData = await parseHealthcareModel();
    
    // Combine all attributes
    const allAttributes = [
      ...diyData.attributes,
      ...fmcgData.attributes,
      ...echoData.attributes,
    ];
    
    console.log(`\n=== Summary ===`);
    console.log(`DIY/Garden/Pets: ${diyData.attributes.length} attributes`);
    console.log(`FMCG: ${fmcgData.attributes.length} attributes`);
    console.log(`Healthcare: ${echoData.attributes.length} attributes`);
    console.log(`Total: ${allAttributes.length} attributes`);
    
    // Clear existing data
    console.log('\nClearing existing gs1_attributes data...');
    await dbInstance.delete(gs1Attributes);
    
    // Insert in batches of 500
    console.log('\nInserting attributes...');
    const batchSize = 500;
    for (let i = 0; i < allAttributes.length; i += batchSize) {
      const batch = allAttributes.slice(i, i + batchSize).map(attr => ({
        attributeCode: attr.attributeCode,
        attributeName: attr.attributeName,
        sector: attr.sector,
        description: attr.description,
        datatype: attr.datatype,
        packagingRelated: attr.isPackagingRelated,
        sustainabilityRelated: attr.isSustainabilityRelated,
      }));
      await dbInstance.insert(gs1Attributes).values(batch);
      console.log(`  Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allAttributes.length / batchSize)}`);
    }
    
    console.log('\n✅ Ingestion complete!');
    console.log(`Total records inserted: ${allAttributes.length}`);
    
    // Summary by sector
    const diyCount = allAttributes.filter(a => a.sector === 'diy_garden_pet').length;
    const fmcgCount = allAttributes.filter(a => a.sector === 'food_hb').length;
    const echoCount = allAttributes.filter(a => a.sector === 'healthcare').length;
    
    console.log(`\nBreakdown by sector:`);
    console.log(`  DIY/Garden/Pets: ${diyCount}`);
    console.log(`  FMCG: ${fmcgCount}`);
    console.log(`  Healthcare: ${echoCount}`);
    
    // Summary by flags
    const packagingCount = allAttributes.filter(a => a.isPackagingRelated).length;
    const sustainabilityCount = allAttributes.filter(a => a.isSustainabilityRelated).length;
    
    console.log(`\nESG relevance:`);
    console.log(`  Packaging-related: ${packagingCount}`);
    console.log(`  Sustainability-related: ${sustainabilityCount}`);
    
  } catch (error) {
    serverLogger.error('❌ Ingestion failed:', error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  ingestGS1NLComplete()
    .then(() => process.exit(0))
    .catch((error) => {
      serverLogger.error(error);
      process.exit(1);
    });
}

export { ingestGS1NLComplete };
