# Ask ISA Optimization Implementation Plan

**Author:** Manus AI  
**Date:** January 25, 2026  
**Status:** Active Development

---

## Executive Summary

This document outlines the detailed implementation plan for optimizing the Ask ISA feature. The plan is structured in 5 phases, ordered by impact and dependency, with each phase building on the previous one.

---

## Current Architecture Analysis

### Data Flow
```
User Question → Guardrails → Vector Search → LLM Generation → Citation Validation → Response
```

### Key Components
| Component | File | Current Status |
|-----------|------|----------------|
| Vector Search | `db-knowledge-vector.ts` | ✅ Working (cosine similarity) |
| Guardrails | `ask-isa-guardrails.ts` | ✅ Query classification |
| Prompt Assembly | `prompts/ask_isa/index.ts` | ✅ Modular v2.0 system |
| Citation Validation | `citation-validation.ts` | ⚠️ Basic format check only |
| Router | `routers/ask-isa.ts` | ✅ tRPC endpoint |

### Current Limitations
1. **Vector-only search** - Misses exact keyword matches
2. **No authority model** - All sources treated equally
3. **No claim-citation verification** - Can cite without supporting claims
4. **No evaluation harness** - Cannot measure quality systematically
5. **No query clarification** - Attempts to answer ambiguous queries

---

## Phase 1: Hybrid Search (Vector + BM25)

### Objective
Combine semantic vector search with keyword-based BM25 search to improve retrieval accuracy.

### Implementation Approach

**Option A: In-Memory BM25 (Recommended)**
- Use `wink-bm25-text-search` npm package
- Build index on server startup from regulations/standards
- Fast queries, no database changes needed
- Refresh index periodically or on content updates

**Option B: Database-Level BM25**
- Use MySQL FULLTEXT indexes
- Requires schema migration
- More complex but persistent

### Selected Approach: Option A (In-Memory)

### Files to Create/Modify
1. **NEW:** `server/bm25-search.ts` - BM25 search implementation
2. **NEW:** `server/hybrid-search.ts` - Merge vector + BM25 results
3. **MODIFY:** `server/routers/ask-isa.ts` - Use hybrid search

### Implementation Steps

#### Step 1.1: Install BM25 Package
```bash
pnpm add wink-bm25-text-search wink-nlp-utils
```

#### Step 1.2: Create BM25 Search Module
```typescript
// server/bm25-search.ts
import bm25 from 'wink-bm25-text-search';
import nlp from 'wink-nlp-utils';

interface BM25Document {
  id: number;
  type: 'regulation' | 'standard';
  title: string;
  description: string;
  url?: string;
}

let searchEngine: any = null;
let documents: BM25Document[] = [];

export async function initializeBM25Index(): Promise<void> {
  // Fetch all regulations and standards
  // Build BM25 index
}

export function bm25Search(query: string, limit: number = 10): BM25SearchResult[] {
  // Search using BM25
}
```

#### Step 1.3: Create Hybrid Search Module
```typescript
// server/hybrid-search.ts
import { vectorSearchKnowledge } from './db-knowledge-vector';
import { bm25Search } from './bm25-search';

interface HybridSearchConfig {
  vectorWeight: number; // 0.0 - 1.0
  bm25Weight: number;   // 0.0 - 1.0
  limit: number;
}

export async function hybridSearch(
  query: string,
  config: HybridSearchConfig = { vectorWeight: 0.7, bm25Weight: 0.3, limit: 10 }
): Promise<HybridSearchResult[]> {
  // 1. Run both searches in parallel
  // 2. Normalize scores
  // 3. Merge using Reciprocal Rank Fusion (RRF)
  // 4. Return top N results
}
```

#### Step 1.4: Integrate into Ask ISA Router
- Replace `vectorSearchKnowledge` call with `hybridSearch`
- Add fallback to vector-only if BM25 index not ready

### Success Criteria
- [ ] BM25 index builds successfully on startup
- [ ] Hybrid search returns results within 500ms
- [ ] Keyword queries return more relevant results
- [ ] No regression on semantic queries

---

## Phase 2: Authority Model & Visual Indicators

### Objective
Classify sources by authority level and display visual indicators to users.

### Authority Levels
| Level | Score | Examples | Badge Color |
|-------|-------|----------|-------------|
| Official | 1.0 | EU Regulations, EFRAG | Blue |
| Verified | 0.9 | GS1 Standards, GS1 NL | Green |
| Guidance | 0.7 | Implementation guides | Yellow |
| Industry | 0.5 | Whitepapers, best practices | Gray |
| Community | 0.3 | User content | Light Gray |

### Implementation Steps

#### Step 2.1: Add Authority Field to Schema
```sql
ALTER TABLE regulations ADD COLUMN authority_level ENUM('official','verified','guidance','industry','community') DEFAULT 'official';
ALTER TABLE gs1_standards ADD COLUMN authority_level ENUM('official','verified','guidance','industry','community') DEFAULT 'verified';
```

#### Step 2.2: Create Authority Classification Logic
```typescript
// server/authority-model.ts
export function classifyAuthority(source: any): AuthorityLevel {
  // Based on source type and metadata
}

export function getAuthorityBadge(level: AuthorityLevel): AuthorityBadge {
  // Return badge config for UI
}
```

#### Step 2.3: Update Search Results to Include Authority
- Modify `VectorSearchResult` interface
- Add authority to hybrid search results
- Include in API response

#### Step 2.4: Create Authority Badge Component
```tsx
// client/src/components/AuthorityBadge.tsx
export function AuthorityBadge({ level }: { level: AuthorityLevel }) {
  // Render colored badge with tooltip
}
```

