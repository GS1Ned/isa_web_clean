# ISA Technology Stack

## Programming Languages

### TypeScript 5.9.3
Primary language for both frontend and backend.

**Usage:**
- All client code (React components, hooks, utilities)
- All server code (Express, tRPC, services)
- Shared types and schemas
- Build scripts and automation

**Configuration:** `tsconfig.json`

### JavaScript (ESM)
Used for specific scripts and legacy compatibility.

**Usage:**
- Some build scripts (`.mjs` files)
- Node.js automation scripts
- Migration scripts

### Python 3.x
Used for data processing and validation scripts.

**Usage:**
- Dataset processing (`scripts/datasets/`)
- Validation scripts (`scripts/validation/`)
- Refactoring automation (`scripts/refactor/`)

### SQL
Database schema and migrations.

**Usage:**
- Drizzle migrations (`drizzle/*.sql`)
- Manual database scripts (`scripts/*.sql`)

## Frontend Stack

### React 19.1.1
Modern React with concurrent features.

**Key Features:**
- Functional components with hooks
- Concurrent rendering
- Automatic batching
- Server components (not used)

### Wouter 3.3.5
Lightweight routing library.

**Usage:**
- Client-side routing
- Route parameters and navigation
- Custom patch applied (`patches/wouter@3.7.1.patch`)

### Tailwind CSS 4.1.14
Utility-first CSS framework.

**Configuration:** `tailwind.config.js`
**Plugins:**
- `@tailwindcss/typography` - Typography utilities
- `tailwindcss-animate` - Animation utilities

### shadcn/ui
Component library built on Radix UI.

**Components Used:**
- Accordion, Alert Dialog, Avatar, Checkbox
- Dialog, Dropdown Menu, Hover Card, Label
- Popover, Progress, Radio Group, Scroll Area
- Select, Separator, Slider, Switch, Tabs
- Toggle, Tooltip, and more

**Configuration:** `components.json`

### TanStack Query 5.90.2
Data fetching and caching.

**Usage:**
- API call management
- Cache invalidation
- Optimistic updates
- Background refetching

### tRPC Client 11.6.0
Type-safe API client.

**Usage:**
- Automatic TypeScript types from server
- React Query integration
- Mutation handling

### Additional Frontend Libraries
- `framer-motion` 12.23.22 - Animations
- `recharts` 2.15.4 - Charts and visualizations
- `reactflow` 11.11.4 - Flow diagrams
- `react-leaflet` 5.0.0 - Maps (EUDR geolocation)
- `lucide-react` 0.453.0 - Icons
- `sonner` 2.0.7 - Toast notifications
- `cmdk` 1.1.1 - Command palette
- `react-hook-form` 7.64.0 - Form management
- `zod` 4.1.12 - Schema validation

## Backend Stack

### Node.js 22.13.0
JavaScript runtime.

**Requirements:**
- Node.js 22.13.0 (specified in development)
- ESM module system (`"type": "module"` in package.json)

### Express 4.21.2
Web server framework.

**Middleware:**
- `helmet` 8.1.0 - Security headers
- `express-rate-limit` 8.2.1 - Rate limiting
- `cookie` 1.0.2 - Cookie parsing

### tRPC Server 11.6.0
Type-safe API framework.

**Features:**
- Procedure definitions
- Input validation with Zod
- Middleware support
- Context management

**Configuration:** `server/_core/trpc.ts`

### Drizzle ORM 0.44.5
Type-safe database ORM.

**Features:**
- Schema-first approach
- Automatic TypeScript types
- Migration generation
- Query builder

**Configuration:** `drizzle.config.ts`
**CLI:** `drizzle-kit` 0.31.4

### MySQL 2 (mysql2) 3.15.1
Database driver.

**Usage:**
- Connection pooling
- Prepared statements
- SSL/TLS support
- Compatible with MySQL and TiDB

### Additional Backend Libraries
- `axios` 1.12.2 - HTTP client
- `cheerio` 1.1.2 - HTML parsing (web scraping)
- `playwright` 1.57.0 - Browser automation (web scraping)
- `rss-parser` 3.13.0 - RSS feed parsing
- `node-cron` 4.2.1 - Scheduled tasks
- `exceljs` 4.4.0 - Excel file processing
- `fast-xml-parser` 5.3.2 - XML parsing
- `wink-bm25-text-search` 3.1.2 - BM25 search algorithm
- `nanoid` 5.1.5 - ID generation
- `jose` 6.1.0 - JWT handling
- `dotenv` 17.2.2 - Environment variables

## AI/ML Stack

### OpenAI API
LLM and embedding services.

**Models Used:**
- `gpt-4` - Advisory generation, Q&A responses
- `text-embedding-3-small` - Document embeddings

**Usage:**
- `server/_core/llm.ts` - LLM client
- `server/_core/embedding.ts` - Embedding generation
- `server/embedding.ts` - Batch embedding generation

### Vector Search
Hybrid search combining BM25 and vector similarity.

**Implementation:**
- BM25: `wink-bm25-text-search` library
- Vector: Cosine similarity on embeddings
- Hybrid: Weighted combination of scores

## Build Tools

### Vite 7.1.7
Frontend build tool and dev server.

**Features:**
- Fast HMR (Hot Module Replacement)
- ESM-based development
- Optimized production builds
- Plugin ecosystem

