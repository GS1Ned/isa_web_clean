# OSS Candidates (Top 12, Ranked)

Last verified date: 2026-02-15

## FACT
- Signals are from GitHub API (`raw/top12_repo_metadata.json`).
- Sentiment sources are top-comment GitHub issues and pull requests (`raw/sentiment_sources.json`).

## INTERPRETATION
- Use these repos as an evidence-backed pattern library for governance, provenance, and traceability.

## RECOMMENDATION
- Prefer copying patterns (folder structure, CI gates, artefact schemas) rather than code.

## 1. open-metadata/OpenMetadata

- Source URL: https://github.com/open-metadata/OpenMetadata
- Signals:
  - stars: 8699
  - forks: 1631
  - last commit date: 2026-02-15T13:51:33Z
  - release date (latest if any): 2026-02-04T11:31:09Z

### Maintenance Activity Summary (Evidence)
- GitHub repository file: open-metadata/OpenMetadata README.md: https://github.com/open-metadata/OpenMetadata/blob/main/README.md (date: )
- GitHub Actions workflow: open-metadata/OpenMetadata workflow py-nox-ci.yml: https://github.com/open-metadata/OpenMetadata/blob/main/.github/workflows/py-nox-ci.yml (date: )

### Architecture Summary
Evidence-backed summary derived from README/docs; see evidence links above.

### Governance Strategy
- SECURITY.md
- CONTRIBUTING.md
- .github/CODEOWNERS

### CI Strategy
- .github/workflows/py-nox-ci.yml
- .github/workflows/maven-build-collate.yml
- .github/workflows/maven-build-skip.yml
- .github/workflows/maven-build.yml
- .github/workflows/maven-postgres-rdf-tests-build.yml
- .github/workflows/maven-postgres-tests-build-skip.yml

### Why Developers Respect It (Evidence, min 2)
- GitHub issue: UI Feedback - 1.0: https://github.com/open-metadata/OpenMetadata/issues/10543 (created: 2023-03-13T08:11:58Z)
- GitHub pull request: feat(ui): Project explore card: https://github.com/open-metadata/OpenMetadata/pull/23295 (created: 2025-09-08T14:27:35Z)

### What ISA Should Replicate
- Metadata registry + stewardship fields
- Lineage/provenance as first-class artefacts
- Connector-driven ingestion boundary

### What ISA Should Avoid
- Scope creep without capability boundaries
- Unversioned internal contracts

### Exact Inspect Paths (Verified)
- docker/development/distributed-test/README.md
- ingestion/LICENSE
- SECURITY.md
- CONTRIBUTING.md
- .github/CODEOWNERS
- .github/workflows/py-nox-ci.yml
- .github/workflows/maven-build-collate.yml
- .github/workflows/maven-build-skip.yml
- .github/workflows/maven-build.yml
- .github/workflows/maven-postgres-rdf-tests-build.yml
- .github/workflows/maven-postgres-tests-build-skip.yml
- .github/workflows/maven-postgres-tests-build.yml
- .github/workflows/maven-sonar-build.yml
- docs/impersonation-design.md
- docs/plans/2026-01-27-search-indexing-stats-redesign.md
- docs/rdf-local-development.md

Last verified date: 2026-02-15

## 2. datahub-project/datahub

- Source URL: https://github.com/datahub-project/datahub
- Signals:
  - stars: 11579
  - forks: 3369
  - last commit date: 2026-02-14T19:02:14Z
  - release date (latest if any): 2026-02-10T19:39:15Z

### Maintenance Activity Summary (Evidence)
- GitHub repository file: datahub-project/datahub README.md: https://github.com/datahub-project/datahub/blob/master/README.md (date: )
- GitHub Actions workflow: datahub-project/datahub workflow build-and-test.yml: https://github.com/datahub-project/datahub/blob/master/.github/workflows/build-and-test.yml (date: )

### Architecture Summary
Evidence-backed summary derived from README/docs; see evidence links above.

### Governance Strategy
- SECURITY.md
- docs/CONTRIBUTING.md
- CODEOWNERS
- docs/dev-guides/semantic-search/ARCHITECTURE.md

### CI Strategy
- .github/workflows/build-and-test.yml
- .github/workflows/python-build-pages.yml
- .github/workflows/quickstart-test.yml
- .github/workflows/spark-smoke-test.yml
- .github/workflows/test-results.yml
- .github/workflows/update-test-weights.yml

