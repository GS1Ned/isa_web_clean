# ISA Agent Handoff Protocol

Status: CANONICAL

## Purpose
Define how OpenClaw, Gemini Code Assist, Codex, GitHub, Manus, and the host/VM workspaces exchange work without relying on chat-only context.

## Handoff SSOT
- Routing truth: `config/agent-platform/task-routing.matrix.json`
- Handoff schema truth: `config/agent-platform/handoff.contract.json`
- Capability delivery truth: `config/agent-platform/capability-delivery.workflow.json`
- GitHub label truth: `config/agent-platform/github-label-map.json`
- Handoff artifact root: `docs/planning/agent-handoffs/`
- Collaboration truth: GitHub issue, PR, and branch artifacts

## Handoff Artifact Directory
- `docs/planning/agent-handoffs/` stores machine-readable handoff artifacts generated from the ISA routing matrix.
- Do not add narrative README files under `docs/planning/`; keep explanation here and keep the directory artifact-only.
- Primary commands:
  - `bash scripts/dev/resolve-agent-task-routing.sh --task-class <task_class>`
  - `bash scripts/dev/create-agent-handoff.sh --task-class <task_class> --title "<title>" --issue <n> --branch <name> --summary "<summary>"`

## Required Inputs
- `task_class`
- short `title`
- at least one control-plane pointer:
  - GitHub issue
  - GitHub PR
  - branch name

## Handoff Rules
- Every cross-platform task must resolve through the routing matrix before work starts.
- If work spans tools or time, create a handoff artifact in `docs/planning/agent-handoffs/`.
- The handoff artifact must not contain secrets or raw secret-like values.
- GitHub issues and PRs remain the external control plane; the handoff artifact is the repo-side coordination record.
- OpenClaw is the default planner for repo-analysis, GitHub-ops, runtime, and long-context work.
- Gemini is the default fast local executor for issue-scoped host work.
- Codex is the default deep local executor for refactors, debug loops, and `app_dev` implementation.
- Manus remains exclusive owner of deploy, OAuth, and production platform work.

## Operational Flow
1. Resolve the task route with `scripts/dev/resolve-agent-task-routing.sh`.
2. Create a handoff artifact with `scripts/dev/create-agent-handoff.sh`.
3. Execute in the environment named by the route.
4. Validate in the environment named by the route.
5. Persist the result as code, docs, issue state, PR state, or a completed handoff artifact update.

## Exact Handoff To Manus
1. Confirm the task belongs to a Manus-owned class:
   - usually `manus_platform_or_deploy_work`
   - or another task class whose `primary_executor` resolves to `manus_platform`
2. Ensure there is a control-plane pointer:
   - issue, PR, or branch
3. Summarize the platform action in one implementation-focused paragraph:
   - what must change
   - why it belongs to Manus
   - what completion signal is expected
4. Generate the repo-side handoff artifact:
   - `bash scripts/dev/create-manus-handoff.sh --title "..." --issue <n>|--pr <n>|--branch <name> --summary "..."`
5. Hand the task to Manus using the GitHub artifact plus the generated handoff file as the source of truth.
6. Manus executes only the platform-owned change.
7. Validation must come from Manus and/or GitHub CI for the platform-owned risk.
8. Update the handoff artifact or linked issue/PR when the platform action is complete.

## Exact Handoff From OpenClaw, Gemini, Or Codex To Manus
- OpenClaw -> Manus
  - OpenClaw identifies that task routing resolves to `manus_platform`
  - OpenClaw prepares the issue/PR context and creates the handoff artifact
  - OpenClaw does not execute the production platform step itself
- Gemini -> Manus
  - Gemini may prepare code, docs, or local validation artifacts in the host repo
  - Gemini must stop at the platform boundary and create or update the handoff artifact
  - Gemini does not receive `platform_prod` secrets
- Codex -> Manus
  - Codex may finish local implementation and produce a reviewable branch
  - Codex must not perform production deploy or platform-secret operations
  - Codex hands off via GitHub artifact plus repo-side handoff file

## Manus Handoff Payload
- `task_class`
- `title`
- `summary`
- one of: `issue`, `pr`, `branch`
- route snapshot showing `primary_executor=manus_platform`
- required artifacts list
- next actor set to `manus_platform`

## Stop Conditions Before Manus Handoff
- Stop if the task has no issue, PR, or branch pointer.
- Stop if the task class does not resolve to `manus_platform`.
- Stop if secrets or raw credentials are about to be copied into the handoff artifact.
- Stop if the work can be completed entirely in host, VM, or GitHub lanes without Manus-owned platform changes.

## Minimal Handoff Contents
- task class
- title
- summary
- route snapshot
- issue, PR, or branch pointer
- required artifacts
- next actor

## Prohibited Handoff Behavior
- No secrets in handoff files.
- No branchless, issue-less cross-platform work for non-trivial tasks.
- No relying on extension-local chat history as the only transfer mechanism.
- No Manus production work routed through local IDE agents.
