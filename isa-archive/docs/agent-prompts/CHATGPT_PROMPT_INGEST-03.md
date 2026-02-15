# INGEST-03: ESRS Datapoints - Complete Implementation Prompt

**Copy this entire file and paste into ChatGPT 5.1**

---

# PART 1: YOUR ROLE AND INSTRUCTIONS

You are **ChatGPT 5.1**, a code generation specialist implementing data ingestion modules for ISA (Intelligent Standards Architect).

## What You Must Deliver

For INGEST-03, provide exactly these 5 deliverables:

1. **`server/ingest/INGEST-03_esrs_datapoints.ts`** - Main ingestion module
2. **`server/ingest/INGEST-03_esrs_datapoints.test.ts`** - Vitest tests (>85% coverage)
3. **Schema additions for `drizzle/schema.ts`** - Raw + canonical tables
4. **`server/ingest/INGEST-03_esrs_datapoints_README.md`** - Usage documentation
5. **Package.json script** - `"ingest:esrs": "tsx server/ingest/INGEST-03_esrs_datapoints.ts"`

## Critical Requirements

### ✅ DO:
- Follow ISA patterns exactly (see Part 2)
- Provide complete files (no truncation, no "...")
- Make it idempotent (safe to re-run)
- Support CLI options (dryRun, limit, verbose)
- Write comprehensive tests (>85% coverage)
- Use strict TypeScript (no `any`)
- Add clear progress logging
- Handle errors gracefully

### ❌ DON'T:
- Don't add separator characters (`---`, `===`, `***`) in code
- Don't truncate files
- Don't invent new patterns
- Don't skip tests
- Don't use `any` types
- Don't hardcode paths

## Delivery Format

```
I've implemented INGEST-03 (ESRS Datapoints). Here are the deliverables:

## File 1: server/ingest/INGEST-03_esrs_datapoints.ts

[complete TypeScript code]

## File 2: server/ingest/INGEST-03_esrs_datapoints.test.ts

[complete test code]

## File 3: Schema Additions for drizzle/schema.ts

[complete Drizzle table definitions]

## File 4: server/ingest/INGEST-03_esrs_datapoints_README.md

[complete README]

## File 5: package.json Script Addition

"ingest:esrs": "tsx server/ingest/INGEST-03_esrs_datapoints.ts"

## Summary

- **Tables created:** 1 raw + 1 canonical (adjusted)
- **Expected records:** ~1,184 datapoints
- **Test coverage:** >85%
- **Idempotent:** Yes
- **CLI options:** dryRun, limit, verbose

## Integration Notes

[Any special instructions]
```

---

# PART 2: ISA INGESTION PATTERNS

## Standard Interfaces

```typescript
export interface IngestOptions {
  dryRun?: boolean;    // If true, parse but don't write to DB
  limit?: number;      // Max records to process (for testing)
  verbose?: boolean;   // Extra logging
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

## Module Structure Template

```typescript
import { db } from '../db';
import { rawTableName, canonicalTableName } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

export interface IngestOptions { /* ... */ }
export interface IngestResult { /* ... */ }

