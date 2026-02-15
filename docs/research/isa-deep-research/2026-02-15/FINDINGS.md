# Findings (Reusable Patterns)

Last verified date: 2026-02-15

## FACT
- Pattern count: 15 (required: 12–18).

## INTERPRETATION
- ISA can increase audit readiness by standardising provenance, enforceable gates, and deterministic evidence artefacts with minimal refactors.

## RECOMMENDATION
- Implement P0/P1 actions by adopting these patterns incrementally, with schema validation and testable acceptance criteria.

## Policy-as-Code Governance Gates

Define audit gates as versioned policies with explicit inputs/outputs and test fixtures; keep policy evaluation separate from application code.

### Evidence Records
- title: OPA policy language / operations docs
  - url: https://github.com/open-policy-agent/opa/blob/main/docs/docs/policy-language.md
  - date: UNVERIFIED (reason: date not retrieved)
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15
- title: Kyverno policy docs
  - url: https://github.com/kyverno/kyverno/blob/main/docs/dev/README.md
  - date: UNVERIFIED (reason: date not retrieved)
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15

### Example Repos + Concrete Paths
- repo: https://github.com/open-policy-agent/opa
  - docs/docs/policy-language.md
- repo: https://github.com/kyverno/kyverno
  - docs/dev/README.md

### Tradeoffs / Failure Modes
- Policy sprawl risk: requires ownership, review, and deprecation policy.
- Performance considerations for complex policies; requires profiling and caching.

### ISA Mapping
- target ISA paths:
  - docs/governance
  - server/_core
  - server/routers
- minimal change outline: Introduce a policy evaluation boundary for governance rules (inputs: artefact metadata; outputs: allow/deny + reasons). Start with 1-2 high-value gates (evidence completeness, citation presence) and add tests as fixtures.
- no-output-API strategy: Use existing structured logger (`server/utils/server-logger.ts`) for diagnostics; avoid direct output API usage.

Last verified date: 2026-02-15

## Provenance Events (OpenLineage-style)

Model ingestion and transformation runs as immutable events with stable identifiers, timestamps, inputs/outputs, and run facets; store as auditable artefacts.

### Evidence Records
- title: OpenLineage spec / reference materials
  - url: https://github.com/OpenLineage/OpenLineage/blob/main/spec/facets/BaseSubsetDatasetFacet.json
  - date: UNVERIFIED (reason: date not retrieved)
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15
- title: Marquez lineage service docs
  - url: https://github.com/MarquezProject/marquez/blob/main/docs/README.md
  - date: UNVERIFIED (reason: date not retrieved)
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15

### Example Repos + Concrete Paths
- repo: https://github.com/OpenLineage/OpenLineage
  - spec/facets/BaseSubsetDatasetFacet.json
- repo: https://github.com/MarquezProject/marquez
  - docs/README.md

### Tradeoffs / Failure Modes
- Requires consistent entity IDs; retrofitting IDs later is expensive.
- High-cardinality facets can inflate storage and query costs.

### ISA Mapping
- target ISA paths:
  - server/cron-endpoint.ts
  - server/utils/pipeline-logger.ts
  - drizzle/schema_pipeline_observability.ts
- minimal change outline: Add a minimal provenance event table and emit one event per ingestion step (source fetch, parse, normalise, embed, persist). Link events to existing pipeline execution logs.
- no-output-API strategy: Emit events via DB writes and structured logger; avoid direct output API usage.

Last verified date: 2026-02-15

## Schema-Validated Evidence Artefacts in CI

Treat generated artefacts (scorecards, catalogues, benchmarks) as schema-validated evidence. Enforce parsing + schema validation in CI before merge.

### Evidence Records
- title: ISA schema-validation workflow
  - url: https://github.com/GS1Ned/isa_web_clean/blob/strict-no-console/.github/workflows/schema-validation.yml
  - date: 2026-02-12T12:07:21+01:00
  - type: GitHub Actions workflow
  - format: web
  - last verified date: 2026-02-15
