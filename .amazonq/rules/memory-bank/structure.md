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
├── test-results/           # Test output artifacts
├── config/                 # Configuration files
├── ops/                    # Operations and cron setup
└── isa-archive/            # Historical artifacts
```

## Core Directories

### `/client` - Frontend Application
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS 4 + shadcn/ui components
- **Routing:** Wouter
- **State:** tRPC client + TanStack Query
- **Structure:**
  - `src/_core/` - Core utilities and configuration
  - `src/components/` - Reusable UI components
  - `src/pages/` - Page components
  - `src/contexts/` - React contexts
  - `src/hooks/` - Custom React hooks
  - `src/lib/` - Utility libraries

### `/server` - Backend Application
- **Framework:** Express 4 + tRPC 11
- **Database:** Drizzle ORM + MySQL/TiDB
- **AI/ML:** OpenAI GPT-4 + text-embedding-3-small
- **Structure:**
  - `_core/` - Core server infrastructure (trpc, auth, logging)
  - `routers/` - tRPC route handlers
  - `services/` - Business logic services
  - `ingest/` - Data ingestion pipelines
  - `news/` - News scraping and processing
  - `mappings/` - ESRS-to-GS1 mapping logic
  - `prompts/` - AI prompt templates
  - `evaluation/` - RAG evaluation harness
  - `test-helpers/` - Testing utilities
  - `utils/` - Shared utilities

### `/drizzle` - Database Layer
- **Schema Files:** Modular schema definitions
  - `schema.ts` - Main schema
  - `schema_*.ts` - Feature-specific schemas
  - `relations.ts` - Table relationships
- **Migrations:** SQL migration files
- **Meta:** Drizzle Kit metadata

### `/data` - Dataset Repository
- **Structure:**
  - `advisories/` - Advisory report versions
  - `efrag/` - EFRAG ESRS datapoints and taxonomy
  - `gs1/` - GS1 standards data
  - `gs1nl/` - GS1 Netherlands sector models
  - `gs1_ref_corpus/` - GS1 reference documents
  - `gs1_web_vocab/` - GS1 WebVoc vocabulary
  - `esg/` - ESG-related datasets
  - `metadata/` - Dataset registry and metadata
  - `standards/` - Standards documentation

### `/docs` - Documentation
- **Structure:**
  - `governance/_root/` - Governance framework (ISA_GOVERNANCE.md)
  - `planning/` - Planning documents and execution queue
  - `spec/` - Feature specifications
  - `architecture/panel/` - Architecture documentation
  - `quality/schemas/` - Proof artifact schemas
  - `sre/` - SRE documentation (SLOs, error budgets)
  - `evidence/` - Evidence catalogue
  - `reference/` - Reference documentation

### `/scripts` - Automation
- **Structure:**
  - `gates/` - Quality gate scripts
  - `sre/` - SRE artifact generators
  - `ingestion/` - Data ingestion scripts
  - `validation/` - Validation scripts
  - `datasets/` - Dataset management
  - `probe/` - Health check probes
  - `audit/` - Repository assessment

## Architectural Patterns

### Frontend Architecture
- **Component-Based:** Modular React components with shadcn/ui
- **Type-Safe API:** tRPC client with full TypeScript inference
- **State Management:** TanStack Query for server state
- **Routing:** File-based routing with Wouter
- **Styling:** Utility-first CSS with Tailwind

### Backend Architecture
- **API Layer:** tRPC for type-safe RPC
- **Data Layer:** Drizzle ORM with MySQL
- **Service Layer:** Business logic in `/services`
- **Integration Layer:** External API connectors
- **Observability:** Structured logging with server-logger

### Data Flow
1. **Ingestion:** Scripts in `/scripts/ingestion` → Database
2. **Processing:** Services in `/server/services` → Transformations
3. **Storage:** Drizzle ORM → MySQL/TiDB
4. **Retrieval:** tRPC routers → Client
5. **Presentation:** React components → UI

### AI/ML Pipeline
1. **Embedding Generation:** `server/embedding.ts`
2. **Vector Search:** `server/knowledge-vector-search.ts`
3. **RAG Pipeline:** `server/routers/ask-isa.ts`
4. **Mapping Engine:** `server/gs1-mapping-engine.ts`
5. **Evaluation:** `server/evaluation/evaluation-harness.ts`

## Key Configuration Files

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `vitest.config.ts` - Test configuration
- `drizzle.config.ts` - Database configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `.env` - Environment variables (not in repo)
- `.env.example` - Environment variable template

## Database Schema Organization

### Core Tables
- `regulations` - EU regulations catalog
- `esrs_datapoints` - EFRAG ESRS datapoints
- `gs1_standards` - GS1 standards catalog
- `gs1_attributes` - GS1 attribute definitions
- `knowledge_base` - RAG knowledge base
- `knowledge_base_embeddings` - Vector embeddings

### Feature Tables
- `advisory_reports` - Advisory report versions
- `gs1_esrs_mappings` - Regulation-to-standard mappings
- `news_articles` - News feed articles
- `scraper_health` - Scraper monitoring
- `regulatory_change_log` - Regulatory changes
- `dataset_registry` - Dataset metadata

### Observability Tables
- `pipeline_observability` - Pipeline execution logs
- `cron_monitoring` - Cron job monitoring
- `error_tracking` - Error logs

## Testing Structure

- **Unit Tests:** `*.test.ts` files co-located with source
- **Integration Tests:** `*-integration.test.ts` files
- **Test Helpers:** `/server/test-helpers/`
- **Test Results:** `/test-results/ci/`
- **Framework:** Vitest with happy-dom

## Build Artifacts

- `/dist` - Production build output (not in repo)
- `/node_modules` - Dependencies (not in repo)
- `/test-results` - Test execution results
- `/.tmp` - Temporary files (not in repo)

## Archive Structure

- `/isa-archive` - Historical artifacts and deprecated code
  - `backlog/` - Old backlog snapshots
  - `cleanup/` - Cleanup operation records
  - `phase-reports/` - Historical phase reports
  - `roadmaps/` - Deprecated roadmaps