export async function ingestSomething(options: IngestOptions = {}): Promise<IngestResult> {
  const startTime = Date.now();
  const { dryRun = false, limit, verbose = false } = options;
  
  const result: IngestResult = {
    success: true,
    recordsProcessed: 0,
    recordsInserted: 0,
    recordsUpdated: 0,
    recordsSkipped: 0,
    errors: []
  };
  
  try {
    // 1. Load source data
    const sourceData = loadData();
    
    // 2. Process each record
    for (const record of sourceData) {
      if (limit && result.recordsProcessed >= limit) break;
      
      result.recordsProcessed++;
      
      // 3. Transform to canonical format
      const canonical = transformRecord(record);
      
      // 4. Upsert (if not dry-run)
      if (!dryRun) {
        const existing = await db.select().from(canonicalTableName)
          .where(eq(canonicalTableName.uniqueKey, canonical.uniqueKey))
          .limit(1);
        
        if (existing.length > 0) {
          await db.update(canonicalTableName)
            .set(canonical)
            .where(eq(canonicalTableName.id, existing[0].id));
          result.recordsUpdated++;
        } else {
          await db.insert(canonicalTableName).values(canonical);
          result.recordsInserted++;
        }
      }
      
      if (verbose && result.recordsProcessed % 100 === 0) {
        print(`Processed ${result.recordsProcessed} records...`);
      }
    }
    
    result.duration = Date.now() - startTime;
    print(`✅ Ingestion complete: ${result.recordsInserted} inserted, ${result.recordsUpdated} updated, ${result.recordsSkipped} skipped in ${result.duration}ms`);
    
  } catch (error) {
    result.success = false;
    result.errors = [error instanceof Error ? error.message : String(error)];
    printError('❌ Ingestion failed:', error);
  }
  
  return result;
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options: IngestOptions = {
    dryRun: args.includes('--dry-run'),
    limit: args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : undefined,
    verbose: args.includes('--verbose')
  };
  
  ingestSomething(options).then(result => {
    process.exit(result.success ? 0 : 1);
  });
}
```

## Table Design Pattern

```typescript
// Raw table (1:1 with source)
export const rawEsrsDatapoints = mysqlTable("raw_esrs_datapoints", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 100 }).notNull(),
  sheetName: varchar("sheet_name", { length: 50 }),
  rawJson: json("raw_json").$type<any>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Canonical table (clean, typed, indexed)
export const esrsDatapoints = mysqlTable(
  "esrs_datapoints",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 100 }).notNull().unique(), // Primary key from source
    // ... domain fields
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    codeIndex: index("idx_esrs_code").on(table.code),
    // ... other indexes
  })
);
```

## Testing Pattern

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ingestSomething } from './INGEST-XX_something';
import { db } from '../db';
import { canonicalTableName } from '../../drizzle/schema';

describe('INGEST-XX: Something', () => {
  beforeEach(async () => {
    // Clean test data
    await db.delete(canonicalTableName);
  });
  
  it('should ingest records successfully', async () => {
    const result = await ingestSomething();
    expect(result.success).toBe(true);
    expect(result.recordsInserted).toBeGreaterThan(0);
  });
  
  it('should be idempotent', async () => {
    const result1 = await ingestSomething();
    const result2 = await ingestSomething();
    expect(result2.recordsInserted).toBe(0);
    expect(result2.recordsUpdated).toBe(result1.recordsInserted);
  });
  
  it('should respect dry-run mode', async () => {
    const result = await ingestSomething({ dryRun: true });
    expect(result.recordsProcessed).toBeGreaterThan(0);
    expect(result.recordsInserted).toBe(0);
    
    const count = await db.select().from(canonicalTableName);
    expect(count.length).toBe(0);
  });
  
  it('should respect limit option', async () => {
    const result = await ingestSomething({ limit: 10 });
    expect(result.recordsProcessed).toBe(10);
  });
});
```

---

# PART 3: INGEST-03 TASK SPECIFICATION

## Context

Ingest ESRS datapoints from EFRAG Implementation Guidance 3 (IG3) Excel file.

**Source:** `/data/efrag/EFRAGIG3ListofESRSDataPoints.xlsx` (249 KB, 13 sheets)  
**Records:** ~1,184 datapoints across ESRS 2, E1-E5, S1-S4, G1  
**Purpose:** Enable CSRD compliance gap analysis, ESRS-to-GS1 mapping

## Excel Structure

### Sheets to Process
- `ESRS 2` (General disclosures)
- `ESRS 2 MDR` (Minimum Disclosure Requirements)
- `ESRS E1` through `ESRS E5` (Environmental)
- `ESRS S1` through `ESRS S4` (Social)
- `ESRS G1` (Governance)

**Skip:** `Index` sheet (metadata only)

### Column Mapping

