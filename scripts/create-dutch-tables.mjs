import { getDb } from "../server/db.ts";
import { readFileSync } from "fs";

async function createDutchInitiativesTables() {
  const db = await getDb();
  if (!db) {
    console.error("Failed to connect to database");
    process.exit(1);
  }

  console.log("Creating Dutch initiatives tables...");

  try {
    // Execute CREATE TABLE statements in correct order (parent tables first)
    const statements = [
      // 1. Create main dutch_initiatives table first
      readFileSync("./scripts/create-dutch-initiatives-tables.sql", "utf-8")
        .split("CREATE TABLE IF NOT EXISTS `initiative_regulation_mappings`")[0]
        .split(";")
        .find(s =>
          s.includes("CREATE TABLE IF NOT EXISTS `dutch_initiatives`")
        ),
      // 2. Create mapping tables after
      readFileSync("./scripts/create-dutch-initiatives-tables.sql", "utf-8")
        .split(";")
        .find(s =>
          s.includes(
            "CREATE TABLE IF NOT EXISTS `initiative_regulation_mappings`"
          )
        ),
      readFileSync("./scripts/create-dutch-initiatives-tables.sql", "utf-8")
        .split(";")
        .find(s =>
          s.includes(
            "CREATE TABLE IF NOT EXISTS `initiative_standard_mappings`"
          )
        ),
    ].filter(Boolean);

    for (const statement of statements) {
      const tableName =
        statement.match(/CREATE TABLE IF NOT EXISTS `([^`]+)`/)?.[1] ||
        "unknown";
      console.log(`Creating table: ${tableName}`);
      await db.execute(statement.trim());
      console.log("✓ Success");
    }

    console.log("\n✅ All Dutch initiatives tables created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    process.exit(1);
  }
}

createDutchInitiativesTables();
