# ISA Technology Stack

## Programming Languages

- **TypeScript 5.9.3:** Primary language for frontend and backend
- **JavaScript (ESM):** Node.js scripts and utilities
- **SQL:** Database migrations and queries
- **Python 3.x:** Data processing and validation scripts
- **Shell (Bash):** Automation and CI/CD scripts

## Frontend Stack

### Core Framework
- **React 19.1.1:** UI framework
- **TypeScript 5.9.3:** Type safety
- **Vite 7.1.7:** Build tool and dev server
- **Wouter 3.3.5:** Lightweight routing (patched)

### UI & Styling
- **Tailwind CSS 4.1.14:** Utility-first CSS framework
- **@tailwindcss/vite 4.1.3:** Vite integration
- **shadcn/ui:** Component library (Radix UI primitives)
- **Radix UI:** Accessible component primitives
  - @radix-ui/react-dialog
  - @radix-ui/react-dropdown-menu
  - @radix-ui/react-select
  - @radix-ui/react-tabs
  - [20+ other Radix components]
- **Lucide React 0.453.0:** Icon library
- **Framer Motion 12.23.22:** Animation library
- **next-themes 0.4.6:** Theme management

### State Management & Data Fetching
- **@tanstack/react-query 5.90.2:** Server state management
- **@trpc/client 11.6.0:** Type-safe API client
- **@trpc/react-query 11.6.0:** React Query integration

### Forms & Validation
- **react-hook-form 7.64.0:** Form management
- **@hookform/resolvers 5.2.2:** Validation resolvers
- **zod 4.1.12:** Schema validation

### Data Visualization
- **Recharts 2.15.4:** Chart library
- **ReactFlow 11.11.4:** Flow diagrams
- **Leaflet 1.9.4:** Maps
- **react-leaflet 5.0.0:** React bindings for Leaflet

### Utilities
- **date-fns 4.1.0:** Date manipulation
- **clsx 2.1.1:** Conditional classnames
- **class-variance-authority 0.7.1:** Component variants
- **tailwind-merge 3.3.1:** Tailwind class merging
- **sonner 2.0.7:** Toast notifications

## Backend Stack

### Core Framework
- **Node.js 22.13.0:** Runtime environment
- **Express 4.21.2:** Web framework
- **TypeScript 5.9.3:** Type safety
- **tsx 4.19.1:** TypeScript execution

### API Layer
- **@trpc/server 11.6.0:** Type-safe RPC framework
- **superjson 1.13.3:** JSON serialization with type preservation
- **zod 4.1.12:** Input validation

### Database
- **MySQL/TiDB:** Database system
- **mysql2 3.15.1:** MySQL client
- **Drizzle ORM 0.44.5:** Type-safe ORM
- **drizzle-kit 0.31.4:** Schema management and migrations

### Authentication & Security
- **jose 6.1.0:** JWT handling (Manus OAuth)
- **cookie 1.0.2:** Cookie parsing
- **helmet 8.1.0:** Security headers
- **express-rate-limit 8.2.1:** Rate limiting

### AI & Machine Learning
- **OpenAI GPT-4:** Advisory generation and Q&A
- **text-embedding-3-small:** Semantic search embeddings
- **wink-bm25-text-search 3.1.2:** BM25 search algorithm
- **wink-nlp-utils 2.1.0:** NLP utilities

### Web Scraping
- **Playwright 1.57.0:** Browser automation
- **Cheerio 1.1.2:** HTML parsing
- **axios 1.12.2:** HTTP client
- **rss-parser 3.13.0:** RSS feed parsing

### Data Processing
- **ExcelJS 4.4.0:** Excel file processing
- **fast-xml-parser 5.3.2:** XML parsing
- **xlsx 0.18.5:** Spreadsheet processing

### Utilities
- **dotenv 17.2.2:** Environment variables
- **nanoid 5.1.5:** ID generation
- **node-cron 4.2.1:** Scheduled tasks
- **sort-keys 6.0.0:** Object key sorting
- **streamdown 1.4.0:** Markdown streaming

### PDF Generation
- **jspdf 3.0.4:** PDF generation
- **jspdf-autotable 5.0.2:** PDF tables

### AWS Integration
- **@aws-sdk/client-s3 3.693.0:** S3 client
- **@aws-sdk/s3-request-presigner 3.693.0:** S3 presigned URLs

