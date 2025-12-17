# ISA Workflow Improvements: Actionable Implementation Guide

**Author:** Manus AI  
**Date:** December 17, 2025  
**Purpose:** Translate Manus best practices into concrete, immediately actionable workflow improvements for ISA development

---

## Overview

This document provides step-by-step implementation guidance for optimizing ISA development workflows based on authoritative Manus best practices. Each workflow improvement includes: **current state analysis, specific actions, implementation steps, validation criteria, and expected outcomes**.

---

## Workflow 1: Data Ingestion Pipeline

### Current State

ISA has completed INGEST-02 through INGEST-06, ingesting 5,628 records across 11 canonical tables. Ingestion scripts are located in `server/ingest/` and follow a sequential processing pattern.

### Problems Identified

1. **Non-deterministic JSON serialization** may break KV-cache
2. **Monolithic prompts** make it difficult to tune individual components
3. **Error handling** hides failures instead of preserving them for learning
4. **Sequential processing** limits scalability for large batches

### Specific Actions

#### Action 1.1: Ensure Deterministic JSON Serialization

**Implementation:**

```typescript
// Current (problematic):
const output = JSON.stringify(record);

// Improved:
import { sortKeys } from 'sort-keys';

const output = JSON.stringify(sortKeys(record, { deep: true }));
```

**Files to modify:**
- `server/ingest/INGEST-02_gdsn_current.ts`
- `server/ingest/INGEST-03_esrs_datapoints.ts`
- `server/ingest/INGEST-04_ctes_kdes.ts`
- `server/ingest/INGEST-05_dpp_rules.ts`
- `server/ingest/INGEST-06_cbv_digital_link.ts`

**Validation:**
```bash
# Run ingestion twice, compare outputs
pnpm tsx server/ingest/INGEST-03_esrs_datapoints.ts > output1.json
pnpm tsx server/ingest/INGEST-03_esrs_datapoints.ts > output2.json
diff output1.json output2.json  # Should be identical
```

**Expected outcome:** 100% deterministic output, improved KV-cache hit rate

---

#### Action 1.2: Refactor Ingestion Prompts to 5-Block Structure

**Implementation:**

Create `server/prompts/ingestion/` directory with modular prompt blocks:

```typescript
// server/prompts/ingestion/system.ts
export const INGESTION_SYSTEM_PROMPT = `
You are an ESG data ingestion specialist with expertise in GS1 and EFRAG standards.

Mission: Extract structured data from authoritative sources and transform into ISA canonical schema.

Hard guardrails:
- Never hallucinate attribute IDs or datapoint codes
- Never modify source data semantics
- If uncertain about mapping, mark as "needs_review" instead of guessing
- All outputs must conform to JSON schema
`;

// server/prompts/ingestion/context.ts
export const buildIngestionContext = (params: {
  sourceFile: string;
  targetSchema: string;
  constraints: string[];
}) => `
Task: Ingest data from ${params.sourceFile}
Target schema: ${params.targetSchema}
Constraints:
${params.constraints.map(c => `- ${c}`).join('\n')}

Current plan (from todo.md):
[Include relevant todo.md excerpt here]
`;

// server/prompts/ingestion/step_policy.ts
export const INGESTION_STEP_POLICY = `
Process:
1. Analyze source file structure
2. Plan extraction strategy (identify key fields, relationships)
3. Act: Extract one record at a time (max 1 tool call per loop)
4. Observe: Validate extracted record against schema
5. Evaluate: If valid, store; if invalid, log error and continue

Always log:
- Rationale for extraction strategy
- Chosen tool (e.g., xlsx parser, JSON parser)
- Parameters (row number, field names)
- Observation summary (record extracted, validation result)
`;

// server/prompts/ingestion/output_contracts.ts
export const INGESTION_OUTPUT_SCHEMA = {
  type: "object",
  required: ["records", "errors", "summary"],
  properties: {
    records: {
      type: "array",
      items: { type: "object" },
      description: "Successfully extracted records"
    },
    errors: {
      type: "array",
      items: {
        type: "object",
        required: ["row", "field", "error"],
        properties: {
          row: { type: "number" },
          field: { type: "string" },
          error: { type: "string" }
        }
      },
      description: "Extraction errors for debugging"
    },
    summary: {
      type: "object",
      required: ["total", "success", "failed"],
      properties: {
        total: { type: "number" },
        success: { type: "number" },
        failed: { type: "number" }
      }
    }
  }
};

// server/prompts/ingestion/verification.ts
export const INGESTION_VERIFICATION_CHECKLIST = `
Before finalizing:
- [ ] All records conform to target schema
- [ ] No duplicate IDs
- [ ] All foreign key references are valid
- [ ] Error log contains actionable debugging info
- [ ] Summary metrics are accurate
- [ ] If any record has confidence < 0.7, flag for human review
`;
```

