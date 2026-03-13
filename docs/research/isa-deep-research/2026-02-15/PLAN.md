# ISA Deep OSS Research Plan (Executed)

Last verified date: 2026-02-15

## FACT
- Execution mode: Git worktree at `../isa_web_clean__isa_deep_research_2026_02_15`.
- Branch: `research/isa-deep-research-2026-02-15` (tracking `origin/strict-no-console`).
- Output directory: `docs/research/isa-deep-research/2026-02-15/`.
- Raw evidence directory: `docs/research/isa-deep-research/2026-02-15/raw/`.

## INTERPRETATION
- GitHub discovery used `gh search repos` for the 10 planned repo queries. `gh search code` was executed for the 4 planned code queries; results may be zero depending on host/indexing.
- Candidate pool was capped to 80 for auditability and deterministic review. The pool is seeded from discovery results and forced to include the final Top 12 selection (recorded in `raw/candidate_pool.json`).

## RECOMMENDATION
- N/A (this file records the executed steps; actionable changes are in `ISA_ACTION_PLAN.md`).

## Steps Executed (Concise)
1. Preflight: clean `git status --porcelain`, fetch `origin`, verify GH auth and API reachability.
2. Worktree + branch: create `research/isa-deep-research-2026-02-15` from `origin/strict-no-console`.
3. Create output dirs under `docs/research/isa-deep-research/2026-02-15/`.
4. Baseline extraction scans for entrypoints, API boundaries, data layer/migrations, CI gates, and observability.
5. GitHub discovery: run 14 planned discovery queries; write `raw/github_discovery_queries.json`.
6. Build candidate pool: union discovery results; cap to 80; write `raw/candidate_pool.json`.
7. Metadata enrichment for Top 12: repo stats, last commit date (default branch head), release date (if any); write `raw/top12_repo_metadata.json`.
8. Forensic path capture for Top 5: shallow partial clones + curated `find` capture; write `raw/top5_forensic_paths.json`.
9. Sentiment source capture: top-comment issues and PRs per Top 12; write `raw/sentiment_sources.json`.
10. Write synthesis markdown, deterministic `benchmarks.json`, and validator; run validator.

---

## 2026-02-20 In-Place Upgrade Addendum

Last verified date: 2026-02-20

### FACT
- Scope lock: only existing files were upgraded in place; no new repo artifacts were created.
- Canonical anchors used for this upgrade: `AGENTS.md`, `docs/INDEX.md`, `docs/spec/ADVISORY/ISA_CORE_CONTRACT.md`.
- Missing artifacts were intentionally represented as markers in existing files:
  - `PROPOSED NEW ARTEFACT (NOT CREATED): docs/research/RESEARCH_PLANS_PACKAGE.md`

### INTERPRETATION
- The repository already contains enough ingestion and provenance structure to define a deterministic research package contract without speculative assumptions.
- Current ingestion is pipeline-specific and source-file-centric; authoritative verification and scope decision logic must be standardized at research-package level.

### RECOMMENDATION
- Keep this addendum as the canonical in-place package contract until/if `docs/research/RESEARCH_PLANS_PACKAGE.md` is explicitly approved and created.

### Gate A - Repo-Truth Inventory (PASS)

#### Current pipeline inventory (repo-truth)

