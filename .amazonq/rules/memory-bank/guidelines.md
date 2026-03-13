# ISA Development Guidelines

## Code Quality Standards

### File Headers and Documentation
- Every file starts with a JSDoc comment block explaining its purpose
- Include use cases, performance characteristics, and key features
- Example: "RAG-powered Q&A system using LLM-based semantic matching"
- Document API costs and performance optimizations where relevant

### TypeScript Standards
- Strict TypeScript with explicit types for all function parameters and returns
- Use interface definitions for complex data structures
- Export types alongside implementation for reusability
- Prefer type safety over any types

### Naming Conventions
- **Files:** kebab-case (e.g., `advisory-report-export.ts`, `ask-isa-guardrails.ts`)
- **Functions:** camelCase with descriptive verbs (e.g., `generateEmbedding`, `verifyResponseClaims`)
- **Types/Interfaces:** PascalCase (e.g., `EmbeddingResult`, `GoldenSetTestCase`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `EMBEDDING_MODEL`, `BATCH_SIZE`)
- **Private variables:** Prefix with underscore (e.g., `_selectedFruits`)

### Code Organization
- Group related functionality into sections with comment separators
- Use `// =============================================================================` for major sections
- Organize imports by category: external libraries, internal modules, types
- Place type definitions at the top of files before implementation

## Semantic Patterns

### Error Handling Pattern
```typescript
try {
  // Operation
  const result = await someOperation();
  return result;
} catch (error) {
  serverLogger.error('[Context] Error message:', error);
  throw new Error('User-friendly error message');
}
```

### Logging Pattern
- Use structured logging with context prefixes: `[AskISA]`, `[Advisory]`
- Log at appropriate levels: info for flow, warn for issues, error for failures
- Include relevant data in log messages for debugging
- Example: `serverLogger.info('[AskISA] Query is ambiguous (score: ${score}), returning clarifications')`

### Validation Pattern
- Validate inputs early with Zod schemas in tRPC procedures
- Use guard clauses to handle edge cases first
- Return early for invalid states
- Provide clear error messages

### Async/Await Pattern
- Always use async/await over promises
- Handle errors with try/catch blocks
- Use Promise.all for parallel operations
- Avoid nested callbacks

## tRPC Router Patterns

### Router Definition
```typescript
export const routerName = router({
  procedureName: publicProcedure
    .input(z.object({ /* schema */ }))
    .mutation(async ({ input, ctx }) => {
      // Implementation
    }),
});
```

### Input Validation
- Use Zod for all input validation
- Define schemas inline or import from shared types
- Use `.min()`, `.max()`, `.optional()`, `.default()` for constraints
- Validate enums with `.enum([...])` for type safety

### Procedure Types
- `publicProcedure` - No authentication required
- `protectedProcedure` - Requires authenticated user (ctx.user available)
- Use `.query()` for read operations
- Use `.mutation()` for write operations

### Context Usage
- Access user from `ctx.user` in protected procedures
- Check user role with `ctx.user.role === 'admin'`
- Throw errors for unauthorized access

## Database Patterns

### Query Pattern
```typescript
const { getDb } = await import('../db');
const db = await getDb();
if (!db) throw new Error('Database not available');

const { tableName } = await import('../../drizzle/schema');
const results = await db.select().from(tableName).where(...);
```

### Transaction Pattern
- Use database transactions for multi-step operations
- Rollback on errors
- Keep transactions short and focused

### Error Handling
- Always check if database connection exists
- Provide meaningful error messages
- Log database errors with context

## Frontend Component Patterns

### Component Structure
```typescript
export default function ComponentName() {
  // State declarations
  const [state, setState] = useState(initialValue);
  
  // Hooks
  const { data } = trpc.router.procedure.useQuery();
  
  // Event handlers
  const handleEvent = () => {
    // Implementation
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### State Management
- Use useState for local component state
- Use React Query (via tRPC) for server state
- Use context for global state (theme, auth)
- Avoid prop drilling - use context or composition

### Event Handlers
- Prefix with `handle` (e.g., `handleSubmit`, `handleClick`)
- Define handlers before render
- Use arrow functions for inline handlers
- Prevent default behavior when needed

### Styling
- Use Tailwind CSS utility classes
- Use shadcn/ui components for consistency
- Follow responsive design patterns (mobile-first)
- Use semantic color classes (e.g., `text-muted-foreground`, `bg-primary`)

## AI/LLM Integration Patterns

### Prompt Assembly
- Use modular prompt systems with clear sections
- Include context, instructions, and constraints
- Document prompt versions (e.g., `v2_modular`)
- Validate responses programmatically

### Embedding Generation
- Use batch operations for multiple texts
- Truncate text to max length before embedding
- Handle API errors gracefully
- Track token usage for cost monitoring

### RAG Pattern
```typescript
// 1. Retrieve relevant context
const results = await hybridSearch(query, options);

// 2. Build prompt with context
const prompt = assemblePrompt({ question, relevantChunks: results });

// 3. Generate response
const response = await invokeLLM({ messages: [{ role: 'user', content: prompt }] });

// 4. Validate and verify
const verification = verifyResponse(response, results);

