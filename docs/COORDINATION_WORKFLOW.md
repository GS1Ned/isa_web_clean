# Manus-Codex Coordination Workflow

**Project:** ISA (Intelligent Standards Architect)  
**Date:** January 4, 2026  
**Version:** 1.0

---

## Overview

This document establishes the operational workflow for coordinated development between Manus (orchestrator/integrator) and Codex (implementation agent). The workflow ensures architectural integrity, prevents regressions, and maintains code quality throughout the development cycle.

---

## Role Definitions

### Manus (Orchestrator)

Manus serves as the **system integrator and architectural authority** with the following responsibilities:

| Responsibility | Description |
|----------------|-------------|
| **Architectural Decisions** | All schema changes, API contracts, and cross-module integrations |
| **Task Delegation** | Breaking down work into Codex-assignable units |
| **Quality Assurance** | Reviewing and validating all Codex contributions |
| **Integration** | Merging approved changes into the main codebase |
| **Root Cause Analysis** | Investigating systemic failures and regressions |
| **CI/CD Management** | Maintaining build and deployment pipelines |

### Codex (Implementation Agent)

Codex handles **targeted implementation tasks** within controlled boundaries:

| Responsibility | Description |
|----------------|-------------|
| **Feature Implementation** | Building isolated features per specification |
| **Test Writing** | Creating unit tests for implemented features |
| **Documentation** | Writing inline documentation and README updates |
| **Bug Fixes** | Fixing isolated bugs with clear reproduction steps |
| **Scaffolding** | Creating boilerplate code and component structures |

---

## Task Lifecycle

### Phase 1: Task Definition

Manus defines tasks using the following template:

```markdown
## Task: [TASK-ID] [Task Name]

### Context
[Why this task is needed and how it fits into the larger system]

### Scope
- **In Scope:** [What should be done]
- **Out of Scope:** [What should NOT be done]

### Requirements
1. [Specific, measurable requirement]
2. [Another requirement]

### Reference Files
| File | Purpose | Access Level |
|------|---------|--------------|
| `path/to/file.ts` | [Purpose] | Read-only / Modify |

### Acceptance Criteria
- [ ] [Testable criterion 1]
- [ ] [Testable criterion 2]

### Constraints
- Do not modify: [List of protected files]
- Must use: [Required patterns/libraries]
```

### Phase 2: Task Execution (Codex)

Codex executes tasks following these guidelines:

1. **Read all reference files** before starting implementation
2. **Follow existing patterns** found in the codebase
3. **Write tests first** when adding new functionality
4. **Document all public APIs** with JSDoc comments
5. **Report blockers immediately** rather than making assumptions

### Phase 3: Review (Manus)

Manus reviews completed work using this checklist:

| Check | Command | Pass Criteria |
|-------|---------|---------------|
| TypeScript | `pnpm tsc --noEmit` | Zero errors |
| Unit Tests | `pnpm test` | All tests pass |
| Lint | `pnpm lint` | No new warnings |
| Build | `pnpm build` | Successful build |

### Phase 4: Integration

Upon passing review:

1. Manus merges changes to the feature branch
2. Full test suite runs (`pnpm test`)
3. Integration tests run with database (`RUN_DB_TESTS=true pnpm test`)
4. Changes are documented in todo.md

---

## Quality Gates

### Gate 1: Pre-Submission (Codex)

Before submitting work, Codex must verify:

| Check | Requirement |
|-------|-------------|
| Compilation | `pnpm tsc --noEmit` passes |
| New Tests | All new tests pass |
| Existing Tests | No regressions in related tests |
| Documentation | All public APIs documented |

### Gate 2: Code Review (Manus)

Manus evaluates submissions against:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Correctness | 40% | Does it meet requirements? |
| Test Coverage | 25% | Are edge cases covered? |
| Code Quality | 20% | Follows patterns and conventions? |
| Documentation | 15% | Clear and complete? |

### Gate 3: Integration (Manus)

Before merging to main:

| Check | Action on Failure |
|-------|-------------------|
| Full Test Suite | Investigate and fix regressions |
| Performance | Profile and optimise if degraded |
| Security | Address vulnerabilities immediately |

---

## Communication Protocol

### Task Handoff (Manus → Codex)

