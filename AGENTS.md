# ISA — Agent Instructions (Canonical)

<!-- EVIDENCE:requirement:docs/governance/_root/ISA_GOVERNANCE.md -->
<!-- EVIDENCE:constraint:AGENTS.md -->
## Operating Principles
- Repo files, config, tests, and generated artifacts are the only source of truth. Documentation is a claim until it matches code/config/tests.
- Label outputs explicitly as: FACT / INTERPRETATION / RECOMMENDATION.
- No secrets in code, logs, prompts, commits, screenshots, or evidence artifacts.
- Prefer deterministic, CI-compatible steps and minimal, reviewable diffs.

## Canonical Start Here
- Read `AGENT_START_HERE.md`, then `docs/agent/AGENT_MAP.md`, then `docs/governance/TECHNICAL_DOCUMENTATION_CANON.md`.
- Use `docs/planning/NEXT_ACTIONS.json` as the canonical next-work queue only when the user, active issue/PR, or current branch does not already define the task scope.
- Use `docs/spec/ARCHITECTURE.md` for CURRENT/TARGET system truth.
- For DB, ingestion, provenance, or rehydration work, also read `docs/spec/ISA_DATA_PLANE_ARCHITECTURE.md`, `docs/spec/KNOWLEDGE_BASE/PROVENANCE_REBUILD_SPEC.md`, and `docs/ops/RUNBOOK.md`.
- For evaluation, CI, or gates, also read `data/evaluation/golden/registry.json`, `docs/ci/INDEX.md`, and `docs/governance/MANUAL_PREFLIGHT.md`.

## Standing Vs Task-Local Guidance
- Keep `AGENTS.md` limited to repo-wide rules that should apply on every task.
- Put task-local execution plans in `docs/planning/NEXT_ACTIONS.json`, the active issue/PR, or a governed handoff artifact. Do not turn `AGENTS.md` into a task tracker.
- If the same correction is needed repeatedly, either update `AGENTS.md` for repo-wide always-on behavior or update the deeper canonical doc/script that owns the workflow.

## Documentation And Planning Discipline
- Do not create parallel architecture, roadmap, status, or operating docs when an existing canonical file can absorb the truth.
- Update the owning canonical doc when code, contracts, workflow truth, or operating assumptions materially change.
- Follow `docs/governance/PLANNING_POLICY.md`; new planning truth belongs in `docs/planning/NEXT_ACTIONS.json` or `docs/planning/BACKLOG.csv`.
- MCP usage must follow `docs/agent/MCP_POLICY.md` and `docs/agent/MCP_RECIPES.md`.

## Workflow And Workspace Authority
- Do not commit to the default branch.
- Host repo is the primary editing workspace. VM is the execution-first target for OpenClaw and infrastructure checks. Sync host and VM through Git only.
- Host push stays disabled by default; host and VM pulls must be fast-forward only.
- If VM edits are explicitly required, run `git status` and `git pull --ff-only` before changes.
- Canonical host↔VM runtime, SSH, and OpenClaw details live in `AGENT_START_HERE.md#host--vm-openclaw-workflow-canonical`.

## Tool Routing And Escalation
- Repo truth first: `filesystem`, then `git`.
- Official product docs second: `openai_docs` for OpenAI/Codex behavior; `fetch` for other official public docs; `playwright` only when browser/runtime evidence is required.
- Wider external retrieval only when repo truth and official docs are insufficient, and record the reason.
- `github` is for PR/issue/review context, remote repository metadata, and upstream evidence.
- `context7`, `memory`, `postgres`, and `neo4j` are optional Codex-only servers. Use them only when runtime confirms availability and the task actually requires them; otherwise fall back to repo truth and note the blocker.
- `sequential-thinking` is for complex, ambiguous, or multi-phase planning/debugging.

## Terminal Execution (Blind-Paste Safe)
- When providing terminal actions, deliver exactly one pasteable block that writes a script to `/tmp/*.sh` and executes `bash /tmp/*.sh`.
- The script must use `set -euo pipefail`, include PREFLIGHT + ACTION in the same run, and emit one of `STOP=...`, `READY=...`, or `DONE=...`.

## Safety
- Never run destructive commands unless explicitly required; print a safe alternative first when possible.
- Prefer local commands and repo scripts that can run in CI or over SSH without manual intervention.
