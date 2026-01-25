/**
 * GS1 Benelux DIY/Home/Garden/Pet Data Model Parser
 *
 * Parses GS1 Data Source Benelux DHZTD (DIY/Home/Garden/Pet) Excel files.
 *
 * File Structure:
 * - Fielddefinitions: Main attribute catalog (4000+ rows)
 * - Picklists: Code list values
 * - Data for Attributes per Brick: Attribute requirements by GPC Brick
 * - Validations: Business rules
 */

import XLSX from "xlsx";
import { getDb } from "./db";
import { gs1Attributes, gs1AttributeCodeLists } from "../drizzle/schema";
import { serverLogger } from "./_core/logger-wiring";


interface ParsedDIYAttribute {
  fieldId: string;
  attributeNameEnglish: string;
  attributeNameDutch: string;
  definitionEnglish: string;
  instructionEnglish: string;
  format: string;
  minLength?: number;
  maxLength?: number;
  example?: string;
  picklistId?: string;
  mandatory: boolean;
  gdsnName?: string;
  xmlPath?: string;
  attributeCategory?: string;
  packagingRelated: boolean;
  sustainabilityRelated: boolean;
}

interface PicklistValue {
  picklistId: string;
  code: string;
  descriptionEnglish: string;
  descriptionDutch: string;
}

/**
 * Parse Fielddefinitions sheet from DIY/Garden/Pet Excel
 */
export async function parseFielddefinitionsSheet(
  filePath: string
): Promise<ParsedDIYAttribute[]> {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets["Fielddefinitions"];

  if (!sheet) {
    throw new Error("Fielddefinitions sheet not found in Excel file");
  }

  // Convert to JSON with header row
  const data = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    range: 0,
    defval: "",
  }) as any[][];

  console.log(
    `[DIY Parser] Found ${data.length} rows in Fielddefinitions sheet`
  );

  // Find header row (row 4, index 3)
  const headerRow = data[3];

  // Map column indices
  const fieldIdIdx = headerRow.indexOf("FieldID");
  const attrNameDutchIdx = headerRow.indexOf("Attributename Dutch");
  const attrNameEnglishIdx = headerRow.indexOf("Attributename English");
  const defEnglishIdx = headerRow.indexOf("Definition English");
  const instrEnglishIdx = headerRow.indexOf("Instruction English");
  const formatIdx = headerRow.indexOf("Format");
  const minLenIdx = headerRow.indexOf("Min Len");
  const maxLenIdx = headerRow.indexOf("Max Len");
  const exampleIdx = headerRow.indexOf("Example");
  const picklistIdIdx = headerRow.indexOf("Picklist ID");
  const mandGdsnIdx = headerRow.indexOf("Mand GDSN");
  const gdsnNameIdx = headerRow.indexOf("GDSN name");
  const xmlPathIdx = headerRow.indexOf("XML Path");
  const attrCategoryIdx = headerRow.indexOf("Attribute Category");

  console.log(
    `[DIY Parser] Column mapping: FieldID=${fieldIdIdx}, AttrNameEN=${attrNameEnglishIdx}, Format=${formatIdx}`
  );

  // Parse data rows (starting from row 5, index 4)
  const attributes: ParsedDIYAttribute[] = [];

  for (let i = 4; i < data.length; i++) {
    const row = data[i];

    // Skip empty rows
    if (!row[fieldIdIdx] && !row[attrNameEnglishIdx]) {
      continue;
    }

    const fieldId = String(row[fieldIdIdx] || "").trim();
    const attributeNameEnglish = String(row[attrNameEnglishIdx] || "").trim();
    const attributeNameDutch = String(row[attrNameDutchIdx] || "").trim();
    const definitionEnglish = String(row[defEnglishIdx] || "").trim();
    const instructionEnglish = String(row[instrEnglishIdx] || "").trim();
    const format = String(row[formatIdx] || "").trim();
    const minLength = row[minLenIdx]
      ? parseInt(String(row[minLenIdx]))
      : undefined;
    const maxLength = row[maxLenIdx]
      ? parseInt(String(row[maxLenIdx]))
      : undefined;
    const example = String(row[exampleIdx] || "").trim();
    const picklistId = String(row[picklistIdIdx] || "").trim();
    const mandGdsn = String(row[mandGdsnIdx] || "").toLowerCase() === "yes";
    const gdsnName = String(row[gdsnNameIdx] || "").trim();
    const xmlPath = String(row[xmlPathIdx] || "").trim();
    const attributeCategory = String(row[attrCategoryIdx] || "").trim();

    // Skip if no field ID or attribute name
    if (!fieldId || !attributeNameEnglish) {
      continue;
    }

    // Detect packaging-related attributes
    const packagingRelated =
      attributeNameEnglish.toLowerCase().includes("packaging") ||
      attributeNameEnglish.toLowerCase().includes("package") ||
      attributeNameEnglish.toLowerCase().includes("material") ||
      attributeNameEnglish.toLowerCase().includes("recyclable") ||
      attributeNameEnglish.toLowerCase().includes("container") ||
      attributeCategory?.toLowerCase().includes("packaging");

    // Detect sustainability-related attributes
    const sustainabilityRelated =
      packagingRelated ||
      attributeNameEnglish.toLowerCase().includes("sustainability") ||
      attributeNameEnglish.toLowerCase().includes("sustainable") ||
      attributeNameEnglish.toLowerCase().includes("organic") ||
      attributeNameEnglish.toLowerCase().includes("certification") ||
      attributeNameEnglish.toLowerCase().includes("carbon") ||
      attributeNameEnglish.toLowerCase().includes("co2") ||
      attributeNameEnglish.toLowerCase().includes("emission") ||
      attributeNameEnglish.toLowerCase().includes("environmental") ||
      attributeNameEnglish.toLowerCase().includes("energy") ||
      attributeNameEnglish.toLowerCase().includes("eco");

    attributes.push({
      fieldId,
      attributeNameEnglish,
      attributeNameDutch,
      definitionEnglish,
      instructionEnglish,
      format,
      minLength,
      maxLength,
      example,
      picklistId: picklistId || undefined,
      mandatory: mandGdsn,
      gdsnName,
      xmlPath,
      attributeCategory,
      packagingRelated,
      sustainabilityRelated,
    });
  }

  console.log(`[DIY Parser] Parsed ${attributes.length} attributes`);
  console.log(
    `[DIY Parser] Packaging-related: ${attributes.filter(a => a.packagingRelated).length}`
  );
  console.log(
    `[DIY Parser] Sustainability-related: ${attributes.filter(a => a.sustainabilityRelated).length}`
  );

  return attributes;
}

