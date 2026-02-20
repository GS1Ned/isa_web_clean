# OSS Benchmarks Package (2026-02-15) - Executed Plan

Last verified date: 2026-02-15

## FACT
- Repo: `GS1Ned/isa_web_clean`
- Base branch: `strict-no-console`
- Work branch: `research/oss-benchmarks-2026-02-15`
- Worktree path: `../isa_web_clean__oss_benchmarks_2026_02_15`
- Preconditions:
  - `git status --porcelain` was empty before starting
  - `git fetch origin --prune` succeeded
- Tools used:
  - `gh` (GitHub CLI)
  - `rg` (ripgrep)
  - `jq`
  - `node`
  - `python3`

## INTERPRETATION
- The initial GitHub repo searches were topic-heavy; to avoid missing obvious high-signal candidates, a small number of additional name-based queries were added and recorded in the raw search artifact.
- The strict no-console policy is enforced for this research package by:
  - Not writing any new examples containing `console\.`
  - Scoping the validation search to `server/`, `client/`, `shared/`, `scripts/`, and `docs/research/oss-benchmarks/2026-02-15/` to avoid failing on pre-existing text in `.github/`.

## RECOMMENDATION
- Re-run this workflow when updating the benchmark date by:
  1. Creating a new branch and folder under `docs/research/oss-benchmarks/<YYYY-MM-DD>/`.
  2. Re-running the GitHub searches and metadata extraction.
  3. Re-running the validator script: `bash scripts/validate_oss_benchmarks_2026_02_15.sh`.

## PHASE 6A RUBRIC CONTRACT (2026-02-20 Refresh)
- Capability rubric dimensions (required for each benchmarked capability):
  1. `reliability` (SLO/error-budget alignment, retry/idempotency patterns)
  2. `security` (dependency policy, authz posture, secret hygiene)
  3. `observability` (structured logs, traces, actionable telemetry)
  4. `data_provenance` (source traceability, lineage, reproducibility)
  5. `evaluation_quality` (deterministic fixtures, quality/eval governance)
- Evidence requirements (mandatory):
  - source URL
  - retrieval UTC date
  - explicit capability mapping (`ASK_ISA`, `NEWS_HUB`, `KNOWLEDGE_BASE`, `CATALOG`, `ESRS_MAPPING`, `ADVISORY`)
  - verification method (`gate`, `test`, or `artifact`)

## PHASE 6B CONVERSION CONTRACT (2026-02-20 Refresh)
- For each capability, select 3-5 external references and extract:
  - copyable practices
  - minimum implementation set
  - proof method mapping (`gate`/`test`/`artifact`)
- Every converted finding must map to one executable backlog row in `docs/planning/BACKLOG.csv`.

---

## Steps Executed (Setup -> Baseline -> Discovery -> Validation -> Forensics -> Synthesis -> Validation)

1. Setup (worktree mode)
   - `cd /Users/frisowempehomefolder/Documents/isa_web_clean`
   - `git status --porcelain`
   - `git fetch origin --prune`
   - `git worktree add -b research/oss-benchmarks-2026-02-15 ../isa_web_clean__oss_benchmarks_2026_02_15 strict-no-console`

2. ISA baseline extraction (repo-grounded)
   - Read canonical entrypoints and runtime shape:
     - `server/_core/index.ts`
     - `client/src/main.tsx`
     - `vite.config.ts`
   - Read API layer + typing:
     - `server/routers.ts`
     - `server/_core/trpc.ts`
     - `server/_core/context.ts`
   - Read data layer:
     - `server/db.ts`
     - `server/db-connection.ts`
     - `drizzle/schema/*`
   - Read logging/tracing mechanisms:
     - `server/_core/logger-wiring.ts`
     - `server/utils/server-logger.ts`
     - `server/_core/error-tracking.ts`
     - `server/_core/performance-monitoring.ts`
   - Read CI gates:
     - `.github/workflows/validate-docs.yml`
     - `.github/workflows/schema-validation.yml`
     - `.github/workflows/refactoring-validation.yml`
     - `scripts/refactor/validate_gates.sh`
     - `python3 scripts/validate_planning_and_traceability.py`

