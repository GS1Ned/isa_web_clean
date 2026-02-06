# ISA Known Failure Modes

**Last Updated:** 2026-01-04

## Overview

This document catalogs recurring failure modes in the ISA project and their prevention mechanisms.

---

## A. ESRS / GS1 Schema Drift

**Severity:** CRITICAL | **Status:** FIXED

**Root Cause:** Database uses `snake_case` columns, TypeScript uses `camelCase`. Business logic directly accessed raw column names, causing runtime failures.

**Fix:** Created `server/schema-mappers.ts` as single source of truth for column name translation.

**Prevention Rule:** No business logic may reference raw database column names directly. All access must go through schema mappers.

**Files:** `server/schema-mappers.ts` (NEW), `server/db-esrs-gs1-mapping.ts` (updated)

---

## B. Onboarding Router Removal

**Severity:** HIGH | **Status:** FIXED

**Root Cause:** Onboarding router treated as optional and commented out during refactors, despite test dependencies.

**Fix:** Restored with minimal in-memory implementation (`server/onboarding-store.ts`) and marked as PERMANENT in `server/routers.ts`.

**Prevention Rule:** Onboarding router must always exist as long as tests exist. Minimal deterministic implementation is acceptable.

**Files:** `server/onboarding-store.ts` (NEW), `server/routers.ts` (restored), `server/onboarding.test.ts` (isolation added)

---

## C. News Health & Retry Instability

**Severity:** HIGH | **Status:** FIXED

**Root Cause:** Tests called async functions synchronously, reading stale or incomplete data.

**Fix:** Updated all tests in `server/news-retry-health.test.ts` to properly await async operations.

**Prevention Rule:** Health infrastructure must fail gracefully, never loudly. All health monitoring functions must be awaited in tests.

**Files:** `server/news-retry-health.test.ts` (updated), `server/news-health-monitor.ts` (already correct)

---

## D. Test Data Pollution

**Severity:** MEDIUM | **Status:** MITIGATED

**Root Cause:** No systematic test isolation approach. Tests pollute shared tables without cleanup.

**Fix:** Created reusable isolation utilities (`server/test-isolation-utils.ts`) with three patterns: explicit cleanup, query scoping, dedicated DB.

**Prevention Rule:** Every test must satisfy one of: explicit DB cleanup in beforeEach, query scoping by test run ID, or dedicated test database. No test may rely on execution order.

**Files:** `server/test-isolation-utils.ts` (NEW), `server/onboarding.test.ts` (updated with beforeEach cleanup)

---

## Maintenance

- **Update when:** New failure discovered, existing failure recurs, prevention mechanism changes
- **Review:** Quarterly or after major refactors
- **Escalation:** If known failure recurs, strengthen prevention rules and add automated checks

**Maintained By:** ISA Development Team
