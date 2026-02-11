# Codex Delegation Specification

**Project:** ISA (Intelligent Standards Architect)  
**Date:** January 4, 2026  
**Status:** Active Coordination Phase

---

## Executive Summary

This document defines the task delegation framework for coordinated development between Manus (orchestrator) and Codex (implementation agent). The ISA project currently has **62 passing test files** with **816 passing tests** and **28 skipped tests**. The architecture is stable, and we are now in a phase where targeted implementation tasks can be safely delegated.

---

## Current State Assessment

### Test Suite Health

| Metric | Value |
|--------|-------|
| Total Test Files | 66 |
| Passing Files | 62 |
| Skipped Files | 4 |
| Total Tests | 844 |
| Passing Tests | 816 |
| Skipped Tests | 28 |
| Test Duration | ~62 seconds |

### Key Architecture Components

| Component | Location | Status |
|-----------|----------|--------|
| News Pipeline | `server/news-pipeline.ts` | Stable |
| AI Processor | `server/news-ai-processor.ts` | Stable |
| Health Monitor | `server/news-health-monitor.ts` | Stable |
| tRPC Routers | `server/routers/*.ts` | Stable |
| Database Schema | `drizzle/schema.ts` | Stable |
| Server Logger | `server/utils/server-logger.ts` | Stable |

### Database-Dependent Tests (Excluded in CI)

The following 28 test files are excluded when `DATABASE_URL` is not available:

- `server/alert-system.test.ts`
- `server/admin-analytics.test.ts`
- `server/cellar-ingestion-integration.test.ts`
- `server/coverage-analytics.test.ts`
- `server/data-quality.test.ts`
- `server/db-error-tracking.test.ts`
- `server/db-performance-tracking.test.ts`
- `server/dutch-initiatives.test.ts`
- `server/epcis-integration.test.ts`
- `server/epcis-ui.test.ts`
- `server/esrs.test.ts`
- `server/gs1-mapping-engine.test.ts`
- `server/news-health-monitor.test.ts`
- `server/news-pipeline-db-integration.test.ts`
- `server/news-pipeline.test.ts`
- `server/observability.test.ts`
- `server/onboarding.test.ts`
- `server/regulatory-change-log.test.ts`
- `server/regulation-esrs-mapper.test.ts`
- `server/run-first-ingestion.test.ts`
- `server/routers/advisory-reports.test.ts`
- `server/routers/dataset-registry.test.ts`
- `server/routers/gs1-attributes-multi-sector.test.ts`
- `server/routers/gs1-attributes.test.ts`
- `server/routers/governance-documents.test.ts`
- `server/routers/scraper-health.test.ts`
- `server/routers/standards-directory.test.ts`
- `server/standards-directory.test.ts`
- `server/routers.test.ts`

---

## Codex-Assignable Tasks

### Task 1: Database Test Helper Utilities

**Task Name:** `create-db-test-helpers`

**Objective:** Create a reusable test helper module for database operations that provides:
- In-memory SQLite setup for isolated testing
- Seed data factories for common entities
- Cleanup utilities for test isolation

**Prompt to Codex:**
```
Create a test helper module at `server/test-helpers/db-test-utils.ts` that provides:

1. `createTestDb()` - Returns an in-memory SQLite database instance configured with the ISA schema
2. `seedNewsItem(db, overrides?)` - Creates a test hub_news record with sensible defaults
3. `seedEsrsDatapoint(db, overrides?)` - Creates a test ESRS datapoint record
4. `seedGs1Attribute(db, overrides?)` - Creates a test GS1 attribute record
5. `cleanupTestDb(db)` - Truncates all tables for test isolation

Requirements:
- Use Drizzle ORM patterns consistent with existing `server/db.ts`
- Export TypeScript types for all factory functions
- Include JSDoc comments for each function
- Write unit tests in `server/test-helpers/db-test-utils.test.ts`

Reference files:
- `drizzle/schema.ts` for table definitions
- `server/db.ts` for query patterns
- `server/news-pipeline-modes.test.ts` for mocking patterns
```

**Files to Change:**
- Create: `server/test-helpers/db-test-utils.ts`
- Create: `server/test-helpers/db-test-utils.test.ts`

