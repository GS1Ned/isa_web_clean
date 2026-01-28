# CRITICAL_FILES_CANDIDATES (top-20)

Generated: 2026-01-28

| path | responsibility | evidence |
|---|---|---|
| server/_core/index.ts | Express bootstrap; mounts /api/trpc, OAuth routes, /health,/ready, /cron/* endpoints | server/_core/index.ts:L98-L117 (/api/trpc) |
| server/routers.ts | tRPC appRouter composition; defines hub/regulations procedures incl. getRecentNews, generateEsrsMappings | server/routers.ts:L335-L354 (hub router); L471-L495 (getRecentNews); L100-L124 (regulations router); L138-L172 (generateEsrsMappings) |
| server/routers/ask-isa.ts | Ask ISA tRPC router (ask, conversations, embeddings, feedback) | server/routers/ask-isa.ts:L73-L112 |
| server/ask-isa-guardrails.ts | Ask ISA query-type + refusal/validation guardrails | server/ask-isa-guardrails.ts:L4-L23 |
| server/db.ts | DB access layer; CRUD helpers for hub news + regulation mappings | server/db.ts:L456-L480 (createHubNews); L682-L706 (upsertRegulationEsrsMapping) |
| server/db-knowledge.ts | Knowledge base helpers for Ask ISA; chunk storage + LLM-scored search; QA conversations/messages | server/db-knowledge.ts:L165-L189 (createQAConversation); L75-L99 (searchKnowledgeChunks) |
| drizzle/schema.ts | Canonical DB schema (97 tables) for drizzle/MySQL | drizzle/schema.ts:L1132-L1164 (qaConversations/qaMessages); L873-L892 (hubNews); L1264-L1283 (regulationEsrsMappings) |
| server/news-pipeline.ts | News ingestion orchestrator (fetch → dedupe → AI process → store) | server/news-pipeline.ts:L59-L98 |
| server/news-cron-scheduler.ts | Schedules daily ingestion + weekly archival using runNewsPipeline | server/news-cron-scheduler.ts (imports runNewsPipeline) |
| server/cron-endpoint.ts | REST cron trigger endpoints (/cron/daily-news-ingestion etc) for external schedulers | server/cron-endpoint.ts (dailyNewsIngestion/weeklyNewsArchival) |
| server/news-sources.ts | Defines authoritative/secondary news sources used by ingestion pipeline | server/news-sources.ts header |
| server/news-ai-processor.ts | LLM processing of news batches (classification, summarization, impact) | server/news-ai-processor.ts header |
| server/regulation-esrs-mapper.ts | LLM mapping regulation text → ESRS datapoints; persists to DB | server/regulation-esrs-mapper.ts:L25-L59 |
| server/mappings/esrs-to-gs1-mapper.ts | Maps ESRS datapoints → GS1 attributes using rules + confidence threshold | server/mappings/esrs-to-gs1-mapper.ts:L56-L90 |
| client/src/pages/AskISA.tsx | Ask ISA UI; calls trpc.askISA.ask mutation; handles conversations | client/src/pages/AskISA.tsx:L201-L215 |
| client/src/pages/NewsHub.tsx | News Hub UI; calls trpc.hub.getRecentNews query | client/src/pages/NewsHub.tsx:L99-L110 |
| client/src/components/ESRSDatapointsSection.tsx | ESRS UI; admin trigger for trpc.regulations.generateEsrsMappings | client/src/components/ESRSDatapointsSection.tsx:L38-L49 |
| scripts/iron-context.sh | Generates Context Acknowledgement block for PRs (Context-Commit-Hash etc) | scripts/iron-context.sh |
| scripts/iron-inventory.sh | Generates isa.inventory.json (auto-generated; must not be edited) | scripts/iron-inventory.sh |
| .github/workflows/iron-gate.yml | CI gate enforcing Context-Commit-Hash + inventory immutability | .github/workflows/iron-gate.yml |
