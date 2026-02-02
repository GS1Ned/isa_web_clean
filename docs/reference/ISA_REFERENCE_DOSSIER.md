# ISA Reference Dossier

**Status:** Read-Only  
**Function:** Decision Support  
**Authority:** Advisory, not binding  
**Last Updated:** February 2, 2026

---

## Purpose

The ISA Reference Dossier is the canonical reference framework for strategic, architectural, and governance decisions within ISA.

This dossier exists to:
- Make assumptions explicit
- Support scope and architecture choices
- Make "deliberately not doing" defensible
- Answer audit and compliance questions

**This is NOT for daily implementation.**

---

## When to Consult This Dossier

Consult this dossier **only** when at least one question is answered with **YES**:

### Scope & Architecture
- Am I considering a new technique, pipeline, or architecture layer?
- Is this cross-cutting or difficult to reverse?

### Data & Coverage
- Am I making assumptions about completeness or freshness of GS1/EFRAG?
- Does a feature implicitly rely on corpus completeness?

### Quality & Reliability
- Do I see structural failure modes (traceability, authority, conflicts)?
- Am I considering a solution without empirical evidence?

### Gates & Scenarios
- Am I at a Gate transition?
- Do I need to compare alternatives (do / defer / don't do)?

### Governance & Defensibility
- Does this decision need to be audit-proof later?
- Would an external reviewer ask questions about this?

**All answers NO** → Do not consult dossier  
**≥1 answer YES** → Consult dossier before decision-making

---

## Dossier Contents

### 1. Catalogue & Evidence

Purpose: Demonstrable completeness and currency of sources.

| Artifact | Location |
|----------|----------|
| Catalogue Items | `docs/evidence/_generated/isa_catalogue_latest/` |
| Source Config | `config/catalogue_sources.json` |
| Validation Script | `scripts/validate_gs1_efrag_catalogue.py` |
| Update Workflow | `.github/workflows/update-gs1-efrag-catalogue.yml` |

Coverage: GS1 Global, GS1 Netherlands, GS1 Europe, EFRAG

### 2. Governance & Decision Frameworks

Purpose: Consistent, explainable choices.

| Artifact | Location |
|----------|----------|
| Manus Project Governance | `docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` |
| ISA Governance | `docs/governance/ISA_GOVERNANCE.md` |
| Gate Plan | `docs/ISA_COMPARATIVE_REFACTOR_GATE_PLAN.md` |
| Roadmap | `ROADMAP.md` |

### 3. Architecture & Capabilities

Purpose: Target vs. actual understanding.

| Artifact | Location |
|----------|----------|
| Ultimate Architecture | `docs/ultimate_architecture_docs/ISA_Ultimate_Architecture.md` |
| Capability Map | `docs/ISA_CAPABILITY_MAP.md` |
| Quality Improvement Plan | `docs/ASK_ISA_ULTIMATE_QUALITY_IMPROVEMENT_PLAN.md` |

### 4. Evaluations & Decision Notes

Purpose: Documented rationale.

| Artifact | Location |
|----------|----------|
| Optimization Decision Note | `docs/Beslisnotitie_Optimalisatie_van_ISA_Ontwikkeling.md` |
| Gate 1 Completion Report | `docs/ISA_Gate_1_Completion_Report.md` |
| Gate 1 Completion Review | `docs/Gate_1_Completion_Review.md` |
| Development Progress | `docs/ISA_Development_Progress_Report.md` |

### 5. Code Evidence (Technical Touchpoints)

Purpose: Impact assessment before building.

| Category | Key Files |
|----------|-----------|
| Ask ISA Router | `server/routers/ask-isa.ts` |
| Enhanced Ask ISA | `server/ask-isa-enhanced.ts` |
| Vector Search | `server/knowledge-vector-search.ts` |
| Prompts | `server/prompts/ask_isa/*` |
| Catalogue Scripts | `scripts/isa-catalogue/*` |
| Workflows | `.github/workflows/catalogue-checks.yml` |
| Schema | `drizzle/schema*.ts` |

---

## What is NOT Part of This Dossier

- No backlog
- No roadmap
- No tasks
- No instructions for ongoing implementation

---

## Usage Rules

### During Active Execution

Do NOT consult this dossier during:
- Implementation
- Debugging
- Local refactors

Avoid context switches.

### Interpretation

- The dossier is advisory
- Insights may be ignored without explanation
- You ultimately decide what gets built

---

## Decision Discipline

For strategic decisions:
- Always consider: **do / defer / don't do**
- Name:
  - Assumptions
  - Risks
  - Signals for reconsideration

Develop ISA as if you must defend decisions to a critical auditor.

---

## Guiding Principle

> First understand.  
> Then measure.  
> Then decide.  
> Then build.  
>
> Not the other way around.
