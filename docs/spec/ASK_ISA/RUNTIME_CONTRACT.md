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
**User Query (tRPC procedure: `askQuestion`)**
- `question: string` - Natural language question
- `conversationId?: string` - Optional conversation context
- `queryType?: string` - Query classification (optional)

**Knowledge Base Generation (tRPC procedure: `generateKnowledgeBase`)**
- `sourceType: 'regulations' | 'standards' | 'esrs' | 'initiatives'`
- `force?: boolean` - Force regeneration

### Outputs
**Answer Response**
```typescript
{
  answer: string,
  sources: Array<{
    id: string,
    type: string,
    title: string,
    url: string,
    relevance: number  // 0-100%
  }>,
  conversationId: string,
  confidence: number,  // 0-100%
  queryType: string
}
```

**Knowledge Base Stats**
```typescript
{
  total: number,
  succeeded: number,
  failed: number,
  coverage: number  // percentage
}
```

## Invariants

1. **Mandatory Citations**: All answers MUST include source citations with relevance scores
2. **Query Guardrails**: Only 6 allowed query types, 5 forbidden types enforced
3. **Top-K Retrieval**: Always retrieve exactly 5 most relevant knowledge chunks
4. **Conversation Persistence**: All Q&A exchanges stored in database with timestamps
5. **Relevance Threshold**: Sources below 30% relevance excluded from response
6. **Deduplication**: Knowledge chunks deduplicated by SHA-256 content hash

## Failure Modes

### Observable Signals
- **LLM API Timeout**: Request exceeds 30s timeout
- **Empty Knowledge Base**: No chunks available for retrieval
- **Low Relevance**: All chunks score below threshold
- **Forbidden Query**: User asks disallowed question type
- **Database Connection**: TiDB connection pool exhausted

### Recovery Procedures
- **LLM Timeout**: Return cached response or graceful error message
- **Empty KB**: Trigger knowledge base generation, return "not ready" message
- **Low Relevance**: Return "no relevant information found" with suggestions
- **Forbidden Query**: Return guardrail message explaining limitations
- **DB Connection**: Retry with exponential backoff (3 attempts)

## Data Dependencies

### Database Tables
- `knowledge_embeddings` - Semantic chunks (155 records)
- `ask_isa_conversations` - Chat history
- `regulations` - 38 EU regulations
- `gs1_standards` - 60+ GS1 standards
- `esrs_datapoints` - 1,184 EFRAG datapoints
- `dutch_initiatives` - 10 national programs

### External APIs
- **Manus Forge API** (OpenAI-compatible)
  - Model: `gpt-4` for answer generation
  - Model: `text-embedding-3-small` for semantic search
  - Rate limit: 60 requests/minute
- **TiDB Cloud** (MySQL-compatible)
  - Connection pool: 10 connections
  - SSL/TLS required

## Security/Secrets

### Required Secrets
- `OPENAI_API_KEY` - Manus Forge API authentication
- `DATABASE_URL` - TiDB connection string (includes credentials)
- `MANUS_OAUTH_CLIENT_ID` - OAuth client identifier
- `MANUS_OAUTH_CLIENT_SECRET` - OAuth client secret

### Authentication
- **User Auth**: Manus OAuth required for all Ask ISA endpoints
- **API Auth**: Bearer token in Authorization header
- **Rate Limiting**: 100 requests per user per hour
- **CORS**: Restricted to allowed origins only

## Verification Methods

### Smoke Test
- **Location**: `scripts/probe/ask_isa_smoke.py`
- **Status**: ✅ Exists and operational
- **Frequency**: On-demand + CI pipeline
- **Coverage**: End-to-end Q&A flow with citation validation
- **Pass Criteria**: Answer returned with ≥1 source, relevance >30%

### Integration Tests
- **Location**: `server/routers/ask-isa.test.ts`
- **Coverage**: Query guardrails, knowledge base generation, conversation persistence
- **Framework**: Vitest
- **Status**: 90%+ passing

### Manual Verification
- **Runbook**: `docs/governance/ASK_ISA_SMOKE_RUNBOOK.md`
- **Frequency**: Before each release
- **Checklist**: 30 production queries validated

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
