# ISA Ingestion Batch: INGEST-02, 04, 05, 06

**Your Role:** You are implementing 4 ingestion modules for the Intelligent Standards Architect (ISA) project in parallel. Each module follows the same pattern established in INGEST-03 (ESRS datapoints), which you successfully completed.

**Context:** INGEST-03 is complete and working perfectly. You're now building the next wave of ingestion modules to populate ISA's core data foundation with ~13,000 additional records across GDSN, DPP, and CBV standards.

---

## What You Will Deliver

For **each of the 4 tasks** below, provide:

1. **Main ingestion module** (`server/ingest/INGEST-XX_name.ts`)
2. **Test file** (`server/ingest/INGEST-XX_name.test.ts`)
3. **Schema additions** (table definitions for `drizzle/schema.ts`)
4. **README** (`server/ingest/INGEST-XX_name_README.md`)
5. **Package.json script** (e.g., `"ingest:gdsn": "tsx server/ingest/INGEST-02_gdsn_current.ts"`)

**Total deliverables:** 20 files (5 files × 4 tasks)

---

## Critical Requirements

### ✅ DO

- **Follow INGEST-03 pattern exactly** - Use the same interfaces, structure, and testing approach
- **Use `getDb()` async pattern** - `const db = await getDb(); if (!db) throw new Error(...);`
- **Import XLSX correctly** - `import XLSX from "xlsx";` (default import, not `* as XLSX`)
- **Create both raw and canonical tables** - Raw for staging, canonical for normalized data
- **Implement idempotency** - Check for existing records by unique key, update instead of insert
- **Write comprehensive tests** - Cover normalization, ingestion, idempotency, dry-run, limit, errors
- **Use vitest mocks** - Mock file system and data sources in tests
- **Add package.json scripts** - One script per ingestion task

### ❌ DON'T

- Don't use `db` directly - always use `await getDb()`
- Don't use `import * as XLSX` - use `import XLSX`
- Don't skip raw tables - they're required for audit and debugging
- Don't forget indexes - add indexes on foreign keys and frequently queried columns
- Don't hardcode paths - use `path.join(process.cwd(), 'data', ...)`
- Don't skip error handling - wrap main logic in try/catch
- Don't forget CLI support - Add `if (import.meta.url === \`file://\${process.argv[1]}\`) { ... }`

---

## Standard Interfaces (Use These Exactly)

```typescript
export interface IngestOptions {
  dryRun?: boolean;
  limit?: number;
  verbose?: boolean;
}

export interface IngestResult {
  success: boolean;
  recordsProcessed: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsSkipped: number;
  duration?: number;
  errors?: string[];
}
```

---

## Task 1: INGEST-02 - GDSN Current v3.1.32

### Overview
Ingest GDSN classes, class attributes, and validation rules from JSON files.

### Source Files
- `/data/gs1/gdsn/gdsn_classes.json` (~1,500 classes)
- `/data/gs1/gdsn/gdsn_classAttributes.json` (~8,000 mappings)
- `/data/gs1/gdsn/gdsn_validationRules.json` (~3,000 rules)

### Tables to Create

**Raw Tables:**
- `raw_gdsn_classes` - 1:1 staging for classes
- `raw_gdsn_class_attributes` - 1:1 staging for class-attribute mappings
- `raw_gdsn_validation_rules` - 1:1 staging for validation rules

**Canonical Tables:**
- `gdsn_classes` - Normalized GDSN class definitions
- `gdsn_class_attributes` - Normalized class-attribute relationships
- `gdsn_validation_rules` - Normalized validation rules

### Schema Hints

