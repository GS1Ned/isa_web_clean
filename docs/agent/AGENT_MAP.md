# AGENT_MAP (Canonical)
Status: CANONICAL

## Start
- Planning index: docs/planning/INDEX.md
- Execution queue (single source of next work): docs/planning/NEXT_ACTIONS.json
- Program plan: docs/planning/PROGRAM_PLAN.md

## How to work
1) Read docs/planning/NEXT_ACTIONS.json
2) Pick the first item with status=READY
3) Implement exactly one PR for that item
4) Run: bash scripts/gate/all
5) Update the item status (DONE) and evidence_links
6) Commit + push + PR
7) Stop

## Specs
- Specs index: docs/spec/INDEX.md

## Core contract
- Core contract: docs/core/ISA_CORE_CONTRACT.md
