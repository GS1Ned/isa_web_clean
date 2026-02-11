# ISA Testing Guide

## Overview

ISA has a comprehensive test suite with 574 tests across 53 test files, achieving a 90.1% pass rate (517 passing tests). This guide explains how to run tests, interpret results, and contribute new tests.

## Test Structure

```
server/
├── *.test.ts                    # Unit tests for server modules
├── routers/*.test.ts            # tRPC router tests
├── news/*.test.ts               # News pipeline tests
├── mappings/*.test.ts           # Mapping engine tests
└── prompts/ask_isa/*.test.ts    # Ask ISA prompt tests
```

## Running Tests

### Run all tests
```bash
pnpm test
```

### Run tests in watch mode
```bash
pnpm test --watch
```

### Run specific test file
```bash
pnpm test server/news-pipeline.test.ts
```

### Run tests with coverage
```bash
pnpm test --coverage
```

## Test Categories

### 1. Unit Tests (300+ tests)
Test individual functions and modules in isolation.

**Examples:**
- `server/news-ai-processor.test.ts` - AI content analysis
- `server/cellar-normalizer.test.ts` - Data normalization
- `server/mappings/esrs-to-gs1-mapper.test.ts` - Mapping logic

### 2. Integration Tests (150+ tests)
Test interactions between multiple modules.

**Examples:**
- `server/news-pipeline-db-integration.test.ts` - Pipeline + database
- `server/cellar-ingestion-integration.test.ts` - CELLAR + database
- `server/ask-isa-integration.test.ts` - Ask ISA + knowledge base

### 3. Router Tests (100+ tests)
Test tRPC procedures with mock authentication.

**Examples:**
- `server/routers.test.ts` - Main router procedures
- `server/routers/scraper-health.test.ts` - Health monitoring
- `server/regulatory-change-log.test.ts` - Regulatory updates

## Known Test Failures (57 tests, 9.9%)

### Category 1: External API Failures (38 tests)
**Status:** Non-critical, testing infrastructure only

**Affected:**
- CELLAR EU database connectivity
- LLM API timeouts
- External service dependencies

**Impact:** None on production (uses pre-ingested data)

**Fix:** Mock external services in tests

### Category 2: Database Schema Drift (12 tests)
**Status:** Non-critical, affects ingestion scripts only

**Affected:**
- `esrs_datapoints` table field naming
- Ingestion test data setup

**Impact:** None on end-user features

**Fix:** Standardize snake_case in schema

### Category 3: tRPC Procedure Failures (7 tests)
**Status:** Non-critical, test setup issues

**Affected:**
- Mock user context initialization
- Test data creation timing

**Impact:** None on production code

**Fix:** Improve test setup helpers

## Writing New Tests

### Test Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup test data
  });

  it('should handle normal case', () => {
    // Arrange
    const input = { /* test data */ };
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe(expectedValue);
  });

  it('should handle edge case', () => {
    // Test edge cases
  });

  it('should handle error case', () => {
    // Test error handling
  });
});
```

### Best Practices

1. **Use descriptive test names**
   ```typescript
   // ✅ Good
   it('should return 404 when regulation not found')
   
   // ❌ Bad
   it('test regulation')
   ```

2. **Test one thing per test**
   ```typescript
   // ✅ Good
   it('should validate GTIN format')
   it('should calculate check digit correctly')
   
   // ❌ Bad
   it('should validate GTIN and calculate check digit')
   ```

3. **Use meaningful assertions**
   ```typescript
   // ✅ Good
   expect(result.status).toBe('success');
   expect(result.data).toHaveLength(5);
   
   // ❌ Bad
   expect(result).toBeTruthy();
   ```

4. **Mock external dependencies**
   ```typescript
   import { vi } from 'vitest';
   
   vi.mock('./external-service', () => ({
     fetchData: vi.fn().mockResolvedValue({ data: [] })
   }));
   ```

5. **Clean up after tests**
   ```typescript
   afterEach(async () => {
     await db.delete(testTable);
   });
   ```

## CI/CD Integration

### GitHub Actions Workflow

The CI pipeline runs on every push and pull request:

1. **TypeScript Check** - Ensures error count ≤ 2
2. **Linting** - Runs ESLint (non-blocking)
3. **Tests** - Requires ≥85% pass rate
4. **Build** - Verifies production build succeeds
5. **Security Audit** - Checks for vulnerabilities

### Local Pre-commit Checks

Before committing, run:

```bash
# Type check
npx tsc --noEmit

# Run tests
pnpm test --run

# Lint code
pnpm run lint
```

## Test Coverage Goals

| Category | Current | Target |
|----------|---------|--------|
| Overall Pass Rate | 90.1% | 95% |
| Unit Tests | 95% | 98% |
| Integration Tests | 85% | 90% |
| Router Tests | 88% | 95% |

## Debugging Failed Tests

### 1. Check test output
```bash
pnpm test --reporter=verbose
```

### 2. Run single test in isolation
```bash
pnpm test server/news-pipeline.test.ts --reporter=verbose
```

### 3. Add debug logging
```typescript
import { describe, it, expect } from 'vitest';

it('should process news', () => {
  console.log('Input:', input); // Debug log
  const result = processNews(input);
  console.log('Result:', result); // Debug log
  expect(result).toBeDefined();
});
```

### 4. Check database state
```typescript
import { db } from './db';

it('should save to database', async () => {
  await saveNews(newsItem);
  
  // Debug: Check what was actually saved
  const saved = await db.select().from(hubNews);
  console.log('Saved items:', saved);
  
  expect(saved).toHaveLength(1);
});
```

## Performance Testing

### Measuring Test Execution Time

```bash
pnpm test --reporter=verbose | grep "Duration"
```

### Slow Test Threshold

Tests taking >1 second should be optimized:

```typescript
import { describe, it, expect, vi } from 'vitest';

// ❌ Slow: Real API calls
it('should fetch news', async () => {
  const news = await fetchFromAPI(); // 5 seconds
  expect(news).toBeDefined();
});

// ✅ Fast: Mocked API
it('should fetch news', async () => {
  vi.mock('./api', () => ({
    fetchFromAPI: vi.fn().mockResolvedValue([])
  }));
  const news = await fetchFromAPI(); // 5ms
  expect(news).toBeDefined();
});
```

## Continuous Improvement

### Monthly Test Health Review

1. Check pass rate trend
2. Identify flaky tests (intermittent failures)
3. Update mocks for external APIs
4. Add tests for new features
5. Remove obsolete tests

### Test Metrics Dashboard

Track these metrics over time:
- Total test count
- Pass rate percentage
- Average execution time
- Coverage percentage
- Flaky test count

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [tRPC Testing Guide](https://trpc.io/docs/server/testing)
- ISA Test Failure Analysis: `docs/test-failure-analysis-2025-12-17.md`
