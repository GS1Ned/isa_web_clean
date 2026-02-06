# INGEST-03: ESRS Datapoints from EFRAG Taxonomy

## 1. Context

We have EFRAG Implementation Guidance 3 (IG3) List of ESRS Data Points available to ISA. This Excel file contains ~1,184 datapoints across all ESRS standards (ESRS 2, E1-E5, S1-S4, G1) required for CSRD compliance and sustainability reporting.

Source file **must** be placed under `/data/efrag/` in the project root:

- `/data/efrag/EFRAGIG3ListofESRSDataPoints.xlsx` (249 KB, multiple sheets)

**Note:** The file name in the data sources package is `EFRAGIG3ListofESRSDataPoints(1)(1).xlsx` but should be renamed to `EFRAGIG3ListofESRSDataPoints.xlsx` when placed in `/data/efrag/`.

This ingestion builds ISA's ESRS datapoint catalog used for CSRD compliance gap analysis, ESRS-to-GS1 mapping, and sustainability reporting features.

---

## 2. Exact Task

Implement a TypeScript ingestion module that:

1. Reads the XLSX file from `/data/efrag/EFRAGIG3ListofESRSDataPoints.xlsx`.
2. Parses all ESRS sheets (ESRS 2, ESRS E1-E5, ESRS S1-S4, ESRS G1).
3. Loads the records into ISA's database via Drizzle ORM.
4. Populates both raw and canonical tables:

   - Raw staging table preserving 1:1 source records (`raw_esrs_datapoints`).
   - Canonical entity `esrsDatapoints` (already exists in schema, may need extension).

5. Is idempotent (safe to re-run without duplicating canonical records).
6. Exposes the following interface:

