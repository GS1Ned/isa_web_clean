# ISA Conflict Register (Canonical)

**Last Updated:** 2026-02-05  
**Scope:** Governance conflicts between canonical specifications, governance docs, and execution procedures.  
**Status:** Active tracking of unresolved conflicts; designed for governance-grade audit traceability.

---

## 1. Purpose

This document is the canonical register for governance conflicts in the ISA project.

A **conflict** is defined as:

> Two or more authoritative artifacts making incompatible statements, requirements, or assumptions that cannot simultaneously be true.

Conflicts must be tracked to:

- prevent silent governance drift
- prevent assumptions from becoming “facts”
- enforce evidence-first resolution
- support STOP rules during audits

---

## 2. Status and Statistics

### 2.1 Lifecycle Statuses

| Status | Meaning |
|---|---|
| OPEN | Conflict is identified and not yet resolved |
| RESOLVED | Resolution is recorded and applied to canonical artifacts |
| ESCALATED | Conflict cannot be resolved locally; requires decision-level resolution |
| DEFERRED | Conflict is tracked but non-blocking until a later phase |

### 2.2 Current Snapshot

| Metric | Count |
|---|---:|
| Total Conflicts | 54 |
| High Priority | 25 |
| Medium Priority | 29 |
| Low Priority | 0 |

---

## 3. Conflict Classes (Taxonomy)

| Class | Description | Example |
|---|---|---|
| governance_authority | Conflicts about precedence and authority | “Which doc overrides?” |
| canonical_definition | Canonical source-of-truth conflicts | “Where is canonical spec?” |
| lifecycle_process | Process conflicts | “When does Phase closure happen?” |
| evidence_requirements | Evidence and verification conflicts | “What evidence is required?” |
| secrets_handling | Secrets handling and security constraints | “Where can secrets be stored?” |
| ui_protocol_conflict | UI/tool instructions conflict with repo governance | “UI says X, governance says Y” |
| naming_structure | Repo layout and naming conflicts | “Folder structure mismatch” |
| enforcement_rules | Gate checks and enforcement inconsistencies | “Gate says pass, docs say fail” |

---

## 4. Conflict Summary (Synthesis Conflicts)

The following table tracks the **most important synthesis-level conflicts** that materially affect governance correctness.

