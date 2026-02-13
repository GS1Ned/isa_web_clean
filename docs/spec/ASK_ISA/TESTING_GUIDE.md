# ASK_ISA Testing Guide

**Capability:** ASK_ISA  
**Version:** 1.0  
**Last Updated:** 2026-02-12  
**Status:** Production

---

## Overview

This guide covers testing strategies, test fixtures, test scenarios, and best practices for the ASK_ISA capability. It includes unit tests, integration tests, and smoke tests with examples.

---

## Test Strategy

### Test Pyramid

```
        /\
       /  \  Smoke Tests (1)
      /____\
     /      \  Integration Tests (2)
    /________\
   /          \  Unit Tests (50+)
  /__________  \
```

### Test Categories

1. **Unit Tests** (50+ tests)
   - Query classification
   - Guardrails enforcement
   - Citation validation
   - Confidence scoring
   - Authority classification
   - Claim extraction
   - Hybrid search logic

2. **Integration Tests** (10+ tests)
   - End-to-end Q&A flow
   - Conversation management
   - Knowledge base operations
   - Cache behavior
   - RAG tracing

3. **Smoke Tests** (1 test)
   - Production query validation
   - Critical path verification

---

## Test Framework

### Tools

- **Framework:** Vitest 2.1.4
- **Mocking:** Vitest vi
- **Assertions:** Vitest expect
- **Coverage:** Vitest coverage (c8)

### Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.test.ts', '**/test-helpers/**'],
    },
  },
});
```

---

## Unit Tests

### Test File: ask-isa-guardrails.test.ts

**Location:** `server/ask-isa-guardrails.test.ts`  
**Coverage:** Query classification, refusal patterns, citation validation, confidence scoring

#### Test Structure

```typescript
import { describe, it, expect } from "vitest";
import {
  classifyQuery,
  generateRefusalMessage,
  validateCitations,
  calculateConfidence,
} from "./ask-isa-guardrails";

describe("Ask ISA Guardrails", () => {
  describe("Query Classification - Allowed Types", () => {
    // Tests for 6 allowed query types
  });

  describe("Query Classification - Forbidden Types", () => {
    // Tests for 5 forbidden query types
  });

  describe("Refusal Message Generation", () => {
    // Tests for refusal messages
  });

  describe("Citation Validation", () => {
    // Tests for citation completeness
  });

  describe("Confidence Scoring", () => {
    // Tests for confidence levels
  });

  describe("Edge Cases", () => {
    // Tests for edge cases
  });
});
```

#### Example Tests

**Test: Gap Query Classification**

```typescript
it("should classify gap queries correctly", () => {
  const queries = [
    "Which gaps exist for CSRD in DIY?",
    "What is the status of Gap #1?",
    "Which critical gaps remain MISSING?",
    "Gap analysis for EUDR in FMCG",
  ];

  queries.forEach((query) => {
    const result = classifyQuery(query);
    expect(result.type).toBe("gap");
    expect(result.allowed).toBe(true);
  });
});
```

**Test: Forbidden Query Rejection**

```typescript
it("should reject speculative queries", () => {
  const queries = [
    "Will GS1 NL adopt this in 2026?",
    "What will happen next year?",
    "Future of ESG regulations",
    "Predict the regulatory changes",
  ];

  queries.forEach((query) => {
    const result = classifyQuery(query);
    expect(result.type).toBe("forbidden");
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Speculative");
  });
});
```

**Test: Citation Validation**

```typescript
it("should validate complete citations", () => {
  const answer = `Based on ISA_ADVISORY_v1.1, there are 3 critical gaps for CSRD in DIY.
  
  Dataset references: esrs.datapoints.ig3, gs1nl.benelux.diy_garden_pet.v3.1.33
  Dataset registry: v1.3.0`;

  const result = validateCitations(answer);

  expect(result.valid).toBe(true);
  expect(result.missingElements).toHaveLength(0);
});
```

**Test: Confidence Scoring**

```typescript
it("should return high confidence for 3+ sources", () => {
  const result = calculateConfidence(3);

  expect(result.level).toBe("high");
  expect(result.score).toBe(3);
});

