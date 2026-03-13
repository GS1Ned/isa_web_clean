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

---

## 2026-02-20 In-Place Authoritative Discovery Upgrade

Last verified date: 2026-02-20

### FACT
- This section operationalizes authoritative-first dataset discovery and governed supportive-only GitHub discovery in-place.
- All candidate rows below include required metadata fields and explicit `scope_decision`.
- Missing target spec file is represented as a marker instead of creating a new artifact.

### INTERPRETATION
- ISA already has ingestion primitives; the primary missing capability is governance normalization (authority tier, scope policy, license gating, and drift triage).
- EU legal channels, EFRAG releases, regulator opinions, and GS1 reference endpoints are sufficient to build a high-value backlog now.

### RECOMMENDATION
- Prioritize IN-scope tier 1-2 sources first, then ingest tier 3-4 guidance, then process supportive-only tier 5 sources only when linked to authoritative upstream.

## Authoritative dataset candidate backlog

| candidate_id | authority_tier | source/publisher | date(s) | version/status | URL(s) | format(s) | license/usage | last_verified_date | capability_impact (ASK_ISA,NEWS_HUB,KNOWLEDGE_BASE,CATALOG,ESRS_MAPPING,ADVISORY) | scope_decision | rationale |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CAND-EU-001-LEGAL-ID | 1 | EUR-Lex / Publications Office of the EU | ongoing registry | active legal identifier infrastructure | `https://eur-lex.europa.eu/content/help/eurlex-content/celex-number.html`; `https://eur-lex.europa.eu/eli-register/about.html`; `https://eur-lex.europa.eu/oj/direct-access.html` | html | public legal-information access; usage subject to EUR-Lex legal notice (exact redistribution terms: UNKNOWN) | 2026-02-20 | yes,yes,yes,yes,yes,yes | IN | core identifier layer for deterministic linking, traceability, and citation stability |
| CAND-EU-002-CSRD | 1 | European Parliament/Council via EUR-Lex | 2022-12-14 (adoption); consolidation updates visible in EUR-Lex | in force | `https://eur-lex.europa.eu/eli/dir/2022/2464/oj` | html,pdf | legal text access allowed; derivative redistribution policy must follow EUR-Lex terms | 2026-02-20 | yes,yes,yes,yes,yes,yes | IN | primary legal basis for ESRS reporting obligations |
| CAND-EU-003-ESRS-LEGAL | 1 | European Commission delegated acts via EUR-Lex | 2023-12-22; amendments include 2025 updates | in force/amended | `https://eur-lex.europa.eu/eli/reg_del/2023/2772/oj`; `https://eur-lex.europa.eu/eli/reg_del/2025/1416/oj` | html,pdf | legal text usage as above | 2026-02-20 | yes,yes,yes,yes,yes,yes | IN | anchors machine-readable ESRS taxonomy and datapoint interpretation to legal basis |
| CAND-EU-004-EUDR | 1 | European Parliament/Council + Commission implementing acts | 2023-05-31; 2025-05-22 implementing benchmarking list | in force + implementing | `https://eur-lex.europa.eu/eli/reg/2023/1115/oj`; `https://eur-lex.europa.eu/eli/reg_impl/2025/1093/oj` | html,pdf | legal text usage as above | 2026-02-20 | yes,yes,yes,yes,no,yes | IN | required for deforestation due diligence logic and country-risk referencing |
| CAND-EU-005-ESPR-DPP | 1 | European Parliament/Council via EUR-Lex | 2024-06-13 | in force | `https://eur-lex.europa.eu/eli/reg/2024/1781/oj` | html,pdf | legal text usage as above | 2026-02-20 | yes,yes,yes,yes,no,yes | IN | base legal framework for Digital Product Passport obligations |
| CAND-EU-006-PPWR | 1 | European Parliament/Council via EUR-Lex | 2025-01-22 | in force | `https://eur-lex.europa.eu/eli/reg/2025/40/oj` | html,pdf | legal text usage as above | 2026-02-20 | yes,yes,yes,yes,no,yes | IN | packaging and waste obligations required for advisory and catalog coverage |
| CAND-EU-007-EUDR-IS | 1 | European Commission implementation portal | operational from 2024-12-04; API docs published | active with temporary access constraints | `https://green-business.ec.europa.eu/deforestation-regulation-implementation/information-system-deforestation-regulation_en`; `https://green-business.ec.europa.eu/deforestation-regulation-implementation/information-system-deforestation-regulation/api-documentation-and-test-environment_en` | html,api-doc | portal terms apply; authenticated access model exists; exact API usage terms in docs (partial UNKNOWN until authenticated review) | 2026-02-20 | no,yes,yes,yes,no,yes | WATCH | strong operational value but requires controlled access/credential governance before full automation |
| CAND-EFRAG-001-XBRL-TAXONOMY | 3 | EFRAG | 2024-08-30 release note | concluded project release | `https://www.efrag.org/en/projects/esrs-xbrl-taxonomy/concluded` | html,zip,xsd,xml | downloadable package available; exact redistribution constraints UNKNOWN from public page | 2026-02-20 | yes,no,yes,yes,yes,yes | IN | canonical technical package for ESRS taxonomy parsing and mapping |
| CAND-EFRAG-002-DATAPOINTS-IG3 | 3 | EFRAG | 2024 IG3 release + 2025 addendum references | concluded guidance artifact set | `https://www.efrag.org/en/projects/esrs-data-points/concluded` | html,xlsx,pdf | terms not fully explicit in retrieved page (UNKNOWN) | 2026-02-20 | yes,no,yes,yes,yes,yes | IN | high-value granular datapoint dictionary that bridges legal text and machine processing |
| CAND-EFRAG-003-IMPLEMENTATION-GUIDANCE | 3 | EFRAG | 2024 updates and implementation guidance pages | active guidance stream | `https://www.efrag.org/en/projects/esrs-implementation-guidance-documents` | html,pdf | guidance is public; redistribution policy detail UNKNOWN | 2026-02-20 | yes,yes,yes,yes,yes,yes | WATCH | useful interpretive content; keep under guidance-tier weighting to avoid overriding legal texts |
| CAND-REG-001-ESMA-OPINION | 4 | ESMA | 2026-02-18 | published opinion | `https://www.esma.europa.eu/press-news/esma-news/esma-publishes-opinion-european-commission%E2%80%99s-proposed-revisions-european` | html | public regulator publication | 2026-02-20 | yes,yes,no,no,yes,yes | IN | signals supervisory interpretation risk and likely market practice shifts |
| CAND-REG-002-EBA-NO-ACTION | 4 | EBA | 2025-08-06 | published no-action letter | `https://www.eba.europa.eu/publications-and-media/press-releases/eba-publishes-no-action-letter-application-esg-disclosure` | html,pdf | public regulator publication | 2026-02-20 | yes,yes,no,no,yes,yes | IN | relevant supervisory posture for ESG disclosure timing and risk communication |
| CAND-REG-003-EIOPA-OPINION | 4 | EIOPA | 2026-02-16 | published opinion | `https://www.eiopa.europa.eu/eiopa-welcomes-commission-omnibus-package-publishes-opinion-simplifying-esrs-standards-2026-02-16_en` | html | public regulator publication | 2026-02-20 | yes,yes,no,no,yes,yes | IN | insurance-sector supervisory signal for ESRS simplification impacts |
| CAND-GS1-001-REF-SCHEMAS | 2 | GS1 Global / ref.gs1.org | rolling publication | active reference corpus endpoints | `https://ref.gs1.org/sitemap.xml`; `https://ref.gs1.org/standards/epcis/epcis-json-schema.json`; `https://ref.gs1.org/standards/epcis/openapi.json`; `https://ref.gs1.org/standards/eudr/json-schema.json`; `https://ref.gs1.org/ai/GS1_Application_Identifiers.jsonld` | xml,json,jsonld,openapi | usage terms at GS1 level; redistribution boundaries require legal confirmation (UNKNOWN) | 2026-02-20 | yes,yes,yes,yes,yes,yes | IN | authoritative machine-readable standards payloads aligned with existing ISA GS1 corpus ingestion |
| CAND-GS1-002-DPP-PAGE | 2 | GS1 | ongoing standards initiative | active program page | `https://www.gs1.org/standards/gs1-digital-product-passport` | html | public program page; not a normative schema package by itself | 2026-02-20 | no,yes,no,yes,no,yes | WATCH | strategic radar source for DPP evolution; not sufficient alone for canonical ingestion |

