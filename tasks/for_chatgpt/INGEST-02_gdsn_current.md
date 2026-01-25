# INGEST-02: GDSN Current Classes and Validation Rules

## 1. Context

We have GS1 Global Data Synchronisation Network (GDSN) Current v3.1.32 machine-readable resources available to ISA. These files describe GDSN class definitions, class attributes, and validation rules used for product data synchronization and compliance.

Source files **must** be placed under `/data/gs1/gdsn/` in the project root, extracted from `GDSN Current v3.1.32.zip`:

- `/data/gs1/gdsn/gdsn_classes.json` (333 KB, ~1,500 classes)
- `/data/gs1/gdsn/gdsn_classAttributes.json` (1.3 MB, ~8,000 class-attribute mappings)
- `/data/gs1/gdsn/gdsn_validationRules.json` (1.1 MB, ~3,000 validation rules)
- `/data/gs1/gdsn/gdsn_codeValues.json` (6.8 MB, code lists - **defer to later phase**)
- `/data/gs1/gdsn/gdsn_instances.json` (4.5 MB, instance data - **defer to later phase**)

**Scope for this task:** Ingest classes, class attributes, and validation rules only. Defer code values and instances to a future task to keep this lean.

This ingestion builds ISA's GDSN compliance layer used for product data validation, GDSN-to-GDM mapping, and regulatory compliance features.

---

## 2. Exact Task

Implement a TypeScript ingestion module that:

1. Reads the above JSON files from `/data/gs1/gdsn/`.
2. Loads the records into ISA's database via Drizzle ORM.
3. Populates both raw and canonical tables:

   - Raw staging tables preserving 1:1 source records (e.g. `raw_gdsn_classes`, `raw_gdsn_class_attributes`, `raw_gdsn_validation_rules`).
   - Canonical entities such as `gdsnClasses`, `gdsnClassAttributes`, `gdsnValidationRules`.

4. Is idempotent (safe to re-run without duplicating canonical records).
5. Exposes the following interface:

