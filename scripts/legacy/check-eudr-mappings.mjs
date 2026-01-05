import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { regulationStandardMappings, gs1Standards } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const mappings = await db
  .select()
  .from(regulationStandardMappings)
  .where(eq(regulationStandardMappings.regulationId, 30006));

console.log(`\nEUDR (ID 30006) has ${mappings.length} mapped standards:\n`);

for (const mapping of mappings) {
  const standards = await db
    .select()
    .from(gs1Standards)
    .where(eq(gs1Standards.id, mapping.standardId));
  if (standards.length > 0) {
    console.log(`  ✓ ${standards[0].standardName}`);
    console.log(`    Standard ID: ${mapping.standardId}`);
    console.log(`    Mapping ID: ${mapping.id}`);
    console.log(`    Score: ${mapping.relevanceScore}`);
    console.log();
  }
}

await connection.end();
