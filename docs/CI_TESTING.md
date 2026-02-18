# CI Testing Guide

FACT
- CI test entrypoints:
  - `scripts/run-ci-tests.sh`
  - `scripts/run-unit-tests.sh`
  - `scripts/run-integration-tests.sh`
- Package scripts:
  - `pnpm test-ci`
  - `pnpm test-ci:unit`
  - `pnpm test-ci:integration`

## How the CI script works

`scripts/run-ci-tests.sh` runs two Vitest phases in a fixed order:

1. **Unit tests** via `scripts/run-unit-tests.sh`
2. **Integration tests** via `scripts/run-integration-tests.sh` (sets `RUN_DB_TESTS=true`)

Both phases produce JSON reports, and the script writes an aggregated summary via `scripts/test-report.ts`.

## Environment flags

- `scripts/run-integration-tests.sh` sets `RUN_DB_TESTS=true`.
- Database connectivity details are provided via the standard runtime environment variables (see `.env.example`).

## Running locally

Run the CI bundle (unit + integration) and write reports under `test-results/ci/`:

```bash
pnpm test-ci
```

Run only unit tests (no DB):

```bash
pnpm test-ci:unit
```

Run only integration tests (DB expected):

```bash
pnpm test-ci:integration
```

## Reports

`pnpm test-ci` writes:
- `test-results/ci/unit.json`
- `test-results/ci/integration.json`
- `test-results/ci/summary.json`

`pnpm test-ci:unit` and `pnpm test-ci:integration` accept:
- `--report-file <path>`
- `--coverage`

RECOMMENDATION
- In CI, prefer `pnpm test-ci` so all reports land under `test-results/ci/` and can be schema-validated.
- When debugging locally, open the JSON report(s) for the failing phase and re-run the exact Vitest command for faster iteration.

## CI integration notes

- Use `pnpm test-ci` in CI to get consistent ordering and a single summary artifact.
- `scripts/run-ci-tests.sh` exits non-zero if either phase fails.
