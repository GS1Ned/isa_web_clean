# Priority 2 Blocked: Technical Debt Blocker

**Date:** 2025-12-19  
**Priority:** Track B Priority 2 — Provenance and Citation Enhancement  
**Status:** BLOCKED (deferred per user decision)

---

## What Happened

### Approved Scope
Priority 2 authorized adding 3 provenance fields to `knowledge_embeddings` table:
- `datasetId` VARCHAR(128) — Dataset identifier from dataset_registry.json
- `datasetVersion` VARCHAR(64) — Dataset version (e.g., "v3.1.33", "2025-12-15")
- `sourcePublicationDate` TIMESTAMP — Publication/release date of source dataset

### Actions Taken
1. Added 3 fields to `drizzle/schema.ts` (lines 1583-1586)
2. Ran `pnpm db:push` to apply migration
3. Drizzle detected unrelated schema mismatch in `esrs_datapoints` table
4. Interactive prompt blocked migration progress

### Blocker Encountered
**Pre-existing schema mismatch in `esrs_datapoints` table:**

**Schema file (`drizzle/schema.ts`) uses snake_case:**
- `code`
- `esrs_standard`
- `disclosure_requirement`
- `related_ar`
- `data_type`
- `conditional_or_alternative`
- `sfdr_pillar_3`

**Database table uses camelCase:**
- `datapointId`
- `esrsStandard`
- `disclosureRequirement`
- `relatedAr`
- `dataType`
- `conditionalOrAlternative`
- `sfdrPillar3`

**Drizzle migration tool cannot proceed** without resolving this mismatch (asks whether to create new columns or rename existing ones).

---

## Decision Made

**User authorized Option B: DEFER**

**Rationale:**
- Same unrelated technical debt encountered during Priority 1
- Not explicitly included in approved Priority 2 scope
- Strict scope discipline takes priority over progress
- Priority 2 does not justify expanding scope to unblock migrations

**Actions NOT taken:**
- Did NOT rename or create columns in `esrs_datapoints`
- Did NOT apply Priority 2 schema migration
- Did NOT fix or modify unrelated technical debt

**Actions completed:**
- Reverted Priority 2 schema changes (removed 3 provenance fields from schema.ts)
- Documented blocker in this file
- Paused execution

---

## Impact

### Priority 2 Deliverables Blocked
All Priority 2 deliverables cannot be implemented without schema migration:

1. **"Last Updated" / "Last Verified" metadata** — BLOCKED
   - Cannot add provenance fields to `knowledge_embeddings` table
   - Cannot populate fields from authoritative metadata
   - Cannot display in citations

2. **Citation format enhancement** — BLOCKED
   - Cannot display dataset name, version, publication date
   - Cannot link citations to dataset_registry.json
   - Cannot show provenance in Ask ISA responses

3. **Citation validation** — BLOCKED
   - Cannot flag deprecated datasets (no dataset linkage)
   - Cannot flag missing version metadata (no version field)
   - Cannot flag missing publication dates (no date field)

### What Still Works
- All Priority 1 deliverables (Data Quality Foundation) remain functional
- Existing citation system continues to work (without provenance metadata)
- No regressions introduced

---

## Root Cause

### Historical Context
The `esrs_datapoints` schema mismatch was introduced in earlier ISA development phases:

1. **Original ingestion (Phase 65):** Used camelCase field names in database
2. **Schema refactoring (Phase 73):** Changed schema.ts to snake_case for consistency
3. **Code updates:** Updated 59 references across 10 files to use snake_case
4. **Migration gap:** Database columns were never renamed to match schema

**Result:** Schema file and database table are out of sync.

### Why This Blocks Migrations
Drizzle ORM compares schema.ts against database state to generate migrations. When it detects field name mismatches, it cannot determine whether to:
- Create new columns (schema.ts names don't exist in database)
- Rename existing columns (database names don't exist in schema.ts)

**Interactive prompt blocks automated migrations** until user manually selects rename/create for each field.

---

## Resolution Path

### Required Fix (Separate Task)
A dedicated schema alignment task must:

1. **Rename database columns** in `esrs_datapoints` table:
   - `datapointId` → `code`
   - `esrsStandard` → `esrs_standard`
   - `disclosureRequirement` → `disclosure_requirement`
   - `relatedAr` → `related_ar`
   - `dataType` → `data_type`
   - `conditionalOrAlternative` → `conditional_or_alternative`
   - `sfdrPillar3` → `sfdr_pillar_3`

2. **Verify data integrity** after column renames

3. **Test all ESRS-related queries** to ensure no regressions

4. **Run `pnpm db:push`** to confirm schema alignment

### After Schema Alignment
Once blocker resolved, Priority 2 can proceed:

1. Re-add 3 provenance fields to `knowledge_embeddings` schema
2. Run `pnpm db:push` (should succeed without interactive prompts)
3. Backfill existing records with provenance metadata
4. Implement citation format enhancement
5. Implement citation validation flagging
6. Create tests and documentation

---

## Boundary Compliance

### ✅ Correct Behavior Demonstrated
- Paused immediately when unrelated technical debt blocked approved work
- Did not infer, workaround, or apply partial fix
- Did not expand scope to unblock migrations
- Asked for explicit authorization before proceeding
- Documented blocker clearly for future resolution

### ✅ Scope Discipline Maintained
- No fixing of unrelated technical debt
- No opportunistic cleanup
- No schema changes beyond approved scope
- No reasoning or interpretation

### ✅ Precedent Consistency
- Same blocker encountered in Priority 1 (deferred per user instruction)
- Same decision applied in Priority 2 (defer, do not fix)
- Consistent governance across both priorities

---

## Next Steps (Not Authorized)

**These actions require explicit user approval:**

1. Create dedicated task: "Fix esrs_datapoints schema mismatch"
2. Approve schema alignment as separate work item
3. Execute schema alignment task
4. Verify schema alignment success
5. Resume Priority 2 execution

**Current status:** Priority 2 paused, awaiting schema alignment task approval.

---

**End of Priority 2 Blocker Documentation**