**Expected Test Results:**
- All factory functions return valid typed objects
- `createTestDb()` returns a working Drizzle instance
- Seed functions insert records successfully
- Cleanup function removes all test data

**Review Checkpoint:** Verify exports, types, and test coverage before integration.

---

### Task 2: External API Mock Generator

**Task Name:** `generate-api-mocks`

**Objective:** Create standardised mock factories for external API responses used across the test suite.

**Prompt to Codex:**
```
Create a mock factory module at `server/test-helpers/api-mocks.ts` that provides:

1. `mockLLMResponse(overrides?)` - Returns a mock OpenAI-compatible response
2. `mockNewsFetchResponse(sourceId, items?)` - Returns a mock news fetcher response
3. `mockCellarResponse(documents?)` - Returns a mock EU CELLAR API response
4. `mockEurLexResponse(items?)` - Returns a mock EUR-Lex scraper response

Requirements:
- Match the exact response shapes expected by the production code
- Include realistic default values
- Support partial overrides via spread operator
- Export TypeScript types for all mock shapes

Reference files:
- `server/news-fetcher.ts` for news response shapes
- `server/cellar-connector.ts` for CELLAR response shapes
- `server/news/news-scraper-eurlex.ts` for EUR-Lex shapes
- `server/_core/llm.ts` for LLM response shapes

Write tests in `server/test-helpers/api-mocks.test.ts` to validate:
- All mocks match expected TypeScript types
- Overrides are applied correctly
- Default values are sensible
```

**Files to Change:**
- Create: `server/test-helpers/api-mocks.ts`
- Create: `server/test-helpers/api-mocks.test.ts`

**Expected Test Results:**
- Type checking passes for all mock factories
- Mocks can be used in existing test files without modification
- Override functionality works correctly

**Review Checkpoint:** Verify type compatibility with production code before merging.

---

### Task 3: CI Test Script Improvements

**Task Name:** `improve-ci-test-scripts`

**Objective:** Create improved test scripts for CI/CD that provide better reporting and parallel execution.

**Prompt to Codex:**
```
Create improved test scripts in `scripts/` directory:

1. `scripts/run-unit-tests.sh` - Runs only unit tests (no DB dependency)
2. `scripts/run-integration-tests.sh` - Runs DB-dependent tests with proper setup
3. `scripts/test-report.ts` - Generates a JSON test report summary

Requirements for shell scripts:
- Use `set -e` for fail-fast behavior
- Support `--coverage` flag
- Output timing information
- Exit with appropriate codes

Requirements for test-report.ts:
- Parse vitest JSON output
- Generate summary with pass/fail counts
- List failing tests with file locations
- Output both JSON and human-readable formats

Reference files:
- `vitest.config.ts` for test configuration
- `package.json` for existing scripts
```

**Files to Change:**
- Create: `scripts/run-unit-tests.sh`
- Create: `scripts/run-integration-tests.sh`
- Create: `scripts/test-report.ts`
- Update: `package.json` (add new script entries)

**Expected Test Results:**
- Scripts execute without errors
- Coverage flag works correctly
- Test report generates valid JSON

**Review Checkpoint:** Test scripts locally before adding to CI workflow.

---

### Task 4: News Pipeline Mode Logic Enhancement

**Task Name:** `fix-news-pipeline-modes`

**Objective:** Enhance the news pipeline mode logic to support additional ingestion modes and improve testability.

**Prompt to Codex:**
```
Enhance `server/news-pipeline.ts` to support:

1. Add 'incremental' mode (7-day window) for frequent updates
2. Add 'full-refresh' mode (365-day window) for complete rebuilds
3. Extract mode configuration into a separate `server/news-pipeline-config.ts`
4. Add mode validation with clear error messages

Requirements:
- Maintain backward compatibility with existing 'normal' and 'backfill' modes
- Export `PipelineModeConfig` type with all mode parameters
- Add JSDoc documentation for each mode
- Update existing tests and add new tests for new modes

Reference files:
- `server/news-pipeline.ts` for current implementation
- `server/news-pipeline-modes.test.ts` for test patterns

Update tests in `server/news-pipeline-modes.test.ts` to cover:
- All four modes with correct age windows
- Mode validation error cases
- Default mode behavior
```

