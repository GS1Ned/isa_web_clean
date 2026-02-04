# Governance & IRON Protocol

**Canonical Specification**
**Status:** CURRENT (as-built)
**Generated:** 2026-02-03

## 1. Identity

- **Name:** Governance & IRON Protocol
- **Scope:** This specification defines the CURRENT state of governance & iron protocol within ISA.
- **Marker:** CURRENT (as-built) — not ULTIMATE (ambition/research)

## 2. Core Sources

The following documents form the authoritative basis for this specification:

1. `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md`
2. `./GOVERNANCE.md`
3. `./ISA_GOVERNANCE.md`
4. `./IRON_PROTOCOL.md`
5. `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md`
6. `./docs/PIPELINE_OBSERVABILITY_SPEC.md`
7. `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md`
8. `./docs/GOVERNANCE_PHASE_2_3_REPORT.md`
9. `./docs/evidence/ISA_IRON_DOCSET_AND_CRITICAL_PATH_DECISION_DRAFT_v0.md`
10. `./docs/governance/TEMPORAL_GUARDRAILS.md`

## 3. Definitions

*Terms used in this specification are defined in ISA_MASTER_SPEC.md*

## 4. Invariants (MUST-level)

**INV-1:** Any non-root task must be safely discardable without loss of configuration.
- Source: `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` > 2. Governance Principles

**INV-2:** All configuration assumptions must be written down.
- Source: `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` > 2. Governance Principles

**INV-3:** * MUST NOT be deleted
- Source: `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` > 4.3 Immutability Rules

**INV-4:** * MUST NOT be archived
- Source: `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` > 4.3 Immutability Rules

**INV-5:** * MUST NOT be duplicated
- Source: `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` > 4.3 Immutability Rules

**INV-6:** * MUST NOT be replaced
- Source: `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` > 4.3 Immutability Rules

**INV-7:** If a required variable is missing:
- Source: `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` > 5.3 Discovery Rule

**INV-8:** * All ISA tasks MUST be created by **continuing from the root task**
- Source: `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` > 6. Task Creation and Continuation Rules

**INV-9:** Manus must pause and report; a human must intervene.
- Source: `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` > 7. External Trust Boundaries

**INV-10:** Documents created inside tasks must be exported to:
- Source: `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` > 10. Manus Task Document Exports

**INV-11:** **Description:** AI agent MUST escalate all potentially impactful decisions to user.
- Source: `./GOVERNANCE.md` > Lane C: User-Decision Mode (ACTIVE)

**INV-12:** 5. **User Authority:** Silence is NOT consent; explicit approval required for Lane C triggers
- Source: `./GOVERNANCE.md` > Red-Line Principles (Inviolable)

**INV-13:** When a Lane C trigger is detected, the AI agent MUST use this format:
- Source: `./GOVERNANCE.md` > Mandatory Escalation Format

**INV-14:** 🚨 LANE C ESCALATION REQUIRED
- Source: `./GOVERNANCE.md` > Mandatory Escalation Format

**INV-15:** **Decision Required:**
- Source: `./GOVERNANCE.md` > Mandatory Escalation Format

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

- AC-1: - Validate claims of completeness, compliance, or currency
- AC-2: - Recommend governance mode transitions when appropriate
- AC-3: - Recommend governance improvements
- AC-4: 3. Run full validation suite (`validate-esg-artefacts.mjs`)
- AC-5: 3.  The `iron-gate` CI check will validate compliance.

## 9. Traceability Annex

| Claim ID | Statement (truncated) | Source |
|----------|----------------------|--------|
| GOV-001 | Any non-root task must be safely discardable without loss of... | `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` |
| GOV-002 | All configuration assumptions must be written down.... | `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` |
| GOV-003 | * MUST NOT be deleted... | `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` |
| GOV-004 | * MUST NOT be archived... | `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` |
| GOV-005 | * MUST NOT be duplicated... | `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` |
| GOV-006 | * MUST NOT be replaced... | `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` |
| GOV-007 | If a required variable is missing:... | `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` |
| GOV-008 | * All ISA tasks MUST be created by **continuing from the roo... | `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` |
| GOV-009 | Manus must pause and report; a human must intervene.... | `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` |
| GOV-010 | Documents created inside tasks must be exported to:... | `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` |
| GOV-011 | **Description:** AI agent MUST escalate all potentially impa... | `./GOVERNANCE.md` |
| GOV-012 | 5. **User Authority:** Silence is NOT consent; explicit appr... | `./GOVERNANCE.md` |
| GOV-013 | When a Lane C trigger is detected, the AI agent MUST use thi... | `./GOVERNANCE.md` |
| GOV-014 | 🚨 LANE C ESCALATION REQUIRED... | `./GOVERNANCE.md` |
| GOV-015 | **Decision Required:**... | `./GOVERNANCE.md` |
| GOV-016 | Before and after any development work, the AI agent MUST per... | `./GOVERNANCE.md` |
| GOV-017 | 4. **Decision 4 (2025-12-17):** Advisory report publication ... | `./GOVERNANCE.md` |
| GOV-018 | - Validate claims of completeness, compliance, or currency... | `./ISA_GOVERNANCE.md` |
| GOV-019 | - Recommend governance mode transitions when appropriate... | `./ISA_GOVERNANCE.md` |
| GOV-020 | - MUST escalate all decisions matching Lane C triggers... | `./ISA_GOVERNANCE.md` |
