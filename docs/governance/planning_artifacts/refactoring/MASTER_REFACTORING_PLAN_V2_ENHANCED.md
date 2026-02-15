# ISA Repository Refactoring Master Plan v2.0 (Enhanced)
**Version:** 2.0.0  
**Date:** 2026-02-12  
**Status:** ENHANCED - Performance & Quality Optimized  
**Base:** v1.1.1 with critical improvements

---

## ENHANCEMENTS SUMMARY

### Performance Improvements
1. **Parallel Phase Execution** - Reduce 12-week timeline to 6-8 weeks
2. **Incremental Validation** - Continuous gates vs end-of-phase
3. **Caching Strategy** - Avoid redundant analysis
4. **Batch Processing** - Optimize file operations
5. **Early Failure Detection** - Fail fast on violations

### Quality Improvements
1. **Deterministic Tie-Breaking** - Eliminate classification ambiguity
2. **Progressive Refinement** - Allow UNKNOWN→CLASSIFIED migration
3. **Automated Conflict Resolution** - Reduce manual intervention
4. **Semantic Validation** - Beyond syntax checking
5. **Regression Prevention** - Lock-in verified state

---

## CRITICAL ADDITIONS TO BASE PLAN

### 0.2) Performance Contract

**EXECUTION TARGETS:**
- Phase 0: 2-3 days (was: 1 week)
- Phase 1: 5-7 days (was: 2-3 weeks)
- Phase 2: 7-10 days (was: 2-3 weeks)
- Phase 3: 5-7 days (was: 1-2 weeks)
- Phase 4: 3-5 days (was: 1-2 weeks)
- Phase 5: 2-3 days (was: 1-2 weeks)
- **Total: 24-35 days (3.5-5 weeks) vs 8-12 weeks**

**PERFORMANCE MECHANISMS:**

1. **Parallel Capability Tracks**
```
Track A: ASK_ISA + NEWS_HUB (Agent 1)
Track B: KNOWLEDGE_BASE + CATALOG (Agent 2)
Track C: ESRS_MAPPING + ADVISORY (Agent 3)
Track D: CROSS_CUTTING + META (Agent 4)
```

2. **Incremental Validation Pipeline**
```bash
# Instead of validate-all-at-end:
scripts/refactor/validate_incremental.sh <file_or_dir>
# Validates only changed files + their dependencies
```

3. **Caching Layer**
```json
{
  "cache_version": "1.0",
  "file_hash_to_classification": {},
  "dependency_graph_cache": {},
  "validation_results_cache": {}
}
```

4. **Batch Operations**
```bash
# Process files in batches of 50
find docs -name "*.md" | xargs -n 50 -P 4 scripts/refactor/classify_batch.sh
```

### 0.3) Quality Enhancements

**DETERMINISTIC TIE-BREAKING (Enhanced CLASSIFICATION_RULES.json):**

```json
{
  "version": "2.0",
  "tie_breaking_algorithm": {
    "step_1": "directory_path_match",
    "step_2": "import_graph_distance",
    "step_3": "keyword_weighted_score",
    "step_4": "file_size_heuristic",
    "step_5": "alphabetical_capability_name",
    "final": "CROSS_CUTTING with mandatory rationale"
  },
  "keyword_weights": {
    "exact_match_in_path": 100,
    "exact_match_in_filename": 80,
    "exact_match_in_first_heading": 60,
    "fuzzy_match_in_content": 20
  },
  "distance_scoring": {
    "direct_import": 100,
    "one_hop": 75,
    "two_hop": 50,
    "three_plus_hop": 25
  }
}
```

**PROGRESSIVE REFINEMENT WORKFLOW:**

```
Phase 0: UNKNOWN allowed (baseline)
Phase 1: UNKNOWN < 20% (contracts define boundaries)
Phase 2: UNKNOWN < 5% (relocation clarifies)
Phase 3: UNKNOWN < 1% (evidence forces decisions)
Phase 4: UNKNOWN = 0 (gates enforce)
```

**SEMANTIC VALIDATION (Beyond Syntax):**

