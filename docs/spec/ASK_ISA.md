# Spec: ASK_ISA (Minimal)

## Goal
Provide Q&A over ISA knowledge with traceable evidence pointers.

## Inputs
- user_question (string)

## Outputs
- answer (string)
- evidence (list of provenance pointers)

## Acceptance
- Deterministic endpoint exists (can be stubbed)
- Every material claim includes evidence pointers

## Implementation evidence
### Proven entrypoints (repo)
- Server prompt: `server/prompts/ask_isa/index.ts` (export: `assembleAskISAPrompt`)
- Server invokers (top hits):
  - `server/routers/ask-isa.ts`
  - `server/routers/evaluation.ts`
  - `server/ask-isa-guardrails.test.ts`
  - `server/ask-isa-query-library.ts`
  - `server/ask-isa-guardrails.ts`
  - `server/prompts/ask_isa/system.ts`
  - `server/prompts/ask_isa/verification.ts`
  - `server/prompts/ask_isa/index.ts`
  - `server/prompts/ask_isa/step_policy.ts`
- Client refs (top hits):
  - `client/src/components/Breadcrumbs.tsx`
  - `client/src/pages/EvaluationDashboard.tsx`
  - `client/src/pages/AIGapAnalysisWizard.tsx`
  - `client/src/components/AuthorityBadge.tsx`
  - `client/src/pages/ComplianceMonitoringDashboard.tsx`
  - `client/src/pages/GS1NLAttributeBrowser.tsx`
  - `client/src/components/AskISAWidget.tsx`
  - `client/src/pages/AskISA.tsx`
  - `client/src/lib/i18n.tsx`
  - `client/src/components/NavigationMenu.tsx`
  - `client/src/components/Footer.tsx`
  - `client/src/pages/AdminKnowledgeBase.tsx`
  - `client/src/pages/Home.tsx`
  - `client/src/pages/AdminFeedbackDashboard.tsx`
  - `client/src/pages/AskISAEnhanced.tsx`
  - `client/src/pages/ExternalAPIIntegration.tsx`
- Data/schema refs:
  - `drizzle/schema_ask_isa_feedback.ts`
  - `drizzle/schema_corpus_governance.ts`
  - `drizzle/schema.ts`
- Runtime contract: `docs/spec/contracts/ASK_ISA_RUNTIME_CONTRACT.md`
- Verified_at_utc: `2026-02-09T20:37:32Z`
- Repo_head_sha: `7a8260077fd4c814ceb66a01e1848d32cf97647d`

## Canonical anchors
### Canonical links
- Planning: `docs/planning/PHASE_1.md`
- Next actions: `docs/planning/NEXT_ACTIONS.json` (P1-0001)
- Agent map: `docs/agent/AGENT_MAP.md`
- Runtime contract: `docs/spec/contracts/ASK_ISA_RUNTIME_CONTRACT.md`
