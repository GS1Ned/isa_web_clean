# ISA Agent Platform Operating Model

Status: CANONICAL

## Purpose
Define the formal role split between OpenClaw, Manus, VS Code and its AI extensions, GitHub, and the host/VM workspaces used to develop ISA.

## Core Principle
- Repository files and Git history are the only cross-platform source of truth.
- No platform owns critical context unless that context is persisted into the repo, GitHub, or approved runtime memory files.

## Design Defaults
- Gemini target: `Gemini Code Assist Standard`
- Primary VS Code agents: `Gemini Code Assist` and `Codex`
- GitHub Copilot role: inline assistance only, not a primary autonomous ISA agent
- Host mode: primary editing workspace
- VM mode: OpenClaw execution-first workspace
- Secret strategy: hybrid authority with repo-only registries and mappings
- Autonomy strategy: maximum autonomy inside trusted workspaces, bounded by platform permissions and secret lanes

## System Of Record
- Product and engineering truth: repo files
- History and collaboration truth: GitHub `origin`
- Host editing workspace: host repo clone
- OpenClaw runtime workspace: VM repo clone at `/root/isa_web_clean`
- VM runtime config truth: `/root/.openclaw/openclaw.json`

## Canonical Control-Plane Files
- Master operating model: `docs/governance/ISA_AGENT_PLATFORM_OPERATING_MODEL.md`
- Dependency inventory: `config/agent-platform/dependency.inventory.json`
- Task routing matrix: `config/agent-platform/task-routing.matrix.json`
- Permissions matrix: `config/agent-platform/permissions.matrix.json`
- Secret authority map: `config/agent-platform/secret-authority.map.json`
- Handoff contract: `config/agent-platform/handoff.contract.json`
- Capability delivery workflow: `config/agent-platform/capability-delivery.workflow.json`
- GitHub label map: `config/agent-platform/github-label-map.json`
- MCP server catalog: `config/mcp/servers.catalog.json`
- Gemini template: `config/ide/gemini/settings.template.json`
- Codex user-config template: `config/ide/codex/user-config.template.toml`
- MCP usage policy: `docs/agent/MCP_POLICY.md`
- Handoff protocol: `docs/governance/ISA_AGENT_HANDOFF_PROTOCOL.md`
- Capability delivery workflow doc: `docs/governance/ISA_CAPABILITY_DELIVERY_WORKFLOW.md`

## Platform Roles
- OpenClaw
  - VM-resident orchestration agent for ISA repo work
  - Best suited for long-running analysis, multi-step repo tasks, documentation research, issue preparation, and delegated coding via ACP-compatible agents
- Manus
  - Primary owner for Manus-specific hosting, deployment, OAuth, and other Manus platform concerns
  - Should consume and produce repo and GitHub artifacts rather than acting as a hidden source of truth
- VS Code
  - Primary interactive editing surface on the host
  - Best suited for fast local edits, diff review, debugging, and developer-driven iteration
- Codex and other VS Code extensions
  - Editor-adjacent copilots for focused implementation help inside the host workspace
  - Should work against the same repo truth and avoid maintaining separate undocumented plans
- GitHub
  - Shared control plane for issues, pull requests, review comments, branch protection, and team-visible status
  - Cross-platform handoff should prefer issue, branch, and PR artifacts over chat-only instructions
- Host repo
  - Primary editing workspace by policy
  - Safe place for review, local validation, and commit preparation
- VM repo
  - Execution-first workspace for OpenClaw
  - Synced with host via Git only

## Manus Scope Matrix
### Tasks that explicitly go to Manus
- Production deployment changes, release procedures, and runtime rollout coordination
- Manus-hosting configuration and Manus runtime integration
- OAuth and auth-provider changes that affect live platform identity flows
- Production-only secret rotation or platform-side secret management
- CI/CD wiring that directly controls production deployment or platform runtime behavior
- Platform incidents, rollback operations, and post-deploy hotfix execution

### Tasks that explicitly do not go to Manus
- Routine local feature implementation in the host repo
- Multi-file refactors and debug loops inside the development workspace
- OpenClaw model routing, VM runtime tuning, and OpenClaw hooks
- Repo-wide documentation, governance, and planning updates
- Local integration testing that only needs development secrets
- GitHub issue grooming, PR prep, and repo analysis that do not change live platform behavior

### Boundary rule
- If a task requires `platform_prod` secrets, changes deploy behavior, or changes live auth/runtime integration, it goes to Manus.
- If a task can be completed in `none`, `scm_only`, `app_dev`, or `vm_runtime` without changing live Manus platform behavior, it does not go to Manus by default.

## Manus Decision Table
- `Deploy pipeline changed` -> Manus
- `Production environment variable semantics changed` -> Manus
- `OAuth callback, provider, or live auth path changed` -> Manus
- `Hosting, domain, runtime ingress, or platform networking changed` -> Manus
- `Local app bug, feature, or refactor` -> Not Manus
- `Repo analysis, architecture mapping, or planning` -> Not Manus
- `OpenClaw VM/runtime behavior` -> Not Manus
- `Local tests using dev secrets only` -> Not Manus
- `GitHub issue/PR process work` -> Not Manus unless tied directly to deploy execution

