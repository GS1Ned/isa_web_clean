# GS1 Attribute Mapper: Technical Specification & Implementation Plan

**Document Version:** 1.0  
**Date:** November 29, 2025  
**Author:** Manus AI  
**Status:** Ready for Implementation

---

## Executive Summary

The **GS1 Attribute Mapper** is a high-ROI feature that transforms ISA from a regulation knowledge base into an actionable implementation guide. This specification provides complete technical requirements, database schema, UI/UX design, backend procedures, data population strategy, testing requirements, and realistic effort estimates for implementing attribute-level mapping between EU sustainability regulations and GS1 technical standards.

### Business Value

The colleague reports identified a critical gap in ISA's current capabilities. While ISA successfully maps regulations to GS1 standards (e.g., "EUDR requires EPCIS 2.0"), it does not provide the granular technical specifications that developers and implementers need (e.g., "EUDR requires RFF+DDR segment in EDI DESADV with alphanumeric DDS Reference Number"). This gap prevents B2B users from translating regulatory requirements into concrete implementation tasks.

The GS1 Attribute Mapper addresses this by providing three technical layers:

1. **GDSN XML Attributes** - Master data attributes for product information synchronization (e.g., `<packagingMaterialTypeCode>`, `<totalEnergyConsumption>`)
2. **EDI Segments** - Transactional data segments for supply chain messaging (e.g., `RFF+DDR`, `RFF+DDV`)
3. **JSON-LD Properties** - Web vocabulary properties for Digital Product Passports (e.g., `gs1:materialComposition`, `gs1:recycledContentPercentage`)

### Expected Impact

**User Engagement:** 10x increase in daily active users as ISA becomes the authoritative technical reference for GS1 ESG compliance implementation.

**Market Positioning:** Establishes ISA as the only platform providing end-to-end mapping from regulations → standards → attributes → code examples.

**Revenue Potential:** Unlocks B2B subscription model ($500-2,000/month per enterprise) for companies needing implementation guidance.

### Implementation Timeline

**Total Effort:** 2-3 weeks (80-120 hours)  
**Team Size:** 1 full-stack developer + 1 data curator  
**Launch Target:** Q1 2026 (January-February)

---

## Part 1: Database Schema Design

### 1.1 Overview

The GS1 Attribute Mapper requires two new database tables that integrate with ISA's existing schema. The design follows ISA's established patterns (Drizzle ORM, MySQL, camelCase naming) and maintains referential integrity with existing tables (`regulations`, `gs1_standards`).

### 1.2 Table 1: `gs1_attributes`

This table stores the canonical list of GS1 technical attributes across all three implementation layers (GDSN, EDI, JSON-LD).

```typescript
import {
  mysqlTable,
  int,
  varchar,
  text,
  timestamp,
  mysqlEnum,
  boolean,
  index,
} from "drizzle-orm/mysql-core";

/**
 * GS1 Attributes - Technical specifications for GS1 standard implementation
 * Stores GDSN XML tags, EDI segments, and JSON-LD properties required for ESG compliance
 */
export const gs1Attributes = mysqlTable(
  "gs1_attributes",
  {
    id: int("id").autoincrement().primaryKey(),

    // Relationship to GS1 Standard
    standardId: int("standardId").notNull(), // Foreign key to gs1_standards table

    // Attribute Identification
    attributeName: varchar("attributeName", { length: 255 }).notNull(), // e.g., "packagingMaterialTypeCode", "DDS Reference Number"
    attributeDisplayName: varchar("attributeDisplayName", {
      length: 255,
    }).notNull(), // Human-readable name for UI

    // Technical Format Classification
    technicalFormat: mysqlEnum("technicalFormat", [
      "GDSN_XML", // GDSN master data attribute
      "EDI_SEGMENT", // EDIFACT/EANCOM segment
      "JSON_LD", // GS1 Web Vocabulary property
      "MULTI_FORMAT", // Attribute exists in multiple formats
    ]).notNull(),

    // Data Type & Validation
    dataType: varchar("dataType", { length: 50 }).notNull(), // "string", "number", "boolean", "date", "enum", "object", "array"
    isRequired: boolean("isRequired").default(false), // Mandatory vs. optional
    validationRules: text("validationRules"), // JSON string with validation constraints (e.g., {"minLength": 10, "pattern": "^[A-Z0-9]+$"})

    // Format-Specific Technical Details
    gdsnXmlTag: varchar("gdsnXmlTag", { length: 255 }), // e.g., "<packagingMaterialTypeCode>"
    gdsnModule: varchar("gdsnModule", { length: 100 }), // e.g., "Packaging Information Module", "Regulatory Information Module"
    ediSegment: varchar("ediSegment", { length: 100 }), // e.g., "RFF+DDR", "RFF+DDV"
    ediQualifier: varchar("ediQualifier", { length: 50 }), // e.g., "DDR", "DDV"
    jsonLdProperty: varchar("jsonLdProperty", { length: 255 }), // e.g., "gs1:carbonFootprint", "gs1:materialComposition"

    // Documentation & Examples
    description: text("description").notNull(), // Detailed explanation of the attribute's purpose
    exampleValue: text("exampleValue"), // Sample value (e.g., "PET_TRANSPARENT", "RFF+DDR:1234567890:1")
    codeExample: text("codeExample"), // Full code snippet showing usage in context

    // Reference Links
    gs1NavigatorUrl: varchar("gs1NavigatorUrl", { length: 512 }), // Link to GS1 Navigator documentation
    implementationGuideUrl: varchar("implementationGuideUrl", { length: 512 }), // Link to GS1 implementation guide

    // Metadata
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    standardIdIdx: index("standardId_idx").on(table.standardId),
    technicalFormatIdx: index("technicalFormat_idx").on(table.technicalFormat),
    attributeNameIdx: index("attributeName_idx").on(table.attributeName),
  })
);

export type GS1Attribute = typeof gs1Attributes.$inferSelect;
export type InsertGS1Attribute = typeof gs1Attributes.$inferInsert;
```

**Design Rationale:**

The schema accommodates all three technical formats identified in the colleague reports. The `technicalFormat` enum allows filtering by implementation layer, while format-specific fields (`gdsnXmlTag`, `ediSegment`, `jsonLdProperty`) store the precise technical specifications developers need. The `validationRules` JSON field provides flexibility for complex validation logic without requiring schema changes.

### 1.3 Table 2: `regulation_attribute_mappings`

This table links regulations to specific GS1 attributes, creating the actionable compliance intelligence that users need.

