# ASK_ISA Implementation Guide

**Capability:** ASK_ISA  
**Version:** 1.0  
**Last Updated:** 2026-02-12  
**Status:** Production

---

## Overview

This guide provides step-by-step instructions for implementing, extending, and maintaining the ASK_ISA capability. It covers setup, core workflows, implementation patterns, and common customization scenarios.

---

## Prerequisites

### Required Knowledge
- TypeScript 5.9+
- tRPC 11
- React 19
- Drizzle ORM
- OpenAI API

### Required Tools
- Node.js 22.13.0
- pnpm 10.4.1
- MySQL/TiDB database
- Manus Forge API access

### Environment Variables

```bash
# Required
DATABASE_URL=mysql://user:pass@host:port/db
OPENAI_API_KEY=sk-...
MANUS_OAUTH_CLIENT_ID=...
MANUS_OAUTH_CLIENT_SECRET=...

# Optional
ASK_ISA_CACHE_TTL=86400  # 24 hours
ASK_ISA_RATE_LIMIT=100   # requests/hour
```

---

## Setup

### 1. Database Schema

Ensure these tables exist (via Drizzle migrations):

```typescript
// drizzle/schema.ts
export const knowledgeEmbeddings = mysqlTable("knowledge_embeddings", {
  id: int("id").primaryKey().autoincrement(),
  sourceType: varchar("source_type", { length: 50 }).notNull(),
  sourceId: int("source_id").notNull(),
  content: text("content").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  url: varchar("url", { length: 500 }),
  embedding: json("embedding"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const qaConversations = mysqlTable("qa_conversations", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id"),
  title: varchar("title", { length: 200 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const qaMessages = mysqlTable("qa_messages", {
  id: int("id").primaryKey().autoincrement(),
  conversationId: int("conversation_id").notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  sources: json("sources"),
  retrievedChunks: int("retrieved_chunks"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const askIsaFeedback = mysqlTable("ask_isa_feedback", {
  id: int("id").primaryKey().autoincrement(),
  questionId: varchar("question_id", { length: 100 }).notNull(),
  userId: int("user_id").notNull(),
  questionText: text("question_text").notNull(),
  answerText: text("answer_text").notNull(),
  feedbackType: varchar("feedback_type", { length: 20 }).notNull(),
  feedbackComment: text("feedback_comment"),
  promptVariant: varchar("prompt_variant", { length: 50 }),
  confidenceScore: varchar("confidence_score", { length: 10 }),
  sourcesCount: int("sources_count"),
  timestamp: timestamp("timestamp").defaultNow(),
});
```

### 2. Knowledge Base Population

Generate embeddings for existing content:

```bash
# Via tRPC endpoint (admin only)
curl -X POST https://your-app.com/trpc/askISA.generateEmbeddings \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sourceType": "regulation",
    "sourceIds": []
  }'

# Or via script
pnpm tsx server/scripts/generate-embeddings.ts
```

### 3. BM25 Index Initialization

```typescript
// server/bm25-search.ts
import { initializeBM25Index } from './bm25-search';

// Call during server startup
await initializeBM25Index();
```

---

## Core Workflows

### Workflow 1: Question Answering

```
User Query
    ↓
Query Analysis (ambiguity detection)
    ↓
Query Classification (guardrails)
    ↓
Cache Check
    ↓
Hybrid Search (vector 70% + BM25 30%)
    ↓
Evidence Sufficiency Analysis
    ↓
Conversation Context Loading
    ↓
Prompt Assembly (v2.0 modular)
    ↓
LLM Generation (GPT-4o-mini)
    ↓
Citation Validation
    ↓
Claim Verification
    ↓
Authority Scoring
    ↓
Response Caching
    ↓
RAG Trace Recording
    ↓
Return Response
```

### Workflow 2: Knowledge Base Update

```
New Content Added to Database
    ↓
Trigger Embedding Generation
    ↓
Prepare Content (normalize, chunk)
    ↓
Generate Title & URL
    ↓
Create Embedding (text-embedding-3-small)
    ↓
Store in knowledge_embeddings
    ↓
Invalidate Cache
    ↓
Rebuild BM25 Index
```

### Workflow 3: Conversation Management

