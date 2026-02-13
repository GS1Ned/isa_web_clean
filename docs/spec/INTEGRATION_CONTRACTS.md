# ISA Integration Contracts
## Inter-Capability Dependencies and Interfaces

**Version:** 1.0.0  
**Created:** 2026-02-12  
**Status:** AUTHORITATIVE  
**Purpose:** Define how capabilities interact with each other

---

## Dependency Graph

```
┌─────────────┐
│  ADVISORY   │ (depends on all)
└──────┬──────┘
       │
   ┌───┴────────────────────────────┐
   │                                │
┌──▼──────┐  ┌──────────┐  ┌──────▼────────┐
│ASK_ISA  │  │NEWS_HUB  │  │ESRS_MAPPING   │
└──┬──────┘  └────┬─────┘  └───────┬───────┘
   │              │                 │
   └──────┬───────┴─────────────────┘
          │
    ┌─────▼──────────┐
    │KNOWLEDGE_BASE  │
    └────────┬───────┘
             │
       ┌─────▼─────┐
       │ CATALOG   │
       └───────────┘
```

**Dependency Rules:**
- CATALOG has no dependencies (foundation layer)
- KNOWLEDGE_BASE depends only on CATALOG
- ASK_ISA, NEWS_HUB, ESRS_MAPPING depend on CATALOG + KNOWLEDGE_BASE
- ADVISORY depends on all capabilities

---

## Shared Data Models

### Core Entities

All capabilities share these database tables:

```typescript
// Regulations (38 EU regulations)
regulations {
  id: number
  celexId: string
  title: string
  regulationType: enum
  effectiveDate: Date
}

// GS1 Standards (60+ standards)
gs1_standards {
  id: number
  standardCode: string
  standardName: string
  category: string
}

// ESRS Datapoints (1,184 datapoints)
esrs_datapoints {
  id: number
  code: string
  esrsStandard: string
  name: string
}

// Users (authentication)
users {
  id: number
  openId: string
  role: 'user' | 'admin'
}
```

### Mapping Tables

```typescript
// Regulation-to-ESRS mappings (450+)
regulation_esrs_mappings {
  regulationId: number → regulations.id
  datapointId: number → esrs_datapoints.id
  relevanceScore: number (0-10)
  reasoning: string
}

// Knowledge embeddings (155 chunks)
knowledge_embeddings {
  sourceType: 'regulation' | 'standard' | 'esrs_datapoint' | 'dutch_initiative'
  sourceId: number
  content: string
  embedding: number[] (1536-dim)
}
```

---

## Capability Contracts

### CATALOG → (All Capabilities)

**Provides:**
- Regulation metadata (38 regulations)
- GS1 standards metadata (60+ standards)
- ESRS datapoints (1,184 datapoints)
- Dutch initiatives (10 initiatives)

**API:**
```typescript
// tRPC procedures
catalog.getRegulations() → Regulation[]
catalog.getRegulation(id) → Regulation
catalog.getStandards() → GS1Standard[]
catalog.getStandard(id) → GS1Standard
catalog.getESRSDatapoints() → ESRSDatapoint[]
```

**Guarantees:**
- Data is read-only (no mutations)
- IDs are stable (never change)
- Queries return within 1s

**Consumers:**
- KNOWLEDGE_BASE (source data)
- ASK_ISA (metadata for citations)
- NEWS_HUB (regulation tagging)
- ESRS_MAPPING (mapping source data)
- ADVISORY (data aggregation)

---

### KNOWLEDGE_BASE → ASK_ISA

**Provides:**
- Semantic search over 155 knowledge chunks
- Embedding generation for queries
- Hybrid search (semantic + keyword)

**API:**
```typescript
// Internal functions (not tRPC)
hybridSearch(query: string, topK: number) → {
  chunks: KnowledgeChunk[]
  scores: number[]
}

generateEmbedding(text: string) → number[] // 1536-dim
```

**Guarantees:**
- Top-K retrieval returns exactly K chunks
- Chunks deduplicated by content hash
- Search completes within 3s

**Data Contract:**
```typescript
interface KnowledgeChunk {
  id: number
  sourceType: 'regulation' | 'standard' | 'esrs_datapoint' | 'dutch_initiative'
  sourceId: number
  content: string
  title: string
  url: string
}
```

**Consumers:**
- ASK_ISA (RAG retrieval)

---

### CATALOG + KNOWLEDGE_BASE → NEWS_HUB

**Provides:**
- Regulation metadata for tagging
- GS1 standards for impact analysis

**API:**
```typescript
// NEWS_HUB uses CATALOG API directly
catalog.getRegulations() → Regulation[]
catalog.getStandards() → GS1Standard[]
```

**Integration:**
- NEWS_HUB enrichment pipeline tags articles with regulation IDs
- AI processor uses regulation/standard metadata for context
- No direct dependency on KNOWLEDGE_BASE

