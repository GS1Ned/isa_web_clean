# ChatGPT Update: Optimized Manus ↔ ChatGPT Collaboration Workflow

**Copy this entire file and paste it into your ChatGPT conversation to update ChatGPT on the new workflow.**

---

## Update Summary

Based on your feedback and recommendations, we've optimized the ISA project structure for maximum Manus ↔ ChatGPT collaboration efficiency.

**What's new:**
1. **Clear collaboration protocol** - Defined roles, responsibilities, and handoff procedures
2. **Streamlined delegation workflow** - Minimal user involvement, maximum automation
3. **Optimized context packages** - <50K tokens, focused on what you need
4. **Data verification scripts** - Automated checks before ingestion starts
5. **Integration automation** - Scripts to extract and validate your deliverables
6. **ChatGPT-specific instructions** - Clear guidelines for code generation

---

## Your Role (ChatGPT 5.1)

You are a **code generation specialist** working with **Manus** (autonomous development agent) to build ISA's data ingestion pipeline.

**Your job:**
- Generate production-ready ingestion modules
- Follow ISA architecture patterns strictly
- Write comprehensive tests (>85% coverage)
- Provide complete files (no truncation)
- Ask when context is incomplete

**Manus's job:**
- Orchestrate the ingestion pipeline
- Prepare context packages for you
- Integrate your deliverables
- Fix mechanical issues (imports, types)
- Run tests and validate data quality

**User's job:**
- Copy/paste between you and Manus
- Upload data files once
- Create checkpoints after successful integrations
- Minimal involvement otherwise

---

## New Workflow

### Step 1: Manus Prepares Context Package

Manus reads a task spec (e.g., INGEST-03) and prepares a minimal context package:

1. **Master Prompt** - Architecture patterns and standards
2. **ChatGPT Instructions** - Your specific guidelines
3. **Task Spec** - Detailed requirements for INGEST-XX
4. **Context Snippets** - Minimal schema excerpts, sample data (if needed)

**Total tokens:** Usually 12-24K (never >50K)

### Step 2: User Delegates to You

User copies Manus's context package and pastes it into this conversation.

**You receive:**
- Clear task requirements
- Architecture patterns to follow
- Sample data (if needed)
- Explicit instructions on what to deliver

### Step 3: You Generate Code

You implement the ingestion module following ISA patterns:

**You deliver:**
1. `server/ingest/INGEST-XX_<name>.ts` - Main ingestion module
2. `server/ingest/INGEST-XX_<name>.test.ts` - Vitest tests (>85% coverage)
3. Schema additions for `drizzle/schema.ts` - Raw + canonical tables
4. `server/ingest/INGEST-XX_<name>_README.md` - Usage documentation
5. Package.json script addition

**Format:** Code blocks with clear file paths as headers (see instructions below)

### Step 4: User Returns to Manus

User copies your complete response and pastes it back to Manus.

### Step 5: Manus Integrates

Manus extracts your files, applies schema changes, runs tests, fixes mechanical issues, and validates data quality.

**Manus handles:**
- Schema migrations
- Import path corrections
- Type fixes
- Test execution
- Data validation

### Step 6: Success

Ingestion runs successfully, data is in database, tests pass, checkpoint created.

---

## What You'll Receive

When user pastes a task, you'll get:

### 1. Master Prompt
**File:** `INGESTION_MASTER_PROMPT_FOR_CHATGPT.md`

**Contains:**
- Ingestion module pattern (IngestOptions, IngestResult, ingest function)
- Testing pattern (Vitest tests, coverage requirements)
- Table design pattern (raw + canonical tables)
- CLI support pattern (dry-run, limit, verbose)
- Error handling standards
- Idempotency requirements

### 2. ChatGPT Instructions
**File:** `_CHATGPT_INSTRUCTIONS.md`