```
User Starts Conversation
    ↓
Create qa_conversations record
    ↓
User Asks Question
    ↓
Add qa_messages (role: user)
    ↓
Generate Answer
    ↓
Add qa_messages (role: assistant)
    ↓
Load Last 6 Messages for Context
    ↓
Continue Conversation
```

---

## Implementation Patterns

### Pattern 1: Hybrid Search

**Purpose:** Combine semantic and keyword search for optimal retrieval

**Implementation:**

```typescript
import { hybridSearch } from '../hybrid-search';

const results = await hybridSearch(question, {
  vectorWeight: 0.7,      // 70% semantic
  bm25Weight: 0.3,        // 30% keyword
  limit: 5,               // Top-5 results
  vectorThreshold: 0.3,   // Min similarity
  sectorFilter: sector !== "all" ? sector : undefined,
});
```

**Key Points:**
- Vector search captures semantic meaning
- BM25 captures exact keyword matches
- Reciprocal Rank Fusion (RRF) merges results
- Sector filter boosts sector-specific content (20% per keyword match, max 60%)

### Pattern 2: Evidence Sufficiency Analysis

**Purpose:** Abstain when evidence is insufficient (Hard Abstention Policy)

**Implementation:**

```typescript
import { analyzeEvidenceSufficiency, inferQueryType } from '../services/evidence-analysis';

const evidenceChunks = hybridResults.map(r => ({
  id: r.id,
  title: r.title,
  content: r.description,
  similarity: r.hybridScore,
  authorityLevel: r.authorityLevel,
  sourceType: r.type,
  url: r.url,
}));

const queryType = inferQueryType(question);
const evidenceAnalysis = analyzeEvidenceSufficiency(evidenceChunks, {
  query: question,
  queryType,
});

if (!evidenceAnalysis.isSufficient) {
  const abstentionMessage = generateAbstentionMessage(
    evidenceAnalysis.abstentionReason,
    evidenceAnalysis.details
  );
  return { answer: abstentionMessage, abstained: true };
}
```

**Abstention Triggers:**
- Avg similarity < 0.5
- High-quality chunks < 2
- Authority level < "guidance"
- Conflicting evidence detected

### Pattern 3: Claim-Citation Verification

**Purpose:** Ensure all claims are supported by citations

**Implementation:**

```typescript
import { verifyResponseClaims } from '../claim-citation-verifier';

const claimVerification = verifyResponseClaims(
  answer,
  hybridResults.map(r => ({
    id: r.id,
    title: r.title,
    url: r.url,
    authorityLevel: r.authorityLevel,
  }))
);

// Check verification rate
if (claimVerification.verificationRate < 0.5) {
  serverLogger.warn('[AskISA] Low verification rate:', claimVerification);
}
```

**Verification Metrics:**
- `verificationRate`: Verified claims / total claims
- `totalClaims`: Number of factual claims extracted
- `verifiedClaims`: Claims with supporting citations
- `warnings`: Issues detected (e.g., "numerical claims lack support")

### Pattern 4: Authority Scoring

**Purpose:** Assess reliability of sources

**Implementation:**

```typescript
import { calculateAuthorityScore, classifyAuthority } from '../authority-model';

// Classify individual source
const authorityInfo = classifyAuthority({
  type: result.type,
  title: result.title,
  url: result.url,
});

// Calculate weighted score for all sources
const authorityScore = calculateAuthorityScore(
  hybridResults.map(r => ({
    authorityLevel: r.authorityLevel,
    similarity: r.hybridScore,
  }))
);
```

**Authority Levels:**
1. **Official** (1.0): EU regulations, EFRAG ESRS
2. **Verified** (0.9): GS1 standards, ISO standards
3. **Guidance** (0.7): Implementation guides, technical specs
4. **Industry** (0.5): Whitepapers, reports
5. **Community** (0.3): User-generated content

### Pattern 5: Response Caching

**Purpose:** Improve performance for repeated queries

**Implementation:**

```typescript
import { getCachedResponse, cacheResponse } from '../ask-isa-cache';

// Check cache first
const cachedResponse = getCachedResponse(question);
if (cachedResponse) {
  return { ...cachedResponse, fromCache: true };
}

// After generating response
cacheResponse(question, {
  answer,
  sources,
  confidence,
  claimVerification,
});
```

**Cache Configuration:**
- **Key:** SHA-256 hash of normalized question
- **TTL:** 24 hours (configurable via `ASK_ISA_CACHE_TTL`)
- **Invalidation:** Manual via admin endpoint or on knowledge base update

