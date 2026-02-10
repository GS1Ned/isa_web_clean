# ISA Development Guidelines

## Code Quality Standards

### TypeScript Conventions

**Strict Type Safety:**
- All code uses TypeScript with strict mode enabled
- Explicit return types for functions
- No `any` types unless absolutely necessary
- Use type inference where appropriate but prefer explicit types for public APIs

**Naming Conventions:**
- PascalCase for types, interfaces, classes, React components
- camelCase for variables, functions, methods
- UPPER_SNAKE_CASE for constants
- Prefix interfaces with descriptive names (no `I` prefix)
- Use descriptive names that convey intent

**File Organization:**
- One primary export per file
- Group related functionality in directories
- Use index files sparingly (explicit imports preferred)
- Separate types into dedicated type files when shared

### Documentation Standards

**JSDoc Comments:**
- All public functions and complex logic require JSDoc comments
- Include parameter descriptions and return types
- Document side effects and async behavior
- Example from codebase:
```typescript
/**
 * Advisory Report Export Service
 * Phase 1 Enhancement: Generate professional Markdown reports from analysis results
 */
```

**Inline Comments:**
- Use comments to explain "why" not "what"
- Step-by-step comments for complex workflows
- Example pattern from ask-isa.ts:
```typescript
// Step 1: Analyze query for ambiguity
// Step 2: Load conversation history if conversationId is provided
// Step 3: Build modular prompt using v2.0 system
```

**Section Dividers:**
- Use clear section dividers for major code blocks
- Example pattern:
```typescript
// =============================================================================
// TYPES
// =============================================================================

// =============================================================================
// CONSTANTS
// =============================================================================
```

### Code Structure Patterns

**Separation of Concerns:**
- Business logic in service modules (`server/services/`)
- Database operations in dedicated db files (`db-*.ts`)
- API endpoints in tRPC routers (`server/routers/`)
- UI components in component files (`client/src/components/`)

**Error Handling:**
- Always use try-catch for async operations
- Log errors with structured logging (serverLogger)
- Provide user-friendly error messages
- Example pattern:
```typescript
try {
  // operation
} catch (error) {
  serverLogger.error('[Context] Error message:', error);
  throw new Error('User-friendly message');
}
```

**Validation:**
- Use Zod schemas for input validation
- Validate at API boundaries (tRPC procedures)
- Validate business logic constraints in services
- Example pattern:
```typescript
.input(
  z.object({
    question: z.string().min(3).max(1000),
    conversationId: z.number().optional(),
  })
)
```

## Semantic Patterns

### tRPC Router Pattern

**Standard Router Structure:**
```typescript
export const routerName = router({
  procedureName: publicProcedure
    .input(z.object({ /* validation */ }))
    .query(async ({ input }) => {
      // implementation
    }),
  
  mutationName: protectedProcedure
    .input(z.object({ /* validation */ }))
    .mutation(async ({ input, ctx }) => {
      // implementation with auth context
    }),
});
```

**Key Characteristics:**
- Use `publicProcedure` for unauthenticated endpoints
- Use `protectedProcedure` for authenticated endpoints
- `.query()` for read operations
- `.mutation()` for write operations
- Always validate input with Zod schemas
- Access user context via `ctx.user` in protected procedures

### Database Access Pattern

**Drizzle ORM Usage:**
```typescript
const db = await getDb();
if (!db) throw new Error('Database not available');

const results = await db
  .select()
  .from(tableName)
  .where(eq(tableName.field, value))
  .limit(10);
```

**Key Characteristics:**
- Always check if db is available
- Use Drizzle query builder (no raw SQL unless necessary)
- Import operators from 'drizzle-orm' (eq, and, desc, sql)
- Use parameterized queries for safety
- Handle null/undefined results explicitly

### Logging Pattern

**Structured Logging:**
```typescript
import { serverLogger } from './utils/server-logger';

serverLogger.info('[Context] Operation description', { metadata });
serverLogger.warn('[Context] Warning message', details);
serverLogger.error('[Context] Error occurred:', error);
```

**Key Characteristics:**
- Always prefix with context in brackets: `[AskISA]`, `[EventProcessor]`
- Use appropriate log levels (info, warn, error)
- Include relevant metadata for debugging
- Never log sensitive data (passwords, tokens)

### React Component Pattern

**Functional Components with Hooks:**
```typescript
export default function ComponentName() {
  const [state, setState] = useState<Type>(initialValue);
  const { data, isLoading } = trpc.router.procedure.useQuery(input);
  
  const handleAction = () => {
    // event handler
  };
  
  return (
    <div className="space-y-6">
      {/* JSX */}
    </div>
  );
}
```

