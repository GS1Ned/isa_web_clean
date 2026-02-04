# Conflict Register

**Status:** Phase 3 Synthesis
**Last Updated:** 2026-02-04

## Overview

This register documents semantic conflicts identified during Phase 3 canonical spec synthesis. Each conflict represents competing or contradictory statements across source documents that require manual resolution.

## Conflict Summary

| Conflict ID | Cluster | Topic | Priority | Status | Owner |
|-------------|---------|-------|----------|--------|-------|
| CONF-001 | ISA Core Architecture | database_config | Low | OPEN | TBD |
| CONF-002 | ISA Core Architecture | embedding_model | Medium | OPEN | TBD |
| CONF-003 | ISA Core Architecture | retrieval_strategy | Medium | OPEN | TBD |
| CONF-004 | ISA Core Architecture | normative_rules | High | OPEN | TBD |
| CONF-005 | ISA Core Architecture | gate_definitions | High | OPEN | TBD |
| CONF-006 | Data & Knowledge Model | database_config | Low | OPEN | TBD |
| CONF-007 | Data & Knowledge Model | embedding_model | Medium | OPEN | TBD |
| CONF-008 | Data & Knowledge Model | retrieval_strategy | Medium | OPEN | TBD |
| CONF-009 | Data & Knowledge Model | normative_rules | High | OPEN | TBD |
| CONF-010 | Data & Knowledge Model | gate_definitions | High | OPEN | TBD |
| CONF-011 | Governance & IRON Protoco | gate_definitions | High | OPEN | TBD |
| CONF-012 | Governance & IRON Protoco | normative_rules | High | OPEN | TBD |
| CONF-013 | Governance & IRON Protoco | database_config | Low | OPEN | TBD |
| CONF-014 | Governance & IRON Protoco | retrieval_strategy | Medium | OPEN | TBD |
| CONF-015 | Governance & IRON Protoco | embedding_model | Medium | OPEN | TBD |
| CONF-016 | Ingestion & Update Lifecy | normative_rules | High | OPEN | TBD |
| CONF-017 | Ingestion & Update Lifecy | gate_definitions | High | OPEN | TBD |
| CONF-018 | Ingestion & Update Lifecy | retrieval_strategy | Medium | OPEN | TBD |
| CONF-019 | Ingestion & Update Lifecy | database_config | Low | OPEN | TBD |
| CONF-020 | Catalogue Obligation & So | normative_rules | High | OPEN | TBD |
| CONF-021 | Catalogue Obligation & So | retrieval_strategy | Medium | OPEN | TBD |
| CONF-022 | Catalogue Obligation & So | gate_definitions | High | OPEN | TBD |
| CONF-023 | Retrieval / Embeddings /  | embedding_model | Medium | OPEN | TBD |
| CONF-024 | Retrieval / Embeddings /  | retrieval_strategy | Medium | OPEN | TBD |
| CONF-025 | Retrieval / Embeddings /  | normative_rules | High | OPEN | TBD |
| CONF-026 | Retrieval / Embeddings /  | database_config | Low | OPEN | TBD |
| CONF-027 | Retrieval / Embeddings /  | gate_definitions | High | OPEN | TBD |
| CONF-028 | Evaluation Governance & R | gate_definitions | High | OPEN | TBD |
| CONF-029 | Evaluation Governance & R | normative_rules | High | OPEN | TBD |
| CONF-030 | Evaluation Governance & R | database_config | Low | OPEN | TBD |
| CONF-031 | Evaluation Governance & R | retrieval_strategy | Medium | OPEN | TBD |
| CONF-032 | Evaluation Governance & R | embedding_model | Medium | OPEN | TBD |
| CONF-033 | Observability / Tracing / | normative_rules | High | OPEN | TBD |
| CONF-034 | Observability / Tracing / | gate_definitions | High | OPEN | TBD |
| CONF-035 | Observability / Tracing / | database_config | Low | OPEN | TBD |
| CONF-036 | Observability / Tracing / | retrieval_strategy | Medium | OPEN | TBD |
| CONF-037 | Repo Structure / Change C | retrieval_strategy | Medium | OPEN | TBD |
| CONF-038 | Repo Structure / Change C | normative_rules | High | OPEN | TBD |
| CONF-039 | Repo Structure / Change C | gate_definitions | High | OPEN | TBD |
| CONF-040 | Repo Structure / Change C | embedding_model | Medium | OPEN | TBD |
| CONF-041 | Repo Structure / Change C | database_config | Low | OPEN | TBD |
| CONF-042 | Agent & Prompt Governance | normative_rules | High | OPEN | TBD |
| CONF-043 | Agent & Prompt Governance | gate_definitions | High | OPEN | TBD |
| CONF-044 | Agent & Prompt Governance | database_config | Low | OPEN | TBD |
| CONF-045 | Agent & Prompt Governance | retrieval_strategy | Medium | OPEN | TBD |
| CONF-046 | UX & User Journey | normative_rules | High | OPEN | TBD |
| CONF-047 | UX & User Journey | gate_definitions | High | OPEN | TBD |
| CONF-048 | UX & User Journey | database_config | Low | OPEN | TBD |
| CONF-049 | UX & User Journey | retrieval_strategy | Medium | OPEN | TBD |
| CONF-050 | Roadmap / Evolution | gate_definitions | High | OPEN | TBD |
| CONF-051 | Roadmap / Evolution | retrieval_strategy | Medium | OPEN | TBD |
| CONF-052 | Roadmap / Evolution | normative_rules | High | OPEN | TBD |
| CONF-053 | Roadmap / Evolution | embedding_model | Medium | OPEN | TBD |

