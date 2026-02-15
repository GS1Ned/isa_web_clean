/**
 * Seed Regulatory Change Log with EFRAG Implementation Guidance
 * 
 * This script populates the regulatory change log with official EFRAG
 * guidance documents that are relevant for ISA users.
 * 
 * Run with: npx tsx scripts/seed-regulatory-change-log.ts
 */

import { createRegulatoryChangeLogEntry } from "../server/db-regulatory-change-log";
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);


interface ChangeLogEntry {
  entryDate: string;
  sourceType: "EFRAG_IG" | "EFRAG_QA" | "EFRAG_TAXONOMY" | "EU_REGULATION" | "EU_DIRECTIVE" | "EU_DELEGATED_ACT" | "EU_IMPLEMENTING_ACT" | "GS1_AISBL" | "GS1_EUROPE" | "GS1_NL";
  sourceOrg: string;
  title: string;
  description: string;
  url: string;
  impactAssessment?: string;
  isaVersionAffected?: string;
}

const efragGuidanceEntries: ChangeLogEntry[] = [
  // EFRAG Implementation Guidance (IG) Documents
  {
    entryDate: "2024-05-31",
    sourceType: "EFRAG_IG",
    sourceOrg: "EFRAG",
    title: "EFRAG IG 1: Materiality Assessment Implementation Guidance",
    description: "Comprehensive guidance on conducting double materiality assessments under ESRS. Covers identification of impacts, risks and opportunities (IROs), stakeholder engagement, and documentation requirements. Essential for companies preparing their first CSRD reports.",
    url: "https://www.efrag.org/lab6?AspxAutoDetectCookieSupport=1#subtitle4",
    impactAssessment: "HIGH - Critical for all CSRD-reporting companies to understand materiality assessment methodology",
    isaVersionAffected: "v1.1"
  },
  {
    entryDate: "2024-05-31",
    sourceType: "EFRAG_IG",
    sourceOrg: "EFRAG",
    title: "EFRAG IG 2: Value Chain Implementation Guidance",
    description: "Detailed guidance on value chain considerations in sustainability reporting. Addresses upstream and downstream value chain mapping, data collection from suppliers and customers, and estimation techniques when direct data is unavailable.",
    url: "https://www.efrag.org/lab6?AspxAutoDetectCookieSupport=1#subtitle4",
    impactAssessment: "HIGH - Essential for supply chain transparency and Scope 3 emissions reporting",
    isaVersionAffected: "v1.1"
  },
  {
    entryDate: "2024-05-31",
    sourceType: "EFRAG_IG",
    sourceOrg: "EFRAG",
    title: "EFRAG IG 3: ESRS Datapoints List",
    description: "Complete list of 1,184 ESRS datapoints with detailed specifications. Includes datapoint IDs, data types (narrative, quantitative, semi-narrative), disclosure requirements, and mandatory/voluntary classifications. The authoritative reference for ESRS disclosure requirements.",
    url: "https://www.efrag.org/lab6?AspxAutoDetectCookieSupport=1#subtitle4",
    impactAssessment: "CRITICAL - Foundational reference for all ESRS disclosures",
    isaVersionAffected: "v1.0"
  },
  {
    entryDate: "2024-12-20",
    sourceType: "EFRAG_IG",
    sourceOrg: "EFRAG",
    title: "EFRAG IG 4: Phase-in Provisions Guidance",
    description: "Guidance on ESRS phase-in provisions allowing companies to delay certain disclosures. Covers entity-specific phase-ins for companies with fewer than 750 employees and topic-specific phase-ins for biodiversity, Scope 3 emissions, and own workforce metrics.",
    url: "https://www.efrag.org/lab6?AspxAutoDetectCookieSupport=1#subtitle4",
    impactAssessment: "MEDIUM - Important for first-time reporters to understand disclosure timing",
    isaVersionAffected: "v1.1"
  },
  
  // EFRAG Q&A Documents
  {
    entryDate: "2024-08-15",
    sourceType: "EFRAG_QA",
    sourceOrg: "EFRAG",
    title: "EFRAG Explanations on ESRS Implementation - Set 1",
    description: "First set of EFRAG explanations addressing common questions about ESRS implementation. Covers general requirements (ESRS 1), general disclosures (ESRS 2), and cross-cutting topics including basis for preparation and materiality.",
    url: "https://www.efrag.org/lab6?AspxAutoDetectCookieSupport=1#subtitle5",
    impactAssessment: "MEDIUM - Clarifies ambiguous ESRS requirements",
    isaVersionAffected: "v1.1"
  },
  {
    entryDate: "2024-11-20",
    sourceType: "EFRAG_QA",
    sourceOrg: "EFRAG",
    title: "EFRAG Explanations on ESRS Implementation - Set 2",
    description: "Second set of EFRAG explanations focusing on environmental standards (E1-E5). Addresses climate change disclosures, pollution metrics, water and marine resources, biodiversity reporting, and circular economy requirements.",
    url: "https://www.efrag.org/lab6?AspxAutoDetectCookieSupport=1#subtitle5",
    impactAssessment: "HIGH - Critical clarifications for environmental disclosures",
    isaVersionAffected: "v1.1"
  },
  {
    entryDate: "2025-01-15",
    sourceType: "EFRAG_QA",
    sourceOrg: "EFRAG",
    title: "EFRAG Explanations on ESRS Implementation - Set 3",
    description: "Third set of EFRAG explanations covering social standards (S1-S4) and governance (G1). Addresses own workforce metrics, workers in value chain, affected communities, consumers and end-users, and business conduct disclosures.",
    url: "https://www.efrag.org/lab6?AspxAutoDetectCookieSupport=1#subtitle5",
    impactAssessment: "HIGH - Essential for social and governance disclosures",
    isaVersionAffected: "v1.2"
  },
  
  // EFRAG Taxonomy
  {
    entryDate: "2024-12-01",
    sourceType: "EFRAG_TAXONOMY",
    sourceOrg: "EFRAG",
    title: "ESRS XBRL Taxonomy 2024",
    description: "Official XBRL taxonomy for ESRS digital reporting. Enables machine-readable sustainability reports with standardized tagging. Required for European Single Access Point (ESAP) submissions starting 2025.",
    url: "https://www.efrag.org/lab6?AspxAutoDetectCookieSupport=1#subtitle6",
    impactAssessment: "HIGH - Required for digital CSRD submissions",
    isaVersionAffected: "v1.2"
  },
  
  // EU Regulations affecting ISA
  {
    entryDate: "2024-07-18",
    sourceType: "EU_REGULATION",
    sourceOrg: "European Commission",
    title: "Ecodesign for Sustainable Products Regulation (ESPR) Entry into Force",
    description: "ESPR establishes framework for ecodesign requirements including Digital Product Passports (DPP). First delegated acts expected for textiles, furniture, and electronics. Significant implications for GS1 standards adoption.",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1781",
    impactAssessment: "CRITICAL - Major impact on product data and traceability requirements",
    isaVersionAffected: "v1.1"
  },
  {
    entryDate: "2024-06-29",
    sourceType: "EU_REGULATION",
    sourceOrg: "European Commission",
    title: "EU Deforestation Regulation (EUDR) Implementation Deadline Extended",
    description: "EUDR implementation deadline extended to December 30, 2025 for large operators and December 30, 2026 for SMEs. Due diligence requirements for seven commodities: cattle, cocoa, coffee, palm oil, rubber, soya, and wood.",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1115",
    impactAssessment: "HIGH - Extended timeline affects compliance planning",
    isaVersionAffected: "v1.1"
  },
  {
    entryDate: "2025-01-01",
    sourceType: "EU_REGULATION",
    sourceOrg: "European Commission",
    title: "CSRD First Reporting Period Begins",
    description: "Large public-interest entities with >500 employees begin their first CSRD reporting period for FY2024. Reports due in 2025 must comply with full ESRS requirements including limited assurance.",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022L2464",
    impactAssessment: "CRITICAL - First wave of mandatory CSRD reports",
    isaVersionAffected: "v1.0"
  },
  
  // GS1 Standards Updates
  {
    entryDate: "2024-09-15",
    sourceType: "GS1_AISBL",
    sourceOrg: "GS1 Global",
    title: "GS1 Digital Link Standard 1.2 Release",
    description: "Updated GS1 Digital Link standard with enhanced support for sustainability data. New resolver functionality enables linking product identifiers to Digital Product Passport information and sustainability declarations.",
    url: "https://www.gs1.org/standards/gs1-digital-link",
    impactAssessment: "HIGH - Enables DPP integration with GS1 identifiers",
    isaVersionAffected: "v1.1"
  },
  {
    entryDate: "2024-10-01",
    sourceType: "GS1_EUROPE",
    sourceOrg: "GS1 in Europe",
    title: "GS1 Europe ESPR Readiness Guidelines",
    description: "Guidelines for GS1 members on preparing for ESPR requirements. Covers product data attributes needed for Digital Product Passports, GTIN requirements for regulated products, and integration with EU sustainability databases.",
    url: "https://www.gs1.eu/news/gs1-europe-espr-guidelines",
    impactAssessment: "HIGH - Practical guidance for ESPR compliance using GS1 standards",
    isaVersionAffected: "v1.1"
  },
  {
    entryDate: "2024-11-01",
    sourceType: "GS1_NL",
    sourceOrg: "GS1 Netherlands",
    title: "GS1 Netherlands CSRD Data Quality Initiative",
    description: "Initiative to improve product data quality for CSRD reporting. Focuses on supply chain data sharing, carbon footprint data exchange, and integration of GS1 standards with ESRS datapoints.",
    url: "https://www.gs1.nl/nieuws/csrd-data-quality",
    impactAssessment: "MEDIUM - Dutch market specific guidance",
    isaVersionAffected: "v1.1"
  }
];

