# ISA Document Status Model

Status: CANONICAL

## Purpose
Define what document status markers mean in ISA so `canonical`, `current`, `target`, `historical`, and machine contracts are not conflated.

## Status Definitions
- `CANONICAL`
  - The authoritative source for a specific scope.
  - This does not automatically mean the document describes only the target state.
  - A canonical document may define:
    - current state
    - target state
    - current-to-target delta
    - workflow or governance rules
- `CURRENT (as-built)`
  - Evidence-backed description of the implemented repository or runtime state.
  - Use this for facts about what exists now.
- `TARGET` or `TARGET_DESIGN`
  - Intended future state.
  - Not valid as an implementation claim until evidence shows the repo/runtime matches it.
- `AUTHORITATIVE_CONTRACT`
  - Machine-readable or generated contract that is authoritative for a narrow technical surface.
  - Examples: ownership manifests, routing matrices, schemas, label maps.
- `SUPPLEMENTAL`
  - Supporting document with useful context but not the SSOT for the broader scope.
- `HISTORICAL REFERENCE ONLY`
  - Archived context.
  - May explain prior decisions, but must not be treated as current operating truth.

## Governing Rule
- Authority is scope-specific.
- `CANONICAL` means "this document wins for this scope", not "this document is automatically the desired future state".

## Required Interpretation Rules
- If a document claims `CANONICAL` and contains both current and target sections, those sections must be labeled explicitly.
- If a document claims `CURRENT (as-built)`, it must not silently smuggle in aspirational target-state claims.
- If a document claims `TARGET` or `TARGET_DESIGN`, it must not be cited as evidence that the implementation already exists.
- If a document is historical, the canonical replacement or current authority should be named when known.

## ISA-Specific Examples
- `docs/spec/ARCHITECTURE.md`
  - Canonical for the system-level `CURRENT` and `TARGET` contract.
  - It is canonical because it owns that comparison, not because everything inside it is already implemented.
- `docs/governance/ISA_AGENT_PLATFORM_OPERATING_MODEL.md`
  - Canonical for the agent-platform operating rules.
- `docs/spec/*/RUNTIME_CONTRACT.md`
  - Current-state runtime contracts for individual capabilities.
- `docs/spec/NEWS_HUB/ISA_NEWSHUB_TARGET_DESIGN.md`
  - Target design, not current-state proof.
- `docs/ISA_AGENT_COLLABORATION.md`
  - Historical reference only.

## Repository Hygiene Rule
- Before removing older documentation:
  - mark it historical or deprecated
  - point to the canonical replacement
  - update references
  - only then archive or delete if still appropriate
