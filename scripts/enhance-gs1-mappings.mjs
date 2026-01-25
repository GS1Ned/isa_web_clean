/**
 * GS1 Mapping Rationale Enhancement Script
 * Adds technical implementation context to regulation→standard mappings
 *
 * Usage: npx tsx scripts/enhance-gs1-mappings.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import {
  regulations,
  gs1Standards,
  regulationStandardMappings,
} from "../drizzle/schema.ts";
import { eq, like, and } from "drizzle-orm";

// Read DATABASE_URL from environment
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ DATABASE_URL not found in environment");
  process.exit(1);
}

// Create database connection
const connection = await mysql.createConnection(dbUrl);
const db = drizzle(connection);

console.log("🚀 Starting GS1 Mapping Rationale Enhancement...\n");

// Track changes
const changes = [];

/**
 * Enhancement 1: EUDR → EPCIS Mapping
 * Add technical implementation details for traceability
 */
async function enhanceEUDR_EPCIS() {
  console.log("📝 Enhancing EUDR→EPCIS mapping...");

  // Find EUDR regulation
  const eudrReg = await db
    .select()
    .from(regulations)
    .where(eq(regulations.celexId, "32023R1115"))
    .limit(1);

  if (eudrReg.length === 0) {
    console.log("⚠️  EUDR regulation not found");
    return;
  }

  // Find EPCIS standard
  const epcisStd = await db
    .select()
    .from(gs1Standards)
    .where(like(gs1Standards.standardName, "%EPCIS%"))
    .limit(1);

  if (epcisStd.length === 0) {
    console.log("⚠️  EPCIS standard not found");
    return;
  }

  // Find existing mapping
  const mapping = await db
    .select()
    .from(regulationStandardMappings)
    .where(
      and(
        eq(regulationStandardMappings.regulationId, eudrReg[0].id),
        eq(regulationStandardMappings.standardId, epcisStd[0].id)
      )
    )
    .limit(1);

  if (mapping.length === 0) {
    console.log("⚠️  EUDR→EPCIS mapping not found");
    return;
  }

  const enhancedRationale =
    (mapping[0].mappingReason || "") +
    "\n\n**Technical Implementation:** EUDR traceability requirements map to EPCIS 2.0 events capturing product movement through supply chains." +
    "\n\n**Key EPCIS Event Types:**" +
    "\n- **ObjectEvent:** Record product creation with geolocation (latitude/longitude within 1 arc-minute precision). Use `readPoint` with `geo:lat` and `geo:long` attributes." +
    "\n- **TransformationEvent:** Track processing steps (e.g., coffee beans → roasted coffee). Links input products to output products." +
    "\n- **AggregationEvent:** Link individual products to shipping containers for logistics tracking." +
    "\n\n**EDI Integration:** Communicate Due Diligence Statement (DDS) Reference Numbers via EDI segments in DESADV (Despatch Advice) messages:" +
    "\n- **RFF+DDR:** DDS Reference Number (unique identifier from TRACES system)" +
    "\n- **RFF+DDV:** DDS Verification Code (for customs validation)" +
    "\n\n**EUDR Article References:**" +
    "\n- Article 9: Due Diligence System requirements" +
    "\n- Article 10: Geolocation data requirements (1 arc-minute precision)" +
    "\n- Article 33: Information sharing obligations in supply chain";

  await db
    .update(regulationStandardMappings)
    .set({
      mappingReason: enhancedRationale,
      updatedAt: new Date(),
    })
    .where(eq(regulationStandardMappings.id, mapping[0].id));

  changes.push(
    `✅ Enhanced EUDR→EPCIS mapping (ID: ${mapping[0].id}) - Added EPCIS event types and EDI segment references`
  );
}

/**
 * Enhancement 2: PPWR → GDSN Mapping
 * Add XML tag examples and material sub-type context
 */
