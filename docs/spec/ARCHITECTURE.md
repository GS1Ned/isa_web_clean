# ISA System Architecture
## Unified Technical Architecture for All Capabilities

**Version:** 2.0.0  
**Created:** 2026-02-12  
**Status:** AUTHORITATIVE  
**Purpose:** Single source of truth for ISA's system-wide architecture

---

## System Overview

ISA (Intelligent Standards Architect) is a sustainability compliance intelligence platform built on a modular capability architecture. The system connects EU ESG regulations to GS1 standards through AI-powered analysis, structured knowledge graphs, and automated news aggregation.

### Core Capabilities

1. **ASK_ISA** - RAG-powered Q&A with mandatory citations
2. **NEWS_HUB** - Automated news aggregation and AI enrichment
3. **KNOWLEDGE_BASE** - Corpus ingestion and semantic search
4. **CATALOG** - Regulation and standards catalog
5. **ESRS_MAPPING** - GS1-to-ESRS mapping engine
6. **ADVISORY** - Versioned advisory report generation

### Technology Stack

- **Frontend**: React 19 + TypeScript 5.9.3 + Tailwind CSS 4 + shadcn/ui
- **Backend**: Express 4 + tRPC 11 + Node.js 22.13.0
- **Database**: Drizzle ORM + MySQL/TiDB Cloud
- **AI/ML**: OpenAI GPT-4 + text-embedding-3-small
- **Infrastructure**: Manus hosting + GitHub + Playwright

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  React 19 + TypeScript + Tailwind CSS + shadcn/ui + Wouter     │
└────────────────────────┬────────────────────────────────────────┘
                         │ tRPC Client (Type-Safe RPC)
┌────────────────────────┴────────────────────────────────────────┐
│                         API LAYER                                │
│              Express 4 + tRPC 11 + Manus OAuth                  │
├─────────────────────────────────────────────────────────────────┤
│  ASK_ISA    NEWS_HUB    KNOWLEDGE_BASE    CATALOG    ESRS_MAPPING    ADVISORY  │
│  Router     Router      Services          Router     Router          Router    │
└────────────────────────┬────────────────────────────────────────┘
                         │ Drizzle ORM
┌────────────────────────┴────────────────────────────────────────┐
│                      DATA LAYER                                  │
│                   MySQL/TiDB Cloud                              │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐     │
│  │regulations│standards │esrs_data │hub_news  │knowledge │     │
│  │          │          │points    │          │embeddings│     │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘     │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌──────────────┬──────────────┬──────────────┐               │
│  │ Manus Forge  │  Playwright  │  EUR-Lex     │               │
│  │ (OpenAI API) │  (Scraping)  │  (Regulatory)│               │
│  └──────────────┴──────────────┴──────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Capability Architecture

### ASK_ISA

**Purpose**: Answer user questions via RAG with mandatory citations

**Components**:
- `server/routers/ask-isa.ts` - tRPC router
- `server/_core/embedding.ts` - Embedding generation
- `server/hybrid-search.ts` - Semantic + keyword search
- `client/src/pages/AskISA.tsx` - UI

**Data Flow**:
1. User submits question
2. Query embedding generated (text-embedding-3-small)
3. Hybrid search retrieves top-5 chunks (semantic + BM25)
4. LLM generates answer with citations (GPT-4)
5. Response stored in conversation history

**Database Tables**:
- `knowledge_embeddings` (155 chunks)
- `qa_conversations`
- `qa_messages`

**External Dependencies**:
- Manus Forge API (embeddings + LLM)

---

### NEWS_HUB

**Purpose**: Aggregate and enrich ESG news from 7 sources

**Components**:
- `server/news-admin-router.ts` - Admin API
- `server/news-pipeline-config.ts` - Pipeline configuration
- `server/news-scraper.ts` - Playwright-based scraping
- `server/news-ai-processor.ts` - AI enrichment
- `client/src/pages/NewsHub.tsx` - UI

**Data Flow**:
1. Cron job triggers daily at 02:00 UTC
2. Playwright scrapes 7 sources (EUR-Lex, EFRAG, GS1)
3. Articles deduplicated by URL hash
4. AI enrichment: regulation tagging, GS1 impact, sectors
5. Articles stored with enrichment metadata