## Testing Stack

### Test Framework
- **Vitest 2.1.4:** Test runner (Vite-native)
- **vitest.config.ts:** Test configuration
- **vitest.setup.ts:** Global test setup

### Testing Libraries
- **@testing-library/react 16.3.0:** React component testing
- **@testing-library/jest-dom 6.9.1:** DOM matchers
- **@testing-library/user-event 14.6.1:** User interaction simulation
- **happy-dom 20.0.11:** Lightweight DOM implementation
- **jsdom 27.3.0:** DOM implementation

### Test Database
- **better-sqlite3 12.5.0:** In-memory SQLite for tests

## Development Tools

### Build Tools
- **esbuild 0.25.0:** Fast JavaScript bundler
- **@vitejs/plugin-react 5.0.4:** React plugin for Vite
- **vite-plugin-manus-runtime 0.0.56:** Manus runtime integration

### Code Quality
- **Prettier 3.6.2:** Code formatter
- **ESLint:** Linting (configured in .eslintrc.server.json)
- **TypeScript 5.9.3:** Type checking
- **markdownlint-cli 0.47.0:** Markdown linting
- **cspell 9.4.0:** Spell checking

### Package Management
- **pnpm 10.4.1:** Fast, disk-efficient package manager
- **Package Manager:** pnpm@10.4.1+sha512...

### Version Control
- **Git:** Version control
- **GitHub:** Repository hosting
- **GitHub Actions:** CI/CD workflows

## Infrastructure

### Hosting
- **Manus:** Application hosting and AI infrastructure

### Database
- **TiDB:** MySQL-compatible distributed database

### AI Services
- **OpenAI API:** GPT-4 and embeddings

### Monitoring
- **Custom observability:** Pipeline monitoring and health checks

## Development Commands

### Development
```bash
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm check                  # TypeScript type checking
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

### Advisory System
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

### Integration
```bash
pnpm integrate              # Integrate ChatGPT deliverables
```

## Environment Variables

Required environment variables (see .env.example):
- **DATABASE_URL:** MySQL/TiDB connection string
- **OPENAI_API_KEY:** OpenAI API key
- **MANUS_OAUTH_*:** Manus OAuth configuration
- **NODE_ENV:** Environment (development/production)
- **RUN_DB_TESTS:** Enable database tests (true/false)

## Configuration Files

### TypeScript
- **tsconfig.json:** TypeScript compiler configuration
- **Node.js 22.13.0 target**
- **ESM module system**
- **Strict type checking enabled**

### Build Configuration
- **vite.config.ts:** Vite build configuration
- **vitest.config.ts:** Vitest test configuration
- **drizzle.config.ts:** Drizzle ORM configuration

### Code Quality
- **.prettierrc:** Prettier configuration
- **.prettierignore:** Prettier ignore patterns
- **.eslintrc.server.json:** ESLint configuration
- **.markdownlint.json:** Markdown linting rules
- **cspell.json:** Spell checking configuration

### Package Management
- **package.json:** Dependencies and scripts
- **pnpm-lock.yaml:** Locked dependency versions
- **patches/wouter@3.7.1.patch:** Wouter patch

### UI Components
- **components.json:** shadcn/ui configuration

## Node.js Version

**Required:** Node.js 22.13.0

Verify with:
```bash
node --version  # Should output v22.13.0
```

## Package Manager

**Required:** pnpm 10.4.1+

Install with:
```bash
npm install -g pnpm@10.4.1
```

## Browser Support

Modern browsers with ES2020+ support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance Optimizations

- **Code Splitting:** Vite automatic code splitting
- **Tree Shaking:** Dead code elimination
- **Lazy Loading:** React.lazy for route-based splitting
- **Caching:** React Query caching strategies
- **Compression:** Gzip/Brotli compression in production
- **Memory Management:** NODE_OPTIONS='--max-old-space-size=4096'

## Security Features

- **Helmet:** Security headers
- **Rate Limiting:** Express rate limiting
- **Input Validation:** Zod schema validation
- **SQL Injection Protection:** Drizzle ORM parameterized queries
- **XSS Protection:** React automatic escaping
- **CSRF Protection:** Cookie-based authentication
- **OAuth:** Manus OAuth integration
