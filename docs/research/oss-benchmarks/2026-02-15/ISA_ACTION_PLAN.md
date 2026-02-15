# ISA Action Plan (From OSS Benchmarks) - 2026-02-15

Last verified date: 2026-02-15

## AP-0001 (P0) - Enforce Scoped No-Console Gate

FACT
- Evidence:
  - Existing (disabled) workflow: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/.github/workflows/console-check.yml.disabled
  - Existing logger facade: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/server/utils/server-logger.ts

RECOMMENDATION
- Priority: P0
- Effort: S
- Value: Prevent regressions and keep logs routable through ISA's logger facade.
- Risk: Low (scoped grep only).
- Files (targets):
  - `.github/workflows/*` (new or enable/adjust existing)
  - `scripts/gates/*` (optional)
- Acceptance criteria:
  - CI fails if `console\.` appears under `server/`, `client/`, `shared/`, `scripts/` (excluding legacy text in `.github/`).
  - CI passes on `strict-no-console` with no new violations.
  - Developer guidance points to `serverLogger` usage.
- No-console compliance:
  - All examples and new code use `serverLogger` or `process.stdout/stderr.write` patterns, never console methods.

---

## AP-0002 (P0) - Modularize `server/routers.ts` Into Domain Routers

FACT
- Evidence:
  - Current router composition is large: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/server/routers.ts
  - tRPC router composition docs: https://trpc.io/docs/router (date: UNVERIFIED)

RECOMMENDATION
- Priority: P0
- Effort: M
- Value: Reduce agent context, improve ownership, and make changes safer.
- Risk: Medium (routing/exports churn).
- Files (targets):
  - `server/routers.ts`
  - `server/routers/*.ts` (new modules)
  - `server/_core/trpc.ts`
- Acceptance criteria:
  - `server/routers.ts` becomes composition only (imports and mounts sub-routers).
  - Each domain router has Zod inputs for mutations and at least one focused test.
  - Existing routes keep backwards-compatible names.
- No-console compliance:
  - Error paths use `serverLogger.error(...)` and include trace ids.

---

## AP-0003 (P0) - Trace ID Propagation + Error Ledger Correlation

FACT
- Evidence:
  - Error ledger persistence wiring: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/server/_core/logger-wiring.ts
  - OpenTelemetry trace concepts: https://opentelemetry.io/docs/concepts/signals/traces/ (date: UNVERIFIED)

RECOMMENDATION
- Priority: P0
- Effort: M
- Value: Makes incidents debuggable by correlating API requests, DB calls, and LLM calls.
- Risk: Medium (touches many call sites).
- Files (targets):
  - `server/_core/index.ts` (request middleware)
  - `server/utils/server-logger.ts`
  - `server/_core/logger-wiring.ts`
  - `server/_core/llm.ts`
- Acceptance criteria:
  - Every request has a trace id (header or generated) and it is attached to logs and error ledger rows.
  - LLM invocation records and ingest jobs include trace ids.
  - No secrets are logged; only variable names and safe metadata.
- No-console compliance:
  - Structured stderr/stdout writes only through logger facade.

---

## AP-0004 (P0) - Ingestion Reliability: Idempotency + Provenance + Retries

FACT
- Evidence:
  - Temporal durability concept reference: https://docs.temporal.io/ (date: UNVERIFIED)
  - tRPC retry link pattern (conceptual reference for retries): https://github.com/trpc/trpc/blob/08a7c997343105e479a1e0d488e7d882e3a60703/packages/client/src/links/retryLink.ts

RECOMMENDATION
- Priority: P0
- Effort: L
- Value: Prevent duplicates, make reprocessing safe, and improve ingestion observability.
- Risk: High (touches data writes and scheduling semantics).
- Files (targets):
  - `server/ingest/**`
  - `server/db.ts`
  - `drizzle/schema/*` (provenance tables)
- Acceptance criteria:
  - Each ingest item has an idempotency key and is deduped at write boundary.
  - Provenance stored: source URL, retrieval timestamp, content hash, parser version.
  - Retries use bounded backoff and surface failures via error ledger.
- No-console compliance:
  - Ingestion logs routed through `serverLogger` with trace ids.

---

## AP-0005 (P1) - Add JSON Schema + AJV Validation for Research Artifacts

FACT
- Evidence:
  - AJV project: https://github.com/ajv-validator/ajv
  - ISA schema validation workflow: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/.github/workflows/schema-validation.yml

RECOMMENDATION
- Priority: P1
- Effort: S
- Value: Prevents silent drift in `benchmarks.json` and future research JSON.
- Risk: Low.
- Files (targets):
  - `docs/quality/schemas/oss-benchmarks-2026-02-15.schema.json` (new)
  - `.github/workflows/schema-validation.yml` (extend)
