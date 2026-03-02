# OpenClaw Unused / Conflicting / Shadowed Fields Report

- Generated at: `2026-03-02T08:17:32Z`
- Repo root: `/Users/frisowempehomefolder/Documents/Documents - Friso’s MacBook Air/isa_web_clean`
- Runtime SSOT: `vm:/root/.openclaw/openclaw.json`

## FACT

- Analysed rows: `22`
- Conflicting items: `0`
- Unused items: `0`
- Shadowed items: `4`
- High-risk items: `4`

## Table

| Field | Source | Effective? | Classification | Risk | Recommended Change |
|---|---|---:|---|---|---|
| `host:~/.openclaw/env.sh.OPENROUTER_API_KEY` | `host env` | `false` | `shadowed_duplicate_secret` | `medium` | Remove or minimize host-side duplicate provider secret if host runtime is not authoritative. |
| `repo:.openclaw/control-plane.json.cost_optimization_stack.*` | `repo control-plane` | `true` | `effective` | `low` | Keep synchronized with isa_cost_optimizer middleware tests and runtime expectations. |
| `repo:.openclaw/control-plane.json.model_router.default_model` | `repo control-plane` | `false` | `shadowed_metadata` | `medium` | Do not treat this as the OpenClaw runtime default; VM agents.defaults.model.primary remains authoritative. |
| `repo:.openclaw/control-plane.json.model_router.fallback_models` | `repo control-plane` | `false` | `shadowed_metadata_aligned` | `low` | Keep aligned with VM runtime fallbacks. |
| `repo:config/governance/openclaw_policy_envelope.json.automation.*` | `repo governance policy` | `true` | `effective` | `medium` | Keep aligned with server/security/automation-auth.ts and production env flags. |
| `repo:config/governance/openclaw_policy_envelope.json.runtime.primary_mode` | `repo governance policy` | `true` | `effective` | `low` | Keep VM-only unless host-gateway support is intentionally implemented and validated. |
| `repo:config/openclaw/browser.policy.json.mode` | `repo browser policy` | `true` | `shadowed_by_stronger_runtime_deny` | `low` | Keep as defense-in-depth, but document that VM tools.deny already blocks browser and web at the gateway. |
| `repo:config/openclaw/exec-lane.policy.json.*` | `repo exec policy` | `true` | `effective_script_scope_only` | `medium` | Treat as wrapper-policy only; do not assume native OpenClaw runtime enforcement. |
| `repo:config/openclaw/model-routing.policy.json.defaults.model` | `repo routing policy` | `true` | `effective_launcher_scope_aligned` | `low` | Keep launcher default aligned with VM runtime default. |
| `repo:config/openclaw/model-routing.policy.json.routes[*]` | `repo routing policy` | `true` | `effective_launcher_scope_only` | `medium` | Keep using for launcher-assisted routing, but do not present it as automatic runtime model switching. |
| `repo:config/openclaw/skills-allowlist.json.entries` | `repo skills allowlist` | `true` | `effective` | `low` | Keep entries reviewed and checksum-pinned. |
| `repo:.openclaw/launcher/last_model_route.json.selected_route_id` | `repo launcher state` | `true` | `effective_state` | `low` | Safe to keep; it drives reuse-last-route launcher behavior. |
| `vm:/root/.openclaw/openclaw.json.agents.defaults.model.primary` | `vm runtime` | `true` | `effective` | `medium` | This is the authoritative default model; align UI/router policy with it or change it deliberately here. |
| `vm:/root/.openclaw/openclaw.json.agents.defaults.model.fallbacks` | `vm runtime` | `true` | `effective_empty` | `medium` | Add fallbacks if runtime resilience matters, or keep empty and remove conflicting fallback declarations elsewhere. |
| `vm:/root/.openclaw/openclaw.json.tools.deny` | `vm runtime` | `true` | `effective` | `low` | Retain unless you intentionally reopen browser/web capabilities and revalidate governance. |
| `vm:/root/.openclaw/openclaw.json.gateway.bind` | `vm runtime` | `true` | `effective` | `low` | Keep loopback unless remote exposure is required; if exposed, configure trustedProxies. |
| `vm:/root/.openclaw/openclaw.json.gateway.auth.token` | `vm runtime` | `true` | `effective_sensitive` | `high` | Keep VM-only; never duplicate in repo or host artifacts. |
| `vm:/root/.openclaw/openclaw.json.env.vars.OPENROUTER_API_KEY` | `vm runtime` | `true` | `effective_sensitive` | `high` | Keep in VM runtime only; avoid host duplication unless host-runtime use is required. |
| `vm:/root/.openclaw/openclaw.json.auth.profiles` | `vm runtime` | `true` | `effective_empty` | `low` | Keep empty if env-based auth remains the standard. |
| `vm:/root/.openclaw/exec-approvals.json.socket.token` | `vm exec approvals` | `true` | `effective_sensitive` | `high` | Treat as secret runtime socket credential; do not export or mirror. |
| `vm:/root/.openclaw/devices/paired.json.tokens.*` | `vm device pairing state` | `true` | `effective_sensitive` | `high` | Rotate and prune stale operator device tokens if not actively needed; keep strictly VM-local. |
| `vm:/root/.openclaw/cron/jobs.json.jobs` | `vm cron state` | `true` | `effective_empty` | `low` | No change unless scheduled automation is intended; current state has no jobs configured. |
