# ISA Strategic Context Synthesis

**Intelligent Standards Architect (ISA) — Architecture, Data Assets, and Strategic Decisions**

*Version 1.0 — January 2026*

---

## Executive Summary

The Intelligent Standards Architect (ISA) has evolved from an initial MVP into a comprehensive ESG-GS1 intelligence platform serving GS1 Netherlands and the broader Benelux region. This document synthesizes the architectural foundations, data assets, key design decisions, and strategic direction to provide continuity for future development and stakeholder alignment.

ISA now comprises **85 frontend pages**, **43 backend routers**, and **140+ documentation files**, processing data from **11 canonical database tables** containing over **5,600 records** of standards, regulations, and compliance mappings.

---

## 1. Architectural Overview

### 1.1 Technology Stack

ISA is built on a modern, type-safe full-stack architecture optimized for rapid iteration and maintainability:

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19 + TypeScript | Component-based UI with hooks |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Utility-first design system |
| **API Layer** | tRPC 11 | End-to-end type-safe RPC |
| **Backend** | Express 4 + Node.js | Server runtime |
| **Database** | MySQL/TiDB + Drizzle ORM | Relational data with type inference |
| **AI Integration** | OpenAI API (via Manus Forge) | LLM-powered analysis |
| **Authentication** | Manus OAuth | Session-based auth with role support |

### 1.2 Core Modules

The system is organized into functional domains:

**Knowledge Hub** — Central repository for regulations, standards, and their mappings. Includes ESRS datapoints, GS1 standards catalog, GDSN attributes, and cross-reference tables.

**News Intelligence** — Automated pipeline ingesting EU/GS1 official sources, AI-enriched with impact analysis, GS1 relevance tags, and actionable recommendations.

**Compliance Tools** — Gap analyzer, impact simulator, compliance roadmap generator, and scoring engine for organizational readiness assessment.

**EPCIS Suite** — Supply chain event management including upload, validation, visualization, and EUDR geolocation mapping.

**Ask ISA** — RAG-powered conversational interface with citation-backed responses from the knowledge base.

**Admin Console** — Pipeline management, news curation, analytics dashboards, and system monitoring.

---

## 2. Data Asset Inventory

### 2.1 Canonical Database Tables

ISA maintains 11 primary data tables representing the core knowledge model:

| Table | Records | Description |
|-------|---------|-------------|
| `esrs_datapoints` | 1,175 | ESRS disclosure requirements with XBRL mappings |
| `gdsn_classes` | 4,293 | GS1 GDSN product classification hierarchy |
| `gdsn_class_attributes` | 4,293 | Attribute definitions per GDSN class |
| `ctes` | 50 | Critical Tracking Events for supply chain |
| `kdes` | 50 | Key Data Elements linked to CTEs |
| `dpp_identification_rules` | 26 | Digital Product Passport identifier rules |
| `dpp_identifier_components` | 26 | DPP identifier structure definitions |
| `cbv_vocabularies` | 84 | Core Business Vocabulary terms |
| `digital_link_types` | 84 | GS1 Digital Link resolver types |
| `hub_news` | ~200+ | AI-enriched regulatory news articles |
| `knowledge_embeddings` | ~5,000+ | Vector embeddings for RAG retrieval |

### 2.2 Dataset Registry

The dataset registry (v1.4.0) tracks all ingested data sources with provenance metadata:

**GS1 Reference Portal Bundle** (352 documents) — Authoritative snapshot from ref.gs1.org including 228 HTML pages, 92 PDFs, 67 XML schemas, and 52 JSON-LD files covering EPCIS, CBV, Digital Link, and GDSN specifications.

**ESRS XBRL Taxonomy** — Complete European Sustainability Reporting Standards datapoint catalog with disclosure requirement mappings.

**GS1 EU GDSN Carbon Footprint Guideline** — 9 attributes and 28 code values for product carbon footprint data exchange.

**Dutch Initiatives Corpus** — Green Deal Healthcare, Zero-Emission Logistics (ZES), and sector-specific sustainability programs.

### 2.3 Data Lineage

All datasets include:
- SHA256 checksums for integrity verification
- Canonical domain tags (e.g., `GS1_Standards`, `EPCIS`, `ESRS`)
- Source URLs and retrieval timestamps
- Version history and changelog entries

---

## 3. Key Design Decisions

### 3.1 GS1-Centric Intelligence Model

**Decision:** Position ISA as a GS1-first platform rather than a generic ESG tool.

**Rationale:** GS1 Netherlands members need to understand how regulations impact their existing data infrastructure. By mapping every regulation to specific GS1 standards (GTIN, GDSN, EPCIS, Digital Link), ISA provides actionable guidance rather than abstract compliance checklists.

