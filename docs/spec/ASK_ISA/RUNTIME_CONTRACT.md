---
DOC_TYPE: SPEC
CAPABILITY: ASK_ISA
COMPONENT: runtime
FUNCTION_LABEL: "Grounded Q&A via RAG surfaces"
OWNER: gs1ned-isa
STATUS: active
LAST_VERIFIED: 2026-02-20
VERIFICATION_METHOD: repo-evidence
---

# ASK_ISA Runtime Contract

## Canonical Role
ASK_ISA provides grounded question answering and explanation over ISA knowledge assets, mapping outputs, and advisory artefacts. It is the interactive explanation surface, not the primary decision engine.

## Runtime Surfaces (Code Truth)
<!-- EVIDENCE:implementation:server/routers.ts -->
- Top-level `appRouter` surfaces: `askISA`, `askISAV2`, `evaluation`.
- Router modules:
  - `server/routers/ask-isa.ts`
  - `server/routers/ask-isa-v2.ts`
  - `server/routers/evaluation.ts`
- Retrieval and embedding dependencies:
  - `server/embedding.ts`
  - `server/hybrid-search.ts`
  - `server/db-knowledge-vector.ts`

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
- Outputs: answer payloads with citation-aware grounding metadata and evaluation artifacts.
- Response field-level shape is code-truth in router implementations; this document does not assert an independent divergent schema.

## Stage-A Validation Expectations
<!-- EVIDENCE:implementation:server/routers/ask-isa.ts -->
<!-- EVIDENCE:implementation:server/ask-isa-stage-a.ts -->
<!-- EVIDENCE:implementation:server/routers/evaluation.ts -->
- Stage-a ASK_ISA answers must include valid `[Source N]` citations aligned with provided sources.
- Stage-a ASK_ISA answers must have at least one evidence-backed source with a non-empty `evidenceKey`.
- Stage-a ASK_ISA answers must abstain when citation or verification checks fail, rather than returning the raw generated answer.
- Stage-a ASK_ISA answer completeness is currently enforced with a minimum 100-character floor plus claim-verification checks.
- Source payloads preserve shared provenance review semantics from the citation layer, including `needsVerification`, additive `verificationReason`, and `evidenceKeyReason`, so ASK_ISA UI and downstream consumers do not invent their own verification taxonomy.
- Evaluation runs must apply the same stage-a gate so offline quality reporting does not overstate runtime readiness.

## Verification
<!-- EVIDENCE:implementation:scripts/probe/ask_isa_smoke.py -->
- Smoke probe: `scripts/probe/ask_isa_smoke.py`
- Tests:
  - `server/ask-isa-stage-a.test.ts`
  - `server/ask-isa-guardrails.test.ts`
  - `server/routers/__tests__/capability-heartbeat.test.ts`
- Canonical gate alignment:
  - `bash scripts/gates/doc-code-validator.sh --canonical-only`
  - `python3 scripts/validate_planning_and_traceability.py`

## Operational Unknowns
- External model selection and provider-side request quotas are UNKNOWN from repository-only evidence.
- Production infrastructure limits (for example pooled DB limits at deployment) are UNKNOWN from repository-only evidence.

## Evidence
<!-- EVIDENCE:implementation:server/routers/ask-isa.ts -->
<!-- EVIDENCE:implementation:server/routers/ask-isa-v2.ts -->
<!-- EVIDENCE:implementation:server/routers/evaluation.ts -->
<!-- EVIDENCE:implementation:server/embedding.ts -->

**Contract Status:** CURRENT_EVIDENCE_BACKED
