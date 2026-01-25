# ISA Ingestion Orchestration Prompt

**Copy this entire file and paste it into Manus to start the ingestion pipeline.**

---

## Context

You are **Manus**, the primary autonomous development agent for ISA (Intelligent Standards Architect).

We are now ready to operationalize the data ingestion architecture that you designed and documented. All specifications, data files, and collaboration protocols are in place.

---

## Goal

Build ISA's first-wave data foundation by completing ingestion tasks **INGEST-02 through INGEST-06** according to the specs and architecture you produced, while keeping the project lean and minimizing token usage.

---

## What You Have

All documentation and task specs are already in the ISA project:

### Documentation (4 files)
- `/docs/INGESTION_DELEGATION_SUMMARY.md` - Executive summary and strategy
- `/docs/INGESTION_GUIDE.md` - Technical architecture and patterns
- `/docs/DATASET_PRIORITY_ANALYSIS.md` - Dataset priority ranking
- `/docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` - Collaboration protocol

### Task Specifications (5 files)
- `/tasks/for_chatgpt/INGEST-02_gdsn_current.md` - GDSN classes & validation rules
- `/tasks/for_chatgpt/INGEST-03_esrs_datapoints.md` - ESRS datapoints from EFRAG
- `/tasks/for_chatgpt/INGEST-04_ctes_kdes.md` - Critical Tracking Events & KDEs
- `/tasks/for_chatgpt/INGEST-05_dpp_identification.md` - DPP identification rules
- `/tasks/for_chatgpt/INGEST-06_cbv_vocabularies.md` - CBV vocabularies & Digital Link types

### Master Prompt (1 file)
- `/tasks/INGESTION_MASTER_PROMPT_FOR_CHATGPT.md` - ChatGPT delegation guide

### ChatGPT Instructions (1 file)
- `/tasks/for_chatgpt/_CHATGPT_INSTRUCTIONS.md` - Instructions for ChatGPT 5.1

### Collaboration Protocol (1 file)
- `/docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` - Manus ↔ ChatGPT workflow

### Verification Script (1 file)
- `/scripts/verify-data-files.ts` - Data file verification utility

---

## Step 1: Verify Data Files

Before starting, verify that all HIGH-priority data files are accessible:

**Run:**
```bash
pnpm verify:data
```

**Expected data file locations:**
- `data/gs1/gdsn/gdsn_classes.json`
- `data/gs1/gdsn/gdsn_classAttributes.json`
- `data/gs1/gdsn/gdsn_validationRules.json`
- `data/efrag/EFRAGIG3ListofESRSDataPoints.xlsx`
- `data/esg/ctes_and_kdes.json`
- `data/esg/dpp_identifier_components.json`
- `data/esg/dpp_identification_rules.json`
- `data/cbv/cbv_esg_curated.json`
- `data/digital_link/linktypes.json`

**If any files are missing:**
1. Tell me exactly which files are missing
2. I'll extract and move them from the data ZIP
3. You'll re-run verification

**If all files pass:**
- Proceed to Step 2

---

## Step 2: Orchestrate Ingestion Tasks

For each task (INGEST-02 through INGEST-06), follow this workflow:

### 2.1 Preparation (You)
1. Read the task spec from `/tasks/for_chatgpt/INGEST-XX_*.md`
2. Prepare minimal context package for ChatGPT:
   - Master Prompt (`/tasks/INGESTION_MASTER_PROMPT_FOR_CHATGPT.md`)
   - ChatGPT Instructions (`/tasks/for_chatgpt/_CHATGPT_INSTRUCTIONS.md`)
   - Task spec (`/tasks/for_chatgpt/INGEST-XX_*.md`)
   - Minimal schema excerpts (if needed)
   - Sample data (10-20 records, if needed)
3. **Keep context package <50K tokens**
4. Notify me: "Ready to delegate INGEST-XX to ChatGPT. Please copy the following files and paste into ChatGPT 5.1..."

### 2.2 Delegation (Me)
1. I'll copy the context package you prepared
2. I'll paste it into ChatGPT 5.1
3. I'll wait for ChatGPT's deliverables (2-6 hours)
4. I'll copy ChatGPT's response
5. I'll paste it back to you

### 2.3 Integration (You)
1. Extract files from ChatGPT output
2. Validate structure and completeness
3. Apply schema changes: `pnpm db:generate && pnpm db:push`
4. Fix mechanical issues (imports, types, separators)
5. Run tests: `pnpm test server/ingest/INGEST-XX_*.test.ts`
6. Run dry-run: `pnpm ingest:<name> --dry-run --limit 100`
7. Run full ingestion: `pnpm ingest:<name>`
8. Report results to me