**Key Characteristics:**
- Use functional components (no class components)
- Hooks at top of component
- Event handlers defined before return
- Use tRPC hooks for API calls
- Tailwind CSS for styling
- shadcn/ui components for UI primitives

### AI/LLM Integration Pattern

**OpenAI API Calls:**
```typescript
const response = await invokeLLM({
  messages: [
    { role: 'system', content: 'System prompt...' },
    { role: 'user', content: 'User query...' }
  ],
  response_format: { type: 'json_schema', json_schema: { /* schema */ } }
});

const content = response.choices?.[0]?.message?.content;
const parsed = typeof content === 'string' ? JSON.parse(content) : null;
```

**Key Characteristics:**
- Use `invokeLLM` wrapper function
- Always provide system and user messages
- Use structured output with JSON schema when possible
- Handle null/undefined responses gracefully
- Parse JSON responses safely with try-catch
- Log LLM errors for debugging

### Data Validation Pattern

**Multi-Layer Validation:**
```typescript
// 1. Input validation (Zod at API boundary)
.input(z.object({ field: z.string().min(1) }))

// 2. Business logic validation
const validation = validateBusinessRules(data);
if (!validation.isValid) {
  return { error: validation.message };
}

// 3. Data integrity validation
const integrity = checkDataIntegrity(data);
if (!integrity.passed) {
  serverLogger.warn('[Context] Integrity check failed:', integrity.issues);
}
```

**Key Characteristics:**
- Validate at API boundaries with Zod
- Validate business rules in service layer
- Check data integrity before critical operations
- Return structured validation results
- Log validation failures for monitoring

## Internal API Usage

### tRPC Client Usage (Frontend)

**Query Pattern:**
```typescript
const { data, isLoading, error } = trpc.router.procedure.useQuery(
  input,
  { enabled: condition }
);
```

**Mutation Pattern:**
```typescript
const mutation = trpc.router.procedure.useMutation({
  onSuccess: (data) => {
    // handle success
  },
  onError: (error) => {
    // handle error
  }
});

mutation.mutate(input);
```

**Key Characteristics:**
- Use React Query hooks provided by tRPC
- Handle loading and error states
- Use `enabled` option for conditional queries
- Invalidate queries after mutations
- Access mutation state via `mutation.isLoading`, `mutation.error`

### Database Helper Functions

**Common Patterns:**
```typescript
// Get single record
export async function getRecordById(id: number): Promise<Record | null> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const results = await db.select().from(table).where(eq(table.id, id)).limit(1);
  return results[0] || null;
}

// List records with pagination
export async function listRecords(limit: number = 20): Promise<Record[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return await db.select().from(table).limit(limit).orderBy(desc(table.createdAt));
}

// Create record
export async function createRecord(data: InsertRecord): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(table).values(data);
  return Number(result[0].insertId);
}
```

### Utility Functions

**Common Utilities:**
- `cn()` from `@/lib/utils` - Merge Tailwind classes
- `serverLogger` - Structured logging
- `invokeLLM()` - OpenAI API wrapper
- `getDb()` - Database connection
- `prepareContentForEmbedding()` - Content preparation for embeddings

## Code Idioms

### Conditional Rendering (React)

```typescript
{isLoading && <Skeleton />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}
{!data && !isLoading && <EmptyState />}
```

### Array Processing

```typescript
// Map with type safety
const mapped = items.map((item) => ({
  id: item.id,
  name: item.name,
}));

// Filter with type guards
const filtered = items.filter((item): item is ValidType => 
  item.field !== null && item.field !== undefined
);

// Reduce for aggregation
const aggregated = items.reduce((acc, item) => {
  acc[item.key] = (acc[item.key] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
```

### Async/Await Patterns

```typescript
// Sequential operations
const step1 = await operation1();
const step2 = await operation2(step1);
const step3 = await operation3(step2);

// Parallel operations
const [result1, result2, result3] = await Promise.all([
  operation1(),
  operation2(),
  operation3(),
]);

// Error handling with fallback
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  serverLogger.error('[Context] Operation failed:', error);
  return fallbackValue;
}
```

### Type Guards

```typescript
// Type narrowing
if (typeof value === 'string') {
  // value is string here
}

// Null/undefined checks
if (value !== null && value !== undefined) {
  // value is non-nullable here
}

// Array type guard
if (Array.isArray(value) && value.length > 0) {
  // value is non-empty array
}
```

