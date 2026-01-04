/**
 * GS1 Benelux FMCG Data Model Parser
 *
 * Parses GS1 Data Source Benelux Excel files to extract attribute catalog.
 * Supports Food/Health & Beauty sector (FMCG model).
 *
 * File Structure:
 * - Sheet 1: User Instructions
 * - Sheet 2: Attributes (main data)
 * - Sheet 3: BASE_attributes
 * - Sheet 4: Code Lists
 * - Sheet 5: Change Log
 */

import XLSX from "xlsx";
import { getDb } from "./db";
import { gs1Attributes, gs1AttributeCodeLists } from "../drizzle/schema";
import { serverLogger } from "./_core/logger-wiring";


interface ParsedAttribute {
  localName: string;
  gdsnName: string;
  bmsId: string;
  tcFieldId: string;
  description: string;
  mandatory: boolean;
  datatype: "text" | "number" | "boolean" | "date" | "code_list";
  codeListName?: string;
  sector: "food_hb" | "diy_garden_pet" | "healthcare" | "agriculture";
  packagingRelated: boolean;
  sustainabilityRelated: boolean;
}

interface CodeListValue {
  code: string;
  description: string;
  attributeCode: string;
}

/**
 * Parse Attributes sheet from GS1 Benelux Excel
 */
export async function parseAttributesSheet(
  filePath: string,
  sector: "food_hb" | "diy_garden_pet" | "healthcare" | "agriculture"
): Promise<ParsedAttribute[]> {
  const workbook = XLSX.readFile(filePath);
  const attributesSheet = workbook.Sheets["Attributes"];

  if (!attributesSheet) {
    throw new Error("Attributes sheet not found in Excel file");
  }

  // Convert to JSON with header row
  const data = XLSX.utils.sheet_to_json(attributesSheet, {
    header: 1,
    range: 0,
    defval: "",
  }) as any[][];

  console.log(
    `[GS1 Benelux Parser] Found ${data.length} rows in Attributes sheet`
  );

  // Find header row (row 1, index 1)
  const _headerRow = data[1];
  const localNameIdx = 0;
  const gdsnNameIdx = 1;
  const bmsIdIdx = 2;
  const tcFieldIdIdx = 3;

  // Parse data rows (starting from row 2, index 2)
  const attributes: ParsedAttribute[] = [];

  for (let i = 2; i < data.length; i++) {
    const row = data[i];

    // Skip empty rows
    if (!row[localNameIdx] && !row[gdsnNameIdx]) {
      continue;
    }

    const localName = String(row[localNameIdx] || "").trim();
    const gdsnName = String(row[gdsnNameIdx] || "").trim();
    const bmsId = String(row[bmsIdIdx] || "").trim();
    const tcFieldId = String(row[tcFieldIdIdx] || "").trim();

    // Skip if no attribute name
    if (!localName && !gdsnName) {
      continue;
    }

    // Determine datatype based on attribute name patterns
    let datatype: "text" | "number" | "boolean" | "date" | "code_list" = "text";
    let codeListName: string | undefined;

    if (
      localName.toLowerCase().includes("code") ||
      localName.toLowerCase().includes("type")
    ) {
      datatype = "code_list";
      codeListName = gdsnName || localName;
    } else if (localName.toLowerCase().includes("date")) {
      datatype = "date";
    } else if (
      localName.toLowerCase().includes("indicator") ||
      localName.toLowerCase().includes("flag")
    ) {
      datatype = "boolean";
    } else if (
      localName.toLowerCase().includes("quantity") ||
      localName.toLowerCase().includes("measurement")
    ) {
      datatype = "number";
    }

    // Detect packaging-related attributes
    const packagingRelated =
      localName.toLowerCase().includes("packaging") ||
      localName.toLowerCase().includes("package") ||
      localName.toLowerCase().includes("material") ||
      localName.toLowerCase().includes("recyclable") ||
      localName.toLowerCase().includes("container");

    // Detect sustainability-related attributes
    const sustainabilityRelated =
      packagingRelated ||
      localName.toLowerCase().includes("sustainability") ||
      localName.toLowerCase().includes("sustainable") ||
      localName.toLowerCase().includes("organic") ||
      localName.toLowerCase().includes("certification") ||
      localName.toLowerCase().includes("carbon") ||
      localName.toLowerCase().includes("co2") ||
      localName.toLowerCase().includes("emission") ||
      localName.toLowerCase().includes("environmental");

    attributes.push({
      localName,
      gdsnName,
      bmsId,
      tcFieldId,
      description: `${localName} (GDSN: ${gdsnName})`,
      mandatory: false, // Default, can be updated based on additional columns
      datatype,
      codeListName,
      sector,
      packagingRelated,
      sustainabilityRelated,
    });
  }

  console.log(`[GS1 Benelux Parser] Parsed ${attributes.length} attributes`);
  console.log(
    `[GS1 Benelux Parser] Packaging-related: ${attributes.filter(a => a.packagingRelated).length}`
  );
  console.log(
    `[GS1 Benelux Parser] Sustainability-related: ${attributes.filter(a => a.sustainabilityRelated).length}`
  );

  return attributes;
}

/**
 * Parse Code Lists sheet from GS1 Benelux Excel
 */
