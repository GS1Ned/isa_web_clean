# ISA Architecture Documentation

**Last Updated:** December 10, 2025  
**Version:** c8b3a6a2

## System Overview

ISA (Intelligent Standards Architect) is a full-stack web application that bridges EU sustainability regulations with GS1 supply chain standards through AI-powered analysis and semantic search.

### Core Mission

Enable organizations to quickly understand which GS1 standards and data attributes are required for compliance with rapidly evolving EU regulations (CSRD, EUDR, DPP, ESRS).

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
- **Semantic Matching:** LLM-based relevance scoring (0-10 scale)
- **Embedding Alternative:** Direct LLM scoring instead of vector embeddings

### Infrastructure
- **Deployment:** Manus platform (managed)
- **Database:** TiDB Cloud (serverless MySQL)
- **File Storage:** S3-compatible object storage
- **CI/CD:** Automated via Manus checkpoints

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Tailwind)              │
│  - Navigation Menu                                          │
│  - ESG Hub (Regulations, Standards, ESRS, Dutch Initiatives)│
│  - Ask ISA (RAG-powered Q&A)                                │
│  - Admin Panel (Knowledge Base Manager, Analytics)          │
└─────────────────────────────────────────────────────────────┘
                            ↕ tRPC (type-safe RPC)
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express + tRPC)                 │
│  - routers.ts: Main tRPC router                             │
│  - routers/ask-isa.ts: RAG Q&A procedures                   │
│  - db.ts: Database query helpers                            │
│  - embedding.ts: LLM-based semantic matching                │
└─────────────────────────────────────────────────────────────┘
                            ↕ Drizzle ORM
┌─────────────────────────────────────────────────────────────┐
│                    Database (TiDB/MySQL)                    │
│  - Regulations (35 EU regulations)                          │
│  - GS1 Standards (60 standards)                             │
│  - ESRS Datapoints (1,184 disclosure requirements)          │
│  - Dutch Initiatives (10 national programs)                 │
│  - News Hub (hub_news, hub_news_history tables)             │
│  - Knowledge Embeddings (155 semantic chunks)               │
│  - Q&A Conversations (chat history)                         │
└─────────────────────────────────────────────────────────────┘
                            ↕ External APIs
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
│  - Manus Forge API (LLM for Q&A and relevance scoring)      │
│  - Manus OAuth (authentication)                             │
│  - S3 Storage (file uploads, future use)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features

### 1. ESG Hub - Regulation Explorer
**Path:** `/hub/regulations`

- Browse 35 EU regulations with AI-enhanced descriptions
- View regulation details with ESRS datapoint mappings
- Filter by category, status, and applicability
- See GS1 standards relevant to each regulation

### 2. GS1 Standards Catalog
**Path:** `/hub/standards` (planned)

- 60 GS1 standards (GTIN, GLN, Digital Link, EPCIS, etc.)
- Mapped to relevant EU regulations
- Attribute-level compliance requirements

### 3. ESRS Datapoints
**Path:** `/hub/esrs-datapoints`

- 1,184 EFRAG disclosure requirements
- Mapped to EU regulations (449 AI-generated mappings)
- Searchable by standard, topic, and requirement type

### 4. Dutch Initiatives
**Path:** `/hub/dutch-initiatives`

- 10 national compliance programs (UPV Textiel, Green Deal Zorg, etc.)
- Sector-specific filtering (Textiles, Healthcare, Construction, Packaging)
- Integration with EU regulations and GS1 standards

### 4.5. News Hub - ESG Intelligence Layer
**Path:** `/hub/news`

- Automated news aggregation from EU, GS1, and Dutch/Benelux sources
- AI-powered enrichment (regulation tagging, GS1 impact analysis, sector classification)
- News detail pages with actionable insights and suggested actions
- Bidirectional navigation (news ↔ regulations)
- Timeline visualization showing regulation milestones + related news
- Multi-regulation comparison tool (2-4 regulations side-by-side)
- Source types: EU Official Journal, GS1 Standards News, Dutch national initiatives

### 5. Ask ISA - RAG-Powered Q&A
**Path:** `/ask`