| Conflict ID | Cluster | Topic | Priority | Status | Owner |
|---|---|---|---|---|---|
| CONF-001 | Authority & Precedence | instruction_hierarchy | Medium | OPEN | TBD |
| CONF-002 | Authority & Precedence | canonical_override | Medium | OPEN | TBD |
| CONF-003 | Canonical Specs | spec_file_set_definition | Medium | OPEN | TBD |
| CONF-004 | Canonical Specs | canonical_location | Medium | OPEN | TBD |
| CONF-005 | Governance Execution | audit_procedure | Medium | OPEN | TBD |
| CONF-006 | Governance Execution | stop_rules | Medium | OPEN | TBD |
| CONF-007 | Evidence Rules | evidence_threshold | Medium | OPEN | TBD |
| CONF-008 | Evidence Rules | falsification_requirement | Medium | OPEN | TBD |
| CONF-009 | Repo Structure | naming_conventions | Medium | OPEN | TBD |
| CONF-010 | Repo Structure | folder_authority | Medium | OPEN | TBD |
| CONF-011 | Governance Lifecycle | phase_closure | Medium | OPEN | TBD |
| CONF-012 | Governance Lifecycle | phase_readiness | Medium | OPEN | TBD |
| CONF-013 | Governance Lifecycle | roadmap_updates | Medium | OPEN | TBD |
| CONF-014 | Enforcement | gate_requirements | Medium | OPEN | TBD |
| CONF-015 | Enforcement | rejection_criteria | Medium | OPEN | TBD |
| CONF-016 | Canonicalization | deprecation_policy | Medium | OPEN | TBD |
| CONF-017 | Canonicalization | decision_log_binding | Medium | OPEN | TBD |
| CONF-018 | Traceability | matrix_authority | Medium | OPEN | TBD |
| CONF-019 | Traceability | conflict_register_binding | Medium | OPEN | TBD |
| CONF-020 | Traceability | evidence_pack_requirements | Medium | OPEN | TBD |
| CONF-021 | Security | secrets_storage | Medium | OPEN | TBD |
| CONF-022 | Security | secrets_in_docs | Medium | OPEN | TBD |
| CONF-023 | Security | secrets_in_prs | Medium | OPEN | TBD |
| CONF-024 | Security | secrets_in_logs | Medium | OPEN | TBD |
| CONF-025 | Security | secrets_in_manus | Medium | OPEN | TBD |
| CONF-026 | Security | secrets_in_github_actions | Medium | OPEN | TBD |
| CONF-027 | Security | secrets_rotation | Medium | OPEN | TBD |
| CONF-028 | Compliance | regulation_currency | Medium | OPEN | TBD |
| CONF-029 | Compliance | source_rank_order | Medium | OPEN | TBD |
| CONF-030 | Compliance | evidence_linking | Medium | OPEN | TBD |
| CONF-031 | Data | embeddings_grounding | Medium | OPEN | TBD |
| CONF-032 | Data | retrieval_priority | Medium | OPEN | TBD |
| CONF-033 | Data | metadata_schema | Medium | OPEN | TBD |
| CONF-034 | Data | knowledge_graph_scope | Medium | OPEN | TBD |
| CONF-035 | UX | user_journey_authority | Medium | OPEN | TBD |
| CONF-036 | UX | acceptance_criteria | Medium | OPEN | TBD |
| CONF-037 | Observability | tracing_requirements | Medium | OPEN | TBD |
| CONF-038 | Observability | logging_policy | Medium | OPEN | TBD |
| CONF-039 | Repo Change Control | branching_policy | Medium | OPEN | TBD |
| CONF-040 | Repo Change Control | release_process | Medium | OPEN | TBD |
| CONF-041 | Repo Change Control | rollback_rules | Medium | OPEN | TBD |
| CONF-042 | Execution | automation_scope | Medium | OPEN | TBD |
| CONF-043 | Execution | task_boundaries | Medium | OPEN | TBD |
| CONF-044 | Execution | read_only_vs_write | Medium | OPEN | TBD |
| CONF-045 | Governance Execution | audit_invalidity | Medium | OPEN | TBD |
| CONF-046 | Canonicalization | spec_validation | Medium | OPEN | TBD |
| CONF-047 | Canonicalization | spec_versioning | Medium | OPEN | TBD |
| CONF-048 | Authority & Precedence | ui_vs_repo | Medium | OPEN | TBD |
| CONF-049 | Authority & Precedence | tool_instructions | Medium | OPEN | TBD |
| CONF-050 | Enforcement | stale_catalogue_threshold | Medium | OPEN | TBD |
| CONF-051 | Enforcement | gate_failure_policy | Medium | OPEN | TBD |
| CONF-052 | Governance Lifecycle | readiness_definition | Medium | OPEN | TBD |
| CONF-053 | Governance Lifecycle | governance_drift | Medium | OPEN | TBD |
| CONF-054 | Secrets Handling / UI Protocol | secrets_handling_ui_protocol | High | OPEN | TBD |

---

## 5. Detailed Conflict Entries (Audit Traceability)

The following entries provide detailed descriptions and evidence requirements for each conflict.

---

### CONF-001 — Authority & Precedence: instruction_hierarchy

**Priority:** Medium  
**Status:** OPEN  
**Class:** governance_authority

**Conflict:** Documents define multiple instruction hierarchies inconsistently.

**Competing Statements:**
- Some docs imply “Non-Negotiables > governance docs > specs > task prompts”
- Others imply “specs override governance docs” in certain situations

**Impact:** Ambiguity causes inconsistent enforcement and invalid governance conclusions.

**Evidence (required):**
- Identify all places where instruction hierarchy is defined
- Quote exact competing passages (≤25 words each) with file paths

**Next Action:** Determine authoritative hierarchy and update all canonical artifacts to match.

---

### CONF-002 — Authority & Precedence: canonical_override

**Priority:** Medium  
**Status:** OPEN  
**Class:** governance_authority

**Conflict:** Whether canonical specs override governance docs is stated inconsistently.

**Competing Statements:**
- “Canonical specs are highest authority for technical requirements”
- “Governance docs dictate execution and enforcement even over specs”

