# MCP Policy (Canonical)
Status: CANONICAL
Last Updated: 2026-02-19

## Purpose And Scope
This policy defines when ISA agents should use MCP servers, and how to log evidence while preserving no-console policy compliance and avoiding secret leakage.

Scope: ISA repository development (code, docs, governance, refactors, research used for ISA decisions).

## Server Catalog (SSOT)
Notes:
- `where_configured` refers to repo-checked config files: `.codex/config.toml`, `.amazonq/default.json`, `.mcp.json`, optional `.vscode/mcp.json`.
- `billing` is best-effort and must be treated as `unknown` unless confirmed.
- Evidence logging is required when MCP output is used to justify a claim, or when MCP actions modify repo state.
- Optional servers are intentionally not configured by default: `context7`, `firecrawl`, `db`.

| name | purpose | transport | where_configured | billing | trigger_conditions | anti_triggers | evidence_logging_required | data_risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `filesystem` | Read/write repo files deterministically (source-of-truth for all repo claims) | stdio | codex, q, claude, vscode | local | Any claim about repo content; any doc/code update; verify file existence/paths | User provided full file content inline and no repo read is needed | YES | med |
| `git` | Diffs/history/branch state for evidence-first changes | stdio | codex, q, claude, vscode | local | Any claim about diffs/history; base branch verification; release hygiene | If repo is not a git repo; if answer does not depend on git state | YES | med |
| `fetch` | Retrieve static web content for evidence (HTML/text/markdown) | stdio | codex, q, claude, vscode | local | Validate URLs; capture source snapshots; retrieve non-JS pages for citations | JS-rendered/cookie-gated flows (use `playwright`); paywalled/auth-only content unless explicitly required | YES | med |
| `playwright` | Deterministic browser automation for repro/scrape/DOM issues | stdio | codex, q, claude, vscode | local | UI repro; screenshots/DOM snapshots; JS-rendered pages; cookie/banner flows | If `fetch` suffices; if automation is blocked; if task is not evidence-sensitive | YES | med |
| `openai_docs` | Authoritative OpenAI docs lookup via MCP | http | codex, q, claude, vscode | unknown | Any claim about Codex/MCP/OpenAI product behavior that could change; need exact config syntax | If repo already contains the required truth; if offline work only | YES | low |
| `github` | External OSS patterns, cross-repo search, upstream issue/PR evidence | http | codex, q, claude, vscode | account | Need external implementation patterns; confirm upstream behavior; link evidence to issues/PRs | If solution can be derived from ISA repo alone; if token/auth is unavailable | YES | high |

## Default Behavior (When To Use What)
- Repo truth: use `filesystem` and `git` before making repo claims or edits.
- External evidence: use `fetch` first for static sources, then `playwright` for JS-rendered pages.
- Product facts (OpenAI/Codex/MCP): prefer `openai_docs` to avoid stale assumptions.
- OSS patterns: use `github` for discovery, then capture a stable source snapshot with `fetch` and record retrieval date.

Common ISA task mappings:
- Repo refactor and evidence artifacts: `filesystem` + `git`.
- Benchmark research and external comparison: `github` + `fetch` + `openai_docs`.
- Scraping/DOM/repro work: `playwright` (use `fetch` when JS automation is not required).

### Search-Capable MCP + Fallback
- Primary search path in-repo: use `filesystem.search_files` first for file/path discovery.
- Content search fallback: if `filesystem` is unavailable or incomplete for text matching, use `rg` (`rg -n "pattern" <path>`).
- Always reflect the same evidence standards regardless of path: record searched paths, matched files, and UTC timestamp in evidence artifacts when the result is used for a claim.

## Lean Documentation Integration Mode (Repository-Wide)
These rules apply to all work, not only MCP:
- Integrate useful outcomes directly into existing canonical docs/config before creating new artifacts.
- Do not commit ad-hoc report files by default.
- Triage every finding as `INTEGRATE_NOW`, `RESOLVE_NOW`, or `DROP_NOW`.
- Resolve uncertainty in the same run or drop it; do not commit unresolved claims.
- Keep scratch analysis outside the repo (`/tmp`) unless explicitly promoted to a canonical doc update.

