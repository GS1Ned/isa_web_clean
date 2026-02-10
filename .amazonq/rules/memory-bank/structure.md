# ISA Project Structure

## Directory Organization

```
isa_web_clean/
├── .ai/                        # Agent navigation layer
│   ├── ENTRYPOINTS.md         # Canonical agent entrypoints
│   ├── NAV_POLICY.md          # Navigation policy
│   ├── CANONICAL_REGISTRY.json # Registry of canonical documents
│   └── CAPABILITY_GRAPH.json  # Capability mapping graph
│
├── .amazonq/                   # Amazon Q configuration
│   └── rules/                 # Project rules and memory bank
│
├── client/                     # Frontend application
│   ├── src/
│   │   ├── _core/             # Core utilities and types
│   │   ├── components/        # React components (shadcn/ui)
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Client-side utilities
│   │   ├── pages/             # Page components (Wouter routing)
│   │   ├── App.tsx            # Root application component
│   │   └── main.tsx           # Application entry point
│   ├── public/                # Static assets
│   └── index.html             # HTML entry point
│
├── server/                     # Backend application
│   ├── _core/                 # Core server infrastructure
│   │   ├── types/             # TypeScript type definitions
│   │   ├── context.ts         # tRPC context
│   │   ├── trpc.ts            # tRPC setup
│   │   ├── env.ts             # Environment configuration
│   │   ├── oauth.ts           # Manus OAuth integration
│   │   └── logger-wiring.ts   # Logging infrastructure
│   ├── routers/               # tRPC routers (API endpoints)
│   │   ├── ask-isa.ts         # Ask ISA Q&A router
│   │   ├── advisory-reports.ts # Advisory system router
│   │   ├── scraper-health.ts  # News scraper monitoring
│   │   ├── dataset-registry.ts # Dataset registry router
│   │   └── [50+ other routers]
│   ├── services/              # Business logic services
│   │   ├── news/              # News pipeline services
│   │   ├── corpus-governance/ # Corpus management
│   │   ├── rag-metrics/       # RAG evaluation metrics
│   │   └── rag-tracing/       # RAG tracing and observability
│   ├── ingest/                # Data ingestion scripts
│   │   ├── INGEST-02_gdsn_current.ts
│   │   ├── INGEST-03_esrs_datapoints.ts
│   │   ├── INGEST-04_ctes_kdes.ts
│   │   ├── INGEST-05_dpp_rules.ts
│   │   └── INGEST-06_cbv_digital_link.ts
│   ├── news/                  # News scraping utilities
│   │   ├── news-scraper-eurlex.ts
│   │   ├── news-scraper-gs1eu.ts
│   │   └── news-scraper-greendeal.ts
│   ├── mappings/              # ESRS-to-GS1 mapping engine
│   ├── prompts/               # AI prompt templates
│   │   ├── ask_isa/           # Ask ISA prompts
│   │   └── ingestion/         # Ingestion prompts
│   ├── evaluation/            # RAG evaluation harness
│   ├── utils/                 # Server utilities
│   │   ├── server-logger.ts   # Structured logging
│   │   └── pipeline-logger.ts # Pipeline-specific logging
│   └── routers.ts             # Root tRPC router
│
├── drizzle/                    # Database layer
│   ├── schema.ts              # Main database schema
│   ├── schema_*.ts            # Feature-specific schemas
│   ├── relations.ts           # Database relations
│   ├── migrations/            # SQL migrations
│   └── meta/                  # Drizzle metadata
│
├── data/                       # Dataset files
│   ├── metadata/              # Dataset registry and metadata
│   │   ├── dataset_registry.json # Canonical dataset registry
│   │   └── dataset_registry.schema.json
│   ├── advisories/            # Advisory report versions
│   ├── efrag/                 # EFRAG ESRS data
│   ├── gs1/                   # GS1 standards data
│   ├── gs1nl/                 # GS1 Netherlands sector models
│   ├── gs1_ref_corpus/        # GS1 reference corpus
│   ├── gs1_web_vocab/         # GS1 WebVoc vocabulary
│   ├── esg/                   # ESG-specific data
│   ├── cbv/                   # EPCIS CBV vocabularies
│   └── standards/             # Standards documents
│
├── docs/                       # Documentation
│   ├── governance/_root/      # Governance framework
│   │   └── ISA_GOVERNANCE.md  # Authoritative governance doc
│   ├── planning/              # Planning documents
│   │   ├── INDEX.md           # Canonical planning index
│   │   ├── NEXT_ACTIONS.json  # Execution queue (canonical)
│   │   ├── BACKLOG.csv        # Backlog (canonical)
│   │   ├── PLANNING_POLICY.md # Planning policy
│   │   └── PROGRAM_PLAN.md    # Program plan narrative
│   ├── spec/                  # Technical specifications
│   │   ├── INDEX.md           # Specs index
│   │   ├── ARCHITECTURE.md    # System architecture
│   │   ├── ASK_ISA.md         # Ask ISA specification
│   │   ├── ADVISORY.md        # Advisory system spec
│   │   └── [50+ other specs]
│   ├── evidence/              # Evidence and traceability
│   │   ├── EVIDENCE_LEDGER.md # Evidence tracking
│   │   └── EVIDENCE_INDEX.md  # Evidence index
│   ├── decisions/             # Decision log
│   │   └── DECISION_LOG.md    # Canonical decision log
│   ├── reference/             # Reference documentation
│   │   ├── ISA_DEVELOPMENT_RUBRIC.md
│   │   └── REPO_ASSESSMENT_HOWTO.md
│   ├── agent/                 # Agent collaboration docs
│   │   └── AGENT_MAP.md       # Agent navigation map
│   ├── REPO_MAP.md            # Repository map
│   ├── DATASETS_CATALOG.md    # Dataset catalog
│   ├── NEWS_PIPELINE.md       # News pipeline architecture
│   ├── ADVISORY_METHOD.md     # Advisory methodology
│   └── README.md              # Documentation index
│
├── scripts/                    # Automation scripts
│   ├── audit/                 # Audit scripts
│   ├── datasets/              # Dataset processing
│   ├── dev/                   # Development utilities
│   ├── ingestion/             # Ingestion automation
│   ├── probe/                 # Health check probes
│   ├── validation/            # Validation scripts
│   └── validate_planning_and_traceability.py
│
├── .github/                    # GitHub configuration
│   ├── workflows/             # CI/CD workflows
│   │   ├── repo-tree.yml      # Repo tree generation
│   │   ├── validate-docs.yml  # Documentation validation
│   │   └── ask-isa-smoke.yml  # Ask ISA smoke tests
│   └── PULL_REQUEST_TEMPLATE.md
│
├── config/                     # Configuration files
│   ├── governance/            # Governance policies
│   └── isa-catalogue/         # Catalogue configuration
│
├── shared/                     # Shared code (client + server)
│   ├── _core/                 # Core shared utilities
│   ├── schemas/               # JSON schemas
│   ├── types.ts               # Shared TypeScript types
│   └── const.ts               # Shared constants
│
├── isa-archive/                # Historical archives
│   ├── phase-reports/         # Phase completion reports
│   ├── planning/              # Archived planning docs
│   └── reports/               # Archived reports
│
├── AGENT_START_HERE.md         # Canonical agent entrypoint
├── README.md                   # Project README
├── REPO_TREE.md                # CI-generated repo tree
├── package.json                # Node.js dependencies
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
├── vitest.config.ts            # Vitest test configuration
└── drizzle.config.ts           # Drizzle ORM configuration
```

