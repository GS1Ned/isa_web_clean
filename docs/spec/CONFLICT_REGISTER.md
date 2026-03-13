# Conflict Register (Canonical)

**Date:** 2026-02-05
**Status:** ACTIVE
**Scope:** Governance-grade conflict tracking
**Authority:** Project Owner (Human)

---

## 1. Purpose

This register is the **single canonical location** for documenting unresolved conflicts identified during ISA development.

A **conflict** is defined as:

> A situation where two or more authoritative statements, rules, or specifications cannot simultaneously be true or followed without an explicit decision.

This register supports:

* governance discipline
* audit traceability
* controlled resolution of ambiguity
* prevention of silent or agent-driven canonicalization

---

## 2. Conflict Lifecycle (Mandatory)

All conflicts MUST follow this lifecycle:

| Status               | Meaning                                | Who may set                          |
| -------------------- | -------------------------------------- | ------------------------------------ |
| `OPEN`               | Conflict identified, not yet analyzed  | Agent or Human                       |
| `DECISION_PROPOSED`  | Resolution proposed, pending authority | Agent                                |
| `DECISION_CONFIRMED` | Resolution approved                    | **Human only**                       |
| `CANONICALIZED`      | Decision applied to specs/docs         | Human or explicitly authorized agent |

**Hard rule:**
No conflict may advance beyond `DECISION_PROPOSED` without **explicit human confirmation**.

---

## 3. Conflict Classes

### 3.1 Synthesis Conflicts (Phase 3)

Conflicts discovered during canonical specification synthesis, typically caused by:

* legacy documentation drift
* overlapping specs
* inconsistent terminology

These conflicts:

* are tracked for completeness
* may be batch-resolved
* do **not** override Non-Negotiables

### 3.2 Governance & Authority Conflicts (Critical)

Conflicts involving:

* instruction hierarchy
* secrets handling
* agent permissions
* precedence of rules

These conflicts:

* REQUIRE human decision
* MUST NOT be auto-resolved
* override synthesis conflicts

---

## 4. Conflict Summary (Synthesis Conflicts)