- title: dbt-core deterministic artefacts mindset (entry doc)
  - url: https://github.com/dbt-labs/dbt-core/blob/main/README.md
  - date: UNVERIFIED (reason: date not retrieved)
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15

### Example Repos + Concrete Paths
- repo: https://github.com/GS1Ned/isa_web_clean
  - .github/workflows/schema-validation.yml
  - docs/quality/schemas
- repo: https://github.com/dbt-labs/dbt-core
  - README.md

### Tradeoffs / Failure Modes
- Schemas require maintenance; breaking schema changes must be versioned.

### ISA Mapping
- target ISA paths:
  - docs/quality/schemas
  - docs/evidence/_generated
  - test-results/ci
- minimal change outline: Define JSON schemas for each evidence artefact and enforce AJV validation in CI. Add drift checks by comparing current vs previous artefact snapshots.
- no-output-API strategy: CI steps rely on exit codes and structured artefact output; avoid direct output API usage.

Last verified date: 2026-02-15

## Deterministic Repo Map for Humans and Agents

Generate and maintain deterministic repo maps (tree + capability index + contracts) so both humans and automation can navigate without guesswork.

### Evidence Records
- title: ISA repo map artefact
  - url: https://github.com/GS1Ned/isa_web_clean/blob/strict-no-console/REPO_TREE.md
  - date: 2026-02-15T13:43:02+01:00
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15
- title: ISA repo-tree workflow
  - url: https://github.com/GS1Ned/isa_web_clean/blob/strict-no-console/.github/workflows/repo-tree.yml
  - date: 2026-02-10T01:46:32+01:00
  - type: GitHub Actions workflow
  - format: web
  - last verified date: 2026-02-15

### Example Repos + Concrete Paths
- repo: https://github.com/GS1Ned/isa_web_clean
  - REPO_TREE.md
  - .github/workflows/repo-tree.yml

### Tradeoffs / Failure Modes
- Repo maps must be regenerated consistently; otherwise they become misleading.

### ISA Mapping
- target ISA paths:
  - REPO_TREE.md
  - docs/spec
  - docs/governance
- minimal change outline: Add a machine-readable capability map (JSON) that points to entrypoints, routers, schemas, and tests. Validate it in CI.
- no-output-API strategy: Generator writes to files and fails via exit code.

Last verified date: 2026-02-15

## Trace-First LLM Calls + Evaluation Loop

Treat each LLM call as a traceable unit with inputs, outputs, model config, tool calls, and evaluation results; store datasets and run evaluations continuously.

### Evidence Records
- title: Langfuse tracing/evaluation (entry doc)
  - url: https://github.com/langfuse/langfuse/blob/main/README.md
  - date: UNVERIFIED (reason: date not retrieved)
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15
- title: Phoenix LLM/RAG observability/eval (entry doc)
  - url: https://github.com/Arize-ai/phoenix/blob/main/README.md
  - date: UNVERIFIED (reason: date not retrieved)
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15

### Example Repos + Concrete Paths
- repo: https://github.com/langfuse/langfuse
  - README.md
- repo: https://github.com/Arize-ai/phoenix
  - README.md

### Tradeoffs / Failure Modes
- Trace data can contain sensitive content; requires retention, redaction, and access controls.
- High volume tracing increases storage costs; requires sampling and aggregation.

### ISA Mapping
- target ISA paths:
  - server/_core/llm.ts
  - server/routers/ask-isa-v2.js
  - drizzle/schema_*
- minimal change outline: Add a trace table keyed by request ID + invocation ID; store prompt template version, retrieval set IDs, and evaluation scores. Provide an evaluation runner that uses fixed datasets.
- no-output-API strategy: Persist trace rows and use structured server logger; avoid direct output API usage.

Last verified date: 2026-02-15

## Idempotent Ingestion with Run Ledgers

Make ingestion steps idempotent and record every run with inputs, retries, outcomes, and artefact references; treat the ledger as audit evidence.

