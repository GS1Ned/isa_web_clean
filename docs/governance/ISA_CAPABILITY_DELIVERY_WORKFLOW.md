# ISA Capability Delivery Workflow

Status: CANONICAL

## Purpose
Define the exact workflow for developing an ISA capability from issue framing through implementation, validation, and deployment handoff.

## Canonical Inputs
- Capability ownership: `docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json`
- Capability thresholds: `docs/quality/thresholds/isa-capability-thresholds.json`
- Task routing: `config/agent-platform/task-routing.matrix.json`
- Capability delivery workflow: `config/agent-platform/capability-delivery.workflow.json`
- GitHub label map: `config/agent-platform/github-label-map.json`
- Handoff protocol: `docs/governance/ISA_AGENT_HANDOFF_PROTOCOL.md`

## Capability Workflow
1. Pick the capability from `CAPABILITY_MANIFEST.json`.
2. Open or update a GitHub issue for one capability-scoped unit of work.
3. Apply labels from `github-label-map.json`:
   - exactly one `capability:*`
   - exactly one `type:*`
   - exactly one `phase:*`
   - exactly one `lane:*`
   - exactly one `executor:*`
   - exactly one `validator:*`
4. Resolve the implementation path:
   - planning or analysis -> OpenClaw
   - routine host implementation -> Gemini
   - deep refactor or debug loop -> Codex
   - deploy handoff -> Manus
5. If the capability needs local runtime secrets, promote validation to `lane:app-dev`.
6. Once code is reviewable, move to PR and apply `validation:ci`.
7. When the capability is ready to cross the production boundary, create a Manus handoff and apply deploy labels.
8. Only Manus performs `platform_prod` deploy work.

## Label Families
- Capability:
  - `capability:ask-isa`
  - `capability:news-hub`
  - `capability:knowledge-base`
  - `capability:catalog`
  - `capability:esrs-mapping`
  - `capability:advisory`
- Type:
  - `type:feature`
  - `type:bugfix`
  - `type:refactor`
  - `type:docs`
  - `type:deploy`
- Phase:
  - `phase:plan`
  - `phase:implement`
  - `phase:validate`
  - `phase:deploy-ready`
  - `phase:deployed`
- Lane:
  - `lane:none`
  - `lane:scm-only`
  - `lane:app-dev`
  - `lane:platform-prod`
- Executor:
  - `executor:openclaw`
  - `executor:gemini`
  - `executor:codex`
  - `executor:manus`
- Validator:
  - `validator:openclaw`
  - `validator:codex`
  - `validator:github-ci`
  - `validator:manus-github-ci`
- Validation:
  - `validation:local-preflight`
  - `validation:ci`
  - `validation:capability-eval`
  - `validation:manus`
- Baseline stage:
  - `baseline:stage-a`
  - `baseline:stage-b`
  - `baseline:stage-c`
- Deploy:
  - `deploy:required`
  - `deploy:manus`
  - `deploy:complete`

## Practical Routing In Practice
- New ASK_ISA feature with normal host implementation
  - labels:
    - `capability:ask-isa`
    - `type:feature`
    - `phase:implement`
    - `lane:scm-only`
    - `executor:gemini`
    - `validator:codex`
    - `baseline:stage-a`
- Deep ESRS_MAPPING refactor
  - labels:
    - `capability:esrs-mapping`
    - `type:refactor`
    - `phase:implement`
    - `lane:scm-only`
    - `executor:codex`
    - `validator:openclaw`
    - `baseline:stage-b`
- KNOWLEDGE_BASE bugfix that needs DB/runtime validation
  - labels:
    - `capability:knowledge-base`
    - `type:bugfix`
    - `phase:validate`
    - `lane:app-dev`
    - `executor:codex`
    - `validator:openclaw`
    - `validation:local-preflight`
    - `baseline:stage-a`
- Capability ready for production deploy
  - labels:
    - `capability:ask-isa`
    - `type:deploy`
    - `phase:deploy-ready`
    - `lane:platform-prod`
    - `executor:manus`
    - `validator:manus-github-ci`
    - `validation:manus`
    - `deploy:required`
    - `deploy:manus`

## Deployment Boundary
- A capability is `deploy-ready` only when:
  - host implementation is complete
  - PR validation is green
  - required local runtime validation is complete
  - a Manus handoff exists if live platform change is required
- A capability becomes `deployed` only after:
  - Manus completes the platform step
  - GitHub CI and/or platform validation pass
  - `deploy:complete` replaces `deploy:required`

## Exact Daily Flow
1. OpenClaw frames or refines the issue and labels the task family.
2. Gemini or Codex implements on a feature branch.
3. If secrets are needed, use the `app_dev` lane and validate locally.
4. OpenClaw or GitHub CI validates the branch and PR state.
5. If a live platform step is needed, create a Manus handoff.
6. Manus executes deploy/runtime boundary work.
7. Update labels from `phase:deploy-ready` to `phase:deployed` only after platform validation.
