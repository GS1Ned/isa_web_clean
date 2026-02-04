# Observability / Tracing / Production Feedback

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** Observability / Tracing / Production Feedback
- **Scope:** CURRENT state of observability / tracing / production feedback
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

1. `./docs/PHASE_8.3_INGESTION_WINDOW_COMPLETE.md`
2. `./docs/PRODUCTION_DEPLOYMENT.md`
3. `./docs/PHASE4_OPERATIONAL_READINESS_REPORT.md`
4. `./docs/PRODUCTION_IMPROVEMENTS_JAN_2026.md`
5. `./IRON_KNOWLEDGE_MAP.md`
6. `./docs/evidence/_research/ISA_CURRENT_ARCHITECTURE_BRIEF_v0.md`
7. `./docs/EMBEDDING_PIPELINE_OPTIMIZATION.md`

## 3. Definitions

*See ISA_MASTER_SPEC.md*

## 4. Invariants (MUST-level)

**INV-1:** 1. **Initial Setup**: New deployments or data migrations required manual workarounds to populate historical news data
- Source: `./docs/PHASE_8.3_INGESTION_WINDOW_COMPLETE.md` > Problem Statement

**INV-2:** 2. **Data Recovery**: System failures or extended downtime required custom scripts to backfill missing news items
- Source: `./docs/PHASE_8.3_INGESTION_WINDOW_COMPLETE.md` > Problem Statement

**INV-3:** The following environment variables must be configured in the production environment:
- Source: `./docs/PRODUCTION_DEPLOYMENT.md` > Environment Variables

**INV-4:** | Variable | Description | Required |
- Source: `./docs/PRODUCTION_DEPLOYMENT.md` > Environment Variables

**INV-5:** | Criterion | Required | Actual | Status |
- Source: `./docs/PHASE4_OPERATIONAL_READINESS_REPORT.md` > 6. Completion Criteria Verification

**INV-6:** - ⚠️ Cookie consent banner not implemented (minimal cookies, not required)
- Source: `./docs/PRODUCTION_IMPROVEMENTS_JAN_2026.md` > 5.1 Updated Checklist

**INV-7:** - Cookie consent banner (not required for essential cookies only)
- Source: `./docs/PRODUCTION_IMPROVEMENTS_JAN_2026.md` > 5.2 Overall Status

**INV-8:** No new environment variables required. All improvements use existing infrastructure:
- Source: `./docs/PRODUCTION_IMPROVEMENTS_JAN_2026.md` > 6.1 Environment Variables

**INV-9:** - Rate limiting: In-memory store (no Redis required)
- Source: `./docs/PRODUCTION_IMPROVEMENTS_JAN_2026.md` > 6.1 Environment Variables

**INV-10:** No database migrations required. All improvements are application-level.
- Source: `./docs/PRODUCTION_IMPROVEMENTS_JAN_2026.md` > 6.2 Database Changes

**INV-11:** - [ ] Implement cookie consent banner (if required by legal review)
- Source: `./docs/PRODUCTION_IMPROVEMENTS_JAN_2026.md` > 8.1 Short-Term (Next 30 Days)

**INV-12:** 3. **No Progress Persistence:** If interrupted, must restart from beginning
- Source: `./docs/EMBEDDING_PIPELINE_OPTIMIZATION.md` > Limitations

## 5. Interfaces / Pipelines

*See source documents.*

## 6. Governance & Change Control

1. Review source documents
2. Update TRACEABILITY_MATRIX.csv
3. Follow governance rules

## 7. Observability

*See source documents.*

## 8. Acceptance Criteria

- AC-1: 2. Ensure "Normal (30 days)" is selected (default)
- AC-2: **Note:** Automated tests validate core mode logic but require enhanced mocking for full pipeline execution. Manual testing via admin UI is recommende
- AC-3: 4. **Mode Analytics**: Track mode usage patterns and recommend optimal configurations
- AC-4: 4. **Verify rollback**: Check health endpoints
- AC-5: - [ ] Conduct load testing to validate scaling assumptions

## 9. Traceability Annex

| Claim ID | Statement | Source |
|----------|-----------|--------|
| OBS-001 | 1. **Initial Setup**: New deployments or data migrations req... | `./docs/PHASE_8.3_INGESTION_WINDOW_COMPLETE.md` |
| OBS-002 | 2. **Data Recovery**: System failures or extended downtime r... | `./docs/PHASE_8.3_INGESTION_WINDOW_COMPLETE.md` |
| OBS-003 | The following environment variables must be configured in th... | `./docs/PRODUCTION_DEPLOYMENT.md` |
| OBS-004 | / Variable / Description / Required /... | `./docs/PRODUCTION_DEPLOYMENT.md` |
| OBS-005 | / Criterion / Required / Actual / Status /... | `./docs/PHASE4_OPERATIONAL_READINESS_REPORT.md` |
| OBS-006 | - ⚠️ Cookie consent banner not implemented (minimal cookies,... | `./docs/PRODUCTION_IMPROVEMENTS_JAN_2026.md` |
| OBS-007 | - Cookie consent banner (not required for essential cookies ... | `./docs/PRODUCTION_IMPROVEMENTS_JAN_2026.md` |
| OBS-008 | No new environment variables required. All improvements use ... | `./docs/PRODUCTION_IMPROVEMENTS_JAN_2026.md` |
| OBS-009 | - Rate limiting: In-memory store (no Redis required)... | `./docs/PRODUCTION_IMPROVEMENTS_JAN_2026.md` |
| OBS-010 | No database migrations required. All improvements are applic... | `./docs/PRODUCTION_IMPROVEMENTS_JAN_2026.md` |
| OBS-011 | - [ ] Implement cookie consent banner (if required by legal ... | `./docs/PRODUCTION_IMPROVEMENTS_JAN_2026.md` |
| OBS-012 | 3. **No Progress Persistence:** If interrupted, must restart... | `./docs/EMBEDDING_PIPELINE_OPTIMIZATION.md` |
| OBS-013 | 2. Ensure "Normal (30 days)" is selected (default)... | `./docs/PHASE_8.3_INGESTION_WINDOW_COMPLETE.md` |
| OBS-014 | **Note:** Automated tests validate core mode logic but requi... | `./docs/PHASE_8.3_INGESTION_WINDOW_COMPLETE.md` |
| OBS-015 | 4. **Mode Analytics**: Track mode usage patterns and recomme... | `./docs/PHASE_8.3_INGESTION_WINDOW_COMPLETE.md` |
| OBS-016 | 4. **Verify rollback**: Check health endpoints... | `./docs/PRODUCTION_DEPLOYMENT.md` |
| OBS-017 | - [ ] Conduct load testing to validate scaling assumptions... | `./docs/PRODUCTION_IMPROVEMENTS_JAN_2026.md` |
