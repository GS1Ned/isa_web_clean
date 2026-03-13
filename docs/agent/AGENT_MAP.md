# AGENT_MAP (Canonical)
Status: CANONICAL
Last Updated: 2026-03-13

## Canonical Chain
- Entrypoint (top-level only): `AGENT_START_HERE.md`
- Host ↔ VM OpenClaw workflow (canonical): `AGENT_START_HERE.md#host--vm-openclaw-workflow-canonical`
- Agent map (this file): `docs/agent/AGENT_MAP.md`
- Technical documentation canon: `docs/governance/TECHNICAL_DOCUMENTATION_CANON.md`
- Docs index: `docs/INDEX.md`
- Execution queue (single source of next work): `docs/planning/NEXT_ACTIONS.json`

## Tooling: MCP
- Canonical policy: `docs/agent/MCP_POLICY.md`
- Canonical recipes: `docs/agent/MCP_RECIPES.md`
- Codex repo defaults: `.codex/config.toml`
- Codex user merge template: `config/ide/codex/user-config.template.toml`
- Gemini/Codex bootstrap prompt: `docs/agent/GEMINI_CODEX_BOOTSTRAP_PROMPT.md`

## Tooling: OpenClaw
- OpenClaw policy envelope: `docs/governance/OPENCLAW_POLICY_ENVELOPE.md`
- OpenClaw model quick reference: `docs/agent/OPENCLAW_UI_MODEL_QUICK_REFERENCE.md`
- OpenClaw UI prompt starter: `docs/agent/OPENCLAW_UI_DEV_PROMPT_STARTER.md`
- OpenClaw ISA mobilization guide: `docs/agent/OPENCLAW_ISA_MOBILIZATION_GUIDE.md`
- OpenClaw ISA mobilization prompt: `docs/agent/OPENCLAW_ISA_MOBILIZATION_PROMPT.md`

## Planning
- Planning index: `docs/planning/INDEX.md`
- Execution queue (single source of next work when no narrower task scope exists): `docs/planning/NEXT_ACTIONS.json`
- Structured backlog (canonical): `docs/planning/BACKLOG.csv`
- Agent handoffs (cross-session/tool coordination): `docs/planning/agent-handoffs/README.md`

## Specs And Core Contract
- Specs index: `docs/spec/README.md`
- Core contract: `docs/spec/ADVISORY/ISA_CORE_CONTRACT.md`
- Canonical system architecture (CURRENT/TARGET): `docs/spec/ARCHITECTURE.md`
- Canonical data plane contract: `docs/spec/ISA_DATA_PLANE_ARCHITECTURE.md`
- Data-plane migration ADR: `docs/decisions/ADR-0001_SUPABASE_POSTGRES_DATA_PLANE.md`

## Canonical Machine Contracts
- Capability ownership: `docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json`
- Shared primitives: `docs/architecture/panel/_generated/PRIMITIVE_DICTIONARY.json`
- Capability dependency graph: `docs/architecture/panel/_generated/CAPABILITY_GRAPH.json`
- Architecture evidence pointers: `docs/architecture/panel/_generated/EVIDENCE_INDEX.json`
- Validation confidence bundle: `docs/architecture/panel/_generated/MINIMAL_VALIDATION_BUNDLE.json`
- Conflict register (single canonical conflict source): `docs/spec/CONFLICT_REGISTER.md`

## Governance Anchors
- Governance root: `docs/governance/_root/ISA_GOVERNANCE.md`
- Document status model: `docs/governance/DOCUMENT_STATUS_MODEL.md`
- Technical documentation canon: `docs/governance/TECHNICAL_DOCUMENTATION_CANON.md`
- Manual preflight checklist: `docs/governance/MANUAL_PREFLIGHT.md`
- CI index: `docs/ci/INDEX.md`
- Planning policy: `docs/governance/PLANNING_POLICY.md`
- Agent platform operating model: `docs/governance/ISA_AGENT_PLATFORM_OPERATING_MODEL.md`
- Agent handoff protocol: `docs/governance/ISA_AGENT_HANDOFF_PROTOCOL.md`
- Capability delivery workflow: `docs/governance/ISA_CAPABILITY_DELIVERY_WORKFLOW.md`
- Research-output evidence index (distinct from architecture evidence contract): `docs/governance/EVIDENCE_INDEX.md`
- OpenClaw policy envelope runbook: `docs/governance/OPENCLAW_POLICY_ENVELOPE.md`
- OpenClaw UI model quick reference: `docs/agent/OPENCLAW_UI_MODEL_QUICK_REFERENCE.md`
- OpenClaw UI ISA prompt starter: `docs/agent/OPENCLAW_UI_DEV_PROMPT_STARTER.md`

## Default Documentation Mode
- Integrate useful outcomes into existing canonical docs.
- Avoid standalone report artifacts unless explicitly requested.
- Resolve uncertainty now; do not commit unresolved claims.

## Task Resolution
- Explicit user request, active issue/PR, or current branch scope wins over queue order.
- When no narrower task scope exists, use the first `READY` item in `docs/planning/NEXT_ACTIONS.json`.
- Keep standing rules in canonical docs/config; keep task-local plans in planning, issue/PR text, or governed handoff artifacts.

## Execution Procedure (Agent)
1) Read `docs/governance/TECHNICAL_DOCUMENTATION_CANON.md`
2) Resolve task scope from the explicit request/issue/PR/branch, otherwise from `docs/planning/NEXT_ACTIONS.json`
3) Read the affected canonical contracts and code truth for that scope
4) Implement the complete in-scope change with a minimal, reviewable diff
5) Run proportional validation from `docs/governance/MANUAL_PREFLIGHT.md`, `docs/ci/INDEX.md`, and relevant gates
6) Update the owning planning/evidence artifacts only when truth changed