| Conflict ID | Cluster                                 | Topic              | Priority | Status | Owner |
| ----------- | --------------------------------------- | ------------------ | -------- | ------ | ----- |
| CONF-001    | ISA Core Architecture                   | database_config    | Low      | OPEN   | TBD   |
| CONF-002    | ISA Core Architecture                   | embedding_model    | Medium   | OPEN   | TBD   |
| CONF-003    | ISA Core Architecture                   | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-004    | ISA Core Architecture                   | normative_rules    | High     | OPEN   | TBD   |
| CONF-005    | ISA Core Architecture                   | gate_definitions   | High     | OPEN   | TBD   |
| CONF-006    | Data & Knowledge Model                  | database_config    | Low      | OPEN   | TBD   |
| CONF-007    | Data & Knowledge Model                  | embedding_model    | Medium   | OPEN   | TBD   |
| CONF-008    | Data & Knowledge Model                  | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-009    | Data & Knowledge Model                  | normative_rules    | High     | OPEN   | TBD   |
| CONF-010    | Data & Knowledge Model                  | gate_definitions   | High     | OPEN   | TBD   |
| CONF-011    | Governance & IRON Protocol              | gate_definitions   | High     | OPEN   | TBD   |
| CONF-012    | Governance & IRON Protocol              | normative_rules    | High     | OPEN   | TBD   |
| CONF-013    | Governance & IRON Protocol              | database_config    | Low      | OPEN   | TBD   |
| CONF-014    | Governance & IRON Protocol              | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-015    | Governance & IRON Protocol              | embedding_model    | Medium   | OPEN   | TBD   |
| CONF-016    | Ingestion & Update Lifecycle            | normative_rules    | High     | OPEN   | TBD   |
| CONF-017    | Ingestion & Update Lifecycle            | gate_definitions   | High     | OPEN   | TBD   |
| CONF-018    | Ingestion & Update Lifecycle            | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-019    | Ingestion & Update Lifecycle            | database_config    | Low      | OPEN   | TBD   |
| CONF-020    | Catalogue Obligation & Sources          | normative_rules    | High     | OPEN   | TBD   |
| CONF-021    | Catalogue Obligation & Sources          | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-022    | Catalogue Obligation & Sources          | gate_definitions   | High     | OPEN   | TBD   |
| CONF-023    | Retrieval / Embeddings / Grounding      | embedding_model    | Medium   | OPEN   | TBD   |
| CONF-024    | Retrieval / Embeddings / Grounding      | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-025    | Retrieval / Embeddings / Grounding      | normative_rules    | High     | OPEN   | TBD   |
| CONF-026    | Retrieval / Embeddings / Grounding      | database_config    | Low      | OPEN   | TBD   |
| CONF-027    | Retrieval / Embeddings / Grounding      | gate_definitions   | High     | OPEN   | TBD   |
| CONF-028    | Evaluation Governance & Reproducibility | gate_definitions   | High     | OPEN   | TBD   |
| CONF-029    | Evaluation Governance & Reproducibility | normative_rules    | High     | OPEN   | TBD   |
| CONF-030    | Evaluation Governance & Reproducibility | database_config    | Low      | OPEN   | TBD   |
| CONF-031    | Evaluation Governance & Reproducibility | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-032    | Evaluation Governance & Reproducibility | embedding_model    | Medium   | OPEN   | TBD   |
| CONF-033    | Observability / Tracing / Feedback      | normative_rules    | High     | OPEN   | TBD   |
| CONF-034    | Observability / Tracing / Feedback      | gate_definitions   | High     | OPEN   | TBD   |
| CONF-035    | Observability / Tracing / Feedback      | database_config    | Low      | OPEN   | TBD   |
| CONF-036    | Observability / Tracing / Feedback      | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-037    | Repo Structure / Change Control         | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-038    | Repo Structure / Change Control         | normative_rules    | High     | OPEN   | TBD   |
| CONF-039    | Repo Structure / Change Control         | gate_definitions   | High     | OPEN   | TBD   |
| CONF-040    | Repo Structure / Change Control         | embedding_model    | Medium   | OPEN   | TBD   |
| CONF-041    | Repo Structure / Change Control         | database_config    | Low      | OPEN   | TBD   |
| CONF-042    | Agent & Prompt Governance               | normative_rules    | High     | OPEN   | TBD   |
| CONF-043    | Agent & Prompt Governance               | gate_definitions   | High     | OPEN   | TBD   |
| CONF-044    | Agent & Prompt Governance               | database_config    | Low      | OPEN   | TBD   |
| CONF-045    | Agent & Prompt Governance               | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-046    | UX & User Journey                       | normative_rules    | High     | OPEN   | TBD   |
| CONF-047    | UX & User Journey                       | gate_definitions   | High     | OPEN   | TBD   |
| CONF-048    | UX & User Journey                       | database_config    | Low      | OPEN   | TBD   |
| CONF-049    | UX & User Journey                       | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-050    | Roadmap / Evolution                     | gate_definitions   | High     | OPEN   | TBD   |
| CONF-051    | Roadmap / Evolution                     | retrieval_strategy | Medium   | OPEN   | TBD   |
| CONF-052    | Roadmap / Evolution                     | normative_rules    | High     | OPEN   | TBD   |
| CONF-053    | Roadmap / Evolution                     | embedding_model    | Medium   | OPEN   | TBD   |

---

## 5. Governance & Authority Conflicts

### CONF-054 — Manus UI “Sensitive Configuration Provision Protocol” vs ISA Non-Negotiables

| Field                  | Value                       |
| ---------------------- | --------------------------- |
| **Conflict ID**        | CONF-054                    |
| **Class**              | Governance & Authority      |
| **Topic**              | Secrets handling precedence |
| **Priority**           | Critical                    |
| **Status**             | OPEN                        |
| **Decision Authority** | Project Owner (Human)       |

**Competing Rules**

1. Manus UI protocol implies sensitive configuration (e.g. API keys) may be provided inline for task execution.
2. ISA Non-Negotiables prohibit handling secret values outside the Root Runtime & Secrets task and forbid repeating secrets in chat, logs, or docs.

**Impact**

* Risk of credential leakage
* Breaks audit reproducibility
* Violates instruction hierarchy
* Encourages agent overreach

**Next Action**

* Capture evidence of UI protocol behavior
* Propose resolution for human confirmation

---

## 6. Enforcement Rules

* Agents may NOT:

  * mark governance conflicts as resolved
  * update specs or roadmap based on unconfirmed decisions
* Any uncertainty → **STOP and register a conflict**
* This register overrides:

  * UI tooltips
  * agent assumptions
  * inferred intent

---

## 7. Change Control

Any modification to:

* conflict lifecycle
* governance conflicts
* decision authority

requires:

* human approval
* commit message referencing the conflict ID

---

**End of Canonical Conflict Register**
