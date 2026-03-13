import { format as utilFormat } from "node:util";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import path from "node:path";
import postgres from "postgres";
import {
  applyPostgresMigrations,
  resolvePostgresConnectionString,
} from "./postgres-apply-migrations";
import { runPostgresParitySmoke } from "./postgres-parity-smoke";

const cliOut = (...args: unknown[]) =>
  process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args: unknown[]) =>
  process.stderr.write(`${utilFormat(...args)}\n`);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
dotenv.config({ path: path.join(repoRoot, ".env"), quiet: true });

function quoteIdent(value: string): string {
  return `"${value.replace(/"/g, "\"\"")}"`;
}

async function main() {
  const connectionString = resolvePostgresConnectionString();
  const schemaName = process.env.SCHEMA_NAME || "public";
  const skipSmoke = process.env.SKIP_SMOKE === "1";

  cliOut("READY=pg_rehydrate_start schema=%s", schemaName);

  if (!connectionString) {
    cliErr("STOP=pg_rehydrate_database_url_missing");
    process.exit(1);
  }

  const sql = postgres(connectionString, {
    max: 1,
    idle_timeout: 5,
    connect_timeout: 15,
    onnotice: () => {},
  });

  try {
    await sql.unsafe(`
      DROP SCHEMA IF EXISTS ${quoteIdent(schemaName)} CASCADE;
      CREATE SCHEMA ${quoteIdent(schemaName)};
    `);
  } finally {
    await sql.end({ timeout: 5 });
  }

  try {
    await applyPostgresMigrations({ connectionString, schemaName });
    cliOut("DONE=pg_rehydrate_migrations_applied");

    if (skipSmoke) {
      cliOut("INFO=pg_rehydrate_smoke_skipped");
    } else {
      cliOut("INFO=pg_rehydrate_running_smoke");
      await runPostgresParitySmoke({
        connectionString,
        schemaName,
        suppressReadyBanner: true,
      });
    }

    cliOut("DONE=pg_rehydrate_complete schema=%s", schemaName);
  } catch (error) {
    cliErr("STOP=pg_rehydrate_failed");
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
