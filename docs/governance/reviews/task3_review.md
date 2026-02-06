# Task 3 Review: CI Test Script Improvements

## Specification Requirements (from CODEX_DELEGATION_SPEC.md)

**Expected Files:**
- Create: `scripts/run-unit-tests.sh`
- Create: `scripts/run-integration-tests.sh`
- Create: `scripts/test-report.ts`
- Update: `package.json` (add new script entries)

**Requirements for shell scripts:**
- Use `set -e` for fail-fast behavior
- Support `--coverage` flag
- Output timing information
- Exit with appropriate codes

**Requirements for test-report.ts:**
- Parse vitest JSON output
- Generate summary with pass/fail counts
- List failing tests with file locations
- Output both JSON and human-readable formats

---

## Actual Implementation (PR #5)

**Files Created:**
- `scripts/run-ci-tests.sh` (single unified script instead of two separate)
- `docs/CI_TESTING.md`

**Files Modified:**
- `package.json` (added `test:ci`, `test:ci:unit`, `test:ci:db`)

---

## Gap Analysis

| Requirement | Status | Notes |
|-------------|--------|-------|
| `scripts/run-unit-tests.sh` | ⚠️ DIFFERENT | Unified into `run-ci-tests.sh unit` |
| `scripts/run-integration-tests.sh` | ⚠️ DIFFERENT | Unified into `run-ci-tests.sh db` |
| `scripts/test-report.ts` | ❌ MISSING | Not implemented |
| `set -e` for fail-fast | ⚠️ PARTIAL | Uses `set -u` and `set -o pipefail`, not `set -e` |
| `--coverage` flag support | ❌ MISSING | Uses `--no-coverage` explicitly |
| Output timing information | ⚠️ PARTIAL | Via vitest verbose output, not explicit timing |
| Exit with appropriate codes | ✅ PRESENT | Proper exit code handling |
| `package.json` updates | ✅ PRESENT | Added `test:ci`, `test:ci:unit`, `test:ci:db` |

---

## DRY TEST RESULTS - BUGS FOUND

### Bug 1: Invalid vitest option `--runInBand`

**Error:**
```
CACError: Unknown option `--runInBand`
```

**Cause:** `--runInBand` is a Jest option, not a vitest option. Vitest uses `--pool=forks --poolOptions.forks.singleFork` or simply runs sequentially by default.

**Fix Required:** Replace `--runInBand` with vitest-compatible options or remove it.

### Bug 2: printf format string issue

**Error:**
```
scripts/run-ci-tests.sh: line 52: printf: - : invalid option
```

**Cause:** The printf on line 52 has a variable that starts with `-` being interpreted as an option.

**Fix Required:** Use `printf -- "..."` or ensure variables don't start with `-`.

---

## Script Quality Assessment

**Positive:**
- Well-structured with functions for reusability
- Proper array handling for phase tracking
- Environment variables set explicitly per phase
- Good separation of concerns (guard/unit/db/integration)
- Comprehensive documentation

**Critical Issues:**
1. **`--runInBand` is invalid for vitest** - Script will fail on every run
2. **printf format issue** - Summary output will fail
3. No `test-report.ts` for structured output
4. No `--coverage` flag support

---

## Recommendation

**REVISION REQUIRED**: The PR has critical bugs that prevent it from running:

1. `--runInBand` must be removed or replaced with vitest equivalent
2. printf format string must be fixed
3. Missing `test-report.ts` (spec requirement)

The approach is good, but the implementation has bugs that must be fixed before merging.
