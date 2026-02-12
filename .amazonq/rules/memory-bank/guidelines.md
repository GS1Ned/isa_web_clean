# ISA Development Guidelines

## Repo Anchors

### Canonical Navigation
- `/AGENT_START_HERE.md` - Agent entrypoint
- `/README.md` - Project overview
- `/REPO_TREE.md` - Repository structure
- `/AGENTS.md` - Agent collaboration guide
- `/package.json` - Dependencies and scripts

### Refactor / Governance Evidence
- `/docs/planning/refactoring/FILE_INVENTORY.json` - Complete file registry (828 files)
- `/docs/planning/refactoring/QUALITY_SCORECARDS.json` - Capability quality scores
- `/docs/planning/refactoring/EVIDENCE_MARKERS.json` - Traceability markers
- `/docs/planning/refactoring/FINAL_STATUS_REPORT.md` - Refactoring completion status
- `/docs/planning/refactoring/EXECUTION_SUMMARY.md` - Phase-by-phase results
- `/docs/planning/refactoring/MOVE_PLAN.json` - File relocation plan
- `/docs/planning/refactoring/MOVE_EXECUTION_LOG.json` - Relocation audit trail

### Gate Runner
- `/scripts/refactor/validate_gates.sh` - 5 automated validation gates

**Rule**: Any statement about repository state must link to one of the anchors above (file path), or it is considered unverified.

## How to Validate (One Pass)

Run the gate runner to verify repository state:
```bash
bash scripts/refactor/validate_gates.sh
```

Then confirm these artifacts exist and are current:
- `docs/planning/refactoring/FILE_INVENTORY.json` (828 files, 100% classified)
- `docs/planning/refactoring/QUALITY_SCORECARDS.json` (overall score 71.7/100)
- `docs/planning/refactoring/FINAL_STATUS_REPORT.md` (all gates passing)

## Code Quality Standards

### File Organization
- **Python scripts**: Include docstring header with purpose, constraints, and metadata
- **TypeScript files**: Use clear module-level comments for complex logic
- **Imports**: Group by category (external, internal core, internal features)
- **Exports**: Use named exports for utilities, default exports for pages/components

### Naming Conventions
- **Files**: kebab-case for scripts (extract_advisory_v1.py), PascalCase for React components (ComponentShowcase.tsx)
- **Variables**: camelCase for local variables, UPPER_SNAKE_CASE for constants
- **Functions**: camelCase with descriptive verb prefixes (analyze, generate, build, get)
- **Types/Interfaces**: PascalCase with descriptive suffixes (Result, Info, Chain, Config)
- **Database schemas**: snake_case for table/column names

### Documentation Standards
- **Python**: Triple-quoted docstrings with purpose, constraints, and usage
- **TypeScript**: JSDoc comments for public APIs and complex functions
- **Inline comments**: Explain "why" not "what", especially for business logic
- **README files**: Include purpose, usage, and examples

## Structural Conventions

### React Component Patterns
- **Lazy loading**: Use React.lazy() for non-critical pages to improve initial load
- **Component structure**: Imports → Types → Component → Exports
- **State management**: useState for local state, tRPC queries for server state
- **Error boundaries**: Wrap app in ErrorBoundary for graceful error handling
- **Loading states**: Provide fallback UI for Suspense boundaries

### TypeScript Type Safety
- **Strict typing**: Enable strict mode, avoid `any` types
- **Type definitions**: Define interfaces for all data structures
- **Union types**: Use for enums and discriminated unions (e.g., CBVBizStep)
- **Type guards**: Implement type guard functions (isESGRelevantBizStep)
- **Null safety**: Use optional chaining (?.) and nullish coalescing (??)

### Database Patterns
- **Schema organization**: Separate schema files by domain (schema_advisory_reports.ts)
- **Migrations**: Use Drizzle Kit for schema changes
- **Queries**: Use Drizzle ORM with sql tagged templates for complex queries
- **Transactions**: Wrap multi-step operations in transactions
- **Error handling**: Always check db connection before queries

## Semantic Patterns

