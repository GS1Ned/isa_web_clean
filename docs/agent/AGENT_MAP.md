# AGENT_MAP (Canonical)
Status: CANONICAL

## Start
- Planning index: docs/planning/INDEX.md
- Execution queue (single source of next work): docs/planning/NEXT_ACTIONS.json
- Program plan: docs/planning/PROGRAM_PLAN.md

## Execution procedure (agent)
1) Read docs/planning/NEXT_ACTIONS.json
2) Pick the first item with status=READY
3) Implement exactly one PR for that item
4) (NO_GATES_WINDOW) Run local preflight only
5) Update the item status (DONE) and evidence_links
6) Commit + push + PR
7) Stop

## Specs
- Specs index: docs/spec/INDEX.md

## Core contract
- Core contract: docs/core/ISA_CORE_CONTRACT.md

## NO_GATES Operations
- Manual preflight checklist: docs/governance/MANUAL_PREFLIGHT.md

## Ask ISA (Phase 1)
- Spec: `docs/spec/ASK_ISA.md`
- Runtime contract: `docs/spec/contracts/ASK_ISA_RUNTIME_CONTRACT.md`
- Server entry: `server/prompts/ask_isa/index.ts`
