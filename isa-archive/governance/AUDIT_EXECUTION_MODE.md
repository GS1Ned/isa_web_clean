# AUDIT_EXECUTION_MODE

## Purpose

This document defines the **mandatory execution procedure** for audits, reviews, and validations within the ISA project.

Its purpose is to ensure that all audit-related work is:

* reproducible
* evidence-based
* conflict-aware
* resistant to assumption-driven conclusions

This document **does not define governance authority**.
It defines **how audits must be executed**, not **what is governed**.

---

## Scope

Audit Execution Mode applies whenever work involves:

* governance audits
* repository or documentation reviews
* golden path assessments
* validation of specifications, structure, or alignment
* claims about **presence, absence, correctness, alignment, authority, or currency**

Audit Execution Mode is **always active** for such work and **cannot be disabled**.

---

## Mandatory Audit Preamble

Every audit deliverable **must begin** with the following metadata:

* **Date:** YYYY-MM-DD
* **Scope:** READ-ONLY or WRITE
* **Repository Reference:**

  * repository name
  * branch name
  * commit hash
* **Verification Method:**

  * commands executed, and/or
  * artifacts inspected

If **any** of the above elements are missing, the audit output is **procedurally invalid**.

---

## Evidence Rules

No claim may be made that something:

* exists or does not exist
* is correct or incorrect
* is aligned or misaligned
* is authoritative, current, or valid
* works or fails

**unless** it is supported by explicit evidence.

Valid evidence consists of:

* concrete file paths
* command transcripts (`ls`, `find`, `git`, etc.)
* repository artifacts
* verifiable outputs

If evidence **cannot be produced**, the claim **must be labeled**:

**INSUFFICIENT EVIDENCE**

No conclusions may be drawn from insufficient evidence.

---

## Mandatory Falsification

Every **negative or critical claim** (e.g. *missing*, *incorrect*, *not aligned*, *incomplete*) must include:

* an explicit attempt to **falsify the claim**
* the **evidence generated** by that attempt

If falsification **cannot be completed**, the finding:

* **must not escalate**
* remains **informational only**

---

## STOP Rules (Formal Execution State)

**STOP** is a formal and enforceable execution state.

STOP **must be entered immediately** when:

* two authoritative artifacts conflict
* evidence contradicts an earlier statement
* an instruction hierarchy conflict is detected
* a UI or tool instruction conflicts with ISA Non-Negotiables

When STOP is active:

* no conclusions may be drawn
* no governance status may be changed
* no documentation may be updated
* no corrective actions may be implemented

The **only permitted output** during STOP is:

* a list of competing statements
* a description of their impact
* a description of the evidence required to resolve the conflict

STOP ends **only after** an explicit resolution is recorded in the appropriate canonical artifact (e.g. `CONFLICT_REGISTER.md`).

---

## Canonical Anchors

Audit Execution Mode operates relative to the following canonical anchors:

* **Canonical specifications:** `docs/spec/`
* **Governance documentation:** `docs/governance/`

Any claim regarding missing, inconsistent, or invalid canonical material **requires**:

* a correct repository reference
* explicit filesystem evidence (e.g. `ls`, `find` output)

Claims without such evidence are **invalid**.

---

## Relationship to Governance Authority

This document:

* does **not** introduce new governance rules
* does **not** override existing authority
* does **not** replace governance documentation

In case of conflict, precedence is:

1. ISA Permanent Project Instructions / Non-Negotiables
2. Canonical specifications and governance documents
3. This document

Audit Execution Mode defines **execution behavior only**.

---

## Required Output Structure

Every audit-related deliverable **must include** an explicit section stating:

* what was **verified**
* what was **assumed**
* what **could not be verified** and why

---

## Enforcement Expectation

Any audit output that violates this execution mode is considered:

* procedurally invalid
* non-governance-grade
* subject to rejection or mandatory re-execution

---

## Status

This document is **canonical**.

It is binding for audit execution behavior
and must be followed for all applicable work within the ISA project.
