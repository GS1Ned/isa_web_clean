# ISA Project Context for Claude Code

**Repository:** https://github.com/GS1Ned/isa_web_clean  
**Branch:** `isa_web_clean_Q_branch` (active development branch)  
**Live:** https://www.gs1isa.com | https://isa-standards-cozu6eot.manus.space

---

## What ISA Is

Sustainability compliance intelligence platform connecting EU ESG regulations to GS1 standards through AI-powered analysis. 6 core capabilities: ASK_ISA (RAG Q&A), NEWS_HUB (regulatory news), KNOWLEDGE_BASE (vector search), CATALOG (regulations/standards), ESRS_MAPPING (regulation-to-standard mappings), ADVISORY (versioned reports).

**Current State:**
- 38 EU regulations tracked
- 1,184 ESRS datapoints (EFRAG IG3)
- 60+ GS1 standards cataloged
- 450+ AI-generated mappings
- 14 news sources (100% health rate)
- 517/574 tests passing (90.1%)
- Phase 3 documentation: 8/36 complete (22%)

---

## Technology Stack

**Frontend:**
- React 19.1.1 + TypeScript 5.9.3
- Vite 7.1.7 (dev server + build)
- Tailwind CSS 4.1.14 + shadcn/ui
- Wouter 3.3.5 (routing)
- tRPC 11.6.0 client
- TanStack Query 5.90.2

**Backend:**
- Node.js 22.13.0 + Express 4.21.2
- tRPC 11.6.0 server
- Drizzle ORM 0.44.5 + mysql2 3.15.1
- TiDB (MySQL-compatible)
- OpenAI API (GPT-4 + text-embedding-3-small)
- Playwright 1.57.0 (web scraping)

**Build/Test:**
- pnpm 10.4.1 (package manager)
- esbuild 0.25.0 (server bundler)
- Vitest 2.1.4 (testing)
- tsx 4.19.1 (dev execution)

---

## Repository Structure

```
isa_web_clean/
├── client/src/              # React 19 frontend
│   ├── pages/              # Wouter routes
│   ├── components/         # shadcn/ui components
│   └── lib/trpc.ts         # tRPC client
├── server/                  # Express + tRPC backend
│   ├── _core/              # Server infrastructure
│   ├── routers/            # 40+ tRPC routers
│   ├── services/           # Business logic
│   ├── ingest/             # Data pipelines
│   └── news/               # News scraping
├── drizzle/                 # Database layer
│   ├── schema*.ts          # 100+ tables
│   └── migrations/         # SQL migrations
├── data/                    # Datasets (JSON/CSV)
│   ├── efrag/              # 1,184 ESRS datapoints
│   ├── gs1/                # 60+ standards
│   └── metadata/           # Dataset registry
├── docs/                    # Documentation
│   ├── governance/_root/   # ISA_GOVERNANCE.md
│   ├── planning/           # INDEX.md, NEXT_ACTIONS.json
│   └── spec/               # Capability specs
├── scripts/                 # Automation
└── .amazonq/rules/         # AI agent configuration
    └── memory-bank/        # Product, structure, tech, guidelines
```

---

## Environment Configuration

### Required Variables

```bash
# Database
DATABASE_URL="mysql://user:pass@host:port/db?ssl=true"

# OpenAI
OPENAI_API_KEY="sk-..."

# Manus OAuth
MANUS_CLIENT_ID="..."
MANUS_CLIENT_SECRET="..."

# Cron Security
CRON_SECRET="..."  # Currently: "change-me-in-production" (unsafe default)
```

### Optional Variables

```bash
NODE_ENV="development"  # or "production"
PORT="3000"
RUN_DB_TESTS="true"     # Enable database integration tests
```

### Configuration Files

- `.env` - Local environment (gitignored)
- `.env.example` - Template with all required vars
- `vite.config.ts` - Frontend build config
- `tsconfig.json` - TypeScript config
- `drizzle.config.ts` - Database config
- `vitest.config.ts` - Test config

