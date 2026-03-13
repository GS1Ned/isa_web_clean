import { format as utilFormat } from "node:util";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import path from "node:path";
import postgres from "postgres";
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

class IntentionalRollback extends Error {}

function quoteIdent(value: string): string {
  return `"${value.replace(/"/g, "\"\"")}"`;
}

export interface PostgresParitySmokeOptions {
  connectionString?: string;
  schemaName?: string;
  suppressReadyBanner?: boolean;
}

export async function runPostgresParitySmoke(
  options: PostgresParitySmokeOptions = {}
): Promise<void> {
  const connectionString = resolvePostgresConnectionString(options.connectionString);
  if (!connectionString) {
    throw new Error("DATABASE_URL_POSTGRES or DATABASE_URL is required");
  }

  const schemaName = options.schemaName || process.env.SCHEMA_NAME || "public";

  await applyPostgresMigrations({ connectionString, schemaName });

  const sql = postgres(connectionString, {
    max: 1,
    idle_timeout: 5,
    connect_timeout: 15,
    onnotice: () => {},
  });

  try {
    try {
      await sql.begin(async (tx) => {
        if (schemaName !== "public") {
          await tx.unsafe(`SET search_path TO ${quoteIdent(schemaName)}`);
        }

        await tx.unsafe(`
          INSERT INTO sources (name, source_type, authority_level)
          VALUES ('smoke_source', 'official_guidance', 4);

          INSERT INTO source_chunks (source_id, chunk_index, content, content_hash)
          SELECT id, 0, 'smoke chunk content', md5('smoke chunk content')
          FROM sources
          WHERE name = 'smoke_source'
          LIMIT 1;

          INSERT INTO rag_traces (trace_id, query, generated_answer, abstained)
          VALUES ('smoke-trace-001', 'smoke query', 'smoke answer', false);

          INSERT INTO regulations (title, regulation_type)
          VALUES ('Smoke Regulation', 'OTHER');

          INSERT INTO esrs_datapoints (code, name)
          VALUES ('SMOKE_DP_001', 'Smoke Datapoint');

          INSERT INTO gs1_standards (standard_code, standard_name)
          VALUES ('SMOKE_STD_001', 'Smoke Standard');

          INSERT INTO advisory_reports (title, report_type, content, version)
          VALUES ('Smoke Advisory', 'CUSTOM', 'smoke content', '0.0.1');

          WITH latest_report AS (
            SELECT id FROM advisory_reports WHERE title = 'Smoke Advisory' ORDER BY id DESC LIMIT 1
          ),
          latest_reg AS (
            SELECT id FROM regulations WHERE title = 'Smoke Regulation' ORDER BY id DESC LIMIT 1
          )
          INSERT INTO advisory_report_target_regulations (report_id, regulation_id)
          SELECT latest_report.id, latest_reg.id
          FROM latest_report, latest_reg;

          WITH latest_report AS (
            SELECT id FROM advisory_reports WHERE title = 'Smoke Advisory' ORDER BY id DESC LIMIT 1
          ),
          latest_std AS (
            SELECT id FROM gs1_standards WHERE standard_code = 'SMOKE_STD_001' ORDER BY id DESC LIMIT 1
          )
          INSERT INTO advisory_report_target_standards (report_id, standard_id)
          SELECT latest_report.id, latest_std.id
          FROM latest_report, latest_std;
        `);

        const [sourcesCount] = await tx<{ count: string }[]>`SELECT COUNT(*)::text AS count FROM sources`;
        const [chunksCount] = await tx<{ count: string }[]>`SELECT COUNT(*)::text AS count FROM source_chunks`;
        const [tracesCount] = await tx<{ count: string }[]>`SELECT COUNT(*)::text AS count FROM rag_traces`;
        const [regLinksCount] =
          await tx<{ count: string }[]>`SELECT COUNT(*)::text AS count FROM advisory_report_target_regulations`;
        const [stdLinksCount] =
          await tx<{ count: string }[]>`SELECT COUNT(*)::text AS count FROM advisory_report_target_standards`;

        cliOut("INFO=sources_count value=%s", sourcesCount.count);
        cliOut("INFO=chunks_count value=%s", chunksCount.count);
        cliOut("INFO=rag_traces_count value=%s", tracesCount.count);
        cliOut(
          "INFO=advisory_target_regulation_links value=%s",
          regLinksCount.count
        );
        cliOut(
          "INFO=advisory_target_standard_links value=%s",
          stdLinksCount.count
        );

        throw new IntentionalRollback("rollback parity smoke");
      });
    } catch (error) {
      if (!(error instanceof IntentionalRollback)) {
        throw error;
      }
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function main() {
  cliOut("READY=postgres_parity_smoke_start");

  try {
    await runPostgresParitySmoke();
    cliOut("DONE=postgres_parity_smoke_pass");
  } catch (error) {
    cliErr("STOP=postgres_parity_smoke_failed");
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
