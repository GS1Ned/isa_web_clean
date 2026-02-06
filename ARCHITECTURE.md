# ISA Architecture Documentation

**Last Updated:** 2025-12-17  
**Version:** Phase 9 Consolidation  
**Status:** Current State Only (No Future Plans)

---

## System Overview

ISA (Intelligent Standards Architect) is a full-stack web application that connects EU sustainability regulations with GS1 supply chain standards through AI-powered analysis and semantic search. The system operates under strict Lane C governance constraints that prioritize data integrity, citation accuracy, and user authority.

### Core Mission

Enable GS1 Netherlands members to understand which GS1 standards and data attributes are required for compliance with EU regulations (CSRD, EUDR, DPP, ESRS) through structured mappings, versioned advisory outputs, and AI-assisted Q&A.

---

## Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui components
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** React Query (via tRPC)
- **Build Tool:** Vite

### Backend
- **Runtime:** Node.js 22 + TypeScript
- **API Layer:** tRPC 11 (type-safe RPC)
- **Web Server:** Express 4
- **Database:** TiDB (MySQL-compatible)
- **ORM:** Drizzle ORM
- **Authentication:** Manus OAuth

### AI/ML Services
- **LLM API:** Manus Forge API (OpenAI-compatible)
- **Models:** GPT-4 (advisory, Q&A) + text-embedding-3-small (semantic search)
- **Semantic Matching:** LLM-based relevance scoring (0-10 scale)

### Infrastructure
- **Deployment:** Manus platform (managed)
- **Database:** TiDB Cloud (serverless MySQL)
- **File Storage:** S3-compatible object storage
- **Version Control:** GitHub (gs1-isa/isa)
- **CI/CD:** GitHub Actions + Manus checkpoints

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Tailwind)              │
│  - Navigation Menu                                          │
│  - ESG Hub (Regulations, Standards, ESRS, Dutch Initiatives)│
│  - News Hub (Timeline, Comparison, GS1 Impact Analysis)     │
│  - Ask ISA (RAG-powered Q&A with citations)                 │
│  - Admin Panel (Knowledge Base, Analytics, Pipeline Mgmt)   │
└─────────────────────────────────────────────────────────────┘
                            ↕ tRPC (type-safe RPC)
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express + tRPC)                 │
│  - routers.ts: Main tRPC router                             │
│  - routers/ask-isa.ts: RAG Q&A procedures                   │
│  - routers/news-hub.ts: News ingestion & enrichment         │
│  - routers/advisory.ts: Advisory report generation          │
│  - db.ts: Database query helpers                            │
│  - embedding.ts: LLM-based semantic matching                │
└─────────────────────────────────────────────────────────────┘
                            ↕ Drizzle ORM
┌─────────────────────────────────────────────────────────────┐
│                    Database (TiDB/MySQL)                    │
│  - Regulations (38 EU regulations)                          │
│  - GS1 Standards (60+ standards)                            │
│  - ESRS Datapoints (1,184 disclosure requirements)          │
│  - Dutch Initiatives (10 national programs)                 │
│  - News Hub (hub_news, hub_news_history, recommendations)   │
│  - Knowledge Embeddings (155 semantic chunks)               │
│  - Advisory Reports (versioned outputs)                     │
│  - Q&A Conversations (chat history)                         │
│  - Pipeline Observability (execution logs, metrics)         │
└─────────────────────────────────────────────────────────────┘
                            ↕ External APIs
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
│  - Manus Forge API (LLM for Q&A and relevance scoring)      │
│  - Manus OAuth (authentication)                             │
│  - S3 Storage (file uploads)                                │
│  - Playwright (web scraping)                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features (Current State)

### 1. ESG Hub - Regulation Explorer
**Path:** `/hub/regulations`

Browse 38 EU regulations with AI-enhanced descriptions, view regulation details with ESRS datapoint mappings, filter by category/status/applicability, and see GS1 standards relevant to each regulation.

### 2. GS1 Standards Catalog
**Path:** `/hub/standards`

60+ GS1 standards (GTIN, GLN, Digital Link, EPCIS, etc.) mapped to relevant EU regulations with attribute-level compliance requirements.

### 3. ESRS Datapoints
**Path:** `/hub/esrs-datapoints`

1,184 EFRAG disclosure requirements mapped to EU regulations (449 AI-generated mappings), searchable by standard, topic, and requirement type.

### 4. Dutch Initiatives
**Path:** `/hub/dutch-initiatives`

10 national compliance programs (UPV Textiel, Green Deal Zorg, etc.) with sector-specific filtering (Textiles, Healthcare, Construction, Packaging) integrated with EU regulations and GS1 standards.

### 5. News Hub - ESG Intelligence Layer
**Path:** `/hub/news`

Automated news aggregation from 7 sources (EU, GS1, Dutch/Benelux) with AI-powered enrichment (regulation tagging, GS1 impact analysis, sector classification). Features include news detail pages with actionable insights, bidirectional navigation (news ↔ regulations), timeline visualization, and multi-regulation comparison tool (2-4 regulations side-by-side).

### 6. Ask ISA - RAG-Powered Q&A
**Path:** `/ask`