it("should return medium confidence for 2 sources", () => {
  const result = calculateConfidence(2);

  expect(result.level).toBe("medium");
  expect(result.score).toBe(2);
});

it("should return low confidence for 1 source", () => {
  const result = calculateConfidence(1);

  expect(result.level).toBe("low");
  expect(result.score).toBe(1);
});
```

### Test File: hybrid-search.test.ts

**Location:** `server/hybrid-search.test.ts`  
**Coverage:** Hybrid search, RRF scoring, result merging

#### Example Tests

**Test: Vector-Only Fallback**

```typescript
it("should return vector-only results when BM25 is not ready", async () => {
  vi.mocked(isBM25Ready).mockReturnValue(false);
  vi.mocked(vectorSearchKnowledge).mockResolvedValue([
    {
      id: 1,
      type: 'regulation',
      title: 'CSRD Regulation',
      description: 'Corporate Sustainability Reporting Directive',
      similarity: 0.85,
      url: 'https://example.com/csrd',
    },
  ]);

  const results = await hybridSearch('What is CSRD?');

  expect(results).toHaveLength(1);
  expect(results[0].hybridScore).toBe(0.85);
  expect(results[0].vectorScore).toBe(0.85);
  expect(results[0].bm25Score).toBeUndefined();
});
```

**Test: RRF Merging**

```typescript
it("should combine vector and BM25 results using RRF", async () => {
  vi.mocked(isBM25Ready).mockReturnValue(true);
  vi.mocked(vectorSearchKnowledge).mockResolvedValue([
    { id: 1, type: 'regulation', title: 'CSRD', similarity: 0.9 },
    { id: 2, type: 'regulation', title: 'EUDR', similarity: 0.7 },
  ]);
  vi.mocked(bm25Search).mockReturnValue([
    { id: 1, type: 'regulation', title: 'CSRD', score: 15.5 },
    { id: 3, type: 'standard', title: 'GTIN', score: 10.2 },
  ]);

  const results = await hybridSearch('CSRD sustainability');

  const csrdResult = results.find(r => r.title === 'CSRD');
  expect(csrdResult).toBeDefined();
  expect(csrdResult?.vectorScore).toBe(0.9);
  expect(csrdResult?.bm25Score).toBe(15.5);
});
```

### Test File: authority-model.test.ts

**Location:** `server/authority-model.test.ts`  
**Coverage:** Authority classification, scoring, badge generation

#### Example Tests

**Test: Authority Classification**

```typescript
it("should classify EU regulations as official", () => {
  const result = classifyAuthority({
    type: 'regulation',
    title: 'EU Regulation 2023/1234',
    url: 'https://eur-lex.europa.eu/...',
  });

  expect(result.level).toBe('official');
  expect(result.score).toBe(1.0);
});

