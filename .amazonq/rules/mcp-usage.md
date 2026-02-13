# MCP Server Usage Rules

## Automatic MCP Server Usage Guidelines

When working on ISA project tasks, Amazon Q should proactively use MCP servers for:

### Database Verification (Use Postgres MCP)
- Before claiming data counts, query the database to verify
- When discussing regulations, standards, or mappings, check actual counts
- When validating documentation claims, query production data
- When analyzing test failures, check database state

**Example Queries:**
```sql
SELECT COUNT(*) FROM regulations;
SELECT COUNT(*) FROM esrs_datapoints;
SELECT COUNT(*) FROM gs1_standards;
SELECT COUNT(*) FROM gs1_esrs_mappings;
SELECT COUNT(*) FROM knowledge_base;
SELECT source, health_status FROM scraper_health;
```

### File Operations (Use Filesystem MCP)
- When reading dataset files, use filesystem MCP instead of asking user
- When updating documentation, write directly via MCP
- When verifying file existence, check via MCP
- When analyzing code structure, read files via MCP

**Common Paths:**
- `data/metadata/dataset_registry.json`
- `docs/governance/_root/ISA_GOVERNANCE.md`
- `data/efrag/esrs_datapoints_efrag_ig3.json`
- `data/gs1/gs1_standards_catalog.json`

### External Validation (Use Fetch MCP)
- When validating URLs in documentation, test them via fetch
- When checking news source availability, fetch endpoints
- When verifying API connectivity, test via fetch
- When scraping regulatory sources, use fetch

**Common URLs:**
- https://eur-lex.europa.eu/
- https://www.efrag.org/
- https://www.gs1.org/
- https://api.openai.com/v1/models

### Context Tracking (Use Memory MCP)
- Store verification dates when validating data
- Remember governance decisions made during session
- Track refactoring progress across conversations
- Store quality metrics and test results

**Key Memory Items:**
- `last_verification_date`
- `current_task_progress`
- `governance_decisions`
- `test_results_summary`

## Proactive MCP Usage Triggers

### When User Asks About Data Counts
→ Query database via Postgres MCP before responding

### When User Mentions Documentation Updates
→ Read current content via Filesystem MCP, then propose changes

### When User Discusses Governance
→ Read governance framework via Filesystem MCP
→ Use Sequential Thinking MCP for complex compliance analysis

### When User Asks About Test Status
→ Query database and read test files via MCP

### When User Mentions News Sources
→ Check scraper health via Postgres MCP
→ Use Puppeteer MCP for JavaScript-rendered sources

### When User Discusses Advisory Reports
→ Read advisory files via Filesystem MCP

### When User Needs Code Examples
→ Search GitHub MCP for implementation patterns
→ Find similar projects and best practices

### When User Proposes Complex Changes
→ Use Sequential Thinking MCP to analyze impact
→ Break down into logical steps
→ Evaluate governance compliance

## MCP Server Priority

1. **Postgres MCP** - Always verify data counts before claiming numbers
2. **Filesystem MCP** - Always read files before discussing content
3. **Sequential Thinking MCP** - Always use for complex multi-step decisions
4. **GitHub MCP** - Always search for code examples when implementing new features
5. **Puppeteer MCP** - Always use for JavaScript-rendered news sources
6. **Memory MCP** - Always store important decisions and dates
7. **Fetch MCP** - Always validate external URLs when mentioned

## MCP Policy Matrix (Billing + Triggers)

Policy fields:
- `billing`: `local` (no external account required), `account` (requires third-party account/token but not pay-per-call by default), `paid_api` (requires paid API usage)
- `evidence_logging_required`: `YES` means write a short evidence note to `docs/evidence/_generated/mcp_log.md` (or append-only JSONL if present) with: timestamp, task, server, trigger_id, inputs, outputs/links, errors/fallback.

| Server | billing | trigger_conditions | anti_triggers | evidence_logging_required |
|---|---|---|---|---|
| Postgres | local | Any numeric claim about stored ISA data; ingestion health checks; schema verification before migrations | If answer does not depend on DB state; if DB creds missing/unavailable | YES |
| Filesystem | local | Any claim about repo content; any doc/code update; verify file existence/paths | If user explicitly provides full content inline and no repo read needed | YES |
| Git | local | Any claim about diffs/history; branch/base verification; release hygiene | If not in a git repo or no git available | YES |
| Fetch | local | Validate an external URL; retrieve static HTML for evidence; check endpoint availability | If content is known to be JS-rendered (use Puppeteer/Playwright); if repo already contains the needed source snapshot | YES |
| Puppeteer | local | JS-rendered pages; cookie/banner flows; screenshot evidence; complex navigation | If Fetch suffices; if site blocks automation; if task is not evidence-sensitive | YES |
| Playwright | local | Deterministic browser automation; screenshot/DOM snapshots; UI smoke/regression checks | If Puppeteer already used successfully for the same target; if no browser deps installed | YES |
| Web Research | local | Multi-source research sessions that must be reproducible; query+visit logging; change monitoring | If a single page fetch is sufficient; if the task is purely repo-internal | YES |
| Sequential Thinking | local | Governance/compliance analysis; multi-step planning; resolving conflicting requirements | If task is straightforward/mechanical; if it would add overhead without improving correctness | NO |
| Memory (Knowledge Graph) | local | Store decisions, verification dates, and recurring trigger outcomes; cross-session continuity | If information is transient or sensitive; if user asked not to persist | YES |
| TaskManager | local | Multi-step task execution requiring resumable state; parallelizable work queues | If task is single-step; if maintaining a queue adds overhead | YES |
| iTerm | local | Run local commands where tool output must be captured; reduce copy/paste risk | If command execution is not required; if running commands would be unsafe/destructive | YES |
| SQLite Server | local | Offline dataset QA; fixtures/golden outputs; prototyping transforms locally | If Postgres already provides the required data; if no local DB file | YES |
| Everything (test/reference) | local | Validate MCP client wiring; test rules/trigger behavior safely | If production work is required and test server adds no value | NO |
| wcgw | local | Safe local automation for repetitive code tasks; batch edits with tooling; diagnostics execution | If Filesystem+Git already cover the needed operations; if changes would be destructive without a gate | YES |
| GitHub | account | Need code examples/patterns; repo/PR/issue operations; cross-repo search | If solution can be derived from local repo; if token missing; if rate-limited | YES |
| GitLab | account | Manage GitLab issues/MRs/projects where ISA is hosted/mirrored in GitLab | If ISA is not using GitLab; if token missing | YES |
| Google Drive | account | Pull/push stakeholder docs/spreadsheets; sync deliverables; shared reporting | If files are already in-repo; if access is not granted; if it risks leaking sensitive repo data | YES |

