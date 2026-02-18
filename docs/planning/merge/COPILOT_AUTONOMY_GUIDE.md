# Copilot Agent Autonomy: PR Rebase & Auto-Merge

**Repository:** GS1Ned/isa_web_clean  
**Default Branch:** strict-no-console  
**Status:** Ready for autonomous execution

---

## Quick Start

### Step 1: Activate Agent Mode Settings ✓ (Done)

VS Code settings have been configured at `.vscode/settings.json` with:
- `chat.agent.enabled: true` — Enables full agent mode
- `chat.tools.autoApprove: true` — Experimental auto-approval of tool confirmations
- `chat.agent.runTasks: true` — Allows tasks to run autonomously
- `github.copilot.chat.agent.autoFix: true` — Enables auto-fix capabilities

**Note:** These settings are **experimental** and may require tenant/org approval. If unavailable, fall back to GitHub Copilot Coding Agent (GitHub-hosted).

---

## Step 2: Copy-Paste This Prompt into Copilot Chat (Agent Mode)

Switch VS Code to **Chat** → **Agent** mode, then paste this entire prompt:

```
ROLE: You are operating in VS Code Chat Agent mode.

MISSION
Consolidate and merge all open PRs in repository GS1Ned/isa_web_clean into the default branch (strict-no-console) with minimal risk.
You must execute end-to-end autonomously. Do not ask the user for confirmations. If something is ambiguous, make the safest reasonable assumption and proceed.

NON-NEGOTIABLES
- Never request secrets/credentials from the user. Never print tokens. Never paste sensitive values into files.
- Use the existing authenticated environment (git + gh). If auth is missing, stop with a clear single-line STOP reason and a minimal remediation suggestion.
- Prefer deterministic commands and log everything.
- Keep changes minimal: only what's needed to rebase, fix conflicts, and pass CI.

TARGET STATE / SUCCESS
- Each open PR branch is rebased onto strict-no-console, pushed, CI is green.
- PRs are merged using GitHub auto-merge where possible.
- Produce an audit log at: ./docs/planning/merge/PR_MERGE_AUTOPILOT_LOG.md (create it if missing)
  Include per PR: number, title, branch, actions taken, conflicts, final status, merge commit SHA.

EXECUTION STRATEGY
1) The script file already exists at: ./scripts/copilot/automerge_prs.sh
2) Run it locally with: chmod +x ./scripts/copilot/automerge_prs.sh && ./scripts/copilot/automerge_prs.sh
3) If the script stops due to conflicts or failing checks:
   - Diagnose, fix in code, run tests/linters, commit with a clear message, then rerun the script.
   - Repeat until all PRs are merged or conclusively blocked (document blockers).
4) If a better route exists (e.g., batching by dependency order), you may change the strategy, but keep the same success criteria + logging.
```

---

## Step 3: Run the Autonomous Script

After Copilot completes (or at any point), manually run:

```bash
cd /Users/frisowempehomefolder/Documents/isa_web_clean
chmod +x ./scripts/copilot/automerge_prs.sh
./scripts/copilot/automerge_prs.sh
```

---

## Script Behavior & Exit Codes

| Exit Code | Reason | Action |
|-----------|--------|--------|
| 0 | Success or no open PRs | Process complete; check log at `./docs/planning/merge/PR_MERGE_AUTOPILOT_LOG.md` |
| 1 | Rebase conflict | Copilot must fix conflict in code + commit, then rerun script |
| 1 | Failing tests/lint | Copilot must fix + test, then rerun script |
| 1 | Auto-merge blocked | Check PR UI for blocker (status checks, required reviews, etc.) and fix |
| 1 | Not a git repo / gh not auth | Run `gh auth login` and retry |

---

## Audit Log Location

All operations are logged to: `./docs/planning/merge/PR_MERGE_AUTOPILOT_LOG.md`

Example log format:
```markdown
# PR Merge Autopilot Log

- started_at: 2026-02-16T14:32:00Z
- repo: https://github.com/GS1Ned/isa_web_clean

## PRs discovered
- #123 `fix/console-logs` — Remove console.log from production
- #124 `feat/telemetry` — Add telemetry package

## PR #123: Remove console.log from production
- branch: `fix/console-logs`
- started: 2026-02-16T14:32:15Z
- status: AUTO_MERGE_ENABLED
- finished: 2026-02-16T14:33:42Z

## PR #124: Add telemetry package
- branch: `feat/telemetry`
- started: 2026-02-16T14:33:45Z
- status: STOP_REBASE_CONFLICT
- stopped: 2026-02-16T14:34:00Z

[Copilot must resolve conflicts and rerun]

- completed_at: 2026-02-16T14:45:12Z
```

---

## Failure Recovery

If the script exits with code 1:

1. **Rebase Conflict** → Copilot opens conflicted files, manually resolves, commits, and reruns
2. **Failing Tests** → Copilot runs `pnpm lint` / `pnpm test`, fixes issues in code, commits, reruns
3. **Auto-Merge Blocked** → Check GitHub PR UI for status checks or required reviews; ensure they pass

After fix: `./scripts/copilot/automerge_prs.sh` (picks up where it left off)

---

## Alternative: GitHub Copilot Coding Agent

If `chat.tools.autoApprove` is unavailable or unstable in your tenant:

1. Create a GitHub issue: "Rebase and merge all open PRs to strict-no-console"
2. Assign to **GitHub Copilot** (https://docs.github.com/en/copilot/using-github-copilot/using-copilot-coding-agent-to-work-on-tasks)
3. Copilot will autonomously:
   - Clone the repo
   - Run the script
   - Create a PR with results + audit log
   - Push merge commits to main

---

## Troubleshooting

### `gh not authenticated`
```bash
gh auth login
# Follow prompts to authenticate with GitHub
```

### `pnpm not found`
```bash
npm install -g pnpm
```

### `working tree not clean`
```bash
git status
git add .
git commit -m "checkpoint: before auto-merge"
```

### Script hangs on a PR
Kill the process: `Ctrl+C`, then diagnose using `git status` + `git rebase --abort` if needed.

---

## Security & Policies

- **No secrets printed.** The script never echoes tokens, credentials, or `.env` values.
- **Authenticated via environment.** Uses existing `gh` CLI session (no hardcoded keys).
- **Audit trail.** Every action logged in `PR_MERGE_AUTOPILOT_LOG.md` + git commit history.
- **Sandboxed.** Only modifies PR branches; never touches `strict-no-console` directly.

---

## Success Checklist

- [ ] All open PR branches rebased onto `strict-no-console`
- [ ] All branches pushed with `--force-with-lease`
- [ ] All CI checks passing green
- [ ] Auto-merge enabled on all PRs
- [ ] Audit log at `./docs/planning/merge/PR_MERGE_AUTOPILOT_LOG.md` complete
- [ ] No blockers or all blockers documented in log

---

**Created:** 2026-02-16  
**Script Version:** 1.0  
**Last Updated:** Ready for execution
