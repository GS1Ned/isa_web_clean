# ISA Canonical Specifications

**Status:** Phase 3 Complete  
**Last Updated:** 2026-02-04  
**Version:** 1.0.0

## Quick Start

```bash
# Regenerate all specs from Phase 1-2 artifacts
python scripts/phase3_synthesis.py \
  --inputs /path/to/phase1-2-outputs \
  --out docs/spec \
  --config docs/spec/RUN_CONFIG.json

# Validate specs
python scripts/validate_specs.py docs/spec/
```

## Directory Structure

| File | Purpose |
|------|---------|
| `ISA_MASTER_SPEC.md` | Top-level index of all canonical specs |
| `TRACEABILITY_MATRIX.csv` | Claim-to-source mapping for audit |
| `CONFLICT_REGISTER.md` | Semantic conflicts requiring resolution |
| `DEPRECATION_MAP.md` | Document status and lifecycle mapping |
| `RUN_CONFIG.json` | Synthesis configuration (single source of truth) |
| `DECISION_LOG_PHASE3.md` | Decision rationale and quality gates |
| `*.md` (12 files) | Cluster-specific canonical specifications |

## Canonical Specs (12 Clusters)

| Cluster | Spec File | Core Sources |
|---------|-----------|--------------|
| ISA Core Architecture | `isa-core-architecture.md` | 15 |
| Data & Knowledge Model | `data-knowledge-model.md` | 15 |
| Governance & IRON Protocol | `governance-iron-protocol.md` | 15 |
| Ingestion & Update Lifecycle | `ingestion-update-lifecycle.md` | 15 |
| Catalogue & Source Registry | `catalogue-source-registry.md` | 15 |
| Retrieval / Embeddings | `retrieval-embeddings-grounding.md` | 15 |
| Evaluation & Reproducibility | `evaluation-governance-reproducibility.md` | 15 |
| Observability / Tracing | `observability-tracing-feedback.md` | 7 |
| Repo / Change Control | `repo-change-control-release.md` | 15 |
| Agent & Prompt Governance | `agent-prompt-governance.md` | 15 |
| UX & User Journey | `ux-user-journey.md` | 15 |
| Roadmap / Evolution | `roadmap-evolution.md` | 9 |

## Key Metrics

| Metric | Value |
|--------|-------|
| Total Traced Claims | 1,010 |
| Authority Spine Documents | 12 |
| Active Source Documents | 85 |
| Open Conflicts | 53 |
| High Priority Conflicts | 22 |

## Workflow

### 1. Prerequisites

Ensure Phase 1-2 artifacts exist:
- `document_index.json` — Full document inventory
- `cluster_map.json` — Content-based clusters
- `authority_candidates.json` — Authority scoring

### 2. Regenerate Specs

```bash
cd /path/to/isa_repo
python scripts/phase3_synthesis.py \
  --inputs /path/to/outputs \
  --out docs/spec \
  --config docs/spec/RUN_CONFIG.json
```

### 3. Validate Output

```bash
python scripts/validate_specs.py docs/spec/
```

### 4. Review Conflicts

Open `CONFLICT_REGISTER.md` and resolve high-priority conflicts first.

## Configuration

Edit `RUN_CONFIG.json` to adjust synthesis parameters:

```json
{
  "configuration": {
    "max_core_sources_per_cluster": 15,
    "max_claims_in_traceability_per_cluster": 100,
    "max_must_invariants_per_spec": 15
  }
}
```

## Governance Rules

1. **Authority Spine Precedence:** Documents in `primary_authority_spine` have highest precedence
2. **CURRENT vs ULTIMATE:** Specs reflect CURRENT (as-built) state; ULTIMATE documents are excluded
3. **Traceability:** Every claim must trace to a source document
4. **Conflict Resolution:** Use `CONFLICT_REGISTER.md` to track and resolve conflicts

## CI Integration

### Active Workflows (on main)

| Workflow | Purpose | Status |
|----------|---------|--------|
| `iron-gate.yml` | IRON Protocol compliance checks | ✅ Active |
| `console-check.yml` | Console usage validation | ✅ Active |
| `catalogue-checks.yml` | Catalogue integrity | ✅ Active |
| `generate-embeddings.yml` | Embedding generation | ✅ Active |

### Spec Validation (Manual)

The `spec-lint` workflow (`scripts/validate_specs.py`) is **not yet in CI** due to GitHub App workflow permissions. Run manually:

```bash
python scripts/validate_specs.py docs/spec/
```

The validation script checks:
- All canonical specs have required sections (`Core Sources`, `Invariants`)
- TRACEABILITY_MATRIX has no untraceable claims (checks `status` column)
- RUN_CONFIG.json has required fields and valid limits

**To add spec-lint to CI:** A repository admin must manually add `.github/workflows/spec-lint.yml` (see `scripts/validate_specs.py` for the validation logic).

## Maintenance

When source documents change:
1. Re-run Phase 1-2 analysis (documentation-canonicalization skill)
2. Re-run Phase 3 synthesis
3. Review new conflicts in CONFLICT_REGISTER.md
4. Update DEPRECATION_MAP.md for any status changes
