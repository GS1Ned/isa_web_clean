# ISA File System Memory Architecture

**Author:** Manus AI  
**Date:** December 17, 2025  
**Purpose:** Document how ISA uses the file system as externalized, persistent memory for AI-assisted development

---

## Overview

Following Manus best practices, ISA treats the file system as **unlimited, persistent, externalized memory** rather than relying solely on context windows. This architectural pattern enables ISA to maintain state across long-horizon development (Q1 2025 → Q1 2026) without context degradation.

**Key Principle:** The file system is the single source of truth. Context windows are ephemeral views into this persistent memory.

---

## Directory Structure as Memory Hierarchy

```
/home/ubuntu/isa_web/
├── data/                    # Long-term knowledge storage (datasets, schemas)
│   ├── advisories/          # Generated advisory reports (v1.0, v1.1, v1.2)
│   ├── cbv/                 # EPCIS CBV vocabularies (canonical reference)
│   ├── efrag/               # ESRS datapoints (XBRL taxonomy snapshots)
│   ├── esg/                 # ESG data categories, DPP identification rules
│   ├── external/            # Archive of external standards (GS1, EFRAG)
│   ├── gs1/                 # GS1 GDSN, Digital Link, WebVoc definitions
│   ├── metadata/            # Dataset registry, bundle registry, ingestion logs
│   └── standards/           # GS1-EU, GS1-NL standards documentation
│
├── docs/                    # Working memory (findings, research, decisions)
│   ├── governance/          # Temporal guardrails, validation rules
│   ├── references/          # GS1 style guide, ESRS mapping references
│   ├── research/            # Research findings, best practices (this doc)
│   └── templates/           # Advisory templates, gap analysis templates
│
├── scripts/                 # Procedural memory (automation, ingestion)
│   ├── advisory/            # Advisory generation procedures
│   ├── datasets/            # Dataset inventory builders, registry scripts
│   └── ingest/              # INGEST-02 through INGEST-06 procedures
│
├── server/                  # Application logic (tRPC routers, DB helpers)
│   ├── routers/             # tRPC procedures (ask-isa, advisory, news, etc.)
│   ├── prompts/             # Modular prompt blocks (system, context, policy)
│   ├── news/                # News pipeline (scrapers, AI processor, dedup)
│   └── ingest/              # Ingestion modules (GDSN, ESRS, CBV, DPP)
│
└── todo.md                  # Pinned plan artifact (attention management)
```

---

## Memory Categories

### 1. Long-Term Knowledge Storage (`data/`)

**Purpose:** Canonical datasets, schemas, and reference materials that rarely change.

**Characteristics:**
- **Immutable or append-only:** Once ingested, datasets are versioned (not overwritten)
- **Structured:** JSON, CSV, XLSX formats with well-defined schemas
- **Restorable:** All data can be re-fetched from authoritative sources if lost

**Examples:**
- `data/efrag/esrs-set1-taxonomy-2024-08-30.xlsx` - ESRS datapoints (1,184 records)
- `data/gs1/gdsn-current-v3.1.32.xlsx` - GS1 GDSN attributes (4,293 records)
- `data/advisories/ISA_ADVISORY_v1.1.json` - Advisory report snapshot

**Access Pattern:**
- Read frequently (during ingestion, mapping, advisory generation)
- Write rarely (only during ingestion or advisory updates)
- Reference by file path in prompts (avoid embedding full content in context)

---

### 2. Working Memory (`docs/`)

**Purpose:** Research findings, design decisions, and documentation that evolve during development.

**Characteristics:**
- **Mutable:** Documents are updated as understanding deepens
- **Human-readable:** Markdown format for easy review and collaboration
- **Versioned:** Git tracks changes over time

**Examples:**
- `docs/ARCHITECTURE.md` - System architecture overview
- `docs/ROADMAP.md` - Long-term development plan
- `docs/research/manus_research_findings.md` - Research notes

**Access Pattern:**
- Read frequently (to understand context and decisions)
- Write frequently (to record findings and decisions)
- Append new findings (avoid overwriting previous insights)

---

### 3. Procedural Memory (`scripts/`)

**Purpose:** Automation scripts, ingestion procedures, and data transformation logic.

**Characteristics:**
- **Executable:** TypeScript/JavaScript files that can be run via `pnpm tsx`
- **Idempotent:** Can be run multiple times without side effects
- **Documented:** Each script includes purpose, inputs, outputs, and usage

