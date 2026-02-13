# ISA Map — Current State Report

**Generated:** 2026-02-13
**Source:** Repository forensics via Claude Code
**Machine-readable:** See `isa_map.json`

---

## A. Architecture

| Aspect | Value | Evidence |
| --- | --- | --- |
| Frontend | React 19.1.1 + Vite 7.1.7 (SPA) | `package.json` |
| Backend | Express 4.21.2 + tRPC 11.6.0 | `package.json` |
| Runtime | Node.js (ESM) | `package.json` `"type": "module"` |
| Dev runner | tsx 4.19.1 | `package.json` scripts.dev |
| Package manager | pnpm 10.4.1 | `pnpm-lock.yaml` |
| Database | MySQL/TiDB via Drizzle ORM 0.44.5 | `drizzle.config.ts` |
| Vector search | TiDB native `VEC_COSINE_DISTANCE` | `server/knowledge-vector-search.ts` |
| LLM | OpenAI GPT-4o-mini (or Manus Forge) | `server/_core/llm.ts` |
| Embeddings | OpenAI text-embedding-3-small | `server/_core/embedding.ts` |
| Auth | Manus OAuth + JWT cookies | `server/_core/oauth.ts` |
| Styling | Tailwind CSS 4.1.14 + shadcn/ui (Radix) | `package.json` |
| Testing | Vitest 2.1.4 | `vitest.config.ts` |
| TypeScript | 5.9.3, strict mode | `tsconfig.json` |
| Frontend routing | Wouter 3.3.5 | `client/src/pages/` (102 pages) |
| Backend routing | tRPC master router | `server/routers.ts` (1310 lines, 45+ routers) |
| Build output | Vite (client → `dist/public/`) + esbuild (server → `dist/index.js`) | `package.json` scripts.build |
| Deploy | Manual, single environment | Both `gs1isa.com` and `manus.space` = same build |

### Key entrypoints

- Server: `server/_core/index.ts`
- Client: `client/src/main.tsx`
- Master router: `server/routers.ts`
- DB schema: `drizzle/schema.ts` + 16 schema modules in `drizzle/`
- Shared types: `shared/types.ts`

---

## B. Feature Inventory

| Feature | Status | Key files |
| --- | --- | --- |
| Ask ISA (RAG Q&A) | Implemented (v1+v2) | `server/routers/ask-isa.ts`, `ask-isa-v2.ts`, `knowledge-vector-search.ts`, `ask-isa-cache.ts`, `ask-isa-guardrails.ts` |
| News Hub | Implemented | `server/news-pipeline.ts`, `news-cron-scheduler.ts`, 4 scrapers in `server/news/` |
| Hybrid Search | Implemented | `server/hybrid-search.ts`, `server/bm25-search.ts` |
| Ingestion Pipelines | Implemented | `server/ingest/INGEST-03..06`, `ingest-gs1-*.ts`, `scripts/run-all-ingestion.ts` |
| Admin/Monitoring | Implemented | `server/routers/monitoring.ts`, `production-monitoring.ts`, `executive-analytics.ts` |
| User Management | Implemented | `server/_core/oauth.ts`, `server/db.ts` |
| Email/Notifications | Implemented | `server/email-service.ts` (SendGrid/SMTP/built-in) |
| ESRS Mapping | Implemented | `server/routers/esrs-gs1-mapping.ts` |
| Advisory Reports | Implemented | `server/routers/advisory-reports.ts` |
| Standards Directory | Implemented | `server/routers/standards-directory.ts` |
| Pipeline Observability | Implemented | `server/routers/pipeline-observability.ts` |

---

## C. Knowledge + Governance Inventory

**Active governance docs:** 30 files in `docs/governance/` (after archiving 37 stale docs)

| Category | Status |
| --- | --- |
| Architecture SSOT | `docs/spec/ARCHITECTURE.md` (v2.0.0, 2026-02-12) |
| Governance root | `docs/governance/_root/ISA_GOVERNANCE.md` (v2.0, 2026-02-10) |
| 6 capability specs | `docs/spec/{ASK_ISA,NEWS_HUB,KNOWLEDGE_BASE,CATALOG,ESRS_MAPPING,ADVISORY}/` |
| Docs index | `docs/INDEX.md` (canonical) |
| Planning | `docs/planning/NEXT_ACTIONS.json`, `BACKLOG.csv` |
| Known failure modes | `docs/governance/KNOWN_FAILURE_MODES.md` (4 modes, all fixed) |
| Archived (historical) | 37 docs in `isa-archive/governance/` |