**Data Flow:**
```
News Article → AI Enrichment → Regulation Tags (from CATALOG)
                              → GS1 Impact Tags (from CATALOG)
                              → Sector Tags (AI-generated)
```

---

### CATALOG → ESRS_MAPPING

**Provides:**
- ESRS datapoints for mapping
- GS1 standards for mapping targets
- Regulations for context

**API:**
```typescript
catalog.getESRSDatapoints() → ESRSDatapoint[]
catalog.getStandards() → GS1Standard[]
catalog.getRegulations() → Regulation[]
```

**Integration:**
- ESRS_MAPPING generates mappings between datapoints and standards
- Mappings stored in `regulation_esrs_mappings` table
- AI uses CATALOG metadata for context

**Data Flow:**
```
ESRS Datapoint → AI Mapping Engine → GS1 Standard
                 (uses CATALOG metadata)
                 ↓
           regulation_esrs_mappings
```

---

### ALL → ADVISORY

**Provides:**
- CATALOG: Regulation/standard metadata
- KNOWLEDGE_BASE: Coverage statistics
- ASK_ISA: Query patterns, usage stats
- NEWS_HUB: Recent developments
- ESRS_MAPPING: Mapping statistics

**API:**
```typescript
// ADVISORY aggregates data from all capabilities
advisory.generateReport(config) → {
  regulations: Regulation[]
  standards: GS1Standard[]
  mappings: Mapping[]
  news: HubNews[]
  coverage: CoverageStats
}
```

**Integration:**
- ADVISORY reads from all capability databases
- No write dependencies (read-only)
- Generates versioned reports with provenance

**Data Flow:**
```
CATALOG → regulations, standards, datapoints
KNOWLEDGE_BASE → embedding count, coverage
ASK_ISA → query count, conversation count
NEWS_HUB → recent news, source health
ESRS_MAPPING → mapping count, quality scores
           ↓
    Advisory Report (v1.0, v1.1, ...)
```

---

## Event Contracts

**Current State:** No event-driven architecture

**Future Consideration:**
```typescript
// Potential events for future implementation
events {
  'regulation.created' → { regulationId: number }
  'regulation.updated' → { regulationId: number, changes: object }
  'news.published' → { newsId: number }
  'mapping.created' → { mappingId: number }
  'knowledge_base.regenerated' → { chunkCount: number }
}
```

**Rationale for No Events:**
- All interactions are synchronous
- No async workflows currently
- Simpler architecture for MVP
- Can add events later if needed

---

## API Versioning

**Current Strategy:** No versioning (v1 implicit)

**Breaking Change Policy:**
- Database schema changes require migration
- tRPC procedure signature changes are breaking
- Response format changes are breaking

**Future Versioning:**
```typescript
// Potential versioning strategy
trpc.v1.catalog.getRegulations()
trpc.v2.catalog.getRegulations() // with new fields
```

---

## Data Consistency

### Consistency Guarantees

**Strong Consistency:**
- All reads within same transaction see same data
- Database ACID guarantees via TiDB

**Eventual Consistency:**
- Knowledge base regeneration (manual trigger)
- News pipeline (daily 02:00 UTC)
- Advisory reports (manual generation)

### Referential Integrity

**Enforced by Database:**
```sql
-- Foreign key constraints
regulation_esrs_mappings.regulationId → regulations.id
regulation_esrs_mappings.datapointId → esrs_datapoints.id
knowledge_embeddings.sourceId → (regulations|standards|esrs_datapoints).id
```

**Not Enforced:**
- `hub_news.relatedRegulationIds` (JSON array, no FK)
- `advisory_reports.targetRegulationIds` (JSON array, no FK)

**Rationale:** JSON arrays don't support foreign keys in MySQL

---

## Error Handling

### Error Propagation

**tRPC Errors:**
```typescript
// Standard error format
{
  code: 'BAD_REQUEST' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'INTERNAL_SERVER_ERROR'
  message: string
  data?: object
}
```

**Capability-Specific Errors:**
```typescript
// ASK_ISA
'KNOWLEDGE_BASE_EMPTY' → 503 Service Unavailable
'QUERY_TOO_SHORT' → 400 Bad Request

// NEWS_HUB
'SCRAPER_FAILED' → 503 Service Unavailable
'SOURCE_UNREACHABLE' → 502 Bad Gateway

// ESRS_MAPPING
'MAPPING_NOT_FOUND' → 404 Not Found
'INVALID_DATAPOINT' → 400 Bad Request
```

### Retry Policy

**Database Queries:**
- Retry 3 times with exponential backoff
- Max backoff: 5 seconds
- Fail after 3 attempts

**External APIs:**
- Retry 2 times with exponential backoff
- Max backoff: 10 seconds
- Fail after 2 attempts