**Examples:**
- `scripts/ingest/INGEST-03_esrs_datapoints.ts` - ESRS datapoint ingestion
- `scripts/advisory/generate_report_data.ts` - Advisory report generation
- `scripts/datasets/build-dataset-registry.ts` - Dataset inventory builder

**Access Pattern:**
- Read when understanding ingestion logic
- Write when creating new ingestion procedures
- Execute when running data pipelines

---

### 4. Application Logic (`server/`)

**Purpose:** Backend code that powers ISA's API, RAG system, and news pipeline.

**Characteristics:**
- **Stateless:** Each request is independent (state lives in database or file system)
- **Modular:** Separated into routers, DB helpers, and utilities
- **Tested:** Unit tests ensure correctness

**Examples:**
- `server/routers/ask-isa.ts` - Ask ISA RAG procedures
- `server/prompts/ask_isa/` - Modular prompt blocks
- `server/news-ai-processor.ts` - News enrichment AI logic

**Access Pattern:**
- Read frequently (to understand API behavior)
- Write when adding features or fixing bugs
- Test before deployment

---

### 5. Pinned Plan Artifact (`todo.md`)

**Purpose:** Attention management mechanism that recites objectives into recent context.

**Characteristics:**
- **Compact:** 5-10 high-level objectives (not exhaustive)
- **Updated frequently:** Every loop during complex tasks
- **Append-only:** New tasks added, completed tasks marked `[x]`

**Example:**
```markdown
# ISA TODO

## Manus Best Practices Implementation (December 2025)

### Phase 1: Context Engineering Foundation
- [x] Install sort-keys package for deterministic JSON
- [x] Create deterministic JSON utility module
- [ ] Audit JSON serialization in ingestion scripts
- [ ] Document file system memory architecture

### Phase 2: Modular Prompt Infrastructure
- [x] Create server/prompts/ directory structure
- [x] Create Ask ISA modular prompts (5 blocks)
- [ ] Refactor ingestion prompts to 5-block structure
```

**Access Pattern:**
- Read at start of each loop (to understand current objectives)
- Write at end of each loop (to update progress and add new tasks)
- Never delete completed tasks (keep as history)

---

## Context Compression Strategies

### Strategy 1: File Path References

**Problem:** Embedding full dataset content in prompts wastes tokens and breaks KV-cache.

**Solution:** Reference file paths instead of content.

**Example:**
```
❌ Bad (embeds full content):
"Here are the 1,184 ESRS datapoints: [full JSON array]"

✅ Good (references file path):
"ESRS datapoints are available at /home/ubuntu/isa_web/data/efrag/esrs-set1-taxonomy-2024-08-30.xlsx"
```

---

### Strategy 2: Append-Only Context

**Problem:** Modifying previous actions retroactively breaks KV-cache.

**Solution:** Always append new observations, never edit history.

**Example:**
```
❌ Bad (edits previous action):
Action 1: Ingest ESRS datapoints [EDITED: Actually ingested 1,175, not 1,184]

✅ Good (appends correction):
Action 1: Ingest ESRS datapoints (1,184 records)
Observation 1: Successfully ingested 1,175 records (9 records failed validation)
Action 2: Investigate validation failures
```

---

### Strategy 3: Deterministic JSON Serialization

**Problem:** Non-deterministic key ordering breaks KV-cache.

**Solution:** Use `sort-keys` to ensure consistent JSON output.

**Example:**
```typescript
import { stringifyDeterministic } from './server/utils/deterministic-json';

// ❌ Bad (non-deterministic):
const output = JSON.stringify(record);

// ✅ Good (deterministic):
const output = stringifyDeterministic(record);
```

---

## Write Conventions

### When to Write to `data/`

- **Ingestion outputs:** Store raw datasets, schemas, and metadata
- **Advisory snapshots:** Save generated advisory reports with version numbers
- **Reference materials:** Archive external standards and documentation

**Naming Convention:**
- Use descriptive names with version/date: `esrs-set1-taxonomy-2024-08-30.xlsx`
- Use semantic versioning for advisories: `ISA_ADVISORY_v1.1.json`

---

### When to Write to `docs/`

- **Research findings:** Document discoveries, insights, and decisions
- **Architecture documentation:** Explain system design and data models
- **Best practices:** Record lessons learned and optimization strategies

**Naming Convention:**
- Use UPPERCASE for major documents: `ARCHITECTURE.md`, `ROADMAP.md`
- Use lowercase for working documents: `manus_research_findings.md`

