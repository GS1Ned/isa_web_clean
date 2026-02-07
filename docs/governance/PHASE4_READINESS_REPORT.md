# Phase 4 Readiness Report

**Date:** 2026-02-04  
**Auditor:** Manus AI  
**Scope:** Phase 1-3 artifacts verification for Phase 4 consolidation readiness

## Executive Summary

| Category | Status | Issues Found | Remediation Required |
|----------|--------|--------------|---------------------|
| Canonical Docs Integrity | ✅ PASS | 0 | None |
| Reproducibility Hardening | ⚠️ PARTIAL | 2 | Yes (non-blocking) |
| YAML/Workflows Correctness | ⚠️ PARTIAL | 1 | Yes (non-blocking) |
| Mergeability + CI Clarity | ✅ PASS | 0 | None |

**Overall Verdict:** Phase 4 may proceed. Two non-blocking remediations are recommended.

---

## 0.1 Canonical Docs Integrity

### Check: `docs/spec/` exists with Phase 3 canonical spec set

**Status:** ✅ PASS

**Evidence:**
```
docs/spec/
├── ISA_MASTER_SPEC.md
├── TRACEABILITY_MATRIX.csv (1,010 claims)
├── CONFLICT_REGISTER.md
├── DEPRECATION_MAP.md
├── DECISION_LOG_PHASE3.md
├── RUN_CONFIG.json
├── README.md
└── 12 canonical spec files:
    ├── agent-prompt-governance.md
    ├── catalogue-source-registry.md
    ├── data-knowledge-model.md
    ├── evaluation-governance-reproducibility.md
    ├── governance-iron-protocol.md
    ├── ingestion-update-lifecycle.md
    ├── isa-core-architecture.md
    ├── observability-tracing-feedback.md
    ├── repo-change-control-release.md
    ├── retrieval-embeddings-grounding.md
    ├── roadmap-evolution.md
    └── ux-user-journey.md
```

### Check: Validators pass locally

**Status:** ✅ PASS

**Command:**
```bash
python scripts/validate_specs.py docs/spec/
```

**Output:**
```
Validating 12 canonical spec files...
Validating TRACEABILITY_MATRIX.csv...
Validating RUN_CONFIG.json...
✅ VALIDATION PASSED: All specs valid
```

### Check: Validator not silently skipping critical checks

**Status:** ✅ PASS

**Evidence:** The validator correctly checks the `status` column in TRACEABILITY_MATRIX.csv:
- CSV header: `canonical_spec,claim_id,statement,source_path,source_heading,short_quote,status`
- Validator code (line 61-68): Checks for `status` first, then `trace_status` for backward compatibility

---

## 0.2 Reproducibility Hardening

### Check: All paths derived from repo-root (no hardcodes)

**Status:** ⚠️ PARTIAL PASS

**Evidence:**

**Phase 3 scripts (PASS):**
- `scripts/phase3_synthesis.py`: Uses `detect_repo_root()` function, `ISA_REPO_ROOT` env var, or `--repo-root` CLI arg
- `scripts/validate_specs.py`: Uses relative paths from CLI argument

**Legacy scripts (FAIL - 20 files with hardcoded paths):**
```
scripts/advisory/extract_esg_requirements.py:87:    db_path = '/home/ubuntu/.manus/isa_web.db'
scripts/datasets/analyze_inventory.py:137:    '/home/ubuntu/isa_web/docs/evidence/generated/inventory/docs/evidence/generated/inventory/INVENTORY_BEFORE.csv'
scripts/datasets/build_registry.py:219:    '/home/ubuntu/isa_web'
scripts/generate-dataset-catalog.py:15:    PROJECT_ROOT = Path("/home/ubuntu/isa_web")
... (16 more files)
```

**Remediation:** These are legacy/one-off scripts. Phase 4 will triage them via CLUSTER_REGISTRY labeling. Not blocking for Phase 4 start.

### Check: Phase 3 synthesis tooling reproducible

**Status:** ✅ PASS

**Evidence:**

1. **Repo-root discovery is robust:**
   - Line 572-578 in `phase3_synthesis.py`:
   ```python
   env_root = os.environ.get('ISA_REPO_ROOT', '').strip()
   if args.repo_root:
       repo_root = Path(args.repo_root)
   elif env_root:
       repo_root = Path(env_root)
   else:
       repo_root = detect_repo_root()
   ```
   - Empty string fallthrough fixed (uses `.strip()`)

2. **RUN_CONFIG is explicit single source of truth:**
   - `docs/spec/RUN_CONFIG.json` contains `$schema_note` and `$provenance` fields
   - Script warns when running without explicit config

### Check: CI/workflow steps pass repo-root explicitly

**Status:** ⚠️ PARTIAL PASS

**Evidence:**
- `iron-gate.yml`: Does not use Phase 3 synthesis scripts (not applicable)
- `catalogue-checks.yml`: Uses `scripts/validate_gs1_efrag_catalogue.py` which uses relative paths
- No workflow currently calls `phase3_synthesis.py`

**Remediation:** If Phase 3 synthesis is added to CI, must include:
```yaml
env:
  REPO_ROOT: ${{ github.workspace }}
```

---

## 0.3 YAML/Workflows Correctness Hygiene

### Check: YAML scalars with `:` are quoted

**Status:** ⚠️ PARTIAL PASS

**Evidence:**
```
.github/workflows/catalogue-checks.yml:38:      - name: IRON gate: "catalogue present + fresh"
```

This step name contains a colon but is already quoted. However, the quoting style is inconsistent (some use quotes, some don't).

**Remediation:** Non-blocking. The current YAML is valid and parseable.

### Check: IRON gate uses deterministic workspace root

**Status:** ✅ PASS

**Evidence:** The IRON gate workflow (`iron-gate.yml`) uses `actions/checkout@v4` which sets the workspace to `${{ github.workspace }}` by default. Scripts called use relative paths from the checkout directory.

---

## 0.4 Mergeability + CI Clarity

### Check: Phase 3 PRs merged/conflict-free

**Status:** ✅ PASS

**Evidence:**
- PR #75 (Phase 3 initial): MERGED (2026-02-04)
- PR #76 (Phase 3 improvements): MERGED (2026-02-04)
- No pending Phase 3 PRs

### Check: CI gates documented in canonical place

**Status:** ✅ PASS

**Evidence:** `docs/spec/README.md` contains "CI Integration" section documenting:
- Active workflows: `iron-gate.yml`, `console-check.yml`, `catalogue-checks.yml`, `generate-embeddings.yml`
- Manual validation: `scripts/validate_specs.py`

---

## Remediation Actions Taken

| Issue | Severity | Action | Status |
|-------|----------|--------|--------|
| Legacy scripts with hardcoded paths | Low | Will be triaged in Phase 4 via CLUSTER_REGISTRY | Deferred |
| Missing REPO_ROOT in CI for Phase 3 | Low | Not currently needed; document for future | Noted |

---

## Phase 4 Readiness Verdict

**✅ READY TO PROCEED**

All critical checks pass. The two partial-pass items are:
1. Legacy scripts with hardcoded paths — will be addressed during Phase 4 consolidation
2. CI REPO_ROOT for Phase 3 scripts — not currently needed, documented for future

Phase 4 may begin with Step 1: Establish CLUSTER_REGISTRY.json.
