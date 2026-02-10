# Manus ↔ ChatGPT Collaboration Protocol

**Version:** 2.0  
**Date:** December 11, 2025  
**Status:** Active

---

## Overview

This document defines the collaboration protocol between **Manus** (autonomous development agent) and **ChatGPT 5.1** (code generation specialist) for ISA project development.

**Key Principle:** Manus orchestrates, ChatGPT generates, user facilitates.

---

## Roles & Responsibilities

### Manus (Orchestrator)
- **Strategic planning** - Analyze requirements, prioritize tasks, design architecture
- **Task delegation** - Prepare context packages, delegate to ChatGPT
- **Integration** - Integrate ChatGPT deliverables, fix mechanical issues
- **Testing** - Run tests, validate data quality, ensure production readiness
- **Reporting** - Communicate progress and results to user

### ChatGPT 5.1 (Code Generator)
- **Code generation** - Implement ingestion modules, utilities, components
- **Test creation** - Write comprehensive Vitest tests (>85% coverage)
- **Documentation** - Create clear READMEs and inline comments
- **Schema design** - Propose Drizzle table schemas
- **Pattern adherence** - Follow ISA architecture patterns

### User (Facilitator)
- **Context transfer** - Copy/paste prompts and specs between agents
- **Data provision** - Upload data files once
- **Checkpoint creation** - Save checkpoints after successful integrations
- **Minimal involvement** - Only intervene when agents explicitly request help

---

## Communication Channels

### Manus → ChatGPT (via User)

**Format:** User copies from Manus and pastes into ChatGPT

**Content Package:**
1. **Master Prompt** - `/tasks/INGESTION_MASTER_PROMPT_FOR_CHATGPT.md`
2. **Task Spec** - `/tasks/for_chatgpt/INGEST-XX_<name>.md`
3. **Context Snippets** - Minimal schema/db excerpts (if needed)
4. **Sample Data** - First 10-20 records (if needed)

**Token Budget:** <50K tokens per delegation

### ChatGPT → Manus (via User)

**Format:** User copies ChatGPT output and pastes into Manus

**Expected Deliverables:**
1. **Ingestion Module** - `server/ingest/INGEST-XX_<name>.ts`
2. **Test File** - `server/ingest/INGEST-XX_<name>.test.ts`
3. **Schema Additions** - Proposed Drizzle table definitions
4. **README** - Usage documentation

**Delivery Format:** Code blocks with clear file paths as headers

---

## Workflow Stages

### Stage 1: Preparation (Manus)
1. Read task spec from `/tasks/for_chatgpt/INGEST-XX_*.md`
2. Verify data files exist in `/data/` directories
3. Extract minimal context (schema excerpts, sample data)
4. Prepare delegation package (<50K tokens)
5. Notify user: "Ready to delegate INGEST-XX to ChatGPT"

### Stage 2: Delegation (User)
1. Copy master prompt + task spec from Manus
2. Paste into ChatGPT 5.1
3. Wait for deliverables (2-6 hours)
4. Copy ChatGPT output
5. Paste into Manus

### Stage 3: Integration (Manus)
1. Extract files from ChatGPT output
2. Validate structure and completeness
3. Apply schema changes: `pnpm db:generate && pnpm db:push`
4. Fix mechanical issues (imports, types, separators)
5. Run tests: `pnpm test server/ingest/INGEST-XX_*.test.ts`
6. Run dry-run: `pnpm ingest:<name> --dry-run --limit 100`
7. Run full ingestion: `pnpm ingest:<name>`
8. Report results to user

### Stage 4: Validation (Manus)
1. Verify record counts in database
2. Check data quality (no nulls in required fields)
3. Test idempotency (run ingestion twice)
4. Validate downstream features work
5. Report success metrics to user

### Stage 5: Checkpoint (User)
1. Review Manus report
2. Create checkpoint with descriptive message
3. Move to next task

---

## Context Package Structure

### Minimal Context (Preferred)

**For simple tasks (INGEST-04, 05, 06):**
```
1. Master Prompt (4-5K tokens)
2. Task Spec (3-4K tokens)
3. Sample data (10-20 records, 1-2K tokens)
---
Total: ~8-11K tokens
```

### Standard Context (Most tasks)

**For medium tasks (INGEST-03):**
```
1. Master Prompt (4-5K tokens)
2. Task Spec (3-4K tokens)
3. Schema excerpt (2-3K tokens)
4. DB helper patterns (1-2K tokens)
5. Sample data (10-20 records, 1-2K tokens)
---
Total: ~12-16K tokens
```

### Rich Context (Complex tasks)

**For complex tasks (INGEST-02):**
```
1. Master Prompt (4-5K tokens)
2. Task Spec (5-6K tokens)
3. Schema excerpt (3-4K tokens)
4. DB helper patterns (2-3K tokens)
5. Sample data (20-30 records, 2-3K tokens)
6. Related table examples (2-3K tokens)
---
Total: ~18-24K tokens
```

**Never exceed 50K tokens** - ChatGPT's context window is 128K but we want fast responses.

---

## File Naming Conventions

### Ingestion Modules
- **Pattern:** `server/ingest/INGEST-XX_<name>.ts`
- **Examples:** 
  - `server/ingest/INGEST-02_gdsn_current.ts`
  - `server/ingest/INGEST-03_esrs_datapoints.ts`