**Impact:** Can cause incorrect enforcement decisions and invalid PR reviews.

**Evidence (required):**
- Identify conflicting statements across docs/spec and docs/governance

**Next Action:** Clarify scope of “technical authority” vs “execution authority”.

---

### CONF-003 — Canonical Specs: spec_file_set_definition

**Priority:** Medium  
**Status:** OPEN  
**Class:** canonical_definition

**Conflict:** Different documents define different sets of “canonical spec files”.

**Impact:** Audits can falsely claim missing files or completeness.

**Evidence (required):**
- List all documents enumerating canonical spec sets
- Compare to actual repo state (with repo ref + ls/find transcripts)

**Next Action:** Canonicalize the canonical-set definition.

---

### CONF-004 — Canonical Specs: canonical_location

**Priority:** Medium  
**Status:** OPEN  
**Class:** canonical_definition

**Conflict:** Some artifacts reference canonical specs outside docs/spec/.

**Impact:** Confusion about source of truth; risk of drift.

**Evidence (required):**
- Locate references to canonical specs in other folders

**Next Action:** Normalize references to docs/spec/ or explicitly document exceptions.

---

### CONF-005 — Governance Execution: audit_procedure

**Priority:** Medium  
**Status:** OPEN  
**Class:** lifecycle_process

**Conflict:** Audit procedures are described in multiple places with subtle differences.

**Impact:** Procedural invalidity risk.

**Evidence (required):**
- Compare audit procedures across governance docs

**Next Action:** Consolidate into a single canonical execution mode (and reference it everywhere).

---

### CONF-006 — Governance Execution: stop_rules

**Priority:** Medium  
**Status:** OPEN  
**Class:** lifecycle_process

**Conflict:** STOP rules are stated inconsistently across artifacts.

**Impact:** Agents may proceed when they should stop, or stop unnecessarily.

**Evidence (required):**
- Locate STOP definitions across repo and compare

**Next Action:** Canonicalize STOP rules and enforce via gates.

---

### CONF-007 — Evidence Rules: evidence_threshold

**Priority:** Medium  
**Status:** OPEN  
**Class:** evidence_requirements

**Conflict:** Different thresholds for what counts as “verified” exist.

**Impact:** Evidence drift; governance-grade claims become inconsistent.

**Evidence (required):**
- Identify evidence threshold definitions across docs

**Next Action:** Define a single evidence threshold standard.

---

### CONF-008 — Evidence Rules: falsification_requirement

**Priority:** Medium  
**Status:** OPEN  
**Class:** evidence_requirements

**Conflict:** Mandatory falsification is sometimes required, sometimes optional.

**Impact:** Negative claims may be made without falsification, causing false findings.

**Evidence (required):**
- Find all statements about falsification requirements

**Next Action:** Decide whether falsification is always mandatory for negative claims.

---

### CONF-009 — Repo Structure: naming_conventions

**Priority:** Medium  
**Status:** OPEN  
**Class:** naming_structure

**Conflict:** Naming conventions differ across specs and repo reality.

**Impact:** Tooling and scripts may target wrong paths.

**Evidence (required):**
- Compare naming conventions definitions vs actual paths

**Next Action:** Align conventions and refactor inconsistencies.

---

### CONF-010 — Repo Structure: folder_authority

**Priority:** Medium  
**Status:** OPEN  
**Class:** naming_structure

**Conflict:** Folder-level authority rules are inconsistent.

**Impact:** Misclassification of canonical vs non-canonical artifacts.

**Evidence (required):**
- Identify folder authority statements and compare

**Next Action:** Create a single folder authority map.

---

### CONF-011 — Governance Lifecycle: phase_closure

**Priority:** Medium  
**Status:** OPEN  
**Class:** lifecycle_process

**Conflict:** Phase closure criteria are inconsistent.

**Impact:** Phases may be declared “done” prematurely.

**Evidence (required):**
- Cross-compare phase closure sections across governance docs

**Next Action:** Canonicalize phase closure criteria.

---

### CONF-012 — Governance Lifecycle: phase_readiness

**Priority:** Medium  
**Status:** OPEN  
**Class:** lifecycle_process

**Conflict:** Readiness criteria vary across phase reports and roadmap.

