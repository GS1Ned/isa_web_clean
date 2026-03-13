---
DOC_TYPE: ATAM_ARTIFACT
ARTIFACT_TYPE: RISKS_SENSITIVITIES_TRADEOFFS
STATUS: final
CREATED: 2026-02-12
LAST_UPDATED: 2026-02-12
---

# ISA ATAM Risks, Sensitivity Points, and Tradeoff Points

## Purpose

Document architectural risks, sensitivity points (small changes → big impact), and tradeoff points (decisions forcing quality attribute compromises) identified during ATAM evaluation.

---

## Risks (Ranked by Impact × Likelihood)

### R1: No Performance Monitoring (HIGH)
**Impact:** HIGH | **Likelihood:** HIGH | **Affected Scenarios:** S2.1, S4.1, S4.2

**Description:** ISA has no latency monitoring, load testing, or performance profiling infrastructure. Cannot detect performance degradation or validate SLOs.

**Evidence:**
- `test-results/ci/perf.json` status: unknown
- No instrumentation in tRPC routers
- No APM tool integration

**Consequences:**
- Cannot validate p95/p99 latency claims
- Performance regressions undetected until user complaints
- SLO breaches invisible

**Mitigation Options:**
1. Add tRPC middleware for request timing
2. Integrate APM tool (DataDog, New Relic)
3. Implement synthetic monitoring

**Owner:** Performance Engineer (optional role)

---

### R2: No Authorization Bypass Tests (HIGH)
**Impact:** HIGH | **Likelihood:** MEDIUM | **Affected Scenarios:** S3.1

**Description:** ISA has no automated tests verifying authorization boundaries. Admin-only operations may be accessible to non-admin users.

**Evidence:**
- `test-results/ci/security-gate.json` authz_tests: false
- No tests in `server/**/*.test.ts` checking role enforcement
- Manus OAuth integration not independently tested

**Consequences:**
- Unauthorized data ingestion possible
- Unauthorized advisory generation possible
- Compliance violations (GDPR, SOC2)

**Mitigation Options:**
1. Add authz test suite (10-20 tests covering all admin endpoints)
2. Implement role-based test fixtures
3. Add CI gate blocking deployment if authz tests fail

**Owner:** Security Architect

---

### R3: No Alerting Infrastructure (MEDIUM)
**Impact:** MEDIUM | **Likelihood:** HIGH | **Affected Scenarios:** S2.2, S6.2

**Description:** ISA has no alerting for SLO breaches, pipeline failures, or quality degradation. Incidents discovered reactively.

**Evidence:**
- No PagerDuty/Slack integration
- No alert definitions in codebase
- Error budget policy exists but not enforced

**Consequences:**
- High MTTR (mean time to resolution)
- SLO breaches unnoticed
- User-reported incidents only

**Mitigation Options:**
1. Integrate Slack webhooks for critical errors
2. Add CloudWatch alarms (if on AWS)
3. Implement error budget burn rate alerts

**Owner:** SRE/Platform Architect (optional role)

---

### R4: TypeScript Compilation Errors Block Testing (MEDIUM)
**Impact:** MEDIUM | **Likelihood:** HIGH | **Affected Scenarios:** S5.2

**Description:** 290 TypeScript errors prevent compilation, blocking test execution and deployment.

**Evidence:**
- `pnpm tsc` fails with 290 errors
- Root cause: incomplete TanStack Query v5 migration
- Documented in `docs/TEST_FAILURE_TRIAGE.md`

**Consequences:**
- Cannot run full test suite
- Breaking changes undetected
- CI pipeline unreliable

**Mitigation Options:**
1. Complete TanStack Query v5 migration (3-day sprint)
2. Add `skipLibCheck: true` temporarily (technical debt)
3. Downgrade to TanStack Query v4

**Owner:** Principal Software Architect

---

### R5: No Secret Scanning (MEDIUM)
**Impact:** HIGH | **Likelihood:** LOW | **Affected Scenarios:** S3.2

**Description:** ISA has no automated secret scanning. Credentials may be committed to Git.

**Evidence:**
- `test-results/ci/security-gate.json` secret_scan: false
- No gitleaks/trufflehog in CI
- Manual code review only

**Consequences:**
- Credentials leaked to Git history
- Compliance violations
- Security incidents

**Mitigation Options:**
1. Add gitleaks to CI (pre-commit + PR checks)
2. Scan Git history for existing secrets
3. Rotate all credentials if leaks found

**Owner:** Security Architect

---

### R6: No Load Testing (LOW)
**Impact:** MEDIUM | **Likelihood:** MEDIUM | **Affected Scenarios:** S2.1, S4.1

**Description:** ISA has never been load tested. Capacity limits unknown.