### Why Developers Respect It (Evidence, min 2)
- GitHub issue: Make Airflow plugin fully compatible with Airflow >=2.7: https://github.com/datahub-project/datahub/issues/13357 (created: 2025-04-29T13:45:05Z)
- GitHub pull request: feat(gms): Pluggable authentication and authorization framework: https://github.com/datahub-project/datahub/pull/6243 (created: 2022-10-19T15:58:02Z)

### What ISA Should Replicate
- Event-oriented ingestion with idempotent upserts
- Entity graph modelling for discoverability
- Operational metadata as evidence

### What ISA Should Avoid
- High operational complexity without a minimal profile
- Tight coupling between ingestion and UI

### Exact Inspect Paths (Verified)
- contrib/metadata-model-extensions/datahub-demo-dataset-governance-validator/README.md
- LICENSE
- SECURITY.md
- docs/CONTRIBUTING.md
- CODEOWNERS
- docs/dev-guides/semantic-search/ARCHITECTURE.md
- .github/workflows/build-and-test.yml
- .github/workflows/python-build-pages.yml
- .github/workflows/quickstart-test.yml
- .github/workflows/spark-smoke-test.yml
- .github/workflows/test-results.yml
- .github/workflows/update-test-weights.yml
- .github/workflows/lint-actions.yml
- .github/workflows/actions.yml
- docs/SECURITY_STANCE.md
- docs/advanced/aspect-versioning.md
- docs/advanced/derived-aspects.md
- docs/CODE_OF_CONDUCT.md

Last verified date: 2026-02-15

## 3. OpenLineage/OpenLineage

- Source URL: https://github.com/OpenLineage/OpenLineage
- Signals:
  - stars: 2316
  - forks: 425
  - last commit date: 2026-02-13T03:30:12Z
  - release date (latest if any): 2026-01-29T21:17:03Z

### Maintenance Activity Summary (Evidence)
- GitHub repository file: OpenLineage/OpenLineage README.md: https://github.com/OpenLineage/OpenLineage/blob/main/README.md (date: )
- GitHub Actions workflow: OpenLineage/OpenLineage workflow integration-tests-spark-aws.yml: https://github.com/OpenLineage/OpenLineage/blob/main/.github/workflows/integration-tests-spark-aws.yml (date: )

### Architecture Summary
Evidence-backed summary derived from README/docs; see evidence links above.

### Governance Strategy
- GOVERNANCE.md
- CONTRIBUTING.md
- CODEOWNERS

### CI Strategy
- .github/workflows/integration-tests-spark-aws.yml
- .github/workflows/datadog-sca.yml
- .github/workflows/datadog-static-analysis.yml
- .github/workflows/visual-difference-detection.yml
- .github/workflows/website-new-version.yml
- .github/workflows/website-snapshot.yml

### Why Developers Respect It (Evidence, min 2)
- GitHub issue: [Discussion] Consistent approach for metastore symlinks: https://github.com/OpenLineage/OpenLineage/issues/3642 (created: 2025-04-16T15:22:03Z)
- GitHub pull request: python: async HTTP transport v2: https://github.com/OpenLineage/OpenLineage/pull/3812 (created: 2025-06-25T12:27:17Z)

### What ISA Should Replicate
- Versioned provenance event schema
- Compatibility discipline and reference tooling

### What ISA Should Avoid
- Schema drift without stable identifiers
- Spec-first without ISA reference implementation

### Exact Inspect Paths (Verified)
- client/java/README.md
- client/python/LICENSE
- GOVERNANCE.md
- CONTRIBUTING.md
- CODEOWNERS
- .github/workflows/integration-tests-spark-aws.yml
- .github/workflows/datadog-sca.yml
- .github/workflows/datadog-static-analysis.yml
- .github/workflows/visual-difference-detection.yml
- .github/workflows/website-new-version.yml
- .github/workflows/website-snapshot.yml
- spec/OpenLineage.md
- spec/Naming.md
- spec/Versioning.md
- spec/facets/ExternalQueryRunFacet.md

Last verified date: 2026-02-15

## 4. MarquezProject/marquez

- Source URL: https://github.com/MarquezProject/marquez
- Signals:
  - stars: 2121
  - forks: 380
  - last commit date: 2025-03-27T07:32:36Z
  - release date (latest if any): 2024-10-24T08:23:00Z

