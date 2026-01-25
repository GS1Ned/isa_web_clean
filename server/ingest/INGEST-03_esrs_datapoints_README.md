# INGEST-03: ESRS Datapoints Ingestion

This module ingests ESRS datapoints from the EFRAG Implementation Guidance 3 (IG3) Excel file into ISA’s database. It populates both a raw staging table and a canonical ESRS datapoints table, enabling CSRD compliance gap analysis and ESRS-to-GS1 mappings.

## Source Data

- File path: `data/efrag/EFRAGIG3ListofESRSDataPoints.xlsx`
- Origin: EFRAG ESRS Implementation Guidance 3
- Content:
  - Approximately 1,184 datapoints
  - Covering ESRS 2, E1–E5, S1–S4, G1
  - Organized across multiple sheets

### Sheets Processed

The ingestion processes all sheets except `Index`:

- `ESRS 2`
- `ESRS 2 MDR`
- `ESRS E1`
- `ESRS E2`
- `ESRS E3`
- `ESRS E4`
- `ESRS E5`
- `ESRS S1`
- `ESRS S2`
- `ESRS S3`
- `ESRS S4`
- `ESRS G1`

The `Index` sheet is skipped because it contains only metadata.

## Column Mapping

Each sheet is expected to have the following columns:

1. Column A: ID → `code`
2. Column B: ESRS → `esrsStandard`
3. Column C: DR → `disclosureRequirement`
4. Column D: Paragraph → `paragraph`
5. Column E: Related AR → `relatedAr`
6. Column F: Name → `name`
7. Column G: Data Type → `dataType`
8. Column H: Conditional or alternative DP → `conditional`
9. Column I: May [V] → `voluntary`
10. Column J: Appendix B - ESRS 2 → `sfdrMapping`

The ingestion logic:

- Skips the header row
- Stops when it encounters the first row where ID (column A) is empty
- Trims whitespace and converts empty strings to `null` where appropriate

## Normalization Rules

### Data Type

Raw values from the Excel column “Data Type” are normalized into a canonical set:

- `"semi-narrative"` or similar → `"semiNarrative"`
- `"quantitative"` → `"quantitative"`
- `"narrative"` → `"narrative"`
- `"qualitative"` → `"qualitative"`
- Missing or unknown values → `"unknown"`

The logic is implemented in `normalizeEsrsDataType(raw)` and is exported for reuse and testing.

### Conditional Flag

The `conditional` flag is derived from column H:

- Contains `"Conditional"` → `true`
- Contains `"Alternative"` → `true`
- Otherwise or empty → `false`

The logic is implemented in `parseConditionalFlag(raw)`.

### Voluntary Flag

The `voluntary` flag is derived from column I:

- Non-empty, non-whitespace value → `true`
- Empty or missing → `false`

The logic is implemented in `parseVoluntaryFlag(raw)`.

## Database Tables

### Raw Table: `raw_esrs_datapoints`

Stores a near 1:1 representation of each Excel row plus context information:

- `id` (primary key)
- `code`
- `esrsStandard`
- `disclosureRequirement`
- `paragraph`
- `relatedAr`
- `name`
- `dataTypeRaw`
- `conditionalRaw`
- `voluntaryRaw`
- `sfdrMapping`
- `sheetName`
- `rowIndex`
- `rawJson` (JSON snapshot of the row)
- `createdAt`
- `updatedAt`

Indexes:

- `idx_raw_esrs_code` on `code`
- `idx_raw_esrs_sheet` on `sheetName`

### Canonical Table: `esrs_datapoints`

Stores the cleaned, normalized ESRS datapoint fields:

- `id` (primary key)
- `code` (unique)
- `esrsStandard`
- `disclosureRequirement`
- `paragraph`
- `relatedAr`
- `name`
- `dataType`
- `conditional`
- `voluntary`
- `sfdrMapping`
- `createdAt`
- `updatedAt`

Indexes:

- `idx_esrs_code` on `code`
- `idx_esrs_standard` on `esrsStandard`

## Ingestion Function

The main entry point is:

```ts
import { ingestEsrsDatapoints } from "./INGEST-03_esrs_datapoints";

const result = await ingestEsrsDatapoints({
  dryRun: false,
  limit: undefined,
  verbose: true
});

Options

The IngestOptions interface:
	•	dryRun?: boolean
If true, the module parses all data but does not write to the database. Counters are still updated.
	•	limit?: number
If set, ingestion stops after processing this many datapoints.
	•	verbose?: boolean
If true, logs progress messages such as sheet names and record counts.

Result

The IngestResult interface:
	•	success: boolean
	•	recordsProcessed: number
	•	recordsInserted: number
	•	recordsUpdated: number
	•	recordsSkipped: number
	•	duration?: number (milliseconds)
	•	errors?: string[]

CLI Usage

A CLI entry point is included so you can run ingestion via pnpm or npm scripts.

Add this script to package.json:

"ingest:esrs": "tsx server/ingest/INGEST-03_esrs_datapoints.ts"

Then use:

# Dry-run with a limit of 100 rows
pnpm ingest:esrs --dry-run --limit 100

# Full ingestion with standard logging
pnpm ingest:esrs

# Full ingestion with verbose logging
pnpm ingest:esrs --verbose

# Limited ingestion with verbose logging
pnpm ingest:esrs --limit 200 --verbose

Supported CLI flags:
	•	--dry-run – parse only, no writes
	•	--limit <number> – maximum number of records to process
	•	--verbose – extra logging

Idempotency

The ingestion is designed to be idempotent:
	•	If a datapoint with the same code already exists in the canonical table, it is updated instead of inserted.
	•	Raw rows are also upserted by code, so each code has a single raw record that is updated on re-ingestion.
	•	Running the ingestion multiple times should not create duplicates.

In tests:
	•	First run inserts all records.
	•	Second run inserts zero records and updates all previously inserted records.

Troubleshooting

File Not Found

If you see an error such as:
	•	ESRS datapoints Excel file not found at path: ...

Check that:
	•	The file exists at data/efrag/EFRAGIG3ListofESRSDataPoints.xlsx relative to the project root.
	•	The process working directory is the project root when running the script.

No Records Ingested

If ingestion completes with zero recordsProcessed:
	•	Ensure that the sheets follow the expected structure.
	•	Confirm that the first column (ID) is populated and that there are data rows below the header.

Tests Failing

If Vitest tests fail:
	•	Confirm that the schema additions for raw_esrs_datapoints and esrs_datapoints are in drizzle/schema.ts.
	•	Ensure database migrations are applied or that the test database schema matches drizzle/schema.ts.

Extensibility

The helper functions:
	•	normalizeEsrsDataType
	•	parseConditionalFlag
	•	parseVoluntaryFlag

are exported from the ingestion module and can be reused for:
	•	ESRS-related APIs
	•	Validation functions
	•	Analytics and reporting on ESRS datapoints

## File 5: package.json Script Addition

```json
"ingest:esrs": "tsx server/ingest/INGEST-03_esrs_datapoints.ts"

Summary
	•	Tables created: 1 raw (raw_esrs_datapoints) + 1 canonical (esrs_datapoints reused/confirmed)
	•	Expected records: Approximately 1,184 datapoints when run against the real IG3 Excel file
	•	Test coverage: Designed for >85% via unit tests for helpers and integration-style tests for ingestion
	•	Idempotent: Yes (upserts by code for both raw and canonical tables)
	•	CLI options: dryRun, limit, verbose

Integration Notes
	1.	Add the rawEsrsDatapoints and esrsDatapoints definitions from File 3 into drizzle/schema.ts (or adjust your existing esrsDatapoints definition to match and add rawEsrsDatapoints alongside it). Ensure imports for mysqlTable, int, varchar, text, boolean, timestamp, json, and index are present.
	2.	Ensure the ESRS Excel file is available at:
	•	data/efrag/EFRAGIG3ListofESRSDataPoints.xlsx relative to the project root.
	3.	Add the script from File 5 into your package.json and run:
	•	pnpm ingest:esrs --dry-run --limit 50 for a quick smoke test.
	•	pnpm ingest:esrs for full ingestion.
	4.	Run the tests:
	•	pnpm vitest server/ingest/INGEST-03_esrs_datapoints.test.ts