async function seedRegulatoryChangeLog() {
  cliOut("Starting Regulatory Change Log seed...");
  cliOut(`Entries to insert: ${efragGuidanceEntries.length}`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const entry of efragGuidanceEntries) {
    try {
      // Convert date string to timestamp format (YYYY-MM-DD HH:MM:SS)
      const entryWithTimestamp = {
        ...entry,
        entryDate: entry.entryDate + ' 00:00:00'
      };
      const result = await createRegulatoryChangeLogEntry(entryWithTimestamp);
      cliOut(`✓ Created: ${entry.title} (ID: ${result.id})`);
      successCount++;
    } catch (error: any) {
      // Check if it's a duplicate entry error
      if (error.message?.includes("Duplicate entry") || error.code === "ER_DUP_ENTRY") {
        cliOut(`⚠ Skipped (already exists): ${entry.title}`);
      } else {
        cliErr(`✗ Failed: ${entry.title}`, error.message);
        errorCount++;
      }
    }
  }
  
  cliOut("\n--- Seed Complete ---");
  cliOut(`Success: ${successCount}`);
  cliOut(`Errors: ${errorCount}`);
  cliOut(`Skipped: ${efragGuidanceEntries.length - successCount - errorCount}`);
}

// Run the seed
seedRegulatoryChangeLog()
  .then(() => {
    cliOut("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    cliErr("Seed failed:", error);
    process.exit(1);
  });
