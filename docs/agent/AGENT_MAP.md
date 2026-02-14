# AGENT_MAP (Canonical)
Status: CANONICAL

## Canonical Chain
- Entrypoint (top-level only): `AGENT_START_HERE.md`
- Agent map (this file): `docs/agent/AGENT_MAP.md`
- Docs index: `docs/INDEX.md`
- Execution queue (single source of next work): `docs/planning/NEXT_ACTIONS.json`

## Planning
- Planning index: `docs/planning/INDEX.md`
- Structured backlog (canonical): `docs/planning/BACKLOG.csv`

## Specs And Core Contract
- Specs index: `docs/spec/README.md`
- Core contract: `docs/spec/ADVISORY/ISA_CORE_CONTRACT.md`

## Governance Anchors
- Governance root: `docs/governance/_root/ISA_GOVERNANCE.md`
- Manual preflight checklist: `docs/governance/MANUAL_PREFLIGHT.md`
- Planning policy: `docs/governance/PLANNING_POLICY.md`
- IRON protocol: `docs/governance/IRON_PROTOCOL.md`

## Execution Procedure (Agent)
1) Read `docs/planning/NEXT_ACTIONS.json`
2) Pick the first item with `status=READY`
3) Implement exactly one scoped change
4) Run local preflight from `docs/governance/MANUAL_PREFLIGHT.md`
5) Update item evidence/status and stop
