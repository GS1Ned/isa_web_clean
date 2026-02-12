# ISA Technology Stack

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

## Programming Languages

- **TypeScript 5.9.3**: Primary language for both frontend and backend
- **Python 3.x**: Data processing and ingestion scripts
- **SQL**: Database migrations and queries
- **Bash**: Automation scripts

## Frontend Stack

### Core Framework
- **React 19.1.1**: UI framework
- **TypeScript**: Type safety
- **Vite 7.1.7**: Build tool and dev server

### UI & Styling
- **Tailwind CSS 4.1.14**: Utility-first CSS framework
- **@tailwindcss/vite 4.1.3**: Tailwind Vite integration
- **shadcn/ui**: Component library (Radix UI primitives)
- **Framer Motion 12.23.22**: Animation library
- **Lucide React 0.453.0**: Icon library

### State Management & Data Fetching
- **tRPC 11.6.0**: Type-safe API client
- **@tanstack/react-query 5.90.2**: Data fetching and caching
- **Wouter 3.3.5**: Lightweight routing

### Form & Validation
- **React Hook Form 7.64.0**: Form management
- **Zod 4.1.12**: Schema validation
- **@hookform/resolvers 5.2.2**: Form validation integration

### Visualization & Maps
- **Recharts 2.15.4**: Charts and graphs
- **React Flow 11.11.4**: Node-based diagrams
- **Leaflet 1.9.4**: Maps
- **React Leaflet 5.0.0**: React bindings for Leaflet

## Backend Stack

### Core Framework
- **Express 4.21.2**: Web server
- **tRPC 11.6.0**: Type-safe API layer
- **TypeScript**: Type safety

### Database
- **Drizzle ORM 0.44.5**: Type-safe ORM
- **MySQL2 3.15.1**: MySQL driver
- **TiDB**: Production database (MySQL-compatible)

### Authentication & Security
- **Manus OAuth**: Authentication provider
- **Jose 6.1.0**: JWT handling
- **Helmet 8.1.0**: Security headers
- **express-rate-limit 8.2.1**: Rate limiting

### AI & ML
- **OpenAI GPT-4**: Advisory generation and Q&A
- **text-embedding-3-small**: Semantic search embeddings
- **wink-bm25-text-search 3.1.2**: BM25 text search

### Data Processing
- **ExcelJS 4.4.0**: Excel file processing
- **XLSX 0.18.5**: Spreadsheet parsing
- **Cheerio 1.1.2**: HTML parsing
- **fast-xml-parser 5.3.2**: XML parsing
- **rss-parser 3.13.0**: RSS feed parsing

### Web Scraping
- **Playwright 1.57.0**: Browser automation
- **Axios 1.12.2**: HTTP client

### Utilities
- **date-fns 4.1.0**: Date manipulation
- **nanoid 5.1.5**: ID generation
- **node-cron 4.2.1**: Scheduled tasks
- **dotenv 17.2.2**: Environment variables

## Development Tools

### Build & Bundling
- **Vite 7.1.7**: Frontend build tool
- **esbuild 0.25.0**: Backend bundler
- **tsx 4.19.1**: TypeScript execution

### Testing
- **Vitest 2.1.4**: Test framework
- **@testing-library/react 16.3.0**: React testing utilities
- **@testing-library/user-event 14.6.1**: User interaction testing
- **happy-dom 20.0.11**: DOM implementation for testing

### Code Quality
- **Prettier 3.6.2**: Code formatting
- **ESLint**: Linting (configured)
- **markdownlint-cli 0.47.0**: Markdown linting
- **cspell 9.4.0**: Spell checking

### Database Tools
- **Drizzle Kit 0.31.4**: Schema migrations
- **better-sqlite3 12.5.0**: SQLite for testing

## Infrastructure

### Hosting
- **Manus**: Primary hosting platform
- **GitHub**: Version control and CI/CD

### CI/CD
- **GitHub Actions**: Automated workflows
  - Ask ISA runtime smoke tests
  - Refactoring validation
  - Repository tree generation
  - Documentation validation

### Monitoring
- Custom pipeline observability
- Scraper health monitoring
- Error tracking and logging

## Development Commands

### Core Commands
```bash
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm check                  # TypeScript type checking
pnpm format                 # Format code with Prettier
```

### Testing
```bash
pnpm test                   # Run all tests
pnpm test-unit              # Run unit tests
pnpm test-integration       # Run integration tests
pnpm test-db-health         # Run database health tests
pnpm test-ci                # Run CI test suite
pnpm test-ci:unit           # Run CI unit tests
pnpm test-ci:integration    # Run CI integration tests
```

### Database
```bash
pnpm db:push                # Generate and run migrations
```

### Data Operations
```bash
pnpm verify:data            # Verify data files
pnpm ingest:esrs            # Ingest ESRS datapoints
```

### Advisory System
```bash
pnpm validate:advisory      # Validate advisory schema
pnpm canonicalize:advisory  # Canonicalize advisory format
pnpm diff:advisory          # Compute advisory diff
```

### Code Quality
```bash
pnpm lint:style             # Lint markdown and check spelling
```

## Package Manager

- **pnpm 10.4.1**: Fast, disk space efficient package manager
- **Node.js 22.13.0**: Required runtime version

## Environment Variables

Key environment variables (see .env.example):
- Database connection (MySQL/TiDB)
- OpenAI API keys
- Manus OAuth configuration
- GitHub PAT for automation
- Cron secrets for scheduled tasks

## Version Control

- **Git**: Version control system
- **GitHub**: Remote repository
- **Conventional Commits**: Commit message format (feat, fix, docs, refactor, test, chore, data)

## Browser Support

- Modern browsers with ES2020+ support
- Chrome, Firefox, Safari, Edge (latest versions)

## Source-of-Truth Configs

### TypeScript Configuration
**File**: `/tsconfig.json`  
**Purpose**: TypeScript compiler options, path aliases, and type checking rules

### Vite Configuration
**File**: `/vite.config.ts`  
**Purpose**: Frontend build configuration, plugins, and dev server settings

### Vitest Configuration
**File**: `/vitest.config.ts`  
**Purpose**: Test runner configuration, coverage settings, and test environment

**File**: `/vitest.setup.ts`  
**Purpose**: Global test setup, mocks, and test utilities initialization

### Drizzle Configuration
**File**: `/drizzle.config.ts`  
**Purpose**: Database ORM configuration, migration settings, and schema paths

### Spell Checking Configuration
**File**: `/cspell.json`  
**Purpose**: Custom dictionary, ignored words, and spell check rules

### Component Configuration
**File**: `/components.json`  
**Purpose**: shadcn/ui component library configuration and styling preferences

## Verification Surface

Tech stack claims are valid only if gates pass and scorecards are green:
- **Gate Runner**: `/scripts/refactor/validate_gates.sh` (5/5 gates passing per `/docs/planning/refactoring/FINAL_STATUS_REPORT.md`)
- **Quality Scores**: `/docs/planning/refactoring/QUALITY_SCORECARDS.json` (71.7/100 overall)
- **Test Status**: 517/574 tests passing (90.1%) per `/README.md`

All version numbers verified against `/package.json` dependencies and devDependencies sections.
