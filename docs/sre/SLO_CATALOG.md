---
DOC_TYPE: SRE_ARTIFACT
ARTIFACT_TYPE: SLO_CATALOG
STATUS: draft
CREATED: 2026-02-12
FRAMEWORK: Google SRE Workbook
---

# ISA SLO Catalog

## Purpose

Define Service Level Indicators (SLIs), Service Level Objectives (SLOs), and error budgets for ISA's critical user journeys and pipelines.

## SLO Framework

**SLI:** Service Level Indicator (measurable metric)  
**SLO:** Service Level Objective (target value for SLI)  
**Error Budget:** Allowed failure rate derived from SLO (1 - SLO)

**Example:** 99.5% availability SLO → 0.5% error budget → ~3.6 hours downtime/month

---

## User-Facing SLOs

### UF-1: Ask ISA Query Latency
**User Journey:** User submits RAG query and receives answer with citations

**SLI:** p95 latency from query submission to response render  
**SLO:** p95 < 3000ms  
**Measurement Window:** 28 days  
**Error Budget:** 5% of queries may exceed 3000ms  

**Measurement Method:**
- **Source:** `server/services/rag-tracing/trace-logger.ts`
- **Metric:** `rag_query_duration_ms` (p95 aggregation)
- **Proof Artifact:** `test-results/ci/rag-eval.json` (p95_latency_ms field)

**Thresholds:**
- ✅ GOOD: p95 < 2500ms
- ⚠️ ACCEPTABLE: p95 < 3000ms
- ❌ BREACH: p95 ≥ 3000ms

---

### UF-2: Ask ISA Availability
**User Journey:** User accesses Ask ISA page and submits query

**SLI:** Fraction of successful query responses (HTTP 200, valid JSON)  
**SLO:** 99.5% success rate  
**Measurement Window:** 28 days  
**Error Budget:** 0.5% of queries may fail  

**Measurement Method:**
- **Source:** tRPC error logs + HTTP access logs
- **Metric:** `(successful_queries / total_queries) * 100`
- **Proof Artifact:** `test-results/ci/reliability.json` (ask_isa_success_rate field)

**Thresholds:**
- ✅ GOOD: ≥ 99.9%
- ⚠️ ACCEPTABLE: ≥ 99.5%
- ❌ BREACH: < 99.5%

---

### UF-3: Catalog Query Latency
**User Journey:** User filters/searches regulations or standards

**SLI:** p95 latency from filter action to results render  
**SLO:** p95 < 500ms  
**Measurement Window:** 28 days  
**Error Budget:** 5% of queries may exceed 500ms  

**Measurement Method:**
- **Source:** tRPC router timing middleware
- **Metric:** `catalog_query_duration_ms` (p95 aggregation)
- **Proof Artifact:** `test-results/ci/perf.json` (catalog_p95_latency_ms field)

**Thresholds:**
- ✅ GOOD: p95 < 400ms
- ⚠️ ACCEPTABLE: p95 < 500ms
- ❌ BREACH: p95 ≥ 500ms

---

### UF-4: Advisory Report Generation
**User Journey:** Admin generates new advisory version

**SLI:** Time from generation trigger to completion  
**SLO:** < 600 seconds (10 minutes)  
**Measurement Window:** Per execution  
**Error Budget:** N/A (deterministic operation)  

**Measurement Method:**
- **Source:** Advisory generation script logs
- **Metric:** `advisory_generation_duration_s`
- **Proof Artifact:** `test-results/ci/advisory-gen.json` (duration_s field)

**Thresholds:**
- ✅ GOOD: < 480s (8 min)
- ⚠️ ACCEPTABLE: < 600s (10 min)
- ❌ BREACH: ≥ 600s

---

## Pipeline SLOs

### P-1: News Pipeline Freshness
**Pipeline:** News scraping and ingestion

**SLI:** Time since last successful news ingestion  
**SLO:** < 24 hours  
**Measurement Window:** Continuous  
**Error Budget:** 1% of time may exceed 24h (7.2 hours/month)  

**Measurement Method:**
- **Source:** `server/news-pipeline-status.ts`
- **Metric:** `max(now - last_successful_ingestion_timestamp)` across all sources
- **Proof Artifact:** `test-results/ci/pipeline-health.json` (news_freshness_hours field)

**Thresholds:**
- ✅ GOOD: < 12 hours
- ⚠️ ACCEPTABLE: < 24 hours
- ❌ BREACH: ≥ 24 hours

---

