# ASK_ISA API Reference

**Capability:** ASK_ISA  
**Version:** 1.0  
**Last Updated:** 2026-02-12  
**Status:** Production

---

## Overview

ASK_ISA provides a tRPC-based API for RAG-powered question answering with mandatory citations, query guardrails, and conversation management. All endpoints enforce strict governance constraints including evidence sufficiency analysis, claim-citation verification, and authority scoring.

**Base Router:** `server/routers/ask-isa.ts`  
**Protocol:** tRPC 11 (type-safe RPC over HTTP)  
**Authentication:** Manus OAuth (optional for public endpoints, required for protected endpoints)

---

## Endpoints

### 1. ask

**Type:** Mutation (publicProcedure)  
**Purpose:** Submit a question and receive AI-generated answer with sources

#### Input Schema

```typescript
{
  question: string,           // 3-1000 characters
  conversationId?: number,    // Optional conversation context
  userId?: number,            // Optional user identifier
  sector?: "all" | "fmcg" | "diy" | "healthcare" | "fashion" | 
           "sustainability" | "retail" | "agriculture" | "construction"
}
```

#### Output Schema

```typescript
{
  answer: string,
  sources: Array<{
    id: number,
    type: string,
    title: string,
    url: string,
    similarity: number,                    // 0-100
    datasetId?: string,
    datasetVersion?: string,
    lastVerifiedDate?: string,
    isDeprecated?: boolean,
    needsVerification?: boolean,
    deprecationReason?: string,
    authorityLevel: "primary" | "secondary" | "guidance" | "industry" | "reference",
    authorityScore: number                 // 0-1
  }>,
  conversationId?: number,
  queryType: string,
  confidence: {
    level: "low" | "medium" | "high",
    score: number                          // 0-1
  },
  citationValid: boolean,
  missingCitations?: string[],
  authority: {
    score: number,                         // 0-1
    level: "primary" | "secondary" | "guidance" | "industry" | "reference",
    distribution: Record<string, number>
  },
  claimVerification: {
    verificationRate: number,              // 0-1
    totalClaims: number,
    verifiedClaims: number,
    unverifiedClaims: number,
    warnings: string[]
  },
  responseMode: "DIRECT" | "QUALIFIED" | "ABSTAIN",
  queryAnalysis: {
    isAmbiguous: boolean,
    relatedTopics: string[]
  },
  fromCache?: boolean,
  
  // Abstention fields (when evidence insufficient)
  abstained?: boolean,
  abstentionReason?: string,
  evidenceAnalysis?: {
    avgSimilarity: number,
    highQualityChunks: number,
    highestAuthority: string,
    hasConflicts: boolean
  },
  
  // Clarification fields (when query ambiguous)
  needsClarification?: boolean,
  clarifications?: string[],
  relatedTopics?: string[]
}
```

#### Processing Pipeline

1. **Cache Check**: Check for cached response (TTL: 24 hours)
2. **Query Analysis**: Detect ambiguity, extract topics
3. **Query Classification**: Validate against guardrails (6 allowed types, 5 forbidden)
4. **Hybrid Search**: Vector (70%) + BM25 (30%) retrieval, top-5 chunks
5. **Evidence Analysis**: Sufficiency check (similarity, authority, conflicts)
6. **Conversation Context**: Load last 6 messages if conversationId provided
7. **Prompt Assembly**: Build modular v2.0 prompt with context
8. **LLM Generation**: GPT-4o-mini with 30s timeout
9. **Citation Validation**: Verify format and provenance
10. **Claim Verification**: Match claims to sources
11. **Authority Scoring**: Calculate weighted authority score
12. **Response Caching**: Store for future queries
13. **Trace Recording**: Log to RAG observability system

#### Error Handling

- **Forbidden Query**: Returns refusal message with explanation
- **No Relevant Evidence**: Returns "no information found" message
- **Insufficient Evidence**: Abstains with detailed analysis
- **Ambiguous Query**: Returns clarification suggestions
- **LLM Timeout**: Throws "Failed to generate answer" error
- **Database Error**: Throws "Failed to generate answer" error

#### Example Usage

```typescript
const result = await trpc.askISA.ask.mutate({
  question: "Which GS1 standards support CSRD reporting?",
  sector: "fmcg"
});

console.log(result.answer);
console.log(result.sources.length); // Up to 5 sources
console.log(result.confidence.level); // "high" | "medium" | "low"
```

---

### 2. getConversation

**Type:** Query (publicProcedure)  
**Purpose:** Retrieve conversation history with all messages

