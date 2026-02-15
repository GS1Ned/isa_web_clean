# ISA Pre-Architecture-Review Development Plan

**Version:** 1.0.0  
**Date:** 2026-02-12  
**Purpose:** Prepare repository for final architecture review  
**Target:** Production-ready state with 95%+ quality metrics

---

## Executive Summary

This plan prepares the ISA repository for the final architecture review by addressing critical gaps, establishing production-grade quality standards, and ensuring all validation infrastructure is operational.

**Timeline:** 3-5 days  
**Priorities:** 3 phases (Critical → High → Medium)  
**Success Criteria:** All gates passing, 95%+ test coverage, complete documentation

---

## Phase 1: Critical Fixes (Day 1)

### 1.1 Fix Validation Gate Compatibility
**Priority:** P0 (Blocking)  
**Effort:** 15 minutes  
**Owner:** DevOps

**Issue:** validate_gates.sh uses `grep -P` (GNU-only), fails on macOS

**Actions:**
```bash
# Replace all grep -P with grep -E in validate_gates.sh
sed -i '' 's/grep -oP/grep -oE/g' scripts/refactor/validate_gates.sh
```

**Acceptance:**
- Gates run successfully on macOS and Linux
- No grep errors in output
- All 6 gates still passing

**Files:**
- `scripts/refactor/validate_gates.sh`

---

### 1.2 Create Missing Smoke Test Stubs
**Priority:** P0 (Blocking)  
**Effort:** 1 hour  
**Owner:** QA

**Issue:** 5 of 6 capabilities lack smoke tests, causing semantic validation warnings

**Actions:**
Create 5 smoke test scripts:

1. `scripts/probe/news_hub_health.sh`
   - Check: 7 news sources configured
   - Check: Recent articles in database (last 7 days)
   - Check: AI enrichment pipeline operational

2. `scripts/probe/knowledge_base_health.sh`
   - Check: 155+ knowledge chunks exist
   - Check: All source types covered (regulations, standards, ESRS, initiatives)
   - Check: No duplicate content hashes

3. `scripts/probe/catalog_health.sh`
   - Check: 38 regulations, 60+ standards, 1,184 ESRS datapoints, 10 initiatives
   - Check: Bidirectional mappings valid
   - Check: Search index operational

4. `scripts/probe/esrs_mapping_health.sh`
   - Check: 450+ ESRS-GS1 mappings exist
   - Check: Average confidence >70%
   - Check: Coverage >80%

5. `scripts/probe/advisory_health.sh`
   - Check: 2 advisory versions exist (v1.0, v1.1)
   - Check: Dataset registry valid (15 datasets)
   - Check: All checksums match

**Template:**
```bash
#!/bin/bash
set -e

echo "=== [CAPABILITY] Health Check ==="

# Check 1: [Description]
# Check 2: [Description]
# Check 3: [Description]

echo "✅ All checks passed"
```

**Acceptance:**
- All 5 scripts exist and executable
- Semantic validation reaches 95%+ (from 89.3%)
- Scripts can be run manually and in CI

**Files:**
- `scripts/probe/news_hub_health.sh`
- `scripts/probe/knowledge_base_health.sh`
- `scripts/probe/catalog_health.sh`
- `scripts/probe/esrs_mapping_health.sh`
- `scripts/probe/advisory_health.sh`

---

### 1.3 Create Test Failure Triage Document
**Priority:** P0 (Blocking)  
**Effort:** 2 hours  
**Owner:** Engineering Lead

**Issue:** 57 test failures (10% failure rate) with no categorization or plan

**Actions:**
1. Run full test suite: `pnpm test 2>&1 | tee test-output.log`
2. Categorize failures:
   - **Flaky:** Intermittent failures (timing, race conditions)
   - **Broken:** Real bugs requiring fixes
   - **Obsolete:** Tests for removed features
   - **Environment:** Missing env vars or dependencies
3. Create triage document with action plan

