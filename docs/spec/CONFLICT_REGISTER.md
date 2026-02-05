# Conflict Register (Canonical)

**Date:** 2026-02-05
**Scope:** Governance-grade conflict tracking
**Authority:** Project Owner (Human)
**Lifecycle Model:** Defined in this document

---

## 1. Purpose

This register is the **single canonical location** for documenting unresolved conflicts that block or condition ISA governance, specification authority, or correct agent operation.

A **conflict** is defined as:

> A situation where two or more authoritative sources, rules, or protocols cannot simultaneously be true or followed without an explicit decision.

This register explicitly distinguishes between:

* **Synthesis Conflicts** (technical / semantic tensions discovered during canonicalization)
* **Governance & Authority Conflicts** (precedence, lifecycle, or control conflicts)

---

## 2. Conflict Lifecycle (Mandatory)

All conflicts MUST follow this lifecycle:

| Status               | Meaning                                | Who may set               |
| -------------------- | -------------------------------------- | ------------------------- |
| `OPEN`               | Conflict identified, not yet analyzed  | Agent or Human            |
| `DECISION_PROPOSED`  | Resolution proposed, pending authority | Agent                     |
| `DECISION_CONFIRMED` | Resolution approved                    | **Human only**            |
| `CANONICALIZED`      | Decision applied to specs/docs         | Human or authorized agent |

**Hard rule:**
No conflict may advance beyond `DECISION_PROPOSED` without **explicit human confirmation**.

---

## 3. Conflict Classes

### 3.1 Synthesis Conflicts (Phase-3 Legacy)

These originate from historical documentation drift and are primarily technical or semantic.

They:

* may be batch-resolved
* may be delegated to agents
* do NOT override Non-Negotiables

### 3.2 Governance & Authority Conflicts (Critical)

These involve:

* precedence
* secrets handling
* instruction hierarchy
* agent permissions

They:

* REQUIRE human decision
* MUST NOT be auto-resolved
* take precedence over all synthesis conflicts

---

## 4. Governance & Authority Conflicts (Authoritative)

### CONF-GOV-001 — Manus UI “Sensitive Configuration Provision Protocol” vs ISA Non-Negotiables

| Field                  | Value                       |
| ---------------------- | --------------------------- |
| **Conflict ID**        | CONF-GOV-001                |
| **Class**              | Governance & Authority      |
| **Topic**              | Secrets handling precedence |
| **Priority**           | Critical                    |
| **Status**             | DECISION_PROPOSED           |
| **Decision Authority** | Project Owner (Human)       |

#### Competing Rules

1. **Manus UI Protocol**
   Suggests that sensitive configuration values (e.g. API keys) may be provided inline for task execution.

2. **ISA Non-Negotiables**
   Explicitly prohibit:

   * handling secret values outside the Root Runtime & Secrets task
   * repeating secrets in chat, logs, or documents

#### Impact

* Risk of credential leakage
* Invalidates audit reproducibility
* Breaks instruction hierarchy
* Causes agent overreach

#### Proposed Resolution

* ISA Non-Negotiables take absolute precedence over any UI/tool protocol.
* Manus UI protocols are informational unless explicitly ratified in repo governance docs.
* Secrets handling remains exclusive to:
  `Root Runtime & Secrets task (XsS2SbpYk0TBf9gWDsxsiX)`
* Outside that task: **names only, never values**

#### Next Action

* Human confirmation required to advance to `DECISION_CONFIRMED`.
* After confirmation: canonicalize in exactly one governance location.

---

## 5. Synthesis Conflicts (Backlog)

The following conflicts originate from Phase-3 canonical synthesis and remain unresolved.
They **do not** imply incorrect behavior until resolved.

### Summary

| Metric                    | Count |
| ------------------------- | ----- |
| Total Synthesis Conflicts | 53    |
| High Priority             | 24    |
| Medium Priority           | 19    |
| Low Priority              | 10    |
| Resolved                  | 0     |

> These conflicts are tracked for completeness and future resolution, but are **non-blocking** unless escalated.

*(Individual CONF-001 … CONF-053 entries retained for reference and audit traceability.)*

---

## 6. Enforcement Rules (Non-Negotiable)

* Agents may **not**:

  * mark governance conflicts as resolved
  * update roadmap/specs based on unconfirmed decisions
* Any uncertainty → **STOP and register a conflict**
* This register overrides:

  * UI tooltips
  * agent assumptions
  * inferred intent

---

## 7. Change Control

Any modification to:

* conflict lifecycle
* governance conflict entries
* decision authority

requires:

* human approval
* commit message explicitly referencing the conflict ID

---

**End of Canonical Conflict Register**