## Scope policy (IN/OUT/WATCH)

### Inclusion criteria (IN)
- Authority tier 1 or 2 by default, or tier 3/4 when clearly linked to tier 1 legal basis.
- Stable URL(s) and at least one reproducible retrieval path.
- Usable in ISA without crossing customer-proprietary boundaries.
- Security posture acceptable (no credential scraping; no executable ingestion from unknown binaries).

### Conditional criteria (WATCH)
- Valuable source with one unresolved blocker: unclear license, unstable access method, or missing authoritative linkage.
- Can be monitored via drift events while ingestion remains gated by human approval.

### Exclusion criteria (OUT)
- No authoritative provenance.
- License incompatible or unknown with high legal risk and no low-risk fallback.
- Requires prohibited behavior (credential harvesting, private repo access, or policy-violating scraping).

## Governed discovery automation framework

### Source channels and detectors

| channel | detector | signal | default cadence | gate |
| --- | --- | --- | --- | --- |
| RSS/Atom | feed poller | new item GUID/date/title delta | every 6h | triage before ingestion |
| Sitemap | sitemap fetch + URL diff | added/removed/changed URLs | daily | triage before ingestion |
| APIs/OpenAPI | endpoint metadata pull | schema/version/hash changes | daily | contract diff review |
| Document libraries | direct URL registry + HEAD checks | file change via ETag/Last-Modified/hash | daily | hash and semantic diff check |
| Structured releases | release/tag scanner | new release or checksum delta | daily | authoritative linkage validation |

