/**
 * Database Status Check Script
 * 
 * This script checks the current state of the ISA database without loading
 * the full server environment.
 * 
 * Usage: DATABASE_URL=... pnpm exec tsx scripts/check-db-status.ts
 */

import { createMysqlConnection } from "../server/db-connection";
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);


const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  cliErr("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

async function main() {
  cliOut("=".repeat(60));
  cliOut("ISA Database Status Check");
  cliOut("=".repeat(60));
  cliOut();

  try {
    cliOut("Connecting to database...");
    // Uses ISA's URL parser (supports `?sslmode=require`, `?ssl=true`, etc.)
    const connection = await createMysqlConnection(DATABASE_URL!);
    cliOut("✅ Database connected");
    cliOut();

    // Get table counts
    const tables = [
      "regulations",
      "gs1_standards",
      "knowledge_embeddings",
      "esrs_datapoints",
      "gdsn_classes",
      "gdsn_class_attributes",
      "gdsn_validation_rules",
      "cbv_vocabularies",
      "digital_link_types",
      "ctes_kdes",
      "dpp_identification_rules",
    ];

    cliOut("Table Record Counts:");
    cliOut("-".repeat(40));
    
    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const count = (rows as any)[0]?.count || 0;
        cliOut(`  ${table.padEnd(30)} ${count}`);
      } catch (error) {
        cliOut(`  ${table.padEnd(30)} (table not found)`);
      }
    }

    cliOut();
    cliOut("Embedding Status:");
    cliOut("-".repeat(40));

    // Check regulations embeddings
    const [regTotal] = await connection.execute("SELECT COUNT(*) as count FROM regulations");
    const [regNull] = await connection.execute("SELECT COUNT(*) as count FROM regulations WHERE embedding IS NULL");
    const regTotalCount = (regTotal as any)[0]?.count || 0;
    const regNullCount = (regNull as any)[0]?.count || 0;
    cliOut(`  Regulations: ${regTotalCount - regNullCount}/${regTotalCount} have embeddings`);

    // Check gs1_standards embeddings
    const [stdTotal] = await connection.execute("SELECT COUNT(*) as count FROM gs1_standards");
    const [stdNull] = await connection.execute("SELECT COUNT(*) as count FROM gs1_standards WHERE embedding IS NULL");
    const stdTotalCount = (stdTotal as any)[0]?.count || 0;
    const stdNullCount = (stdNull as any)[0]?.count || 0;
    cliOut(`  GS1 Standards: ${stdTotalCount - stdNullCount}/${stdTotalCount} have embeddings`);

    // Check knowledge_embeddings
    const [keTotal] = await connection.execute("SELECT COUNT(*) as count FROM knowledge_embeddings");
    const keTotalCount = (keTotal as any)[0]?.count || 0;
    cliOut(`  Knowledge Embeddings: ${keTotalCount} total records`);

    cliOut();
    cliOut("=".repeat(60));
    cliOut("Status check complete");
    cliOut("=".repeat(60));

    await connection.end();
    process.exit(0);
  } catch (error) {
    cliErr("Error:", error);
    process.exit(1);
  }
}

main();
