# ISA Project Structure

## Repo Anchors

### Canonical Navigation
- `/AGENT_START_HERE.md` - Agent entrypoint
- `/README.md` - Project overview
- `/REPO_TREE.md` - Repository structure
- `/AGENTS.md` - Agent collaboration guide
- `/package.json` - Dependencies and scripts

### Refactor / Governance Evidence
- `/docs/planning/refactoring/FILE_INVENTORY.json` - Complete file registry (828 files)
- `/docs/planning/refactoring/QUALITY_SCORECARDS.json` - Capability quality scores
- `/docs/planning/refactoring/EVIDENCE_MARKERS.json` - Traceability markers
- `/docs/planning/refactoring/FINAL_STATUS_REPORT.md` - Refactoring completion status
- `/docs/planning/refactoring/EXECUTION_SUMMARY.md` - Phase-by-phase results
- `/docs/planning/refactoring/MOVE_PLAN.json` - File relocation plan
- `/docs/planning/refactoring/MOVE_EXECUTION_LOG.json` - Relocation audit trail

### Gate Runner
- `/scripts/refactor/validate_gates.sh` - 5 automated validation gates

**Rule**: Any statement about repository state must link to one of the anchors above (file path), or it is considered unverified.

## How to Validate (One Pass)

Run the gate runner to verify repository state:
```bash
bash scripts/refactor/validate_gates.sh
```

Then confirm these artifacts exist and are current:
- `docs/planning/refactoring/FILE_INVENTORY.json` (828 files, 100% classified)
- `docs/planning/refactoring/QUALITY_SCORECARDS.json` (overall score 71.7/100)
- `docs/planning/refactoring/FINAL_STATUS_REPORT.md` (all gates passing)

## Directory Organization

### Root Structure
```
isa_web_clean/
├── client/                 # Frontend application (React 19)
├── server/                 # Backend application (Express + tRPC)
├── shared/                 # Shared types and utilities
├── drizzle/                # Database schema and migrations
├── data/                   # Dataset files and metadata
├── docs/                   # Documentation
├── scripts/                # Automation and utility scripts
├── config/                 # Configuration files
├── ops/                    # Operations and cron jobs
├── probes/                 # Health check and status probes
└── isa-archive/            # Archived historical content
```

## Core Components

### Frontend (client/)
- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Routing**: Wouter
- **State Management**: tRPC client + TanStack Query
- **Structure**:
  - `src/_core/` - Core utilities and configuration
  - `src/components/` - Reusable UI components
  - `src/pages/` - Page components
  - `src/contexts/` - React contexts
  - `src/hooks/` - Custom React hooks
  - `src/lib/` - Utility libraries

### Backend (server/)
- **Framework**: Express 4 + tRPC 11
- **Database**: Drizzle ORM + MySQL/TiDB
- **Authentication**: Manus OAuth
- **Structure**:
  - `_core/` - Core server infrastructure (trpc, auth, logging)
  - `routers/` - tRPC route handlers
  - `services/` - Business logic services
  - `ingest/` - Data ingestion pipelines
  - `news/` - News scraping and processing
  - `mappings/` - ESRS-to-GS1 mapping logic
  - `prompts/` - AI prompt templates
  - `evaluation/` - Testing and evaluation harnesses
  - `test-helpers/` - Testing utilities
  - `utils/` - Server utilities

### Shared (shared/)
- **Purpose**: Code shared between client and server
- **Contents**:
  - `types.ts` - Shared TypeScript types
  - `const.ts` - Shared constants
  - `epcis-cbv-types.ts` - EPCIS/CBV type definitions
  - `gs1-link-types.ts` - GS1 Digital Link types
  - `news-tags.ts` - News categorization tags
  - `schemas/` - JSON schemas

### Database (drizzle/)
- **ORM**: Drizzle ORM
- **Structure**:
  - `schema.ts` - Main database schema
  - `schema_*.ts` - Domain-specific schemas
  - `relations.ts` - Table relationships
  - `migrations/` - SQL migration files
  - `meta/` - Migration metadata

### Data (data/)
- **Purpose**: Dataset files and metadata
- **Structure**:
  - `metadata/` - Dataset registry and metadata
  - `advisories/` - Advisory report versions
  - `efrag/` - EFRAG ESRS data
  - `gs1/` - GS1 standards data
  - `gs1nl/` - GS1 Netherlands sector models
  - `gs1_ref_corpus/` - GS1 reference documents
  - `gs1_web_vocab/` - GS1 Web Vocabulary
  - `esg/` - ESG-related datasets
  - `cbv/` - Core Business Vocabulary
  - `digital_link/` - GS1 Digital Link data
  - `standards/` - Standards documentation

