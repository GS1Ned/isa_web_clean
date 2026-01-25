/**
 * Seed GS1 Standards Data
 *
 * This script populates the gs1_standards table with curated GS1 supply chain standards
 * relevant to ESG compliance and EU regulations.
 *
 * Run with: npx tsx server/seed-gs1-standards.ts
 */

import { getDb } from "./db";
import { gs1Standards, type InsertGS1Standard } from "../drizzle/schema";
import { serverLogger } from "./_core/logger-wiring";


const gs1StandardsData: Omit<
  InsertGS1Standard,
  "id" | "createdAt" | "updatedAt"
>[] = [
  // === Identification Standards ===
  {
    standardCode: "GTIN",
    standardName: "Global Trade Item Number",
    description:
      "Unique identifier for trade items (products and services). The foundation of GS1 System enabling product identification across global supply chains.",
    category: "Identification",
    scope:
      "Product identification, inventory management, point-of-sale scanning, e-commerce, supply chain visibility",
    referenceUrl: "https://www.gs1.org/standards/id-keys/gtin",
  },
  {
    standardCode: "GLN",
    standardName: "Global Location Number",
    description:
      "Unique identifier for physical locations, legal entities, and functional entities. Essential for supply chain traceability and logistics.",
    category: "Identification",
    scope:
      "Location identification, facility management, logistics, supplier identification, organizational structure",
    referenceUrl: "https://www.gs1.org/standards/id-keys/gln",
  },
  {
    standardCode: "SSCC",
    standardName: "Serial Shipping Container Code",
    description:
      "Unique identifier for logistics units (pallets, containers, parcels). Enables tracking of shipments through the supply chain.",
    category: "Identification",
    scope:
      "Logistics, shipping, warehouse management, transport tracking, delivery verification",
    referenceUrl: "https://www.gs1.org/standards/id-keys/sscc",
  },
  {
    standardCode: "GRAI",
    standardName: "Global Returnable Asset Identifier",
    description:
      "Unique identifier for reusable assets (containers, pallets, crates). Supports circular economy and asset management.",
    category: "Identification",
    scope:
      "Returnable packaging, asset tracking, circular economy, reusable transport items, sustainability",
    referenceUrl: "https://www.gs1.org/standards/id-keys/grai",
  },
  {
    standardCode: "GIAI",
    standardName: "Global Individual Asset Identifier",
    description:
      "Unique identifier for fixed assets (machinery, equipment, vehicles). Enables lifecycle management and maintenance tracking.",
    category: "Identification",
    scope:
      "Asset management, equipment tracking, maintenance records, depreciation, facility management",
    referenceUrl: "https://www.gs1.org/standards/id-keys/giai",
  },

  // === Traceability Standards ===
  {
    standardCode: "EPCIS",
    standardName: "Electronic Product Code Information Services",
    description:
      "Standard for capturing and sharing supply chain event data. Enables end-to-end traceability and visibility across organizations.",
    category: "Traceability",
    scope:
      "Supply chain visibility, event tracking, traceability, recall management, due diligence, deforestation monitoring",
    referenceUrl: "https://www.gs1.org/standards/epcis",
  },
  {
    standardCode: "CBV",
    standardName: "Core Business Vocabulary",
    description:
      "Standardized vocabulary for EPCIS events. Ensures consistent interpretation of supply chain data across trading partners.",
    category: "Traceability",
    scope:
      "Event data standardization, interoperability, supply chain communication, data exchange",
    referenceUrl: "https://www.gs1.org/standards/epcis/cbv",
  },
  {
    standardCode: "GS1_Digital_Link",
    standardName: "GS1 Digital Link",
    description:
      "Web-based standard linking physical products to digital information via URLs. Enables QR codes with embedded product data.",
    category: "Data_Exchange",
    scope:
      "Digital Product Passport, consumer engagement, product information, authentication, circular economy",
    referenceUrl: "https://www.gs1.org/standards/gs1-digital-link",
  },

  // === Packaging & Sustainability Standards ===
  {
    standardCode: "GS1_Packaging_Attributes",
    standardName: "GS1 Packaging Attributes",
    description:
      "Standardized attributes for packaging materials, composition, and recyclability. Supports Extended Producer Responsibility (EPR) compliance.",
    category: "Packaging",
    scope:
      "Packaging data, material composition, recyclability, EPR compliance, waste management, PPWR compliance",
    referenceUrl: "https://www.gs1.org/standards/gs1-global-data-model",
  },
  {
    standardCode: "GS1_Net_Content",
    standardName: "GS1 Net Content",
    description:
      "Standard for communicating product quantity and packaging details. Essential for accurate labeling and consumer information.",
    category: "Packaging",
    scope:
      "Product labeling, quantity declaration, packaging information, consumer transparency",
    referenceUrl: "https://www.gs1.org/standards/gs1-global-data-model",
  },
  {
    standardCode: "GS1_Allergen_Information",
    standardName: "GS1 Allergen Information",
    description:
      "Standardized communication of allergen presence in food products. Critical for food safety and regulatory compliance.",
    category: "Quality",
    scope:
      "Food safety, allergen labeling, consumer protection, regulatory compliance, product recalls",
    referenceUrl: "https://www.gs1.org/standards/gs1-global-data-model",
  },

  // === Data Exchange Standards ===
  {
    standardCode: "GDSN",
    standardName: "Global Data Synchronization Network",
    description:
      "Network for synchronizing product master data between trading partners. Ensures data accuracy and consistency across supply chains.",
    category: "Data_Exchange",
    scope:
      "Product data management, master data synchronization, B2B data exchange, data quality",
    referenceUrl: "https://www.gs1.org/services/gdsn",
  },
  {
    standardCode: "GS1_Global_Data_Model",
    standardName: "GS1 Global Data Model",
    description:
      "Harmonized set of product attributes for consistent data exchange. Simplifies product information management across channels.",
    category: "Data_Exchange",
    scope:
      "Product attributes, data standardization, omnichannel commerce, data governance",
    referenceUrl: "https://www.gs1.org/standards/gs1-global-data-model",
  },
  {
    standardCode: "GS1_SmartSearch",
    standardName: "GS1 SmartSearch",
    description:
      "Standard for making product information discoverable via web search. Enables consumers to find verified product data online.",
    category: "Data_Exchange",
    scope:
      "Product information discovery, consumer engagement, SEO, brand protection, transparency",
    referenceUrl: "https://www.gs1.org/standards/gs1-smartsearch",
  },
  {
    standardCode: "Verified_by_GS1",
    standardName: "Verified by GS1",
    description:
      "Service for validating and certifying product data quality. Ensures accuracy and completeness of shared product information.",
    category: "Quality",
    scope:
      "Data quality assurance, certification, trust, compliance verification, audit trails",
    referenceUrl: "https://www.gs1.org/services/verified-by-gs1",
  },

  // === Product Classification Standards ===
  {
    standardCode: "GPC",
    standardName: "Global Product Classification",
    description:
      "Hierarchical system for classifying products into categories. Enables consistent product grouping across industries and regions.",
    category: "Data_Exchange",
    scope:
      "Product categorization, taxonomy, catalog management, search optimization, analytics",
    referenceUrl: "https://www.gs1.org/standards/gpc",
  },
  {
    standardCode: "GS1_Attribute_Definitions",
    standardName: "GS1 Attribute Definitions",
    description:
      "Standardized definitions for product characteristics and specifications. Ensures consistent interpretation of product attributes.",
    category: "Data_Exchange",
    scope:
      "Product specifications, attribute standardization, data quality, interoperability",
    referenceUrl: "https://www.gs1.org/standards/gs1-global-data-model",
  },

  // === Barcodes & Data Carriers ===
  {
    standardCode: "GS1_128",
    standardName: "GS1-128 Barcode",
    description:
      "Linear barcode encoding GTINs and additional data (batch, expiry, serial number). Widely used in logistics and healthcare.",
    category: "Identification",
    scope:
      "Logistics labeling, batch tracking, expiry management, healthcare, supply chain automation",
    referenceUrl: "https://www.gs1.org/standards/barcodes/gs1-128",
  },
  {
    standardCode: "GS1_DataMatrix",
    standardName: "GS1 DataMatrix",
    description:
      "2D barcode for small items and healthcare products. Encodes GTINs, batch numbers, expiry dates, and serial numbers.",
    category: "Identification",
    scope:
      "Healthcare, pharmaceuticals, small item marking, traceability, serialization",
    referenceUrl: "https://www.gs1.org/standards/barcodes/datamatrix",
  },
  {
    standardCode: "GS1_QR_Code",
    standardName: "GS1 QR Code",
    description:
      "2D barcode linking to digital product information. Supports Digital Product Passports and consumer engagement.",
    category: "Identification",
    scope:
      "Digital Product Passport, consumer information, authentication, circular economy, DPP compliance",
    referenceUrl: "https://www.gs1.org/standards/barcodes/qr-code",
  },

  // === Sustainability & ESG Standards ===
  {
    standardCode: "GS1_Sustainability_Attributes",
    standardName: "GS1 Sustainability Attributes",
    description:
      "Standardized attributes for communicating environmental and social impact data. Supports ESG reporting and transparency.",
    category: "Quality",
    scope:
      "ESG reporting, sustainability claims, carbon footprint, social impact, CSRD compliance, ESRS alignment",
    referenceUrl: "https://www.gs1.org/standards/gs1-global-data-model",
  },
  {
    standardCode: "GS1_Origin_Information",
    standardName: "GS1 Origin Information",
    description:
      "Standard for communicating product origin and provenance. Critical for deforestation regulations and supply chain due diligence.",
    category: "Traceability",
    scope:
      "Country of origin, provenance, deforestation monitoring, EUDR compliance, due diligence",
    referenceUrl: "https://www.gs1.org/standards/gs1-global-data-model",
  },
  {
    standardCode: "GS1_Circular_Economy_Attributes",
    standardName: "GS1 Circular Economy Attributes",
    description:
      "Attributes for supporting circular economy models (repair, reuse, recycling). Enables product lifecycle management.",
    category: "Quality",
    scope:
      "Circular economy, product lifecycle, repair information, recycling, reuse, DPP compliance",
    referenceUrl: "https://www.gs1.org/standards/gs1-global-data-model",
  },

  // === Compliance & Regulatory Standards ===
  {
    standardCode: "GS1_Regulatory_Information",
    standardName: "GS1 Regulatory Information",
    description:
      "Standardized communication of regulatory compliance data. Supports various industry-specific regulations and certifications.",
    category: "Quality",
    scope:
      "Regulatory compliance, certifications, product safety, legal requirements, audit trails",
    referenceUrl: "https://www.gs1.org/standards/gs1-global-data-model",
  },
  {
    standardCode: "GS1_Certification_Information",
    standardName: "GS1 Certification Information",
    description:
      "Standard for communicating third-party certifications (organic, fair trade, sustainability). Builds consumer trust.",
    category: "Quality",
    scope:
      "Certifications, eco-labels, sustainability claims, verification, consumer trust",
    referenceUrl: "https://www.gs1.org/standards/gs1-global-data-model",
  },

  // === Supply Chain Visibility Standards ===
  {
    standardCode: "GS1_Visibility_Event_Hash",
    standardName: "GS1 Visibility Event Hash",
    description:
      "Cryptographic hash for EPCIS events to ensure data integrity. Supports blockchain integration and tamper detection.",
    category: "Traceability",
    scope: "Data integrity, blockchain, tamper detection, audit trails, trust",
    referenceUrl: "https://www.gs1.org/standards/epcis",
  },
  {
    standardCode: "GS1_Track_and_Trace",
    standardName: "GS1 Track and Trace",
    description:
      "Framework for implementing end-to-end product tracking. Combines identification, data capture, and event sharing standards.",
    category: "Traceability",
    scope:
      "Product tracking, supply chain visibility, recall management, anti-counterfeiting, due diligence",
    referenceUrl: "https://www.gs1.org/standards/epcis",
  },

  // === Healthcare-Specific Standards (relevant for pharma ESG) ===
  {
    standardCode: "GS1_Healthcare_GTIN",
    standardName: "GS1 Healthcare GTIN",
    description:
      "GTIN application for healthcare products with specific requirements. Supports patient safety and regulatory compliance.",
    category: "Identification",
    scope:
      "Healthcare, pharmaceuticals, medical devices, patient safety, traceability",
    referenceUrl: "https://www.gs1.org/industries/healthcare",
  },
  {
    standardCode: "GS1_GDTI",
    standardName: "Global Document Type Identifier",
    description:
      "Unique identifier for documents and certificates. Useful for tracking sustainability reports and compliance documents.",
    category: "Identification",
    scope:
      "Document management, certificates, compliance documentation, audit trails",
    referenceUrl: "https://www.gs1.org/standards/id-keys/gdti",
  },
];

