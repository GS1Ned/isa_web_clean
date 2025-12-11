/**
 * Mapping Discovery Script
 * Analyzes existing regulation→standard mappings to identify enhancement opportunities
 *
 * Usage: npx tsx scripts/discover-mappings.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import {
  regulations,
  gs1Standards,
  regulationStandardMappings,
} from "../drizzle/schema.ts";
import { eq, like, or, and, sql } from "drizzle-orm";

// Read DATABASE_URL from environment
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ DATABASE_URL not found in environment");
  process.exit(1);
}

// Create database connection
const connection = await mysql.createConnection(dbUrl);
const db = drizzle(connection);

console.log("🔍 Discovering Existing Mappings...\n");

/**
 * Find all mappings for a specific regulation
 */
async function findMappingsForRegulation(regulationKeyword) {
  const regs = await db
    .select()
    .from(regulations)
    .where(
      or(
        like(regulations.title, `%${regulationKeyword}%`),
        like(regulations.celexId, `%${regulationKeyword}%`)
      )
    );

  if (regs.length === 0) {
    console.log(`❌ No regulations found matching "${regulationKeyword}"\n`);
    return;
  }

  console.log(
    `\n📋 Found ${regs.length} regulation(s) matching "${regulationKeyword}":`
  );

  for (const reg of regs) {
    console.log(`\n  ID: ${reg.id}`);
    console.log(`  Title: ${reg.title}`);
    console.log(`  CELEX: ${reg.celexId || "N/A"}`);

    // Find mappings for this regulation
    const mappings = await db
      .select({
        mappingId: regulationStandardMappings.id,
        standardId: regulationStandardMappings.standardId,
        relevanceScore: regulationStandardMappings.relevanceScore,
        mappingReason: regulationStandardMappings.mappingReason,
        standardCode: gs1Standards.standardCode,
        standardName: gs1Standards.standardName,
      })
      .from(regulationStandardMappings)
      .leftJoin(
        gs1Standards,
        eq(regulationStandardMappings.standardId, gs1Standards.id)
      )
      .where(eq(regulationStandardMappings.regulationId, reg.id));

    if (mappings.length === 0) {
      console.log(`  ⚠️  No mappings found for this regulation`);
    } else {
      console.log(`  ✅ ${mappings.length} mapping(s) found:`);
      mappings.forEach(m => {
        console.log(
          `    - ${m.standardName} (${m.standardCode}) | Score: ${m.relevanceScore} | Mapping ID: ${m.mappingId}`
        );
        if (m.mappingReason) {
          const preview = m.mappingReason.substring(0, 100).replace(/\n/g, " ");
          console.log(`      Reason: ${preview}...`);
        }
      });
    }
  }
}

/**
 * Find all standards matching a keyword
 */
async function findStandards(standardKeyword) {
  const standards = await db
    .select()
    .from(gs1Standards)
    .where(
      or(
        like(gs1Standards.standardName, `%${standardKeyword}%`),
        like(gs1Standards.standardCode, `%${standardKeyword}%`)
      )
    );

  if (standards.length === 0) {
    console.log(`❌ No standards found matching "${standardKeyword}"\n`);
    return [];
  }

  console.log(
    `\n📦 Found ${standards.length} standard(s) matching "${standardKeyword}":`
  );
  standards.forEach(std => {
    console.log(
      `  - ID: ${std.id} | ${std.standardName} (${std.standardCode})`
    );
  });

  return standards;
}

/**
 * Get mapping statistics
 */
async function getMappingStats() {
  const totalMappings = await db
    .select({ count: sql`count(*)` })
    .from(regulationStandardMappings);

  const verifiedMappings = await db
    .select({ count: sql`count(*)` })
    .from(regulationStandardMappings)
    .where(eq(regulationStandardMappings.verifiedByAdmin, true));

  const mappingsWithReason = await db
    .select({ count: sql`count(*)` })
    .from(regulationStandardMappings)
    .where(
      sql`${regulationStandardMappings.mappingReason} IS NOT NULL AND ${regulationStandardMappings.mappingReason} != ''`
    );

  console.log("\n📊 Mapping Statistics:");
  console.log(`  Total mappings: ${totalMappings[0].count}`);
  console.log(`  Verified by admin: ${verifiedMappings[0].count}`);
  console.log(`  With mapping reason: ${mappingsWithReason[0].count}`);
}

// Execute discovery
try {
  await getMappingStats();

  console.log("\n\n🔍 Searching for key regulations from colleague reports...");

  await findMappingsForRegulation("EUDR");
  await findMappingsForRegulation("PPWR");
  await findMappingsForRegulation("CSRD");
  await findMappingsForRegulation("DPP");
  await findMappingsForRegulation("Battery");

  console.log("\n\n🔍 Searching for key GS1 standards...");

  await findStandards("EPCIS");
  await findStandards("GDSN");
  await findStandards("Digital Link");
  await findStandards("Web Vocabulary");
  await findStandards("GPC");

  console.log("\n\n✅ Discovery Complete!");
} catch (error) {
  console.error("❌ Error during discovery:", error);
  process.exit(1);
} finally {
  await connection.end();
}
