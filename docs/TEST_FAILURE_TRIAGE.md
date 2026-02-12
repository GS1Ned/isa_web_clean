# ISA Test Failure Triage

**Date:** 2026-02-12  
**Status:** IN PROGRESS  
**Target:** 95%+ passing rate (545/574 tests)

---

## Summary

- **Total Tests:** 574
- **Passing:** 517 (90.1%)
- **Failing:** 57 (9.9%)
- **Blocked:** TypeScript compilation errors preventing test execution

---

## Critical Blocker: TypeScript Compilation Errors

**Status:** 🔴 BLOCKING  
**Impact:** Cannot run test suite until resolved  
**Effort:** 2-4 hours

### Errors Found (16 TypeScript errors)

1. **EnhancedSearchPanel.tsx** (2 errors)
   - `onSuccess` callback removed in TanStack Query v5
   - Parameter 'data' missing type annotation
   - **Fix:** Remove onSuccess, use useEffect instead

2. **GapAnalysisPanel.tsx** (4 errors)
   - `askISAEnhanced` router not found
   - `limit` property doesn't exist on type
   - `regulations` property missing
   - **Fix:** Update to correct router names, fix type definitions

3. **NotificationCenter.tsx** (1 error)
   - `realtime` router not found
   - **Fix:** Remove or implement realtime router

4. **AdminCellarIngestion.tsx** (5 errors)
   - `cellarIngestion` router not found
   - Missing type annotations for callbacks
   - **Fix:** Remove Cellar feature or implement router

5. **AdminCellarSyncMonitor.tsx** (4 errors)
   - `cellarIngestion` router not found
   - Missing type annotation for 'log' parameter
   - **Fix:** Remove Cellar feature or implement router

### Action Plan

**Priority 1: Remove Obsolete Features (2 hours)**
- Remove Cellar ingestion pages (obsolete feature)
- Remove realtime notifications (not implemented)
- Remove askISAEnhanced router references (consolidated)

**Priority 2: Fix TanStack Query v5 Migration (1 hour)**
- Replace `onSuccess` callbacks with `useEffect`
- Update query options to v5 API

**Priority 3: Fix Type Annotations (30 min)**
- Add explicit types to callback parameters
- Fix property access on typed objects

---

## Test Categorization (Estimated)

### Category 1: Environment Issues (Est: 2 tests)
**Symptoms:** Missing env vars, database connection failures  
**Effort:** 30 minutes  
**Priority:** P0

**Tests:**
- Database connection tests (need DATABASE_URL)
- OpenAI API tests (need OPENAI_API_KEY)

**Fix:**
- Add `.env.test` with test credentials
- Mock external API calls

---

### Category 2: Obsolete Tests (Est: 10 tests)
**Symptoms:** Testing removed features  
**Effort:** 1 hour  
**Priority:** P1

**Tests:**
- Cellar ingestion tests (feature removed)
- Realtime notification tests (not implemented)
- askISAEnhanced tests (router consolidated)

**Fix:**
- Delete obsolete test files
- Remove test references from vitest config

---

### Category 3: Broken Tests (Est: 25 tests)
**Symptoms:** Assertions fail, unexpected behavior  
**Effort:** 1 day  
**Priority:** P1

**Common Issues:**
- Outdated assertions (API changed)
- Missing mock data
- Race conditions in async tests

**Fix:**
- Update assertions to match current API
- Add proper test fixtures
- Add `await` for async operations

---

### Category 4: Flaky Tests (Est: 20 tests)
**Symptoms:** Intermittent failures, timing issues  
**Effort:** 1 day  
**Priority:** P2

**Common Issues:**
- Timing-dependent assertions
- Shared state between tests
- External API calls without mocks

**Fix:**
- Add retry logic for timing-sensitive tests
- Isolate test state with beforeEach/afterEach
- Mock all external API calls

---

## Execution Plan

### Phase 1: Unblock Test Suite (Day 1 Morning)
1. Fix TypeScript compilation errors (2-4 hours)
   - Remove obsolete features
   - Fix TanStack Query v5 migration
   - Add type annotations
2. Verify tests can run: `pnpm test`

### Phase 2: Fix Environment + Obsolete (Day 1 Afternoon)
1. Add `.env.test` with test credentials (30 min)
2. Remove obsolete test files (1 hour)
3. **Target:** 92%+ passing rate (530/574 tests)

### Phase 3: Fix Broken Tests (Day 2)
1. Update assertions to match current API (4 hours)
2. Add proper test fixtures (2 hours)
3. Fix async/await issues (2 hours)
4. **Target:** 94%+ passing rate (540/574 tests)

### Phase 4: Stabilize Flaky Tests (Day 3)
1. Add retry logic for timing-sensitive tests (3 hours)
2. Isolate test state (2 hours)
3. Mock external API calls (3 hours)
4. **Target:** 95%+ passing rate (545/574 tests)

---

## Success Criteria

- [ ] TypeScript compiles with 0 errors
- [ ] Test suite runs successfully
- [ ] 95%+ tests passing (545/574)
- [ ] No flaky tests in CI
- [ ] All critical paths covered

---

## Files to Modify

### Remove (Obsolete Features)
- `client/src/pages/AdminCellarIngestion.tsx`
- `client/src/pages/AdminCellarSyncMonitor.tsx`
- `client/src/components/NotificationCenter.tsx` (if realtime not needed)

### Fix (TanStack Query v5)
- `client/src/components/EnhancedSearchPanel.tsx`
- `client/src/components/GapAnalysisPanel.tsx`

### Add
- `.env.test` (test environment variables)

---

## Risk Assessment

**High Risk:**
- Removing Cellar pages may break navigation
- TanStack Query v5 migration may affect other components

**Mitigation:**
- Check all route references before removing pages
- Test all tRPC queries after migration
- Run full test suite after each change

**Low Risk:**
- Adding type annotations (no behavior change)
- Removing obsolete tests (no production impact)

---

## Next Steps

1. **Immediate:** Fix TypeScript compilation errors
2. **Day 1:** Achieve 92%+ passing rate
3. **Day 2:** Achieve 94%+ passing rate
4. **Day 3:** Achieve 95%+ passing rate
5. **Day 4:** Add to CI as merge requirement

---

*Generated: 2026-02-12*  
*Status: DRAFT - Awaiting TypeScript error fixes*  
*Owner: Engineering Team*
