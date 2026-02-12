---
DOC_TYPE: SPEC
CAPABILITY: KNOWLEDGE_BASE
COMPONENT: embeddings
FUNCTION_LABEL: "Manage knowledge embeddings"
OWNER: gs1ned-isa
STATUS: active
LAST_VERIFIED: 2026-02-12
VERIFICATION_METHOD: manual
---

# KNOWLEDGE_BASE Runtime Contract

## Purpose
Manage knowledge embeddings

## Entry Points

<!-- EVIDENCE:implementation:server/db-knowledge.ts -->
### API Endpoints (tRPC)
- (To be documented)

### Services
- `server/claim-citation-verifier.ts` <!-- EVIDENCE:implementation:server/claim-citation-verifier.ts -->
- `server/db-knowledge-vector.ts` <!-- EVIDENCE:implementation:server/db-knowledge-vector.ts -->
- `server/db-knowledge.ts` <!-- EVIDENCE:implementation:server/db-knowledge.ts -->

### UI Components
- `client/src/pages/AdminKnowledgeBase.tsx`

## Inputs/Outputs

### Inputs
**Corpus Ingestion**
- Source data (regulations, standards, ESRS, initiatives)
- Content type specification

**Embedding Generation**
- Text chunks (max 2000 chars)
- Model: `text-embedding-3-small`

### Outputs
**Knowledge Chunk**
```typescript
{
  id: number,
  content: string,
  contentHash: string,  // SHA-256
  sourceType: string,
  sourceId: number,
  metadata: object
}
```

## Invariants

1. **Deduplication**: Chunks deduplicated by SHA-256 hash
2. **Coverage Target**: 155+ chunks across all source types
3. **Chunk Size**: Max 2000 characters per chunk
4. **Metadata Required**: All chunks include source type, ID, title, URL
5. **Semantic Search**: LLM-based relevance scoring (0-10 scale)

## Failure Modes

### Observable Signals
- **Empty Corpus**: No source data available
- **Embedding API Failure**: LLM API timeout/error
- **Storage Failure**: Database write error

### Recovery Procedures
- **Empty Corpus**: Trigger data ingestion pipeline
- **Embedding Failure**: Retry with exponential backoff
- **Storage Failure**: Queue for batch retry

## Data Dependencies

### Database Tables
- `knowledge_embeddings` - 155 semantic chunks
- `regulations` - Source data
- `gs1_standards` - Source data
- `esrs_datapoints` - Source data
- `dutch_initiatives` - Source data

### External APIs
- **Manus Forge API** - Embedding generation

## Security/Secrets

### Required Secrets
- `OPENAI_API_KEY` - Embedding generation
- `DATABASE_URL` - TiDB connection

### Authentication
- **Admin Only**: Knowledge base generation restricted

## Verification Methods

### Smoke Test
- **Location**: `scripts/probe/knowledge_base_health.sh`
- **Status**: ⏳ Planned
- **Frequency**: After KB generation
- **Coverage**: Chunk count, deduplication, coverage stats

### Integration Tests
- **Location**: `server/embedding.test.ts`
- **Coverage**: Embedding generation, semantic search, deduplication
- **Framework**: Vitest
- **Status**: 80%+ passing

### Manual Verification
- **Admin Dashboard**: `/admin/knowledge-base`
- **Metrics**: 155+ chunks, 100% coverage across source types

### Integration Tests
- (To be documented)

## Evidence

<!-- EVIDENCE:requirement:docs/planning/refactoring/FILE_INVENTORY.json -->
- Phase 0 Inventory: 12 files classified as KNOWLEDGE_BASE
<!-- EVIDENCE:implementation:server/db-knowledge.ts -->
- Code entrypoints: 4 identified
<!-- EVIDENCE:decision:docs/planning/refactoring/QUALITY_SCORECARDS.json -->
- Quality grade: F (50/100)

---

**Contract Status:** DRAFT  
**Completeness:** ~30% (skeleton only, needs detailed analysis)  
**Next Steps:** Analyze code to populate all sections