## Evidence Logging (No-Console Compatible)
Do not add console logging in code or examples.

When `evidence_logging_required=YES`, append a short evidence note to:
- `docs/evidence/generated/_generated/mcp_log.md`

Minimum fields (single entry):
- `timestamp_utc=...`
- `task=...`
- `server=...`
- `trigger=...` (short id like `T_REPO_READ`, `T_REPO_WRITE`, `T_WEB_FETCH`, `T_WEB_JS`, `T_OSS_PATTERN`)
- `inputs=...` (paths/urls only; redact tokens)
- `outputs=...` (paths/urls/hashes/screenshot names)
- `errors=...` (if any)
- `fallback=...` (if any)

Redaction rules:
- Never include secrets, tokens, cookies, Authorization headers, or private repo content.
- For any web source used as evidence, record URL plus retrieval date (UTC).

## Rollout (Repo-Level vs User-Level)
Repo-checked (shared defaults):
- `.codex/config.toml` (Codex CLI + VS Code extension)
- `.amazonq/default.json` and `.amazonq/rules/*.md` (Amazon Q in IDE)
- `.mcp.json` (Claude Code)
- `.vscode/mcp.json` (optional workspace discovery)
- `docs/agent/MCP_POLICY.md`, `docs/agent/MCP_RECIPES.md` (canonical agent guidance)

User-level (never commit):
- GitHub auth token for `github` MCP where required (recommended env var: `GH_TOKEN`).
- Any per-user overrides:
  - Codex: `~/.codex/config.toml`
  - Amazon Q: global config under `~/.aws/amazonq/...`
  - Claude Code: user settings / `claude mcp` commands

Token handling requirements:
- Never commit or paste literal token values into repo files, prompts, or logs.
- A token string cannot be trusted by format alone; validate by running an authenticated GitHub API request locally and only report pass/fail.

## Verification Checklist (Per Tool)
Codex (CLI + VS Code):
1. Confirm `.codex/config.toml` is picked up in this repo.
2. Confirm MCP servers list includes: `filesystem`, `git`, `fetch`, `playwright`, `openai_docs`, `github`.
3. Run `bash scripts/validate_mcp_connectivity.sh` for runtime connectivity checks.

Amazon Q (VS Code):
1. Confirm `.amazonq/default.json` exists.
2. In the MCP servers panel, confirm the same server set is visible/enabled.

Claude Code:
1. Confirm `.mcp.json` exists at repo root.
2. Confirm `claude mcp list` shows the server set (auth-dependent for `github`).

Repo validation commands:
- Baseline: `bash scripts/validate_mcp_agent_readiness.sh`
- With runtime checks: `MCP_VALIDATE_CONNECTIVITY=1 bash scripts/validate_mcp_agent_readiness.sh`
- GitHub auth in connectivity checks: uses `GH_TOKEN` first, then falls back to `gh auth token` when available.
- Documentation hygiene gate: `python scripts/validate_planning_and_traceability.py`
- Connectivity mode options:
  - `MCP_CONNECTIVITY_MODE=strict` (default): validates `filesystem`, `git`, `fetch`, `playwright`, plus HTTP endpoints.
  - `MCP_CONNECTIVITY_MODE=fast`: validates `filesystem`, `git`, `fetch`, plus HTTP endpoints (skips `playwright` to reduce runtime).
- Machine-readable summary options:
  - `MCP_SUMMARY_JSON_PATH=/path/to/summary.json`: writes JSON summary for CI/artifacts.
  - `MCP_SUMMARY_STDOUT=1`: prints compact summary JSON to stdout.

CI profile defaults:
- Pull Request profile: `fast` (quick feedback)
- Nightly/scheduled profile: `strict` (full connectivity coverage)
- Workflow file: `.github/workflows/mcp-validation-profiles.yml`
