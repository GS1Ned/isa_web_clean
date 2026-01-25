# INGEST-06: CBV ESG Vocabularies and Digital Link Types

## 1. Context

We have two curated JSON files containing GS1 Core Business Vocabulary (CBV) vocabularies focused on ESG use cases and GS1 Digital Link types. These files provide standardized vocabularies for supply chain events (business steps, dispositions, error declarations) and link types for Digital Link resolvers.

Source files **must** be placed under `/data/cbv/` and `/data/digital_link/` in the project root:

- `/data/cbv/cbv_esg_curated.json` (13 KB) - ESG-focused CBV vocabularies
- `/data/digital_link/linktypes.json` (14 KB) - GS1 Digital Link types

This ingestion builds ISA's EPCIS and Digital Link foundation used for supply chain event modeling, traceability, and Digital Link resolver features.

---

## 2. Exact Task

Implement a TypeScript ingestion module that:

1. Reads both JSON files from `/data/cbv/` and `/data/digital_link/`.
2. Parses CBV vocabularies (business steps, dispositions, error declarations) and link types.
3. Loads the records into ISA's database via Drizzle ORM.
4. Populates both raw and canonical tables:

   - Raw staging tables (`raw_cbv_vocabularies`, `raw_digital_link_types`).
   - Canonical entities `cbvBizSteps`, `cbvDispositions`, `cbvErrorDeclarations`, `digitalLinkTypes`.

5. Is idempotent (safe to re-run without duplicating canonical records).
6. Exposes the following interface:

```ts
export interface IngestOptions {
  dryRun?: boolean;
  limit?: number;
}

export async function ingestCbvVocabularies(
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

- `server/ingest/INGEST-06_cbv_vocabularies.ts`
- `server/ingest/INGEST-06_cbv_vocabularies.test.ts`
- Optional: small fixture files under `/data/fixtures/INGEST-06_*.json`.

---

## 4. Source Format

### cbv_esg_curated.json

Contains metadata and three vocabulary arrays:

```json
{
  "metadata": {
    "title": "ESG-Focused CBV Vocabularies (Curated)",
    "description": "Curated subset of GS1 Core Business Vocabulary focusing on ESG traceability, sustainability, and regulatory compliance use cases",
    "source": "https://ref.gs1.org/cbv/",
    "standards": ["EPCIS 2.0", "CBV 2.0"],
    "curated_date": "2025-12-10",
    "esg_relevance": "HIGH",
    "use_cases": [
      "EUDR origin traceability",
      "CSRD Scope 3 supply chain mapping",
      "PPWR packaging lifecycle tracking"
    ]
  },
  "bizSteps": [
    {
      "urn": "urn:epcglobal:cbv:bizstep:commissioning",
      "name": "Commissioning",
      "description": "Creating and commissioning of an object",
      "esg_relevance": "HIGH",
      "use_cases": ["Product creation event", "Origin tracking", "EUDR first mile"]
    },
    {
      "urn": "urn:epcglobal:cbv:bizstep:transforming",
      "name": "Transforming",
      "description": "Transforming input objects into output objects",
      "esg_relevance": "HIGH",
      "use_cases": ["Manufacturing", "Processing", "Value chain transformation"]
    }
  ],
  "dispositions": [
    {
      "urn": "urn:epcglobal:cbv:disp:active",
      "name": "Active",
      "description": "Object is active and available for use",
      "esg_relevance": "MEDIUM",
      "use_cases": ["Inventory status", "Product lifecycle"]
    },
    {
      "urn": "urn:epcglobal:cbv:disp:in_transit",
      "name": "In Transit",
      "description": "Object is in transit between locations",
      "esg_relevance": "HIGH",
      "use_cases": ["Supply chain tracking", "Transportation emissions"]
    }
  ],
  "errorDeclarations": [
    {
      "urn": "urn:epcglobal:cbv:er:incorrect_data",
      "name": "Incorrect Data",
      "description": "Previously reported data was incorrect",
      "esg_relevance": "HIGH",
      "use_cases": ["Data quality", "Audit trail", "Compliance correction"]
    }
  ]
}
```

**Key fields:**
- `metadata` (object) - File metadata (skip for ingestion)
- `bizSteps` (array) - Business step vocabularies
- `dispositions` (array) - Disposition vocabularies
- `errorDeclarations` (array) - Error declaration vocabularies

**Vocabulary object fields:**
- `urn` (string) - Unique URN identifier
- `name` (string) - Human-readable name
- `description` (string) - Description
- `esg_relevance` (string) - ESG relevance (HIGH, MEDIUM, LOW)
- `use_cases` (array) - Use case descriptions

### linktypes.json

Object with link type definitions:

```json
{
  "activityIdeas": {
    "title": "Activity Ideas",
    "description": "A link to ideas for using a product or engaging in other forms of entertainment, particularly with children.",
    "status": "stable"
  },
  "allergenInfo": {
    "title": "Allergen information",
    "description": "A link to a description of the allergen information.",
    "status": "stable"
  },
  "appDownload": {
    "title": "App download",
    "description": "A link to a related app download",
    "status": "stable"
  },
  "certificationInfo": {
    "title": "Certification information",
    "description": "A link to certification information",
    "status": "stable"
  },
  "productInfo": {
    "title": "Product information",
    "description": "A link to general product information",
    "status": "stable"
  },
  "sustainabilityInfo": {
    "title": "Sustainability information",
    "description": "A link to sustainability and eco-design information",
    "status": "stable"
  },
  "traceability": {
    "title": "Traceability information",
    "description": "A link to traceability information, including origin and supply chain",
    "status": "stable"
  }
}
```

**Key fields:**
- Key (string) - Link type key (e.g., "allergenInfo")
- `title` (string) - Human-readable title
- `description` (string) - Description
- `status` (string) - Status (stable, deprecated, etc.)

---

## 5. Target Tables and Mappings

**Propose new tables in `drizzle/schema.ts`:**

### Raw Tables

```ts
export const rawCbvVocabularies = mysqlTable("raw_cbv_vocabularies", {
  id: int("id").autoincrement().primaryKey(),
  vocabularyType: varchar("vocabulary_type", { length: 50 }).notNull(), // bizStep, disposition, errorDeclaration
  urn: varchar("urn", { length: 255 }).notNull(),
  rawJson: json("raw_json").$type<any>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const rawDigitalLinkTypes = mysqlTable("raw_digital_link_types", {
  id: int("id").autoincrement().primaryKey(),
  linkTypeKey: varchar("link_type_key", { length: 100 }).notNull(),
  rawJson: json("raw_json").$type<any>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
```

### Canonical Tables

```ts
export const cbvBizSteps = mysqlTable("cbv_biz_steps", {
  id: int("id").autoincrement().primaryKey(),
  urn: varchar("urn", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  esgRelevance: varchar("esg_relevance", { length: 50 }), // HIGH, MEDIUM, LOW
  useCases: json("use_cases").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  urnIndex: index("idx_bizstep_urn").on(table.urn),
}));

export const cbvDispositions = mysqlTable("cbv_dispositions", {
  id: int("id").autoincrement().primaryKey(),
  urn: varchar("urn", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  esgRelevance: varchar("esg_relevance", { length: 50 }),
  useCases: json("use_cases").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  urnIndex: index("idx_disposition_urn").on(table.urn),
}));

export const cbvErrorDeclarations = mysqlTable("cbv_error_declarations", {
  id: int("id").autoincrement().primaryKey(),
  urn: varchar("urn", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  esgRelevance: varchar("esg_relevance", { length: 50 }),
  useCases: json("use_cases").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  urnIndex: index("idx_error_urn").on(table.urn),
}));

export const digitalLinkTypes = mysqlTable("digital_link_types", {
  id: int("id").autoincrement().primaryKey(),
  linkTypeKey: varchar("link_type_key", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }), // stable, deprecated, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  keyIndex: index("idx_link_type_key").on(table.linkTypeKey),
}));
```

---

## 6. Behaviour & Constraints

- Do not delete existing rows unless a task explicitly instructs you to.
- Use upsert logic:
  - CBV vocabularies keyed on `urn`
  - Digital Link types keyed on `linkTypeKey`
- On `dryRun: true`, perform all parsing and mapping but skip DB writes; log what would be inserted/updated.
- Handle missing or null fields gracefully.
- **Skip metadata object** in cbv_esg_curated.json (only ingest vocabularies).
- Log summary: "Inserted X business steps, Y dispositions, Z error declarations, W link types".

---

## 7. Testing Requirements

Implement `server/ingest/INGEST-06_cbv_vocabularies.test.ts` with Vitest:

- Use small fixture samples (5 business steps, 3 dispositions, 2 error declarations, 5 link types).
- Test happy path ingestion:
  - All vocabulary types are inserted correctly.
  - JSON fields (use cases) are preserved.
  - Digital Link types are inserted correctly.
- Test idempotency:
  - Calling `ingestCbvVocabularies` twice does not duplicate canonical rows.
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
- All CBV vocabularies and Digital Link types from source files are ingested correctly.
- JSON fields are properly stored and retrievable.
- The canonical tables can be queried for EPCIS event modeling and Digital Link resolver features.
- Ingestion completes in <10 seconds for full dataset (~50 vocabularies, ~30 link types).
- Clear logging shows summary (vocabularies inserted/updated by type, link types inserted/updated).

---

## 9. Integration Notes

After implementation:
- Add table definitions to `drizzle/schema.ts`
- Run `pnpm db:generate` to create migration
- Run `pnpm db:push` to apply migration
- Add script to `package.json`: `"ingest:cbv": "tsx server/ingest/INGEST-06_cbv_vocabularies.ts"`
- Test with: `pnpm ingest:cbv --dry-run`
- Run full ingestion: `pnpm ingest:cbv`

---

## 10. Dependencies

- **Depends on:** None (standalone)
- **Enables:** EPCIS event modeling, supply chain traceability, Digital Link resolver

---

## 11. Usage Example

After ingestion, the data can be queried like this:

```ts
// Get all business steps with HIGH ESG relevance
const highEsgBizSteps = await db
  .select()
  .from(cbvBizSteps)
  .where(eq(cbvBizSteps.esgRelevance, 'HIGH'));

// Get commissioning business step
const commissioning = await db
  .select()
  .from(cbvBizSteps)
  .where(eq(cbvBizSteps.urn, 'urn:epcglobal:cbv:bizstep:commissioning'));

// Get all Digital Link types related to sustainability
const sustainabilityLinks = await db
  .select()
  .from(digitalLinkTypes)
  .where(like(digitalLinkTypes.linkTypeKey, '%sustainability%'));

// Get all dispositions
const allDispositions = await db.select().from(cbvDispositions);
```

---

**End of INGEST-06 Specification**