```typescript
// gdsn_classes
{
  id: int("id").primaryKey(), // Use source id directly
  name: varchar("name", { length: 255 }).notNull(),
  definition: text("definition"),
  type: int("type"), // 1=String, 2=Boolean, 3=Integer, 4=Enum, etc.
  extensions: json("extensions"), // Array of extension objects
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}

// gdsn_class_attributes
{
  id: int("id").autoincrement().primaryKey(),
  classId: int("class_id").notNull(), // FK to gdsn_classes
  attributeCode: varchar("attribute_code", { length: 255 }).notNull(),
  attributeName: varchar("attribute_name", { length: 255 }),
  dataType: varchar("data_type", { length: 50 }),
  required: boolean("required").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}
// Add index on classId and unique constraint on (classId, attributeCode)

// gdsn_validation_rules
{
  id: int("id").autoincrement().primaryKey(),
  ruleId: varchar("rule_id", { length: 255 }).notNull().unique(),
  classId: int("class_id"), // FK to gdsn_classes (nullable)
  attributeCode: varchar("attribute_code", { length: 255 }),
  ruleType: varchar("rule_type", { length: 50 }), // e.g., "required", "pattern", "range"
  ruleExpression: text("rule_expression"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}
// Add indexes on classId and attributeCode
```

### Source Format Examples

**gdsn_classes.json:**
```json
[
  {
    "id": -2138906502,
    "name": "PegHoleTypeCode",
    "definition": "A code depicting the type and shape of the peg hole...",
    "type": 4,
    "extensions": [...]
  }
]
```

**gdsn_classAttributes.json:**
```json
[
  {
    "classId": -2138906502,
    "attributeCode": "gs1:pegHoleType",
    "attributeName": "Peg Hole Type",
    "dataType": "string",
    "required": false
  }
]
```

**gdsn_validationRules.json:**
```json
[
  {
    "ruleId": "RULE_001",
    "classId": -2138906502,
    "attributeCode": "gs1:pegHoleType",
    "ruleType": "required",
    "ruleExpression": "notNull()",
    "errorMessage": "Peg hole type is required"
  }
]
```

### Function Signature
```typescript
export async function ingestGdsnCurrent(
  options: IngestOptions = {}
): Promise<IngestResult>
```

### Package.json Script
```json
"ingest:gdsn": "tsx server/ingest/INGEST-02_gdsn_current.ts"
```

---

## Task 2: INGEST-04 - CTEs and KDEs

### Overview
Ingest Critical Tracking Events (CTEs) and Key Data Elements (KDEs) from JSON file.

### Source File
- `/data/esg/ctes_and_kdes.json` (~100 records)

### Tables to Create

**Raw Table:**
- `raw_ctes_kdes` - 1:1 staging

**Canonical Tables:**
- `ctes` - Critical Tracking Events
- `kdes` - Key Data Elements
- `cte_kde_mappings` - Many-to-many relationship between CTEs and KDEs

### Schema Hints

```typescript
// ctes
{
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }), // e.g., "Agriculture", "Manufacturing"
  regulationContext: varchar("regulation_context", { length: 255 }), // e.g., "EUDR", "CSDDD"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}

// kdes
{
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  dataType: varchar("data_type", { length: 50 }), // e.g., "string", "date", "location"
  mandatory: boolean("mandatory").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}

// cte_kde_mappings
{
  id: int("id").autoincrement().primaryKey(),
  cteId: int("cte_id").notNull(), // FK to ctes
  kdeId: int("kde_id").notNull(), // FK to kdes
  required: boolean("required").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}
// Add unique constraint on (cteId, kdeId)
```

### Source Format Example

```json
[
  {
    "cte": {
      "code": "CTE_HARVEST",
      "name": "Harvest Event",
      "description": "Recording of agricultural harvest",
      "category": "Agriculture",
      "regulationContext": "EUDR"
    },
    "kdes": [
      {
        "code": "KDE_LOCATION",
        "name": "Harvest Location",
        "description": "Geographic coordinates of harvest",
        "dataType": "location",
        "mandatory": true
      },
      {
        "code": "KDE_DATE",
        "name": "Harvest Date",
        "description": "Date of harvest event",
        "dataType": "date",
        "mandatory": true
      }
    ]
  }
]
```

### Function Signature
```typescript
export async function ingestCtesKdes(
  options: IngestOptions = {}
): Promise<IngestResult>
```

### Package.json Script
```json
"ingest:ctes": "tsx server/ingest/INGEST-04_ctes_kdes.ts"
```

---

## Task 3: INGEST-05 - DPP Identification Rules

### Overview
Ingest Digital Product Passport (DPP) identifier components and identification rules from JSON files.