**Evidence:**
- No k6/Artillery/Locust scripts
- No load test results
- Concurrent user capacity unknown

**Consequences:**
- Production outages under unexpected load
- Cannot validate scalability claims
- No capacity planning data

**Mitigation Options:**
1. Add k6 load test suite (10 scenarios)
2. Run load tests in staging monthly
3. Document capacity limits in SLO catalog

**Owner:** Performance Engineer (optional role)

---

## Sensitivity Points (Small Change → Big Impact)

### SP1: OpenAI API Rate Limits
**Affected Scenarios:** S2.1, S4.2

**Description:** ISA is highly sensitive to OpenAI API rate limits. Small increase in query volume can trigger cascading failures.

**Evidence:**
- No rate limit handling in `server/embedding.ts`
- No exponential backoff
- No circuit breaker

**Impact:**
- 10% increase in Ask ISA traffic → 100% failure rate
- Advisory generation fails unpredictably

**Mitigation:**
- Add rate limit detection + exponential backoff
- Implement request queuing
- Add circuit breaker pattern

---

### SP2: Database Connection Pool Size
**Affected Scenarios:** S4.1, S2.1

**Description:** ISA is sensitive to database connection pool exhaustion. Small increase in concurrent queries can cause timeouts.

**Evidence:**
- Connection pool size not documented
- No connection pool monitoring
- No graceful degradation

**Impact:**
- 20% increase in concurrent users → query timeouts
- Cascading failures across all endpoints

**Mitigation:**
- Document connection pool configuration
- Add connection pool metrics
- Implement connection pool auto-scaling

---

### SP3: Evidence Marker Format Changes
**Affected Scenarios:** S1.1, S5.1

**Description:** ISA governance relies on evidence marker format. Small format change breaks validation gates.

**Evidence:**
- Evidence markers parsed by regex in `scripts/refactor/semantic_validator.py`
- No schema validation
- No migration path for format changes

**Impact:**
- Format change → 145 markers invalid
- Governance gates fail
- Deployment blocked

**Mitigation:**
- Add evidence marker schema
- Implement format migration tool
- Version evidence marker format

---

## Tradeoff Points (Quality Attribute Conflicts)

### TP1: RAG Latency vs. Citation Quality
**Affected Scenarios:** S2.1, S1.1

**Tradeoff:** Lower latency (faster responses) vs. Higher citation quality (more accurate sources)

**Decision Alternatives:**

**Option A: Optimize for Latency**
- Use smaller embedding model (text-embedding-3-small → ada-002)
- Reduce retrieved context window (10 chunks → 5 chunks)
- Cache frequent queries aggressively

**Pros:**
- p95 latency < 2000ms (vs. current 3000ms target)
- Lower OpenAI costs
- Better user experience

**Cons:**
- Citation recall drops (fewer relevant sources retrieved)
- Groundedness may decrease
- Cache invalidation complexity

**Option B: Optimize for Citation Quality**
- Use larger embedding model (text-embedding-3-large)
- Increase retrieved context window (10 chunks → 20 chunks)
- Implement re-ranking stage

**Pros:**
- Higher citation precision/recall
- Better groundedness
- More comprehensive answers

**Cons:**
- p95 latency > 4000ms
- Higher OpenAI costs ($0.15/query vs. $0.05/query)
- Worse user experience

**Current Decision:** Option A (optimize for latency)  
**Rationale:** User experience prioritized over marginal citation quality gains  
**Evidence:** `docs/sre/SLO_CATALOG.md` (UF-1: p95 < 3000ms)

---

### TP2: Test Coverage vs. Build Speed
**Affected Scenarios:** S5.2, S5.1

**Tradeoff:** Higher test coverage (catch more bugs) vs. Faster CI builds (faster feedback)

**Decision Alternatives:**

**Option A: Maximize Coverage**
- Run all 574 tests on every PR
- Add integration tests for all tRPC routers
- Add E2E tests for critical user journeys

**Pros:**
- Catch more regressions
- Higher confidence in deployments
- Better documentation via tests

**Cons:**
- CI runtime > 15 minutes
- Flaky tests block PRs
- Developer frustration

**Option B: Optimize for Speed**
- Run only unit tests on PR (integration tests on merge)
- Parallelize test execution
- Skip slow tests in PR checks

**Pros:**
- CI runtime < 5 minutes
- Faster developer feedback
- Fewer flaky test blocks

**Cons:**
- Integration bugs reach main branch
- Lower confidence in PR checks
- Regressions discovered later

**Current Decision:** Hybrid (unit tests on PR, integration on merge)  
**Rationale:** Balance speed and coverage  
**Evidence:** `.github/workflows/ci.yml` (separate unit/integration jobs)

---

