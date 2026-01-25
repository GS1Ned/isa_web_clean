/**
 * Seed script for Regulatory Change Log
 *
 * Seeds 6 initial entries based on ISA Development Roadmap:
 * 1. GS1 EU Carbon Footprint Guideline v1.0 (February 2025)
 * 2. GS1 Provisional DPP Standard (April 2025)
 * 3. GS1 Conformant Resolver Standard v1.1.0 (February 2025)
 * 4. EFRAG Implementation Guidance 3 (September 2024)
 * 5. EU Digital Product Passport Regulation (March 2024)
 * 6. GS1 NL Sector Model v3.1.34 (Expected Q2 2025)
 */

import { drizzle } from "drizzle-orm/mysql2";
import { regulatoryChangeLog } from "../drizzle/schema_regulatory_change_log.js";

const db = drizzle(process.env.DATABASE_URL);

const seedEntries = [
  {
    entryDate: new Date("2025-02-15"),
    sourceType: "GS1_EUROPE",
    sourceOrg: "GS1 in Europe",
    title: "GDSN Implementation Guideline for Exchanging Carbon Footprint Data v1.0",
    description:
      "Official GS1 EU standard for Product Carbon Footprint (PCF) data exchange via GDSN. Defines 9 GDSN BMS attributes for exchanging carbon footprint data across the value chain, including total carbon footprint, carbon footprint per unit, calculation method, and verification status.",
    url: "https://gs1.eu/wp-content/uploads/2025/02/GDSN-Implementation-Guideline-for-exchanging-Carbon-Footprint-Data-3.pdf",
    documentHash: null,
    impactAssessment:
      "Addresses ISA Gap #1 (Product Carbon Footprint) with PARTIAL solution. GS1 NL adoption pending in v3.1.34 release (Q2 2025). Provides standardised GDSN attributes for PCF data exchange, enabling supply chain transparency for CSRD and ESRS E1 compliance.",
    isaVersionAffected: "v1.1",
  },
  {
    entryDate: new Date("2025-04-01"),
    sourceType: "GS1_AISBL",
    sourceOrg: "GS1 AISBL",
    title: "GS1 Provisional Digital Product Passport Standard",
    description:
      "Provisional GS1 standard for Digital Product Passport (DPP) implementation, defining data structures, identification schemes, and interoperability requirements for EU DPP Regulation compliance. Covers product identification, circularity data, and supply chain traceability.",
    url: "https://www.gs1.org/standards/digital-product-passport",
    documentHash: null,
    impactAssessment:
      "Addresses ISA Gap #3 (Digital Product Passport) with PARTIAL solution. Provides GS1-compliant DPP data structures for ESPR and sector-specific DPP requirements (batteries, textiles, electronics). Adoption expected in GS1 NL v3.1.35 (Q3 2025).",
    isaVersionAffected: "v1.2",
  },
  {
    entryDate: new Date("2025-02-01"),
    sourceType: "GS1_AISBL",
    sourceOrg: "GS1 AISBL",
    title: "GS1 Conformant Resolver Standard v1.1.0",
    description:
      "Updated GS1 Digital Link resolver standard defining conformance requirements for resolver implementations. Includes enhanced security requirements, performance benchmarks, and interoperability testing procedures for GS1 Digital Link URIs.",
    url: "https://www.gs1.org/standards/gs1-digital-link/1-1",
    documentHash: null,
    impactAssessment:
      "Addresses ISA Gap #2 (GS1 Digital Link Resolver) with COMPLETE solution. Provides conformance testing framework for resolver implementations, enabling reliable product identification and data access for DPP and traceability use cases.",
    isaVersionAffected: "v1.1",
  },
  {
    entryDate: new Date("2024-09-15"),
    sourceType: "EFRAG_IG",
    sourceOrg: "EFRAG",
    title: "ESRS Implementation Guidance 3: Value Chain Data Collection",
    description:
      "EFRAG guidance on collecting value chain data for ESRS E1 (Climate), E2 (Pollution), and E4 (Biodiversity) disclosures. Clarifies data collection methodologies, estimation techniques, and materiality assessment for Scope 3 emissions and upstream/downstream impacts.",
    url: "https://www.efrag.org/lab6/item/607",
    documentHash: null,
    impactAssessment:
      "Clarifies ESRS data collection requirements for value chain impacts, reinforcing need for standardised GS1 traceability data (EPCIS, GDSN) to support CSRD compliance. Impacts ISA mapping recommendations for supply chain visibility and Scope 3 emissions tracking.",
    isaVersionAffected: "v1.0",
  },
  {
    entryDate: new Date("2024-03-13"),
    sourceType: "EU_REGULATION",
    sourceOrg: "European Commission",
    title: "Regulation (EU) 2024/1781 on Ecodesign for Sustainable Products (ESPR)",
    description:
      "EU Regulation establishing framework for ecodesign requirements for sustainable products, including Digital Product Passport (DPP) obligations. Sets out product-specific requirements for circularity, energy efficiency, and environmental impact across product categories.",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1781",
    documentHash: null,
    impactAssessment:
      "Establishes legal basis for Digital Product Passport requirements, driving ISA Gap #3 (DPP) and Gap #5 (Circularity Data). Requires GS1 standards adoption for product identification, data exchange, and supply chain traceability across EU market.",
    isaVersionAffected: "v1.0",
  },
  {
    entryDate: new Date("2025-06-01"),
    sourceType: "GS1_NL",
    sourceOrg: "GS1 Netherlands",
    title: "GS1 NL Sector Model v3.1.34 Release (Expected Q2 2025)",
    description:
      "Expected GS1 NL sector model update incorporating GS1 EU Carbon Footprint Guideline v1.0 attributes for DIY/Garden/Pet (DHZTD), Food/Health/Beauty (FMCG), and Healthcare (ECHO) sectors. Adds 9 PCF attributes to existing 3,667 attributes across three sector models.",
    url: "https://www.gs1.nl/sector-models",
    documentHash: null,
    impactAssessment:
      "If adopted, resolves ISA Gap #1 (Product Carbon Footprint) from PARTIAL to COMPLETE for GS1 NL members. Enables CSRD-compliant PCF data exchange via GDSN for Dutch supply chains. Triggers ISA advisory update to v1.2 with revised Gap #1 status and recommendations.",
    isaVersionAffected: "v1.2",
  },
];

