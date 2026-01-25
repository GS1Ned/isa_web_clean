# ISA Data Ingestion Master Prompt for ChatGPT

**Version:** 1.0  
**Date:** December 11, 2025  
**Purpose:** Guide ChatGPT to implement ISA data ingestion modules efficiently and correctly

---

## Overview

You are implementing data ingestion modules for the ISA (Intelligent Standards Architect) project. Each ingestion module reads structured data files (JSON, CSV, XLSX) and loads them into a MySQL/TiDB database using Drizzle ORM.

**Your role:**
- Read a specific INGEST-XX task specification
- Implement the ingestion module and tests
- Follow the patterns and conventions described in this prompt
- Deliver complete, tested, production-ready code

**Important constraints:**
- Keep token usage low: only load the relevant INGEST-XX spec and minimal project context
- Follow the ingestion architecture exactly as specified
- Write idempotent code (safe to re-run without duplicates)
- Include comprehensive tests (>85% coverage)

---

## Architecture Overview

### Directory Structure

```
/data/                          # Source data files (JSON, CSV, XLSX)
  gs1/gdm/                      # GDM files
  gs1/gdsn/                     # GDSN files
  efrag/                        # ESRS files
  esg/                          # ESG files (CTEs, DPP, etc.)
  cbv/                          # CBV vocabularies
  digital_link/                 # Digital Link types
  fixtures/                     # Test fixtures

/server/ingest/                 # Ingestion modules
  INGEST-01_gdm_attributes.ts
  INGEST-01_gdm_attributes.test.ts
  INGEST-02_gdsn_current.ts
  INGEST-02_gdsn_current.test.ts
  ...

/drizzle/schema.ts              # Database schema (Drizzle ORM)
/server/db.ts                   # Database helpers
```

### Table Naming Conventions

**Raw tables** (1:1 source records):
- Pattern: `raw_<source>_<entity>`
- Example: `raw_gdm_attributes`, `raw_gdsn_classes`
- Purpose: Store original data as-is for audit
- Columns: `id`, `sourceId`, `rawJson`, `createdAt`, `updatedAt`

**Canonical tables** (ISA domain model):
- Pattern: `<entity>` (no prefix)
- Example: `gs1Attributes`, `esrsDatapoints`, `ctes`
- Purpose: Clean, deduplicated, production-ready data
- Columns: Domain-specific fields with proper types

### Ingestion Module Pattern

Each module exports exactly one main function:

```ts
export interface IngestOptions {
  dryRun?: boolean;
  limit?: number;
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

export async function ingest<Something>(
  options?: IngestOptions
): Promise<IngestResult>;
```

### Idempotency Pattern

Use upsert semantics (insert or update) keyed on stable identifiers:

```ts
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

// Example: Upsert pattern
await db.insert(tableName)
  .values(record)
  .onDuplicateKeyUpdate({
    set: {
      name: sql`VALUES(name)`,
      updatedAt: sql`NOW()`,
    }
  });
```

**Key principles:**
- Use stable identifiers as primary keys or unique constraints
- Never delete existing rows unless explicitly required
- Update only when source data has changed
- Track `createdAt` and `updatedAt` timestamps

---

## Implementation Steps

### Step 1: Read the INGEST-XX Specification

Each task has a detailed specification under `tasks/for_chatgpt/INGEST-XX_<name>.md`. Read it carefully to understand:

1. **Context:** Why this dataset matters
2. **Source files:** Exact file paths and formats
3. **Target tables:** Raw and canonical table definitions
4. **Field mappings:** How source fields map to database columns
5. **Behaviour:** Idempotency, error handling, logging
6. **Testing requirements:** What to test and how
7. **Acceptance criteria:** What success looks like

### Step 2: Implement the Ingestion Module

Create `server/ingest/INGEST-XX_<name>.ts` with this structure:

```ts
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

export interface IngestOptions {
  dryRun?: boolean;
  limit?: number;
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

/**
 * Ingest <dataset name> from <source files>
 * 
 * @param options - Ingestion options
 * @returns Ingestion result with counts and errors
 */
export async function ingest<Something>(
  options: IngestOptions = {}
): Promise<IngestResult> {
  const startTime = Date.now();
  const { dryRun = false, limit } = options;
  
  console.log(`[INGEST-XX] Starting ingestion...`);
  if (dryRun) console.log(`[INGEST-XX] DRY RUN MODE - no DB writes`);
  if (limit) console.log(`[INGEST-XX] Limiting to ${limit} records`);

  const result: IngestResult = {
    success: true,
    recordsProcessed: 0,
    recordsInserted: 0,
    recordsUpdated: 0,
    recordsSkipped: 0,
    errors: [],
  };

  try {
    // 1. Get database connection
    const db = await getDb();
    if (!db) {
      throw new Error("Database unavailable");
    }

    // 2. Read source file(s)
    const filePath = path.join(process.cwd(), "/data/...");
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const records = JSON.parse(fileContent);

    // 3. Process records
    for (const record of records) {
      if (limit && result.recordsProcessed >= limit) break;

      try {
        // Validate required fields
        if (!record.requiredField) {
          console.warn(`[INGEST-XX] Skipping record with missing required field:`, record);
          result.recordsSkipped++;
          continue;
        }

        // Map source record to database record
        const dbRecord = {
          // ... field mappings
        };

        if (!dryRun) {
          // Insert or update (upsert)
          await db.insert(tableName)
            .values(dbRecord)
            .onDuplicateKeyUpdate({
              set: {
                // ... update fields
                updatedAt: sql`NOW()`,
              }
            });
          
          result.recordsInserted++; // or recordsUpdated based on logic
        }

        result.recordsProcessed++;

        // Log progress every 500 records
        if (result.recordsProcessed % 500 === 0) {
          console.log(`[INGEST-XX] Processed ${result.recordsProcessed} records...`);
        }

      } catch (error) {
        console.error(`[INGEST-XX] Error processing record:`, error);
        result.errors?.push(`Record ${result.recordsProcessed}: ${error.message}`);
        result.recordsSkipped++;
      }
    }

    // 4. Log summary
    const duration = Date.now() - startTime;
    result.duration = duration;
    
    console.log(`[INGEST-XX] Ingestion complete in ${duration}ms`);
    console.log(`[INGEST-XX] Processed: ${result.recordsProcessed}`);
    console.log(`[INGEST-XX] Inserted: ${result.recordsInserted}`);
    console.log(`[INGEST-XX] Updated: ${result.recordsUpdated}`);
    console.log(`[INGEST-XX] Skipped: ${result.recordsSkipped}`);
    if (result.errors && result.errors.length > 0) {
      console.error(`[INGEST-XX] Errors: ${result.errors.length}`);
    }

  } catch (error) {
    console.error(`[INGEST-XX] Fatal error:`, error);
    result.success = false;
    result.errors?.push(`Fatal: ${error.message}`);
  }

  return result;
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
  const dryRun = process.argv.includes('--dry-run');
  const limit = process.argv.includes('--limit') 
    ? parseInt(process.argv[process.argv.indexOf('--limit') + 1]) 
    : undefined;

  ingest<Something>({ dryRun, limit })
    .then(result => {
      console.log('Ingestion result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Ingestion failed:', error);
      process.exit(1);
    });
}
```

### Step 3: Implement Tests

Create `server/ingest/INGEST-XX_<name>.test.ts` with this structure:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ingest<Something> } from "./INGEST-XX_<name>";
import * as dbModule from "../db";
import * as fs from "fs";

// Mock database
const createMockDb = () => ({
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      onDuplicateKeyUpdate: vi.fn().mockResolvedValue({}),
    }),
  }),
  select: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([]),
    }),
  }),
});

