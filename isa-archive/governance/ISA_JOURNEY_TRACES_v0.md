# ISA Primary Journeys — Execution Traces (v0)

Last verified: 2026-01-28  
Repo snapshot: `isa_web_clean-main` (zip upload)

Conventions:
- Evidence format: `[path:Lx-Ly]` (line ranges taken from the uploaded repo snapshot).

---

## 1) Ask ISA (Q&A with sources)

**UI entry**
- Route `/ask` → `AskISA` page. [`client/src/App.tsx:L104-L182`]
- Ask ISA page calls `trpc.askISA.*` procedures. [`client/src/pages/AskISA.tsx:L190-L210`]

**API / server**
- `askISARouter` implements `ask` mutation and related endpoints. [`server/routers/ask-isa.ts:L1-L120`]
- Ask pipeline includes: query ambiguity analysis, guardrails, hybrid search, LLM invocation, storage, citation validation, verification, authority scoring. [`server/routers/ask-isa.ts:L63-L200`]

**Retrieval**
- Hybrid retrieval combines vector + BM25. [`server/routers/ask-isa.ts:L92-L121`]
- Hybrid implementation lives in `server/hybrid-search.ts` (used by Ask ISA router). [`server/routers/ask-isa.ts:L41-L49`]

**Persistence**
- Conversation/message storage via `createQAConversation` / `addQAMessage` (from `server/db-knowledge.ts`). [`server/routers/ask-isa.ts:L12-L24`]

---

## 2) News Hub (monitoring & impact)

**UI entry**
- Route `/news` → `NewsHub`. [`client/src/App.tsx:L29-L33` + `client/src/App.tsx:L150-L170`]
- Admin pipeline page exists (`AdminNewsPipelineManager`). [`client/src/App.tsx:L45-L50`]

**Ingestion orchestration**
- News pipeline orchestrator `runNewsPipeline()` coordinates fetch → dedupe → age filter → validation → AI processing → DB insert. [`server/news-pipeline.ts:L1-L120`]

**Observability**
- Pipeline execution context + log persistence. [`server/news-pipeline.ts:L24-L36` + `server/news-pipeline.ts:L60-L110`]

---

## 3) ESG / Regulatory Mapping (frozen artefact access)

**UI entry**
- Routes:
  - `/hub/esg-traceability` → `EsgTraceability`
  - `/hub/esg-priorities` → `EsgPriorities`
  [`client/src/App.tsx:L124-L163`]

**API / server**
- Read-only, immutability-focused router `esgArtefactsRouter`. [`server/routers/esg-artefacts.ts:L1-L60`]
- Exposed read-only procedures:
  - `getArtefactVersion`
  - `getTraceabilityChain`
  - `getGs1RelevanceSummary`
  - `getPriorityRecommendations`
  [`server/routers/esg-artefacts.ts:L37-L102`]

**Persistence**
- Data access via `db-esg-artefacts.ts` (called by router). [`server/routers/esg-artefacts.ts:L23-L30`]

---

## 4) Document/Dataset Catalog (library & metadata)

**UI entry**
- `/hub/resources` → `HubResources`
- `/dataset-registry` → `DatasetRegistry`
- `/templates` → `TemplateLibrary`
[`client/src/App.tsx:L41-L90` + `client/src/App.tsx:L168-L235`]

**Server (to confirm)**
- Candidate server-side handlers are expected under `server/routers/*` and `server/db*`.
- **UNKNOWN (needs evidence)**: exact router(s) serving dataset registry/resources in this snapshot.

---

## 5) Value Scoring & Prioritisation

**UI entry**
- `/scoreboard` → `ComplianceScoreboard`
- `/compliance/roadmap` → `ComplianceRoadmap`
- `/admin/executive-scorecard` → `ExecutiveScorecard`
[`client/src/App.tsx:L83-L100` + `client/src/App.tsx:L224-L245`]

**Server (to confirm)**
- **UNKNOWN (needs evidence)**: the server router(s) and DB tables directly powering these pages in this snapshot.

---

## What this trace confirms now

- Ask ISA is fully traceable from route → page → tRPC → router → retrieval + storage path.  
- News Hub ingestion orchestration is explicit and includes observability hooks.  
- ESG artefacts access is explicitly read-only and claims immutability semantics.

## Highest-leverage follow-ups

1. Close the **UNKNOWN** items for journeys (4) and (5) by tracing:
   - Client `trpc.*` calls → server router exports → DB functions → schema tables.
2. Add explicit DB-table mapping per journey using `drizzle/schema.ts` and DB helper modules.