**Files to create:**
- `server/prompts/ingestion/system.ts`
- `server/prompts/ingestion/context.ts`
- `server/prompts/ingestion/step_policy.ts`
- `server/prompts/ingestion/output_contracts.ts`
- `server/prompts/ingestion/verification.ts`
- `server/prompts/ingestion/index.ts` (assembles all blocks)

**Files to modify:**
- `server/ingest/INGEST-03_esrs_datapoints.ts` (use modular prompts)

**Validation:**
```bash
# Run ingestion with modular prompts
pnpm tsx server/ingest/INGEST-03_esrs_datapoints.ts

# Verify output conforms to schema
pnpm tsx scripts/validate-ingestion-output.ts
```

**Expected outcome:** Easier prompt tuning, better maintainability, clearer error messages

---

#### Action 1.3: Preserve Errors in Context

**Implementation:**

```typescript
// Current (problematic):
try {
  const record = await extractRecord(row);
  records.push(record);
} catch (error) {
  console.error(`Failed to extract row ${rowNum}:`, error);
  // Error is lost, model can't learn from it
}

// Improved:
const errors: IngestionError[] = [];

for (const row of rows) {
  try {
    const record = await extractRecord(row);
    records.push(record);
  } catch (error) {
    // Preserve error in context
    errors.push({
      row: rowNum,
      field: row.field,
      error: error.message,
      attemptedValue: row.value,
      timestamp: new Date().toISOString()
    });
    
    // Continue processing (don't fail entire batch)
    continue;
  }
}

// Return errors alongside records
return { records, errors, summary };
```

**Files to modify:**
- All `server/ingest/INGEST-*.ts` files

**Database schema addition:**
```sql
CREATE TABLE ingestion_errors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ingestion_run_id VARCHAR(255) NOT NULL,
  source_file VARCHAR(255) NOT NULL,
  row_number INT,
  field_name VARCHAR(255),
  error_message TEXT,
  attempted_value TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ingestion_run (ingestion_run_id),
  INDEX idx_source_file (source_file)
);
```

**Validation:**
```bash
# Run ingestion with intentional errors
pnpm tsx server/ingest/INGEST-03_esrs_datapoints.ts

# Check errors are logged
SELECT * FROM ingestion_errors WHERE ingestion_run_id = 'test_run_001';
```

**Expected outcome:** 90%+ retry success rate, better error recovery, actionable debugging info

---

#### Action 1.4: Use Wide Research for Batch Ingestion

**When to use:** Ingesting 50+ similar items (e.g., GS1 GDSN attributes)

**Implementation:**

Instead of sequential ingestion:
```typescript
// Current (sequential):
for (const attribute of attributes) {
  await ingestAttribute(attribute);
}
```

Use Wide Research:
```
Ingest all 50 GS1 GDSN attribute definitions from this Excel file and create structured schema.

For each attribute, extract:
- Attribute ID (e.g., "additionalTradeItemDescription")
- Data type (string, number, boolean, date)
- Definition (from column B)
- Business rules (from column C)
- ESRS mapping (if mentioned in notes)

Output format: JSON array with schema:
{
  "attributeId": "string",
  "dataType": "string",
  "definition": "string",
  "businessRules": "string",
  "esrsMapping": "string | null"
}
```

**Validation:**
```bash
# Compare Wide Research output vs. sequential ingestion
# Both should produce identical results, but Wide Research should be faster
```

**Expected outcome:** 10x faster ingestion for large batches, uniform quality across all items

---

## Workflow 2: Ask ISA RAG System

### Current State

ISA's Ask ISA system uses LLM-based relevance scoring (0-10 scale) to retrieve 5 most relevant knowledge chunks from 155 total chunks. System prompt is monolithic, making it difficult to tune.

