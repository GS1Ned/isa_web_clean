#!/usr/bin/env node
/**
 * GS1 Standards Ingestion Script
 *
 * Parses GS1 Standards Log and populates gs1_standards table
 * Source: https://www.gs1.org/standards/log
 *
 * Usage: npx tsx server/ingest-gs1-standards.ts
 */

import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../drizzle/schema.ts";
import { createMysqlConnection } from "./db-connection";
import { serverLogger } from "./_core/logger-wiring";


/**
 * GS1 Standards data extracted from https://www.gs1.org/standards/log
 */
const gs1Standards = [
  {
    date: "2025-11-01",
    name: "GS1 Attribute Definitions for Business",
    version: "Release 2.10 Issue 2",
    category: "Data Standards",
  },
  {
    date: "2025-11-01",
    name: "GS1 Web Vocabulary",
    version: "Release 1.17",
    category: "Data Standards",
  },
  {
    date: "2025-10-01",
    name: "EPC Tag Data Standard (TDS)",
    version: "Release 2.3",
    category: "RFID & Sensors",
  },
  {
    date: "2024-03-01",
    name: "GSCN 24-004 Medical Device definition",
    version: "2024",
    category: "Healthcare",
  },
  {
    date: "2024-03-01",
    name: "GDSN Trade Item Implementation Guide",
    version: "Release 37",
    category: "Supply Chain",
  },
  {
    date: "2024-03-01",
    name: "GS1 Package and Product Measurement Standard",
    version: "Release 3.2",
    category: "Product Standards",
  },
  {
    date: "2024-12-01",
    name: "GSCN 24-296 Removal of GTIN-8 as an option for AI (03)",
    version: "2024",
    category: "Identification",
  },
  {
    date: "2023-10-01",
    name: "GSCN 23-169 Barcode Placement",
    version: "2023",
    category: "Barcodes",
  },
  {
    date: "2023-10-01",
    name: "GSCN 23-070 Related Trade Items",
    version: "2023",
    category: "Product Standards",
  },
  {
    date: "2023-10-01",
    name: "GSMP Manual",
    version: "Release 3.7",
    category: "Governance",
  },
  {
    date: "2023-09-01",
    name: "GS1 GTIN Management Standard",
    version: "2023",
    category: "Identification",
  },
  {
    date: "2023-08-01",
    name: "GSCN 22-250 Non-new identification rules/application standard",
    version: "2023",
    category: "Identification",
  },
  {
    date: "2023-06-01",
    name: "GS1 Global Data Model Market Stages Guideline",
    version: "Release 1.0",
    category: "Data Standards",
  },
  {
    date: "2023-06-01",
    name: "GS1 Pharmaceutical Clinical Trial Electronic Messaging Standard Implementation Guideline",
    version: "Release 1.2",
    category: "Healthcare",
  },
  {
    date: "2023-06-01",
    name: "GS1 EDI Clinical Trials: Semantic models of the healthcare clinical trials package",
    version: "2023",
    category: "Healthcare",
  },
  {
    date: "2023-06-01",
    name: "GSCN 21-307 New GS1 Application Identifier for digital signatures",
    version: "2023",
    category: "Security",
  },
  {
    date: "2023-03-01",
    name: "EPCIS & CBV Implementation Guideline",
    version: "Release 2.0",
    category: "Supply Chain",
  },
  {
    date: "2023-01-01",
    name: "GTIN Management Guideline for Construction Products",
    version: "Release 1.0",
    category: "Construction",
  },
  {
    date: "2022-11-01",
    name: "GSCN 22-309 GS1 Digital Link URI format for 2D in retail",
    version: "2022",
    category: "Digital",
  },
  {
    date: "2022-11-01",
    name: "GS1 EDI Semantics business document specification and technical mappings for DESPATCH ADVICE",
    version: "Release 1.0",
    category: "Supply Chain",
  },
  {
    date: "2022-11-01",
    name: "GS1 Semantic Model Methodology Writing Rules Standard",
    version: "Release 1.1",
    category: "Data Standards",
  },
  {
    date: "2022-11-01",
    name: "GS1 Semantic Model Methodology for EDI Standard",
    version: "Release 1.1",
    category: "Supply Chain",
  },
  {
    date: "2022-10-01",
    name: "GS1 Mobile Ready Hero Images Guideline",
    version: "Release 2.1",
    category: "Digital",
  },
  {
    date: "2022-08-01",
    name: "GS1 EANCOM Standard",
    version: "2022",
    category: "Supply Chain",
  },
  {
    date: "2022-08-01",
    name: "GSCN 22-163 New GS1 Application Identifier 7011 for Test by Date",
    version: "2022",
    category: "Healthcare",
  },
  {
    date: "2022-07-01",
    name: "GSCN 22-031 Future State Retail Application Standard Profiles (Barcode Conformance)",
    version: "2022",
    category: "Retail",
  },
  {
    date: "2022-06-01",
    name: "GSCN 21-423 Updates for the identification of product bundles",
    version: "2022",
    category: "Product Standards",
  },
  {
    date: "2022-06-01",
    name: "Core Business Vocabulary Standard",
    version: "Release 2.0",
    category: "Supply Chain",
  },
  {
    date: "2022-06-01",
    name: "EPCIS",
    version: "Release 2.0",
    category: "Supply Chain",
  },
  {
    date: "2022-05-01",
    name: "GS1 EDI Semantics business document specification and technical mappings for ORDER",
    version: "Release 1.0",
    category: "Supply Chain",
  },
  {
    date: "2022-05-01",
    name: "GS1 EDI Semantics business document specification and technical mappings for ORDER_RESPONSE",
    version: "Release 1.0",
    category: "Supply Chain",
  },
  {
    date: "2022-01-01",
    name: "GS1 EDI Semantics business document specification and technical mappings for INVOICE",
    version: "Release 1.0",
    category: "Supply Chain",
  },
  {
    date: "2021-12-01",
    name: "Encoding Transport Process Information GS1 Implementation Guideline",
    version: "Release 1.1",
    category: "Logistics",
  },
  {
    date: "2021-11-01",
    name: "GS1 Product Image Sharing/Delivery Guideline",
    version: "2021",
    category: "Digital",
  },
  {
    date: "2021-11-01",
    name: "GSCN 21-287 Healthcare Minimum AIDC marking revision",
    version: "2021",
    category: "Healthcare",
  },
];

