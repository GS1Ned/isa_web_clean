import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { format as utilFormat } from "node:util";
import dotenv from "dotenv";
import postgres from "postgres";

const cliOut = (...args: unknown[]) =>
  process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args: unknown[]) =>
  process.stderr.write(`${utilFormat(...args)}\n`);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
dotenv.config({ path: path.join(repoRoot, ".env"), quiet: true });

export interface PostgresMigrationOptions {
  connectionString?: string;
  migrationsDir?: string;
  schemaName?: string;
}

function quoteIdent(value: string): string {
  return `"${value.replace(/"/g, "\"\"")}"`;
}

export function resolvePostgresConnectionString(
  provided?: string
): string {
  return provided || process.env.DATABASE_URL_POSTGRES || process.env.DATABASE_URL || "";
}

export function resolvePostgresMigrationsDir(
  provided?: string
): string {
  return provided || path.join(repoRoot, "drizzle_pg", "migrations");
}

export async function applyPostgresMigrations(
  options: PostgresMigrationOptions = {}
): Promise<number> {
  const connectionString = resolvePostgresConnectionString(options.connectionString);
  if (!connectionString) {
    throw new Error("DATABASE_URL_POSTGRES or DATABASE_URL is required");
  }

  const migrationsDir = resolvePostgresMigrationsDir(options.migrationsDir);
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .map((name) => path.join(migrationsDir, name));

  if (migrationFiles.length === 0) {
    throw new Error(`No SQL migrations found in: ${migrationsDir}`);
  }

  const sql = postgres(connectionString, {
    max: 1,
    idle_timeout: 5,
    connect_timeout: 15,
    onnotice: () => {},
  });

  try {
    for (const migrationFile of migrationFiles) {
      const contents = fs.readFileSync(migrationFile, "utf8");
      await sql.begin(async (tx) => {
        if (options.schemaName && options.schemaName !== "public") {
          await tx.unsafe(`SET search_path TO ${quoteIdent(options.schemaName)}`);
        }
        await tx.unsafe(contents);
      });
    }
  } finally {
    await sql.end({ timeout: 5 });
  }

  return migrationFiles.length;
}

async function main() {
  cliOut("READY=postgres_apply_migrations_start");

  try {
    const count = await applyPostgresMigrations({
      schemaName: process.env.SCHEMA_NAME || "public",
    });
    cliOut("DONE=postgres_apply_migrations_ok count=%d", count);
  } catch (error) {
    cliErr("STOP=postgres_apply_migrations_failed");
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
