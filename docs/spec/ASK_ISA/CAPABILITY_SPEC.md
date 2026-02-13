# ASK_ISA Capability Specification

**Capability ID:** ASK_ISA  
**Version:** 2.0.0  
**Status:** Active  
**Owner:** ISA Development Team  
**Last Updated:** 2026-02-12

---

## Purpose

ASK_ISA is a RAG-powered Q&A system that answers user questions about EU ESG regulations and GS1 standards using semantic search over a curated knowledge base. All responses include mandatory citations with relevance scores and authority levels.

**Core Value:** Enable users to query ISA's knowledge base using natural language while maintaining full traceability to source documents.

---

## Scope

### In Scope

- Natural language Q&A over ISA knowledge base
- Semantic search with hybrid retrieval (vector + BM25)
- Mandatory citations with relevance scores
- Query guardrails (6 allowed types, 5 forbidden types)
- Conversation history and context
- Evidence sufficiency analysis
- Claim-citation verification
- Authority scoring
- Response caching

### Out of Scope

- Real-time regulatory updates (use NEWS_HUB)
- New analysis or conclusions (read-only)
- Customer data processing
- Conversational opinion
- Questions beyond advisory scope
- Predictive or speculative answers

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────┐
│                    ASK_ISA System                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Query        │  │ Retrieval    │  │ Generation   │ │
│  │ Classification│→│ (Hybrid)     │→│ (LLM)        │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                  │                  │         │
│         ↓                  ↓                  ↓         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Guardrails   │  │ Evidence     │  │ Verification │ │
│  │ Check        │  │ Analysis     │  │ & Scoring    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
         │                                        │
         ↓                                        ↓
