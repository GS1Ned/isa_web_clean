# MCP Policy (Canonical)
Status: CANONICAL
Last Updated: 2026-02-19

## Purpose And Scope
This policy defines MCP usage for ISA and enforces a lean, integration-first working mode so repository outputs stay operational and low-noise.

Scope: all agent work in this repository (code, docs, planning, governance, research notes, and automation outputs).

## Canonical Navigation Chain
Agents must read in this order before planning:
1. `AGENT_START_HERE.md`
2. `docs/agent/AGENT_MAP.md`
3. `docs/agent/MCP_POLICY.md`
4. `docs/planning/NEXT_ACTIONS.json`

## Lean Execution Mode (Default)
Do not create standalone report documents by default.

For each finding, classify exactly once:
- `INTEGRATE_NOW`: verified and operationally relevant. Apply a minimal patch directly to an existing canonical file.
- `RESOLVE_NOW`: uncertain. Investigate immediately in the same run until it becomes `INTEGRATE_NOW` or `DROP_NOW`.
- `DROP_NOW`: low-value, redundant, or non-operational. Do not commit; mention only in chat summary if needed.

No unresolved uncertainty may be committed.

## Repo-Wide Documentation Hygiene (All Work, Not Only MCP)
Rules:
- Integrate useful outcomes into existing canonical documents instead of adding new ad-hoc docs.
- Keep temporary analysis outside the repo (`/tmp` or local scratch); remove it before completion.
- Avoid report-style artifact files unless explicitly requested by a human reviewer.
- If a new document is truly required, place it in a canonical location and add an anchor link from a canonical index/map.

Preferred integration targets:
- `AGENTS.md`
- `AGENT_START_HERE.md`
- `docs/agent/AGENT_MAP.md`
- `docs/INDEX.md`
- `docs/planning/PLANNING_POLICY.md`
- `docs/governance/LIVING_DOCUMENTATION_POLICY.md`
- Existing feature/governance/spec docs already used by the team

## MCP Server Use Order
- Repo truth claims or edits: `filesystem` + `git` first.
- External evidence: `fetch` first, escalate to `playwright` for JS-rendered flows.
- Product/config facts that can change: use authoritative docs sources and record URL + UTC retrieval date.

## Evidence Discipline
- No secrets in repo files, prompts, logs, or commits.
- No `console.*` usage examples.
- For evidence-sensitive work, log only actionable references (file paths, URLs, UTC dates), not raw dumps.

## Required Validation Before Finalizing
Run:
- `python scripts/validate_planning_and_traceability.py`

Pass condition:
- No planning drift
- No forbidden new documentation artifacts
- No non-canonical doc sprawl introduced by the change