### Problems Identified

1. **Monolithic system prompt** mixes role definition, guardrails, and output formatting
2. **No user feedback mechanism** to track answer quality
3. **No A/B testing framework** for prompt optimization
4. **LLM scoring is slow** (will be replaced by vector embeddings when Manus adds API)

### Specific Actions

#### Action 2.1: Refactor Ask ISA Prompts to 5-Block Structure

**Implementation:**

Create `server/prompts/ask_isa/` directory:

```typescript
// server/prompts/ask_isa/system.ts
export const ASK_ISA_SYSTEM_PROMPT = `
You are an ESG compliance analyst with expertise in EU sustainability regulations and GS1 supply chain standards.

Mission: Answer user questions about ESRS datapoints, GS1 attributes, regulation requirements, and compliance mappings.

Hard guardrails:
- Never hallucinate regulation IDs, standard codes, or datapoint IDs
- If uncertain, respond "I don't have enough information to answer this question accurately"
- All claims must be cited with [Source N] notation
- If confidence < 0.7, add disclaimer: "This answer has moderate confidence. Please verify with authoritative sources."
`;

// server/prompts/ask_isa/context.ts
export const buildAskISAContext = (params: {
  question: string;
  relevantChunks: KnowledgeChunk[];
  conversationHistory?: Message[];
}) => `
User question: ${params.question}

Relevant knowledge (retrieved from vector database):
${params.relevantChunks.map((chunk, i) => `
[Source ${i+1}] (${chunk.sourceType}: ${chunk.title}, relevance: ${chunk.similarity}%)
${chunk.content}
`).join('\n\n')}

${params.conversationHistory ? `
Previous conversation:
${params.conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}
` : ''}
`;

// server/prompts/ask_isa/step_policy.ts
export const ASK_ISA_STEP_POLICY = `
Process:
1. Analyze question to identify key entities (regulations, standards, datapoints)
2. Plan answer structure (introduction, main points, conclusion)
3. Act: Generate answer using retrieved knowledge
4. Observe: Verify all claims are cited
5. Evaluate: Check if answer directly addresses question

Always include:
- Direct answer to question (no preamble)
- [Source N] citations for all factual claims
- Actionable next steps (if applicable)
`;

// server/prompts/ask_isa/output_contracts.ts
export const ASK_ISA_OUTPUT_SCHEMA = {
  type: "object",
  required: ["answer", "sources", "confidence"],
  properties: {
    answer: {
      type: "string",
      description: "Natural language answer with [Source N] citations"
    },
    sources: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "title", "url", "relevance"],
        properties: {
          id: { type: "number" },
          title: { type: "string" },
          url: { type: "string" },
          relevance: { type: "number", minimum: 0, maximum: 100 }
        }
      },
      description: "List of sources cited in answer"
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
      description: "Confidence level (0-1) in answer accuracy"
    }
  }
};

// server/prompts/ask_isa/verification.ts
export const ASK_ISA_VERIFICATION_CHECKLIST = `
Before finalizing:
- [ ] Answer directly addresses user question
- [ ] All factual claims have [Source N] citations
- [ ] Citations correspond to provided sources
- [ ] No hallucinated regulation IDs or standard codes
- [ ] If confidence < 0.7, disclaimer is included
- [ ] Answer is actionable (includes next steps if applicable)
`;
```

**Files to create:**
- `server/prompts/ask_isa/system.ts`
- `server/prompts/ask_isa/context.ts`
- `server/prompts/ask_isa/step_policy.ts`
- `server/prompts/ask_isa/output_contracts.ts`
- `server/prompts/ask_isa/verification.ts`
- `server/prompts/ask_isa/index.ts`

**Files to modify:**
- `server/routers/ask-isa.ts` (use modular prompts)

**Validation:**
```bash
# Test with sample questions
curl -X POST http://localhost:3000/api/trpc/askIsa.ask \
  -H "Content-Type: application/json" \
  -d '{"question": "How do I report circular economy metrics using GS1 standards?"}'

# Verify output conforms to schema
```

**Expected outcome:** Easier prompt tuning, better answer quality, clearer citations

---

#### Action 2.2: Add User Feedback Mechanism

**Implementation:**

