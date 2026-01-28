# ISA_JOURNEY_TRACES_v1
Last verified: 2026-01-28

Purpose: Evidence-bound end-to-end traces for the 5 primary ISA user journeys.
Evidence format: `[path:Lx-Ly]`.

---

## J1 — Ask ISA (Q&A with sources)

### UI
- Main Q&A UI and the key tRPC calls:
  - `trpc.askISA.getUserConversations` / `trpc.askISA.getConversationMessages`
  - `trpc.askISA.ask` mutation
  - Authority filters and citation rendering fields
  
  Evidence: [client/src/pages/AskISA.tsx:L162-L250]

### Server API (tRPC)
- Ask ISA router defines:
  - `ask` mutation input schema incl. `question`, optional `conversationId`, optional `authorityFilter`, `maxSources`.
  - Ambiguity handling: can return a clarification request.
  - Hybrid search over the knowledge base (`hybridSearch`).
  - Prompt assembly + LLM answer generation (`generateAnswer`).
  - Message persistence (`createConversation`, `addConversationMessage`).
  - Citation validation (`validateCitations`).

  Evidence: [server/routers/ask-isa.ts:L73-L260]

### Knowledge retrieval + grounding
- Ask ISA imports and uses a deterministic retrieval layer:
  - `hybridSearch` (combined retrieval strategy)
  - `KnowledgeSearchResult` types

  Evidence: [server/routers/ask-isa.ts:L10-L31]

---

## J2 — News Hub (monitoring & impact)

### UI
- News Hub page retrieves news items via `trpc.hub.getRecentNews` and then filters/sorts on the client.

  Evidence: [client/src/pages/NewsHub.tsx:L70-L150]

### Server API (tRPC)
- `hub` router exists inside the main `appRouter`, with a public endpoint `getRecentNews` that reads from `hubNews` ordered by `publishedDate`.

  Evidence: [server/routers.ts:L335-L405] (hub router start)
  Evidence: [server/routers.ts:L470-L510] (`getRecentNews`, `getLastPipelineRun`)

### Data layer (DB schema)
- `hub_news` table schema including source metadata, impact fields, and governance-related fields (e.g., `sourceType`, `credibilityScore`, `regulatoryState`, `confidenceLevel`).

  Evidence: [drizzle/schema.ts:L873-L904]

---

## J3 — ESG / Regulatory Mapping Pipeline (frozen artefacts → traceability)

### UI
- Traceability view calls:
  - `trpc.esgArtefacts.getArtefactVersion` (immutability check)
  - `trpc.esgArtefacts.getTraceabilityChain`
  - `trpc.esgArtefacts.getGs1RelevanceSummary`

  Evidence: [client/src/pages/EsgTraceability.tsx:L34-L50]

- Priorities view calls:
  - `trpc.esgArtefacts.getPriorityRecommendations`
  - `trpc.esgArtefacts.getArtefactVersion`

  Evidence: [client/src/pages/EsgPriorities.tsx:L19-L25]

### Server API (tRPC)
- `esgArtefactsRouter` is explicitly read-only and declares an artefact version with `status: "FROZEN"` and a "GS1 is never legally required" disclaimer.
- It exposes:
  - `getArtefactVersion`
  - `getTraceabilityChain` (instrument → obligations → atomic requirements → data requirements → GS1 mappings)
  - `getGs1RelevanceSummary`
  - `getPriorityRecommendations`

  Evidence: [server/routers/esg-artefacts.ts:L1-L101]

---

## J4 — Document / Dataset Catalogus (bibliotheek)

### UI
- Dataset Registry page retrieves datasets via `trpc.datasetRegistry.listDatasets`, supports filtering by type/source/status and shows dataset details.

  Evidence: [client/src/pages/DatasetRegistry.tsx:L28-L120]

### Server API (tRPC)
- `datasetRegistryRouter.listDatasets`:
  - Accepts optional filters: `type`, `source`, `status`.
  - Calls `listDatasets(filters)`.

  Evidence: [server/routers/dataset-registry.ts:L8-L65]

### Data access
- `listDatasets` queries the `datasetRegistry` table with optional where-clauses and orders by `updatedAt`.

  Evidence: [server/db-dataset-registry.ts:L4-L66]

### Data layer (DB schema)
- `dataset_registry` table includes authority/currency metadata: `source`, `version`, `status`, `publishedAt`, `lastVerifiedAt`, `contentHash`, plus access fields (`url`, `format`, `filePath`).

  Evidence: [drizzle/schema.ts:L283-L323]

---

## J5 — Value Scoring & Prioritisatie

### UI
- Compliance Scoreboard page:
  - `trpc.scoring.getScoreboard` to retrieve an array of scored items.
  - Client-side filtering by `type` and `category`.

  Evidence: [client/src/pages/ComplianceScoreboard.tsx:L13-L52]

### Server API (tRPC)
- `scoringRouter.getScoreboard`:
  - Accepts optional filters: `category`, `limit`, `type`.
  - Uses `calculateComplianceScore(items)`.

  Evidence: [server/routers/scoring.ts:L6-L64]

### Scoring engine
- `calculateComplianceScore` implements weighted scoring across factors:
  - `authorityLevel`, `timeCriticality`, `interoperabilityNeed`, `dataComplexity`, `crossBorderImpact`, `gs1Alignment`.
  - Defines weights, computes a total score, and adds a `recommendation` string.

  Evidence: [server/compliance-scoring.ts:L4-L145]

---

## Open gaps (explicit)
- The journeys above trace UI → tRPC → DB/schema for (J2, J4, J5) and UI → tRPC for (J3).
- If you want J3 to include "pipeline execution" (ingestion/jobs) rather than only "frozen artefact consumption", we need to trace:
  - the ingestion scripts (e.g., TypeScript/Python runners) → DB write paths → scheduled/CI execution.
  - This is not included in this file yet.
