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

<!-- EVIDENCE:implementation:server/routers/advisory-reports.ts -->
### API Endpoints (tRPC)
- `server/routers/advisory-diff.ts` <!-- EVIDENCE:implementation:server/routers/advisory-diff.ts -->
- `server/routers/advisory-reports.test.ts`
- `server/routers/advisory-reports.ts` <!-- EVIDENCE:implementation:server/routers/advisory-reports.ts -->

### Services
- `server/advisory-diff.test.ts`
- `server/advisory-report-export.test.ts`
- `server/advisory-report-export.ts` <!-- EVIDENCE:implementation:server/advisory-report-export.ts -->

### UI Components
- `client/src/pages/AdvisoryDashboard.tsx` <!-- EVIDENCE:implementation:client/src/pages/AdvisoryDashboard.tsx -->
- `client/src/pages/AdvisoryDiff.tsx`
- `client/src/pages/AdvisoryDiffComparison.tsx`

## Inputs/Outputs

### Inputs
**Advisory Generation**
- Dataset registry (15 canonical datasets)
- ESRS-GS1 mappings (450+ mappings)
- Compliance roadmap template
- Version specification (v1.0, v1.1, etc.)

### Outputs
**Advisory Report**
```typescript
{
  version: string,  // e.g., "1.0"
  generatedAt: Date,
  datasets: Array<{
    name: string,
    version: string,
    recordCount: number,
    sha256: string
  }>,
  mappings: object,
  roadmap: object,
  provenance: object
}
```

**Advisory Diff**
```typescript
{
  fromVersion: string,
  toVersion: string,
  changes: Array<{
    type: 'added' | 'removed' | 'modified',
    path: string,
    oldValue: any,
    newValue: any
  }>
}
```

## Invariants

1. **Full Provenance**: All datasets include source, version, SHA256, last_verified_date
2. **Versioned Outputs**: All reports versioned (v1.0, v1.1, etc.)
3. **Governance Review**: All reports subject to Lane C review before publication
4. **Diff Computation**: Changes tracked between versions
5. **Immutable**: Published reports never modified, only superseded
6. **Dataset Registry**: All datasets registered in data/metadata/dataset_registry.json

## Failure Modes

### Observable Signals
- **Missing Dataset**: Required dataset not in registry
- **Checksum Mismatch**: Dataset SHA256 doesn't match registry
- **Generation Timeout**: Report generation exceeds 5 minutes
- **Validation Failure**: Report schema validation fails

### Recovery Procedures
- **Missing Dataset**: Trigger data ingestion, abort generation
- **Checksum Mismatch**: Alert admin, verify data integrity
- **Generation Timeout**: Optimize queries, increase timeout
- **Validation Failure**: Fix schema, regenerate report

## Data Dependencies

### Database Tables
- All catalog tables (regulations, standards, ESRS, initiatives)
- `esrs_gs1_mappings` - 450+ mappings

### External APIs
- **Manus Forge API** - GPT-4 for advisory generation

### File System
- `data/metadata/dataset_registry.json` - Dataset registry (v1.4.0)
- `data/advisories/` - Published advisory reports

## Security/Secrets

### Required Secrets
- `OPENAI_API_KEY` - Advisory generation
- `DATABASE_URL` - TiDB connection

### Authentication
- **Lane C Restricted**: Advisory generation requires executive approval
- **Admin Only**: Report publication restricted
- **Public Read**: Viewing published reports requires Manus OAuth

## Verification Methods

### Smoke Test
- **Location**: `scripts/validate_advisory_schema.cjs`
- **Status**: ✅ Exists and operational
- **Frequency**: Before each advisory publication
- **Coverage**: Schema validation, provenance verification, checksum validation

### Integration Tests
- **Location**: `server/routers/advisory.test.ts`
- **Coverage**: Report generation, diff computation, dataset registry
- **Framework**: Vitest
- **Status**: 90%+ passing

### Manual Verification
- **Governance Review**: Lane C approval required before publication
- **Runbook**: `docs/ADVISORY_METHOD.md`
- **Metrics**: 2 versions published (v1.0, v1.1), 100% provenance coverage
- Status: ⏳ To be created

### Integration Tests
- (To be documented)

## Evidence

<!-- EVIDENCE:requirement:docs/planning/refactoring/FILE_INVENTORY.json -->
- Phase 0 Inventory: 64 files classified as ADVISORY
<!-- EVIDENCE:implementation:server/routers/advisory-reports.ts -->
- Code entrypoints: 9 identified
<!-- EVIDENCE:decision:docs/planning/refactoring/QUALITY_SCORECARDS.json -->
- Quality grade: C (70/100)
<!-- EVIDENCE:requirement:data/advisories/ -->
- Advisory versions: v1.0, v1.1

---

**Contract Status:** DRAFT  
**Completeness:** ~30% (skeleton only, needs detailed analysis)  
**Next Steps:** Analyze code to populate all sections