```ts
export interface IngestOptions {
  dryRun?: boolean;
  limit?: number;
}

export async function ingestEsrsDatapoints(
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

- `server/ingest/INGEST-03_esrs_datapoints.ts`
- `server/ingest/INGEST-03_esrs_datapoints.test.ts`
- Optional: small fixture file under `/data/fixtures/INGEST-03_esrs_datapoints_sample.xlsx` with first 20 rows from each sheet.

---

## 4. Source Format

### Excel Structure

The XLSX file has multiple sheets, one per ESRS standard:

**Sheet names:**
- `Index` (skip - just metadata)
- `ESRS 2` (General disclosures)
- `ESRS 2 MDR` (Minimum Disclosure Requirements)
- `ESRS E1` (Climate change)
- `ESRS E2` (Pollution)
- `ESRS E3` (Water and marine resources)
- `ESRS E4` (Biodiversity and ecosystems)
- `ESRS E5` (Resource use and circular economy)
- `ESRS S1` (Own workforce)
- `ESRS S2` (Workers in value chain)
- `ESRS S3` (Affected communities)
- `ESRS S4` (Consumers and end-users)
- `ESRS G1` (Business conduct)

### Row Structure (starting from row 2, row 1 is header)

**Columns:**
- Column A: `ID` (e.g., "BP-1_01", "E1-1_01") - **Primary key**
- Column B: `ESRS` (e.g., "ESRS 2", "ESRS E1")
- Column C: `DR` (Disclosure Requirement, e.g., "BP-1", "E1-1")
- Column D: `Paragraph` (e.g., "5 a", "17 a i")
- Column E: `Related AR` (Application Requirement, may be null)
- Column F: `Name` (Datapoint name/description)
- Column G: `Data Type` (e.g., "narrative", "semi-narrative", "quantitative", "qualitative")
- Column H: `Conditional or alternative DP` (e.g., "Conditional", "Alternative", null)
- Column I: `May [V]` (Voluntary indicator, may be null)
- Column J: `Appendix B - ESRS 2` (SFDR/Pillar 3 mapping, may be null)

**Example row:**
```
ID: BP-1_01
ESRS: ESRS 2
DR: BP-1
Paragraph: 5 a
Related AR: (null)
Name: Basis for preparation of sustainability statement
Data Type: semi-narrative
Conditional or alternative DP: (null)
May [V]: (null)
Appendix B: (null)
```

### Parsing Rules

- **Skip row 1** (header row) in each sheet.
- **Skip row 0** if it contains instructions (check if first column is "INSTRUCTIONS").
- **Parse from row 2** onwards until empty ID column.
- **Skip "Index" sheet** entirely.
- **Normalize data types:** Convert "semi-narrative" → "semiNarrative", "quantitative" → "quantitative", etc.
- **Handle nulls:** Empty cells should be stored as `null` in database.

---

## 5. Target Tables and Mappings

### Existing Table (in schema.ts)

```ts
export const esrsDatapoints = mysqlTable(
  "esrs_datapoints",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 100 }).notNull().unique(), // e.g., "BP-1_01"
    esrsStandard: varchar("esrs_standard", { length: 50 }), // e.g., "ESRS 2"
    disclosureRequirement: varchar("disclosure_requirement", { length: 100 }), // e.g., "BP-1"
    paragraph: varchar("paragraph", { length: 100 }), // e.g., "5 a"
    relatedAR: varchar("related_ar", { length: 100 }), // Application Requirement
    name: text("name").notNull(), // Datapoint name
    dataType: varchar("data_type", { length: 50 }), // narrative, quantitative, etc.
    conditional: boolean("conditional").default(false), // Derived from column H
    voluntary: boolean("voluntary").default(false), // Derived from column I
    sfdrMapping: varchar("sfdr_mapping", { length: 255 }), // Column J
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    codeIndex: index("idx_esrs_code").on(table.code),
    standardIndex: index("idx_esrs_standard").on(table.esrsStandard),
  })
);
```

**Note:** The existing table may need adjustments. If the schema differs, propose necessary changes.

### Raw Table (to be added)

```ts
export const rawEsrsDatapoints = mysqlTable("raw_esrs_datapoints", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 100 }).notNull(),
  sheetName: varchar("sheet_name", { length: 50 }), // Which ESRS sheet
  rawJson: json("raw_json").$type<any>(), // Full row data
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
```

---

## 6. Behaviour & Constraints

- Do not delete existing rows unless a task explicitly instructs you to.
- Use upsert logic keyed on `code` (datapoint ID like "BP-1_01").
- On `dryRun: true`, perform all parsing and mapping but skip DB writes; log what would be inserted/updated.
- Handle missing or null fields gracefully (use defaults or `null`).
- Log progress for each sheet processed (e.g., "Processed ESRS 2: 150 datapoints").
- Skip empty rows (where ID column is null or empty).
- **Data type normalization:**
  - "narrative" → "narrative"
  - "semi-narrative" → "semiNarrative"
  - "quantitative" → "quantitative"
  - "qualitative" → "qualitative"
  - Other values → store as-is
- **Conditional flag:**
  - If column H contains "Conditional" or "Alternative" → `conditional = true`
  - Otherwise → `conditional = false`
- **Voluntary flag:**
  - If column I is not empty → `voluntary = true`
  - Otherwise → `voluntary = false`

---

## 7. Testing Requirements

Implement `server/ingest/INGEST-03_esrs_datapoints.test.ts` with Vitest:

- Use a small fixture sample (first 20 rows from 2-3 sheets).
- Test happy path ingestion:
  - Datapoints from multiple sheets are inserted correctly.
  - Data types are normalized.
  - Conditional and voluntary flags are set correctly.
- Test idempotency:
  - Calling `ingestEsrsDatapoints` twice does not duplicate canonical rows.
- Test `dryRun: true`:
  - No DB writes occur; verify via row counts.
- Test basic error handling:
  - Malformed rows are skipped with warning.
  - Empty sheets are handled gracefully.
- Test `limit` option:
  - Only specified number of records are processed across all sheets.

---

## 8. Acceptance Criteria

- Code compiles without TypeScript errors.
- All tests pass.
- The ingestion is idempotent and safe to re-run.
- All ~1,184 ESRS datapoints are ingested from 13 sheets.
- The canonical `esrsDatapoints` table is populated and can be reused by other ISA modules (e.g., CSRD gap analysis, ESRS-to-GS1 mapping).
- Ingestion completes in <1 minute for full dataset.
- Clear logging shows progress per sheet and summary (records inserted/updated/skipped).

---

## 9. Integration Notes

After implementation:
- Add `rawEsrsDatapoints` table to `drizzle/schema.ts` if needed
- Verify `esrsDatapoints` table matches specification (adjust if needed)
- Run `pnpm db:generate` to create migration
- Run `pnpm db:push` to apply migration
- Add script to `package.json`: `"ingest:esrs": "tsx server/ingest/INGEST-03_esrs_datapoints.ts"`
- Test with: `pnpm ingest:esrs --dry-run --limit 50`
- Run full ingestion: `pnpm ingest:esrs`

---

## 10. Dependencies

- **Depends on:** None (standalone)
- **Enables:** CSRD compliance gap analysis, ESRS-to-GS1 attribute mapping, sustainability reporting features

---

## 11. Technical Notes

### Excel Parsing

Use `xlsx` or `exceljs` npm package:

```ts
import * as XLSX from 'xlsx';

const workbook = XLSX.readFile('/data/efrag/EFRAGIG3ListofESRSDataPoints.xlsx');
const sheetNames = workbook.SheetNames.filter(name => name !== 'Index');

for (const sheetName of sheetNames) {
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Skip header rows and process data rows
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0]) break; // Stop at first empty ID
    
    const datapoint = {
      code: row[0],
      esrsStandard: row[1],
      disclosureRequirement: row[2],
      // ... map other columns
    };
    
    // Insert or update datapoint
  }
}
```

### Performance Optimization

- Batch inserts (100 records at a time) for better performance.
- Use transactions to ensure consistency across sheets.
- Log progress every 100 records.

---

**End of INGEST-03 Specification**
