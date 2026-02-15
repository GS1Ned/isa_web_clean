import * as fs from "fs";
import * as path from "path";
import XLSX from "xlsx";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { esrsDatapoints, rawEsrsDatapoints } from "../../drizzle/schema";
import { serverLogger } from "../_core/logger-wiring";


export interface IngestOptions {
  dryRun?: boolean;
  limit?: number;
  verbose?: boolean;
}

export interface IngestResult {
  success: boolean;
  recordsProcessed: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsSkipped: number;
  duration?: number;
  errors?: string[];
}

type SheetRow = [
  string | number | null | undefined,
  string | number | null | undefined,
  string | number | null | undefined,
  string | number | null | undefined,
  string | number | null | undefined,
  string | number | null | undefined,
  string | number | null | undefined,
  string | number | null | undefined,
  string | number | null | undefined,
  string | number | null | undefined
];

export interface ParsedEsrsRow {
  code: string;
  esrs_standard: string | null;
  disclosure_requirement: string | null;
  paragraph: string | null;
  related_ar: string | null;
  name: string;
  data_type: string;
  conditional: boolean;
  voluntary: boolean;
  sfdr_mapping: string | null;
  sheetName: string;
  rowIndex: number;
}

export function normalizeEsrsDataType(raw: unknown): string {
  if (raw == null) {
    return "unknown";
  }
  const value = String(raw).trim();
  if (value.length === 0) {
    return "unknown";
  }
  const lower = value.toLowerCase();
  if (lower.includes("semi-narrative") || lower.includes("semi narrative")) {
    return "semiNarrative";
  }
  if (lower.includes("quantitative")) {
    return "quantitative";
  }
  if (lower.includes("narrative")) {
    return "narrative";
  }
  if (lower.includes("qualitative")) {
    return "qualitative";
  }
  return lower;
}

export function parseConditionalFlag(value: unknown): boolean {
  if (value == null) {
    return false;
  }
  const text = String(value).toLowerCase();
  if (text.includes("conditional")) {
    return true;
  }
  if (text.includes("alternative")) {
    return true;
  }
  return false;
}

export function parseVoluntaryFlag(value: unknown): boolean {
  if (value == null) {
    return false;
  }
  const text = String(value).trim();
  if (text.length === 0) {
    return false;
  }
  return true;
}

function loadWorkbookFile(): XLSX.WorkBook {
  const filePath = path.join(
    process.cwd(),
    "data",
    "efrag",
    "EFRAGIG3ListofESRSDataPoints.xlsx"
  );
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `ESRS datapoints Excel file not found at path: ${filePath}`
    );
  }
  return XLSX.readFile(filePath);
}

function parseWorkbook(
  workbook: XLSX.WorkBook,
  verbose: boolean
): ParsedEsrsRow[] {
  const parsed: ParsedEsrsRow[] = [];
  const sheetNames = workbook.SheetNames.filter(
    (name) => name.toLowerCase() !== "index"
  );
  for (const sheetName of sheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      if (verbose) {
        serverLogger.warn(`Sheet ${sheetName} missing in workbook, skipping`);
      }
      continue;
    }
    const rows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null
    }) as SheetRow[];
    if (rows.length <= 1) {
      continue;
    }
    if (verbose) {
      serverLogger.info(`Processing sheet ${sheetName} with ${rows.length - 1} rows`);
    }
    for (let index = 1; index < rows.length; index += 1) {
      const row = rows[index];
      const [
        codeRaw,
        esrsStandardRaw,
        disclosureRequirementRaw,
        paragraphRaw,
        relatedArRaw,
        nameRaw,
        dataTypeRaw,
        conditionalRaw,
        voluntaryRaw,
        sfdrMappingRaw
      ] = row;
      const codeValue =
        codeRaw == null
          ? ""
          : String(codeRaw).trim();
      if (codeValue.length === 0) {
        break;
      }
      const nameValue =
        nameRaw == null
          ? ""
          : String(nameRaw).trim();
      if (nameValue.length === 0) {
        continue;
      }
      const esrsStandardValue =
        esrsStandardRaw == null
          ? null
          : String(esrsStandardRaw).trim() || null;
      const disclosureRequirementValue =
        disclosureRequirementRaw == null
          ? null
          : String(disclosureRequirementRaw).trim() || null;
      const paragraphValue =
        paragraphRaw == null
          ? null
          : String(paragraphRaw).trim() || null;
      const relatedArValue =
        relatedArRaw == null
          ? null
          : String(relatedArRaw).trim() || null;
      const sfdrMappingValue =
        sfdrMappingRaw == null
          ? null
          : String(sfdrMappingRaw).trim() || null;
      const dataTypeValue = normalizeEsrsDataType(dataTypeRaw);
      const conditionalValue = parseConditionalFlag(conditionalRaw);
      const voluntaryValue = parseVoluntaryFlag(voluntaryRaw);
      parsed.push({
        code: codeValue,
        esrs_standard: esrsStandardValue,
        disclosure_requirement: disclosureRequirementValue,
        paragraph: paragraphValue,
        related_ar: relatedArValue,
        name: nameValue,
        data_type: dataTypeValue,
        conditional: conditionalValue,
        voluntary: voluntaryValue,
        sfdr_mapping: sfdrMappingValue,
        sheetName,
        rowIndex: index + 1
      });
    }
  }
  return parsed;
}