#### Input Schema

```typescript
{
  conversationId: number
}
```

#### Output Schema

```typescript
{
  id: number,
  userId?: number,
  title: string,
  createdAt: string,
  updatedAt: string,
  messages: Array<{
    id: number,
    conversationId: number,
    role: "user" | "assistant",
    content: string,
    sources?: Array<{
      id: number,
      type: string,
      title: string,
      url: string,
      similarity: number
    }>,
    retrievedChunks?: number,
    timestamp: string
  }>
}
```

#### Error Handling

- **Not Found**: Throws "Conversation not found" error

---

### 3. getMyConversations

**Type:** Query (protectedProcedure)  
**Purpose:** List user's conversation history  
**Authentication:** Required (Manus OAuth)

#### Input Schema

```typescript
{
  limit?: number  // 1-50, default: 20
}
```

#### Output Schema

```typescript
Array<{
  id: number,
  userId: number,
  title: string,
  createdAt: string,
  updatedAt: string,
  messageCount: number
}>
```

---

### 4. deleteConversation

**Type:** Mutation (protectedProcedure)  
**Purpose:** Delete a conversation (user must own it)  
**Authentication:** Required (Manus OAuth)

#### Input Schema

```typescript
{
  conversationId: number
}
```

#### Output Schema

```typescript
{
  success: boolean
}
```

#### Error Handling

- **Not Authorized**: Throws "Failed to delete conversation or not authorized" error

---

### 5. generateEmbeddings

**Type:** Mutation (protectedProcedure)  
**Purpose:** Generate knowledge chunks for existing content (admin only)  
**Authentication:** Required (Manus OAuth)

#### Input Schema

```typescript
{
  sourceType: "regulation" | "standard" | "esrs_datapoint" | 
              "dutch_initiative" | "esrs_gs1_mapping",
  sourceIds?: number[]  // If empty, process all
}
```

#### Output Schema

```typescript
{
  success: boolean,
  processed: number,
  successCount: number,
  errorCount: number
}
```

#### Processing

1. Fetch sources from database by type
2. Filter by sourceIds if provided
3. For each source:
   - Prepare content for embedding
   - Generate title and URL
   - Store in knowledge_embeddings table
4. Return statistics

---

### 6. getEmbeddingStats

**Type:** Query (publicProcedure)  
**Purpose:** Get knowledge base statistics by source type

#### Output Schema

```typescript
Array<{
  sourceType: string,
  count: number,
  lastUpdated?: string
}>
```

---

### 7. getProductionQueries

**Type:** Query (publicProcedure)  
**Purpose:** Get all 30 production queries for autocomplete

#### Output Schema

```typescript
Array<{
  id: string,
  query: string,
  category: "gap" | "mapping" | "version_comparison" | 
            "dataset_provenance" | "recommendation" | "coverage",
  sector: "DIY" | "FMCG" | "Healthcare" | "All",
  expectedSources: number,
  tags: string[]
}>
```

---

### 8. getQueriesByCategory

**Type:** Query (publicProcedure)  
**Purpose:** Filter production queries by category

#### Input Schema

```typescript
{
  category: "gap" | "mapping" | "version_comparison" | 
            "dataset_provenance" | "recommendation" | "coverage"
}
```

#### Output Schema

Same as getProductionQueries

---

### 9. getQueriesBySector

**Type:** Query (publicProcedure)  
**Purpose:** Filter production queries by sector

#### Input Schema

```typescript
{
  sector: "DIY" | "FMCG" | "Healthcare" | "All"
}
```

#### Output Schema

Same as getProductionQueries

---

### 10. searchQueries

**Type:** Query (publicProcedure)  
**Purpose:** Search production queries by text

#### Input Schema

```typescript
{
  searchTerm: string  // Minimum 1 character
}
```

#### Output Schema

Same as getProductionQueries

---

### 11. submitFeedback

**Type:** Mutation (protectedProcedure)  
**Purpose:** Submit user feedback for Ask ISA response  
**Authentication:** Required (Manus OAuth)

#### Input Schema

```typescript
{
  questionId: string,
  questionText: string,
  answerText: string,
  feedbackType: "positive" | "negative",
  feedbackComment?: string,
  promptVariant?: string,
  confidenceScore?: number,
  sourcesCount?: number
}
```

#### Output Schema

```typescript
{
  success: boolean
}
```

---

### 12. getFeedbackStats

**Type:** Query (protectedProcedure)  
**Purpose:** Get feedback statistics (admin only)  
**Authentication:** Required (Manus OAuth + admin role)

