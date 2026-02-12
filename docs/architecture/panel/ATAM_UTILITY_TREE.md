---
DOC_TYPE: ATAM_ARTIFACT
ARTIFACT_TYPE: UTILITY_TREE
STATUS: draft
CREATED: 2026-02-12
LAST_UPDATED: 2026-02-12
---

# ISA ATAM Utility Tree

## Purpose

The Utility Tree captures ISA's quality attribute priorities as concrete scenarios with business value and technical risk ratings.

## Quality Attributes (Top Level)

### 1. Correctness (Domain & Data)
**Business Value:** CRITICAL  
**Technical Risk:** HIGH

#### Scenarios
- **S1.1:** Regulation-to-standard mappings must be traceable to source documents
  - **Stimulus:** User queries "Which GS1 standards support CSRD Article 19a?"
  - **Response:** System returns mappings with citations to CSRD text + GS1 specs
  - **Measure:** 100% of mappings have valid source citations
  - **Priority:** (H, H)

- **S1.2:** ESRS datapoint definitions must match EFRAG IG3 exactly
  - **Stimulus:** Data ingestion from EFRAG IG3 v1.1
  - **Response:** All 1,184 datapoints loaded with checksums verified
  - **Measure:** SHA256 match + 0 schema violations
  - **Priority:** (H, M)

### 2. Reliability (Availability & Resilience)
**Business Value:** HIGH  
**Technical Risk:** MEDIUM

#### Scenarios
- **S2.1:** Ask ISA must respond within SLO even under load
  - **Stimulus:** 50 concurrent RAG queries
  - **Response:** p95 latency < 3s, 0 timeouts
  - **Measure:** SLO compliance 99.5%
  - **Priority:** (H, M)

- **S2.2:** News pipeline failures must not block user access
  - **Stimulus:** EUR-Lex scraper fails for 24h
  - **Response:** Stale data served with freshness warning
  - **Measure:** 0 user-facing errors
  - **Priority:** (M, L)

### 3. Security (AuthN/AuthZ & Data Protection)
**Business Value:** HIGH  
**Technical Risk:** MEDIUM

#### Scenarios
- **S3.1:** Admin operations must require explicit authorization
  - **Stimulus:** Non-admin user attempts data ingestion
  - **Response:** 403 Forbidden with audit log entry
  - **Measure:** 0 authz bypasses in penetration test
  - **Priority:** (H, M)

- **S3.2:** No secrets in logs or error messages
  - **Stimulus:** Database connection failure
  - **Response:** Generic error, credentials redacted
  - **Measure:** 0 secret leaks in log audit
  - **Priority:** (H, L)

### 4. Performance (Latency & Throughput)
**Business Value:** MEDIUM  
**Technical Risk:** MEDIUM

#### Scenarios
- **S4.1:** Catalog queries must be interactive
  - **Stimulus:** User filters 38 regulations by category
  - **Response:** Results render in < 500ms
  - **Measure:** p95 < 500ms, p99 < 1s
  - **Priority:** (M, M)

- **S4.2:** Advisory generation must complete within budget
  - **Stimulus:** Generate advisory v1.2 (450 mappings)
  - **Response:** Complete in < 10 minutes
  - **Measure:** Duration < 600s
  - **Priority:** (M, H)

### 5. Maintainability (Evolvability & Testability)
**Business Value:** MEDIUM  
**Technical Risk:** HIGH

#### Scenarios
- **S5.1:** New data sources must integrate without breaking existing flows
  - **Stimulus:** Add EFRAG IG4 ingestion
  - **Response:** Existing IG3 queries unaffected
  - **Measure:** 0 regression test failures
  - **Priority:** (M, H)

- **S5.2:** Test suite must catch breaking changes before deployment
  - **Stimulus:** Modify tRPC router signature
  - **Response:** CI fails with clear error
  - **Measure:** 100% of breaking changes caught
  - **Priority:** (M, M)

### 6. Observability (Debuggability & Monitoring)
**Business Value:** MEDIUM  
**Technical Risk:** MEDIUM

#### Scenarios
- **S6.1:** Pipeline failures must be diagnosable from logs
  - **Stimulus:** News scraper fails with HTTP 429
  - **Response:** Logs show rate limit + retry schedule
  - **Measure:** MTTR < 1 hour
  - **Priority:** (M, M)

- **S6.2:** RAG quality degradation must trigger alerts
  - **Stimulus:** Citation precision drops below 0.8
  - **Response:** Alert sent to on-call within 5 minutes
  - **Measure:** Alert latency < 5 min
  - **Priority:** (M, L)

## Scenario Prioritization

| Priority | Business Value | Technical Risk | Count |
|----------|---------------|----------------|-------|
| (H, H) | High | High | 1 |
| (H, M) | High | Medium | 3 |
| (H, L) | High | Low | 1 |
| (M, H) | Medium | High | 2 |
| (M, M) | Medium | Medium | 4 |
| (M, L) | Medium | Low | 1 |

## Next Steps

1. Validate scenarios with stakeholders
2. Map scenarios to architecture decisions
3. Identify sensitivity points and tradeoffs
4. Document risks in ATAM_RISKS_SENSITIVITIES_TRADEOFFS.md

---

**Status:** DRAFT - Requires stakeholder validation  
**Owner:** Architecture Panel  
**Next Review:** TBD