```python
# scripts/refactor/semantic_validator.py
def validate_runtime_contract(contract_path):
    """Validate contract semantics, not just structure"""
    checks = [
        check_entrypoints_exist_in_code(),
        check_schemas_referenced_are_defined(),
        check_invariants_are_testable(),
        check_failure_modes_have_observability(),
        check_evidence_pointers_resolve()
    ]
    return all(checks)
```

---

## ENHANCED PHASE DEFINITIONS

### Phase 0 — Full Inventory (2-3 days, parallelized)

**PERFORMANCE OPTIMIZATIONS:**

1. **Parallel File Discovery**
```bash
# Instead of sequential find:
find docs -name "*.md" -print0 | xargs -0 -P 8 -n 100 scripts/refactor/analyze_file.sh
find server -name "*.ts" -print0 | xargs -0 -P 8 -n 100 scripts/refactor/analyze_file.sh
find client -name "*.tsx" -print0 | xargs -0 -P 8 -n 100 scripts/refactor/analyze_file.sh
```

2. **Incremental Classification**
```bash
# Cache results, only reclassify changed files
scripts/refactor/classify_incremental.sh --cache-file .refactor_cache.json
```

3. **Streaming Output**
```bash
# Don't wait for all files, stream results
scripts/refactor/inventory.sh | tee -a REPO_FILE_INVENTORY.csv
```

**QUALITY ENHANCEMENTS:**

1. **Automated Conflict Detection**
```json
{
  "conflicts": [
    {
      "file": "docs/NEWS_PIPELINE.md",
      "candidates": ["NEWS_HUB", "CROSS_CUTTING"],
      "scores": [85, 78],
      "resolution": "NEWS_HUB",
      "rationale": "Primary content focus + directory location"
    }
  ]
}
```

2. **Confidence Scoring**
```json
{
  "file": "docs/spec/ASK_ISA.md",
  "capability": "ASK_ISA",
  "confidence": 0.98,
  "evidence": ["path_match", "keyword_match", "import_graph"]
}
```

**NEW OUTPUTS:**
- `CLASSIFICATION_CONFIDENCE.json` - Confidence scores per file
- `CLASSIFICATION_CONFLICTS.json` - Detected conflicts with resolutions
- `CLASSIFICATION_CACHE.json` - Cached results for incremental runs

**ENHANCED GATES:**
- ✅ 100% files inventoried
- ✅ 100% files classified with confidence ≥ 0.7
- ✅ All conflicts resolved (0 unresolved)
- ✅ Classification rules validate deterministically
- ✅ Cache hit rate ≥ 80% on re-runs

---

### Phase 1 — Canonical Contracts (5-7 days, parallelized)

**PERFORMANCE OPTIMIZATIONS:**

1. **Template Generation**
```bash
# Auto-generate contract skeletons from code analysis
scripts/refactor/generate_contract_skeleton.sh ASK_ISA > docs/spec/ASK_ISA/RUNTIME_CONTRACT.md
```

2. **Parallel Contract Creation**
```bash
# 6 capabilities in parallel
for cap in ASK_ISA NEWS_HUB KNOWLEDGE_BASE CATALOG ESRS_MAPPING ADVISORY; do
  scripts/refactor/create_contract.sh $cap &
done
wait
```

**QUALITY ENHANCEMENTS:**

1. **Contract Completeness Checker**
```python
def check_contract_completeness(contract_path):
    required_sections = [
        "Entry Points",
        "Inputs/Outputs",
        "Invariants",
        "Failure Modes",
        "Data Dependencies",
        "Security/Secrets"
    ]
    return {
        "missing_sections": find_missing(contract_path, required_sections),
        "empty_sections": find_empty(contract_path, required_sections),
        "score": calculate_completeness_score()
    }
```

2. **Cross-Reference Validation**
```python
def validate_contract_references(contract_path):
    """Ensure all code references in contract exist"""
    entrypoints = extract_entrypoints(contract_path)
    for ep in entrypoints:
        assert file_exists(ep.path), f"Missing: {ep.path}"
        assert function_exists(ep.path, ep.function), f"Missing: {ep.function}"
```

