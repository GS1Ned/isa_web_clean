import { getDb } from "./db";
import { regulations } from "../drizzle/schema";
import { sql } from "drizzle-orm";

async function checkRegulations() {
  const db = await getDb();
  if (!db) {
    serverLogger.info("Database not available");
    process.exit(1);
  }

  const count = await db.select({ count: sql`COUNT(*)` }).from(regulations);
  serverLogger.info("Total regulations:", count[0].count);

  const sample = await db.select().from(regulations).limit(10);
  serverLogger.info("\nSample CELEX IDs:");
  sample.forEach(r =>
    serverLogger.info(`- ${r.celexId}: ${r.title?.substring(0, 60)}...`)
  );

  process.exit(0);
}

checkRegulations();