**Database Tables**:
- `hub_news` (news articles)
- `hub_news_history` (change tracking)
- `scraper_executions` (health monitoring)
- `scraper_health_summary` (24h metrics)

**External Dependencies**:
- Playwright (web scraping)
- Manus Forge API (AI enrichment)
- EUR-Lex, EFRAG, GS1 websites

---

### KNOWLEDGE_BASE

**Purpose**: Manage knowledge embeddings for semantic search

**Components**:
- `server/db-knowledge.ts` - Database helpers
- `server/_core/embedding.ts` - Embedding generation
- `server/services/corpus-ingestion/` - Ingestion pipeline
- `client/src/pages/AdminKnowledgeBase.tsx` - Admin UI

**Data Flow**:
1. Admin triggers KB generation
2. Source data fetched (regulations, standards, ESRS, initiatives)
3. Content chunked (max 2000 chars)
4. Embeddings generated (text-embedding-3-small)
5. Chunks deduplicated by SHA-256 hash
6. Stored in `knowledge_embeddings`

**Database Tables**:
- `knowledge_embeddings` (155 chunks)
- `regulations` (38 EU regulations)
- `gs1_standards` (60+ standards)
- `esrs_datapoints` (1,184 datapoints)
- `dutch_initiatives` (10 initiatives)

**External Dependencies**:
- Manus Forge API (embeddings)

---

### CATALOG

**Purpose**: Regulation and standards catalog with filtering

**Components**:
- `server/routers/catalog.ts` - tRPC router
- `client/src/pages/HubRegulations.tsx` - Regulations UI
- `client/src/pages/HubStandards.tsx` - Standards UI
- `data/` - Dataset files

**Data Flow**:
1. User browses catalog
2. Filters applied (regulation type, sector, date)
3. Results fetched from database
4. Detail pages show ESRS mappings, news, timelines

**Database Tables**:
- `regulations` (38 regulations)
- `gs1_standards` (60+ standards)
- `esrs_datapoints` (1,184 datapoints)
- `regulation_esrs_mappings` (450+ mappings)

**External Dependencies**:
- None (static data)

---

### ESRS_MAPPING

**Purpose**: GS1-to-ESRS mapping engine with AI-assisted analysis

**Components**:
- `server/gs1-mapping-engine.ts` - Mapping logic
- `server/ingest/INGEST-03_esrs_datapoints.ts` - ESRS ingestion
- `client/src/pages/AdminESRSMapping.tsx` - Admin UI

**Data Flow**:
1. ESRS datapoints ingested from EFRAG IG3
2. AI generates mappings to GS1 standards
3. Mappings scored by relevance (0-10)
4. Admin reviews and verifies mappings
5. Mappings stored with reasoning

**Database Tables**:
- `esrs_datapoints` (1,184 datapoints)
- `gs1_standards` (60+ standards)
- `regulation_esrs_mappings` (450+ mappings)
- `gs1_esrs_mappings` (GS1 Europe white paper)

**External Dependencies**:
- Manus Forge API (mapping generation)

---

### ADVISORY

**Purpose**: Generate versioned advisory reports with full provenance

**Components**:
- `server/routers/advisory.ts` - tRPC router
- `server/advisory-generator.ts` - Report generation
- `server/advisory-diff.ts` - Diff computation
- `scripts/validate_advisory_schema.cjs` - Schema validation

**Data Flow**:
1. Admin triggers advisory generation
2. Data aggregated from all capabilities
3. LLM generates structured report (GPT-4)
4. Report validated against schema
5. Diff computed vs. previous version
6. Report stored with governance metadata

**Database Tables**:
- `advisory_reports` (2 versions)
- `advisory_report_versions` (version history)
- `dataset_registry` (provenance tracking)

**External Dependencies**:
- Manus Forge API (report generation)

---

## Data Model

### Core Entities