**Database schema:**
```sql
CREATE TABLE ask_isa_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id VARCHAR(255) NOT NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  feedback_type ENUM('positive', 'negative') NOT NULL,
  feedback_comment TEXT,
  user_id INT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_question_id (question_id),
  INDEX idx_feedback_type (feedback_type),
  INDEX idx_timestamp (timestamp)
);
```

**tRPC procedure:**
```typescript
// server/routers/ask-isa.ts
export const askIsaRouter = router({
  // ... existing procedures

  submitFeedback: protectedProcedure
    .input(z.object({
      questionId: z.string(),
      questionText: z.string(),
      answerText: z.string(),
      feedbackType: z.enum(['positive', 'negative']),
      feedbackComment: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      await db.insert(askIsaFeedback).values({
        questionId: input.questionId,
        questionText: input.questionText,
        answerText: input.answerText,
        feedbackType: input.feedbackType,
        feedbackComment: input.feedbackComment,
        userId: ctx.user.id
      });

      return { success: true };
    })
});
```

**Frontend component:**
```tsx
// client/src/components/FeedbackButtons.tsx (already exists, enhance it)
export function FeedbackButtons({ questionId, questionText, answerText }: Props) {
  const submitFeedback = trpc.askIsa.submitFeedback.useMutation();

  const handleFeedback = (type: 'positive' | 'negative') => {
    submitFeedback.mutate({
      questionId,
      questionText,
      answerText,
      feedbackType: type
    });
    toast.success('Thank you for your feedback!');
  };

  return (
    <div className="flex gap-2">
      <Button variant="ghost" size="sm" onClick={() => handleFeedback('positive')}>
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => handleFeedback('negative')}>
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

**Validation:**
```bash
# Check feedback is being logged
SELECT 
  feedback_type,
  COUNT(*) as count,
  AVG(CASE WHEN feedback_type = 'positive' THEN 1 ELSE 0 END) as satisfaction_rate
FROM ask_isa_feedback
GROUP BY feedback_type;
```

**Expected outcome:** Track answer quality, identify problematic questions, measure improvement over time

---

#### Action 2.3: Implement A/B Testing Framework

**Implementation:**

```typescript
// server/prompts/ask_isa/variants.ts
export const PROMPT_VARIANTS = {
  'v1_compliance_analyst': {
    system: 'You are an ESG compliance analyst...',
    version: '1.0'
  },
  'v2_gs1_expert': {
    system: 'You are a GS1 standards expert...',
    version: '2.0'
  },
  'v3_regulation_specialist': {
    system: 'You are an EU regulation specialist...',
    version: '3.0'
  }
};

// server/routers/ask-isa.ts
export const askIsaRouter = router({
  ask: protectedProcedure
    .input(z.object({
      question: z.string(),
      promptVariant: z.string().optional() // For A/B testing
    }))
    .mutation(async ({ input, ctx }) => {
      // Select prompt variant (default to v1, or use specified variant)
      const variant = input.promptVariant || 'v1_compliance_analyst';
      const prompt = PROMPT_VARIANTS[variant];

      // Log which variant was used
      await db.insert(askIsaQueries).values({
        userId: ctx.user.id,
        question: input.question,
        promptVariant: variant,
        promptVersion: prompt.version,
        timestamp: new Date()
      });

      // Generate answer using selected variant
      const answer = await generateAnswer(input.question, prompt);

      return answer;
    })
});
```

**Validation:**
```bash
# Compare variants
SELECT 
  prompt_variant,
  COUNT(*) as queries,
  AVG(CASE WHEN feedback_type = 'positive' THEN 1 ELSE 0 END) as satisfaction_rate