Natural language questions about regulations and standards with LLM-based semantic search across 155 knowledge chunks, mandatory source citations with relevance scores (0-100%), conversation history, and query guardrails (6 allowed types, 5 forbidden types).

### 7. Admin Knowledge Base Manager
**Path:** `/admin/knowledge-base`

Generate searchable knowledge chunks from existing data, monitor coverage statistics (regulations, standards, ESRS, initiatives), one-click embedding generation per source type, progress tracking and error reporting.

### 8. Admin Pipeline Observability
**Path:** `/admin/pipeline-observability`

Structured logging for news ingestion, AI processing quality metrics (summary coherence, tag accuracy, citation completeness), source reliability tracking, and comprehensive execution dashboards.

### 9. Admin Coverage Analytics
**Path:** `/admin/coverage-analytics`

News distribution insights across regulations, sectors, sources, and GS1 impact areas with interactive visualizations (Recharts), coverage gap identification, and monthly trend analysis.

### 10. Timeline Visualization
**Path:** `/hub/regulations/:id` (Timeline tab)

Chronological display of regulation milestones and related news with interactive filtering by event type (milestones/news) and time period, color-coded event markers (completed/upcoming/future), and direct navigation to news detail pages.

### 11. Multi-Regulation Comparison
**Path:** `/hub/regulations/compare`

Side-by-side comparison of 2-4 regulations with overlapping event detection and highlighting, URL state management for shareable comparisons, and responsive grid layout.

### 12. Advisory System
**Path:** `/admin/advisory` (Lane C restricted)

Versioned advisory outputs (v1.0, v1.1) with full dataset provenance tracking, advisory diff computation, GS1-to-ESRS mapping engine, and compliance roadmap generation. All outputs subject to Lane C review before publication.

---

## Data Flow

### Ask ISA RAG Pipeline

```
User Question
    ↓
1. LLM Relevance Scoring
   - Score each knowledge chunk (0-10) against question
   - Parallel processing for speed
    ↓
2. Top-K Selection
   - Select 5 most relevant chunks
   - Include source metadata (type, title, URL, similarity)
    ↓
3. Context Building
   - Concatenate relevant chunks
   - Add system prompt with instructions
    ↓
4. LLM Answer Generation
   - Generate answer using context
   - Include [Source N] citations
    ↓
5. Response Formatting
   - Parse citations
   - Attach source cards with links
   - Store conversation in database
    ↓
User receives answer with clickable sources
```

### Knowledge Base Generation

```
Admin triggers generation for source type
    ↓
1. Fetch all records from database
   - Regulations, Standards, ESRS, or Dutch Initiatives
    ↓
2. Prepare content for storage
   - Extract title, description, key attributes
   - Generate content hash (SHA-256)
   - Create searchable text chunk
    ↓
3. Store in knowledge_embeddings table
   - Deduplicate by content hash
   - Store metadata (source type, ID, title, URL)
    ↓
4. Return statistics
   - Total processed, succeeded, failed
   - Coverage percentage
```

### News Hub Ingestion & Enrichment Pipeline

```
Scheduled Cron Job (daily at 02:00 UTC)
    ↓
1. Web Scraping (Playwright)
   - EUR-Lex Official Journal
   - EFRAG Updates
   - GS1 Global Standards News
   - GS1 Europe News
   - Green Deal Zorg (Dutch healthcare)
   - Zero-Emission Zones (Dutch logistics)
   - GS1 Netherlands News
    ↓
2. Content Extraction
   - Title, summary, date, URL
   - HTML to markdown conversion
   - Source metadata
    ↓
3. Deduplication
   - Check existing by URL
   - Compare content hashes
   - Update if changed, skip if identical
    ↓
4. AI Enrichment (LLM)
   - Regulation tagging (CSRD, PPWR, ESPR, etc.)
   - GS1 impact analysis (traceability, data quality, etc.)
   - Sector classification (retail, healthcare, logistics, etc.)
   - Impact level assessment (HIGH/MEDIUM/LOW)
   - Suggested actions generation
   - Quality scoring (0.0-1.0 composite metric)
    ↓
5. Storage & Versioning
   - Insert into hub_news table
   - Archive previous version to hub_news_history
   - Update timestamps
   - Log execution metrics to pipeline_execution_log
    ↓
News Hub UI displays enriched articles
```

### Advisory Report Generation (Lane C Restricted)

```
Admin triggers advisory generation
    ↓
1. Governance Check
   - Verify Lane C authorization
   - Log escalation request
    ↓
2. Data Collection
   - Fetch target regulations
   - Fetch target GS1 standards
   - Fetch ESRS datapoints
   - Fetch AI-generated mappings
    ↓
3. Report Assembly
   - Generate executive summary
   - Compile regulation-to-standard mappings
   - Include dataset provenance metadata
   - Calculate coverage statistics
    ↓
4. Version Control
   - Assign version number (v1.0, v1.1, etc.)
   - Store in advisory_reports table
   - Archive previous version to advisory_report_versions
    ↓
5. Review & Publication (Manual)
   - Set reviewStatus to 'pending_review'
   - Await user approval (Lane C)
   - Update publicationStatus after approval
    ↓
Advisory report available for download
```

