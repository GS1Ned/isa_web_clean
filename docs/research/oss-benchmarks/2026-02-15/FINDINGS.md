# Findings - OSS Patterns (2026-02-15)

Last verified date (all patterns): 2026-02-15

## Pattern P-001 - Docs-As-Interface (Governance Docs + Developer Playbooks)

FACT
- Summary: High-signal projects treat docs as an interface: contributor workflows, project layout, and API artifacts live alongside code and are continuously validated.
- Evidence:
  - https://github.com/cli/cli/blob/1af2823fc330004cb1e00ecdde6032040237de6d/docs/project-layout.md (date: UNVERIFIED)
  - https://github.com/inngest/inngest/blob/28f4a97dc3b37465aa974332a6dd4bf9597317b8/docs/DEVSERVER_ARCHITECTURE.md (date: UNVERIFIED)
- Example repos and concrete paths:
  - https://github.com/cli/cli
    - `docs/project-layout.md`
    - `docs/release-process-deep-dive.md`
  - https://github.com/inngest/inngest
    - `docs/DEVSERVER_ARCHITECTURE.md`
    - `docs/PULL_REQUEST_GUIDELINES.md`

INTERPRETATION
- Tradeoffs:
  - More docs surface area means more maintenance, so CI needs fast doc gates.

RECOMMENDATION
- ISA mapping:
  - target_paths:
    - `docs/INDEX.md`
    - `docs/spec/**/RUNTIME_CONTRACT.md`
    - `docs/research/oss-benchmarks/2026-02-15/*`
  - change_outline: Add a small index entry under `docs/INDEX.md` for research packages and standardize a short header block in each research run (date, data sources, validator).
  - no_console_strategy: Documentation examples must use `serverLogger` (see `server/_core/logger-wiring.ts`) or `process.stdout/stderr.write` patterns; avoid any snippets containing `console\.`.

---

## Pattern P-002 - CI Workflows As Governance (Granular Gates)

FACT
- Summary: Mature repos split CI into many targeted workflows (lint, docs, security scans, release automation, API spec checks) to keep feedback loops fast and responsibility clear.
- Evidence:
  - https://github.com/langfuse/langfuse/blob/afa2143e8a10560088a2080a0d2f308f339c94fa/.github/workflows/pipeline.yml (date: UNVERIFIED)
  - https://github.com/Helicone/helicone/blob/bd1a3e3be30d2f69c9452667f7d62d02c0a43a7b/.github/workflows/clickhouse-migration-check.yml (date: UNVERIFIED)
- Example repos and concrete paths:
  - https://github.com/langfuse/langfuse
    - `.github/workflows/pipeline.yml`
    - `.github/workflows/sdk-api-spec.yml`
  - https://github.com/Helicone/helicone
    - `.github/workflows/e2e-test-suite.yml`
    - `.github/workflows/jawn-typecheck.yml`

INTERPRETATION
- Tradeoffs:
  - More workflows can increase complexity; mitigate with naming conventions and a short `docs/ci` index.

RECOMMENDATION
- ISA mapping:
  - target_paths:
    - `.github/workflows/*.yml`
    - `scripts/run-ci-tests.sh`
    - `scripts/refactor/validate_gates.sh`
  - change_outline: Add one small, scoped workflow (or script invoked by workflow) per governance gate: docs policy, schema validation, no-console gate, and deterministic artifact validation.
  - no_console_strategy: Gates should fail on `console\.` usage within code and new research outputs; allow `.github/` text to remain out of scope to avoid false positives.

---

## Pattern P-003 - Typed API Boundary With tRPC + Zod

FACT
- Summary: Strongly typed request/response boundaries reduce cross-module ambiguity and shrink agent context by making contracts explicit.
- Evidence:
  - https://github.com/trpc/trpc/blob/08a7c997343105e479a1e0d488e7d882e3a60703/README.md (date: UNVERIFIED)
  - https://github.com/colinhacks/zod/blob/c7805073fef5b6b8857307c3d4b3597a70613bc2/README.md (date: UNVERIFIED)
- Example repos and concrete paths:
  - https://github.com/trpc/trpc
    - `packages/client/src/links/retryLink.ts`
    - `packages/client/src/links/internals/dedupeLink.ts`
  - https://github.com/colinhacks/zod
    - `packages/zod/src/v4/core/schemas.ts`
    - `packages/zod/src/v4/classic/tests/async-parsing.test.ts`

INTERPRETATION
- Tradeoffs:
  - Requires discipline around modular router composition and shared types.

RECOMMENDATION
- ISA mapping:
  - target_paths:
    - `server/routers.ts`
    - `server/_core/trpc.ts`
    - `shared/*`
  - change_outline: Split `server/routers.ts` into domain routers (one file per domain) and keep the root router as composition only; require Zod input validation for mutations that touch DB/ingest.
  - no_console_strategy: Any API error path should call `serverLogger.error(...)` (not console methods) and include a trace id.

---

## Pattern P-004 - Artifact-First APIs (OpenAPI Specs + Checked In)

FACT
- Summary: Repos that publish an OpenAPI spec as a tracked file can validate clients, docs, and backward compatibility via CI.
- Evidence:
  - https://github.com/SigNoz/signoz/blob/df72c897f91e1457f6adf5c9fc14e3e3cc201a30/docs/api/openapi.yml (date: UNVERIFIED)
  - https://github.com/inngest/inngest/blob/28f4a97dc3b37465aa974332a6dd4bf9597317b8/docs/OPENAPI_WORKFLOW.md (date: UNVERIFIED)
- Example repos and concrete paths:
  - https://github.com/SigNoz/signoz
    - `docs/api/openapi.yml`
  - https://github.com/inngest/inngest
    - `docs/OPENAPI_WORKFLOW.md`
    - `docs/api_v2_examples.json`

INTERPRETATION
- Tradeoffs:
  - Specs can drift from implementation without automation.

RECOMMENDATION
- ISA mapping:
  - target_paths:
    - `docs/quality/schemas/*.schema.json`
    - `.github/workflows/schema-validation.yml`
    - `server/_core/index.ts`
  - change_outline: Where ISA produces JSON artifacts, add schemas and validate in CI; consider adding an OpenAPI export for non-tRPC consumers if needed.
  - no_console_strategy: Validation scripts should report failures via exit codes and (if needed) structured stderr output, not console methods.

---

## Pattern P-005 - Schema Validation In CI (AJV)

FACT
- Summary: JSON Schema validation is a reliable, low-cost CI gate for generated artifacts and contract files.
- Evidence:
  - https://github.com/ajv-validator/ajv/blob/142ce84b807c4fe66e619c22480a28d0e4bd50fa/README.md (date: UNVERIFIED)
  - https://github.com/GS1Ned/isa_web_clean/blob/e91943c/.github/workflows/schema-validation.yml (date: UNVERIFIED)
- Example repos and concrete paths:
  - https://github.com/ajv-validator/ajv
    - `lib/ajv.ts`
    - `.github/workflows/build.yml`
  - https://github.com/GS1Ned/isa_web_clean
    - `.github/workflows/schema-validation.yml`
    - `docs/quality/schemas/*.schema.json`

INTERPRETATION
- Tradeoffs:
  - Schemas need ownership; treat them as versioned contracts.

RECOMMENDATION
- ISA mapping:
  - target_paths:
    - `docs/quality/schemas/`
    - `.github/workflows/schema-validation.yml`
    - `scripts/validation/`
  - change_outline: Add schemas for any new generated artifacts (including research JSON) and validate them with AJV CLI in CI.
  - no_console_strategy: Ensure validator scripts are silent on success and print structured failure messages to stderr.

---

## Pattern P-006 - Tracing and Metrics Via OpenTelemetry

FACT
- Summary: OpenTelemetry provides a standard vocabulary and SDKs to add spans/metrics around HTTP, DB, and background work.
- Evidence:
  - https://opentelemetry.io/docs/ (date: UNVERIFIED)
  - https://github.com/open-telemetry/opentelemetry-js/blob/ad92be4c2c1094745a85b0b7eeff1444a11b1b4a/packages/opentelemetry-sdk-trace-node/src/NodeTracerProvider.ts (date: UNVERIFIED)
- Example repos and concrete paths:
  - https://github.com/open-telemetry/opentelemetry-js
    - `packages/opentelemetry-sdk-trace-node/src/NodeTracerProvider.ts`
  - https://github.com/temporalio/sdk-typescript
    - `packages/interceptors-opentelemetry/src/instrumentation.ts`

INTERPRETATION
- Tradeoffs:
  - Requires exporter decisions (OTLP endpoint, sampling, PII policy).

RECOMMENDATION
- ISA mapping:
  - target_paths:
    - `server/_core/index.ts`
    - `server/db-connection.ts`
    - `server/_core/llm.ts`
    - `server/_core/performance-monitoring.ts`
  - change_outline: Add OTel spans around API requests, DB queries, ingestion jobs, and LLM calls; attach trace ids to `serverLogger` meta and error ledger rows.
  - no_console_strategy: Logging stays routed through `serverLogger` and error ledger persistence, never direct console methods.

