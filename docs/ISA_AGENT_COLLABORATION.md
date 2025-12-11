# ISA Agent Collaboration Architecture

**Version:** 1.0  
**Last Updated:** December 11, 2025  
**Primary Agent:** Manus (development environment owner)  
**External Agent:** ChatGPT (delegated module developer)

---

## Purpose

This document defines the collaboration model between Manus (the primary development agent with full environment access) and ChatGPT (an external assistant without direct workspace access). The goal is to maximize safe, efficient parallel development while maintaining project integrity and minimizing integration friction.

---

## 1. Ownership and Boundaries

### 1.1 Manus Owns (HIGH-RISK - Do Not Delegate)

**Infrastructure and Deployment:**

- `/server/_core/` - Authentication, OAuth, context, environment config
- `drizzle.config.ts` - Database connection configuration
- `.env` files and environment secrets management
- CI/CD configuration and deployment workflows
- Manus platform integration (`vite-plugin-manus-runtime`)

**Database Migrations:**

- `/drizzle/` - Schema definitions and migration files
- `server/db.ts` - Core database connection and query helpers
- Any schema changes that affect production data integrity

**Critical Runtime Integration:**

- `server/routers.ts` - Main tRPC router (procedure registration)
- `server/_core/index.ts` - Express server entry point
- `client/src/App.tsx` - Main route configuration
- `client/src/main.tsx` - React application entry point

**Sensitive Operations:**

- Cron job schedulers with production credentials
- Email notification systems with API keys
- S3 storage operations with credentials
- LLM API calls requiring secret keys

### 1.2 ChatGPT Can Own (LOW-RISK - Delegable Zones)

**Self-Contained Modules:**

- `/server/routers/` - New tRPC sub-routers (not the main `routers.ts`)
- `/server/mappings/` - Mapping logic and transformation functions
- `/server/validation/` - Validation rules and helper libraries
- `/server/utils/` - Pure utility functions without side effects

**UI Components and Pages:**

- `/client/src/components/` - Reusable UI components
- `/client/src/pages/` - New page components (routes registered by Manus)
- `/client/src/hooks/` - Custom React hooks
- `/client/src/lib/` - Frontend utility libraries

**Data Models and Schemas:**

- `/shared/types/` - TypeScript interfaces and types
- `/shared/schemas/` - Zod validation schemas
- `/shared/constants/` - Configuration constants and enums

**Documentation:**

- `/docs/` - Architecture docs, guides, API documentation
- `/tasks/` - Task specifications and work plans
- Inline code documentation and JSDoc comments

**Test Suites:**

- `*.test.ts` files - Unit tests and integration tests
- `/server/__fixtures__/` - Test data and fixtures
- Test utilities and mock generators

**Data and Configuration:**

- `/data/` - Static data files (JSON, CSV, mapping tables)
- Configuration files for linting, formatting, testing (when specified)

### 1.3 Restricted Areas (ChatGPT Must Not Touch)

- `/infra/` - Infrastructure as code
- `/secrets/` - Any files containing credentials
- `/db/migrations/` - Generated migration files
- `package.json` - Dependency management (Manus controls)
- `pnpm-lock.yaml` - Lock file (Manus controls)
- `.env*` files - Environment configuration

---

## 2. Interface and Contract Management

### 2.1 Canonical Types and APIs

**Manus defines and owns:**

- `/drizzle/schema.ts` - Database table definitions
- `/shared/interfaces.ts` - Core domain interfaces
- `/server/routers.ts` - tRPC procedure contracts

**Version Control:**

- Any changes to shared interfaces must be documented in `docs/CHANGELOG_FOR_CHATGPT.md`
- Manus will freeze interface versions before delegating dependent tasks
- ChatGPT must implement against the specified interface version

### 2.2 Stable Contracts for Delegation

Before delegating a task, Manus will:

1. **Define the interface** - Create TypeScript types/interfaces for inputs/outputs
2. **Document the contract** - Write clear JSDoc comments and examples
3. **Freeze the version** - Tag the interface version in the task spec
4. **Provide examples** - Include 2-3 realistic input/output examples

ChatGPT must:

1. **Implement to spec** - Match the exact signatures and types provided
2. **Not modify interfaces** - Use provided types without changes
3. **Report conflicts** - If the interface is insufficient, report back (don't guess)

---

## 3. Communication Channels

### 3.1 Change Log for ChatGPT

**File:** `docs/CHANGELOG_FOR_CHATGPT.md`

**Purpose:** Track interface and structural changes that affect delegated work

**Format:**

```markdown
## [YYYY-MM-DD] Version X.Y

### Changed Interfaces

- `RegulationMappingInput` - Added optional `includeESRS` field
- `GS1Standard` type - Renamed `technicalSpecs` to `specifications`

### New Shared Types

- `ESRSDatapointMapping` - Links ESRS datapoints to GS1 attributes

### Deprecated

- `OldMappingFunction` - Use `newMappingEngine` instead
```

Manus will update this file before creating task specs that depend on changed interfaces.

### 3.2 Task Specifications

**Directory:** `tasks/for_chatgpt/`

**Naming:** `CGPT-{ID}_{short_description}.md`

**Purpose:** Self-contained specifications for delegated work

Each spec includes:

- Context (project mission, relevant subsystem)
- Exact task description
- Technical specification (files, signatures, types)
- Constraints and conventions
- Dependency assumptions
- Acceptance criteria

---

## 4. Delegation Decision Framework

### 4.1 Default Rule: Delegate by Default

If a task meets ALL criteria, **delegate to ChatGPT**:

✅ **Self-contained** - Clear boundaries, minimal dependencies  
✅ **Low-risk** - No production data, no credentials, no infra  
✅ **Static context** - Can be completed with repo snapshot only  
✅ **Clear spec** - Inputs/outputs and acceptance criteria are well-defined  
✅ **Testable** - Can be validated with unit tests

### 4.2 Keep in Manus if ANY Apply

❌ **High-risk** - Touches infra, secrets, or critical runtime paths  
❌ **Tightly coupled** - Depends on unstable or frequently changing code  
❌ **Requires experimentation** - Needs runtime testing or credential access  
❌ **Migration work** - Database schema changes or data transformations  
❌ **Timing-sensitive** - Must be coordinated with other changes

### 4.3 Examples

**Delegate to ChatGPT:**

- Build a new UI component for displaying ESRS datapoints
- Create a mapping function from CSRD requirements to GS1 attributes
- Write validation rules for EPCIS event structures
- Generate documentation for the GS1 mapping engine API
- Create test fixtures for regulation comparison features

**Keep in Manus:**

- Add a new tRPC procedure to the main router
- Modify database schema to add a new table
- Integrate a third-party API requiring credentials
- Update authentication middleware
- Deploy configuration changes to production

---

## 5. Integration Workflow

### 5.1 Task Assignment Process

1. **Manus creates task spec** in `tasks/for_chatgpt/CGPT-{ID}.md`
2. **User zips repo** and provides spec to ChatGPT
3. **ChatGPT implements** according to spec
4. **User pastes code** back to Manus
5. **Manus integrates** and validates

### 5.2 Integration Rules

When Manus receives code from ChatGPT:

**Mechanical Fixes (Allowed):**

- Fix import paths if they're slightly off
- Run formatters (`prettier`) and linters (`eslint`)
- Resolve minor naming inconsistencies with project conventions
- Add missing type exports if obvious

**Behavioral Changes (Avoid):**

- Do NOT alter logic or algorithms without documenting why
- Do NOT change function signatures or interfaces
- If changes are required:
  1. Update `docs/CHANGELOG_FOR_CHATGPT.md`
  2. Update the original task spec
  3. Note the changes in integration commit message

**Validation Steps:**

1. Place files in specified paths
2. Run `pnpm check` (TypeScript compilation)
3. Run `pnpm test` (all tests must pass)
4. Run `pnpm format` (code formatting)
5. Test integration points manually if applicable
6. Commit with clear message referencing task ID

### 5.3 Handling Interdependencies

**When ChatGPT depends on Manus's future work:**

- Manus provides "stub" interfaces with JSDoc `@todo` markers
- Manus guarantees to implement behind the interface
- ChatGPT implements against the stable interface

**When Manus depends on ChatGPT's work:**

- Manus waits for ChatGPT to deliver the contract
- OR Manus defines the interface first and asks ChatGPT to implement it
- Manus does NOT implement consuming code until contract is stable

---

## 6. Coding Standards and Conventions

### 6.1 TypeScript Standards

- **Strict mode:** All code must pass `tsc --noEmit` with strict checks
- **Explicit types:** Avoid `any`, prefer explicit interfaces
- **Null safety:** Use optional chaining (`?.`) and nullish coalescing (`??`)
- **Error handling:** Use `try/catch` for async operations, return error objects for sync

### 6.2 React/Frontend Standards

- **Functional components:** Use function components, not class components
- **Hooks:** Follow React hooks rules (no conditional hooks)
- **Props typing:** Explicit interface for all component props
- **Styling:** Use Tailwind CSS classes, avoid inline styles
- **Accessibility:** Include ARIA labels and keyboard navigation

### 6.3 Backend/tRPC Standards

- **Procedure types:** Use `publicProcedure` or `protectedProcedure` appropriately
- **Input validation:** All inputs validated with Zod schemas
- **Error handling:** Use `TRPCError` with appropriate codes
- **Database queries:** Use Drizzle ORM, avoid raw SQL unless necessary

### 6.4 Testing Standards

- **Test framework:** Vitest for all tests
- **Coverage:** Aim for >80% coverage on new code
- **Test structure:** Arrange-Act-Assert pattern
- **Mocking:** Use `vi.mock()` for external dependencies
- **Naming:** `describe` blocks for modules, `it` blocks for behaviors

### 6.5 Documentation Standards

- **JSDoc:** All exported functions must have JSDoc comments
- **Examples:** Include `@example` blocks for complex functions
- **Types:** Document parameter types and return types explicitly
- **Markdown:** Use GitHub-flavored Markdown for all docs

---

## 7. Quality Gates

### 7.1 Before Delegation (Manus)

- [ ] Task spec is complete and unambiguous
- [ ] All required interfaces are defined and frozen
- [ ] Dependencies are documented in spec
- [ ] Acceptance criteria are testable
- [ ] Task is added to `CHATGPT_WORK_PLAN.md`

### 7.2 Before Delivery (ChatGPT)

- [ ] Code compiles without TypeScript errors
- [ ] All tests pass (if tests are part of the task)
- [ ] Code follows project conventions
- [ ] JSDoc comments are complete
- [ ] No hardcoded credentials or secrets
- [ ] File paths match spec exactly

### 7.3 Before Integration (Manus)

- [ ] Code review for security issues
- [ ] Run full test suite (`pnpm test`)
- [ ] Check TypeScript compilation (`pnpm check`)
- [ ] Verify integration points work
- [ ] Update changelog if interfaces changed
- [ ] Commit with task ID reference

---

## 8. Continuous Improvement

### 8.1 Feedback Loop

After each integration cycle, Manus will:

1. **Evaluate spec quality** - Were there ambiguities or missing details?
2. **Assess integration friction** - What mechanical issues arose?
3. **Measure value delivered** - Did delegation accelerate progress?

### 8.2 Document Updates

Based on feedback:

- Update this document with improved rules
- Refine task spec templates in `tasks/for_chatgpt/`
- Adjust delegation criteria if needed
- Update `CHATGPT_WORK_PLAN.md` with revised priorities

### 8.3 Success Metrics

**Collaboration is successful when:**

- **>50% of new features** can be safely delegated to ChatGPT
- **<10% rework rate** - ChatGPT's code requires minimal changes
- **<1 hour integration time** - Manus can integrate contributions quickly
- **Zero security incidents** - No credentials or secrets exposed
- **High code quality** - ChatGPT's code passes all quality gates

---

## 9. Emergency Procedures

### 9.1 If ChatGPT's Code Breaks Production

1. **Immediate rollback** - Revert the problematic commit
2. **Root cause analysis** - Identify what went wrong
3. **Update task spec** - Add missing constraints or acceptance criteria
4. **Update this document** - Add new rules to prevent recurrence

### 9.2 If Task Spec is Ambiguous

ChatGPT should:

1. **Document assumptions** - List what was assumed
2. **Implement conservatively** - Choose the safest interpretation
3. **Flag ambiguities** - Note unclear requirements in delivery notes

Manus will:

1. **Clarify spec** - Update the task spec with clear guidance
2. **Revise if needed** - Ask ChatGPT to adjust implementation
3. **Update templates** - Improve future specs to avoid similar issues

---

## 10. Version History

| Version | Date       | Changes                                     |
| ------- | ---------- | ------------------------------------------- |
| 1.0     | 2025-12-11 | Initial collaboration architecture document |

---

## Contact and Questions

For questions about this collaboration model:

- **Primary Agent:** Manus (via user interaction)
- **External Agent:** ChatGPT (via user copy-paste)
- **User Role:** Facilitates communication between agents

This document is a living specification and will evolve as the collaboration matures.
