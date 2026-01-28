# ISA_CURRENT_ARCHITECTURE_BRIEF_v0
Last verified: 2026-01-28

This brief captures the **current ISA runtime architecture** as evidenced by the uploaded repository snapshot.
Evidence format: `[path:Lx-Ly]`.

## Runtime overview
- ISA runs as a single Node/Express HTTP server that hosts:
  - OAuth callback endpoints under `/api/oauth`
  - Health/readiness endpoints (`/health`, `/ready`)
  - Cron-triggerable REST endpoints under `/cron/*`
  - tRPC API at `/api/trpc`
  - Vite dev server in development, static serving in production

Evidence: server bootstrap + middleware + route registration. [server/_core/index.ts:L1-L132]

## Server bootstrap and HTTP surface
- Express app + HTTP server creation and proxy trust. [server/_core/index.ts:L42-L48]
- Security headers choose prod vs dev. [server/_core/index.ts:L49-L55]
- Body parser limits set to 50mb. [server/_core/index.ts:L56-L58]
- OAuth routes registered under `/api/oauth` with strict rate limiting. [server/_core/index.ts:L59-L62]
- Health endpoint returns 200/503 based on `performHealthCheck()`. [server/_core/index.ts:L63-L75]
- Readiness endpoint returns 200/503 based on `performReadinessCheck()`. [server/_core/index.ts:L77-L89]
- Cron endpoints exposed as REST GET endpoints. [server/_core/index.ts:L91-L95]
- tRPC mounted at `/api/trpc` with API rate limiting and `createContext`. [server/_core/index.ts:L96-L104]

## Frontend runtime and API binding
- React app entrypoint creates QueryClient and tRPC client using `httpBatchLink` targeting `/api/trpc` and sending cookies (`credentials: include`). [client/src/main.tsx:L1-L62]
- Unauthorized errors trigger redirect to login URL. [client/src/main.tsx:L14-L23]

## Auth boundary (high-level)
- OAuth routes are registered via `registerOAuthRoutes(app)`. [server/_core/index.ts:L59-L62]
- Client-side auth handling is driven by `UNAUTHED_ERR_MSG` and redirect-to-login. [client/src/main.tsx:L14-L23]

## Background/periodic work
- Alert monitoring scheduler starts at server listen. [server/_core/index.ts:L119-L124]
- BM25 index initialization is kicked off non-blocking after server start. [server/_core/index.ts:L125-L129]

## tRPC router composition (high-level)
- `appRouter` is imported from `../routers` and mounted into Express middleware. [server/_core/index.ts:L8-L9][server/_core/index.ts:L96-L104]
- News Hub endpoints are part of an inline `hubRouter` merged into `appRouter`. [server/routers.ts:L335-L349][server/routers.ts:L470-L507]
- Ask ISA endpoints are provided by `askISARouter`. [server/routers/ask-isa.ts:L45-L68]
- ESG artefacts endpoints are provided by `esgArtefactsRouter`. [server/routers/esg-artefacts.ts:L53-L74]
- Dataset Registry endpoints are provided by `datasetRegistryRouter`. [server/routers/dataset-registry.ts:L12-L21]
- Compliance scoring endpoints are provided by `scoringRouter`. [server/routers/scoring.ts:L10-L19]

## Data layer primitives
- Drizzle schema is defined under `drizzle/schema.ts` and referenced by server DB modules.
  - Dataset Registry table: `datasetRegistry`. [drizzle/schema.ts:L286-L330]
  - News Hub table: `hubNews`. [drizzle/schema.ts:L873-L904]

## Observed invariants
- The frontend expects cookie-based auth with same-origin calls to `/api/trpc`. [client/src/main.tsx:L41-L52]
- Cron jobs are exposed as HTTP endpoints (no evidence of an internal cron scheduler beyond `scheduleAlertMonitoring`). [server/_core/index.ts:L91-L95][server/_core/index.ts:L122-L124]

## Open items (explicitly not asserted)
- Deployment topology (Cloudflare/Node hosting, containerization) is not asserted here (no evidence in the cited files).
- Exact OAuth provider configuration is not asserted here (not inspected in this brief).