### Maintenance Activity Summary (Evidence)
- GitHub repository file: MarquezProject/marquez README.md: https://github.com/MarquezProject/marquez/blob/main/README.md (date: )
- GitHub Actions workflow: MarquezProject/marquez workflow test-chart.yaml: https://github.com/MarquezProject/marquez/blob/main/.github/workflows/test-chart.yaml (date: )

### Architecture Summary
Evidence-backed summary derived from README/docs; see evidence links above.

### Governance Strategy
- GOVERNANCE.md
- CONTRIBUTING.md

### CI Strategy
- .github/workflows/test-chart.yaml
- .github/workflows/test-website.yml
- .github/workflows/deploy-website.yml
- .github/workflows/headerchecker.yml

### Why Developers Respect It (Evidence, min 2)
- GitHub issue: Very slow /api/v1/jobs endpoint after upgrading to 0.50.0: https://github.com/MarquezProject/marquez/issues/2987 (created: 2024-12-12T08:31:12Z)
- GitHub pull request: Implement job service: https://github.com/MarquezProject/marquez/pull/154 (created: 2018-11-23T19:37:35Z)

### What ISA Should Replicate
- Lineage service pattern: API + storage + run model
- Clear job/run/dataset primitives

### What ISA Should Avoid
- Using lineage store as system of record for domain data

### Exact Inspect Paths (Verified)
- api/src/test/resources/apples/README.md
- LICENSE
- GOVERNANCE.md
- CONTRIBUTING.md
- .github/workflows/test-chart.yaml
- .github/workflows/test-website.yml
- .github/workflows/deploy-website.yml
- .github/workflows/headerchecker.yml
- docs/README.md
- docs/src/pages/markdown-page.md

Last verified date: 2026-02-15

## 5. open-policy-agent/opa

- Source URL: https://github.com/open-policy-agent/opa
- Signals:
  - stars: 11228
  - forks: 1511
  - last commit date: 2026-02-14T12:43:54Z
  - release date (latest if any): 2026-01-29T21:07:36Z

### Maintenance Activity Summary (Evidence)
- GitHub repository file: open-policy-agent/opa README.md: https://github.com/open-policy-agent/opa/blob/main/README.md (date: )
- GitHub Actions workflow: open-policy-agent/opa workflow codeql-analysis.yml: https://github.com/open-policy-agent/opa/blob/main/.github/workflows/codeql-analysis.yml (date: )

### Architecture Summary
Evidence-backed summary derived from README/docs; see evidence links above.

### Governance Strategy
- GOVERNANCE.md
- SECURITY.md
- CONTRIBUTING.md

### CI Strategy
- .github/workflows/codeql-analysis.yml
- .github/workflows/benchmarks.yaml
- .github/workflows/link-checker.yaml
- .github/workflows/nightly.yaml
- .github/workflows/post-merge.yaml
- .github/workflows/post-tag.yaml

### Why Developers Respect It (Evidence, min 2)
- GitHub issue: Possible memory leak involving topdown/http?: https://github.com/open-policy-agent/opa/issues/2978 (created: 2020-12-04T15:41:28Z)
- GitHub pull request: feat: new event-based decisions log buffer implementation: https://github.com/open-policy-agent/opa/pull/7446 (created: 2025-03-12T23:59:29Z)

### What ISA Should Replicate
- Policy-as-code for audit gates
- Separation of policy decisions from application logic

### What ISA Should Avoid
- Policy sprawl without ownership/lifecycle
- Non-reproducible decisions due to hidden inputs

### Exact Inspect Paths (Verified)
- docs/README.md
- internal/semver/LICENSE
- GOVERNANCE.md
- SECURITY.md
- CONTRIBUTING.md
- .github/workflows/codeql-analysis.yml
- .github/workflows/benchmarks.yaml
- .github/workflows/link-checker.yaml
- .github/workflows/nightly.yaml
- .github/workflows/post-merge.yaml
- .github/workflows/post-tag.yaml
- .github/workflows/pull-request.yaml
- .github/workflows/scorecards.yml
- docs/devel/DEVELOPMENT.md
- docs/devel/RELEASE.md
- docs/docs/aws-cloudformation-hooks.md
- docs/docs/cheatsheet.md
- docs/docs/cicd.md

Last verified date: 2026-02-15

## 6. kyverno/kyverno

