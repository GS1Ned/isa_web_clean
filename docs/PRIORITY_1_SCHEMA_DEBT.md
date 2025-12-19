# Priority 1 Schema Changes - Technical Debt

**Status:** BLOCKED  
**Date:** 2025-12-19  
**Reason:** Pre-existing `esrs_datapoints` schema mismatch prevents database migration

---

## Intended Schema Changes (Not Applied)

### regulations table

**Fields to add:**
- `lifecycleStatus` ENUM('draft', 'ratified', 'deprecated', 'superseded') DEFAULT 'ratified'
- `publisher` VARCHAR(128)
- `jurisdiction` VARCHAR(64)

**Purpose:** Track regulation lifecycle status, publishing authority, and jurisdictional scope

**SQL (not executed):**
```sql
ALTER TABLE regulations 
  ADD COLUMN lifecycleStatus ENUM('draft', 'ratified', 'deprecated', 'superseded') DEFAULT 'ratified',
  ADD COLUMN publisher VARCHAR(128),
  ADD COLUMN jurisdiction VARCHAR(64);
```

---

### gs1_standards table

**Fields to add:**
- `lifecycleStatus` ENUM('draft', 'ratified', 'deprecated', 'superseded') DEFAULT 'ratified'
- `publisher` VARCHAR(128)

**Purpose:** Track standard lifecycle status and publishing authority

**SQL (not executed):**
```sql
ALTER TABLE gs1_standards 
  ADD COLUMN lifecycleStatus ENUM('draft', 'ratified', 'deprecated', 'superseded') DEFAULT 'ratified',
  ADD COLUMN publisher VARCHAR(128);
```

---

## Blocking Issue

**Pre-existing schema mismatch in `esrs_datapoints` table:**
- Database columns use camelCase: `datapointId`, `esrsStandard`, `disclosureRequirement`, etc.
- Schema definition uses snake_case: `code`, `esrs_standard`, `disclosure_requirement`, etc.

**Impact:**
- Drizzle migration tool cannot proceed without resolving this mismatch
- Priority 1 database schema changes cannot be applied

**Decision:**
- Per user instruction, defer `esrs_datapoints` fix to maintain scope discipline
- Complete Priority 1 without database schema changes
- Document this as known technical debt

---

## Workaround for Priority 1

**Data quality dashboard and tests will:**
- Use existing schema fields only
- Document missing metadata fields as gaps
- Provide framework for future schema enhancement

**When schema is fixed:**
- Apply SQL changes above
- Update data quality dashboard to use new fields
- Re-run data quality tests

---

## Resolution Path (Future Work)

**Step 1:** Fix `esrs_datapoints` schema mismatch (separate task, explicit approval required)
- Rename columns to match schema definition OR
- Update schema definition to match existing columns

**Step 2:** Apply Priority 1 schema changes
- Run SQL ALTER TABLE statements above
- Update ingestion scripts to populate new fields
- Backfill existing records with metadata

**Step 3:** Update data quality dashboard
- Add lifecycle status, publisher, jurisdiction to quality checks
- Update orphaned records detection
- Update missing metadata detection

---

**End of Technical Debt Documentation**
