/**
 * EFRAG XBRL Taxonomy Parser
 *
 * Parses EFRAG's ESRS Set 1 XBRL Taxonomy Excel Illustration file to extract
 * all ESRS datapoints with metadata (standard, disclosure requirement, data type, etc.)
 *
 * Input: Annex 1 Excel file from https://xbrl.efrag.org/downloads/
 * Output: Structured array of ESRS datapoints for database insertion
 */

import ExcelJS from "exceljs";
import path from "path";
import { serverLogger } from "./_core/logger-wiring";


/**
 * ESRS Datapoint extracted from EFRAG XBRL Taxonomy
 */
export interface ESRSDatapoint {
  datapointId: string; // Unique identifier (e.g., "ESRS2_MDR-M_1")
  standard: string; // ESRS standard (e.g., "ESRS 2", "ESRS E1")
  disclosure_requirement: string; // DR code (e.g., "MDR-M", "E1-1")
  name: string; // Human-readable name
  description?: string; // Detailed description
  data_type: string; // Data type (text, number, date, boolean, etc.)
  mandatory: boolean; // true if mandatory, false if voluntary
  xbrlTag?: string; // XBRL element name
  taxonomyVersion: string; // Version of taxonomy (e.g., "2024-08-30")
}

/**
 * Parsing result with statistics
 */
export interface ParsingResult {
  datapoints: ESRSDatapoint[];
  totalCount: number;
  mandatoryCount: number;
  voluntaryCount: number;
  byStandard: Record<string, number>;
  errors: string[];
}

/**
 * Parse EFRAG XBRL Taxonomy Excel file
 */
export async function parseEFRAGTaxonomy(
  filePath: string
): Promise<ParsingResult> {
  const result: ParsingResult = {
    datapoints: [],
    totalCount: 0,
    mandatoryCount: 0,
    voluntaryCount: 0,
    byStandard: {},
    errors: [],
  };

  try {
    serverLogger.info(`[EFRAG Parser] Loading Excel file: ${filePath}`);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    // The Excel file has multiple sheets, we need the PresentationLinkbase sheet
    // This sheet contains all 13,480 ESRS datapoints with metadata
    const sheet =
      workbook.getWorksheet("PresentationLinkbase") ||
      workbook.getWorksheet("Taxonomy") ||
      workbook.getWorksheet("Datapoints") ||
      workbook.worksheets[0];

    if (!sheet) {
      throw new Error("No worksheet found in Excel file");
    }

    serverLogger.info(`[EFRAG Parser] Parsing worksheet: ${sheet.name}`);
    serverLogger.info(`[EFRAG Parser] Total rows: ${sheet.rowCount}`);

    // Find header row (usually row 1, but may vary)
    let headerRow: ExcelJS.Row | undefined;
    let headerRowNumber = 0;

    for (let i = 1; i <= Math.min(10, sheet.rowCount); i++) {
      const row = sheet.getRow(i);
      const firstCell = row.getCell(1).value?.toString().toLowerCase() || "";

      // Look for common header indicators
      if (
        firstCell.includes("element") ||
        firstCell.includes("datapoint") ||
        firstCell.includes("name") ||
        firstCell.includes("id")
      ) {
        headerRow = row;
        headerRowNumber = i;
        break;
      }
    }

    if (!headerRow) {
      // Fallback: assume row 1 is header
      headerRow = sheet.getRow(1);
      headerRowNumber = 1;
    }

    // Extract column indices from header
    const columnMap = extractColumnMap(headerRow);
    serverLogger.info(`[EFRAG Parser] Column map:`, columnMap);

    // Parse data rows
    for (let i = headerRowNumber + 1; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);

      // Skip empty rows
      if (isEmptyRow(row)) continue;

      try {
        const datapoint = parseDatapointRow(row, columnMap);
        if (datapoint) {
          result.datapoints.push(datapoint);
          result.totalCount++;

          if (datapoint.mandatory) {
            result.mandatoryCount++;
          } else {
            result.voluntaryCount++;
          }

          // Count by standard
          result.byStandard[datapoint.standard] =
            (result.byStandard[datapoint.standard] || 0) + 1;
        }
      } catch (error) {
        result.errors.push(`Row ${i}: ${error}`);
      }
    }

    serverLogger.info(`[EFRAG Parser] Parsing complete:`);
    serverLogger.info(`  - Total datapoints: ${result.totalCount}`);
    serverLogger.info(`  - Mandatory: ${result.mandatoryCount}`);
    serverLogger.info(`  - Voluntary: ${result.voluntaryCount}`);
    serverLogger.info(`  - By standard:`, result.byStandard);
    serverLogger.info(`  - Errors: ${result.errors.length}`);

    return result;
  } catch (error) {
    serverLogger.error(`[EFRAG Parser] Fatal error:`, error);
    throw error;
  }
}

/**
 * Extract column indices from header row
 */
function extractColumnMap(headerRow: ExcelJS.Row): Record<string, number> {
  const map: Record<string, number> = {};

  headerRow.eachCell((cell, colNumber) => {
    const header = cell.value?.toString().toLowerCase().trim() || "";

    // Map PresentationLinkbase columns
    if (header === "level") map.level = colNumber;
    if (header === "role") map.role = colNumber;
    if (header === "label en" || header === "label") map.name = colNumber;
    if (header === "additional label") map.additionalLabel = colNumber;
    if (header === "technical name") map.xbrlTag = colNumber;
    if (header === "abstract") map.abstract = colNumber;
    if (header === "type name short" || header.includes("type"))
      map.dataType = colNumber;
    if (header === "period type") map.periodType = colNumber;
    if (header === "balance") map.balance = colNumber;
    if (header === "substitution group") map.substitutionGroup = colNumber;
    if (header === "references") map.references = colNumber;
  });

  return map;
}