## Statistics

| Metric | Count |
|--------|-------|
| Total Conflicts | 53 |
| High Priority | 24 |
| Medium Priority | 19 |
| Low Priority | 10 |
| Open | 53 |
| Resolved | 0 |

## Top 10 High-Impact Conflicts

These conflicts should be resolved first as they affect core governance and normative rules.

### CONF-004: normative_rules (ISA Core Architecture)

| Field | Value |
|-------|-------|
| **Conflict ID** | CONF-004 |
| **Cluster** | ISA Core Architecture |
| **Topic** | normative_rules |
| **Priority** | High |
| **Status** | OPEN |
| **Owner** | TBD |

**Competing Documents:**

- **Source A:** `./ARCHITECTURE.md`
- **Source B:** `./.github/PULL_REQUEST_TEMPLATE.md`
- **Source C:** `./CHATGPT_DELEGATION_PHASE1.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-005: gate_definitions (ISA Core Architecture)

| Field | Value |
|-------|-------|
| **Conflict ID** | CONF-005 |
| **Cluster** | ISA Core Architecture |
| **Topic** | gate_definitions |
| **Priority** | High |
| **Status** | OPEN |
| **Owner** | TBD |

**Competing Documents:**

- **Source A:** `./ROADMAP_GITHUB_INTEGRATION.md`
- **Source B:** `./.github/PULL_REQUEST_TEMPLATE.md`
- **Source C:** `./IRON_PROTOCOL.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-009: normative_rules (Data & Knowledge Model)

| Field | Value |
|-------|-------|
| **Conflict ID** | CONF-009 |
| **Cluster** | Data & Knowledge Model |
| **Topic** | normative_rules |
| **Priority** | High |
| **Status** | OPEN |
| **Owner** | TBD |

**Competing Documents:**

