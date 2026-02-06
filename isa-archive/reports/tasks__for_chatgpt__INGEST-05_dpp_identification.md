# INGEST-05: DPP Product Identification Rules

## 1. Context

We have two curated JSON files defining Digital Product Passport (DPP) product identification components and rules. These files specify which GS1 identifiers to use for different product categories and how to construct DPP-compliant product identifiers.

Source files **must** be placed under `/data/esg/` in the project root:

- `/data/esg/dpp_identifier_components.json` (8.1 KB) - GS1 identifier definitions
- `/data/esg/dpp_identification_rules.json` (11 KB) - Product category identification rules

This ingestion builds ISA's DPP identification foundation used for DPP readiness checking, product identification validation, and DPP compliance features.

---

## 2. Exact Task

Implement a TypeScript ingestion module that:

1. Reads both JSON files from `/data/esg/`.
2. Parses identifier components and identification rules.
3. Loads the records into ISA's database via Drizzle ORM.
4. Populates both raw and canonical tables:

   - Raw staging tables (`raw_dpp_identifier_components`, `raw_dpp_id_rules`).
   - Canonical entities `dppIdentifierComponents` and `dppIdRules`.

5. Is idempotent (safe to re-run without duplicating canonical records).
6. Exposes the following interface:

```ts
export interface IngestOptions {
  dryRun?: boolean;
  limit?: number;
}

export async function ingestDppIdentification(
  options?: IngestOptions
): Promise<IngestResult>;

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

## 3. Files to Create

- `server/ingest/INGEST-05_dpp_identification.ts`
- `server/ingest/INGEST-05_dpp_identification.test.ts`
- Optional: small fixture files under `/data/fixtures/INGEST-05_*.json`.

---

## 4. Source Format

### dpp_identifier_components.json

Defines GS1 identifier types:

```json
{
  "productIdentifiers": [
    {
      "key": "GTIN",
      "fullName": "Global Trade Item Number",
      "description": "ISO/IEC 15459 compliant unique product identifier in GS1 system",
      "formats": ["GTIN-8", "GTIN-12", "GTIN-13", "GTIN-14"],
      "applicationIdentifiers": {
        "madeToStock": "AI (01)",
        "madeToOrder": "AI (03)"
      },
      "notes": [
        "GTIN-14 not permitted for retail point-of-sale",
        "AI (03) not approved for retail channel including online"
      ]
    },
    {
      "key": "GRAI",
      "fullName": "Global Returnable Asset Identifier",
      "description": "Identifies returnable assets",
      "formats": ["GRAI"],
      "applicationIdentifiers": {
        "default": "AI (8003)"
      },
      "notes": ["Used for reusable packaging and assets"]
    }
  ],
  "batchLotIdentifiers": [
    {
      "key": "LGTIN",
      "fullName": "Lot/Batch GTIN",
      "description": "GTIN + Lot/Batch number",
      "applicationIdentifiers": {
        "default": "AI (01) + AI (10)"
      }
    }
  ],
  "serialIdentifiers": [
    {
      "key": "SGTIN",
      "fullName": "Serialized GTIN",
      "description": "GTIN + Serial number",
      "applicationIdentifiers": {
        "default": "AI (01) + AI (21)"
      }
    }
  ]
}
```

**Key fields:**
- `key` (string) - Identifier key (GTIN, GRAI, LGTIN, etc.)
- `fullName` (string) - Full name
- `description` (string) - Description
- `formats` (array) - Supported formats
- `applicationIdentifiers` (object) - AI codes
- `notes` (array) - Additional notes

### dpp_identification_rules.json

Defines which identifiers to use for product categories:

```json
[
  {
    "productCategory": "Textiles and Apparel",
    "dppRegulation": "ESPR",
    "recommendedIdentifiers": {
      "primary": "GTIN",
      "batch": "LGTIN",
      "serial": "SGTIN"
    },
    "rationale": "GTIN for product class, LGTIN for batch traceability, SGTIN for individual item tracking",
    "mandatoryDataElements": [
      "Product identification (GTIN)",
      "Batch/lot number",
      "Manufacturing date",
      "Composition (fiber content)",
      "Origin country"
    ],
    "optionalDataElements": [
      "Serial number",
      "Recycled content percentage",
      "Care instructions"
    ]
  },
  {
    "productCategory": "Electronics",
    "dppRegulation": "ESPR",
    "recommendedIdentifiers": {
      "primary": "GTIN",
      "serial": "SGTIN"
    },
    "rationale": "GTIN for product model, SGTIN for individual device tracking and warranty",
    "mandatoryDataElements": [
      "Product identification (GTIN)",
      "Serial number",
      "Manufacturing date",
      "Battery information",
      "Repairability score"
    ],
    "optionalDataElements": [
      "Energy efficiency rating",
      "Recyclability information"
    ]
  }
]
```

**Key fields:**
- `productCategory` (string) - Product category name
- `dppRegulation` (string) - Applicable regulation (ESPR, PPWR, etc.)
- `recommendedIdentifiers` (object) - Which identifiers to use
  - `primary` (string) - Primary identifier
  - `batch` (string) - Batch identifier (optional)
  - `serial` (string) - Serial identifier (optional)
- `rationale` (string) - Why these identifiers
- `mandatoryDataElements` (array) - Required data elements
- `optionalDataElements` (array) - Optional data elements

---

## 5. Target Tables and Mappings

**Propose new tables in `drizzle/schema.ts`:**

### Raw Tables

```ts
export const rawDppIdentifierComponents = mysqlTable("raw_dpp_identifier_components", {
  id: int("id").autoincrement().primaryKey(),
  identifierKey: varchar("identifier_key", { length: 50 }).notNull(),
  category: varchar("category", { length: 50 }), // product, batch, serial
  rawJson: json("raw_json").$type<any>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const rawDppIdRules = mysqlTable("raw_dpp_id_rules", {
  id: int("id").autoincrement().primaryKey(),
  productCategory: varchar("product_category", { length: 255 }).notNull(),
  rawJson: json("raw_json").$type<any>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
```

### Canonical Tables

```ts
export const dppIdentifierComponents = mysqlTable("dpp_identifier_components", {
  id: int("id").autoincrement().primaryKey(),
  identifierKey: varchar("identifier_key", { length: 50 }).notNull().unique(), // GTIN, GRAI, etc.
  fullName: varchar("full_name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }), // product, batch, serial
  formats: json("formats").$type<string[]>(), // ["GTIN-8", "GTIN-12", ...]
  applicationIdentifiers: json("application_identifiers").$type<Record<string, string>>(),
  notes: json("notes").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  keyIndex: index("idx_identifier_key").on(table.identifierKey),
}));

export const dppIdRules = mysqlTable("dpp_id_rules", {
  id: int("id").autoincrement().primaryKey(),
  productCategory: varchar("product_category", { length: 255 }).notNull().unique(),
  dppRegulation: varchar("dpp_regulation", { length: 50 }), // ESPR, PPWR, etc.
  primaryIdentifier: varchar("primary_identifier", { length: 50 }), // GTIN, GRAI, etc.
  batchIdentifier: varchar("batch_identifier", { length: 50 }), // LGTIN, etc.
  serialIdentifier: varchar("serial_identifier", { length: 50 }), // SGTIN, etc.
  rationale: text("rationale"),
  mandatoryDataElements: json("mandatory_data_elements").$type<string[]>(),
  optionalDataElements: json("optional_data_elements").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  categoryIndex: index("idx_product_category").on(table.productCategory),
}));
```

---

## 6. Behaviour & Constraints

- Do not delete existing rows unless a task explicitly instructs you to.
- Use upsert logic:
  - Identifier components keyed on `identifierKey`
  - ID rules keyed on `productCategory`
- On `dryRun: true`, perform all parsing and mapping but skip DB writes; log what would be inserted/updated.
- Handle missing or null fields gracefully.
- **Category derivation for identifier components:**
  - If from `productIdentifiers` array → `category = "product"`
  - If from `batchLotIdentifiers` array → `category = "batch"`
  - If from `serialIdentifiers` array → `category = "serial"`
- Log summary: "Inserted X identifier components and Y identification rules".

---

## 7. Testing Requirements

Implement `server/ingest/INGEST-05_dpp_identification.test.ts` with Vitest:

- Use small fixture samples (5 identifier components, 3 identification rules).
- Test happy path ingestion:
  - Identifier components are inserted correctly with proper categories.
  - Identification rules are inserted with all fields.
  - JSON fields (formats, notes, data elements) are preserved.
- Test idempotency:
  - Calling `ingestDppIdentification` twice does not duplicate canonical rows.
  - Updates work correctly if source data changes.
- Test `dryRun: true`:
  - No DB writes occur; verify via row counts.
- Test basic error handling:
  - Malformed objects are skipped with warning.
  - Missing required fields are caught.
- Test `limit` option:
  - Only specified number of records are processed.

---

## 8. Acceptance Criteria

- Code compiles without TypeScript errors.
- All tests pass.
- The ingestion is idempotent and safe to re-run.
- All identifier components and identification rules from source files are ingested correctly.
- JSON fields are properly stored and retrievable.
- The canonical tables can be queried for DPP readiness checking features.
- Ingestion completes in <5 seconds for full dataset (~20 components, ~15 rules).
- Clear logging shows summary (components inserted/updated, rules inserted/updated).

---

## 9. Integration Notes

After implementation:
- Add table definitions to `drizzle/schema.ts`
- Run `pnpm db:generate` to create migration
- Run `pnpm db:push` to apply migration
- Add script to `package.json`: `"ingest:dpp": "tsx server/ingest/INGEST-05_dpp_identification.ts"`
- Test with: `pnpm ingest:dpp --dry-run`
- Run full ingestion: `pnpm ingest:dpp`

---

## 10. Dependencies

- **Depends on:** None (standalone)
- **Enables:** DPP readiness checker, product identification validation, DPP compliance features

---

## 11. Usage Example

After ingestion, the data can be queried like this:

```ts
// Get GTIN identifier details
const gtin = await db
  .select()
  .from(dppIdentifierComponents)
  .where(eq(dppIdentifierComponents.identifierKey, 'GTIN'));

// Get identification rules for textiles
const textilesRules = await db
  .select()
  .from(dppIdRules)
  .where(eq(dppIdRules.productCategory, 'Textiles and Apparel'));

// Get all product categories requiring serial numbers
const serialCategories = await db
  .select()
  .from(dppIdRules)
  .where(isNotNull(dppIdRules.serialIdentifier));
```

---

**End of INGEST-05 Specification**