**NEW OUTPUTS:**
- `CONTRACT_COMPLETENESS_SCORES.json` - Per-capability scores
- `CONTRACT_CROSS_REFERENCES.json` - All contract→code links
- `CONTRACT_VALIDATION_REPORT.md` - Detailed validation results

**ENHANCED GATES:**
- ✅ All 6 capability contracts exist
- ✅ All contracts score ≥ 90% completeness
- ✅ All contract references validate
- ✅ All contracts follow template structure
- ✅ Smoke harness passes for all capabilities

---

### Phase 2 — Relocation (7-10 days, batched)

**PERFORMANCE OPTIMIZATIONS:**

1. **Dry-Run Mode**
```bash
# Test moves without executing
scripts/refactor/relocate.sh --dry-run --output MOVE_PLAN.json
# Review, then execute
scripts/refactor/relocate.sh --execute MOVE_PLAN.json
```

2. **Batched Git Operations**
```bash
# Move files in batches to avoid massive commits
scripts/refactor/batch_move.sh --batch-size 20 --capability ASK_ISA
```

3. **Parallel Track Execution**
```bash
# Each capability track moves independently
scripts/refactor/relocate_capability.sh ASK_ISA &
scripts/refactor/relocate_capability.sh NEWS_HUB &
# ...
wait
```

**QUALITY ENHANCEMENTS:**

1. **Redirect Generation**
```json
{
  "redirects": [
    {
      "from": "docs/NEWS_PIPELINE.md",
      "to": "docs/spec/NEWS_HUB/PIPELINE.md",
      "type": "moved",
      "date": "2026-02-15"
    }
  ]
}
```

2. **Link Rewriting**
```bash
# Automatically update all links after moves
scripts/refactor/rewrite_links.sh --move-map MOVE_MAP.json
```

3. **Orphan Detection**
```bash
# Find files not referenced anywhere
scripts/refactor/find_orphans.sh > ORPHANS.txt
```

**NEW OUTPUTS:**
- `MOVE_PLAN.json` - Planned moves (dry-run)
- `MOVE_EXECUTION_LOG.json` - Actual moves performed
- `LINK_REWRITE_LOG.json` - All link updates
- `ORPHAN_REPORT.json` - Detected orphans with recommendations

**ENHANCED GATES:**
- ✅ 0 broken links (after redirects)
- ✅ 0 orphan files (all mapped)
- ✅ UNKNOWN < 5%
- ✅ All moves recorded in MOVE_MAP.json
- ✅ All redirects functional
- ✅ Git history preserved (no force pushes)

---

### Phase 3 — Quality & Evidence (5-7 days, automated)

**PERFORMANCE OPTIMIZATIONS:**

1. **Parallel Evidence Extraction**
```bash
# Extract evidence markers from all files in parallel
find docs -name "*.md" -print0 | xargs -0 -P 8 scripts/refactor/extract_evidence.sh
```

2. **Incremental Scorecard Generation**
```bash
# Only regenerate scorecards for changed capabilities
scripts/refactor/generate_scorecards.sh --incremental --changed-only
```

**QUALITY ENHANCEMENTS:**

1. **Evidence Pointer Validation**
```python
def validate_evidence_pointer(pointer):
    """Ensure evidence pointer resolves to actual evidence"""
    assert evidence_exists(pointer.target)
    assert evidence_is_current(pointer.target)
    assert evidence_supports_claim(pointer.claim, pointer.target)
```

2. **Automated Evidence Linking**
```python
def auto_link_evidence(normative_statement):
    """Suggest evidence links for normative statements"""
    candidates = search_evidence_index(normative_statement)
    return rank_by_relevance(candidates)
```

3. **Capability Scorecard Automation**
```python
def generate_capability_scorecard(capability):
    return {
        "required_docs_present": check_required_docs(capability),
        "required_headings_present": check_required_headings(capability),
        "entrypoints_linked": check_entrypoint_links(capability),
        "schemas_referenced": check_schema_references(capability),
        "evidence_indexed": check_evidence_coverage(capability),
        "score": calculate_overall_score()
    }
```

