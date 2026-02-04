# Repo Structure / Change Control / Release Discipline

**Canonical Specification**
**Status:** CURRENT (as-built)
**Generated:** 2026-02-03

## 1. Identity

- **Name:** Repo Structure / Change Control / Release Discipline
- **Scope:** This specification defines the CURRENT state of repo structure / change control / release discipline within ISA.
- **Marker:** CURRENT (as-built) — not ULTIMATE (ambition/research)

## 2. Core Sources

The following documents form the authoritative basis for this specification:

1. `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md`
2. `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md`
3. `./ISA_DEVELOPMENT_PLAYBOOK.md`
4. `./ROADMAP_GITHUB_INTEGRATION.md`
5. `./docs/GITHUB_PROVISIONING_REPORT.md`
6. `./docs/GOVERNANCE_PHASE_2_3_REPORT.md`
7. `./docs/GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md`
8. `./docs/ISA_First_Advisory_Report_GS1NL.md`
9. `./docs/ISA_Strategic_Insights_from_Reports.md`
10. `./docs/ISA_WORKFLOW_IMPROVEMENTS.md`

## 3. Definitions

*Terms used in this specification are defined in ISA_MASTER_SPEC.md*

## 4. Invariants (MUST-level)

**INV-1:** - **Escalation Required:** ✅ YES (Creating third-party connection)
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 1: Created GitHub Repository (GS1-ISA/isa)

**INV-2:** - This action would have required escalation under Lane C
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 1: Created GitHub Repository (GS1-ISA/isa)

**INV-3:** - **Escalation Required:** ✅ YES (Creating authentication token)
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 2: Configured Fine-Grained Personal Access Token

**INV-4:** - **Escalation Required:** ❌ NO (Writing code and documentation)
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 3: Pushed Initial Repository Structure

**INV-5:** - This action would NOT have required escalation under Lane C
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 3: Pushed Initial Repository Structure

**INV-6:** - **Escalation Required:** ❌ NO (Testing and validation)
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 4: Created Issue #1 and PR #2 for Validation

**INV-7:** - **Escalation Required:** ⚠️ DEPENDS (Policy change if scope modified)
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 5: Updated ISA Development Roadmaps

**INV-8:** - This action would likely NOT have required escalation under Lane C
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 5: Updated ISA Development Roadmaps

**INV-9:** - **Escalation Required:** ⚠️ SPECIAL CASE (Implementing governance framework as directed)
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 6: Created ISA_GOVERNANCE.md

**INV-10:** - No escalation required when executing direct user instructions
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 6: Created ISA_GOVERNANCE.md

**INV-11:** - **Escalation Required:** ❌ NO (Documentation)
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 7: Created README.md with Governance References

**INV-12:** - User action required to configure branch protection via GitHub UI
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Risk 2: Branch Protection Not Yet Configured

**INV-13:** **Impact:** Potential development disruption if schema import is required.
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Risk 3: Database Schema Error (Pre-Existing)

**INV-14:** - User action required to enable at org level
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Risk 5: Security Features Not Yet Enabled (Org-Level)

**INV-15:** 1. **User Action Required:** Configure branch protection on GitHub repository main branch
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Immediate (Next 24 Hours)

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

- AC-1: - Ensure procedures are comprehensive and current
- AC-2: - Validate security monitoring is working
- AC-3: - **Testing** - Run tests, validate data quality, ensure production readiness
- AC-4: 2. Verify data files exist in `/data/` directories
- AC-5: 2. Validate structure and completeness

## 9. Traceability Annex

| Claim ID | Statement (truncated) | Source |
|----------|----------------------|--------|
| REP-001 | - **Escalation Required:** ✅ YES (Creating third-party conne... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-002 | - This action would have required escalation under Lane C... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-003 | - **Escalation Required:** ✅ YES (Creating authentication to... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-004 | - **Escalation Required:** ❌ NO (Writing code and documentat... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-005 | - This action would NOT have required escalation under Lane ... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-006 | - **Escalation Required:** ❌ NO (Testing and validation)... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-007 | - **Escalation Required:** ⚠️ DEPENDS (Policy change if scop... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-008 | - This action would likely NOT have required escalation unde... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-009 | - **Escalation Required:** ⚠️ SPECIAL CASE (Implementing gov... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-010 | - No escalation required when executing direct user instruct... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-011 | - **Escalation Required:** ❌ NO (Documentation)... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-012 | - User action required to configure branch protection via Gi... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-013 | **Impact:** Potential development disruption if schema impor... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-014 | - User action required to enable at org level... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-015 | 1. **User Action Required:** Configure branch protection on ... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-016 | 2. **User Decision Required:** Determine ISA license... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-017 | - Ensure procedures are comprehensive and current... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-018 | - Validate security monitoring is working... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-019 | - I will perform governance self-checks as required... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-020 | - **Testing** - Run tests, validate data quality, ensure pro... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