export async function parseCodeListsSheet(
  filePath: string
): Promise<CodeListValue[]> {
  const workbook = XLSX.readFile(filePath);
  const codeListsSheet = workbook.Sheets["Code Lists"];

  if (!codeListsSheet) {
    console.log("[GS1 Benelux Parser] Code Lists sheet not found, skipping");
    return [];
  }

  const data = XLSX.utils.sheet_to_json(codeListsSheet, {
    header: 1,
    range: 0,
    defval: "",
  }) as any[][];

  console.log(
    `[GS1 Benelux Parser] Found ${data.length} rows in Code Lists sheet`
  );

  const codeListValues: CodeListValue[] = [];

  // Parse code list data (structure may vary, adapt as needed)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    if (!row[0] || !row[1]) {
      continue;
    }

    codeListValues.push({
      attributeCode: String(row[0]).trim(),
      code: String(row[1]).trim(),
      description: String(row[2] || "").trim(),
    });
  }

  console.log(
    `[GS1 Benelux Parser] Parsed ${codeListValues.length} code list values`
  );

  return codeListValues;
}

/**
 * Ingest code list values into database
 */
export async function ingestCodeLists(
  codeLists: CodeListValue[],
  attributeMap: Map<string, number>
): Promise<{ success: number; errors: number }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  let success = 0;
  let errors = 0;

  for (const codeList of codeLists) {
    try {
      const attributeId = attributeMap.get(codeList.attributeCode);

      if (!attributeId) {
        // Skip if attribute not found
        continue;
      }

      await db.insert(gs1AttributeCodeLists).values({
        attributeId,
        code: codeList.code,
        description: codeList.description,
        sortOrder: 0,
        isActive: 1,
      });

      success++;

      if (success % 500 === 0) {
        console.log(
          `[GS1 Benelux Parser] Ingested ${success} code list values...`
        );
      }
    } catch (error) {
      errors++;
    }
  }

  console.log(
    `[GS1 Benelux Parser] Code list ingestion complete: ${success} success, ${errors} errors`
  );

  return { success, errors };
}

/**
 * Ingest parsed attributes into database
 */
export async function ingestAttributes(
  attributes: ParsedAttribute[]
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
      // Use GDSN name as attribute code (unique identifier)
      const attributeCode =
        attr.gdsnName || attr.localName.replace(/\s+/g, "_").toLowerCase();

      await db
        .insert(gs1Attributes)
        .values({
          attributeCode,
          attributeName: attr.localName,
          sector: attr.sector,
          description: attr.description,
          datatype: attr.datatype,
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
            attributeName: attr.localName,
            description: attr.description,
            datatype: attr.datatype,
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

      if (success % 50 === 0) {
        console.log(`[GS1 Benelux Parser] Ingested ${success} attributes...`);
      }
    } catch (error) {
      serverLogger.error(
        `[GS1 Benelux Parser] Failed to ingest attribute ${attr.localName}:`,
        error
      );
      errors++;
    }
  }

  console.log(
    `[GS1 Benelux Parser] Ingestion complete: ${success} success, ${errors} errors`
  );

  // Build attribute code to ID map for code list ingestion
  const attributeMap = new Map<string, number>();
  const allAttributes = await db.select().from(gs1Attributes);
  for (const attr of allAttributes) {
    attributeMap.set(attr.attributeCode, attr.id);
  }

  return { success, errors, attributeMap };
}

/**
 * Main ingestion workflow
 */
export async function ingestGS1BeneluxModel(
  filePath: string,
  sector: "food_hb" | "diy_garden_pet" | "healthcare" | "agriculture"
): Promise<void> {
  console.log(`[GS1 Benelux Parser] Starting ingestion for sector: ${sector}`);
  console.log(`[GS1 Benelux Parser] File: ${filePath}`);

  const startTime = Date.now();

  try {
    // Step 1: Parse attributes
    const attributes = await parseAttributesSheet(filePath, sector);

    // Step 2: Parse code lists
    const codeLists = await parseCodeListsSheet(filePath);

    // Step 3: Ingest attributes
    const attrResult = await ingestAttributes(attributes);

    // Step 4: Ingest code lists
    const codeListResult = await ingestCodeLists(
      codeLists,
      attrResult.attributeMap
    );

    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log(`[GS1 Benelux Parser] Completed in ${duration}s`);
    console.log(`[GS1 Benelux Parser] Summary:`);
    console.log(`  - Attributes parsed: ${attributes.length}`);
    console.log(`  - Attributes ingested: ${attrResult.success}`);
    console.log(`  - Attribute errors: ${attrResult.errors}`);
    console.log(`  - Code lists parsed: ${codeLists.length}`);
    console.log(`  - Code lists ingested: ${codeListResult.success}`);
    console.log(`  - Code list errors: ${codeListResult.errors}`);
  } catch (error) {
    serverLogger.error(`[GS1 Benelux Parser] Ingestion failed:`, error);
    throw error;
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const filePath =
    process.argv[2] ||
    "/home/ubuntu/upload/benelux-fmcg-data-model-31335-english.xlsx";
  const sector = (process.argv[3] as any) || "food_hb";

  ingestGS1BeneluxModel(filePath, sector)
    .then(() => {
      console.log("[GS1 Benelux Parser] Ingestion successful");
      process.exit(0);
    })
    .catch(error => {
      serverLogger.error("[GS1 Benelux Parser] Ingestion failed:", error);
      process.exit(1);
    });
}
