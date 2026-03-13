# MCP Policy (Canonical)
Status: CANONICAL
Last Updated: 2026-03-13

## Purpose And Scope
This policy defines how ISA agents choose MCP servers, what the repository actually configures, and how MCP-derived evidence is recorded without leaking secrets.

Scope: ISA repository development across code, docs, governance, data-plane work, evaluation, CI, and research that changes repo truth.

## Source Of Truth For MCP Configuration
- Shared server inventory: `config/mcp/servers.catalog.json`
- Claude-compatible repo config: `.mcp.json`
- Codex user merge template: `config/ide/codex/user-config.template.toml`
- Repo-scoped Codex defaults only: `.codex/config.toml`
- Validation scripts: `scripts/validate_mcp_agent_readiness.sh`, `scripts/validate_mcp_connectivity.sh`

## Availability Classes

### Repo-Managed Shared Servers
These servers are confirmed by repo-managed config and are the only set validated by the shared readiness scripts today.

| name | purpose | where_configured | trigger_conditions | anti_triggers | evidence_logging_required | data_risk |
| --- | --- | --- | --- | --- | --- | --- |
| `filesystem` | Read/write repo files deterministically | `config/mcp/servers.catalog.json`, `.mcp.json`, `config/ide/codex/user-config.template.toml` | Any claim about repo content; any doc/code edit; file/path discovery | User provided the full required content inline and no repo read is needed | YES | med |
| `git` | Diffs, history, branch state, and change scope | `config/mcp/servers.catalog.json`, `.mcp.json`, `config/ide/codex/user-config.template.toml` | Any claim about branch state, diffs, blame, or release hygiene | The task does not depend on git state | YES | med |
| `fetch` | Static public web retrieval for exact evidence | `config/mcp/servers.catalog.json`, `.mcp.json`, `config/ide/codex/user-config.template.toml` | Official docs, standards, or source snapshots where static retrieval is enough | JS-rendered/cookie-gated flows that need browser automation | YES | med |
| `playwright` | Deterministic browser/runtime evidence | `config/mcp/servers.catalog.json`, `.mcp.json`, `config/ide/codex/user-config.template.toml` | UI repro, screenshots, JS-rendered pages, DOM verification | `fetch` is sufficient; browser automation is irrelevant or blocked | YES | med |
| `openai_docs` | Authoritative OpenAI/Codex docs via MCP | `config/mcp/servers.catalog.json`, `.mcp.json`, `config/ide/codex/user-config.template.toml` | Any claim about Codex, OpenAI APIs, MCP behavior, or config syntax that could drift | Repo truth already answers the question; offline-only work | YES | low |
| `github` | GitHub issues, PRs, review context, and upstream repo metadata | `config/mcp/servers.catalog.json`, `.mcp.json`, `config/ide/codex/user-config.template.toml` | PR/issue/review context; upstream implementation evidence; remote repo metadata | Repo truth alone is sufficient; auth is unavailable | YES | high |
| `sequential-thinking` | Explicit decomposition for ambiguous or multi-phase work | `config/mcp/servers.catalog.json`, `.mcp.json`, `config/ide/codex/user-config.template.toml` | Architecture planning, migration sequencing, complex debugging | Straightforward inspect/edit/validate loops | NO | low |

### Optional Session-Only Codex Servers
Some Codex sessions expose additional servers such as `context7`, `memory`, `postgres`, and `neo4j`. The repo does not currently manage or validate these as shared defaults, so do not assume they exist from repo config alone.

| name | use_when | do_not_assume | fallback_if_unavailable |
| --- | --- | --- | --- |
| `context7` | Version-sensitive framework/library setup or API usage needs current docs | Repo-managed availability, auth, or parity with other tools | Use repo truth first, then official vendor docs via `fetch`; use `openai_docs` for OpenAI-specific behavior |
| `memory` | Durable project conventions or recurring blockers need cross-session persistence | That memory contents are fresher than repo truth | Re-read repo docs/config/code and record the missing durable fact locally in the owning canonical doc if needed |
| `postgres` | Live relational schema/data state matters for migration, rehydration, parity, or runtime debugging | That Postgres credentials or server wiring are present in every session | Use repo schema, migration files, runtime docs, and scripts; note the live-data blocker explicitly |
| `neo4j` | Live graph traversals or graph-backed validation materially affect the answer | That graph credentials or server wiring are present in every session | Use repo graph/bootstrap scripts and architecture docs; note the live-data blocker explicitly |

## Routing Order
1. Repo truth first: use `filesystem`, then `git`.
2. Official docs second: use `openai_docs` for OpenAI/Codex, and `fetch` for other official public docs or standards.
3. Browser/runtime evidence only when needed: use `playwright`.
4. External repository/review context when needed: use `github`.
5. Optional Codex-only servers only when the current runtime proves availability and the task actually requires them.
6. Wider external retrieval only when repo truth and official docs are insufficient.