### Evidence Records
- title: OpenMetadata ingestion platform (entry doc)
  - url: https://github.com/open-metadata/OpenMetadata/blob/main/README.md
  - date: UNVERIFIED (reason: date not retrieved)
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15
- title: Dagster runs/assets (entry doc)
  - url: https://github.com/dagster-io/dagster/blob/master/
  - date: UNVERIFIED (reason: date not retrieved)
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15

### Example Repos + Concrete Paths
- repo: https://github.com/open-metadata/OpenMetadata
  - README.md
- repo: https://github.com/dagster-io/dagster
  - README.md

### Tradeoffs / Failure Modes
- Requires careful definition of idempotency keys and retry semantics.

### ISA Mapping
- target ISA paths:
  - server/utils/pipeline-logger.ts
  - server/db-pipeline-observability.ts
- minimal change outline: Standardise on run_id and idempotency keys per pipeline. Persist run metadata and artefact IDs; expose via monitoring router.
- no-output-API strategy: Use DB ledger + structured logger only.

Last verified date: 2026-02-15

## Evidence Artefacts that are Independently Verifiable

Produce evidence artefacts that can be verified by third parties (signatures, attestations, immutable logs). Tie evidence to commit SHA and build inputs.

### Evidence Records
- title: Cosign signing/verification (entry doc)
  - url: https://github.com/sigstore/cosign/blob/main/README.md
  - date: UNVERIFIED (reason: date not retrieved)
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15
- title: ISA persisted error ledger wiring
  - url: https://github.com/GS1Ned/isa_web_clean/blob/strict-no-console/server/_core/logger-wiring.ts
  - date: 2026-02-15T14:34:04+01:00
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15

### Example Repos + Concrete Paths
- repo: https://github.com/sigstore/cosign
  - README.md
- repo: https://github.com/GS1Ned/isa_web_clean
  - server/_core/logger-wiring.ts

### Tradeoffs / Failure Modes
- Requires defining artefact inventory (datasets, embeddings, mappings) and storage strategy.

### ISA Mapping
- target ISA paths:
  - docs/evidence
  - artifacts
  - server/ingest
- minimal change outline: Define artefact inventory + checksums. Attach provenance metadata to artefacts and store references in DB.
- no-output-API strategy: Write evidence metadata to JSON/DB; runtime logging via structured logger only.

Last verified date: 2026-02-15

## Planning Policy Enforced by CI

Keep planning artefacts canonical and machine-validated; reject uncontrolled planning sprawl via CI gates.

### Evidence Records
- title: ISA planning/traceability validator
  - url: https://github.com/GS1Ned/isa_web_clean/blob/strict-no-console/scripts/validate_planning_and_traceability.py
  - date: 2026-02-15T14:34:04+01:00
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15
- title: ISA validate-docs workflow
  - url: https://github.com/GS1Ned/isa_web_clean/blob/strict-no-console/.github/workflows/validate-docs.yml
  - date: 2026-02-10T01:29:08+01:00
  - type: GitHub Actions workflow
  - format: web
  - last verified date: 2026-02-15

### Example Repos + Concrete Paths
- repo: https://github.com/GS1Ned/isa_web_clean
  - scripts/validate_planning_and_traceability.py
  - .github/workflows/validate-docs.yml

### Tradeoffs / Failure Modes
- Overly strict gates can slow iteration; needs explicit exceptions process.

### ISA Mapping
- target ISA paths:
  - docs/planning
  - .github/workflows
- minimal change outline: Extend validators to cover evidence artefacts and enforce allowed path sets.
- no-output-API strategy: Use exit codes and structured artefacts; avoid direct output API usage.

Last verified date: 2026-02-15

## Security Hygiene in CI (Static Analysis, SECURITY.md)

Encode security posture as repo artefacts and CI checks (security policy, static analysis, dependency checks).

### Evidence Records
- title: OPA workflow example
  - url: https://github.com/open-policy-agent/opa/blob/main/.github/workflows/codeql-analysis.yml
  - date: UNVERIFIED (reason: date not retrieved)
  - type: GitHub Actions workflow
  - format: web
  - last verified date: 2026-02-15
