import { getDb } from "../server/db";
import { sql } from "drizzle-orm";
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);


async function createTables() {
  try {
    const db = await getDb();
    if (!db) {
      cliErr("❌ Database not available");
      process.exit(1);
    }
    
    // Create raw_esrs_datapoints table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS raw_esrs_datapoints (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(100) NOT NULL,
        esrs_standard VARCHAR(50),
        disclosure_requirement VARCHAR(100),
        paragraph VARCHAR(100),
        related_ar VARCHAR(100),
        name TEXT NOT NULL,
        data_type_raw VARCHAR(100),
        conditional_raw BOOLEAN DEFAULT FALSE,
        voluntary_raw BOOLEAN DEFAULT FALSE,
        sfdr_mapping VARCHAR(255),
        sheet_name VARCHAR(50),
        row_index INT,
        raw_json JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        INDEX idx_raw_esrs_code (code),
        INDEX idx_raw_esrs_sheet (sheet_name)
      )
    `);
    cliOut("✅ Created raw_esrs_datapoints table");
    
    // Create esrs_datapoints table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS esrs_datapoints (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(100) NOT NULL UNIQUE,
        esrs_standard VARCHAR(50),
        disclosure_requirement VARCHAR(100),
        paragraph VARCHAR(100),
        related_ar VARCHAR(100),
        name TEXT NOT NULL,
        data_type VARCHAR(50),
        conditional BOOLEAN DEFAULT FALSE,
        voluntary BOOLEAN DEFAULT FALSE,
        sfdr_mapping VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        INDEX idx_esrs_code (code),
        INDEX idx_esrs_standard (esrs_standard)
      )
    `);
    cliOut("✅ Created esrs_datapoints table");
    
    cliOut("✅ All ESRS tables created successfully");
    process.exit(0);
  } catch (error) {
    cliErr("❌ Error creating tables:", error);
    process.exit(1);
  }
}

createTables();
