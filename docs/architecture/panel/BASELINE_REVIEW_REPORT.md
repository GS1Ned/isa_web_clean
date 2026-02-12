---
DOC_TYPE: ARCHITECTURE_REVIEW
STATUS: baseline_assessment
CREATED: 2026-02-12
FRAMEWORK: Repo-Tight v5
BASELINE_SCORE: 6.2/10
---

# ISA Architecture Review - Baseline Assessment

**Date:** 2026-02-12  
**Framework:** Repo-Tight v5  
**Branch:** isa_web_clean_Q_branch  
**Commits:** 4 (governance consolidation complete)

## Executive Summary

ISA baseline architecture score: **6.2/10** across 12 dimensions. Strong governance and evidence infrastructure (D2, D12) offset by critical gaps in security testing (D3), reliability monitoring (D4), performance instrumentation (D5), and observability (D8).

**Key Finding:** ISA has excellent proof infrastructure but lacks runtime instrumentation to validate quality attributes. All UNKNOWN metrics are intentionally marked (not faked).

## Proof Artifacts Status

### Generated (9/11)
✅ security-gate.json (status: unknown)  
✅ perf.json (status: unknown)  
✅ reliability.json (status: unknown)  
✅ observability.json (status: fail)  
✅ governance.json (status: pass)  
✅ slo-policy-check.json (status: pass)  
✅ catalogue.json  
✅ error_budget_status.json  
✅ ARCHITECTURE_SCORECARD.json  

### Pending (2/11)
⏳ summary.json (requires test execution)  
⏳ rag-eval.json (requires RAG eval harness)

### Validation
✅ **9 PASS, 0 FAIL, 2 SKIP** - All generated artifacts schema-valid

## Dimension Scores (from ARCHITECTURE_SCORECARD.json)

| Dimension | Score | Status | Thresholds Met |
|-----------|-------|--------|----------------|
| D1: Domain correctness | 7.0 | ⚠️ Partial | No |
| D2: Evidence & provenance | 7.5 | ✅ Good | Yes |
| D3: Security | 5.0 | ❌ Weak | No |
| D4: Reliability | 5.0 | ❌ Weak | No |
| D5: Performance | 5.0 | ❌ Weak | No |
| D6: Maintainability | 7.0 | ⚠️ Partial | Yes |
| D7: Testability | 6.5 | ⚠️ Partial | No |
| D8: Observability | 5.0 | ❌ Weak | No |
| D9: Data model fitness | 7.0 | ⚠️ Partial | Yes |
| D10: LLM/RAG quality | 6.0 | ⚠️ Partial | No |
| D11: UX/IA coherence | 6.0 | ⚠️ Partial | No |
| D12: Operational governance | 7.5 | ✅ Good | Yes |

**Overall:** 6.2/10

## Critical Gaps (Cannot Score ≥9/10)

### D3: Security (5.0/10)
**Proof:** test-results/ci/security-gate.json (status: unknown)

**Unknowns:**
- No secret scanning tool (gitleaks/trufflehog)
- No authorization bypass tests
- No dependency vulnerability scanning

**Impact:** Cannot validate security claims, compliance risk

**Recommendation:** Implement security test suite (2-3 days)

### D4: Reliability (5.0/10)
**Proof:** test-results/ci/reliability.json (status: unknown)

**Unknowns:**
- No SLO monitoring
- Ask ISA success rate not tracked
- News pipeline metrics not collected

**Impact:** Cannot validate availability claims, no error budget enforcement

**Recommendation:** Implement SLO monitoring (3-4 days)

### D5: Performance (5.0/10)
**Proof:** test-results/ci/perf.json (status: unknown)

**Unknowns:**
- No performance instrumentation
- p95/p99 latency not measured
- Database query performance not profiled

**Impact:** Cannot validate performance claims, capacity unknown

**Recommendation:** Add tRPC timing middleware + load tests (2-3 days)

### D8: Observability (5.0/10)
**Proof:** test-results/ci/observability.json (status: fail)

**Measured:**
- Logging coverage: 50.2% (threshold: 80%)
- No distributed tracing
- No metrics collection

**Impact:** High MTTR, difficult incident diagnosis

**Recommendation:** Add trace IDs + metrics (3-4 days)

## Strengths (Can Score ≥9/10 with minor improvements)

### D2: Evidence & Provenance (7.5/10)
**Proof:** docs/evidence/_generated/catalogue.json

**Measured:**
- Evidence markers: 145 (threshold: 100+) ✅
- Dataset provenance: 100% ✅
- Contract completeness: 70% ✅

