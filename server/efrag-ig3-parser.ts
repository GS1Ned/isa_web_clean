/**
 * EFRAG IG3 Datapoints Parser
 *
 * Parses the EFRAG Implementation Guidance 3 (IG3) Excel file containing
 * the comprehensive list of ESRS datapoints across all 12 standards.
 */

import XLSX from "xlsx";
import { getDb } from "./db";
import { esrsDatapoints } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";


interface IG3Datapoint {
  datapointId: string;
  esrs_standard: string;
  disclosure_requirement: string;
  paragraph: number | null;
  related_ar: string | null;
  datapointName: string;
  data_type: string;
  conditionalOrAlternative: boolean;
  mayVoluntary: boolean;
  appendixB_SFDR: boolean;
  appendixC_LessThan750: boolean;
  appendixC_AllUndertakings: boolean;
}

export async function parseIG3Datapoints(
  filePath: string
): Promise<IG3Datapoint[]> {
  console.log(`\n=== Parsing EFRAG IG3 Datapoints ===`);
  console.log(`File: ${filePath}`);

  const wb = XLSX.readFile(filePath);
  const allDatapoints: IG3Datapoint[] = [];

  // ESRS standards to parse (skip Index sheet)
  const esrsSheets = wb.SheetNames.filter(name => name !== "Index");

  for (const sheetName of esrsSheets) {
    console.log(`\nParsing sheet: ${sheetName}...`);

    const sheet = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    // Find header row
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(20, data.length); i++) {
      if (data[i] && data[i].length > 5) {
        if (
          data[i].some(
            (cell: any) => typeof cell === "string" && cell.includes("ID")
          )
        ) {
          headerRowIndex = i;
          break;
        }
      }
    }

    if (headerRowIndex === -1) {
      console.log(`  ⚠️  No header row found, skipping sheet`);
      continue;
    }

    const _headers = data[headerRowIndex];
    console.log(`  Found header at row ${headerRowIndex}`);

    // Parse datapoints
    let datapointCount = 0;
    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const id = row[0];
      if (!id || typeof id !== "string") continue;

      const datapoint: IG3Datapoint = {
        datapointId: id,
        esrs_standard: row[1] || sheetName,
        disclosure_requirement: row[2] || "",
        paragraph: typeof row[3] === "number" ? row[3] : null,
        related_ar: row[4] || null,
        datapointName: row[5] || "",
        data_type: row[6] || "unknown",
        conditionalOrAlternative: !!row[7],
        mayVoluntary: !!row[8],
        appendixB_SFDR: !!row[9],
        appendixC_LessThan750: !!row[10],
        appendixC_AllUndertakings: !!row[11],
      };

      allDatapoints.push(datapoint);
      datapointCount++;
    }

    console.log(`  ✅ Parsed ${datapointCount} datapoints`);
  }

  console.log(`\n=== Parsing Complete ===`);
  console.log(`Total datapoints: ${allDatapoints.length}`);
  console.log(`Total standards: ${esrsSheets.length}`);

  return allDatapoints;
}

export async function ingestIG3Datapoints(
  datapoints: IG3Datapoint[]
): Promise<void> {
  console.log(`\n=== Ingesting IG3 Datapoints to Database ===`);

  const db = await getDb();
  if (!db) {
    throw new Error("Failed to get database connection");
  }
  let insertedCount = 0;
  let skippedCount = 0;

  for (const dp of datapoints) {
    try {
      // Check if datapoint already exists
      const existing = await db
        .select()
        .from(esrsDatapoints)
        .where(eq(esrsDatapoints.code, dp.datapointId))
        .limit(1);

      if (existing.length > 0) {
        skippedCount++;
        continue;
      }

      // Insert datapoint
      await db.insert(esrsDatapoints).values({
        code: dp.datapointId,
        esrsStandard: dp.esrs_standard,
        disclosureRequirement: dp.disclosure_requirement,
        paragraph: dp.paragraph?.toString() || null,
        relatedAr: dp.related_ar,
        name: dp.datapointName,
        dataType: dp.data_type,
        conditional: dp.conditionalOrAlternative ? 1 : 0,
        voluntary: dp.mayVoluntary ? 1 : 0,
        sfdrMapping: dp.appendixB_SFDR ? 'SFDR' : null,
      });

      insertedCount++;
    } catch (error) {
      serverLogger.error(`Error inserting datapoint ${dp.datapointId}:`, error);
    }
  }

  console.log(`\n=== Ingestion Complete ===`);
  console.log(`Inserted: ${insertedCount}`);
  console.log(`Skipped (duplicates): ${skippedCount}`);
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const filePath =
    "/home/ubuntu/isa_web/data/efrag/EFRAGIG3ListofESRSDataPoints.xlsx";

  parseIG3Datapoints(filePath)
    .then(async datapoints => {
      await ingestIG3Datapoints(datapoints);
      console.log("\n✅ IG3 datapoints ingestion complete!");
      process.exit(0);
    })
    .catch(error => {
      serverLogger.error("❌ Error:", error);
      process.exit(1);
    });
}