---

### When to Write to `scripts/`

- **New ingestion procedures:** Create scripts for new data sources
- **Data transformation:** Build utilities for dataset processing
- **Automation:** Develop cron jobs or scheduled tasks

**Naming Convention:**
- Use UPPERCASE prefix for ingestion: `INGEST-03_esrs_datapoints.ts`
- Use descriptive names for utilities: `build-dataset-registry.ts`

---

### When to Write to `server/`

- **New API endpoints:** Add tRPC procedures for new features
- **Prompt blocks:** Create modular prompts for AI workflows
- **Database helpers:** Add query functions for new tables

**Naming Convention:**
- Use kebab-case for files: `ask-isa.ts`, `news-ai-processor.ts`
- Use camelCase for functions: `getAllEsrsDatapoints()`, `generateAdvisory()`

---

## Read Conventions

### Avoid Repeated Reads

**Problem:** Reading the same file multiple times wastes tokens.

**Solution:** Read once per iteration, cache in memory if needed.

**Example:**
```typescript
// ❌ Bad (reads file 3 times):
const data1 = await readFile('data/esrs.json');
const data2 = await readFile('data/esrs.json');
const data3 = await readFile('data/esrs.json');

// ✅ Good (reads once):
const data = await readFile('data/esrs.json');
// Use data multiple times
```

---

### Use Grep for Targeted Reads

**Problem:** Reading entire files to find specific content wastes tokens.

**Solution:** Use `match` tool with `grep` action to find specific patterns.

**Example:**
```typescript
// ❌ Bad (reads entire file):
const content = await readFile('server/routers/ask-isa.ts');
// Search for specific function in content

// ✅ Good (targeted grep):
await match({
  action: 'grep',
  scope: '/home/ubuntu/isa_web/server/routers/*.ts',
  regex: 'function generateAnswer',
  leading: 5,
  trailing: 10
});
```

---

## Restoration Strategies

### All Data is Restorable

**Principle:** ISA's file system memory is restorable from authoritative sources.

**Restoration Map:**

| Data Category | Authoritative Source | Restoration Method |
|---------------|---------------------|-------------------|
| ESRS Datapoints | EFRAG XBRL Taxonomy | Download latest taxonomy ZIP, parse XML |
| GS1 GDSN Attributes | GS1 Global Registry | API query or manual download |
| EU Regulations | EUR-Lex API | Query by CELEX number, parse XML |
| Dutch Initiatives | GS1 Netherlands website | Web scraping (with permission) |
| Advisory Reports | Git history | Checkout previous version |
| News Articles | Original sources | Re-fetch from EUR-Lex, GS1.nl, etc. |

**Backup Strategy:**
- Git tracks all code and documentation
- Database backups via TiDB Cloud (automated)
- Datasets archived in `data/external/` for offline access

---

## Benefits of File System as Memory

1. **Unlimited capacity:** No context window limits (691 files, 178MB datasets)
2. **Persistent across sessions:** State survives sandbox hibernation
3. **Auditable:** Git tracks all changes over time
4. **Restorable:** All data can be re-fetched from sources
5. **KV-cache friendly:** Stable file paths improve cache hit rate
6. **Human-readable:** Markdown and JSON formats enable manual review

---

## Anti-Patterns to Avoid

### ❌ Embedding Large Datasets in Prompts

**Problem:** Wastes tokens, breaks KV-cache, slows inference.

**Solution:** Reference file paths, read on-demand.

---

### ❌ Modifying Previous Actions

**Problem:** Breaks KV-cache, confuses error recovery.

**Solution:** Append corrections as new observations.

---

### ❌ Non-Deterministic JSON

**Problem:** Breaks KV-cache (10x cost increase).

**Solution:** Use `stringifyDeterministic()` utility.

---

### ❌ Deleting Failed Attempts

**Problem:** Prevents error recovery and learning.

**Solution:** Preserve errors in context and database.

---

## Conclusion

ISA's file system memory architecture enables long-horizon development, efficient context management, and robust error recovery. By treating the file system as the single source of truth and following established read/write conventions, ISA maintains state across 50+ tool call loops without context degradation.

**Key Takeaways:**
- File system is unlimited, persistent memory
- Context windows are ephemeral views
- Reference file paths, not content
- Append-only context preserves KV-cache
- All data is restorable from authoritative sources
