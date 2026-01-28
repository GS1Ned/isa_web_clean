# ISA_EXECUTION_MAP (3 primary journeys)

Generated: 2026-01-28

## Shared runtime boundaries

- tRPC is mounted at **`/api/trpc`**. [server/_core/index.ts:L98-L117]
- OAuth routes are registered before tRPC. [server/_core/index.ts:L7-L26]
- Cron triggers are exposed as REST endpoints: `/cron/health`, `/cron/daily-news-ingestion`, `/cron/weekly-news-archival`. [server/_core/index.ts:L91-L104]

---

## Journey 1 — Ask ISA (Q&A with sources)

### UI → API

1. User submits a query in **Ask ISA** UI.
   - UI calls `trpc.askISA.ask.useMutation(...)`. [client/src/pages/AskISA.tsx:L201-L215]

2. tRPC request is served under `/api/trpc` by `appRouter`. [server/_core/index.ts:L98-L117]

3. `askISA` router is mounted on `appRouter` as `askISA: askISARouter`. [server/routers.ts:L1130-L1135]

### Core server responsibilities

- Router procedures include:
  - `ask` (public), `getConversation` (public),
  - `getMyConversations`/`deleteConversation` (protected),
  - embeddings/stats/search utilities, and feedback submission. [server/routers/ask-isa.ts:L73-L112]
- Guardrails enforce query-type validation and refusal patterns. [server/ask-isa-guardrails.ts:L4-L23]

### Data persistence

- Knowledge chunk search and QA conversation storage lives in `server/db-knowledge.ts`.
  - `searchKnowledgeChunks(...)` [server/db-knowledge.ts:L75-L99]
  - `createQAConversation(...)` [server/db-knowledge.ts:L165-L189]
- Schema tables for Ask ISA include:
  - `qaConversations`, `qaMessages`, `askIsaFeedback`. [drizzle/schema.ts:L1132-L1164]

---

## Journey 2 — News Hub (monitoring & impact)

### UI → API

1. User opens **News Hub**.
   - UI calls `trpc.hub.getRecentNews.useQuery(...)`. [client/src/pages/NewsHub.tsx:L99-L110]

2. `hub` router is defined on the server within `appRouter`. [server/routers.ts:L335-L354]

3. Primary read procedures:
   - `getRecentNews` [server/routers.ts:L471-L495]
   - `getNewsRecommendations` [server/routers.ts:L513-L537]

### Ingestion (how news gets into the DB)

- External schedulers call REST cron endpoints:
  - `/cron/daily-news-ingestion` triggers daily ingestion. [server/_core/index.ts:L92-L94]
  - Implementation is in `server/cron-endpoint.ts`, calling `dailyNewsIngestion(...)`. [server/cron-endpoint.ts]
- Scheduler calls `runNewsPipeline(...)`. [server/news-cron-scheduler.ts]
- Pipeline orchestration:
  - `runNewsPipeline(...)` coordinates fetch → dedupe → validate → AI process → store. [server/news-pipeline.ts:L59-L98]
- Source list and authority framing:
  - `server/news-sources.ts` declares “Primary/Secondary/Phase 3” sources. [server/news-sources.ts]

### Data persistence

- News write path uses `createHubNews(...)`. [server/db.ts:L456-L480]
- Schema tables include: `hubNews`, `hubNewsHistory`, `newsRecommendations`. [drizzle/schema.ts:L873-L892]

---

## Journey 3 — ESG / Regulatory Mapping Pipeline (frozen corpus → obligations → atomic requirements → data requirements → optional GS1 mapping)

### UI → API (ESRS mapping trigger)

1. Admin triggers ESRS mapping generation in UI.
   - UI calls `trpc.regulations.generateEsrsMappings.useMutation(...)`. [client/src/components/ESRSDatapointsSection.tsx:L38-L49]

2. Server exposes a `regulations` router in `appRouter`. [server/routers.ts:L100-L124]

3. Admin-only procedure:
   - `generateEsrsMappings` (protected; checks admin role; dynamically imports mapper). [server/routers.ts:L138-L172]

### Core server responsibilities

- LLM mapper:
  - `generateRegulationEsrsMappings(regulationId)` maps regulation text → ESRS datapoints. [server/regulation-esrs-mapper.ts:L25-L59]
- Standards mapping (rules-based):
  - `mapESRSToGS1Attributes(...)` maps ESRS datapoints → GS1 attributes with confidence filtering. [server/mappings/esrs-to-gs1-mapper.ts:L56-L90]

### Data persistence

- DB helper persists ESRS mapping results:
  - `upsertRegulationEsrsMapping(...)`. [server/db.ts:L682-L706]
- Schema tables include:
  - `regulations`, `regulationEsrsMappings`, `esrsDatapoints` (+ raw/xbrl variants). [drizzle/schema.ts:L1290-L1309]

---

## Open gaps (from this zip snapshot only)

These require repo-runtime or additional artefacts beyond what’s extractable from this zip:

- How “frozen corpus → obligations → atomic requirements → data requirements” is triggered end-to-end in production (scripts/CLI vs UI flows) is not fully evidenced in this zip alone.
- Production scheduling for cron endpoints (what external scheduler calls them) is not evidenced here; only endpoints exist.

(These should map into `OPEN_QUESTIONS.md`/baseline artefacts under IRON.)
