Status: CURRENT OPERATIONAL GUIDE
Last Updated: 2026-03-04

# OpenClaw ISA Mobilization Guide

## Purpose
Use OpenClaw where it creates the most value for ISA development: VM-resident orchestration, long-running repo analysis, policy-governed runtime checks, multi-step research, and bounded delegation to external coding agents.

This guide is operational, not architectural. Product and architecture authority remain in the canonical chain defined by `docs/governance/TECHNICAL_DOCUMENTATION_CANON.md`.

## Official Capability Basis
This guide is grounded in the official OpenClaw docs and current ISA runtime policy.

- Agent workspace and context injection: <https://docs.openclaw.ai/reference/agent-workspace>
- Context sizing and inspection: <https://docs.openclaw.ai/concepts/context>
- Tools and coding profile: <https://docs.openclaw.ai/tools>
- Exec approvals: <https://docs.openclaw.ai/tools/exec-approvals>
- Skills: <https://docs.openclaw.ai/tools/skills>
- Hooks: <https://docs.openclaw.ai/automation/hooks>
- Memory: <https://docs.openclaw.ai/concepts/memory>
- Sub-agents: <https://docs.openclaw.ai/tools/subagents>
- ACP agents: <https://docs.openclaw.ai/tools/acp-agents>
- Sessions: <https://docs.openclaw.ai/session>
- CLI sessions: <https://docs.openclaw.ai/cli/sessions>
- Prompt caching: <https://docs.openclaw.ai/reference/prompt-caching>
- Compaction: <https://docs.openclaw.ai/reference/session-management-compaction>
- Session pruning: <https://docs.openclaw.ai/reference/session-pruning>
- Command queue: <https://docs.openclaw.ai/concepts/queue>

## OpenClaw Best-Fit Roles For ISA

| Work type | OpenClaw fit | Why |
| --- | --- | --- |
| Repo-wide architecture or capability analysis | High | Workspace-native, long-running, evidence-oriented, can operate on VM runtime truth |
| Long-context document or code comparison | High | Research profile plus sub-agents work well for wide scans |
| VM-side runtime checks and policy validation | High | Canonical runtime mode is `vm_only` and repo scripts already delegate there |
| GitHub issue/PR follow-through | High | Matches existing routing and approved skills |
| Cross-platform handoff/orchestration | High | OpenClaw is the formal planner/orchestrator in the ISA operating model |
| Small host-side implementation loops | Medium | Better delegated to Gemini or Codex once the work is bounded |
| Deep refactor with high correctness risk | Medium | Good planner/validator; often better to delegate editing to Codex via ACP or keep host-side |
| Production deploy / platform runtime / OAuth | Low / forbidden | Manus owns `platform_prod` boundaries |

## What OpenClaw Should Do For ISA
- Read the canonical chain before acting.
- Select the first `READY` work item from `docs/planning/NEXT_ACTIONS.json` unless a narrower task is explicitly given.
- Map work to capability ownership, shared primitives, dependency graph, and relevant runtime contracts.
- Use sub-agents for independent scans, long-running research, or comparison work.
- Use approved skills when they add evidence or delivery value.
- Delegate bounded coding or research to ACP-compatible agents when the task benefits from a specialized coding harness.
- Persist conclusions into repo files, GitHub artifacts, or approved handoff artifacts instead of keeping them only in chat.
- Validate only the surfaces touched by the change.

## What OpenClaw Should Not Do For ISA
- Create parallel architecture, target-state, roadmap, or report documents.
- Invent new platform layers, storage engines, or target-state facts outside the canonical chain.
- Act as the primary fast edit loop for routine host-side coding when Gemini or Codex is a better fit.
- Cross the `platform_prod` boundary.
- Print or request secret values in chat, docs, logs, or commits.

## Current ISA Runtime Configuration
These values are already canonical in repo policy and config templates.

- Repo-tracked OpenClaw config is the SSOT.
- Materialize the tracked ISA dev config onto the VM before runtime checks:
  - `bash scripts/openclaw-config-apply.sh --target vm`

### Runtime mode
- Canonical mode: `vm_only`
- Host edits, VM execution
- Policy source: `docs/governance/OPENCLAW_POLICY_ENVELOPE.md`

### Workspace
- VM workspace: `/root/isa_web_clean`
- Template source: `config/openclaw/openclaw.isa-lab.template.json`

### Tools
- Tools profile: `coding`
- Template source: `config/openclaw/openclaw.isa-lab.template.json`

### Default dev profile
- Primary model: `openrouter/deepseek/deepseek-v3.2`
- Fallback: `openrouter/minimax/minimax-m2.5`
- Heartbeat: `30m`
- Best for: routine ISA engineering and governed tool use

### Research profile
- Profile flag: `--profile isa-research`
- Primary model: `openrouter/x-ai/grok-4.1-fast`
- Fallback: `openrouter/deepseek/deepseek-v3.2`
- Heartbeat: `30m`
- Best for: very large repo/document comparisons and long-context research

### Routing helper
- Model routing helper: `bash scripts/openclaw-model-route.sh --task "your task summary"`
- Skill routing helper: `bash scripts/openclaw-skill-route.sh --task "your task summary"`

