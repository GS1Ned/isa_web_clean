---
DOC_TYPE: SPEC
CAPABILITY: ADVISORY
COMPONENT: generation
FUNCTION_LABEL: "Generate advisory reports"
OWNER: gs1ned-isa
STATUS: active
LAST_VERIFIED: 2026-02-12
VERIFICATION_METHOD: manual
---

# ADVISORY Runtime Contract

## Purpose
Generate advisory reports

## Entry Points

### API Endpoints (tRPC)
- `server/routers/advisory-diff.ts`
- `server/routers/advisory-reports.test.ts`
- `server/routers/advisory-reports.ts`

### Services
- `server/advisory-diff.test.ts`
- `server/advisory-report-export.test.ts`
- `server/advisory-report-export.ts`

### UI Components
- `client/src/pages/AdvisoryDashboard.tsx`
- `client/src/pages/AdvisoryDiff.tsx`
- `client/src/pages/AdvisoryDiffComparison.tsx`

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
- Location: `scripts/probe/advisory_smoke.py`
- Status: ⏳ To be created

### Integration Tests
- (To be documented)

## Evidence

- Phase 0 Inventory: 64 files classified as ADVISORY
- Code entrypoints: 9 identified

---

**Contract Status:** DRAFT  
**Completeness:** ~30% (skeleton only, needs detailed analysis)  
**Next Steps:** Analyze code to populate all sections