- **Source A:** `./ARCHITECTURE.md`
- **Source B:** `./.github/PULL_REQUEST_TEMPLATE.md`
- **Source C:** `./CHATGPT_DELEGATION_PHASE1.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-010: gate_definitions (Data & Knowledge Model)

| Field | Value |
|-------|-------|
| **Conflict ID** | CONF-010 |
| **Cluster** | Data & Knowledge Model |
| **Topic** | gate_definitions |
| **Priority** | High |
| **Status** | OPEN |
| **Owner** | TBD |

**Competing Documents:**

- **Source A:** `./docs/REGULATORY_CHANGE_LOG_TEMPLATES.md`
- **Source B:** `./.github/PULL_REQUEST_TEMPLATE.md`
- **Source C:** `./IRON_PROTOCOL.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-011: gate_definitions (Governance & IRON Protocol)

| Field | Value |
|-------|-------|
| **Conflict ID** | CONF-011 |
| **Cluster** | Governance & IRON Protocol |
| **Topic** | gate_definitions |
| **Priority** | High |
| **Status** | OPEN |
| **Owner** | TBD |

**Competing Documents:**

- **Source A:** `./.github/PULL_REQUEST_TEMPLATE.md`
- **Source B:** `./IRON_PROTOCOL.md`
- **Source C:** `./ROADMAP.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-012: normative_rules (Governance & IRON Protocol)

| Field | Value |
|-------|-------|
| **Conflict ID** | CONF-012 |
| **Cluster** | Governance & IRON Protocol |
| **Topic** | normative_rules |
| **Priority** | High |
| **Status** | OPEN |
| **Owner** | TBD |

**Competing Documents:**

- **Source A:** `./.github/PULL_REQUEST_TEMPLATE.md`
- **Source B:** `./ARCHITECTURE.md`
- **Source C:** `./CHATGPT_DELEGATION_PHASE1.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-016: normative_rules (Ingestion & Update Lifecycle)

| Field | Value |
|-------|-------|
| **Conflict ID** | CONF-016 |
| **Cluster** | Ingestion & Update Lifecycle |
| **Topic** | normative_rules |
| **Priority** | High |
| **Status** | OPEN |
| **Owner** | TBD |

**Competing Documents:**

- **Source A:** `./CHATGPT_PROMPT_INGEST-03.md`
- **Source B:** `./.github/PULL_REQUEST_TEMPLATE.md`
- **Source C:** `./ARCHITECTURE.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-017: gate_definitions (Ingestion & Update Lifecycle)

| Field | Value |
|-------|-------|
| **Conflict ID** | CONF-017 |
| **Cluster** | Ingestion & Update Lifecycle |
| **Topic** | gate_definitions |
| **Priority** | High |
| **Status** | OPEN |
| **Owner** | TBD |

**Competing Documents:**

- **Source A:** `./ROADMAP.md`
- **Source B:** `./.github/PULL_REQUEST_TEMPLATE.md`
- **Source C:** `./IRON_PROTOCOL.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-020: normative_rules (Catalogue Obligation & Source Registry)

| Field | Value |
|-------|-------|
| **Conflict ID** | CONF-020 |
| **Cluster** | Catalogue Obligation & Source Registry |
| **Topic** | normative_rules |
| **Priority** | High |
| **Status** | OPEN |
| **Owner** | TBD |

**Competing Documents:**

- **Source A:** `./DATASET_INVENTORY.md`
- **Source B:** `./.github/PULL_REQUEST_TEMPLATE.md`
- **Source C:** `./ARCHITECTURE.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-022: gate_definitions (Catalogue Obligation & Source Registry)

| Field | Value |
|-------|-------|
| **Conflict ID** | CONF-022 |
| **Cluster** | Catalogue Obligation & Source Registry |
| **Topic** | gate_definitions |
| **Priority** | High |
| **Status** | OPEN |
| **Owner** | TBD |

**Competing Documents:**

- **Source A:** `./docs/evidence/EVIDENCE_INDEX.md`
- **Source B:** `./.github/PULL_REQUEST_TEMPLATE.md`
- **Source C:** `./IRON_PROTOCOL.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

## Resolution Guidelines

When resolving conflicts:

1. **Identify Authority:** Check if one source is in the authority spine (highest precedence)
2. **Check Timestamps:** More recent documents may supersede older ones
3. **Verify Intent:** Determine if the conflict is semantic (real disagreement) or syntactic (different wording, same meaning)
4. **Document Decision:** Update this register with resolution rationale
5. **Update Canonical Spec:** Ensure the canonical spec reflects the resolved statement

## All Conflicts by Cluster

### ISA Core Architecture

- **CONF-001:** database_config (Low) - Sources: `ARCHITECTURE.md`, `CRON_DEPLOYMENT.md`, `ISA_TODO_MANUAL_COMPLETION.md`
- **CONF-002:** embedding_model (Medium) - Sources: `ARCHITECTURE.md`, `ISA_CAPABILITY_MAP.md`, `ISA_TODO_MANUAL_COMPLETION.md`
- **CONF-003:** retrieval_strategy (Medium) - Sources: `ARCHITECTURE.md`, `ISA_CAPABILITY_MAP.md`, `ISA_DEVELOPMENT_PLAYBOOK.md`
- **CONF-004:** normative_rules (High) - Sources: `ARCHITECTURE.md`, `PULL_REQUEST_TEMPLATE.md`, `CHATGPT_DELEGATION_PHASE1.md`
- **CONF-005:** gate_definitions (High) - Sources: `ROADMAP_GITHUB_INTEGRATION.md`, `PULL_REQUEST_TEMPLATE.md`, `IRON_PROTOCOL.md`
### Data & Knowledge Model

- **CONF-006:** database_config (Low) - Sources: `ARCHITECTURE.md`, `CRON_DEPLOYMENT.md`, `ISA_TODO_MANUAL_COMPLETION.md`
- **CONF-007:** embedding_model (Medium) - Sources: `ARCHITECTURE.md`, `ISA_CAPABILITY_MAP.md`, `ISA_TODO_MANUAL_COMPLETION.md`
- **CONF-008:** retrieval_strategy (Medium) - Sources: `ARCHITECTURE.md`, `ISA_CAPABILITY_MAP.md`, `ISA_DEVELOPMENT_PLAYBOOK.md`
- **CONF-009:** normative_rules (High) - Sources: `ARCHITECTURE.md`, `PULL_REQUEST_TEMPLATE.md`, `CHATGPT_DELEGATION_PHASE1.md`
- **CONF-010:** gate_definitions (High) - Sources: `REGULATORY_CHANGE_LOG_TEMPLATES.md`, `PULL_REQUEST_TEMPLATE.md`, `IRON_PROTOCOL.md`
### Governance & IRON Protocol

- **CONF-011:** gate_definitions (High) - Sources: `PULL_REQUEST_TEMPLATE.md`, `IRON_PROTOCOL.md`, `ROADMAP.md`
- **CONF-012:** normative_rules (High) - Sources: `PULL_REQUEST_TEMPLATE.md`, `ARCHITECTURE.md`, `CHATGPT_DELEGATION_PHASE1.md`
- **CONF-013:** database_config (Low) - Sources: `CRON_DEPLOYMENT.md`, `ARCHITECTURE.md`, `ISA_TODO_MANUAL_COMPLETION.md`
- **CONF-014:** retrieval_strategy (Medium) - Sources: `ISA_DEVELOPMENT_PLAYBOOK.md`, `ARCHITECTURE.md`, `ISA_CAPABILITY_MAP.md`
- **CONF-015:** embedding_model (Medium) - Sources: `ISA_TODO_MANUAL_COMPLETION.md`, `ARCHITECTURE.md`, `ISA_CAPABILITY_MAP.md`
### Ingestion & Update Lifecycle

