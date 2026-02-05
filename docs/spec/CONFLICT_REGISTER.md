# Conflict Register

**Status:** ACTIVE  
**Last Updated:** 2026-02-05  
**Scope:** Governance + Canonical Spec Synthesis Conflicts (Phase 3→Phase 4)

## Purpose

This register is the single canonical location for tracking semantic and governance conflicts across ISA documentation and implementation.

**Definition:** A conflict is any competing, contradictory, or ambiguous statement across authoritative artifacts that impacts:  
- governance decisions and instruction hierarchy  
- normative rules and authority precedence  
- architecture and system behavior  
- script/workflow behavior and quality gates  
- secrets handling and operational safety  

## Non-Negotiable Rules (Enforced)

1. **Evidence-first:** No conflict is marked RESOLVED without explicit evidence (repo refs, transcripts, citations).
2. **Authority precedence:** Non-Negotiables > repo governance/specs > project instructions > task prompt. If unclear → STOP + register conflict.
3. **No secret leakage:** Never paste secret values; names-only templates; refer to canonical runtime/secrets location.
4. **No drift:** Canonical specs must reflect resolved outcomes; update dependent docs in the same change-set.
5. **Reproducible:** Any claim about existence/missing/current must include repo ref + command transcript.

## Conflict Lifecycle

| Status | Meaning | Required Evidence | Allowed Changes |
|---|---|---|---|
| OPEN | Identified, not yet analyzed | ID + scope + competing sources | None |
| TRIAGED | Classified & prioritized | authority assessment + impact note | Docs only |
| PROPOSED | Proposed resolution drafted | resolution text + affected artifacts list | Docs only |
| ACCEPTED | Owner decision captured | decision note + precedence justification | Docs + specs |
| RESOLVED | Changes implemented | diffs + validation transcript | Docs + code |
| VERIFIED | Independent verification | second run transcript | None |
| DEFERRED | Valid but postponed | explicit reason + review date | None |

## Conflict Classes

| Class | Description | Typical Owner | Example |
|---|---|---|---|
| Synthesis Conflict | Contradictions across Phase 3 cluster docs | Core team | gate definitions |
| Governance Conflict | Instruction hierarchy/precedence ambiguities | Project owner | UI protocol vs Non-Negotiables |
| Implementation Drift | Code diverges from canonical specs | Maintainer | script behavior mismatch |
| Data Contract Conflict | Schemas/fields ambiguous or inconsistent | Data owner | authority_level enum |

## Summary

### Conflict Statistics (Current)

| Metric          | Count |
| --------------- | ----: |
| Total Conflicts |    54 |
| High Priority   |    25 |
| Medium Priority |    19 |
| Low Priority    |    10 |

### Conflict Summary Table