## Core Components

### Frontend Architecture
- **Framework:** React 19 with TypeScript
- **Routing:** Wouter (lightweight React router)
- **State Management:** React Query (@tanstack/react-query)
- **API Client:** tRPC client with React Query integration
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS 4 with custom design system
- **Build Tool:** Vite 7

### Backend Architecture
- **Framework:** Express 4 with TypeScript
- **API Layer:** tRPC 11 (type-safe RPC)
- **Database:** MySQL/TiDB with Drizzle ORM
- **Authentication:** Manus OAuth integration
- **AI/ML:** OpenAI GPT-4 + text-embedding-3-small
- **Scraping:** Playwright for web scraping
- **Logging:** Structured logging with server-logger

### Database Schema Organization
- **schema.ts:** Core tables (regulations, standards, news)
- **schema_advisory_reports.ts:** Advisory system tables
- **schema_ask_isa_feedback.ts:** Ask ISA feedback tracking
- **schema_corpus_governance.ts:** Corpus management
- **schema_dataset_registry.ts:** Dataset registry
- **schema_esg_extensions.ts:** ESG-specific extensions
- **schema_gs1_esrs_mappings.ts:** GS1-ESRS mappings
- **schema_news_history.ts:** News pipeline history
- **schema_pipeline_observability.ts:** Pipeline monitoring
- **schema_regulatory_change_log.ts:** Regulatory changes
- **schema_scraper_health.ts:** Scraper health monitoring

