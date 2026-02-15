# ISA Action Plan (Minimal, Audit-Ready)

Last verified date: 2026-02-15

## FACT
- Action count: 10 (required: 10–18).

## INTERPRETATION
- Actions focus on provenance, enforceable governance, and deterministic evidence artefacts with minimal changes to ISA’s current architecture.

## RECOMMENDATION
- Execute P0 items first; they unlock audit readiness and reduce future refactor cost.

## AP-0001: Add provenance event model for ingestion and mapping runs

- Priority: P0
- Expected value: End-to-end audit tracing across ingestion/mapping/LLM steps.
- Effort: M
- Risk: Medium
- Required ISA files/paths:
  - drizzle/schema_pipeline_observability.ts
  - server/utils/pipeline-logger.ts
  - server/db-pipeline-observability.ts
- Acceptance criteria (testable):
  - A run event record exists for each ingestion step with stable run_id and timestamps.
  - Events link to stored artefacts (source URLs, hashes).
  - A query endpoint returns run event timelines.
- No-output-API compliance: Use DB writes and structured server logger; avoid direct output API usage.
- Evidence links:
  - GitHub repository file: OpenLineage spec / reference materials: https://github.com/OpenLineage/OpenLineage/blob/main/spec/facets/BaseSubsetDatasetFacet.json (date: UNVERIFIED (reason: date not retrieved))
  - GitHub repository file: Marquez lineage service docs: https://github.com/MarquezProject/marquez/blob/main/docs/README.md (date: UNVERIFIED (reason: date not retrieved))

Last verified date: 2026-02-15

## AP-0002: Introduce policy-as-code gates for evidence completeness

- Priority: P0
- Expected value: Governance gates become auditable and testable; reduces inconsistent enforcement.
- Effort: M
- Risk: Medium
- Required ISA files/paths:
  - docs/governance
  - scripts
  - server/_core
- Acceptance criteria (testable):
  - At least 2 governance gates exist with tests and fixture inputs.
  - CI fails when evidence artefacts violate gate rules.
- No-output-API compliance: Gates run as scripts with exit codes; runtime uses structured logger only.
- Evidence links:
  - GitHub repository file: OPA policy language / operations docs: https://github.com/open-policy-agent/opa/blob/main/docs/docs/policy-language.md (date: UNVERIFIED (reason: date not retrieved))
  - GitHub repository file: Kyverno policy docs: https://github.com/kyverno/kyverno/blob/main/docs/dev/README.md (date: UNVERIFIED (reason: date not retrieved))

Last verified date: 2026-02-15

## AP-0003: Define and enforce JSON schemas for all generated evidence artefacts

- Priority: P0
- Expected value: Prevents evidence drift; enables deterministic validation and audit readiness.
- Effort: S
- Risk: Low
- Required ISA files/paths:
  - docs/quality/schemas
  - .github/workflows/schema-validation.yml
- Acceptance criteria (testable):
  - Every artefact under docs/evidence/_generated has a schema.
  - Schema validation runs in CI and fails on mismatch.
- No-output-API compliance: Validation uses exit codes; avoid direct output API usage.
- Evidence links:
  - GitHub Actions workflow: ISA schema-validation workflow: https://github.com/GS1Ned/isa_web_clean/blob/strict-no-console/.github/workflows/schema-validation.yml (date: 2026-02-12T12:07:21+01:00)
  - GitHub repository file: dbt-core deterministic artefacts mindset (entry doc): https://github.com/dbt-labs/dbt-core/blob/main/README.md (date: UNVERIFIED (reason: date not retrieved))

Last verified date: 2026-02-15

## AP-0004: Add LLM trace tables with retention and redaction policy

- Priority: P0
- Expected value: Traceable, reproducible LLM outputs with privacy controls.
- Effort: M
- Risk: High
- Required ISA files/paths:
  - server/_core/llm.ts
  - drizzle/schema_*
  - server/routers/ask-isa-v2.js
- Acceptance criteria (testable):
  - LLM traces persist prompt template version, retrieval set IDs, and model config.
  - A retention job deletes or redacts sensitive fields after configured window.
- No-output-API compliance: Use structured server logger; avoid direct output API usage.
- Evidence links:
  - GitHub repository file: Langfuse tracing/evaluation (entry doc): https://github.com/langfuse/langfuse/blob/main/README.md (date: UNVERIFIED (reason: date not retrieved))
  - GitHub repository file: Phoenix LLM/RAG observability/eval (entry doc): https://github.com/Arize-ai/phoenix/blob/main/README.md (date: UNVERIFIED (reason: date not retrieved))

Last verified date: 2026-02-15

## AP-0005: Create a machine-readable capability map for agent navigation

- Priority: P1
- Expected value: Deterministic navigation for agents and reviewers; reduces onboarding time.
- Effort: S
- Risk: Low
- Required ISA files/paths:
  - REPO_TREE.md
  - AGENTS.md
  - docs/spec
- Acceptance criteria (testable):
  - A JSON capability map exists and is validated in CI.
  - Map links each capability to entrypoints, routers, schemas, and tests.
