# ISA "Never Again" Architectural Contract

**Purpose:** Enforceable invariants and automated checks to prevent recurring failure modes.

**Last Updated:** 2026-01-04

---

## Contract 1: Database Schema Naming

**Invariant:** All database columns MUST use snake_case naming.

**Rationale:** Prevents naming mismatches between database and application code.

**Enforcement:**
- Schema linter checks all table definitions in `drizzle/schema.ts`
- CI fails if camelCase column names are detected
- Mapping layer in `server/schema-mappers.ts` handles translation

**Test:**
```typescript
// server/schema-contract.test.ts
describe("Schema Naming Contract", () => {
  it("all database columns must use snake_case", () => {
    const schema = readSchemaFile();
    const violations = findCamelCaseColumns(schema);
    expect(violations).toEqual([]);
  });
});
```

---

## Contract 2: SQL Defaults vs Application Code

**Invariant:** When a column has `DEFAULT` in SQL, application code MUST NOT pass that column in INSERT statements.

**Rationale:** Prevents mismatch between schema defaults and application logic.

**Enforcement:**
- Grep for INSERT statements that include columns with SQL defaults
- CI warns if `created_at` or `updated_at` appear in INSERT VALUES

**Test:**
```typescript
describe("SQL Defaults Contract", () => {
  it("INSERT statements must not include columns with SQL defaults", () => {
    const insertStatements = findAllInsertStatements();
    const violations = insertStatements.filter(stmt => 
      stmt.includes("created_at") || stmt.includes("updated_at")
    );
    expect(violations).toEqual([]);
  });
});
```

---

## Contract 3: Database Connection Configuration

**Invariant:** Database connection MUST handle SSL configuration in both JSON object and string formats.

**Rationale:** DATABASE_URL may contain SSL config as JSON or string depending on environment.

**Enforcement:**
- `server/db-health-guard.test.ts` validates connection before all DB tests
- Fail fast with clear error if SSL misconfigured

**Test:**
```typescript
describe("Database Connection Contract", () => {
  it("must parse JSON SSL configuration", () => {
    const url = "mysql://user:pass@host/db?ssl={\"rejectUnauthorized\":true}";
    const config = buildMysqlConfig(url);
    expect(config.ssl).toEqual({ rejectUnauthorized: true });
  });

  it("must parse string SSL configuration", () => {
    const url = "mysql://user:pass@host/db?sslmode=require";
    const config = buildMysqlConfig(url);
    expect(config.ssl).toBeDefined();
  });
});
```

---

## Contract 4: Test Configuration Determinism

**Invariant:** Test configuration (vitest.config.ts) MUST NOT use async operations.

**Rationale:** Async checks at config time cause race conditions and unreliable test execution.

**Enforcement:**
- Use explicit environment flags: `RUN_DB_TESTS=true`
- CI sets flags explicitly, never relies on detection

**Test:**
```typescript
describe("Test Configuration Contract", () => {
  it("vitest.config.ts must not contain async operations", () => {
    const configFile = readFileSync("vitest.config.ts", "utf-8");
    expect(configFile).not.toMatch(/async.*isDatabaseAvailable/);
    expect(configFile).toMatch(/process\.env\.RUN_DB_TESTS/);
  });
});
```

---

## Contract 5: tRPC Procedure Implementation

**Invariant:** Every tRPC procedure MUST have a corresponding implementation function in `server/db.ts`.

**Rationale:** Prevents runtime errors from missing implementations.

**Enforcement:**
- Parse `server/routers.ts` to extract all procedure names
- Verify each has a corresponding function in `server/db.ts`
- CI fails if orphaned procedures detected

**Test:**
```typescript
describe("tRPC Procedure Contract", () => {
  it("all procedures must have DB implementations", () => {
    const procedures = extractProceduresFromRouters();
    const dbFunctions = extractFunctionsFromDb();
    const missing = procedures.filter(p => !dbFunctions.includes(p));
    expect(missing).toEqual([]);
  });
});
```

---

## Contract 6: Middleware Registration

**Invariant:** All middleware functions MUST have explicit names for testing and debugging.

**Rationale:** Anonymous middleware cannot be verified programmatically.

**Enforcement:**
- Use `Object.defineProperty(fn, "name", { value: "middlewareName" })`
- Tests verify middleware by name

**Test:**
```typescript
describe("Middleware Registration Contract", () => {
  it("rate limiter middleware must have explicit name", () => {
    expect(rateLimitMiddleware.name).toBe("rateLimitMiddleware");
  });
});
```

---

## Contract 7: Test Isolation

**Invariant:** Database tests MUST clean up after themselves using beforeEach/afterEach hooks.

**Rationale:** Prevents test pollution and flaky tests.

**Enforcement:**
- All DB tests must import and use `server/test-isolation-utils.ts`
- CI checks for cleanup hooks in all DB test files

**Test:**
```typescript
describe("Test Isolation Contract", () => {
  it("all DB tests must have cleanup hooks", () => {
    const dbTestFiles = glob.sync("server/**/*.test.ts");
    const violations = dbTestFiles.filter(file => {
      const content = readFileSync(file, "utf-8");
      return !content.includes("beforeEach") && !content.includes("afterEach");
    });
    expect(violations).toEqual([]);
  });
});
```

---

## Contract 8: Safe Test Execution

**Invariant:** Test output MUST NOT be piped to shell utilities (head, grep, etc.).

**Rationale:** Piping causes SIGPIPE and hangs test runners.

**Enforcement:**
- CI scripts use vitest native filtering only
- Documentation mandates safe patterns

**CI Script:**
```bash
#!/bin/bash
# ✅ Correct: Native filtering
pnpm vitest run server/suite.test.ts --reporter=verbose

# ✅ Correct: Capture to file
pnpm vitest run > logs/test.log 2>&1

# ❌ Wrong: Piping
pnpm vitest run | head  # NEVER DO THIS
```

---

## Automated Enforcement Script

Create `scripts/check-architecture.ts`:

```typescript
#!/usr/bin/env tsx

import { checkSchemaNaming } from "./checks/schema-naming";
import { checkSqlDefaults } from "./checks/sql-defaults";
import { checkTrpcProcedures } from "./checks/trpc-procedures";
import { checkTestIsolation } from "./checks/test-isolation";

async function main() {
  const checks = [
    checkSchemaNaming(),
    checkSqlDefaults(),
    checkTrpcProcedures(),
    checkTestIsolation(),
  ];

  const results = await Promise.all(checks);
  const failures = results.filter(r => !r.passed);

  if (failures.length > 0) {
    console.error("❌ Architectural contract violations detected:");
    failures.forEach(f => console.error(`  - ${f.message}`));
    process.exit(1);
  }

  console.log("✅ All architectural contracts satisfied");
}

main();
```

Add to `package.json`:
```json
{
  "scripts": {
    "check-architecture": "tsx scripts/check-architecture.ts"
  }
}
```

Add to CI:
```yaml
- name: Check Architectural Contracts
  run: pnpm check-architecture
```

---

## Contract Maintenance

**Review Frequency:** After every major failure or incident

**Update Process:**
1. Document new failure mode in `KNOWN_FAILURE_MODES.md`
2. Add corresponding contract to this document
3. Implement automated check in `scripts/check-architecture.ts`
4. Add test to verify enforcement
5. Update CI pipeline

**Ownership:** ISA Development Team