describe("INGEST-XX: <Dataset Name>", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should ingest records from fixture", async () => {
    // Mock database
    const mockDb = createMockDb();
    vi.spyOn(dbModule, "getDb").mockResolvedValue(mockDb as any);

    // Mock file system (or use real fixture)
    vi.spyOn(fs, "readFileSync").mockReturnValue(
      JSON.stringify([
        { id: 1, name: "Test Record 1" },
        { id: 2, name: "Test Record 2" },
      ])
    );

    // Run ingestion
    const result = await ingest<Something>({ limit: 10 });

    // Assertions
    expect(result.success).toBe(true);
    expect(result.recordsProcessed).toBe(2);
    expect(result.recordsInserted).toBeGreaterThan(0);
    expect(result.errors).toHaveLength(0);
  });

  it("should be idempotent", async () => {
    const mockDb = createMockDb();
    vi.spyOn(dbModule, "getDb").mockResolvedValue(mockDb as any);

    vi.spyOn(fs, "readFileSync").mockReturnValue(
      JSON.stringify([{ id: 1, name: "Test Record" }])
    );

    // Run twice
    const result1 = await ingest<Something>({ limit: 10 });
    const result2 = await ingest<Something>({ limit: 10 });

    // Second run should not insert duplicates
    expect(result2.recordsInserted).toBe(0);
    expect(result2.recordsUpdated).toBeGreaterThanOrEqual(0);
  });

  it("should respect dryRun option", async () => {
    const mockDb = createMockDb();
    vi.spyOn(dbModule, "getDb").mockResolvedValue(mockDb as any);

    vi.spyOn(fs, "readFileSync").mockReturnValue(
      JSON.stringify([{ id: 1, name: "Test Record" }])
    );

    const result = await ingest<Something>({ dryRun: true, limit: 10 });

    // No writes should occur
    expect(result.recordsInserted).toBe(0);
    expect(result.recordsUpdated).toBe(0);
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it("should handle missing required fields", async () => {
    const mockDb = createMockDb();
    vi.spyOn(dbModule, "getDb").mockResolvedValue(mockDb as any);

    vi.spyOn(fs, "readFileSync").mockReturnValue(
      JSON.stringify([
        { id: 1, name: "Valid Record" },
        { id: 2 }, // Missing required field
      ])
    );

    const result = await ingest<Something>({ limit: 10 });

    // Should skip invalid record
    expect(result.recordsSkipped).toBe(1);
    expect(result.recordsProcessed).toBe(2);
  });

  it("should respect limit option", async () => {
    const mockDb = createMockDb();
    vi.spyOn(dbModule, "getDb").mockResolvedValue(mockDb as any);

    vi.spyOn(fs, "readFileSync").mockReturnValue(
      JSON.stringify([
        { id: 1, name: "Record 1" },
        { id: 2, name: "Record 2" },
        { id: 3, name: "Record 3" },
      ])
    );

    const result = await ingest<Something>({ limit: 2 });

    // Should only process 2 records
    expect(result.recordsProcessed).toBe(2);
  });
});
```

### Step 4: Define Database Tables

Propose table definitions for `drizzle/schema.ts`:

```ts
import { mysqlTable, int, varchar, text, timestamp, json, boolean, index } from "drizzle-orm/mysql-core";

// Raw table
export const rawTableName = mysqlTable("raw_table_name", {
  id: int("id").autoincrement().primaryKey(),
  sourceId: varchar("source_id", { length: 100 }),
  rawJson: json("raw_json").$type<any>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Canonical table
export const tableName = mysqlTable("table_name", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  // ... other fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  codeIndex: index("idx_code").on(table.code),
}));
```

---

## Best Practices

### Performance

- **Batch inserts:** For large datasets, batch inserts (100-1000 records at a time)
- **Indexes:** Ensure proper indexes on lookup columns
- **Transactions:** Use transactions for related inserts
- **Memory:** Stream large files instead of loading entirely

### Data Quality

- **Validation:** Validate required fields and data types
- **Normalization:** Trim whitespace, normalize case
- **Deduplication:** Check for duplicates before inserting
- **Referential integrity:** Ensure foreign keys exist

### Error Handling

- **Graceful degradation:** Skip invalid records, don't fail entire ingestion
- **Logging:** Log warnings for skipped records
- **Error collection:** Collect errors in result object
- **Recovery:** Allow partial success (some records succeed, some fail)

### Testing

- **Use fixtures:** Small test files in `/data/fixtures/`
- **Mock database:** Use Vitest mocks for database operations
- **Test all paths:** Happy path, idempotency, dry run, errors, limits
- **Coverage:** Aim for >85% test coverage

---

## Common Patterns

### Reading JSON Files

```ts
import * as fs from "fs";
import * as path from "path";

