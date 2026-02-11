---
DOC_TYPE: SPEC
CAPABILITY: CATALOG
COMPONENT: registry
FUNCTION_LABEL: "Catalog regulations and standards"
OWNER: gs1ned-isa
STATUS: active
LAST_VERIFIED: 2026-02-12
VERIFICATION_METHOD: manual
---

# CATALOG Runtime Contract

## Purpose
Catalog regulations and standards

## Entry Points

### API Endpoints (tRPC)
- `server/gs1-standards-router.ts`
- `server/routers/standards-directory.test.ts`
- `server/routers/standards-directory.ts`

### Services
- `server/check-regulations.ts`
- `server/gs1-benelux-parser.ts`
- `server/gs1-diy-parser.ts`

### UI Components
- `client/src/pages/CompareRegulations.tsx`
- `client/src/pages/DatasetRegistry.tsx`
- `client/src/pages/HubRegulations.tsx`

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
- Location: `scripts/probe/catalog_smoke.py`
- Status: ⏳ To be created

### Integration Tests
- (To be documented)

## Evidence

- Phase 0 Inventory: 34 files classified as CATALOG
- Code entrypoints: 9 identified

---

**Contract Status:** DRAFT  
**Completeness:** ~30% (skeleton only, needs detailed analysis)  
**Next Steps:** Analyze code to populate all sections
