# Roadmap / Evolution

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** Roadmap / Evolution
- **Scope:** CURRENT state of roadmap / evolution
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

1. `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md`
2. `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md`
3. `./todo.md`
4. `./tasks/CHATGPT_WORK_PLAN.md`
5. `./POC_EXPLORATION_TODO.md`
6. `./docs/templates/RECOMMENDATION_TEMPLATE.md`
7. `./timeline-test-results.md`
8. `./PHASE_9_DOCUMENTATION_INVENTORY.md`
9. `./docs/STATUS.md`

## 3. Definitions

*See ISA_MASTER_SPEC.md*

## 4. Invariants (MUST-level)

**INV-1:** - Measure citation completeness (100% required)
- Source: `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` > Phase 2: Ask ISA RAG System (Priority: ⭐⭐⭐⭐⭐)

**INV-2:** - Completeness checks (required fields present)
- Source: `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` > Phase 4: Production Hardening (Priority: ⭐⭐⭐)

**INV-3:** **Critical Path:** Phases 1-2-3 must complete sequentially. Phases 4-5 can run in parallel after Phase 3.
- Source: `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` > Appendix: Phase Dependencies

**INV-4:** **1. Advisory Correctness** - All statements must trace to datasets, regulations, or locked advisory artifacts. No hallucinations, no speculation, no untraceable AI outputs.
- Source: `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` > Strategic Priorities

**INV-5:** **Now (Immediate Priority):** Features required for ISA v1.1 production readiness and GS1 NL stakeholder value delivery.
- Source: `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` > Roadmap Structure

**INV-6:** - Validation with Zod schemas (enforce required fields, URL format, hash format)
- Source: `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` > Feature 1: Regulatory Change Log UI

**INV-7:** Ask ISA provides a RAG-based query interface over ISA's locked advisory artifacts, datasets, and GS1 standards documentation. All responses must cite source datasets, advisory sections, or GS1 documen
- Source: `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` > Feature 2: Ask ISA RAG Query Interface

**INV-8:** - Citation extraction: every claim must cite dataset ID, advisory section, or source URL
- Source: `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` > Feature 2: Ask ISA RAG Query Interface

**INV-9:** - Measure citation completeness (100% of responses must cite sources)
- Source: `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` > Feature 2: Ask ISA RAG Query Interface

**INV-10:** **Rationale:** GS1 NL releases new GDSN versions periodically. ISA must stay current to provide accurate gap analyses.
- Source: `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` > Feature 4: GS1 NL v3.1.34 Integration

**INV-11:** - **Reason for deferral:** Blocked by Phase 0 (GS1 NL cooperation required for brand assets)
- Source: `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` > Deferred Features

**INV-12:** - **Reason for deferral:** Regulations are relatively stable; historical versioning not yet required
- Source: `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` > Deferred Features

**INV-13:** - Approval required: GS1 NL standards team review
- Source: `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` > What ISA Might Do (With Explicit Approval)

**INV-14:** - Approval required: GS1 NL business case and dataset availability
- Source: `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` > What ISA Might Do (With Explicit Approval)

**INV-15:** - Approval required: GS1 NL prioritization and source document availability
- Source: `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` > What ISA Might Do (With Explicit Approval)

## 5. Interfaces / Pipelines

*See source documents.*

## 6. Governance & Change Control

1. Review source documents
2. Update TRACEABILITY_MATRIX.csv
3. Follow governance rules

## 7. Observability

**OPEN ISSUE:** Define observability hooks.

## 8. Acceptance Criteria

- AC-1: - Validate all queries from ASK_ISA_QUERY_LIBRARY.md
- AC-2: - Validate diff against schema
- AC-3: **Objective:** Validate final ISA product against mission, anti-goals, and quality standards.
- AC-4: - Validate all 30 queries from Ask ISA Query Library
- AC-5: **Objective:** Ensure ISA is production-ready with monitoring, error recovery, and operational excellence.

## 9. Traceability Annex

