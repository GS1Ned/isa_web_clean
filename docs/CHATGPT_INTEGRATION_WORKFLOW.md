# ChatGPT Integration Workflow

**Version:** 1.0  
**Last Updated:** December 11, 2025  
**Purpose:** Step-by-step procedures for integrating ChatGPT's contributions into ISA

---

## Overview

This document defines the **complete workflow** for assigning tasks to ChatGPT, receiving deliverables, and integrating them into the ISA codebase with minimal friction.

---

## Phase 1: Task Selection and Preparation (Manus)

### 1.1 Select Task from Work Plan

**Input:** `tasks/CHATGPT_WORK_PLAN.md`

**Steps:**

1. Review task index and identify "Ready" tasks
2. Select task based on:
   - Business priority (high-value features first)
   - Technical dependencies (unblocked tasks only)
   - Complexity (mix simple and complex tasks)

3. Verify task spec exists: `tasks/for_chatgpt/CGPT-{ID}_{name}.md`

### 1.2 Verify Prerequisites

**Checklist:**

- [ ] Task spec is complete and unambiguous
- [ ] All required interfaces are defined in `/docs/CHANGELOG_FOR_CHATGPT.md`
- [ ] Dependencies are documented in task spec
- [ ] Acceptance criteria are testable
- [ ] No secrets or credentials required

### 1.3 Prepare Project Snapshot

**Steps:**

1. **Clean workspace:**

   ```bash
   cd /home/ubuntu/isa_web
   pnpm check  # Ensure no TypeScript errors
   pnpm test   # Ensure all tests pass
   ```

2. **Create zip archive:**

   ```bash
   # Exclude unnecessary files
   zip -r isa_web_snapshot.zip . \
     -x "node_modules/*" \
     -x ".git/*" \
     -x "dist/*" \
     -x "*.log" \
     -x ".env*"
   ```

3. **Verify zip contents:**
   - Source code (`/server`, `/client`, `/drizzle`)
   - Documentation (`/docs`, `/tasks`)
   - Configuration files (`package.json`, `tsconfig.json`)
   - Task spec (`/tasks/for_chatgpt/CGPT-{ID}.md`)

### 1.4 Update Task Status

**File:** `tasks/CHATGPT_WORK_PLAN.md`

```markdown
| ID      | Task Name           | Risk Level | Status          | Dependencies |
| ------- | ------------------- | ---------- | --------------- | ------------ |
| CGPT-01 | ESRS-to-GS1 Mapping | Low        | **In Progress** | None         |
```

---

## Phase 2: Task Assignment (User)

### 2.1 Provide Context to ChatGPT

**User sends to ChatGPT:**

1. **Project snapshot** (zip file)
2. **Task specification** (copy-paste from `tasks/for_chatgpt/CGPT-{ID}.md`)
3. **Brief introduction:**

```
I'm working on the ISA (Intelligent Standards Architect) project, which bridges
EU sustainability regulations with GS1 supply chain standards.

I need you to implement a specific module according to the attached task specification.

The project snapshot (zip file) contains the full codebase, documentation, and
task spec. Please read the task spec carefully and implement exactly as specified.

Task: CGPT-01 - ESRS-to-GS1 Attribute Mapping Library
Spec: tasks/for_chatgpt/CGPT-01_esrs_to_gs1_mapping.md

Please confirm you understand the task before starting implementation.
```

### 2.2 ChatGPT Confirmation

**ChatGPT should:**

1. Confirm receipt of project snapshot and task spec
2. Ask clarifying questions if anything is unclear
3. Outline implementation approach
4. Estimate completion time

**User should:**

- Answer clarifying questions promptly
- Confirm ChatGPT's understanding is correct
- Give green light to proceed

---

## Phase 3: Implementation (ChatGPT)

### 3.1 ChatGPT Implements According to Spec

**ChatGPT's responsibilities:**

- [ ] Read task spec thoroughly
- [ ] Understand project structure from snapshot
- [ ] Implement code matching exact specifications
- [ ] Write unit tests covering major code paths
- [ ] Document assumptions and design decisions
- [ ] Self-check against acceptance criteria

