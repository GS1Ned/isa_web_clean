# Ingestion & Update Lifecycle

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** Ingestion & Update Lifecycle
- **Scope:** CURRENT state of ingestion & update lifecycle
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

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

*See ISA_MASTER_SPEC.md*

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

## 5. Interfaces / Pipelines

*See source documents.*

## 6. Governance & Change Control

1. Review source documents
2. Update TRACEABILITY_MATRIX.csv
3. Follow governance rules

## 7. Observability

**OPEN ISSUE:** Define observability hooks.

## 8. Acceptance Criteria

- AC-1: **Review Checkpoint:** Verify exports, types, and test coverage before integration.
- AC-2: Write tests in `server/test-helpers/api-mocks.test.ts` to validate:
- AC-3: **Review Checkpoint:** Verify type compatibility with production code before merging.
- AC-4: Each component should:
- AC-5: 1. [ ] Verify task is self-contained and isolated

## 9. Traceability Annex

| Claim ID | Statement | Source |
|----------|-----------|--------|
| ING-001 | 2. [ ] Confirm no architectural changes required... | `./docs/CODEX_DELEGATION_SPEC.md` |
| ING-002 | **Review Checkpoint:** Verify exports, types, and test cover... | `./docs/CODEX_DELEGATION_SPEC.md` |
| ING-003 | Write tests in `server/test-helpers/api-mocks.test.ts` to va... | `./docs/CODEX_DELEGATION_SPEC.md` |
| ING-004 | **Review Checkpoint:** Verify type compatibility with produc... | `./docs/CODEX_DELEGATION_SPEC.md` |
| ING-005 | Each component should:... | `./docs/CODEX_DELEGATION_SPEC.md` |
| ING-006 | 1. [ ] Verify task is self-contained and isolated... | `./docs/CODEX_DELEGATION_SPEC.md` |
| ING-007 | - Verify acceptance criteria met... | `./docs/CODEX_DELEGATION_SPEC.md` |
| ING-008 | - [List of files Codex should read]... | `./docs/CODEX_DELEGATION_SPEC.md` |
| ING-009 | [When and how to validate completion]... | `./docs/CODEX_DELEGATION_SPEC.md` |
| ING-010 | Codex should provide status updates in this format:... | `./docs/CODEX_DELEGATION_SPEC.md` |
| ING-011 | - **Tested:** Unit tests ensure correctness... | `./docs/FILE_SYSTEM_MEMORY_ARCHITECTURE.md` |
| ING-012 | **Solution:** Use `sort-keys` to ensure consistent JSON outp... | `./docs/FILE_SYSTEM_MEMORY_ARCHITECTURE.md` |
| ING-013 | - [ ] Verify dashboard UI rendering... | `./docs/PIPELINE_OBSERVABILITY_SPEC.md` |
| ING-014 | - What you must deliver (4-5 files)... | `./CHATGPT_UPDATE_PROMPT.md` |
| ING-015 | **Must include:**... | `./CHATGPT_UPDATE_PROMPT.md` |
| ING-016 | 8. **Don't skip documentation** - README is required... | `./CHATGPT_UPDATE_PROMPT.md` |
| ING-017 | 6. **Code Review:** CODEOWNERS review required... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ING-018 | Sync must occur after:... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ING-019 | Immediate sync required for:... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ING-020 | All third-party integrations (data sources, APIs, services) ... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ING-021 | **Core Principle:** Integration research and implementation ... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ING-022 | - **Action Required:** Authenticate GitHub CLI or sync codeb... | `./docs/GOVERNANCE_PHASE_2_3_REPORT.md` |
| ING-023 | - Measure citation completeness (100% required)... | `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` |
| ING-024 | - Completeness checks (required fields present)... | `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` |
| ING-025 | **Critical Path:** Phases 1-2-3 must complete sequentially. ... | `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` |
| ING-026 | - All outputs must conform to JSON schema... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| ING-027 | required: ["records", "errors", "summary"],... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| ING-028 | required: ["row", "field", "error"],... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| ING-029 | required: ["total", "success", "failed"],... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| ING-030 | - All claims must be cited with [Source N] notation... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| ING-031 | required: ["answer", "sources", "confidence"],... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| ING-032 | required: ["id", "title", "url", "relevance"],... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| ING-033 | - [x] Fix boolean→number in INGEST-02_gdsn_current.ts (requi... | `./todo.md` |
| ING-034 | - [x] Fix boolean→number in INGEST-04_ctes_kdes.ts (mandator... | `./todo.md` |
| ING-035 | 2. **Column Naming Consistency:** Drizzle schema uses camelC... | `./todo.md` |
| ING-036 | - [x] Create server/test-helpers/db-test-utils.ts with 7 req... | `./todo.md` |
| ING-037 | - [x] Seed helpers must work within transaction context... | `./todo.md` |
| ING-038 | **STATUS: ALREADY COMPLIANT** ✅ No changes required.... | `./todo.md` |
| ING-039 | - [x] Must not be default (verified)... | `./todo.md` |
| ING-040 | - [x] Update docs/CI_TESTING.md ONLY if required (not requir... | `./todo.md` |
| ING-041 | - [x] Deliverable: No PR required - existing implementation ... | `./todo.md` |
| ING-042 | - [x] Display delta analysis (5 required fields) on event de... | `./todo.md` |
| ING-043 | **Future Enhancements (Optional, NOT required for ISA-GRADE)... | `./todo.md` |
| ING-044 | - [ ] Test on desktop browsers (Chrome, Safari) - USER TESTI... | `./todo.md` |
| ING-045 | **Note:** These standards are valuable for reference but not... | `./docs/GS1_DOCUMENTS_DATASETS_ANALYSIS.md` |
| ING-046 | - ✅ Clear adoption path (no design required)... | `./docs/GS1_EU_PCF_INTEGRATION_SUMMARY.md` |
| ING-047 | This section enumerates all required tasks organized by func... | `./docs/ISA_Strategic_Roadmap.md` |
| ING-048 | - Required customers for break-even (at €200/month): 10-25... | `./docs/ISA_Strategic_Roadmap.md` |
| ING-049 | 1. **Schema Validation**: Ensure all required fields present... | `./docs/ISA_Strategic_Roadmap.md` |
| ING-050 | / **Completeness** / 95%+   / % of required fields populated... | `./docs/ISA_Strategic_Roadmap.md` |
| ING-051 | 1. All regulations must have CELEX ID... | `./docs/ISA_Strategic_Roadmap.md` |
| ING-052 | 2. Effective dates must be valid and in the past/future... | `./docs/ISA_Strategic_Roadmap.md` |
| ING-053 | 3. Cross-references must point to existing documents... | `./docs/ISA_Strategic_Roadmap.md` |
| ING-054 | 4. Titles must be non-empty and < 500 characters... | `./docs/ISA_Strategic_Roadmap.md` |
| ING-055 | 5. Status must be one of: active, proposed, repealed... | `./docs/ISA_Strategic_Roadmap.md` |
| ING-056 | 6. Language codes must be valid ISO 639-1... | `./docs/ISA_Strategic_Roadmap.md` |
| ING-057 | **Automated Tasks** (No Manual Intervention Required):... | `./docs/ISA_Strategic_Roadmap.md` |
| ING-058 | 5. **Integration automation** - Scripts to extract and valid... | `./CHATGPT_UPDATE_PROMPT.md` |
| ING-059 | - Run tests and validate data quality... | `./CHATGPT_UPDATE_PROMPT.md` |
| ING-060 | 3. Unclear: Should I normalize <field> or keep raw?... | `./CHATGPT_UPDATE_PROMPT.md` |
| ING-061 | Each phase includes a decision gate to ensure quality and pr... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ING-062 | Before merging to main, verify:... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ING-063 | 2. **Mandatory Source Availability:** Verify GS1 Global, GS1... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ING-064 | 7. ✅ Validate permissions (issue, branch, PR creation)... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ING-065 | 4. Validate CI pipeline execution... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ING-066 | **Description:** Run full test suite, verify 100% pass rate,... | `./docs/GOVERNANCE_PHASE_2_3_REPORT.md` |
| ING-067 | - Validate all queries from ASK_ISA_QUERY_LIBRARY.md... | `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` |
| ING-068 | - Validate diff against schema... | `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` |
| ING-069 | **Objective:** Validate final ISA product against mission, a... | `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` |
| ING-070 | diff output1.json output2.json  # Should be identical... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| ING-071 | 4. Observe: Validate extracted record against schema... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| ING-072 | pnpm tsx scripts/validate-ingestion-output.ts... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| ING-073 | - If confidence < 0.7, add disclaimer: "This answer has mode... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| ING-074 | 4. Observe: Verify all claims are cited... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| ING-075 | Identify which sectors are affected and what actions they sh... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| ING-076 | - Suggested actions (what should GS1 members do)... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| ING-077 | - [ ] Day 1-2: Audit JSON serialization, ensure deterministi... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| ING-078 | - [ ] Day 3-4: Remove timestamps from prompts, verify KV-cac... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| ING-079 | - [ ] Day 5: Test and validate modular prompts... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| ING-080 | - [ ] Validate gs1ImpactTags inference quality... | `./todo.md` |
| ING-081 | - [ ] Validate sectorTags inference quality... | `./todo.md` |
| ING-082 | - [ ] Verify query performance... | `./todo.md` |
| ING-083 | - [x] Verify UI rendering with real data... | `./todo.md` |
| ING-084 | - [x] Verify production readiness and performance impact (Ty... | `./todo.md` |
| ING-085 | - [ ] Verify all new sources ingesting... | `./todo.md` |
| ING-086 | - [ ] Verify AI tagging quality... | `./todo.md` |
| ING-087 | - [ ] Verify UI rendering correctly... | `./todo.md` |
| ING-088 | - [ ] Verify coverage analytics working... | `./todo.md` |
| ING-089 | - [ ] Verify documentation accuracy... | `./todo.md` |
| ING-090 | - [ ] Validate existing `compute_advisory_diff.cjs` script... | `./todo.md` |
| ING-091 | - [x] Ensure GS1 Style Guide compliance... | `./todo.md` |
| ING-092 | - [x] Validate GS1 Style Guide compliance... | `./todo.md` |
| ING-093 | - [x] Verify traceability (source URL + SHA256)... | `./todo.md` |
| ING-094 | - [x] Verify GS1 Netherlands involvement (2 contributors)... | `./todo.md` |
| ING-095 | - [x] Verify TypeScript compilation (no errors)... | `./todo.md` |
| ING-096 | - [x] Verify dev server health (running successfully)... | `./todo.md` |
| ING-097 | - [x] Verify correct retrieval of ESRS E5 → GS1 Circular Eco... | `./todo.md` |
| ING-098 | - [x] Verify data integrity (15+ mappings, ESRS E1/E5 covera... | `./todo.md` |
| ING-099 | - [x] Verify data accuracy (13 mappings, 62.5% coverage, 3 g... | `./todo.md` |
| ING-100 | - [x] Verify ESRS Datapoints tab loads without errors... | `./todo.md` |