| Conflict ID | Cluster                   | Topic              | Priority | Status | Owner |
| ----------- | ------------------------- | ------------------ | -------- | ------ | ----- |
| CONF-001    | ISA Core Architecture     | database_config    | Low      | OPEN   | TBD   |
| CONF-002    | ISA Core Architecture     | embedding_model    | Medium   | OPEN   | TBD   |
| CONF-003    | ISA Core Architecture     | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-004    | ISA Core Architecture     | normative_rules    | High     | OPEN   | TBD   |
| CONF-005    | ISA Core Architecture     | gate_definitions   | High     | OPEN   | TBD   |
| CONF-006    | Data & Knowledge Model    | database_config    | Low      | OPEN   | TBD   |
| CONF-007    | Data & Knowledge Model    | embedding_model    | Medium   | OPEN   | TBD   |
| CONF-008    | Data & Knowledge Model    | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-009    | Data & Knowledge Model    | normative_rules    | High     | OPEN   | TBD   |
| CONF-010    | Data & Knowledge Model    | gate_definitions   | High     | OPEN   | TBD   |
| CONF-011    | Governance & IRON Protoco | gate_definitions   | High     | OPEN   | TBD   |
| CONF-012    | Governance & IRON Protoco | normative_rules    | High     | OPEN   | TBD   |
| CONF-013    | Governance & IRON Protoco | database_config    | Low      | OPEN   | TBD   |
| CONF-014    | Governance & IRON Protoco | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-015    | Governance & IRON Protoco | embedding_model    | Medium   | OPEN   | TBD   |
| CONF-016    | Ingestion & Update Lifecy | normative_rules    | High     | OPEN   | TBD   |
| CONF-017    | Ingestion & Update Lifecy | gate_definitions   | High     | OPEN   | TBD   |
| CONF-018    | Ingestion & Update Lifecy | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-019    | Ingestion & Update Lifecy | database_config    | Low      | OPEN   | TBD   |
| CONF-020    | Catalogue Obligation & So | normative_rules    | High     | OPEN   | TBD   |
| CONF-021    | Catalogue Obligation & So | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-022    | Catalogue Obligation & So | gate_definitions   | High     | OPEN   | TBD   |
| CONF-023    | Retrieval / Embeddings /  | embedding_model    | Medium   | OPEN   | TBD   |
| CONF-024    | Retrieval / Embeddings /  | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-025    | Retrieval / Embeddings /  | normative_rules    | High     | OPEN   | TBD   |
| CONF-026    | Retrieval / Embeddings /  | database_config    | Low      | OPEN   | TBD   |
| CONF-027    | Retrieval / Embeddings /  | gate_definitions   | High     | OPEN   | TBD   |
| CONF-028    | Evaluation Governance & R | gate_definitions   | High     | OPEN   | TBD   |
| CONF-029    | Evaluation Governance & R | normative_rules    | High     | OPEN   | TBD   |
| CONF-030    | Evaluation Governance & R | database_config    | Low      | OPEN   | TBD   |
| CONF-031    | Evaluation Governance & R | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-032    | Evaluation Governance & R | embedding_model    | Medium   | OPEN   | TBD   |
| CONF-033    | Observability / Tracing / | normative_rules    | High     | OPEN   | TBD   |
| CONF-034    | Observability / Tracing / | gate_definitions   | High     | OPEN   | TBD   |
| CONF-035    | Observability / Tracing / | database_config    | Low      | OPEN   | TBD   |
| CONF-036    | Observability / Tracing / | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-037    | Repo Structure / Change C | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-038    | Repo Structure / Change C | normative_rules    | High     | OPEN   | TBD   |
| CONF-039    | Repo Structure / Change C | gate_definitions   | High     | OPEN   | TBD   |
| CONF-040    | Repo Structure / Change C | embedding_model    | Medium   | OPEN   | TBD   |
| CONF-041    | Repo Structure / Change C | database_config    | Low      | OPEN   | TBD   |
| CONF-042    | Agent & Prompt Governance | normative_rules    | High     | OPEN   | TBD   |
| CONF-043    | Agent & Prompt Governance | gate_definitions   | High     | OPEN   | TBD   |
| CONF-044    | Agent & Prompt Governance | database_config    | Low      | OPEN   | TBD   |
| CONF-045    | Agent & Prompt Governance | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-046    | UX & User Journey          | normative_rules    | High     | OPEN   | TBD   |
| CONF-047    | UX & User Journey          | gate_definitions   | High     | OPEN   | TBD   |
| CONF-048    | UX & User Journey          | database_config    | Low      | OPEN   | TBD   |
| CONF-049    | UX & User Journey          | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-050    | Roadmap / Evolution       | gate_definitions   | High     | OPEN   | TBD   |
| CONF-051    | Roadmap / Evolution       | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-052    | Roadmap / Evolution       | normative_rules    | High     | OPEN   | TBD   |
| CONF-053    | Roadmap / Evolution       | embedding_model    | Medium   | OPEN   | TBD   |
| CONF-054    | Governance & IRON Protocol | normative_rules    | High     | OPEN   | TBD   |

## Governance Conflicts (Cross-Cutting)

### CONF-054: UI “Sensitive Configuration Provision Protocol” vs ISA Non-Negotiables (secrets handling)

| Field           | Value                      |
| --------------- | -------------------------- |
| **Conflict ID** | CONF-054                   |
| **Cluster**     | Governance & IRON Protocol |
| **Topic**       | normative_rules            |
| **Priority**    | High                       |
| **Status**      | OPEN                       |
| **Owner**       | TBD                        |

**Conflict Statement:**  
A Manus UI guidance pattern (“Sensitive Configuration Provision Protocol: OpenAI API Key”) may encourage handling of sensitive configuration in ways that can conflict with ISA Non-Negotiables (never write secrets to repo/logs/docs; names-only templates; centralized secret handling reference).

**Authoritative Precedence (current):**

* Repo Non-Negotiables and governance/spec documentation are authoritative.
* UI/tooltips/protocol text is **non-authoritative** unless explicitly adopted into repo governance.

**Evidence (required):**

* Screenshot or transcript snippet of the UI protocol text (redact any sensitive values).
* Citation to the repo Non-Negotiables section that conflicts.

**Proposed Resolution:**  
Adopt an explicit precedence statement in repo governance: ISA Non-Negotiables override UI/tool guidance. Add an enforcement rule that prohibits copying UI protocol text that implies secret material or direct key handling into repo artifacts.

**Next Action:**  
Add a formal decision note and implement a governance check (doc gate) that flags UI-protocol-derived secret-handling instructions unless explicitly ratified.

---

## Detailed Conflict Entries (CONF-001 … CONF-053)

### CONF-001: database_config (ISA Core Architecture)

| Field           | Value                  |
| --------------- | ---------------------- |
| **Conflict ID** | CONF-001               |
| **Cluster**     | ISA Core Architecture  |
| **Topic**       | database_config        |
| **Priority**    | Low                    |
| **Status**      | OPEN                   |
| **Owner**       | TBD                    |

