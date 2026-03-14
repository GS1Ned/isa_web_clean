---
DOC_TYPE: SPEC
CAPABILITY: ASK_ISA
COMPONENT: runtime
FUNCTION_LABEL: "Grounded Q&A via expert, search, and classic Ask ISA surfaces"
OWNER: gs1ned-isa
STATUS: active
LAST_VERIFIED: 2026-03-13
VERIFICATION_METHOD: repo-evidence
---

# ASK_ISA Runtime Contract

## Canonical Role

ASK_ISA provides grounded question answering and explanation over ISA knowledge assets, mapping outputs, and advisory artefacts. It is the interactive explanation surface, not the primary decision engine.

## Runtime Surfaces (Code Truth)

<!-- EVIDENCE:implementation:server/routers.ts -->
<!-- EVIDENCE:implementation:client/src/App.tsx -->

- Top-level `appRouter` surfaces: `askISA`, `askISAV2`, `evaluation`.
- Client routes:
  - `/ask` -> `client/src/pages/AskISAEnhanced.tsx`
  - `/ask/classic` -> `client/src/pages/AskISA.tsx`
- Primary v2 UI surfaces:
  - `client/src/components/AskISAExpertMode.tsx`
  - `client/src/components/EnhancedSearchPanel.tsx`
- Router modules:
  - `server/routers/ask-isa.ts`
  - `server/routers/ask-isa-v2.ts`
  - `server/routers/evaluation.ts`
- Retrieval and embedding dependencies:
  - `server/embedding.ts`
  - `server/hybrid-search.ts`
  - `server/db-knowledge-vector.ts`
  - `server/routers/ask-isa-v2-intelligence.ts`

## Data Surfaces (Ownership Contract)

<!-- EVIDENCE:implementation:docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json -->

- Owned tables:
  - `qa_conversations`
  - `qa_messages`
  - `ask_isa_feedback`
  - `rag_traces`
  - `evaluation_results`
- Schema anchors:
  - `drizzle/schema.ts`
  - `drizzle/schema_ask_isa_feedback.ts`
  - `drizzle/schema_corpus_governance.ts`

## Input / Output Contract (Current)

- Inputs: typed tRPC procedure inputs handled by ASK_ISA router modules.
- Primary expert flow: `askISAV2.askEnhanced`
  - Input: `{ question, includeGapAnalysis?, regulationId? }`
  - Output extends classic answer payloads with:
    - `queryIntent`
    - `retrievalProfile`
    - `mappingContext`
    - `confidence`
    - `authority`
    - `inlineRecommendations`
    - `facts`
    - `explainers`
    - optional `gapAnalysis`
- Evidence search flow: `askISAV2.enhancedSearch`
  - Output includes `queryIntent` and `retrievalStrategy` alongside filtered results.
- Classic flow remains available through `askISA.ask` on `/ask/classic`.
- Response field-level shape is code-truth in router implementations; this document does not assert an independent divergent schema.

## Stage-A Validation Expectations

<!-- EVIDENCE:implementation:server/routers/ask-isa.ts -->
<!-- EVIDENCE:implementation:server/routers/ask-isa-v2.ts -->
<!-- EVIDENCE:implementation:server/ask-isa-stage-a.ts -->
<!-- EVIDENCE:implementation:server/routers/evaluation.ts -->

- Stage-A ASK_ISA answers must include valid `[Source N]` citations aligned with provided sources.
- Stage-A ASK_ISA answers must have at least one evidence-backed source with a non-empty `evidenceKey`.
- Stage-A ASK_ISA answers must have at least one recently verified, non-deprecated, evidence-backed source before they can pass as compliance-grade output.
- Stage-A ASK_ISA answers must abstain when citation or verification checks fail, rather than returning the raw generated answer.
- Stage-A ASK_ISA answer completeness is currently enforced with a minimum 100-character floor plus claim-verification checks.
- Source payloads preserve shared provenance review semantics from the citation layer, including `needsVerification`, additive `verificationReason`, additive `verificationAgeDays`, and `evidenceKeyReason`, so ASK_ISA UI and downstream consumers do not invent their own verification taxonomy.
- When some cited sources still require refreshed verification but the answer remains stage-A passable, ASK_ISA emits additive warnings rather than inventing silent confidence.
- Evaluation runs must apply the same Stage-A gate so offline quality reporting does not overstate runtime readiness.

## Intelligence-Specific Runtime Expectations

<!-- EVIDENCE:implementation:server/routers/ask-isa-v2.ts -->
<!-- EVIDENCE:implementation:server/routers/ask-isa-v2-intelligence.ts -->

- `askISAV2.askEnhanced` must classify query intent before retrieval.
- Retrieval plans may vary by intent across source type, semantic layer, and authority posture.
- Mapping-sensitive questions may inject structured mapping context into prompt assembly when regulation or ESRS signals are present.
- Gap-analysis enrichment may auto-activate for gap-oriented questions when a regulation can be inferred from retrieved evidence.
- UI-facing source authority levels must be mapped into the shared Ask ISA authority taxonomy before returning to the client.

## Phase-3 Provenance Target (Chunk-Level Consumption)

- Canonical target contract: `docs/spec/KNOWLEDGE_BASE/PROVENANCE_REBUILD_SPEC.md`
- Phase 3 passing answers must cite authoritative `source_chunks`, not metadata-only proxies.
- Stage-A abstention remains mandatory when verified authoritative chunk evidence is unavailable.
- ASK_ISA citation payloads must preserve `sourceId`, `sourceChunkId`, `evidenceKey`, `authorityTier`, `sourceRole`, `publicationStatus`, and verification posture from the rebuilt provenance substrate.

## Verification

<!-- EVIDENCE:implementation:scripts/probe/ask_isa_smoke.py -->

- Smoke probe: `scripts/probe/ask_isa_smoke.py`
- Tests:
  - `server/ask-isa-stage-a.test.ts`
  - `server/ask-isa-guardrails.test.ts`
  - `server/routers/__tests__/ask-isa-v2-intent.test.ts`
  - `client/src/components/AskISAExpertMode.test.tsx`
  - `client/src/pages/AskISAEnhanced.test.tsx`
  - `server/routers/__tests__/capability-heartbeat.test.ts`
- Canonical gate alignment:
  - `bash scripts/gates/doc-code-validator.sh --canonical-only`
  - `python3 scripts/validate_planning_and_traceability.py`

## Operational Unknowns

- External model selection and provider-side request quotas are UNKNOWN from repository-only evidence.
- Production infrastructure limits (for example pooled DB limits at deployment) are UNKNOWN from repository-only evidence.

## Evidence

<!-- EVIDENCE:implementation:client/src/App.tsx -->
<!-- EVIDENCE:implementation:client/src/pages/AskISA.tsx -->
<!-- EVIDENCE:implementation:client/src/pages/AskISAEnhanced.tsx -->
<!-- EVIDENCE:implementation:client/src/components/AskISAExpertMode.tsx -->
<!-- EVIDENCE:implementation:client/src/components/EnhancedSearchPanel.tsx -->
<!-- EVIDENCE:implementation:server/routers/ask-isa.ts -->
<!-- EVIDENCE:implementation:server/routers/ask-isa-v2.ts -->
<!-- EVIDENCE:implementation:server/routers/ask-isa-v2-intelligence.ts -->
<!-- EVIDENCE:implementation:server/routers/evaluation.ts -->
<!-- EVIDENCE:implementation:server/embedding.ts -->

**Contract Status:** CURRENT_EVIDENCE_BACKED
