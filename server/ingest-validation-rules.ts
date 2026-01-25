/**
 * INGEST-03: GS1 NL/Benelux Validation Rules Ingestion
 * 
 * Ingests validation rules and local code lists from:
 * - BeNeLux Validations sheet (860 rules)
 * - LCL Code Lists sheet (1,954 entries)
 * 
 * Purpose: Add data quality constraints to GS1 NL attribute catalog
 * Traceability: All rules tagged with version, type, and change tracking
 */

import ExcelJS from 'exceljs';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema';
import { gs1ValidationRules, gs1LocalCodeLists } from '../drizzle/schema';
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

interface ValidationRuleRecord {
  ruleId: string;
  ruleIdBelu: string | null;
  ruleType: 'benelux' | 'gdsn' | 'local';
  errorMessageDutch: string | null;
  errorMessageEnglish: string | null;
  severity: 'error' | 'warning' | 'info';
  targetMarkets: string | null; // JSON string
  targetSectors: string | null; // JSON string
  affectedAttributes: string | null; // JSON string
  validationLogic: string | null;
  addedInVersion: string | null;
  changeType: 'new' | 'technical' | 'textual' | 'delete' | null;
  isActive: number;
}

interface CodeListRecord {
  validationRuleId: string;
  codeListName: string;
  codeValue: string;
  codeDescription: string | null;
  codeListSegment: string | null;
  addedInVersion: string | null;
  isActive: number;
}

/**
 * Parse BeNeLux Validations sheet
 * Row 4: Headers
 * Row 5+: Data
 */
async function parseBeNeLuxValidations(workbook: ExcelJS.Workbook): Promise<ValidationRuleRecord[]> {
  const sheet = workbook.getWorksheet('BeNeLux Validations');
  if (!sheet) throw new Error('BeNeLux Validations sheet not found');
  
  serverLogger.info('[BeNeLux] Processing validation rules...');
  
  const rules: ValidationRuleRecord[] = [];
  
  // Row 4 has headers, row 5 starts data
  const headerRow = sheet.getRow(5);
  const headers: string[] = [];
  headerRow.eachCell((cell) => {
    headers.push(String(cell.value || '').trim().toLowerCase());
  });
  
  serverLogger.info(`[BeNeLux] Headers: ${headers.slice(0, 10).join(', ')}`);
  
  // Find column indices
  const changeTypeIdx = headers.findIndex(h => h.includes('add') && h.includes('change'));
  const versionIdx = headers.findIndex(h => h === 'version');
  const ruleIdNlIdx = headers.findIndex(h => h === 'nl');
  const ruleIdBeluIdx = headers.findIndex(h => h === 'belu');
  const errorDutchIdx = headers.findIndex(h => h.includes('error') && h.includes('dutch'));
  const errorEnglishIdx = headers.findIndex(h => h.includes('error') && h.includes('english'));
  
  serverLogger.info(`[BeNeLux] Column indices: changeType=${changeTypeIdx}, version=${versionIdx}, ruleIdNl=${ruleIdNlIdx}, ruleIdBelu=${ruleIdBeluIdx}, errorDutch=${errorDutchIdx}, errorEnglish=${errorEnglishIdx}`);
  
  // Process data rows (starting from row 6)
  for (let i = 6; i <= sheet.rowCount; i++) {
    const row = sheet.getRow(i);
    
    const ruleIdNl = String(row.getCell(ruleIdNlIdx + 1).value || '').trim();
    const ruleIdBelu = String(row.getCell(ruleIdBeluIdx + 1).value || '').trim();
    
    if (!ruleIdNl && !ruleIdBelu) continue;
    
    const changeType = String(row.getCell(changeTypeIdx + 1).value || '').trim().toLowerCase();
    const version = String(row.getCell(versionIdx + 1).value || '').trim();
    const errorDutch = String(row.getCell(errorDutchIdx + 1).value || '').trim();
    const errorEnglish = String(row.getCell(errorEnglishIdx + 1).value || '').trim();
    
    // Determine if rule is active (not deleted) - convert to number for schema
    const isActive = (changeType !== 'del' && changeType !== 'delete') ? 1 : 0;
    
    // Map change type
    let mappedChangeType: ValidationRuleRecord['changeType'] = null;
    if (changeType.includes('add') || changeType === 'new') mappedChangeType = 'new';
    else if (changeType.includes('technical')) mappedChangeType = 'technical';
    else if (changeType.includes('textual')) mappedChangeType = 'textual';
    else if (changeType.includes('del')) mappedChangeType = 'delete';
    
    rules.push({
      ruleId: ruleIdNl || ruleIdBelu,
      ruleIdBelu: ruleIdBelu || null,
      ruleType: 'benelux',
      errorMessageDutch: errorDutch || null,
      errorMessageEnglish: errorEnglish || null,
      severity: 'error', // Default severity
      targetMarkets: null, // Will be populated from other columns if available
      targetSectors: null,
      affectedAttributes: null,
      validationLogic: null,
      addedInVersion: version || null,
      changeType: mappedChangeType,
      isActive,
    });
  }
  
  serverLogger.info(`[BeNeLux] Parsed ${rules.length} validation rules`);
  return rules;
}

