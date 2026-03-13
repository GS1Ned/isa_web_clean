# Anti-Patterns (High-Signal Criticisms and Mistakes)

Last verified date: 2026-02-15

## FACT
- Anti-pattern count: 4.

## INTERPRETATION
- These risks recur across governance-heavy platforms: policy sprawl, uncontrolled observability data, and evidence drift.

## RECOMMENDATION
- Mitigate with explicit ownership, schema validation, deterministic artefacts, and retention controls.

## Policy Sprawl Without Ownership

- What breaks: Governance gates become inconsistent and non-auditable as rules accumulate without lifecycle management.
- How it shows up: Increasing rule count, exceptions, and performance regressions; unclear decision provenance.
- Mitigation: Define policy ownership, review requirements, deprecation rules, and mandatory tests/fixtures for each policy.
- Evidence links:
  - GitHub issue: Possible memory leak involving topdown/http?: https://github.com/open-policy-agent/opa/issues/2978 (date: 2020-12-04T15:41:28Z)
  - GitHub issue: [Bug] Memory leak causes Kyverno Pods to crash with OOMKilled in loaded conditions: https://github.com/kyverno/kyverno/issues/4072 (date: 2022-06-03T21:48:33Z)

Last verified date: 2026-02-15

## Unbounded Trace Data (No Retention/Redaction)

- What breaks: Privacy/compliance risk and escalating storage costs; audits fail due to uncontrolled data handling.
- How it shows up: Large prompt/output payloads stored indefinitely; lack of deletion workflows; high-cardinality metadata.
- Mitigation: Retention windows, redaction, sampling, and access controls; store hashes for large blobs.
- Evidence links:
  - GitHub issue: bug: langfuse docker compose failing on arm linux machines: https://github.com/langfuse/langfuse/issues/4683 (date: 2024-12-11T14:32:55Z)
  - GitHub issue: [BUG] DSPy connector not showing the token count, although it is returned in the request: https://github.com/Arize-ai/phoenix/issues/3119 (date: 2024-05-08T11:02:48Z)

Last verified date: 2026-02-15

## Evidence Artefacts Without Schemas

- What breaks: Artefacts become non-parseable; CI cannot enforce; audit evidence is unreliable.
- How it shows up: JSON drift, undocumented fields, and ad-hoc scripts.
- Mitigation: Define schemas, validate in CI, and version schema changes.
- Evidence links:
  - GitHub Actions workflow: ISA schema-validation workflow: https://github.com/GS1Ned/isa_web_clean/blob/strict-no-console/.github/workflows/schema-validation.yml (date: 2026-02-12T12:07:21+01:00)
  - GitHub repository file: ISA example schema file: https://github.com/GS1Ned/isa_web_clean/blob/strict-no-console/docs/quality/schemas/architecture-scorecard.schema.json (date: 2026-02-12T12:07:21+01:00)

Last verified date: 2026-02-15

## Monorepo Scale Without Deterministic Tooling

- What breaks: CI becomes slow/flaky; ownership boundaries degrade; governance bypass becomes common.
- How it shows up: Long installs, large CI matrices, inconsistent local environments.
- Mitigation: Lockfile discipline, partial builds, per-package ownership and boundary checks.
- Evidence links:
  - GitHub repository: Backstage repository landing page: https://github.com/backstage/backstage (date: 2026-02-15T15:36:16Z)
  - Hacker News story: Spotify Backstage – Supercharged Developer Portals: https://news.ycombinator.com/item?id=32940849 (date: 2022-09-22T16:02:21Z)

Last verified date: 2026-02-15