### 2.4 Validation (You)
1. Verify record counts in database
2. Check data quality (no nulls in required fields)
3. Test idempotency (run ingestion twice)
4. Validate downstream features work
5. Report success metrics to me

### 2.5 Checkpoint (Me)
1. I'll review your report
2. I'll create a checkpoint
3. I'll tell you to proceed to next task

---

## Step 3: Task Execution Order

Unless you see a clearly better order, use this sequence:

1. **INGEST-03** (ESRS Datapoints) - Medium complexity, no dependencies, high ESG value
2. **INGEST-02** (GDSN Current) - Complex but foundational for validation features
3. **INGEST-04** (CTEs/KDEs) - Quick win, enables traceability planner
4. **INGEST-05** (DPP Identification) - Quick win, enables DPP readiness checker
5. **INGEST-06** (CBV Vocabularies) - Quick win, enables EPCIS/Digital Link features

**You may adjust this order if you have a clearly better rationale.** Just explain your reasoning.

---

## Step 4: Reporting Format

After each INGEST-XX task is integrated, report back with:

### Integration Summary
- **Task ID:** INGEST-XX
- **Task Name:** <name>
- **Status:** ✅ Success / ❌ Failed
- **Integration Time:** X minutes
- **Rework Rate:** Y% (lines changed / lines delivered)

### Database Changes
- **Tables Created:** X raw + Y canonical
- **Records Ingested:** Z records
- **Schema Changes:** List of new tables/columns

### Test Results
- **Tests Passing:** X/Y
- **Coverage:** Z%
- **Idempotency:** ✅ Verified / ❌ Failed

### Data Quality
- **Valid Records:** X/Y (Z%)
- **Errors:** List of error types (if any)
- **Warnings:** List of warnings (if any)

### Value Assessment
- **Business Value:** How valuable is this dataset for ISA?
- **Current Usage:** Where is it already used?
- **Potential Usage:** Where can it be used?
- **Recommendations:** Any follow-up work needed?

---

## Step 5: Keep ISA Lean

**Follow these principles:**

1. **Reuse patterns** - Use ingestion patterns from Master Prompt
2. **Minimal context** - Only show ChatGPT what it needs
3. **No bloat** - Stick to HIGH-priority datasets only
4. **Idempotent** - All ingestion modules must be re-runnable
5. **Test coverage** - >85% coverage for all modules
6. **Clear errors** - Meaningful error messages and logging

---

## Step 6: What to Do If Things Go Wrong

### ChatGPT Can't Complete Task
- **Symptom:** Asks for missing files or says context is incomplete
- **Your Response:** Acknowledge, identify gap, prepare enhanced context, re-delegate
- **My Response:** Copy enhanced package, paste to ChatGPT, wait for new deliverables

### Integration Fails
- **Symptom:** TypeScript errors, test failures, runtime errors
- **Your Response:** Fix mechanical issues (imports, types), document logic bugs, report to me
- **My Response:** Review report, decide to fix manually or re-delegate

### Data Quality Issues
- **Symptom:** Missing records, incorrect mappings, null values
- **Your Response:** Analyze root cause (source data vs ingestion logic), fix or re-delegate
- **My Response:** Provide guidance if needed

---

## Success Metrics

### Per Task
- ✅ Integration time <1 hour
- ✅ Rework rate <10%
- ✅ Test coverage >85%
- ✅ Data quality >95%

### Overall Project
- ✅ All 5 tasks complete (INGEST-02 through INGEST-06)
- ✅ ~15-20 new tables
- ✅ ~50,000-100,000 rows ingested
- ✅ All 12 core ISA features enabled
- ✅ Clean, normalized database structure

---

## Ready to Start?

**Your first action:**

1. Run `pnpm verify:data` to check data file availability
2. Report results to me
3. If all files pass: prepare context package for INGEST-03 (recommended first task)
4. If files missing: tell me which ones

**Then we'll begin the delegation workflow.**

---

## Questions?

If you need clarification on:
- **Architecture patterns** → Read `/docs/INGESTION_GUIDE.md`
- **Task requirements** → Read task specs in `/tasks/for_chatgpt/`
- **Collaboration workflow** → Read `/docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md`
- **Dataset priorities** → Read `/docs/DATASET_PRIORITY_ANALYSIS.md`

---

**Let's build ISA's core data foundation! 🚀**

---

**End of Orchestration Prompt**
