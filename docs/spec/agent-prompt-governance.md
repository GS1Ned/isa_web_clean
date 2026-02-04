# Agent & Prompt Governance

**Canonical Specification**
**Status:** CURRENT (as-built)
**Generated:** 2026-02-03

## 1. Identity

- **Name:** Agent & Prompt Governance
- **Scope:** This specification defines the CURRENT state of agent & prompt governance within ISA.
- **Marker:** CURRENT (as-built) — not ULTIMATE (ambition/research)

## 2. Core Sources

The following documents form the authoritative basis for this specification:

1. `./ISA_GOVERNANCE.md`
2. `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md`
3. `./CHATGPT_PROMPT_BATCH_INGEST_02_04_05_06.md`
4. `./CHATGPT_UPDATE_PROMPT.md`
5. `./docs/CHATGPT_INTEGRATION_CONTRACT.md`
6. `./CHATGPT_DELEGATION_PHASE1.md`
7. `./CHATGPT_PROMPT_INGEST-03.md`
8. `./DELEGATION_PACKAGE_INGEST-03.md`
9. `./docs/AGENT_COLLABORATION_SUMMARY.md`
10. `./docs/CHANGELOG_FOR_CHATGPT.md`

## 3. Definitions

*Terms used in this specification are defined in ISA_MASTER_SPEC.md*

## 4. Invariants (MUST-level)

**INV-1:** - MUST escalate all decisions matching Lane C triggers
- Source: `./ISA_GOVERNANCE.md` > 2.2 Manus (Autonomous Development Agent)

**INV-2:** - MUST NOT proceed with escalated decisions without explicit user approval
- Source: `./ISA_GOVERNANCE.md` > 2.2 Manus (Autonomous Development Agent)

**INV-3:** - MUST NOT assume consent from user silence
- Source: `./ISA_GOVERNANCE.md` > 2.2 Manus (Autonomous Development Agent)

**INV-4:** - MUST NOT bypass governance rules for speed or convenience
- Source: `./ISA_GOVERNANCE.md` > 2.2 Manus (Autonomous Development Agent)

**INV-5:** **Description:** Manus has moderate autonomy for routine development work, with escalation required for higher-risk decisions.
- Source: `./ISA_GOVERNANCE.md` > 3.2 Lane B — Supervised Autonomy Mode

**INV-6:** When escalation is required, Manus MUST use exactly this format:
- Source: `./ISA_GOVERNANCE.md` > 4. Mandatory Escalation Format

**INV-7:** - User MUST explicitly select an option (A / B / C)
- Source: `./ISA_GOVERNANCE.md` > 4. Mandatory Escalation Format

**INV-8:** - Manus MUST NOT proceed until explicit approval received
- Source: `./ISA_GOVERNANCE.md` > 4. Mandatory Escalation Format

**INV-9:** Manus MUST perform governance self-checks:
- Source: `./ISA_GOVERNANCE.md` > 6. Governance Self-Check Requirements

**INV-10:** **Required Verifications:**
- Source: `./ISA_GOVERNANCE.md` > 6.2 Self-Check Contents

**INV-11:** - [Action 1]: [Escalation required? Yes/No] [Escalated? Yes/No]
- Source: `./ISA_GOVERNANCE.md` > 6.2 Self-Check Contents

**INV-12:** - [Action 2]: [Escalation required? Yes/No] [Escalated? Yes/No]
- Source: `./ISA_GOVERNANCE.md` > 6.2 Self-Check Contents

**INV-13:** - Manus MUST perform governance self-checks as required
- Source: `./ISA_GOVERNANCE.md` > 9.1 Compliance Monitoring

**INV-14:** 1. Manus MUST immediately halt violating activity
- Source: `./ISA_GOVERNANCE.md` > 9.2 Violation Handling

**INV-15:** 2. Manus MUST report violation to user with full details
- Source: `./ISA_GOVERNANCE.md` > 9.2 Violation Handling

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
- AC-5: - **Testing** - Run tests, validate data quality, ensure production readiness

## 9. Traceability Annex

| Claim ID | Statement (truncated) | Source |
|----------|----------------------|--------|
| AGE-001 | - Validate claims of completeness, compliance, or currency... | `./ISA_GOVERNANCE.md` |
| AGE-002 | - Recommend governance mode transitions when appropriate... | `./ISA_GOVERNANCE.md` |
| AGE-003 | - MUST escalate all decisions matching Lane C triggers... | `./ISA_GOVERNANCE.md` |
| AGE-004 | - MUST NOT proceed with escalated decisions without explicit... | `./ISA_GOVERNANCE.md` |
| AGE-005 | - MUST NOT assume consent from user silence... | `./ISA_GOVERNANCE.md` |
| AGE-006 | - MUST NOT bypass governance rules for speed or convenience... | `./ISA_GOVERNANCE.md` |
| AGE-007 | - Recommend governance improvements... | `./ISA_GOVERNANCE.md` |
| AGE-008 | **Description:** Manus has moderate autonomy for routine dev... | `./ISA_GOVERNANCE.md` |
| AGE-009 | When escalation is required, Manus MUST use exactly this for... | `./ISA_GOVERNANCE.md` |
| AGE-010 | - User MUST explicitly select an option (A / B / C)... | `./ISA_GOVERNANCE.md` |
| AGE-011 | - Manus MUST NOT proceed until explicit approval received... | `./ISA_GOVERNANCE.md` |
| AGE-012 | Manus MUST perform governance self-checks:... | `./ISA_GOVERNANCE.md` |
| AGE-013 | **Required Verifications:**... | `./ISA_GOVERNANCE.md` |
| AGE-014 | - [Action 1]: [Escalation required? Yes/No] [Escalated? Yes/... | `./ISA_GOVERNANCE.md` |
| AGE-015 | - [Action 2]: [Escalation required? Yes/No] [Escalated? Yes/... | `./ISA_GOVERNANCE.md` |
| AGE-016 | - Manus MUST perform governance self-checks as required... | `./ISA_GOVERNANCE.md` |
| AGE-017 | 1. Manus MUST immediately halt violating activity... | `./ISA_GOVERNANCE.md` |
| AGE-018 | 2. Manus MUST report violation to user with full details... | `./ISA_GOVERNANCE.md` |
| AGE-019 | 3. Manus MUST propose corrective action... | `./ISA_GOVERNANCE.md` |
| AGE-020 | 4. User MUST approve corrective action before proceeding... | `./ISA_GOVERNANCE.md` |