```typescript
/**
 * Regulation-to-Attribute Mappings
 * Links EU regulations to specific GS1 technical attributes required for compliance
 */
export const regulationAttributeMappings = mysqlTable(
  "regulation_attribute_mappings",
  {
    id: int("id").autoincrement().primaryKey(),

    // Relationships
    regulationId: int("regulationId").notNull(), // Foreign key to regulations table
    attributeId: int("attributeId").notNull(), // Foreign key to gs1_attributes table

    // Requirement Classification
    requirementLevel: mysqlEnum("requirementLevel", [
      "MANDATORY", // Legally required for compliance
      "RECOMMENDED", // Best practice but not legally required
      "OPTIONAL", // Nice-to-have for enhanced compliance
      "CONDITIONAL", // Required only under specific circumstances
    ]).notNull(),

    // Compliance Context
    rationale: text("rationale").notNull(), // Explanation of why this attribute is required (e.g., "EUDR Article 9 requires geolocation data for all commodities")
    complianceDeadline: timestamp("complianceDeadline"), // When this requirement becomes mandatory
    applicableScenarios: text("applicableScenarios"), // JSON array of scenarios where this applies (e.g., ["coffee_import", "cocoa_import"])

    // Sector & Geography Filters
    applicableSectors: text("applicableSectors"), // JSON array (e.g., ["textiles", "food", "electronics"])
    applicableCountries: text("applicableCountries"), // JSON array (e.g., ["NL", "DE", "BE"]) - null means all EU

    // Verification & Quality
    verifiedByExpert: boolean("verifiedByExpert").default(false), // Manual validation by GS1 expert
    verificationDate: timestamp("verificationDate"),
    verifiedBy: varchar("verifiedBy", { length: 255 }), // Name of verifying expert

    // Usage Tracking
    viewCount: int("viewCount").default(0), // How many times this mapping was viewed

    // Metadata
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    regulationIdIdx: index("regulationId_idx").on(table.regulationId),
    attributeIdIdx: index("attributeId_idx").on(table.attributeId),
    requirementLevelIdx: index("requirementLevel_idx").on(
      table.requirementLevel
    ),
    uniqueMapping: index("unique_mapping_idx").on(
      table.regulationId,
      table.attributeId
    ), // Prevent duplicate mappings
  })
);

export type RegulationAttributeMapping =
  typeof regulationAttributeMappings.$inferSelect;
export type InsertRegulationAttributeMapping =
  typeof regulationAttributeMappings.$inferInsert;
```

**Design Rationale:**

The schema supports nuanced compliance requirements through the `requirementLevel` enum (not all attributes are equally mandatory). The `applicableScenarios`, `applicableSectors`, and `applicableCountries` fields enable context-aware filtering (e.g., "Show me EUDR attributes for coffee imports in Netherlands"). The `verifiedByExpert` flag allows ISA to distinguish between AI-generated mappings and expert-validated mappings, building user trust.

### 1.4 Database Migration Script