**Competing Documents:**

- **Source A:** `./ARCHITECTURE.md`
- **Source B:** `./ROADMAP_GITHUB_INTEGRATION.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-002: embedding_model (ISA Core Architecture)

| Field           | Value                  |
| --------------- | ---------------------- |
| **Conflict ID** | CONF-002               |
| **Cluster**     | ISA Core Architecture  |
| **Topic**       | embedding_model        |
| **Priority**    | Medium                 |
| **Status**      | OPEN                   |
| **Owner**       | TBD                    |

**Competing Documents:**

- **Source A:** `./ARCHITECTURE.md`
- **Source B:** `./ROADMAP_GITHUB_INTEGRATION.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-003: retrieval_strategy (ISA Core Architecture)

| Field           | Value                  |
| --------------- | ---------------------- |
| **Conflict ID** | CONF-003               |
| **Cluster**     | ISA Core Architecture  |
| **Topic**       | retrieval_strategy     |
| **Priority**    | Medium                 |
| **Status**      | OPEN                   |
| **Owner**       | TBD                    |

**Competing Documents:**

- **Source A:** `./ARCHITECTURE.md`
- **Source B:** `./ROADMAP_GITHUB_INTEGRATION.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-004: normative_rules (ISA Core Architecture)

| Field           | Value                  |
| --------------- | ---------------------- |
| **Conflict ID** | CONF-004               |
| **Cluster**     | ISA Core Architecture  |
| **Topic**       | normative_rules        |
| **Priority**    | High                   |
| **Status**      | OPEN                   |
| **Owner**       | TBD                    |

**Competing Documents:**

- **Source A:** `./ARCHITECTURE.md`
- **Source B:** `./.github/PULL_REQUEST_TEMPLATE.md`
- **Source C:** `./CHATGPT_DELEGATION_PHASE1.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-005: gate_definitions (ISA Core Architecture)

| Field           | Value                  |
| --------------- | ---------------------- |
| **Conflict ID** | CONF-005               |
| **Cluster**     | ISA Core Architecture  |
| **Topic**       | gate_definitions       |
| **Priority**    | High                   |
| **Status**      | OPEN                   |
| **Owner**       | TBD                    |

**Competing Documents:**

- **Source A:** `./ROADMAP_GITHUB_INTEGRATION.md`
- **Source B:** `./.github/PULL_REQUEST_TEMPLATE.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-006: database_config (Data & Knowledge Model)

| Field           | Value                  |
| --------------- | ---------------------- |
| **Conflict ID** | CONF-006               |
| **Cluster**     | Data & Knowledge Model |
| **Topic**       | database_config        |
| **Priority**    | Low                    |
| **Status**      | OPEN                   |
| **Owner**       | TBD                    |

**Competing Documents:**

- **Source A:** `./ARCHITECTURE.md`
- **Source B:** `./ROADMAP_GITHUB_INTEGRATION.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-007: embedding_model (Data & Knowledge Model)

| Field           | Value                  |
| --------------- | ---------------------- |
| **Conflict ID** | CONF-007               |
| **Cluster**     | Data & Knowledge Model |
| **Topic**       | embedding_model        |
| **Priority**    | Medium                 |
| **Status**      | OPEN                   |
| **Owner**       | TBD                    |

**Competing Documents:**

- **Source A:** `./ARCHITECTURE.md`
- **Source B:** `./ROADMAP_GITHUB_INTEGRATION.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-008: retrieval_strategy (Data & Knowledge Model)

| Field           | Value                  |
| --------------- | ---------------------- |
| **Conflict ID** | CONF-008               |
| **Cluster**     | Data & Knowledge Model |
| **Topic**       | retrieval_strategy     |
| **Priority**    | Medium                 |
| **Status**      | OPEN                   |
| **Owner**       | TBD                    |

**Competing Documents:**

- **Source A:** `./ARCHITECTURE.md`
- **Source B:** `./ROADMAP_GITHUB_INTEGRATION.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-009: normative_rules (Data & Knowledge Model)

| Field           | Value                  |
| --------------- | ---------------------- |
| **Conflict ID** | CONF-009               |
| **Cluster**     | Data & Knowledge Model |
| **Topic**       | normative_rules        |
| **Priority**    | High                   |
| **Status**      | OPEN                   |
| **Owner**       | TBD                    |

**Competing Documents:**

- **Source A:** `./ARCHITECTURE.md`
- **Source B:** `./.github/PULL_REQUEST_TEMPLATE.md`
- **Source C:** `./CHATGPT_DELEGATION_PHASE1.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-010: gate_definitions (Data & Knowledge Model)

| Field           | Value                  |
| --------------- | ---------------------- |
| **Conflict ID** | CONF-010               |
| **Cluster**     | Data & Knowledge Model |
| **Topic**       | gate_definitions       |
| **Priority**    | High                   |
| **Status**      | OPEN                   |
| **Owner**       | TBD                    |

**Competing Documents:**

- **Source A:** `./ROADMAP_GITHUB_INTEGRATION.md`
- **Source B:** `./.github/PULL_REQUEST_TEMPLATE.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-011: gate_definitions (Governance & IRON Protocol)