### Source Files
- `/data/esg/dpp_identifier_components.json` (~15 components)
- `/data/esg/dpp_identification_rules.json` (~20 rules)

### Tables to Create

**Raw Tables:**
- `raw_dpp_identifier_components`
- `raw_dpp_identification_rules`

**Canonical Tables:**
- `dpp_identifier_components` - GS1 key components (GTIN, GLN, SSCC, etc.)
- `dpp_identification_rules` - Rules for DPP identification by product category

### Schema Hints

```typescript
// dpp_identifier_components
{
  id: int("id").autoincrement().primaryKey(),
  componentCode: varchar("component_code", { length: 50 }).notNull().unique(), // e.g., "GTIN", "GLN"
  componentName: varchar("component_name", { length: 255 }).notNull(),
  description: text("description"),
  gs1Standard: varchar("gs1_standard", { length: 100 }), // e.g., "GS1 General Specifications"
  format: varchar("format", { length: 100 }), // e.g., "14 digits"
  example: varchar("example", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}

// dpp_identification_rules
{
  id: int("id").autoincrement().primaryKey(),
  ruleCode: varchar("rule_code", { length: 100 }).notNull().unique(),
  productCategory: varchar("product_category", { length: 255 }).notNull(), // e.g., "Textiles", "Electronics"
  requiredComponents: json("required_components"), // Array of component codes
  optionalComponents: json("optional_components"), // Array of component codes
  regulationContext: varchar("regulation_context", { length: 255 }), // e.g., "EU DPP Regulation"
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}
// Add index on productCategory
```

### Source Format Examples

**dpp_identifier_components.json:**
```json
[
  {
    "componentCode": "GTIN",
    "componentName": "Global Trade Item Number",
    "description": "Unique identifier for trade items",
    "gs1Standard": "GS1 General Specifications",
    "format": "14 digits",
    "example": "01234567890128"
  }
]
```

**dpp_identification_rules.json:**
```json
[
  {
    "ruleCode": "DPP_TEXTILES",
    "productCategory": "Textiles",
    "requiredComponents": ["GTIN", "BATCH_LOT"],
    "optionalComponents": ["SERIAL"],
    "regulationContext": "EU DPP Regulation (Textiles)",
    "description": "Identification requirements for textile products"
  }
]
```

### Function Signature
```typescript
export async function ingestDppIdentification(
  options: IngestOptions = {}
): Promise<IngestResult>
```

### Package.json Script
```json
"ingest:dpp": "tsx server/ingest/INGEST-05_dpp_identification.ts"
```

---

## Task 4: INGEST-06 - CBV Vocabularies and Link Types

### Overview
Ingest Core Business Vocabulary (CBV) standard values and GS1 Digital Link types from JSON files.

### Source Files
- `/data/cbv/cbv_esg_curated.json` (~60 CBV terms)
- `/data/digital_link/linktypes.json` (~20 link types)

### Tables to Create

**Raw Tables:**
- `raw_cbv_vocabularies`
- `raw_link_types`

**Canonical Tables:**
- `cbv_vocabularies` - CBV standard terms (business steps, dispositions, etc.)
- `gs1_link_types` - GS1 Digital Link relationship types

### Schema Hints

```typescript
// cbv_vocabularies
{
  id: int("id").autoincrement().primaryKey(),
  vocabularyType: varchar("vocabulary_type", { length: 100 }).notNull(), // e.g., "BusinessStep", "Disposition"
  term: varchar("term", { length: 255 }).notNull(),
  uri: varchar("uri", { length: 500 }).notNull().unique(),
  definition: text("definition"),
  esgRelevance: varchar("esg_relevance", { length: 255 }), // e.g., "Traceability", "Sustainability"
  examples: json("examples"), // Array of example strings
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}
// Add indexes on vocabularyType and term

// gs1_link_types
{
  id: int("id").autoincrement().primaryKey(),
  linkType: varchar("link_type", { length: 100 }).notNull().unique(), // e.g., "gs1:certificationInfo"
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  targetUrl: varchar("target_url", { length: 500 }), // Expected URL pattern
  applicableIdentifiers: json("applicable_identifiers"), // Array of identifier types (GTIN, GLN, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}
```

