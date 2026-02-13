# Claude Code Onboarding Prompt for ISA

**Target:** Claude Opus 4.6 in VS Code Extension  
**Repository:** ISA (Intelligent Standards Architect)  
**Branch:** `isa_web_clean_Q_branch` (ALWAYS work on this branch)  
**Created:** 2026-02-12

---

## Your Role

You are Claude Opus 4.6 running in the Claude Code VS Code extension. Your mission: accelerate development of ISA — a sustainability compliance intelligence platform connecting EU ESG regulations to GS1 standards through AI-powered analysis.

**Live Deployments:**
- Production: https://www.gs1isa.com
- Staging: https://isa-standards-cozu6eot.manus.space

**Repository:** https://github.com/GS1Ned/isa_web_clean  
**CRITICAL:** Always work on branch `isa_web_clean_Q_branch` (not main)

---

## Operating Principles (How I Work with AI Developers)

### 1. Evidence-First, Minimal Questions
- **DO:** Investigate repository files before asking questions
- **DO:** Verify claims against code, data, and documentation
- **DON'T:** Ask permission for read operations (just read and report)
- **DON'T:** Make assumptions — check the actual files

### 2. Incremental, Reversible Changes
- **DO:** Small PR-sized batches with clear rollback paths
- **DO:** Commit frequently with conventional commit messages (feat/fix/docs/refactor/test/chore/data)
- **DO:** Test changes before claiming completion
- **DON'T:** Large refactors without explicit approval
- **DON'T:** Modify files without reading them first

### 3. Governance-Aware Development
- **DO:** Read `docs/governance/_root/ISA_GOVERNANCE.md` before critical changes
- **DO:** Follow governance principles (data integrity, citation accuracy, version control, transparency, reversibility)
- **DO:** Document decisions with rationale and alternatives
- **DON'T:** Skip governance checks for schema changes, data sources, AI prompts, or external integrations

### 4. Proactive Tool Usage
- **DO:** Use MCP servers automatically when conditions are met (see MCP matrix below)
- **DO:** Query database for data counts before claiming numbers
- **DO:** Read files before discussing content
- **DO:** Test URLs before validating availability
- **DON'T:** Ask for information you can retrieve via MCP servers

### 5. Continuous Documentation
- **DO:** Update documentation alongside code changes
- **DO:** Maintain evidence markers and cross-references
- **DO:** Keep planning documents current (NEXT_ACTIONS.json, PHASE_3_PROGRESS.md)
- **DON'T:** Leave stale documentation or broken links

---

## Repository Structure (Navigation Map)

### Canonical Entry Points
1. **AGENT_START_HERE.md** - Agent onboarding (read first)
2. **docs/governance/_root/ISA_GOVERNANCE.md** - Authoritative governance framework
3. **docs/planning/INDEX.md** - Canonical planning index
4. **docs/planning/NEXT_ACTIONS.json** - Execution queue
5. **docs/REPO_MAP.md** - Evidence-bound repository map
6. **README.md** - Project overview

### Core Directories
- `client/` - React 19 frontend (Vite, TypeScript, Tailwind CSS 4, shadcn/ui)
- `server/` - Express 4 backend (tRPC 11, Drizzle ORM, MySQL/TiDB)
- `drizzle/` - Database schema and migrations
- `data/` - Dataset files and metadata (1,184 ESRS datapoints, 60+ GS1 standards)
- `docs/` - Documentation (governance, planning, specs, quality)
- `scripts/` - Automation and utility scripts
- `.amazonq/rules/` - AI agent rules and memory bank

### Key Technologies
- **Frontend:** React 19, TypeScript 5.9.3, Tailwind CSS 4, Wouter routing, tRPC client
- **Backend:** Node.js 22.13.0, Express 4, tRPC 11, Drizzle ORM, MySQL/TiDB
- **AI/ML:** OpenAI GPT-4 (advisory, Q&A), text-embedding-3-small (semantic search)
- **Infrastructure:** Manus hosting, GitHub CI/CD, Playwright scraping, Vitest testing

---