async function seedGS1Standards() {
  serverLogger.info("🌱 Starting GS1 Standards seed...");

  const db = await getDb();
  if (!db) {
    throw new Error("Failed to get database connection");
  }

  try {
    // Check if standards already exist
    const existingStandards = await db.select().from(gs1Standards);

    if (existingStandards.length > 0) {
      serverLogger.info(
        `⚠️  Found ${existingStandards.length} existing standards. Skipping seed to avoid duplicates.`
      );
      serverLogger.info("   To re-seed, manually delete existing records first.");
      return;
    }

    // Insert all standards
    serverLogger.info(`📦 Inserting ${gs1StandardsData.length} GS1 standards...`);

    for (const standard of gs1StandardsData) {
      await db.insert(gs1Standards).values(standard);
      serverLogger.info(`   ✓ ${standard.standardCode} - ${standard.standardName}`);
    }

    serverLogger.info(
      `\n✅ Successfully seeded ${gs1StandardsData.length} GS1 standards!`
    );
    serverLogger.info("\nStandards by category:");
    serverLogger.info(
      `   - Identification: ${gs1StandardsData.filter(s => s.category === "Identification").length}`
    );
    serverLogger.info(
      `   - Traceability: ${gs1StandardsData.filter(s => s.category === "Traceability").length}`
    );
    serverLogger.info(
      `   - Packaging: ${gs1StandardsData.filter(s => s.category === "Packaging").length}`
    );
    serverLogger.info(
      `   - Data_Exchange: ${gs1StandardsData.filter(s => s.category === "Data_Exchange").length}`
    );
    serverLogger.info(
      `   - Quality: ${gs1StandardsData.filter(s => s.category === "Quality").length}`
    );
  } catch (error) {
    serverLogger.error(error, { context: "❌ Error seeding GS1 standards:" });
    throw error;
  }
}

// Run the seed
seedGS1Standards()
  .then(() => {
    serverLogger.info("\n🎉 Seed completed successfully!");
    process.exit(0);
  })
  .catch(error => {
    serverLogger.error(error, { context: "\n💥 Seed failed:" });
    process.exit(1);
  });
