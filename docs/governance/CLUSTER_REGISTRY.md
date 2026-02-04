# Cluster Registry

**Version:** 1.0.0  
**Last Updated:** 2026-02-04  
**Source:** `docs/governance/CLUSTER_REGISTRY.json`

## Overview

The Cluster Registry is the single source of truth for script organization in the ISA repository. It groups scripts into functional clusters with clear ownership, inputs/outputs, and quality gates.

## Labels

| Label | Description | Count |
|-------|-------------|-------|
| `PRODUCT_PIPELINE` | Production-critical scripts that power ISA features | 7 |
| `DEV_TOOL` | Development utilities and helpers | 3 |
| `ONE_OFF_MIGRATION` | Scripts created for specific migrations, may be removed | 1 |
| `LEGACY_REPLACED` | Deprecated scripts with replacements available | 1 |
| `UNKNOWN_OWNER` | Scripts without clear ownership (needs triage) | 0 |

## Clusters

### Production Pipelines (PRODUCT_PIPELINE)

| Cluster | Description | Canonical Scripts | Quality Gates |
|---------|-------------|-------------------|---------------|
| `ingestion` | Content ingestion pipelines | 4 | `validate_gs1_efrag_catalogue.py` |
| `embeddings` | Vector embedding generation | 1 | - |
| `catalogue` | GS1/EFRAG catalogue generation | 4 | `validate_gs1_efrag_catalogue.py`, `iron_gate_catalogue.sh` |
| `advisory` | ESG advisory report generation | 2 | `validate_advisory.py` |
| `iron-protocol` | IRON Protocol compliance gates | 2 | - |
| `phase3-synthesis` | Canonical spec synthesis | 2 | `validate_specs.py` |
| `esrs` | ESRS data handling | 2 | - |

### Development Tools (DEV_TOOL)

| Cluster | Description | Canonical Scripts |
|---------|-------------|-------------------|
| `parsing` | GS1 NL datamodel parsing | 1 |
| `datasets` | Dataset inventory management | 2 |
| `ci-testing` | CI and integration testing | 2 |

### Legacy/Migration

| Cluster | Description | Scripts |
|---------|-------------|---------|
| `legacy` | Legacy scripts pending removal | 6 deprecated |
| `inspection` | One-off inspection scripts | 4 deprecated |

## Orphan Scripts

The following scripts are not assigned to any cluster and require triage:

| Script | Recommended Label |
|--------|-------------------|
| `analyze-news-data.ts` | ONE_OFF_MIGRATION |
| `analyze-news-quality.ts` | ONE_OFF_MIGRATION |
| `check-db-status.ts` | DEV_TOOL |
| `check-new-fields.ts` | ONE_OFF_MIGRATION |
| `extract_ref_gs1_standards.py` | DEV_TOOL |
| `generate-api-docs.ts` | DEV_TOOL |
| `generate-cron-config.mjs` | DEV_TOOL |
| `generate-dataset-catalog.py` | DEV_TOOL |
| `query-key-regulations.ts` | DEV_TOOL |
| `validate-esg-artefacts.mjs` | PRODUCT_PIPELINE |

## Maintenance

### Adding a New Script

1. Determine the appropriate cluster based on function
2. Add the script to `canonical_scripts` or `deprecated_scripts` in `CLUSTER_REGISTRY.json`
3. If no cluster fits, add to `orphan_scripts` with a recommended label
4. Update this documentation

### Deprecating a Script

1. Move from `canonical_scripts` to `deprecated_scripts` in the cluster
2. Add a replacement pointer if applicable
3. Update callers to use the canonical script

### Removing a Script

1. Verify no callers remain (search for imports/references)
2. Remove from `CLUSTER_REGISTRY.json`
3. Delete the file
4. Update this documentation

## CI Integration

A CI gate should be added to enforce registry compliance:

```yaml
- name: Check script registry compliance
  run: |
    # Fail if new scripts are added without registry entry
    python scripts/validate_cluster_registry.py
```

This gate is not yet implemented (see Phase 4 Step 2.3).
