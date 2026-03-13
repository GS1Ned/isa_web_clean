Status: SUPPLEMENTAL_ACTIVE
Last Updated: 2026-03-09

# Phase 3 Provenance Implementation Handoff

Use `docs/spec/KNOWLEDGE_BASE/PROVENANCE_REBUILD_SPEC.md` as the canonical contract. This document is the execution handoff package for the later Phase 3 implementation slice.

## Likely Code Areas To Change

| Area | Why it will change in Phase 3 |
| --- | --- |
| `drizzle/schema.ts` | Add or reconcile bridging fields between `knowledge_embeddings`, `dataset_registry`, and authoritative provenance rows. |
| `drizzle/schema_corpus_governance.ts` | Converge the target `sources` / `source_chunks` contract. |
| `drizzle/schema_dataset_registry.ts` | Reconcile dataset admission semantics and queryable role metadata. |
| `server/catalog-authority.ts` | Extend authority classification beyond hostname-only coarse derivation. |
| `server/routers/dataset-registry.ts` | Enforce registry admission semantics for `sourceRole`, `admissionBasis`, and GitHub guardrails. |
| `server/services/corpus-ingestion/index.ts` | Rebuild `sources` / `source_chunks`, source-level hashes, retrieval timestamps, and structural locators. |
| `server/db-knowledge.ts` / `server/db-knowledge-vector.ts` / `server/knowledge-vector-search.ts` | Keep current retrieval working while bridging to authoritative `source_chunks`. |
| `server/knowledge-provenance.ts` | Preserve evidence-key and verification semantics while moving to authoritative chunk identity. |
| `server/citation-validation.ts` / `server/routers/citation-admin.ts` | Return real chunk-level provenance and verification posture. |
| `server/routers/ask-isa.ts` / `server/ask-isa-stage-a.ts` | Enforce chunk-level evidence requirements and abstention. |
| `server/db-esrs-gs1-mapping.ts` and ESRS routers | Add `evidenceRefs` for mappings, gaps, and insufficiency cases. |
| `server/routers/advisory*.ts`, export/versioning/diff modules | Persist and surface chunk-level evidence references in advisory artifacts. |
| `scripts/eval/adapters/*.cjs` and related tests | Tighten Phase 1 metrics from proxy signals to source/chunk-backed signals. |

## Recommended Implementation Order
1. Dataset-registry admission and authority helper updates.
2. Schema convergence for `sources`, `source_chunks`, and any required bridge fields.
3. Source rebuild for approved authoritative classes.
4. Chunk rebuild and `knowledge_embeddings` bridge.
5. Citation-layer cutover.
6. ASK_ISA / ESRS_MAPPING / ADVISORY consumer cutover.
7. Evaluation tightening and threshold re-run.

## Required Validation
- `bash scripts/gates/doc-code-validator.sh --canonical-only`
- `python3 scripts/validate_planning_and_traceability.py`
- Phase 1 capability eval command for `KNOWLEDGE_BASE`, `ESRS_MAPPING`, `ASK_ISA`, `ADVISORY`
- `node scripts/eval/run-source-authority-check.cjs`
- Focused tests for citation validation, ASK_ISA stage-a, source authority, and advisory traceability

## Do Not Change During Phase 3
- Do not start `pgvector` or retrieval-architecture redesign.
- Do not treat UI or workflow restoration as part of the provenance rebuild implementation slice.
- Do not rename Phase 1 metric IDs.
- Do not change the canonical `ke:` evidence-key prefix.
- Do not introduce a parallel authority model outside dataset registry + provenance contract.

## Rollback / Containment
- Keep `knowledge_embeddings` as the compatibility retrieval path until source/chunk-backed citations pass validation.
- If chunk cutover fails, keep runtime on the compatibility mirror and preserve the authoritative `sources` / `source_chunks` population for debugging and replay.