**NEW OUTPUTS:**
- `EVIDENCE_VALIDATION_REPORT.json` - All evidence pointer validations
- `AUTO_EVIDENCE_SUGGESTIONS.json` - Suggested evidence links
- `CAPABILITY_SCORECARDS_DETAILED.json` - Detailed scorecard breakdown
- `QUALITY_TRENDS.json` - Quality metrics over time

**ENHANCED GATES:**
- ✅ 0 normative statements without evidence
- ✅ All evidence pointers validate
- ✅ All capability scorecards ≥ 95%
- ✅ Coverage matrix 100% complete
- ✅ Freshness SLA compliance ≥ 95%
- ✅ UNKNOWN < 1%

---

### Phase 4 — Automation & CI (3-5 days, integrated)

**PERFORMANCE OPTIMIZATIONS:**

1. **Selective Gate Execution**
```yaml
# .github/workflows/refactor-gates.yml
on:
  pull_request:
    paths:
      - 'docs/**'
      - 'server/**'
      - 'client/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Detect changed files
        id: changes
        run: |
          echo "docs_changed=$(git diff --name-only origin/main | grep '^docs/' | wc -l)" >> $GITHUB_OUTPUT
      
      - name: Run doc gates
        if: steps.changes.outputs.docs_changed > 0
        run: scripts/refactor/verify_docs.sh
```

2. **Parallel Gate Execution**
```bash
# Run independent gates in parallel
scripts/refactor/gate_links.sh &
scripts/refactor/gate_metadata.sh &
scripts/refactor/gate_contracts.sh &
wait
```

3. **Cached Validation Results**
```bash
# Cache validation results between runs
scripts/refactor/verify_all.sh --cache --cache-key $GITHUB_SHA
```

**QUALITY ENHANCEMENTS:**

1. **Progressive Gate Enforcement**
```json
{
  "phase_2": ["link_integrity", "metadata_presence"],
  "phase_3": ["evidence_pointers", "scorecard_completeness"],
  "phase_4": ["all_gates"],
  "phase_5": ["all_gates_strict"]
}
```

2. **Gate Failure Diagnostics**
```bash
# Detailed failure reporting
scripts/refactor/verify_all.sh --verbose --output-format json > gate_results.json
```

3. **Auto-Fix Capabilities**
```bash
# Auto-fix simple violations
scripts/refactor/auto_fix.sh --fix-links --fix-metadata --dry-run
```

**NEW OUTPUTS:**
- `GATE_EXECUTION_LOG.json` - All gate runs with timing
- `GATE_FAILURE_DIAGNOSTICS.json` - Detailed failure analysis
- `AUTO_FIX_SUGGESTIONS.json` - Suggested automatic fixes
- `CI_PERFORMANCE_METRICS.json` - CI execution metrics

**ENHANCED GATES:**
- ✅ All gates pass in < 5 minutes (CI)
- ✅ All gates pass in < 2 minutes (local)
- ✅ Cache hit rate ≥ 90%
- ✅ Auto-fix success rate ≥ 80%
- ✅ Dual-mode consistency verified

---

### Phase 5 — Final Lock (2-3 days, verified)

**PERFORMANCE OPTIMIZATIONS:**

1. **Comprehensive Audit Script**
```bash
# Single command for complete audit
scripts/refactor/final_audit.sh --comprehensive --output FINAL_AUDIT_REPORT.json
```

2. **Parallel Verification**
```bash
# Verify all aspects in parallel
scripts/refactor/verify_completeness.sh &
scripts/refactor/verify_quality.sh &
scripts/refactor/verify_governance.sh &
wait
```

**QUALITY ENHANCEMENTS:**

1. **Regression Test Suite**
```bash
# Ensure refactor didn't break functionality
scripts/refactor/regression_tests.sh --full
```

2. **Documentation Coverage Report**
```python
def generate_coverage_report():
    return {
        "code_with_docs": calculate_code_coverage(),
        "docs_with_evidence": calculate_evidence_coverage(),
        "capabilities_complete": calculate_capability_coverage(),
        "overall_score": calculate_overall_coverage()
    }
```