**Impact:** Incorrect readiness claims.

**Evidence (required):**
- Compare readiness criteria across all phase readiness artifacts

**Next Action:** Define canonical readiness standard.

---

### CONF-013 — Governance Lifecycle: roadmap_updates

**Priority:** Medium  
**Status:** OPEN  
**Class:** lifecycle_process

**Conflict:** Roadmap update rules differ (who can change, when, and with what evidence).

**Impact:** Roadmap drift; unclear governance.

**Evidence (required):**
- Identify roadmap governance statements

**Next Action:** Canonicalize roadmap update policy.

---

### CONF-014 — Enforcement: gate_requirements

**Priority:** Medium  
**Status:** OPEN  
**Class:** enforcement_rules

**Conflict:** Gate requirements differ across documents and CI configuration.

**Impact:** False pass/fail outcomes.

**Evidence (required):**
- Compare gate definitions in docs vs CI workflows

**Next Action:** Align enforcement rules with CI.

---

### CONF-015 — Enforcement: rejection_criteria

**Priority:** Medium  
**Status:** OPEN  
**Class:** enforcement_rules

**Conflict:** Rejection criteria for invalid work differs across guidelines.

**Impact:** Inconsistent reviews; governance instability.

**Evidence (required):**
- Locate rejection criteria and compare

**Next Action:** Establish a canonical rejection policy.

---

### CONF-016 — Canonicalization: deprecation_policy

**Priority:** Medium  
**Status:** OPEN  
**Class:** canonical_definition

**Conflict:** Deprecation rules differ across specs and scripts.

**Impact:** Deprecated content may remain active.

**Evidence (required):**
- Compare deprecation policies across artifacts

**Next Action:** Canonicalize deprecation map rules.

---

### CONF-017 — Canonicalization: decision_log_binding

**Priority:** Medium  
**Status:** OPEN  
**Class:** canonical_definition

**Conflict:** Whether decision logs are binding is inconsistent.

**Impact:** Decisions may be ignored or over-applied.

**Evidence (required):**
- Locate decision log authority statements

**Next Action:** Define binding scope.

---

### CONF-018 — Traceability: matrix_authority

**Priority:** Medium  
**Status:** OPEN  
**Class:** canonical_definition

**Conflict:** Traceability matrix authority differs from spec authority in some docs.

**Impact:** Incorrect mapping and compliance assertions.

**Evidence (required):**
- Identify matrix authority statements

**Next Action:** Align with canonical authority model.

---

### CONF-019 — Traceability: conflict_register_binding

**Priority:** Medium  
**Status:** OPEN  
**Class:** governance_authority

**Conflict:** Whether this register is binding is described inconsistently.

**Impact:** Conflicts can be ignored or mishandled.

**Evidence (required):**
- Find all references to CONFLICT_REGISTER binding status

**Next Action:** Canonicalize binding rules.

---

### CONF-020 — Traceability: evidence_pack_requirements

**Priority:** Medium  
**Status:** OPEN  
**Class:** evidence_requirements

**Conflict:** Evidence pack requirements differ across audit guides.

**Impact:** Audits become non-reproducible.

**Evidence (required):**
- Compare evidence pack definitions

**Next Action:** Create a single evidence pack definition and enforce it.

---

### CONF-021 — Security: secrets_storage

**Priority:** Medium  
**Status:** OPEN  
**Class:** secrets_handling

**Conflict:** Some artifacts imply secrets may be referenced in-repo; others forbid.

**Impact:** Risk of security violations and invalid PRs.

**Evidence (required):**
- Identify all secrets-handling statements and compare

**Next Action:** Canonicalize secrets storage policy.

---

### CONF-022 — Security: secrets_in_docs

**Priority:** Medium  
**Status:** OPEN  
**Class:** secrets_handling

**Conflict:** Whether secrets can appear in documentation is inconsistently defined.

**Impact:** Potential leakage.

**Evidence (required):**
- Locate conflicting statements

**Next Action:** Make “names-only” policy explicit and universal.

---

### CONF-023 — Security: secrets_in_prs

**Priority:** Medium  
**Status:** OPEN  
**Class:** secrets_handling

**Conflict:** PR templates may request sensitive details vs governance forbidding them.