#### Step 2.5: Update AskISA Frontend
- Display authority badges next to sources
- Add authority filter option
- Show authority summary in response

### Success Criteria
- [ ] All sources have authority level assigned
- [ ] Authority badges display correctly
- [ ] Users can filter by authority level
- [ ] System prompt references authority levels

---

## Phase 3: Claim-Citation Verification

### Objective
Verify that each factual claim in the response is supported by a cited source.

### Implementation Approach

**Two-Stage Verification:**
1. **Extraction:** Parse response to identify claims and citations
2. **Validation:** Check each claim has supporting citation

### Implementation Steps

#### Step 3.1: Create Claim Extractor
```typescript
// server/claim-extraction.ts
interface Claim {
  id: string;
  text: string;
  citationIds: string[];
  startIndex: number;
  endIndex: number;
}

export function extractClaims(response: string): Claim[] {
  // Use regex and NLP to identify factual claims
  // Map citations to claims
}
```

#### Step 3.2: Create Citation Verifier
```typescript
// server/claim-verification.ts
export function verifyClaims(
  claims: Claim[],
  sources: Source[]
): VerificationResult {
  // Check each claim has valid citation
  // Return verification status and issues
}
```

#### Step 3.3: Update Response Processing
- Add claim extraction after LLM response
- Run verification
- Include verification status in response

#### Step 3.4: Update Frontend
- Highlight verified vs unverified claims
- Show verification badge
- Display warning for unverified claims

### Success Criteria
- [ ] Claims extracted with >90% accuracy
- [ ] Unverified claims flagged
- [ ] Frontend displays verification status
- [ ] Logging captures verification metrics

---

## Phase 4: Evaluation Harness

### Objective
Create automated testing system to measure and maintain Ask ISA quality.

### Golden Set Structure
```json
{
  "questions": [
    {
      "id": "q001",
      "question": "What is the CSRD?",
      "category": "regulation_definition",
      "expectedCitations": ["CSRD", "EU 2022/2464"],
      "authorityConstraint": "official",
      "expectedKeywords": ["sustainability", "reporting", "directive"]
    }
  ]
}
```

### Metrics
1. **Citation Coverage:** % of claims with valid citations
2. **Faithfulness:** Semantic similarity to source content
3. **Recall@k:** % of expected sources in top-k results
4. **Authority Compliance:** % meeting authority constraints
5. **Latency P95:** 95th percentile response time

### Implementation Steps

#### Step 4.1: Create Golden Set
```typescript
// server/evaluation/golden-set.ts
export const goldenSet: GoldenQuestion[] = [
  // 50+ curated questions
];
```

#### Step 4.2: Create Evaluation Runner
```typescript
// server/evaluation/runner.ts
export async function runEvaluation(): Promise<EvaluationReport> {
  // Run all golden questions
  // Calculate metrics
  // Generate report
}
```

#### Step 4.3: Create Test Script
```bash
# scripts/evaluate-ask-isa.ts
pnpm eval:ask-isa
```

#### Step 4.4: Add CI Integration
- Run evaluation on PR
- Fail if metrics drop below threshold
- Generate comparison report

### Success Criteria
- [ ] Golden set has 50+ questions
- [ ] All metrics calculated correctly
- [ ] CI integration working
- [ ] Baseline metrics established

---

## Phase 5: Query Clarification & UX

### Objective
Improve user experience with query clarification and better response modes.

### Features
1. **Ambiguous Query Detection**
2. **Clarification Suggestions**
3. **Graduated Response Modes**
4. **Conversation Context**

### Implementation Steps

#### Step 5.1: Ambiguous Query Detector
```typescript
// server/query-clarification.ts
export function detectAmbiguity(query: string): AmbiguityResult {
  // Check for vague terms
  // Check for multiple possible interpretations
  // Return clarification suggestions
}
```

#### Step 5.2: Clarification UI Component
```tsx
// client/src/components/QueryClarification.tsx
export function QueryClarification({ suggestions }: Props) {
  // Display "Did you mean?" options
}
```

#### Step 5.3: Graduated Response Modes
- **Full Answer:** High confidence, all claims cited
- **Partial Answer:** Some gaps noted
- **Insufficient Evidence:** Cannot answer reliably

#### Step 5.4: Conversation Context
- Use previous Q&A for context-aware retrieval
- Resolve pronouns and references
- Maintain topic continuity

### Success Criteria
- [ ] Ambiguous queries detected
- [ ] Clarification suggestions helpful
- [ ] Response modes display correctly
- [ ] Follow-up questions work smoothly

---

## Implementation Schedule

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Hybrid Search | 2-3 hours | None |
| Phase 2: Authority Model | 2-3 hours | Phase 1 |
| Phase 3: Claim Verification | 3-4 hours | Phase 1 |
| Phase 4: Evaluation Harness | 2-3 hours | Phases 1-3 |
| Phase 5: Query Clarification | 2-3 hours | Phase 1 |

**Total Estimated Time:** 11-16 hours

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| BM25 index memory usage | Limit indexed fields, lazy loading |
| Claim extraction accuracy | Start with high-precision rules |
| Performance regression | Benchmark before/after each phase |
| Breaking existing functionality | Comprehensive test coverage |

---

## Rollback Plan

Each phase will be implemented with feature flags:
- `ENABLE_HYBRID_SEARCH`
- `ENABLE_AUTHORITY_MODEL`
- `ENABLE_CLAIM_VERIFICATION`
- `ENABLE_QUERY_CLARIFICATION`

If issues arise, disable flag and revert to previous behavior.