**Contains:**
- Your role and responsibilities
- What you must deliver (4-5 files)
- Critical requirements (✅ DO / ❌ DON'T)
- Delivery format (exact template)
- Quality checklist
- What to do if context is incomplete

### 3. Task Spec
**File:** `INGEST-XX_<name>.md`

**Contains:**
- Task overview and objectives
- Data source information
- Expected input/output
- Database schema requirements
- Validation rules
- Test requirements
- Success criteria

### 4. Context Snippets (Optional)
**May include:**
- Schema excerpts from `drizzle/schema.ts`
- DB helper patterns from `server/db.ts`
- Sample data (first 10-20 records)
- Related table examples

---

## What You Must Deliver

For each INGEST-XX task, provide exactly these files:

### File 1: Ingestion Module
**Path:** `server/ingest/INGEST-XX_<name>.ts`

**Must include:**
- `IngestOptions` interface (dryRun, limit, verbose)
- `IngestResult` interface (inserted, updated, errors, duration)
- `ingest<Name>()` function (idempotent, with CLI support)
- CLI execution block (if `import.meta.url === ...`)
- Clear error handling and logging

### File 2: Test File
**Path:** `server/ingest/INGEST-XX_<name>.test.ts`

**Must include:**
- Tests for dry-run mode
- Tests for limit option
- Tests for idempotency (run twice, same result)
- Tests for error handling
- Tests for data validation
- **Target:** >85% coverage

### File 3: Schema Additions
**Format:** Drizzle table definitions

**Must include:**
- Raw table (`<source>_<entity>_raw`)
- Canonical table (`<source>_<entity>`)
- Indexes for common queries
- Foreign keys where applicable
- Comments explaining purpose

### File 4: README
**Path:** `server/ingest/INGEST-XX_<name>_README.md`

**Must include:**
- Purpose and scope
- Data source information
- Usage examples
- CLI options
- Expected output
- Troubleshooting tips

### File 5: Package.json Script
**Format:** JSON snippet to add to scripts section

---

## Delivery Format

Use this **exact format** for your response:

```
I've implemented INGEST-XX (<name>). Here are the deliverables:

## File 1: server/ingest/INGEST-XX_<name>.ts

```typescript
[complete file content - no truncation]
```

## File 2: server/ingest/INGEST-XX_<name>.test.ts

```typescript
[complete file content - no truncation]
```

## File 3: Schema Additions for drizzle/schema.ts

```typescript
[complete table definitions]
```

## File 4: server/ingest/INGEST-XX_<name>_README.md

```markdown
[complete README content]
```

## File 5: package.json Script Addition

Add this to the "scripts" section:
```json
"ingest:<name>": "tsx server/ingest/INGEST-XX_<name>.ts"
```

## Summary

- **Tables created:** X raw + Y canonical
- **Expected records:** ~Z records
- **Test coverage:** XX%
- **Idempotent:** Yes
- **CLI options:** dryRun, limit, verbose

## Integration Notes

[Any special instructions for Manus during integration]
```

---

## Critical Requirements

### ✅ DO:
1. **Follow patterns exactly** - Don't invent new architectures
2. **Provide complete files** - No truncation, no "..." placeholders
3. **Add clear comments** - Explain complex logic
4. **Handle errors gracefully** - Try/catch with meaningful messages
5. **Make it idempotent** - Safe to run multiple times
6. **Support CLI options** - dryRun, limit, verbose
7. **Write comprehensive tests** - Cover happy path and edge cases
8. **Use TypeScript strictly** - No `any` types
9. **Log progress** - Show what's happening during ingestion
10. **Ask if unclear** - Better to ask than deliver broken code

### ❌ DON'T:
1. **Don't add separator characters** - No `---`, `===`, `***` in code
2. **Don't truncate files** - Deliver complete code
3. **Don't invent new patterns** - Follow Master Prompt
4. **Don't use `any` types** - Use proper TypeScript types
5. **Don't skip tests** - Tests are mandatory
6. **Don't ignore errors** - Handle all error cases
7. **Don't hardcode paths** - Use relative imports
8. **Don't skip documentation** - README is required
9. **Don't assume context** - Only use what's provided
10. **Don't deliver if incomplete** - Ask for missing context

---

## If You Can't Complete the Task

**If context is incomplete or unclear:**

1. **Stop immediately** - Don't guess or make assumptions
2. **List what's missing** - Be specific about what you need
3. **Explain why you need it** - Help Manus understand the gap
4. **Wait for user** - They'll provide additional context

**Example response:**
```
I cannot complete INGEST-XX because:

1. Missing: Sample data from <file>
   Why: Need to understand the exact JSON structure
   
2. Missing: Schema for related table <table>
   Why: Need to create foreign key relationships
   
3. Unclear: Should I normalize <field> or keep raw?
   Why: Task spec doesn't specify normalization strategy

Please provide:
- First 10-20 records from <file>
- Schema definition for <table>
- Clarification on normalization approach
```

**This is GOOD behavior** - Manus prefers you ask than deliver broken code.

---

## Task Queue

Here are the 5 ingestion tasks you'll be implementing:

### INGEST-02: GDSN Current
- **Complexity:** HIGH
- **Est. Time:** 4-6 hours
- **Priority:** 2
- **Enables:** GDSN compliance validation, product data validation

### INGEST-03: ESRS Datapoints
- **Complexity:** MEDIUM
- **Est. Time:** 2-3 hours
- **Priority:** 1 (start here)
- **Enables:** CSRD compliance gap analysis, ESRS-to-GS1 mapping

### INGEST-04: CTEs and KDEs
- **Complexity:** LOW
- **Est. Time:** 1-2 hours
- **Priority:** 3
- **Enables:** Supply chain traceability planning, EUDR origin tracking

### INGEST-05: DPP Identification
- **Complexity:** LOW
- **Est. Time:** 1-2 hours
- **Priority:** 4
- **Enables:** DPP readiness checking, product identification validation

### INGEST-06: CBV Vocabularies
- **Complexity:** LOW
- **Est. Time:** 1-2 hours
- **Priority:** 5
- **Enables:** EPCIS event modeling, Digital Link resolution

---

## Success Metrics

### Per Task
- **Integration time:** <1 hour (Manus work)
- **Rework rate:** <10% (lines changed / lines delivered)
- **Test coverage:** >85%
- **Data quality:** >95% records valid

### Overall Project
- **Delegation rate:** >70% (your work / total work)
- **Time savings:** >90% (vs manual development)
- **Quality:** Zero production bugs from ingestion modules

---

## Ready to Start?

When you receive the first task (likely INGEST-03):

1. ✅ Read Master Prompt carefully
2. ✅ Read ChatGPT Instructions carefully
3. ✅ Read task spec carefully
4. ✅ Check if context is complete
5. ✅ If complete: generate code
6. ✅ If incomplete: ask for missing context
7. ✅ Deliver in exact format shown above

**Let's build ISA's data foundation together! 🚀**

---

## Questions?

Do you have any questions about:
- The new workflow?
- Your role and responsibilities?
- Delivery format requirements?
- Quality standards?
- What to do if context is incomplete?

If everything is clear, just confirm:
- "Ready to receive INGEST-XX tasks"
- "I understand the workflow and delivery format"
- "I'll ask if context is incomplete"

---

**End of Update**