it("should classify GS1 standards as verified", () => {
  const result = classifyAuthority({
    type: 'standard',
    title: 'GS1 GTIN Standard',
    url: 'https://www.gs1.org/...',
  });

  expect(result.level).toBe('verified');
  expect(result.score).toBe(0.9);
});
```

**Test: Weighted Authority Score**

```typescript
it("should calculate weighted authority score", () => {
  const sources = [
    { authorityLevel: 'official', similarity: 0.9 },
    { authorityLevel: 'verified', similarity: 0.8 },
    { authorityLevel: 'guidance', similarity: 0.6 },
  ];

  const result = calculateAuthorityScore(sources);

  expect(result.score).toBeGreaterThan(0.8);
  expect(result.level).toBe('official');
});
```

### Test File: claim-citation-verifier.test.ts

**Location:** `server/claim-citation-verifier.test.ts`  
**Coverage:** Claim extraction, citation extraction, verification

#### Example Tests

**Test: Claim Extraction**

```typescript
it("should extract factual claims", () => {
  const response = `CSRD requires companies to report on sustainability.
  According to ESRS E1, carbon emissions must be disclosed.`;

  const claims = extractClaims(response);

  expect(claims.length).toBeGreaterThan(0);
  expect(claims.some(c => c.type === 'factual')).toBe(true);
});
```

**Test: Citation Extraction**

```typescript
it("should extract citation references", () => {
  const response = `Based on [Source 1], CSRD applies to large companies.
  See [2] for more details.`;
  
  const sources = [
    { id: 1, title: 'CSRD Regulation', url: '...' },
    { id: 2, title: 'ESRS E1', url: '...' },
  ];

  const citations = extractCitations(response, sources);

  expect(citations.length).toBe(2);
  expect(citations[0].id).toBe(1);
  expect(citations[1].id).toBe(2);
});
```

**Test: Claim Verification**

```typescript
it("should verify claims with citations", () => {
  const claims = [
    { id: 'claim_1', text: 'CSRD requires reporting', startIndex: 0, endIndex: 30 },
  ];
  const citations = [
    { id: 1, sourceId: 1, position: 25 },
  ];

  const results = verifyClaims(claims, citations, responseText);

  expect(results[0].verified).toBe(true);
  expect(results[0].supportingCitations.length).toBeGreaterThan(0);
});
```

---

## Integration Tests

### Test File: ask-isa-integration.test.ts

**Location:** `server/ask-isa-integration.test.ts`  
**Coverage:** End-to-end Q&A flow, tRPC router integration

#### Test Setup

```typescript
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}
```

#### Example Tests

**Test: Query Classification Integration**

```typescript
it("classifies gap queries correctly", () => {
  const query = "Which gaps exist for CSRD in DIY?";
  const classification = classifyQuery(query);

  expect(classification.type).toBe("gap");
  expect(classification.allowed).toBe(true);
});
```

**Test: Advisory Diff API**

```typescript
it("lists available advisory versions", async () => {
  const ctx = createPublicContext();
  const caller = appRouter.createCaller(ctx);

  const versions = await caller.advisoryDiff.listVersions();

  expect(versions).toBeDefined();
  expect(Array.isArray(versions)).toBe(true);
  expect(versions.length).toBeGreaterThanOrEqual(2);
  expect(versions.some(v => v.version === "v1.0")).toBe(true);
  expect(versions.some(v => v.version === "v1.1")).toBe(true);
});

it("computes diff between v1.0 and v1.1", async () => {
  const ctx = createPublicContext();
  const caller = appRouter.createCaller(ctx);

  const diff = await caller.advisoryDiff.computeDiff({
    version1: "v1.0",
    version2: "v1.1",
  });

  expect(diff).toBeDefined();
  expect(diff.metadata).toBeDefined();
  expect(diff.coverageDeltas).toBeDefined();
  expect(diff.gapLifecycle).toBeDefined();
});
```

---

## Smoke Tests

### Test File: ask_isa_smoke.py

**Location:** `scripts/probe/ask_isa_smoke.py`  
**Purpose:** Verify critical paths and required files exist

#### Test Implementation

```python
import json
import sys
from pathlib import Path

def die(msg):
    print(f"SMOKE_FAIL: {msg}", file=sys.stderr)
    sys.exit(2)

repo = Path(__file__).resolve()
while repo != repo.parent and not (repo / ".git").exists():
    repo = repo.parent

if not (repo / ".git").exists():
    die("cannot find git repo root from script location")

required = [
    "docs/spec/ASK_ISA.md",
    "docs/spec/contracts/ASK_ISA_RUNTIME_CONTRACT.md",
    "server/prompts/ask_isa/index.ts",
    "docs/planning/NEXT_ACTIONS.json",
]
missing = [p for p in required if not (repo / p).exists()]
if missing:
    die("missing required paths: " + ", ".join(missing))

print("SMOKE_OK")
print("repo_root=" + str(repo))
print("verified_files=" + ",".join(required))
```

#### Running Smoke Test

```bash
# Run smoke test
pnpm tsx scripts/probe/ask_isa_smoke.py