/**
 * Parse a single datapoint row
 */
function parseDatapointRow(
  row: ExcelJS.Row,
  columnMap: Record<string, number>
): ESRSDatapoint | null {
  // Extract values from mapped columns
  const _level = getCellValue(row, columnMap.level);
  const role = getCellValue(row, columnMap.role);
  const name = getCellValue(row, columnMap.name);
  const xbrlTag = getCellValue(row, columnMap.xbrlTag);
  const abstract = getCellValue(row, columnMap.abstract);
  const data_type = getCellValue(row, columnMap.dataType);
  const references = getCellValue(row, columnMap.references);

  // Skip abstract elements (they're just grouping headers, not actual datapoints)
  if (abstract.toLowerCase() === "true") return null;

  // Skip if missing critical fields
  if (!name || !xbrlTag) return null;

  // Extract standard and DR from role column
  // Format: "[200510] ESRS2.BP-1 General ba"
  const { standard, disclosure_requirement } = extractStandardAndDR(
    role,
    references
  );
  if (!standard) return null;

  // Generate datapoint ID from XBRL tag
  const datapointId = xbrlTag.replace("esrs:", "");

  // Determine if mandatory (all ESRS datapoints are mandatory unless marked voluntary)
  const mandatory = !name.toLowerCase().includes("voluntary");

  return {
    datapointId,
    standard,
    disclosure_requirement,
    name,
    description: undefined, // Not available in PresentationLinkbase
    data_type: normalizeDataType(data_type),
    mandatory,
    xbrlTag,
    taxonomyVersion: "2024-08-30",
  };
}

/**
 * Extract standard and disclosure requirement from role and references
 */
function extractStandardAndDR(
  role: string,
  references: string
): { standard: string; disclosure_requirement: string } {
  // Role format: "[200510] ESRS2.BP-1 General ba"
  // References format: "Name: ESRS; Number: ESRS 2; Pa..."

  let standard = "";
  let disclosure_requirement = "";

  // Extract from references if available
  const refMatch = references.match(/Number:\s*ESRS\s*([^;]+)/i);
  if (refMatch) {
    standard = `ESRS ${refMatch[1].trim()}`;
  }

  // Extract DR from role
  const roleMatch = role.match(/ESRS[0-9A-Z]+\.([A-Z]+-[A-Z0-9-]+)/i);
  if (roleMatch) {
    disclosure_requirement = roleMatch[1];
  }

  // Fallback: extract from role if references didn't work
  if (!standard) {
    const standardMatch = role.match(/ESRS\s*([0-9A-Z]+)/i);
    if (standardMatch) {
      standard = `ESRS ${standardMatch[1]}`;
    }
  }

  return { standard, disclosure_requirement };
}

/**
 * Get cell value as string
 */
function getCellValue(row: ExcelJS.Row, colNumber: number | undefined): string {
  if (!colNumber) return "";
  const cell = row.getCell(colNumber);
  return cell.value?.toString().trim() || "";
}

/**
 * Check if row is empty
 */
function isEmptyRow(row: ExcelJS.Row): boolean {
  let hasContent = false;
  row.eachCell(cell => {
    if (cell.value) hasContent = true;
  });
  return !hasContent;
}

/**
 * Generate datapoint ID from components
 */
function generateDatapointId(
  standard: string,
  dr: string,
  name: string
): string {
  const standardCode = standard.replace(/\s+/g, "").toUpperCase();
  const drCode = dr.replace(/\s+/g, "").toUpperCase();
  const nameSlug = name.substring(0, 20).replace(/[^a-zA-Z0-9]/g, "_");
  return `${standardCode}_${drCode}_${nameSlug}`;
}

/**
 * Normalize standard name (e.g., "ESRS E1" → "ESRS E1")
 */
function normalizeStandard(standard: string): string {
  return standard.trim().toUpperCase().replace(/\s+/g, " ");
}

/**
 * Normalize data type
 */
function normalizeDataType(data_type: string): string {
  const normalized = data_type.toLowerCase().trim();

  // Map common XBRL types to simple types
  if (normalized.includes("string") || normalized.includes("text"))
    return "text";
  if (
    normalized.includes("decimal") ||
    normalized.includes("number") ||
    normalized.includes("integer")
  )
    return "number";
  if (normalized.includes("date")) return "date";
  if (normalized.includes("boolean") || normalized.includes("yes/no"))
    return "boolean";
  if (normalized.includes("percent")) return "percentage";
  if (normalized.includes("monetary")) return "monetary";

  return normalized || "text";
}

/**
 * Determine if datapoint is mandatory
 */
function determineMandatory(mandatoryStr: string): boolean {
  const normalized = mandatoryStr.toLowerCase().trim();
  return (
    normalized === "mandatory" ||
    normalized === "required" ||
    normalized === "yes" ||
    normalized === "true" ||
    normalized === "m"
  );
}

/**
 * Parse EFRAG taxonomy from default location
 */
export async function parseLatestEFRAGTaxonomy(): Promise<ParsingResult> {
  const filePath = path.join(
    process.cwd(),
    "data",
    "efrag",
    "esrs-set1-taxonomy-2024-08-30.xlsx"
  );
  return parseEFRAGTaxonomy(filePath);
}
