# INGEST-03 Context Package for ChatGPT

**Copy this entire file and paste into ChatGPT 5.1 to delegate INGEST-03 implementation.**

---

## Part 1: ChatGPT Instructions

Read `/tasks/for_chatgpt/_CHATGPT_INSTRUCTIONS.md` first (included below).

[Full content of _CHATGPT_INSTRUCTIONS.md would be here - see that file]

**Key points:**
- Deliver 4-5 complete files (no truncation)
- Follow ISA patterns from Master Prompt
- Target >85% test coverage
- Make it idempotent
- Support CLI options (dryRun, limit, verbose)
- Ask if context is incomplete

---

## Part 2: Master Prompt

Read `/tasks/INGESTION_MASTER_PROMPT_FOR_CHATGPT.md` (included below).

[Full content of INGESTION_MASTER_PROMPT_FOR_CHATGPT.md would be here - see that file]

**Key patterns:**
- IngestOptions interface (dryRun, limit, verbose)
- IngestResult interface (inserted, updated, errors, duration)
- Idempotent upsert logic
- CLI execution block
- Comprehensive error handling
- Progress logging

---

## Part 3: Task Specification

Read `/tasks/for_chatgpt/INGEST-03_esrs_datapoints.md` (full spec included below).

### Quick Summary

**Task:** Ingest ESRS datapoints from EFRAG Excel file into ISA database

**Source:** `/data/efrag/EFRAGIG3ListofESRSDataPoints.xlsx` (249 KB, 13 sheets)

**Target Tables:**
- `raw_esrs_datapoints` (raw staging)
- `esrs_datapoints` (canonical, already exists in schema)

**Expected Records:** ~1,184 datapoints across 13 ESRS sheets

**Complexity:** MEDIUM (Excel parsing, multiple sheets, data normalization)

**Dependencies:** None (standalone task)

**Enables:** CSRD compliance gap analysis, ESRS-to-GS1 mapping

### Full Specification

[Full content of INGEST-03_esrs_datapoints.md included here]

---

## Part 4: Sample Data

**First 5 rows from 3 ESRS sheets:**

### ESRS 2 (General Disclosures)
```
Row 2: ID=BP-1_01, ESRS=ESRS 2, DR=BP-1, Paragraph=5 a, Name=Basis for preparation of sustainability statement, DataType=semi-narrative
Row 3: ID=BP-1_02, ESRS=ESRS 2, DR=BP-1, Paragraph=5 b, Name=Scope of consolidation of consolidated sustainability statement, DataType=narrative
Row 4: ID=BP-1_03, ESRS=ESRS 2, DR=BP-1, Paragraph=5 c, Name=Indication of subsidiary undertakings included in sustainability statement, DataType=narrative
Row 5: ID=BP-1_04, ESRS=ESRS 2, DR=BP-1, Paragraph=5 d, Name=Disclosure of extent to which sustainability statement covers upstream and downstream value chain, DataType=narrative
```

### ESRS 2 MDR (Minimum Disclosure Requirements)
```
Row 2: ID=MDR-P_01, ESRS=ESRS 2, DR=MDR-P, Paragraph=a, Name=Description of key contents of policy, DataType=narrative
Row 3: ID=MDR-P_02, ESRS=ESRS 2, DR=MDR-P, Paragraph=b, Name=Description of scope of policy or of its exclusions, DataType=narrative
Row 4: ID=MDR-P_03, ESRS=ESRS 2, DR=MDR-P, Paragraph=c, Name=Description of most senior level in organisation that is accountable for implementation of policy, DataType=narrative
```

### ESRS E1 (Climate Change)
```
Row 2: ID=E1.GOV-3_01, ESRS=E1, DR=E1.GOV-3, Paragraph=48 a, Name=Disclosure of whether and how climate-related considerations are factored into remuneration, DataType=narrative
Row 3: ID=E1.GOV-3_02, ESRS=E1, DR=E1.GOV-3, Paragraph=48 b, Name=Percentage of remuneration recognised that is linked to climate-related considerations, DataType=quantitative
Row 4: ID=E1.GOV-3_03, ESRS=E1, DR=E1.GOV-3, Paragraph=48 c, Name=Explanation of climate-related considerations that affect remuneration, DataType=narrative
```

