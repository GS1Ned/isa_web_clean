# MCP Recipes (Canonical)
Status: CANONICAL
Last Updated: 2026-02-18

All recipes assume the policy in `docs/agent/MCP_POLICY.md`.

## Recipe: Investigate Bug With Reproduction (Playwright + Repo Truth)
1. Establish repo truth.
  - Use `git` to confirm base branch and current status.
  - Use `filesystem.search_files` to locate suspected codepaths/configs.
  - If path/text discovery is blocked, use `rg -n` as fallback and log the fallback in evidence.
2. Reproduce deterministically.
  - Use `playwright` to reproduce the issue and capture:
    - screenshot(s)
    - minimal DOM notes (selectors + text)
    - exact URL and timestamp (UTC)
3. Isolate and fix.
  - Use `filesystem` to implement the smallest change that fixes repro.
  - Use `git` to review the diff for scope/side-effects.
4. Validate.
  - Run the smallest relevant test/check command(s) locally.
  - If UI-related, rerun the `playwright` repro flow and capture an “after” artifact.
5. Evidence log (no-console).
  - Append one entry to `docs/evidence/generated/_generated/mcp_log.md` with inputs/outputs and URLs/dates.

Expected artifacts:
- `git diff` evidence (paths + summary)
- Playwright repro evidence (URLs + screenshots or trace file names)
- One-line acceptance statement tied to a rerun of repro

Acceptance checks:
- Repro fails before and passes after the change.
- Diff is minimal and scoped to the root cause.
- Evidence log entry exists and contains URL + UTC date for any web interaction.

## Recipe: Find Best OSS Pattern And Map Into ISA (GitHub + Fetch + OpenAI Docs)
1. Define what you need.
  - Write a 3-5 bullet “pattern requirements” list (what ISA needs, constraints, and what to avoid).
2. Discover candidates.
  - Use `github` to find relevant repos/issues/PRs.
  - Prefer projects with strong docs/tests and permissive licenses compatible with ISA needs.
3. Capture evidence.
  - Use `fetch` to retrieve stable references (README sections, issue pages) and record:
    - URL
    - retrieval date (UTC)
    - specific section headings or identifiers
4. Validate tool/config facts.
  - Use `openai_docs` for any Codex/MCP/OpenAI product claims that affect the implementation.
5. Map into ISA with minimal diff.
  - Use `filesystem.search_files` + `filesystem` + `git` to implement the smallest adaptation in ISA code/docs.
6. Evidence log (no-console).
  - Append one entry with the key URLs, dates, and what was adopted (and why).

Expected artifacts:
- OSS evidence list (URLs + UTC dates + short rationale)
- Minimal ISA diff implementing the adopted pattern

Acceptance checks:
- Adopted pattern is justified by evidence and fits ISA constraints.
- No secrets are copied into repo configs or docs.
- Any OpenAI/Codex configuration claim is backed by `openai_docs` evidence.

## Recipe: Refactor With Proofs + CI Gates (Filesystem + Git)
1. Preflight and scope lock.
  - Use `git` to confirm clean status and base branch.
  - Identify the smallest refactor boundary and success metric.
2. Implement in small steps.
  - Use `filesystem.search_files` to narrow scope, then `filesystem` to make incremental edits.
  - Use `git` after each step to keep diffs reviewable and to detect accidental churn.
3. Run deterministic gates.
  - Run the repo’s preflight checks relevant to the change (typecheck/tests/gates).
4. Produce proofs.
  - Update/produce any required evidence artifacts (file paths + command outputs).
5. Evidence log (no-console).
  - Log what gates were run and the outcomes.

Expected artifacts:
- Small, reviewable commits/diffs (or a single minimal diff if tiny)
- Gate outputs referenced by command and outcome

Acceptance checks:
- Required gates pass for the refactor scope.
- No behavioral regressions introduced (tests or equivalent evidence).
- Evidence log entry references which checks were run and their results.