| pipeline_id | code_path | input_locator | storage_targets | provenance_fields | last_verified_date | gaps_vs_target |
| --- | --- | --- | --- | --- | --- | --- |
| INGEST-02_GDSN_CLASSES | `server/ingest/INGEST-02_gdsn_current.ts` | `data/gs1/gdsn/gdsn_classes.json` | `rawGdsnClasses`, `gdsnClasses` | `pipeline_type`, `item_key`, `source_locator`, `retrieved_at`, `content_hash`, `parser_version`, `last_ingested_at`, `trace_id` | 2026-02-20 | row-level license, publication date, and authority_tier are not persisted in provenance table |
| INGEST-02_GDSN_CLASS_ATTRIBUTES | `server/ingest/INGEST-02_gdsn_current.ts` | `data/gs1/gdsn/gdsn_classAttributes.json` | `rawGdsnClassAttributes`, `gdsnClassAttributes` | same as above | 2026-02-20 | no standardized dataset candidate ID linkage |
| INGEST-02_GDSN_VALIDATION_RULES | `server/ingest/INGEST-02_gdsn_current.ts` | `data/gs1/gdsn/gdsn_validationRules.json` | `rawGdsnValidationRules`, `gdsnValidationRules` | same as above | 2026-02-20 | no explicit upstream status/version field beyond parser version |
| INGEST-03_ESRS_DATAPOINTS | `server/ingest/INGEST-03_esrs_datapoints.ts` | `data/efrag/EFRAGIG3ListofESRSDataPoints.xlsx` | `rawEsrsDatapoints`, `esrsDatapoints` | `pipelineType`, `itemKey`, `sourceLocator`, `retrievedAt`, `contentHash`, `parserVersion`, `traceId` | 2026-02-20 | no authoritative release-ID field (for example taxonomy package version) |
| INGEST-04_CTES_KDES | `server/ingest/INGEST-04_ctes_kdes.ts` | `data/esg/ctes_and_kdes.json` | `rawCtesKdes`, `ctes`, `kdes`, `cteKdeMappings` | `pipeline_type`, `item_key`, `source_locator`, `retrieved_at`, `content_hash`, `parser_version`, `last_ingested_at`, `trace_id` | 2026-02-20 | no in/out scope decision persisted with ingested rows |
| INGEST-05_DPP_COMPONENTS | `server/ingest/INGEST-05_dpp_rules.ts` | `data/esg/dpp_identifier_components.json` | `rawDppIdentifierComponents`, `dppIdentifierComponents` | same as above | 2026-02-20 | no machine-readable authority tier persisted |
| INGEST-05_DPP_RULES | `server/ingest/INGEST-05_dpp_rules.ts` | `data/esg/dpp_identification_rules.json` | `rawDppIdentificationRules`, `dppIdentificationRules` | same as above | 2026-02-20 | no explicit legal basis linkage field |
| INGEST-06_CBV_VOCABULARIES | `server/ingest/INGEST-06_cbv_digital_link.ts` | `data/cbv/cbv_esg_curated.json` | `rawCbvVocabularies`, `cbvVocabularies` | same as above | 2026-02-20 | no explicit upstream artifact hash recorded separately from payload hash |
| INGEST-06_DIGITAL_LINK_TYPES | `server/ingest/INGEST-06_cbv_digital_link.ts` | `data/digital_link/linktypes.json` | `rawDigitalLinkTypes`, `digitalLinkTypes` | same as above | 2026-02-20 | no standardized provenance pointer to authoritative GS1 release channel |
| CORPUS_INGESTION_SERVICE | `server/services/corpus-ingestion/index.ts` | source payload (`IngestionSourceInput` and content/chunks) | `sources`, `source_chunks`, optional embeddings | `externalId`, `sourceType`, `authorityLevel`, `publisher`, `version`, `publicationDate`, `officialUrl`, `archiveUrl` | 2026-02-20 | no mandatory `license/usage` field in source input contract |
| GS1_REF_CORPUS_SNAPSHOT | `data/gs1_ref_corpus/metadata/manifest.json`, `data/gs1_ref_corpus/metadata/metadata.jsonl` | `https://ref.gs1.org/sitemap.xml` and discovered URLs | snapshot manifest + per-document metadata rows | `bundle_id`, `created_at`, `sitemap_url`, `hosts_allowed`, per-doc checksum/format/use | 2026-02-20 | allowlist exists (`hosts_allowed`) but no explicit triage decision ledger |
| NEWS_SOURCE_CATALOG | `server/news-sources.ts` | curated static source config + phase3 mapping | `NEWS_SOURCES` in code config | `type`, `rssUrl/apiUrl`, `credibilityScore`, `keywords`, `enabled` | 2026-02-20 | no first-class drift-event table for source lifecycle/changes |

