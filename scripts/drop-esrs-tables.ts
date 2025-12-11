import { getDb } from "../server/db";
import { sql } from "drizzle-orm";

async function dropTables() {
  try {
    const db = await getDb();
    if (!db) {
      console.error("❌ Database not available");
      process.exit(1);
    }
    
    await db.execute(sql`DROP TABLE IF EXISTS esrs_datapoints`);
    console.log("✅ Dropped esrs_datapoints");
    
    await db.execute(sql`DROP TABLE IF EXISTS raw_esrs_datapoints`);
    console.log("✅ Dropped raw_esrs_datapoints");
    
    console.log("✅ Tables dropped successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error dropping tables:", error);
    process.exit(1);
  }
}

dropTables();
