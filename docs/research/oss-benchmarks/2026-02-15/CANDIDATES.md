# OSS Candidates (Top 12) - 2026-02-15

Source of truth for numeric signals: `raw/top12_repo_metadata.json`

## FACT

### Summary Table
| Rank | Name | Stars | Forks | Last commit date | Release date | URL |
| ---: | --- | ---: | ---: | --- | --- | --- |
| 1 | SigNoz/signoz | 25744 | 1959 | 2026-02-15 | 2026-02-11 | https://github.com/SigNoz/signoz |
| 2 | langfuse/langfuse | 21945 | 2164 | 2026-02-15 | 2026-02-12 | https://github.com/langfuse/langfuse |
| 3 | Helicone/helicone | 5113 | 481 | 2026-02-13 | 2025-08-21 | https://github.com/Helicone/helicone |
| 4 | colinhacks/zod | 41853 | 1820 | 2026-02-15 | 2026-01-22 | https://github.com/colinhacks/zod |
| 5 | trpc/trpc | 39542 | 1488 | 2026-02-14 | 2026-02-09 | https://github.com/trpc/trpc |
| 6 | drizzle-team/drizzle-orm | 32788 | 1195 | 2026-02-15 | 2026-02-09 | https://github.com/drizzle-team/drizzle-orm |
| 7 | semantic-release/semantic-release | 23308 | 1796 | 2026-02-14 | 2026-01-30 | https://github.com/semantic-release/semantic-release |
| 8 | ajv-validator/ajv | 14595 | 942 | 2026-02-14 | 2026-02-14 | https://github.com/ajv-validator/ajv |
| 9 | open-telemetry/opentelemetry-js | 3276 | 996 | 2026-02-13 | 2026-02-12 | https://github.com/open-telemetry/opentelemetry-js |
| 10 | temporalio/sdk-typescript | 776 | 158 | 2026-02-15 | 2026-01-08 | https://github.com/temporalio/sdk-typescript |
| 11 | cli/cli | 42479 | 7938 | 2026-02-13 | 2026-01-21 | https://github.com/cli/cli |
| 12 | inngest/inngest | 4843 | 252 | 2026-02-14 | 2026-02-11 | https://github.com/inngest/inngest |

Last verified date (all candidates): 2026-02-15

---

## Candidate Details

### 1) SigNoz/signoz

FACT
- URL: https://github.com/SigNoz/signoz
- Signals (from `raw/top12_repo_metadata.json`): stars=25744, forks=1959, last_commit_date=2026-02-15, release_date=2026-02-11, last_verified_date=2026-02-15
- Why liked (evidence-first):
  - Claim: Shows an OSS observability product with extensive CI workflows and release automation.
    - Evidence: https://github.com/SigNoz/signoz/blob/df72c897f91e1457f6adf5c9fc14e3e3cc201a30/.github/workflows/releaser.yaml (date: UNVERIFIED)
  - Claim: Publishes an OpenAPI spec as a tracked artifact.
    - Evidence: https://github.com/SigNoz/signoz/blob/df72c897f91e1457f6adf5c9fc14e3e3cc201a30/docs/api/openapi.yml (date: UNVERIFIED)
- Inspect paths (examples):
  - https://github.com/SigNoz/signoz/blob/df72c897f91e1457f6adf5c9fc14e3e3cc201a30/docs/contributing/development.md
  - https://github.com/SigNoz/signoz/blob/df72c897f91e1457f6adf5c9fc14e3e3cc201a30/.github/workflows/jsci.yaml

INTERPRETATION
- Good benchmark for: governance docs, CI gates at scale, artifact-first APIs, release pipelines.

RECOMMENDATION
- Use as a reference for: workflow layout, API spec artifact handling, and reproducible developer docs.

### 2) langfuse/langfuse

FACT
- URL: https://github.com/langfuse/langfuse
- Signals: stars=21945, forks=2164, last_commit_date=2026-02-15, release_date=2026-02-12, last_verified_date=2026-02-15
- Why liked:
  - Claim: Demonstrates LLM observability and evaluation workflows, with a CI-heavy repo posture.
    - Evidence: https://github.com/langfuse/langfuse/blob/afa2143e8a10560088a2080a0d2f308f339c94fa/.github/workflows/pipeline.yml (date: UNVERIFIED)
  - Claim: Stores trace-like seed artifacts as data files (useful for deterministic fixtures).
    - Evidence: https://github.com/langfuse/langfuse/blob/afa2143e8a10560088a2080a0d2f308f339c94fa/packages/shared/scripts/seeder/utils/framework-traces/google-gemini-2025-08-01.json (date: UNVERIFIED)
- Inspect paths (examples):
  - https://github.com/langfuse/langfuse/blob/afa2143e8a10560088a2080a0d2f308f339c94fa/CONTRIBUTING.md
  - https://github.com/langfuse/langfuse/blob/afa2143e8a10560088a2080a0d2f308f339c94fa/.github/workflows/sdk-api-spec.yml

INTERPRETATION
- Good benchmark for: LLM tracing/evals as first-class concerns; CI workflows as governance.

RECOMMENDATION
- Use as a reference for: eval artifacts, CI layout, and operational hardening patterns.

### 3) Helicone/helicone

FACT
- URL: https://github.com/Helicone/helicone
- Signals: stars=5113, forks=481, last_commit_date=2026-02-13, release_date=2025-08-21, last_verified_date=2026-02-15
- Why liked:
  - Claim: Shows an OSS gateway/product with many targeted CI checks.
    - Evidence: https://github.com/Helicone/helicone/blob/bd1a3e3be30d2f69c9452667f7d62d02c0a43a7b/.github/workflows/e2e-test-suite.yml (date: UNVERIFIED)
  - Claim: Contains explicit typed client schemas (useful for boundary clarity).
    - Evidence: https://github.com/Helicone/helicone/blob/bd1a3e3be30d2f69c9452667f7d62d02c0a43a7b/bifrost/lib/clients/jawnTypes/public.ts (date: UNVERIFIED)
- Inspect paths:
  - https://github.com/Helicone/helicone/blob/bd1a3e3be30d2f69c9452667f7d62d02c0a43a7b/DEVELOPER_README.md
  - https://github.com/Helicone/helicone/blob/bd1a3e3be30d2f69c9452667f7d62d02c0a43a7b/.github/workflows/clickhouse-migration-check.yml

INTERPRETATION
- Good benchmark for: CI gating granularity, typed client boundary surfaces.

RECOMMENDATION
- Use as a reference for: dedicated workflow checks per risk area (migrations, e2e, typecheck).

### 4) colinhacks/zod

FACT
- URL: https://github.com/colinhacks/zod
- Signals: stars=41853, forks=1820, last_commit_date=2026-02-15, release_date=2026-01-22, last_verified_date=2026-02-15
- Why liked:
  - Claim: Demonstrates schema-first runtime validation with strong TS typing.
    - Evidence: https://github.com/colinhacks/zod/blob/c7805073fef5b6b8857307c3d4b3597a70613bc2/README.md (date: UNVERIFIED)
  - Claim: Maintains test coverage around parsing/validation behavior.
    - Evidence: https://github.com/colinhacks/zod/blob/c7805073fef5b6b8857307c3d4b3597a70613bc2/packages/zod/src/v4/classic/tests/async-parsing.test.ts (date: UNVERIFIED)
- Inspect paths:
  - https://github.com/colinhacks/zod/blob/c7805073fef5b6b8857307c3d4b3597a70613bc2/packages/zod/src/v4/core/schemas.ts
  - https://github.com/colinhacks/zod/blob/c7805073fef5b6b8857307c3d4b3597a70613bc2/.github/workflows/test.yml

INTERPRETATION
- Good benchmark for: boundary schemas, runtime validation, predictable error objects.

RECOMMENDATION
- Use as a reference for: minimizing stringly-typed boundaries and improving error taxonomy.

### 5) trpc/trpc

FACT
- URL: https://github.com/trpc/trpc
- Signals: stars=39542, forks=1488, last_commit_date=2026-02-14, release_date=2026-02-09, last_verified_date=2026-02-15
- Why liked:
  - Claim: Provides an end-to-end typesafe RPC boundary for TS apps.
    - Evidence: https://github.com/trpc/trpc/blob/08a7c997343105e479a1e0d488e7d882e3a60703/README.md (date: UNVERIFIED)
  - Claim: Includes client link patterns for retries and dedupe.
    - Evidence: https://github.com/trpc/trpc/blob/08a7c997343105e479a1e0d488e7d882e3a60703/packages/client/src/links/retryLink.ts (date: UNVERIFIED)
- Inspect paths:
  - https://github.com/trpc/trpc/blob/08a7c997343105e479a1e0d488e7d882e3a60703/packages/client/src/links/internals/dedupeLink.ts
  - https://github.com/trpc/trpc/blob/08a7c997343105e479a1e0d488e7d882e3a60703/.github/workflows/main.yml

INTERPRETATION
- Good benchmark for: typed module boundaries, middleware-based auth tiers.

RECOMMENDATION
- Use as a reference for: router modularization and testable API surface contracts.

### 6) drizzle-team/drizzle-orm

FACT
- URL: https://github.com/drizzle-team/drizzle-orm
- Signals: stars=32788, forks=1195, last_commit_date=2026-02-15, release_date=2026-02-09, last_verified_date=2026-02-15
- Why liked:
  - Claim: Demonstrates a type-driven DB layer with explicit adapters and migration utilities.
    - Evidence: https://github.com/drizzle-team/drizzle-orm/blob/e8e6edfef5ca69c6188d320388ad440265911057/README.md (date: UNVERIFIED)
  - Claim: Includes tracing utilities in the core library.
    - Evidence: https://github.com/drizzle-team/drizzle-orm/blob/e8e6edfef5ca69c6188d320388ad440265911057/drizzle-orm/src/tracing.ts (date: UNVERIFIED)
- Inspect paths:
  - https://github.com/drizzle-team/drizzle-orm/blob/e8e6edfef5ca69c6188d320388ad440265911057/drizzle-orm/src/migrator.ts
  - https://github.com/drizzle-team/drizzle-orm/blob/e8e6edfef5ca69c6188d320388ad440265911057/.github/workflows/release-latest.yaml

INTERPRETATION
- Good benchmark for: explicit data-layer boundaries and adapter-driven design.

RECOMMENDATION
- Use as a reference for: keeping DB boundary code isolated and typed, and adding trace hooks.

### 7) semantic-release/semantic-release

FACT
- URL: https://github.com/semantic-release/semantic-release
- Signals: stars=23308, forks=1796, last_commit_date=2026-02-14, release_date=2026-01-30, last_verified_date=2026-02-15
- Why liked:
  - Claim: Demonstrates automated releases driven by commit history.
    - Evidence: https://github.com/semantic-release/semantic-release/blob/be0ff3854cd97165de4317e30a7746197bfa7b3b/README.md (date: UNVERIFIED)
  - Claim: Maintains a CI workflow dedicated to releases.
    - Evidence: https://github.com/semantic-release/semantic-release/blob/be0ff3854cd97165de4317e30a7746197bfa7b3b/.github/workflows/release.yml (date: UNVERIFIED)
- Inspect paths:
  - https://github.com/semantic-release/semantic-release/blob/be0ff3854cd97165de4317e30a7746197bfa7b3b/docs/usage/README.md
  - https://github.com/semantic-release/semantic-release/blob/be0ff3854cd97165de4317e30a7746197bfa7b3b/.github/workflows/test.yml

INTERPRETATION
- Good benchmark for: governance through versioning policy and predictable releases.

RECOMMENDATION
- Use as a reference for: consistent versioning of ISA artifacts (schemas, datasets, advisory format).

### 8) ajv-validator/ajv

FACT
- URL: https://github.com/ajv-validator/ajv
- Signals: stars=14595, forks=942, last_commit_date=2026-02-14, release_date=2026-02-14, last_verified_date=2026-02-15
- Why liked:
  - Claim: Canonical JS/TS JSON Schema validator library with benchmarks and docs.
    - Evidence: https://github.com/ajv-validator/ajv/blob/142ce84b807c4fe66e619c22480a28d0e4bd50fa/README.md (date: UNVERIFIED)
  - Claim: Includes a `benchmark/` folder suitable as a reference for performance regression testing.
    - Evidence: https://github.com/ajv-validator/ajv/blob/142ce84b807c4fe66e619c22480a28d0e4bd50fa/benchmark/README.md (date: UNVERIFIED)
- Inspect paths:
  - https://github.com/ajv-validator/ajv/blob/142ce84b807c4fe66e619c22480a28d0e4bd50fa/lib/ajv.ts
  - https://github.com/ajv-validator/ajv/blob/142ce84b807c4fe66e619c22480a28d0e4bd50fa/.github/workflows/build.yml

INTERPRETATION
- Good benchmark for: schema validation as a CI gate and runtime contract.

RECOMMENDATION
- Use as a reference for: artifact schema validation and regression tests for generated JSON.

### 9) open-telemetry/opentelemetry-js

FACT
- URL: https://github.com/open-telemetry/opentelemetry-js
- Signals: stars=3276, forks=996, last_commit_date=2026-02-13, release_date=2026-02-12, last_verified_date=2026-02-15
- Why liked:
  - Claim: Reference implementation for OpenTelemetry in JS/TS.
    - Evidence: https://github.com/open-telemetry/opentelemetry-js/blob/ad92be4c2c1094745a85b0b7eeff1444a11b1b4a/README.md (date: UNVERIFIED)
  - Claim: Provides a Node tracer provider in a dedicated package.
    - Evidence: https://github.com/open-telemetry/opentelemetry-js/blob/ad92be4c2c1094745a85b0b7eeff1444a11b1b4a/packages/opentelemetry-sdk-trace-node/src/NodeTracerProvider.ts (date: UNVERIFIED)
- Inspect paths:
  - https://github.com/open-telemetry/opentelemetry-js/blob/ad92be4c2c1094745a85b0b7eeff1444a11b1b4a/.github/workflows/e2e.yml
  - https://github.com/open-telemetry/opentelemetry-js/blob/ad92be4c2c1094745a85b0b7eeff1444a11b1b4a/.github/workflows/benchmark.yml

INTERPRETATION
- Good benchmark for: tracing/metrics building blocks and instrumentation conventions.

RECOMMENDATION
- Use as a reference for: adding OTel spans around ISA ingestion, API, DB, and LLM calls.

### 10) temporalio/sdk-typescript

FACT
- URL: https://github.com/temporalio/sdk-typescript
- Signals: stars=776, forks=158, last_commit_date=2026-02-15, release_date=2026-01-08, last_verified_date=2026-02-15
- Why liked:
  - Claim: Demonstrates durable workflows, retries, and structured execution for long-running jobs.
    - Evidence: https://github.com/temporalio/sdk-typescript/blob/bebf54e2356a7b1d602d1a7ef4275621da1cf4a0/README.md (date: UNVERIFIED)
  - Claim: Provides OpenTelemetry interceptors as a separate package.
    - Evidence: https://github.com/temporalio/sdk-typescript/blob/bebf54e2356a7b1d602d1a7ef4275621da1cf4a0/packages/interceptors-opentelemetry/src/instrumentation.ts (date: UNVERIFIED)
- Inspect paths:
  - https://github.com/temporalio/sdk-typescript/blob/bebf54e2356a7b1d602d1a7ef4275621da1cf4a0/.github/workflows/ci.yml
  - https://github.com/temporalio/sdk-typescript/blob/bebf54e2356a7b1d602d1a7ef4275621da1cf4a0/docs/README.md

INTERPRETATION
- Good benchmark for: reliable ingestion scheduling, retries, and trace-friendly workflow engines.

RECOMMENDATION
- Use as a reference for: turning ingestion pipelines into durable tasks with explicit retry semantics.

### 11) cli/cli

FACT
- URL: https://github.com/cli/cli
- Signals: stars=42479, forks=7938, last_commit_date=2026-02-13, release_date=2026-01-21, last_verified_date=2026-02-15
- Why liked:
  - Claim: Demonstrates governance-grade docs for project layout and release processes.
    - Evidence: https://github.com/cli/cli/blob/1af2823fc330004cb1e00ecdde6032040237de6d/docs/project-layout.md (date: UNVERIFIED)
  - Claim: Maintains security/scanning workflows as part of CI posture.
    - Evidence: https://github.com/cli/cli/blob/1af2823fc330004cb1e00ecdde6032040237de6d/.github/workflows/codeql.yml (date: UNVERIFIED)
- Inspect paths:
  - https://github.com/cli/cli/blob/1af2823fc330004cb1e00ecdde6032040237de6d/docs/releasing.md
  - https://github.com/cli/cli/blob/1af2823fc330004cb1e00ecdde6032040237de6d/.github/workflows/go.yml

INTERPRETATION
- Good benchmark for: mature repo governance, release docs, and CI hygiene.

RECOMMENDATION
- Use as a reference for: documenting ISA project layout and release/versioning workflows.

### 12) inngest/inngest

FACT
- URL: https://github.com/inngest/inngest
- Signals: stars=4843, forks=252, last_commit_date=2026-02-14, release_date=2026-02-11, last_verified_date=2026-02-15
- Why liked:
  - Claim: Provides explicit engineering docs for adding and evolving APIs.
    - Evidence: https://github.com/inngest/inngest/blob/28f4a97dc3b37465aa974332a6dd4bf9597317b8/docs/IMPLEMENTING_NEW_REST_API_V2_ENDPOINTS.md (date: UNVERIFIED)
  - Claim: Documents OpenAPI workflow conventions.
    - Evidence: https://github.com/inngest/inngest/blob/28f4a97dc3b37465aa974332a6dd4bf9597317b8/docs/OPENAPI_WORKFLOW.md (date: UNVERIFIED)
- Inspect paths:
  - https://github.com/inngest/inngest/blob/28f4a97dc3b37465aa974332a6dd4bf9597317b8/.github/workflows/e2e.yml
  - https://github.com/inngest/inngest/blob/28f4a97dc3b37465aa974332a6dd4bf9597317b8/docs/DEVSERVER_ARCHITECTURE.md

INTERPRETATION
- Good benchmark for: ingestion/workflow product architecture docs and OpenAPI artifact workflows.

RECOMMENDATION
- Use as a reference for: ingestion reliability design docs and API evolution playbooks.