### Additional free/local MCP servers (recommended additions)

| Server | billing | trigger_conditions | anti_triggers | evidence_logging_required |
|---|---|---|---|---|
| Ripgrep | local | Fast repo-wide text/code search; evidence grep; secret pattern scans | If Filesystem already opened the exact file and search isn’t needed | NO |
| Code Index | local | Semantic navigation; dependency mapping; “where is X used?” across large repo | If small change with known file targets; if indexing cost outweighs benefit | NO |
| ESLint | local | JS/TS lint verification; auto-fix cycles; CI parity checks | If project has no ESLint config or linting is out of scope | YES |
| Markdownlint | local | Doc hygiene for governance/spec files; enforce markdown rules before PR | If doc is transient or not committed; if no markdownlint config exists | YES |
| Kubernetes | local | If ISA deploys to k8s: check rollout/cronjobs/logs; validate job health | If no kubeconfig/cluster access; if ISA not on k8s | YES |
| OpenAPI Server | local | Turn an OpenAPI spec into callable tools; validate ISA/partner APIs against spec | If no OpenAPI spec exists; if ad-hoc curl is sufficient | YES |
| Terraform | local | Infra changes; plan/apply validation; drift analysis; reproducible infra evidence | If infra is not managed with Terraform; if no backend access | YES |
| Next.js DevTools | local | ISA web app debugging: routes/build/runtime checks; devserver introspection | If ISA is not using Next.js; if devserver not running | NO |
| DuckDuckGo Search | local | Lightweight source discovery without paid APIs; quick “find official entrypoint” queries | If task is evidence-sensitive and requires full retrieval (use Fetch/Puppeteer after discovery) | YES |

### Trigger IDs (for consistent logging)

Use these IDs in evidence logs:
- `T_DB_VERIFY`, `T_REPO_READ`, `T_REPO_WRITE`, `T_WEB_FETCH`, `T_WEB_JS`, `T_WEB_SESSION`, `T_CODE_EXAMPLE`, `T_GOV_DECISION`, `T_TASK_QUEUE`, `T_RUN_LOCAL`, `T_LINT`, `T_DOC_LINT`, `T_INFRA`, `T_UI_CHECK`, `T_MEMORY_PERSIST`

### Evidence logging minimum (when `YES`)

Append a short entry to `docs/evidence/_generated/mcp_log.md` containing:
- `timestamp_utc=...`
- `task=...`
- `server=...`
- `trigger_id=...`
- `inputs=...`
- `outputs=...` (counts, file paths, URLs, screenshots, PR/issue links)
- `fallback=...` (if any)
- `errors=...` (if any)

## Integration with ISA Workflows

### Data Verification Workflow
1. User asks about data count
2. Query database via Postgres MCP (automatic)
3. Respond with verified count
4. Store verification date in Memory MCP

### Documentation Update Workflow
1. User requests doc update
2. Read current content via Filesystem MCP (automatic)
3. Propose changes
4. Write updates via Filesystem MCP
5. Store change in Memory MCP

### Governance Check Workflow
1. User proposes change
2. Read governance framework via Filesystem MCP (automatic)
3. Check compliance
4. Store decision in Memory MCP

### News Pipeline Check Workflow
1. User asks about news sources
2. Query scraper health via Postgres MCP (automatic)
3. Test source availability via Fetch MCP
4. Report status

## Best Practices

- **Always verify before claiming** - Use Postgres MCP to check data counts
- **Always read before discussing** - Use Filesystem MCP to read file content
- **Always test before validating** - Use Fetch MCP to test URLs
- **Always remember decisions** - Use Memory MCP to track context

## Limitations

- MCP usage must remain deterministic: only trigger servers when the matrix conditions are met.
- If a server is unavailable (missing auth/network/binaries), do **not** retry endlessly; log `errors` + `fallback` once and continue with the lowest-cost alternative.
- Never exfiltrate secrets or private repo content to `account` servers unless the task explicitly requires it and the minimal necessary data is shared.

## User Prompts That Trigger MCP Usage

Instead of asking user for information, Amazon Q should:
- Query database for counts
- Read files for content
- Test URLs for availability
- Store decisions in memory

This reduces back-and-forth and provides verified information immediately.