| Field           | Value                        |
| --------------- | ---------------------------- |
| **Conflict ID** | CONF-011                     |
| **Cluster**     | Governance & IRON Protocol   |
| **Topic**       | gate_definitions             |
| **Priority**    | High                         |
| **Status**      | OPEN                         |
| **Owner**       | TBD                          |

**Competing Documents:**

- **Source A:** `./docs/spec/governance-iron-protocol.md`
- **Source B:** `./docs/spec/repo-change-control-release.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-012: normative_rules (Governance & IRON Protocol)

| Field           | Value                        |
| --------------- | ---------------------------- |
| **Conflict ID** | CONF-012                     |
| **Cluster**     | Governance & IRON Protocol   |
| **Topic**       | normative_rules              |
| **Priority**    | High                         |
| **Status**      | OPEN                         |
| **Owner**       | TBD                          |

**Competing Documents:**

- **Source A:** `./docs/spec/governance-iron-protocol.md`
- **Source B:** `./docs/spec/agent-prompt-governance.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-013: database_config (Governance & IRON Protocol)

| Field           | Value                        |
| --------------- | ---------------------------- |
| **Conflict ID** | CONF-013                     |
| **Cluster**     | Governance & IRON Protocol   |
| **Topic**       | database_config              |
| **Priority**    | Low                          |
| **Status**      | OPEN                         |
| **Owner**       | TBD                          |

**Competing Documents:**

- **Source A:** `./docs/spec/governance-iron-protocol.md`
- **Source B:** `./docs/spec/isa-core-architecture.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-014: retrieval_strategy (Governance & IRON Protocol)

| Field           | Value                        |
| --------------- | ---------------------------- |
| **Conflict ID** | CONF-014                     |
| **Cluster**     | Governance & IRON Protocol   |
| **Topic**       | retrieval_strategy           |
| **Priority**    | Medium                       |
| **Status**      | OPEN                         |
| **Owner**       | TBD                          |

**Competing Documents:**

- **Source A:** `./docs/spec/governance-iron-protocol.md`
- **Source B:** `./docs/spec/retrieval-embeddings-grounding.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-015: embedding_model (Governance & IRON Protocol)

| Field           | Value                        |
| --------------- | ---------------------------- |
| **Conflict ID** | CONF-015                     |
| **Cluster**     | Governance & IRON Protocol   |
| **Topic**       | embedding_model              |
| **Priority**    | Medium                       |
| **Status**      | OPEN                         |
| **Owner**       | TBD                          |

**Competing Documents:**

- **Source A:** `./docs/spec/governance-iron-protocol.md`
- **Source B:** `./docs/spec/retrieval-embeddings-grounding.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-016: normative_rules (Ingestion & Update Lifecycle)

| Field           | Value                           |
| --------------- | ------------------------------- |
| **Conflict ID** | CONF-016                        |
| **Cluster**     | Ingestion & Update Lifecycle    |
| **Topic**       | normative_rules                 |
| **Priority**    | High                            |
| **Status**      | OPEN                            |
| **Owner**       | TBD                             |

**Competing Documents:**

- **Source A:** `./docs/spec/ingestion-update-lifecycle.md`
- **Source B:** `./docs/spec/catalogue-source-registry.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-017: gate_definitions (Ingestion & Update Lifecycle)

| Field           | Value                           |
| --------------- | ------------------------------- |
| **Conflict ID** | CONF-017                        |
| **Cluster**     | Ingestion & Update Lifecycle    |
| **Topic**       | gate_definitions                |
| **Priority**    | High                            |
| **Status**      | OPEN                            |
| **Owner**       | TBD                             |

**Competing Documents:**

- **Source A:** `./docs/spec/ingestion-update-lifecycle.md`
- **Source B:** `./docs/spec/repo-change-control-release.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-018: retrieval_strategy (Ingestion & Update Lifecycle)

| Field           | Value                           |
| --------------- | ------------------------------- |
| **Conflict ID** | CONF-018                        |
| **Cluster**     | Ingestion & Update Lifecycle    |
| **Topic**       | retrieval_strategy              |
| **Priority**    | Medium                          |
| **Status**      | OPEN                            |
| **Owner**       | TBD                             |

**Competing Documents:**

- **Source A:** `./docs/spec/ingestion-update-lifecycle.md`
- **Source B:** `./docs/spec/retrieval-embeddings-grounding.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-019: database_config (Ingestion & Update Lifecycle)

| Field           | Value                           |
| --------------- | ------------------------------- |
| **Conflict ID** | CONF-019                        |
| **Cluster**     | Ingestion & Update Lifecycle    |
| **Topic**       | database_config                 |
| **Priority**    | Low                             |
| **Status**      | OPEN                            |
| **Owner**       | TBD                             |

