# ISA - Intelligent Standards Architect

ISA is a sustainability compliance intelligence web app that helps map EU sustainability/ESG regulations to GS1 standards. It combines governed datasets, a relational knowledge model, and AI-assisted search/Q&A.

This project is not legal advice. Outputs are informational and should be validated against authoritative sources.

## Problem Statement

EU sustainability requirements are broad, fast-evolving, and hard to translate into implementable data and process changes. GS1 standards provide interoperable identifiers, vocabularies, and event/data models, but teams still need help linking regulatory requirements to concrete standards and implementation artifacts.

ISA addresses this by:
- Maintaining a governed dataset registry and ingested tables for regulations, standards, and related artifacts. (`data/metadata/dataset_registry.json`, `drizzle/schema.ts`, `server/ingest/`)
- Exposing a UI + API for exploring regulations/standards and the mappings between them. (`client/src/App.tsx`, `server/routers.ts`)
- Providing AI-assisted retrieval and answer generation with traceability mechanisms. (`server/routers/ask-isa.ts`, `server/_core/embedding.ts`, `server/_core/llm.ts`)

## Key Features

The following are evidenced by concrete routers, tables, and entry points in this repository:
- Regulation and GS1 standards hub and mapping APIs. (`server/routers.ts`, `server/db.ts`, `drizzle/schema.ts`)
- Ask ISA (RAG-style Q&A) with guardrails, citation validation, caching, and tracing/metrics. (`server/routers/ask-isa.ts`, `server/services/rag-tracing/`, `server/services/rag-metrics/`)
- Knowledge embeddings and search utilities (embeddings table + semantic search helpers). (`drizzle/schema.ts`, `server/knowledge-vector-search.ts`, `server/_core/embedding.ts`)
- News ingestion pipeline (RSS + Playwright scrapers) with AI processing, deduplication, and DB storage. (`server/news-sources.ts`, `server/news-fetcher.ts`, `server/news-pipeline.ts`)
- Advisory reports with versioning. (`drizzle/schema.ts`, `server/routers/advisory-reports.ts`)
- Dataset registry and governance documents endpoints/pages. (`server/routers/dataset-registry.ts`, `server/routers/governance-documents.ts`, `data/metadata/dataset_registry.json`)

## Architecture Overview

High-level request flow:
- React SPA calls tRPC over HTTP at `/api/trpc` (cookies included). (`client/src/main.tsx`)
- Express server mounts OAuth callback, health/readiness endpoints, cron endpoints, then the tRPC router. (`server/_core/index.ts`, `server/_core/oauth.ts`, `server/cron-endpoint.ts`, `server/routers.ts`)
- Drizzle ORM reads/writes to a MySQL-compatible database (TiDB is supported by URL+SSL conventions). (`server/db.ts`, `server/db-connection.ts`, `drizzle.config.ts`)
- LLM and embeddings calls go to OpenAI directly or via a Forge proxy, depending on env. (`server/_core/llm.ts`, `server/_core/embedding.ts`, `.env.example`)

```text
Browser (React) --> /api/trpc (tRPC) --> Express --> Drizzle --> MySQL/TiDB
                     |                  |
                     |                  +--> OAuth callback (/api/oauth/callback)
                     |
                     +--> LLM + embeddings (OpenAI or Forge proxy)
                     +--> Cron endpoints (/cron/*) for news ingestion/archival
```

Core entry points:
- Server: `server/_core/index.ts`
- Client: `client/src/main.tsx`
- Master API router: `server/routers.ts`
- DB schema: `drizzle/schema.ts`

## Tech Stack

- Language/runtime: TypeScript, Node.js (ESM). (`package.json`, `tsconfig.json`)
- Frontend: React, Vite, Tailwind CSS, Wouter, TanStack Query, tRPC client. (`package.json`, `vite.config.ts`, `client/src/App.tsx`)
- Backend: Express, tRPC, Drizzle ORM, mysql2, Helmet, express-rate-limit. (`package.json`, `server/_core/index.ts`, `server/db.ts`)
- AI: OpenAI chat completions (default model set in code) and `text-embedding-3-small` embeddings. (`server/_core/llm.ts`, `server/_core/embedding.ts`)
- Scraping/news: rss-parser, Playwright, Cheerio, Axios. (`package.json`, `server/news-fetcher.ts`)
- Testing: Vitest (+ Testing Library). (`vitest.config.ts`, `vitest.setup.ts`)

## Installation

Prerequisites (pinned in repo configuration):
- Node.js 22.x (CI uses 22.13.0). (`.github/workflows/q-branch-ci.yml`)
- pnpm (repo pins a version in `package.json`). (`package.json`)
- A MySQL-compatible database (required for most server features). (`server/_core/env.ts`, `server/db.ts`)

Install dependencies:
```bash
pnpm install --frozen-lockfile
```

If you hit Corepack/pnpm signature issues, the repo provides a deterministic fallback:
```bash
npx pnpm@10.4.1 install --frozen-lockfile
```
(`AGENT_START_HERE.md`, `package.json`)

