# OpenClaw UI Skill Quick Reference
Status: CANONICAL

## Operational Default
- OpenClaw should only lean on skills that are both policy-allowlisted and live-ready on the VM.
- Current verified-ready core set:
  - `clawhub`
  - `gh-issues`
  - `github`
  - `healthcheck`
  - `mcporter`
  - `session-logs`
  - `skill-creator`
  - `tmux`
  - `weather`

## Route Before You Start
- Run `bash scripts/openclaw-skill-route.sh --task "your task summary" --json`.
- The launcher now does this automatically and writes:
  - `.openclaw/launcher/last_skill_route.json`
  - `.openclaw/launcher/last_skill_route.md`
  - `.openclaw/launcher/last_openclaw_session_brief.md`

## Route Map
- `ISA Skill Lifecycle`
  - Skills: `clawhub`, `skill-creator`, `session-logs`
  - Use for: search/install/update/publish/create skills.
- `ISA GitHub Delivery`
  - Skills: `github`, `gh-issues`, `session-logs`
  - Use for: PRs, issues, workflows, reviews, release follow-through.
- `ISA MCP Tooling`
  - Skills: `mcporter`, `clawhub`
  - Use for: MCP schema discovery, tool calls, generated CLIs, TypeScript clients.
- `ISA Operational Health`
  - Skills: `healthcheck`, `session-logs`
  - Use for: hardening, status, runtime audits, log-backed evidence.
- `ISA Terminal Recovery`
  - Skills: `tmux`, `session-logs`
  - Use for: interactive panes, recovering long-running sessions.
- `ISA Weather`
  - Skills: `weather`
  - Use for: direct weather lookups.

## Constraint
- `gemini` is installed on the VM but not currently authenticated; do not route to it automatically until auth is configured and verified.

## Canonical Policy
- Policy file: `config/openclaw/skill-routing.policy.json`
- Helper script: `scripts/openclaw-skill-route.sh`