```markdown
## Handoff: [TASK-ID]

**Status:** Ready for Implementation
**Priority:** [P0/P1/P2]
**Estimated Effort:** [Hours]

### Task Specification
[Link to task in CODEX_DELEGATION_SPEC.md]

### Additional Context
[Any runtime information or recent changes]

### Deadline
[If applicable]
```

### Progress Update (Codex → Manus)

```markdown
## Progress: [TASK-ID]

**Status:** [Not Started / In Progress / Blocked / Ready for Review]
**Completion:** [X%]

### Completed
- [What has been done]

### In Progress
- [What is currently being worked on]

### Blockers
- [Any issues preventing progress]

### Questions
- [Clarifications needed]
```

### Completion Report (Codex → Manus)

```markdown
## Complete: [TASK-ID]

**Status:** Ready for Review

### Files Changed
| File | Change Type | Lines |
|------|-------------|-------|
| `path/to/file.ts` | Created/Modified | +X/-Y |

### Tests Added
| Test File | Test Count | Coverage |
|-----------|------------|----------|
| `file.test.ts` | X tests | Y% |

### Acceptance Criteria Status
- [x] [Criterion 1]
- [x] [Criterion 2]

### Notes
[Any implementation decisions or trade-offs]
```

---

## Conflict Resolution

### Code Conflicts

When Codex's changes conflict with recent Manus changes:

1. **Stop work** on the conflicting area
2. **Report the conflict** with specific file and line numbers
3. **Wait for Manus** to resolve or provide guidance
4. **Do not force-push** or overwrite changes

### Architectural Conflicts

When implementation reveals architectural issues:

1. **Document the issue** with specific examples
2. **Propose alternatives** if possible
3. **Wait for Manus decision** before proceeding
4. **Do not implement workarounds** without approval

### Requirement Conflicts

When requirements are ambiguous or contradictory:

1. **List the conflicting requirements**
2. **Propose interpretation** with rationale
3. **Wait for clarification** before implementing
4. **Document the resolution** for future reference

---

## Synchronisation Points

### Daily Sync

At the end of each work session:

1. Codex reports progress on active tasks
2. Manus reviews completed work
3. Blockers are identified and addressed
4. Next tasks are prioritised

### Task Completion Sync

When a task is completed:

1. Codex submits completion report
2. Manus runs quality gates
3. Feedback is provided (approve/revise)
4. Task is marked complete or returned

### Integration Sync

Before major integrations:

1. All active tasks are paused
2. Full test suite is run
3. Integration is performed
4. All tasks resume after verification

---

## Emergency Procedures

### Test Suite Failure

If the test suite fails after integration:

1. **Halt all new work**
2. **Identify the failing tests**
3. **Determine root cause** (new code vs. existing bug)
4. **Fix or rollback** as appropriate
5. **Resume work** after suite passes

### Build Failure

If the build fails:

1. **Check TypeScript errors** first
2. **Check dependency issues** second
3. **Rollback if necessary**
4. **Document the cause** for prevention

### Production Issue

If a production issue is reported:

1. **Assess severity** (P0/P1/P2)
2. **Create hotfix task** if P0/P1
3. **Pause feature work** for P0
4. **Fix, test, deploy** with expedited review

---

## Metrics and Reporting

### Task Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Task Completion Rate | >90% | Tasks completed / Tasks assigned |
| First-Pass Approval | >80% | Tasks approved without revision |
| Test Coverage | >80% | Lines covered by tests |
| Regression Rate | <5% | Regressions / Total changes |

### Quality Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| TypeScript Errors | 0 | `pnpm tsc --noEmit` output |
| Test Pass Rate | 100% | Passing tests / Total tests |
| Build Success | 100% | Successful builds / Total builds |

---

## Appendix: Command Reference

### Development Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm test` | Run test suite |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm tsc --noEmit` | Type check without emit |
| `pnpm lint` | Run ESLint |

### Database Commands

| Command | Purpose |
|---------|---------|
| `pnpm db:push` | Push schema changes |
| `pnpm db:studio` | Open Drizzle Studio |
| `RUN_DB_TESTS=true pnpm test` | Run with DB tests |

### Git Commands

| Command | Purpose |
|---------|---------|
| `git status` | Check working tree status |
| `git diff` | View uncommitted changes |
| `git log --oneline -10` | View recent commits |

---

**Document Version:** 1.0  
**Last Updated:** January 4, 2026  
**Author:** Manus AI (Orchestrator)