FROM ask_isa_queries
LEFT JOIN ask_isa_feedback ON ask_isa_queries.id = ask_isa_feedback.question_id
GROUP BY prompt_variant;
```

**Expected outcome:** Data-driven prompt optimization, measurable quality improvements

---

## Workflow 3: News Pipeline

### Current State

ISA's news pipeline aggregates content from EU, GS1, and Dutch/Benelux sources. AI-powered enrichment tags regulations, analyzes GS1 impact, and classifies sectors.

### Problems Identified

1. **Monolithic AI enrichment prompts** mix multiple concerns
2. **Sequential processing** limits scalability for 100+ news items
3. **No diversity in enrichment** may cause few-shot rut

### Specific Actions

#### Action 3.1: Refactor News AI Enrichment to 5-Block Structure

**Implementation:**

Create `server/prompts/news_enrichment/` directory with modular blocks (similar to Ask ISA structure).

**Files to create:**
- `server/prompts/news_enrichment/system.ts`
- `server/prompts/news_enrichment/context.ts`
- `server/prompts/news_enrichment/step_policy.ts`
- `server/prompts/news_enrichment/output_contracts.ts`
- `server/prompts/news_enrichment/verification.ts`

**Files to modify:**
- `server/news-ai-processor.ts` (use modular prompts)

**Expected outcome:** Easier tuning of enrichment logic, better tag accuracy

---

#### Action 3.2: Introduce Diversity in Enrichment

**Implementation:**

```typescript
// server/prompts/news_enrichment/templates.ts
const ENRICHMENT_TEMPLATES = [
  // Template 1: Regulation-focused
  `Analyze this news article from an EU regulation perspective.
  Identify which regulations are impacted and how.`,
  
  // Template 2: GS1-focused
  `Analyze this news article from a GS1 standards perspective.
  Identify which GS1 standards are relevant and why.`,
  
  // Template 3: Sector-focused
  `Analyze this news article from an industry sector perspective.
  Identify which sectors are affected and what actions they should take.`
];

// Randomly select template for each news item
const template = ENRICHMENT_TEMPLATES[Math.floor(Math.random() * ENRICHMENT_TEMPLATES.length)];
```

**Files to modify:**
- `server/news-ai-processor.ts`

**Expected outcome:** Avoid few-shot rut, maintain quality across large batches

---

#### Action 3.3: Use Wide Research for Batch Enrichment

**When to use:** Processing 100+ news items at once

**Implementation:**

```
Analyze these 100 news articles and enrich each with:
- Regulation tags (which EU regulations are mentioned or impacted)
- GS1 impact tags (which GS1 standards are relevant)
- Sector tags (which industries are affected)
- Impact level (low, medium, high, critical)
- Suggested actions (what should GS1 members do)

Output format: JSON array with schema:
{
  "newsId": "string",
  "regulationTags": ["string"],
  "gs1ImpactTags": ["string"],
  "sectorTags": ["string"],
  "impactLevel": "low" | "medium" | "high" | "critical",
  "suggestedActions": ["string"]
}
```

**Expected outcome:** 10x faster enrichment, uniform quality across all news items

---

## Workflow 4: Advisory Generation

### Current State

ISA has Advisory v1.1 with 13 ESRS-GS1 mappings, 3 gaps identified, 3 recommendations.

### Problems Identified

1. **Monolithic advisory generation prompts**
2. **No evaluation baseline** before generating new versions
3. **Sequential processing** for multi-sector advisories

### Specific Actions

#### Action 4.1: Refactor Advisory Prompts to 5-Block Structure

**Implementation:**

Create `server/prompts/advisory/` directory with modular blocks.

**Files to create:**
- `server/prompts/advisory/system.ts`
- `server/prompts/advisory/context.ts`
- `server/prompts/advisory/step_policy.ts`
- `server/prompts/advisory/output_contracts.ts`
- `server/prompts/advisory/verification.ts`

**Files to modify:**
- `scripts/advisory/generate_report_data.ts` (use modular prompts)

**Expected outcome:** Easier tuning, better mapping accuracy

---

#### Action 4.2: Establish Evaluation Baseline

**Implementation:**

```typescript
// scripts/advisory/evaluate_advisory.ts
import { readFileSync } from 'fs';

const advisory = JSON.parse(readFileSync('data/advisories/ISA_ADVISORY_v1.1.json', 'utf-8'));

// Evaluation criteria
const criteria = {
  mappingsCiteAuthoritativeSources: true, // 100% of mappings cite GS1 Position Paper
  gapsHaveRecommendations: true,          // 100% of gaps have actionable recommendations
  coverageMetricsAccurate: true,          // Coverage % matches actual mapping count
  noHallucinatedAttributeIds: true        // No made-up GS1 attribute IDs
};

// Run evaluation
const results = evaluateAdvisory(advisory, criteria);

// Store baseline
await db.insert(advisoryEvaluations).values({
  version: '1.1',
  criteria: JSON.stringify(criteria),
  results: JSON.stringify(results),
  timestamp: new Date()
});