3. **Maintenance Runbook**
```markdown
# MAINTENANCE_RUNBOOK.md
## Daily Operations
- Run: `scripts/refactor/daily_check.sh`
- Expected: All gates green

## Weekly Operations
- Run: `scripts/refactor/weekly_audit.sh`
- Review: Freshness violations

## Monthly Operations
- Run: `scripts/refactor/monthly_review.sh`
- Update: Stale documentation
```

**NEW OUTPUTS:**
- `FINAL_AUDIT_REPORT.json` - Comprehensive audit results
- `REGRESSION_TEST_RESULTS.json` - All regression tests
- `COVERAGE_REPORT.json` - Complete coverage metrics
- `MAINTENANCE_RUNBOOK.md` - Ongoing maintenance procedures
- `REFACTORING_COMPLETION_CERTIFICATE.md` - Official completion

**FINAL GATES (Enhanced):**
- ✅ UNKNOWN = 0
- ✅ 0 broken links
- ✅ 0 missing metadata
- ✅ 0 normative-without-evidence
- ✅ Coverage matrix 100%
- ✅ Capability scorecards 100%
- ✅ Smoke harness passes
- ✅ Regression tests pass
- ✅ CI green with all gates
- ✅ Performance targets met
- ✅ Quality targets met

---

## PERFORMANCE MEASUREMENT FRAMEWORK (Enhanced)

### Real-Time Metrics Dashboard

```json
{
  "current_phase": "Phase 2",
  "progress": {
    "files_processed": 245,
    "files_remaining": 54,
    "percent_complete": 82
  },
  "performance": {
    "avg_processing_time_per_file": "2.3s",
    "estimated_completion": "2026-02-18",
    "cache_hit_rate": 0.87
  },
  "quality": {
    "unknown_count": 12,
    "unknown_percent": 4,
    "avg_confidence": 0.91,
    "gate_pass_rate": 0.96
  }
}
```

### Automated Reporting

```bash
# Generate daily progress report
scripts/refactor/daily_report.sh --email team@example.com

# Generate weekly summary
scripts/refactor/weekly_summary.sh --format markdown > WEEKLY_SUMMARY.md
```

---

## RISK MITIGATION (Enhanced)

### Automated Risk Detection

```python
def detect_risks():
    risks = []
    
    # Performance risks
    if avg_processing_time > threshold:
        risks.append({"type": "performance", "severity": "high"})
    
    # Quality risks
    if unknown_percent > 10:
        risks.append({"type": "quality", "severity": "medium"})
    
    # Scope risks
    if new_files_added > threshold:
        risks.append({"type": "scope_creep", "severity": "high"})
    
    return risks
```

### Automated Mitigation

```bash
# Auto-escalate high-severity risks
scripts/refactor/risk_monitor.sh --auto-escalate --threshold high
```

---

## EXECUTION CHECKLIST (Enhanced)

### Pre-Phase Checklist
- [ ] Review phase objectives
- [ ] Verify prerequisites met
- [ ] Run pre-phase validation
- [ ] Allocate resources (agents/humans)
- [ ] Set up monitoring

### During-Phase Checklist
- [ ] Run daily progress check
- [ ] Monitor performance metrics
- [ ] Address blockers immediately
- [ ] Update stakeholders
- [ ] Maintain cache freshness

### Post-Phase Checklist
- [ ] Run all phase gates
- [ ] Generate phase report
- [ ] Archive phase artifacts
- [ ] Review lessons learned
- [ ] Approve phase completion

---

## CONCLUSION

This enhanced plan reduces execution time by **50-60%** while improving quality through:

1. **Parallel execution** across capability tracks
2. **Incremental validation** with caching
3. **Automated conflict resolution** and evidence linking
4. **Progressive refinement** of classifications
5. **Real-time monitoring** and risk detection

**Expected Outcome:** Complete refactoring in **3.5-5 weeks** (vs 8-12 weeks) with **higher quality** and **lower risk**.

**Status:** READY FOR APPROVAL AND EXECUTION