| Column | Field Name | Example | Notes |
|--------|-----------|---------|-------|
| A | ID | "BP-1_01" | Primary key |
| B | ESRS | "ESRS 2" | Standard name |
| C | DR | "BP-1" | Disclosure Requirement |
| D | Paragraph | "5 a" | Paragraph reference |
| E | Related AR | "AR 1" | Application Requirement (nullable) |
| F | Name | "Basis for preparation..." | Datapoint description |
| G | Data Type | "semi-narrative" | Type (normalize to camelCase) |
| H | Conditional or alternative DP | "Conditional" | Flag (nullable) |
| I | May [V] | "V" | Voluntary flag (nullable) |
| J | Appendix B - ESRS 2 | "SFDR..." | SFDR/Pillar 3 mapping (nullable) |

### Parsing Rules

1. **Skip row 1** (header row) in each sheet
2. **Start from row 2** (first data row)
3. **Stop at first empty ID** (column A is null/empty)
4. **Skip "Index" sheet** entirely
5. **Normalize data types:**
   - "semi-narrative" → "semiNarrative"
   - "quantitative" → "quantitative"
   - "narrative" → "narrative"
   - "qualitative" → "qualitative"
6. **Set conditional flag:**
   - If column H contains "Conditional" or "Alternative" → `true`
   - Otherwise → `false`
7. **Set voluntary flag:**
   - If column I is not empty → `true`
   - Otherwise → `false`

## Sample Data

### ESRS 2 (rows 2-4)
```
Row 2: ID=BP-1_01, ESRS=ESRS 2, DR=BP-1, Paragraph=5 a, Name=Basis for preparation of sustainability statement, DataType=semi-narrative
Row 3: ID=BP-1_02, ESRS=ESRS 2, DR=BP-1, Paragraph=5 b, Name=Scope of consolidation of consolidated sustainability statement, DataType=narrative
Row 4: ID=BP-1_03, ESRS=ESRS 2, DR=BP-1, Paragraph=5 c, Name=Indication of subsidiary undertakings included in sustainability statement, DataType=narrative
```

### ESRS E1 (rows 2-4)
```
Row 2: ID=E1.GOV-3_01, ESRS=E1, DR=E1.GOV-3, Paragraph=48 a, Name=Disclosure of whether and how climate-related considerations are factored into remuneration, DataType=narrative
Row 3: ID=E1.GOV-3_02, ESRS=E1, DR=E1.GOV-3, Paragraph=48 b, Name=Percentage of remuneration recognised that is linked to climate-related considerations, DataType=quantitative
Row 4: ID=E1.GOV-3_03, ESRS=E1, DR=E1.GOV-3, Paragraph=48 c, Name=Explanation of climate-related considerations that affect remuneration, DataType=narrative
```

## Existing Schema

**Current `esrsDatapoints` table** (may need adjustments):

```typescript
export const esrsDatapoints = mysqlTable(
  "esrs_datapoints",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 100 }).notNull().unique(),
    esrsStandard: varchar("esrs_standard", { length: 50 }),
    disclosureRequirement: varchar("disclosure_requirement", { length: 100 }),
    paragraph: varchar("paragraph", { length: 100 }),
    relatedAR: varchar("related_ar", { length: 100 }),
    name: text("name").notNull(),
    dataType: varchar("data_type", { length: 50 }),
    conditional: boolean("conditional").default(false),
    voluntary: boolean("voluntary").default(false),
    sfdrMapping: varchar("sfdr_mapping", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    codeIndex: index("idx_esrs_code").on(table.code),
    standardIndex: index("idx_esrs_standard").on(table.esrsStandard),
  })
);
```

**You need to add:** `rawEsrsDatapoints` table for raw staging.

## Implementation Requirements

### Module: `server/ingest/INGEST-03_esrs_datapoints.ts`

**Must include:**
- Import `xlsx` package for Excel parsing
- Import Drizzle ORM and schema
- `IngestOptions` and `IngestResult` interfaces
- `ingestEsrsDatapoints()` function
- Excel parsing logic:
  - Load workbook from `/data/efrag/EFRAGIG3ListofESRSDataPoints.xlsx`
  - Filter sheets (exclude "Index")
  - Parse each sheet starting from row 2
  - Stop at first empty ID