**Competing Documents:**

- **Source A:** `./docs/spec/ingestion-update-lifecycle.md`
- **Source B:** `./docs/spec/isa-core-architecture.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-020: normative_rules (Catalogue Obligation & Source Registry)

| Field           | Value                                 |
| --------------- | ------------------------------------- |
| **Conflict ID** | CONF-020                              |
| **Cluster**     | Catalogue Obligation & Source Registry |
| **Topic**       | normative_rules                       |
| **Priority**    | High                                  |
| **Status**      | OPEN                                  |
| **Owner**       | TBD                                   |

**Competing Documents:**

- **Source A:** `./docs/spec/catalogue-source-registry.md`
- **Source B:** `./docs/spec/governance-iron-protocol.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-021: retrieval_strategy (Catalogue Obligation & Source Registry)

| Field           | Value                                 |
| --------------- | ------------------------------------- |
| **Conflict ID** | CONF-021                              |
| **Cluster**     | Catalogue Obligation & Source Registry |
| **Topic**       | retrieval_strategy                     |
| **Priority**    | Medium                                |
| **Status**      | OPEN                                  |
| **Owner**       | TBD                                   |

**Competing Documents:**

- **Source A:** `./docs/spec/catalogue-source-registry.md`
- **Source B:** `./docs/spec/retrieval-embeddings-grounding.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-022: gate_definitions (Catalogue Obligation & Source Registry)

| Field           | Value                                 |
| --------------- | ------------------------------------- |
| **Conflict ID** | CONF-022                              |
| **Cluster**     | Catalogue Obligation & Source Registry |
| **Topic**       | gate_definitions                       |
| **Priority**    | High                                  |
| **Status**      | OPEN                                  |
| **Owner**       | TBD                                   |

**Competing Documents:**

- **Source A:** `./docs/spec/catalogue-source-registry.md`
- **Source B:** `./docs/spec/repo-change-control-release.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-023: embedding_model (Retrieval / Embeddings / Grounding)

| Field           | Value                                  |
| --------------- | -------------------------------------- |
| **Conflict ID** | CONF-023                               |
| **Cluster**     | Retrieval / Embeddings / Grounding     |
| **Topic**       | embedding_model                        |
| **Priority**    | Medium                                 |
| **Status**      | OPEN                                   |
| **Owner**       | TBD                                    |

**Competing Documents:**

- **Source A:** `./docs/spec/retrieval-embeddings-grounding.md`
- **Source B:** `./docs/spec/isa-core-architecture.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-024: retrieval_strategy (Retrieval / Embeddings / Grounding)

| Field           | Value                                  |
| --------------- | -------------------------------------- |
| **Conflict ID** | CONF-024                               |
| **Cluster**     | Retrieval / Embeddings / Grounding     |
| **Topic**       | retrieval_strategy                     |
| **Priority**    | Medium                                 |
| **Status**      | OPEN                                   |
| **Owner**       | TBD                                    |

**Competing Documents:**

- **Source A:** `./docs/spec/retrieval-embeddings-grounding.md`
- **Source B:** `./docs/spec/data-knowledge-model.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-025: normative_rules (Retrieval / Embeddings / Grounding)

| Field           | Value                                  |
| --------------- | -------------------------------------- |
| **Conflict ID** | CONF-025                               |
| **Cluster**     | Retrieval / Embeddings / Grounding     |
| **Topic**       | normative_rules                        |
| **Priority**    | High                                   |
| **Status**      | OPEN                                   |
| **Owner**       | TBD                                    |

**Competing Documents:**

- **Source A:** `./docs/spec/retrieval-embeddings-grounding.md`
- **Source B:** `./docs/spec/governance-iron-protocol.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-026: database_config (Retrieval / Embeddings / Grounding)

| Field           | Value                                  |
| --------------- | -------------------------------------- |
| **Conflict ID** | CONF-026                               |
| **Cluster**     | Retrieval / Embeddings / Grounding     |
| **Topic**       | database_config                        |
| **Priority**    | Low                                    |
| **Status**      | OPEN                                   |
| **Owner**       | TBD                                    |

**Competing Documents:**

- **Source A:** `./docs/spec/retrieval-embeddings-grounding.md`
- **Source B:** `./docs/spec/isa-core-architecture.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-027: gate_definitions (Retrieval / Embeddings / Grounding)

| Field           | Value                                  |
| --------------- | -------------------------------------- |
| **Conflict ID** | CONF-027                               |
| **Cluster**     | Retrieval / Embeddings / Grounding     |
| **Topic**       | gate_definitions                       |
| **Priority**    | High                                   |
| **Status**      | OPEN                                   |
| **Owner**       | TBD                                    |

**Competing Documents:**