```ts
export interface IngestOptions {
  dryRun?: boolean;
  limit?: number;
}

export async function ingestGdsnCurrent(
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

- `server/ingest/INGEST-02_gdsn_current.ts`
- `server/ingest/INGEST-02_gdsn_current.test.ts`
- Optional: small fixture file(s) under `/data/fixtures/INGEST-02_gdsn_current_sample.json` if you need compact test inputs.

---

## 4. Source Format

### gdsn_classes.json

Array of GDSN class definitions:

```json
[
  {
    "id": -2138906502,
    "name": "PegHoleTypeCode",
    "definition": "A code depicting the type and shape of the peg hole used for the packaging.",
    "type": 4,
    "extensions": [
      {
        "destinationClassId": 1428,
        "type": 1,
        "name": "Generalization",
        "multiplicity": null,
        "definition": null
      }
    ]
  }
]
```

**Key fields:**
- `id` (integer) - Unique class ID (can be negative)
- `name` (string) - Class name
- `definition` (string) - Class definition
- `type` (integer) - Class type (2=class, 4=code list, etc.)
- `extensions` (array) - Class relationships

### gdsn_classAttributes.json

Array of class-attribute mappings:

```json
[
  {
    "classId": -2138906502,
    "attributeId": 12345,
    "attributeName": "pegHoleType",
    "multiplicity": "0..1",
    "mandatory": false,
    "definition": "The type of peg hole"
  }
]
```

**Key fields:**
- `classId` (integer) - FK to gdsn_classes.id
- `attributeId` (integer) - Attribute ID
- `attributeName` (string) - Attribute name
- `multiplicity` (string) - Cardinality (e.g., "0..1", "1..*")
- `mandatory` (boolean) - Whether attribute is mandatory

### gdsn_validationRules.json

Array of validation rules:

```json
[
  {
    "id": 2,
    "sunrise": "2.X",
    "messageName": "RegistryCatalogueItem",
    "type": null,
    "validationRuleVersion": null,
    "structuredRule": "If cancelDateTime is not empty then value must be greater than or equal to current date.",
    "errorMessageDescription": "cancelDateTime must be equal to or larger than Today's Date.",
    "passExample": null,
    "failExample": null,
    "constrainedParty": ["Source Data Pool"],
    "geoType": 1,
    "countries": [],
    "contexts": ["DP011=Y", "DP010=Y"],
    "bmsIds": [4419]
  }
]
```

**Key fields:**
- `id` (integer) - Unique rule ID
- `sunrise` (string) - GDSN version
- `messageName` (string) - Message type
- `structuredRule` (string) - Rule logic
- `errorMessageDescription` (string) - Error message
- `constrainedParty` (array) - Who must comply
- `contexts` (array) - Context codes
- `bmsIds` (array) - Related BMS IDs

---

## 5. Target Tables and Mappings

**Propose new tables in `drizzle/schema.ts`:**

### Raw Tables

```ts
export const rawGdsnClasses = mysqlTable("raw_gdsn_classes", {
  id: int("id").primaryKey(), // Use source ID as PK
  name: varchar("name", { length: 255 }).notNull(),
  definition: text("definition"),
  type: int("type"),
  rawJson: json("raw_json").$type<any>(), // Full source record
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const rawGdsnClassAttributes = mysqlTable("raw_gdsn_class_attributes", {
  id: int("id").autoincrement().primaryKey(),
  classId: int("class_id").notNull(),
  attributeId: int("attribute_id").notNull(),
  rawJson: json("raw_json").$type<any>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const rawGdsnValidationRules = mysqlTable("raw_gdsn_validation_rules", {
  id: int("id").primaryKey(), // Use source ID as PK
  sunrise: varchar("sunrise", { length: 50 }),
  messageName: varchar("message_name", { length: 255 }),
  rawJson: json("raw_json").$type<any>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
```

### Canonical Tables

```ts
export const gdsnClasses = mysqlTable("gdsn_classes", {
  id: int("id").primaryKey(), // Use source ID
  name: varchar("name", { length: 255 }).notNull(),
  definition: text("definition"),
  classType: int("class_type"), // Renamed from 'type' to avoid reserved word
  sourceVersion: varchar("source_version", { length: 50 }).default("3.1.32"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const gdsnClassAttributes = mysqlTable("gdsn_class_attributes", {
  id: int("id").autoincrement().primaryKey(),
  classId: int("class_id").notNull(),
  attributeId: int("attribute_id").notNull(),
  attributeName: varchar("attribute_name", { length: 255 }),
  multiplicity: varchar("multiplicity", { length: 50 }),
  mandatory: boolean("mandatory").default(false),
  definition: text("definition"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  uniqueClassAttribute: index("idx_class_attribute").on(table.classId, table.attributeId),
}));

export const gdsnValidationRules = mysqlTable("gdsn_validation_rules", {
  id: int("id").primaryKey(), // Use source ID
  sunrise: varchar("sunrise", { length: 50 }),
  messageName: varchar("message_name", { length: 255 }),
  structuredRule: text("structured_rule"),
  errorMessage: text("error_message"),
  constrainedParty: json("constrained_party").$type<string[]>(),
  contexts: json("contexts").$type<string[]>(),
  bmsIds: json("bms_ids").$type<number[]>(),
  geoType: int("geo_type"),
  countries: json("countries").$type<string[]>(),
  sourceVersion: varchar("source_version", { length: 50 }).default("3.1.32"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
```

---

## 6. Behaviour & Constraints

- Do not delete existing rows unless a task explicitly instructs you to.
- Use upsert logic keyed on stable identifiers (class ID, rule ID, class+attribute combination).
- On `dryRun: true`, perform all parsing and mapping but skip DB writes; log what would be inserted/updated.
- Handle missing or null fields gracefully (use defaults or skip).
- Log progress every 500 records for large files.
- **Defer code values and instances** - do not ingest `gdsn_codeValues.json` or `gdsn_instances.json` in this task.

---

## 7. Testing Requirements

Implement `server/ingest/INGEST-02_gdsn_current.test.ts` with Vitest:

- Use a small fixture sample (first 10-20 records from each file).
- Test happy path ingestion:
  - Classes, class attributes, and validation rules are inserted as expected.
  - Relationships between classes and attributes are preserved.
- Test idempotency:
  - Calling `ingestGdsnCurrent` twice does not duplicate canonical rows.
- Test `dryRun: true`:
  - No DB writes occur; verify via row counts.
- Test basic error handling for malformed records (e.g., missing required fields).
- Test `limit` option:
  - Only specified number of records are processed.

---

## 8. Acceptance Criteria

- Code compiles without TypeScript errors.
- All tests pass.
- The ingestion is idempotent and safe to re-run.
- The canonical GDSN tables are populated and can be reused by other ISA modules (e.g., product data validation, GDSN compliance checking).
- Ingestion completes in <2 minutes for full dataset (~12,500 records).
- Clear logging shows progress and summary (records inserted/updated/skipped).

---

## 9. Integration Notes

After implementation:
- Add table definitions to `drizzle/schema.ts`
- Run `pnpm db:generate` to create migration
- Run `pnpm db:push` to apply migration
- Add script to `package.json`: `"ingest:gdsn": "tsx server/ingest/INGEST-02_gdsn_current.ts"`
- Test with: `pnpm ingest:gdsn --dry-run --limit 100`
- Run full ingestion: `pnpm ingest:gdsn`

---

## 10. Dependencies

- **Depends on:** INGEST-01 (GDM attributes) - for potential cross-referencing of attribute IDs
- **Enables:** Product data validation, GDSN compliance checking, GDSN-to-GDM mapping

---

**End of INGEST-02 Specification**