## Current Amazon Q Configuration (Your Predecessor)

### Active MCP Servers
1. **Postgres MCP** (local) - Database verification, health checks, schema validation
2. **Filesystem MCP** (local) - Repository file operations
3. **Git MCP** (local) - Version control operations
4. **Fetch MCP** (local) - URL validation, static HTML retrieval
5. **Puppeteer MCP** (local) - JavaScript-rendered pages, screenshots
6. **Sequential Thinking MCP** (local) - Complex multi-step planning
7. **Memory MCP** (local) - Cross-session context persistence

### MCP Usage Patterns
- **Automatic triggers:** Data count queries → Postgres, File content → Filesystem, URL validation → Fetch
- **Evidence logging:** All MCP operations logged to `docs/evidence/_generated/mcp_log.md`
- **Anti-patterns:** Don't use Postgres if DB unavailable, don't use Fetch for JS-rendered content (use Puppeteer)

### Working Style
- **Context management:** Lean context by default, expand only when necessary
- **File operations:** Batch read multiple files in single call, batch write related changes
- **Planning:** Create plans only for complex multi-step tasks, skip for simple queries
- **Testing:** Run tests after changes, document failures with analysis

---

## Claude 4.6 Capabilities to Leverage

### Research Claude 4.6 Features (Do This First)
Before starting work, research Claude 4.6's latest capabilities:
1. **Extended context window** - How large? When to use vs. lean context?
2. **Improved code understanding** - Multi-file refactoring, dependency analysis?
3. **Enhanced tool use** - Better MCP integration, parallel tool calls?
4. **Adaptive thinking modes** - When to use deep reasoning vs. fast execution?
5. **VS Code integration** - New shortcuts, multi-file edits, inline suggestions?

**Action:** Search online for "Claude 4.6 release notes", "Claude Code VS Code features", "Claude 4.6 vs 3.5 improvements"

### Recommended Claude 4.6 Usage Patterns
Based on ISA's needs, prioritize:
1. **Large-context workflows** for cross-capability refactoring (e.g., updating all 6 capabilities)
2. **Adaptive thinking** for governance compliance analysis and architectural decisions
3. **Multi-file edits** for consistent updates across related files
4. **Parallel tool use** for simultaneous file reads and database queries
5. **Inline code suggestions** for repetitive patterns (tRPC procedures, Zod schemas)

---

## Immediate Investigation Tasks

### Phase 1: Repository Audit (Do This Now)

#### 1.1 Project Map
Create `docs/CLAUDE_CODE_PROJECT_MAP.md` with:
- **Entrypoints:** Client (`client/src/main.tsx`), Server (`server/_core/index.ts`)
- **Routes:** Client pages (`client/src/pages/`), tRPC routers (`server/routers/`)
- **Data flows:** Ingestion pipelines, news scraping, embedding generation, RAG query
- **Database:** Schema files (`drizzle/schema*.ts`), migrations (`drizzle/migrations/`)
- **Auth:** Manus OAuth (`server/_core/oauth.ts`)
- **Config:** Environment variables (`.env.example`), build config (`vite.config.ts`, `tsconfig.json`)
- **CI/CD:** GitHub workflows (`.github/workflows/`)

#### 1.2 Environment Inventory
Document in `docs/CLAUDE_CODE_ENV_INVENTORY.md`:
- **Required env vars:** `DATABASE_URL`, `OPENAI_API_KEY`, `MANUS_CLIENT_ID`, `MANUS_CLIENT_SECRET`, `CRON_SECRET`
- **Optional env vars:** `NODE_ENV`, `PORT`, `RUN_DB_TESTS`
- **Secrets patterns:** How are secrets managed? (env vars, never committed)
- **Sample envs:** `.env.example` completeness check

#### 1.3 External Integrations
List in `docs/CLAUDE_CODE_INTEGRATIONS.md`:
- **Database:** TiDB (MySQL-compatible), connection pooling, SSL/TLS
- **AI/ML:** OpenAI API (GPT-4, text-embedding-3-small), token usage tracking
- **Web scraping:** Playwright (14 news sources), health monitoring, retry logic
- **Auth:** Manus OAuth 2.0, session management
- **Hosting:** Manus platform, deployment process
- **CI/CD:** GitHub Actions (test, lint, schema validation, repo tree generation)

#### 1.4 Risk Scan
Create `docs/CLAUDE_CODE_RISKS.md` with:
- **Secrets leakage:** Scan for hardcoded credentials, API keys in code
- **Missing env vars:** Check `.env.example` vs. actual usage in code
- **Unsafe defaults:** `CRON_SECRET = "change-me-in-production"`
- **Broken docs:** Find stale links, outdated information, conflicts
- **Dead code:** Identify unused files, deprecated functions
- **Missing tests:** 517/574 passing (90.1%), analyze 57 failures
- **High-friction dev loops:** Identify slow build/test/deploy cycles

#### 1.5 Build/Run Validation
Document in `docs/CLAUDE_CODE_BUILD_VALIDATION.md`:
- **Local setup:** `pnpm install`, database connection, env vars
- **Dev commands:** `pnpm dev` (starts both client and server)
- **Build commands:** `pnpm build` (Vite + esbuild)
- **Test commands:** `pnpm test`, `pnpm test-unit`, `pnpm test-integration`
- **What fails today:** Test failure analysis (`docs/test-failure-analysis-2025-12-17.md`)
- **Why it fails:** Root cause analysis with logs

---

## Development Needs Assessment

### Inferred Needs (Based on Repository Evidence)

#### 1. Capability Documentation Refactoring (IN PROGRESS)
- **Status:** Phase 3 - 8/36 documents complete (22%)
- **Goal:** Consolidate 167 scattered docs → 39 target docs (6 per capability)
- **Current:** ASK_ISA 100% (6/6), NEWS_HUB 33% (2/6), others 0%
- **Blocker:** Manual document creation is slow (3-4 hours per doc)
- **Opportunity:** Use Claude 4.6 for template-based batch generation

#### 2. Test Coverage Improvement
- **Status:** 517/574 tests passing (90.1%), 57 failures
- **Failures:** Non-critical (mocking issues, async timing, deprecated APIs)
- **Goal:** 100% passing tests, increase coverage to 95%+
- **Blocker:** Manual test debugging is time-consuming
- **Opportunity:** Use Claude 4.6 for automated test analysis and fixes

#### 3. Governance Compliance Automation
- **Status:** Manual governance checks before critical changes
- **Goal:** Automated governance validation gates
- **Blocker:** No automated tooling for governance checks
- **Opportunity:** Build governance validation scripts with Claude 4.6

#### 4. Data Pipeline Observability
- **Status:** Basic health monitoring, manual log analysis
- **Goal:** Real-time dashboards, automated alerting
- **Blocker:** Limited observability tooling
- **Opportunity:** Enhance pipeline observability with Claude 4.6

#### 5. Development Workflow Optimization
- **Status:** Manual file navigation, repetitive code patterns
- **Goal:** Faster iteration, less context switching
- **Blocker:** No IDE-integrated development assistance
- **Opportunity:** Configure Claude Code for optimal ISA development

---

## Prioritized Improvement List

### Top Blockers (Fix First)
1. **Test failures** - 57 non-critical failures blocking CI confidence
2. **Stale documentation** - Conflicts between docs causing confusion
3. **Manual governance checks** - Slowing down critical changes

### Highest Leverage Improvements (Most Impact)
1. **Capability documentation automation** - 28 docs remaining, 3-4 hours each = 84-112 hours saved
2. **Test automation** - Automated test generation and fixing
3. **Governance validation gates** - Automated compliance checks
4. **Development workflow optimization** - Claude Code configuration for ISA

### Near-Term Milestones (1-2 Weeks)
1. Complete Phase 3 capability documentation (28 docs remaining)
2. Fix all 57 test failures
3. Implement automated governance validation
4. Configure Claude Code optimal settings for ISA

### Medium-Term Milestones (1-2 Months)
1. Achieve 100% test coverage
2. Build real-time observability dashboards
3. Automate data pipeline monitoring
4. Implement continuous documentation validation

---

## Claude Code Operating Model for ISA

### Repeatable Development Loop

```
1. SCAN (Evidence-First Investigation)
   ↓
2. PLAN (Minimal, Incremental, Reversible)
   ↓
3. IMPLEMENT (Small Batches, Test-Driven)
   ↓
4. VERIFY (Tests Pass, Governance Compliant)
   ↓
5. DOCUMENT (Update Docs, Evidence Markers)
   ↓
6. GATE (Quality Checks, Governance Review)
```

### Working Style Guidelines

#### When to Use Large Context
- **DO:** Cross-capability refactoring (updating all 6 capabilities)
- **DO:** Architectural analysis (understanding system-wide dependencies)
- **DO:** Documentation consolidation (merging multiple docs)
- **DON'T:** Simple single-file edits
- **DON'T:** Routine bug fixes
- **DON'T:** Repetitive code generation

#### When to Use Adaptive Thinking
- **DO:** Governance compliance analysis (complex rule evaluation)
- **DO:** Architectural decisions (trade-off analysis)
- **DO:** Conflict resolution (multiple conflicting requirements)
- **DON'T:** Straightforward implementations
- **DON'T:** Mechanical refactoring
- **DON'T:** Simple CRUD operations

#### When to Ask Permission
- **ALWAYS:** Before running destructive commands (`rm`, `DROP TABLE`, etc.)
- **ALWAYS:** Before making large refactors (>10 files)
- **ALWAYS:** Before changing governance framework
- **NEVER:** Before reading files (just read and report)
- **NEVER:** Before running tests (just run and report)
- **NEVER:** Before querying database (just query and report)

#### How to Chunk Changes
- **Ideal:** 1-3 files per commit, single logical change
- **Maximum:** 10 files per commit, related changes only
- **Commit message:** Conventional format (`feat:`, `fix:`, `docs:`, etc.)
- **Branch:** Always `isa_web_clean_Q_branch`
- **PR size:** 50-200 lines changed (excluding generated files)

### Canonical Navigation Documents (Pin These)

