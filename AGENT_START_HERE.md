## Canonical Anchors

<!-- EVIDENCE:requirement:README.md -->
<!-- EVIDENCE:requirement:AGENT_START_HERE.md -->
<!-- EVIDENCE:requirement:docs/REPO_MAP.md -->
<!-- EVIDENCE:requirement:.amazonq/rules/mcp-usage.md -->
The following files are authoritative, stable entry points for agents and tooling:

- `/README.md` — Human-facing project overview
- `/AGENT_START_HERE.md` — Primary agent orientation and rules
- `/docs/REPO_MAP.md` — Canonical repository structure snapshot (CI-generated)
- `/.amazonq/rules/mcp-usage.md` — MCP server usage policy (v2.0)

## MCP Server Policy

**Policy Location:** `.amazonq/rules/mcp-usage.md`  
**Evidence Log:** `docs/evidence/_generated/mcp_log.md`  
**Smoke Tests:** `.mcp/test-new-servers.md`

**Key Principle:** MCP servers invoked when net benefit > net cost

**Configured Servers:** Postgres, Filesystem, Git, Fetch, Puppeteer, Sequential Thinking, Memory, GitHub (+ 17 recommended additions)

**Tool-Use Preflight:** Apply decision tree at task start (see policy file)
## Planning (canonical)

<!-- EVIDENCE:requirement:docs/planning/NEXT_ACTIONS.json -->
<!-- EVIDENCE:requirement:docs/planning/BACKLOG.csv -->
<!-- EVIDENCE:requirement:docs/planning/PROGRAM_PLAN.md -->
- Next actions (canonical): `docs/planning/NEXT_ACTIONS.json`
- Structured backlog (canonical): `docs/planning/BACKLOG.csv`
- Program plan (support, optional): `docs/planning/PROGRAM_PLAN.md`

## Canonical anchors

<!-- EVIDENCE:requirement:REPO_TREE.md -->
<!-- EVIDENCE:requirement:docs/spec/ASK_ISA.md -->
<!-- EVIDENCE:requirement:docs/spec/contracts/ASK_ISA_RUNTIME_CONTRACT.md -->
<!-- EVIDENCE:implementation:server/prompts/ask_isa/index.ts -->
<!-- EVIDENCE:implementation:scripts/probe/ask_isa_smoke.py -->
<!-- EVIDENCE:requirement:docs/governance/ASK_ISA_SMOKE_RUNBOOK.md -->
- Repo tree: `REPO_TREE.md`
- Ask ISA spec: `docs/spec/ASK_ISA.md`
- Ask ISA runtime contract: `docs/spec/contracts/ASK_ISA_RUNTIME_CONTRACT.md`
- Ask ISA prompt entrypoint: `server/prompts/ask_isa/index.ts`
- Planning (canonical): `docs/planning/NEXT_ACTIONS.json` + `docs/planning/BACKLOG.csv`
- Ask ISA smoke:
  - Script: `scripts/probe/ask_isa_smoke.py`
  - Runbook: `docs/governance/ASK_ISA_SMOKE_RUNBOOK.md`