### 3.2 ChatGPT Delivers Code

**Deliverable format:**

````
# CGPT-01 Deliverables

## Files Created

### /server/mappings/esrs-to-gs1-mapper.ts
```typescript
// [Full file content here]
````

### /server/mappings/esrs-gs1-mapping-data.ts

```typescript
// [Full file content here]
```

### /server/mappings/esrs-to-gs1-mapper.test.ts

```typescript
// [Full file content here]
```

### /server/mappings/README.md

```markdown
// [Full file content here]
```

## Implementation Notes

- Assumed ESRS datapoint patterns follow "E{standard}-{section}\_{number}" format
- Used glob pattern matching for flexible datapoint matching
- Mapping confidence scores based on directness of attribute relationship
- Covered E1-E5 ESRS standards with 50+ mapping rules

## Suggestions for Future Improvements

- Add database-backed mapping rules for easier updates
- Implement ML-based confidence scoring
- Add multi-language support for attribute names

## Known Limitations

- Only covers top 5 ESRS standards (E1-E5)
- Pattern matching is basic (no complex regex)
- No external API validation of GS1 attributes

````

---

## Phase 4: Integration (Manus)

### 4.1 Receive and Review Code

**User pastes ChatGPT's code to Manus**

**Manus reviews:**

1. **Security check:**
   - No hardcoded credentials or secrets
   - No suspicious external API calls
   - No file system operations outside project scope

2. **Structural check:**
   - Files match specified paths in task spec
   - Imports are correct
   - No missing dependencies

3. **Quality check:**
   - Code follows project conventions
   - JSDoc comments present
   - Tests included

### 4.2 Place Files in Project

**Manus executes:**

```bash
# Create directories if needed
mkdir -p /home/ubuntu/isa_web/server/mappings

# Write files (Manus uses file tool)
# - /server/mappings/esrs-to-gs1-mapper.ts
# - /server/mappings/esrs-gs1-mapping-data.ts
# - /server/mappings/esrs-to-gs1-mapper.test.ts
# - /server/mappings/README.md
````

### 4.3 Run Validation Steps

**Checklist:**

```bash
# 1. TypeScript compilation
pnpm check
# Expected: No errors

# 2. Code formatting
pnpm format
# Expected: Files formatted

# 3. Run tests
pnpm test esrs-to-gs1-mapper.test.ts
# Expected: All tests pass

# 4. Run full test suite
pnpm test
# Expected: No regressions
```

### 4.4 Resolve Mechanical Issues (If Needed)

**Allowed fixes:**

- Fix import paths (e.g., `../db` → `./db`)
- Add missing type exports
- Fix minor naming inconsistencies
- Run prettier/eslint auto-fixes

**NOT allowed without documenting:**

- Change function signatures
- Alter logic or algorithms
- Modify interfaces

**If behavioral changes needed:**

1. Update `docs/CHANGELOG_FOR_CHATGPT.md`
2. Update original task spec
3. Note changes in commit message
4. Consider asking ChatGPT to revise

### 4.5 Manual Integration Testing

**Test integration points:**

```typescript
// Example: Test in Node REPL or create temp test file
import { mapESRSToGS1Attributes } from "./server/mappings/esrs-to-gs1-mapper";

const result = await mapESRSToGS1Attributes(["E1-1_01"]);
print(result);
// Verify output matches expected format
```

### 4.6 Commit Changes

**Commit message format:**

```
feat(mappings): implement ESRS-to-GS1 attribute mapping library [CGPT-01]

- Add esrs-to-gs1-mapper.ts with core mapping function
- Add esrs-gs1-mapping-data.ts with 50+ mapping rules
- Add comprehensive unit tests
- Cover E1-E5 ESRS standards

Implemented by: ChatGPT
Integrated by: Manus
Task spec: tasks/for_chatgpt/CGPT-01_esrs_to_gs1_mapping.md
```

### 4.7 Update Task Status