### Test Files
- **Pattern:** `server/ingest/INGEST-XX_<name>.test.ts`
- **Examples:**
  - `server/ingest/INGEST-02_gdsn_current.test.ts`
  - `server/ingest/INGEST-03_esrs_datapoints.test.ts`

### Database Tables
- **Raw tables:** `<source>_<entity>_raw`
  - Examples: `gdsn_classes_raw`, `esrs_datapoints_raw`
- **Canonical tables:** `<source>_<entity>`
  - Examples: `gdsn_classes`, `esrs_datapoints`

### Package.json Scripts
- **Pattern:** `"ingest:<name>": "tsx server/ingest/INGEST-XX_<name>.ts"`
- **Examples:**
  - `"ingest:gdsn": "tsx server/ingest/INGEST-02_gdsn_current.ts"`
  - `"ingest:esrs": "tsx server/ingest/INGEST-03_esrs_datapoints.ts"`

---

## Quality Gates

### Before Delegation (Manus)
- ✅ Task spec is complete and clear
- ✅ Data files exist and are accessible
- ✅ Context package is <50K tokens
- ✅ Sample data is representative

### After Generation (ChatGPT)
- ✅ All files delivered with correct paths
- ✅ Code follows ISA patterns
- ✅ Tests have >85% coverage
- ✅ Schema changes are documented
- ✅ README explains usage

### After Integration (Manus)
- ✅ Zero TypeScript errors
- ✅ All tests passing
- ✅ Dry-run succeeds
- ✅ Full ingestion succeeds
- ✅ Idempotency works (re-run safe)
- ✅ Data quality validated

---

## Error Handling

### ChatGPT Cannot Complete Task

**Symptoms:**
- Asks for missing files
- Says context is incomplete
- Refuses to generate code

**Manus Response:**
1. Acknowledge ChatGPT's judgment (this is GOOD behavior)
2. Identify missing context
3. Prepare enhanced context package
4. Re-delegate with additional context

**User Response:**
- Copy Manus's enhanced package
- Paste into ChatGPT
- Wait for new deliverables

### Integration Fails

**Symptoms:**
- TypeScript errors
- Test failures
- Runtime errors

**Manus Response:**
1. Analyze error messages
2. Fix mechanical issues (imports, types, separators)
3. If logic bugs: document and report to user
4. If unfixable: prepare feedback for ChatGPT re-generation

**User Response:**
- Review Manus report
- Decide: fix manually or re-delegate to ChatGPT

### Data Quality Issues

**Symptoms:**
- Missing records
- Incorrect mappings
- Null values in required fields

**Manus Response:**
1. Analyze data quality metrics
2. Check if issue is in source data or ingestion logic
3. If source data: document and skip
4. If ingestion logic: fix or re-delegate

---

## Success Metrics

### Per Task
- **Integration time:** <1 hour (Manus work)
- **Rework rate:** <10% (lines changed / lines delivered)
- **Test coverage:** >85%
- **Data quality:** >95% records valid

### Overall Project
- **Delegation rate:** >70% (ChatGPT work / total work)
- **Time savings:** >90% (vs manual development)
- **Quality:** Zero production bugs from ingestion modules

---

## Optimization Tips

### For Manus
1. **Reuse context** - Save schema excerpts for similar tasks
2. **Batch similar tasks** - Delegate 2-3 related tasks together
3. **Automate integration** - Use scripts to extract and validate deliverables
4. **Learn from patterns** - Track what context works best

### For ChatGPT
1. **Follow patterns strictly** - Don't invent new architectures
2. **Ask when unclear** - Better to ask than deliver broken code
3. **Provide complete files** - No truncation, no "..." placeholders
4. **Test thoroughly** - Ensure tests cover edge cases

### For User
1. **Trust the agents** - Let them work autonomously
2. **Create checkpoints** - Save progress after each task
3. **Provide feedback** - Tell agents what works and what doesn't
4. **Stay minimal** - Only intervene when explicitly requested

---

## Current Task Queue

### INGEST-02: GDSN Current
- **Status:** Ready for delegation
- **Complexity:** HIGH
- **Est. Time:** 4-6 hours (ChatGPT) + 1 hour (Manus)
- **Priority:** 2 (after INGEST-03)

### INGEST-03: ESRS Datapoints
- **Status:** Ready for delegation
- **Complexity:** MEDIUM
- **Est. Time:** 2-3 hours (ChatGPT) + 45 min (Manus)
- **Priority:** 1 (start here)

### INGEST-04: CTEs and KDEs
- **Status:** Ready for delegation
- **Complexity:** LOW
- **Est. Time:** 1-2 hours (ChatGPT) + 30 min (Manus)
- **Priority:** 3

### INGEST-05: DPP Identification
- **Status:** Ready for delegation
- **Complexity:** LOW
- **Est. Time:** 1-2 hours (ChatGPT) + 30 min (Manus)
- **Priority:** 4

### INGEST-06: CBV Vocabularies
- **Status:** Ready for delegation
- **Complexity:** LOW
- **Est. Time:** 1-2 hours (ChatGPT) + 30 min (Manus)
- **Priority:** 5

---

## Version History

### v2.0 (December 11, 2025)
- Added ingestion-specific workflow
- Defined context package structures
- Created quality gates
- Added current task queue

### v1.0 (December 10, 2025)
- Initial protocol for Batch 01/02 tasks
- Basic delegation workflow
- Integration automation

---

**End of Protocol**
