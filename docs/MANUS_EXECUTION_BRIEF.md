# MANUS_EXECUTION_BRIEF.md
**ISA Strategic Reset & Execution System**  
**Canonical Document – GS1 Netherlands**

---

## 1. Purpose of This Document

This document defines how ISA must now be developed, governed, and delivered following the strategic shift to an advisory + mapping platform.

It serves as the single authoritative execution brief for Manus, enabling:
- Correct alignment with ISA's mission
- Frictionless collaboration with ChatGPT
- Safe, traceable, and scalable development
- Long-term confidence in ISA outputs for GS1 NL leadership

**This document is normative. Deviations require explicit approval.**

---

## 2. ISA Product Definition (Non-Negotiable)

### 2.1 What ISA Is

ISA is an advisory and mapping platform that supports GS1 Netherlands standards development by:
- Continuously analyzing EU and relevant Dutch ESG regulatory developments
- Mapping regulatory requirements to:
  - ESRS datapoints
  - GS1 standards (GDSN, Digital Link, CBV, EPCIS semantics)
  - GS1 NL / Benelux sector data models (MVP scope)
- Producing traceable, evidence-based insights that inform:
  - Standards change proposals
  - Data model evolution
  - Strategic prioritization for GS1 NL

**ISA exists to answer:**  
*"What must GS1 standards change, and why, given ESG regulatory evolution?"*

### 2.2 What ISA Is Not (Hard Anti-Goals)

ISA must not become:
- A customer data ingestion platform
- A customer data validation service (GDSN/EPCIS payload validation)
- An ESG reporting tool for companies
- A compliance certification system
- An untraceable AI chat or opinion generator

**Scope creep test:** If a feature requires onboarding customer datasets or validating real company data → out of scope.

---

## 3. Canonical Advisory Outputs (Product Contract)

ISA must reliably generate the following standardized outputs.

### 3.1 GS1 NL Leadership Advisory Brief
- Regulatory developments (what changed, what's coming)
- Impact on GS1 standards and data models
- Recommended standards work items (ranked)
- Confidence scoring
- Evidence with versions and citations

### 3.2 Standards Change Backlog Proposal
Each item includes:
- Proposed change
- Impacted standards and attributes
- Regulatory drivers
- Dependencies and urgency
- Confidence score
- Evidence references

### 3.3 Mapping Explorer Views
- Regulation → ESRS → GS1 standard → GS1 NL data model
- Coverage and gaps
- "Why" explanations with citations

**Every output must include:**
- Dataset IDs and versions
- Evidence links
- Generation timestamp
- "Valid for" scope
- Confidence scoring reference

---

## 4. Canonical Data Foundation (No Customer Data)

ISA's data foundation exists solely to support advisory logic.

### 4.1 Canonical Domains (MVP)
- ESG Regulations (EU + relevant Dutch initiatives, incl. proposals and guidance)
- ESRS Datapoints (EFRAG)
- GS1 Standards References (GDSN, Digital Link, CBV, EPCIS semantics)
- GS1 NL / Benelux Sector Data Model (MVP)
- Mapping Artifacts & Evidence Graph

**No customer operational data is stored.**

---

## 5. Dataset Versioning & Lineage (Hard Contract)

### 5.1 Required Dataset Metadata
Every dataset ingested or referenced must include:
- `dataset_id` (stable)
- `title`
- `publisher`
- `jurisdiction`
- `domain`
- `version`
- `status` (current | future | draft | superseded)
- `publication_date`
- `retrieved_at`
- `source_url` or access method
- `license`
- `checksum_sha256`
- `local_path`
- `format`
- `effective_from` / `effective_to` (if applicable)
- `notes`

### 5.2 Lineage Rules
- Every mapping references exact dataset IDs and versions
- Every advisory output references mapping IDs
- No uncited claims are permitted

---

## 6. Standards Version Policy (Example: GDSN)

- Current and future versions must coexist
- Default outputs reference current
- Future versions are scenario-based
- Planned versions without files are explicitly marked planned/unverified
- Version checks occur at defined cadence or GS1 release events

---

## 7. Delivery System: Manus ↔ ChatGPT Loop

### 7.1 Execution Loop
1. Manus defines task + acceptance criteria
2. Manus prepares Context Bundle
3. ChatGPT delivers complete artifacts
4. Manus integrates and fixes mechanical issues
5. Quality gates run
6. Checkpoint created

### 7.2 Quality Gates (Mandatory)
- Scope compliance (Section 2)
- Dataset catalog updated if sources changed
- Traceability present
- Tests/builds pass
- Repo cleanliness preserved

---

## 8. Context Bundle Standard (For ChatGPT)

Every delegation must include:
1. Task specification
2. Relevant schema and code snippets
3. Sample data
4. Constraints and formatting rules
5. Validation instructions

**Target:** minimal, focused, token-efficient.

---

## 9. Automation Targets

### Must Be Automated
- Dataset presence and checksum validation
- Dataset catalog consistency checks
- Output traceability linting
- Integration of ChatGPT outputs into repo paths

### Human Checkpoints
- Scope approval
- Dataset status changes
- Leadership-facing advisory outputs

---

## 10. Repository Cleanup Policy

### Principles
- Archive, never delete
- De-duplicate by checksum
- Canonical docs and dataset catalog are sacred

### Required Outputs
- File inventory
- Duplicate report
- Cleanup actions log
- Archived bundles with timestamps

---

## 11. Risk Register

Manus maintains: `/docs/RISK_REGISTER.md`

Tracked risks include:
- Vision drift
- Dataset licensing ambiguity
- Version confusion
- Repository bloat
- Loss of output trust

---

## 12. Manus Execution Checklist

Manus must ensure:
- Canonical docs reflect advisory vision
- Dataset catalog is enforced
- Cleanup executed safely
- Delegation protocol adopted
- First post-reset checkpoint created

Scripts, structure, and tooling may be improved as needed without violating this contract.

---

## 13. Authority & Change Control

This document is canonical.

Changes require:
- Explicit rationale
- Versioned update
- Approval checkpoint

---

**End of document**
