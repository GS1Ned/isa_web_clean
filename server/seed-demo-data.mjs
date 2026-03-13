import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { format } from "node:util";

const cliOut = (...args) => process.stdout.write(`${format(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${format(...args)}\n`);

// Import schema tables
const regulations = { __tableName: "regulations" };
const gs1Standards = { __tableName: "gs1_standards" };
const regulationStandardMappings = {
  __tableName: "regulation_standard_mappings",
};
const regulatoryChangeAlerts = { __tableName: "regulatory_change_alerts" };

const db = drizzle(process.env.DATABASE_URL);

const sampleRegulations = [
  {
    celexId: "32022L0464",
    title: "Corporate Sustainability Reporting Directive (CSRD)",
    description:
      "Directive requiring large EU companies to disclose sustainability information according to ESRS standards.",
    regulationType: "CSRD",
    effectiveDate: new Date("2024-01-01"),
    sourceUrl: "https://eur-lex.europa.eu/eli/dir/2022/2464/oj",
  },
  {
    celexId: "32023R0852",
    title: "EU Taxonomy Regulation",
    description:
      "Regulation establishing a framework for determining whether an economic activity is environmentally sustainable.",
    regulationType: "EU_TAXONOMY",
    effectiveDate: new Date("2023-01-01"),
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2020/852/oj",
  },
  {
    celexId: "32023L1115",
    title: "European Sustainability Reporting Standards (ESRS)",
    description:
      "Standards for sustainability reporting covering environmental, social, and governance topics.",
    regulationType: "ESRS",
    effectiveDate: new Date("2024-01-01"),
    sourceUrl: "https://www.efrag.org/",
  },
  {
    celexId: "32023L2772",
    title: "Digital Product Passport Directive (DPP)",
    description:
      "Directive requiring digital product information throughout the product lifecycle.",
    regulationType: "DPP",
    effectiveDate: new Date("2026-01-01"),
    sourceUrl: "https://eur-lex.europa.eu/eli/dir/2024/1670/oj",
  },
  {
    celexId: "32023L1115-ENV",
    title: "ESRS E1 - Climate Change",
    description:
      "European Sustainability Reporting Standard for climate change mitigation and adaptation.",
    regulationType: "ESRS",
    effectiveDate: new Date("2024-01-01"),
    sourceUrl: "https://www.efrag.org/",
  },
  {
    celexId: "32023L1115-SOC",
    title: "ESRS S1 - Own Workforce",
    description:
      "European Sustainability Reporting Standard for own workforce social topics.",
    regulationType: "ESRS",
    effectiveDate: new Date("2024-01-01"),
    sourceUrl: "https://www.efrag.org/",
  },
];

const sampleGS1Standards = [
  {
    standardCode: "GS1-128",
    standardName: "GS1-128 Barcode",
    description:
      "Linear barcode symbology for encoding product and logistics information.",
    category: "Identification",
    scope: "Product identification and tracking",
    referenceUrl: "https://www.gs1.org/services/how-calculate-check-digit-0",
  },
  {
    standardCode: "GTIN",
    standardName: "Global Trade Item Number",
    description:
      "Unique identifier for products used worldwide in supply chains.",
    category: "Identification",
    scope: "Product identification",
    referenceUrl: "https://www.gs1.org/gtin",
  },
  {
    standardCode: "EPCIS",
    standardName: "Electronic Product Code Information Services",
    description: "Standard for capturing and sharing supply chain event data.",
    category: "Data Sharing",
    scope: "Supply chain visibility and traceability",
    referenceUrl: "https://www.gs1.org/standards/epcis",
  },
  {
    standardCode: "GS1-XML",
    standardName: "GS1 XML Standard",
    description:
      "XML-based standard for exchanging supply chain and product information.",
    category: "Data Exchange",
    scope: "B2B data exchange",
    referenceUrl: "https://www.gs1.org/standards/xml",
  },
  {
    standardCode: "EANCOM",
    standardName: "EANCOM EDI Messages",
    description: "EDI message standard for supply chain communication.",
    category: "Data Exchange",
    scope: "Electronic data interchange",
    referenceUrl: "https://www.gs1.org/standards/eancom",
  },
  {
    standardCode: "GS1-DPP",
    standardName: "GS1 Digital Product Passport",
    description:
      "Framework for digital product passports aligned with EU regulations.",
    category: "Digital Products",
    scope: "Product lifecycle information",
    referenceUrl: "https://www.gs1.org/standards/digital-product-passport",
  },
  {
    standardCode: "GS1-BARCODES",
    standardName: "GS1 2D Barcodes (QR, DataMatrix)",
    description:
      "2D barcode standards for encoding product and sustainability data.",
    category: "Identification",
    scope: "Product identification with extended data",
    referenceUrl: "https://www.gs1.org/standards/2d-barcodes",
  },
  {
    standardCode: "GS1-TRACEABILITY",
    standardName: "GS1 Traceability Standard",
    description: "Framework for tracing products through supply chains.",
    category: "Traceability",
    scope: "Supply chain traceability",
    referenceUrl: "https://www.gs1.org/standards/traceability",
  },
];