/**
 * Parse Picklists sheet from DIY/Garden/Pet Excel
 */
export async function parsePicklistsSheet(
  filePath: string
): Promise<PicklistValue[]> {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets["Picklists"];

  if (!sheet) {
    console.log("[DIY Parser] Picklists sheet not found, skipping");
    return [];
  }

  const data = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    range: 0,
    defval: "",
  }) as any[][];

  console.log(`[DIY Parser] Found ${data.length} rows in Picklists sheet`);

  // Find header row (usually row 1)
  let headerRowIdx = 0;
  for (let i = 0; i < Math.min(5, data.length); i++) {
    if (
      data[i].some((cell: any) =>
        String(cell).toLowerCase().includes("picklist")
      )
    ) {
      headerRowIdx = i;
      break;
    }
  }

  const headerRow = data[headerRowIdx];
  const picklistIdIdx = headerRow.findIndex((h: any) =>
    String(h).toLowerCase().includes("picklist")
  );
  const codeIdx = headerRow.findIndex((h: any) =>
    String(h).toLowerCase().includes("code")
  );
  const descEnIdx = headerRow.findIndex((h: any) =>
    String(h).toLowerCase().includes("english")
  );
  const descNlIdx = headerRow.findIndex((h: any) =>
    String(h).toLowerCase().includes("dutch")
  );

  const picklistValues: PicklistValue[] = [];

  for (let i = headerRowIdx + 1; i < data.length; i++) {
    const row = data[i];

    if (!row[picklistIdIdx] || !row[codeIdx]) {
      continue;
    }

    picklistValues.push({
      picklistId: String(row[picklistIdIdx]).trim(),
      code: String(row[codeIdx]).trim(),
      descriptionEnglish: String(row[descEnIdx] || "").trim(),
      descriptionDutch: String(row[descNlIdx] || "").trim(),
    });
  }

  console.log(`[DIY Parser] Parsed ${picklistValues.length} picklist values`);

  return picklistValues;
}

/**
 * Ingest DIY attributes into database
 */
