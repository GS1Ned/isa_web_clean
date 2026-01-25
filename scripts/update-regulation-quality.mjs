/**
 * Data Quality Enhancement Script
 * Updates regulation timelines and descriptions based on colleague report insights
 *
 * Usage: node scripts/update-regulation-quality.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { regulations } from "../drizzle/schema.ts";
import { eq, like, or } from "drizzle-orm";

// Read DATABASE_URL from environment
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ DATABASE_URL not found in environment");
  process.exit(1);
}

// Create database connection
const connection = await mysql.createConnection(dbUrl);
const db = drizzle(connection);

console.log("🚀 Starting Data Quality Enhancement...\n");

// Track changes
const changes = [];

/**
 * Update 1: EUDR Timeline Correction
 * Source: Colleague report - 12-month delay announced October 2024
 */
async function updateEUDR() {
  console.log("📝 Updating EUDR timeline...");

  const eudrRegs = await db
    .select()
    .from(regulations)
    .where(
      or(
        eq(regulations.celexId, "32023R1115"),
        like(regulations.title, "%Deforestation%"),
        like(regulations.title, "%EUDR%")
      )
    );

  for (const reg of eudrRegs) {
    const enhancedDescription =
      reg.description +
      "\n\n**Implementation Timeline:** Large operators (>500 employees, >€150M turnover) must comply by December 30, 2026. SMEs and smaller operators have until June 30, 2027. This represents a 12-month delay from the original October 2024 timeline, announced in October 2024 to allow adequate implementation preparation." +
      "\n\n**Due Diligence System (DDS):** Operators must submit Due Diligence Statements to the EU TRACES system. Each DDS receives a unique reference number that must be communicated in supply chain documentation using EDI segment RFF+DDR (DDS Reference Number) and RFF+DDV (DDS Verification Code)." +
      "\n\n**Geolocation Requirements:** Article 9 mandates geolocation data (latitude/longitude) for all production plots with precision of 1 arc-minute (approximately 2 km). This data must be captured in EPCIS ObjectEvents with geo:lat and geo:long attributes.";

    await db
      .update(regulations)
      .set({
        effectiveDate: new Date("2026-12-30"),
        description: enhancedDescription,
        updatedAt: new Date(),
      })
      .where(eq(regulations.id, reg.id));

    changes.push(
      `✅ Updated EUDR (ID: ${reg.id}) - Timeline: Dec 30, 2026 | Enhanced description with TRACES and geolocation context`
    );
  }
}

/**
 * Update 2: PPWR Context Enhancement
 * Source: Colleague report - Verpact fee structure and material sub-types
 */
async function updatePPWR() {
  console.log("📝 Updating PPWR context...");

  const ppwrRegs = await db
    .select()
    .from(regulations)
    .where(
      or(
        eq(regulations.celexId, "32024R1157"),
        like(regulations.title, "%PPWR%"),
        like(regulations.title, "%Packaging%Waste%")
      )
    );

  for (const reg of ppwrRegs) {
    const enhancedDescription =
      reg.description +
      "\n\n**Application Date:** The regulation becomes applicable in August 2026, with phased implementation of specific requirements through 2030." +
      "\n\n**Material Sub-Type Requirements:** Article 11 requires granular packaging material classification beyond basic categories. Examples: PET_TRANSPARENT (high recyclability), PET_OPAQUE (lower recyclability), HDPE_NATURAL, HDPE_COLORED. This granularity enables differentiated Extended Producer Responsibility (EPR) fees." +
      "\n\n**Dutch Implementation (Verpact):** The Netherlands' EPR system Verpact implements differentiated fees based on material sub-types. PET_TRANSPARENT bottles pay lower fees due to high recyclability, while PET_OPAQUE pays higher fees. This requires precise GDSN attribute `packagingMaterialTypeCode` population in product master data." +
      "\n\n**GS1 GDSN Implementation:** Use XML tags: `<packagingMaterialTypeCode>`, `<packagingRecyclabilityCode>`, `<packagingRecycledContentPercentage>`, `<packagingWeight>` for EPR fee calculation and recyclability labeling compliance.";

    await db
      .update(regulations)
      .set({
        description: enhancedDescription,
        updatedAt: new Date(),
      })
      .where(eq(regulations.id, reg.id));

    changes.push(
      `✅ Updated PPWR (ID: ${reg.id}) - Enhanced with Verpact context and GDSN implementation details`
    );
  }
}

/**
 * Update 3: VSME Timeline and Context
 * Source: Colleague report - July 30, 2025 adoption with XBRL taxonomy
 */