- Acceptance criteria:
  - `benchmarks.json` validates against the new schema in CI.
  - Arrays and required keys are enforced.
- No-console compliance:
  - Validator emits failures via exit code and stderr only.

---

## AP-0006 (P1) - Baseline OpenTelemetry Instrumentation for ISA

FACT
- Evidence:
  - OpenTelemetry JS SDK: https://github.com/open-telemetry/opentelemetry-js
  - SigNoz project (OTel backend example): https://github.com/SigNoz/signoz

RECOMMENDATION
- Priority: P1
- Effort: L
- Value: Unified tracing for API, DB, ingestion, and LLM calls.
- Risk: Medium (exporter config, PII policy).
- Files (targets):
  - `server/_core/index.ts`
  - `server/db-connection.ts`
  - `server/_core/llm.ts`
  - `server/_core/performance-monitoring.ts`
- Acceptance criteria:
  - Traces are emitted in dev with a local exporter and configurable in production.
  - Spans include trace id and key attributes without secrets.
- No-console compliance:
  - No instrumentation code uses console methods; route logs through `serverLogger`.

---

## AP-0007 (P1) - Deterministic RAG Evaluation Fixtures + Schema

FACT
- Evidence:
  - Langfuse stores trace fixtures as data: https://github.com/langfuse/langfuse/blob/afa2143e8a10560088a2080a0d2f308f339c94fa/packages/shared/scripts/seeder/utils/framework-traces/google-gemini-2025-08-01.json
  - ISA has an eval runner script present: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/scripts/run-rag-evaluation.cjs

RECOMMENDATION
- Priority: P1
- Effort: M
- Value: Makes RAG quality changes measurable and reproducible.
- Risk: Medium (dataset curation).
- Files (targets):
  - `data/metadata/` (fixtures)
  - `docs/quality/schemas/` (eval report schema)
  - `scripts/run-rag-evaluation.cjs`
- Acceptance criteria:
  - A small fixture set runs in CI and produces a JSON report validated by schema.
  - Report includes trace ids and evaluation metadata.
- No-console compliance:
  - Runner writes artifacts to disk and uses `serverLogger` for structured error reporting.

---

## AP-0008 (P2) - Version and Release ISA Artifacts Predictably

FACT
- Evidence:
  - semantic-release automation: https://github.com/semantic-release/semantic-release
  - ISA has multiple evolving artifacts (schemas, datasets): https://github.com/GS1Ned/isa_web_clean/blob/e91943c/docs/DATASETS_CATALOG.json

RECOMMENDATION
- Priority: P2
- Effort: M
- Value: Predictable versioning for consumers of ISA artifacts.
- Risk: Medium (requires conventions).
- Files (targets):
  - `docs/CHANGELOG.md`
  - `.github/workflows/*` (release automation)
- Acceptance criteria:
  - Define versioning rules for datasets registry and advisory artifacts.
  - Automate changelog generation and tagging.
- No-console compliance:
  - Release scripts emit structured stderr on failure; no console usage.

---

## AP-0009 (P2) - Ownership and Review Boundaries (CODEOWNERS)

FACT
- Evidence:
  - GitHub CODEOWNERS docs: https://docs.github.com/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners (date: UNVERIFIED)
  - ISA has many high-risk areas (ingest, core, schemas): https://github.com/GS1Ned/isa_web_clean/tree/e91943c/server

RECOMMENDATION
- Priority: P2
- Effort: S
- Value: Makes changes to high-risk areas reviewable and governed.
- Risk: Low.
- Files (targets):
  - `CODEOWNERS`
- Acceptance criteria:
  - High-risk folders require review by named owners.
- No-console compliance:
  - No impact on runtime output; policy only.

---

## AP-0010 (P2) - CI Index and Naming Convention Doc

FACT
- Evidence:
  - ISA uses multiple workflows already: https://github.com/GS1Ned/isa_web_clean/tree/e91943c/.github/workflows
  - Helicone demonstrates many narrowly scoped workflows: https://github.com/Helicone/helicone/tree/bd1a3e3be30d2f69c9452667f7d62d02c0a43a7b/.github/workflows

RECOMMENDATION
- Priority: P2
- Effort: S
- Value: Reduces "mystery CI" and improves fast feedback.
- Risk: Low.
- Files (targets):
  - `docs/CI_TESTING.md` (extend)
  - `docs/ci/INDEX.md` (new)
- Acceptance criteria:
  - Document each workflow and what it gates.
  - Define naming conventions for workflows and scripts.
- No-console compliance:
  - Docs avoid examples with console methods.