- Source URL: https://github.com/kyverno/kyverno
- Signals:
  - stars: 7398
  - forks: 1233
  - last commit date: 2026-02-15T09:16:47Z
  - release date (latest if any): 2026-02-02T11:39:39Z

### Maintenance Activity Summary (Evidence)
- GitHub repository file: kyverno/kyverno README.md: https://github.com/kyverno/kyverno/blob/main/README.md (date: )
- GitHub Actions workflow: kyverno/kyverno workflow devcontainer-build.yaml: https://github.com/kyverno/kyverno/blob/main/.github/workflows/devcontainer-build.yaml (date: )

### Architecture Summary
Evidence-backed summary derived from README/docs; see evidence links above.

### Governance Strategy
- GOVERNANCE.md
- SECURITY.md
- CONTRIBUTING.md
- CODEOWNERS

### CI Strategy
- .github/workflows/devcontainer-build.yaml
- .github/workflows/images-build.yaml
- .github/workflows/helm-test.yaml
- .github/workflows/load-testing.yml
- .github/workflows/tests.yaml
- .github/workflows/lint.yaml

### Why Developers Respect It (Evidence, min 2)
- GitHub issue: [Bug] Memory leak causes Kyverno Pods to crash with OOMKilled in loaded conditions: https://github.com/kyverno/kyverno/issues/4072 (created: 2022-06-03T21:48:33Z)
- GitHub pull request: feat: support Cli  for map: https://github.com/kyverno/kyverno/pull/12667 (created: 2025-04-08T13:22:14Z)

### What ISA Should Replicate
- Rule enforcement with explicit test cases
- Exception handling as a deliberate workflow

### What ISA Should Avoid
- Rule proliferation without prioritisation

### Exact Inspect Paths (Verified)
- charts/kyverno-policies/README.md
- LICENSE
- GOVERNANCE.md
- SECURITY.md
- CONTRIBUTING.md
- CODEOWNERS
- .github/workflows/devcontainer-build.yaml
- .github/workflows/images-build.yaml
- .github/workflows/helm-test.yaml
- .github/workflows/load-testing.yml
- .github/workflows/tests.yaml
- .github/workflows/lint.yaml
- .github/workflows/helm-release.yaml
- .github/workflows/release.yaml
- docs/dev/controllers/policycache.md
- docs/user/cli/commands/kyverno_fix_policy.md
- docs/dev/README.md
- docs/dev/api/README.md
- docs/dev/controllers/README.md
- docs/dev/feature-flags/README.md

Last verified date: 2026-02-15

## 7. sigstore/cosign

- Source URL: https://github.com/sigstore/cosign
- Signals:
  - stars: 5650
  - forks: 690
  - last commit date: 2026-02-11T22:44:31Z
  - release date (latest if any): 2026-01-09T22:13:05Z

### Maintenance Activity Summary (Evidence)
- GitHub repository file: sigstore/cosign README.md: https://github.com/sigstore/cosign/blob/main/README.md (date: )
- GitHub Actions workflow: sigstore/cosign workflow golangci-lint.yml: https://github.com/sigstore/cosign/blob/main/.github/workflows/golangci-lint.yml (date: )

### Architecture Summary
Evidence-backed summary derived from README/docs; see evidence links above.

### Governance Strategy
- CONTRIBUTING.md
- CODEOWNERS

### CI Strategy
- .github/workflows/golangci-lint.yml
- .github/workflows/build.yaml
- .github/workflows/e2e-tests.yml
- .github/workflows/kind-verify-attestation.yaml
- .github/workflows/tests.yaml
- .github/workflows/codeql-analysis.yml

### Why Developers Respect It (Evidence, min 2)
- GitHub issue: VAULT KMS signing and verification broken after rotating a key in vault: https://github.com/sigstore/cosign/issues/1351 (created: 2022-01-24T07:11:18Z)
- GitHub pull request: Sigstore bundle: https://github.com/sigstore/cosign/pull/2204 (created: 2022-08-26T13:17:30Z)

### What ISA Should Replicate
- Verifiable evidence artefacts (signatures/attestations)
- Treat build outputs as auditable artefacts

### What ISA Should Avoid
- Adopting signing without clear artefact inventory

