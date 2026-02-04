# Roadmap / Evolution

**Canonical Specification**
**Status:** CURRENT (as-built)
**Generated:** 2026-02-03

## 1. Identity

- **Name:** Roadmap / Evolution
- **Scope:** This specification defines the CURRENT state of roadmap / evolution within ISA.
- **Marker:** CURRENT (as-built) — not ULTIMATE (ambition/research)

## 2. Core Sources

The following documents form the authoritative basis for this specification:

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

*Terms used in this specification are defined in ISA_MASTER_SPEC.md*

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

## 5. Interfaces / Pipelines / Entry Points

*CURRENT implementation details extracted from source documents.*

## 6. Governance & Change Control

Changes to this specification require:
1. Review of source documents
2. Update to TRACEABILITY_MATRIX.csv
3. Approval per ISA governance rules

## 7. Observability & Evaluation Hooks

**OPEN ISSUE:** Observability hooks not fully defined for this cluster.

## 8. Acceptance Criteria / IRON Gates

- AC-1: - Validate all queries from ASK_ISA_QUERY_LIBRARY.md
- AC-2: - Validate diff against schema
- AC-3: **Objective:** Validate final ISA product against mission, anti-goals, and quality standards.
- AC-4: - Validate all 30 queries from Ask ISA Query Library
- AC-5: **Objective:** Ensure ISA is production-ready with monitoring, error recovery, and operational excellence.

## 9. Traceability Annex

| Claim ID | Statement (truncated) | Source |
|----------|----------------------|--------|
| ROA-001 | - Validate all queries from ASK_ISA_QUERY_LIBRARY.md... | `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` |
| ROA-002 | - Measure citation completeness (100% required)... | `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` |
| ROA-003 | - Validate diff against schema... | `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` |
| ROA-004 | - Completeness checks (required fields present)... | `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` |
| ROA-005 | **Objective:** Validate final ISA product against mission, a... | `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` |
| ROA-006 | **Critical Path:** Phases 1-2-3 must complete sequentially. ... | `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` |
| ROA-007 | **1. Advisory Correctness** - All statements must trace to d... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-008 | **Now (Immediate Priority):** Features required for ISA v1.1... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-009 | - Validation with Zod schemas (enforce required fields, URL ... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-010 | Ask ISA provides a RAG-based query interface over ISA's lock... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-011 | - Citation extraction: every claim must cite dataset ID, adv... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-012 | - Validate all 30 queries from Ask ISA Query Library... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-013 | - Measure citation completeness (100% of responses must cite... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-014 | **Rationale:** GS1 NL releases new GDSN versions periodicall... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-015 | **Objective:** Ensure ISA is production-ready with monitorin... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-016 | - **Reason for deferral:** Blocked by Phase 0 (GS1 NL cooper... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-017 | - **Reason for deferral:** Regulations are relatively stable... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-018 | - ISA does not validate customer data against GS1 standards ... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-019 | - ISA can recommend new attributes, data types, or enums for... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
| ROA-020 | - Approval required: GS1 NL standards team review... | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |
