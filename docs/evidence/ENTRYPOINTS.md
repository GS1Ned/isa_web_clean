# ENTRYPOINTS

Generated: 2026-01-28

## NPM scripts (package.json)

| script | command |
|---|---|
| dev | NODE_ENV=development NODE_OPTIONS='--max-old-space-size=4096' tsx watch server/_core/index.ts |
| build | vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist |
| start | NODE_ENV=production node dist/index.js |
| check | tsc --noEmit |
| format | prettier --write . |
| test | vitest run |
| test-db-health | RUN_DB_TESTS=true vitest run server/db-health-guard.test.ts --reporter=verbose --no-coverage |
| test-unit | vitest run --reporter=verbose --no-coverage |
| test-integration | RUN_DB_TESTS=true vitest run --reporter=verbose --no-coverage |
| test-ci | bash scripts/run-ci-tests.sh |
| test-ci:unit | bash scripts/run-unit-tests.sh |
| test-ci:integration | bash scripts/run-integration-tests.sh |
| db:push | drizzle-kit generate && drizzle-kit migrate |
| verify:data | tsx scripts/verify-data-files.ts |
| integrate | tsx scripts/integrate-chatgpt-deliverables.ts |
| ingest:esrs | tsx server/ingest/INGEST-03_esrs_datapoints.ts |
| validate:advisory | node scripts/validate_advisory_schema.cjs |
| canonicalize:advisory | node scripts/canonicalize_advisory.cjs |
| diff:advisory | node scripts/compute_advisory_diff.cjs |
| lint:style | markdownlint 'docs/**/*.md' --ignore node_modules && cspell 'docs/**/*.md' |

## Backend server entrypoint

- `server/_core/index.ts` bootstraps Express + tRPC, registers OAuth routes, health/ready endpoints, cron endpoints, then starts HTTP server. [server/_core/index.ts:L98-L117]

## Frontend entrypoint

- Vite root is `client/` and loads `client/index.html` → `client/src/main.tsx` → `client/src/App.tsx`.