### Exact Inspect Paths (Verified)
- README.md
- LICENSE
- CONTRIBUTING.md
- CODEOWNERS
- .github/workflows/golangci-lint.yml
- .github/workflows/build.yaml
- .github/workflows/e2e-tests.yml
- .github/workflows/kind-verify-attestation.yaml
- .github/workflows/tests.yaml
- .github/workflows/codeql-analysis.yml
- .github/workflows/cut-release.yml
- .github/workflows/validate-release.yml
- doc/cosign.md
- doc/cosign_attach.md
- doc/cosign_attach_attestation.md
- doc/cosign_attach_sbom.md
- doc/cosign_attach_signature.md
- doc/cosign_attest-blob.md

Last verified date: 2026-02-15

## 8. backstage/backstage

- Source URL: https://github.com/backstage/backstage
- Signals:
  - stars: 32606
  - forks: 7090
  - last commit date: 2026-02-15T14:51:55Z
  - release date (latest if any): 2026-02-02T16:37:37Z

### Maintenance Activity Summary (Evidence)
- GitHub repository file: backstage/backstage README.md: https://github.com/backstage/backstage/blob/master/README.md (date: )
- GitHub Actions workflow: backstage/backstage workflow ci-noop.yml: https://github.com/backstage/backstage/blob/master/.github/workflows/ci-noop.yml (date: )

### Architecture Summary
Evidence-backed summary derived from README/docs; see evidence links above.

### Governance Strategy
- SECURITY.md
- CONTRIBUTING.md
- .github/CODEOWNERS

### CI Strategy
- .github/workflows/ci-noop.yml
- .github/workflows/ci.yml
- .github/workflows/verify_codeql.yml
- .github/workflows/sync_patch-release.yml
- .github/workflows/sync_release-manifest.yml
- .github/workflows/api-breaking-changes-comment.yml

### Why Developers Respect It (Evidence, min 2)
- GitHub issue: OpenAPI spec for the REST API: https://github.com/backstage/backstage/issues/2566 (created: 2020-09-22T20:41:19Z)
- GitHub pull request: Bitbucket Server Catalog Plugin Event Support: https://github.com/backstage/backstage/pull/19633 (created: 2023-08-29T00:36:39Z)

### What ISA Should Replicate
- Plugin modularity for capability boundaries
- Docs information architecture that scales

### What ISA Should Avoid
- Over-building platform extensibility early

### Exact Inspect Paths (Verified)
- .changeset/README.md
- LICENSE
- SECURITY.md
- CONTRIBUTING.md
- .github/CODEOWNERS
- .github/workflows/ci-noop.yml
- .github/workflows/ci.yml
- .github/workflows/verify_codeql.yml
- .github/workflows/sync_patch-release.yml
- .github/workflows/sync_release-manifest.yml
- .github/workflows/api-breaking-changes-comment.yml
- .github/workflows/api-breaking-changes.yml
- .github/workflows/automate_area-labels.yml
- docs/architecture-decisions/adr000-template.md
- docs/architecture-decisions/adr001-add-adr-log.md
- docs/architecture-decisions/adr002-default-catalog-file-format.md
- docs/architecture-decisions/adr003-avoid-default-exports.md
- docs/architecture-decisions/adr004-module-export-structure.md
- docs/architecture-decisions/adr005-catalog-core-entities.md

Last verified date: 2026-02-15

## 9. dagster-io/dagster

- Source URL: https://github.com/dagster-io/dagster
- Signals:
  - stars: 14951
  - forks: 1976
  - last commit date: 2026-02-13T23:17:10Z
  - release date (latest if any): 2026-02-05T21:39:54Z

### Maintenance Activity Summary (Evidence)
- GitHub Actions workflow: dagster-io/dagster workflow build-docs.yml: https://github.com/dagster-io/dagster/blob/master/.github/workflows/build-docs.yml (date: )
- GitHub issue: Support Auth & RBAC in Dagit: https://github.com/dagster-io/dagster/issues/2219 (date: 2020-02-27T21:44:23Z)

### Architecture Summary
Evidence-backed summary derived from README/docs; see evidence links above.

### Governance Strategy
- .github/CONTRIBUTING.md
- .github/CODEOWNERS
- docs/CONTRIBUTING.md

### CI Strategy
- .github/workflows/build-docs.yml
- .github/workflows/build-integration-registry.yml
- .github/workflows/build-storybook-core.yml
- .github/workflows/build-storybook-ui.yml
- .github/workflows/automate-stale-issues.yml
- .github/workflows/check-docs.yml