- No-output-API compliance: Generator writes files and fails via exit code only.
- Evidence links:
  - GitHub repository file: ISA repo map artefact: https://github.com/GS1Ned/isa_web_clean/blob/strict-no-console/REPO_TREE.md (date: 2026-02-15T13:43:02+01:00)
  - GitHub Actions workflow: ISA repo-tree workflow: https://github.com/GS1Ned/isa_web_clean/blob/strict-no-console/.github/workflows/repo-tree.yml (date: 2026-02-10T01:46:32+01:00)

Last verified date: 2026-02-15

## AP-0006: Enable security hygiene workflows (static analysis, dependency checks)

- Priority: P1
- Expected value: Improves supply-chain assurance and reduces security debt.
- Effort: S
- Risk: Medium
- Required ISA files/paths:
  - .github/workflows
  - SECURITY.md
- Acceptance criteria (testable):
  - Static analysis workflow runs on PRs.
  - Security policy file exists and is referenced in README.
- No-output-API compliance: CI tooling uses exit codes and summaries.
- Evidence links:
  - GitHub repository file: dbt-core deterministic artefacts (entry doc): https://github.com/dbt-labs/dbt-core/blob/main/README.md (date: UNVERIFIED (reason: date not retrieved))
  - GitHub repository file: ISA advisory canonicaliser: https://github.com/GS1Ned/isa_web_clean/blob/strict-no-console/scripts/canonicalize_advisory.cjs (date: 2026-02-04T17:38:10+01:00)

Last verified date: 2026-02-15

## AP-0007: Add drift detection for benchmarks and evidence artefacts

- Priority: P1
- Expected value: Detects governance/architecture drift early; makes regressions visible.
- Effort: M
- Risk: Low
- Required ISA files/paths:
  - docs/research
  - scripts
  - .github/workflows
- Acceptance criteria (testable):
  - CI compares regenerated benchmark JSON to committed version and fails on unapproved drift.
  - A documented override/approval process exists (ADR).
- No-output-API compliance: Use structured diffs and exit codes.
- Evidence links:
  - GitHub repository file: ISA benchmark validator (existing): https://github.com/GS1Ned/isa_web_clean/blob/strict-no-console/scripts/validate_oss_benchmarks_2026_02_15.sh (date: 2026-02-15T18:57:02+01:00)
  - GitHub repository file: Cosign provenance mindset (entry doc): https://github.com/sigstore/cosign/blob/main/README.md (date: UNVERIFIED (reason: date not retrieved))

Last verified date: 2026-02-15

## AP-0008: Standardise run_id propagation through API context

- Priority: P1
- Expected value: End-to-end traceability for requests and background jobs.
- Effort: S
- Risk: Low
- Required ISA files/paths:
  - server/_core/context.ts
  - server/utils/server-logger.ts
- Acceptance criteria (testable):
  - All major procedures include run_id/trace_id in ledger rows.
  - Monitoring endpoints can filter by run_id.
- No-output-API compliance: Use structured logger and DB ledger only.
- Evidence links:
  - GitHub repository file: ISA trace_id in structured logger: https://github.com/GS1Ned/isa_web_clean/blob/strict-no-console/server/utils/server-logger.ts (date: 2026-02-15T14:34:04+01:00)
  - GitHub repository file: Langfuse trace-first approach (entry doc): https://github.com/langfuse/langfuse/blob/main/README.md (date: UNVERIFIED (reason: date not retrieved))

Last verified date: 2026-02-15

## AP-0009: Define entity ID conventions for regulations, standards, and mappings

- Priority: P1
- Expected value: Enables stable joins and provenance; reduces ambiguous linking.
- Effort: M
- Risk: Medium
- Required ISA files/paths:
  - drizzle/schema.ts
  - data/metadata
  - server/db.ts
- Acceptance criteria (testable):
  - Every regulation/standard/mapping row has a stable canonical ID.
  - Provenance includes source URL + retrieval timestamp + hash.
- No-output-API compliance: Migration and ETL scripts use structured logging only.
- Evidence links:
  - GitHub repository file: OpenMetadata entity-centric governance (entry doc): https://github.com/open-metadata/OpenMetadata/blob/main/README.md (date: UNVERIFIED (reason: date not retrieved))
  - GitHub repository file: DataHub metadata graph (entry doc): https://github.com/datahub-project/datahub/blob/master/README.md (date: UNVERIFIED (reason: date not retrieved))

Last verified date: 2026-02-15

## AP-0010: Refine docs IA with a canonical index and ownership

- Priority: P2
- Expected value: Improves maintainability and reduces doc entropy.
- Effort: S
- Risk: Low
- Required ISA files/paths:
  - docs/spec
  - docs/governance
  - docs/architecture
- Acceptance criteria (testable):
  - Docs index exists with allowed paths.
  - Link checks run in CI.
- No-output-API compliance: Docs tooling uses exit codes only.
- Evidence links:
  - GitHub repository file: Backstage docs entrypoint: https://github.com/backstage/backstage/blob/master/README.md (date: UNVERIFIED (reason: date not retrieved))
  - GitHub repository file: OPA docs entrypoint: https://github.com/open-policy-agent/opa/blob/main/README.md (date: UNVERIFIED (reason: date not retrieved))

Last verified date: 2026-02-15
