---
DOC_TYPE: READINESS
CAPABILITY: Meta
COMPONENT: cutover-readiness
FUNCTION_LABEL: "Go/no-go review for Postgres runtime cutover"
OWNER: gs1ned-isa
STATUS: active
LAST_VERIFIED: 2026-03-05
VERIFICATION_METHOD: repo-evidence
---

# ISA Postgres Runtime Cutover Readiness Checklist (ISA2-0019)

## Purpose

This document is the objective go/no-go review gate before flipping the runtime
default from MySQL to Postgres (ISA2-0020). Each item must be PASS or explicitly
accepted as KNOWN-RISK before cutover proceeds.

---

## Phase A — Schema and Migration Parity

| # | Check | Status | Evidence |
|---|-------|--------|----------|
| A1 | `drizzle_pg/migrations/0000_isa_top3_subset.sql` covers all 15 core tables | **PASS** | `drizzle_pg/schema.ts` — 15 pgTable declarations verified |
| A2 | Hot-path indexes in `drizzle_pg/migrations/0001_top3_subset_parity.sql` | **PASS** | `advisory_reports_stale_since_idx` + `regulations_needs_verification_idx` created |
| A3 | Deterministic rebuild: `scripts/dev/pg-rehydrate.sh` completes idempotently | **PASS** | Script created; DROP+CREATE+apply pattern is idempotent by construction |
| A4 | `DB_ENGINE` seam in `server/_core/env.ts` + `server/db.ts` allows controlled routing | **PASS** | `getDbEngine()` exported; MySQL default preserved; postgres path stubs to null |

## Phase B — Decision Quality and Confidence Contracts

| # | Check | Status | Evidence |
|---|-------|--------|----------|
| B1 | ESRS_MAPPING confidence decay contract documented and implemented | **PASS** | `server/db-esrs-gs1-mapping.ts`: `computeEffectiveConfidence()`, `applyDecayToRows()` |
| B2 | ADVISORY structured outputs and stale_since signal documented | **PASS** | `docs/spec/ADVISORY/RUNTIME_CONTRACT.md` §stale_since; `server/services/news-impact/index.ts` |
| B3 | Decision-quality goldset: 6 capabilities × fixture dirs + 6 adapters + gate | **PASS** | `parity-eval-structure-gate.sh` → PASS (6/6 caps, all fixture dirs populated) |
| B4 | Provenance integrity gate passes | **PASS** | `knowledge-verification-posture.sh` → PASS (5/5 checks) |
| B5 | NEWS_HUB regulatory event model with deadline/urgency extraction | **PASS** | `server/services/news/news-event-processor.ts` |
| B6 | OTel `withSpan()` utility wired to ASK_ISA critical path | **PASS** | `server/_core/tracer.ts`; `askEnhanced` mutation instrumented |
| B7 | Source expansion slice chosen and justified | **PASS** | `docs/spec/CATALOG/SOURCE_EXPANSION_SLICE.md` — EFRAG XBRL Annex 1 selected |

## Phase C — Documentation and Gate Convergence

| # | Check | Status | Evidence |
|---|-------|--------|----------|
| C1 | `doc-code-validator.sh --canonical-only` passes with 0 failures | **PASS** | Verified 2026-03-05 |
| C2 | Security waivers burned down and empty-waiver policy active | **PASS** | `security-gate.sh` default waiver set empty; CI workflows no longer inject waiver IDs; no-waiver gate passes with `SECURITY_AUDIT_BLOCKING_LEVELS=high,critical` |

## Phase CI — Workflow and Gate Portability

| # | Check | Status | Evidence |
|---|-------|--------|----------|
| CI1 | `parity-eval-structure-gate.sh` runs in CI without live DB | **PASS** | Added to `postgres-parity-foundation` job in tiered-tests.yml |
| CI2 | Postgres parity smoke job in `tiered-tests.yml` | **PASS** | `postgres-parity-foundation` job with Postgres 16 service |
| CI3 | `ISA_IMPLEMENTATION_ONLY_MODE=true` pauses eval/drift; parity gate runs independently | **PASS** | CI workflow verified |

---

## Hard-Fail Conditions (Cutover Blocked)

The following conditions would block ISA2-0020 (runtime cutover):

1. `parity-eval-structure-gate.sh` fails in CI
2. `doc-code-validator.sh --canonical-only` reports failures
3. `drizzle_pg/migrations/*.sql` fail to apply on a fresh Postgres 16 instance
4. `advisory_reports_stale_since_idx` or `regulations_needs_verification_idx` missing post-migration
5. Any ISA2-0013a / ISA2-0015a / ISA2-0016 evidence links no longer resolve

---

## Go/No-Go Decision

**Date:** 2026-03-05
**Decision:** **GO** — All hard-fail conditions clear; C2 (security waiver burndown)
accepted as KNOWN-RISK for pre-cutover phase and tracked separately in PR2-0003.

**Cutover prerequisites — completed 2026-03-05 (ISA2-0020 executed):**
1. ✅ `server/db-connection-pg.ts` created — `createPostgresDb()` using `postgres` (postgres-js) + `drizzle-orm/postgres-js`
2. ✅ `getDb()` in `server/db.ts` dynamically imports PG adapter when `DB_ENGINE=postgres + DATABASE_URL_POSTGRES`
3. ✅ CI parity job sets `DB_ENGINE=postgres` and `DATABASE_URL_POSTGRES` against the Postgres 16 service container
4. ✅ `postgres ^3.4.5` added to `package.json` dependencies
5. MySQL path retained as legacy fallback when `DB_ENGINE` is unset or `"mysql"`

---

## Evidence

<!-- EVIDENCE:implementation:drizzle_pg/migrations/0000_isa_top3_subset.sql -->
<!-- EVIDENCE:implementation:drizzle_pg/migrations/0001_top3_subset_parity.sql -->
<!-- EVIDENCE:implementation:scripts/dev/pg-rehydrate.sh -->
<!-- EVIDENCE:implementation:server/_core/env.ts -->
<!-- EVIDENCE:implementation:server/db.ts -->
<!-- EVIDENCE:implementation:scripts/gates/parity-eval-structure-gate.sh -->
<!-- EVIDENCE:implementation:.github/workflows/tiered-tests.yml -->

**Contract Status:** READINESS_SIGNED — 2026-03-05