- **CONF-016:** normative_rules (High) - Sources: `CHATGPT_PROMPT_INGEST-03.md`, `PULL_REQUEST_TEMPLATE.md`, `ARCHITECTURE.md`
- **CONF-017:** gate_definitions (High) - Sources: `ROADMAP.md`, `PULL_REQUEST_TEMPLATE.md`, `IRON_PROTOCOL.md`
- **CONF-018:** retrieval_strategy (Medium) - Sources: `ROADMAP.md`, `ARCHITECTURE.md`, `ISA_CAPABILITY_MAP.md`
- **CONF-019:** database_config (Low) - Sources: `CODEX_DELEGATION_SPEC.md`, `ARCHITECTURE.md`, `CRON_DEPLOYMENT.md`
### Catalogue Obligation & Source Registry

- **CONF-020:** normative_rules (High) - Sources: `DATASET_INVENTORY.md`, `PULL_REQUEST_TEMPLATE.md`, `ARCHITECTURE.md`
- **CONF-021:** retrieval_strategy (Medium) - Sources: `FEATURE_DISCOVERY_REPORT.md`, `ARCHITECTURE.md`, `ISA_CAPABILITY_MAP.md`
- **CONF-022:** gate_definitions (High) - Sources: `EVIDENCE_INDEX.md`, `PULL_REQUEST_TEMPLATE.md`, `IRON_PROTOCOL.md`
### Retrieval / Embeddings / Grounding

- **CONF-023:** embedding_model (Medium) - Sources: `ISA_CAPABILITY_MAP.md`, `ARCHITECTURE.md`, `ISA_TODO_MANUAL_COMPLETION.md`
- **CONF-024:** retrieval_strategy (Medium) - Sources: `ISA_CAPABILITY_MAP.md`, `ARCHITECTURE.md`, `ISA_DEVELOPMENT_PLAYBOOK.md`
- **CONF-025:** normative_rules (High) - Sources: `ISA_CAPABILITY_MAP.md`, `PULL_REQUEST_TEMPLATE.md`, `ARCHITECTURE.md`
- **CONF-026:** database_config (Low) - Sources: `ISA_TODO_MANUAL_COMPLETION.md`, `ARCHITECTURE.md`, `CRON_DEPLOYMENT.md`
- **CONF-027:** gate_definitions (High) - Sources: `ISA_COMPARATIVE_REFACTOR_GATE_PLAN.md`, `PULL_REQUEST_TEMPLATE.md`, `IRON_PROTOCOL.md`
### Evaluation Governance & Reproducibility

- **CONF-028:** gate_definitions (High) - Sources: `PULL_REQUEST_TEMPLATE.md`, `IRON_PROTOCOL.md`, `ROADMAP.md`
- **CONF-029:** normative_rules (High) - Sources: `PULL_REQUEST_TEMPLATE.md`, `ARCHITECTURE.md`, `CHATGPT_DELEGATION_PHASE1.md`
- **CONF-030:** database_config (Low) - Sources: `CRON_DEPLOYMENT.md`, `ARCHITECTURE.md`, `ISA_TODO_MANUAL_COMPLETION.md`
- **CONF-031:** retrieval_strategy (Medium) - Sources: `ISA_DEVELOPMENT_PLAYBOOK.md`, `ARCHITECTURE.md`, `ISA_CAPABILITY_MAP.md`
- **CONF-032:** embedding_model (Medium) - Sources: `ISA_TODO_MANUAL_COMPLETION.md`, `ARCHITECTURE.md`, `ISA_CAPABILITY_MAP.md`
### Observability / Tracing / Production Feedback

- **CONF-033:** normative_rules (High) - Sources: `EMBEDDING_PIPELINE_OPTIMIZATION.md`, `PULL_REQUEST_TEMPLATE.md`, `ARCHITECTURE.md`
- **CONF-034:** gate_definitions (High) - Sources: `PHASE4_OPERATIONAL_READINESS_REPORT.md`, `PULL_REQUEST_TEMPLATE.md`, `IRON_PROTOCOL.md`
- **CONF-035:** database_config (Low) - Sources: `PRODUCTION_DEPLOYMENT.md`, `ARCHITECTURE.md`, `CRON_DEPLOYMENT.md`
- **CONF-036:** retrieval_strategy (Medium) - Sources: `PRODUCTION_DEPLOYMENT.md`, `ARCHITECTURE.md`, `ISA_CAPABILITY_MAP.md`
### Repo Structure / Change Control / Release Discipline

