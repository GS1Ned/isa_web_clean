import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { format as utilFormat } from "node:util";
import dotenv from "dotenv";
import postgres from "postgres";
import {
  getExcelSheetNames,
  getExcelWorksheetRows,
  readExcelWorkbook,
} from "../../server/_core/excel";
import {
  applyPostgresMigrations,
  resolvePostgresConnectionString,
} from "./postgres-apply-migrations";

const cliOut = (...args: unknown[]) =>
  process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args: unknown[]) =>
  process.stderr.write(`${utilFormat(...args)}\n`);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
dotenv.config({ path: path.join(repoRoot, ".env"), quiet: true });

type SheetRow = Array<string | number | null | undefined>;

interface ParsedEsrsRow {
  code: string;
  esrsStandard: string | null;
  disclosureRequirement: string | null;
  paragraph: string | null;
  relatedAr: string | null;
  name: string;
  dataType: string;
  conditional: boolean;
  voluntary: boolean;
  sfdrMapping: string | null;
}

function normalizeEsrsDataType(raw: unknown): string {
  if (raw == null) return "unknown";
  const value = String(raw).trim();
  if (!value) return "unknown";
  const lower = value.toLowerCase();
  if (lower.includes("semi-narrative") || lower.includes("semi narrative")) {
    return "semiNarrative";
  }
  if (lower.includes("quantitative")) return "quantitative";
  if (lower.includes("narrative")) return "narrative";
  if (lower.includes("qualitative")) return "qualitative";
  return lower;
}

function parseConditionalFlag(value: unknown): boolean {
  if (value == null) return false;
  const text = String(value).toLowerCase();
  return text.includes("conditional") || text.includes("alternative");
}

function parseVoluntaryFlag(value: unknown): boolean {
  if (value == null) return false;
  return String(value).trim().length > 0;
}