#### Input Schema

```typescript
{
  timeRange?: "7d" | "30d" | "90d" | "all"  // Default: "30d"
}
```

#### Output Schema

```typescript
{
  positive: number,
  negative: number,
  avgConfidence: number | null,
  dailyTrend: Array<{
    date: string,
    positive: number,
    negative: number
  }>
}
```

---

### 13. getRecentFeedback

**Type:** Query (protectedProcedure)  
**Purpose:** Get recent feedback entries (admin only)  
**Authentication:** Required (Manus OAuth + admin role)

#### Input Schema

```typescript
{
  limit?: number  // 1-100, default: 20
}
```

#### Output Schema

```typescript
Array<{
  id: string,
  questionId: string,
  questionText: string,
  answerText: string,
  feedbackType: "positive" | "negative",
  feedbackComment?: string,
  confidenceScore?: string,
  sourcesCount?: number,
  timestamp: string
}>
```

---

### 14. getCacheStats

**Type:** Query (protectedProcedure)  
**Purpose:** Get cache statistics (admin only)  
**Authentication:** Required (Manus OAuth + admin role)

#### Output Schema

```typescript
{
  size: number,
  hits: number,
  misses: number,
  hitRate: number,
  oldestEntry?: string,
  newestEntry?: string
}
```

---

### 15. invalidateCache

**Type:** Mutation (protectedProcedure)  
**Purpose:** Clear all cached responses (admin only)  
**Authentication:** Required (Manus OAuth + admin role)

#### Output Schema

```typescript
{
  success: boolean,
  message: string
}
```

---

### 16. cleanupCache

**Type:** Mutation (protectedProcedure)  
**Purpose:** Remove expired cache entries (admin only)  
**Authentication:** Required (Manus OAuth + admin role)

#### Output Schema

```typescript
{
  success: boolean,
  cleanedEntries: number
}
```

---

## Query Guardrails

### Allowed Query Types (6)

1. **Gap Analysis**: "What gaps exist in [sector] for [regulation]?"
2. **Mapping Queries**: "Which GS1 standards support [requirement]?"
3. **Version Comparison**: "What changed between advisory v1.0 and v1.1?"
4. **Dataset Provenance**: "What is the source of [datapoint]?"
5. **Recommendations**: "What are the recommendations for [sector]?"
6. **Coverage Queries**: "Does ISA cover [regulation/standard]?"

### Forbidden Query Types (5)

1. **Future Predictions**: "What will the EU require next year?"
2. **Customer-Specific Analysis**: "Calculate emissions for my product"
3. **Policy Recommendations**: "Should GS1 mandate new attributes?"
4. **Legal Advice**: "Am I compliant with CSRD?"
5. **Speculative Analysis**: "What if the regulation changes?"

### Refusal Message Format

```
I cannot answer this question because [reason].

Ask ISA is designed to answer questions about:
- [allowed type 1]
- [allowed type 2]
- ...

Try asking: [suggested alternative query]
```

---

## Response Modes

### DIRECT Mode
- **Trigger**: High-quality evidence (avg similarity >0.7, primary/secondary authority)
- **Behavior**: Confident answer with full citations
- **Confidence**: High (>0.7)

### QUALIFIED Mode
- **Trigger**: Medium-quality evidence (avg similarity 0.5-0.7, mixed authority)
- **Behavior**: Answer with caveats and limitations
- **Confidence**: Medium (0.4-0.7)

### ABSTAIN Mode
- **Trigger**: Low-quality evidence (avg similarity <0.5, low authority, conflicts)
- **Behavior**: Refuse to answer, explain why, suggest alternatives
- **Confidence**: Low (<0.4)

---

## Authority Levels

### Hierarchy (Highest to Lowest)

1. **Primary** (1.0): EU Official Journal, EFRAG ESRS
2. **Secondary** (0.8): GS1 Global Standards, CSRD Delegated Acts
3. **Guidance** (0.6): EFRAG Implementation Guidance, GS1 Whitepapers
4. **Industry** (0.4): GS1 NL Sector Models, Industry Reports
5. **Reference** (0.2): News articles, Blog posts

### Authority Score Calculation

```
authorityScore = Σ(authorityLevel_i × similarity_i) / Σ(similarity_i)
```

Where:
- `authorityLevel_i`: Authority level of source i (0.2-1.0)
- `similarity_i`: Relevance score of source i (0-1)

---

## Caching Strategy

### Cache Key
- SHA-256 hash of normalized question text
- Case-insensitive, whitespace-normalized