/**
 * Ingest GS1 standards into database
 */
async function ingestGS1Standards() {
  console.log("[GS1 Ingestion] Starting GS1 Standards Log ingestion...\n");

  // Database connection
  const connection = await createMysqlConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: "default" });

  let inserted = 0;
  let skipped = 0;

  for (const standard of gs1Standards) {
    try {
      await db
        .insert(schema.gs1Standards)
        .values({
          standardCode: standard.name.substring(0, 64), // Use name as code (truncated)
          standardName: standard.name,
          description: `${standard.version} - Official GS1 standard published ${standard.date}`,
          category: standard.category,
          scope: `Published: ${standard.date}`,
          referenceUrl: "https://www.gs1.org/standards/log",
        })
        .execute();
      inserted++;
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        skipped++;
      } else {
        serverLogger.error(`[GS1 Ingestion] ❌ Error inserting ${standard.name}:`, error.message);
        skipped++;
      }
    }
  }

  console.log("[GS1 Ingestion] ✅ Ingestion complete!");
  console.log(`[GS1 Ingestion]   Total inserted: ${inserted}`);
  console.log(`[GS1 Ingestion]   Total skipped: ${skipped}`);
  console.log(`[GS1 Ingestion]   Total processed: ${inserted + skipped}\n`);

  await connection.end();
}

// Run ingestion
ingestGS1Standards().catch(error => {
  serverLogger.error("[GS1 Ingestion] ❌ Fatal error:", error);
  process.exit(1);
});