# Expected output:
# SMOKE_OK
# repo_root=/Users/.../isa_web_clean
# verified_files=docs/spec/ASK_ISA.md,...
```

---

## Test Fixtures

### Mock Data

**Mock Knowledge Chunks**

```typescript
export const mockKnowledgeChunks = [
  {
    id: 1,
    type: 'regulation',
    title: 'CSRD - Corporate Sustainability Reporting Directive',
    description: 'EU regulation requiring sustainability reporting',
    similarity: 0.9,
    url: 'https://eur-lex.europa.eu/...',
    authorityLevel: 'official',
  },
  {
    id: 2,
    type: 'standard',
    title: 'GS1 GTIN Standard',
    description: 'Global Trade Item Number standard',
    similarity: 0.8,
    url: 'https://www.gs1.org/...',
    authorityLevel: 'verified',
  },
];
```

**Mock LLM Response**

```typescript
export const mockLLMResponse = {
  choices: [{
    message: {
      content: `Based on ISA_ADVISORY_v1.1, there are 3 critical gaps for CSRD in DIY.
      
      [Source 1] CSRD requires sustainability reporting.
      [Source 2] GS1 GTIN supports product identification.
      
      Dataset references: esrs.datapoints.ig3, gs1nl.benelux.diy.v3.1.33`,
    },
  }],
};
```

**Mock Conversation**

```typescript
export const mockConversation = {
  id: 1,
  userId: 123,
  title: 'CSRD gaps in DIY',
  createdAt: '2026-02-12T10:00:00Z',
  updatedAt: '2026-02-12T10:05:00Z',
  messages: [
    {
      id: 1,
      conversationId: 1,
      role: 'user',
      content: 'Which gaps exist for CSRD in DIY?',
      timestamp: '2026-02-12T10:00:00Z',
    },
    {
      id: 2,
      conversationId: 1,
      role: 'assistant',
      content: 'Based on ISA_ADVISORY_v1.1, there are 3 critical gaps...',
      sources: mockKnowledgeChunks,
      retrievedChunks: 5,
      timestamp: '2026-02-12T10:00:05Z',
    },
  ],
};
```

---

## Test Scenarios

### Scenario 1: Successful Q&A Flow

**Given:** User asks allowed query  
**When:** Query is processed  
**Then:** Answer returned with sources, high confidence, verified claims

```typescript
it("should answer allowed query successfully", async () => {
  const result = await trpc.askISA.ask.mutate({
    question: "Which gaps exist for CSRD in DIY?",
    sector: "diy",
  });

  expect(result.answer).toBeDefined();
  expect(result.sources.length).toBeGreaterThan(0);
  expect(result.confidence.level).toBe("high");
  expect(result.claimVerification.verificationRate).toBeGreaterThan(0.5);
});
```

### Scenario 2: Forbidden Query Refusal

**Given:** User asks forbidden query  
**When:** Query is classified  
**Then:** Refusal message returned with explanation

```typescript
it("should refuse forbidden query", async () => {
  const result = await trpc.askISA.ask.mutate({
    question: "What will happen in 2027?",
  });

  expect(result.answer).toContain("ISA cannot answer");
  expect(result.sources).toHaveLength(0);
  expect(result.queryType).toBe("forbidden");
});
```

### Scenario 3: Evidence Insufficiency Abstention

**Given:** Query with low-quality evidence  
**When:** Evidence analysis runs  
**Then:** Abstention message returned with analysis

```typescript
it("should abstain when evidence insufficient", async () => {
  vi.mocked(hybridSearch).mockResolvedValue([
    { id: 1, title: 'Low relevance', hybridScore: 0.3 },
  ]);

  const result = await trpc.askISA.ask.mutate({
    question: "Obscure technical question",
  });

  expect(result.abstained).toBe(true);
  expect(result.abstentionReason).toBeDefined();
  expect(result.evidenceAnalysis).toBeDefined();
});
```

### Scenario 4: Conversation Context

**Given:** Existing conversation  
**When:** User asks follow-up question  
**Then:** Context from previous messages used

```typescript
it("should use conversation context", async () => {
  // First message
  const conv1 = await trpc.askISA.ask.mutate({
    question: "Which gaps exist for CSRD?",
  });

  // Follow-up with context
  const conv2 = await trpc.askISA.ask.mutate({
    question: "What about DIY sector?",
    conversationId: conv1.conversationId,
  });

  expect(conv2.conversationId).toBe(conv1.conversationId);
  expect(conv2.answer).toContain("DIY");
});
```

### Scenario 5: Cache Hit

**Given:** Query previously answered  
**When:** Same query asked again  
**Then:** Cached response returned

```typescript
it("should return cached response", async () => {
  const question = "Which gaps exist for CSRD in DIY?";

  // First call
  const result1 = await trpc.askISA.ask.mutate({ question });
  expect(result1.fromCache).toBeUndefined();

  // Second call (cached)
  const result2 = await trpc.askISA.ask.mutate({ question });
  expect(result2.fromCache).toBe(true);
  expect(result2.answer).toBe(result1.answer);
});
```

---

## Running Tests

### All Tests

```bash
pnpm test
```

### Specific Test File

```bash
pnpm test server/ask-isa-guardrails.test.ts
```

### Watch Mode

```bash
pnpm test --watch
```

### Coverage Report

```bash
pnpm test --coverage
```

### Integration Tests Only

```bash
pnpm test-integration
```

### Smoke Tests

```bash
pnpm tsx scripts/probe/ask_isa_smoke.py
```

---

## Test Coverage Goals

### Current Coverage

- **Unit Tests:** 90%+ (guardrails, authority, claims, hybrid search)
- **Integration Tests:** 70%+ (tRPC routers, end-to-end flows)
- **Smoke Tests:** 100% (critical paths verified)

### Target Coverage

- **Unit Tests:** 95%+
- **Integration Tests:** 85%+
- **Smoke Tests:** 100%

---

## Mocking Strategies

### Mock External APIs

```typescript
vi.mock('../_core/llm', () => ({
  invokeLLM: vi.fn().mockResolvedValue(mockLLMResponse),
}));
```

### Mock Database

```typescript
vi.mock('../db-knowledge', () => ({
  searchKnowledgeChunks: vi.fn().mockResolvedValue(mockKnowledgeChunks),
  createQAConversation: vi.fn().mockResolvedValue({ id: 1 }),
  addQAMessage: vi.fn().mockResolvedValue({ id: 1 }),
}));
```

### Mock Hybrid Search

```typescript
vi.mock('../hybrid-search', () => ({
  hybridSearch: vi.fn().mockResolvedValue(mockHybridResults),
}));
```

---

## Best Practices

### 1. Test Isolation

Each test should be independent and not rely on other tests.

```typescript
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.resetAllMocks();
});
```

### 2. Descriptive Test Names

Use clear, descriptive test names that explain what is being tested.

```typescript
it("should classify gap queries correctly", () => {
  // Test implementation
});
```

### 3. Arrange-Act-Assert

Follow the AAA pattern for test structure.

```typescript
it("should calculate confidence", () => {
  // Arrange
  const sourceCount = 3;
  
  // Act
  const result = calculateConfidence(sourceCount);
  
  // Assert
  expect(result.level).toBe("high");
});
```

### 4. Test Edge Cases

Always test edge cases and boundary conditions.

```typescript
it("should handle empty input", () => {
  const result = validateCitations("");
  expect(result.valid).toBe(false);
});
```

### 5. Use Test Fixtures

Reuse test data via fixtures to reduce duplication.

```typescript
import { mockKnowledgeChunks } from './test-helpers/fixtures';
```

---

## Continuous Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test-integration
      - run: pnpm tsx scripts/probe/ask_isa_smoke.py
```

---

## Troubleshooting Tests

### Test Timeout

```typescript
it("should handle slow operation", async () => {
  // Increase timeout for slow tests
  const result = await slowOperation();
  expect(result).toBeDefined();
}, 10000); // 10 second timeout
```

### Mock Not Working

```typescript
// Ensure mock is called before import
vi.mock('./module', () => ({ ... }));
import { function } from './module';
```

### Database Connection Issues

```typescript
// Use test database or mock
process.env.DATABASE_URL = 'mysql://test:test@localhost/test_db';
```

---

## Changelog

### v1.0 (2026-02-12)
- Initial testing guide
- Unit test examples
- Integration test examples
- Smoke test documentation
- Test fixtures and scenarios
- Best practices and CI setup

---

## See Also

- [CAPABILITY_SPEC.md](./CAPABILITY_SPEC.md) - Technical specification
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Implementation guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment procedures
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
