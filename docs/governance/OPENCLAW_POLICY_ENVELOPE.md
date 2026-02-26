# OpenClaw Policy Envelope Runbook

Status: CANONICAL

## Purpose
This runbook defines the enforced controls for ISA OpenClaw usage in regulated environments.

## Canonical Policy Files
- Envelope: `config/governance/openclaw_policy_envelope.json`
- Exec lane: `config/openclaw/exec-lane.policy.json`
- Skills allowlist: `config/openclaw/skills-allowlist.json`
- Browser policy: `config/openclaw/browser.policy.json`

## Enforcement Model
- Fail-closed by default.
- Strict automation auth in production.
- Replay protection via DB ledger.
- Policy decision audit logging for allow/deny outcomes.

## Automation Auth Contract
For cron/webhook-style calls:
- Keep `secret` auth token.
- In strict mode also require:
  - `idempotencyKey`
  - `requestTimestamp`
  - `signature` (`sha256=<hex>` accepted)
- Sign canonical payload: `source|idempotencyKey|requestTimestampISO`

## Kill Switch
- Env key: `OPENCLAW_AUTOMATION_KILL_SWITCH`
- `1/true/yes/on` blocks automation execution.

## Browser Automation Policy
- Mode is `fallback_only`.
- Explicit opt-in required via `OPENCLAW_BROWSER_FALLBACK_ALLOWED=1`.
- Unsafe launch flags remain blocked by default.
- Runtime enforcement entrypoint: `server/security/browser-automation-policy.ts`.

## Runtime Mode Decision
- Canonical mode: `vm_only`.
- Host scripts delegate runtime operations to VM by default.
- Host-local runtime is optional and must be explicit (`--target host` or `--local`).

## Reverse Proxy Decision
- Default: no reverse proxy exposure (`OPENCLAW_REVERSE_PROXY_EXPOSURE=0`).
- If exposure is planned, set explicit trusted proxies before use:
  - `OPENCLAW_REVERSE_PROXY_EXPOSURE=1`
  - `bash scripts/openclaw-trusted-proxies.sh apply --proxies \"<CIDR1>,<CIDR2>\"`
  - Re-validate with `bash scripts/openclaw-trusted-proxies.sh status` and `openclaw status --deep`.

## Skills Governance
- New skills must pass static admission (`openclaw-skill-admit.sh`).
- Installation is restricted to approved allowlist entries.
- Install target is quarantine profile (`~/.openclaw/skills-quarantine`).

## Validation (No Secrets)
Run:

```bash
bash scripts/openclaw-validate-no-secrets.sh
```

This validates policy files/gates and checks command outputs for secret leakage patterns.
When `OPENCLAW_REVERSE_PROXY_EXPOSURE=1`, validation also checks trusted proxies state.

## CI Integration
Tier 0 enforces:
- `scripts/gates/openclaw-policy-envelope.sh`
- `scripts/gates/openclaw-exec-policy.sh`
- `scripts/gates/openclaw-skills-allowlist.sh`
- `scripts/gates/openclaw-browser-policy.sh`

## Operational Notes
- Do not store token values in repo docs.
- Keep VM-only OpenClaw secrets in VM runtime state (`/root/.openclaw/*`) or VM env.
- Use host scripts to run deterministic checks and keep host↔VM sync Git-only.
- ISA UI development bootstrap:
  - `bash scripts/openclaw-isa-dev-start.sh`
  - Initial prompt file: `docs/agent/OPENCLAW_UI_DEV_PROMPT_STARTER.md`