async function enhancePPWR_GDSN() {
  console.log("📝 Enhancing PPWR→GDSN mapping...");

  // Find PPWR regulation
  const ppwrReg = await db
    .select()
    .from(regulations)
    .where(eq(regulations.celexId, "32024R1157"))
    .limit(1);

  if (ppwrReg.length === 0) {
    console.log("⚠️  PPWR regulation not found");
    return;
  }

  // Find GDSN standard
  const gdsnStd = await db
    .select()
    .from(gs1Standards)
    .where(like(gs1Standards.standardName, "%GDSN%"))
    .limit(1);

  if (gdsnStd.length === 0) {
    console.log("⚠️  GDSN standard not found");
    return;
  }

  // Find existing mapping
  const mapping = await db
    .select()
    .from(regulationStandardMappings)
    .where(
      and(
        eq(regulationStandardMappings.regulationId, ppwrReg[0].id),
        eq(regulationStandardMappings.standardId, gdsnStd[0].id)
      )
    )
    .limit(1);

  if (mapping.length === 0) {
    console.log("⚠️  PPWR→GDSN mapping not found");
    return;
  }

  const enhancedRationale =
    (mapping[0].mappingReason || "") +
    "\n\n**Technical Implementation:** PPWR recyclability labeling requirements map to GDSN packaging attributes in product master data." +
    "\n\n**Key GDSN XML Tags:**" +
    "\n- `<packagingMaterialTypeCode>`: Material sub-type (e.g., PET_TRANSPARENT, PET_OPAQUE, HDPE_NATURAL, HDPE_COLORED, PP_CLEAR, PS_FOAM)" +
    "\n- `<packagingRecyclabilityCode>`: Recyclability classification (RECYCLABLE, NOT_RECYCLABLE, CONDITIONALLY_RECYCLABLE)" +
    "\n- `<packagingRecycledContentPercentage>`: Post-consumer recycled (PCR) content (0-100%)" +
    "\n- `<packagingWeight>`: Weight in grams for EPR fee calculation" +
    "\n\n**Example GDSN XML:**" +
    "\n```xml" +
    "\n<packagingInformation>" +
    "\n  <packagingMaterialTypeCode>PET_TRANSPARENT</packagingMaterialTypeCode>" +
    "\n  <packagingRecyclabilityCode>RECYCLABLE</packagingRecyclabilityCode>" +
    "\n  <packagingRecycledContentPercentage>25</packagingRecycledContentPercentage>" +
    '\n  <packagingWeight unitCode="GRM">15</packagingWeight>' +
    "\n</packagingInformation>" +
    "\n```" +
    "\n\n**Dutch EPR Context (Verpact):** Material sub-type granularity enables differentiated EPR fees. PET_TRANSPARENT (high recyclability) pays lower fees than PET_OPAQUE (lower recyclability)." +
    "\n\n**PPWR Article References:**" +
    "\n- Article 11: Recyclability labeling requirements" +
    "\n- Article 44: Extended Producer Responsibility (EPR) requirements" +
    "\n- Annex VII: Packaging material categories and sub-types";

  await db
    .update(regulationStandardMappings)
    .set({
      mappingReason: enhancedRationale,
      updatedAt: new Date(),
    })
    .where(eq(regulationStandardMappings.id, mapping[0].id));

  changes.push(
    `✅ Enhanced PPWR→GDSN mapping (ID: ${mapping[0].id}) - Added XML tags and EPR fee context`
  );
}

/**
 * Enhancement 3: DPP → GS1 Web Vocabulary Mapping
 * Add JSON-LD examples and Digital Link context
 */
