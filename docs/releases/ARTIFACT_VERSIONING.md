# Artifact Versioning And Releases

FACT
- ISA publishes Git tags for artifact releases using the prefix `isa-artifacts-v`.
- Dataset registry version lives in `data/metadata/dataset_registry.json` as `registryVersion`.
- Release automation is manual (GitHub Actions `workflow_dispatch`).

RECOMMENDATION
- Keep content changes and tagging separate:
  1. Make a PR that updates the artifact(s) (and bumps `registryVersion` when releasing datasets).
  2. Merge that PR to the target branch.
  3. Trigger the `release-artifacts` workflow to tag and create the GitHub Release.

## Workflow

1. Bump versions in a PR (when applicable)
   - Datasets: update `data/metadata/dataset_registry.json.registryVersion` using semver rules.
   - Schemas/docs: no single version file is enforced today; use tags for release cadence.

2. Trigger the release workflow
   - Workflow: `.github/workflows/release-artifacts.yml`
   - Script: `scripts/release-artifacts.sh`
   - Inputs:
     - `release_kind`: `patch|minor|major` (bumped from the latest `isa-artifacts-v*` tag)
     - `artifact_scope`: `datasets|schemas|docs|all`
     - `dry_run`: computes next version and notes only

3. Dataset safety check (enforced)
   - When `artifact_scope` is `datasets` or `all`, `scripts/release-artifacts.sh` requires:
     - `data/metadata/dataset_registry.json.registryVersion == <computed next version>`
   - This prevents accidental tagging without a corresponding registry version bump.

## Local Dry Run

```bash
bash scripts/release-artifacts.sh --dry-run --release-kind patch --artifact-scope datasets
```