### Pattern 6: RAG Tracing

**Purpose:** Observability for debugging and monitoring

**Implementation:**

```typescript
import { RagTraceManager } from '../services/rag-tracing';

const trace = await RagTraceManager.start({
  query: question,
  sectorFilter: sector !== 'all' ? sector : undefined,
  conversationId,
  userId,
});

try {
  // Record retrieval
  trace.recordRetrieval(
    hybridResults.map(r => ({ chunkId: r.id, score: r.hybridScore })),
    retrievalLatencyMs
  );
  
  // Record generation
  trace.recordGeneration(answer, citations, generationLatencyMs, metadata);
  
  // Set verification status
  trace.setVerificationStatus(status, details);
  
  // Complete trace
  await trace.complete();
} catch (error) {
  trace.recordError(error, classifyError(error));
  await trace.complete();
  throw error;
}
```

**Trace Events:**
- Query received
- Cache hit/miss
- Retrieval (chunks, scores, latency)
- Evidence analysis
- Generation (answer, citations, latency)
- Verification (claim-citation matching)
- Abstention (reason code)
- Error (type, message, stack)

---

## Common Customizations

### Add New Query Type

1. **Update Guardrails:**

```typescript
// server/ask-isa-guardrails.ts
export type QueryType = 
  | "gap" 
  | "mapping" 
  | "your_new_type";  // Add here

const yourNewTypePatterns = [
  /pattern1/i,
  /pattern2/i,
];

for (const pattern of yourNewTypePatterns) {
  if (pattern.test(question)) {
    return { type: "your_new_type", allowed: true };
  }
}
```

2. **Update Evidence Analysis:**

```typescript
// server/services/evidence-analysis/index.ts
export function inferQueryType(query: string): QueryType {
  if (/your pattern/i.test(query)) return 'your_new_type';
  // ...
}
```

3. **Update Production Queries:**

```typescript
// server/ask-isa-query-library.ts
{
  id: "new_query_1",
  query: "Example question for new type",
  category: "your_new_type",
  sector: "All",
  expectedSources: 3,
  tags: ["tag1", "tag2"],
}
```

### Adjust Hybrid Search Weights

```typescript
// server/routers/ask-isa.ts
const hybridResults = await hybridSearch(question, {
  vectorWeight: 0.8,  // Increase semantic weight
  bm25Weight: 0.2,    // Decrease keyword weight
  limit: 10,          // Fetch more results
  vectorThreshold: 0.4,  // Raise similarity threshold
});
```

### Add New Authority Pattern

```typescript
// server/authority-model.ts
const AUTHORITY_PATTERNS = [
  {
    level: 'official',
    urlPatterns: [
      /your-official-source\.com/i,  // Add URL pattern
    ],
    titlePatterns: [
      /^Your Official Document/i,    // Add title pattern
    ],
  },
];
```

### Customize Abstention Thresholds

```typescript
// server/services/evidence-analysis/index.ts
const THRESHOLDS = {
  MIN_AVG_SIMILARITY: 0.6,        // Raise from 0.5
  MIN_HIGH_QUALITY_CHUNKS: 3,     // Raise from 2
  MIN_AUTHORITY_LEVEL: 'verified', // Raise from 'guidance'
};
```

### Add Sector-Specific Keywords

```typescript
// server/hybrid-search.ts
function getSectorKeywords(sector: string): string[] {
  const sectorKeywordMap: Record<string, string[]> = {
    your_sector: ['keyword1', 'keyword2', 'keyword3'],
  };
  return sectorKeywordMap[sector] || [];
}
```

---

## Testing

### Unit Tests

```typescript
// server/routers/ask-isa.test.ts
import { describe, it, expect } from 'vitest';
import { classifyQuery } from '../ask-isa-guardrails';

describe('Query Classification', () => {
  it('should allow gap queries', () => {
    const result = classifyQuery('Which gaps exist for CSRD in DIY?');
    expect(result.allowed).toBe(true);
    expect(result.type).toBe('gap');
  });
  
  it('should forbid speculative queries', () => {
    const result = classifyQuery('What will happen in 2027?');
    expect(result.allowed).toBe(false);
    expect(result.type).toBe('forbidden');
  });
});
```

### Integration Tests