```typescript
// drizzle/migrations/0001_add_gs1_attributes.ts

import { sql } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";

export async function up(db: MySql2Database) {
  // Create gs1_attributes table
  await db.execute(sql`
    CREATE TABLE gs1_attributes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      standardId INT NOT NULL,
      attributeName VARCHAR(255) NOT NULL,
      attributeDisplayName VARCHAR(255) NOT NULL,
      technicalFormat ENUM('GDSN_XML', 'EDI_SEGMENT', 'JSON_LD', 'MULTI_FORMAT') NOT NULL,
      dataType VARCHAR(50) NOT NULL,
      isRequired BOOLEAN DEFAULT FALSE,
      validationRules TEXT,
      gdsnXmlTag VARCHAR(255),
      gdsnModule VARCHAR(100),
      ediSegment VARCHAR(100),
      ediQualifier VARCHAR(50),
      jsonLdProperty VARCHAR(255),
      description TEXT NOT NULL,
      exampleValue TEXT,
      codeExample TEXT,
      gs1NavigatorUrl VARCHAR(512),
      implementationGuideUrl VARCHAR(512),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      INDEX standardId_idx (standardId),
      INDEX technicalFormat_idx (technicalFormat),
      INDEX attributeName_idx (attributeName),
      FOREIGN KEY (standardId) REFERENCES gs1_standards(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Create regulation_attribute_mappings table
  await db.execute(sql`
    CREATE TABLE regulation_attribute_mappings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      regulationId INT NOT NULL,
      attributeId INT NOT NULL,
      requirementLevel ENUM('MANDATORY', 'RECOMMENDED', 'OPTIONAL', 'CONDITIONAL') NOT NULL,
      rationale TEXT NOT NULL,
      complianceDeadline TIMESTAMP,
      applicableScenarios TEXT,
      applicableSectors TEXT,
      applicableCountries TEXT,
      verifiedByExpert BOOLEAN DEFAULT FALSE,
      verificationDate TIMESTAMP,
      verifiedBy VARCHAR(255),
      viewCount INT DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      INDEX regulationId_idx (regulationId),
      INDEX attributeId_idx (attributeId),
      INDEX requirementLevel_idx (requirementLevel),
      UNIQUE INDEX unique_mapping_idx (regulationId, attributeId),
      FOREIGN KEY (regulationId) REFERENCES regulations(id) ON DELETE CASCADE,
      FOREIGN KEY (attributeId) REFERENCES gs1_attributes(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

export async function down(db: MySql2Database) {
  await db.execute(sql`DROP TABLE IF EXISTS regulation_attribute_mappings;`);
  await db.execute(sql`DROP TABLE IF EXISTS gs1_attributes;`);
}
```

**Execution:**

```bash
cd /home/ubuntu/isa_web
pnpm db:push
```

---

## Part 2: Data Population Strategy

### 2.1 Overview

Populating the GS1 attributes database requires a hybrid approach combining manual curation (Phase 1), automated scraping (Phase 2), and community contribution (Phase 3). The colleague reports provide 6 detailed tables with 50-100 critical attributes that can be manually curated as the initial dataset.

### 2.2 Phase 1: Manual Curation (Week 1, 20 hours)

**Objective:** Extract and structure 80-100 critical attributes from the colleague reports (Tables 1-6) to create the MVP dataset.

**Data Sources:**

1. **Table 1: VSME Basic Module** (Report 2, Lines 63-110)
   - 8 GDSN Entity Attributes (totalEnergyConsumption, gasesEmissionsScope1, gasesEmissionsScope2, pollutantEmissionQuantity, totalWasteGenerated, wasteRecyclingPercentage, employeeCount, genderDiversityRatio)
2. **Table 2: EUDR EDI Segments** (Report 2, Lines 149-180)
   - 2 EDI Segments (RFF+DDR, RFF+DDV)
3. **Table 3: EUDR Master Data** (Report 2, Lines 187-208)
   - 4 GDSN Attributes (regulationTypeCode, countryOfProduction, scientificName, commodityCode)
4. **Table 4: Textile DPP** (Report 2, Lines 236-265)
   - 7 JSON-LD Properties (gs1:gtin, gs1:materialComposition, gs1:recycledContentPercentage, gs1:repairabilityScore, gs1:durabilityIndex, gs1:certification)
5. **Table 5: Battery Passport** (Report 2, Lines 272-288)
   - 4 Attribute Categories (Performance, Durability, Carbon Footprint, Chemistry)
6. **Table 6: PPWR Packaging** (Report 2, Lines 311-332)
   - 5 GDSN Packaging Attributes (packagingMaterialTypeCode, packagingRecyclingSchemeCode, packagingRecyclabilityAssessmentSpecificationCode, packagingRecycledContent, packagingWeight)

**Curation Process:**

1. **Extract:** Copy attribute specifications from reports into structured spreadsheet (CSV format)
2. **Enrich:** Add missing fields (description, exampleValue, codeExample) using GS1 Navigator documentation
3. **Validate:** Cross-reference with GS1 official documentation to ensure accuracy
4. **Import:** Load CSV into database using TypeScript import script

**Sample CSV Structure:**

```csv
standardId,attributeName,attributeDisplayName,technicalFormat,dataType,isRequired,gdsnXmlTag,gdsnModule,ediSegment,ediQualifier,jsonLdProperty,description,exampleValue,codeExample,gs1NavigatorUrl
15,packagingMaterialTypeCode,Packaging Material Type Code,GDSN_XML,enum,true,<packagingMaterialTypeCode>,Packaging Information Module,,,,"Identifies the material type of packaging component. Must use precise codes for Verpact fee calculation (e.g., PET_TRANSPARENT vs. PET_OPAQUE).",PET_TRANSPARENT,"<packagingInformation><packagingMaterialTypeCode>PET_TRANSPARENT</packagingMaterialTypeCode></packagingInformation>",https://navigator.gs1.org/gdsn/attribute-details?name=packagingMaterialTypeCode
12,RFF+DDR,DDS Reference Number,EDI_SEGMENT,string,true,,,RFF+DDR,DDR,,"Unique ID generated by TRACES system upon submission of EUDR Due Diligence Statement. Must be linked to specific line items in DESADV.",RFF+DDR:1234567890:1,"LIN+1++1234567890123:EN'RFF+DDR:1234567890:1'",https://ref.gs1.org/standards/eudr/
```

**Import Script:**

```typescript
// server/seed-gs1-attributes.ts

import { db } from "./db";
import { gs1Attributes, regulationAttributeMappings } from "../drizzle/schema";
import * as fs from "fs";
import * as csv from "csv-parse/sync";

interface AttributeRow {
  standardId: number;
  attributeName: string;
  attributeDisplayName: string;
  technicalFormat: "GDSN_XML" | "EDI_SEGMENT" | "JSON_LD" | "MULTI_FORMAT";
  dataType: string;
  isRequired: boolean;
  gdsnXmlTag?: string;
  gdsnModule?: string;
  ediSegment?: string;
  ediQualifier?: string;
  jsonLdProperty?: string;
  description: string;
  exampleValue?: string;
  codeExample?: string;
  gs1NavigatorUrl?: string;
}

async function seedGS1Attributes() {
  console.log("Loading GS1 attributes from CSV...");

  const csvContent = fs.readFileSync("./data/gs1_attributes.csv", "utf-8");
  const records: AttributeRow[] = csv.parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    cast: (value, context) => {
      if (context.column === "isRequired") return value === "true";
      if (context.column === "standardId") return parseInt(value);
      return value;
    },
  });

  console.log(`Parsed ${records.length} attributes from CSV`);

  let inserted = 0;
  for (const record of records) {
    try {
      await db.insert(gs1Attributes).values({
        standardId: record.standardId,
        attributeName: record.attributeName,
        attributeDisplayName: record.attributeDisplayName,
        technicalFormat: record.technicalFormat,
        dataType: record.dataType,
        isRequired: record.isRequired,
        gdsnXmlTag: record.gdsnXmlTag || null,
        gdsnModule: record.gdsnModule || null,
        ediSegment: record.ediSegment || null,
        ediQualifier: record.ediQualifier || null,
        jsonLdProperty: record.jsonLdProperty || null,
        description: record.description,
        exampleValue: record.exampleValue || null,
        codeExample: record.codeExample || null,
        gs1NavigatorUrl: record.gs1NavigatorUrl || null,
      });
      inserted++;
    } catch (error) {
      console.error(`Failed to insert ${record.attributeName}:`, error);
    }
  }

  console.log(
    `✅ Successfully inserted ${inserted}/${records.length} attributes`
  );
}

seedGS1Attributes().catch(console.error);
```

**Execution:**

```bash
npx tsx server/seed-gs1-attributes.ts
```

**Expected Output:** 80-100 attributes inserted into `gs1_attributes` table

### 2.3 Phase 2: Automated GS1 Navigator Scraping (Week 2, 16 hours)

**Objective:** Expand attribute coverage from 100 to 300-500 by scraping GS1 Navigator API.

**GS1 Navigator API:**

GS1 provides a public API for accessing attribute definitions:

```
https://navigator.gs1.org/api/gdsn/attributes?version=13
```

**Scraping Strategy:**

1. **Fetch:** Query GS1 Navigator API for all GDSN attributes
2. **Filter:** Identify ESG-relevant attributes (packaging, sustainability, regulatory)
3. **Transform:** Convert API response to ISA schema format
4. **Deduplicate:** Skip attributes already manually curated in Phase 1
5. **Import:** Bulk insert into database

**Scraper Script:**

```typescript
// server/scrape-gs1-navigator.ts

import axios from "axios";
import { db } from "./db";
import { gs1Attributes } from "../drizzle/schema";

interface GS1NavigatorAttribute {
  name: string;
  displayName: string;
  dataType: string;
  module: string;
  description: string;
  exampleValue?: string;
  required: boolean;
  url: string;
}

async function scrapeGS1Navigator() {
  console.log("Fetching attributes from GS1 Navigator API...");

  const response = await axios.get<GS1NavigatorAttribute[]>(
    "https://navigator.gs1.org/api/gdsn/attributes?version=13"
  );

  const allAttributes = response.data;
  console.log(`Fetched ${allAttributes.length} total attributes`);

  // Filter for ESG-relevant attributes
  const esgKeywords = [
    "packaging",
    "recycl",
    "sustain",
    "carbon",
    "emission",
    "energy",
    "waste",
    "circular",
    "environment",
    "regulat",
    "compliance",
    "certification",
    "material",
    "chemical",
    "hazard",
    "safety",
  ];

  const esgAttributes = allAttributes.filter(attr => {
    const searchText =
      `${attr.name} ${attr.displayName} ${attr.description}`.toLowerCase();
    return esgKeywords.some(keyword => searchText.includes(keyword));
  });

  console.log(`Filtered to ${esgAttributes.length} ESG-relevant attributes`);

  // Check which attributes already exist (from Phase 1 manual curation)
  const existingNames = await db
    .select({ name: gs1Attributes.attributeName })
    .from(gs1Attributes);

  const existingSet = new Set(existingNames.map(r => r.name));

  const newAttributes = esgAttributes.filter(
    attr => !existingSet.has(attr.name)
  );
  console.log(`${newAttributes.length} new attributes to import`);

  // Map GS1 modules to standard IDs (requires manual mapping table)
  const moduleToStandardId: Record<string, number> = {
    "Packaging Information Module": 15, // GDSN standard ID
    "Regulatory Information Module": 12,
    "Sustainability Module": 18,
    // ... add more mappings
  };

  let inserted = 0;
  for (const attr of newAttributes) {
    const standardId = moduleToStandardId[attr.module] || 1; // Default to generic GDSN

    try {
      await db.insert(gs1Attributes).values({
        standardId,
        attributeName: attr.name,
        attributeDisplayName: attr.displayName,
        technicalFormat: "GDSN_XML",
        dataType: attr.dataType,
        isRequired: attr.required,
        gdsnXmlTag: `<${attr.name}>`,
        gdsnModule: attr.module,
        description: attr.description,
        exampleValue: attr.exampleValue || null,
        gs1NavigatorUrl: attr.url,
      });
      inserted++;
    } catch (error) {
      console.error(`Failed to insert ${attr.name}:`, error);
    }
  }

  console.log(
    `✅ Successfully inserted ${inserted}/${newAttributes.length} attributes`
  );
}

scrapeGS1Navigator().catch(console.error);
```

**Execution:**

```bash
npx tsx server/scrape-gs1-navigator.ts
```

**Expected Output:** 200-400 additional attributes inserted (total: 300-500 attributes)

### 2.4 Phase 3: Regulation-to-Attribute Mapping (Week 2-3, 24 hours)

**Objective:** Create 500-1,000 regulation→attribute mappings by combining manual curation with LLM-assisted mapping.

**Manual Mapping (High-Priority Regulations):**

For the 8 most critical regulations (CSRD, EUDR, ESPR/DPP, PPWR, VSME, CSDDD, ECGT, Right to Repair), manually create mappings using the colleague reports as the authoritative source.

**Sample Mapping CSV:**

```csv
regulationId,attributeId,requirementLevel,rationale,complianceDeadline,applicableSectors,verifiedByExpert
5,42,MANDATORY,"EUDR Article 9 requires geolocation data for all commodities. DDS Reference Number must be transmitted via EDI DESADV RFF segment.",2026-12-30,"[""food"",""timber"",""textiles""]",true
5,43,MANDATORY,"EUDR Article 9 requires verification code alongside DDS Reference Number for TRACES validation.",2026-12-30,"[""food"",""timber"",""textiles""]",true
8,67,MANDATORY,"PPWR Article 11 mandates recyclability labeling. Packaging material type must be specified using granular codes (e.g., PET_TRANSPARENT vs. PET_OPAQUE) for Verpact fee calculation.",2026-08-01,"[""food"",""retail"",""consumer_goods""]",true
```

**LLM-Assisted Mapping (Remaining Regulations):**

For the remaining 30 regulations, use LLM to generate initial mappings that can be reviewed and validated by experts.

```typescript
// server/generate-attribute-mappings.ts

import { invokeLLM } from "./server/_core/llm";
import { db } from "./db";
import {
  regulations,
  gs1Attributes,
  regulationAttributeMappings,
} from "../drizzle/schema";

async function generateAttributeMappings(regulationId: number) {
  // Fetch regulation details
  const regulation = await db
    .select()
    .from(regulations)
    .where(eq(regulations.id, regulationId))
    .limit(1);

  if (!regulation[0]) {
    throw new Error(`Regulation ${regulationId} not found`);
  }

  // Fetch all available attributes
  const attributes = await db.select().from(gs1Attributes).limit(500);

  // Build LLM prompt
  const prompt = `You are an expert in EU sustainability regulations and GS1 standards.

Regulation: ${regulation[0].title}
Type: ${regulation[0].regulationType}
Description: ${regulation[0].description}

Available GS1 Attributes (${attributes.length} total):
${attributes.map(a => `- ${a.attributeName} (${a.technicalFormat}): ${a.description}`).join("\n")}

Task: Identify which GS1 attributes are required, recommended, or optional for compliance with this regulation.

Return a JSON array with this structure:
[
  {
    "attributeName": "packagingMaterialTypeCode",
    "requirementLevel": "MANDATORY",
    "rationale": "PPWR Article 11 requires recyclability labeling...",
    "applicableSectors": ["food", "retail"]
  }
]

Focus on attributes that are directly required by the regulation's legal text, not just "nice to have."`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a compliance expert specializing in GS1 standards.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "attribute_mappings",
        strict: true,
        schema: {
          type: "object",
          properties: {
            mappings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  attributeName: { type: "string" },
                  requirementLevel: {
                    type: "string",
                    enum: [
                      "MANDATORY",
                      "RECOMMENDED",
                      "OPTIONAL",
                      "CONDITIONAL",
                    ],
                  },
                  rationale: { type: "string" },
                  applicableSectors: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["attributeName", "requirementLevel", "rationale"],
                additionalProperties: false,
              },
            },
          },
          required: ["mappings"],
          additionalProperties: false,
        },
      },
    },
  });

  const result = JSON.parse(response.choices[0].message.content);

  // Insert mappings into database
  let inserted = 0;
  for (const mapping of result.mappings) {
    const attribute = attributes.find(
      a => a.attributeName === mapping.attributeName
    );
    if (!attribute) continue;

    try {
      await db.insert(regulationAttributeMappings).values({
        regulationId: regulation[0].id,
        attributeId: attribute.id,
        requirementLevel: mapping.requirementLevel,
        rationale: mapping.rationale,
        applicableSectors: JSON.stringify(mapping.applicableSectors || []),
        verifiedByExpert: false, // LLM-generated, needs expert review
      });
      inserted++;
    } catch (error) {
      console.error(
        `Failed to insert mapping for ${mapping.attributeName}:`,
        error
      );
    }
  }

  console.log(
    `✅ Generated ${inserted} attribute mappings for regulation ${regulationId}`
  );
  return inserted;
}