### Data Processing
- **Immutability**: Prefer const over let, use spread operators for updates
- **Functional style**: Use map/filter/reduce over imperative loops
- **Error handling**: Try-catch blocks with structured logging
- **Validation**: Validate inputs at boundaries (API routes, file parsers)
- **Provenance tracking**: Include metadata (source, version, date) in all datasets

### API Design (tRPC)
- **Router organization**: Group related procedures in routers (advisory, news, admin)
- **Input validation**: Use Zod schemas for all inputs
- **Error responses**: Return structured errors with context
- **Pagination**: Implement cursor-based pagination for large datasets
- **Caching**: Use TanStack Query for client-side caching

### AI Integration
- **Prompt templates**: Store prompts in server/prompts/ directory
- **Citation tracking**: Always include source citations in AI responses
- **Confidence scoring**: Return confidence scores with AI-generated content
- **Guardrails**: Implement query type validation (allowed/forbidden types)
- **Fallback handling**: Provide graceful degradation when AI unavailable

### Governance Compliance
- **Version control**: Use conventional commits (feat, fix, docs, refactor, test, chore, data)
- **Evidence tracking**: Link decisions to evidence in governance docs
- **Dataset registry**: Register all datasets in data/metadata/dataset_registry.json
- **Checksums**: Include SHA256 checksums for data integrity
- **Audit trails**: Log all critical operations with timestamps

## Internal API Usage

### tRPC Client Pattern
```typescript
// Query pattern
const { data, isLoading, error } = trpc.advisory.getReport.useQuery({ 
  version: "1.0" 
});

// Mutation pattern
const mutation = trpc.advisory.generateReport.useMutation({
  onSuccess: (data) => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  }
});
```

### Database Query Pattern
```typescript
// Get database connection
const db = await getDb();
if (!db) return null;

// Import schemas
const { regulations, esrsDatapoints } = await import("../drizzle/schema");

// Execute query with error handling
try {
  const results = await db
    .select({ id: regulations.id, title: regulations.title })
    .from(regulations)
    .where(sql`${regulations.id} = ${regulationId}`)
    .limit(1);
  return results[0];
} catch (error) {
  serverLogger.error("[Context] Query failed:", error);
  return null;
}
```

### Logging Pattern
```typescript
// Import logger
import { serverLogger } from "./_core/logger-wiring";

// Log with context
serverLogger.info("[ComponentName] Operation started", { metadata });
serverLogger.error("[ComponentName] Operation failed:", error);
```

### Component UI Pattern
```typescript
// shadcn/ui component usage
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Use semantic variants
<Button variant="outline" size="sm">Action</Button>
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

## Code Idioms

### Array Processing
```typescript
// Filtering and mapping
const gaps = datapoints
  .filter(dp => !hasGS1Coverage(dp))
  .map(dp => ({ id: dp.id, status: 'missing' }));

// Grouping
const byStandard = new Map<string, number>();
items.forEach(item => {
  byStandard.set(item.standard, (byStandard.get(item.standard) || 0) + 1);
});
```

### Conditional Rendering
```typescript
// Ternary for simple cases
{isLoading ? <Spinner /> : <Content />}

// Logical AND for conditional display
{error && <Alert variant="destructive">{error.message}</Alert>}

// Optional chaining for nested properties
{data?.regulation?.title}
```

### Type Narrowing
```typescript
// Type guard functions
export function isESGRelevantBizStep(bizStep: string): bizStep is CBVBizStep {
  const esgBizSteps: CBVBizStep[] = [...];
  return esgBizSteps.includes(bizStep as CBVBizStep);
}

// Usage
if (isESGRelevantBizStep(step)) {
  // step is now typed as CBVBizStep
}
```

## Popular Annotations

### TypeScript Annotations
```typescript
// Type assertion
const element = document.getElementById('root') as HTMLElement;

// Non-null assertion (use sparingly)
const value = maybeNull!;

// Type parameter constraints
function process<T extends BaseType>(item: T): T { }

// Readonly properties
interface Config {
  readonly version: string;
}
```

### JSDoc Annotations
```typescript
/**
 * Analyze compliance gaps for a specific regulation
 * @param regulationId - Database ID of the regulation
 * @returns Gap analysis result or null if not found
 */