- **Source A:** `./docs/spec/retrieval-embeddings-grounding.md`
- **Source B:** `./docs/spec/repo-change-control-release.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-028: gate_definitions (Evaluation Governance & Reproducibility)

| Field           | Value                                      |
| --------------- | ------------------------------------------ |
| **Conflict ID** | CONF-028                                   |
| **Cluster**     | Evaluation Governance & Reproducibility    |
| **Topic**       | gate_definitions                           |
| **Priority**    | High                                       |
| **Status**      | OPEN                                       |
| **Owner**       | TBD                                        |

**Competing Documents:**

- **Source A:** `./docs/spec/evaluation-governance-reproducibility.md`
- **Source B:** `./docs/spec/repo-change-control-release.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-029: normative_rules (Evaluation Governance & Reproducibility)

| Field           | Value                                      |
| --------------- | ------------------------------------------ |
| **Conflict ID** | CONF-029                                   |
| **Cluster**     | Evaluation Governance & Reproducibility    |
| **Topic**       | normative_rules                            |
| **Priority**    | High                                       |
| **Status**      | OPEN                                       |
| **Owner**       | TBD                                        |

**Competing Documents:**

- **Source A:** `./docs/spec/evaluation-governance-reproducibility.md`
- **Source B:** `./docs/spec/governance-iron-protocol.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-030: database_config (Evaluation Governance & Reproducibility)

| Field           | Value                                      |
| --------------- | ------------------------------------------ |
| **Conflict ID** | CONF-030                                   |
| **Cluster**     | Evaluation Governance & Reproducibility    |
| **Topic**       | database_config                            |
| **Priority**    | Low                                        |
| **Status**      | OPEN                                       |
| **Owner**       | TBD                                        |

**Competing Documents:**

- **Source A:** `./docs/spec/evaluation-governance-reproducibility.md`
- **Source B:** `./docs/spec/isa-core-architecture.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-031: retrieval_strategy (Evaluation Governance & Reproducibility)

| Field           | Value                                      |
| --------------- | ------------------------------------------ |
| **Conflict ID** | CONF-031                                   |
| **Cluster**     | Evaluation Governance & Reproducibility    |
| **Topic**       | retrieval_strategy                         |
| **Priority**    | Medium                                     |
| **Status**      | OPEN                                       |
| **Owner**       | TBD                                        |

**Competing Documents:**

- **Source A:** `./docs/spec/evaluation-governance-reproducibility.md`
- **Source B:** `./docs/spec/retrieval-embeddings-grounding.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-032: embedding_model (Evaluation Governance & Reproducibility)

| Field           | Value                                      |
| --------------- | ------------------------------------------ |
| **Conflict ID** | CONF-032                                   |
| **Cluster**     | Evaluation Governance & Reproducibility    |
| **Topic**       | embedding_model                            |
| **Priority**    | Medium                                     |
| **Status**      | OPEN                                       |
| **Owner**       | TBD                                        |

**Competing Documents:**

- **Source A:** `./docs/spec/evaluation-governance-reproducibility.md`
- **Source B:** `./docs/spec/retrieval-embeddings-grounding.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-033: normative_rules (Observability / Tracing / Feedback)

| Field           | Value                                  |
| --------------- | -------------------------------------- |
| **Conflict ID** | CONF-033                               |
| **Cluster**     | Observability / Tracing / Feedback     |
| **Topic**       | normative_rules                        |
| **Priority**    | High                                   |
| **Status**      | OPEN                                   |
| **Owner**       | TBD                                    |

**Competing Documents:**

- **Source A:** `./docs/spec/observability-tracing-feedback.md`
- **Source B:** `./docs/spec/governance-iron-protocol.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-034: gate_definitions (Observability / Tracing / Feedback)

| Field           | Value                                  |
| --------------- | -------------------------------------- |
| **Conflict ID** | CONF-034                               |
| **Cluster**     | Observability / Tracing / Feedback     |
| **Topic**       | gate_definitions                       |
| **Priority**    | High                                   |
| **Status**      | OPEN                                   |
| **Owner**       | TBD                                    |

**Competing Documents:**

- **Source A:** `./docs/spec/observability-tracing-feedback.md`
- **Source B:** `./docs/spec/repo-change-control-release.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-035: database_config (Observability / Tracing / Feedback)

| Field           | Value                                  |
| --------------- | -------------------------------------- |
| **Conflict ID** | CONF-035                               |
| **Cluster**     | Observability / Tracing / Feedback     |
| **Topic**       | database_config                        |
| **Priority**    | Low                                    |
| **Status**      | OPEN                                   |
| **Owner**       | TBD                                    |

**Competing Documents:**