// Batch process all regulations
async function batchGenerateMappings() {
  const allRegulations = await db
    .select({ id: regulations.id })
    .from(regulations);

  let totalMappings = 0;
  for (const reg of allRegulations) {
    console.log(`\nProcessing regulation ${reg.id}...`);
    const count = await generateAttributeMappings(reg.id);
    totalMappings += count;

    // Rate limiting: wait 2 seconds between LLM calls
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n✅ Total mappings generated: ${totalMappings}`);
}

batchGenerateMappings().catch(console.error);
```

**Expected Output:** 500-1,000 regulation→attribute mappings (15-25 per regulation)

---

## Part 3: Backend Implementation

### 3.1 Database Helper Functions

**File:** `server/db.ts`

```typescript
import { db } from "./db";
import {
  gs1Attributes,
  regulationAttributeMappings,
  gs1Standards,
} from "../drizzle/schema";
import { eq, and, inArray, sql } from "drizzle-orm";

// ============================================
// GS1 Attributes Helpers
// ============================================

export async function getAttributesByStandard(standardId: number) {
  return db
    .select()
    .from(gs1Attributes)
    .where(eq(gs1Attributes.standardId, standardId))
    .orderBy(gs1Attributes.attributeName);
}

export async function getAttributesByFormat(
  format: "GDSN_XML" | "EDI_SEGMENT" | "JSON_LD" | "MULTI_FORMAT"
) {
  return db
    .select()
    .from(gs1Attributes)
    .where(eq(gs1Attributes.technicalFormat, format))
    .orderBy(gs1Attributes.attributeName);
}

export async function searchAttributes(query: string, limit: number = 50) {
  return db
    .select()
    .from(gs1Attributes)
    .where(
      sql`MATCH(${gs1Attributes.attributeName}, ${gs1Attributes.description}) AGAINST(${query} IN NATURAL LANGUAGE MODE)`
    )
    .limit(limit);
}

export async function getAttributeById(attributeId: number) {
  const result = await db
    .select({
      attribute: gs1Attributes,
      standard: gs1Standards,
    })
    .from(gs1Attributes)
    .leftJoin(gs1Standards, eq(gs1Attributes.standardId, gs1Standards.id))
    .where(eq(gs1Attributes.id, attributeId))
    .limit(1);

  return result[0] || null;
}

// ============================================
// Regulation-Attribute Mapping Helpers
// ============================================

export async function getAttributesByRegulation(
  regulationId: number,
  filters?: {
    requirementLevel?: "MANDATORY" | "RECOMMENDED" | "OPTIONAL" | "CONDITIONAL";
    technicalFormat?: "GDSN_XML" | "EDI_SEGMENT" | "JSON_LD" | "MULTI_FORMAT";
    sector?: string;
  }
) {
  let query = db
    .select({
      mapping: regulationAttributeMappings,
      attribute: gs1Attributes,
      standard: gs1Standards,
    })
    .from(regulationAttributeMappings)
    .leftJoin(
      gs1Attributes,
      eq(regulationAttributeMappings.attributeId, gs1Attributes.id)
    )
    .leftJoin(gs1Standards, eq(gs1Attributes.standardId, gs1Standards.id))
    .where(eq(regulationAttributeMappings.regulationId, regulationId));

  // Apply filters
  if (filters?.requirementLevel) {
    query = query.where(
      eq(regulationAttributeMappings.requirementLevel, filters.requirementLevel)
    );
  }

  if (filters?.technicalFormat) {
    query = query.where(
      eq(gs1Attributes.technicalFormat, filters.technicalFormat)
    );
  }

  if (filters?.sector) {
    query = query.where(
      sql`JSON_CONTAINS(${regulationAttributeMappings.applicableSectors}, JSON_QUOTE(${filters.sector}))`
    );
  }

  const results = await query;

  return results.map(r => ({
    ...r.mapping,
    attribute: r.attribute,
    standard: r.standard,
  }));
}

export async function getRegulationsByAttribute(attributeId: number) {
  return db
    .select({
      mapping: regulationAttributeMappings,
      regulation: regulations,
    })
    .from(regulationAttributeMappings)
    .leftJoin(
      regulations,
      eq(regulationAttributeMappings.regulationId, regulations.id)
    )
    .where(eq(regulationAttributeMappings.attributeId, attributeId))
    .orderBy(regulationAttributeMappings.requirementLevel);
}

export async function getAttributeMappingStats(regulationId: number) {
  const stats = await db
    .select({
      requirementLevel: regulationAttributeMappings.requirementLevel,
      count: sql<number>`COUNT(*)`,
    })
    .from(regulationAttributeMappings)
    .where(eq(regulationAttributeMappings.regulationId, regulationId))
    .groupBy(regulationAttributeMappings.requirementLevel);

  return {
    mandatory: stats.find(s => s.requirementLevel === "MANDATORY")?.count || 0,
    recommended:
      stats.find(s => s.requirementLevel === "RECOMMENDED")?.count || 0,
    optional: stats.find(s => s.requirementLevel === "OPTIONAL")?.count || 0,
    conditional:
      stats.find(s => s.requirementLevel === "CONDITIONAL")?.count || 0,
    total: stats.reduce((sum, s) => sum + Number(s.count), 0),
  };
}

export async function incrementAttributeViewCount(mappingId: number) {
  await db
    .update(regulationAttributeMappings)
    .set({ viewCount: sql`${regulationAttributeMappings.viewCount} + 1` })
    .where(eq(regulationAttributeMappings.id, mappingId));
}
```

### 3.2 tRPC Procedures

**File:** `server/routers.ts`

```typescript
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./trpc";
import * as db from "./db";

// ============================================
// GS1 Attributes Router
// ============================================

export const gs1AttributesRouter = router({
  // List all attributes with optional filters
  list: publicProcedure
    .input(
      z.object({
        standardId: z.number().optional(),
        technicalFormat: z
          .enum(["GDSN_XML", "EDI_SEGMENT", "JSON_LD", "MULTI_FORMAT"])
          .optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(500).default(100),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      if (input.search) {
        return db.searchAttributes(input.search, input.limit);
      }

      if (input.standardId) {
        return db.getAttributesByStandard(input.standardId);
      }

      if (input.technicalFormat) {
        return db.getAttributesByFormat(input.technicalFormat);
      }

      // Default: return all attributes with pagination
      return db.getAllAttributes(input.limit, input.offset);
    }),

  // Get single attribute with full details
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getAttributeById(input.id);
    }),

  // Get attributes required for a specific regulation
  getByRegulation: publicProcedure
    .input(
      z.object({
        regulationId: z.number(),
        requirementLevel: z
          .enum(["MANDATORY", "RECOMMENDED", "OPTIONAL", "CONDITIONAL"])
          .optional(),
        technicalFormat: z
          .enum(["GDSN_XML", "EDI_SEGMENT", "JSON_LD", "MULTI_FORMAT"])
          .optional(),
        sector: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { regulationId, ...filters } = input;
      return db.getAttributesByRegulation(regulationId, filters);
    }),

  // Get attribute mapping statistics for a regulation
  getStats: publicProcedure
    .input(z.object({ regulationId: z.number() }))
    .query(async ({ input }) => {
      return db.getAttributeMappingStats(input.regulationId);
    }),

  // Track attribute view (for analytics)
  trackView: publicProcedure
    .input(z.object({ mappingId: z.number() }))
    .mutation(async ({ input }) => {
      await db.incrementAttributeViewCount(input.mappingId);
      return { success: true };
    }),
});

// Add to main router
export const appRouter = router({
  // ... existing routers
  gs1Attributes: gs1AttributesRouter,
});
```

### 3.3 API Endpoints Summary

| Endpoint                        | Method   | Auth   | Purpose                                                 |
| ------------------------------- | -------- | ------ | ------------------------------------------------------- |
| `gs1Attributes.list`            | Query    | Public | List attributes with filters (standard, format, search) |
| `gs1Attributes.getById`         | Query    | Public | Get single attribute with full details                  |
| `gs1Attributes.getByRegulation` | Query    | Public | Get attributes required for specific regulation         |
| `gs1Attributes.getStats`        | Query    | Public | Get attribute mapping statistics                        |
| `gs1Attributes.trackView`       | Mutation | Public | Track attribute view for analytics                      |

---

## Part 4: Frontend Implementation

### 4.1 UI Component: Attribute Mapper Tab

**Location:** `client/src/components/AttributeMapperTab.tsx`

This component displays GS1 attributes required for a specific regulation, organized by technical format (GDSN, EDI, JSON-LD).

```typescript
import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Code, FileCode, Globe } from "lucide-react";

interface AttributeMapperTabProps {
  regulationId: number;
}

export function AttributeMapperTab({ regulationId }: AttributeMapperTabProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  // Fetch attribute mappings
  const { data: mappings, isLoading } = trpc.gs1Attributes.getByRegulation.useQuery({
    regulationId,
    requirementLevel: selectedLevel === "all" ? undefined : selectedLevel as any,
    technicalFormat: selectedFormat === "all" ? undefined : selectedFormat as any,
  });

  // Fetch statistics
  const { data: stats } = trpc.gs1Attributes.getStats.useQuery({ regulationId });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading attributes...</div>;
  }

  if (!mappings || mappings.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No GS1 attribute mappings found for this regulation. This may indicate the regulation
          does not require specific GS1 technical implementations, or mappings have not yet been created.
        </AlertDescription>
      </Alert>
    );
  }

  // Group mappings by technical format
  const gdsnAttributes = mappings.filter(m => m.attribute?.technicalFormat === "GDSN_XML");
  const ediAttributes = mappings.filter(m => m.attribute?.technicalFormat === "EDI_SEGMENT");
  const jsonLdAttributes = mappings.filter(m => m.attribute?.technicalFormat === "JSON_LD");

  return (
    <div className="space-y-6">
      {/* Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mandatory</CardDescription>
            <CardTitle className="text-3xl">{stats?.mandatory || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Recommended</CardDescription>
            <CardTitle className="text-3xl">{stats?.recommended || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Optional</CardDescription>
            <CardTitle className="text-3xl">{stats?.optional || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Attributes</CardDescription>
            <CardTitle className="text-3xl">{stats?.total || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">All Requirement Levels</option>
          <option value="MANDATORY">Mandatory Only</option>
          <option value="RECOMMENDED">Recommended Only</option>
          <option value="OPTIONAL">Optional Only</option>
          <option value="CONDITIONAL">Conditional Only</option>
        </select>

        <select
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">All Technical Formats</option>
          <option value="GDSN_XML">GDSN XML Only</option>
          <option value="EDI_SEGMENT">EDI Segments Only</option>
          <option value="JSON_LD">JSON-LD Only</option>
        </select>
      </div>

      {/* Attribute Tabs by Format */}
      <Tabs defaultValue="gdsn" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gdsn">
            <FileCode className="w-4 h-4 mr-2" />
            GDSN XML ({gdsnAttributes.length})
          </TabsTrigger>
          <TabsTrigger value="edi">
            <Code className="w-4 h-4 mr-2" />
            EDI Segments ({ediAttributes.length})
          </TabsTrigger>
          <TabsTrigger value="jsonld">
            <Globe className="w-4 h-4 mr-2" />
            JSON-LD ({jsonLdAttributes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gdsn" className="space-y-4">
          {gdsnAttributes.length === 0 ? (
            <Alert>
              <AlertDescription>No GDSN XML attributes required for this regulation.</AlertDescription>
            </Alert>
          ) : (
            gdsnAttributes.map((mapping) => (
              <AttributeCard key={mapping.id} mapping={mapping} />
            ))
          )}
        </TabsContent>

        <TabsContent value="edi" className="space-y-4">
          {ediAttributes.length === 0 ? (
            <Alert>
              <AlertDescription>No EDI segments required for this regulation.</AlertDescription>
            </Alert>
          ) : (
            ediAttributes.map((mapping) => (
              <AttributeCard key={mapping.id} mapping={mapping} />
            ))
          )}
        </TabsContent>

        <TabsContent value="jsonld" className="space-y-4">
          {jsonLdAttributes.length === 0 ? (
            <Alert>
              <AlertDescription>No JSON-LD properties required for this regulation.</AlertDescription>
            </Alert>
          ) : (
            jsonLdAttributes.map((mapping) => (
              <AttributeCard key={mapping.id} mapping={mapping} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Individual Attribute Card Component
function AttributeCard({ mapping }: { mapping: any }) {
  const trackView = trpc.gs1Attributes.trackView.useMutation();

  const handleViewDocs = () => {
    trackView.mutate({ mappingId: mapping.id });
  };

  const requirementLevelColor = {
    MANDATORY: "bg-red-100 text-red-800",
    RECOMMENDED: "bg-yellow-100 text-yellow-800",
    OPTIONAL: "bg-green-100 text-green-800",
    CONDITIONAL: "bg-blue-100 text-blue-800",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{mapping.attribute?.attributeDisplayName}</CardTitle>
            <CardDescription className="mt-1">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                {mapping.attribute?.gdsnXmlTag || mapping.attribute?.ediSegment || mapping.attribute?.jsonLdProperty}
              </code>
            </CardDescription>
          </div>
          <Badge className={requirementLevelColor[mapping.requirementLevel as keyof typeof requirementLevelColor]}>
            {mapping.requirementLevel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description */}
        <div>
          <h4 className="font-semibold text-sm mb-1">Description</h4>
          <p className="text-sm text-gray-600">{mapping.attribute?.description}</p>
        </div>

        {/* Compliance Rationale */}
        <div>
          <h4 className="font-semibold text-sm mb-1">Compliance Rationale</h4>
          <p className="text-sm text-gray-600">{mapping.rationale}</p>
        </div>

        <Separator />

        {/* Technical Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Data Type:</span> {mapping.attribute?.dataType}
          </div>
          <div>
            <span className="font-semibold">Required:</span> {mapping.attribute?.isRequired ? "Yes" : "No"}
          </div>
          {mapping.attribute?.gdsnModule && (
            <div className="col-span-2">
              <span className="font-semibold">GDSN Module:</span> {mapping.attribute?.gdsnModule}
            </div>
          )}
        </div>

        {/* Example Value */}
        {mapping.attribute?.exampleValue && (
          <div>
            <h4 className="font-semibold text-sm mb-1">Example Value</h4>
            <code className="block text-sm bg-gray-100 p-2 rounded">{mapping.attribute.exampleValue}</code>
          </div>
        )}

        {/* Code Example */}
        {mapping.attribute?.codeExample && (
          <div>
            <h4 className="font-semibold text-sm mb-1">Code Example</h4>
            <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
              {mapping.attribute.codeExample}
            </pre>
          </div>
        )}

        {/* Documentation Links */}
        {mapping.attribute?.gs1NavigatorUrl && (
          <a
            href={mapping.attribute.gs1NavigatorUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleViewDocs}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            View GS1 Navigator Documentation
          </a>
        )}
      </CardContent>
    </Card>
  );
}
```

### 4.2 Integration into Regulation Detail Page

**File:** `client/src/pages/HubRegulationDetail.tsx`

Add new tab to existing regulation detail page:

```typescript
import { AttributeMapperTab } from "@/components/AttributeMapperTab";

export function HubRegulationDetail() {
  const { id } = useParams();
  const regulationId = parseInt(id || "0");

  // ... existing code

  return (
    <div className="container mx-auto py-8">
      {/* ... existing header */}

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="esrs">ESRS Datapoints</TabsTrigger>
          <TabsTrigger value="attributes">GS1 Attributes</TabsTrigger> {/* NEW */}
          <TabsTrigger value="standards">GS1 Standards</TabsTrigger>
          <TabsTrigger value="news">Related News</TabsTrigger>
        </TabsList>

        {/* ... existing tabs */}

        <TabsContent value="attributes">
          <AttributeMapperTab regulationId={regulationId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 4.3 Standalone Attribute Browser Page

**File:** `client/src/pages/AttributeBrowser.tsx`

Create dedicated page for browsing all GS1 attributes (not filtered by regulation):

```typescript
import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export function AttributeBrowser() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");

  const { data: attributes, isLoading } = trpc.gs1Attributes.list.useQuery({
    search: searchQuery || undefined,
    technicalFormat: selectedFormat === "all" ? undefined : selectedFormat as any,
    limit: 100,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">GS1 Attribute Browser</h1>
        <p className="text-gray-600">
          Explore {attributes?.length || 0} GS1 technical attributes for ESG compliance implementation
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search attributes by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">All Formats</option>
          <option value="GDSN_XML">GDSN XML</option>
          <option value="EDI_SEGMENT">EDI Segments</option>
          <option value="JSON_LD">JSON-LD</option>
        </select>
      </div>

      {/* Attribute Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading attributes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attributes?.map((attr) => (
            <Card key={attr.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{attr.attributeDisplayName}</CardTitle>
                  <Badge variant="outline">{attr.technicalFormat}</Badge>
                </div>
                <CardDescription>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {attr.gdsnXmlTag || attr.ediSegment || attr.jsonLdProperty}
                  </code>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3">{attr.description}</p>
                {attr.exampleValue && (
                  <div className="mt-3">
                    <span className="text-xs font-semibold">Example:</span>
                    <code className="block text-xs bg-gray-100 p-2 rounded mt-1">
                      {attr.exampleValue}
                    </code>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

Add route to `App.tsx`:

```typescript
<Route path="/hub/attributes" element={<AttributeBrowser />} />
```

---

## Part 5: Testing Requirements

### 5.1 Unit Tests (Vitest)

**File:** `server/gs1-attributes.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "./db";
import * as dbHelpers from "./db";
import {
  gs1Attributes,
  gs1Standards,
  regulations,
  regulationAttributeMappings,
} from "../drizzle/schema";

describe("GS1 Attributes Database Helpers", () => {
  let testStandardId: number;
  let testRegulationId: number;
  let testAttributeId: number;

  beforeAll(async () => {
    // Create test standard
    const [standard] = await db
      .insert(gs1Standards)
      .values({
        standardCode: "TEST_STANDARD",
        standardName: "Test Standard",
        description: "Test standard for attribute mapper",
        category: "Testing",
      })
      .$returningId();
    testStandardId = standard.id;

    // Create test regulation
    const [regulation] = await db
      .insert(regulations)
      .values({
        title: "Test Regulation",
        description: "Test regulation for attribute mapper",
        regulationType: "OTHER",
      })
      .$returningId();
    testRegulationId = regulation.id;

    // Create test attribute
    const [attribute] = await db
      .insert(gs1Attributes)
      .values({
        standardId: testStandardId,
        attributeName: "testAttribute",
        attributeDisplayName: "Test Attribute",
        technicalFormat: "GDSN_XML",
        dataType: "string",
        isRequired: true,
        gdsnXmlTag: "<testAttribute>",
        description: "Test attribute for unit testing",
        exampleValue: "TEST_VALUE",
      })
      .$returningId();
    testAttributeId = attribute.id;
  });

  afterAll(async () => {
    // Cleanup
    await db
      .delete(regulationAttributeMappings)
      .where(eq(regulationAttributeMappings.regulationId, testRegulationId));
    await db.delete(gs1Attributes).where(eq(gs1Attributes.id, testAttributeId));
    await db.delete(regulations).where(eq(regulations.id, testRegulationId));
    await db.delete(gs1Standards).where(eq(gs1Standards.id, testStandardId));
  });

  it("should retrieve attributes by standard", async () => {
    const attributes = await dbHelpers.getAttributesByStandard(testStandardId);
    expect(attributes).toHaveLength(1);
    expect(attributes[0].attributeName).toBe("testAttribute");
  });

  it("should retrieve attributes by technical format", async () => {
    const attributes = await dbHelpers.getAttributesByFormat("GDSN_XML");
    expect(attributes.length).toBeGreaterThan(0);
    expect(attributes.every(a => a.technicalFormat === "GDSN_XML")).toBe(true);
  });

  it("should search attributes by keyword", async () => {
    const attributes = await dbHelpers.searchAttributes("test");
    expect(attributes.length).toBeGreaterThan(0);
  });

  it("should create regulation-attribute mapping", async () => {
    await db.insert(regulationAttributeMappings).values({
      regulationId: testRegulationId,
      attributeId: testAttributeId,
      requirementLevel: "MANDATORY",
      rationale: "Test mapping for unit testing",
    });

    const mappings =
      await dbHelpers.getAttributesByRegulation(testRegulationId);
    expect(mappings).toHaveLength(1);
    expect(mappings[0].requirementLevel).toBe("MANDATORY");
  });

  it("should filter mappings by requirement level", async () => {
    const mandatoryOnly = await dbHelpers.getAttributesByRegulation(
      testRegulationId,
      {
        requirementLevel: "MANDATORY",
      }
    );
    expect(mandatoryOnly.every(m => m.requirementLevel === "MANDATORY")).toBe(
      true
    );
  });

  it("should calculate attribute mapping statistics", async () => {
    const stats = await dbHelpers.getAttributeMappingStats(testRegulationId);
    expect(stats.mandatory).toBe(1);
    expect(stats.total).toBe(1);
  });

  it("should increment view count", async () => {
    const [mapping] = await db
      .select()
      .from(regulationAttributeMappings)
      .where(eq(regulationAttributeMappings.regulationId, testRegulationId))
      .limit(1);

    const initialCount = mapping.viewCount;
    await dbHelpers.incrementAttributeViewCount(mapping.id);

    const [updated] = await db
      .select()
      .from(regulationAttributeMappings)
      .where(eq(regulationAttributeMappings.id, mapping.id))
      .limit(1);

    expect(updated.viewCount).toBe(initialCount + 1);
  });
});
```

**Run tests:**

```bash
pnpm test server/gs1-attributes.test.ts
```

**Expected Output:** 7/7 tests passing

### 5.2 Integration Tests (tRPC Procedures)

**File:** `server/gs1-attributes-router.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import { createCallerFactory } from "./trpc";

const createCaller = createCallerFactory(appRouter);

describe("GS1 Attributes tRPC Router", () => {
  const caller = createCaller({ user: null }); // Public procedures

  it("should list attributes with pagination", async () => {
    const result = await caller.gs1Attributes.list({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it("should filter attributes by technical format", async () => {
    const result = await caller.gs1Attributes.list({
      technicalFormat: "GDSN_XML",
    });
    expect(result.every(a => a.technicalFormat === "GDSN_XML")).toBe(true);
  });

  it("should search attributes by keyword", async () => {
    const result = await caller.gs1Attributes.list({ search: "packaging" });
    expect(result.length).toBeGreaterThan(0);
  });

  it("should get attribute by ID", async () => {
    const allAttributes = await caller.gs1Attributes.list({ limit: 1 });
    const attributeId = allAttributes[0].id;

    const result = await caller.gs1Attributes.getById({ id: attributeId });
    expect(result).not.toBeNull();
    expect(result?.attribute.id).toBe(attributeId);
  });

  it("should get attributes by regulation", async () => {
    // Assuming regulation ID 5 is EUDR (from existing data)
    const result = await caller.gs1Attributes.getByRegulation({
      regulationId: 5,
    });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get attribute mapping statistics", async () => {
    const result = await caller.gs1Attributes.getStats({ regulationId: 5 });
    expect(result).toHaveProperty("mandatory");
    expect(result).toHaveProperty("recommended");
    expect(result).toHaveProperty("total");
    expect(typeof result.total).toBe("number");
  });
});
```

**Run tests:**

```bash
pnpm test server/gs1-attributes-router.test.ts
```

**Expected Output:** 6/6 tests passing

### 5.3 End-to-End Tests (UI)

**Manual Testing Checklist:**

1. **Regulation Detail Page - Attributes Tab**
   - [ ] Navigate to `/hub/regulations/5` (EUDR)
   - [ ] Click "GS1 Attributes" tab
   - [ ] Verify statistics cards show correct counts
   - [ ] Verify attributes are grouped by format (GDSN, EDI, JSON-LD)
   - [ ] Verify requirement level badges display correctly (MANDATORY, RECOMMENDED, etc.)
   - [ ] Verify code examples render properly
   - [ ] Click "View GS1 Navigator Documentation" link - opens in new tab
   - [ ] Test filters (requirement level, technical format)
   - [ ] Verify empty state displays when no attributes found

2. **Attribute Browser Page**
   - [ ] Navigate to `/hub/attributes`
   - [ ] Verify attribute grid displays
   - [ ] Test search functionality (type "packaging")
   - [ ] Test format filter dropdown
   - [ ] Verify attribute cards show correct information
   - [ ] Verify code examples are truncated with "line-clamp-3"

3. **Mobile Responsiveness**
   - [ ] Test on mobile viewport (375px width)
   - [ ] Verify tabs stack vertically
   - [ ] Verify attribute cards stack in single column
   - [ ] Verify code examples scroll horizontally

---

## Part 6: Effort Estimation

### 6.1 Task Breakdown

| Task                              | Description                                         | Estimated Hours | Dependencies              |
| --------------------------------- | --------------------------------------------------- | --------------- | ------------------------- |
| **Database Schema**               | Create tables, write migration script, test locally | 4 hours         | None                      |
| **Data Population - Phase 1**     | Manual curation of 80-100 attributes from reports   | 20 hours        | Schema complete           |
| **Data Population - Phase 2**     | GS1 Navigator scraping script                       | 16 hours        | Phase 1 complete          |
| **Data Population - Phase 3**     | Regulation-attribute mapping (manual + LLM)         | 24 hours        | Phase 2 complete          |
| **Backend - Database Helpers**    | Write 8-10 helper functions in db.ts                | 8 hours         | Schema complete           |
| **Backend - tRPC Procedures**     | Create gs1AttributesRouter with 5 procedures        | 6 hours         | Database helpers complete |
| **Frontend - AttributeMapperTab** | Build regulation detail tab component               | 12 hours        | tRPC procedures complete  |
| **Frontend - AttributeBrowser**   | Build standalone attribute browser page             | 8 hours         | tRPC procedures complete  |
| **Testing - Unit Tests**          | Write 15-20 vitest tests for database helpers       | 6 hours         | Backend complete          |
| **Testing - Integration Tests**   | Write 10-15 tRPC procedure tests                    | 4 hours         | Backend complete          |
| **Testing - Manual QA**           | End-to-end testing, bug fixes                       | 8 hours         | Frontend complete         |
| **Documentation**                 | Update README, write user guide                     | 4 hours         | All features complete     |

**Total Estimated Effort:** 120 hours (3 weeks at 40 hours/week)

### 6.2 Team Allocation

**Recommended Team:**

- **1 Full-Stack Developer** (80 hours) - Backend + Frontend implementation
- **1 Data Curator** (40 hours) - Manual attribute curation + mapping validation

**Alternative (Solo Developer):**

- **1 Full-Stack Developer** (120 hours) - All tasks

### 6.3 Timeline (3-Week Sprint)

**Week 1: Database & Data Foundation**

- Day 1-2: Database schema design, migration, testing (8 hours)
- Day 3-5: Manual attribute curation from reports (20 hours)
- Weekend: Buffer for data quality review

**Week 2: Automation & Backend**

- Day 1-2: GS1 Navigator scraping script (16 hours)
- Day 3-4: LLM-assisted regulation-attribute mapping (24 hours)
- Day 5: Database helpers + tRPC procedures (14 hours)

**Week 3: Frontend & Testing**

- Day 1-2: AttributeMapperTab component (12 hours)
- Day 3: AttributeBrowser page (8 hours)
- Day 4: Unit + integration tests (10 hours)
- Day 5: Manual QA, bug fixes, documentation (12 hours)

### 6.4 Risk Mitigation

**Risk 1: Data Quality Issues**

- **Mitigation:** Implement validation checks in import scripts, manual review of Phase 1 data before proceeding to Phase 2

**Risk 2: GS1 Navigator API Changes**

- **Mitigation:** Build scraper with error handling, fallback to manual curation if API unavailable

**Risk 3: LLM Mapping Accuracy**

- **Mitigation:** Mark LLM-generated mappings as "unverified", implement expert review workflow

**Risk 4: Scope Creep**

- **Mitigation:** Focus on MVP (80-100 attributes, 5-8 regulations), defer advanced features (user-contributed mappings, AI re-training)

---

## Part 7: Success Metrics

### 7.1 Launch Metrics (Week 4)

| Metric                   | Target     | Measurement Method           |
| ------------------------ | ---------- | ---------------------------- |
| **Attributes Populated** | 300-500    | Database count query         |
| **Regulation Mappings**  | 500-1,000  | Database count query         |
| **Test Coverage**        | 90%+       | Vitest coverage report       |
| **Page Load Time**       | <2 seconds | Lighthouse performance audit |
| **Zero Critical Bugs**   | 0          | Manual QA checklist          |

### 7.2 Post-Launch Metrics (Month 1)

| Metric                        | Target                  | Measurement Method              |
| ----------------------------- | ----------------------- | ------------------------------- |
| **Daily Active Users**        | 50+                     | Analytics (view count tracking) |
| **Attribute Views**           | 500+/week               | Database analytics query        |
| **User Engagement**           | 5+ minutes avg. session | Analytics                       |
| **Documentation Link Clicks** | 100+/week               | Click tracking                  |
| **User Feedback**             | 80%+ positive           | Feedback form                   |

### 7.3 Business Impact Metrics (Quarter 1)

| Metric                  | Target                      | Measurement Method        |
| ----------------------- | --------------------------- | ------------------------- |
| **B2B Leads Generated** | 20+                         | Contact form submissions  |
| **Enterprise Trials**   | 5+                          | Paid subscription signups |
| **Revenue**             | €5,000+ MRR                 | Subscription billing      |
| **Market Positioning**  | #1 for "GS1 ESG compliance" | SEO ranking               |

---

## Part 8: Future Enhancements (Post-MVP)

### 8.1 Phase 4: Community Contribution (Q2 2026)

**Feature:** Allow GS1 Netherlands members to suggest attribute mappings and vote on accuracy.

**Implementation:**

- Add `user_contributed_mappings` table
- Build submission form with admin approval workflow
- Implement upvote/downvote system (similar to ESRS mapping feedback)

**Expected Impact:** Crowdsourced validation improves mapping accuracy to 95%+

### 8.2 Phase 5: Code Generator (Q2 2026)

**Feature:** Generate implementation code snippets based on selected attributes.

**Example:** User selects "EUDR compliance for coffee import" → System generates:

- GDSN XML template with required fields
- EDI DESADV message with RFF segments
- JSON-LD DPP structure

**Implementation:**

- Template engine (Handlebars or similar)
- Language selection (XML, JSON, Python, JavaScript)
- Download as ZIP file

**Expected Impact:** Reduces implementation time from days to hours

### 8.3 Phase 6: Compliance Checklist Generator (Q3 2026)

**Feature:** Generate printable compliance checklists for auditors.

**Example:** "PPWR Compliance Checklist for Packaging Manufacturers"

- [ ] Populate packagingMaterialTypeCode (MANDATORY)
- [ ] Populate packagingWeight (MANDATORY)
- [ ] Populate packagingRecycledContent (RECOMMENDED)

**Implementation:**

- PDF generation library (jsPDF)
- Customizable checklist templates
- Export to Excel for project management

**Expected Impact:** Positions ISA as audit preparation tool

---

## Conclusion

The GS1 Attribute Mapper transforms ISA from a regulation knowledge base into an actionable implementation guide, addressing the critical gap identified in the colleague reports. With a realistic 3-week implementation timeline, 300-500 attributes covering all major EU sustainability regulations, and comprehensive testing, this feature will establish ISA as the authoritative technical reference for GS1 ESG compliance.

**Recommended Next Steps:**

1. **Approve Specification** - Review this document with stakeholders, confirm scope and timeline
2. **Allocate Resources** - Assign 1 full-stack developer + 1 data curator for 3-week sprint
3. **Begin Phase 1** - Start manual attribute curation from colleague reports (20 hours)
4. **Schedule Kickoff** - Target launch date: January 31, 2026

**Questions or Clarifications:** Contact technical team for implementation details or data curation guidance.

---

**Document End**
