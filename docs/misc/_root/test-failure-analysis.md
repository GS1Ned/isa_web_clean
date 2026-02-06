# Test Suite Stabilization - Failure Analysis

**Date:** 2026-01-04
**Initial State:** 2 failed | 848 passed | 28 skipped (878 total)
**Pass Rate:** 96.6% (target: ≥98%)

## Test Run Summary

```
Test Files: 2 failed | 63 passed | 4 skipped (69)
Tests: 2 failed | 848 passed | 28 skipped (878)
Duration: 46.94s
```

## Failing Tests

### 1. `server/db-error-tracking.test.ts` - getErrorStats

**Test:** `Error Tracking Database Helpers > getErrorStats > should return error statistics`

**Failure:**
```
AssertionError: expected 1 to be greater than or equal to 3
  expect(stats.totalErrors).toBeGreaterThanOrEqual(3);
```

**Location:** `server/db-error-tracking.test.ts:127:33`

**Category:** Test fragility / Environment issue

**Analysis:**
- Test expects at least 3 errors to be present in database
- Only 1 error found
- Likely issue: Test setup not properly seeding test data OR test isolation problem (previous test cleanup removing data)
- Also seeing massive stderr spam: `[serverLogger.persist] failed to insert row` - error_ledger INSERT failures
- Root cause appears to be serverLogger trying to log errors to error_ledger during test runs, but failing

**Root Cause Identified:**
The error_ledger table EXISTS, but serverLogger.persist() is failing during tests. The issue is in `server/_core/logger-wiring.ts` line 53:
```typescript
serverLogger.error("[serverLogger.persist] failed to insert row", { error: String(err), traceId: row.trace_id });
```
This creates an **infinite recursion loop**: when persist() fails, it calls serverLogger.error(), which tries to persist again, which fails, which calls serverLogger.error() again, etc.

This explains:
1. The "Maximum call stack size exceeded" error
2. The thousands of duplicate error logs
3. Why db-error-tracking.test.ts can't find expected errors (they're never persisted)

**Action Required:**
1. Fix infinite recursion in logger-wiring.ts by using console.error instead of serverLogger.error
2. Fix test data setup in db-error-tracking.test.ts to ensure 3+ errors are inserted
3. Verify test isolation (beforeEach/afterEach cleanup)

---

### 2. `server/news-ai-processor.test.ts` - GS1 Enhancement

**Test:** `News AI Processor - GS1 Enhancement > should process DPP news with relevant GS1 tags`

**Failure:**
```
AssertionError: expected 'This regulation may affect GS1 standa…' to match /digital link|qr code|2d barcode/i

Expected: /digital link|qr code|2d barcode/i
Received: "This regulation may affect GS1 standards related to DPP, IDENTIFICATION, PACKAGING_ATTRIBUTES. Companies should review their data models and processes for compliance."
```

**Location:** `server/news-ai-processor.test.ts:86:38`

**Category:** Test fragility (LLM non-determinism)

**Analysis:**
- Test relies on LLM output containing specific keywords
- LLM generated valid analysis but didn't include expected keywords
- This is a classic LLM testing anti-pattern: asserting exact text patterns on non-deterministic output

**Action Required:**
1. Refactor test to check semantic correctness, not exact text patterns
2. Options:
   - Check for presence of gs1ImpactTags (already passing)
   - Verify analysis is non-empty and mentions DPP/GS1
   - Remove overly specific regex assertion
   - Mock LLM response for deterministic testing

---

## Secondary Issues (Not Causing Test Failures)

### serverLogger.persist() Spam

**Observation:** Thousands of error logs during test runs:
```
{"level":"error","payload":{"message":"[serverLogger.persist] failed to insert row"},"meta":{"error":"Error: Failed query: INSERT INTO error_ledger..."}}
```

**Impact:**
- Pollutes test output
- May indicate database connection issues during tests
- Could be causing db-error-tracking.test.ts failure

**Action Required:**
1. Investigate why serverLogger can't insert into error_ledger during tests
2. Options:
   - Disable serverLogger persistence in test environment
   - Mock serverLogger in tests
   - Fix database initialization for error_ledger table in test setup

---

### Maximum Call Stack Size Exceeded

**Observation:** One occurrence during test run:
```
Exception in PromiseRejectCallback:
/home/ubuntu/isa_web/server/utils/server-logger.ts:58
RangeError: Maximum call stack size exceeded
```

**Location:** `server/utils/server-logger.ts:58`

**Impact:** Intermittent, may cause test instability

**Action Required:**
1. Investigate potential infinite recursion in serverLogger
2. Check if error logging is triggering more errors (error loop)

---

## Next Steps

1. **Fix serverLogger test integration** (highest priority - affects multiple tests)
2. **Fix db-error-tracking.test.ts** data setup
3. **Refactor news-ai-processor.test.ts** to handle LLM non-determinism
4. **Investigate serverLogger recursion** issue
5. **Re-run full test suite** to verify fixes