| Claim ID | Statement | Source |
|----------|-----------|--------|
| ROA-001 | - Measure citation completeness (100% required)... | `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` |
| ROA-002 | - Completeness checks (required fields present)... | `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` |
| ROA-003 | **Critical Path:** Phases 1-2-3 must complete sequentially. ... | `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` |
| ROA-004 | **1. Advisory Correctness** - All statements must trace to d... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-005 | **Now (Immediate Priority):** Features required for ISA v1.1... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-006 | - Validation with Zod schemas (enforce required fields, URL ... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-007 | Ask ISA provides a RAG-based query interface over ISA's lock... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-008 | - Citation extraction: every claim must cite dataset ID, adv... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-009 | - Measure citation completeness (100% of responses must cite... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-010 | **Rationale:** GS1 NL releases new GDSN versions periodicall... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-011 | - **Reason for deferral:** Blocked by Phase 0 (GS1 NL cooper... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-012 | - **Reason for deferral:** Regulations are relatively stable... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-013 | - Approval required: GS1 NL standards team review... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-014 | - Approval required: GS1 NL business case and dataset availa... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-015 | - Approval required: GS1 NL prioritization and source docume... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-016 | - Approval required: GS1 Global partnership agreement and lo... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-017 | - Requires: Minimal changes, no stakeholder review required... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-018 | Every feature must pass the following quality gates before d... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-019 | - Required for: GS1 NL v3.1.34 integration, Dutch initiative... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-020 | - Required for: Regulatory change log, advisory updates... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-021 | - Required for: Ask ISA RAG pipeline... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-022 | - Proposal required with business case, effort estimate, and... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-023 | **Advisory First:** ISA is an advisory and mapping platform,... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-024 | **Traceability Always:** Every statement, data point, and re... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-025 | **Quality Over Speed:** All features must pass quality gates... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-026 | - [x] Fix boolean→number in INGEST-02_gdsn_current.ts (requi... | `./todo.md` |
| ROA-027 | - [x] Fix boolean→number in INGEST-04_ctes_kdes.ts (mandator... | `./todo.md` |
| ROA-028 | 2. **Column Naming Consistency:** Drizzle schema uses camelC... | `./todo.md` |
| ROA-029 | - [x] Create server/test-helpers/db-test-utils.ts with 7 req... | `./todo.md` |
| ROA-030 | - [x] Seed helpers must work within transaction context... | `./todo.md` |
| ROA-031 | **STATUS: ALREADY COMPLIANT** ✅ No changes required.... | `./todo.md` |
| ROA-032 | - [x] Must not be default (verified)... | `./todo.md` |
| ROA-033 | - [x] Update docs/CI_TESTING.md ONLY if required (not requir... | `./todo.md` |
| ROA-034 | - [x] Deliverable: No PR required - existing implementation ... | `./todo.md` |
| ROA-035 | - [x] Display delta analysis (5 required fields) on event de... | `./todo.md` |
| ROA-036 | **Future Enhancements (Optional, NOT required for ISA-GRADE)... | `./todo.md` |
| ROA-037 | - [ ] Test on desktop browsers (Chrome, Safari) - USER TESTI... | `./todo.md` |
| ROA-038 | - **Description:** Maps GS1 Global Product Classification (G... | `./tasks/CHATGPT_WORK_PLAN.md` |
| ROA-039 | - ✅ No credentials or runtime secrets required... | `./tasks/CHATGPT_WORK_PLAN.md` |
| ROA-040 | - **Critical priority:** [N] (must do - Q1-Q2)... | `./docs/templates/RECOMMENDATION_TEMPLATE.md` |
| ROA-041 | - **Dependencies:** [What is required first?]... | `./docs/templates/RECOMMENDATION_TEMPLATE.md` |
| ROA-042 | / Role / FTE / Duration / Skills Required /... | `./docs/templates/RECOMMENDATION_TEMPLATE.md` |
| ROA-043 | - **[Dependency 1]:** [What is required from external partie... | `./docs/templates/RECOMMENDATION_TEMPLATE.md` |
| ROA-044 | - **[Dependency 2]:** [What is required from external partie... | `./docs/templates/RECOMMENDATION_TEMPLATE.md` |
| ROA-045 | - **[Dependency 1]:** [What is required from internal teams?... | `./docs/templates/RECOMMENDATION_TEMPLATE.md` |
| ROA-046 | - **[Dependency 2]:** [What is required from internal teams?... | `./docs/templates/RECOMMENDATION_TEMPLATE.md` |
| ROA-047 | - Large non-EU companies with EU operations must report on F... | `./timeline-test-results.md` |
| ROA-048 | - Listed SMEs must report on FY2026 (reporting in 2027)... | `./timeline-test-results.md` |
| ROA-049 | - Companies with >250 employees must report on FY2025 (repor... | `./timeline-test-results.md` |
| ROA-050 | - Companies with >500 employees must report on FY2024 (repor... | `./timeline-test-results.md` |
| ROA-051 | - Validate all queries from ASK_ISA_QUERY_LIBRARY.md... | `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` |
| ROA-052 | - Validate diff against schema... | `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` |
| ROA-053 | **Objective:** Validate final ISA product against mission, a... | `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` |
| ROA-054 | - Validate all 30 queries from Ask ISA Query Library... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-055 | **Objective:** Ensure ISA is production-ready with monitorin... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-056 | - ISA does not validate customer data against GS1 standards ... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-057 | - ISA can recommend new attributes, data types, or enums for... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-058 | - [ ] Validate gs1ImpactTags inference quality... | `./todo.md` |
| ROA-059 | - [ ] Validate sectorTags inference quality... | `./todo.md` |
| ROA-060 | - [ ] Verify query performance... | `./todo.md` |
| ROA-061 | - [x] Verify UI rendering with real data... | `./todo.md` |
| ROA-062 | - [x] Verify production readiness and performance impact (Ty... | `./todo.md` |
| ROA-063 | - [ ] Verify all new sources ingesting... | `./todo.md` |
| ROA-064 | - [ ] Verify AI tagging quality... | `./todo.md` |
| ROA-065 | - [ ] Verify UI rendering correctly... | `./todo.md` |
| ROA-066 | - [ ] Verify coverage analytics working... | `./todo.md` |
| ROA-067 | - [ ] Verify documentation accuracy... | `./todo.md` |
| ROA-068 | - [ ] Validate existing `compute_advisory_diff.cjs` script... | `./todo.md` |
| ROA-069 | - [x] Ensure GS1 Style Guide compliance... | `./todo.md` |
| ROA-070 | - [x] Validate GS1 Style Guide compliance... | `./todo.md` |
| ROA-071 | - [x] Verify traceability (source URL + SHA256)... | `./todo.md` |
| ROA-072 | - [x] Verify GS1 Netherlands involvement (2 contributors)... | `./todo.md` |
| ROA-073 | - [x] Verify TypeScript compilation (no errors)... | `./todo.md` |
| ROA-074 | - [x] Verify dev server health (running successfully)... | `./todo.md` |
| ROA-075 | - [x] Verify correct retrieval of ESRS E5 → GS1 Circular Eco... | `./todo.md` |
| ROA-076 | - [x] Verify data integrity (15+ mappings, ESRS E1/E5 covera... | `./todo.md` |
| ROA-077 | - [x] Verify data accuracy (13 mappings, 62.5% coverage, 3 g... | `./todo.md` |
| ROA-078 | - [x] Verify ESRS Datapoints tab loads without errors... | `./todo.md` |
| ROA-079 | - [x] Verify navigation and routing - Working... | `./todo.md` |
| ROA-080 | - [ ] Ensure machine-readable outputs remain developer-optim... | `./todo.md` |
| ROA-081 | - [ ] Validate advisory report formatting... | `./todo.md` |
| ROA-082 | - [x] Run eval suite and verify all tests pass (11/11 passed... | `./todo.md` |
| ROA-083 | - [x] Verify URL includes all filter parameters... | `./todo.md` |
| ROA-084 | - [x] Verify cross-restart persistence... | `./todo.md` |
| ROA-085 | - [x] Verify email alert integration (already implemented)... | `./todo.md` |
| ROA-086 | - [x] Test scraper execution and verify success... | `./todo.md` |
| ROA-087 | - [x] Verify health monitoring shows 100% success rate... | `./todo.md` |
| ROA-088 | - [x] Verify responsive design and dark mode compatibility... | `./todo.md` |
| ROA-089 | - [x] Validate permissions (issue, branch, PR creation)... | `./todo.md` |
| ROA-090 | - [ ] Validate CI pipeline execution on real code... | `./todo.md` |
| ROA-091 | - [ ] Ensure no GitHub sync/push operations... | `./todo.md` |
| ROA-092 | - [ ] Ensure no new integrations without approval... | `./todo.md` |
| ROA-093 | - [ ] Ensure no privilege changes... | `./todo.md` |
| ROA-094 | - [ ] Ensure no irreversible operations... | `./todo.md` |
| ROA-095 | - [x] Verify Lane C governance on created reports... | `./todo.md` |
| ROA-096 | - [x] Verify generatedBy field set to admin user... | `./todo.md` |
| ROA-097 | - ESRS Datapoints: 5 (needs fix - should be 1,184)... | `./todo.md` |
| ROA-098 | - [x] Verify deterministic behavior (no interpretation/reaso... | `./todo.md` |
| ROA-099 | - [x] Validate dev server running successfully... | `./todo.md` |
| ROA-100 | - [x] Verify GitHub Actions workflow exists... | `./todo.md` |
