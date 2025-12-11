import { getDb } from "./db";
import { regulations } from "../drizzle/schema";
import { sql } from "drizzle-orm";

async function checkRegulations() {
  const db = await getDb();
  if (!db) {
    console.log("Database not available");
    process.exit(1);
  }

  const count = await db.select({ count: sql`COUNT(*)` }).from(regulations);
  console.log("Total regulations:", count[0].count);

  const sample = await db.select().from(regulations).limit(10);
  console.log("\nSample CELEX IDs:");
  sample.forEach(r =>
    console.log(`- ${r.celexId}: ${r.title?.substring(0, 60)}...`)
  );

  process.exit(0);
}

checkRegulations();