- **Source A:** `./docs/spec/observability-tracing-feedback.md`
- **Source B:** `./docs/spec/isa-core-architecture.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-036: retrieval_strategy (Observability / Tracing / Feedback)

| Field           | Value                                  |
| --------------- | -------------------------------------- |
| **Conflict ID** | CONF-036                               |
| **Cluster**     | Observability / Tracing / Feedback     |
| **Topic**       | retrieval_strategy                     |
| **Priority**    | Medium                                 |
| **Status**      | OPEN                                   |
| **Owner**       | TBD                                    |

**Competing Documents:**

- **Source A:** `./docs/spec/observability-tracing-feedback.md`
- **Source B:** `./docs/spec/retrieval-embeddings-grounding.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-037: retrieval_strategy (Repo Structure / Change Control / Release)

| Field           | Value                                      |
| --------------- | ------------------------------------------ |
| **Conflict ID** | CONF-037                                   |
| **Cluster**     | Repo Structure / Change Control / Release  |
| **Topic**       | retrieval_strategy                         |
| **Priority**    | Medium                                     |
| **Status**      | OPEN                                       |
| **Owner**       | TBD                                        |

**Competing Documents:**

- **Source A:** `./docs/spec/repo-change-control-release.md`
- **Source B:** `./docs/spec/retrieval-embeddings-grounding.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-038: normative_rules (Repo Structure / Change Control / Release)

| Field           | Value                                      |
| --------------- | ------------------------------------------ |
| **Conflict ID** | CONF-038                                   |
| **Cluster**     | Repo Structure / Change Control / Release  |
| **Topic**       | normative_rules                            |
| **Priority**    | High                                       |
| **Status**      | OPEN                                       |
| **Owner**       | TBD                                        |

**Competing Documents:**

- **Source A:** `./docs/spec/repo-change-control-release.md`
- **Source B:** `./docs/spec/governance-iron-protocol.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-039: gate_definitions (Repo Structure / Change Control / Release)

| Field           | Value                                      |
| --------------- | ------------------------------------------ |
| **Conflict ID** | CONF-039                                   |
| **Cluster**     | Repo Structure / Change Control / Release  |
| **Topic**       | gate_definitions                           |
| **Priority**    | High                                       |
| **Status**      | OPEN                                       |
| **Owner**       | TBD                                        |

**Competing Documents:**

- **Source A:** `./docs/spec/repo-change-control-release.md`
- **Source B:** `./docs/spec/ingestion-update-lifecycle.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-040: embedding_model (Repo Structure / Change Control / Release)

| Field           | Value                                      |
| --------------- | ------------------------------------------ |
| **Conflict ID** | CONF-040                                   |
| **Cluster**     | Repo Structure / Change Control / Release  |
| **Topic**       | embedding_model                            |
| **Priority**    | Medium                                     |
| **Status**      | OPEN                                       |
| **Owner**       | TBD                                        |

**Competing Documents:**

- **Source A:** `./docs/spec/repo-change-control-release.md`
- **Source B:** `./docs/spec/retrieval-embeddings-grounding.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-041: database_config (Repo Structure / Change Control / Release)

| Field           | Value                                      |
| --------------- | ------------------------------------------ |
| **Conflict ID** | CONF-041                                   |
| **Cluster**     | Repo Structure / Change Control / Release  |
| **Topic**       | database_config                            |
| **Priority**    | Low                                        |
| **Status**      | OPEN                                       |
| **Owner**       | TBD                                        |

**Competing Documents:**

- **Source A:** `./docs/spec/repo-change-control-release.md`
- **Source B:** `./docs/spec/isa-core-architecture.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-042: normative_rules (Agent & Prompt Governance)

| Field           | Value                          |
| --------------- | ------------------------------ |
| **Conflict ID** | CONF-042                       |
| **Cluster**     | Agent & Prompt Governance      |
| **Topic**       | normative_rules                |
| **Priority**    | High                           |
| **Status**      | OPEN                           |
| **Owner**       | TBD                            |

**Competing Documents:**

- **Source A:** `./docs/spec/agent-prompt-governance.md`
- **Source B:** `./docs/spec/governance-iron-protocol.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-043: gate_definitions (Agent & Prompt Governance)

| Field           | Value                          |
| --------------- | ------------------------------ |
| **Conflict ID** | CONF-043                       |
| **Cluster**     | Agent & Prompt Governance      |
| **Topic**       | gate_definitions               |
| **Priority**    | High                           |
| **Status**      | OPEN                           |
| **Owner**       | TBD                            |

**Competing Documents:**

- **Source A:** `./docs/spec/agent-prompt-governance.md`
- **Source B:** `./docs/spec/repo-change-control-release.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-044: database_config (Agent & Prompt Governance)

| Field           | Value                          |
| --------------- | ------------------------------ |
| **Conflict ID** | CONF-044                       |
| **Cluster**     | Agent & Prompt Governance      |
| **Topic**       | database_config                |
| **Priority**    | Low                            |
| **Status**      | OPEN                           |
| **Owner**       | TBD                            |

**Competing Documents:**

- **Source A:** `./docs/spec/agent-prompt-governance.md`
- **Source B:** `./docs/spec/isa-core-architecture.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-045: retrieval_strategy (Agent & Prompt Governance)