## Dependencies And Secret Boundaries

### Required dependencies
- `openclaw` CLI installed where bootstrap and status scripts run
- reachable VM repo clone at `/root/isa_web_clean`
- healthy OpenClaw gateway
- current ISA repo scripts and policy files

### Recommended capabilities
- memory available for decision and open-loop capture
- hooks available for bootstrap and session-memory flows
- approved skill set available through `config/openclaw/skills-allowlist.json`
- ACP-compatible agents available if delegation is desired

### Required variables by name only
Host-side automation:
- `ISA_VM_HOST`
- `VM_REPO_PATH`
- `VM_ENV_PATH`
- `ISA_VM_SSH_KEY`

VM-only runtime secrets:
- `OPENCLAW_GATEWAY_TOKEN`
- provider key required by the configured model provider

Do not ask for, print, or store secret values in prompts or docs.

## Existing ISA Scripts To Use
- Bootstrap and gateway health:
  - `bash scripts/openclaw-bootstrap.sh`
  - `bash scripts/openclaw-bootstrap.sh --check-only`
- Runtime status:
  - `bash scripts/openclaw-status.sh --deep`
- Doctor:
  - `bash scripts/openclaw-doctor.sh`
- Dev start:
  - `bash scripts/openclaw-isa-dev-start.sh`
- Policy and secret-safe validation:
  - `bash scripts/openclaw-validate-no-secrets.sh`

## Skills And Delegation Guidance
OpenClaw should not force skills, but these routed skills are already aligned with ISA operations:
- `github` / `gh-issues` for issue, PR, and CI follow-through
- `healthcheck` for operational health and posture review
- `session-logs` for evidence from prior runs
- `mcporter` for MCP/tooling inspection when the task is explicitly about MCP
- `gemini` only when Gemini CLI is actually authenticated and the task is Gemini-specific

Prefer ACP delegation when:
- the task is a bounded deep refactor or coding loop
- the result should come back as a diff or repo artifact
- OpenClaw remains planner/validator rather than sole editor

## End-To-End Execution Pattern
1. Verify gateway and runtime health.
2. Read the canonical technical chain.
3. Select the first `READY` item or the explicitly assigned task.
4. Map the task to capability ownership and runtime contract surfaces.
5. Choose the smallest reviewable slice.
6. Use sub-agents for broad scans or independent research threads.
7. Delegate bounded coding only when it reduces risk or cycle time.
8. Run relevant validations.
9. Update canonical docs only when evidence or contracts changed.
10. Persist handoff/output into repo files or GitHub artifacts and stop.

## Canonical Reading Order For OpenClaw
1. `AGENTS.md`
2. `docs/agent/AGENT_MAP.md`
3. `docs/governance/TECHNICAL_DOCUMENTATION_CANON.md`
4. `docs/planning/NEXT_ACTIONS.json`
5. `docs/spec/ARCHITECTURE.md`
6. `docs/spec/ADVISORY/ISA_CORE_CONTRACT.md`
7. `docs/spec/ISA_DATA_PLANE_ARCHITECTURE.md`
8. `docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json`
9. `docs/architecture/panel/_generated/PRIMITIVE_DICTIONARY.json`
10. `docs/architecture/panel/_generated/CAPABILITY_GRAPH.json`
11. relevant `docs/spec/*/RUNTIME_CONTRACT.md`
12. `docs/architecture/panel/_generated/MINIMAL_VALIDATION_BUNDLE.json`
13. `docs/governance/OPENCLAW_POLICY_ENVELOPE.md`
14. `docs/governance/ISA_AGENT_PLATFORM_OPERATING_MODEL.md`

## Recommended OpenClaw Operating Pattern For ISA
- Default to the dev profile for normal coding and orchestration sessions.
- Switch to `--profile isa-research` for repo-wide comparison, long-context analysis, or broad document synthesis.
- Keep workspace bootstrap and prompt prefix stable to improve caching and reduce latency.
- Compact before the session becomes sluggish; do not wait for the hard context limit.
- Use multiple sessions or sub-agents instead of overloading one long-running session.
- Treat OpenClaw as the VM-side planner, analyst, and validator first; treat Gemini/Codex as specialized editing executors when helpful.

## Deliverables OpenClaw Should Produce
- reviewable diffs
- concise FACT / INTERPRETATION / RECOMMENDATION reports
- validation summaries
- updated canonical docs when required
- GitHub issue or PR artifacts when the work spans tools or time

## Related ISA Docs
- `docs/governance/OPENCLAW_POLICY_ENVELOPE.md`
- `docs/governance/OPENCLAW_MODEL_ROUTING_POLICY.md`
- `docs/agent/OPENCLAW_UI_MODEL_QUICK_REFERENCE.md`
- `docs/governance/ISA_AGENT_PLATFORM_OPERATING_MODEL.md`
- `docs/governance/ISA_CAPABILITY_DELIVERY_WORKFLOW.md`
- `docs/agent/OPENCLAW_ISA_MOBILIZATION_PROMPT.md`