**Implementation:** 
- `gs1ImpactTags` field on news articles (12 tags: `IDENTIFICATION`, `TRACEABILITY`, `DPP`, etc.)
- `relatedStandardIds` linking news to specific GS1 standard records
- AI prompts explicitly trained to identify GS1 relevance

### 3.2 AI-Enriched News Pipeline

**Decision:** Use LLM processing for every news article rather than keyword-only classification.

**Rationale:** Regulatory news requires nuanced interpretation. A headline about "supply chain due diligence" might affect EPCIS, GDSN, or both depending on context. LLM analysis captures these subtleties.

**Implementation:**
- `gs1ImpactAnalysis` — 2-3 sentence explanation of GS1 relevance
- `suggestedActions` — 2-4 actionable steps for GS1 users
- Fallback heuristics when LLM unavailable (keyword matching)
- Comprehensive test suite validating AI output quality

### 3.3 Bidirectional Navigation

**Decision:** News and regulations should reference each other bidirectionally.

**Rationale:** Users arriving at a regulation page should see recent developments. Users reading news should understand which regulations are affected.

**Implementation:**
- Regulation detail pages include "Recent Developments" panels
- News detail pages show related regulations and standards
- Cross-linking via `regulationTags` and `relatedStandardIds`

### 3.4 Sector-Aware Filtering

**Decision:** Support sector-specific views throughout the platform.

**Rationale:** A food manufacturer has different compliance priorities than a healthcare supplier. Sector filtering reduces noise and increases relevance.

**Implementation:**
- `sectorTags` field (12 sectors: `Food`, `Healthcare`, `Retail`, etc.)
- Filter controls on News Hub and compliance tools
- Sector-aware scoring in compliance assessments

### 3.5 Observable Operations

**Decision:** All automated processes must be monitorable and manually triggerable.

**Rationale:** Black-box automation creates operational risk. Admins need visibility into pipeline health, execution logs, and the ability to intervene.

**Implementation:**
- `/admin/news-pipeline` dashboard with execution controls
- `pipeline_execution_log` table tracking all runs
- Scraper health monitoring at `/admin/scraper-health`
- System monitoring dashboard at `/admin/monitoring`

---

## 4. News Intelligence Architecture

### 4.1 Pipeline Components

The news pipeline consists of modular, testable components:

```
news-sources.ts          → Source configuration and credentials
news-fetcher.ts          → Multi-source RSS/API ingestion
news-scraper-*.ts        → Site-specific scrapers (EFRAG, GS1.nl)
news-deduplicator.ts     → Cross-source deduplication
news-ai-processor.ts     → LLM enrichment (tags, analysis, actions)
news-content-analyzer.ts → Topic extraction and classification
news-recommendation-engine.ts → Related content linking
news-archival.ts         → 200-day retention window management
news-cron-scheduler.ts   → Scheduled execution
```

### 4.2 AI Processing Schema

Each news article receives structured AI enrichment:

```typescript
{
  summary: string;           // 2-3 sentence summary
  impactLevel: "LOW" | "MEDIUM" | "HIGH";
  regulationTags: string[];  // ["CSRD", "EUDR", ...]
  gs1ImpactTags: string[];   // ["TRACEABILITY", "DPP", ...]
  sectorTags: string[];      // ["Food", "Healthcare", ...]
  gs1ImpactAnalysis: string; // GS1-specific relevance explanation
  suggestedActions: string[]; // Actionable steps for GS1 users
}
```

### 4.3 Source Coverage

| Source Type | Examples | Status |
|-------------|----------|--------|
| EU Official | EUR-Lex, EFRAG, EC DG Environment | ✅ Active |
| GS1 Official | GS1.org, GS1.nl, GS1 Europe | ✅ Active |
| Dutch National | RVO, Government.nl | ✅ Active |
| Industry | Sector associations, trade publications | 🔄 Partial |

---

## 5. Ask ISA (RAG System)

### 5.1 Architecture

Ask ISA implements Retrieval-Augmented Generation with citation support:

1. **Query Processing** — User question analyzed for intent and keywords
2. **Vector Retrieval** — Relevant chunks retrieved from `knowledge_embeddings`
3. **Context Assembly** — Top-k chunks assembled with source metadata
4. **LLM Generation** — Response generated with inline citations
5. **Citation Rendering** — Sources displayed with links to original documents

### 5.2 Knowledge Sources

The RAG system indexes:
- GS1 Reference Portal documents (352 files)
- ESRS datapoint descriptions
- Regulation summaries and guidance documents
- News article content and AI analyses

### 5.3 Prompt Engineering

The v2.0 prompt system uses modular context injection:

```typescript
interface AskISAContextParams {
  question: string;
  relevantChunks: ChunkWithMetadata[];
  userContext?: { sector?: string; role?: string };
  conversationHistory?: Message[];
}
```

---

## 6. Compliance Tools

### 6.1 Gap Analyzer