### Source Format Examples

**cbv_esg_curated.json:**
```json
[
  {
    "vocabularyType": "BusinessStep",
    "term": "commissioning",
    "uri": "urn:epcglobal:cbv:bizstep:commissioning",
    "definition": "The event of producing or assembling an object",
    "esgRelevance": "Traceability",
    "examples": ["Manufacturing a product", "Assembling components"]
  }
]
```

**linktypes.json:**
```json
[
  {
    "linkType": "gs1:certificationInfo",
    "title": "Certification Information",
    "description": "Link to certification documents",
    "targetUrl": "https://example.com/cert/{gtin}",
    "applicableIdentifiers": ["GTIN", "GLN"]
  }
]
```

### Function Signature
```typescript
export async function ingestCbvAndLinkTypes(
  options: IngestOptions = {}
): Promise<IngestResult>
```

### Package.json Script
```json
"ingest:cbv": "tsx server/ingest/INGEST-06_cbv_vocabularies.ts"
```

---

## Testing Pattern (Apply to All 4 Tasks)

```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "../db";
import { tableName } from "../../drizzle/schema";
import { ingestFunction } from "./INGEST-XX_name";

// Mock file system
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(() => true),
    readFileSync: vi.fn(() => JSON.stringify(mockData))
  }
}));

describe("INGEST-XX: Task Name", () => {
  beforeEach(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    // Clear tables
    await db.delete(rawTable);
    await db.delete(canonicalTable);
  });

  it("normalizes data correctly", () => {
    // Test normalization functions
  });

  it("ingests records into raw and canonical tables", async () => {
    const result = await ingestFunction({ verbose: false });
    expect(result.success).toBe(true);
    expect(result.recordsProcessed).toBeGreaterThan(0);
    
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const rows = await db.select().from(canonicalTable);
    expect(rows.length).toBeGreaterThan(0);
  });

  it("is idempotent when running ingestion twice", async () => {
    const first = await ingestFunction();
    expect(first.success).toBe(true);
    
    const second = await ingestFunction();
    expect(second.success).toBe(true);
    expect(second.recordsInserted).toBe(0);
    expect(second.recordsUpdated).toBe(first.recordsInserted);
  });

  it("respects dry-run option", async () => {
    const result = await ingestFunction({ dryRun: true });
    expect(result.success).toBe(true);
    expect(result.recordsInserted).toBe(0);
    
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const rows = await db.select().from(canonicalTable);
    expect(rows.length).toBe(0);
  });

  it("respects limit option", async () => {
    const result = await ingestFunction({ limit: 5 });
    expect(result.recordsProcessed).toBe(5);
  });

  it("handles errors gracefully", async () => {
    // Mock file system error
    vi.mocked(fs.existsSync).mockReturnValueOnce(false);
    
    const result = await ingestFunction();
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });
});
```

---

## File Naming Convention

- Main module: `INGEST-XX_descriptive_name.ts`
- Test file: `INGEST-XX_descriptive_name.test.ts`
- README: `INGEST-XX_descriptive_name_README.md`

---

## Delivery Format

For each task, provide:

```
## INGEST-XX: Task Name

### File 1: server/ingest/INGEST-XX_name.ts
```typescript
// Complete implementation
```

### File 2: server/ingest/INGEST-XX_name.test.ts
```typescript
// Complete test suite
```

### File 3: Schema Additions (for drizzle/schema.ts)
```typescript
// Raw and canonical table definitions
```

### File 4: server/ingest/INGEST-XX_name_README.md
```markdown
# Complete README
```

### File 5: package.json Script Addition
```json
"ingest:name": "tsx server/ingest/INGEST-XX_name.ts"
```
```

Repeat for all 4 tasks.

---

## Summary

You're implementing **4 complete ingestion modules** following the proven INGEST-03 pattern. Each module will:

- Parse JSON source files
- Populate raw and canonical database tables
- Support idempotency, dry-run, and limit options
- Include comprehensive test coverage
- Provide CLI execution support

**Total output:** ~13,000 records across GDSN, DPP, and CBV standards.

**Estimated completion time:** 6-8 hours of focused work.

Ready to begin! 🚀
