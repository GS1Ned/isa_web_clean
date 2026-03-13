# ISA Project Structure

## Repository Organization

```
isa_web_clean/
├── client/                 # Frontend application (React 19)
├── server/                 # Backend application (Express + tRPC)
├── drizzle/                # Database schema and migrations
├── data/                   # Dataset files and metadata
├── docs/                   # Documentation
├── scripts/                # Automation and utility scripts
├── shared/                 # Shared types and constants
├── config/                 # Configuration files
├── ops/                    # Operations and deployment
├── probes/                 # Health check and diagnostic tools
├── test-results/           # Test output artifacts
└── isa-archive/            # Archived historical content
```

## Core Directories

### `/client` - Frontend Application
React 19 application with TypeScript and Tailwind CSS 4.

**Structure:**
- `src/_core/` - Core utilities and configuration
- `src/components/` - Reusable UI components (shadcn/ui)
- `src/contexts/` - React context providers
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility libraries
- `src/pages/` - Page components (Wouter routing)
- `public/` - Static assets

**Key Technologies:**
- React 19 with TypeScript
- Tailwind CSS 4 + shadcn/ui components
- Wouter for routing
- tRPC client for API communication
- TanStack Query for data fetching

### `/server` - Backend Application
Express 4 server with tRPC 11 API layer.

**Structure:**
- `_core/` - Core server infrastructure (Express, tRPC, auth, logging)
- `routers/` - tRPC router definitions (API endpoints)
- `services/` - Business logic services
- `ingest/` - Data ingestion pipelines
- `news/` - News scraping and processing
- `mappings/` - Regulation-to-standard mapping logic
- `prompts/` - AI prompt templates
- `evaluation/` - RAG evaluation and testing
- `test-helpers/` - Testing utilities
- `utils/` - Server utilities

**Key Files:**
- `_core/index.ts` - Main server entry point
- `routers.ts` - Root tRPC router
- `db.ts` - Database connection and queries
- `embedding.ts` - Vector embedding generation
- `news-pipeline.ts` - News ingestion orchestration

### `/drizzle` - Database Layer
Drizzle ORM schema definitions and migrations.

**Structure:**
- `meta/` - Migration metadata
- `migrations/` - SQL migration files
- `schema*.ts` - Table schema definitions
- `relations.ts` - Table relationships

**Key Schemas:**
- `schema.ts` - Core tables (regulations, standards, knowledge base)
- `schema_news_hub.ts` - News and scraper health
- `schema_advisory_reports.ts` - Advisory system
- `schema_gs1_esrs_mappings.ts` - Mapping tables
- `schema_dataset_registry.ts` - Dataset metadata

### `/data` - Dataset Files
Authoritative data sources and metadata.

**Structure:**
- `metadata/` - Dataset registry and metadata
- `efrag/` - EFRAG ESRS datapoints and taxonomy
- `gs1/` - GS1 standards data
- `gs1nl/` - GS1 Netherlands sector models
- `gs1_ref_corpus/` - GS1 reference documents
- `gs1_web_vocab/` - GS1 WebVoc vocabulary
- `advisories/` - Advisory report versions
- `esg/` - ESG data categories and rules
- `cbv/` - EPCIS CBV vocabularies
- `digital_link/` - GS1 Digital Link data
- `dpp-content/` - Digital Product Passport content

**Key Files:**
- `metadata/dataset_registry.json` - Canonical dataset registry (v1.4.0)
- `efrag/esrs_datapoints_efrag_ig3.json` - 1,184 ESRS datapoints
- `gs1_web_vocab/gs1Voc.jsonld` - GS1 vocabulary (4,373 terms)

### `/docs` - Documentation
Comprehensive project documentation.

**Structure:**
- `governance/_root/` - Governance framework (ISA_GOVERNANCE.md)
- `planning/` - Planning documents and execution queue
- `spec/` - Capability specifications and contracts
- `reference/` - Reference documentation
- `architecture/` - Architecture diagrams and decisions
- `quality/` - Quality standards and schemas
- `sre/` - SRE documentation (SLOs, error budgets)

**Key Files:**
- `governance/_root/ISA_GOVERNANCE.md` - Authoritative governance framework
- `planning/INDEX.md` - Canonical planning index
- `planning/NEXT_ACTIONS.json` - Execution queue
- `spec/ARCHITECTURE.md` - System architecture
- `REPO_MAP.md` - Evidence-bound repository map
- `README.md` - Documentation map

