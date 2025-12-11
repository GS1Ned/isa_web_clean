# Changelog for ChatGPT

**Purpose:** Track interface and structural changes that affect delegated work.

**Audience:** ChatGPT (external development agent)

**Maintained by:** Manus

---

## [2025-12-11] Version 1.0 - Initial Baseline

### Project Structure Established

**Core Directories:**

- `/server/` - Backend tRPC procedures and business logic
- `/client/src/` - Frontend React components and pages
- `/drizzle/` - Database schema definitions
- `/shared/` - Shared types and constants
- `/docs/` - Documentation
- `/tasks/` - Task specifications for ChatGPT

**Tech Stack:**

- TypeScript 5.9.3
- React 19 + Tailwind CSS 4
- tRPC 11 (type-safe RPC)
- Drizzle ORM (MySQL/TiDB)
- Vitest (testing)

### Core Interfaces Frozen

**Database Schema (`drizzle/schema.ts`):**

- `regulations` table - 35 EU regulations
- `gs1_standards` table - 60 GS1 standards
- `esrs_datapoints` table - 1,184 ESRS disclosure requirements
- `dutch_initiatives` table - 10 national programs
- `hub_news` table - News articles with AI processing
- `regulation_standard_mappings` table - Regulation↔Standard links
- `regulation_esrs_mappings` table - Regulation↔ESRS links

**Core Types (`shared/types/`):**

- Currently using inline types in schema files
- Future: Will extract to `/shared/types/` for reuse

**tRPC Router Structure (`server/routers.ts`):**

- Main router exports: `appRouter` and `AppRouter` type
- Sub-routers organized by feature domain
- All procedures use Zod for input validation

### Coding Conventions

**TypeScript:**

- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Explicit return types for exported functions

**React:**

- Functional components only
- Props interfaces named `{ComponentName}Props`
- Use shadcn/ui components from `@/components/ui/`

**Testing:**

- Test files: `*.test.ts` or `*.test.tsx`
- Use Vitest and `vi.mock()` for mocking
- Aim for >80% coverage

**File Naming:**

- kebab-case for files: `news-admin-router.ts`
- PascalCase for React components: `NewsAdmin.tsx`
- camelCase for functions and variables

---

## Future Changes

Changes to interfaces, types, or project structure will be documented here before task specs are created that depend on them.

**Format for future entries:**

```markdown
## [YYYY-MM-DD] Version X.Y - Brief Description

### Changed Interfaces

- `InterfaceName` - Description of change
- `TypeName` - What was added/removed/renamed

### New Shared Types

- `NewType` - Purpose and usage

### Deprecated

- `OldFunction` - Replacement and migration path

### Breaking Changes

- Description of any breaking changes
- Migration guide if applicable
```

---

## Notes for ChatGPT

- **Always check this file** before starting a task to ensure you're working with the latest interfaces
- **Task specs will reference** specific versions of interfaces defined here
- **If you notice inconsistencies** between this changelog and the task spec, flag them in your delivery notes
- **Do not assume** - If an interface is unclear, document your assumptions and implement conservatively

---

**Last Updated:** December 11, 2025  
**Maintained by:** Manus