async function loadEsrsRows(): Promise<ParsedEsrsRow[]> {
  const filePath = path.join(
    repoRoot,
    "data",
    "efrag",
    "EFRAGIG3ListofESRSDataPoints.xlsx"
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing workbook: ${filePath}`);
  }

  const workbook = await readExcelWorkbook(filePath);
  const sheetNames = getExcelSheetNames(workbook).filter(
    (name) => name.toLowerCase() !== "index"
  );
  const parsed: ParsedEsrsRow[] = [];

  for (const sheetName of sheetNames) {
    const rows = getExcelWorksheetRows(workbook, sheetName, null) as SheetRow[];
    for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
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
        sfdrMappingRaw,
      ] = rows[rowIndex];

      const code = codeRaw == null ? "" : String(codeRaw).trim();
      if (!code) {
        break;
      }

      const name = nameRaw == null ? "" : String(nameRaw).trim();
      if (!name) {
        continue;
      }

      parsed.push({
        code,
        esrsStandard:
          esrsStandardRaw == null ? null : String(esrsStandardRaw).trim() || null,
        disclosureRequirement:
          disclosureRequirementRaw == null
            ? null
            : String(disclosureRequirementRaw).trim() || null,
        paragraph:
          paragraphRaw == null ? null : String(paragraphRaw).trim() || null,
        relatedAr:
          relatedArRaw == null ? null : String(relatedArRaw).trim() || null,
        name,
        dataType: normalizeEsrsDataType(dataTypeRaw),
        conditional: parseConditionalFlag(conditionalRaw),
        voluntary: parseVoluntaryFlag(voluntaryRaw),
        sfdrMapping:
          sfdrMappingRaw == null ? null : String(sfdrMappingRaw).trim() || null,
      });
    }
  }

  return parsed;
}

async function loadFoundationSeedData() {
  process.env.VITE_APP_ID ||= "isa-bootstrap";
  process.env.ISA_TEST_SILENT ||= "true";
  process.env.JWT_SECRET ||= "isa-bootstrap-jwt-secret-minimum-32";

  const [{ regulationsSeedData }, { gs1StandardsData }] = await Promise.all([
    import("../../server/seed-production-regulations.mjs"),
    import("../../server/seed-gs1-standards"),
  ]);

  return { regulationsSeedData, gs1StandardsData };
}

async function seedRegulations(
  sql: postgres.Sql,
  regulationsSeedData: Array<{
    celexId: string | null;
    title: string;
    description: string;
    regulationType: string;
    effectiveDate: string | null;
    sourceUrl: string;
  }>
) {
  const existingRows =
    await sql<{ id: number; celex_id: string | null; title: string }[]>`
      SELECT id, celex_id, title FROM regulations
    `;
  const byCelex = new Map<string, number>();
  const byTitle = new Map<string, number>();

  for (const row of existingRows) {
    if (row.celex_id) byCelex.set(row.celex_id, row.id);
    byTitle.set(row.title, row.id);
  }

  let inserted = 0;
  let updated = 0;

  for (const regulation of regulationsSeedData) {
    const existingId =
      (regulation.celexId && byCelex.get(regulation.celexId)) ||
      byTitle.get(regulation.title);

    if (existingId) {
      await sql`
        UPDATE regulations
        SET
          celex_id = ${regulation.celexId},
          title = ${regulation.title},
          description = ${regulation.description},
          regulation_type = ${regulation.regulationType},
          effective_date = ${regulation.effectiveDate},
          source_url = ${regulation.sourceUrl},
          last_updated = now()
        WHERE id = ${existingId}
      `;
      if (regulation.celexId) {
        byCelex.set(regulation.celexId, existingId);
      }
      byTitle.set(regulation.title, existingId);
      updated += 1;
      continue;
    }

    const [created] = await sql<{ id: number }[]>`
      INSERT INTO regulations (
        celex_id,
        title,
        description,
        regulation_type,
        effective_date,
        source_url
      ) VALUES (
        ${regulation.celexId},
        ${regulation.title},
        ${regulation.description},
        ${regulation.regulationType},
        ${regulation.effectiveDate},
        ${regulation.sourceUrl}
      )
      RETURNING id
    `;
    if (regulation.celexId) {
      byCelex.set(regulation.celexId, created.id);
    }
    byTitle.set(regulation.title, created.id);
    inserted += 1;
  }

  return { inserted, updated };
}

async function seedGs1Standards(
  sql: postgres.Sql,
  gs1StandardsData: Array<{
    standardCode: string;
    standardName: string;
    description: string;
    category: string;
    scope: string;
    referenceUrl: string;
  }>
) {
  let inserted = 0;
  let updated = 0;

  for (const standard of gs1StandardsData) {
    const [existing] =
      await sql<{ id: number }[]>`SELECT id FROM gs1_standards WHERE standard_code = ${standard.standardCode} LIMIT 1`;

    if (existing) {
      await sql`
        UPDATE gs1_standards
        SET
          standard_name = ${standard.standardName},
          description = ${standard.description},
          category = ${standard.category},
          scope = ${standard.scope},
          reference_url = ${standard.referenceUrl},
          updated_at = now()
        WHERE id = ${existing.id}
      `;
      updated += 1;
      continue;
    }

    const [created] = await sql<{ id: number }[]>`
      INSERT INTO gs1_standards (
        standard_code,
        standard_name,
        description,
        category,
        scope,
        reference_url
      ) VALUES (
        ${standard.standardCode},
        ${standard.standardName},
        ${standard.description},
        ${standard.category},
        ${standard.scope},
        ${standard.referenceUrl}
      )
      RETURNING id
    `;
    void created;
    inserted += 1;
  }

  return { inserted, updated };
}

async function seedEsrsDatapoints(sql: postgres.Sql) {
  const rows = await loadEsrsRows();
  const existingRows =
    await sql<{ id: number; code: string }[]>`SELECT id, code FROM esrs_datapoints`;
  const byCode = new Map(existingRows.map((row) => [row.code, row.id]));

  let inserted = 0;
  let updated = 0;

  for (const row of rows) {
    const existingId = byCode.get(row.code);
    if (existingId) {
      await sql`
        UPDATE esrs_datapoints
        SET
          esrs_standard = ${row.esrsStandard},
          disclosure_requirement = ${row.disclosureRequirement},
          paragraph = ${row.paragraph},
          related_ar = ${row.relatedAr},
          name = ${row.name},
          data_type = ${row.dataType},
          conditional = ${row.conditional},
          voluntary = ${row.voluntary},
          sfdr_mapping = ${row.sfdrMapping},
          updated_at = now()
        WHERE id = ${existingId}
      `;
      updated += 1;
      continue;
    }

    const [created] = await sql<{ id: number }[]>`
      INSERT INTO esrs_datapoints (
        code,
        esrs_standard,
        disclosure_requirement,
        paragraph,
        related_ar,
        name,
        data_type,
        conditional,
        voluntary,
        sfdr_mapping
      ) VALUES (
        ${row.code},
        ${row.esrsStandard},
        ${row.disclosureRequirement},
        ${row.paragraph},
        ${row.relatedAr},
        ${row.name},
        ${row.dataType},
        ${row.conditional},
        ${row.voluntary},
        ${row.sfdrMapping}
      )
      RETURNING id
    `;
    byCode.set(row.code, created.id);
    inserted += 1;
  }

  return { inserted, updated, totalParsed: rows.length };
}

async function main() {
  cliOut("READY=postgres_bootstrap_foundation_start");

  const connectionString = resolvePostgresConnectionString();
  if (!connectionString) {
    cliErr("STOP=postgres_bootstrap_foundation_database_url_missing");
    process.exit(1);
  }

  try {
    await applyPostgresMigrations();
    const { regulationsSeedData, gs1StandardsData } =
      await loadFoundationSeedData();
    const sql = postgres(connectionString, {
      max: 1,
      idle_timeout: 5,
      connect_timeout: 15,
      onnotice: () => {},
    });

    try {
      const regulationSummary = await seedRegulations(sql, regulationsSeedData);
      const gs1Summary = await seedGs1Standards(sql, gs1StandardsData);
      const esrsSummary = await seedEsrsDatapoints(sql);

      const [counts] = await sql<{
        regulations_count: string;
        standards_count: string;
        esrs_count: string;
      }[]>`
        SELECT
          (SELECT COUNT(*)::text FROM regulations) AS regulations_count,
          (SELECT COUNT(*)::text FROM gs1_standards) AS standards_count,
          (SELECT COUNT(*)::text FROM esrs_datapoints) AS esrs_count
      `;

      cliOut(
        "INFO=regulations inserted=%d updated=%d total=%s",
        regulationSummary.inserted,
        regulationSummary.updated,
        counts.regulations_count
      );
      cliOut(
        "INFO=gs1_standards inserted=%d updated=%d total=%s",
        gs1Summary.inserted,
        gs1Summary.updated,
        counts.standards_count
      );
      cliOut(
        "INFO=esrs_datapoints inserted=%d updated=%d parsed=%d total=%s",
        esrsSummary.inserted,
        esrsSummary.updated,
        esrsSummary.totalParsed,
        counts.esrs_count
      );
      cliOut("DONE=postgres_bootstrap_foundation_ok");
    } finally {
      await sql.end({ timeout: 5 });
    }
  } catch (error) {
    cliErr("STOP=postgres_bootstrap_foundation_failed");
    cliErr(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

const isDirectRun =
  typeof process.argv[1] === "string" &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main();
}