### `/scripts` - Automation Scripts
Utility scripts for development, testing, and operations.

**Structure:**
- `audit/` - Repository assessment scripts
- `datasets/` - Dataset processing scripts
- `dev/` - Development utilities
- `gates/` - CI/CD validation gates
- `ingestion/` - Data ingestion scripts
- `probe/` - Health check scripts
- `refactor/` - Refactoring automation
- `sre/` - SRE automation
- `validation/` - Data validation scripts

### `/config` - Configuration Files
Application and governance configuration.

**Structure:**
- `governance/` - Governance policies and allowlists
- `isa-catalogue/` - Catalogue policies
- `catalogue_sources.json` - Data source configuration

### `/shared` - Shared Code
Code shared between client and server.

**Structure:**
- `_core/` - Core shared utilities
- `schemas/` - JSON schemas
- `types.ts` - Shared TypeScript types
- `const.ts` - Shared constants

## Architectural Patterns

### Monorepo Structure
Single repository containing frontend, backend, and shared code with unified dependency management via pnpm.

### tRPC API Layer
Type-safe API communication between client and server:
- Server defines routers with procedures
- Client gets automatic TypeScript types
- No manual API contract maintenance

### Drizzle ORM
Type-safe database queries:
- Schema-first approach
- Automatic TypeScript types from schema
- Migration generation and management

### Service Layer Pattern
Business logic separated into service modules:
- `server/services/` contains domain-specific services
- Routers call services, services call database
- Clear separation of concerns

### Data Ingestion Pipelines
Modular ingestion scripts:
- Each dataset has dedicated ingestion script
- Standardized metadata tracking
- Provenance and versioning

### News Pipeline Architecture
Multi-source news aggregation:
- Source-specific scrapers
- Health monitoring and retry logic
- AI-powered content analysis
- Deduplication and archival

### RAG (Retrieval-Augmented Generation)
Knowledge base with vector search:
- Documents chunked and embedded
- Hybrid search (BM25 + vector similarity)
- Citation tracking and validation
- Query guardrails

### Advisory System
Versioned report generation:
- Dataset provenance tracking
- Diff computation between versions
- Governance review workflow
- JSON schema validation

## Component Relationships

### Frontend → Backend
- Client uses tRPC client to call server procedures
- TanStack Query manages caching and state
- Type safety enforced at compile time

### Backend → Database
- Drizzle ORM provides type-safe queries
- Connection pooling via mysql2
- Migration management via drizzle-kit

### Backend → External APIs
- OpenAI API for embeddings and LLM
- Playwright for web scraping
- Manus OAuth for authentication

### Data Flow
1. **Ingestion:** Scripts read source files → Parse → Insert into database
2. **Embedding:** Documents → Chunk → Embed → Store vectors
3. **Query:** User query → Embed → Vector search → Retrieve → LLM → Response
4. **News:** Scrapers → Fetch → Parse → Deduplicate → Store → Analyze

## Configuration Management

### Environment Variables
- `.env` - Local development configuration
- `.env.example` - Template with required variables
- Server validates required variables at startup

### Database Configuration
- `drizzle.config.ts` - Drizzle ORM configuration
- Connection string from environment variables
- SSL/TLS configuration for production

### Build Configuration
- `vite.config.ts` - Frontend build configuration
- `vitest.config.ts` - Test configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts

## Testing Structure

### Test Organization
- Unit tests: `*.test.ts` files alongside source
- Integration tests: `*-integration.test.ts` files
- Test helpers: `server/test-helpers/`
- Test utilities: `server/test-utils/`

### Test Coverage
- 517/574 tests passing (90.1%)
- Unit tests for core logic
- Integration tests for database operations
- Router tests for API endpoints
- Evaluation tests for RAG system

## Documentation Structure

### Governance Documentation
- Authoritative governance framework
- Planning and execution tracking
- Decision logs and rationale

### Capability Documentation
- Runtime contracts for each capability
- API specifications
- Data models and schemas

### Operational Documentation
- Deployment guides
- Runbooks and procedures
- Health monitoring and alerting

### Quality Documentation
- Quality standards and scorecards
- Test failure analysis
- Coverage reports

## Archive Structure

### `/isa-archive`
Historical content preserved for reference:
- Deprecated documentation
- Old implementations
- Phase reports
- Research findings
- Superseded roadmaps

**Note:** Archive is read-only, not actively maintained.
