# Ask ISA — Smoke Runbook

Status: DRAFT
Generated_at_utc: 2026-02-09T23:08:32Z
Repo_head_sha: cc5f5cad5f709bb84f4f6fbb5b194495a45ba0f0

## Purpose
- Provide a minimal, dependency-light, non-interactive smoke check for the Ask ISA capability.
- This is intentionally file-contract + planning-integrity focused (no runtime execution assumptions).

## How to run (local macOS / VS Code terminal)
```bash
python3 scripts/probe/ask_isa_smoke.py
```

## Expected result
- Output includes `SMOKE_OK` and prints repo_root + verified_files.

## Failure modes
- `SMOKE_FAIL: missing required paths: ...` → repository drift or incomplete scaffold; fix by restoring required files.
- `SMOKE_FAIL: P1-0002 missing in NEXT_ACTIONS.json` → planning drift; re-sync planning files.

## Evidence pointers
- Script: `scripts/probe/ask_isa_smoke.py`
- Runbook: `docs/governance/ASK_ISA_SMOKE_RUNBOOK.md`
- Spec: `docs/spec/ASK_ISA.md`
- Runtime contract: `docs/spec/contracts/ASK_ISA_RUNTIME_CONTRACT.md`
- Planning: `docs/planning/NEXT_ACTIONS.json` (P1-0002)