---

## Performance Contracts

### Response Time SLAs

```typescript
// 90th percentile targets
catalog.getRegulations() → <1s
catalog.getRegulation(id) → <500ms
knowledgeBase.search() → <3s
askISA.ask() → <5s
newsHub.getNews() → <2s
esrsMapping.getMappings() → <3s
advisory.generateReport() → async (no SLA)
```

### Throughput Limits

**Rate Limiting:**
- 100 requests/user/hour (global)
- 10 requests/user/minute (burst)

**Database:**
- 10 connection pool
- Max 1000 concurrent queries

---

## Security Contracts

### Authentication

**All Capabilities Require:**
- Manus OAuth token
- Valid JWT with 1-hour expiry
- User record in `users` table

**Admin Endpoints Require:**
- `role='admin'` in user record
- Applies to: knowledge base generation, advisory generation, news pipeline management

### Authorization

**Read Operations:**
- All authenticated users

**Write Operations:**
- Admin only: knowledge base, advisory, news pipeline
- User-specific: saved items, preferences

### Data Access

**Capability Isolation:**
- Each capability owns its tables
- Cross-capability reads allowed
- Cross-capability writes forbidden

---

## Monitoring Contracts

### Health Checks

**Endpoint:** `GET /health`

**Response:**
```typescript
{
  status: 'healthy' | 'degraded' | 'unhealthy'
  capabilities: {
    catalog: 'healthy'
    knowledgeBase: 'healthy'
    askISA: 'healthy'
    newsHub: 'degraded' // scraper failed
    esrsMapping: 'healthy'
    advisory: 'healthy'
  }
  database: 'healthy'
  externalAPIs: {
    openai: 'healthy'
    playwright: 'healthy'
  }
}
```

### Metrics

**Capability-Specific:**
```typescript
// ASK_ISA
ask_isa_queries_total
ask_isa_query_duration_seconds
ask_isa_knowledge_base_chunks

// NEWS_HUB
news_hub_articles_total
news_hub_scraper_success_rate
news_hub_enrichment_success_rate

// ESRS_MAPPING
esrs_mapping_count
esrs_mapping_quality_score
```

---

## Deployment Dependencies

### Deployment Order

**Required Order:**
1. Database migrations
2. CATALOG (foundation)
3. KNOWLEDGE_BASE (depends on CATALOG)
4. ASK_ISA, NEWS_HUB, ESRS_MAPPING (parallel)
5. ADVISORY (depends on all)

**Rationale:**
- CATALOG must exist before KNOWLEDGE_BASE
- KNOWLEDGE_BASE must exist before ASK_ISA
- ADVISORY requires all capabilities operational

### Rollback Strategy

**Safe Rollback:**
- ADVISORY (no dependencies)
- ASK_ISA, NEWS_HUB, ESRS_MAPPING (parallel)
- KNOWLEDGE_BASE (if ASK_ISA rolled back)
- CATALOG (never rollback, only forward migrations)

**Dangerous Rollback:**
- CATALOG (breaks all capabilities)
- Database schema (requires migration rollback)

---

## Testing Contracts

### Integration Test Requirements

**Each Capability Must:**
- Test against real database (not mocks)
- Test tRPC procedures end-to-end
- Test error handling
- Test authentication/authorization

**Cross-Capability Tests:**
```typescript
// ASK_ISA → KNOWLEDGE_BASE
test('ASK_ISA retrieves chunks from KNOWLEDGE_BASE')

// NEWS_HUB → CATALOG
test('NEWS_HUB tags articles with regulation IDs from CATALOG')

// ADVISORY → ALL
test('ADVISORY aggregates data from all capabilities')
```

---

## Breaking Change Policy

### What Constitutes a Breaking Change

**Database:**
- Removing columns
- Changing column types
- Removing tables
- Changing foreign key constraints

**API:**
- Removing tRPC procedures
- Changing procedure signatures
- Changing response formats
- Changing error codes

**Data:**
- Changing enum values
- Changing ID generation strategy
- Changing data formats (JSON structure)

### How to Handle Breaking Changes

1. **Deprecation Notice:** 2 weeks minimum
2. **Dual Support:** Old + new API for 1 release
3. **Migration Guide:** Document upgrade path
4. **Version Bump:** Major version increment

---

## Future Integration Patterns

### Planned Enhancements

**Event Bus:**
- Kafka for async workflows
- Event sourcing for audit trail
- CQRS for read/write separation

**API Gateway:**
- Centralized rate limiting
- Request/response logging
- API versioning

**Service Mesh:**
- Circuit breakers
- Retry policies
- Load balancing

---

**Document Status:** AUTHORITATIVE  
**Last Updated:** 2026-02-12  
**Next Review:** After Phase 3 completion
