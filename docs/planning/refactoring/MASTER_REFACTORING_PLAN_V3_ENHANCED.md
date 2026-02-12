# ISA Repository Refactoring Master Plan v3.0 (Enhanced)

**Version:** 3.0.0  
**Date:** 2026-02-12  
**Status:** DRAFT — Evidence-verified  
**Base:** MASTER_REFACTORING_PLAN_V2_ENHANCED.md + current refactor outputs  
**Execution Modes:** Q-A (agentic), Q-B (edit-only) with deterministic verification

---

## Evidence Table (Repository State as of 2026-02-12)

<!-- EVIDENCE:requirement:AGENT_START_HERE.md -->
| Artifact | Status | Path |
|----------|--------|------|
| AGENT_START_HERE.md | ✅ FOUND | `/AGENT_START_HERE.md` |
| README.md | ✅ FOUND | `/README.md` |
| REPO_TREE.md | ✅ FOUND | `/REPO_TREE.md` |
| AGENTS.md | ✅ FOUND | `/AGENTS.md` |
| package.json | ✅ FOUND | `/package.json` |
<!-- EVIDENCE:requirement:docs/planning/refactoring/MASTER_REFACTORING_PLAN.md -->
| MASTER_REFACTORING_PLAN.md | ✅ FOUND | `/docs/planning/refactoring/MASTER_REFACTORING_PLAN.md` |
| MASTER_REFACTORING_PLAN_V2_ENHANCED.md | ✅ FOUND | `/docs/planning/refactoring/MASTER_REFACTORING_PLAN_V2_ENHANCED.md` |
<!-- EVIDENCE:requirement:docs/planning/refactoring/FILE_INVENTORY.json -->
| FILE_INVENTORY.json | ✅ FOUND | `/docs/planning/refactoring/FILE_INVENTORY.json` |
| QUALITY_SCORECARDS.json | ✅ FOUND | `/docs/planning/refactoring/QUALITY_SCORECARDS.json` |
| EVIDENCE_MARKERS.json | ✅ FOUND | `/docs/planning/refactoring/EVIDENCE_MARKERS.json` |
<!-- EVIDENCE:requirement:docs/planning/refactoring/FINAL_STATUS_REPORT.md -->
| FINAL_STATUS_REPORT.md | ✅ FOUND | `/docs/planning/refactoring/FINAL_STATUS_REPORT.md` |
| EXECUTION_SUMMARY.md | ✅ FOUND | `/docs/planning/refactoring/EXECUTION_SUMMARY.md` |
| MOVE_PLAN.json | ✅ FOUND | `/docs/planning/refactoring/MOVE_PLAN.json` |
| MOVE_EXECUTION_LOG.json | ✅ FOUND | `/docs/planning/refactoring/MOVE_EXECUTION_LOG.json` |
<!-- EVIDENCE:implementation:scripts/refactor/validate_gates.sh -->
| validate_gates.sh | ✅ FOUND | `/scripts/refactor/validate_gates.sh` |
<!-- EVIDENCE:requirement:docs/spec/ASK_ISA/RUNTIME_CONTRACT.md -->
| Runtime Contracts (6) | ✅ FOUND | `/docs/spec/{ASK_ISA,NEWS_HUB,KNOWLEDGE_BASE,CATALOG,ESRS_MAPPING,ADVISORY}/RUNTIME_CONTRACT.md` |
<!-- EVIDENCE:implementation:server/_core/index.ts -->
| Backend Entrypoint | ✅ FOUND | `/server/_core/index.ts` |
<!-- EVIDENCE:implementation:client/src/main.tsx -->
| Frontend Entrypoint | ✅ FOUND | `/client/src/main.tsx` |
<!-- EVIDENCE:implementation:.github/workflows/refactoring-validation.yml -->
| CI Workflows | ✅ FOUND | `/.github/workflows/*.yml` (6 workflows) |
<!-- EVIDENCE:requirement:docs/planning/refactoring/CLASSIFICATION_RULES.json -->
| CLASSIFICATION_RULES.json | ✅ FOUND | `/docs/planning/refactoring/CLASSIFICATION_RULES.json` |

<!-- EVIDENCE:implementation:scripts/refactor/validate_gates.sh -->
**Verification Command:** `bash scripts/refactor/validate_gates.sh`  
<!-- EVIDENCE:decision:docs/planning/refactoring/FINAL_STATUS_REPORT.md -->
**Current Gate Status:** 5/5 passing (per `/docs/planning/refactoring/FINAL_STATUS_REPORT.md`)