- Data transformation:
  - Normalize data types to camelCase
  - Set conditional flag based on column H
  - Set voluntary flag based on column I
  - Handle null/empty values
- Idempotent upsert:
  - Check existing by `code` field
  - Update if exists, insert if new
- Progress logging per sheet
- CLI support with argument parsing
- Error handling

### Tests: `server/ingest/INGEST-03_esrs_datapoints.test.ts`

**Must include:**
- Test: Happy path (ingest from multiple sheets)
- Test: Data type normalization
- Test: Conditional and voluntary flags
- Test: Idempotency (run twice, no duplicates)
- Test: Dry-run mode (no DB writes)
- Test: Limit option
- Test: Error handling (malformed data)
- Target: >85% coverage

### Schema: Additions for `drizzle/schema.ts`

**Must include:**
- `rawEsrsDatapoints` table definition
- Any adjustments to `esrsDatapoints` table
- Indexes for performance
- Comments explaining purpose

### README: `server/ingest/INGEST-03_esrs_datapoints_README.md`

**Must include:**
- Purpose and scope
- Data source information
- Usage examples:
  ```bash
  # Dry-run with limit
  pnpm ingest:esrs --dry-run --limit 100
  
  # Full ingestion
  pnpm ingest:esrs
  
  # Verbose logging
  pnpm ingest:esrs --verbose
  ```
- Expected output
- Troubleshooting tips

## Success Criteria

- ✅ TypeScript compiles without errors
- ✅ All tests pass with >85% coverage
- ✅ Idempotent (safe to re-run)
- ✅ ~1,184 datapoints ingested from 13 sheets
- ✅ Data types normalized correctly
- ✅ Conditional and voluntary flags set correctly
- ✅ Ingestion completes in <1 minute
- ✅ Clear progress logging per sheet
- ✅ CLI options work (--dry-run, --limit, --verbose)

---

# PART 4: TECHNICAL NOTES

## Excel Parsing with xlsx Package

```typescript
import * as XLSX from 'xlsx';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'data/efrag/EFRAGIG3ListofESRSDataPoints.xlsx');
const workbook = XLSX.readFile(filePath);

// Filter sheets (exclude Index)
const sheetNames = workbook.SheetNames.filter(name => name !== 'Index');

for (const sheetName of sheetNames) {
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  
  print(`Processing sheet: ${sheetName}`);
  
  // Skip header row (row 0), start from row 1 (data row 2 in Excel)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    
    // Stop at first empty ID
    if (!row[0]) break;
    
    const datapoint = {
      code: row[0],
      esrsStandard: row[1],
      disclosureRequirement: row[2],
      paragraph: row[3],
      relatedAR: row[4] || null,
      name: row[5],
      dataType: normalizeDataType(row[6]),
      conditional: isConditional(row[7]),
      voluntary: isVoluntary(row[8]),
      sfdrMapping: row[9] || null
    };
    
    // Upsert datapoint...
  }
}

function normalizeDataType(raw: string): string {
  if (!raw) return 'unknown';
  if (raw.includes('semi-narrative')) return 'semiNarrative';
  return raw.toLowerCase();
}

function isConditional(value: string): boolean {
  return value && (value.includes('Conditional') || value.includes('Alternative'));
}

function isVoluntary(value: string): boolean {
  return !!value && value.trim().length > 0;
}
```

## Performance Tips

- Process all sheets in one transaction
- Batch upserts (100 records at a time) if needed
- Log progress every 100 records
- Use indexes on `code` and `esrsStandard` for fast lookups

---

# READY TO IMPLEMENT?

If you have all the context you need, implement INGEST-03 following the patterns above.

If anything is unclear or missing, ask before starting.

**Expected deliverables:** 5 files (module, tests, schema, README, package.json script)

---

**End of Prompt**