**Impact:** Users may accidentally disclose secrets.

**Evidence (required):**
- Compare PR templates vs secrets policy

**Next Action:** Align templates with policy.

---

### CONF-024 — Security: secrets_in_logs

**Priority:** Medium  
**Status:** OPEN  
**Class:** secrets_handling

**Conflict:** Logging guidelines differ on whether sensitive values can be logged.

**Impact:** Leakage risk.

**Evidence (required):**
- Identify logging policy statements

**Next Action:** Establish a hard “no secrets in logs” standard.

---

### CONF-025 — Security: secrets_in_manus

**Priority:** Medium  
**Status:** OPEN  
**Class:** secrets_handling

**Conflict:** How secrets are handled by Manus vs repo policy is not consistently stated.

**Impact:** Practical workflow drift; inconsistent operational behavior.

**Evidence (required):**
- Identify repo statements about Manus secret handling (names-only)
- Identify any UI/tool guidance that contradicts repo policy

**Next Action:** Explicitly align Manus operating constraints with repo non-negotiables.

---

### CONF-026 — Security: secrets_in_github_actions

**Priority:** Medium  
**Status:** OPEN  
**Class:** secrets_handling

**Conflict:** Whether GitHub Actions secrets are preferred/required vs Manus runtime.

**Impact:** Confusion in CI/CD and runtime behavior.

**Evidence (required):**
- Compare workflow docs and runtime docs

**Next Action:** Define canonical secret provisioning locations and precedence.

---

### CONF-027 — Security: secrets_rotation

**Priority:** Medium  
**Status:** OPEN  
**Class:** secrets_handling

**Conflict:** Rotation rules are implied but not consistently required.

**Impact:** Stale keys; security risk.

**Evidence (required):**
- Identify rotation requirements

**Next Action:** Add explicit rotation cadence or policy.

---

### CONF-028 — Compliance: regulation_currency

**Priority:** Medium  
**Status:** OPEN  
**Class:** evidence_requirements

**Conflict:** “Current/official” regulatory status is sometimes assumed.

**Impact:** Incorrect compliance advice.

**Evidence (required):**
- Identify where currency is assumed vs verified

**Next Action:** Enforce currency verification requirements.

---

### CONF-029 — Compliance: source_rank_order

**Priority:** Medium  
**Status:** OPEN  
**Class:** governance_authority

**Conflict:** Source ranking differs across documents.

**Impact:** Retrieval prioritization is inconsistent.

**Evidence (required):**
- Compare source ranking rules across canonical docs

**Next Action:** Canonicalize ranking.

---

### CONF-030 — Compliance: evidence_linking

**Priority:** Medium  
**Status:** OPEN  
**Class:** evidence_requirements

**Conflict:** Requirements for linking to evidence differ.

**Impact:** Audits cannot be reproduced.

**Evidence (required):**
- Compare evidence linking requirements across docs

**Next Action:** Create a single evidence linking rule.

---

### CONF-031 — Data: embeddings_grounding

**Priority:** Medium  
**Status:** OPEN  
**Class:** evidence_requirements

**Conflict:** Whether embeddings can be used without primary source grounding is unclear.

**Impact:** Hallucination risk.

**Evidence (required):**
- Identify embedding grounding rules across specs

**Next Action:** Canonicalize grounding rules.

---

### CONF-032 — Data: retrieval_priority

**Priority:** Medium  
**Status:** OPEN  
**Class:** evidence_requirements

**Conflict:** Retrieval priority differs across designs.

**Impact:** Inconsistent answers and evidence.

**Evidence (required):**
- Compare retrieval priority rules

**Next Action:** Define a canonical retrieval order.

---

### CONF-033 — Data: metadata_schema

**Priority:** Medium  
**Status:** OPEN  
**Class:** canonical_definition

**Conflict:** Metadata schema fields differ across documents and implementations.

**Impact:** Data quality drift.

**Evidence (required):**
- Compare metadata schema definitions

**Next Action:** Define a canonical metadata schema and enforce it.

---

### CONF-034 — Data: knowledge_graph_scope

**Priority:** Medium  
**Status:** OPEN  
**Class:** canonical_definition

**Conflict:** Knowledge graph scope varies across documents.

**Impact:** Unclear requirements and expectations.