Identifies gaps between current GS1 data capabilities and regulatory requirements:
- Input: Organization profile, data maturity assessment
- Output: Gap list with severity, affected regulations, remediation steps

### 6.2 Impact Simulator

Models the effect of regulatory changes on GS1 data requirements:
- Input: Regulation selection, implementation timeline
- Output: Affected data elements, system changes, cost estimates

### 6.3 Compliance Roadmap

Generates prioritized implementation plans:
- Input: Gap analysis results, resource constraints
- Output: Phased roadmap with milestones, dependencies, effort estimates

### 6.4 Scoring Engine

Quantifies organizational compliance readiness:
- Dimensions: Data completeness, process maturity, system integration
- Benchmarking against sector peers

---

## 7. EPCIS Suite

### 7.1 Event Management

- **Upload** — Drag-and-drop EPCIS XML/JSON with validation
- **Visualization** — Supply chain event timeline and flow diagrams
- **Batch Processing** — Bulk event ingestion with progress tracking

### 7.2 EUDR Geolocation

Specialized tooling for EU Deforestation Regulation compliance:
- Geolocation data capture and validation
- Plot boundary mapping
- Due diligence statement generation

---

## 8. Frontend Architecture

### 8.1 Page Organization

| Category | Pages | Examples |
|----------|-------|----------|
| Public | 15 | Home, Features, Use Cases, FAQ |
| Hub | 12 | Regulations, News, Standards, Calendar |
| Tools | 10 | Gap Analyzer, Roadmap, Scanner |
| EPCIS | 4 | Upload, Supply Chain, EUDR Map |
| Admin | 12 | News Pipeline, Analytics, Monitoring |
| Auth | 3 | Login, Profile, Settings |

### 8.2 Component Library

ISA uses shadcn/ui components with custom extensions:
- `NewsCard` / `NewsCardCompact` — News display variants
- `RecommendedResources` — Related content panels
- `DashboardLayout` — Admin interface shell
- `AIChatBox` — Conversational interface component
- `Map` — Google Maps integration with proxy auth

### 8.3 State Management

- **Server State** — tRPC queries with React Query caching
- **Auth State** — `useAuth()` hook with session persistence
- **UI State** — Local component state, URL params for filters

---

## 9. Testing Strategy

### 9.1 Unit Tests

Vitest-based unit tests cover:
- AI processor output validation
- Database helper functions
- Tag inference heuristics
- Deduplication logic

### 9.2 Test Coverage

Current test suite: **21 tests** across news pipeline components
- CSRD news processing with GS1 analysis
- DPP news processing with relevant tags
- Fallback processing when LLM fails
- Tag inference accuracy validation

---

## 10. Operational Considerations

### 10.1 Scheduled Tasks

| Task | Schedule | Purpose |
|------|----------|---------|
| News Pipeline | Daily 06:00 UTC | Ingest and process new articles |
| Archival | Weekly | Remove articles older than 200 days |
| Embedding Refresh | On-demand | Update RAG index after content changes |

### 10.2 Monitoring

- Pipeline execution logs with success/failure tracking
- Scraper health dashboard with source availability
- System metrics (response times, error rates)

### 10.3 Cost Management

- LLM calls batched and cached where possible
- Embedding generation uses efficient chunking
- News pipeline processes only new/changed articles

---

## 11. Future Roadmap

### 11.1 Near-Term (Q1 2026)

- [ ] Surface AI capabilities more prominently in UI
- [ ] Expand Dutch/Benelux source coverage
- [ ] Add GS1 standard update notifications
- [ ] Implement user preference persistence

### 11.2 Medium-Term (Q2-Q3 2026)

- [ ] Multi-language support (Dutch, German, French)
- [ ] Advanced compliance scoring with benchmarking
- [ ] Integration with GS1 Data Quality tools
- [ ] Mobile-responsive dashboard redesign

### 11.3 Long-Term (2026+)

- [ ] Real-time regulatory change alerts
- [ ] Predictive compliance risk modeling
- [ ] API access for enterprise integration
- [ ] White-label deployment options

---

## 12. Appendix: Key File Locations

```
/home/ubuntu/isa_web/
├── client/src/
│   ├── pages/              # 85 page components
│   ├── components/         # Reusable UI components
│   └── lib/trpc.ts         # tRPC client binding
├── server/
│   ├── routers.ts          # Main tRPC router
│   ├── routers/            # 43 feature routers
│   ├── db.ts               # Database helpers
│   └── news-*.ts           # News pipeline modules
├── drizzle/
│   └── schema.ts           # Database schema (11 canonical tables)
├── data/metadata/
│   └── dataset_registry.json  # Data asset inventory
└── docs/                   # 140+ documentation files
```

---

*Document generated by Manus AI — January 2026*
*For questions or updates, contact the ISA development team.*