// 5. Return with citations
return { answer: response, sources: results, verification };
```

### Citation Tracking
- Always include source citations in responses
- Validate citation format and provenance
- Track authority levels of sources
- Verify claims against source material

## Testing Patterns

### Test Structure
```typescript
describe('Feature Name', () => {
  it('should do something specific', async () => {
    // Arrange
    const input = setupTestData();
    
    // Act
    const result = await functionUnderTest(input);
    
    // Assert
    expect(result).toBe(expectedValue);
  });
});
```

### Test Organization
- Group related tests with describe blocks
- Use descriptive test names starting with "should"
- Follow Arrange-Act-Assert pattern
- Test edge cases and error conditions

### Mocking
- Mock external dependencies (API calls, database)
- Use test helpers for common mocks
- Avoid over-mocking - test real behavior when possible

## Performance Patterns

### Batch Operations
- Batch API calls when possible (embeddings, database queries)
- Use optimal batch sizes (e.g., 100 for embeddings)
- Report progress for long-running operations
- Handle partial failures gracefully

### Caching
- Cache expensive operations (embeddings, API responses)
- Implement cache invalidation strategies
- Track cache hit rates for monitoring
- Clean up expired entries periodically

### Database Optimization
- Use indexes for frequently queried columns
- Limit result sets with `.limit()`
- Use pagination for large datasets
- Avoid N+1 queries with joins

## Security Patterns

### Input Sanitization
- Validate all user inputs with Zod
- Sanitize HTML content before rendering
- Escape SQL queries (handled by Drizzle ORM)
- Validate file uploads

### Authentication
- Check authentication in protected procedures
- Verify user roles for admin operations
- Use secure session management
- Never expose sensitive data in responses

### API Keys
- Store API keys in environment variables
- Never commit keys to version control
- Validate key presence before use
- Rotate keys regularly

## Observability Patterns

### Tracing
- Use RagTraceManager for RAG operations
- Record retrieval, generation, and verification steps
- Track latency and quality metrics
- Complete traces even on errors

### Metrics
- Calculate quality metrics (traceability, diversity)
- Track confidence scores
- Monitor cache hit rates
- Log performance statistics

### Error Classification
- Classify errors by type (abstention, failure)
- Record error context and stack traces
- Track error rates by category
- Alert on critical errors

## Data Patterns

### Provenance Tracking
- Include source, version, and verification date for all data
- Track lineage and transformations
- Document ingestion methods
- Maintain checksums for integrity

### Versioning
- Version all datasets and reports
- Use semantic versioning (v1.0, v1.1)
- Compute diffs between versions
- Archive old versions

### Validation
- Validate data against JSON schemas
- Check completeness and consistency
- Verify references and citations
- Report validation errors clearly

## Common Idioms

### Optional Chaining
```typescript
const value = object?.property?.nestedProperty ?? defaultValue;
```

### Array Operations
```typescript
// Map with type safety
const mapped = items.map(item => ({ id: item.id, name: item.name }));

// Filter with type guards
const filtered = items.filter((item): item is ValidType => item.isValid);

// Reduce for aggregation
const sum = items.reduce((acc, item) => acc + item.value, 0);
```

### Conditional Rendering
```typescript
// Short-circuit evaluation
{condition && <Component />}

// Ternary operator
{condition ? <ComponentA /> : <ComponentB />}

// Nullish coalescing
{value ?? <DefaultComponent />}
```

### Destructuring
```typescript
// Object destructuring with defaults
const { prop1, prop2 = defaultValue } = object;

// Array destructuring
const [first, second, ...rest] = array;

// Function parameter destructuring
function handler({ input, ctx }: { input: Input; ctx: Context }) {
  // Implementation
}
```

## Governance Patterns

### Documentation Requirements
- Document all critical changes in decision logs
- Include rationale and alternatives considered
- Reference governance framework for major changes
- Update evidence markers when modifying features

### Code Review
- Follow conventional commit format (feat, fix, docs, etc.)
- Include governance checklist in PRs
- Ensure tests pass before merging
- Update documentation with code changes

### Quality Gates
- Run all tests before committing
- Check TypeScript compilation
- Validate schemas and contracts
- Verify governance compliance

## Anti-Patterns to Avoid

### Don't
- Use `any` type without justification
- Ignore TypeScript errors
- Skip error handling
- Commit commented-out code
- Use magic numbers (define constants)
- Nest callbacks deeply
- Mutate props or state directly
- Skip input validation
- Log sensitive data
- Hard-code configuration values

### Do
- Use explicit types
- Handle all error cases
- Write self-documenting code
- Remove dead code
- Define named constants
- Use async/await
- Treat data as immutable
- Validate all inputs
- Sanitize logs
- Use environment variables

## Code Review Checklist

Before submitting code for review:
- [ ] All TypeScript types are explicit
- [ ] Error handling is comprehensive
- [ ] Logging includes appropriate context
- [ ] Input validation uses Zod schemas
- [ ] Tests cover new functionality
- [ ] Documentation is updated
- [ ] No sensitive data in logs or code
- [ ] Performance considerations addressed
- [ ] Security best practices followed
- [ ] Governance requirements met