- title: Cosign workflow example
  - url: https://github.com/sigstore/cosign/blob/main/.github/workflows/golangci-lint.yml
  - date: UNVERIFIED (reason: date not retrieved)
  - type: GitHub Actions workflow
  - format: web
  - last verified date: 2026-02-15

### Example Repos + Concrete Paths
- repo: https://github.com/open-policy-agent/opa
  - .github/workflows/
- repo: https://github.com/sigstore/cosign
  - .github/workflows/

### Tradeoffs / Failure Modes
- False positives require triage; must be owned.

### ISA Mapping
- target ISA paths:
  - .github/workflows
  - SECURITY.md
- minimal change outline: Enable static analysis and dependency scanning workflows. Add security policy doc.
- no-output-API strategy: CI tooling uses exit codes and summaries.

Last verified date: 2026-02-15

## Deterministic Generated Artefacts (Canonicalisation)

Generate deterministic artefacts (mappings, diffs, benchmarks) with stable ordering and schema validation; store diffs as evidence.

### Evidence Records
- title: dbt-core deterministic artefacts (entry doc)
  - url: https://github.com/dbt-labs/dbt-core/blob/main/README.md
  - date: UNVERIFIED (reason: date not retrieved)
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15
- title: ISA advisory canonicaliser
  - url: https://github.com/GS1Ned/isa_web_clean/blob/strict-no-console/scripts/canonicalize_advisory.cjs
  - date: 2026-02-04T17:38:10+01:00
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15

### Example Repos + Concrete Paths
- repo: https://github.com/dbt-labs/dbt-core
  - README.md
- repo: https://github.com/GS1Ned/isa_web_clean
  - scripts/canonicalize_advisory.cjs

### Tradeoffs / Failure Modes
- Canonicalisers must be deterministic across platforms; requires tests.

### ISA Mapping
- target ISA paths:
  - scripts
  - docs/evidence/_generated
- minimal change outline: Add canonicalisers for key outputs and validate canonical form in CI.
- no-output-API strategy: Use file outputs and exit codes.

Last verified date: 2026-02-15

## Entity Graph Modelling for Standards/Regulations

Model standards, regulations, obligations, datapoints, and mappings as typed entities with stable IDs and provenance links.

### Evidence Records
- title: OpenMetadata entity-centric governance (entry doc)
  - url: https://github.com/open-metadata/OpenMetadata/blob/main/README.md
  - date: UNVERIFIED (reason: date not retrieved)
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15
- title: DataHub metadata graph (entry doc)
  - url: https://github.com/datahub-project/datahub/blob/master/README.md
  - date: UNVERIFIED (reason: date not retrieved)
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15

### Example Repos + Concrete Paths
- repo: https://github.com/open-metadata/OpenMetadata
  - README.md
- repo: https://github.com/datahub-project/datahub
  - README.md

### Tradeoffs / Failure Modes
- Entity graphs require strict schema governance to avoid over-generalisation.

### ISA Mapping
- target ISA paths:
  - drizzle/schema.ts
  - data/metadata
  - server/db.ts
- minimal change outline: Define canonical IDs and relationship tables for regulations, standards, mappings, and evidence sources. Attach provenance metadata to edges.
- no-output-API strategy: Use structured logging only.

Last verified date: 2026-02-15

## Correlation IDs Everywhere (Run ID, Trace ID)

Use stable run_id/trace_id across ingestion, mapping, and LLM steps; persist into ledgers and evidence artefacts for audit tracing.

### Evidence Records
- title: ISA trace_id in structured logger
  - url: https://github.com/GS1Ned/isa_web_clean/blob/strict-no-console/server/utils/server-logger.ts
  - date: 2026-02-15T14:34:04+01:00
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15
- title: Langfuse trace-first approach (entry doc)
  - url: https://github.com/langfuse/langfuse/blob/main/README.md
  - date: UNVERIFIED (reason: date not retrieved)
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15

### Example Repos + Concrete Paths
- repo: https://github.com/GS1Ned/isa_web_clean
  - server/utils/server-logger.ts
  - server/_core/logger-wiring.ts
- repo: https://github.com/langfuse/langfuse
  - README.md

