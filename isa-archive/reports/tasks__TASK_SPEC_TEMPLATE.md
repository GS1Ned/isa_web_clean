# CGPT-XX: [Task Name]

**Priority:** [HIGH | MEDIUM | LOW]  
**Complexity:** [LOW | MEDIUM | HIGH]  
**Estimated Effort:** [X-Y hours]  
**Dependencies:** [None | CGPT-XX, CGPT-YY]  
**Risk Level:** [LOW | MEDIUM | HIGH]

---

## Context

[2-3 paragraphs explaining why this task is needed, how it fits into ISA, and what problem it solves]

---

## Environment Context

**React Version:** 19.2.0 (requires explicit `import React from "react"` in all .tsx files)  
**TypeScript:** 5.x (strict mode enabled)  
**Testing:** Vitest + @testing-library/react (already installed)  
**UI Library:** shadcn/ui components (use existing, don't recreate)  
**Backend:** tRPC v11 (use `trpc.*.useQuery/useMutation` patterns)  
**Database:** Drizzle ORM with TiDB (MySQL-compatible)  
**Styling:** Tailwind CSS 4 (utility-first, use existing design tokens)

**Already Installed Dependencies:**
- react, react-dom
- @tanstack/react-query
- date-fns
- lucide-react
- zod

**NOT Installed (don't use without asking):**
- moment.js, lodash, axios, etc.

---

## Exact Task

[Single paragraph describing exactly what needs to be built]

---

## Technical Specification

### Files to Create

1. **`/path/to/file1.ts`** - [Description]
2. **`/path/to/file2.ts`** - [Description]
3. **`/path/to/README.md`** - Usage documentation

### API / Interface

```typescript
// Define exact function signatures, types, and interfaces here
```

### Implementation Requirements

- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

### Example Usage

```typescript
// Show how the code will be used in ISA
```

---

## Constraints and Conventions

### Code Style

- Use TypeScript strict mode
- Follow existing naming conventions (PascalCase for components, camelCase for functions)
- Add JSDoc comments for exported functions
- Use `const` over `let` where possible

### Testing

- Write unit tests with Vitest
- Test happy path + error cases
- Aim for >80% coverage
- Use descriptive test names

### Documentation

- Include README.md with usage examples
- Document all public APIs
- Add troubleshooting section if applicable

---

## Acceptance Criteria

- [ ] All files created as specified
- [ ] TypeScript compiles without errors
- [ ] Tests pass with >80% coverage
- [ ] README includes usage examples
- [ ] Code follows project conventions
- [ ] No external dependencies beyond spec

---

## Pre-Delivery Checklist

Before submitting your work, verify:

- [ ] All files include necessary imports (especially `import React` in .tsx files)
- [ ] No dependencies used beyond "Already Installed" list
- [ ] TypeScript compiles: `tsc --noEmit`
- [ ] Tests run: `vitest run [your-test-file]`
- [ ] README is complete and accurate

---

## Related Files

[List existing files that provide context or patterns to follow]

- `path/to/related/file1.ts` - Similar pattern
- `path/to/related/file2.ts` - Reference implementation

---

## Notes

[Any additional context, gotchas, or suggestions]