**Files to Change:**
- Update: `server/news-pipeline.ts`
- Create: `server/news-pipeline-config.ts`
- Update: `server/news-pipeline-modes.test.ts`

**Expected Test Results:**
- All existing tests continue to pass
- New mode tests pass
- TypeScript compiles without errors

**Review Checkpoint:** Run full test suite before merging.

---

### Task 5: Documentation Generation

**Task Name:** `generate-api-documentation`

**Objective:** Generate comprehensive API documentation for the tRPC routers.

**Prompt to Codex:**
```
Create API documentation at `docs/API_REFERENCE.md` that documents:

1. All public tRPC procedures with their inputs and outputs
2. Authentication requirements (public vs protected)
3. Example request/response payloads
4. Error codes and handling

Requirements:
- Use Markdown tables for procedure listings
- Include TypeScript type definitions
- Add usage examples with trpc client
- Document rate limiting and quotas

Reference files:
- `server/routers.ts` for main router
- `server/routers/*.ts` for feature routers
- `shared/` for shared types

Generate the documentation programmatically by:
1. Reading router files
2. Extracting procedure definitions
3. Generating Markdown output
```

**Files to Change:**
- Create: `docs/API_REFERENCE.md`
- Create: `scripts/generate-api-docs.ts`

**Expected Test Results:**
- Documentation covers all routers
- Examples are syntactically correct
- Links to type definitions work

**Review Checkpoint:** Review generated documentation for accuracy.

---

### Task 6: Frontend Navigation Component Enhancement

**Task Name:** `enhance-navigation-components`

**Objective:** Improve the navigation components with better accessibility and mobile responsiveness.

**Prompt to Codex:**
```
Enhance the navigation components in `client/src/components/`:

1. Add keyboard navigation support to sidebar
2. Add mobile hamburger menu with slide-out drawer
3. Add breadcrumb component for deep navigation
4. Add skip-to-content link for accessibility

Requirements:
- Use shadcn/ui components where available
- Follow WCAG 2.1 AA guidelines
- Support both light and dark themes
- Add Storybook stories for each component (if Storybook exists)

Reference files:
- `client/src/components/DashboardLayout.tsx` for current layout
- `client/src/App.tsx` for route structure
- `client/src/index.css` for theme variables

Write tests in `client/src/components/__tests__/` for:
- Keyboard navigation
- Mobile menu toggle
- Breadcrumb rendering
```

**Files to Change:**
- Update: `client/src/components/DashboardLayout.tsx`
- Create: `client/src/components/Breadcrumb.tsx`
- Create: `client/src/components/MobileNav.tsx`
- Create: `client/src/components/__tests__/navigation.test.tsx`

**Expected Test Results:**
- All accessibility tests pass
- Mobile menu toggles correctly
- Keyboard navigation works

**Review Checkpoint:** Test on multiple screen sizes before merging.

---

### Task 7: Unit Test Expansion for Isolated Modules

**Task Name:** `expand-unit-tests`

**Objective:** Increase test coverage for isolated utility modules.

**Prompt to Codex:**
```
Add unit tests for the following modules that currently lack coverage:

1. `server/news-content-analyzer.ts` - Test content analysis functions
2. `server/news-deduplicator.ts` - Test deduplication algorithms
3. `server/citation-validation.ts` - Test citation parsing and validation
4. `server/compliance-scoring.ts` - Test scoring calculations

Requirements:
- Achieve >80% line coverage for each module
- Test edge cases and error conditions
- Use descriptive test names
- Mock external dependencies

Reference files:
- Existing test files for patterns
- `vitest.config.ts` for configuration

Create test files:
- `server/news-content-analyzer.test.ts`
- `server/news-deduplicator.test.ts` (expand existing)
- `server/citation-validation.test.ts`
- `server/compliance-scoring.test.ts`
```

**Files to Change:**
- Create/Update: `server/news-content-analyzer.test.ts`
- Update: `server/news-deduplicator.test.ts`
- Create: `server/citation-validation.test.ts`
- Create: `server/compliance-scoring.test.ts`

**Expected Test Results:**
- All new tests pass
- Coverage increases for target modules
- No regressions in existing tests

**Review Checkpoint:** Run coverage report before merging.

---

### Task 8: UI Feature Component Scaffolding

**Task Name:** `scaffold-ui-components`

**Objective:** Create scaffolded UI components for upcoming features.

**Prompt to Codex:**
```
Create scaffolded UI components for the following features:

1. `client/src/components/RegulationTimeline.tsx` - Timeline view of regulation changes
2. `client/src/components/GS1ImpactBadge.tsx` - Badge showing GS1 impact level
3. `client/src/components/SectorFilter.tsx` - Multi-select filter for sectors
4. `client/src/components/NewsRecommendationCard.tsx` - Card for AI recommendations

Requirements:
- Use shadcn/ui base components
- Include TypeScript props interfaces
- Add placeholder content with TODO comments
- Follow existing component patterns

Reference files:
- `client/src/components/ui/` for shadcn components
- `client/src/pages/NewsHub.tsx` for existing patterns
- `shared/news-tags.ts` for tag enums

Each component should:
- Export a typed React component
- Include basic styling
- Have a loading state
- Have an empty state
```

**Files to Change:**
- Create: `client/src/components/RegulationTimeline.tsx`
- Create: `client/src/components/GS1ImpactBadge.tsx`
- Create: `client/src/components/SectorFilter.tsx`
- Create: `client/src/components/NewsRecommendationCard.tsx`

**Expected Test Results:**
- Components render without errors
- TypeScript compiles without errors
- Components are importable from other files

**Review Checkpoint:** Visual review in browser before merging.

---

## Synchronisation Workflow

### Pre-Delegation Checklist

Before delegating any task to Codex:

1. [ ] Verify task is self-contained and isolated
2. [ ] Confirm no architectural changes required
3. [ ] Identify all reference files needed
4. [ ] Define clear acceptance criteria
5. [ ] Set review checkpoint

### Integration Process

After Codex completes a task:

1. **Review Phase**
   - Check TypeScript compilation
   - Run affected tests
   - Review code style consistency

2. **Integration Phase**
   - Merge changes to feature branch
   - Run full test suite
   - Check for regressions

3. **Validation Phase**
   - Verify acceptance criteria met
   - Update todo.md with completion status
   - Document any learnings

### Quality Gates

| Gate | Criteria | Action on Failure |
|------|----------|-------------------|
| TypeScript | Zero compilation errors | Return to Codex with errors |
| Unit Tests | All new tests pass | Return to Codex with failures |
| Integration | No regressions | Manus investigates root cause |
| Coverage | >80% for new code | Request additional tests |

---

## Communication Protocol

### Task Handoff Format

```markdown
## Task: [Task Name]

**Assigned To:** Codex
**Priority:** [High/Medium/Low]
**Estimated Effort:** [Hours]

### Context
[Brief description of why this task is needed]

### Requirements
[Numbered list of specific requirements]

### Reference Files
- [List of files Codex should read]

### Expected Output
- [List of files to create/modify]

### Acceptance Criteria
- [ ] [Specific, testable criteria]

### Review Checkpoint
[When and how to validate completion]
```

### Status Updates

Codex should provide status updates in this format:

```markdown
## Status: [Task Name]

**Status:** [In Progress/Blocked/Complete]
**Files Modified:** [List]
**Tests Added:** [Count]
**Issues Encountered:** [If any]

### Next Steps
[What remains to be done]
```

---

## Appendix: File Reference Map

### Core Server Files

| File | Purpose | Codex Access |
|------|---------|--------------|
| `server/routers.ts` | Main tRPC router | Read-only |
| `server/db.ts` | Database helpers | Read-only |
| `drizzle/schema.ts` | Database schema | Read-only |
| `server/_core/*.ts` | Framework internals | Do not modify |

### Test Files

| Pattern | Purpose | Codex Access |
|---------|---------|--------------|
| `server/*.test.ts` | Unit tests | Create/Modify |
| `server/routers/*.test.ts` | Router tests | Create/Modify |
| `client/src/**/*.test.tsx` | Frontend tests | Create/Modify |

### Configuration Files

| File | Purpose | Codex Access |
|------|---------|--------------|
| `vitest.config.ts` | Test configuration | Read-only |
| `package.json` | Dependencies | Modify scripts only |
| `tsconfig.json` | TypeScript config | Read-only |

---

**Document Version:** 1.0  
**Last Updated:** January 4, 2026  
**Author:** Manus AI (Orchestrator)