### P-2: News Pipeline Success Rate
**Pipeline:** News scraping and ingestion

**SLI:** Fraction of successful scraper runs  
**SLO:** 95% success rate  
**Measurement Window:** 28 days  
**Error Budget:** 5% of runs may fail  

**Measurement Method:**
- **Source:** `server/news-pipeline-status.ts`
- **Metric:** `(successful_runs / total_runs) * 100`
- **Proof Artifact:** `test-results/ci/pipeline-health.json` (news_success_rate field)

**Thresholds:**
- ✅ GOOD: ≥ 98%
- ⚠️ ACCEPTABLE: ≥ 95%
- ❌ BREACH: < 95%

---

### P-3: Evidence Catalogue Freshness
**Pipeline:** Evidence catalogue generation

**SLI:** Time since last catalogue generation  
**SLO:** < 7 days  
**Measurement Window:** Continuous  
**Error Budget:** N/A (scheduled operation)  

**Measurement Method:**
- **Source:** `docs/evidence/_generated/catalogue.json` (timestamp field)
- **Metric:** `now - catalogue.timestamp`
- **Proof Artifact:** `test-results/ci/governance.json` (catalogue_freshness_days field)

**Thresholds:**
- ✅ GOOD: < 3 days
- ⚠️ ACCEPTABLE: < 7 days
- ❌ BREACH: ≥ 7 days

---

## RAG Quality SLOs

### RQ-1: Citation Precision
**Quality Attribute:** RAG responses must cite accurate sources

**SLI:** Fraction of citations that correctly reference source content  
**SLO:** ≥ 0.90 (90%)  
**Measurement Window:** Per evaluation run (30 queries)  
**Error Budget:** 10% of citations may be imprecise  

**Measurement Method:**
- **Source:** `server/evaluation/rag-eval-harness.ts`
- **Metric:** `citation_precision` (manual evaluation)
- **Proof Artifact:** `test-results/ci/rag-eval.json` (citation_precision field)

**Thresholds:**
- ✅ GOOD: ≥ 0.95
- ⚠️ ACCEPTABLE: ≥ 0.90
- ❌ BREACH: < 0.90

---

### RQ-2: Groundedness
**Quality Attribute:** RAG responses must be grounded in source documents

**SLI:** Fraction of answers with all claims supported by retrieved context  
**SLO:** ≥ 0.85 (85%)  
**Measurement Window:** Per evaluation run (30 queries)  
**Error Budget:** 15% of answers may contain unsupported claims  

**Measurement Method:**
- **Source:** `server/evaluation/rag-eval-harness.ts`
- **Metric:** `groundedness` (LLM-as-judge evaluation)
- **Proof Artifact:** `test-results/ci/rag-eval.json` (groundedness field)

**Thresholds:**
- ✅ GOOD: ≥ 0.90
- ⚠️ ACCEPTABLE: ≥ 0.85
- ❌ BREACH: < 0.85

---

## SLO Summary Table

| ID | SLO Name | SLI | Target | Error Budget | Measurement |
|----|----------|-----|--------|--------------|-------------|
| UF-1 | Ask ISA Latency | p95 latency | < 3000ms | 5% | 28 days |
| UF-2 | Ask ISA Availability | Success rate | ≥ 99.5% | 0.5% | 28 days |
| UF-3 | Catalog Latency | p95 latency | < 500ms | 5% | 28 days |
| UF-4 | Advisory Generation | Duration | < 600s | N/A | Per run |
| P-1 | News Freshness | Staleness | < 24h | 1% | Continuous |
| P-2 | News Success Rate | Success rate | ≥ 95% | 5% | 28 days |
| P-3 | Catalogue Freshness | Staleness | < 7 days | N/A | Continuous |
| RQ-1 | Citation Precision | Precision | ≥ 0.90 | 10% | Per eval |
| RQ-2 | Groundedness | Groundedness | ≥ 0.85 | 15% | Per eval |

---

## Error Budget Policy

See [ERROR_BUDGET_POLICY.md](./ERROR_BUDGET_POLICY.md) for actions when error budgets are exhausted.

---

## Validation Checklist

- [ ] All critical user journeys have SLOs
- [ ] All SLIs are measurable from existing instrumentation
- [ ] All SLOs have proof artifacts defined
- [ ] Error budget policy exists and is enforced
- [ ] CI gates validate SLO compliance

---

**Status:** DRAFT - Requires instrumentation implementation  
**Owner:** SRE/Platform Architect  
**Next Review:** TBD