- Natural language questions about regulations and standards
- LLM-based semantic search across 155 knowledge chunks
- Source citations with relevance scores (0-100%)
- Conversation history and follow-up questions

### 6. Admin Knowledge Base Manager
**Path:** `/admin/knowledge-base`

- Generate searchable knowledge chunks from existing data
- Monitor coverage statistics (regulations, standards, ESRS, initiatives)
- One-click embedding generation per source type
- Progress tracking and error reporting

### 7. Timeline Visualization
**Path:** `/hub/regulations/:id` (Timeline tab)

- Chronological display of regulation milestones and related news
- Interactive filtering by event type (milestones/news) and time period
- Color-coded event markers (completed/upcoming/future)
- Direct navigation to news detail pages

### 8. Multi-Regulation Comparison
**Path:** `/hub/regulations/compare`

- Side-by-side comparison of 2-4 regulations
- Overlapping event detection and highlighting
- URL state management for shareable comparisons
- Responsive grid layout adapting to number of selected regulations

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
Scheduled Cron Job (daily)
    ↓
1. Web Scraping (Playwright)
   - EUR-Lex Official Journal
   - GS1 Standards News
   - Green Deal Zorg (Dutch healthcare)
   - Zero-Emission Zones (Dutch logistics)
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
    ↓
5. Storage & Versioning
   - Insert into hub_news table
   - Archive previous version to hub_news_history
   - Update timestamps
    ↓
News Hub UI displays enriched articles
```

---

## Security & Authentication

### Manus OAuth Flow
1. User clicks "Login" → Redirects to Manus OAuth portal
2. User authenticates → OAuth server returns to `/api/oauth/callback`
3. Backend validates token → Creates session cookie (JWT)
4. Frontend reads session → `useAuth()` hook provides user state

### Protected Routes
- **Public:** Home, ESG Hub, Regulations, Standards, Ask ISA
- **Protected:** Dashboard, Admin Panel, Knowledge Base Manager
- **Admin-only:** Analytics, Prompt Optimization, Ingestion Tools

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
- **Database Indexing:** Indexes on frequently queried fields
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

### Environment Variables
All secrets managed via Manus platform:
- `DATABASE_URL` - TiDB connection string
- `JWT_SECRET` - Session signing key
- `BUILT_IN_FORGE_API_KEY` - LLM API access
- `OAUTH_SERVER_URL` - Manus OAuth endpoint

---

## Future Architecture Considerations

### Scalability
- **Vector Embeddings:** Migrate to proper vector DB when Manus adds embeddings API
- **Caching Layer:** Add Redis for frequently accessed data
- **CDN:** Serve static assets via CDN for global performance

### Automation
- **EUR-Lex Crawler:** Automated ingestion of new regulations
- **EFRAG XBRL Parser:** Auto-update ESRS datapoints from official sources
- **Change Monitoring:** Track regulation amendments and notify users

### Advanced Features
- **Multi-language Support:** Translate regulations and standards
- **Export to PDF:** Generate compliance reports
- **API Access:** Public API for third-party integrations
- **Blockchain Integration:** Digital Product Passport verification

---

## Maintenance

### Regular Tasks
- **Weekly:** Review Ask ISA Q&A quality and update knowledge base
- **Monthly:** Check for new regulations and standards
- **Quarterly:** Audit AI-generated mappings for accuracy

### Monitoring
- **Health Checks:** TypeScript compilation, LSP errors, build status
- **Analytics:** Track page views, Ask ISA usage, popular questions
- **Error Tracking:** Monitor console errors and failed API calls

### Documentation
- **Architecture:** This document (update after major changes)
- **Data Model:** `DATA_MODEL.md` (update after schema changes)
- **Ingestion:** `INGESTION.md` (update after pipeline changes)
- **Roadmap:** `ROADMAP.md` (update monthly)

---

## Contact & Support

**Project Owner:** GS1 Netherlands  
**Development:** Manus AI Platform  
**Last Major Update:** December 10, 2025 (News Hub with Dutch sources, Timeline visualization, Multi-regulation comparison)
