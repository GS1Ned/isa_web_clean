# CI Index

FACT
- CI workflows live under `.github/workflows/`.
- Most workflows map to one or more local commands under `scripts/` and `scripts/gates/`.

RECOMMENDATION
- Naming conventions:
  - Workflows: `<area>-<gate>.yml` (example: `schema-validation.yml`)
  - Disabled workflows: keep as `*.yml.disabled` and document why (this file).
  - Gate scripts: `scripts/gates/<area>-<gate>.sh`
  - Gate scripts should emit one of: `STOP=...` / `READY=...` / `DONE=...` (see `AGENTS.md`).
- Keep workflows narrowly scoped and composable (one gate per workflow where practical).

## Implementation-Only Mode (Temporary)

FACT
- CI workflows expose `ISA_IMPLEMENTATION_ONLY_MODE`.
- During implementation-only mode (`true`), eval/drift/baseline/stage-readiness and security-waiver burn-down activities are paused with explicit no-op summaries.
- Core build/test execution remains active to preserve CI stability.

RECOMMENDATION
- Keep `ISA_IMPLEMENTATION_ONLY_MODE=true` only while ISA v2 architecture implementation (Phase A-D) is in progress.
- Exit criteria for unpause:
  - Phase A-D merged on `main`.
  - v2 maturity declaration recorded in canonical architecture/planning docs.
  - Re-enable paused workflows in controlled order: security gates, eval artifact generation, drift, then baseline/stage blocking.

## Workflows

Active:
- `ask-isa-runtime-smoke.yml`
  - Trigger: PRs that touch Ask ISA prompts/spec/planning and manual `workflow_dispatch`.
  - Purpose: planning validation + Ask ISA probe.
  - Local:
    - `python3 scripts/validate_planning_and_traceability.py`
    - `python3 scripts/probe/ask_isa_smoke.py`
- `ask-isa-smoke.yml`
  - Trigger: any PR, and pushes to `main`.
  - Purpose: Ask ISA probe.
  - Local: `python3 scripts/probe/ask_isa_smoke.py`
- `q-branch-ci.yml`
  - Trigger: PRs/pushes to `isa_web_clean_Q_branch`.
  - Purpose: basic TypeScript + unit tests + build on the Q branch.
  - Local:
    - `pnpm install --frozen-lockfile`
    - `pnpm tsc --noEmit`
    - `pnpm test-ci:unit`
    - `pnpm build`
- `refactoring-validation.yml`
  - Trigger: pushes to `main` and `isa_web_clean_Q_branch` for `docs/**` and `scripts/refactor/**`; PRs targeting `main`.
  - Purpose: run refactoring validation gates and enforce a quality score threshold.
  - Local: `bash scripts/refactor/validate_gates.sh`
- `repo-tree.yml`
  - Trigger: scheduled + manual; creates a PR when `REPO_TREE.md` changes.
  - Purpose: keep `REPO_TREE.md` current for navigation and auditing.
  - Local: `tree -a -L 6 -I '<ignored>' > REPO_TREE.md` (see workflow for exact ignore list).
- `schema-validation.yml`
  - Trigger: PRs/pushes targeting `main` when schemas or schema-backed artifacts change.
  - Purpose: validate `test-results/ci/*.json` and other JSON artifacts against `docs/quality/schemas/*.schema.json`.
  - Local:
    - Install AJV CLI: `npm i -g ajv-cli`
    - Run `ajv validate -s <schema> -d <artifact> --strict=false` for each artifact.
- Capability eval baseline policy (nightly/weekly workflows):
  - `stage_a`: `data/evaluation/baselines/isa-capability-baseline.json`
  - `stage_b`: `data/evaluation/baselines/isa-capability-baseline-stage_b.json`
  - `stage_c`: fallback to `stage_a` until a dedicated stage_c baseline exists
  - Resolution helper: `node scripts/eval/resolve-baseline-path.cjs --stage <stage>`
  - Candidate artifact: `test-results/ci/isa-capability-baseline-candidate.json`
  - Candidate schema: `docs/quality/schemas/isa-capability-baseline.schema.json`
- `validate-docs.yml`
  - Trigger: any PR, and pushes to `main`.
  - Purpose: validate planning/traceability rules (repo governance).
  - Local: `python3 scripts/validate_planning_and_traceability.py`

Disabled (`*.yml.disabled`):
- `catalogue-checks.yml.disabled`
  - Purpose: catalogue gates (blocks non-bot edits to generated artefacts + runs catalogue validation).
  - Local:
    - `bash scripts/isa-catalogue/iron_gate_catalogue.sh`
    - `python3 scripts/validate_gs1_efrag_catalogue.py`
- `console-check.yml.disabled`
  - Purpose: grep-based prohibition of Node console method usage under `server/`.
  - Status: disabled; replaced by a scoped repo gate in dedicated PRs.
- `generate-embeddings-optimized.yml.disabled`
  - Purpose: scheduled/manual embeddings generation (batching, retries, caching).
  - Status: disabled to avoid accidental spend / nondeterminism in CI.
- `generate-embeddings.yml.disabled`
  - Purpose: scheduled/manual embeddings generation.
  - Status: disabled.
- `iron-gate.yml.disabled`
  - Purpose: IRON protocol compliance checks for PRs to `main`.
  - Status: disabled for faster iteration; see workflow for the intended checks.
- `update-gs1-efrag-catalogue.yml.disabled`
  - Purpose: scheduled/manual refresh of GS1/EFRAG catalogue artefacts.
  - Status: disabled (would push a bot branch + PR).

## Gate Scripts (Quick Links)

- Governance: `bash scripts/gates/governance-gate.sh`
- Security: `bash scripts/gates/security-gate.sh`
- Observability contract: `bash scripts/gates/observability-contract.sh`
- Proof/artifact validation: `bash scripts/gates/validate-proof-artifacts.sh`