**Configuration:** `vite.config.ts`
**Plugins:**
- `@vitejs/plugin-react` 5.0.4 - React support
- `vite-plugin-manus-runtime` 0.0.56 - Manus integration
- `@builder.io/vite-plugin-jsx-loc` 0.1.1 - JSX location tracking

### esbuild 0.25.0
Backend bundler.

**Usage:**
- Bundle server code for production
- Fast compilation
- Tree shaking

**Command:** `esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist`

### tsx 4.19.1
TypeScript execution for development.

**Usage:**
- Run TypeScript files directly
- Watch mode for development
- Script execution

**Command:** `tsx watch server/_core/index.ts`

## Testing Stack

### Vitest 2.1.4
Test framework.

**Features:**
- Vite-powered testing
- Jest-compatible API
- Fast execution
- Watch mode

**Configuration:** `vitest.config.ts`, `vitest.setup.ts`

### Testing Library
React component testing.

**Libraries:**
- `@testing-library/react` 16.3.0 - React testing utilities
- `@testing-library/jest-dom` 6.9.1 - DOM matchers
- `@testing-library/user-event` 14.6.1 - User interaction simulation

### Test Environments
- `happy-dom` 20.0.11 - Lightweight DOM implementation
- `jsdom` 27.3.0 - Full DOM implementation

## Development Tools

### Package Manager: pnpm 10.4.1
Fast, disk-efficient package manager.

**Features:**
- Content-addressable storage
- Strict dependency resolution
- Workspace support
- Patch support

**Configuration:** `pnpm-lock.yaml`, `.pnpmfile.cjs`

### Code Quality Tools

#### Prettier 3.6.2
Code formatter.

**Configuration:** `.prettierrc`, `.prettierignore`

#### ESLint
Linting (server-side).

**Configuration:** `.eslintrc.server.json`

#### markdownlint-cli 0.47.0
Markdown linting.

**Configuration:** `.markdownlint.json`

#### cspell 9.4.0
Spell checker.

**Configuration:** `cspell.json`
**Dictionaries:** `@cspell/dict-en-gb` 5.0.20

### Version Control

#### Git
Version control system.

**Configuration:** `.gitignore`

#### GitHub
Remote repository and CI/CD.

**Workflows:** `.github/workflows/`
- `q-branch-ci.yml` - Main CI pipeline
- `repo-tree.yml` - Repository tree generation
- `schema-validation.yml` - Schema validation
- `validate-docs.yml` - Documentation validation
- `refactoring-validation.yml` - Refactoring checks

## Infrastructure

### Hosting: Manus
Platform hosting and infrastructure.

**Features:**
- OAuth authentication
- Runtime environment
- Database hosting (TiDB)

### Database: TiDB (MySQL-compatible)
Distributed SQL database.

**Features:**
- MySQL compatibility
- Horizontal scalability
- ACID transactions
- SSL/TLS support

### Authentication: Manus OAuth
OAuth 2.0 authentication.

**Implementation:** `server/_core/oauth.ts`

## Development Commands

### Installation
```bash
pnpm install
```

### Development
```bash
pnpm dev                    # Start dev server (frontend + backend)
```

### Building
```bash
pnpm build                  # Build for production
pnpm start                  # Start production server
```

### Type Checking
```bash
pnpm check                  # TypeScript type checking (no emit)
```

### Testing
```bash
pnpm test                   # Run all tests
pnpm test-unit              # Run unit tests
pnpm test-integration       # Run integration tests (requires DB)
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

### Advisory Operations
```bash
pnpm validate:advisory      # Validate advisory schema
pnpm canonicalize:advisory  # Canonicalize advisory format
pnpm diff:advisory          # Compute advisory diff
```

### Code Quality
```bash
pnpm format                 # Format code with Prettier
pnpm lint:style             # Lint markdown and check spelling
```

## Environment Variables

### Required Variables
- `DATABASE_URL` - MySQL/TiDB connection string
- `OPENAI_API_KEY` - OpenAI API key
- `MANUS_CLIENT_ID` - Manus OAuth client ID
- `MANUS_CLIENT_SECRET` - Manus OAuth client secret

### Optional Variables
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `RUN_DB_TESTS` - Enable database tests (true/false)

**Configuration:** `.env` (local), `.env.example` (template)

## Browser Support

### Target Browsers
Modern browsers with ES2020+ support:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

### Polyfills
None required (modern browser target).

## Performance Considerations

### Frontend
- Code splitting via Vite
- Lazy loading of routes
- React Query caching
- Optimistic updates

### Backend
- Database connection pooling
- Rate limiting
- Response caching
- Batch operations

### Database
- Indexed queries
- Prepared statements
- Connection pooling
- Query optimization

## Security

### Frontend
- Content Security Policy (CSP)
- XSS protection
- CSRF protection via SameSite cookies

### Backend
- Helmet security headers
- Rate limiting
- Input validation (Zod)
- SQL injection protection (Drizzle ORM)
- OAuth authentication

### Database
- SSL/TLS connections
- Prepared statements
- Least privilege access

## Monitoring and Observability

### Logging
- `server/utils/server-logger.ts` - Structured logging
- `server/utils/pipeline-logger.ts` - Pipeline-specific logging

### Error Tracking
- `server/_core/error-tracking.ts` - Error tracking service
- `server/db-error-tracking.ts` - Database error logging

### Performance Monitoring
- `server/_core/performance-monitoring.ts` - Performance tracking
- `server/db-performance-tracking.ts` - Database performance

### Health Checks
- `server/health.ts` - Health check endpoints
- `scripts/probe/` - Health check scripts
