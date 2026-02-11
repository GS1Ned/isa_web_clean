# Dataset Registry Schema Mismatch Analysis
**Date:** 2026-02-11  
**Status:** BLOCKED - Schema mismatch prevents dataset_registry functionality

## Evidence Summary

### Actual Database Schema (14 columns)
```sql
SHOW COLUMNS FROM dataset_registry;
```
- `id` (int, PK, auto_increment)
- `dataset_name` (varchar(128))
- `source_type` (enum: official_api, official_download, curated_list, scraped, manual)
- `source_url` (varchar(512))
- `source_authority` (varchar(128))
- `license_type` (varchar(64))
- `license_disclaimer` (text)
- `version` (varchar(32))
- `publication_date` (date)
- `last_verified_at` (timestamp)
- `checksum` (varchar(64))
- `is_active` (tinyint(1))
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Code Expectations (23+ fields)
From `server/db-dataset-registry.ts` and `drizzle/schema_dataset_registry.ts`:
- All 14 fields above (with camelCase names)
- PLUS: `name`, `description`, `category`, `format`, `recordCount`, `fileSize`, `downloadUrl`, `apiEndpoint`, `lastVerifiedDate`, `verifiedBy`, `verificationNotes`, `metadata`, `tags`, `relatedRegulationIds`, `relatedStandardIds`, `governanceNotes`, `laneStatus`

### Migration Status
- `__drizzle_migrations` table: EMPTY (no migrations applied)
- `drizzle/migrations/` directory: Contains 3 SQL files, none modify dataset_registry
- `drizzle-kit generate`: Creates new ESG tables only, doesn't detect dataset_registry mismatch
- `drizzle-kit push`: Fails due to SSL parameter format in DATABASE_URL

### Test Failures
```
Unknown column 'dataset_registry.updatedAt' in 'order clause'
Unknown column 'name' in 'field list'
```
- 9/12 tests failing in `server/routers/dataset-registry.test.ts`
- All failures due to schema mismatch

## Root Cause

The database contains an **older/simpler schema** from an earlier version of ISA. The current codebase was developed expecting a **richer schema** with governance features, metadata, and relationships.

**Timeline inference:**
1. Initial DB schema created (simple: 14 columns)
2. Code evolved to add governance features (Decision 3: Lane C tracking)
3. Schema definition updated in code but never migrated to DB
4. Tests written against new schema expectations
5. DB never upgraded → mismatch

## Resolution Options

### Option A: Migrate DB to Match Code (RECOMMENDED)
**Pros:**
- Preserves current code and tests
- Enables governance features (Lane C tracking)
- Supports metadata and relationships
- Future-proof

**Cons:**
- Requires careful migration on live DB (114 tables, existing data)
- Risk of data loss if migration fails
- Downtime during migration

**Steps:**
1. Fix DATABASE_URL SSL parameter format for drizzle-kit
2. Create migration SQL to add missing columns
3. Test migration on dev/staging DB first
4. Apply to production with backup
5. Verify all tests pass

### Option B: Update Code to Match DB (FASTER, RISKIER)
**Pros:**
- No DB changes required
- Immediate unblock
- Lower risk to existing data

**Cons:**
- Loses governance features
- Breaks existing code assumptions
- Requires extensive code changes
- Tests need rewriting
- Removes future capabilities

**Steps:**
1. Update all code to use simple schema
2. Remove references to missing fields
3. Rewrite tests
4. Update documentation
5. Accept feature loss

### Option C: Hybrid Approach
**Pros:**
- Gradual migration
- Lower risk
- Can test incrementally

**Cons:**
- Complex to maintain
- Temporary inconsistency
- More work overall

**Steps:**
1. Make missing fields optional in code
2. Add null checks everywhere
3. Migrate DB when ready
4. Remove null checks after migration

## Recommendation

**Choose Option A: Migrate DB to Match Code**

**Rationale:**
1. Code represents intended design (governance features, metadata)
2. Tests validate rich schema behavior
3. Reverting code loses valuable features
4. Migration is one-time cost vs ongoing technical debt

**Immediate Actions:**
1. Fix DATABASE_URL format: Remove `?ssl={"rejectUnauthorized":true}`, use `?ssl-mode=REQUIRED`
2. Generate migration: `drizzle-kit generate`
3. Review migration SQL
4. Test on dev DB
5. Apply to production

## Blocked Functionality

Until schema mismatch resolved:
- ❌ Dataset registry CRUD operations
- ❌ Dataset verification tracking
- ❌ Dataset metadata storage
- ❌ Dataset categorization
- ❌ Dataset relationships (regulations, standards)
- ❌ Lane C governance tracking
- ❌ 9/12 dataset registry tests

## Impact Assessment

**Severity:** HIGH  
**User Impact:** Dataset registry feature completely non-functional  
**Development Impact:** Cannot test or develop dataset-related features  
**Timeline Impact:** Blocks Day 1 Hour 3-4 (Database Verification)

---

**Next Steps:** Fix DATABASE_URL format and generate migration SQL