async function enhanceDPP_WebVocabulary() {
  console.log("📝 Enhancing DPP→GS1 Web Vocabulary mapping...");

  // Find DPP regulation (Battery or Textile)
  const dppReg = await db
    .select()
    .from(regulations)
    .where(like(regulations.title, "%Digital Product Passport%"))
    .limit(1);

  if (dppReg.length === 0) {
    console.log("⚠️  DPP regulation not found");
    return;
  }

  // Find GS1 Web Vocabulary standard
  const webVocabStd = await db
    .select()
    .from(gs1Standards)
    .where(like(gs1Standards.standardName, "%Web Vocabulary%"))
    .limit(1);

  if (webVocabStd.length === 0) {
    console.log("⚠️  GS1 Web Vocabulary standard not found");
    return;
  }

  // Find existing mapping
  const mapping = await db
    .select()
    .from(regulationStandardMappings)
    .where(
      and(
        eq(regulationStandardMappings.regulationId, dppReg[0].id),
        eq(regulationStandardMappings.standardId, webVocabStd[0].id)
      )
    )
    .limit(1);

  if (mapping.length === 0) {
    console.log("⚠️  DPP→Web Vocabulary mapping not found");
    return;
  }

  const enhancedRationale =
    (mapping[0].mappingReason || "") +
    "\n\n**Technical Implementation:** DPP sustainability information maps to GS1 Web Vocabulary (JSON-LD) properties accessible via GS1 Digital Link QR codes." +
    "\n\n**Key GS1 Web Vocabulary Properties:**" +
    "\n- `gs1:sustainabilityInfo`: URL link to full Digital Product Passport data" +
    "\n- `gs1:materialComposition`: Material breakdown with percentages (e.g., 60% cotton, 40% polyester)" +
    "\n- `gs1:countryOfOrigin`: Production country (ISO 3166-1 alpha-2 code)" +
    "\n- `gs1:recyclingInformation`: End-of-life disposal instructions" +
    "\n- `gs1:certificationInfo`: Sustainability certifications (e.g., GOTS, Fair Trade)" +
    "\n\n**Example JSON-LD:**" +
    "\n```json" +
    "\n{" +
    '\n  "@context": "https://gs1.org/voc/",' +
    '\n  "@type": "Product",' +
    '\n  "gtin": "09506000134352",' +
    '\n  "sustainabilityInfo": "https://example.com/dpp/09506000134352",' +
    '\n  "materialComposition": [' +
    '\n    {"material": "cotton", "percentage": 60},' +
    '\n    {"material": "polyester", "percentage": 40}' +
    "\n  ]," +
    '\n  "countryOfOrigin": "BD",' +
    '\n  "recyclingInformation": "Textile recycling bin or donation center"' +
    "\n}" +
    "\n```" +
    "\n\n**GS1 Digital Link URL Structure:**" +
    "\n`https://id.gs1.org/01/{GTIN}/21/{serialNumber}?linkType=sustainabilityInfo`" +
    "\n\n**ESPR Article References:**" +
    "\n- Article 8: Digital Product Passport requirements" +
    "\n- Article 9: Product information accessibility via QR codes" +
    "\n- Annex III: Minimum DPP information requirements";

  await db
    .update(regulationStandardMappings)
    .set({
      mappingReason: enhancedRationale,
      updatedAt: new Date(),
    })
    .where(eq(regulationStandardMappings.id, mapping[0].id));

  changes.push(
    `✅ Enhanced DPP→Web Vocabulary mapping (ID: ${mapping[0].id}) - Added JSON-LD examples and Digital Link context`
  );
}

/**
 * Enhancement 4: CSRD → ESRS Datapoints Mapping
 * Add XBRL taxonomy context
 */
async function enhanceCSRD_ESRS() {
  console.log("📝 Enhancing CSRD→ESRS mapping...");

  // Find CSRD regulation
  const csrdReg = await db
    .select()
    .from(regulations)
    .where(like(regulations.title, "%CSRD%"))
    .limit(1);

  if (csrdReg.length === 0) {
    console.log("⚠️  CSRD regulation not found");
    return;
  }

  // Note: ESRS is not a GS1 standard, but we can enhance related mappings
  // For now, we'll update the regulation description with ESRS context
  // This was already done in the previous script, so we'll skip here

  console.log(
    "ℹ️  CSRD→ESRS context already enhanced in regulation description"
  );
}

// Execute all enhancements
try {
  await enhanceEUDR_EPCIS();
  await enhancePPWR_GDSN();
  await enhanceDPP_WebVocabulary();
  await enhanceCSRD_ESRS();

  console.log("\n✅ GS1 Mapping Rationale Enhancement Complete!\n");
  console.log("📊 Summary of Changes:");
  changes.forEach(change => console.log(change));
  console.log(`\n🎯 Total mappings enhanced: ${changes.length}`);
} catch (error) {
  console.error("❌ Error during mapping enhancement:", error);
  process.exit(1);
} finally {
  await connection.end();
}
