# ISA — Agent Entry Point

**Purpose:** Single canonical orientation for any AI agent or developer working on ISA.
**Last Updated:** 2026-02-14

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
| Docs Index (Canonical) | `docs/INDEX.md` | Canonical documentation index |
| Execution Queue (Canonical) | `docs/planning/NEXT_ACTIONS.json` | Single source of next work |
| Governance Root (Canonical) | `docs/governance/_root/ISA_GOVERNANCE.md` | Governance principles and rules |
| Manual Preflight (Canonical) | `docs/governance/MANUAL_PREFLIGHT.md` | Deterministic preflight checks |
| Repository Map (Support) | `docs/REPO_MAP.md` | Evidence-bound repository structure map |

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

## Rules

1. **Secrets safety:** Never commit `.env`, never print secret values, never hardcode credentials.
2. **Governance:** Follow `docs/governance/_root/ISA_GOVERNANCE.md`. Escalate Lane C triggers.
3. **Conventional commits:** `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
4. **Evidence-first:** Back claims with file paths. Mark unknowns as UNKNOWN.
5. **Minimal changes:** Only change what is needed. Avoid speculative refactoring.
