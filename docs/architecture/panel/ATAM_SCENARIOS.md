---
DOC_TYPE: ATAM_ARTIFACT
ARTIFACT_TYPE: SCENARIOS
STATUS: final
CREATED: 2026-02-12
LAST_UPDATED: 2026-02-12
---

# ISA ATAM Quality Attribute Scenarios

## Purpose

Detailed quality attribute scenarios for ISA architecture evaluation, following ATAM format: Stimulus → Environment → Response → Response Measure.

---

## S1.1: Regulation-to-Standard Mapping Traceability

**Quality Attribute:** Domain Correctness  
**Priority:** (High, High)

**Stimulus:** User queries "Which GS1 standards support CSRD Article 19a?"

**Environment:** Production system with 38 regulations, 60+ standards, 450+ mappings loaded

**Response:** System returns list of relevant GS1 standards with:
- Direct citations to CSRD Article 19a text (EUR-Lex URL + paragraph)
- Citations to GS1 standard specifications (document + section)
- Mapping confidence score
- Last verification date

**Response Measure:**
- 100% of returned mappings have valid source citations
- Citation links resolve to actual documents (no 404s)
- Response time < 2 seconds

**Evidence:**
- Implementation: `server/gs1-mapping-engine.ts`
- Data: `data/advisories/advisory_v1.1.json` (450+ mappings with citations)
- Test: Manual verification of 30 sample mappings (2024-12-10)

---

## S1.2: ESRS Datapoint Definition Integrity

**Quality Attribute:** Domain Correctness  
**Priority:** (High, Medium)

**Stimulus:** Data ingestion from EFRAG IG3 v1.1

**Environment:** Fresh database, EFRAG IG3 Excel file available

**Response:** System ingests all 1,184 ESRS datapoints with:
- Exact field mappings (code, label, description, data type)
- SHA256 checksum verification
- Schema validation (no type mismatches)
- Provenance metadata (source, version, date)

**Response Measure:**
- 1,184 datapoints loaded (0 missing, 0 duplicates)
- SHA256 checksum matches EFRAG published hash
- 0 schema validation errors
- Ingestion completes in < 60 seconds

**Evidence:**
- Implementation: `server/ingest/INGEST-03_esrs_datapoints.ts`
- Data: `data/efrag/esrs_datapoints_efrag_ig3.json`
- Checksum: `data/metadata/dataset_registry.json` (SHA256 recorded)

---

## S2.1: Ask ISA Latency Under Load

**Quality Attribute:** Reliability  
**Priority:** (High, Medium)

**Stimulus:** 50 concurrent RAG queries submitted within 10 seconds

**Environment:** Production system, OpenAI API available, database warm

**Response:** System processes all queries with:
- p95 latency < 3000ms
- p99 latency < 5000ms
- 0 timeout errors
- 0 rate limit errors

**Response Measure:**
- 50/50 queries complete successfully
- p95 latency measured and logged
- Error budget consumption < 5%

**Evidence:**
- SLO: `docs/sre/SLO_CATALOG.md` (UF-1)
- Implementation: `server/services/rag-tracing/trace-logger.ts`
- Status: UNKNOWN (no load testing infrastructure)

---

## S2.2: News Pipeline Graceful Degradation

**Quality Attribute:** Reliability  
**Priority:** (Medium, Low)

**Stimulus:** EUR-Lex scraper fails for 24 hours (HTTP 503)

**Environment:** Production system, 6/7 news sources operational

**Response:** System continues serving news with:
- Stale EUR-Lex data served with freshness warning
- Other 6 sources continue updating
- No user-facing errors
- Admin alert sent after 12 hours

**Response Measure:**
- 0 HTTP 500 errors on news endpoints
- Freshness warning displayed on UI
- Alert delivered within 15 minutes of 12-hour threshold

**Evidence:**
- Implementation: `server/news-pipeline-status.ts`
- SLO: `docs/sre/SLO_CATALOG.md` (P-1, P-2)
- Status: Partial (no alerting infrastructure)

---

## S3.1: Authorization Bypass Prevention

**Quality Attribute:** Security  
**Priority:** (High, Medium)

**Stimulus:** Non-admin user attempts to trigger data ingestion via API

**Environment:** Production system, user authenticated via Manus OAuth with "member" role

**Response:** System rejects request with:
- HTTP 403 Forbidden
- Audit log entry (user ID, timestamp, attempted action)
- No data modification
- No sensitive information in error message

**Response Measure:**
- 0 successful authz bypasses in penetration test
- Audit log entry created within 1 second
- Error message contains no credentials or internal paths

**Evidence:**
- Implementation: `server/_core/auth.ts`
- Status: UNKNOWN (no authz bypass tests exist)

---

## S3.2: Secret Leak Prevention

**Quality Attribute:** Security  
**Priority:** (High, Low)

**Stimulus:** Database connection failure during query execution

**Environment:** Production system, TiDB unavailable

**Response:** System logs error with:
- Generic error message to user ("Database temporarily unavailable")
- Detailed error to server logs with credentials redacted
- No DATABASE_URL in logs
- No OpenAI API key in logs

**Response Measure:**
- 0 secrets found in log audit (manual review of 1000 log lines)
- User error message contains no connection strings
- Server logs show "[REDACTED]" for sensitive fields

**Evidence:**
- Implementation: `server/_core/logger-wiring.ts`
- Status: Partial (manual log review, no automated scanning)

---

## S4.1: Catalog Query Interactivity

**Quality Attribute:** Performance  
**Priority:** (Medium, Medium)

**Stimulus:** User applies category filter to 38 regulations

**Environment:** Production system, database warm, no concurrent load

