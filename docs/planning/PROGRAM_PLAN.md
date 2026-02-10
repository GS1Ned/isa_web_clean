Last_verified: 2026-02-10
Scope: ISA canonical planning backbone and gated execution model (P0->P2), READ-ONLY analysis with writes limited to backbone/evidence artifacts.
Rules:
- Evidence-first: every claim must cite repository files or command output.
- STOP: on canonical conflict, blocking missing artifacts, or ambiguous authority, halt and request human decision.
- Secrets: never write secret values; names-only references are allowed.

# PROGRAM_PLAN

## Phase Model
| Phase | Mode | Goal | Mandatory Outputs | Gate |
|---|---|---|---|---|
| P0 Pre-Flight Gate | READ-ONLY | Prove coverage, authority, safety, reproducibility, initial capabilities, drift, and gaps | `docs/planning/EXECUTION_LOG.md`, `docs/planning/KNOWLEDGE_GAP_REGISTER.md`, `docs/evidence/EVIDENCE_LEDGER.md` | GO / CONDITIONAL_GO / NO_GO |
| P1 Repository Archaeology & Inventory | READ-ONLY | Reconstruct real delivery maturity from code/tests/config | `docs/planning/WORK_INVENTORY.md`, `docs/planning/CAPABILITY_INVENTORY.md`, `docs/evidence/EVIDENCE_LEDGER.md`, `docs/planning/EXECUTION_LOG.md` | Continue only if P0 != NO_GO |
| P2 Canonicalization Proposals | READ-ONLY | Produce canonical conflict resolutions as PROPOSED decisions only | `docs/decisions/DECISION_LOG.md`, `docs/planning/KNOWLEDGE_GAP_REGISTER.md`, `docs/planning/EXECUTION_LOG.md` | Stop for human confirmation |
| STOP | Human decision | Confirm/reject decision IDs and unblock execution | Human response | Required before WRITE beyond backbone |

## Gates
- `GO`: coverage is full or low risk, governance/spec/planning authority is unambiguous, no P0 blocking gaps.
- `CONDITIONAL_GO`: authority mostly clear, P0 gaps exist with explicit acquisition steps.
- `NO_GO`: authority ambiguity in governance/spec/planning, partial high-risk coverage, or unclear safety discipline.

## Definition of Done
- Backbone artifacts A-H exist and are current.
- Evidence ledger includes major claims and direct evidence pointers.
- Knowledge gaps are prioritized with acquisition paths and resolve-by phase.
- Decision log contains PROPOSED-only entries unless explicit human confirmation exists.

## Canonical Control Artifacts
- Entrypoints: `AGENT_START_HERE.md`, `docs/agent/AGENT_MAP.md`, `docs/spec/INDEX.md`, `docs/governance/_root/ISA_GOVERNANCE.md`
- Planning controls: `docs/planning/PROGRAM_PLAN.md`, `docs/planning/PROMPT_PIPELINE.md`, `docs/planning/EXECUTION_LOG.md`, `docs/planning/KNOWLEDGE_GAP_REGISTER.md`
- Inventory controls: `docs/planning/WORK_INVENTORY.md`, `docs/planning/CAPABILITY_INVENTORY.md`
- Evidence/decision controls: `docs/evidence/EVIDENCE_LEDGER.md`, `docs/decisions/DECISION_LOG.md`

## Current Gate State (2026-02-10)
- P0: `NO_GO` (see `docs/planning/EXECUTION_LOG.md`)
- P1: Blocked pending P0 conflict resolution.
- P2: Blocked pending P0 conflict resolution.
