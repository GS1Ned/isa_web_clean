# Manual Preflight Checklist (NO_GATES Window)

Status: CANONICAL  
Scope: Local macOS (human) + Manus (non-interactive)  
Purpose: Provide a deterministic “sanity suite” while CI gates are disabled. This checklist is the single source for later re-introducing gates.

## 0. Preconditions
- You are in the ISA repo root.
- Working tree is clean (or you explicitly chose stash/discard).
- You are not making changes on `main` unless explicitly intended.

## 1. Repo & Branch Truth
Run:
- `git rev-parse --show-toplevel`
- `git rev-parse --abbrev-ref HEAD`
- `git rev-parse HEAD`
- `git status --porcelain=v1`

PASS if:
- repo root resolves
- branch is explicit
- dirty is empty (or you chose a remediation)

## 2. Remote Sync (default branch)
Run:
- `git fetch origin --prune`
- `git remote show origin` (confirm HEAD branch)
- `git rev-parse origin/main` and `git rev-parse main`

PASS if:
- local default branch is fast-forwardable or already equal to origin
FAIL if:
- diverged (requires explicit resolution)

## 3. Canonical Anchors Reachability
PASS if these files exist and form a link chain:
- `AGENT_START_HERE.md` -> `docs/agent/AGENT_MAP.md`
- `docs/agent/AGENT_MAP.md` links:
  - `docs/planning/INDEX.md`
  - `docs/planning/NEXT_ACTIONS.json`
  - `docs/spec/ADVISORY/ISA_CORE_CONTRACT.md`
  - `docs/spec/README.md`
- `docs/planning/INDEX.md` links `docs/planning/NEXT_ACTIONS.json`

## 4. Planning Integrity (Plan-as-code)
Check:
- `docs/planning/NEXT_ACTIONS.json` parses as JSON
- READY items are actionable and reference real paths

PASS if:
- JSON parses
- referenced paths exist (or are explicitly marked “create”)

## 5. Spec & Core Contract Minimums
PASS if:
- `docs/spec/README.md` exists and links to all 6 specs:
  - ASK_ISA, NEWS_HUB, KNOWLEDGE_BASE, CATALOG, ESRS_MAPPING, ADVISORY
- `docs/spec/ADVISORY/ISA_CORE_CONTRACT.md` mentions all 6 capabilities and includes an explicit Non-scope/Exclusions section.

## 6. Security Hygiene (repo-only)
PASS if:
- `.env.example` exists (if used by repo)
- no obvious secrets in tracked files (tokens/keys)
- GitHub Actions permissions are not overly broad (when gates are re-enabled)

## 7. Change Discipline (before opening PR)
PASS if:
- changes are minimal and scoped
- fix surface is enumerated
- no unexpected file churn

## 8. Outputs
Record in PR description:
- timestamp_utc
- head_sha
- files changed
- any deviations from checklist and why