export async function ingestDIYAttributes(
  attributes: ParsedDIYAttribute[]
): Promise<{
  success: number;
  errors: number;
  attributeMap: Map<string, number>;
}> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  let success = 0;
  let errors = 0;

  for (const attr of attributes) {
    try {
      // Use FieldID as attribute code (unique identifier)
      const attributeCode = attr.fieldId;

      // Determine datatype from format
      let datatype: "text" | "number" | "boolean" | "date" | "code_list" =
        "text";
      if (attr.format.toLowerCase() === "number") {
        datatype = "number";
      } else if (attr.format.toLowerCase() === "date") {
        datatype = "date";
      } else if (
        attr.format.toLowerCase() === "boolean" ||
        attr.format.toLowerCase() === "indicator"
      ) {
        datatype = "boolean";
      } else if (attr.picklistId) {
        datatype = "code_list";
      }

      await db
        .insert(gs1Attributes)
        .values({
          attributeCode,
          attributeName: attr.attributeNameEnglish,
          sector: "diy_garden_pet",
          description: attr.definitionEnglish || attr.attributeNameEnglish,
          datatype,
          isMandatory: attr.mandatory ? 1 : 0,
          packagingRelated: attr.packagingRelated ? 1 : 0,
          sustainabilityRelated: attr.sustainabilityRelated ? 1 : 0,
          esrsRelevance: attr.sustainabilityRelated
            ? "Potentially relevant for ESRS E1-E5"
            : null,
          dppRelevance: attr.packagingRelated
            ? "Relevant for Digital Product Passport"
            : null,
        })
        .onDuplicateKeyUpdate({
          set: {
            attributeName: attr.attributeNameEnglish,
            description: attr.definitionEnglish || attr.attributeNameEnglish,
            datatype,
            isMandatory: attr.mandatory ? 1 : 0,
            packagingRelated: attr.packagingRelated ? 1 : 0,
            sustainabilityRelated: attr.sustainabilityRelated ? 1 : 0,
            esrsRelevance: attr.sustainabilityRelated
              ? "Potentially relevant for ESRS E1-E5"
              : null,
            dppRelevance: attr.packagingRelated
              ? "Relevant for Digital Product Passport"
              : null,
          },
        });

      success++;

      if (success % 100 === 0) {
        console.log(`[DIY Parser] Ingested ${success} attributes...`);
      }
    } catch (error) {
      serverLogger.error(
        `[DIY Parser] Failed to ingest attribute ${attr.attributeNameEnglish}:`,
        error
      );
      errors++;
    }
  }

  console.log(
    `[DIY Parser] Ingestion complete: ${success} success, ${errors} errors`
  );

  // Build attribute code to ID map for picklist ingestion
  const attributeMap = new Map<string, number>();
  const allAttributes = await db
    .select()
    .from(gs1Attributes)
    .where(
      (await import("drizzle-orm")).eq(gs1Attributes.sector, "diy_garden_pet")
    );
  for (const attr of allAttributes) {
    attributeMap.set(attr.attributeCode, attr.id);
  }

  return { success, errors, attributeMap };
}

/**
 * Ingest picklist values into database
 */
export async function ingestPicklists(
  picklists: PicklistValue[],
  attributes: ParsedDIYAttribute[],
  attributeMap: Map<string, number>
): Promise<{ success: number; errors: number }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  let success = 0;
  let errors = 0;

  // Group picklists by picklistId
  const picklistsByAttr = new Map<string, PicklistValue[]>();
  for (const picklist of picklists) {
    if (!picklistsByAttr.has(picklist.picklistId)) {
      picklistsByAttr.set(picklist.picklistId, []);
    }
    picklistsByAttr.get(picklist.picklistId)!.push(picklist);
  }

  // Match picklists to attributes
  for (const attr of attributes) {
    if (!attr.picklistId) continue;

    const attributeId = attributeMap.get(attr.fieldId);
    if (!attributeId) continue;

    const picklistValues = picklistsByAttr.get(attr.picklistId);
    if (!picklistValues) continue;

    for (const picklist of picklistValues) {
      try {
        await db.insert(gs1AttributeCodeLists).values({
          attributeId,
          code: picklist.code,
          description: picklist.descriptionEnglish || picklist.descriptionDutch,
          sortOrder: 0,
          isActive: 1,
        });

        success++;
      } catch (error) {
        errors++;
      }
    }
  }

  console.log(
    `[DIY Parser] Picklist ingestion complete: ${success} success, ${errors} errors`
  );

  return { success, errors };
}

/**
 * Main ingestion workflow for DIY/Garden/Pet sector
 */
export async function ingestDIYModel(filePath: string): Promise<void> {
  console.log(`[DIY Parser] Starting DIY/Garden/Pet ingestion`);
  console.log(`[DIY Parser] File: ${filePath}`);

  const startTime = Date.now();

  try {
    // Step 1: Parse attributes
    const attributes = await parseFielddefinitionsSheet(filePath);

    // Step 2: Parse picklists
    const picklists = await parsePicklistsSheet(filePath);

    // Step 3: Ingest attributes
    const attrResult = await ingestDIYAttributes(attributes);

    // Step 4: Ingest picklists
    const picklistResult = await ingestPicklists(
      picklists,
      attributes,
      attrResult.attributeMap
    );

    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log(`[DIY Parser] Completed in ${duration}s`);
    console.log(`[DIY Parser] Summary:`);
    console.log(`  - Attributes parsed: ${attributes.length}`);
    console.log(`  - Attributes ingested: ${attrResult.success}`);
    console.log(`  - Attribute errors: ${attrResult.errors}`);
    console.log(`  - Picklists parsed: ${picklists.length}`);
    console.log(`  - Picklists ingested: ${picklistResult.success}`);
    console.log(`  - Picklist errors: ${picklistResult.errors}`);
  } catch (error) {
    serverLogger.error(`[DIY Parser] Ingestion failed:`, error);
    throw error;
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const filePath =
    process.argv[2] ||
    "/home/ubuntu/upload/202511-GS1BeneluxDHZTD3.1.33-EN_0.xlsx";

  ingestDIYModel(filePath)
    .then(() => {
      console.log("[DIY Parser] Ingestion successful");
      process.exit(0);
    })
    .catch(error => {
      serverLogger.error("[DIY Parser] Ingestion failed:", error);
      process.exit(1);
    });
}
