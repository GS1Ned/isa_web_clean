---
DOC_TYPE: SPEC
CAPABILITY: ASK_ISA
COMPONENT: retrieval
FUNCTION_LABEL: "Answer user questions via RAG"
OWNER: gs1ned-isa
STATUS: active
LAST_VERIFIED: 2026-02-12
VERIFICATION_METHOD: manual
---

# ASK_ISA Runtime Contract

## Purpose
Answer user questions via RAG

## Entry Points

<!-- EVIDENCE:implementation:server/routers/ask-isa.ts -->
### API Endpoints (tRPC)
- `server/routers/ask-isa-enhanced-routes.ts` <!-- EVIDENCE:implementation:server/routers/ask-isa-enhanced-routes.ts -->
- `server/routers/ask-isa-v2.ts` <!-- EVIDENCE:implementation:server/routers/ask-isa-v2.ts -->
- `server/routers/ask-isa.ts` <!-- EVIDENCE:implementation:server/routers/ask-isa.ts -->

### Services
- `server/_core/embedding.ts`
- `server/ask-isa-cache.ts`
- `server/ask-isa-guardrails.test.ts`

### UI Components
- `client/src/components/AuthorityBadge.tsx`
- `client/src/components/Breadcrumbs.tsx`
- `client/src/lib/i18n.tsx`

## Inputs/Outputs

### Inputs
- (To be documented based on code analysis)

### Outputs
- (To be documented based on code analysis)

## Invariants

1. (To be documented)
2. (To be documented)

## Failure Modes

### Observable Signals
- (To be documented)

### Recovery Procedures
- (To be documented)

## Data Dependencies

### Database Tables
- (To be documented)

### External APIs
- (To be documented)

## Security/Secrets

### Required Secrets
- (To be documented - names only, no values)

### Authentication
- (To be documented)

## Verification Methods

### Smoke Test
- Location: `scripts/probe/ask_isa_smoke.py`
- Status: ✅ Exists

### Integration Tests
- (To be documented)

## Evidence

<!-- EVIDENCE:requirement:docs/planning/refactoring/FILE_INVENTORY.json -->
- Phase 0 Inventory: 51 files classified as ASK_ISA
<!-- EVIDENCE:implementation:server/routers/ask-isa.ts -->
- Code entrypoints: 9 identified
<!-- EVIDENCE:decision:docs/planning/refactoring/QUALITY_SCORECARDS.json -->
- Quality grade: A (100/100)

---

**Contract Status:** DRAFT  
**Completeness:** ~30% (skeleton only, needs detailed analysis)  
**Next Steps:** Analyze code to populate all sections