async function updateVSME() {
  console.log("📝 Updating VSME timeline and context...");

  const vsmeRegs = await db
    .select()
    .from(regulations)
    .where(
      or(
        like(regulations.title, "%VSME%"),
        like(regulations.title, "%Voluntary SME%")
      )
    );

  for (const reg of vsmeRegs) {
    const enhancedDescription =
      reg.description +
      "\n\n**Adoption Date:** VSME was adopted by the European Commission on July 30, 2025, providing a simplified sustainability reporting standard for SMEs (<250 employees, <€50M turnover)." +
      "\n\n**Digital Reporting Format:** VSME reporting uses XBRL (eXtensible Business Reporting Language) taxonomy for structured digital submission. This enables automated validation, reduces manual data entry errors, and facilitates data exchange between reporting entities and stakeholders." +
      "\n\n**Simplified ESRS:** VSME is a subset of full ESRS standards, focusing on material topics for SMEs. It reduces reporting burden while maintaining comparability with larger companies' CSRD reports." +
      "\n\n**Implementation Tools:** SMEs should prepare data in XBRL-compatible formats or use EFRAG-approved software tools for streamlined reporting.";

    await db
      .update(regulations)
      .set({
        effectiveDate: new Date("2025-07-30"),
        description: enhancedDescription,
        updatedAt: new Date(),
      })
      .where(eq(regulations.id, reg.id));

    changes.push(
      `✅ Updated VSME (ID: ${reg.id}) - Timeline: July 30, 2025 | Enhanced with XBRL taxonomy context`
    );
  }
}

/**
 * Update 4: DPP/Battery Passport Timeline
 * Source: Colleague report - February 18, 2027 mandatory date
 */
async function updateDPP() {
  console.log("📝 Updating DPP/Battery Passport timeline...");

  const dppRegs = await db
    .select()
    .from(regulations)
    .where(
      or(
        like(regulations.title, "%Battery%Passport%"),
        like(regulations.title, "%DPP%Battery%")
      )
    );

  for (const reg of dppRegs) {
    const enhancedDescription =
      reg.description +
      "\n\n**Mandatory Date:** Battery passports become mandatory on February 18, 2027, requiring comprehensive lifecycle and recycling information for all batteries placed on the EU market." +
      "\n\n**Access Technology:** Digital Product Passports must be accessible via GS1 Digital Link-enabled QR codes. URL structure: `https://id.gs1.org/01/{GTIN}/21/{serialNumber}?linkType=sustainabilityInfo`. This allows consumers, recyclers, and authorities to access product sustainability data by scanning a single QR code." +
      "\n\n**Textile DPP Rollout:** Textile Digital Product Passports follow a sector-specific rollout schedule during 2027-2028, with exact dates to be specified in delegated acts under ESPR (Ecodesign for Sustainable Products Regulation)." +
      "\n\n**GS1 Web Vocabulary:** DPP data should be structured using GS1 Web Vocabulary (JSON-LD) properties: `gs1:sustainabilityInfo`, `gs1:materialComposition`, `gs1:countryOfOrigin`, `gs1:recyclingInformation`.";

    await db
      .update(regulations)
      .set({
        effectiveDate: new Date("2027-02-18"),
        description: enhancedDescription,
        updatedAt: new Date(),
      })
      .where(eq(regulations.id, reg.id));

    changes.push(
      `✅ Updated DPP/Battery (ID: ${reg.id}) - Timeline: Feb 18, 2027 | Enhanced with GS1 Digital Link context`
    );
  }
}

/**
 * Update 5: CSRD "Dual-Speed" Context
 * Source: Colleague report - Corporate simplification vs. product granularity
 */
async function updateCSRD() {
  console.log("📝 Updating CSRD with regulatory trend context...");

  const csrdRegs = await db
    .select()
    .from(regulations)
    .where(
      or(
        like(regulations.title, "%CSRD%"),
        like(
          regulations.title,
          "%Corporate Sustainability Reporting Directive%"
        )
      )
    );

  for (const reg of csrdRegs) {
    const enhancedDescription =
      reg.description +
      '\n\n**Regulatory Trend Context:** CSRD represents a "dual-speed" regulatory environment where corporate-level reporting is being simplified (CSRD Omnibus raising thresholds from 250 to 500 employees), while product-level requirements (EUDR, DPP, PPWR) demand unprecedented granularity (geolocation, material composition, traceability chains).' +
      "\n\n**Strategic Implication:** This creates a gap where companies need precise supply chain data for product compliance even as corporate reporting becomes more streamlined. Organizations must invest in product-level data infrastructure (GS1 standards, EPCIS, GDSN) to meet granular product regulations, which also enables more accurate corporate sustainability reporting." +
      "\n\n**ESRS Integration:** CSRD reporting uses 1,184 EFRAG-defined ESRS datapoints organized by topic (E1-E5 Environmental, S1-S4 Social, G1 Governance). Reporting format: XBRL taxonomy with ESRS datapoint codes (e.g., `ESRS_E1-5_GHG_Scope1`).";

    await db
      .update(regulations)
      .set({
        description: enhancedDescription,
        updatedAt: new Date(),
      })
      .where(eq(regulations.id, reg.id));

    changes.push(
      `✅ Updated CSRD (ID: ${reg.id}) - Enhanced with "dual-speed" regulatory context and ESRS integration details`
    );
  }
}

// Execute all updates
try {
  await updateEUDR();
  await updatePPWR();
  await updateVSME();
  await updateDPP();
  await updateCSRD();

  console.log("\n✅ Data Quality Enhancement Complete!\n");
  console.log("📊 Summary of Changes:");
  changes.forEach(change => console.log(change));
  console.log(`\n🎯 Total regulations updated: ${changes.length}`);
} catch (error) {
  console.error("❌ Error during data quality enhancement:", error);
  process.exit(1);
} finally {
  await connection.end();
}