### Why Developers Respect It (Evidence, min 2)
- GitHub issue: Support Auth & RBAC in Dagit: https://github.com/dagster-io/dagster/issues/2219 (created: 2020-02-27T21:44:23Z)
- GitHub pull request: Doc 302 new etl tutorial - part 1: https://github.com/dagster-io/dagster/pull/25320 (created: 2024-10-16T20:32:50Z)

### What ISA Should Replicate
- Idempotent pipeline steps with run metadata
- Run logs and retries as evidence

### What ISA Should Avoid
- Tight coupling to one orchestrator runtime

### Exact Inspect Paths (Verified)
- docs/sphinx/_ext/sphinx-click/LICENSE
- .github/CONTRIBUTING.md
- .github/CODEOWNERS
- .github/workflows/build-docs.yml
- .github/workflows/build-integration-registry.yml
- .github/workflows/build-storybook-core.yml
- .github/workflows/build-storybook-ui.yml
- .github/workflows/automate-stale-issues.yml
- .github/workflows/check-docs.yml
- docs/docs/deployment/dagster-plus/getting-started.md
- docs/CLAUDE.md
- docs/CONTRIBUTING.md
- docs/README.md
- docs/docs/about/changelog.md

Last verified date: 2026-02-15

## 10. dbt-labs/dbt-core

- Source URL: https://github.com/dbt-labs/dbt-core
- Signals:
  - stars: 12247
  - forks: 2274
  - last commit date: 2026-02-12T23:02:08Z
  - release date (latest if any): 2026-02-13T17:42:26Z

### Maintenance Activity Summary (Evidence)
- GitHub repository file: dbt-labs/dbt-core README.md: https://github.com/dbt-labs/dbt-core/blob/main/README.md (date: )
- GitHub Actions workflow: dbt-labs/dbt-core workflow release-branch-tests.yml: https://github.com/dbt-labs/dbt-core/blob/main/.github/workflows/release-branch-tests.yml (date: )

### Architecture Summary
Evidence-backed summary derived from README/docs; see evidence links above.

### Governance Strategy
- SECURITY.md
- CONTRIBUTING.md
- .github/CODEOWNERS
- ARCHITECTURE.md

### CI Strategy
- .github/workflows/release-branch-tests.yml
- .github/workflows/test-repeater.yml
- .github/workflows/cut-release-branch.yml
- .github/workflows/nightly-release.yml
- .github/workflows/release.yml
- .github/workflows/artifact-reviews.yml

### Why Developers Respect It (Evidence, min 2)
- GitHub issue: [Bug] dbtCore - after upgrading, can't run DBT: https://github.com/dbt-labs/dbt-core/issues/10135 (created: 2024-05-13T11:13:16Z)
- GitHub pull request: dbt Constraints / model contracts: https://github.com/dbt-labs/dbt-core/pull/6271 (created: 2022-11-16T18:51:23Z)

### What ISA Should Replicate
- Deterministic manifests as audit artefacts
- Schema tests as gates

### What ISA Should Avoid
- Generated artefacts without schema validation/versioning

### Exact Inspect Paths (Verified)
- .changes/README.md
- core/LICENSE
- SECURITY.md
- CONTRIBUTING.md
- .github/CODEOWNERS
- ARCHITECTURE.md
- .github/workflows/release-branch-tests.yml
- .github/workflows/test-repeater.yml
- .github/workflows/cut-release-branch.yml
- .github/workflows/nightly-release.yml
- .github/workflows/release.yml
- .github/workflows/artifact-reviews.yml
- .github/workflows/auto-respond-bug-reports.yml
- .github/workflows/backport.yml
- docs/arch/1_Overview.md
- docs/arch/2_CLI.md
- docs/arch/3.1_Partial_Parsing.md
- docs/arch/3.2_Deferral.md
- docs/arch/3_Parsing.md
- docs/arch/4.1_Task_Framework.md

Last verified date: 2026-02-15

## 11. langfuse/langfuse

- Source URL: https://github.com/langfuse/langfuse
- Signals:
  - stars: 21945
  - forks: 2164
  - last commit date: 2026-02-14T17:56:13Z
  - release date (latest if any): 2026-02-12T18:01:03Z