## Frequently Used Annotations

### TypeScript Utility Types

```typescript
// Partial - make all properties optional
type PartialUser = Partial<User>;

// Pick - select specific properties
type UserCredentials = Pick<User, 'email' | 'password'>;

// Omit - exclude specific properties
type UserWithoutPassword = Omit<User, 'password'>;

// Record - key-value mapping
type UserMap = Record<string, User>;

// Array element type
type ArrayElement<T> = T extends (infer U)[] ? U : never;
```

### React Types

```typescript
// Component props
interface ComponentProps {
  title: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

// Event handlers
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  // handler
};

// Ref types
const inputRef = React.useRef<HTMLInputElement>(null);
```

### Zod Schema Patterns

```typescript
// Basic validation
z.string().min(1).max(100)
z.number().int().positive()
z.boolean()
z.array(z.string())
z.enum(['option1', 'option2'])

// Optional fields
z.string().optional()
z.number().nullable()
z.string().default('default value')

// Object schemas
z.object({
  required: z.string(),
  optional: z.number().optional(),
  nested: z.object({
    field: z.string()
  })
})

// Union types
z.union([z.string(), z.number()])
z.discriminatedUnion('type', [
  z.object({ type: z.literal('a'), value: z.string() }),
  z.object({ type: z.literal('b'), value: z.number() })
])
```

## Best Practices

### Performance

- Use React.memo for expensive components
- Implement pagination for large datasets
- Use database indexes for frequent queries
- Cache expensive computations
- Lazy load routes and components
- Optimize images and assets

### Security

- Never expose API keys in client code
- Validate all user input
- Use parameterized queries (Drizzle ORM)
- Implement rate limiting on sensitive endpoints
- Use HTTPS in production
- Sanitize user-generated content

### Testing

- Write unit tests for business logic
- Test error handling paths
- Mock external dependencies (database, APIs)
- Use Vitest for testing
- Test edge cases and boundary conditions
- Maintain test coverage above 80%

### Accessibility

- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation works
- Use ARIA labels where needed
- Test with screen readers
- Maintain color contrast ratios

### Code Review

- Keep pull requests focused and small
- Write descriptive commit messages
- Follow conventional commit format
- Include tests with code changes
- Update documentation when needed
- Request reviews from CODEOWNERS

## Governance Compliance

### Lane C Requirements

**Before Making Changes:**
1. Read `docs/governance/_root/ISA_GOVERNANCE.md`
2. Identify if change triggers Lane C escalation
3. Follow mandatory escalation format if required
4. Document decision rationale

**Lane C Triggers:**
- Schema changes affecting data integrity
- New data sources or ingestion pipelines
- Changes to AI prompts or mapping logic
- Advisory report generation or publication
- Governance framework modifications
- External integrations or API exposure

**Escalation Format:**
```markdown
## Lane C Escalation Required

**Change Type:** [Schema/Data Source/AI Prompt/etc.]
**Impact:** [Description of impact]
**Rationale:** [Why this change is needed]
**Alternatives Considered:** [Other options]
**Rollback Plan:** [How to revert if needed]
```

### Data Integrity

**All Datasets Must Include:**
- Source (publisher, URL)
- Version (semantic versioning)
- Release date
- Last verified date
- SHA256 checksum
- Lineage (how data was obtained)
- Ingestion method

**Citation Requirements:**
- All AI-generated content must include citations
- Citations must reference specific sources
- Sources must be traceable to authoritative documents
- Include confidence scores for AI-generated content

### Version Control

**Commit Message Format:**
```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build/tooling changes
- `data`: Dataset updates

**Example:**
```
feat: add EUDR geolocation validation

Implement geolocation validation for EUDR compliance.
Validates plot coordinates against deforestation risk data.

Closes #123
```

## Common Pitfalls to Avoid

1. **Don't use `any` type** - Use `unknown` and type guards instead
2. **Don't mutate state directly** - Use setState or immutable updates
3. **Don't forget error handling** - Always handle async errors
4. **Don't skip input validation** - Validate at API boundaries
5. **Don't log sensitive data** - Sanitize logs
6. **Don't hardcode values** - Use constants or environment variables
7. **Don't skip database null checks** - Always check if db is available
8. **Don't ignore TypeScript errors** - Fix them, don't suppress
9. **Don't skip governance checks** - Follow Lane C requirements
10. **Don't commit without testing** - Run tests before committing