Do not use web retrieval by default. Use it only when freshness, external validation, or exact source capture is required.

## Common ISA Task Routing
- Repo refactor, docs cleanup, contract edits, or code inspection: `filesystem` + `git`
- Codex/OpenAI config or product behavior: `openai_docs` + `filesystem`
- Framework/library implementation details: `filesystem` first, then `context7` if available, otherwise official vendor docs via `fetch`
- UI repro or browser-state evidence: `playwright` + `filesystem` + `git`
- PR, issue, review, or CI metadata: `github` + `git`
- DB, ingestion, provenance rebuild, rehydration, or parity work: `filesystem` + `git`; add `postgres` only when live relational truth matters
- Graph-backed ESRS/GS1/advisory validation: `filesystem` + repo scripts/docs; add `neo4j` only when live graph truth matters
- Durable cross-session workflow preferences: `memory` only for stable conventions, never as a substitute for fresh repo inspection

For DB, ingestion, provenance, or eval work, route through the owning canonical docs before live tools:
- `docs/spec/ISA_DATA_PLANE_ARCHITECTURE.md`
- `docs/spec/KNOWLEDGE_BASE/PROVENANCE_REBUILD_SPEC.md`
- `docs/ops/RUNBOOK.md`
- `data/evaluation/golden/registry.json`
- `docs/ci/INDEX.md`

## Search Fallback
- Primary in-repo discovery path: `filesystem.search_files`
- Content-search fallback: `rg -n "pattern" <path>`
- Apply the same evidence standard regardless of tool path. Record searched paths, matched files, URLs, and UTC retrieval dates when they materially support a claim.

## Lean Documentation Integration Mode
- Integrate useful outcomes directly into existing canonical docs/config before creating new artifacts.
- Do not commit ad hoc report files by default.
- Triage findings as `INTEGRATE_NOW`, `RESOLVE_NOW`, or `DROP_NOW`.
- Resolve uncertainty in the same run or drop it; do not commit unresolved claims.
- Keep scratch analysis outside the repo (`/tmp`) unless explicitly promoted into canonical docs or governed evidence artifacts.

## Evidence Logging (No-Console Compatible)
Do not add console logging in code or examples.

When MCP output materially supports a claim or an MCP action modifies repo state, append a short evidence note to:
- `docs/evidence/generated/_generated/mcp_log.md`

Minimum fields:
- `timestamp_utc=...`
- `task=...`
- `server=...`
- `trigger=...`
- `inputs=...` (paths/urls only; redact tokens)
- `outputs=...` (paths/urls/hashes/artifact names)
- `errors=...` (if any)
- `fallback=...` (if any)

Redaction rules:
- Never include secrets, tokens, cookies, Authorization headers, or private repo content.
- For any web source used as evidence, record the URL and retrieval date (UTC).

## Repo-Level Vs User-Level Responsibility
Repo-managed:
- `.codex/config.toml`
- `config/ide/codex/user-config.template.toml`
- `config/mcp/servers.catalog.json`
- `.mcp.json`
- `docs/agent/MCP_POLICY.md`
- `docs/agent/MCP_RECIPES.md`

User-level or runtime-only:
- `~/.codex/config.toml`
- GitHub auth material such as `GH_TOKEN`
- Any runtime credentials for optional servers such as `postgres` or `neo4j`

Token handling requirements:
- Never commit or paste literal token values into repo files, prompts, or logs.
- Validate auth through a smallest-safe runtime check and report pass/fail only.

## Verification Checklist
Codex:
1. Confirm repo `.codex/config.toml` contains only workspace defaults, not secret-bearing MCP/auth material.
2. Confirm `config/ide/codex/user-config.template.toml` and `config/mcp/servers.catalog.json` agree on the repo-managed shared set.
3. Run `bash scripts/validate_mcp_agent_readiness.sh`.
4. Use `MCP_VALIDATE_CONNECTIVITY=1 bash scripts/validate_mcp_agent_readiness.sh` when connectivity verification is needed. This validates the repo-managed shared set only.
5. If using `context7`, `memory`, `postgres`, or `neo4j`, verify availability in the current runtime before relying on them, and record the blocker/fallback when absent.

Repo validation commands:
- Baseline: `bash scripts/validate_mcp_agent_readiness.sh`
- Connectivity: `MCP_VALIDATE_CONNECTIVITY=1 bash scripts/validate_mcp_agent_readiness.sh`
- Documentation hygiene: `python scripts/validate_planning_and_traceability.py`

Connectivity modes:
- `MCP_CONNECTIVITY_MODE=strict` validates `filesystem`, `git`, `fetch`, `playwright`, and the shared HTTP endpoints.
- `MCP_CONNECTIVITY_MODE=fast` skips `playwright` to reduce runtime.
