# ISA Development Guidelines

## Code Quality Standards

### TypeScript Conventions
- **Strict Type Safety:** All code uses TypeScript 5.9.3 with strict mode enabled
- **Type Exports:** Database schema types exported from `drizzle/schema.ts` using `$inferSelect` and `$inferInsert`
- **Enum Usage:** MySQL enums defined in schema, TypeScript enums avoided in favor of string literal unions
- **Null Handling:** Explicit null checks, optional chaining (`?.`), and nullish coalescing (`??`) used throughout

### Naming Conventions
- **Database Tables:** Snake_case (e.g., `advisory_reports`, `gs1_esrs_mappings`)
- **TypeScript Variables:** camelCase (e.g., `regulationId`, `datasetVersion`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `COOKIE_NAME`, `REPO_ROOT`)
- **Types/Interfaces:** PascalCase (e.g., `RagTrace`, `AskISAContextParams`)
- **Files:** Kebab-case for modules (e.g., `ask-isa-guardrails.ts`), PascalCase for components

### Code Organization
- **Modular Structure:** Related functionality grouped in dedicated directories (`/routers`, `/services`, `/prompts`)
- **Separation of Concerns:** Database operations in `db-*.ts` files, business logic in services, API routes in routers
- **Index Files:** Service directories use `index.ts` as main export point
- **Co-location:** Test files (`*.test.ts`) placed alongside source files

### Documentation Standards
- **JSDoc Comments:** All public functions and complex logic documented with JSDoc
- **Inline Comments:** Explain "why" not "what" - focus on business logic and constraints
- **Type Documentation:** Complex types include description comments
- **File Headers:** Service files include purpose and context comments

## Database Patterns

### Schema Design
- **Drizzle ORM:** All database operations use Drizzle ORM with type-safe queries
- **Auto-increment IDs:** Primary keys use `int().autoincrement().notNull()`
- **Timestamps:** `createdAt` and `updatedAt` columns with automatic defaults
- **JSON Columns:** Complex data stored as JSON with proper TypeScript typing
- **Indexes:** Strategic indexes on foreign keys, search columns, and filter columns

### Query Patterns
```typescript
// Standard select with filter
const results = await db
  .select()
  .from(tableName)
  .where(eq(tableName.column, value))
  .limit(limit);

// Join pattern
const results = await db
  .select()
  .from(table1)
  .leftJoin(table2, eq(table1.id, table2.foreignKey));

// Aggregation pattern
const stats = await db
  .select({ count: sql<number>`count(*)` })
  .from(tableName)
  .where(conditions);
```

### Migration Strategy
- **Version Control:** All migrations tracked in `drizzle/meta/_journal.json`
- **Naming:** Descriptive migration names (e.g., `0015_ultimate_dataset_registry.sql`)
- **Reversibility:** Migrations designed to be reversible where possible
- **Testing:** Migrations tested in development before production deployment

## API Design Patterns

### tRPC Router Structure
```typescript
export const routerName = router({
  // Public procedures - no authentication required
  publicEndpoint: publicProcedure
    .input(z.object({ ... }))
    .query(async ({ input }) => { ... }),
  
  // Protected procedures - authentication required
  protectedEndpoint: protectedProcedure
    .input(z.object({ ... }))
    .mutation(async ({ ctx, input }) => { ... }),
});
```

### Input Validation
- **Zod Schemas:** All inputs validated with Zod schemas
- **Type Inference:** Input types inferred from Zod schemas
- **Validation Rules:** Min/max lengths, enums, optional fields clearly defined
- **Error Messages:** Descriptive validation error messages

### Error Handling
```typescript
try {
  // Operation
  return { success: true, data };
} catch (error) {
  serverLogger.error('[Context] Operation failed:', error);
  throw new TRPCError({ 
    code: 'INTERNAL_SERVER_ERROR',
    message: 'User-friendly error message'
  });
}
```

### Response Patterns
- **Consistent Structure:** Success responses include `success: boolean` flag
- **Pagination:** List endpoints support `page`, `pageSize`, `limit` parameters
- **Metadata:** Responses include relevant metadata (total count, page info)
- **Null Safety:** Explicit null returns instead of throwing for "not found" cases

## Service Layer Patterns

### Service Organization
- **Single Responsibility:** Each service handles one domain area
- **Dependency Injection:** Services receive dependencies as parameters
- **Stateless:** Services are stateless, state managed in database
- **Composability:** Services can call other services

### RAG Pipeline Pattern
```typescript
// 1. Initialize trace for observability
const trace = await RagTraceManager.start({ query, userId });

try {
  // 2. Retrieve relevant documents
  const results = await hybridSearch(query, options);
  trace.recordRetrieval(results, latencyMs);
  
  // 3. Analyze evidence sufficiency
  const analysis = analyzeEvidenceSufficiency(results);
  if (!analysis.isSufficient) {
    trace.recordAbstention(analysis.abstentionReason);
    return abstentionResponse;
  }
  
  // 4. Generate answer with LLM
  const answer = await invokeLLM({ messages });
  trace.recordGeneration(answer, citations, latencyMs);
  
  // 5. Verify and validate
  const verification = verifyResponse(answer, results);
  trace.setVerificationStatus(verification.status);
  
  // 6. Complete trace
  await trace.complete();
  
  return response;
} catch (error) {
  trace.recordError(error);
  await trace.complete();
  throw error;
}
```