const sampleMappings = [
  {
    regulationId: 1,
    standardId: 3,
    relevanceScore: 0.95,
    mappingReason:
      "CSRD requires supply chain transparency, EPCIS enables real-time tracking",
  },
  {
    regulationId: 1,
    standardId: 6,
    relevanceScore: 0.92,
    mappingReason:
      "Digital Product Passport requirements align with GS1 DPP framework",
  },
  {
    regulationId: 2,
    standardId: 1,
    relevanceScore: 0.88,
    mappingReason:
      "EU Taxonomy requires product identification for environmental assessment",
  },
  {
    regulationId: 3,
    standardId: 3,
    relevanceScore: 0.96,
    mappingReason:
      "ESRS E1 climate reporting needs supply chain data from EPCIS",
  },
  {
    regulationId: 3,
    standardId: 4,
    relevanceScore: 0.85,
    mappingReason: "ESRS requires standardized data exchange via GS1-XML",
  },
  {
    regulationId: 4,
    standardId: 6,
    relevanceScore: 0.98,
    mappingReason:
      "DPP directly references GS1 Digital Product Passport standard",
  },
  {
    regulationId: 4,
    standardId: 7,
    relevanceScore: 0.9,
    mappingReason: "DPP uses 2D barcodes for product information access",
  },
  {
    regulationId: 5,
    standardId: 8,
    relevanceScore: 0.93,
    mappingReason: "Climate data collection requires supply chain traceability",
  },
  {
    regulationId: 6,
    standardId: 2,
    relevanceScore: 0.87,
    mappingReason:
      "Workforce reporting needs product identification for supply chain assessment",
  },
];

const sampleAlerts = [
  {
    regulationId: 1,
    changeType: "NEW",
    changeDescription: "CSRD enforcement begins for large companies",
    affectedStandardsCount: 3,
    severity: "CRITICAL",
    detectedAt: new Date(),
  },
  {
    regulationId: 4,
    changeType: "EFFECTIVE_DATE_CHANGED",
    changeDescription: "DPP implementation deadline extended to 2026",
    affectedStandardsCount: 2,
    severity: "HIGH",
    detectedAt: new Date(),
  },
];

async function seedData() {
  try {
    cliOut("🌱 Starting demo data seed...");

    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    // Insert regulations
    cliOut("📋 Inserting sample regulations...");
    for (const reg of sampleRegulations) {
      await connection.execute(
        `INSERT INTO regulations (celexId, title, description, regulationType, effectiveDate, sourceUrl) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          reg.celexId,
          reg.title,
          reg.description,
          reg.regulationType,
          reg.effectiveDate,
          reg.sourceUrl,
        ]
      );
    }
    cliOut(`✓ Inserted ${sampleRegulations.length} regulations`);

    // Insert GS1 standards
    cliOut("📊 Inserting GS1 standards...");
    for (const std of sampleGS1Standards) {
      await connection.execute(
        `INSERT INTO gs1_standards (standardCode, standardName, description, category, scope, referenceUrl) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          std.standardCode,
          std.standardName,
          std.description,
          std.category,
          std.scope,
          std.referenceUrl,
        ]
      );
    }
    cliOut(`✓ Inserted ${sampleGS1Standards.length} GS1 standards`);

    // Insert mappings
    cliOut("🔗 Inserting regulation-to-standard mappings...");
    for (const mapping of sampleMappings) {
      await connection.execute(
        `INSERT INTO regulation_standard_mappings (regulationId, standardId, relevanceScore, mappingReason) 
         VALUES (?, ?, ?, ?)`,
        [
          mapping.regulationId,
          mapping.standardId,
          mapping.relevanceScore,
          mapping.mappingReason,
        ]
      );
    }
    cliOut(`✓ Inserted ${sampleMappings.length} mappings`);

    // Insert alerts
    cliOut("🚨 Inserting regulatory change alerts...");
    for (const alert of sampleAlerts) {
      await connection.execute(
        `INSERT INTO regulatory_change_alerts (regulationId, changeType, changeDescription, affectedStandardsCount, severity) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          alert.regulationId,
          alert.changeType,
          alert.changeDescription,
          alert.affectedStandardsCount,
          alert.severity,
        ]
      );
    }
    cliOut(`✓ Inserted ${sampleAlerts.length} alerts`);

    await connection.end();

    cliOut("\n✅ Demo data seed completed successfully!");
    cliOut("\nYou can now:");
    cliOut("- View regulations at /api/trpc/regulations.list");
    cliOut("- View standards at /api/trpc/standards.list");
    cliOut("- View recent changes at /api/trpc/insights.recentChanges");
    cliOut("- View dashboard stats at /api/trpc/insights.stats");

    process.exit(0);
  } catch (error) {
    cliErr("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seedData();