```typescript
// Regulations
interface Regulation {
  id: number;
  celexId: string;
  title: string;
  description: string;
  regulationType: 'CSRD' | 'ESRS' | 'DPP' | 'EUDR' | 'ESPR' | 'PPWR' | 'OTHER';
  effectiveDate: Date;
  sourceUrl: string;
}

// GS1 Standards
interface GS1Standard {
  id: number;
  standardCode: string;
  standardName: string;
  description: string;
  category: string;
  referenceUrl: string;
}

// ESRS Datapoints
interface ESRSDatapoint {
  id: number;
  code: string;
  esrsStandard: string;
  disclosureRequirement: string;
  name: string;
  dataType: string;
  conditional: boolean;
  voluntary: boolean;
}

// News Articles
interface HubNews {
  id: number;
  title: string;
  summary: string;
  newsType: 'NEW_LAW' | 'AMENDMENT' | 'ENFORCEMENT' | 'GUIDANCE' | 'PROPOSAL';
  relatedRegulationIds: number[];
  regulationTags: string[];
  gs1ImpactTags: string[];
  sectorTags: string[];
  publishedDate: Date;
}

// Knowledge Embeddings
interface KnowledgeEmbedding {
  id: number;
  sourceType: 'regulation' | 'standard' | 'esrs_datapoint' | 'dutch_initiative';
  sourceId: number;
  content: string;
  contentHash: string;
  embedding: number[]; // 1536-dim vector
  title: string;
  url: string;
}
```

### Relationships

```
regulations (1) ──< (N) regulation_esrs_mappings (N) >── (1) esrs_datapoints
regulations (1) ──< (N) hub_news.relatedRegulationIds (array)
regulations (1) ──< (N) knowledge_embeddings (sourceType='regulation')
gs1_standards (1) ──< (N) knowledge_embeddings (sourceType='standard')
esrs_datapoints (1) ──< (N) knowledge_embeddings (sourceType='esrs_datapoint')
```

---

## Integration Contracts

### Inter-Capability Dependencies

```
ASK_ISA depends on:
  - KNOWLEDGE_BASE (embeddings for retrieval)
  - CATALOG (regulation/standard metadata)

NEWS_HUB depends on:
  - CATALOG (regulation tagging)
  - ESRS_MAPPING (GS1 impact analysis)

KNOWLEDGE_BASE depends on:
  - CATALOG (source data)
  - ESRS_MAPPING (ESRS datapoints)

CATALOG depends on:
  - None (standalone)

ESRS_MAPPING depends on:
  - CATALOG (regulations, standards)

ADVISORY depends on:
  - ALL capabilities (data aggregation)
```

### Shared Data Models

All capabilities share:
- `regulations` table
- `gs1_standards` table
- `esrs_datapoints` table
- `users` table (authentication)

### Event Contracts

No event-driven architecture currently. All interactions are synchronous via tRPC.

### API Contracts

All capabilities expose tRPC procedures:
- Type-safe with Zod validation
- Authenticated via Manus OAuth
- Rate-limited (100 req/user/hour)

---

## Infrastructure

### Hosting

- **Platform**: Manus Cloud
- **Environment**: Production + Staging
- **Deployment**: GitHub Actions CI/CD

### Database

- **Provider**: TiDB Cloud (MySQL-compatible)
- **Connection Pool**: 10 connections
- **SSL/TLS**: Required
- **Backups**: Automated daily

### Authentication

- **Provider**: Manus OAuth
- **Flow**: Authorization Code + PKCE
- **Tokens**: JWT with 1-hour expiry
- **Roles**: user, admin

### Monitoring

- **Logs**: Manus platform logs
- **Metrics**: Custom tRPC middleware
- **Alerts**: Scraper health monitoring
- **Observability**: Pipeline execution logs

---

## Security

### Authentication & Authorization

- All endpoints require Manus OAuth
- Admin endpoints require `role='admin'`
- Rate limiting: 100 requests/user/hour
- CORS: Restricted to allowed origins

### Data Protection

- Database: SSL/TLS encryption in transit
- Secrets: Environment variables (not in Git)
- API Keys: Manus Forge API key (encrypted)
- User Data: GDPR-compliant (EU hosting)

### Input Validation

- All tRPC inputs validated with Zod schemas
- SQL injection: Prevented by Drizzle ORM
- XSS: React auto-escaping + CSP headers
- CSRF: SameSite cookies + CORS