### Change monitoring controls
- Capture and store per-source: `etag`, `last_modified`, `content_hash`, and normalized semantic diff summary.
- Classify drift into `MINOR_METADATA`, `CONTENT_CHANGE`, `SCHEMA_BREAK`, `AUTHORITY_CHANGE`.
- Require human approval for `SCHEMA_BREAK` and `AUTHORITY_CHANGE` before ingestion.

### Discovery drift events (required table)

| event_id | source | signal_type | detector | change_summary | risk_level | triage_decision | ingestion_decision | timestamp_utc |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DRIFT-EX-001 | `eur-lex.europa.eu` | CONTENT_CHANGE | sitemap+hash | consolidated text changed for tracked CELEX | medium | review_required | hold_until_verified | 2026-02-20T00:00:00Z |
| DRIFT-EX-002 | `ref.gs1.org` | SCHEMA_BREAK | openapi/json-schema diff | new required property in EPCIS schema | high | escalate_to_owner | blocked_pending_mapping_update | 2026-02-20T00:00:00Z |
| DRIFT-EX-003 | `efrag.org` | MINOR_METADATA | page metadata diff | project page update without package change | low | auto_note | no_ingest_change | 2026-02-20T00:00:00Z |

## Self-improving ISA pipeline (closed-loop)

### Feedback signals

| signal | collection point | purpose | privacy/governance guard |
| --- | --- | --- | --- |
| retrieval traces | ASK_ISA and KNOWLEDGE_BASE query path | detect weak recall and stale chunks | store trace IDs, redact user-identifying payloads |
| citation failures | answer post-validation | identify missing or broken authority links | block unsafe responses; log non-sensitive diagnostics |
| user feedback | thumbs/comments or structured flags | prioritize correction and source expansion | treat user text as potentially sensitive; minimize retention |
| eval fixtures/regression suites | CI and scheduled eval jobs | detect quality regressions deterministically | use synthetic or sanitized fixtures only |
| ingestion error metrics | ingest job logs and provenance writes | improve pipeline reliability and dedupe behavior | no secrets in logs; only metadata |

### Periodic jobs and gates

| job | cadence | action | gate |
| --- | --- | --- | --- |
| authoritative source refresh | daily | rerun sitemap/rss/api checks and hash capture | Gate B authoritative verification required |
| corpus re-embed/re-chunk candidate list | weekly | reprocess changed authoritative documents | Gate C metadata completeness required |
| schema health checks | daily | validate JSON/XSD/OpenAPI changes against contracts | block on schema break |
| auto-eval generation (draft) | weekly | propose new eval cases from citation failures | human approval before promotion |
| regression evaluation | daily | run deterministic fixtures and compare against baseline | fail-safe rollback recommendation on regressions |

## Operational GitHub discovery design (supportive-only)

### 1) Governed search strategy
- Query families:
  - topic-based: `topic:esrs`, `topic:xbrl`, `topic:epcis`, `topic:gs1`
  - intent-based: `celex parser`, `esrs xbrl taxonomy`, `epcis callback`
  - file heuristics: repositories containing `json_schema`, `openapi`, `xsd`, `taxonomy`
- Allowed org/user scope: public repositories only.
- Prohibited scope: private repos, credentialed scraping targets, unknown executable blobs.

### 2) Supportive scoring rubric