### Tradeoffs / Failure Modes
- Missing propagation breaks traceability; requires integration tests.

### ISA Mapping
- target ISA paths:
  - server/_core/context.ts
  - server/utils
  - drizzle/schema_*
- minimal change outline: Standardise request/run IDs and persist them in all evidence tables and artefacts. Expose filtering in monitoring router.
- no-output-API strategy: Use structured logger and DB writes only.

Last verified date: 2026-02-15

## Continuous Benchmark JSON + Drift Detection

Maintain deterministic benchmark JSON that can be regenerated in CI and diffed to detect drift; require explicit approval for changes.

### Evidence Records
- title: ISA benchmark validator (existing)
  - url: https://github.com/GS1Ned/isa_web_clean/blob/strict-no-console/scripts/validate_oss_benchmarks_2026_02_15.sh
  - date: 2026-02-15T18:57:02+01:00
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15
- title: Cosign provenance mindset (entry doc)
  - url: https://github.com/sigstore/cosign/blob/main/README.md
  - date: UNVERIFIED (reason: date not retrieved)
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15

### Example Repos + Concrete Paths
- repo: https://github.com/GS1Ned/isa_web_clean
  - scripts/validate_oss_benchmarks_2026_02_15.sh
- repo: https://github.com/sigstore/cosign
  - README.md

### Tradeoffs / Failure Modes
- Benchmarks require periodic curation; needs ownership and cadence.

### ISA Mapping
- target ISA paths:
  - docs/research
  - scripts
  - .github/workflows
- minimal change outline: Add CI job to regenerate benchmark JSON and fail on unapproved drift. Document override via ADR.
- no-output-API strategy: Validation uses parsing + exit codes; no direct output API usage.

Last verified date: 2026-02-15

## Docs Information Architecture that Scales

Use a stable docs hierarchy with a canonical index; separate spec, governance, how-to, and research to avoid entropy.

### Evidence Records
- title: Backstage docs entrypoint
  - url: https://github.com/backstage/backstage/blob/master/README.md
  - date: UNVERIFIED (reason: date not retrieved)
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15
- title: OPA docs entrypoint
  - url: https://github.com/open-policy-agent/opa/blob/main/README.md
  - date: UNVERIFIED (reason: date not retrieved)
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15

### Example Repos + Concrete Paths
- repo: https://github.com/backstage/backstage
  - README.md
  - docs/
- repo: https://github.com/open-policy-agent/opa
  - README.md
  - docs/

### Tradeoffs / Failure Modes
- Requires ongoing pruning and link checks.

### ISA Mapping
- target ISA paths:
  - docs/spec
  - docs/governance
  - docs/architecture
- minimal change outline: Add a canonical docs index and enforce link/structure checks in CI.
- no-output-API strategy: Docs checks report via exit codes and summaries.

Last verified date: 2026-02-15

## Capability Boundaries via Plugins/Routers

Scale features with explicit capability modules (plugins/routers), each with ownership and contracts; enforce boundaries in CI.

### Evidence Records
- title: Backstage plugin modularity (entry doc)
  - url: https://github.com/backstage/backstage/blob/master/README.md
  - date: UNVERIFIED (reason: date not retrieved)
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15
- title: ISA router composition
  - url: https://github.com/GS1Ned/isa_web_clean/blob/strict-no-console/server/routers.ts
  - date: 2026-02-14T22:56:45+01:00
  - type: GitHub repository file
  - format: web
  - last verified date: 2026-02-15

### Example Repos + Concrete Paths
- repo: https://github.com/backstage/backstage
  - README.md
- repo: https://github.com/GS1Ned/isa_web_clean
  - server/routers.ts
  - server/routers/

### Tradeoffs / Failure Modes
- Boundary erosion unless ownership is enforced and reviewed.

### ISA Mapping
- target ISA paths:
  - server/routers
  - docs/spec
- minimal change outline: Define canonical capability modules with runtime contracts and ownership.
- no-output-API strategy: Use structured logger only.

Last verified date: 2026-02-15
