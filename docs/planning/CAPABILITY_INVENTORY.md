Last_verified: 2026-02-10
Scope: Initial P0 capability inventory for the 6 canonical ISA capabilities.
Rules:
- Evidence-first: every mapping must cite repository implementation entrypoints.
- STOP: provisional only until P1 completes.
- Secrets: names-only if environment variables are referenced.

# CAPABILITY_INVENTORY
Status: P0_FIRST_PASS_PROVISIONAL

| Capability | Spec Anchor | Server Entrypoints | Client Entrypoints | Data / Schema | Tests | CI Enforcement | Provisional Maturity (0-5) | Evidence |
|---|---|---|---|---|---|---|---:|---|
| ASK_ISA | `docs/spec/ASK_ISA.md` | `server/routers/ask-isa.ts`, `server/routers/ask-isa-v2.ts`, `server/prompts/ask_isa/index.ts` | `client/src/App.tsx:204`, `client/src/pages/AskISA.tsx` | `drizzle/schema.ts:55`, `drizzle/schema.ts:1011` | `server/ask-isa-guardrails.test.ts`, `server/ask-isa-integration.test.ts` | `/.github/workflows/ask-isa-runtime-smoke.yml`, `/.github/workflows/ask-isa-smoke.yml` | 4 | `server/routers.ts:1132`, `client/src/App.tsx:204`, `server/routers/ask-isa.ts:90` |
| NEWS_HUB | `docs/spec/NEWS_HUB.md` | `server/news-pipeline.ts`, `server/news-admin-router.ts` | `client/src/App.tsx:174`, `client/src/App.tsx:178`, `client/src/App.tsx:227`, `client/src/App.tsx:228` | `drizzle/schema.ts:873`, `drizzle/schema.ts:906`, `drizzle/schema.ts:1049` | `server/news-pipeline.test.ts`, `server/news-pipeline-modes.test.ts`, `server/news-admin-router.test.ts` | No dedicated active workflow found | 4 | `server/news-pipeline.ts:59`, `server/routers.ts:1162` |
| KNOWLEDGE_BASE | `docs/spec/KNOWLEDGE_BASE.md` | `server/db-knowledge.ts`, `server/routers/esg-artefacts.ts` | `client/src/App.tsx:209`, `client/src/pages/AdminKnowledgeBase.tsx` | `drizzle/schema.ts:1011`, `drizzle/schema.ts:2122`, `drizzle/schema.ts:2145`, `drizzle/schema.ts:2164` | `server/hybrid-search.test.ts` | No dedicated active workflow found | 3 | `server/routers.ts:1308`, `server/routers/esg-artefacts.ts:1` |
| CATALOG | `docs/spec/CATALOG.md` | `server/routers/dataset-registry.ts` | `client/src/App.tsx:218`, `client/src/pages/DatasetRegistry.tsx` | `drizzle/schema.ts:285`, `data/metadata/dataset_registry.json` | `server/routers/dataset-registry.test.ts` | No dedicated active workflow found | 4 | `server/routers.ts:1199`, `server/routers/dataset-registry.ts:19` |
| ESRS_MAPPING | `docs/spec/ESRS_MAPPING.md` | `server/routers/esrs-gs1-mapping.ts`, `server/regulation-esrs-mapper.ts` | `client/src/App.tsx:182`, `client/src/App.tsx:197` | `drizzle/schema.ts:457`, `drizzle/schema.ts:682`, `drizzle/schema.ts:1264` | `server/esrs-gs1-mapping.test.ts`, `server/regulation-esrs-mapper.test.ts`, `server/mapping-feedback.test.ts` | No dedicated active workflow found | 4 | `server/routers.ts:1214`, `server/routers/esrs-gs1-mapping.ts:24` |
| ADVISORY | `docs/spec/ADVISORY.md` | `server/routers/advisory.ts`, `server/routers/advisory-reports.ts`, `server/routers/advisory-diff.ts` | `client/src/App.tsx:206`, `client/src/App.tsx:207`, `client/src/App.tsx:208`, `client/src/App.tsx:216`, `client/src/App.tsx:219` | `data/advisories/`, `drizzle/schema.ts:17` | `server/advisory-diff.test.ts`, `server/advisory-report-export.test.ts`, `server/routers/advisory-reports.test.ts` | No dedicated active workflow found | 4 | `server/routers.ts:1172`, `server/routers.ts:1204`, `server/routers.ts:1224` |

Notes:
- Maturity scores are provisional P0 values and must be validated in P1.
- `docs/spec/ASK_ISA.md` includes implementation evidence; other capability specs are minimal and require P1 deepening.