async function seedRegulatoryChangeLog() {
  console.log("🌱 Seeding Regulatory Change Log...");

  try {
    // Check if entries already exist
    const existingEntries = await db.select().from(regulatoryChangeLog).limit(1);

    if (existingEntries.length > 0) {
      console.log("⚠️  Regulatory Change Log already contains entries. Skipping seed.");
      console.log("   To re-seed, manually truncate the table first.");
      process.exit(0);
    }

    // Insert seed entries
    for (const entry of seedEntries) {
      await db.insert(regulatoryChangeLog).values(entry);
      console.log(`✅ Created: ${entry.title}`);
    }

    console.log(`\n✨ Successfully seeded ${seedEntries.length} regulatory change log entries`);
    console.log("\nSummary:");
    console.log(`  - GS1 Europe: 1 entry`);
    console.log(`  - GS1 AISBL: 2 entries`);
    console.log(`  - GS1 Netherlands: 1 entry`);
    console.log(`  - EFRAG: 1 entry`);
    console.log(`  - EU Commission: 1 entry`);
    console.log(`\n  ISA versions affected: v1.0, v1.1, v1.2`);
    console.log(`\n  View at: /admin/regulatory-change-log`);
  } catch (error) {
    console.error("❌ Error seeding Regulatory Change Log:", error);
    process.exit(1);
  }
}

seedRegulatoryChangeLog();