export async function analyzeComplianceGaps(
  regulationId: number
): Promise<GapAnalysisResult | null> { }
```

### React Annotations
```typescript
// Lazy loading with type safety
const Component = lazy(() => import("./Component").then(m => ({ 
  default: m.Component 
})));

// Event handler types
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { };
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { };
```

## Testing Patterns

### Test Organization
- **Unit tests**: Test individual functions in isolation
- **Integration tests**: Test database interactions and API routes
- **Test files**: Co-locate with source files (*.test.ts)
- **Test helpers**: Shared utilities in server/test-helpers/

### Test Structure
```typescript
import { describe, it, expect } from 'vitest';

describe('ComponentName', () => {
  it('should handle expected case', () => {
    const result = functionUnderTest(input);
    expect(result).toBe(expected);
  });

  it('should handle edge case', () => {
    const result = functionUnderTest(edgeInput);
    expect(result).toBeNull();
  });
});
```

## Performance Considerations

- **Lazy loading**: Split large pages into separate chunks
- **Memoization**: Use React.memo for expensive components
- **Query optimization**: Use indexes and limit result sets
- **Caching**: Leverage TanStack Query cache for repeated requests
- **Batch operations**: Process files in batches to avoid memory issues

## Security Practices

- **Input validation**: Validate all user inputs with Zod schemas
- **SQL injection**: Use parameterized queries via Drizzle ORM
- **XSS prevention**: React escapes by default, avoid dangerouslySetInnerHTML
- **Authentication**: Use Manus OAuth for user authentication
- **Secrets management**: Store secrets in environment variables, never commit
- **Rate limiting**: Apply rate limits to API endpoints

## Accessibility

- **Semantic HTML**: Use proper HTML elements (button, nav, main)
- **ARIA labels**: Add aria-label for icon-only buttons
- **Keyboard navigation**: Ensure all interactive elements are keyboard accessible
- **Focus management**: Manage focus for modals and dynamic content
- **Color contrast**: Follow WCAG guidelines for text contrast

## Where Guidelines Are Enforced

### Automated Enforcement
**Gate Runner**: `/scripts/refactor/validate_gates.sh`  
**Enforces**:
1. File inventory exists and is current
2. All 6 runtime contracts exist
3. Quality score ≥ 60 (current: 71.7/100)
4. Link validation (basic check)
5. UNKNOWN classification < 5% (current: 0%)

**Status**: 5/5 gates passing per `/docs/planning/refactoring/FINAL_STATUS_REPORT.md`

### Quality Tracking
**Inventory**: `/docs/planning/refactoring/FILE_INVENTORY.json` (828 files, 100% classified)  
**Scorecards**: `/docs/planning/refactoring/QUALITY_SCORECARDS.json` (capability-level quality scores)  
**Evidence**: `/docs/planning/refactoring/EVIDENCE_MARKERS.json` (traceability markers)

**Rule**: Guidelines without enforcement anchors are non-binding. All normative guidelines must reference validation gates or quality scorecards.

## Doc Governance (Minimum)

### Evidence Requirements
**Normative statements** (requirements, constraints, architectural decisions) must include:
1. Evidence pointer to repo artifact (file path), OR
2. Explicit UNVERIFIED label with rationale

**Evidence Registry**: `/docs/planning/refactoring/EVIDENCE_MARKERS.json`  
**Current Status**: 0 markers found per `/docs/planning/refactoring/PHASE_3_SUMMARY.md` (opportunity for improvement)

### Validation Workflow
1. Make documentation change
2. Add evidence markers linking to implementation
3. Run `/scripts/refactor/validate_gates.sh`
4. Confirm gates pass and scorecards are current
5. Commit with conventional commit message

### Non-Binding Content
Content without evidence pointers or UNVERIFIED labels is considered:
- Informational (not normative)
- Subject to change without notice
- Not validated by automated gates

**Recommendation**: Add evidence markers systematically to establish traceability (target: 100+ markers per `/docs/planning/refactoring/COMPLETION_SUMMARY.md`).