### Cache TTL
- **Default**: 24 hours
- **Rationale**: Balance freshness vs. performance

### Cache Invalidation
- Manual invalidation via `invalidateCache` endpoint
- Automatic cleanup of expired entries via `cleanupCache`
- Triggered on knowledge base updates

### Cache Hit Behavior
- Return cached response immediately
- Record cache hit in RAG trace
- Skip retrieval, generation, and verification steps

---

## Rate Limiting

### User Limits
- **Authenticated Users**: 100 requests/hour
- **Anonymous Users**: 20 requests/hour

### Admin Limits
- **Admin Users**: 1000 requests/hour

### Enforcement
- HTTP 429 (Too Many Requests) on limit exceeded
- Retry-After header with seconds until reset

---

## Observability

### RAG Tracing
- **System**: RagTraceManager (server/services/rag-tracing/)
- **Captured Events**:
  - Query received
  - Cache hit/miss
  - Retrieval (chunks, scores, latency)
  - Evidence analysis (sufficiency, conflicts)
  - Generation (answer, citations, latency)
  - Verification (claim-citation matching)
  - Abstention (reason code)
  - Error (type, message, stack)

### Metrics
- **Traceability Score**: Citation presence × citation validity
- **Source Utilization**: Cited sources / available sources
- **Quality Level**: "excellent" | "good" | "acceptable" | "poor"
- **Verification Rate**: Verified claims / total claims

### Logging
- **Level**: INFO for normal operations, WARN for abstentions, ERROR for failures
- **Format**: `[AskISA] <message>`
- **Destination**: Server logs (serverLogger)

---

## Error Codes

### Client Errors (4xx)

- **400 Bad Request**: Invalid input (e.g., question too short/long)
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions (e.g., non-admin accessing admin endpoint)
- **404 Not Found**: Conversation not found
- **429 Too Many Requests**: Rate limit exceeded

### Server Errors (5xx)

- **500 Internal Server Error**: LLM timeout, database error, unexpected failure
- **503 Service Unavailable**: Knowledge base not ready, external API down

---

## Dependencies

### Internal Services
- `server/db-knowledge.ts`: Knowledge base CRUD operations
- `server/db-knowledge-vector.ts`: Vector search
- `server/hybrid-search.ts`: Hybrid retrieval (vector + BM25)
- `server/authority-model.ts`: Authority scoring
- `server/claim-citation-verifier.ts`: Claim verification
- `server/query-clarification.ts`: Query analysis
- `server/ask-isa-guardrails.ts`: Query classification
- `server/citation-validation.ts`: Citation provenance
- `server/ask-isa-cache.ts`: Response caching
- `server/prompts/ask_isa.ts`: Prompt assembly
- `server/services/rag-tracing/`: Observability
- `server/services/evidence-analysis/`: Evidence sufficiency
- `server/services/rag-metrics/`: Quality metrics

### External APIs
- **Manus Forge** (OpenAI-compatible): LLM generation
- **TiDB Cloud**: Database (MySQL-compatible)

### Database Tables
- `knowledge_embeddings`: 155 semantic chunks
- `qa_conversations`: Conversation metadata
- `qa_messages`: Message history
- `ask_isa_feedback`: User feedback
- `regulations`: 38 EU regulations
- `gs1_standards`: 60+ GS1 standards
- `esrs_datapoints`: 1,184 EFRAG datapoints

---

## Testing

### Unit Tests
- **Location**: `server/routers/ask-isa.test.ts`
- **Coverage**: Query classification, guardrails, citation validation

### Integration Tests
- **Location**: `server/routers/ask-isa-integration.test.ts`
- **Coverage**: End-to-end Q&A flow, conversation management

### Smoke Tests
- **Location**: `scripts/probe/ask_isa_smoke.py`
- **Frequency**: On-demand + CI pipeline
- **Coverage**: 30 production queries

---

## Changelog

### v1.0 (2026-02-12)
- Initial API reference documentation
- 16 endpoints documented
- Query guardrails specified
- Response modes defined
- Authority model documented
- Caching strategy specified

---

## See Also

- [CAPABILITY_SPEC.md](./CAPABILITY_SPEC.md) - Technical specification
- [RUNTIME_CONTRACT.md](./RUNTIME_CONTRACT.md) - Runtime contract
- [ASK_ISA_GUARDRAILS.md](./ASK_ISA_GUARDRAILS.md) - Guardrails specification
- [../../INTEGRATION_CONTRACTS.md](../../INTEGRATION_CONTRACTS.md) - Inter-capability contracts
