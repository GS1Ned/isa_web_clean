---
DOC_TYPE: SPEC
CAPABILITY: KNOWLEDGE_BASE
COMPONENT: runtime
FUNCTION_LABEL: "Corpus, embeddings and retrieval substrate"
OWNER: gs1ned-isa
STATUS: active
LAST_VERIFIED: 2026-02-20
VERIFICATION_METHOD: repo-evidence
---

# KNOWLEDGE_BASE Runtime Contract

## Canonical Role
KNOWLEDGE_BASE provides ingestion-governed corpus storage, embeddings, and retrieval primitives consumed by ASK_ISA, ESRS_MAPPING and ADVISORY.

## Runtime Surfaces (Code Truth)
<!-- EVIDENCE:implementation:server/routers.ts -->
- Top-level `appRouter` surface: `citationAdmin`.
- Modules:
  - `server/routers/citation-admin.ts`
  - `server/db-knowledge.ts`
  - `server/db-knowledge-vector.ts`
  - `server/hybrid-search.ts`
  - `server/embedding.ts`

## Data Surfaces (Ownership Contract)
<!-- EVIDENCE:implementation:docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json -->
- Owned tables:
  - `knowledge_embeddings`
  - `sources`
  - `source_chunks`
  - `ingest_item_provenance`
- Schema anchors:
  - `drizzle/schema.ts`
  - `drizzle/schema_corpus_governance.ts`

## Input / Output Contract (Current)
- Inputs: corpus and citation-management operations through `citationAdmin` and knowledge services.
- Outputs: retrieval-ready vectors/chunks and provenance-linked corpus artifacts.
- Exact payload shapes remain code-truth in tRPC routers and service modules.

## Retrieval And Citation Substrate Expectations
<!-- EVIDENCE:implementation:drizzle/schema.ts -->
<!-- EVIDENCE:implementation:server/citation-validation.ts -->
<!-- EVIDENCE:implementation:server/knowledge-provenance.ts -->
- `knowledge_embeddings` remains the current retrieval-ready chunk substrate for stage-a ASK_ISA work.
- Retrieval/citation paths must preserve these provenance fields on knowledge chunks:
  - `contentHash`
  - `datasetId`
  - `datasetVersion`
  - `lastVerifiedDate`
  - `isDeprecated`
- Citation validation must emit canonical evidence keys in the form `ke:<chunkId>:<contentHash>` whenever `contentHash` is present.
- Citation validation must mark `needsVerification=true` when `lastVerifiedDate` is missing, invalid, or older than 90 days.
- Citation validation now exposes a canonical `verificationReason` in `{ok, missing_last_verified_date, invalid_last_verified_date, stale_last_verified_date}` whenever chunk metadata is available, so downstream review and UI tooling can avoid inventing their own provenance semantics.
- Citation-admin surfaces may expose additive verification posture summaries, `verificationAgeDays`, `freshnessBuckets`, and aggregate age stats derived from the same canonical verification helper, so admin review flows stay aligned with retrieval-time provenance semantics.
- Admin verification workflows and retrieval validation must use the same verification-window rule so downstream ASK_ISA citation behavior stays aligned.

## Verification
<!-- EVIDENCE:implementation:scripts/probe/knowledge_base_health.sh -->
- Smoke probe: `scripts/probe/knowledge_base_health.sh`
- Verification posture gate: `scripts/gates/knowledge-verification-posture.sh`
- Tests:
  - `server/embedding.test.ts`
  - `server/knowledge-provenance.test.ts`
  - `server/routers/__tests__/capability-heartbeat.test.ts`
- Canonical gate alignment:
  - `bash scripts/gates/doc-code-validator.sh --canonical-only`
  - `python3 scripts/validate_planning_and_traceability.py`

## Operational Unknowns
- Provider-specific embedding model versioning at runtime is UNKNOWN from repository-only evidence.
- Production vector index sizing and deployed throughput limits are UNKNOWN from repository-only evidence.

## Evidence
<!-- EVIDENCE:implementation:server/routers/citation-admin.ts -->
<!-- EVIDENCE:implementation:server/db-knowledge.ts -->
<!-- EVIDENCE:implementation:server/db-knowledge-vector.ts -->
<!-- EVIDENCE:implementation:server/hybrid-search.ts -->

**Contract Status:** CURRENT_EVIDENCE_BACKED