---

## Pattern P-007 - Durable Workflows For Reliability (Retries, Idempotency)

FACT
- Summary: Workflow engines and explicit retry policies make ingestion pipelines resilient and observable.
- Evidence:
  - https://docs.temporal.io/ (date: UNVERIFIED)
  - https://github.com/temporalio/sdk-typescript/blob/bebf54e2356a7b1d602d1a7ef4275621da1cf4a0/README.md (date: UNVERIFIED)
- Example repos and concrete paths:
  - https://github.com/temporalio/sdk-typescript
    - `packages/worker/`
    - `packages/workflow/`
  - https://github.com/trpc/trpc
    - `packages/client/src/links/retryLink.ts`

INTERPRETATION
- Tradeoffs:
  - Adds infrastructure complexity; best used for ingestion and scheduled jobs.

RECOMMENDATION
- ISA mapping:
  - target_paths:
    - `server/ingest/**`
    - `server/cron-*`
    - `server/_core/performance-monitoring.ts`
  - change_outline: Define idempotency keys per ingest item, persist provenance (source URL, retrieval timestamp, hash), and apply bounded retries with backoff.
  - no_console_strategy: Emit structured events to `serverLogger` with trace id and store failures in `error_ledger`.

---

## Pattern P-008 - Release Automation and Versioned Artifacts

FACT
- Summary: Automated releases reduce manual drift and make artifact versioning explicit.
- Evidence:
  - https://github.com/semantic-release/semantic-release/blob/be0ff3854cd97165de4317e30a7746197bfa7b3b/README.md (date: UNVERIFIED)
  - https://github.com/SigNoz/signoz/blob/df72c897f91e1457f6adf5c9fc14e3e3cc201a30/.github/workflows/release-drafter.yml (date: UNVERIFIED)
- Example repos and concrete paths:
  - https://github.com/semantic-release/semantic-release
    - `.github/workflows/release.yml`
    - `docs/usage/README.md`
  - https://github.com/SigNoz/signoz
    - `.github/workflows/release-drafter.yml`

INTERPRETATION
- Tradeoffs:
  - Requires consistent commit discipline and changelog conventions.

RECOMMENDATION
- ISA mapping:
  - target_paths:
    - `package.json`
    - `docs/CHANGELOG.md`
    - `.github/workflows/*`
  - change_outline: Adopt a consistent artifact versioning approach for ISA JSON artifacts (schemas, datasets registry, advisory format) and automate release notes.
  - no_console_strategy: Release scripts should exit non-zero on failure and use structured stderr output only.

---

## Pattern P-009 - Deterministic Fixtures for Traces and Evaluations

FACT
- Summary: High-signal repos store small deterministic fixture artifacts (trace samples, eval inputs) as versioned files to make regressions reproducible.
- Evidence:
  - https://github.com/langfuse/langfuse/blob/afa2143e8a10560088a2080a0d2f308f339c94fa/packages/shared/scripts/seeder/utils/framework-traces/beeai-2025-08-01.json (date: UNVERIFIED)
  - https://github.com/openai/evals (date: UNVERIFIED)
- Example repos and concrete paths:
  - https://github.com/langfuse/langfuse
    - `packages/shared/scripts/seeder/utils/framework-traces/*.json`

INTERPRETATION
- Tradeoffs:
  - Fixture curation takes time; keep them small and versioned.

RECOMMENDATION
- ISA mapping:
  - target_paths:
    - `scripts/run-rag-evaluation.cjs`
    - `data/metadata/`
    - `test-results/ci/`
  - change_outline: Add a small set of deterministic evaluation inputs and expected outputs (JSON) with schema validation; integrate into CI as a fast regression gate.
  - no_console_strategy: Evaluation harness should write machine-readable artifacts to disk and use `serverLogger` only for structured failure reporting.

---

## Phase 6A - Capability Rubric Mapping (2026-02-20)

FACT
- Benchmarking now requires five dimensions per capability:
  - `reliability`, `security`, `observability`, `data_provenance`, `evaluation_quality`
- Evidence for each mapped practice must include:
  - source URL, retrieval UTC date, capability mapping, and verification method (`gate`, `test`, or `artifact`).

RECOMMENDATION
- Primary emphasis by capability:
  - `ASK_ISA`: evaluation_quality, observability, security
  - `NEWS_HUB`: reliability, observability, data_provenance
  - `KNOWLEDGE_BASE`: data_provenance, security, observability
  - `CATALOG`: data_provenance, reliability, security
  - `ESRS_MAPPING`: evaluation_quality, data_provenance, reliability
  - `ADVISORY`: reliability, security, observability
