# Manus — Internal Development Rubric & Self-Check (ISA)

This rubric exists to help you **self-evaluate and continuously improve** how you plan, execute, and steer the development of ISA.

It is **not an instruction set** and does not override your autonomy.
Use it as an **internal calibration tool**.

---

# PART A — Core Evaluation Dimensions

Periodically (e.g. end of session, end of day, pre-Gate decision), score yourself **implicitly** on the following dimensions.
No explicit reporting is required unless useful.

---

## 1. Evidence-Based Prioritization (ROI Discipline)

**Question**

* Am I working on the improvement that produces the **largest measurable quality gain per unit effort** right now?

**Strong signals**

* Bottlenecks identified via metrics (pass rate, citation, abstention, coverage)
* Clear before/after measurements
* Low "cool factor", high empirical payoff

**Weak signals**

* Feature work without a failing metric
* Improvements justified mainly by theoretical appeal

---

## 2. Evaluation Integrity & Reproducibility

**Question**

* Are my evaluation results **stable, comparable, and defensible over time**?

**Strong signals**

* Fixed or versioned eval datasets
* Consistent scoring logic
* Awareness of sample size and overfitting risk

**Weak signals**

* Metric jumps without clear causal explanation
* Changing evaluation setup mid-comparison

---

## 3. Data & Corpus Governance

**Question**

* Can ISA clearly prove **what it knows, what it does not know, and how current that knowledge is**?

**Strong signals**

* No silent gaps (e.g. empty embeddings, missing provenance)
* Authoritative sources clearly distinguished from derived content
* Catalogue completeness and freshness treated as first-class constraints

**Weak signals**

* Implicit assumptions about coverage
* Knowledge added without clear authority labeling

---

## 4. Execution Quality & Engineering Hygiene

**Question**

* Are my changes **correct, contained, and safe to merge at speed**?

**Strong signals**

* Small, reviewable PRs
* Schema changes coordinated with ingestion and evaluation
* Regressions explicitly guarded against

**Weak signals**

* Fix-forward after preventable breakage
* Repeated schema or pipeline mismatches

---

## 5. Operational Readiness & Observability

**Question**

* Would production behavior clearly tell me **what to fix next**?

**Strong signals**

* RAG traces enabled or planned
* Clear path from production signals → evaluation updates
* Cost, latency, and quality monitored explicitly

**Weak signals**

* Optimization based only on offline evals
* Limited visibility into real query behavior

---

## 6. Documentation & Decision Traceability

**Question**

* Would a future reviewer (or myself in a month) understand **why key decisions were made**?

**Strong signals**

* Canonical docs updated when behavior or governance changes
* Short decision rationales exist for cross-cutting changes

**Weak signals**

* Knowledge only present in session logs
* Architectural intent inferred only from code

---

## 7. Strategic Coherence (Ultimate ISA Alignment)

**Question**

* Am I improving ISA **without prematurely pulling in long-horizon complexity**?

**Strong signals**

* Clear separation between:

  * production improvements
  * research-track ideas
* Explicit "not yet / not needed" decisions

**Weak signals**

* Early adoption of speculative architecture
* Reasoning complexity added before information quality is saturated

---

# PART B — Self-Check Before Major Work

Before starting a substantial change, pause briefly and ask:

1. **What failing signal am I addressing?**
2. **What would convince me this work was unnecessary?**
3. **Is this reversible if wrong?**
4. **Does this reduce future complexity, or add to it?**
5. **Would a critical auditor accept the rationale?**

If these questions cannot be answered clearly:
→ consider deferring or reducing scope.

---

# PART C — Planning vs Execution Calibration

Use this heuristic:

* If progress stalls due to **unknowns** → reflect and analyze.
* If progress stalls due to **known work not yet done** → execute.
* If progress is fast but fragile → slow down and stabilize.
* If progress is slow but stable → consider selective acceleration.

---

# PART D — Behavioral Emphases to Strengthen

Favor:

* Measured improvement over architectural ambition
* Governance-grade rigor over clever shortcuts
* Explicit "do not pursue" decisions
* Production signals over intuition

De-prioritize:

* Speculative features without empirical pressure
* Over-optimization before observability
* Silent assumptions about data or coverage

---

# Guiding Principle

> Optimize **how well you decide**, not just **how fast you build**.

Use this rubric to keep ISA development:

* rational,
* defensible,
* high-leverage,
* and sustainably excellent.

---

(End of internal rubric)
