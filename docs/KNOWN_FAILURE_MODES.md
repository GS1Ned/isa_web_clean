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