| Field           | Value                          |
| --------------- | ------------------------------ |
| **Conflict ID** | CONF-045                       |
| **Cluster**     | Agent & Prompt Governance      |
| **Topic**       | retrieval_strategy             |
| **Priority**    | Medium                         |
| **Status**      | OPEN                           |
| **Owner**       | TBD                            |

**Competing Documents:**

- **Source A:** `./docs/spec/agent-prompt-governance.md`
- **Source B:** `./docs/spec/retrieval-embeddings-grounding.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-046: normative_rules (UX & User Journey)

| Field           | Value                  |
| --------------- | ---------------------- |
| **Conflict ID** | CONF-046               |
| **Cluster**     | UX & User Journey      |
| **Topic**       | normative_rules        |
| **Priority**    | High                   |
| **Status**      | OPEN                   |
| **Owner**       | TBD                    |

**Competing Documents:**

- **Source A:** `./docs/spec/ux-user-journey.md`
- **Source B:** `./docs/spec/governance-iron-protocol.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-047: gate_definitions (UX & User Journey)

| Field           | Value                  |
| --------------- | ---------------------- |
| **Conflict ID** | CONF-047               |
| **Cluster**     | UX & User Journey      |
| **Topic**       | gate_definitions       |
| **Priority**    | High                   |
| **Status**      | OPEN                   |
| **Owner**       | TBD                    |

**Competing Documents:**

- **Source A:** `./docs/spec/ux-user-journey.md`
- **Source B:** `./docs/spec/repo-change-control-release.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-048: database_config (UX & User Journey)

| Field           | Value                  |
| --------------- | ---------------------- |
| **Conflict ID** | CONF-048               |
| **Cluster**     | UX & User Journey      |
| **Topic**       | database_config        |
| **Priority**    | Low                    |
| **Status**      | OPEN                   |
| **Owner**       | TBD                    |

**Competing Documents:**

- **Source A:** `./docs/spec/ux-user-journey.md`
- **Source B:** `./docs/spec/isa-core-architecture.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-049: retrieval_strategy (UX & User Journey)

| Field           | Value                  |
| --------------- | ---------------------- |
| **Conflict ID** | CONF-049               |
| **Cluster**     | UX & User Journey      |
| **Topic**       | retrieval_strategy     |
| **Priority**    | Medium                 |
| **Status**      | OPEN                   |
| **Owner**       | TBD                    |

**Competing Documents:**

- **Source A:** `./docs/spec/ux-user-journey.md`
- **Source B:** `./docs/spec/retrieval-embeddings-grounding.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-050: gate_definitions (Roadmap / Evolution)

| Field           | Value                  |
| --------------- | ---------------------- |
| **Conflict ID** | CONF-050               |
| **Cluster**     | Roadmap / Evolution    |
| **Topic**       | gate_definitions       |
| **Priority**    | High                   |
| **Status**      | OPEN                   |
| **Owner**       | TBD                    |

**Competing Documents:**

- **Source A:** `./docs/spec/roadmap-evolution.md`
- **Source B:** `./docs/spec/repo-change-control-release.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-051: retrieval_strategy (Roadmap / Evolution)

| Field           | Value                  |
| --------------- | ---------------------- |
| **Conflict ID** | CONF-051               |
| **Cluster**     | Roadmap / Evolution    |
| **Topic**       | retrieval_strategy     |
| **Priority**    | Medium                 |
| **Status**      | OPEN                   |
| **Owner**       | TBD                    |

**Competing Documents:**

- **Source A:** `./docs/spec/roadmap-evolution.md`
- **Source B:** `./docs/spec/retrieval-embeddings-grounding.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-052: normative_rules (Roadmap / Evolution)

| Field           | Value                  |
| --------------- | ---------------------- |
| **Conflict ID** | CONF-052               |
| **Cluster**     | Roadmap / Evolution    |
| **Topic**       | normative_rules        |
| **Priority**    | High                   |
| **Status**      | OPEN                   |
| **Owner**       | TBD                    |

**Competing Documents:**

- **Source A:** `./docs/spec/roadmap-evolution.md`
- **Source B:** `./docs/spec/governance-iron-protocol.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement

---

### CONF-053: embedding_model (Roadmap / Evolution)

| Field           | Value                  |
| --------------- | ---------------------- |
| **Conflict ID** | CONF-053               |
| **Cluster**     | Roadmap / Evolution    |
| **Topic**       | embedding_model        |
| **Priority**    | Medium                 |
| **Status**      | OPEN                   |
| **Owner**       | TBD                    |

**Competing Documents:**

- **Source A:** `./docs/spec/roadmap-evolution.md`
- **Source B:** `./docs/spec/retrieval-embeddings-grounding.md`

**Proposed Resolution:** UNRESOLVED

**Next Action:** Review source documents and determine authoritative statement