console.log('Baseline established:', results);
```

**Validation:**
```bash
# Run evaluation before generating v1.2
pnpm tsx scripts/advisory/evaluate_advisory.ts

# Only proceed if v1.2 beats v1.1 baseline
```

**Expected outcome:** Data-driven advisory evolution, no regressions

---

#### Action 4.3: Use Wide Research for Multi-Sector Advisories

**When to use:** Generating sector-specific advisories (e.g., Textiles, Healthcare, Construction)

**Implementation:**

```
Generate sector-specific ESRS-GS1 compliance advisories for:
- Textiles sector
- Healthcare sector
- Construction sector

For each sector, analyze:
- Which ESRS requirements are most relevant
- Which GS1 standards are commonly used
- Sector-specific compliance challenges
- Recommended GS1 attributes for ESRS reporting

Output format: JSON object with keys: textiles, healthcare, construction
Each value is a full advisory report following ISA_ADVISORY schema.
```

**Expected outcome:** 3x faster multi-sector advisory generation, uniform quality

---

## Implementation Timeline

### Week 1: Context Engineering Foundation
- [ ] Day 1-2: Audit JSON serialization, ensure deterministic output
- [ ] Day 3-4: Remove timestamps from prompts, verify KV-cache optimization
- [ ] Day 5: Document file system as memory architecture

### Week 2: Modular Prompts (Phase 1)
- [ ] Day 1-2: Refactor Ask ISA prompts to 5-block structure
- [ ] Day 3-4: Refactor ingestion prompts to 5-block structure
- [ ] Day 5: Test and validate modular prompts

### Week 3: Modular Prompts (Phase 2)
- [ ] Day 1-2: Refactor news enrichment prompts to 5-block structure
- [ ] Day 3-4: Refactor advisory prompts to 5-block structure
- [ ] Day 5: Store all prompt blocks in `server/prompts/` with versions

### Week 4: Error Recovery & Diversity
- [ ] Day 1-2: Preserve errors in ingestion context, create `ingestion_errors` table
- [ ] Day 3-4: Introduce diversity in news enrichment templates
- [ ] Day 5: Document error recovery patterns

### Week 5: Evaluation & Baselines
- [ ] Day 1-2: Define ISA-specific success metrics
- [ ] Day 3-4: Create automated eval suite (20-50 test cases)
- [ ] Day 5: Establish baselines for all workflows

### Week 6: Wide Research Integration
- [ ] Day 1-2: Test Wide Research with pilot ingestion task
- [ ] Day 3-4: Integrate Wide Research into news enrichment
- [ ] Day 5: Document Wide Research usage patterns

---

## Success Metrics

### Ingestion Workflow
- **Deterministic output:** 100% identical outputs on repeated runs
- **Schema adherence:** 100% of records conform to schemas
- **Error recovery rate:** ≥ 90% of failed operations succeed on retry
- **Batch processing speed:** 10x faster with Wide Research (for 50+ items)

### Ask ISA Workflow
- **RAG precision:** ≥ 85% (measured against human-labeled test set)
- **User satisfaction:** ≥ 90% positive feedback (thumbs up)
- **Answer quality improvement:** Measurable via A/B testing (e.g., v2 beats v1 by 10%)
- **Response time:** < 5 seconds for typical query

### News Pipeline Workflow
- **Enrichment accuracy:** ≥ 90% correct regulation tags (measured against manual review)
- **Processing speed:** 10x faster with Wide Research (for 100+ items)
- **Tag diversity:** No degradation in quality across large batches

### Advisory Workflow
- **Mapping accuracy:** 100% cite authoritative sources
- **Gap coverage:** 100% of gaps have actionable recommendations
- **Multi-sector generation:** 3x faster with Wide Research

---

## Conclusion

These workflow improvements translate Manus best practices into concrete, immediately actionable steps for ISA development. By implementing these changes over a 6-week period, ISA can achieve:

1. **10x cost savings** via KV-cache optimization
2. **90%+ error recovery rate** via context preservation
3. **85%+ RAG precision** via modular prompts and evaluation
4. **10x faster batch processing** via Wide Research
5. **Data-driven optimization** via A/B testing and baselines

Each workflow improvement includes validation criteria and expected outcomes, enabling measurable progress tracking and continuous optimization.