## Formal Agent Pairing
- Gemini Code Assist
  - Primary fast local implementation agent in VS Code
  - Best for issue-scoped feature work, focused edits, and trusted-workspace terminal tasks
- Codex
  - Primary deep local implementation agent in VS Code or CLI
  - Best for larger refactors, multi-file edits, failure analysis, and complex repository changes
- GitHub Copilot
  - Not part of the primary autonomous ISA operating model
  - May remain enabled for inline suggestions only

## Communication Paths
- OpenClaw -> repo
  - Reads and writes files
  - Runs repo scripts and checks on the VM
- OpenClaw -> GitHub
  - Reads issues and PRs
  - Prepares or updates collaboration artifacts
- OpenClaw -> Codex or other ACP agents
  - Delegates bounded coding or research tasks through ACP when beneficial
  - Result must come back as files, diffs, or Git artifacts
- Gemini -> host repo
  - Reads and edits local files
  - Uses MCP servers and terminal access inside the trusted ISA workspace
- Codex -> host repo
  - Reads and edits local files
  - Uses MCP servers and terminal access inside the trusted ISA workspace
- Manus -> repo and GitHub
  - Exchanges work through branches, PRs, issues, and explicit docs
- VS Code extensions -> host repo
  - Assist with local edits but do not become an independent system of record

## Operating Rules
- Edit on host by default.
- Use OpenClaw on the VM for agentic execution, repo analysis, and longer background tasks.
- Sync host and VM via Git only.
- Keep bootstrap files and always-loaded agent docs small to control latency.
- Persist important decisions into repo docs or tracked memory files, not only into chat history.
- Use GitHub issues and PRs for cross-platform handoff whenever the work spans tools or time.
- Do not let IDE agents see production-only or VM-runtime-only secrets by default.
- Do not rely on extension-local chats as a durable handoff mechanism.
- Route work by task class, not by personal preference, when automation is involved.

## OpenClaw Profiles
- Default dev profile
  - Workspace: `/root/isa_web_clean`
  - Tools profile: `coding`
  - Primary model: `openrouter/deepseek/deepseek-v3.2`
  - Fallback: `openrouter/minimax/minimax-m2.5`
- Research profile
  - Profile flag: `--profile isa-research`
  - Workspace: `/root/isa_web_clean`
  - Tools profile: `coding`
  - Primary model: `openrouter/x-ai/grok-4.1-fast`
  - Fallback: `openrouter/deepseek/deepseek-v3.2`

## Secret Lanes
- `none`
  - No secret material is required
  - Use for docs, governance, repository analysis, and architectural planning
- `scm_only`
  - Source-control credentials only
  - Intended for GitHub issues, branches, pull requests, and authenticated GitHub MCP access
- `app_dev`
  - Local development application secrets such as database and model provider credentials
  - Intended only for trusted local app runs, integration tests, and debugging flows
- `vm_runtime`
  - VM-local OpenClaw runtime secrets
  - VM-authoritative and never mirrored back to host configs by default
- `platform_prod`
  - Platform and deployment secrets owned by Manus or CI
  - Not exposed to local IDE agents

## Task Routing Rule
The machine-readable task routing matrix is authoritative for who plans, executes, validates, and which secret lane a task may use. If human practice and `config/agent-platform/task-routing.matrix.json` diverge, the matrix must be updated first before automation changes are considered valid.

## Manus Handoff Minimum
- Control-plane pointer present:
  - GitHub issue, PR, or branch
- Task class resolved through `config/agent-platform/task-routing.matrix.json`
- Repo-side handoff artifact created in `docs/planning/agent-handoffs/`
- Summary of requested platform action
- Explicit route snapshot naming:
  - planner
  - executor
  - validator
  - secret lane
  - workspace
- Expected completion signal

## MCP Rule
`docs/agent/MCP_POLICY.md` remains the policy SSOT for when MCP is allowed and what evidence logging is required. `config/mcp/servers.catalog.json` is the implementation inventory for platform-specific MCP rendering and validation.

## Practical Workflow
1. Frame work as a GitHub issue, pull request, or explicit repo task objective.
2. Route the task through `config/agent-platform/task-routing.matrix.json` or `bash scripts/dev/resolve-agent-task-routing.sh --task-class ...`.
3. If the task spans tools or time, create a repo-side handoff artifact in `docs/planning/agent-handoffs/` via `bash scripts/dev/create-agent-handoff.sh ...`.
4. Select the minimum secret lane needed for the task.
5. Execute in the owning environment:
   - host for local editing and IDE agents
   - VM for OpenClaw execution and runtime verification
   - Manus for platform-specific deployment or OAuth concerns
6. Validate in the environment that owns the risk.
7. Persist the result into repo files and GitHub artifacts.
8. Merge truth back through Git and GitHub, not through copied chat transcripts.
