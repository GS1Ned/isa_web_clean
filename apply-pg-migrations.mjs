/**
 * Apply Postgres migrations directly to Supabase.
 * Runs each migration SQL file in order via the postgres-js driver.
 */
import postgres from "postgres";
import fs from "node:fs";
import path from "node:path";

const pgUrl = process.env.DATABASE_URL_POSTGRES;
if (!pgUrl) {
  console.error("DATABASE_URL_POSTGRES is required");
  process.exit(1);
}

const sql = postgres(pgUrl, {
  max: 1,
  idle_timeout: 5,
  connect_timeout: 15,
  prepare: false,
  ssl: "require",
});

const migrationsDir = path.join(process.cwd(), "drizzle_pg", "migrations");
const files = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith(".sql"))
  .sort();

console.log(`Found ${files.length} migration files`);

for (const file of files) {
  const filePath = path.join(migrationsDir, file);
  const sqlContent = fs.readFileSync(filePath, "utf-8");
  console.log(`Applying: ${file} (${sqlContent.length} chars)...`);
  try {
    await sql.unsafe(sqlContent);
    console.log(`  ✓ ${file} applied`);
  } catch (err) {
    console.error(`  ✗ ${file} failed:`, err.message);
    // Continue with remaining migrations
  }
}

// Verify tables were created
const tables = await sql`
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  ORDER BY table_name
`;
console.log(`\nCreated ${tables.length} tables:`);
tables.forEach(t => console.log(`  - ${t.table_name}`));

await sql.end({ timeout: 5 });
console.log("\nDone!");