---

## D. Configuration + Secrets Inventory

### Environment variables (names only)

**Required:**

- `VITE_APP_ID` — Manus application ID
- `JWT_SECRET` — Session cookie secret (>=32 chars)
- `DATABASE_URL` — MySQL/TiDB connection string

**Auth:**

- `OAUTH_SERVER_URL` — OAuth provider (default: `https://manus.im`)
- `OWNER_OPEN_ID` — Admin user OpenID

**LLM:**

- `OPENAI_API_KEY` — OpenAI API key
- `BUILT_IN_FORGE_API_URL` — Alternative LLM (Manus Forge)
- `BUILT_IN_FORGE_API_KEY` — Forge API key

**Cron:**

- `CRON_SECRET` — Cron endpoint auth (>32 chars in prod)

**Email:**

- `SENDGRID_API_KEY`, `SENDER_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE`

**GitHub:**

- `GITHUB_PAT`, `GH_TOKEN`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_APP_ID`, `INSTALLATION_ID`

**TiDB Cloud:**

- `TIDB_PRIVATE_KEY`, `TIDB_PUBLIC_KEY`

**Manus:**

- `MANUS_API_KEY`, `VITE_FRONTEND_FORGE_API_URL`

**Test/Dev:**

- `RUN_DB_TESTS`, `RUN_CELLAR_TESTS`, `BATCH_SIZE`, `CONCURRENCY`, `DRY_RUN`, `FORCE_REGENERATE`

### Secret safety

| Check | Status |
| --- | --- |
| `.env` in `.gitignore` | PASS |
| `.mcp/` in `.gitignore` | PASS |
| `.env.example` exists (no real secrets) | PASS |
| No secrets in committed files | PASS |
| Dedicated secrets manager | N/A (env-var based, acceptable for current scale) |

---

## E. Dependency + Integration Inventory

| Service | Provider | Config |
| --- | --- | --- |
| Database | TiDB Cloud (MySQL) | `DATABASE_URL` env, `drizzle.config.ts` |
| Vector search | TiDB native | `server/knowledge-vector-search.ts` |
| LLM | OpenAI GPT-4o-mini | `server/_core/llm.ts` |
| Embeddings | OpenAI text-embedding-3-small | `server/_core/embedding.ts` |
| Auth | Manus OAuth | `server/_core/oauth.ts` |
| Email | SendGrid / SMTP | `server/email-service.ts` |
| Object storage | AWS S3 (optional) | `@aws-sdk/client-s3` in `package.json` |
| GitHub | REST API via PAT | `server/_core/env.ts` |

---

## F. Quality + Risk

| Area | Status | Detail |
| --- | --- | --- |
| Tests | 517/574 passing (90.1%) | Vitest; 57 failures mostly DB-dependent |
| CI | 7 active workflows | `.github/workflows/` |
| TypeScript | Strict, compiles | `pnpm check` |
| Lint | Minimal ESLint (server) | `.eslintrc.server.json` |
| Prettier | Configured | `.prettierrc` |
| Markdown lint | Configured | `.markdownlint.json` |
| Security | No leaks; OAuth + JWT | OWASP basics covered |
| Build | Functional | `pnpm build` |

### Risks

1. 57 failing tests — potential regressions unnoticed
2. ESLint minimal — no React hooks rules, no import ordering
3. `noUnusedLocals`/`noUnusedParameters` disabled — dead code accumulates
4. No staging environment — production-only
5. Manual deployment — no CI/CD to production

---

## Top 10 Bottlenecks

| # | Bottleneck | Type | Impact | Size |
| --- | --- | --- | --- | --- |
| 1 | Doc sprawl (68→30 after archive) | Governance | HIGH | DONE |
| 2 | No single SSOT index | Governance | HIGH | DONE |
| 3 | 57 failing tests | Quality | HIGH | M |
| 4 | Duplicate tool configs (AmazonQ + Claude Code) | Process | MEDIUM | S |
| 5 | No staging environment | Process | MEDIUM | L |
| 6 | Master router 1310 lines | Technical | MEDIUM | M |
| 7 | ESLint gaps | Quality | LOW-MEDIUM | S |
| 8 | Manual deployment | Process | MEDIUM | M |
| 9 | No durable agent memory | Process | MEDIUM | DONE |
| 10 | Missing automation scripts | Process | MEDIUM | S |
