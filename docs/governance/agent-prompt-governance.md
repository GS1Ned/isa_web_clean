# Agent & Prompt Governance

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** Agent & Prompt Governance
- **Scope:** CURRENT state of agent & prompt governance
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

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

*See ISA_MASTER_SPEC.md*

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
- AC-5: - **Testing** - Run tests, validate data quality, ensure production readiness

## 9. Traceability Annex

| Claim ID | Statement | Source |
|----------|-----------|--------|
| AGE-001 | - MUST escalate all decisions matching Lane C triggers... | `./ISA_GOVERNANCE.md` |
| AGE-002 | - MUST NOT proceed with escalated decisions without explicit... | `./ISA_GOVERNANCE.md` |
| AGE-003 | - MUST NOT assume consent from user silence... | `./ISA_GOVERNANCE.md` |
| AGE-004 | - MUST NOT bypass governance rules for speed or convenience... | `./ISA_GOVERNANCE.md` |
| AGE-005 | **Description:** Manus has moderate autonomy for routine dev... | `./ISA_GOVERNANCE.md` |
| AGE-006 | When escalation is required, Manus MUST use exactly this for... | `./ISA_GOVERNANCE.md` |
| AGE-007 | - User MUST explicitly select an option (A / B / C)... | `./ISA_GOVERNANCE.md` |
| AGE-008 | - Manus MUST NOT proceed until explicit approval received... | `./ISA_GOVERNANCE.md` |
| AGE-009 | Manus MUST perform governance self-checks:... | `./ISA_GOVERNANCE.md` |
| AGE-010 | **Required Verifications:**... | `./ISA_GOVERNANCE.md` |
| AGE-011 | - [Action 1]: [Escalation required? Yes/No] [Escalated? Yes/... | `./ISA_GOVERNANCE.md` |
| AGE-012 | - [Action 2]: [Escalation required? Yes/No] [Escalated? Yes/... | `./ISA_GOVERNANCE.md` |
| AGE-013 | - Manus MUST perform governance self-checks as required... | `./ISA_GOVERNANCE.md` |
| AGE-014 | 1. Manus MUST immediately halt violating activity... | `./ISA_GOVERNANCE.md` |
| AGE-015 | 2. Manus MUST report violation to user with full details... | `./ISA_GOVERNANCE.md` |
| AGE-016 | 3. Manus MUST propose corrective action... | `./ISA_GOVERNANCE.md` |
| AGE-017 | 4. User MUST approve corrective action before proceeding... | `./ISA_GOVERNANCE.md` |
| AGE-018 | 5. Violation MUST be documented in governance history... | `./ISA_GOVERNANCE.md` |
| AGE-019 | - **Critical:** Red-line principle violated (immediate halt ... | `./ISA_GOVERNANCE.md` |
| AGE-020 | - **High:** Escalation bypassed (immediate user notification... | `./ISA_GOVERNANCE.md` |
| AGE-021 | - **Medium:** Escalation format not followed (correction req... | `./ISA_GOVERNANCE.md` |
| AGE-022 | - Obligation to perform governance self-checks as required... | `./ISA_GOVERNANCE.md` |
| AGE-023 | - Assert GS1 as legally required in any UI or API output... | `./ISA_GOVERNANCE.md` |
| AGE-024 | > **GS1 is never legally required.**... | `./ISA_GOVERNANCE.md` |
| AGE-025 | GS1 standards may support compliance activities but are not ... | `./ISA_GOVERNANCE.md` |
| AGE-026 | / Assert GS1 as legally required / GS1 is infrastructure, ne... | `./ISA_GOVERNANCE.md` |
| AGE-027 | / Use over-claim phrases / "ensures compliance", "required b... | `./ISA_GOVERNANCE.md` |
| AGE-028 | This artefact set is the single source of truth for GS1 rele... | `./ISA_GOVERNANCE.md` |
| AGE-029 | 2. Check data quality (no nulls in required fields)... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| AGE-030 | - Null values in required fields... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| AGE-031 | - Validate claims of completeness, compliance, or currency... | `./ISA_GOVERNANCE.md` |
| AGE-032 | - Recommend governance mode transitions when appropriate... | `./ISA_GOVERNANCE.md` |
| AGE-033 | - Recommend governance improvements... | `./ISA_GOVERNANCE.md` |
| AGE-034 | 3. Run full validation suite (`validate-esg-artefacts.mjs`)... | `./ISA_GOVERNANCE.md` |
| AGE-035 | - **Testing** - Run tests, validate data quality, ensure pro... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| AGE-036 | 2. Verify data files exist in `/data/` directories... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| AGE-037 | 2. Validate structure and completeness... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| AGE-038 | 1. Verify record counts in database... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| AGE-039 | 4. Validate downstream features work... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| AGE-040 | 3. **Automate integration** - Use scripts to extract and val... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| AGE-041 | 4. **Test thoroughly** - Ensure tests cover edge cases... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| AGE-042 | - Don't skip raw tables - they're required for audit and deb... | `./CHATGPT_PROMPT_BATCH_INGEST_02_04_05_06.md` |
| AGE-043 | required: boolean("required").default(false),... | `./CHATGPT_PROMPT_BATCH_INGEST_02_04_05_06.md` |
| AGE-044 | ruleType: varchar("rule_type", { length: 50 }), // e.g., "re... | `./CHATGPT_PROMPT_BATCH_INGEST_02_04_05_06.md` |
| AGE-045 | "required": false... | `./CHATGPT_PROMPT_BATCH_INGEST_02_04_05_06.md` |
| AGE-046 | "ruleType": "required",... | `./CHATGPT_PROMPT_BATCH_INGEST_02_04_05_06.md` |
| AGE-047 | "errorMessage": "Peg hole type is required"... | `./CHATGPT_PROMPT_BATCH_INGEST_02_04_05_06.md` |
| AGE-048 | required: boolean("required").default(true),... | `./CHATGPT_PROMPT_BATCH_INGEST_02_04_05_06.md` |
| AGE-049 | - What you must deliver (4-5 files)... | `./CHATGPT_UPDATE_PROMPT.md` |
| AGE-050 | **Must include:**... | `./CHATGPT_UPDATE_PROMPT.md` |
| AGE-051 | 8. **Don't skip documentation** - README is required... | `./CHATGPT_UPDATE_PROMPT.md` |
| AGE-052 | // Required fields... | `./docs/CHATGPT_INTEGRATION_CONTRACT.md` |
| AGE-053 | - `url`: Must be valid HTTPS URL to authoritative source... | `./docs/CHATGPT_INTEGRATION_CONTRACT.md` |
| AGE-054 | - `description`: Required, no max length (text field)... | `./docs/CHATGPT_INTEGRATION_CONTRACT.md` |
| AGE-055 | - **Required:** UPPERCASE filenames with underscores (e.g., ... | `./docs/CHATGPT_INTEGRATION_CONTRACT.md` |
| AGE-056 | - **Required:** `.md` extension (Markdown format)... | `./docs/CHATGPT_INTEGRATION_CONTRACT.md` |
| AGE-057 | - **Required:** British English spelling throughout... | `./docs/CHATGPT_INTEGRATION_CONTRACT.md` |
| AGE-058 | - **Required:** GS1 Style Guide Release 5.6 compliance (see ... | `./docs/CHATGPT_INTEGRATION_CONTRACT.md` |
| AGE-059 | - MUST cite advisory IDs, dataset IDs, versions... | `./docs/CHATGPT_INTEGRATION_CONTRACT.md` |
| AGE-060 | - Universal source metadata model (required fields)... | `./CHATGPT_DELEGATION_PHASE1.md` |
| AGE-061 | - **Dependency Assumptions** - What Manus guarantees, what C... | `./docs/AGENT_COLLABORATION_SUMMARY.md` |
| AGE-062 | Before delegating a task, Manus must:... | `./docs/AGENT_COLLABORATION_SUMMARY.md` |
| AGE-063 | Manus must NOT change logic, algorithms, or interfaces witho... | `./docs/AGENT_COLLABORATION_SUMMARY.md` |
| AGE-064 | - Any changes to shared interfaces must be documented in `do... | `./docs/ISA_AGENT_COLLABORATION.md` |
| AGE-065 | - ChatGPT must implement against the specified interface ver... | `./docs/ISA_AGENT_COLLABORATION.md` |
| AGE-066 | ChatGPT must:... | `./docs/ISA_AGENT_COLLABORATION.md` |
| AGE-067 | ❌ **Timing-sensitive** - Must be coordinated with other chan... | `./docs/ISA_AGENT_COLLABORATION.md` |
| AGE-068 | - If changes are required:... | `./docs/ISA_AGENT_COLLABORATION.md` |
| AGE-069 | 3. Run `pnpm test` (all tests must pass)... | `./docs/ISA_AGENT_COLLABORATION.md` |
| AGE-070 | - **Strict mode:** All code must pass `tsc --noEmit` with st... | `./docs/ISA_AGENT_COLLABORATION.md` |
| AGE-071 | - **JSDoc:** All exported functions must have JSDoc comments... | `./docs/ISA_AGENT_COLLABORATION.md` |
| AGE-072 | - [ ] All required interfaces are defined and frozen... | `./docs/ISA_AGENT_COLLABORATION.md` |
| AGE-073 | Generate **30 example queries** distributed across **6 categ... | `./docs/CHATGPT_WORK_PARCEL_02_ASK_ISA_EXPANSION.md` |
| AGE-074 | 4. **Citations required** (advisory IDs, dataset IDs, sectio... | `./docs/CHATGPT_WORK_PARCEL_02_ASK_ISA_EXPANSION.md` |
| AGE-075 | / # / Query Text / Category / Sector / Expected Answer / Cit... | `./docs/CHATGPT_WORK_PARCEL_02_ASK_ISA_EXPANSION.md` |
| AGE-076 | - "All new documents must use 2025 as the current year"... | `./docs/governance/DATE_INTEGRITY_AUDIT.md` |
| AGE-077 | **IMMEDIATE CORRECTION REQUIRED**... | `./docs/governance/DATE_INTEGRITY_AUDIT.md` |
| AGE-078 | All five canonical documents must be corrected before:... | `./docs/governance/DATE_INTEGRITY_AUDIT.md` |
| AGE-079 | **Explicit date validation must be built into prompts and wo... | `./docs/governance/DATE_INTEGRITY_AUDIT.md` |
| AGE-080 | Cannot rely on LLM to "know" the current date. Must explicit... | `./docs/governance/DATE_INTEGRITY_AUDIT.md` |
| AGE-081 | This issue poses HIGH RISK to ISA's regulatory traceability,... | `./docs/governance/DATE_INTEGRITY_AUDIT.md` |
| AGE-082 | 5. **Integration automation** - Scripts to extract and valid... | `./CHATGPT_UPDATE_PROMPT.md` |
| AGE-083 | - Run tests and validate data quality... | `./CHATGPT_UPDATE_PROMPT.md` |
| AGE-084 | 3. Unclear: Should I normalize <field> or keep raw?... | `./CHATGPT_UPDATE_PROMPT.md` |
| AGE-085 | All new documentation files should be placed in:... | `./docs/CHATGPT_INTEGRATION_CONTRACT.md` |
| AGE-086 | Generate 12 canonical documentation files for ISA (Intellige... | `./CHATGPT_DELEGATION_PHASE1.md` |
| AGE-087 | 3. Ensure consistency across documents (terminology, scope, ... | `./CHATGPT_DELEGATION_PHASE1.md` |
| AGE-088 | 3. Verify cross-references and consistency... | `./CHATGPT_DELEGATION_PHASE1.md` |
| AGE-089 | it('should ingest records successfully', async () => {... | `./CHATGPT_PROMPT_INGEST-03.md` |
| AGE-090 | it('should be idempotent', async () => {... | `./CHATGPT_PROMPT_INGEST-03.md` |
| AGE-091 | it('should respect dry-run mode', async () => {... | `./CHATGPT_PROMPT_INGEST-03.md` |
| AGE-092 | it('should respect limit option', async () => {... | `./CHATGPT_PROMPT_INGEST-03.md` |
| AGE-093 | 7. Verify record counts in database... | `./DELEGATION_PACKAGE_INGEST-03.md` |
| AGE-094 | - Verify prerequisites... | `./docs/AGENT_COLLABORATION_SUMMARY.md` |
| AGE-095 | 3. Manus will validate, test, and commit... | `./docs/AGENT_COLLABORATION_SUMMARY.md` |
| AGE-096 | 3. Verify task spec exists... | `./docs/AGENT_COLLABORATION_SUMMARY.md` |
| AGE-097 | - **Always check this file** before starting a task to ensur... | `./docs/CHANGELOG_FOR_CHATGPT.md` |
| AGE-098 | - [ ] Verify integration points work... | `./docs/ISA_AGENT_COLLABORATION.md` |
| AGE-099 | ChatGPT should:... | `./docs/ISA_AGENT_COLLABORATION.md` |
| AGE-100 | **Manus's job:** Integrate your deliverables, run tests, fix... | `./tasks/for_chatgpt/_CHATGPT_INSTRUCTIONS.md` |