**Evidence (required):**
- Compare scope definitions

**Next Action:** Canonicalize scope.

---

### CONF-035 — UX: user_journey_authority

**Priority:** Medium  
**Status:** OPEN  
**Class:** canonical_definition

**Conflict:** UX journey artifacts compete on authority.

**Impact:** Conflicting UX requirements.

**Evidence (required):**
- Identify UX journey authority statements

**Next Action:** Define UX authority hierarchy.

---

### CONF-036 — UX: acceptance_criteria

**Priority:** Medium  
**Status:** OPEN  
**Class:** enforcement_rules

**Conflict:** Acceptance criteria differ across roadmap and specs.

**Impact:** Feature validation becomes ambiguous.

**Evidence (required):**
- Cross-compare acceptance criteria definitions

**Next Action:** Canonicalize acceptance criteria format and location.

---

### CONF-037 — Observability: tracing_requirements

**Priority:** Medium  
**Status:** OPEN  
**Class:** evidence_requirements

**Conflict:** Tracing requirements differ across docs.

**Impact:** Missing audit trails.

**Evidence (required):**
- Compare tracing requirements across artifacts

**Next Action:** Define a canonical tracing standard.

---

### CONF-038 — Observability: logging_policy

**Priority:** Medium  
**Status:** OPEN  
**Class:** evidence_requirements

**Conflict:** Logging policy differs in severity and allowed outputs.

**Impact:** Auditability and security drift.

**Evidence (required):**
- Compare logging policies across docs

**Next Action:** Canonicalize logging policy.

---

### CONF-039 — Repo Change Control: branching_policy

**Priority:** Medium  
**Status:** OPEN  
**Class:** lifecycle_process

**Conflict:** Branching policy differs across guidance.

**Impact:** Inconsistent workflow.

**Evidence (required):**
- Compare branching statements

**Next Action:** Define canonical branching policy.

---

### CONF-040 — Repo Change Control: release_process

**Priority:** Medium  
**Status:** OPEN  
**Class:** lifecycle_process

**Conflict:** Release process is inconsistently described.

**Impact:** Unpredictable releases.

**Evidence (required):**
- Compare release process documentation

**Next Action:** Canonicalize release process.

---

### CONF-041 — Repo Change Control: rollback_rules

**Priority:** Medium  
**Status:** OPEN  
**Class:** enforcement_rules

**Conflict:** Rollback rules differ or are missing.

**Impact:** Risky changes.

**Evidence (required):**
- Identify rollback rules

**Next Action:** Add a canonical rollback policy.

---

### CONF-042 — Execution: automation_scope

**Priority:** Medium  
**Status:** OPEN  
**Class:** lifecycle_process

**Conflict:** Automation scope differs across specs.

**Impact:** Misaligned expectations.

**Evidence (required):**
- Compare automation scope statements

**Next Action:** Canonicalize automation scope.

---

### CONF-043 — Execution: task_boundaries

**Priority:** Medium  
**Status:** OPEN  
**Class:** lifecycle_process

**Conflict:** Task boundaries and responsibilities differ across docs.

**Impact:** Agents overstep or underdeliver.

**Evidence (required):**
- Compare task boundary definitions

**Next Action:** Define canonical task boundary rules.

---

### CONF-044 — Execution: read_only_vs_write

**Priority:** Medium  
**Status:** OPEN  
**Class:** lifecycle_process

**Conflict:** READ-ONLY vs WRITE scope rules differ across documents.

**Impact:** Agents may write when they should not.

**Evidence (required):**
- Compare scope rules across audit docs

**Next Action:** Canonicalize scope rules.

---

### CONF-045 — Governance Execution: audit_invalidity

**Priority:** Medium  
**Status:** OPEN  
**Class:** enforcement_rules

**Conflict:** What makes an audit invalid is defined differently.

**Impact:** Inconsistent acceptance of audits.

**Evidence (required):**
- Compare invalidity definitions across audit-related docs

**Next Action:** Define a canonical invalidity standard.

---

### CONF-046 — Canonicalization: spec_validation

**Priority:** Medium  
**Status:** OPEN  
**Class:** enforcement_rules

**Conflict:** Spec validation expectations differ.

**Impact:** False completeness claims.