### Observability Pattern
- **Structured Logging:** Use `serverLogger` with context prefixes
- **Trace IDs:** Generate unique trace IDs for request tracking
- **Metrics Collection:** Record latency, success rates, error rates
- **Error Classification:** Categorize errors for better debugging

## Frontend Patterns

### Component Structure
- **Functional Components:** All components use React functional components with hooks
- **TypeScript Props:** Props interfaces defined with TypeScript
- **Composition:** Prefer composition over inheritance
- **Hooks:** Custom hooks for reusable logic

### State Management
- **TanStack Query:** Server state managed with TanStack Query (React Query)
- **tRPC Client:** Type-safe API calls with tRPC client
- **Local State:** Component state with `useState` for UI-only state
- **Context:** React Context for cross-cutting concerns (auth, theme)

### Styling Patterns
- **Tailwind CSS:** Utility-first styling with Tailwind CSS 4
- **shadcn/ui:** Reusable components from shadcn/ui library
- **Responsive Design:** Mobile-first responsive design
- **Dark Mode:** Theme support with `next-themes`

## Testing Patterns

### Test Organization
- **Vitest Framework:** All tests use Vitest
- **Co-location:** Test files next to source files
- **Naming:** `*.test.ts` for unit tests, `*-integration.test.ts` for integration tests
- **Coverage:** Aim for 80%+ coverage on critical paths

### Test Structure
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('FeatureName', () => {
  beforeEach(() => {
    // Setup
  });
  
  afterEach(() => {
    // Cleanup
  });
  
  it('should handle expected case', async () => {
    // Arrange
    const input = { ... };
    
    // Act
    const result = await functionUnderTest(input);
    
    // Assert
    expect(result).toEqual(expectedOutput);
  });
  
  it('should handle error case', async () => {
    // Test error handling
  });
});
```

### Mocking Strategy
- **Database Mocks:** Mock database calls in unit tests
- **API Mocks:** Mock external API calls
- **Test Helpers:** Reusable test utilities in `/test-helpers`
- **Integration Tests:** Use real database for integration tests

## Data Processing Patterns

### Python Scripts
- **Shebang:** All scripts start with `#!/usr/bin/env python3`
- **Docstrings:** Module-level docstrings explain purpose and constraints
- **Type Hints:** Use type hints for function parameters and returns
- **Error Handling:** Explicit error handling with try/except
- **Path Handling:** Use `pathlib.Path` for file operations

### Data Extraction Pattern
```python
# Detect repo root
REPO_ROOT = Path(__file__).resolve().parent.parent

# Define data structure
data = {
    "id": "unique_id",
    "version": "1.0.0",
    "metadata": { ... },
    "items": []
}

# Process and validate
for item in source_items:
    processed = process_item(item)
    data["items"].append(processed)

# Write output
output_path = REPO_ROOT / "data/output.json"
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
```

## Governance Patterns

### Evidence Markers
- **Format:** `<!-- EVIDENCE:type:path -->`
- **Types:** `requirement`, `implementation`, `decision`, `test`
- **Placement:** Inline in markdown documentation
- **Traceability:** Links documentation to code/data

### Version Control
- **Conventional Commits:** Use conventional commit format (feat, fix, docs, etc.)
- **Branch Strategy:** Feature branches from main, PR-based workflow
- **Commit Messages:** Descriptive messages with context
- **Atomic Commits:** One logical change per commit

### Dataset Provenance
- **Registry:** All datasets registered in `data/metadata/dataset_registry.json`
- **Metadata:** Include source, version, verification date, checksums
- **Immutability:** Frozen datasets marked with version locks
- **Citations:** All data usage includes source citations

## Security Patterns

### Authentication
- **Manus OAuth:** OAuth-based authentication via Manus
- **JWT Tokens:** Session tokens stored in secure cookies
- **Role-Based Access:** Admin vs user role checks
- **Protected Routes:** tRPC `protectedProcedure` for authenticated endpoints

### Data Protection
- **Environment Variables:** Sensitive data in `.env` (not committed)
- **Input Sanitization:** All user inputs validated and sanitized
- **SQL Injection Prevention:** Parameterized queries via Drizzle ORM
- **XSS Prevention:** React automatic escaping, CSP headers

### API Security
- **Rate Limiting:** Express rate limit middleware
- **CORS:** Configured for Manus hosting environment
- **Helmet:** Security headers via Helmet middleware
- **HTTPS Only:** Production requires HTTPS

## Performance Patterns

### Optimization Strategies
- **Lazy Loading:** Dynamic imports for large modules
- **Caching:** Response caching for expensive operations
- **Pagination:** All list endpoints support pagination
- **Indexing:** Database indexes on frequently queried columns

