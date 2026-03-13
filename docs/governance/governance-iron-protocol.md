# Governance & IRON Protocol

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** Governance & IRON Protocol
- **Scope:** CURRENT state of governance & iron protocol
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

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

*See ISA_MASTER_SPEC.md*

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

## 5. Interfaces / Pipelines

*See source documents.*

## 6. Governance & Change Control

1. Review source documents
2. Update TRACEABILITY_MATRIX.csv
3. Follow governance rules

## 7. Observability

**OPEN ISSUE:** Define observability hooks.

## 8. Acceptance Criteria

- AC-1: - Validate claims of completeness, compliance, or currency
- AC-2: - Recommend governance mode transitions when appropriate
- AC-3: - Recommend governance improvements
- AC-4: 3. Run full validation suite (`validate-esg-artefacts.mjs`)
- AC-5: 3.  The `iron-gate` CI check will validate compliance.

## 9. Traceability Annex

| Claim ID | Statement | Source |
|----------|-----------|--------|
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
| GOV-018 | - MUST escalate all decisions matching Lane C triggers... | `./ISA_GOVERNANCE.md` |
| GOV-019 | - MUST NOT proceed with escalated decisions without explicit... | `./ISA_GOVERNANCE.md` |
| GOV-020 | - MUST NOT assume consent from user silence... | `./ISA_GOVERNANCE.md` |
| GOV-021 | - MUST NOT bypass governance rules for speed or convenience... | `./ISA_GOVERNANCE.md` |
| GOV-022 | **Description:** Manus has moderate autonomy for routine dev... | `./ISA_GOVERNANCE.md` |
| GOV-023 | When escalation is required, Manus MUST use exactly this for... | `./ISA_GOVERNANCE.md` |
| GOV-024 | - User MUST explicitly select an option (A / B / C)... | `./ISA_GOVERNANCE.md` |
| GOV-025 | - Manus MUST NOT proceed until explicit approval received... | `./ISA_GOVERNANCE.md` |
| GOV-026 | Manus MUST perform governance self-checks:... | `./ISA_GOVERNANCE.md` |
| GOV-027 | **Required Verifications:**... | `./ISA_GOVERNANCE.md` |
| GOV-028 | - [Action 1]: [Escalation required? Yes/No] [Escalated? Yes/... | `./ISA_GOVERNANCE.md` |
| GOV-029 | - [Action 2]: [Escalation required? Yes/No] [Escalated? Yes/... | `./ISA_GOVERNANCE.md` |
| GOV-030 | - Manus MUST perform governance self-checks as required... | `./ISA_GOVERNANCE.md` |
| GOV-031 | 1. Manus MUST immediately halt violating activity... | `./ISA_GOVERNANCE.md` |
| GOV-032 | 2. Manus MUST report violation to user with full details... | `./ISA_GOVERNANCE.md` |
| GOV-033 | 3. Manus MUST propose corrective action... | `./ISA_GOVERNANCE.md` |
| GOV-034 | 4. User MUST approve corrective action before proceeding... | `./ISA_GOVERNANCE.md` |
| GOV-035 | 5. Violation MUST be documented in governance history... | `./ISA_GOVERNANCE.md` |
| GOV-036 | - **Critical:** Red-line principle violated (immediate halt ... | `./ISA_GOVERNANCE.md` |
| GOV-037 | - **High:** Escalation bypassed (immediate user notification... | `./ISA_GOVERNANCE.md` |
| GOV-038 | - **Medium:** Escalation format not followed (correction req... | `./ISA_GOVERNANCE.md` |
| GOV-039 | - Obligation to perform governance self-checks as required... | `./ISA_GOVERNANCE.md` |
| GOV-040 | - Assert GS1 as legally required in any UI or API output... | `./ISA_GOVERNANCE.md` |
| GOV-041 | > **GS1 is never legally required.**... | `./ISA_GOVERNANCE.md` |
| GOV-042 | GS1 standards may support compliance activities but are not ... | `./ISA_GOVERNANCE.md` |
| GOV-043 | / Assert GS1 as legally required / GS1 is infrastructure, ne... | `./ISA_GOVERNANCE.md` |
| GOV-044 | / Use over-claim phrases / "ensures compliance", "required b... | `./ISA_GOVERNANCE.md` |
| GOV-045 | This artefact set is the single source of truth for GS1 rele... | `./ISA_GOVERNANCE.md` |
| GOV-046 | Execution **must halt** if an **IRON CONFLICT** is detected.... | `./IRON_PROTOCOL.md` |
| GOV-047 | When an IRON CONFLICT occurs, the agent must:... | `./IRON_PROTOCOL.md` |
| GOV-048 | Every PR must pass the IRON Gate:... | `./IRON_PROTOCOL.md` |
| GOV-049 | / **Context Acknowledgement** / PR description must contain ... | `./IRON_PROTOCOL.md` |
| GOV-050 | / **Context Freshness** / The hash must be a valid ancestor ... | `./IRON_PROTOCOL.md` |
| GOV-051 | / **Inventory Integrity** / `isa.inventory.json` must not be... | `./IRON_PROTOCOL.md` |
| GOV-052 | 2.  Developer/agent must record a decision (IN/OUT/IGNORE) i... | `./IRON_PROTOCOL.md` |
| GOV-053 | **This protocol is now active. All ISA development must comp... | `./IRON_PROTOCOL.md` |
| GOV-054 | - **Escalation Required:** ✅ YES (Creating third-party conne... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| GOV-055 | - This action would have required escalation under Lane C... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| GOV-056 | - **Escalation Required:** ✅ YES (Creating authentication to... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| GOV-057 | - **Escalation Required:** ❌ NO (Writing code and documentat... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| GOV-058 | - This action would NOT have required escalation under Lane ... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| GOV-059 | - **Escalation Required:** ❌ NO (Testing and validation)... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| GOV-060 | - **Escalation Required:** ⚠️ DEPENDS (Policy change if scop... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| GOV-061 | - This action would likely NOT have required escalation unde... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| GOV-062 | - **Escalation Required:** ⚠️ SPECIAL CASE (Implementing gov... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| GOV-063 | - No escalation required when executing direct user instruct... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| GOV-064 | - **Escalation Required:** ❌ NO (Documentation)... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| GOV-065 | - User action required to configure branch protection via Gi... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| GOV-066 | **Impact:** Potential development disruption if schema impor... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| GOV-067 | - User action required to enable at org level... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| GOV-068 | 1. **User Action Required:** Configure branch protection on ... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| GOV-069 | 2. **User Decision Required:** Determine ISA license... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| GOV-070 | - I will perform governance self-checks as required... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| GOV-071 | 2. Check data quality (no nulls in required fields)... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| GOV-072 | - Null values in required fields... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| GOV-073 | - Validate claims of completeness, compliance, or currency... | `./ISA_GOVERNANCE.md` |
| GOV-074 | - Recommend governance mode transitions when appropriate... | `./ISA_GOVERNANCE.md` |
| GOV-075 | - Recommend governance improvements... | `./ISA_GOVERNANCE.md` |
| GOV-076 | 3. Run full validation suite (`validate-esg-artefacts.mjs`)... | `./ISA_GOVERNANCE.md` |
| GOV-077 | 3.  The `iron-gate` CI check will validate compliance.... | `./IRON_PROTOCOL.md` |
| GOV-078 | - Ensure procedures are comprehensive and current... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| GOV-079 | - Validate security monitoring is working... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| GOV-080 | - [ ] Verify dashboard UI rendering... | `./docs/PIPELINE_OBSERVABILITY_SPEC.md` |
| GOV-081 | - **Testing** - Run tests, validate data quality, ensure pro... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| GOV-082 | 2. Verify data files exist in `/data/` directories... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| GOV-083 | 2. Validate structure and completeness... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| GOV-084 | 1. Verify record counts in database... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| GOV-085 | 4. Validate downstream features work... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| GOV-086 | 3. **Automate integration** - Use scripts to extract and val... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| GOV-087 | 4. **Test thoroughly** - Ensure tests cover edge cases... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| GOV-088 | - **Action Required:** Authenticate GitHub CLI or sync codeb... | `./docs/GOVERNANCE_PHASE_2_3_REPORT.md` |
| GOV-089 | - The **canonical document set** that constitutes “IRON in p... | `./docs/evidence/ISA_IRON_DOCSET_AND_CRITICAL_PATH_DECISION_DRAFT_v0.md` |
| GOV-090 | 7. `scripts/iron-context.sh` — context acknowledgement gener... | `./docs/evidence/ISA_IRON_DOCSET_AND_CRITICAL_PATH_DECISION_DRAFT_v0.md` |
| GOV-091 | **NOTE:** Whether they are already located in the *correct r... | `./docs/evidence/ISA_IRON_DOCSET_AND_CRITICAL_PATH_DECISION_DRAFT_v0.md` |
| GOV-092 | When Manus is asked to “operate under IRON”, it must:... | `./docs/evidence/ISA_IRON_DOCSET_AND_CRITICAL_PATH_DECISION_DRAFT_v0.md` |
| GOV-093 | > **Temporal accuracy is a foundational requirement for ISA'... | `./docs/governance/TEMPORAL_GUARDRAILS.md` |
| GOV-094 | - All document generation tasks must reference the system pr... | `./docs/governance/TEMPORAL_GUARDRAILS.md` |
| GOV-095 | - LLM-generated dates must match the system prompt date unle... | `./docs/governance/TEMPORAL_GUARDRAILS.md` |
| GOV-096 | **Rule 2: Explicit Date Acknowledgment Required**... | `./docs/governance/TEMPORAL_GUARDRAILS.md` |
| GOV-097 | - All document generation prompts must include explicit curr... | `./docs/governance/TEMPORAL_GUARDRAILS.md` |
| GOV-098 | - LLM must acknowledge current date before generating docume... | `./docs/governance/TEMPORAL_GUARDRAILS.md` |
| GOV-099 | - Date acknowledgment must be validated before proceeding wi... | `./docs/governance/TEMPORAL_GUARDRAILS.md` |
| GOV-100 | Today is 17 December 2025. All documents created today must ... | `./docs/governance/TEMPORAL_GUARDRAILS.md` |