**Response:** System returns filtered results with:
- Results rendered in < 500ms (p95)
- Results rendered in < 1000ms (p99)
- Smooth UI transition (no jank)

**Response Measure:**
- p95 latency < 500ms
- p99 latency < 1000ms
- Lighthouse performance score > 90

**Evidence:**
- SLO: `docs/sre/SLO_CATALOG.md` (UF-3)
- Implementation: `server/routers/catalog.ts`
- Status: UNKNOWN (no performance monitoring)

---

## S4.2: Advisory Generation Time Budget

**Quality Attribute:** Performance  
**Priority:** (Medium, High)

**Stimulus:** Admin triggers advisory v1.2 generation (450 mappings)

**Environment:** Production system, OpenAI API available

**Response:** System completes generation with:
- Total duration < 600 seconds (10 minutes)
- Progress updates every 30 seconds
- Resumable on failure

**Response Measure:**
- Duration logged and < 600s
- 0 timeouts
- Advisory file written with valid JSON

**Evidence:**
- SLO: `docs/sre/SLO_CATALOG.md` (UF-4)
- Implementation: `scripts/advisory/generate_advisory_v1.py`
- Status: Partial (duration logged, no timeout handling)

---

## S5.1: Data Source Addition Without Regression

**Quality Attribute:** Maintainability  
**Priority:** (Medium, High)

**Stimulus:** Developer adds EFRAG IG4 ingestion script

**Environment:** Development branch, existing IG3 ingestion operational

**Response:** System integrates new source with:
- 0 regression test failures
- Existing IG3 queries return same results
- New IG4 data accessible via separate endpoint
- Database migration reversible

**Response Measure:**
- 517/517 existing tests pass
- IG3 query results unchanged (hash comparison)
- Migration rollback tested successfully

**Evidence:**
- Test suite: `pnpm test`
- Migration: `drizzle/migrations/`
- Status: Partial (no hash comparison of query results)

---

## S5.2: Breaking Change Detection

**Quality Attribute:** Maintainability  
**Priority:** (Medium, Medium)

**Stimulus:** Developer modifies tRPC router signature (removes required field)

**Environment:** CI pipeline, pull request submitted

**Response:** CI fails with:
- TypeScript compilation error
- Clear error message indicating breaking change
- Link to affected client code
- Suggestion to use deprecation pattern

**Response Measure:**
- CI fails within 5 minutes
- Error message identifies exact breaking change
- 100% of breaking changes caught (no false negatives)

**Evidence:**
- CI: `.github/workflows/ci.yml`
- TypeScript: `tsconfig.json` (strict mode)
- Status: Partial (TypeScript catches type errors, no deprecation guidance)

---

## S6.1: Pipeline Failure Diagnosis

**Quality Attribute:** Observability  
**Priority:** (Medium, Medium)

**Stimulus:** News scraper fails with HTTP 429 (rate limit)

**Environment:** Production system, scraper cron job running

**Response:** System logs failure with:
- Structured log entry (timestamp, source, HTTP status, retry schedule)
- Trace ID linking to upstream request
- Rate limit headers captured
- Next retry time calculated

**Response Measure:**
- MTTR < 1 hour (time to identify root cause)
- Log entry contains all diagnostic information
- No need to SSH into server for diagnosis

**Evidence:**
- Implementation: `server/news-scraper.ts`
- Logging: `server/_core/logger-wiring.ts`
- Status: Partial (structured logging exists, no trace IDs)

---

## S6.2: RAG Quality Degradation Alert

**Quality Attribute:** Observability  
**Priority:** (Medium, Low)

**Stimulus:** Citation precision drops from 0.95 to 0.75 over 24 hours

**Environment:** Production system, RAG evaluation running daily

**Response:** System detects degradation and:
- Sends alert to on-call within 5 minutes
- Alert includes sample failed citations
- Dashboard shows trend graph
- Runbook link provided

**Response Measure:**
- Alert latency < 5 minutes
- Alert contains actionable information
- On-call acknowledges within 15 minutes

**Evidence:**
- SLO: `docs/sre/SLO_CATALOG.md` (RQ-1)
- Evaluation: `server/evaluation/rag-eval-harness.ts`
- Status: UNKNOWN (no alerting infrastructure)

---

## Scenario Summary

| ID | Quality Attribute | Priority | Status |
|----|-------------------|----------|--------|
| S1.1 | Domain Correctness | (H, H) | ✅ Implemented |
| S1.2 | Domain Correctness | (H, M) | ✅ Implemented |
| S2.1 | Reliability | (H, M) | ⚠️ Partial (no load testing) |
| S2.2 | Reliability | (M, L) | ⚠️ Partial (no alerting) |
| S3.1 | Security | (H, M) | ❌ Unknown (no tests) |
| S3.2 | Security | (H, L) | ⚠️ Partial (manual only) |
| S4.1 | Performance | (M, M) | ❌ Unknown (no monitoring) |
| S4.2 | Performance | (M, H) | ⚠️ Partial (no timeout handling) |
| S5.1 | Maintainability | (M, H) | ⚠️ Partial (no hash comparison) |
| S5.2 | Maintainability | (M, M) | ⚠️ Partial (no deprecation guidance) |
| S6.1 | Observability | (M, M) | ⚠️ Partial (no trace IDs) |
| S6.2 | Observability | (M, L) | ❌ Unknown (no alerting) |

**Legend:**
- ✅ Implemented: Scenario fully supported with evidence
- ⚠️ Partial: Scenario partially supported, gaps documented
- ❌ Unknown: Scenario not supported, instrumentation missing

---

**Status:** FINAL  
**Owner:** Architecture Panel  
**Last Updated:** 2026-02-12