---

## Performance

### Response Times

- **ASK_ISA**: <5s (90th percentile)
- **NEWS_HUB**: <2s (catalog browsing)
- **CATALOG**: <1s (list queries)
- **ESRS_MAPPING**: <3s (mapping queries)
- **ADVISORY**: Async (background generation)

### Scalability

- **Database**: TiDB auto-scaling
- **API**: Horizontal scaling via Manus
- **Caching**: None currently (future: Redis)
- **CDN**: Manus CDN for static assets

### Optimization

- Database indexes on all foreign keys
- Embedding search: Top-K retrieval (K=5)
- News pipeline: Batch processing
- Advisory generation: Async jobs

---

## Deployment

### Build Process

```bash
# Frontend
cd client && pnpm build  # Vite → dist/client/

# Backend
pnpm build  # esbuild → dist/index.js

# Combined
pnpm build  # Builds both
```

### Deployment Steps

1. Run tests: `pnpm test`
2. Build: `pnpm build`
3. Push to GitHub
4. CI/CD triggers deployment
5. Manus deploys to production
6. Smoke tests run automatically

### Environment Variables

Required:
- `DATABASE_URL` - TiDB connection string
- `OPENAI_API_KEY` - Manus Forge API key
- `MANUS_OAUTH_CLIENT_ID` - OAuth client ID
- `MANUS_OAUTH_CLIENT_SECRET` - OAuth secret
- `CRON_SECRET` - Cron job authentication

---

## Operational Procedures

### Daily Operations

- **02:00 UTC**: News pipeline runs (automated)
- **Daily**: Scraper health monitoring
- **Weekly**: Knowledge base regeneration (manual)
- **Monthly**: Advisory report generation (manual)

### Monitoring

- **Scraper Health**: 100% target, 95% acceptable
- **API Uptime**: 99.9% target
- **Database**: Connection pool monitoring
- **Errors**: Logged to Manus platform

### Incident Response

1. Check Manus platform logs
2. Review scraper health dashboard
3. Verify database connectivity
4. Check external API status (OpenAI)
5. Escalate to Manus support if needed

---

## Development Workflow

### Local Development

```bash
# Install dependencies
pnpm install

# Start dev server (frontend + backend)
pnpm dev

# Run tests
pnpm test

# Type check
pnpm check

# Format code
pnpm format
```

### Testing Strategy

- **Unit Tests**: Business logic, utilities
- **Integration Tests**: tRPC routers, database
- **E2E Tests**: None currently (future)
- **Coverage**: 90.1% (517/574 passing)

### Code Quality

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint + Prettier
- **Formatting**: Prettier 3.6.2
- **Commits**: Conventional commits

---

## Future Architecture Considerations

### Planned Enhancements

1. **Caching Layer**: Redis for API responses
2. **Event Bus**: Kafka for async workflows
3. **Search**: Elasticsearch for full-text search
4. **Analytics**: Dedicated analytics database
5. **CDN**: CloudFront for static assets

### Scalability Roadmap

1. **Phase 1**: Horizontal API scaling (current)
2. **Phase 2**: Database read replicas
3. **Phase 3**: Microservices decomposition
4. **Phase 4**: Event-driven architecture

### Technical Debt

- No caching layer (all queries hit database)
- No async job queue (advisory generation blocks)
- No full-text search (limited to SQL LIKE)
- No E2E tests (manual testing only)
- Limited observability (no APM)

---

## Appendix: Technology Decisions

### Why tRPC?

- Type-safe API without code generation
- Automatic TypeScript inference
- Built-in Zod validation
- Excellent DX for full-stack TypeScript

### Why Drizzle ORM?

- Type-safe SQL queries
- Zero runtime overhead
- Excellent TypeScript support
- MySQL/TiDB compatibility

### Why TiDB?

- MySQL-compatible (easy migration)
- Horizontal scalability
- ACID transactions
- Managed service (low ops burden)

### Why Manus Hosting?

- Integrated OAuth
- Built-in CI/CD
- EU data residency
- Low operational overhead

---

**Document Status**: AUTHORITATIVE  
**Last Updated**: 2026-02-12  
**Next Review**: After Phase 3 completion