## Architectural Patterns

### tRPC Router Pattern
All API endpoints are organized as tRPC routers in `server/routers/`:
- Type-safe client-server communication
- Automatic TypeScript inference
- Input validation with Zod schemas
- Centralized error handling

### Service Layer Pattern
Business logic separated into `server/services/`:
- Reusable service modules
- Clear separation of concerns
- Testable business logic
- Shared across multiple routers

### Data Ingestion Pipeline
Structured ingestion scripts in `server/ingest/`:
- INGEST-02: GDSN current data
- INGEST-03: ESRS datapoints from EFRAG
- INGEST-04: CTEs and KDEs
- INGEST-05: DPP identification rules
- INGEST-06: CBV vocabularies and Digital Link

### News Pipeline Architecture
Multi-source news aggregation:
- Playwright-based scrapers for each source
- Health monitoring and retry logic
- AI-powered content analysis
- Deduplication and archival
- Observability and alerting

### RAG (Retrieval-Augmented Generation)
Ask ISA Q&A system:
- Hybrid search (BM25 + semantic embeddings)
- Query guardrails and validation
- Citation extraction and verification
- Confidence scoring
- Evaluation harness with golden set

## Key Relationships

### Frontend → Backend
- Client uses tRPC client to call server routers
- Type safety enforced at compile time
- React Query manages caching and state

### Backend → Database
- Drizzle ORM provides type-safe database access
- Schema-first approach with migrations
- Relations defined in drizzle/relations.ts

### Backend → AI Services
- OpenAI GPT-4 for advisory generation and Q&A
- text-embedding-3-small for semantic search
- Prompt templates in server/prompts/

### Data Flow
1. **Ingestion:** Scripts in server/ingest/ → Database
2. **Processing:** Services in server/services/ → Database
3. **API:** Routers in server/routers/ → tRPC → Client
4. **UI:** Client pages/components → User

## Canonical Documents

### Planning SSoT (Single Source of Truth)
- **docs/planning/NEXT_ACTIONS.json:** Execution queue
- **docs/planning/BACKLOG.csv:** Backlog items
- **docs/planning/INDEX.md:** Planning index

### Governance SSoT
- **docs/governance/_root/ISA_GOVERNANCE.md:** Authoritative governance framework

### Agent Navigation SSoT
- **.ai/ENTRYPOINTS.md:** Agent entrypoints
- **.ai/CANONICAL_REGISTRY.json:** Canonical document registry
- **AGENT_START_HERE.md:** Primary agent entrypoint

### Evidence SSoT
- **docs/evidence/EVIDENCE_LEDGER.md:** Evidence tracking
- **docs/decisions/DECISION_LOG.md:** Decision log