- **CONF-037:** retrieval_strategy (Medium) - Sources: `ISA_DEVELOPMENT_PLAYBOOK.md`, `ARCHITECTURE.md`, `ISA_CAPABILITY_MAP.md`
- **CONF-038:** normative_rules (High) - Sources: `ISA_DEVELOPMENT_PLAYBOOK.md`, `PULL_REQUEST_TEMPLATE.md`, `ARCHITECTURE.md`
- **CONF-039:** gate_definitions (High) - Sources: `ROADMAP_GITHUB_INTEGRATION.md`, `PULL_REQUEST_TEMPLATE.md`, `IRON_PROTOCOL.md`
- **CONF-040:** embedding_model (Medium) - Sources: `ISA_STRATEGIC_PIVOT_REPORT.md`, `ARCHITECTURE.md`, `ISA_CAPABILITY_MAP.md`
- **CONF-041:** database_config (Low) - Sources: `PRODUCTION_DEPLOYMENT.md`, `ARCHITECTURE.md`, `CRON_DEPLOYMENT.md`
### Agent & Prompt Governance

- **CONF-042:** normative_rules (High) - Sources: `CHATGPT_DELEGATION_PHASE1.md`, `PULL_REQUEST_TEMPLATE.md`, `ARCHITECTURE.md`
- **CONF-043:** gate_definitions (High) - Sources: `AGENT_COLLABORATION_SUMMARY.md`, `PULL_REQUEST_TEMPLATE.md`, `IRON_PROTOCOL.md`
- **CONF-044:** database_config (Low) - Sources: `ISA_DEVELOPMENT_STATUS.md`, `ARCHITECTURE.md`, `CRON_DEPLOYMENT.md`
- **CONF-045:** retrieval_strategy (Medium) - Sources: `ISA_DEVELOPMENT_STATUS.md`, `ARCHITECTURE.md`, `ISA_CAPABILITY_MAP.md`
### UX & User Journey

- **CONF-046:** normative_rules (High) - Sources: `ISA_GATING_QUESTIONS.md`, `PULL_REQUEST_TEMPLATE.md`, `ARCHITECTURE.md`
- **CONF-047:** gate_definitions (High) - Sources: `CHATGPT_INTEGRATION_WORKFLOW.md`, `PULL_REQUEST_TEMPLATE.md`, `IRON_PROTOCOL.md`
- **CONF-048:** database_config (Low) - Sources: `EMBEDDING_WORKFLOW_OPTIMIZATION_REPORT.md`, `ARCHITECTURE.md`, `CRON_DEPLOYMENT.md`
- **CONF-049:** retrieval_strategy (Medium) - Sources: `ISA_UX_STRATEGY.md`, `ARCHITECTURE.md`, `ISA_CAPABILITY_MAP.md`
### Roadmap / Evolution

- **CONF-050:** gate_definitions (High) - Sources: `ISA_AUTONOMOUS_ROADMAP_V1.md`, `PULL_REQUEST_TEMPLATE.md`, `IRON_PROTOCOL.md`
- **CONF-051:** retrieval_strategy (Medium) - Sources: `ISA_AUTONOMOUS_ROADMAP_V1.md`, `ARCHITECTURE.md`, `ISA_CAPABILITY_MAP.md`
- **CONF-052:** normative_rules (High) - Sources: `ISA_AUTONOMOUS_ROADMAP_V1.md`, `PULL_REQUEST_TEMPLATE.md`, `ARCHITECTURE.md`
- **CONF-053:** embedding_model (Medium) - Sources: `STATUS.md`, `ARCHITECTURE.md`, `ISA_CAPABILITY_MAP.md`