### Documentation (docs/)
- **Structure**:
  - `governance/` - Governance framework and policies
  - `planning/` - Project planning and roadmaps
  - `spec/` - Technical specifications by capability
  - `reference/` - Reference documentation
  - `evidence/` - Evidence and audit trails
  - `decisions/` - Decision logs
  - `agent/` - Agent collaboration documentation
  - `core/` - Core documentation
  - `ops/` - Operations documentation

### Scripts (scripts/)
- **Purpose**: Automation and utility scripts
- **Structure**:
  - `audit/` - Repository assessment scripts
  - `datasets/` - Dataset processing scripts
  - `dev/` - Development utilities
  - `ingestion/` - Data ingestion scripts
  - `isa-catalogue/` - Catalogue management
  - `probe/` - Health check probes
  - `refactor/` - Refactoring automation
  - `validation/` - Validation scripts

## Architectural Patterns

### Full-Stack TypeScript
- Shared types between client and server
- End-to-end type safety via tRPC
- Consistent tooling and build process

### tRPC API Layer
- Type-safe API calls without code generation
- Automatic request/response validation
- Integrated with React Query for caching

### Database-First Design
- Drizzle ORM for type-safe database access
- Migration-based schema evolution
- Separate schemas for different domains

### Capability-Based Organization
- Documentation organized by capability (ASK_ISA, NEWS_HUB, etc.)
- Each capability has its own spec directory
- Runtime contracts define capability boundaries

### Governance-First Development
- All changes tracked in version control
- Mandatory governance self-checks
- Evidence-based decision making
- Provenance tracking for all datasets

### AI Integration Patterns
- OpenAI GPT-4 for advisory generation and Q&A
- text-embedding-3-small for semantic search
- Mandatory citations for all AI-generated content
- Query guardrails and confidence scoring

### Data Pipeline Architecture
- Scheduled news scraping (7 sources)
- EFRAG and EUR-Lex ingestion
- GS1 standards processing
- Embedding generation for semantic search
- Pipeline observability and health monitoring

## Key Relationships

### Client ↔ Server
- tRPC for type-safe API calls
- Manus OAuth for authentication
- Server-side rendering via Vite

### Server ↔ Database
- Drizzle ORM for queries
- Connection pooling
- SSL/TLS for production

### Server ↔ External APIs
- OpenAI for LLM and embeddings
- Playwright for web scraping
- EUR-Lex and EFRAG for regulatory data
- GS1 sources for standards data

### Data ↔ Documentation
- Dataset registry links to documentation
- Evidence pointers in governance docs
- Provenance metadata in all datasets

## Entrypoints (Canonical)

### Backend Entrypoint
**File**: `/server/_core/index.ts`  
**Script**: `pnpm dev` (development), `pnpm start` (production)  
**Verified**: Per `/package.json` scripts section

Express + tRPC server with Manus OAuth authentication.

### Frontend Entrypoint
**File**: `/client/src/main.tsx`  
**Build**: Vite bundles from this entrypoint  
**Verified**: Standard Vite + React pattern

React 19 application with Wouter routing and tRPC client.

### Tooling Entrypoints
**Refactor Runners**: `/scripts/refactor/phase_*.py` (inventory, contracts, relocation, quality, automation, final lock)  
**Gate Runner**: `/scripts/refactor/validate_gates.sh` (5 automated gates)  
**Verified**: Per `/docs/planning/refactoring/EXECUTION_SUMMARY.md`

Automated refactoring and validation infrastructure.

## Generated vs Handwritten

### Generated Artifacts
**Directory**: `/docs/planning/refactoring/`  
**Generated by**: `/scripts/refactor/phase_*.py` scripts  
**Artifacts**:
- `FILE_INVENTORY.json` - Generated by phase_0_inventory.py
- `QUALITY_SCORECARDS.json` - Generated by phase_3_quality.py
- `EVIDENCE_MARKERS.json` - Generated by phase_3_quality.py
- `MOVE_PLAN.json` - Generated by phase_2_plan.py
- `MOVE_EXECUTION_LOG.json` - Generated by phase_2_execute.py
- `FINAL_STATUS_REPORT.md` - Generated by phase_5_final_lock.py
- `EXECUTION_SUMMARY.md` - Handwritten summary

**Verification**: Run `/scripts/refactor/validate_gates.sh` to confirm generated artifacts are current.

### Handwritten Documentation
**Directory**: `/docs/spec/*/RUNTIME_CONTRACT.md`  
**Files**: 6 runtime contracts (ASK_ISA, NEWS_HUB, KNOWLEDGE_BASE, CATALOG, ESRS_MAPPING, ADVISORY)  
**Generated**: Skeletons by phase_1_contracts.py, content requires manual enhancement  
**Current Completeness**: 30% per `/docs/planning/refactoring/EXECUTION_SUMMARY.md`