export async function ingestEsrsDatapoints(
  options: IngestOptions = {}
): Promise<IngestResult> {
  const startTime = Date.now();
  const { dryRun = false, limit, verbose = false } = options;
  const result: IngestResult = {
    success: true,
    recordsProcessed: 0,
    recordsInserted: 0,
    recordsUpdated: 0,
    recordsSkipped: 0,
    errors: []
  };
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database connection not available");
    }
    if (verbose) {
      serverLogger.info("Starting ESRS datapoints ingestion");
    }
    const workbook = loadWorkbookFile();
    const parsedRows = parseWorkbook(workbook, verbose);
    if (parsedRows.length === 0) {
      if (verbose) {
        serverLogger.warn("No ESRS datapoints found in workbook");
      }
    }
    for (const row of parsedRows) {
      if (limit !== undefined && result.recordsProcessed >= limit) {
        if (verbose) {
          serverLogger.info(
            `Limit reached (${limit} records), stopping ingestion loop`
          );
        }
        break;
      }
      result.recordsProcessed += 1;
      if (!dryRun) {
        const rawPayload = {
          code: row.code,
          esrs_standard: row.esrs_standard,
          disclosure_requirement: row.disclosure_requirement,
          paragraph: row.paragraph,
          relatedAr: row.related_ar,
          name: row.name,
          dataTypeRaw: row.data_type,
          conditionalRaw: row.conditional ? 1 : 0,
          voluntaryRaw: row.voluntary ? 1 : 0,
          sfdr_mapping: row.sfdr_mapping,
          sheetName: row.sheetName,
          rowIndex: row.rowIndex
        };
        const existingRaw = await db
          .select()
          .from(rawEsrsDatapoints)
          .where(eq(rawEsrsDatapoints.code, row.code))
          .limit(1);
        if (existingRaw.length > 0) {
          await db
            .update(rawEsrsDatapoints)
            .set({
              esrsStandard: row.esrs_standard,
              disclosureRequirement: row.disclosure_requirement,
              paragraph: row.paragraph,
              relatedAr: row.related_ar,
              name: row.name,
              dataTypeRaw: row.data_type,
              conditionalRaw: row.conditional ? 1 : 0,
              voluntaryRaw: row.voluntary ? 1 : 0,
              sfdrMapping: row.sfdr_mapping,
              sheetName: row.sheetName,
              rowIndex: row.rowIndex,
              rawJson: rawPayload
            })
            .where(eq(rawEsrsDatapoints.id, existingRaw[0].id));
        } else {
          await db.insert(rawEsrsDatapoints).values({
            code: row.code,
            esrsStandard: row.esrs_standard,
            disclosureRequirement: row.disclosure_requirement,
            paragraph: row.paragraph,
            relatedAr: row.related_ar,
            name: row.name,
            dataTypeRaw: row.data_type,
            conditionalRaw: row.conditional ? 1 : 0,
            voluntaryRaw: row.voluntary ? 1 : 0,
            sfdrMapping: row.sfdr_mapping,
            sheetName: row.sheetName,
            rowIndex: row.rowIndex,
            rawJson: rawPayload
          });
        }
        const existingCanonical = await db
          .select()
          .from(esrsDatapoints)
          .where(eq(esrsDatapoints.code, row.code))
          .limit(1);
        if (existingCanonical.length > 0) {
          await db
            .update(esrsDatapoints)
            .set({
              esrsStandard: row.esrs_standard,
              disclosureRequirement: row.disclosure_requirement,
              paragraph: row.paragraph,
              relatedAr: row.related_ar,
              name: row.name,
              dataType: row.data_type,
              conditional: row.conditional ? 1 : 0,
              voluntary: row.voluntary ? 1 : 0,
              sfdrMapping: row.sfdr_mapping
            })
            .where(eq(esrsDatapoints.id, existingCanonical[0].id));
          result.recordsUpdated += 1;
        } else {
          await db.insert(esrsDatapoints).values({
            code: row.code,
            esrsStandard: row.esrs_standard,
            disclosureRequirement: row.disclosure_requirement,
            paragraph: row.paragraph,
            relatedAr: row.related_ar,
            name: row.name,
            dataType: row.data_type,
            conditional: row.conditional ? 1 : 0,
            voluntary: row.voluntary ? 1 : 0,
            sfdrMapping: row.sfdr_mapping
          });
          result.recordsInserted += 1;
        }
      } else {
        result.recordsSkipped += 1;
      }
      if (verbose && result.recordsProcessed % 100 === 0) {
        serverLogger.info(
          `Processed ${result.recordsProcessed} ESRS datapoints so far`
        );
      }
    }
    result.duration = Date.now() - startTime;
    if (result.success) {
      serverLogger.info(
        `ESRS ingestion complete` +
          ` processed=${result.recordsProcessed}` +
          ` inserted=${result.recordsInserted}` +
          ` updated=${result.recordsUpdated}` +
          ` skipped=${result.recordsSkipped}` +
          ` durationMs=${result.duration}`
      );
    }
  } catch (error) {
    result.success = false;
    const message =
      error instanceof Error ? error.message : String(error);
    result.errors = [message];
    serverLogger.error("ESRS ingestion failed", error);
  }
  return result;
}

function parseCliArgs(argv: string[]): IngestOptions {
  const args = argv.slice(2);
  let dryRun = false;
  let verbose = false;
  let limit: number | undefined;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg === "--verbose") {
      verbose = true;
    } else if (arg === "--limit" && index + 1 < args.length) {
      const value = Number.parseInt(args[index + 1], 10);
      if (!Number.isNaN(value) && value > 0) {
        limit = value;
      }
    }
  }
  return { dryRun, verbose, limit };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseCliArgs(process.argv);
  ingestEsrsDatapoints(options).then((result) => {
    if (!result.success) {
      process.exitCode = 1;
    }
  });
}

