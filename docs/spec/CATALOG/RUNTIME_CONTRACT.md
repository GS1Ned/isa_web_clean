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

<!-- EVIDENCE:implementation:server/routers/standards-directory.ts -->
### API Endpoints (tRPC)
- `server/gs1-standards-router.ts` <!-- EVIDENCE:implementation:server/gs1-standards-router.ts -->
- `server/routers/standards-directory.test.ts`
- `server/routers/standards-directory.ts` <!-- EVIDENCE:implementation:server/routers/standards-directory.ts -->

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
**Catalog Queries (tRPC procedures)**
- `getRegulations()` - List all regulations
- `getStandards()` - List all GS1 standards
- `getESRSDatapoints()` - List ESRS datapoints
- `getDutchInitiatives()` - List national programs

### Outputs
**Regulation**
```typescript
{
  id: number,
  title: string,
  description: string,
  category: string,
  status: string,
  applicability: string[],
  relatedStandards: number[]
}
```

**Standard**
```typescript
{
  id: number,
  name: string,
  description: string,
  type: string,
  relatedRegulations: number[]
}
```

## Invariants

1. **Coverage**: 38 EU regulations, 60+ GS1 standards, 1,184 ESRS datapoints, 10 Dutch initiatives
2. **Bidirectional Links**: Regulations ↔ Standards mappings maintained
3. **AI Descriptions**: All items have AI-enhanced descriptions
4. **Filtering**: Support category, status, applicability filters
5. **Search**: Full-text search across all catalog items

## Failure Modes

### Observable Signals
- **Empty Catalog**: No data in database
- **Broken Links**: Regulation-Standard mappings invalid
- **Query Timeout**: Database query exceeds 5s

### Recovery Procedures
- **Empty Catalog**: Trigger data ingestion
- **Broken Links**: Regenerate mappings
- **Query Timeout**: Add database indexes, optimize query

## Data Dependencies

### Database Tables
- `regulations` - 38 EU regulations
- `gs1_standards` - 60+ standards
- `esrs_datapoints` - 1,184 datapoints
- `dutch_initiatives` - 10 programs
- `regulation_standard_mappings` - Bidirectional links

### External APIs
- None (read-only from database)

## Security/Secrets

### Required Secrets
- `DATABASE_URL` - TiDB connection

### Authentication
- **Public Read**: Catalog browsing requires Manus OAuth
- **Admin Write**: Data updates restricted to admin role

## Verification Methods

### Smoke Test
- **Location**: `scripts/probe/catalog_health.sh`
- **Status**: ⏳ Planned
- **Frequency**: After data ingestion
- **Coverage**: Record counts, link integrity, search functionality

### Integration Tests
- **Location**: `server/routers/catalog.test.ts`
- **Coverage**: CRUD operations, filtering, search, mappings
- **Framework**: Vitest
- **Status**: 90%+ passing

### Manual Verification
- **UI Pages**: `/hub/regulations`, `/hub/standards`, `/hub/esrs-datapoints`
- **Metrics**: 38 regulations, 60+ standards, 1,184 ESRS datapoints, 10 initiatives
- Status: ⏳ To be created

### Integration Tests
- (To be documented)

## Evidence

<!-- EVIDENCE:requirement:docs/planning/refactoring/FILE_INVENTORY.json -->
- Phase 0 Inventory: 34 files classified as CATALOG
<!-- EVIDENCE:implementation:server/routers/standards-directory.ts -->
- Code entrypoints: 9 identified
<!-- EVIDENCE:decision:docs/planning/refactoring/QUALITY_SCORECARDS.json -->
- Quality grade: C (70/100)

---

**Contract Status:** DRAFT  
**Completeness:** ~30% (skeleton only, needs detailed analysis)  
**Next Steps:** Analyze code to populate all sections
