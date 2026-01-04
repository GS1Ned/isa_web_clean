# CI Testing Guide

This project ships a dedicated CI runner at `scripts/run-ci-tests.sh` to keep Vitest runs deterministic, capture full logs, and provide a concise failure summary without piping output through shell utilities.

## How the CI script works

The script executes test phases in a strict order:

1. **Guard/architecture checks** (if any guard tests exist)
2. **Unit tests** (no database)
3. **DB integration tests** (`RUN_DB_TESTS=true`)
4. **External integration tests** (optional, `USE_INTEGRATION_MOCKS=false`)

Each phase runs with `--runInBand` and `--reporter=verbose`, and writes its full output to `logs/`. After every phase, the script records pass/fail status and prints a final summary with log locations. The script exits non-zero if any phase fails.

## Environment flags

The script sets the following flags explicitly for each phase:

- `RUN_DB_TESTS`
  - `false` for unit tests (prevents DB-dependent suites from running)
  - `true` for DB integration and external integration phases
- `USE_INTEGRATION_MOCKS`
  - `true` for unit and DB integration phases
  - `false` for the optional external integration phase
- `RUN_EXTERNAL_INTEGRATION_TESTS`
  - When set to `true`, the external integration phase runs with real integrations
  - When `false` or unset, the phase is skipped and recorded as `skipped`

## Running locally

Run all CI phases (guard ➜ unit ➜ DB ➜ optional integration):

```bash
pnpm test:ci
```

Run only unit tests (no DB):

```bash
pnpm test:ci:unit
```

Run only DB integration tests:

```bash
pnpm test:ci:db
```

Run external integrations explicitly:

```bash
RUN_EXTERNAL_INTEGRATION_TESTS=true pnpm test:ci
```

## Logs and troubleshooting

Logs are written to `logs/`:

- `logs/guard-tests.log`
- `logs/unit-tests.log`
- `logs/db-tests.log`
- `logs/integration-tests.log`

Common failure scenarios and where to look:

- **Unit test failures**: Check `logs/unit-tests.log` for failing assertions and stack traces.
- **DB integration failures**: Check `logs/db-tests.log` for connectivity, migration, or query errors.
- **External integration failures**: Check `logs/integration-tests.log` for real API responses, rate limits, or auth issues.
- **Guard/architecture failures**: Check `logs/guard-tests.log` for explicit guardrail violations or DB health issues.

## CI integration notes

- Use `pnpm test:ci` in CI to get consistent ordering and summaries.
- The script is designed to fail fast: once a phase fails, later phases are skipped and recorded as `skipped`.
- The final summary is printed to stdout for easy CI visibility, while full logs remain in `logs/`.