## Configuration (.env)

Copy and fill the template:
```bash
cp .env.example .env
```
(`.env.example`)

Minimum required for server start:
- `VITE_APP_ID`
- `JWT_SECRET` (>= 32 chars)
- `DATABASE_URL` (must start with `mysql://` and include a database name)
(`server/_core/env.ts`, `.env.example`)

Example (do not paste real secrets):
```bash
# Core (required)
VITE_APP_ID="..."
JWT_SECRET="replace-with-32+chars"
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DBNAME?sslmode=require"

# Auth / Manus
OAUTH_SERVER_URL="..."
OWNER_OPEN_ID="..."
VITE_OAUTH_PORTAL_URL="..."

# LLM (optional if you use Ask ISA / embeddings)
OPENAI_API_KEY="..."
OPENAI_API_BASE=""
BUILT_IN_FORGE_API_URL=""
BUILT_IN_FORGE_API_KEY=""

# Cron (required if exposing /cron/* endpoints)
CRON_SECRET="..."
```
(`.env.example`)

Notes:
- The DB URL SSL mode is parsed from query params like `sslmode=require`. (`server/db-connection.ts`, `.env.example`)
- The project intentionally avoids printing env values in checks/scripts. (`scripts/env-check.ts`, `scripts/dev/local-doctor.sh`)

## Running Locally

Development mode (Vite middleware + server auto port selection):
```bash
pnpm dev
```
(`package.json`, `server/_core/index.ts`, `server/_core/vite.ts`)

Health/readiness endpoints (public, no auth):
- `GET /health`
- `GET /ready`
(`server/_core/index.ts`, `server/health.ts`)

One-command preflight (installs deps, runs checks/tests/build, then verifies `/health` and `/ready`):
```bash
bash scripts/dev/local-doctor.sh
```
(`scripts/dev/local-doctor.sh`)

## Testing

Unit tests (default):
```bash
pnpm test
pnpm test-unit
```
(`package.json`, `vitest.config.ts`)

DB-dependent integration tests (opt-in):
```bash
RUN_DB_TESTS=true pnpm test
pnpm test-integration
```
(`vitest.config.ts`, `scripts/run-integration-tests.sh`)

CI-style smoke run (typecheck + unit tests + build):
```bash
pnpm smoke
```
(`scripts/smoke.sh`, `package.json`)

## Deployment

Build artifacts:
- Client: `dist/public/` (Vite output). (`vite.config.ts`)
- Server bundle: `dist/index.js` (esbuild output). (`package.json`)

Build and start:
```bash
pnpm build
NODE_ENV=production pnpm start
```
(`package.json`, `server/_core/index.ts`, `server/_core/security-headers.ts`)

Operational notes:
- Production enables Helmet-based security headers. (`server/_core/security-headers.ts`)
- `app.set("trust proxy", 1)` is enabled; set `x-forwarded-proto` correctly so secure cookies are used behind TLS-terminating proxies. (`server/_core/index.ts`, `server/_core/cookies.ts`)

## Cron / Background Jobs

HTTP cron endpoints (bearer-token protected):
- `GET /cron/daily-news-ingestion`
- `GET /cron/weekly-news-archival`
- `GET /cron/health`
(`server/_core/index.ts`, `server/cron-endpoint.ts`)

Requests to `/cron/daily-news-ingestion` and `/cron/weekly-news-archival` must include `Authorization: Bearer <CRON_SECRET>`. (`server/cron-endpoint.ts`)

Configure an external cron service to call these endpoints and set `CRON_SECRET` to a high-entropy value in production (do not reuse example tokens). Setup docs live under:
- `ops/cron/00-START-HERE.md`
(`ops/cron/00-START-HERE.md`, `.env.example`)

The server also starts an in-process alert monitoring interval (every 5 minutes) on startup:
- `scheduleAlertMonitoring()` (`server/_core/index.ts`, `server/alert-monitoring-cron.ts`)

## Documentation and Roadmap

Canonical navigation and governance:
- Agent entry point: `AGENT_START_HERE.md`
- Governance root: `docs/governance/_root/ISA_GOVERNANCE.md`
- Planning index: `docs/planning/INDEX.md`

Roadmap sources (canonical):
- Execution queue: `docs/planning/NEXT_ACTIONS.json`
- Backlog: `docs/planning/BACKLOG.csv`
(`docs/planning/INDEX.md`)

## Contributing

This repo is governance-driven. Before making changes:
- Read `docs/governance/_root/ISA_GOVERNANCE.md`
- Follow the PR checklist in `.github/PULL_REQUEST_TEMPLATE.md`
- Do not commit secrets (never commit `.env`; avoid hardcoding tokens/keys)
(`docs/governance/_root/ISA_GOVERNANCE.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `.env.example`)

Conventions:
- Conventional commit prefixes are used (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `data:`). (`AGENT_START_HERE.md`)

## License

- `package.json` declares `MIT`. (`package.json`)
- No `LICENSE` file is present at repo root (confirm before distributing). (repo root listing)