### Maintenance Activity Summary (Evidence)
- GitHub repository file: langfuse/langfuse README.md: https://github.com/langfuse/langfuse/blob/main/README.md (date: )
- GitHub Actions workflow: langfuse/langfuse workflow codeql.yml: https://github.com/langfuse/langfuse/blob/main/.github/workflows/codeql.yml (date: )

### Architecture Summary
Evidence-backed summary derived from README/docs; see evidence links above.

### Governance Strategy
- SECURITY.md
- CONTRIBUTING.md
- .github/CODEOWNERS

### CI Strategy
- .github/workflows/codeql.yml
- .github/workflows/release.yml
- .github/workflows/_deploy_ecs_service.yml
- .github/workflows/codespell.yml
- .github/workflows/dependabot-rebase-stale.yml
- .github/workflows/deploy.yml

### Why Developers Respect It (Evidence, min 2)
- GitHub issue: bug: langfuse docker compose failing on arm linux machines: https://github.com/langfuse/langfuse/issues/4683 (created: 2024-12-11T14:32:55Z)
- GitHub pull request: chore(deps): bump @aws-sdk/client-s3 from 3.507.0 to 3.515.0: https://github.com/langfuse/langfuse/pull/1192 (created: 2024-02-16T22:19:26Z)

### What ISA Should Replicate
- Trace-first LLM interactions + evaluation loop
- Dataset-based evaluation as evidence

### What ISA Should Avoid
- Capturing prompts/outputs without retention/privacy controls
- High-cardinality trace metadata

### Exact Inspect Paths (Verified)
- .claude/hooks/README.md
- ee/LICENSE
- SECURITY.md
- CONTRIBUTING.md
- .github/CODEOWNERS
- .github/workflows/codeql.yml
- .github/workflows/release.yml
- .github/workflows/_deploy_ecs_service.yml
- .github/workflows/codespell.yml
- .github/workflows/dependabot-rebase-stale.yml
- .github/workflows/deploy.yml
- .github/workflows/licencecheck.yml
- .github/workflows/pipeline.yml

Last verified date: 2026-02-15

## 12. Arize-ai/phoenix

- Source URL: https://github.com/Arize-ai/phoenix
- Signals:
  - stars: 8549
  - forks: 721
  - last commit date: 2026-02-15T10:07:30Z
  - release date (latest if any): 2026-02-14T00:06:16Z

### Maintenance Activity Summary (Evidence)
- GitHub repository file: Arize-ai/phoenix README.md: https://github.com/Arize-ai/phoenix/blob/main/README.md (date: )
- GitHub Actions workflow: Arize-ai/phoenix workflow helm-ci.yml: https://github.com/Arize-ai/phoenix/blob/main/.github/workflows/helm-ci.yml (date: )

### Architecture Summary
Evidence-backed summary derived from README/docs; see evidence links above.

### Governance Strategy
- SECURITY.md
- CONTRIBUTING.md
- .github/CODEOWNERS

### CI Strategy
- .github/workflows/helm-ci.yml
- .github/workflows/python-CI.yml
- .github/workflows/typescript-CI.yml
- .github/workflows/typescript-packages-CI.yml
- .github/workflows/docker-build-experimental.yml
- .github/workflows/docker-build-nightly.yml

### Why Developers Respect It (Evidence, min 2)
- GitHub issue: [BUG] DSPy connector not showing the token count, although it is returned in the request: https://github.com/Arize-ai/phoenix/issues/3119 (created: 2024-05-08T11:02:48Z)
- GitHub pull request: feat: token-based authentication: https://github.com/Arize-ai/phoenix/pull/4370 (created: 2024-08-23T20:22:47Z)

### What ISA Should Replicate
- Evaluation harnesses as versioned artefacts
- RAG-focused metrics and tracing practices

### What ISA Should Avoid
- Ad-hoc evaluation without drift detection

### Exact Inspect Paths (Verified)
- app/README.md
- js/packages/phoenix-cli/LICENSE
- SECURITY.md
- CONTRIBUTING.md
- .github/CODEOWNERS
- .github/workflows/helm-ci.yml
- .github/workflows/python-CI.yml
- .github/workflows/typescript-CI.yml
- .github/workflows/typescript-packages-CI.yml
- .github/workflows/docker-build-experimental.yml
- .github/workflows/docker-build-nightly.yml
- .github/workflows/docker-build-release.yml
- .github/workflows/helm-release.yaml
- docs/phoenix/skill.md

Last verified date: 2026-02-15