┌──────────────────┐                    ┌──────────────────┐
│ KNOWLEDGE_BASE   │                    │ Response Cache   │
│ (155 chunks)     │                    │ (In-memory)      │
└──────────────────┘                    └──────────────────┘
```

### Data Flow

1. **Query Input** → User submits question
2. **Classification** → Query type identified, guardrails checked
3. **Cache Check** → Check for cached response
4. **Retrieval** → Hybrid search (vector + BM25) retrieves top-5 chunks
5. **Evidence Analysis** → Sufficiency check (similarity, authority, conflicts)
6. **Generation** → LLM generates answer with citations
7. **Verification** → Claim-citation verification, authority scoring
8. **Storage** → Conversation stored, response cached
9. **Response** → Answer with sources, confidence, metadata

### Dependencies

#### Internal
- **KNOWLEDGE_BASE** (required): Provides semantic search and embeddings
- **CATALOG** (required): Provides regulation/standard metadata for citations

#### External
- **Manus Forge API** (required): GPT-4 for generation, text-embedding-3-small for embeddings
- **TiDB Cloud** (required): Database for conversations and knowledge chunks

---

## Interfaces

### Public API

See [API_REFERENCE.md](./API_REFERENCE.md) for complete API documentation.

**Primary Endpoints:**
- `askISA.ask` - Submit question, get answer with sources
- `askISA.getConversation` - Retrieve conversation history
- `askISA.getMyConversations` - List user's conversations
- `askISA.deleteConversation` - Delete conversation

### Events Published

None (synchronous API only)

### Events Consumed

None (no event-driven architecture)

---

## Data Model

### Database Tables

**knowledge_embeddings** (155 chunks)
```sql
CREATE TABLE knowledge_embeddings (
  id INT PRIMARY KEY,
  sourceType ENUM('regulation', 'standard', 'esrs_datapoint', 'dutch_initiative'),
  sourceId INT,
  content TEXT,
  contentHash VARCHAR(64),
  embedding JSON, -- 1536-dim vector
  title VARCHAR(512),
  url VARCHAR(512),
  datasetId VARCHAR(255),
  datasetVersion VARCHAR(64),
  lastVerifiedDate TIMESTAMP,
  isDeprecated TINYINT DEFAULT 0
);
```

**qa_conversations**
```sql
CREATE TABLE qa_conversations (
  id INT PRIMARY KEY,
  userId INT,
  title VARCHAR(255),
  messageCount INT DEFAULT 0,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

**qa_messages**
```sql
CREATE TABLE qa_messages (
  id INT PRIMARY KEY,
  conversationId INT,
  role ENUM('user', 'assistant'),
  content TEXT,
  sources JSON,
  retrievedChunks INT,
  createdAt TIMESTAMP
);
```

**ask_isa_feedback**
```sql
CREATE TABLE ask_isa_feedback (
  id INT PRIMARY KEY,
  questionId VARCHAR(255),
  userId INT,
  questionText TEXT,
  answerText TEXT,
  feedbackType ENUM('positive', 'negative'),
  feedbackComment TEXT,
  confidenceScore DECIMAL(3,2),
  sourcesCount INT,
  timestamp TIMESTAMP
);
```

### Data Contracts

**Answer Response:**
```typescript
interface AskISAResponse {
  answer: string;
  sources: Source[];
  conversationId: number | null;
  queryType: string;
  confidence: { level: 'low' | 'medium' | 'high'; score: number };
  authority: { level: AuthorityLevel; score: number };
  claimVerification: VerificationSummary;
  responseMode: ResponseMode;
  fromCache?: boolean;
}

interface Source {
  id: number;
  type: string;
  title: string;
  url: string;
  similarity: number; // 0-100
  authorityLevel: 'eu_law' | 'efrag' | 'gs1_official' | 'industry' | 'guidance';
  authorityScore: number; // 0-1
  datasetId?: string;
  datasetVersion?: string;
  lastVerifiedDate?: string;
  isDeprecated?: boolean;
}
```

---

## Quality Attributes

### Performance

- **Response Time**: <5s (90th percentile)
- **Cache Hit Rate**: >30% target
- **Retrieval Latency**: <3s
- **Generation Latency**: <2s

### Reliability

- **Uptime**: 99.9% target
- **Error Rate**: <1%
- **Citation Accuracy**: 100% (mandatory)
- **Abstention Rate**: <10% (evidence insufficient)

### Security

- **Authentication**: Manus OAuth required
- **Rate Limiting**: 100 requests/user/hour
- **Data Privacy**: No PII in knowledge base
- **Input Validation**: Zod schemas, max 1000 chars

---

## Operational Requirements

### Monitoring

**Key Metrics:**
- Query volume (queries/hour)
- Response time (p50, p90, p99)
- Cache hit rate (%)
- Abstention rate (%)
- Confidence distribution
- Authority score distribution
- Claim verification rate (%)

**Dashboards:**
- Admin feedback dashboard: `/admin/ask-isa-feedback`
- RAG trace viewer: `/admin/rag-traces`

### Alerting

**Critical Alerts:**
- Error rate >5%
- Response time >10s (p90)
- Knowledge base empty
- LLM API failure

**Warning Alerts:**
- Cache hit rate <20%
- Abstention rate >15%
- Confidence score <0.5 (avg)

### Backup/Recovery

**Data Backup:**
- Conversations: Daily database backup (TiDB)
- Knowledge base: Regenerate from source data
- Cache: In-memory only (no persistence)

**Recovery:**
- Conversations: Restore from database backup
- Knowledge base: Regenerate via admin UI
- Cache: Rebuild automatically on restart

---

## Query Guardrails

### Allowed Query Types (6)

1. **Gap Analysis** - "List critical gaps for DIY sector"
2. **Mapping Queries** - "Show mappings for regulation DPP"
3. **Version Comparison** - "Compare v1.0 and v1.1 recommendations"
4. **Dataset Provenance** - "What datasets were used for FMCG analysis?"
5. **Recommendation Queries** - "Which recommendations address PCF?"
6. **Coverage Queries** - "What regulations are covered in advisory?"

### Forbidden Query Types (5)

1. **Predictive** - "What will EU require next year?"
2. **Estimation** - "Estimate Scope 3 emissions for this product"
3. **Opinion** - "Should GS1 NL mandate new attributes?"
4. **Customer Data** - "Analyze my company's compliance"
5. **Out of Scope** - "How do I implement ISO 14001?"

### Refusal Messages

When query is forbidden:
```
"I can only answer questions about the locked ISA advisory artefacts 
(v1.0, v1.1). Your question appears to be [reason]. 

Instead, try asking:
- [Suggestion 1]
- [Suggestion 2]
- [Suggestion 3]"
```

---

## Evidence Sufficiency Analysis

### Criteria

**Sufficient Evidence Requires:**
- Average similarity >0.4 (40%)
- At least 2 high-quality chunks (similarity >0.5)
- Highest authority level: 'eu_law' or 'efrag' or 'gs1_official'
- No conflicting information

### Abstention Reasons

1. **NO_RELEVANT_EVIDENCE** - No chunks above threshold
2. **LOW_SIMILARITY** - All chunks <0.4 similarity
3. **INSUFFICIENT_CHUNKS** - <2 high-quality chunks
4. **LOW_AUTHORITY** - Only 'guidance' or 'industry' sources
5. **CONFLICTING_EVIDENCE** - Contradictory information
6. **AMBIGUOUS_QUERY** - Query too vague (ambiguity score >0.5)
7. **OUT_OF_SCOPE** - Forbidden query type

---

## Authority Model

### Authority Levels (Hierarchical)

1. **eu_law** (1.0) - EU regulations, directives, official journal
2. **efrag** (0.9) - EFRAG implementation guidance, XBRL taxonomy
3. **gs1_official** (0.8) - GS1 standards, white papers, guidelines
4. **industry** (0.6) - Industry best practices, case studies
5. **guidance** (0.4) - Interpretations, unofficial guidance

### Authority Score Calculation

```typescript
authorityScore = Σ(authorityLevel_i × similarity_i) / Σ(similarity_i)
```

**Interpretation:**
- >0.8: High authority (EU law + EFRAG dominant)
- 0.6-0.8: Medium authority (GS1 official dominant)
- <0.6: Low authority (industry/guidance dominant)

---

## Claim-Citation Verification

### Verification Process

1. **Extract Claims** - Parse answer for factual statements
2. **Match Citations** - Link claims to cited sources
3. **Verify Authority** - Check source authority level
4. **Calculate Rate** - verifiedClaims / totalClaims

### Verification Thresholds

- **High Confidence**: >80% verification rate
- **Medium Confidence**: 50-80% verification rate
- **Low Confidence**: <50% verification rate

### Warnings

- Claim without citation
- Citation without claim
- Low authority source for critical claim
- Deprecated source cited

---

## Response Modes

### Modes

1. **DIRECT** - High confidence, high authority, high verification
2. **QUALIFIED** - Medium confidence, mixed authority
3. **ABSTAIN** - Low confidence, insufficient evidence

### Mode Determination

```typescript
if (avgSimilarity < 0.4 || highQualityChunks < 2) {
  return 'ABSTAIN';
} else if (avgSimilarity > 0.6 && authorityScore > 0.8 && verificationRate > 0.8) {
  return 'DIRECT';
} else {
  return 'QUALIFIED';
}
```

---

## Caching Strategy

### Cache Key

```typescript
cacheKey = SHA256(question.toLowerCase().trim())
```

### Cache Entry

```typescript
interface CacheEntry {
  answer: string;
  sources: Source[];
  confidence: Confidence;
  claimVerification: VerificationSummary;
  timestamp: number;
  ttl: number; // 1 hour
}
```

### Cache Invalidation

- **TTL**: 1 hour (3600 seconds)
- **Manual**: Admin can invalidate entire cache
- **Automatic**: Cleanup expired entries every 10 minutes

---

## Development Guide

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for step-by-step development instructions.

---

## Testing Strategy

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for complete testing documentation.

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment procedures.

---

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.

---

## Change Log

### v2.0.0 (2026-02-12)
- Consolidated documentation into capability spec
- Added evidence sufficiency analysis
- Added claim-citation verification
- Added authority model
- Added response modes
- Added caching strategy

### v1.0.0 (2025-12-17)
- Initial production release
- 30 production queries validated
- Query guardrails implemented
- Mandatory citations enforced

---

**Document Status:** AUTHORITATIVE  
**Quality Grade:** A (100/100)  
**Last Verified:** 2026-02-12