/**
 * Parse LCL Code Lists sheet
 * Row 3: Headers
 * Row 4+: Data
 */
async function parseLCLCodeLists(workbook: ExcelJS.Workbook): Promise<CodeListRecord[]> {
  const sheet = workbook.getWorksheet('LCL Code Lists');
  if (!sheet) throw new Error('LCL Code Lists sheet not found');
  
  serverLogger.info('[LCL] Processing local code lists...');
  
  const codeLists: CodeListRecord[] = [];
  
  // Row 3 has headers
  const headerRow = sheet.getRow(3);
  const headers: string[] = [];
  headerRow.eachCell((cell) => {
    headers.push(String(cell.value || '').trim().toLowerCase());
  });
  
  serverLogger.info(`[LCL] Headers: ${headers.join(', ')}`);
  
  // Find column indices
  const ruleIdx = headers.findIndex(h => h.includes('validation') && h.includes('rule'));
  const nameIdx = headers.findIndex(h => h.includes('name') && h.includes('code'));
  const valueIdx = headers.findIndex(h => h.includes('code') && h.includes('value'));
  const changedIdx = headers.findIndex(h => h.includes('changed'));
  
  serverLogger.info(`[LCL] Column indices: rule=${ruleIdx}, name=${nameIdx}, value=${valueIdx}, changed=${changedIdx}`);
  
  // Process data rows (starting from row 4)
  for (let i = 4; i <= sheet.rowCount; i++) {
    const row = sheet.getRow(i);
    
    const ruleId = String(row.getCell(ruleIdx + 1).value || '').trim();
    const codeListName = String(row.getCell(nameIdx + 1).value || '').trim();
    const codeValue = String(row.getCell(valueIdx + 1).value || '').trim();
    const changed = String(row.getCell(changedIdx + 1).value || '').trim();
    
    if (!ruleId || !codeListName || !codeValue) continue;
    
    codeLists.push({
      validationRuleId: ruleId,
      codeListName,
      codeValue,
      codeDescription: null,
      codeListSegment: null,
      addedInVersion: changed || null,
      isActive: 1,
    });
  }
  
  serverLogger.info(`[LCL] Parsed ${codeLists.length} code list entries`);
  return codeLists;
}

/**
 * Main ingestion function
 */
async function ingestValidationRules() {
  serverLogger.info('\n=== GS1 NL/Benelux Validation Rules Ingestion ===\n');
  
  // Get database connection
  const dbInstance = await getDb();
  
  try {
    const workbook = new ExcelJS.Workbook();
    const filePath = '/home/ubuntu/isa_web/data/standards/gs1-nl/benelux-datasource/v3.1.33/overview_of_validation_rules_for_the_benelux-31334.xlsx';
    
    serverLogger.info('Loading validation rules workbook...');
    await workbook.xlsx.readFile(filePath);
    
    // Parse both sheets
    const rules = await parseBeNeLuxValidations(workbook);
    const codeLists = await parseLCLCodeLists(workbook);
    
    serverLogger.info(`\n=== Summary ===`);
    serverLogger.info(`Validation rules: ${rules.length}`);
    serverLogger.info(`Code list entries: ${codeLists.length}`);
    
    // Clear existing data
    serverLogger.info('\nClearing existing validation data...');
    await dbInstance.delete(gs1ValidationRules);
    await dbInstance.delete(gs1LocalCodeLists);
    
    // Insert validation rules in batches
    serverLogger.info('\nInserting validation rules...');
    const ruleBatchSize = 500;
    for (let i = 0; i < rules.length; i += ruleBatchSize) {
      const batch = rules.slice(i, i + ruleBatchSize);
      await dbInstance.insert(gs1ValidationRules).values(batch);
      serverLogger.info(`  Inserted batch ${Math.floor(i / ruleBatchSize) + 1}/${Math.ceil(rules.length / ruleBatchSize)}`);
    }
    
    // Insert code lists in batches
    serverLogger.info('\nInserting code lists...');
    const codeListBatchSize = 500;
    for (let i = 0; i < codeLists.length; i += codeListBatchSize) {
      const batch = codeLists.slice(i, i + codeListBatchSize);
      await dbInstance.insert(gs1LocalCodeLists).values(batch);
      serverLogger.info(`  Inserted batch ${Math.floor(i / codeListBatchSize) + 1}/${Math.ceil(codeLists.length / codeListBatchSize)}`);
    }
    
    serverLogger.info('\n✅ Ingestion complete!');
    serverLogger.info(`Total validation rules inserted: ${rules.length}`);
    serverLogger.info(`Total code list entries inserted: ${codeLists.length}`);
    
    // Summary by type
    const activeRules = rules.filter(r => r.isActive).length;
    const deletedRules = rules.filter(r => !r.isActive).length;
    
    serverLogger.info(`\nBreakdown:`);
    serverLogger.info(`  Active rules: ${activeRules}`);
    serverLogger.info(`  Deleted/deprecated rules: ${deletedRules}`);
    
  } catch (error) {
    serverLogger.error('❌ Ingestion failed:', error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  ingestValidationRules()
    .then(() => process.exit(0))
    .catch((error) => {
      serverLogger.error(error);
      process.exit(1);
    });
}

export { ingestValidationRules };