### Query Optimization
- **Limit Results:** Always use `.limit()` on queries
- **Select Specific Columns:** Avoid `SELECT *` when possible
- **Batch Operations:** Batch inserts/updates when processing multiple items
- **Connection Pooling:** MySQL connection pooling configured

### Frontend Performance
- **Code Splitting:** Vite automatic code splitting
- **Tree Shaking:** Unused code eliminated in production builds
- **Asset Optimization:** Images optimized, lazy loaded
- **Bundle Size:** Monitor bundle size, keep under 500KB initial load

## AI/ML Integration Patterns

### LLM Usage
- **Prompt Engineering:** Structured prompts with clear instructions
- **Context Management:** Limit context to relevant information
- **Error Handling:** Graceful degradation on LLM failures
- **Cost Monitoring:** Track token usage and costs

### RAG Pipeline
- **Hybrid Search:** Combine vector search (semantic) with BM25 (keyword)
- **Evidence Analysis:** Validate evidence sufficiency before generation
- **Citation Validation:** Verify all citations against source documents
- **Abstention Policy:** Refuse to answer when evidence is insufficient

### Quality Assurance
- **Claim Verification:** Verify factual claims against sources
- **Confidence Scoring:** Calculate confidence based on evidence quality
- **Authority Scoring:** Weight sources by authority level
- **Traceability:** Track all data lineage from source to output

## Common Code Idioms

### Async/Await Pattern
```typescript
// Always use async/await, not .then()
async function fetchData() {
  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    serverLogger.error('Fetch failed:', error);
    throw error;
  }
}
```

### Optional Chaining
```typescript
// Safe property access
const value = object?.property?.nestedProperty ?? defaultValue;

// Safe array access
const firstItem = array?.[0];
```

### Array Operations
```typescript
// Map for transformation
const transformed = items.map(item => ({ ...item, newField: value }));

// Filter for selection
const filtered = items.filter(item => item.status === 'active');

// Reduce for aggregation
const sum = items.reduce((acc, item) => acc + item.value, 0);
```

### Object Destructuring
```typescript
// Function parameters
function processData({ id, name, options = {} }: DataInput) { ... }

// Variable assignment
const { data, error } = await fetchData();
```

### Template Literals
```typescript
// String interpolation
const message = `User ${userId} performed action ${action}`;

// Multi-line strings
const query = `
  SELECT * FROM table
  WHERE condition = true
  ORDER BY created_at DESC
`;
```

## Frequently Used Annotations

### TypeScript Annotations
```typescript
// Type assertion
const value = data as ExpectedType;

// Non-null assertion (use sparingly)
const definitelyExists = maybeExists!;

// Type guard
if (typeof value === 'string') { ... }

// Generic constraints
function process<T extends BaseType>(item: T): T { ... }
```

### JSDoc Annotations
```typescript
/**
 * Process user data and return formatted result
 * @param userId - The user's unique identifier
 * @param options - Processing options
 * @returns Formatted user data
 * @throws {Error} If user not found
 */
async function processUser(userId: number, options?: Options): Promise<UserData> { ... }
```

### Drizzle ORM Annotations
```typescript
// Table definition with indexes
export const tableName = mysqlTable("table_name", {
  id: int().autoincrement().notNull(),
  name: varchar({ length: 255 }).notNull(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
  index("name_idx").on(table.name),
]);
```

## Development Workflow

### Local Development
1. Start dev server: `pnpm dev`
2. Run tests: `pnpm test` or `pnpm test --watch`
3. Type check: `pnpm check`
4. Format code: `pnpm format`

### Code Review Checklist
- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] Code follows naming conventions
- [ ] Functions have JSDoc comments
- [ ] Error handling implemented
- [ ] Logging added for debugging
- [ ] No sensitive data in code
- [ ] Database queries optimized
- [ ] API inputs validated
- [ ] Governance requirements met

### Deployment Process
1. Create feature branch
2. Implement changes with tests
3. Run full test suite
4. Commit with conventional commit message
5. Push to GitHub
6. Open pull request
7. Address review feedback
8. Merge after approval
9. Deploy to production

## Anti-Patterns to Avoid

### Code Smells
- ❌ Large functions (>100 lines) - break into smaller functions
- ❌ Deep nesting (>3 levels) - extract to functions
- ❌ Magic numbers - use named constants
- ❌ Commented-out code - delete it (Git history preserves it)
- ❌ Console.log in production - use serverLogger

### Database Anti-Patterns
- ❌ N+1 queries - use joins or batch queries
- ❌ Missing indexes on foreign keys
- ❌ SELECT * in production code
- ❌ Unparameterized queries (SQL injection risk)
- ❌ Missing error handling on database operations

### API Anti-Patterns
- ❌ Unvalidated inputs
- ❌ Exposing internal errors to users
- ❌ Missing rate limiting on expensive operations
- ❌ Inconsistent response formats
- ❌ Missing pagination on list endpoints

### React Anti-Patterns
- ❌ Prop drilling (use Context or state management)
- ❌ Inline function definitions in JSX (causes re-renders)
- ❌ Missing keys in lists
- ❌ Mutating state directly
- ❌ Side effects in render functions
