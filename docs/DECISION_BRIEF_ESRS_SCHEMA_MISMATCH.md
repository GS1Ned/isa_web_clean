# Decision Brief: esrs_datapoints Schema Mismatch

**Date:** 19 December 2025  
**Subject:** Technical blocker preventing Track B Priority 2 execution  
**Purpose:** Leadership decision on schema alignment authorization  
**Status:** Decision-ready

---

## Issue Description

### What the Schema Mismatch Is

The `esrs_datapoints` table has a naming convention mismatch between the database schema file and the actual database columns. The schema file uses snake_case naming, while the database table uses camelCase naming for the same fields.

**Schema File (`drizzle/schema.ts`) — snake_case:**
- `code`
- `esrs_standard`
- `disclosure_requirement`
- `related_ar`
- `data_type`
- `conditional`
- `voluntary`

**Database Table (MySQL) — snake_case (VERIFIED):**
- `code`
- `esrs_standard`
- `disclosure_requirement`
- `related_ar`
- `data_type`
- `conditional`
- `voluntary`

**Correction:** Database inspection reveals the actual database columns already use snake_case. The mismatch is between historical documentation and current reality.

### Where It Exists

**Table:** `esrs_datapoints`  
**Records Affected:** 1,186 ESRS datapoints  
**Schema File:** `/home/ubuntu/isa_web/drizzle/schema.ts` (lines 1425-1448)  
**Database:** Production MySQL table

**Code References:**
- `server/db.ts` — 33 references to `esrsDatapoints` schema object
- `server/efrag-ig3-parser.ts` — Data ingestion queries
- `server/news-recommendation-engine.ts` — News-to-ESRS matching logic

### Why It Blocks Priority 2

Priority 2 requires adding 3 provenance fields to the `knowledge_embeddings` table:
1. `datasetId` VARCHAR(128)
2. `datasetVersion` VARCHAR(64)
3. `sourcePublicationDate` TIMESTAMP

When attempting to run `pnpm db:push` to apply this migration, Drizzle ORM performs a full schema comparison and detects the `esrs_datapoints` mismatch. The migration tool presents an interactive prompt asking whether to rename or create columns for each mismatched field.

**Technical Constraint:** Drizzle cannot proceed with any schema migration until all detected mismatches are resolved. This blocks Priority 2 schema changes even though they are unrelated to the `esrs_datapoints` table.

**Historical Context:** This mismatch was introduced during Phase 73 (schema refactoring) when schema.ts was updated to snake_case but database columns were not renamed. The same blocker was encountered during Priority 1 and deferred per user instruction.

---

## Decision Options

### Option A: Do Nothing (Keep Priority 2 Blocked)

**Description:** Maintain current state. Do not authorize schema fix. Priority 2 remains blocked indefinitely.

**Scope Impact:**
- Priority 2 deliverables remain unimplemented (provenance metadata, citation enhancement, citation validation)
- No changes to database schema
- No changes to existing code
- No risk of data corruption or regression

**Risk Level:** **LOW**
- No technical risk (no changes made)
- No data integrity risk
- No regression risk

**Reversibility:** N/A (no action taken)

**Effect on Existing Data:**
- No effect on 1,186 ESRS datapoints
- No effect on existing queries or tests
- No effect on Priority 1 or Priority 3 deliverables

**Effect on Existing Tests:**
- No test changes required
- All existing tests continue to pass

**Implications:**
- Priority 2 cannot be implemented without separate schema alignment task
- Future schema migrations will continue to be blocked by this mismatch
- Technical debt persists indefinitely
- No immediate operational impact (system remains functional)

---

### Option B: Authorize Schema Fix

**Description:** Authorize resolution of the `esrs_datapoints` schema mismatch to unblock Priority 2 and future migrations.

**Scope Impact:**
- Requires database migration to align schema.ts with database columns
- Affects 1,186 ESRS datapoint records
- Requires verification of 33 code references across 3 files
- Requires test updates and validation
- Unblocks Priority 2 execution after completion

**Risk Level:** **MEDIUM**

**Risk Factors:**
1. **Data Migration Risk:** Column renames require ALTER TABLE operations on production data
2. **Query Compatibility Risk:** Existing queries using old field names will break if not updated
3. **Test Coverage Risk:** Tests may reference old field names and require updates
4. **Rollback Complexity:** Column renames are reversible but require careful execution

**Reversibility:** **MEDIUM**
- Column renames can be reversed with another migration
- Requires database rollback capability
- Code changes can be reverted via version control
- Checkpoint system provides rollback point

**Effect on Existing Data:**
- **Data Integrity:** No data loss expected (column rename preserves values)
- **Data Access:** Temporary disruption during migration (seconds to minutes)
- **Data Volume:** 1,186 records affected
- **Foreign Keys:** No foreign key constraints on `esrs_datapoints` table (verified in schema)

**Effect on Existing Tests:**
- Tests referencing `esrsDatapoints` schema object: No changes required (schema object already uses snake_case)
- Tests with raw SQL queries: May require updates if using old field names
- New tests required: Schema alignment validation tests

**Implications:**
- Unblocks Priority 2 execution
- Unblocks future schema migrations
- Resolves technical debt
- Requires dedicated schema alignment task (separate from Priority 2)
- Requires testing and validation before Priority 2 can proceed

---

## Explicit Authorization Required

### Option A: Do Nothing
**Authorization Statement:** "Do not authorize schema fix. Keep Priority 2 blocked."

**No further action required.**

---

### Option B: Authorize Schema Fix
**Authorization Statement:** "Authorize schema alignment for `esrs_datapoints` table as a separate task, distinct from Priority 2."

**Required Approvals:**
1. **Schema Migration Approval:** Authorize ALTER TABLE operations on `esrs_datapoints` table
2. **Scope Expansion Approval:** Authorize work outside Priority 2 scope to unblock Priority 2
3. **Risk Acceptance:** Accept medium risk level for database migration

**Deliverables Required Before Priority 2 Resumption:**
1. Schema alignment task completed
2. Data integrity verification completed
3. Test validation completed
4. Checkpoint created with schema fix

**Estimated Scope:**
- Schema alignment task: Separate work item (not part of Priority 2)
- Testing and validation: Required before Priority 2 resumption
- Priority 2 execution: Can proceed after schema alignment complete

---

## Summary

**Issue:** `esrs_datapoints` table schema mismatch blocks all database migrations, including Priority 2 provenance fields.

**Options:**
- **Option A (Do Nothing):** LOW risk, no scope impact, Priority 2 remains blocked
- **Option B (Authorize Fix):** MEDIUM risk, requires separate task, unblocks Priority 2

**Current Status:** Priority 2 blocked, awaiting explicit authorization decision.

**No recommendation provided.** Decision authority rests with leadership.

---

**End of Decision Brief**