**File:** `tasks/CHATGPT_WORK_PLAN.md`

```markdown
| ID      | Task Name           | Risk Level | Status        | Dependencies |
| ------- | ------------------- | ---------- | ------------- | ------------ |
| CGPT-01 | ESRS-to-GS1 Mapping | Low        | **Completed** | None         |
```

---

## Phase 5: Feedback and Improvement (Manus)

### 5.1 Evaluate Integration

**Metrics:**

- **Integration time:** How long did it take to integrate? (Target: <1 hour)
- **Rework rate:** What % of code needed changes? (Target: <10%)
- **Test coverage:** What % of code is tested? (Target: >80%)
- **Quality:** Did code pass all quality gates? (Target: Yes)

### 5.2 Update Documentation

**If issues found:**

1. **Update task spec** with clarifications
2. **Update `ISA_AGENT_COLLABORATION.md`** with new rules
3. **Update `CHATGPT_WORK_PLAN.md`** with lessons learned

**If successful:**

1. **Document success** in work plan
2. **Identify similar tasks** that can be delegated
3. **Refine delegation criteria** if needed

### 5.3 Plan Next Task

**Review work plan and select next task based on:**

- Unblocked dependencies
- Business priority
- Lessons learned from previous integration

---

## Integration Checklist (Quick Reference)

### Pre-Integration (Manus)

- [ ] Task spec is complete
- [ ] Prerequisites verified
- [ ] Project snapshot created
- [ ] Task status updated to "In Progress"

### Assignment (User)

- [ ] Snapshot provided to ChatGPT
- [ ] Task spec provided to ChatGPT
- [ ] ChatGPT confirmed understanding
- [ ] Green light given to proceed

### Implementation (ChatGPT)

- [ ] Code implemented per spec
- [ ] Tests written and passing
- [ ] Documentation included
- [ ] Assumptions documented

### Integration (Manus)

- [ ] Security review passed
- [ ] Files placed in correct paths
- [ ] `pnpm check` passed (TypeScript)
- [ ] `pnpm format` run
- [ ] `pnpm test` passed (all tests)
- [ ] Manual integration testing done
- [ ] Changes committed with task ID
- [ ] Task status updated to "Completed"

### Post-Integration (Manus)

- [ ] Integration metrics recorded
- [ ] Documentation updated if needed
- [ ] Next task selected

---

## Troubleshooting

### Issue: TypeScript Errors After Integration

**Diagnosis:**

- Check import paths (relative vs. absolute)
- Check for missing type exports
- Check for interface mismatches

**Resolution:**

1. Fix import paths manually
2. Add missing exports
3. If interface mismatch, update `CHANGELOG_FOR_CHATGPT.md` and ask ChatGPT to revise

### Issue: Tests Fail After Integration

**Diagnosis:**

- Check if tests depend on database state
- Check if tests depend on external APIs
- Check if tests have hardcoded assumptions

**Resolution:**

1. Fix test setup/teardown
2. Mock external dependencies
3. If test logic is wrong, ask ChatGPT to revise

### Issue: Code Doesn't Match Spec

**Diagnosis:**

- Check if spec was ambiguous
- Check if ChatGPT made incorrect assumptions
- Check if dependencies changed

**Resolution:**

1. Update spec with clarifications
2. Ask ChatGPT to revise implementation
3. Document lessons learned

---

## Success Metrics

**Target KPIs:**

- **Delegation rate:** >50% of new features delegated by Q2 2026
- **Integration time:** <1 hour per task
- **Rework rate:** <10% of code needs changes
- **Test coverage:** >80% on delegated code
- **Security incidents:** 0

**Current Status (December 2025):**

- Tasks completed: 0
- Average integration time: N/A
- Average rework rate: N/A
- Security incidents: 0

---

## Version History

| Version | Date       | Changes                               |
| ------- | ---------- | ------------------------------------- |
| 1.0     | 2025-12-11 | Initial integration workflow document |

---

**Maintained by:** Manus  
**Last Updated:** December 11, 2025
