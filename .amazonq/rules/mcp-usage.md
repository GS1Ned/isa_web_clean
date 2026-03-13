# MCP Server Usage Rules (Amazon Q)

SSOT: `docs/agent/MCP_POLICY.md` and `docs/agent/MCP_RECIPES.md`.

This file is a Q-specific binding that summarizes what to do by default for ISA work.

## Configured MCP Servers (Workspace)
Defined in `.amazonq/default.json`:
- `filesystem` (stdio) - repo file read/write
- `git` (stdio) - git diffs/history/state
- `fetch` (stdio) - static web retrieval for evidence
- `playwright` (stdio) - browser automation for repro/JS pages
- `openai_docs` (http) - authoritative OpenAI docs MCP
- `github` (http) - GitHub MCP for OSS patterns (auth-dependent)

## Policy Matrix (Billing + Triggers)
Policy fields:
- `billing`: `local`, `account`, `paid_api`, `unknown`
- `evidence_logging_required`: `YES` means append an entry to `docs/evidence/generated/_generated/mcp_log.md` (no secrets; include URL + UTC date for web sources).

| Server | billing | trigger_conditions | anti_triggers | evidence_logging_required |
| --- | --- | --- | --- | --- |
| `filesystem` | local | Any repo-truth claim; any doc/code update; verify paths/content before responding | User provided complete content inline and no repo read is needed | YES |
| `git` | local | Any claim about diffs/history; verify base branch and working tree status; review minimal diffs | Git state is irrelevant to the answer | YES |
| `fetch` | local | Validate URLs; retrieve static pages for citations; capture stable evidence snapshots | JS-rendered/login/cookie-gated flows (use `playwright`) | YES |
| `playwright` | local | Repro bugs; JS-rendered pages; screenshots/DOM snapshots for evidence | If `fetch` suffices or automation is blocked | YES |
| `openai_docs` | unknown | Any claim about Codex/MCP/OpenAI behavior/config that could change; need exact syntax | If repo already contains the needed truth | YES |
| `github` | account | OSS pattern discovery; upstream issues/PRs as evidence; cross-repo comparisons | If solution can be derived from ISA repo alone; if auth/token unavailable | YES |

## Hard Rules
- Evidence-first: use MCP servers instead of asking the user for information that can be retrieved.
- No secrets: never log tokens/headers/cookies or private content from external sources.
- No-console: do not add console logging in code or examples; log via evidence artifacts only.
- Web sources: always record URL and retrieval date (UTC) for any external evidence.
- Search-first behavior: use `filesystem.search_files` for repo discovery; if unavailable, fallback to `rg -n` and record the fallback in evidence.
- GitHub auth safety: treat `GH_TOKEN` as user-level secret; validate only via local authenticated API call and never store literal token values in repo docs/config.