**Evidence (required):**
- Compare validation requirements across specs

**Next Action:** Canonicalize validation process.

---

### CONF-047 — Canonicalization: spec_versioning

**Priority:** Medium  
**Status:** OPEN  
**Class:** canonical_definition

**Conflict:** Versioning policy differs across docs.

**Impact:** Confusion on which version is current.

**Evidence (required):**
- Identify versioning rules across specs

**Next Action:** Define canonical versioning scheme.

---

### CONF-048 — Authority & Precedence: ui_vs_repo

**Priority:** Medium  
**Status:** OPEN  
**Class:** ui_protocol_conflict

**Conflict:** UI/tool guidance may conflict with repository governance.

**Impact:** Agents follow wrong precedence.

**Evidence (required):**
- Capture UI/tool guidance and compare to repo governance

**Next Action:** Formally declare UI guidance non-authoritative unless adopted.

---

### CONF-049 — Authority & Precedence: tool_instructions

**Priority:** Medium  
**Status:** OPEN  
**Class:** ui_protocol_conflict

**Conflict:** Tools provide operational instructions that may contradict governance.

**Impact:** Process drift.

**Evidence (required):**
- Identify tool instruction sources

**Next Action:** Add conflict handling rules for tooling.

---

### CONF-050 — Enforcement: stale_catalogue_threshold

**Priority:** Medium  
**Status:** OPEN  
**Class:** enforcement_rules

**Conflict:** Staleness thresholds are inconsistent or absent.

**Impact:** Catalogue freshness claims become unreliable.

**Evidence (required):**
- Identify all staleness threshold statements

**Next Action:** Define canonical threshold and enforce.

---

### CONF-051 — Enforcement: gate_failure_policy

**Priority:** Medium  
**Status:** OPEN  
**Class:** enforcement_rules

**Conflict:** Gate failure policy differs between docs and CI.

**Impact:** Confusing failures.

**Evidence (required):**
- Compare CI and governance gate rules

**Next Action:** Align CI with canonical gate policy.

---

### CONF-052 — Governance Lifecycle: readiness_definition

**Priority:** Medium  
**Status:** OPEN  
**Class:** lifecycle_process

**Conflict:** Readiness is defined differently across documents.

**Impact:** Premature phase transitions.

**Evidence (required):**
- Compare readiness definitions

**Next Action:** Canonicalize readiness definition.

---

### CONF-053 — Governance Lifecycle: governance_drift

**Priority:** Medium  
**Status:** OPEN  
**Class:** lifecycle_process

**Conflict:** Drift is sometimes tolerated, sometimes forbidden.

**Impact:** Unclear enforcement.

**Evidence (required):**
- Identify drift handling statements

**Next Action:** Define canonical drift tolerance rules.

---

### CONF-054 — Secrets Handling / UI Protocol: secrets_handling_ui_protocol

**Priority:** High  
**Status:** OPEN  
**Class:** ui_protocol_conflict

**Conflict:** Manus UI provides a “Sensitive Configuration Provision Protocol” that appears to instruct secret handling in a way that may conflict with ISA Non-Negotiables and repository secrets policy.

**Competing Statements:**
- Manus UI suggests a protocol for providing an OpenAI API Key / sensitive configuration
- ISA Non-Negotiables require secrets to be handled names-only, never in repo/docs/logs, and governed by canonical repository policies

**Impact:** High-risk governance drift: agents and contributors may follow UI guidance and violate non-negotiables.

**Proposed Resolution (precedence statement):**
- ISA Non-Negotiables and canonical repo governance **override** Manus UI protocol text.
- UI/tooltips/protocol text is **non-authoritative** unless explicitly adopted into repo governance.

**Affected Canonical Artifacts:**
* docs/governance/AUDIT_EXECUTION_MODE.md
* docs/spec/CONFLICT_REGISTER.md

**Evidence (required):**
- Screenshot or text capture of the Manus UI protocol (date-stamped)
- Exact repo references to the Non-Negotiables / secrets-handling rules that conflict

**Next Action:**
- Record the UI protocol text capture as evidence
- Add an explicit line in the canonical audit execution / governance docs stating repo policy overrides UI protocols for secrets
- Ensure PR templates and task instructions never request secret values

---
