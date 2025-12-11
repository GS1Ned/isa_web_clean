import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read DATABASE_URL from .env
import { config } from "dotenv";
config({ path: join(__dirname, "..", ".env") });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL not found in environment");
  process.exit(1);
}

// Extract database path from URL (format: file:///path/to/db.sqlite)
const dbPath = dbUrl.replace("file://", "");

const db = new Database(dbPath, { readonly: true });

console.log("=== Key Regulations for Data Quality Update ===\n");

const regulations = ["EUDR", "PPWR", "VSME", "DPP", "Battery", "ESPR", "CSRD"];

regulations.forEach(keyword => {
  const results = db
    .prepare(
      `
    SELECT id, title, celexId, effectiveDate, 
           SUBSTR(description, 1, 150) as desc_preview
    FROM regulations 
    WHERE title LIKE ? OR title LIKE ?
    LIMIT 3
  `
    )
    .all(`%${keyword}%`, `%${keyword.toLowerCase()}%`);

  if (results.length > 0) {
    console.log(`\n### ${keyword} Regulations:`);
    results.forEach(reg => {
      console.log(`\nID: ${reg.id}`);
      console.log(`Title: ${reg.title}`);
      console.log(`CELEX: ${reg.celexId || "N/A"}`);
      console.log(`Effective Date: ${reg.effectiveDate || "N/A"}`);
      console.log(`Description: ${reg.desc_preview}...`);
    });
  }
});

db.close();
