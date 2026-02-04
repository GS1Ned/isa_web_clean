# Evaluation Governance & Reproducibility

**Canonical Specification**
**Status:** CURRENT (as-built)
**Generated:** 2026-02-03

## 1. Identity

- **Name:** Evaluation Governance & Reproducibility
- **Scope:** This specification defines the CURRENT state of evaluation governance & reproducibility within ISA.
- **Marker:** CURRENT (as-built) — not ULTIMATE (ambition/research)

## 2. Core Sources

The following documents form the authoritative basis for this specification:

1. `./docs/PIPELINE_OBSERVABILITY_SPEC.md`
2. `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md`
3. `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md`
4. `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md`
5. `./docs/evidence/ISA_IRON_DOCSET_AND_CRITICAL_PATH_DECISION_DRAFT_v0.md`
6. `./docs/gs1_research/feasibility_assessment.md`
7. `./EXTERNAL_REFERENCES.md`
8. `./ISA_DEVELOPMENT_PLAYBOOK.md`
9. `./README.md`
10. `./docs/CRITICAL_EVENTS_TAXONOMY.md`

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

*See source documents for detailed observability requirements.*

## 8. Acceptance Criteria / IRON Gates

- AC-1: - [ ] Verify dashboard UI rendering
- AC-2: - Ensure procedures are comprehensive and current
- AC-3: - Validate security monitoring is working
- AC-4: - **Testing** - Run tests, validate data quality, ensure production readiness
- AC-5: 2. Verify data files exist in `/data/` directories

## 9. Traceability Annex

| Claim ID | Statement (truncated) | Source |
|----------|----------------------|--------|
| EVA-001 | - [ ] Verify dashboard UI rendering... | `./docs/PIPELINE_OBSERVABILITY_SPEC.md` |
| EVA-002 | - **Escalation Required:** ✅ YES (Creating third-party conne... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-003 | - This action would have required escalation under Lane C... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-004 | - **Escalation Required:** ✅ YES (Creating authentication to... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-005 | - **Escalation Required:** ❌ NO (Writing code and documentat... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-006 | - This action would NOT have required escalation under Lane ... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-007 | - **Escalation Required:** ❌ NO (Testing and validation)... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-008 | - **Escalation Required:** ⚠️ DEPENDS (Policy change if scop... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-009 | - This action would likely NOT have required escalation unde... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-010 | - **Escalation Required:** ⚠️ SPECIAL CASE (Implementing gov... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-011 | - No escalation required when executing direct user instruct... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-012 | - **Escalation Required:** ❌ NO (Documentation)... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-013 | - User action required to configure branch protection via Gi... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-014 | **Impact:** Potential development disruption if schema impor... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-015 | - User action required to enable at org level... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-016 | 1. **User Action Required:** Configure branch protection on ... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-017 | 2. **User Decision Required:** Determine ISA license... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-018 | - Ensure procedures are comprehensive and current... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-019 | - Validate security monitoring is working... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-020 | - I will perform governance self-checks as required... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