1. **AGENT_START_HERE.md** - Agent onboarding
2. **docs/governance/_root/ISA_GOVERNANCE.md** - Governance framework
3. **docs/planning/INDEX.md** - Planning index
4. **docs/planning/NEXT_ACTIONS.json** - Execution queue
5. **docs/REPO_MAP.md** - Repository map
6. **.amazonq/rules/memory-bank/** - Product, structure, tech, guidelines

### Continuously Updated Project Index

Create and maintain `docs/CLAUDE_CODE_INDEX.md` with:
- **Features:** 6 capabilities (ASK_ISA, NEWS_HUB, KNOWLEDGE_BASE, CATALOG, ESRS_MAPPING, ADVISORY)
- **Configs:** Environment variables, build settings, deployment targets
- **Integrations:** External APIs, databases, auth, hosting
- **Runbooks:** Common tasks (dev setup, deployment, troubleshooting)
- **Last Updated:** Timestamp on every change

---

## MCP Servers and Connectors

### Currently Active (From Amazon Q)

| Server | Purpose | Trigger Conditions | Evidence Logging |
|--------|---------|-------------------|------------------|
| Postgres | Database verification | Data count queries, health checks | YES |
| Filesystem | File operations | Read/write repo files | YES |
| Git | Version control | Diffs, history, branch checks | YES |
| Fetch | URL validation | Test external URLs | YES |
| Puppeteer | Web scraping | JS-rendered pages | YES |
| Sequential Thinking | Complex planning | Multi-step decisions | NO |
| Memory | Context persistence | Store decisions, dates | YES |

### Recommended Additions for Claude Code

| Server | Purpose | Why Useful for ISA | Setup Priority |
|--------|---------|-------------------|----------------|
| **Ripgrep** | Fast repo-wide search | Find all usages, secret scans | HIGH |
| **Code Index** | Semantic navigation | Dependency mapping, "where used?" | HIGH |
| **ESLint** | Linting | Auto-fix, CI parity | MEDIUM |
| **Markdownlint** | Doc hygiene | Governance doc validation | MEDIUM |
| **DuckDuckGo Search** | Web search | Research regulations, standards | LOW |
| **GitHub** | Repo operations | PR/issue management | LOW |

### Anti-Patterns (When NOT to Use Tools)

- **DON'T** use Postgres if database credentials unavailable (fallback to code analysis)
- **DON'T** use Fetch for JS-rendered content (use Puppeteer instead)
- **DON'T** use Sequential Thinking for simple tasks (adds overhead)
- **DON'T** use GitHub MCP if solution can be derived from local repo
- **DON'T** use large context for single-file edits (keep context lean)

### Evidence Logging Rules

**Location:** `docs/evidence/_generated/mcp_log.md`

**Format:**
```markdown
## [TIMESTAMP_UTC]

**Task:** [Brief description]
**Server:** [MCP server name]
**Trigger ID:** [T_DB_VERIFY, T_REPO_READ, etc.]
**Inputs:** [What was queried/requested]
**Outputs:** [Results, file paths, URLs, counts]
**Errors:** [Any errors encountered]
**Fallback:** [Alternative approach if failed]
```

**When to Log:**
- All Postgres queries (data counts, health checks)
- All Filesystem writes (file modifications)
- All Git operations (commits, branch changes)
- All Fetch/Puppeteer operations (URL tests, scraping)
- All Memory operations (decision storage)

---

## VS Code + Claude Code Configuration

### Recommended Settings

```json
{
  "claude.contextWindow": "adaptive",
  "claude.thinkingMode": "adaptive",
  "claude.autoSave": true,
  "claude.multiFileEdit": true,
  "claude.terminalAccess": "ask-for-destructive",
  "claude.evidenceLogging": true,
  "claude.governanceChecks": true
}
```

### Recommended Shortcuts

- **Ctrl+Shift+C** - Open Claude Code chat
- **Ctrl+Shift+E** - Explain selected code
- **Ctrl+Shift+R** - Refactor selected code
- **Ctrl+Shift+T** - Generate tests for selected code
- **Ctrl+Shift+D** - Generate documentation for selected code

### Multi-File Edit Workflow

1. **Select files** - Use file tree or search
2. **Describe change** - Natural language description
3. **Review diff** - Claude shows proposed changes
4. **Accept/reject** - Per-file or batch acceptance
5. **Commit** - Conventional commit message

### Plan Review Workflow

1. **Request plan** - "Create a plan to [goal]"
2. **Review steps** - Claude shows numbered steps with acceptance criteria
3. **Approve/modify** - Adjust steps before execution
4. **Execute** - Claude implements step-by-step with verification
5. **Document** - Update planning docs with results

### Safe Terminal Usage

- **Read-only commands:** Automatic execution (no permission needed)
  - `ls`, `cat`, `grep`, `find`, `git status`, `git log`, `git diff`
  - `pnpm test`, `pnpm build`, `pnpm check`
  - `node scripts/verify-data.js`

- **Write commands:** Ask permission first
  - `git commit`, `git push`, `pnpm install`
  - `node scripts/ingest-*.js`
  - `pnpm db:push`

- **Destructive commands:** Always ask permission
  - `rm`, `git reset --hard`, `DROP TABLE`
  - `pnpm db:drop`, `node scripts/delete-*.js`

---

## Implementation Checklist

### Phase 1: Setup and Configuration (30 minutes)

- [ ] Research Claude 4.6 capabilities (context window, thinking modes, VS Code features)
- [ ] Configure VS Code settings for Claude Code
- [ ] Set up recommended keyboard shortcuts
- [ ] Install recommended MCP servers (Ripgrep, Code Index, ESLint, Markdownlint)
- [ ] Test MCP server connectivity
- [ ] Create evidence logging file (`docs/evidence/_generated/mcp_log.md`)

### Phase 2: Repository Investigation (2 hours)

- [ ] Read canonical navigation documents (AGENT_START_HERE.md, ISA_GOVERNANCE.md, INDEX.md)
- [ ] Create project map (`docs/CLAUDE_CODE_PROJECT_MAP.md`)
- [ ] Create environment inventory (`docs/CLAUDE_CODE_ENV_INVENTORY.md`)
- [ ] Create integrations list (`docs/CLAUDE_CODE_INTEGRATIONS.md`)
- [ ] Create risk scan (`docs/CLAUDE_CODE_RISKS.md`)
- [ ] Create build validation (`docs/CLAUDE_CODE_BUILD_VALIDATION.md`)
- [ ] Create continuously updated index (`docs/CLAUDE_CODE_INDEX.md`)

### Phase 3: Initial Findings Report (1 hour)

- [ ] Summarize current state (what ISA is today)
- [ ] Document gaps and risks (with severity + evidence)
- [ ] Propose development operating model (Claude Code workflow)
- [ ] Recommend tooling and MCP plan (setup steps)
- [ ] Create first execution plan (3-7 tasks with acceptance criteria)

### Phase 4: First Task Batch (Variable)

- [ ] Present findings and proposed tasks
- [ ] Get approval for first batch
- [ ] Execute tasks incrementally
- [ ] Verify each task (tests pass, governance compliant)
- [ ] Document changes (update docs, evidence markers)
- [ ] Commit to `isa_web_clean_Q_branch`

---

## Deliverables (Produce in This Order)

### 1. CURRENT_STATE.md
Repo-grounded snapshot of ISA today:
- Architecture overview (6 capabilities, data flows)
- Technology stack (React 19, Express 4, tRPC 11, Drizzle ORM, OpenAI GPT-4)
- Deployment status (production, staging)
- Data coverage (38 regulations, 1,184 ESRS datapoints, 60+ GS1 standards)
- Test status (517/574 passing, 90.1%)
- Documentation status (Phase 3 - 8/36 complete, 22%)

### 2. GAPS_AND_RISKS.md
With severity + evidence pointers:
- **Critical:** Test failures blocking CI, stale documentation causing confusion
- **High:** Manual governance checks slowing development, missing observability
- **Medium:** Incomplete capability documentation, repetitive code patterns
- **Low:** Minor optimization opportunities, nice-to-have features

### 3. DEVELOPMENT_OPERATING_MODEL.md
Claude Code workflow + rules:
- Repeatable development loop (scan → plan → implement → verify → document → gate)
- Working style guidelines (when to use large context, adaptive thinking, ask permission)
- Canonical navigation documents (what to pin)
- Continuously updated project index (features, configs, integrations, runbooks)

### 4. TOOLING_AND_MCP_PLAN.md
Recommended MCP servers/connectors + setup steps:
- Currently active servers (Postgres, Filesystem, Git, Fetch, Puppeteer, Sequential Thinking, Memory)
- Recommended additions (Ripgrep, Code Index, ESLint, Markdownlint)
- Anti-patterns (when NOT to use tools)
- Evidence logging rules (format, location, when to log)
- VS Code configuration (settings, shortcuts, workflows)

### 5. FIRST_EXECUTION_PLAN.md
3-7 concrete tasks with acceptance criteria:
- Task 1: Complete NEWS_HUB capability documentation (4 docs remaining)
- Task 2: Fix high-priority test failures (10 most critical)
- Task 3: Implement automated governance validation gate
- Task 4: Configure Claude Code optimal settings for ISA
- Task 5: Create development workflow automation scripts
- Task 6: Build real-time observability dashboard prototype
- Task 7: Document Claude 4.6 capabilities and usage patterns

---

## Start Now

**Immediate Action:** Begin Phase 2 (Repository Investigation)

1. Read canonical navigation documents
2. Create project map, environment inventory, integrations list
3. Perform risk scan and build validation
4. Create continuously updated index

**Before Large Changes:** Present initial findings and proposed first task batch

**Remember:**
- Always work on branch `isa_web_clean_Q_branch`
- Evidence-first, minimal questions
- Incremental, reversible changes
- Governance-aware development
- Proactive tool usage
- Continuous documentation

**Your Goal:** Accelerate ISA development through intelligent automation, optimal tooling, and efficient workflows powered by Claude 4.6 capabilities.

---

**Document Status:** Ready for Claude Code  
**Last Updated:** 2026-02-12  
**Branch:** isa_web_clean_Q_branch

## ISA Code Patterns Reference

### tRPC Procedure Pattern

```typescript
// Standard query procedure
export const myRouter = router({
  getProcedure: publicProcedure
    .input(z.object({
      id: z.string(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const results = await db
        .select()
        .from(tableName)
        .where(eq(tableName.id, input.id))
        .limit(input.limit);
      
      return results;
    }),

  // Standard mutation procedure
  createProcedure: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      data: z.object({}).passthrough(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      
      const [result] = await db
        .insert(tableName)
        .values({
          name: input.name,
          data: input.data,
          createdBy: ctx.user.id,
          createdAt: new Date().toISOString(),
        });
      
      return result;
    }),
});
```

### Zod Schema Pattern

```typescript
const QueryInputSchema = z.object({
  query: z.string().min(1, 'Query cannot be empty'),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['date', 'relevance', 'title']).default('relevance'),
  filters: z.object({
    category: z.string().optional(),
    dateRange: z.object({
      start: z.string().datetime(),
      end: z.string().datetime(),
    }).optional(),
  }).optional(),
});
```

### Drizzle ORM Query Pattern

```typescript
import { eq, and, gte, lte, desc } from 'drizzle-orm';

// Complex query with joins
const results = await db
  .select({
    id: tableName.id,
    name: tableName.name,
    relatedName: relatedTable.name,
  })
  .from(tableName)
  .leftJoin(relatedTable, eq(tableName.relatedId, relatedTable.id))
  .where(
    and(
      eq(tableName.active, true),
      gte(tableName.createdAt, startDate),
      lte(tableName.createdAt, endDate)
    )
  )
  .orderBy(desc(tableName.createdAt))
  .limit(limit);
```

### Error Handling Pattern

```typescript
import { TRPCError } from '@trpc/server';
import { serverLogger } from '../_core/logger-wiring';

try {
  const result = await someOperation();
  return result;
} catch (error) {
  serverLogger.error('[Context] Operation failed:', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
  });
  
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Operation failed. Please try again.',
    cause: error,
  });
}
```

### React Component Pattern

```typescript
import { trpc } from '@/lib/trpc';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function MyComponent() {
  const [input, setInput] = useState('');
  const { toast } = useToast();
  
  const { data, isLoading, refetch } = trpc.router.getProcedure.useQuery(
    { id: 'example' },
    { staleTime: 60_000 }
  );
  
  const mutation = trpc.router.createProcedure.useMutation({
    onSuccess: () => {
      toast({ title: 'Success' });
      refetch();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div className="space-y-4">
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <Button onClick={() => mutation.mutate({ name: input, data: {} })}>
        Create
      </Button>
    </div>
  );
}
```

---

## Claude 4.6 Performance Benchmarks

### Context Window Modes

| Mode | Context Size | Best For | ISA Use Cases |
|------|-------------|----------|---------------|
| **Lean** | <10K tokens | Single-file edits | Bug fixes, small features |
| **Standard** | 10-50K tokens | Multi-file changes | Feature implementation |
| **Large** | 50-200K tokens | Cross-capability analysis | Documentation consolidation |
| **Extended** | 200K+ tokens | Full codebase understanding | Initial audit, migrations |

### Thinking Modes

| Mode | Latency | Best For | ISA Use Cases |
|------|---------|----------|---------------|
| **Fast** | <2s | Straightforward implementations | CRUD operations |
| **Standard** | 2-5s | Moderate complexity | Feature implementation |
| **Adaptive** | 5-15s | Complex analysis | Governance compliance |
| **Deep** | 15-30s | Novel problems | New capability design |

---

## Troubleshooting Common Claude Code Issues

### Issue 1: Context Window Exceeded
**Symptoms:** "Context too large" error, slow responses  
**Solutions:** Switch to lean context, focus on specific files, use Ripgrep to find relevant files first  
**Prevention:** Start with lean context, expand only when necessary

### Issue 2: Incorrect File Modifications
**Symptoms:** Changes to wrong files, syntax errors  
**Solutions:** Always read file before modifying, use multi-file edit with review  
**Prevention:** Read → Modify → Test → Commit workflow

### Issue 3: Database Connection Failures
**Symptoms:** "Database not available" errors  
**Solutions:** Check DATABASE_URL, verify database running, test with `pnpm test-db-health`  
**Prevention:** Always check DB availability before queries

### Issue 4: MCP Server Unavailable
**Symptoms:** MCP operation fails, timeout errors  
**Solutions:** Check MCP configuration, use fallback approach  
**Prevention:** Always have fallback for MCP operations

### Issue 5: Test Failures After Changes
**Symptoms:** Tests pass locally, fail in CI  
**Solutions:** Run tests before committing, check async timing, verify mocks  
**Prevention:** Use `pnpm test --watch` during development

### Issue 6: Governance Violations
**Symptoms:** Changes rejected in PR review  
**Solutions:** Read ISA_GOVERNANCE.md before critical changes, update docs alongside code  
**Prevention:** Check governance requirements before starting work

### Issue 7: Merge Conflicts
**Symptoms:** Git merge conflicts  
**Solutions:** Pull latest from main regularly, rebase instead of merge  
**Prevention:** Daily: `git fetch origin && git rebase origin/main`

### Issue 8: Performance Degradation
**Symptoms:** Slow response times, high memory usage  
**Solutions:** Close unused files, restart VS Code, use lean context  
**Prevention:** Keep workspace clean, close files after editing

---

## GitHub Copilot Integration

### When to Use Copilot vs. Claude Code

| Task | Use Copilot | Use Claude Code |
|------|-------------|-----------------|
| **Autocomplete** | ✅ Inline suggestions | ❌ Too slow |
| **Single function** | ✅ Fast generation | ⚠️ Overkill |
| **Multi-file refactor** | ❌ Limited context | ✅ Large context |
| **Architecture analysis** | ❌ No reasoning | ✅ Adaptive thinking |
| **Test generation** | ✅ Quick tests | ✅ Comprehensive suites |
| **Documentation** | ⚠️ Basic docs | ✅ Detailed docs |
| **Bug fixing** | ⚠️ Simple fixes | ✅ Complex debugging |
| **Code review** | ❌ No capability | ✅ Full review |

### Recommended Workflow

1. **Use Copilot** for inline autocomplete (type function signature, accept suggestion)
2. **Use Claude Code** for multi-file changes ("Refactor all tRPC routers...")
3. **Use Copilot** for test boilerplate (type test description, accept body)
4. **Use Claude Code** for test strategy ("Create comprehensive test suite...")
5. **Use Copilot** for documentation comments (type `/**`, accept JSDoc)
6. **Use Claude Code** for architectural docs ("Document ASK_ISA architecture...")

### Configuration for Optimal Coexistence

```json
{
  "github.copilot.enable": {
    "*": true,
    "markdown": false
  },
  "github.copilot.editor.enableAutoCompletions": true,
  "claude.autoSuggest": false,
  "claude.contextWindow": "adaptive",
  "claude.thinkingMode": "adaptive"
}
```

### Conflict Resolution

**If both suggest simultaneously:**
- Accept Copilot for simple autocomplete
- Use Claude Code for complex reasoning
- Disable Copilot temporarily for large refactors
- Re-enable after Claude Code completes

**Keyboard shortcuts:**
- `Tab` - Accept Copilot suggestion
- `Ctrl+Shift+C` - Open Claude Code chat
- `Esc` - Dismiss both suggestions

---

**Enhanced Document Status:** Complete with code patterns, benchmarks, troubleshooting, and Copilot integration  
**Last Updated:** 2026-02-12  
**Branch:** isa_web_clean_Q_branch
