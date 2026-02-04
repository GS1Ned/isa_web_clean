# Ingestion & Update Lifecycle

**Canonical Specification**
**Status:** CURRENT (as-built)
**Generated:** 2026-02-03

## 1. Identity

- **Name:** Ingestion & Update Lifecycle
- **Scope:** This specification defines the CURRENT state of ingestion & update lifecycle within ISA.
- **Marker:** CURRENT (as-built) — not ULTIMATE (ambition/research)

## 2. Core Sources

The following documents form the authoritative basis for this specification:

1. `./docs/CODEX_DELEGATION_SPEC.md`
2. `./docs/FILE_SYSTEM_MEMORY_ARCHITECTURE.md`
3. `./docs/PIPELINE_OBSERVABILITY_SPEC.md`
4. `./CHATGPT_UPDATE_PROMPT.md`
5. `./ROADMAP_GITHUB_INTEGRATION.md`
6. `./docs/GOVERNANCE_PHASE_2_3_REPORT.md`
7. `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md`
8. `./docs/ISA_WORKFLOW_IMPROVEMENTS.md`
9. `./todo.md`
10. `./CHATGPT_PROMPT_INGEST-03.md`

## 3. Definitions

*Terms used in this specification are defined in ISA_MASTER_SPEC.md*

## 4. Invariants (MUST-level)

**INV-1:** 2. [ ] Confirm no architectural changes required
- Source: `./docs/CODEX_DELEGATION_SPEC.md` > Pre-Delegation Checklist

**INV-2:** - What you must deliver (4-5 files)
- Source: `./CHATGPT_UPDATE_PROMPT.md` > 2. ChatGPT Instructions

**INV-3:** **Must include:**
- Source: `./CHATGPT_UPDATE_PROMPT.md` > File 1: Ingestion Module

**INV-4:** 8. **Don't skip documentation** - README is required
- Source: `./CHATGPT_UPDATE_PROMPT.md` > ❌ DON'T:

**INV-5:** 6. **Code Review:** CODEOWNERS review required
- Source: `./ROADMAP_GITHUB_INTEGRATION.md` > New Workflow (GitHub-First)

**INV-6:** Sync must occur after:
- Source: `./ROADMAP_GITHUB_INTEGRATION.md` > Additional Triggers

**INV-7:** Immediate sync required for:
- Source: `./ROADMAP_GITHUB_INTEGRATION.md` > Emergency Sync

**INV-8:** All third-party integrations (data sources, APIs, services) must follow the systematic evaluation framework defined in `INTEGRATIONS_RESEARCH_PROTOCOL.md`.
- Source: `./ROADMAP_GITHUB_INTEGRATION.md` > Integration Research Framework

**INV-9:** **Core Principle:** Integration research and implementation must not interrupt or delay core ISA development.
- Source: `./ROADMAP_GITHUB_INTEGRATION.md` > Non-Interruption Rule

**INV-10:** - **Action Required:** Authenticate GitHub CLI or sync codebase to GitHub
- Source: `./docs/GOVERNANCE_PHASE_2_3_REPORT.md` > 2. ENGINEERING BASELINE

**INV-11:** - Measure citation completeness (100% required)
- Source: `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` > Phase 2: Ask ISA RAG System (Priority: ⭐⭐⭐⭐⭐)

**INV-12:** - Completeness checks (required fields present)
- Source: `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` > Phase 4: Production Hardening (Priority: ⭐⭐⭐)

**INV-13:** **Critical Path:** Phases 1-2-3 must complete sequentially. Phases 4-5 can run in parallel after Phase 3.
- Source: `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` > Appendix: Phase Dependencies

**INV-14:** - All outputs must conform to JSON schema
- Source: `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` > Action 1.2: Refactor Ingestion Prompts to 5-Block Structure

**INV-15:** required: ["records", "errors", "summary"],
- Source: `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` > Action 1.2: Refactor Ingestion Prompts to 5-Block Structure

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

- AC-1: **Review Checkpoint:** Verify exports, types, and test coverage before integration.
- AC-2: Write tests in `server/test-helpers/api-mocks.test.ts` to validate:
- AC-3: **Review Checkpoint:** Verify type compatibility with production code before merging.
- AC-4: Each component should:
- AC-5: 1. [ ] Verify task is self-contained and isolated

## 9. Traceability Annex

| Claim ID | Statement (truncated) | Source |
|----------|----------------------|--------|
| ING-001 | **Review Checkpoint:** Verify exports, types, and test cover... | `./docs/CODEX_DELEGATION_SPEC.md` |
| ING-002 | Write tests in `server/test-helpers/api-mocks.test.ts` to va... | `./docs/CODEX_DELEGATION_SPEC.md` |
| ING-003 | **Review Checkpoint:** Verify type compatibility with produc... | `./docs/CODEX_DELEGATION_SPEC.md` |
| ING-004 | Each component should:... | `./docs/CODEX_DELEGATION_SPEC.md` |
| ING-005 | 1. [ ] Verify task is self-contained and isolated... | `./docs/CODEX_DELEGATION_SPEC.md` |
| ING-006 | 2. [ ] Confirm no architectural changes required... | `./docs/CODEX_DELEGATION_SPEC.md` |
| ING-007 | - Verify acceptance criteria met... | `./docs/CODEX_DELEGATION_SPEC.md` |
| ING-008 | - [List of files Codex should read]... | `./docs/CODEX_DELEGATION_SPEC.md` |
| ING-009 | [When and how to validate completion]... | `./docs/CODEX_DELEGATION_SPEC.md` |
| ING-010 | Codex should provide status updates in this format:... | `./docs/CODEX_DELEGATION_SPEC.md` |
| ING-011 | - **Tested:** Unit tests ensure correctness... | `./docs/FILE_SYSTEM_MEMORY_ARCHITECTURE.md` |
| ING-012 | **Solution:** Use `sort-keys` to ensure consistent JSON outp... | `./docs/FILE_SYSTEM_MEMORY_ARCHITECTURE.md` |
| ING-013 | - [ ] Verify dashboard UI rendering... | `./docs/PIPELINE_OBSERVABILITY_SPEC.md` |
| ING-014 | 5. **Integration automation** - Scripts to extract and valid... | `./CHATGPT_UPDATE_PROMPT.md` |
| ING-015 | - Run tests and validate data quality... | `./CHATGPT_UPDATE_PROMPT.md` |
| ING-016 | - What you must deliver (4-5 files)... | `./CHATGPT_UPDATE_PROMPT.md` |
| ING-017 | **Must include:**... | `./CHATGPT_UPDATE_PROMPT.md` |
| ING-018 | 8. **Don't skip documentation** - README is required... | `./CHATGPT_UPDATE_PROMPT.md` |
| ING-019 | 3. Unclear: Should I normalize <field> or keep raw?... | `./CHATGPT_UPDATE_PROMPT.md` |
| ING-020 | 6. **Code Review:** CODEOWNERS review required... | `./ROADMAP_GITHUB_INTEGRATION.md` |
