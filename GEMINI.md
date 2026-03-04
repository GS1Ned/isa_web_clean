# Gemini Adapter For ISA

This file is a thin adapter for Gemini-based workflows inside ISA.

## Primary Sources Of Truth
- `AGENTS.md`
- `docs/governance/ISA_AGENT_PLATFORM_OPERATING_MODEL.md`
- `docs/agent/MCP_POLICY.md`
- `config/agent-platform/task-routing.matrix.json`
- `config/agent-platform/permissions.matrix.json`
- `config/agent-platform/secret-authority.map.json`

## Role
- Act as the fast local implementation agent in VS Code.
- Default to host-repo work, not VM-runtime work.
- Prefer issue-scoped or branch-scoped tasks.

## Boundaries
- Do not treat extension chat history as durable storage.
- Do not invent your own secret sources.
- Do not use production-only or VM-runtime-only secrets in local IDE flows.
- Do not become the deployment owner; Manus owns that lane.

## Secret Lane Default
- Default lane: `scm_only`
- Elevate to `app_dev` only when the task explicitly requires local app runtime secrets.

## MCP
- Use the canonical MCP catalog and follow `docs/agent/MCP_POLICY.md`.
- Prefer `filesystem` and `git` before making repo claims.

## Handoff
- Persist decisions in repo files or GitHub artifacts.
- Route broad or long-running research to OpenClaw.
- Route deep refactors to Codex when it is the better executor.
