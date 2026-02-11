# ISA Known Failure Modes

**Document Purpose:** This document serves as institutional memory for the Intelligent Standards Architect (ISA) project.

**Last Updated:** 2026-01-04

---

## Overview

The ISA project has experienced several recurring failure modes. This document establishes permanent prevention rules.

## Failure Mode A: ESRS / GS1 Schema Drift

**Severity:** CRITICAL | **Status:** FIXED (2026-01-04)

### Root Cause
Database uses snake_case columns, TypeScript uses camelCase. Business logic directly accessed raw column names.

### Correct Fix
Created schema mapping layer (`server/schema-mappers.ts`) as single source of truth.

### Prevention Rule
**MANDATORY:** No business logic may reference raw database column names directly.

## Failure Mode B: Onboarding Router Removal

**Severity:** HIGH | **Status:** FIXED (2026-01-04)

### Root Cause
Onboarding treated as optional, commented out during refactors despite test dependencies.

### Correct Fix
Restored with minimal in-memory implementation (`server/onboarding-store.ts`) and permanent wiring.

### Prevention Rule
**MANDATORY:** Onboarding router must always exist as long as tests exist.

## Failure Mode C: News Health & Retry Instability

**Severity:** HIGH | **Status:** FIXED (2026-01-04)

### Root Cause
Tests called async functions synchronously, reading stale data.

### Correct Fix
Updated all tests to properly await async operations.

### Prevention Rule
**MANDATORY:** Health infrastructure must fail gracefully, never loudly.

## Failure Mode D: Test Data Pollution

**Severity:** MEDIUM | **Status:** MITIGATED (2026-01-04)

### Root Cause
No systematic test isolation approach, tests pollute shared tables.

### Correct Fix
Created reusable isolation utilities (`server/test-isolation-utils.ts`).

### Prevention Rule
**MANDATORY:** Every test must satisfy explicit cleanup, scoping, or dedicated DB.

---

**Maintained By:** ISA Development Team

## Failure Mode E: Database Connection SSL Misconfiguration

**Severity:** CRITICAL | **Status:** FIXED (2026-01-04)

### Root Cause
DATABASE_URL contains SSL configuration as JSON object (`ssl={"rejectUnauthorized":true}`), but connection parser expected simple string values (`sslmode=require`). Resulted in "Connections using insecure transport are prohibited" errors.

### Detection Signal
- Test failures with error message: "insecure transport prohibited"
- Database-dependent tests excluded silently
- Connection attempts fail in beforeEach hooks

### Correct Fix
Enhanced `server/db-connection.ts` `normalizeSslValue()` to parse JSON objects first, then fall back to string parsing. Added comprehensive SSL value handling for all common formats.

### Prevention Rule
**MANDATORY:** `server/db-connection.ts` MUST parse both JSON objects and string SSL parameters. `server/db-health-guard.test.ts` MUST run before any database tests.

---

## Failure Mode F: Async Database Detection in Test Configuration

**Severity:** HIGH | **Status:** FIXED (2026-01-04)

### Root Cause
`vitest.config.ts` used async `isDatabaseAvailable()` check at config generation time. Async operations in config are unreliable and cause race conditions. Tests were excluded based on stale or incorrect availability checks.

### Detection Signal
- Database tests show as "No test files found"
- Exclude list includes tests that should run
- Inconsistent test execution between runs

### Correct Fix
Replaced async check with explicit environment flag: `const runDbTests = process.env.RUN_DB_TESTS === "true" || process.env.DATABASE_URL;`. Created `server/db-health-guard.test.ts` to validate connection before integration tests.

### Prevention Rule
**MANDATORY:** NEVER use async operations in vitest.config.ts. Use explicit environment flags: `RUN_DB_TESTS=true`. Database availability MUST be checked in guard tests, not config.

---

## Failure Mode G: Schema Timestamp Defaults vs Application Code

**Severity:** MEDIUM | **Status:** FIXED (2026-01-04)

### Root Cause
Database schema defines `created_at` with `DEFAULT CURRENT_TIMESTAMP`, but application code explicitly passed `created_at` values in INSERT statements. Mismatch between SQL defaults and application logic caused repeated INSERT failures.

### Detection Signal
- error_ledger INSERT failures flooding stderr
- Logger errors: "[serverLogger.persist] failed to insert row"
- Tests pass but console shows repeated errors

### Correct Fix
Removed `created_at` from INSERT columns and params in `server/_core/logger-wiring.ts`. Database now handles timestamp automatically.

### Prevention Rule
**MANDATORY:** When a column has SQL DEFAULT, do NOT pass it in INSERT statements. Let the database handle default values.

---

## Failure Mode H: Test Output Piping Causes SIGPIPE

**Severity:** MEDIUM | **Status:** DOCUMENTED (2026-01-04)

### Root Cause
Piping vitest output to `head`, `grep`, or other utilities closes stdout mid-stream. Test runner receives SIGPIPE and crashes or hangs.

### Detection Signal
- Tests hang indefinitely
- No output or incomplete output
- Process must be killed manually

### Correct Fix
Use vitest native filtering instead of shell pipes. Capture to file if needed: `pnpm vitest run > logs/test.log 2>&1`.

### Prevention Rule
**MANDATORY:** NEVER pipe vitest output. Use vitest native filtering: `pnpm vitest run server/suite.test.ts`. Use `--reporter=verbose` for detailed output.

---

## Prevention Checklist

Before committing changes, verify:

- [ ] All database columns use snake_case naming
- [ ] SQL defaults are declared with `sql\`CURRENT_TIMESTAMP\``, not string literals
- [ ] INSERT statements omit columns with SQL defaults
- [ ] SSL configuration handles both JSON and string formats
- [ ] Test configuration uses explicit flags, not async checks
- [ ] No test output is piped to shell utilities
- [ ] All tRPC procedures have corresponding DB functions
- [ ] Middleware has explicit names for testing
- [ ] Database health guard test passes before integration tests

---

## CI Integration

Add to CI pipeline:

```bash
# 1. Verify database health
pnpm test-db-health

# 2. Run unit tests (no DB required)
pnpm test-unit

# 3. Run integration tests (requires DB)
RUN_DB_TESTS=true pnpm test-integration
```

## Drizzle ORM mysql2 insertId Extraction

**Date Discovered**: 2025-01-04  
**Affected PR**: #8 (DB Test Helpers)  
**Severity**: Critical (causes NaN in queries)

### Problem
When using Drizzle ORM with mysql2 driver, the pattern:
```typescript
const result = await db.insert(table).values(values);
const insertId = Number((result as any).insertId);
```
Returns `NaN` because `result.insertId` is not directly accessible.

### Root Cause
Drizzle's mysql2 driver returns the insert result in a nested structure. The `insertId` is at `result[0].insertId`, not `result.insertId`.

### Correct Patterns
```typescript
// Option 1: Access via array index
const result = await db.insert(table).values(values);
const insertId = Number(result[0].insertId);

// Option 2: Use $returningId() (if supported)
const [inserted] = await db.insert(table).values(values).$returningId();
const insertId = inserted.id;
```

### Impact
- Seed helpers fail with "Unknown column 'nan' in 'where clause'"
- Transaction rollback tests fail due to cascading NaN issues
- All insert-then-fetch patterns are affected

### Resolution
PR #8 requires revision to fix insertId extraction in all seed functions.