---

## Database Schema

**100+ tables across 8 schema files:**

- `schema.ts` - Core (regulations, standards, knowledge_base, knowledge_embeddings)
- `schema_news_hub.ts` - News (hub_news, scraper_health, scraper_executions)
- `schema_advisory_reports.ts` - Advisory system
- `schema_gs1_esrs_mappings.ts` - Regulation-to-standard mappings
- `schema_dataset_registry.ts` - Dataset metadata
- `schema_esg_artefacts.ts` - ESG compliance data
- `schema_gs1_attributes.ts` - GS1 attribute catalog
- `relations.ts` - Table relationships

**Key Tables:**
- `knowledge_embeddings` - 155 chunks with vector embeddings
- `hub_news` - 14 sources, daily ingestion
- `regulations` - 38 EU regulations
- `gs1_standards` - 60+ standards
- `esrs_datapoints` - 1,184 datapoints
- `gs1_esrs_mappings` - 450+ mappings

---

## Development Commands

```bash
# Install
pnpm install

# Development (starts both client + server)
pnpm dev

# Build
pnpm build              # Production build
pnpm start              # Start production server

# Testing
pnpm test               # All tests
pnpm test-unit          # Unit tests only
pnpm test-integration   # Integration tests (requires DB)
pnpm test-db-health     # Database health check

# Type Checking
pnpm check              # TypeScript check (no emit)

# Database
pnpm db:push            # Generate and run migrations

# Data Operations
pnpm verify:data        # Verify dataset integrity
pnpm ingest:esrs        # Ingest ESRS datapoints

# Code Quality
pnpm format             # Prettier
pnpm lint:style         # Markdown + spelling
```

---

## Current Amazon Q Setup

### Active MCP Servers

1. **Postgres MCP** - Database queries, health checks, schema validation
2. **Filesystem MCP** - File read/write operations
3. **Git MCP** - Version control operations
4. **Fetch MCP** - URL validation, static HTML retrieval
5. **Puppeteer MCP** - JavaScript-rendered pages, screenshots
6. **Sequential Thinking MCP** - Complex multi-step planning
7. **Memory MCP** - Cross-session context persistence

### Evidence Logging

All MCP operations logged to: `docs/evidence/_generated/mcp_log.md`

Format: timestamp, task, server, trigger_id, inputs, outputs, errors, fallback

### Working Patterns

- Lean context by default, expand when needed
- Batch file operations (read multiple files in one call)
- Test after changes, document failures
- Evidence-first investigation (read files before asking)
- Incremental commits with conventional messages

---

## Current Development Focus

### Phase 3: Capability Documentation Refactoring

**Goal:** Consolidate 167 scattered docs → 39 target docs (6 per capability)

**Progress:** 8/36 complete (22%)
- ASK_ISA: 6/6 ✅ (CAPABILITY_SPEC, API_REFERENCE, IMPLEMENTATION_GUIDE, TESTING_GUIDE, DEPLOYMENT, TROUBLESHOOTING)
- NEWS_HUB: 2/6 (CAPABILITY_SPEC, API_REFERENCE)
- KNOWLEDGE_BASE: 0/6
- CATALOG: 0/6
- ESRS_MAPPING: 0/6
- ADVISORY: 0/6

**Remaining:** 28 documents, estimated 84-112 hours

### Known Issues

**Test Failures:** 57 non-critical failures
- Mocking issues (tRPC context, database mocks)
- Async timing (race conditions, timeouts)
- Deprecated APIs (old test utilities)

**Documentation Conflicts:** 23 documented conflicts across capabilities
- Duplicate runtime contracts
- Version discrepancies
- Outdated metrics

**Governance Gaps:**
- Manual governance checks (no automation)
- Missing validation gates
- Incomplete evidence markers

---

## Key Files to Understand ISA