**Document Structure:**
```markdown
# ISA Test Failure Triage

## Summary
- Total Tests: 574
- Passing: 517 (90.1%)
- Failing: 57 (9.9%)

## Categorization
### Flaky (Est: 20 tests)
- [Test name] - [Reason] - [Fix: Add retry logic]

### Broken (Est: 25 tests)
- [Test name] - [Reason] - [Fix: Update assertion]

### Obsolete (Est: 10 tests)
- [Test name] - [Reason] - [Fix: Remove test]

### Environment (Est: 2 tests)
- [Test name] - [Reason] - [Fix: Add env var]

## Action Plan
1. Fix environment issues (2 tests) - 30 min
2. Remove obsolete tests (10 tests) - 1 hour
3. Fix broken tests (25 tests) - 1 day
4. Stabilize flaky tests (20 tests) - 1 day

## Target: 95%+ passing rate (545/574 tests)
```

**Acceptance:**
- All 57 failures categorized
- Action plan with effort estimates
- Priority order established
- Target: 95%+ passing rate

**Files:**
- `docs/TEST_FAILURE_TRIAGE.md`

---

## Phase 2: High Priority Improvements (Days 2-3)

### 2.1 Fix Test Failures (Top Priority)
**Priority:** P1 (High)  
**Effort:** 2 days  
**Owner:** Engineering Team

**Issue:** 57 failing tests prevent confident refactoring

**Actions:**
1. **Day 1:** Fix environment + obsolete (12 tests, 1.5 hours)
2. **Day 2:** Fix broken tests (25 tests, 1 day)
3. **Day 3:** Stabilize flaky tests (20 tests, 1 day)

**Approach:**
- Fix in priority order (environment → obsolete → broken → flaky)
- Run tests after each fix to prevent regression
- Update test documentation as needed

**Acceptance:**
- 95%+ tests passing (545/574)
- All critical paths covered
- No flaky tests in CI

**Files:**
- Various test files across `server/` and `client/src/`

---

### 2.2 Create Missing Schema File
**Priority:** P1 (High)  
**Effort:** 2 hours  
**Owner:** Backend Engineer

**Issue:** `drizzle/schema_news_hub.ts` referenced but doesn't exist

**Actions:**
1. Extract News Hub tables from `drizzle/schema.ts`:
   - `hub_news`
   - `hub_news_history`
   - `hub_news_recommendations`
2. Create `drizzle/schema_news_hub.ts`
3. Update imports in affected files
4. Run migrations to verify

**Acceptance:**
- Schema file exists and exports all News Hub tables
- Semantic validation reaches 92%+ (from 89.3%)
- No breaking changes to existing code

**Files:**
- `drizzle/schema_news_hub.ts` (new)
- `drizzle/schema.ts` (remove News Hub tables)
- Update imports in `server/routers/news-hub.ts`

---

### 2.3 Add CI Status Badges
**Priority:** P1 (High)  
**Effort:** 30 minutes  
**Owner:** DevOps

**Issue:** No visibility into validation gate status

**Actions:**
1. Add GitHub Actions workflow status badges to README.md
2. Add custom badges for:
   - Validation Gates (6/6 passing)
   - Test Coverage (95%+)
   - Quality Score (75/100)
   - Evidence Markers (145)

**Badge Examples:**
```markdown
![Validation Gates](https://img.shields.io/badge/gates-6%2F6%20passing-success)
![Test Coverage](https://img.shields.io/badge/tests-95%25%20passing-success)
![Quality Score](https://img.shields.io/badge/quality-75%2F100-yellow)
![Evidence Markers](https://img.shields.io/badge/evidence-145%20markers-blue)
```

**Acceptance:**
- Badges visible in README.md
- Badges update automatically via CI
- Status reflects current state

**Files:**
- `README.md`
- `.github/workflows/badges.yml` (optional)

---

### 2.4 Complete Runtime Contract Documentation
**Priority:** P1 (High)  
**Effort:** 4 hours  
**Owner:** Tech Lead

**Issue:** Contracts at 70% completeness, need real examples

**Actions:**
For each of 6 runtime contracts:
1. Add actual tRPC procedure signatures from code
2. Add real database query examples
3. Add concrete failure scenarios from logs
4. Add performance benchmarks (response times)

**Example Enhancement:**
```markdown
## Inputs/Outputs

### Inputs
**tRPC Procedure: `askQuestion`**
```typescript
// From server/routers/ask-isa.ts
export const askQuestion = publicProcedure
  .input(z.object({
    question: z.string().min(10).max(500),
    conversationId: z.string().optional()
  }))
  .query(async ({ input }) => { ... })
