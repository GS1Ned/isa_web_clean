# ISA Deep OSS Research Plan (Executed)

Last verified date: 2026-02-15

## FACT
- Execution mode: Git worktree at `../isa_web_clean__isa_deep_research_2026_02_15`.
- Branch: `research/isa-deep-research-2026-02-15` (tracking `origin/strict-no-console`).
- Output directory: `docs/research/isa-deep-research/2026-02-15/`.
- Raw evidence directory: `docs/research/isa-deep-research/2026-02-15/raw/`.

## INTERPRETATION
- GitHub discovery used `gh search repos` for the 10 planned repo queries. `gh search code` was executed for the 4 planned code queries; results may be zero depending on host/indexing.
- Candidate pool was capped to 80 for auditability and deterministic review. The pool is seeded from discovery results and forced to include the final Top 12 selection (recorded in `raw/candidate_pool.json`).

## RECOMMENDATION
- N/A (this file records the executed steps; actionable changes are in `ISA_ACTION_PLAN.md`).

## Steps Executed (Concise)
1. Preflight: clean `git status --porcelain`, fetch `origin`, verify GH auth and API reachability.
2. Worktree + branch: create `research/isa-deep-research-2026-02-15` from `origin/strict-no-console`.
3. Create output dirs under `docs/research/isa-deep-research/2026-02-15/`.
4. Baseline extraction scans for entrypoints, API boundaries, data layer/migrations, CI gates, and observability.
5. GitHub discovery: run 14 planned discovery queries; write `raw/github_discovery_queries.json`.
6. Build candidate pool: union discovery results; cap to 80; write `raw/candidate_pool.json`.
7. Metadata enrichment for Top 12: repo stats, last commit date (default branch head), release date (if any); write `raw/top12_repo_metadata.json`.
8. Forensic path capture for Top 5: shallow partial clones + curated `find` capture; write `raw/top5_forensic_paths.json`.
9. Sentiment source capture: top-comment issues and PRs per Top 12; write `raw/sentiment_sources.json`.
10. Write synthesis markdown, deterministic `benchmarks.json`, and validator; run validator.