### Governance & Planning
- `docs/governance/_root/ISA_GOVERNANCE.md` - Authoritative governance framework
- `docs/planning/INDEX.md` - Canonical planning index
- `docs/planning/NEXT_ACTIONS.json` - Execution queue
- `docs/planning/refactoring/PHASE_3_PROGRESS.md` - Current progress

### Architecture & Specs
- `docs/REPO_MAP.md` - Evidence-bound repository map
- `docs/spec/ARCHITECTURE.md` - System architecture
- `docs/spec/ASK_ISA/` - Complete ASK_ISA capability docs (reference template)
- `docs/spec/NEWS_HUB/` - Partial NEWS_HUB docs (in progress)

### Memory Bank (AI Agent Context)
- `.amazonq/rules/memory-bank/product.md` - Product overview
- `.amazonq/rules/memory-bank/structure.md` - Repository structure
- `.amazonq/rules/memory-bank/tech.md` - Technology stack
- `.amazonq/rules/memory-bank/guidelines.md` - Development guidelines

### Code Entry Points
- `client/src/main.tsx` - Frontend entry
- `server/_core/index.ts` - Backend entry
- `server/routers.ts` - Root tRPC router
- `drizzle/schema.ts` - Main database schema

---

## ISA Code Patterns

### tRPC Procedure
```typescript
export const router = router({
  procedure: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      return await db.select().from(table).where(eq(table.id, input.id));
    }),
});
```

### Drizzle Query
```typescript
const results = await db
  .select()
  .from(tableName)
  .where(and(eq(tableName.active, true), gte(tableName.createdAt, date)))
  .orderBy(desc(tableName.createdAt))
  .limit(20);
```

### React Component
```typescript
export default function Component() {
  const { data, isLoading } = trpc.router.procedure.useQuery({ id: 'x' });
  const mutation = trpc.router.mutate.useMutation({
    onSuccess: () => toast({ title: 'Success' }),
  });
  if (isLoading) return <div>Loading...</div>;
  return <div>{data?.name}</div>;
}
```

---

## User Working Style

**Preferences:**
- Evidence-first (investigate before asking)
- Incremental changes (small PRs, frequent commits)
- Governance-aware (read ISA_GOVERNANCE.md before critical changes)
- Proactive tool usage (use MCP servers automatically)
- Continuous documentation (update docs with code)

**Expectations:**
- Read files before discussing content
- Query database before claiming numbers
- Test changes before claiming completion
- Document decisions with rationale
- Commit to `isa_web_clean_Q_branch` (not main)

**Communication:**
- Minimal questions (investigate first)
- Evidence-based responses (cite files, line numbers)
- Actionable recommendations (with commands to run)
- Clear rollback paths (for all changes)

---

## What to Explore

**Claude 4.6 Capabilities:**
- Extended context window size and optimal usage
- Improved code understanding for multi-file refactoring
- Enhanced tool use (MCP integration, parallel calls)
- Adaptive thinking modes (when to use deep reasoning)
- VS Code integration features (shortcuts, multi-file edits, inline suggestions)

**Potential Optimizations:**
- MCP servers to add (Ripgrep, Code Index, ESLint, Markdownlint, DuckDuckGo Search)
- VS Code settings for optimal Claude Code performance
- Automation opportunities (test generation, documentation, governance validation)
- Development workflow improvements (faster iteration, less context switching)
- Integration with GitHub Copilot (when to use each tool)

**High-Impact Areas:**
- Complete Phase 3 documentation (28 docs remaining)
- Fix 57 test failures (automated analysis and fixes)
- Implement governance validation gates (automated compliance checks)
- Enhance pipeline observability (real-time dashboards, alerting)
- Optimize development workflow (Claude Code configuration)

---

**Context Status:** Complete  
**Last Updated:** 2026-02-12  
**Branch:** isa_web_clean_Q_branch  
**Next:** Investigate Claude 4.6 capabilities and proactively optimize ISA development