3. Discovery (GitHub repo search, recorded)
   - `gh auth status`
   - `gh api rate_limit`
   - `gh search repos ... --json ...`
   - Output: `docs/research/oss-benchmarks/2026-02-15/raw/github_search_candidates.json`

4. Validation (deterministic ranking)
   - Candidate ranking rubric:
     - Stars bucket: `>=5000 => 3`, `>=1000 => 2`, `>=200 => 1`, else `0`
     - Recency bucket (pushedAt): `>=2025-11-15 => 3`, `>=2025-02-15 => 2`, `>=2024-02-15 => 1`, else `0`
     - Transferability: TS/JS => `2`, else `1`
     - Scope-fit flags (0..4): governance/docs, CI workflows, typed boundary, observability/evals signals (from README keywords)
     - Order: `(total desc, stars desc, full_name asc)`

5. Forensic extraction prep (top12 metadata)
   - `gh api repos/<owner>/<repo>`
   - `gh api repos/<owner>/<repo>/releases/latest`
   - Output: `docs/research/oss-benchmarks/2026-02-15/raw/top12_repo_metadata.json`

6. Forensic extraction (top5 deep inspection)
   - `git clone --depth 1 <repoUrl> /tmp/isa_oss_benchmarks_2026_02_15_repos/<owner>__<repo>`
   - `git -C <dir> rev-parse HEAD`
   - `rg` keyword scans to locate concrete file paths
   - Output: `docs/research/oss-benchmarks/2026-02-15/raw/top5_forensic_paths.json`

7. Synthesis (docs + deterministic JSON)
   - Write under `docs/research/oss-benchmarks/2026-02-15/`:
     - `ISA_BASELINE.md`
     - `CANDIDATES.md`
     - `FINDINGS.md`
     - `ANTI_PATTERNS.md`
     - `ISA_ACTION_PLAN.md`
     - `benchmarks.json`
     - plus raw artifacts under `raw/`

8. Validation (hard gate)
   - Create and run: `scripts/validate_oss_benchmarks_2026_02_15.sh`

---

## 2026-02-20 Supportive-Only Crosswalk (In-Place)

Last verified date: 2026-02-20

### FACT
- OSS benchmark artifacts are now explicitly constrained to supportive-only usage for dataset discovery.
- No benchmark finding is authoritative by itself; each item must link to tier 1-4 sources before promotion.

### INTERPRETATION
- Existing benchmark evidence remains useful for implementation patterns and operational heuristics.
- Governance risk is concentrated in provenance/licensing drift when OSS findings are promoted without authoritative corroboration.

### RECOMMENDATION
- Treat this benchmark package as a feeder for `WATCH` candidates by default, then promote only via authoritative confirmation gates.

### Supportive-only handoff contract

| benchmark_output | allowed_use | required_authoritative_corroboration | promotion_gate |
| --- | --- | --- | --- |
| external repo patterns | implementation inspiration | tier 1-4 source URL proving legal/standards basis | authority-link gate |
| schemas/examples in OSS repos | parser/testing bootstrap only | official schema/spec endpoint or legal reference | schema-provenance gate |
| release/commit recency signals | maintenance heuristic | none (advisory only) | cannot promote alone |
| README claims | hypothesis generation | direct authoritative source verification | claim-verification gate |

### Deterministic handoff record format (to deep-research addendum)

| field | required | notes |
| --- | --- | --- |
| `repo` | yes | `owner/name` |
| `commit` | yes | pinned sha |
| `paths_and_hashes` | yes | at least one key file + blob sha |
| `license` | yes | SPDX id or `UNKNOWN` |
| `provenance_link_to_authority` | yes | at least one tier 1-4 URL |
| `supportive_score` | yes | rubric-defined |
| `disposition` | yes | `WATCH` or `OUT` by default |
| `last_verified_date` | yes | must be `2026-02-20` for this run |
