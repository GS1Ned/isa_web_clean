# INGEST-04: CTEs and KDEs for Supply Chain Traceability

## 1. Context

We have a curated JSON file defining Critical Tracking Events (CTEs) and Key Data Elements (KDEs) for supply chain traceability. This file maps typical supply chain events to the data elements required for EUDR, CSRD, and other traceability regulations, along with the GS1 standards that provide those data elements.

Source file **must** be placed under `/data/esg/` in the project root:

- `/data/esg/ctes_and_kdes.json` (7.9 KB, ~15-20 CTEs)

This ingestion builds ISA's supply chain traceability foundation used for EUDR origin tracking, CSRD Scope 3 mapping, and supply chain traceability planning features.

---

## 2. Exact Task

Implement a TypeScript ingestion module that:

1. Reads the JSON file from `/data/esg/ctes_and_kdes.json`.
2. Parses CTEs and their associated KDEs.
3. Loads the records into ISA's database via Drizzle ORM.
4. Populates both raw and canonical tables:

   - Raw staging table (`raw_ctes_kdes`).
   - Canonical entities `ctes` and `kdes` with proper relationships.

5. Is idempotent (safe to re-run without duplicating canonical records).
6. Exposes the following interface:

```ts
export interface IngestOptions {
  dryRun?: boolean;
  limit?: number;
}

export async function ingestCtesKdes(
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

- `server/ingest/INGEST-04_ctes_kdes.ts`
- `server/ingest/INGEST-04_ctes_kdes.test.ts`
- Optional: small fixture file under `/data/fixtures/INGEST-04_ctes_kdes_sample.json` with 3-5 CTEs.

---

## 4. Source Format

### JSON Structure

Array of CTE objects, each containing KDEs:

```json
[
  {
    "cteId": "cte_raw_material_sourcing",
    "cteName": "Raw Material Sourcing",
    "description": "Raw material is sourced from origin location and sent to producer/manufacturer",
    "typicalKDEs": [
      {
        "kde": "who",
        "description": "Physical location handling the raw material (origin facility)",
        "gs1Standard": "GLN"
      },
      {
        "kde": "what_product",
        "description": "Raw material identification",
        "gs1Standard": "GTIN"
      },
      {
        "kde": "when",
        "description": "Timestamp of sourcing event",
        "gs1Standard": "ISO 8601"
      },
      {
        "kde": "where",
        "description": "Geographic coordinates of origin",
        "gs1Standard": "GeoCoordinates"
      },
      {
        "kde": "why",
        "description": "Business step (e.g., commissioning, harvesting)",
        "gs1Standard": "CBV BizStep"
      }
    ]
  },
  {
    "cteId": "cte_manufacturing",
    "cteName": "Manufacturing/Production",
    "description": "Raw materials are transformed into finished products",
    "typicalKDEs": [
      {
        "kde": "who",
        "description": "Manufacturing facility",
        "gs1Standard": "GLN"
      },
      {
        "kde": "what_product",
        "description": "Finished product identification",
        "gs1Standard": "GTIN"
      },
      {
        "kde": "what_batch",
        "description": "Production batch/lot",
        "gs1Standard": "LGTIN"
      },
      {
        "kde": "when",
        "description": "Production timestamp",
        "gs1Standard": "ISO 8601"
      },
      {
        "kde": "why",
        "description": "Business step (e.g., commissioning, transforming)",
        "gs1Standard": "CBV BizStep"
      }
    ]
  }
]
```

**Key fields:**
- `cteId` (string) - Unique CTE identifier (e.g., "cte_raw_material_sourcing")
- `cteName` (string) - Human-readable CTE name
- `description` (string) - CTE description
- `typicalKDEs` (array) - Array of KDE objects
  - `kde` (string) - KDE type (who, what, when, where, why, how)
  - `description` (string) - KDE description
  - `gs1Standard` (string) - GS1 standard that provides this KDE

---

## 5. Target Tables and Mappings

**Propose new tables in `drizzle/schema.ts`:**

### Raw Table

```ts
export const rawCtesKdes = mysqlTable("raw_ctes_kdes", {
  id: int("id").autoincrement().primaryKey(),
  cteId: varchar("cte_id", { length: 100 }).notNull(),
  rawJson: json("raw_json").$type<any>(), // Full CTE object with KDEs
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
```

### Canonical Tables

```ts
export const ctes = mysqlTable("ctes", {
  id: int("id").autoincrement().primaryKey(),
  cteId: varchar("cte_id", { length: 100 }).notNull().unique(), // e.g., "cte_raw_material_sourcing"
  cteName: varchar("cte_name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  cteIdIndex: index("idx_cte_id").on(table.cteId),
}));

export const kdes = mysqlTable("kdes", {
  id: int("id").autoincrement().primaryKey(),
  cteId: varchar("cte_id", { length: 100 }).notNull(), // FK to ctes.cteId
  kde: varchar("kde", { length: 50 }).notNull(), // who, what, when, where, why, how
  description: text("description"),
  gs1Standard: varchar("gs1_standard", { length: 100 }), // GLN, GTIN, SSCC, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  cteKdeIndex: index("idx_cte_kde").on(table.cteId, table.kde),
}));
```

---

## 6. Behaviour & Constraints

- Do not delete existing rows unless a task explicitly instructs you to.
- Use upsert logic:
  - CTEs keyed on `cteId`
  - KDEs keyed on `cteId + kde` combination
- On `dryRun: true`, perform all parsing and mapping but skip DB writes; log what would be inserted/updated.
- Handle missing or null fields gracefully.
- **Relationship handling:**
  - Insert CTE first, then insert all associated KDEs.
  - Use transactions to ensure consistency.
- Log summary: "Inserted X CTEs with Y KDEs total".

---

## 7. Testing Requirements

Implement `server/ingest/INGEST-04_ctes_kdes.test.ts` with Vitest:

- Use a small fixture sample (3-5 CTEs with their KDEs).
- Test happy path ingestion:
  - CTEs are inserted correctly.
  - KDEs are inserted with correct CTE relationships.
  - GS1 standard mappings are preserved.
- Test idempotency:
  - Calling `ingestCtesKdes` twice does not duplicate canonical rows.
  - Updates work correctly if source data changes.
- Test `dryRun: true`:
  - No DB writes occur; verify via row counts.
- Test basic error handling:
  - Malformed CTE objects are skipped with warning.
  - Missing required fields are caught.
- Test `limit` option:
  - Only specified number of CTEs are processed.

---

## 8. Acceptance Criteria

- Code compiles without TypeScript errors.
- All tests pass.
- The ingestion is idempotent and safe to re-run.
- All CTEs and KDEs from source file are ingested correctly.
- Relationships between CTEs and KDEs are preserved.
- The canonical tables can be queried for traceability planning features.
- Ingestion completes in <5 seconds for full dataset (~15-20 CTEs, ~100 KDEs).
- Clear logging shows summary (CTEs inserted/updated, KDEs inserted/updated).

---

## 9. Integration Notes

After implementation:
- Add table definitions to `drizzle/schema.ts`
- Run `pnpm db:generate` to create migration
- Run `pnpm db:push` to apply migration
- Add script to `package.json`: `"ingest:ctes": "tsx server/ingest/INGEST-04_ctes_kdes.ts"`
- Test with: `pnpm ingest:ctes --dry-run`
- Run full ingestion: `pnpm ingest:ctes`

---

## 10. Dependencies

- **Depends on:** None (standalone)
- **Enables:** Supply chain traceability planner, EUDR origin tracking, CSRD Scope 3 mapping

---

## 11. Usage Example

After ingestion, the data can be queried like this:

```ts
// Get all CTEs
const allCtes = await db.select().from(ctes);

// Get KDEs for a specific CTE
const sourcingKdes = await db
  .select()
  .from(kdes)
  .where(eq(kdes.cteId, 'cte_raw_material_sourcing'));

// Get all KDEs that use GLN
const glnKdes = await db
  .select()
  .from(kdes)
  .where(eq(kdes.gs1Standard, 'GLN'));
```

---

**End of INGEST-04 Specification**