```

**Acceptance:**
- All 6 contracts at 90%+ completeness
- Real code examples included
- Performance benchmarks documented

**Files:**
- All 6 `docs/spec/*/RUNTIME_CONTRACT.md` files

---

## Phase 3: Medium Priority Enhancements (Days 4-5)

### 3.1 Expand Evidence Markers to 200+
**Priority:** P2 (Medium)  
**Effort:** 4 hours  
**Owner:** Documentation Team

**Issue:** 145 markers is good, 200+ would be comprehensive

**Target Areas:**
1. **Client Components (30 markers)**
   - UI component → tRPC procedure mappings
   - Page → API endpoint connections

2. **Database Migrations (20 markers)**
   - Schema changes → code updates
   - Migration → affected queries

3. **Configuration Files (15 markers)**
   - Environment variables → usage locations
   - Config values → dependent code

4. **Test Files (20 markers)**
   - Test → implementation mapping
   - Test coverage → requirements

**Acceptance:**
- 200+ evidence markers total
- All critical paths traced
- Evidence validation at 95%+

**Files:**
- Various files across `client/`, `server/`, `drizzle/`

---

### 3.2 Add Performance Baselines
**Priority:** P2 (Medium)  
**Effort:** 3 hours  
**Owner:** Performance Engineer

**Issue:** No performance tracking or SLOs defined

**Actions:**
1. Add response time tracking to smoke tests
2. Define SLOs for each capability:
   - ASK_ISA: <2s for Q&A
   - NEWS_HUB: <500ms for article list
   - CATALOG: <300ms for regulation list
   - ESRS_MAPPING: <1s for mapping generation
   - ADVISORY: <5s for report generation

3. Create performance dashboard

**Acceptance:**
- All smoke tests track response times
- SLOs documented in runtime contracts
- Performance trends visible

**Files:**
- Update all `scripts/probe/*_health.sh`
- Add `docs/PERFORMANCE_SLOS.md`

---

### 3.3 Create Architecture Review Checklist
**Priority:** P2 (Medium)  
**Effort:** 2 hours  
**Owner:** Architecture Team

**Issue:** Need structured approach for final architecture review

**Checklist Sections:**
1. **Capability Boundaries**
   - [ ] Clear separation of concerns
   - [ ] Minimal coupling between capabilities
   - [ ] Well-defined interfaces

2. **Data Flow**
   - [ ] Unidirectional data flow
   - [ ] No circular dependencies
   - [ ] Clear ownership of data

3. **Scalability**
   - [ ] Horizontal scaling possible
   - [ ] No single points of failure
   - [ ] Caching strategy defined

4. **Security**
   - [ ] Authentication on all endpoints
   - [ ] Authorization checks in place
   - [ ] Secrets management secure

5. **Observability**
   - [ ] Logging comprehensive
   - [ ] Metrics tracked
   - [ ] Alerts configured

6. **Testing**
   - [ ] 95%+ test coverage
   - [ ] Integration tests complete
   - [ ] Smoke tests operational

7. **Documentation**
   - [ ] Runtime contracts complete
   - [ ] API documentation current
   - [ ] Deployment guide exists

**Acceptance:**
- Checklist covers all critical areas
- Each item has clear pass/fail criteria
- Checklist used in architecture review

**Files:**
- `docs/ARCHITECTURE_REVIEW_CHECKLIST.md`

---

## Phase 4: Pre-Review Validation (Day 5)

### 4.1 Run Full Validation Suite
**Priority:** P0 (Blocking)  
**Effort:** 1 hour  
**Owner:** QA Lead

**Actions:**
1. Run all validation gates: `bash scripts/refactor/validate_gates.sh`
2. Run full test suite: `pnpm test`
3. Run all smoke tests: `bash scripts/probe/*_health.sh`
4. Generate quality report: `python3 scripts/refactor/phase_3_quality.py`
5. Check semantic validation: `python3 scripts/refactor/semantic_validator.py`

**Acceptance Criteria:**
- [ ] All 6 validation gates passing
- [ ] 95%+ tests passing (545/574)
- [ ] All 6 smoke tests passing
- [ ] Quality score ≥75/100
- [ ] Semantic validity ≥95%
- [ ] Evidence markers ≥200

**Files:**
- Generate `docs/PRE_REVIEW_VALIDATION_REPORT.md`

---

### 4.2 Create Architecture Review Package
**Priority:** P0 (Blocking)  
**Effort:** 2 hours  
**Owner:** Tech Lead

**Package Contents:**
1. **Executive Summary** (1 page)
   - Current state metrics
   - Key achievements
   - Remaining risks

2. **Architecture Diagrams** (5 pages)
   - System overview
   - Capability boundaries
   - Data flow
   - Deployment architecture
   - Security model

3. **Runtime Contracts** (6 pages)
   - One page per capability
   - Complete with examples

4. **Quality Metrics** (2 pages)
   - Test coverage
   - Validation gates
   - Evidence markers
   - Performance baselines

5. **Risk Assessment** (1 page)
   - Known issues
   - Technical debt
   - Mitigation plans

**Acceptance:**
- Package complete and reviewed
- All diagrams current
- Metrics accurate

**Files:**
- `docs/ARCHITECTURE_REVIEW_PACKAGE.pdf`

---

## Success Metrics

### Before (Current State)
- Validation Gates: 6/6 passing ✅
- Test Coverage: 90.1% (517/574) ⚠️
- Quality Score: 75.0/100 ✅
- Evidence Markers: 145 ✅
- Semantic Validity: 89.3% ⚠️
- Smoke Tests: 1/6 exist ❌

### After (Target State)
- Validation Gates: 6/6 passing ✅
- Test Coverage: 95%+ (545/574) ✅
- Quality Score: 80/100 ✅
- Evidence Markers: 200+ ✅
- Semantic Validity: 95%+ ✅
- Smoke Tests: 6/6 exist ✅

---

## Execution Timeline

### Day 1: Critical Fixes
- Morning: Fix grep compatibility (15 min)
- Morning: Create smoke test stubs (1 hour)
- Afternoon: Test failure triage (2 hours)
- **Deliverable:** All P0 items complete

### Day 2: Test Fixes
- Full day: Fix environment + obsolete tests (12 tests)
- **Deliverable:** 92%+ tests passing

### Day 3: Test Stabilization
- Morning: Fix broken tests (25 tests)
- Afternoon: Stabilize flaky tests (20 tests)
- **Deliverable:** 95%+ tests passing

### Day 4: Documentation & Enhancement
- Morning: Complete runtime contracts (4 hours)
- Afternoon: Create schema file + CI badges (2.5 hours)
- **Deliverable:** All P1 items complete

### Day 5: Final Validation
- Morning: Expand evidence markers (4 hours)
- Afternoon: Run full validation + create review package (3 hours)
- **Deliverable:** Architecture review package ready

---

## Risk Mitigation

### Risk 1: Test Fixes Take Longer Than Expected
**Mitigation:** Prioritize critical path tests, defer flaky tests if needed  
**Fallback:** Accept 92% passing rate, document remaining failures

### Risk 2: Schema Migration Breaks Existing Code
**Mitigation:** Test in isolated branch, run full test suite before merge  
**Fallback:** Keep News Hub tables in main schema

### Risk 3: Architecture Review Uncovers Major Issues
**Mitigation:** Run pre-review with subset of team first  
**Fallback:** Schedule follow-up review after addressing issues

---

## Approval & Sign-Off

**Plan Approved By:** _________________  
**Date:** _________________  
**Start Date:** _________________  
**Target Completion:** _________________

---

## Appendix: Command Reference

### Run All Validations
```bash
# Validation gates
bash scripts/refactor/validate_gates.sh

# Full test suite
pnpm test

# All smoke tests
for script in scripts/probe/*_health.sh; do bash "$script"; done

# Quality report
python3 scripts/refactor/phase_3_quality.py

# Semantic validation
python3 scripts/refactor/semantic_validator.py
```

### Generate Reports
```bash
# Test coverage report
pnpm test --coverage

# Quality scorecards
python3 scripts/refactor/score_contract_completeness.py

# Evidence markers
python3 scripts/refactor/phase_3_quality.py | grep "evidence markers"
```

---

*Generated: 2026-02-12*  
*Version: 1.0.0*  
*Status: READY FOR EXECUTION*