#### Current source types and authority mapping (repo-truth)

| source_type | code_truth_location | mapped_authority_level |
| --- | --- | --- |
| `eu_regulation`, `eu_directive` | `server/services/corpus-ingestion/index.ts` | 1-2 |
| `gs1_global_standard`, `gs1_regional_standard`, `gs1_datamodel` | `server/services/corpus-ingestion/index.ts` | 1-3 |
| `official_guidance`, `industry_standard`, `third_party_analysis`, `news_article` | `server/services/corpus-ingestion/index.ts` | 3-5 |

### Unified metadata glossary (canonical research package fields)

| field | meaning | required_for_candidate_row | current_repo_alignment |
| --- | --- | --- | --- |
| `authority_tier` | authority ranking for trust and precedence | yes | partially aligned (`authorityLevel` exists in corpus ingestion, but not uniformly across pipelines) |
| `source/publisher` | accountable publisher/issuing body | yes | partially aligned (`publisher` in corpus ingestion; missing in several ingest pipelines) |
| `date(s)` | publication/update/effective dates | yes | partial (`publicationDate` exists in corpus ingestion; `retrieved_at` in provenance) |
| `version/status` | official version and lifecycle state | yes | partial (`version` in corpus ingestion; parser version in provenance) |
| `URL(s)` | authoritative and archive URLs | yes | partial (`officialUrl`, `archiveUrl`; GS1 corpus snapshot URLs) |
| `format(s)` | file/API format (xml, json, xlsx, pdf, etc.) | yes | present in GS1 snapshot metadata; not standardized in all ingest pipelines |
| `license/usage` | legal usage constraints and redistribution posture | yes | gap: not mandatory in current ingestion schemas |
| `last_verified_date` | ISO date of verification run | yes | present in docs and provenance retrieval timestamps, not normalized as package field |
| `capability_impact` | explicit impact across 6 capabilities | yes | gap: not currently persisted in ingestion tables |
| `scope_decision` | `IN`, `OUT`, or `WATCH` with rationale | yes | gap: currently only ad hoc in research docs |

### Authority rubric (single CURRENT/TARGET contract)

| authority_tier | class | examples | usage rule |
| --- | --- | --- | --- |
| 1 | EU institutions and official legal publication channels | EUR-Lex, Official Journal, Publications Office | default authoritative basis for legal/regulatory claims |
| 2 | Official standards bodies | GS1 global/ref channels | authoritative for standards/specification content |
| 3 | Official technical implementations/guidance from delegated maintainers | EFRAG ESRS taxonomy and implementation guidance | authoritative when explicitly linked to tier 1 legal basis |
| 4 | Regulators and competent authorities | ESMA, EBA, EIOPA, national authorities | interpretive guidance; cannot overrule tier 1/2 |
| 5 | Industry and OSS | GitHub repositories, community tools | supportive only; must link back to tier 1-4 source |

### Capability impact mapping template (required for each candidate)

| candidate_id | ASK_ISA | NEWS_HUB | KNOWLEDGE_BASE | CATALOG | ESRS_MAPPING | ADVISORY | notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `<dataset-id>` | yes/no | yes/no | yes/no | yes/no | yes/no | yes/no | concise impact statement |

### Verification contract (research package)

- Every external row must include `last_verified_date=2026-02-20` for this run.
- If live verification is blocked, set relevant field to `UNKNOWN` and state the reason inline.
- No dataset/source candidate may be marked `IN` without:
  - an authority tier assignment,
  - explicit source URL(s),
  - scope rationale,
  - capability mapping.
- GitHub-derived candidates remain supportive-only until linked to an authoritative upstream source.

### PROPOSED NEW ARTEFACT (NOT CREATED)

- `docs/research/RESEARCH_PLANS_PACKAGE.md`
- Reason not created: this run is constrained to in-place upgrades of existing artifacts only.
- Current placement: this addendum now acts as the package-level canonical contract in-place.