**Column Structure:**
- Column A: ID (primary key, e.g., "BP-1_01")
- Column B: ESRS (e.g., "ESRS 2", "E1")
- Column C: DR (Disclosure Requirement, e.g., "BP-1")
- Column D: Paragraph (e.g., "5 a", "48 b")
- Column E: Related AR (Application Requirement, may be null)
- Column F: Name (Datapoint description)
- Column G: Data Type (narrative, semi-narrative, quantitative, qualitative)
- Column H: Conditional or alternative DP (may be null)
- Column I: May [V] (Voluntary indicator, may be null)
- Column J: Appendix B - ESRS 2 (SFDR/Pillar 3 mapping, may be null)

---

## Part 5: Existing Schema Context

**Current `esrsDatapoints` table in `drizzle/schema.ts`:**

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

**You need to add `rawEsrsDatapoints` table** for raw staging.

---

## Part 6: What to Deliver

### File 1: `server/ingest/INGEST-03_esrs_datapoints.ts`

**Must include:**
- Import statements (xlsx, drizzle, schema)
- IngestOptions interface (dryRun, limit, verbose)
- IngestResult interface (success, recordsProcessed, inserted, updated, skipped, errors, duration)
- `ingestEsrsDatapoints()` function
- Excel parsing logic (skip Index sheet, parse 13 ESRS sheets)
- Data normalization (data types, conditional/voluntary flags)
- Idempotent upsert logic (keyed on `code`)
- Progress logging per sheet
- CLI execution block with argument parsing
- Error handling and validation

### File 2: `server/ingest/INGEST-03_esrs_datapoints.test.ts`

**Must include:**
- Test setup (mock data or small fixture)
- Test: Happy path ingestion (multiple sheets)
- Test: Data type normalization
- Test: Conditional and voluntary flags
- Test: Idempotency (run twice, same result)
- Test: Dry-run mode (no DB writes)
- Test: Limit option
- Test: Error handling (malformed rows)
- Target: >85% coverage

### File 3: Schema Additions for `drizzle/schema.ts`

**Must include:**
- `rawEsrsDatapoints` table definition
- Any adjustments to `esrsDatapoints` table (if needed)
- Indexes for performance
- Comments explaining purpose

### File 4: `server/ingest/INGEST-03_esrs_datapoints_README.md`

**Must include:**
- Purpose and scope
- Data source information
- Usage examples (CLI commands)
- Expected output
- Troubleshooting tips

### File 5: Package.json Script Addition

```json
"ingest:esrs": "tsx server/ingest/INGEST-03_esrs_datapoints.ts"
```

---

## Part 7: Success Criteria

- ✅ All TypeScript compiles without errors
- ✅ All tests pass with >85% coverage
- ✅ Idempotent (safe to re-run)
- ✅ ~1,184 datapoints ingested from 13 sheets
- ✅ Data types normalized correctly
- ✅ Conditional and voluntary flags set correctly
- ✅ Ingestion completes in <1 minute
- ✅ Clear progress logging per sheet
- ✅ CLI options work (--dry-run, --limit, --verbose)

---

## Part 8: Integration Notes for Manus

After ChatGPT delivers:
1. Extract files from ChatGPT response
2. Apply schema changes: `pnpm db:generate && pnpm db:push`
3. Add script to package.json
4. Run tests: `pnpm test server/ingest/INGEST-03_esrs_datapoints.test.ts`
5. Run dry-run: `pnpm ingest:esrs --dry-run --limit 100`
6. Run full ingestion: `pnpm ingest:esrs`
7. Verify record counts in database
8. Test idempotency (run again, check no duplicates)
9. Report results

---

## Ready to Implement?

If you have all the context you need, implement INGEST-03 following the patterns and specifications above.

If anything is unclear or missing, ask before starting implementation.

---

**End of Context Package**
