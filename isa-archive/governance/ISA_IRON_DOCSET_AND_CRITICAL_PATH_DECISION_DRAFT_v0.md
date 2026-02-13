# ISA — IRON Canonical Docset & Critical-Path Evaluation Decision (DRAFT v0)

Last verified: 2026-01-28

## 1) What this document decides (and what it does not)

### Decides now
- The **canonical document set** that constitutes “IRON in practice” for ISA (what must exist, be referenced, and be enforced).
- The **evaluation workflow** we will use to design and lock a high-quality ISA “Critical Path” (without prematurely locking architecture).

### Does NOT decide now
- The final ISA Critical Path (that will be decided after the evaluation plan completes).
- Any major redesign of ISA architecture or IRON mechanics.

---

## 2) Proposed canonical IRON docset (v1)

This is the minimum set that IRON should treat as **binding** and always consult first.

### A. Protocol and rules (authoritative)
1. `The IRON Protocol.md` — canonical governance contract (rules, obligations, stop conditions).
2. `IRON Protocol_ Scope Decisions.md` — persistent IN/OUT/IGNORE registry for scope drift handling.
3. `IRON Protocol_ Validation & Observation Plan.md` — what “working” means; validation signals.
4. `IRON Protocol_ Knowledge Map.md` — where canonical knowledge lives and how it connects.
5. `IRON Protocol v1_ Implementation Plan & Risk Register.md` — deployment steps + risks + mitigations.

### B. Enforcement mechanisms (authoritative by execution)
6. `.github/workflows/iron-gate.yml` — CI enforcement (Context Acknowledgement + inventory protection).
7. `scripts/iron-context.sh` — context acknowledgement generator (must be used for PRs).
8. `scripts/iron-inventory.sh` — deterministic inventory generation (inventory is generated, not hand-edited).
9. `isa.inventory.json` — generated inventory artefact (consumed as evidence; never edited manually).
10. `.github/PULL_REQUEST_TEMPLATE.md` (or equivalent) — ensures the Context Acknowledgement block is standard.

### C. Baseline discoverability artefacts (strongly recommended, low-cost)
11. `REPO_MAP.md` — evidence-bound “where to look first” for ISA.
12. `OPEN_QUESTIONS.md` — registry of UNKNOWNs with closure evidence requirements.

**Status:** Items 1–12 appear to already exist in the uploaded materials and/or repo baseline artefacts.  
**NOTE:** Whether they are already located in the *correct repo paths* and wired into daily flow must be verified in the next step (see Section 4).

---

## 3) Is this a fixed set?

### Short answer
- **Partly fixed, partly evolving.**

### Fixed (“must always exist”)
- A1–A5 and B6–B10 are the minimal governance + enforcement backbone.

### Evolving (expected to change as ISA grows)
- C11–C12 evolve as the system evolves.
- A2 (Scope Decisions) evolves continuously as new sources/locations appear.
- A4 (Knowledge Map) evolves whenever canonical knowledge is re-homed or new categories are added.

---

## 4) What is missing vs what exists already?

### Already exists (based on the uploaded artefacts list)
- All A. Protocol/rules docs exist (multiple versions present: v1/v2 drafts).  
- CI enforcement exists (iron gate workflow).
- Inventory tooling exists (`iron-context.sh`, `iron-inventory.sh`, `isa.inventory.json`).
- Baseline discoverability docs exist (`REPO_MAP.md`, `OPEN_QUESTIONS.md`).

### Likely still missing (must be verified, then created if absent)
- A single **canonical location** and naming scheme in-repo (to avoid duplicates across `/docs`, root, and “pasted_content” remnants).
- A **single, explicit “IRON CONFLICT” stop condition** surfaced in the protocol AND referenced by CI / scripts (if not already).
- A small “**How to use IRON**” quickstart for humans (≤ 60 lines) that points to the canonical docs above (optional but often high leverage).

---

## 5) Critical-Path evaluation plan (what we execute next)

Objective: design the best feasible ISA Critical Path using **evidence from our repo** + **current external best practices**, while remaining cost-efficient.

### Phase 0 — Completeness controls (already started)
Inputs:
- `CENSUS.json`, `SUBDIR_SUMMARY.md`, `ENTRYPOINTS.md`, `LARGE_ASSETS.md`, `DOC_AUTHORITY_MAP.md`
Acceptance criteria: `ISA_ACCEPTANCE_CRITERIA_v1.md`

### Phase 1 — Internal evidence pack (already started)
Inputs:
- `ISA_EVIDENCE_PACK_v0.md`
- `ISA_JOURNEY_TRACES_v1.md`
- `ISA_CURRENT_ARCHITECTURE_BRIEF_v0.md`

Output:
- “What we have” (proven) vs “What we think” (unproven).

### Phase 2 — External benchmark pack (next)
Goal: gather *only* the highest-value external references:
- evaluation loops for RAG and agentic systems
- legal/regulatory corpora harvesting patterns
- metadata catalog / governance patterns for document and dataset registries

Output:
- `ISA_EXTERNAL_BENCHMARK_NOTES_v2.md` (short, citation-backed)

### Phase 3 — Candidate Critical Path options (then)
Deliver 2–3 options, each with:
- sequence of milestones (weeks/iterations)
- explicit dependencies
- cost-control strategy
- acceptance tests

Output:
- `ISA_CRITICAL_PATH_OPTIONS_v0.md`

### Phase 4 — Decision + lock
Select one option (or merge) and produce:
- `ISA_CRITICAL_PATH_v1.md` (binding)
- update IRON Knowledge Map and Validation Plan accordingly

---

## 6) Decision gates (what “done” looks like)

We consider the evaluation ready to decide when:
- Every critical claim about current ISA state is evidence-bound to repo artefacts.
- External benchmark notes cite authoritative primary sources.
- The chosen Critical Path has acceptance criteria per milestone and a regression/validation loop.

---

## 7) Minimal instructions to Manus (preview)

When Manus is asked to “operate under IRON”, it must:
- Treat Section 2 as the canonical docset and **refuse** work that bypasses it.
- Use deterministic scripts for inventory and repo mapping.
- Use evaluation frameworks (not “vibe checks”) to assess RAG/agent changes.
- Halt on conflicts (“IRON CONFLICT”) until scope decisions are recorded.

(Full Manus prompt will be produced after Phase 2 external benchmarking.)

