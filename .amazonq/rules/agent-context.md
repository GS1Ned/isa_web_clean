# Agent Context (Amazon Q)

When working in this ISA repo, treat these as canonical:
- `AGENT_START_HERE.md` (entrypoint)
- `AGENTS.md` (non-negotiables)
- `docs/agent/AGENT_MAP.md` (navigation)
- `docs/agent/MCP_POLICY.md` (MCP usage + evidence policy)
- `docs/agent/MCP_RECIPES.md` (MCP playbooks)

Default behavior:
- Use MCP (`filesystem`, `git`) for any repo-truth claim or edit.
- Use MCP (`fetch`, `playwright`) for external evidence and repro; always record URL + UTC date for web sources.
- Use MCP (`openai_docs`) for OpenAI/Codex/MCP facts that could change.
- Use MCP (`github`) for OSS discovery and upstream evidence (auth-dependent; never leak secrets).