---

## Security & Authentication

### Manus OAuth Flow

1. User clicks "Login" → Redirects to Manus OAuth portal
2. User authenticates → OAuth server returns to `/api/oauth/callback`
3. Backend validates token → Creates session cookie (JWT)
4. Frontend reads session → `useAuth()` hook provides user state

### Protected Routes

- **Public:** Home, ESG Hub, Regulations, Standards, Ask ISA, News Hub
- **Protected:** Dashboard, Admin Panel, Knowledge Base Manager
- **Admin-only:** Analytics, Pipeline Observability, Coverage Analytics, Advisory System

### Role-Based Access Control

- **User role:** Standard access to all public features
- **Admin role:** Access to admin panel and management tools
- **Owner:** Full access including system configuration

---

## Performance Optimizations

### Frontend
- **Lazy Loading:** Route-based code splitting for faster initial load
- **tRPC Caching:** React Query caches API responses automatically
- **Optimistic Updates:** Instant UI feedback for mutations
- **Component Memoization:** Prevent unnecessary re-renders

### Backend
- **Database Indexing:** Indexes on frequently queried fields (regulation_id, standard_id, source_type)
- **Content Hash Deduplication:** Avoid storing duplicate knowledge chunks
- **Batch Processing:** Generate embeddings in batches of 10
- **Connection Pooling:** Reuse database connections

### LLM Usage
- **Relevance Scoring:** Batch score multiple documents in parallel
- **Caching:** Store knowledge chunks to avoid re-generating
- **Rate Limiting:** Respect API limits with controlled concurrency

---

## Deployment

### Manus Platform
- **Dev Server:** Hot-reload development environment
- **Checkpoints:** Git-based versioning with screenshots
- **Publish:** One-click deployment to production
- **Rollback:** Instant rollback to previous checkpoints

### GitHub Integration (as of 2025-12-17)
- **Repository:** https://github.com/GS1-ISA/isa
- **Workflow:** Feature branches → Pull requests → CI checks → Merge
- **Sync Cadence:** Minimum once per development day
- **CI/CD:** GitHub Actions for automated testing

### Environment Variables

All secrets managed via Manus platform:
- `DATABASE_URL` - TiDB connection string
- `JWT_SECRET` - Session signing key
- `BUILT_IN_FORGE_API_KEY` - LLM API access (server-side)
- `VITE_FRONTEND_FORGE_API_KEY` - LLM API access (frontend)
- `OAUTH_SERVER_URL` - Manus OAuth endpoint
- `VITE_OAUTH_PORTAL_URL` - Manus login portal URL
- `OWNER_OPEN_ID`, `OWNER_NAME` - Owner metadata
- `CRON_SECRET` - Cron job authentication

---

## Maintenance

### Regular Tasks (Current State)
- **Daily:** Automated news pipeline execution (02:00 UTC)
- **Weekly:** Review Ask ISA Q&A quality and update knowledge base
- **Monthly:** Audit AI-generated mappings for accuracy
- **Quarterly:** Dataset registry review and governance self-checks

### Monitoring (Current State)
- **Health Checks:** TypeScript compilation, LSP errors, build status
- **Pipeline Observability:** Execution logs, AI quality metrics, source reliability
- **Coverage Analytics:** News distribution, regulation coverage, sector gaps
- **Test Suite:** 517/574 tests passing (90.1%)

### Documentation (Current State)
- **Architecture:** This document (update after major changes)
- **Governance:** ISA_GOVERNANCE.md (authoritative framework)
- **Data Model:** DATA_MODEL.md (update after schema changes)
- **News Pipeline:** docs/NEWS_PIPELINE.md (update after pipeline changes)
- **Roadmap:** ROADMAP.md (update monthly)

---

## Known Limitations (as of 2025-12-17)

### Scope Limitations
- **Geographic:** EU regulations + Dutch/Benelux initiatives only
- **Standards:** GS1 standards only (no ISO, UNECE, or other SDOs)
- **Language:** English only (no multi-language support)
- **Temporal:** Datasets verified as of documented `last_verified_date`

### Technical Limitations
- **EPCIS Tools:** Exploratory only, not production-ready
- **Real-time Updates:** News pipeline operates on scheduled intervals (daily)
- **API Access:** Internal use only, no public API
- **Vector Search:** LLM-based relevance scoring instead of proper vector DB

### Data Limitations
- **Coverage Gaps:** CS3D/CSDDD, ESPR delegated acts, sector-specific Green Deals
- **Test Failures:** 57 non-critical test failures (categorized in test-failure-analysis-2025-12-17.md)
- **Advisory Publication:** Lane C review required, no automated publication

---

## Contact & Support

**Project Owner:** GS1 Netherlands  
**Development Agent:** Manus AI  
**Governance Steward:** ISA Executive Steward

**Repository:** https://github.com/GS1-ISA/isa  
**Issues:** https://github.com/GS1-ISA/isa/issues

**Last Major Update:** 2025-12-17 (Phase 9 Consolidation Complete)