**Path to 9/10:** Increase evidence markers to 200+, validate all markers

### D12: Operational Governance (7.5/10)
**Proof:** test-results/ci/governance.json (status: pass)

**Measured:**
- Validation gates: 6/6 passing ✅
- Evidence markers: 145 ✅
- Contract completeness: 70% ✅
- SLO policy: 9/9 SLOs defined ✅

**Path to 9/10:** Enforce error budget policy in CI, add schema validation to CI

## ATAM Analysis Summary

### Scenarios (12 total)
- ✅ Implemented: 2 (S1.1, S1.2)
- ⚠️ Partial: 7 (S2.1, S2.2, S3.2, S4.2, S5.1, S5.2, S6.1)
- ❌ Unknown: 3 (S3.1, S4.1, S6.2)

**Evidence:** docs/architecture/panel/ATAM_SCENARIOS.md

### Risks (6 total, 2 HIGH)
- **R1 (HIGH):** No performance monitoring
- **R2 (HIGH):** No authorization bypass tests
- **R3 (MEDIUM):** No alerting infrastructure
- **R4 (MEDIUM):** TypeScript compilation errors (290)
- **R5 (MEDIUM):** No secret scanning
- **R6 (LOW):** No load testing

**Evidence:** docs/architecture/panel/ATAM_RISKS_SENSITIVITIES_TRADEOFFS.md

### Risk Themes (3 systemic)
1. **Observability Gaps** - Affects D4, D5, D8
2. **Security Testing Gaps** - Affects D3
3. **Performance Unknowns** - Affects D5

## ISO/IEC 25010 Coverage

**Complete (7/8):**
- Functional Suitability → D1, D10
- Performance Efficiency → D5
- Compatibility → D6, D12
- Usability → D11
- Reliability → D4
- Security → D3
- Maintainability → D6, D7

**Partial (1/8):**
- Portability → D12, D4 (Manus/TiDB lock-in accepted)

**Evidence:** docs/architecture/panel/ISO25010_MAPPING.md

## SLO & Error Budget Status

**SLOs Defined:** 9/9 ✅
- 4 user-facing (Ask ISA, Catalog, Advisory)
- 3 pipeline (News freshness, success rate, catalogue)
- 2 RAG quality (Citation precision, Groundedness)

**Error Budget Status:** UNKNOWN (no telemetry)

**Policy Enforcement:** Not in CI (manual only)

**Evidence:**
- docs/sre/SLO_CATALOG.md
- docs/sre/ERROR_BUDGET_POLICY.md
- docs/sre/_generated/error_budget_status.json

## Architecture SSOT Status

**File:** docs/spec/ESRS_MAPPING/isa-core-architecture.md

**Sections (9/9 complete):**
1. ✅ Core Sources (8 actual files)
2. ✅ System Components (Frontend/Backend/Database/Data)
3. ✅ Core Invariants (5 governance invariants)
4. ✅ Interfaces & Pipelines (API routers, data pipelines)
5. ✅ Governance (Framework + validation gates)
6. ✅ Observability (Logging/tracing/metrics status)
7. ✅ Quality & Testing (Test status, proof artifacts)
8. ✅ References (Canonical docs, contracts, artifacts)

**Broken References:** 0 (all updated to actual repo paths)

## Test Status

**Framework:** Vitest  
**Pass Rate:** 90.1% (517/574 tests)  
**Failures:** 57 (20 flaky, 25 broken, 10 obsolete, 2 environment)  
**TypeScript Errors:** 290 (TanStack Query v5 migration incomplete)

**Evidence:** docs/TEST_FAILURE_TRIAGE.md

## Recommendations (Prioritized)

### Immediate (1-2 weeks)
1. **Implement Security Testing (D3)** - 2-3 days
   - Add gitleaks to CI
   - Create authz bypass test suite (10-20 tests)
   - Add npm audit to CI
   - Target: D3 → 8.0/10

2. **Implement Performance Monitoring (D5)** - 2-3 days
   - Add tRPC timing middleware
   - Implement p95/p99 latency tracking
   - Create load test suite (k6)
   - Target: D5 → 8.0/10

3. **Implement SLO Monitoring (D4)** - 3-4 days
   - Add success rate tracking for Ask ISA
   - Add news pipeline health metrics
   - Implement error budget burn rate calculation
   - Target: D4 → 8.0/10

### Short-Term (2-4 weeks)
4. **Enhance Observability (D8)** - 3-4 days
   - Add distributed tracing (trace IDs)
   - Implement metrics collection (Prometheus/StatsD)
   - Increase logging coverage to 80%+
   - Target: D8 → 8.0/10

