# ISA — Agent Instructions (Canonical)

<!-- EVIDENCE:requirement:docs/governance/_root/ISA_GOVERNANCE.md -->
<!-- EVIDENCE:constraint:AGENTS.md -->
## Non-negotiables (evidence-first)
- Repo contents are the only source of truth. Documentation is a claim unless backed by code/config/tests.
- Label outputs explicitly as: FACT / INTERPRETATION / RECOMMENDATION.
- No secrets in code, logs, prompts, or commits.

## Autonomy & safety
<!-- EVIDENCE:constraint:scripts/refactor/validate_gates.sh -->
<!-- EVIDENCE:decision:docs/governance/MANUAL_PREFLIGHT.md -->
- Prefer deterministic, reproducible steps.
- Never run destructive commands unless explicitly required; if required, print a safe alternative first.
- Prefer CI-compatible solutions; avoid local-only assumptions.

## Terminal execution (blind-paste safe)
- When providing terminal actions: deliver exactly one pasteable block that writes a script to /tmp/*.sh and executes `bash /tmp/*.sh`.
- Script must:
  - `set -euo pipefail`
  - include PREFLIGHT + ACTION in the same run
  - emit one of: STOP=... / READY=... / DONE=...

## Repo workflow
<!-- EVIDENCE:requirement:.github/PULL_REQUEST_TEMPLATE.md -->
<!-- EVIDENCE:constraint:docs/governance/PLANNING_POLICY.md -->
- Do not commit to the default branch.
- Make minimal, reviewable commits with governance-grade messages.
- Prefer small diffs; avoid refactors unless necessary for the task.

## Workspace authority and synchronization (Host ↔ VM ↔ GitHub)
- Canonical SSOT for repository history is the Git remote `origin` (GitHub).
- Current workspace authority (effective 2026-02-25): host repo is the primary editing workspace. VM is the runtime/execution target for OpenClaw operations.
- Default working mode:
  - Edit on host.
  - Run OpenClaw and VM-specific checks through repo scripts over SSH.
  - Sync host ↔ VM via Git only. Do not rsync/zip-copy working trees between environments.
- Host guardrails:
  - Host push remains disabled by default (mirror mode). Any exception must be explicit and temporary.
  - Host pulls must be fast-forward only.
- VM guardrails:
  - VM is execution-first for OpenClaw and infrastructure checks.
  - If editing on VM is explicitly required: run `git status` then `git pull --ff-only` before edits; keep commits small; push to `origin`; mirror on host via `git pull --ff-only`.
- SSH access contract (for scripts and agents):
  - SSH alias: `ISA_VM_HOST` (recommended `isa-openclaw-vm`)
  - VM repo path: `VM_REPO_PATH`
  - VM env path: `VM_ENV_PATH`
  - Key path: `ISA_VM_SSH_KEY`
  - Automation should use non-interactive host key behavior (`StrictHostKeyChecking=accept-new`).
- Agent forwarding is preferred for VM Git operations to avoid copying private keys to the VM.
- OpenClaw runtime contract:
  - UI tunnel: `127.0.0.1:18789` (host) -> `127.0.0.1:18789` (VM).
  - VM state/config location: `/root/.openclaw/*`.
  - `OPENCLAW_GATEWAY_TOKEN` remains VM-only secret, authoritative in `/root/.openclaw/openclaw.json` (or VM env). Never store token values in repo docs.
- Future VM-primary cutover prerequisites (not active yet):
  - Branch protection and merge controls for `main` verified and documented.
  - Host mirror guardrails automated (prevent local host commit/push except explicit temporary override).
  - VM bootstrap + doctor path fully green via repo scripts.
  - SSH known-host and agent-forwarding checks pass non-interactively in automation.
  - Canonical docs/tasks/scripts updated with cutover date and rollback path.
