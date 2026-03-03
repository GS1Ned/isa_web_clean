# ISA — Agent Entry Point

---

## ⚠️ Important: Development Environment Update ⚠️

**As of 2026-02-25, the development workflow has changed.**

Use one of these canonical entry paths:
1. `bash scripts/openclaw-isa-dev-start.sh`
   - Starts the VM-side OpenClaw path and UI tunnel.
2. `bash scripts/dev/launch-isa-vscode.sh`
   - Prepares the trusted host-side VS Code + Gemini + Codex lane.
   - Default lane is `scm-only`; use `--lane app-dev` only when runtime secrets are needed.

The old `pnpm dev` command is not sufficient on its own for the OpenClaw-integrated VM workflow. It remains part of local app runs after the appropriate host lane is prepared.

For more details, please see the [Host ↔ VM OpenClaw Workflow](#host--vm-openclaw-workflow-canonical) section below.

---

**Purpose:** Single canonical orientation for any AI agent or developer working on ISA.
**Last Updated:** 2026-02-25

---

## What is ISA

ISA (Intelligent Standards Architect) is a sustainability compliance intelligence platform connecting EU ESG regulations to GS1 standards. It is deployed at `gs1isa.com`.

**Stack:** React 19 + Express 4 + tRPC 11 + Drizzle ORM + TiDB + OpenAI

---

## Canonical Navigation Layer

This file is the only top-level entrypoint for agent onboarding.

| Document | Path | Purpose |
| --- | --- | --- |
| Agent Map (Canonical) | `docs/agent/AGENT_MAP.md` | Canonical navigation map for humans and agents |
| MCP Policy (Canonical) | `docs/agent/MCP_POLICY.md` | MCP server usage + evidence logging policy |
| MCP Recipes (Canonical) | `docs/agent/MCP_RECIPES.md` | Step-by-step MCP playbooks for common ISA tasks |
| Docs Index (Canonical) | `docs/INDEX.md` | Canonical documentation index |
| Execution Queue (Canonical) | `docs/planning/NEXT_ACTIONS.json` | Single source of next work |
| Governance Root (Canonical) | `docs/governance/_root/ISA_GOVERNANCE.md` | Governance principles and rules |
| Manual Preflight (Canonical) | `docs/governance/MANUAL_PREFLIGHT.md` | Deterministic preflight checks |
| Document Status Model (Canonical) | `docs/governance/DOCUMENT_STATUS_MODEL.md` | Meaning of canonical/current/target/historical |
| Agent Platform Operating Model (Canonical) | `docs/governance/ISA_AGENT_PLATFORM_OPERATING_MODEL.md` | Role split between OpenClaw, Gemini, Codex, GitHub, Manus, host and VM |
| Capability Delivery Workflow (Canonical) | `docs/governance/ISA_CAPABILITY_DELIVERY_WORKFLOW.md` | Capability build-to-deploy workflow and label mapping |
| Repository Map (Support) | `docs/REPO_MAP.md` | Evidence-bound repository structure map |

## Document Status Rule

- `CANONICAL` means the document is authoritative for its scope.
- It does not automatically mean "target state".
- System-level current and target truth live explicitly in `docs/spec/ARCHITECTURE.md`.
- See `docs/governance/DOCUMENT_STATUS_MODEL.md`.

---

## Code Entry Points

| Component | Path |
| --- | --- |
| Server entry | `server/_core/index.ts` |
| Client entry | `client/src/main.tsx` |
| Master tRPC router | `server/routers.ts` |
| Database schema | `drizzle/schema.ts` |
| Shared types | `shared/types.ts` |

---

## 6 Core Capabilities

| Capability | Spec | Key router |
| --- | --- | --- |
| ASK_ISA | `docs/spec/ASK_ISA/CAPABILITY_SPEC.md` | `server/routers/ask-isa-v2.ts` |
| NEWS_HUB | `docs/spec/NEWS_HUB/CAPABILITY_SPEC.md` | `server/news-pipeline.ts` |
| KNOWLEDGE_BASE | `docs/spec/KNOWLEDGE_BASE/RUNTIME_CONTRACT.md` | `server/knowledge-vector-search.ts` |
| CATALOG | `docs/spec/CATALOG/RUNTIME_CONTRACT.md` | `server/routers/standards-directory.ts` |
| ESRS_MAPPING | `docs/spec/ESRS_MAPPING/RUNTIME_CONTRACT.md` | `server/routers/esrs-gs1-mapping.ts` |
| ADVISORY | `docs/spec/ADVISORY/RUNTIME_CONTRACT.md` | `server/routers/advisory-reports.ts` |

---

## Planning

- **Next actions:** `docs/planning/NEXT_ACTIONS.json`
- **Backlog:** `docs/planning/BACKLOG.csv`
- **Current READY item:** `BENCH-001` — ASK_ISA fixture replay gate and schema-validated evaluation artifact (promoted from `BACKLOG.csv`, source ref `BENCH-001`)

---

## Development Commands

```bash
pnpm dev          # Start dev server (port 3000)
pnpm build        # Production build (Vite + esbuild)
pnpm check        # TypeScript type check
pnpm test         # Run all tests (Vitest)
pnpm test-unit    # Unit tests only
```

---

## Local Setup Quickstart (Verified)

These steps are intended to be deterministic and friendly for first-time agents/developers.

**Tooling (pinned):**
- Node.js: 22.x
- pnpm: 10.4.1 (see `package.json#packageManager`)

**If `pnpm` fails due to Corepack signature/key errors:**
- Safe, no-install fallback: use `npx pnpm@10.4.1 <command>` (slower but deterministic).
- If you want a global `pnpm` binary: `npm i -g pnpm@10.4.1` (may require `--force` if a Corepack shim is present).

```bash
pnpm install --frozen-lockfile
cp .env.example .env
# Fill in `.env` values (never commit `.env`)
pnpm run env:check
node scripts/check-env.js
pnpm exec tsx scripts/check-db-status.ts
pnpm run smoke
pnpm dev
```

**One-command local verification (recommended):**
```bash
bash scripts/dev/local-doctor.sh
```

**Health endpoints (public, no auth):**
- `GET /health` (overall health, includes DB)
- `GET /ready` (readiness: env + DB)

**Database TLS note (TiDB Cloud):**
- TiDB Cloud requires TLS. Set `DATABASE_URL` with an SSL query param (parsed by `server/db-connection.ts`):
  - `?sslmode=require` or `?ssl=true` or `?ssl-mode=required`

**GitHub App private key note:**
- Many GitHub App keys download as PKCS#1 (`BEGIN RSA PRIVATE KEY`), but some tooling expects PKCS#8 (`BEGIN PRIVATE KEY`).
- If needed, convert with:
  - `openssl pkcs8 -topk8 -nocrypt -in key.pem -out key.pkcs8.pem`
- If storing in `.env`, keep it single-line with `\\n` escapes and quote it so `bash` can `source .env` safely.

---

## Host ↔ VM OpenClaw Workflow (Canonical)

**Current SSOT policy (effective 2026-02-25):**
- Host workspace is primary for editing.
- Git remote `origin` remains canonical history SSOT.
- Host push is disabled by default (mirror mode).
- VM is execution/runtime target for OpenClaw and infrastructure checks.
- Runtime mode is explicitly `vm_only` (default via `OPENCLAW_RUNTIME_MODE=vm_only`).

**Responsibilities**
- Host:
  - Edit code/docs, run local checks, and run VM helper scripts from this repo.
  - Keep secrets in local `.env` only; never commit `.env`.
- VM:
  - Run OpenClaw (`status`, `doctor`, `dashboard`) and host-invoked validation probes.
  - Keep OpenClaw runtime state in `/root/.openclaw/*`.

**SSH contract (non-interactive automation-safe)**
- Preferred host alias: `ISA_VM_HOST` (or `VM_SSH_HOST`).
- Required env pointers: `VM_REPO_PATH`, `VM_ENV_PATH`.
- Agent forwarding preferred for VM-side GitHub checks (no private key copy to VM).
- Scripted SSH behavior should include `BatchMode=yes` and `StrictHostKeyChecking=accept-new`.

**OpenClaw UI tunnel workflow**
- Local forward: `127.0.0.1:18789` (host) -> `127.0.0.1:18789` (VM).
- Canonical script: `bash scripts/openclaw-tunnel.sh [up|status|down]`.
- One-command host launcher (tunnel + dashboard URL + browser open): `bash scripts/openclaw-ui.sh` (headless mode: `bash scripts/openclaw-ui.sh --no-open`).
- One-command ISA dev start (validation + UI): `bash scripts/openclaw-isa-dev-start.sh` (optional: `--skip-validate`, `--no-open`).
- VM bootstrap/health gate (gateway install+start+cleanup): `bash scripts/vm-run.sh scripts/openclaw-bootstrap.sh`.
- Status/doctor default to VM runtime in `vm_only` mode:
  - `bash scripts/openclaw-status.sh`
  - `bash scripts/openclaw-doctor.sh`
  - Host-local override: add `--target host` or `--local`.
- Dashboard URL (headless-safe): run on VM via:
  - `bash scripts/vm-run.sh scripts/openclaw-dashboard-url.sh`
  - Under the hood this uses `openclaw dashboard --no-open`.

**OpenClaw governance controls (canonical)**
- Policy envelope: `config/governance/openclaw_policy_envelope.json`
- Exec lane policy: `config/openclaw/exec-lane.policy.json` (enforced by `bash scripts/openclaw-safe-exec.sh ...`)
- Skills quarantine allowlist: `config/openclaw/skills-allowlist.json` (`openclaw-skill-admit.sh` / `openclaw-skill-install.sh`)
- Browser fallback policy: `config/openclaw/browser.policy.json` (enforced via `server/security/browser-automation-policy.ts` across browser-based scrapers)
- No-secrets validation path: `bash scripts/openclaw-validate-no-secrets.sh`
- Runbook: `docs/governance/OPENCLAW_POLICY_ENVELOPE.md`
- Reverse-proxy trusted proxies helper: `bash scripts/openclaw-trusted-proxies.sh [status|apply|clear]`

**Secrets and env placement**
- `.env` is local-only and must never be committed.
- `.env.example` contains variable names/placeholders only.
- `OPENCLAW_GATEWAY_TOKEN` policy: VM-only secret, authoritative in VM OpenClaw config/env (not in repo markdown, not printed in logs).

**OpenClaw env precedence (highest -> lowest)**
1. Process environment.
2. `.env` in current working directory (does not override existing env vars).
3. Global `~/.openclaw/.env` / `$OPENCLAW_STATE_DIR/.env` (does not override existing env vars).
4. `env` block in `~/.openclaw/openclaw.json` (applies only when missing).

**Future VM-primary cutover (not active yet)**
- Prerequisites:
  - Branch protection on `main` verified and documented.
  - Host mirror guardrails automated.
  - VM bootstrap/status/doctor/dashboard scripts fully green end-to-end.
  - SSH known-host + agent forwarding checks proven non-interactive.
  - Canonical docs/tasks updated with cutover date + rollback plan.

---

## Rules

1. **Secrets safety:** Never commit `.env`, never print secret values, never hardcode credentials.
2. **Governance:** Follow `docs/governance/_root/ISA_GOVERNANCE.md`. Escalate Lane C triggers.
3. **Conventional commits:** `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
4. **Evidence-first:** Back claims with file paths. Mark unknowns as UNKNOWN.
5. **Minimal changes:** Only change what is needed. Avoid speculative refactoring.
6. **MCP usage:** Follow `docs/agent/MCP_POLICY.md` and `docs/agent/MCP_RECIPES.md`.