5. **Implement RAG Evaluation (D10)** - 3-5 days
   - Create automated eval harness
   - Measure groundedness, citation precision/recall
   - Track cost per query and latency
   - Target: D10 → 8.5/10

6. **Fix TypeScript Errors (D6, D7)** - 3 days
   - Complete TanStack Query v5 migration
   - Fix 290 compilation errors
   - Target: D6 → 8.0/10, D7 → 8.0/10

### Long-Term (1-2 months)
7. **Fix Test Failures** - 5-7 days
   - Fix 25 broken tests
   - Stabilize 20 flaky tests
   - Remove 10 obsolete tests
   - Target: D7 → 9.0/10

8. **Implement Alerting** - 3-5 days
   - Integrate Slack webhooks
   - Add error budget burn rate alerts
   - Implement SLO breach notifications
   - Target: D4 → 9.0/10

## Path to ≥9/10 (Per Dimension)

| Dimension | Current | Target | Effort | Blockers |
|-----------|---------|--------|--------|----------|
| D1 | 7.0 | 9.0 | 2 days | Mapping validation |
| D2 | 7.5 | 9.0 | 1 day | Evidence marker validation |
| D3 | 5.0 | 9.0 | 3 days | Security test suite |
| D4 | 5.0 | 9.0 | 5 days | SLO monitoring + alerting |
| D5 | 5.0 | 9.0 | 4 days | Performance monitoring + load tests |
| D6 | 7.0 | 9.0 | 3 days | TypeScript fixes |
| D7 | 6.5 | 9.0 | 7 days | Test fixes + flake elimination |
| D8 | 5.0 | 9.0 | 4 days | Tracing + metrics |
| D9 | 7.0 | 9.0 | 2 days | Schema validation |
| D10 | 6.0 | 9.0 | 5 days | RAG eval harness |
| D11 | 6.0 | 9.0 | 3 days | Accessibility testing |
| D12 | 7.5 | 9.0 | 1 day | CI enforcement |

**Total Effort:** 40-45 days (6-7 weeks with 1 developer)

## Decision Points

### Tradeoff: RAG Latency vs Citation Quality (TP1)
**Current Decision:** Optimize for latency (p95 < 3000ms)  
**Evidence:** docs/sre/SLO_CATALOG.md (UF-1)  
**Status:** ✅ Documented, no change needed

### Tradeoff: Test Coverage vs Build Speed (TP2)
**Current Decision:** Hybrid (unit on PR, integration on merge)  
**Evidence:** .github/workflows/ci.yml  
**Status:** ✅ Documented, no change needed

### Tradeoff: Governance Rigor vs Velocity (TP3)
**Current Decision:** Strict governance (Lane C review required)  
**Evidence:** docs/governance/_root/ISA_GOVERNANCE.md  
**Status:** ✅ Documented, no change needed

### Tradeoff: Manus Lock-In vs Portability (TP4)
**Current Decision:** Optimize for Manus (portability not required for MVP)  
**Evidence:** docs/architecture/panel/ISO25010_MAPPING.md  
**Status:** ✅ Documented, accepted limitation

## Governance Compliance

**Canonical Docs Allowlist:** ✅ PASSING  
**Reference Index:** ✅ Generated (629 paths)  
**Doc-Code Validator:** ❌ FAIL (578 broken refs - expected)  
**Schema Validation:** ✅ PASSING (9/9 artifacts valid)

**Evidence:**
- config/governance/canonical_docs_allowlist.json
- scripts/gates/canonical-docs-allowlist.sh
- scripts/gates/validate-proof-artifacts.sh

## Next Steps

1. **Assign Dimension Owners** (5 required, 4 optional)
   - Domain Architect (D1)
   - Data Architect/Governance (D2, D9)
   - Security Architect (D3)
   - RAG/LLM Architect (D10)
   - Principal Software Architect (D6, D12)

2. **Schedule ATAM Session** to validate scenarios and resolve tradeoffs

3. **Implement Priority 1-3 Recommendations** (security, performance, reliability)

4. **Re-score After Instrumentation** (target: 8.0/10 overall)

5. **Final Architecture Review** (target: ≥9/10 across all dimensions)

---

**Review Status:** BASELINE COMPLETE  
**Overall Score:** 6.2/10  
**Target Score:** ≥9/10  
**Estimated Effort:** 40-45 days  
**Framework:** Repo-Tight v5  
**Evidence:** All claims backed by schema-valid proof artifacts
