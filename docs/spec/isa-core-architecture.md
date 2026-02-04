# ISA Core Architecture

**Canonical Specification**
**Status:** CURRENT (as-built)
**Generated:** 2026-02-03

## 1. Identity

- **Name:** ISA Core Architecture
- **Scope:** This specification defines the CURRENT state of isa core architecture within ISA.
- **Marker:** CURRENT (as-built) — not ULTIMATE (ambition/research)

## 2. Core Sources

The following documents form the authoritative basis for this specification:

1. `./ARCHITECTURE.md`
2. `./docs/FILE_SYSTEM_MEMORY_ARCHITECTURE.md`
3. `./docs/ISA_INFORMATION_ARCHITECTURE.md`
4. `./ROADMAP_GITHUB_INTEGRATION.md`
5. `./docs/ISA_VISUAL_BRANDING_ROADMAP.md`
6. `./docs/ISA_STRATEGIC_CONTEXT_SYNTHESIS.md`
7. `./PROJECT_SIZE_CLEANUP.md`
8. `./docs/ALERTING_SYSTEM_DESIGN.md`
9. `./tasks/for_chatgpt/CGPT-15_user_guide.md`
10. `./docs/MANUS_OPTIMIZATION_IMPLEMENTATION_SUMMARY.md`

## 3. Definitions

*Terms used in this specification are defined in ISA_MASTER_SPEC.md*

## 4. Invariants (MUST-level)

**INV-1:** Enable GS1 Netherlands members to understand which GS1 standards and data attributes are required for compliance with EU regulations (CSRD, EUDR, DPP, ESRS) through structured mappings, versioned advi
- Source: `./ARCHITECTURE.md` > Core Mission

**INV-2:** - **Advisory Publication:** Lane C review required, no automated publication
- Source: `./ARCHITECTURE.md` > Data Limitations

**INV-3:** - 🔴 **Critical:** Must-have for MVP, core user journeys
- Source: `./docs/ISA_INFORMATION_ARCHITECTURE.md` > 4. Page-Type Priority Matrix

**INV-4:** 6. **Code Review:** CODEOWNERS review required
- Source: `./ROADMAP_GITHUB_INTEGRATION.md` > New Workflow (GitHub-First)

**INV-5:** Sync must occur after:
- Source: `./ROADMAP_GITHUB_INTEGRATION.md` > Additional Triggers

**INV-6:** Immediate sync required for:
- Source: `./ROADMAP_GITHUB_INTEGRATION.md` > Emergency Sync

**INV-7:** All third-party integrations (data sources, APIs, services) must follow the systematic evaluation framework defined in `INTEGRATIONS_RESEARCH_PROTOCOL.md`.
- Source: `./ROADMAP_GITHUB_INTEGRATION.md` > Integration Research Framework

**INV-8:** **Core Principle:** Integration research and implementation must not interrupt or delay core ISA development.
- Source: `./ROADMAP_GITHUB_INTEGRATION.md` > Non-Interruption Rule

**INV-9:** - Must ISA display the GS1 logo?
- Source: `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` > 1. Clarify ISA's Official Status

**INV-10:** - Is "Powered by GS1" attribution required?
- Source: `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` > 1. Clarify ISA's Official Status

**INV-11:** - Determine if GS1 logo is required and where
- Source: `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` > 3. Audit Current ISA Visual Implementation

**INV-12:** - ✅ GS1 logo is displayed (if required) with proper attribution
- Source: `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` > Exit Criteria

**INV-13:** - Determines level of GS1 branding required
- Source: `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` > Critical Decisions (Block Phase 0 → Phase 1 Transition)

**INV-14:** 2. **Must ISA display the GS1 logo?**
- Source: `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` > Critical Decisions (Block Phase 0 → Phase 1 Transition)

**INV-15:** - ✅ GS1 logo displayed (if required) with proper attribution
- Source: `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` > Phase 1: GS1 Brand Compliance

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

- AC-1: - Verify Lane C authorization
- AC-2: - **Tested:** Unit tests ensure correctness
- AC-3: **Solution:** Use `sort-keys` to ensure consistent JSON output.
- AC-4: **Recommendation:** ISA should have **two distinct navigation patterns**:
- AC-5: **Goal:** Complete the website, ensure legal compliance

## 9. Traceability Annex

| Claim ID | Statement (truncated) | Source |
|----------|----------------------|--------|
| ISA-001 | Enable GS1 Netherlands members to understand which GS1 stand... | `./ARCHITECTURE.md` |
| ISA-002 | - Verify Lane C authorization... | `./ARCHITECTURE.md` |
| ISA-003 | - **Advisory Publication:** Lane C review required, no autom... | `./ARCHITECTURE.md` |
| ISA-004 | - **Tested:** Unit tests ensure correctness... | `./docs/FILE_SYSTEM_MEMORY_ARCHITECTURE.md` |
| ISA-005 | **Solution:** Use `sort-keys` to ensure consistent JSON outp... | `./docs/FILE_SYSTEM_MEMORY_ARCHITECTURE.md` |
| ISA-006 | **Recommendation:** ISA should have **two distinct navigatio... | `./docs/ISA_INFORMATION_ARCHITECTURE.md` |
| ISA-007 | - 🔴 **Critical:** Must-have for MVP, core user journeys... | `./docs/ISA_INFORMATION_ARCHITECTURE.md` |
| ISA-008 | **Goal:** Complete the website, ensure legal compliance... | `./docs/ISA_INFORMATION_ARCHITECTURE.md` |
| ISA-009 | 6. **Code Review:** CODEOWNERS review required... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ISA-010 | Sync must occur after:... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ISA-011 | Immediate sync required for:... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ISA-012 | All third-party integrations (data sources, APIs, services) ... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ISA-013 | Each phase includes a decision gate to ensure quality and pr... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ISA-014 | **Core Principle:** Integration research and implementation ... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ISA-015 | Before merging to main, verify:... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ISA-016 | 2. **Mandatory Source Availability:** Verify GS1 Global, GS1... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ISA-017 | 7. ✅ Validate permissions (issue, branch, PR creation)... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ISA-018 | 4. Validate CI pipeline execution... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ISA-019 | 5. **Validation Checkpoints:** Review and validate at each p... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-020 | - Must ISA display the GS1 logo?... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
