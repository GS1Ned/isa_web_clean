# AGENT_MAP (Canonical)
Status: CANONICAL

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

## Planning
- Planning index: `docs/planning/INDEX.md`
- Structured backlog (canonical): `docs/planning/BACKLOG.csv`
- Execution state registry (phase checkpoints): `docs/planning/refactoring/EXECUTION_STATE.json`

## Specs And Core Contract
- Specs index: `docs/spec/README.md`
- Core contract: `docs/spec/ADVISORY/ISA_CORE_CONTRACT.md`
- Canonical system architecture (CURRENT/TARGET): `docs/spec/ARCHITECTURE.md`
- Canonical data plane contract: `docs/spec/ISA_DATA_PLANE_ARCHITECTURE.md`

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
- Planning policy: `docs/governance/PLANNING_POLICY.md`
- IRON protocol: `docs/governance/IRON_PROTOCOL.md`
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

## Execution Procedure (Agent)
1) Read `docs/governance/TECHNICAL_DOCUMENTATION_CANON.md`
2) Read `docs/planning/NEXT_ACTIONS.json`
3) Pick the first item with `status=READY`
4) Implement exactly one scoped change
5) Run local preflight from `docs/governance/MANUAL_PREFLIGHT.md`
6) Update item evidence/status and stop
