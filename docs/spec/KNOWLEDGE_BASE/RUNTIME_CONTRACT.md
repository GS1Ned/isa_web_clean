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

## Verification
<!-- EVIDENCE:implementation:scripts/probe/knowledge_base_health.sh -->
- Smoke probe: `scripts/probe/knowledge_base_health.sh`
- Tests:
  - `server/embedding.test.ts`
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