```typescript
// server/routers/ask-isa-integration.test.ts
import { describe, it, expect } from 'vitest';
import { trpc } from '../test-helpers/trpc-client';

describe('Ask ISA Integration', () => {
  it('should answer production query', async () => {
    const result = await trpc.askISA.ask.mutate({
      question: 'Which gaps exist for CSRD in DIY?',
      sector: 'diy',
    });
    
    expect(result.answer).toBeDefined();
    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.confidence.level).toBe('high');
  });
});
```

### Smoke Tests

```bash
# Run smoke test
pnpm tsx scripts/probe/ask_isa_smoke.py

# Expected output:
# ✓ Query: "Which gaps exist for CSRD in DIY?"
# ✓ Answer returned with 5 sources
# ✓ Confidence: high (5/5)
# ✓ Citations valid
# ✓ Verification rate: 85%
```

---

## Performance Optimization

### 1. Database Indexing

```sql
-- Index for hybrid search
CREATE INDEX idx_knowledge_source ON knowledge_embeddings(source_type, source_id);
CREATE INDEX idx_knowledge_created ON knowledge_embeddings(created_at);

-- Index for conversations
CREATE INDEX idx_qa_conv_user ON qa_conversations(user_id, created_at);
CREATE INDEX idx_qa_msg_conv ON qa_messages(conversation_id, timestamp);
```

### 2. Connection Pooling

```typescript
// server/db.ts
const pool = createMysqlPool(process.env.DATABASE_URL, {
  connectionLimit: 10,
  queueLimit: 0,
  waitForConnections: true,
});
```

### 3. Caching Strategy

- **Cache Hit Rate Target:** >60%
- **Cache Size Limit:** 1000 entries
- **Eviction Policy:** LRU (Least Recently Used)
- **Invalidation:** On knowledge base update

### 4. Batch Processing

```typescript
// Generate embeddings in batches
const BATCH_SIZE = 50;
for (let i = 0; i < sources.length; i += BATCH_SIZE) {
  const batch = sources.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(s => storeKnowledgeChunk(s)));
}
```

---

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.

---

## Security Considerations

### 1. Input Validation

```typescript
// All inputs validated via Zod schemas
z.object({
  question: z.string().min(3).max(1000),  // Prevent abuse
  sector: z.enum([...]),                   // Whitelist only
})
```

### 2. Rate Limiting

```typescript
// server/_core/index.ts
import rateLimit from 'express-rate-limit';

const askISALimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 100,                   // 100 requests per hour
  message: 'Too many requests, please try again later',
});

app.use('/trpc/askISA', askISALimiter);
```

### 3. Authentication

```typescript
// Protected endpoints require Manus OAuth
export const submitFeedback = protectedProcedure
  .input(schema)
  .mutation(async ({ input, ctx }) => {
    // ctx.user.id available
    // ctx.user.role available
  });
```

### 4. Data Sanitization

```typescript
// Sanitize user input before LLM
function sanitizeInput(text: string): string {
  return text
    .replace(/<script>/gi, '')
    .replace(/javascript:/gi, '')
    .slice(0, 1000);  // Max length
}
```

---

## Monitoring

### Key Metrics

- **Query Volume:** Requests per hour
- **Cache Hit Rate:** Cache hits / total requests
- **Avg Response Time:** P50, P95, P99 latencies
- **Verification Rate:** Verified claims / total claims
- **Abstention Rate:** Abstentions / total requests
- **Error Rate:** Errors / total requests

### Logging

```typescript
// All operations logged with context
serverLogger.info('[AskISA] Query received', { question, sector });
serverLogger.warn('[AskISA] Low verification rate', { rate: 0.4 });
serverLogger.error('[AskISA] LLM timeout', { error });
```

### Alerts

- **High Error Rate:** >5% errors in 5 minutes
- **Low Cache Hit Rate:** <40% cache hits in 1 hour
- **High Latency:** P95 >5s for 5 minutes
- **Low Verification Rate:** <50% verification in 1 hour

---

## Changelog

### v1.0 (2026-02-12)
- Initial implementation guide
- Core workflows documented
- 6 implementation patterns
- Common customizations
- Testing strategies
- Performance optimization
- Security considerations

---

## See Also

- [CAPABILITY_SPEC.md](./CAPABILITY_SPEC.md) - Technical specification
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing strategies
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment procedures
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
