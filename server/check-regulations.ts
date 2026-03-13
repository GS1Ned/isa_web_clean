import { getDb } from "./db";
import { regulations } from "../drizzle/schema";
import { sql } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";

async function checkRegulations() {
  const db = await getDb();
  if (!db) {
    serverLogger.error("Database not available");
    process.exit(1);
  }

  const count = await db.select({ count: sql`COUNT(*)` }).from(regulations);
  serverLogger.info(`Total regulations: ${String(count[0].count)}`);

  const sample = await db.select().from(regulations).limit(10);
  serverLogger.info("\nSample CELEX IDs:");
  sample.forEach(r =>
    serverLogger.info(`- ${r.celexId}: ${r.title?.substring(0, 60)}...`)
  );

  process.exit(0);
}

checkRegulations();
