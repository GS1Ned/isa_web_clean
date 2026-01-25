# MANUS_DAY1_EXECUTION_CHECKLIST.md
**ISA Strategic Reset — Day-1 Execution Checklist**  
**Canonical | GS1 Netherlands**

---

## Objective

Establish a clean, aligned, and traceable execution baseline for ISA following the advisory + mapping strategic reset. Day-1 completes when all items below are verified and checkpointed.

---

## 1) Confirm Strategic Alignment (Must Pass)

- [ ] Read and acknowledge MANUS_EXECUTION_BRIEF.md
- [ ] Confirm understanding of anti-goals (no customer data, no validation platform)
- [ ] Confirm advisory outputs contract (leadership brief, standards backlog, mapping views)
- [ ] Record alignment confirmation in checkpoint notes

---

## 2) Canonical Docs Baseline (Lock)

- [ ] Verify presence of all canonical docs under `/docs/`:
  - PRODUCT_CHARTER.md
  - ROADMAP.md
  - FEATURE_DECISIONS.md
  - DATA_FOUNDATION_SPEC.md
  - VERSIONING_AND_LINEAGE.md
  - DATASETS_CATALOG.md
  - MAPPING_MODEL.md
  - ADVISORY_OUTPUTS.md
  - DELIVERY_MODEL.md
  - QUALITY_BAR.md
  - ARCHITECTURE_OVERVIEW.md
  - OPERATIONS.md
  - MANUS_EXECUTION_BRIEF.md
- [ ] Confirm internal consistency across docs (vision, scope, terminology)
- [ ] Flag any contradictions for immediate resolution
- [ ] Freeze docs as v1.0 baseline

---

## 3) Dataset Readiness & Inventory

- [ ] Compile master dataset inventory (current + future)
- [ ] For each dataset, verify metadata fields:
  - dataset_id, version, publisher, jurisdiction
  - publication date, access/licensing
  - status (current | future | draft)
  - checksum (if file present)
- [ ] Identify missing datasets required for MVP
- [ ] Mark planned/future datasets explicitly
- [ ] Update `/docs/DATASETS_CATALOG.md`

---

## 4) Versioning & Lineage Enforcement

- [ ] Verify versioning rules are implemented conceptually:
  - Current vs future versions separated
  - No silent overwrites
- [ ] Ensure advisory outputs require:
  - dataset references
  - versions
  - confidence scores
- [ ] Add TODO markers where tooling is pending

---

## 5) Repository Hygiene (Day-1 Cleanup)

- [ ] Generate file inventory (name, type, size, checksum)
- [ ] Identify duplicates by checksum
- [ ] Identify non-ISA-relevant files
- [ ] Move deprecated content to `/archive/` (timestamped)
- [ ] Log actions in cleanup log
- [ ] Ensure no canonical docs are altered without version bump

---

## 6) Backlog Reset & Prioritization

- [ ] Review existing backlog items
- [ ] Classify each as Keep / Pause / Remove
- [ ] Remove or archive:
  - customer ingestion features
  - validation tooling
  - non-advisory UI features
- [ ] Rebuild top backlog around:
  - advisory outputs
  - mapping confidence
  - dataset coverage
- [ ] Update `/docs/FEATURE_DECISIONS.md`

---

## 7) ChatGPT Collaboration Setup

- [ ] Adopt Context Bundle Standard
- [ ] Prepare first delegation package:
  - task spec
  - constraints
  - acceptance criteria
  - relevant snippets only
- [ ] Define quality gates for ChatGPT outputs:
  - scope compliance
  - traceability
  - repo-ready formatting

---

## 8) Automation Hooks (Minimum)

- [ ] Dataset presence/checksum validation script (stub acceptable)
- [ ] Traceability linting rule (placeholder acceptable)
- [ ] Checkpoint creation script/process defined

---

## 9) Risk Register Initialization

- [ ] Create `/docs/RISK_REGISTER.md`
- [ ] Log initial risks:
  - vision drift
  - dataset licensing ambiguity
  - version confusion
  - repository bloat
- [ ] Assign owner and review cadence

---

## 10) Day-1 Checkpoint (Mandatory)

Create a checkpoint labeled: **ISA_RESET_DAY1_BASELINE**

Checkpoint must confirm:
- Strategic alignment
- Canonical docs frozen
- Dataset inventory established
- Cleanup completed or logged
- Backlog reset
- Collaboration loop operational

---

## Completion Criteria

Day-1 is complete when:
- ISA can safely generate traceable advisory outputs
- No development proceeds without dataset/version awareness
- Manus ↔ ChatGPT collaboration is operational
- Leadership confidence baseline is established

---

**End of document**