### TP3: Governance Rigor vs. Development Velocity
**Affected Scenarios:** S5.1, S1.2

**Tradeoff:** Strict governance (high quality) vs. Fast iteration (quick features)

**Decision Alternatives:**

**Option A: Strict Governance**
- All changes require governance self-check
- Evidence markers mandatory for all decisions
- 6/6 validation gates must pass before merge

**Pros:**
- High traceability
- Audit-ready
- Prevents technical debt accumulation

**Cons:**
- Slower feature delivery
- Developer overhead
- Governance fatigue

**Option B: Lightweight Governance**
- Governance checks only for critical changes
- Evidence markers optional
- Validation gates advisory only

**Pros:**
- Faster feature delivery
- Lower developer overhead
- More experimentation

**Cons:**
- Lower traceability
- Technical debt accumulation
- Audit gaps

**Current Decision:** Option A (strict governance)  
**Rationale:** ISA is compliance-focused; traceability is critical  
**Evidence:** `docs/governance/_root/ISA_GOVERNANCE.md`

---

### TP4: Manus Hosting Lock-In vs. Portability
**Affected Scenarios:** S5.1

**Tradeoff:** Manus-specific optimizations (better performance) vs. Cloud-agnostic design (portability)

**Decision Alternatives:**

**Option A: Optimize for Manus**
- Use Manus-specific APIs
- Tight integration with Manus OAuth
- Manus-specific deployment scripts

**Pros:**
- Better performance
- Simpler deployment
- Lower operational overhead

**Cons:**
- Vendor lock-in
- Migration cost if switching providers
- Limited multi-cloud options

**Option B: Cloud-Agnostic Design**
- Abstract hosting provider behind interfaces
- Use standard OAuth (not Manus-specific)
- Containerize for portability

**Pros:**
- Easy migration to AWS/GCP/Azure
- Multi-cloud deployment possible
- Vendor negotiation leverage

**Cons:**
- Higher complexity
- Performance overhead from abstractions
- More operational burden

**Current Decision:** Option A (optimize for Manus)  
**Rationale:** ISA is internal tool; portability not required for MVP  
**Evidence:** `docs/architecture/panel/ISO25010_MAPPING.md` (portability marked as accepted limitation)

---

## Risk Themes (Systemic Issues)

### Theme 1: Observability Gaps
**Related Risks:** R3, R6  
**Related Sensitivity Points:** SP1, SP2

**Description:** ISA lacks comprehensive observability infrastructure (monitoring, alerting, tracing, profiling). Cannot validate SLOs or diagnose incidents effectively.

**Systemic Impact:**
- Multiple quality attributes affected (reliability, performance, observability)
- High MTTR across all incident types
- Cannot achieve ≥9/10 on D4, D5, D8 without addressing

**Recommended Action:**
- Hire/assign SRE/Platform Architect
- Implement observability stack (APM + alerting + dashboards)
- Budget 2-3 sprints for instrumentation

---

### Theme 2: Security Testing Gaps
**Related Risks:** R2, R5  
**Related Tradeoff Points:** TP3

**Description:** ISA has minimal automated security testing. Relies on manual code review and governance discipline.

**Systemic Impact:**
- Cannot achieve ≥9/10 on D3 without automated tests
- Compliance risk (GDPR, SOC2)
- Incident response reactive only

**Recommended Action:**
- Hire/assign Security Architect
- Implement security test suite (authz, secret scanning, dependency scanning)
- Add security gates to CI

---

### Theme 3: Performance Unknowns
**Related Risks:** R1, R6  
**Related Sensitivity Points:** SP1, SP2  
**Related Tradeoff Points:** TP1

**Description:** ISA has no performance baseline. Capacity limits, latency distributions, and scalability characteristics unknown.

**Systemic Impact:**
- Cannot validate SLOs
- Cannot achieve ≥9/10 on D5 without measurement
- Production incidents likely under load

**Recommended Action:**
- Hire/assign Performance Engineer
- Implement performance monitoring + load testing
- Establish performance baselines

---

## Summary

| Category | Count | High Priority |
|----------|-------|---------------|
| Risks | 6 | 2 (R1, R2) |
| Sensitivity Points | 3 | 2 (SP1, SP2) |
| Tradeoff Points | 4 | 2 (TP1, TP3) |
| Risk Themes | 3 | 3 (all) |

**Critical Path to ≥9/10:**
1. Address Theme 1 (Observability) → enables D4, D5, D8
2. Address Theme 2 (Security) → enables D3
3. Resolve R4 (TypeScript errors) → enables D7
4. Document tradeoff decisions → enables D6, D12

---

**Status:** FINAL  
**Owner:** Architecture Panel  
**Last Updated:** 2026-02-12