| factor | weight | scoring rule |
| --- | --- | --- |
| authoritative linkage | 40 | explicit links to tier 1-4 sources in README/docs |
| license clarity | 20 | SPDX-recognized permissive license preferred |
| freshness | 15 | latest commit recency |
| reproducibility | 15 | fixed commit/tag + stable file paths/hashes |
| safety posture | 10 | no red-flag indicators (secrets/malware/unclear provenance) |

`supportive_score = sum(weighted factors)`

### 3) Reproducible retrieval recipe format

```yaml
retrieval_recipe:
  repo: owner/name
  default_branch: main
  commit: <sha>
  files:
    - path: README.md
      sha: <blob_sha>
  verified_utc: 2026-02-20T00:00:00Z
  authoritative_link:
    - https://authoritative.example
  disposition: WATCH
```

### 4) De-dup strategy
- Canonical key: `normalized(authoritative_link) + normalized(dataset_or_schema_name)`.
- If multiple repos mirror same upstream source, keep one canonical record and mark others as mirrors.
- Prefer repo with clearest provenance and freshest maintained commit.

### 5) Safe handling requirements
- Mandatory checks before any promotion from WATCH to IN:
  - license present and compatible,
  - no secrets in sampled files,
  - no malware indicators in fetched artifact metadata,
  - authoritative upstream link present.

### 6) Supportive-only policy and upstream linkage rules
- A GitHub source cannot be IN on its own.
- Promotion requires at least one live authoritative URL from tiers 1-4.
- If upstream linkage is missing or broken, disposition remains `OUT` or `WATCH`.

### 7) Explicit anti-goals
- no private repository access
- no credential harvesting or token scraping
- no license-violating redistribution
- no execution of untrusted external code as part of discovery

### GitHub supportive-only candidates (operational table)

| repo | default_branch | commit/tag | paths | hashes | license | provenance_link_to_authority | supportive_score | disposition |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `aimabel-ai/esrs-xbrl-parser` | `main` | `119ad336fa2c028e0de3d3499980f26801832479` | `README.md`, `LICENSE` | `README.md:55087956580f8fcd14c97f7fcf72344ad0a0c12f`; `LICENSE:0c2ceda2516d4700edc13755c8cda9e656837a8d` | ISC | README links EFRAG ESRS taxonomy project (`https://www.efrag.org/en/projects/esrs-xbrl-taxonomy/concluded`) | 82 | WATCH |
| `MaastrichtU-BISS/celex-articles-extractor` | `main` | `163f2e094a11f89aecb4c12c53130cedacb6ae9d` | `README.md`, `celex_query.py` | `README.md:1221212bf4ff59d42bbdbfd6088de1a1c44f2f07`; `celex_query.py:831725f922fa616b07f18060556431383c21933b` | UNKNOWN | README references EUR-Lex CELEX source (`eur-lex.europa.eu`) | 68 | WATCH |
| `louisaxel-ambroise/epcis-callback` | `main` | `c3329a896d649ffa107f9bc128039efd95de8454` | `README.md`, `LICENSE` | `README.md:2e96c7848d858965c5372bfa8a1e5d8b99f6940f`; `LICENSE:261eeb9e9f8b2b4b0d119366dda99c6fd7d35c64` | Apache-2.0 | README references GS1 EPCIS 2.0 (upstream mapping required to `ref.gs1.org` docs) | 64 | WATCH |
| `antonheitz/xBRL-Forge` | `main` | `cc48f063c7a1e9eb3d677707a27205178e509c1d` | `README.md`, `LICENCE.md` | `README.md:5d9b4a1ed032e399086ec03d51c0e4ea45e82103`; `LICENCE.md:f49a4e16e68b128803cc2dcea614603632b04eac` | Apache-2.0 | no explicit authoritative EU/GS1 linkage in retrieved README | 52 | OUT |
| `mgh128/epcis2-json-schema` | `master` | `79a714c0d9c085892d1e7110df7997ec81335485` | `json_schema.json`, `Python/README.md` | `json_schema.json:23d443213403581a0f01283436beb40345a161cd`; `Python/README.md:b2812aa28d576306e83dc8a7166feb3552efe31d` | UNKNOWN | experimental schema repo with no authoritative linkage evidence in retrieved files | 34 | OUT |

### PROPOSED NEW ARTEFACT (NOT CREATED)

- `docs/research/isa-deep-research/2026-02-20/GITHUB_DATASET_DISCOVERY_DESIGN_SPEC.md`
- Reason not created: in-place-only execution constraint.
- Current placement: operational spec is embedded in this section.
