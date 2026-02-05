# Living Documentation Policy (Canonical)

**Status:** Canonical Governance Policy
**Effective date:** 2026-02-05
**Authority:** Project Owner (Human)
**Applies to:** `docs/governance/`, `docs/spec/`, canonical JSON/YAML configs

---

## 1. Purpose

This policy formalizes **living documentation** as a governance requirement within ISA.

Living documentation ensures that **canonical documents cannot silently diverge** from:

* specifications
* workflows
* governance decisions
* conflict resolutions

Stale documentation is treated as a **governance failure**, not a documentation issue.

---

## 2. Definition

**Living documentation** is documentation that is **mandatory to update** when any of its declared dependencies change.

A document is considered **stale** if:

* its dependencies have changed, and
* no corresponding update or impact statement exists.

---

## 3. Scope

This policy applies to:

* all documents under `docs/governance/`
* all documents under `docs/spec/`
* all canonical machine-readable configs (JSON/YAML) referenced by governance or specs

Generated artefacts and summaries are **out of scope**.

---

## 4. Mandatory Update Triggers

An update or explicit impact statement is **required** when any of the following occur:

1. A change to a **canonical specification**
2. A change to a **governance rule or execution mode**
3. Resolution of a conflict in `CONFLICT_REGISTER.md`
4. A roadmap priority change with semantic impact
5. Introduction, deprecation, or replacement of a canonical artefact

---

## 5. Impact Statement (Hard Requirement)

Every change that triggers this policy MUST include an **impact statement** that answers:

* What changed?
* Which canonical documents are affected?
* What downstream artefacts are impacted?
* Why is this change consistent with existing governance?

Absence of an impact statement renders the change **governance-invalid**.

---

## 6. Responsibility & Authority

* **Author**: must provide the impact statement
* **Reviewer**: must validate consistency and completeness
* **Project Owner (Human)**: final authority in case of ambiguity

Agents MAY propose updates but MAY NOT:

* waive this policy
* mark documentation as “implicitly updated”
* resolve disputes about staleness

---

## 7. Enforcement

This policy is enforced via:

* Governance audit (`AUDIT_EXECUTION_MODE.md`)
* Manual or automated checks for missing impact statements

A missing or insufficient impact statement:

* invalidates conclusions
* blocks canonicalization
* MUST be registered as a governance conflict

---

## 8. Relation to Other Governance Documents

This policy:

* complements `AUDIT_EXECUTION_MODE.md`
* does not override `ISA_MASTER_SPEC.md`
* does not change instruction hierarchy
* introduces no new execution authority

---

## 9. Change Control

Any modification to this policy requires:

* explicit human approval
* a commit message referencing this document
* an updated impact statement

---

**End of Policy**
