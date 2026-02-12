# ISA Technology Stack

## Programming Languages

- **TypeScript 5.9.3** - Primary language for frontend and backend
- **JavaScript (ESM)** - Build scripts and utilities
- **Python 3.x** - Data processing and ingestion scripts
- **SQL** - Database migrations and queries
- **Bash** - Shell scripts for automation

## Frontend Stack

### Core Framework
- **React 19.1.1** - UI library
- **TypeScript 5.9.3** - Type safety
- **Vite 7.1.7** - Build tool and dev server

### Styling
- **Tailwind CSS 4.1.14** - Utility-first CSS framework
- **@tailwindcss/typography** - Typography plugin
- **tailwindcss-animate** - Animation utilities
- **PostCSS 8.4.47** - CSS processing

### UI Components
- **shadcn/ui** - Component library (Radix UI primitives)
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Framer Motion** - Animation library

### State Management
- **@tanstack/react-query 5.90.2** - Server state management
- **React Hook Form 7.64.0** - Form state management
- **Zod 4.1.12** - Schema validation

### Routing
- **Wouter 3.3.5** - Lightweight routing (patched)

### Data Visualization
- **Recharts 2.15.4** - Charts and graphs
- **ReactFlow 11.11.4** - Flow diagrams
- **Leaflet 1.9.4** - Maps (with react-leaflet)

## Backend Stack

### Core Framework
- **Express 4.21.2** - Web server
- **tRPC 11.6.0** - Type-safe RPC
- **Node.js 22.13.0** - Runtime

### Database
- **Drizzle ORM 0.44.5** - Type-safe ORM
- **MySQL2 3.15.1** - MySQL driver
- **TiDB** - Cloud database (MySQL-compatible)

### AI/ML
- **OpenAI GPT-4** - LLM for advisory and Q&A
- **text-embedding-3-small** - Embeddings for semantic search
- **wink-bm25-text-search 3.1.2** - BM25 search algorithm

### Authentication
- **Manus OAuth** - Authentication provider
- **jose 6.1.0** - JWT handling
- **cookie 1.0.2** - Cookie parsing

### Data Processing
- **ExcelJS 4.4.0** - Excel file processing
- **fast-xml-parser 5.3.2** - XML parsing
- **Cheerio 1.1.2** - HTML parsing
- **Playwright 1.57.0** - Web scraping
- **rss-parser 3.13.0** - RSS feed parsing

### Utilities
- **Axios 1.12.2** - HTTP client
- **date-fns 4.1.0** - Date utilities
- **nanoid 5.1.5** - ID generation
- **sort-keys 6.0.0** - Object key sorting
- **superjson 1.13.3** - JSON serialization

### Security
- **Helmet 8.1.0** - Security headers
- **express-rate-limit 8.2.1** - Rate limiting

### Monitoring
- **node-cron 4.2.1** - Cron job scheduling

## Development Tools

### Build Tools
- **esbuild 0.25.0** - Fast bundler
- **tsx 4.19.1** - TypeScript execution
- **pnpm 10.4.1** - Package manager

### Testing
- **Vitest 2.1.4** - Test framework
- **@testing-library/react 16.3.0** - React testing utilities
- **@testing-library/user-event 14.6.1** - User interaction simulation
- **happy-dom 20.0.11** - DOM implementation
- **jsdom 27.3.0** - Alternative DOM implementation

### Code Quality
- **Prettier 3.6.2** - Code formatter
- **ESLint** - Linting (configured)
- **markdownlint-cli 0.47.0** - Markdown linting
- **cspell 9.4.0** - Spell checking

### Database Tools
- **drizzle-kit 0.31.4** - Schema management and migrations
- **better-sqlite3 12.5.0** - SQLite for testing

### Validation
- **ajv 8.17.1** - JSON schema validation
- **ajv-formats 3.0.1** - Format validators

## Infrastructure

### Hosting
- **Manus** - Application hosting and AI infrastructure

### Version Control
- **GitHub** - Repository hosting
- **Git** - Version control

### CI/CD
- **GitHub Actions** - Automated workflows
  - `q-branch-ci.yml` - Branch CI
  - `schema-validation.yml` - Schema validation
  - `repo-tree.yml` - Repository tree generation
  - `ask-isa-smoke.yml` - Smoke tests

### Cloud Services
- **AWS S3** - File storage (optional)
- **OpenAI API** - LLM and embeddings

## Development Commands

### Development
```bash
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm check                  # TypeScript type checking
```

### Testing
```bash
pnpm test                   # Run all tests
pnpm test-unit              # Run unit tests
pnpm test-integration       # Run integration tests
pnpm test-ci                # Run CI test suite
pnpm test-ci:unit           # Run CI unit tests
pnpm test-ci:integration    # Run CI integration tests
pnpm test-db-health         # Run database health tests
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
pnpm canonicalize:advisory  # Canonicalize advisory JSON
pnpm diff:advisory          # Compute advisory diff
```

### Code Quality
```bash
pnpm format                 # Format code with Prettier
pnpm lint:style             # Lint markdown and check spelling
```

### Custom Scripts
```bash
# Gate validation
bash scripts/gates/validate-proof-artifacts.sh

# Security gate
bash scripts/gates/security-gate.sh

# Performance smoke test
bash scripts/gates/perf-smoke.sh

# Reliability smoke test
bash scripts/gates/reliability-smoke.sh

# Observability contract
bash scripts/gates/observability-contract.sh

# Governance gate
bash scripts/gates/governance-gate.sh

# SLO policy check
bash scripts/gates/slo-policy-check.sh

# Generate error budget status
pnpm tsx scripts/sre/generate-error-budget-status.ts

# Generate evidence catalogue
pnpm tsx scripts/sre/generate-evidence-catalogue.ts

# Repository assessment
bash scripts/audit/repo_assessment.sh
```

## Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL` - MySQL/TiDB connection string
- `OPENAI_API_KEY` - OpenAI API key
- `MANUS_CLIENT_ID` - Manus OAuth client ID
- `MANUS_CLIENT_SECRET` - Manus OAuth client secret
- `NODE_ENV` - Environment (development/production)
- `CRON_SECRET` - Secret for cron endpoints

## Package Manager

- **pnpm 10.4.1** - Fast, disk space efficient package manager
- **Patches:** `wouter@3.7.1` (custom patch applied)
- **Overrides:** `tailwindcss>nanoid@3.3.7` (security)

## Node.js Version

- **Required:** Node.js 22.13.0
- **Recommended:** Use nvm or similar for version management

## Browser Support

- Modern browsers with ES2020+ support
- Chrome, Firefox, Safari, Edge (latest versions)

## Performance Considerations

- **Max Old Space Size:** 4096 MB (configured in dev script)
- **Build Optimization:** esbuild for fast bundling
- **Code Splitting:** Vite automatic code splitting
- **Tree Shaking:** Enabled in production builds

## Security Features

- **Helmet:** Security headers middleware
- **Rate Limiting:** Express rate limit middleware
- **CORS:** Configured for Manus hosting
- **OAuth:** Manus OAuth integration
- **Environment Variables:** Sensitive data in .env (not committed)