const filePath = path.join(process.cwd(), "/data/gs1/gdm/gdm_attributes.json");
const fileContent = fs.readFileSync(filePath, "utf-8");
const records = JSON.parse(fileContent);
```

### Reading Excel Files

```ts
import * as XLSX from "xlsx";

const workbook = XLSX.readFile("/data/efrag/file.xlsx");
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// Skip header row
for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  // Process row
}
```

### Upsert Pattern

```ts
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

// Check if record exists
const existing = await db
  .select()
  .from(tableName)
  .where(eq(tableName.code, record.code));

if (existing.length > 0) {
  // Update
  await db
    .update(tableName)
    .set({ ...record, updatedAt: sql`NOW()` })
    .where(eq(tableName.code, record.code));
  result.recordsUpdated++;
} else {
  // Insert
  await db.insert(tableName).values(record);
  result.recordsInserted++;
}
```

Or use `onDuplicateKeyUpdate`:

```ts
await db.insert(tableName)
  .values(record)
  .onDuplicateKeyUpdate({
    set: {
      name: sql`VALUES(name)`,
      description: sql`VALUES(description)`,
      updatedAt: sql`NOW()`,
    }
  });
```

---

## Delivery Format

When you complete an ingestion task, deliver:

1. **Ingestion module:** Complete `server/ingest/INGEST-XX_<name>.ts` file
2. **Test file:** Complete `server/ingest/INGEST-XX_<name>.test.ts` file
3. **Table definitions:** Proposed additions to `drizzle/schema.ts`
4. **Integration notes:** How to run the ingestion (CLI commands, package.json scripts)
5. **Summary:** Brief summary of what was implemented and any notes

**Format:**

```
INGEST-XX: <Dataset Name>

File 1: /server/ingest/INGEST-XX_<name>.ts
[Complete TypeScript code with JSDoc comments]

File 2: /server/ingest/INGEST-XX_<name>.test.ts
[Complete Vitest test file]

File 3: /drizzle/schema.ts (additions)
[Table definitions to add]

Integration Notes:
- Add script to package.json: "ingest:<name>": "tsx server/ingest/INGEST-XX_<name>.ts"
- Run migration: pnpm db:generate && pnpm db:push
- Test: pnpm ingest:<name> --dry-run --limit 100
- Run: pnpm ingest:<name>

Summary:
[Brief description of what was implemented, any decisions made, any notes for integration]
```

---

## Token Usage Guidelines

To keep token usage low:

1. **Only load the relevant INGEST-XX spec** - don't load all specs
2. **Don't load the entire project** - only load what you need (schema.ts, db.ts)
3. **Use fixtures for testing** - don't load full source files
4. **Focus on one task at a time** - don't try to implement multiple tasks
5. **Reuse patterns** - follow the patterns in this prompt, don't reinvent

---

## Questions?

If you encounter issues or need clarification:

1. **Check the INGEST-XX spec** - it has detailed requirements
2. **Check this master prompt** - it has patterns and examples
3. **Check the ingestion guide** - `/docs/INGESTION_GUIDE.md` has architecture details
4. **Ask the user** - if something is unclear, ask before implementing

---

## Ready to Start?

When you receive an INGEST-XX task:

1. Read the task specification carefully
2. Understand the source data format
3. Implement the ingestion module following patterns
4. Write comprehensive tests
5. Propose table definitions
6. Deliver complete, tested code

**Let's build robust, production-ready ingestion modules! 🚀**

---

**End of Master Prompt**