---

## Execution Contract (Autonomy)

### Deterministic Loop

```
FOR each phase:
  1. Execute phase scripts (if exist) OR manual steps
  2. Run: bash scripts/refactor/validate_gates.sh
  3. IF gates fail:
     - Fix ONLY failing gate
     - Re-run validate_gates.sh
     - REPEAT until green
  4. IF gates pass:
     - Commit changes with conventional commit
     - PROCEED to next phase
  5. IF max retries exceeded (3):
     - STOP=gate_failure
     - Report in FINAL_STATUS_REPORT.md
```

### End States

- **DONE=complete** - All phases complete, all gates passing
- **DONE=partial** - Some phases complete, gates passing for completed phases
- **STOP=gate_failure** - Gate fails after 3 retries
- **STOP=missing_artifact** - Required input artifact missing
- **STOP=manual_intervention** - Human decision required

### Batch Policy

- **Max files per batch:** 50
- **Max duration per batch:** 30 minutes
- **Validation frequency:** After each batch
- **Rollback policy:** Git revert on gate failure

---

## V3 Delta Objectives (Evidence-Driven)

### 1. Semantic Validation (Real Implementation)

**Current State:** Conceptual only (per V2 plan)  
**V3 Target:** Implement actual validators or mark as PLANNED

**Evidence:**
- `/scripts/refactor/validate_gates.sh` - Current gates are syntactic only
- No semantic validators found in `/scripts/refactor/`

**V3 Deliverable:**
- Create `/scripts/refactor/semantic_validator.py` with:
  - Contract entrypoint validation
  - Schema reference validation
  - Evidence pointer resolution
- Add Gate 6: Semantic Validation (fails until implemented)

### 2. Evidence Markers Maturity

**Current State:** 0 markers (per `/docs/planning/refactoring/EVIDENCE_MARKERS.json`)  
**V3 Target:** Ramp to 100+ markers with measurable coverage

**Evidence:**
```json
{
  "version": "1.0",
  "generated": "2026-02-12",
  "total_markers": 0,
  "markers": []
}
```

**V3 Ramp Plan:**
- Phase 3.1: Add 25 markers (core capabilities)
- Phase 3.2: Add 50 markers (cross-cutting)
- Phase 3.3: Add 25+ markers (meta/governance)
- Gate: Evidence marker count ≥ 100

### 3. Runtime Contract Completeness

**Current State:** 30% completeness (per `/docs/planning/refactoring/EXECUTION_SUMMARY.md`)  
**V3 Target:** 90% completeness with measurable criteria

**Evidence:**
- 6 contracts exist but are skeleton-only
- No completeness scoring in current gates

**V3 Completeness Criteria:**
```json
{
  "required_sections": [
    "Entry Points",
    "Inputs/Outputs", 
    "Invariants",
    "Failure Modes",
    "Data Dependencies",
    "Security/Secrets"
  ],
  "scoring": {
    "section_present": 10,
    "section_complete": 15,
    "max_score": 100
  },
  "thresholds": {
    "phase_1": 30,
    "phase_3": 60,
    "phase_5": 90
  }
}
```

**V3 Deliverable:**
- Create `/scripts/refactor/score_contract_completeness.py`
- Add to Gate 2: Contract completeness ≥ threshold

---

## V3 Enhancement Sequence

### Priority 1: Evidence Markers (EXECUTING)
1. Add 25 core capability markers
2. Add 50 cross-cutting markers  
3. Add 25 meta/governance markers
4. Update phase_3_quality.py to count markers
5. Add Gate 7: Evidence marker count ≥ 100

### Priority 2: Contract Completeness
1. Enhance contracts to 60%
2. Create score_contract_completeness.py
3. Add Gate 8: Contract completeness ≥ 60%

### Priority 3: Semantic Validation
1. Create semantic_validator.py
2. Add Gate 6: Semantic validation passes

---

## V3 Completion Criteria

### Must Have (Blocking)

1. ✅ All Phase 0-5 complete
2. ⚠️ Evidence markers ≥ 100 [IN PROGRESS]
3. ⚠️ Contract completeness ≥ 90% [PLANNED]
4. ✅ Quality score ≥ 60
5. ✅ UNKNOWN = 0%
6. ✅ All current gates passing (5/5)
7. ⚠️ All V3 gates passing (8/8) [PLANNED]

---

**Generated:** 2026-02-12  
**Status:** EXECUTING Priority 1  
**Next Action:** Add evidence markers
