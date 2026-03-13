Status: CANONICAL
Last Updated: 2026-03-09

# ISA Provenance Rebuild Specification

## Purpose
This is the canonical Phase 2 implementation contract for rebuilding the authoritative `sources` / `source_chunks` provenance substrate that Phase 3 must implement.

Use this document together with:
- `docs/governance/TECHNICAL_DOCUMENTATION_CANON.md`
- `docs/spec/ISA_DATA_PLANE_ARCHITECTURE.md`
- `docs/spec/KNOWLEDGE_BASE/RUNTIME_CONTRACT.md`
- `docs/spec/CATALOG/RUNTIME_CONTRACT.md`
- `docs/spec/ASK_ISA/RUNTIME_CONTRACT.md`
- `docs/spec/ESRS_MAPPING/RUNTIME_CONTRACT.md`
- `docs/spec/ADVISORY/RUNTIME_CONTRACT.md`
- `docs/planning/NEXT_ACTIONS.json`

## Current Repo-Grounded Baseline
- **FACT:** `knowledge_embeddings` is the active retrieval-ready chunk substrate in current runtime code (`server/db-knowledge.ts`, `server/db-knowledge-vector.ts`, `server/citation-validation.ts`).
- **FACT:** `sources` and `source_chunks` already exist as schema intent and partial ingestion code (`drizzle/schema_corpus_governance.ts`, `server/services/corpus-ingestion/index.ts`), but they are not yet the canonical runtime citation path.
- **FACT:** `dataset_registry` already carries `authorityTier`, `publicationStatus`, `immutableUri`, source locators, and `lastVerifiedDate` (`drizzle/schema.ts`, `server/routers/dataset-registry.ts`).
- **FACT:** Canonical evidence keys already exist as `ke:<chunkId>:<contentHash>` and verification posture already uses a 90-day freshness rule (`server/knowledge-provenance.ts`).
- **FACT:** Phase 1 introduced reusable metric IDs for retrieval relevance, citation usability, provenance completeness, unsupported-answer detection, decision quality, advisory traceability, and GS1 authority classification.
- **INTERPRETATION:** Phase 3 must preserve current evidence-key and verification semantics while moving the backing substrate from `knowledge_embeddings` metadata proxies to authoritative `sources` / `source_chunks`.

## A. Provenance Design Principles
1. Authority admission comes before retrieval. No document or artifact becomes authoritative because it looks official or shares a brand namespace.
2. A `source` is the authoritative versioned document or machine-readable artifact. A `source_chunk` is the smallest citable retrieval unit derived from exactly one `source`.
3. Authority tier, source role, and publication status are separate concerns and must not be collapsed into one field.
4. `knowledge_embeddings` remains a compatibility mirror during Phase 3; it is not the long-term authority backbone.
5. Evidence keys remain deterministic and stable across capability consumers.
6. Missing or stale provenance must be detectable and penalized, not silently tolerated.
7. Non-authoritative but useful materials may be admitted only with explicit downgraded role semantics.
8. Phase 1 metric IDs remain stable; Phase 3 tightens their evidence source instead of renaming them.

## B. Canonical Source And Authority Model

### 1. What is a `source`?
A `source` is a versioned, registrable, verifiable document or machine-readable artifact admitted into ISA and linked to exactly one dataset-registry dataset identity.

### 2. What is a `source_chunk`?
A `source_chunk` is the smallest citable retrieval unit derived from one `source` version. Every `source_chunk` must resolve back to one `source` and expose enough locator metadata for human review.

### 3. Authority Axes

| Axis | Purpose | Target values | Notes |
| --- | --- | --- | --- |
| `authorityTier` | Who has issuing authority | `EU`, `GS1_Global`, `GS1_MO`, `EFRAG`, `OTHER_OFFICIAL`, `SUPPLEMENTAL`, `UNKNOWN` | Current helper only derives `EU`, `GS1_Global`, `GS1_MO`, `UNKNOWN`; Phase 3 must extend intentionally rather than infer loosely. |
| `sourceRole` | How ISA may use the source | `normative_authority`, `canonical_technical_artifact`, `supplemental_source` | New Phase 3 contract. This is the main guardrail against GitHub or guidance contamination. |
| `publicationStatus` | Lifecycle / legal-operational posture | `in_force`, `consolidated`, `draft`, `provisional`, `guidance_non_authoritative`, `superseded`, `withdrawn`, `archived`, `unknown` | Current freeform status fields map into this normalized set during rebuild. |

### 4. Minimum Source-Class Handling

| Source class | `authorityTier` | `sourceRole` | `publicationStatus` default | Admission rule |
| --- | --- | --- | --- | --- |
| EUR-Lex / Official Journal legal act | `EU` | `normative_authority` | `in_force` or `draft` | Stable legal identifier and official locator required. |
| Consolidated EU text | `EU` | `normative_authority` | `consolidated` | Must still preserve underlying act identity and version date. |
| EFRAG-hosted ESRS implementation guidance / Q&A | `EFRAG` | `supplemental_source` | `guidance_non_authoritative` | May clarify but must never override EU legal text. |
| EFRAG-hosted technical artifacts where no higher-tier machine-readable publication exists | `EFRAG` | `canonical_technical_artifact` | `provisional` or `guidance_non_authoritative` | Requires explicit registry admission note. |
| GS1 standard page or PDF on `gs1.org` / `ref.gs1.org` | `GS1_Global` | `normative_authority` | `in_force` or `provisional` | Default normative GS1 authority path. |
| GS1 technical artifact on `ref.gs1.org` or other registered GS1 publication surface | `GS1_Global` or `GS1_MO` | `canonical_technical_artifact` | `in_force` or `provisional` | Artifact role must be explicit; not every technical file is normative text. |
| GitHub-hosted GS1 repository artifact with explicit registry admission | `GS1_Global` or `GS1_MO` | `canonical_technical_artifact` | `provisional` or `unknown` | Allowed only with explicit registry admission or proof that GitHub is the canonical publication channel for that artifact. |
| Unregistered `github.com/gs1/*` repository or release asset | `UNKNOWN` | `supplemental_source` | `unknown` | Must not be treated as authoritative by namespace alone. |
| Third-party analysis / news / commentary | `SUPPLEMENTAL` or `UNKNOWN` | `supplemental_source` | `guidance_non_authoritative` or `unknown` | Useful context only; cannot satisfy normative evidence requirements by itself. |

## C. `sources` Entity Contract

### 1. Canonical Definition
The `sources` table is the authoritative, versioned document registry for evidence-bearing material. One row represents one retrievable source version.

### 2. Field-Level Contract

| Logical field | Required for trustworthiness | Current anchor | Phase 3 requirement |
| --- | --- | --- | --- |
| `id` | MUST | `sources.id` | Stable row identifier. |
| `datasetId` | MUST | `knowledge_embeddings.datasetId` only today | New `sources` field or equivalent queryable mapping to `dataset_registry`; must use the same logical identifier namespace used by current KB metadata. |
| `externalId` | CONDITIONAL | `sources.external_id` | Required when upstream provides stable external identity such as CELEX or a published GS1 identifier. |
| `sourceType` | MUST | `sources.source_type` | Keep current domain-oriented type taxonomy unless stronger repo evidence requires extension. |
| `sourceRole` | MUST | none | New field distinguishing `normative_authority`, `canonical_technical_artifact`, `supplemental_source`. |
| `authorityTier` | MUST | `sources.authority_tier`, `dataset_registry.authority_tier` | Must be queryable and derived from admission rules, not only hostname heuristics. |
| `publicationStatus` | MUST | `sources.publication_status`, `dataset_registry.publication_status` | Must normalize legacy freeform statuses into the target vocabulary. |
| `title` | MUST | `sources.name` | Human-usable title for citations and review. |
| `version` | CONDITIONAL | `sources.version` | Required whenever upstream publishes a version, release, or dated edition. |
| `immutableUri` | CONDITIONAL | `sources.immutable_uri`, `dataset_registry.immutable_uri` | Required when upstream offers a stable versioned URI; if absent, registry metadata must record why. |
| `sourceLocator` | MUST | `sources.official_url` or dataset registry download/API URL | Single canonical retrievable locator for this source version. |
| `archiveUrl` | MAY | `sources.archive_url` | Optional preservation pointer for non-immutable upstreams. |
| `publisher` | MUST | `sources.publisher` | Human-reviewable issuer string. |
| `publisherUrl` | MAY | `sources.publisher_url` | Optional issuer landing page. |
| `publicationDate` | CONDITIONAL | `sources.publication_date` | Required for dated standards, acts, and guidance where upstream exposes it. |
| `effectiveDate` | CONDITIONAL | `sources.effective_date` | Required for legal sources or guidance with explicit effective posture. |
| `expirationDate` | MAY | `sources.expiration_date` | Optional lifecycle end date. |
| `retrievedAt` | MUST | `ingest_item_provenance.retrieved_at` only today | New source-level field capturing when bytes or payload were fetched. |
| `lastVerifiedDate` | MUST | `sources.last_verified_date`, `dataset_registry.lastVerifiedDate` | Must continue to drive the existing 90-day verification helper. |
| `verificationStatus` | MUST | `sources.verification_status` | Queryable verification state aligned with verification helper results. |
| `contentHash` | MUST | chunk-level only today | New source-level checksum for the canonical retrieved artifact or payload. |
| `status` | MUST | `sources.status` | Preserve current lifecycle semantics `draft/active/superseded/deprecated/archived`. |
| `supersededBySourceId` | MAY | `sources.superseded_by` | Must model supersession chains when a newer source version is admitted. |
| `language` | MUST | `sources.language` | Default `en` only when upstream language is genuinely unknown. |
| `description` | MAY | `sources.description` | Optional summary for catalog and review tooling. |
| `admissionBasis` | MUST | none | New field or queryable metadata: `official_publication`, `registry_registered_artifact`, `canonical_publication_evidence`, `supplemental_only`. |

### 3. Mandatory Vs Optional
- **MUST for trustworthiness:** `datasetId`, `sourceType`, `sourceRole`, `authorityTier`, `publicationStatus`, `title`, `sourceLocator`, `publisher`, `retrievedAt`, `lastVerifiedDate`, `verificationStatus`, `contentHash`, `status`, `admissionBasis`.
- **CONDITIONAL but effectively mandatory when available upstream:** `externalId`, `version`, `immutableUri`, `publicationDate`, `effectiveDate`.
- **Optional enrichment:** `archiveUrl`, `expirationDate`, `publisherUrl`, `description`, `sector`, extended metadata notes.

## D. `source_chunks` Entity Contract

### 1. Canonical Definition
The `source_chunks` table is the authoritative chunk registry for citations, retrieval, and downstream evidence references. It replaces metadata-only provenance proxies with chunk-addressable evidence.

### 2. Field-Level Contract

| Logical field | Required for trustworthiness | Current anchor | Phase 3 requirement |
| --- | --- | --- | --- |
| `id` | MUST | `source_chunks.id` | Stable chunk identifier. |
| `sourceId` | MUST | `source_chunks.source_id` | Foreign-key-like link to the owning `source`. |
| `chunkIndex` | MUST | `source_chunks.chunk_index` | Stable order within source version. |
| `chunkType` | MUST | `source_chunks.chunk_type` | Preserve structure-first chunk taxonomy. |
| `content` | MUST | `source_chunks.content` | Canonical retrievable text used for embeddings and citations. |
| `contentHash` | MUST | `source_chunks.content_hash` | Canonical checksum used in evidence keys. |
| `sectionPath` | CONDITIONAL | `source_chunks.section_path` | Required when structural sections exist. |
| `heading` | CONDITIONAL | `source_chunks.heading` | Required when a heading or label is available. |
| `charStart` / `charEnd` | CONDITIONAL | `source_chunks.char_start`, `source_chunks.char_end` | Required for plain-text or HTML chunks when character spans are knowable. |
| `pageStart` / `pageEnd` | MAY | none | Optional future enrichment for PDF-derived citations. |
| `version` | CONDITIONAL | `source_chunks.version` | Mirror the owning source version unless chunk-specific versioning exists. |
| `isActive` | MUST | `source_chunks.is_active` | Only active chunks may satisfy retrieval/citation requirements. |
| `deprecatedAt` / `deprecationReason` | MAY | existing fields | Must be populated when chunks are superseded or invalidated. |
| `embedding` | MAY | `source_chunks.embedding` | Optional storage location; Phase 3 may keep embeddings in `knowledge_embeddings` compatibility rows instead. |
| `embeddingModel` / `embeddingGeneratedAt` | CONDITIONAL | existing fields | Required wherever chunk embeddings are generated. |
| `sourceChunkLocator` | MUST (derived) | none | Derived locator string from structural fields, page span, or char span. |
| `citationLabel` | MUST (derived) | none | Derived human-usable citation label. |
| `evidenceKey` | MUST (derived) | `server/knowledge-provenance.ts` | Deterministic `ke:<sourceChunkId>:<contentHash>`. |

### 3. Chunk Boundary Rules
1. Preserve structural boundaries first. Reuse the current article/section-first chunking logic from `server/services/corpus-ingestion/index.ts`.
2. Use paragraph fallback only when the source lacks usable structure.
3. Keep the current default maximum chunk size (`1500`) and overlap (`100`) unless Phase 3 implementation demonstrates better performance without harming citation usability.
4. Tables, definitions, and formal requirements may be chunked independently even if they are shorter than paragraph defaults.
5. A chunk must never mix content from different source versions.
6. If structural locators are unavailable, char spans become mandatory.

### 4. Evidence Key And Citation Usability Contract
- **FACT:** The canonical evidence key prefix is already `ke:`.
- **TARGET:** `buildKnowledgeEvidenceKey()` must resolve `chunkId` to `source_chunks.id` once Phase 3 lands.
- **TARGET:** `citationLabel` must combine source title + best locator + version when available.
- **TARGET:** Every consumer-facing citation payload must expose:
  - `sourceId`
  - `sourceChunkId`
  - `evidenceKey`
  - `citationLabel`
  - `sourceLocator`
  - `immutableUri`
  - `authorityTier`
  - `sourceRole`
  - `publicationStatus`
  - `lastVerifiedDate`
  - `needsVerification`
  - `verificationReason`

## E. Dataset Registry And Authority Admission Rules
1. Every admitted `source` must resolve to one dataset-registry identity before chunk ingestion starts.
2. Phase 3 must preserve current registry fields `authorityTier`, `publicationStatus`, `immutableUri`, `lastVerifiedDate`, and source locator fields.
3. Phase 3 must add queryable admission metadata for:
  - `sourceRole`
  - `admissionBasis`
  - `canonicalPublicationUrl` or equivalent
  - `normativeAuthorityUrl` when the admitted artifact is not itself normative text
4. If schema minimization is required, the new admission metadata may land first under `dataset_registry.metadata`, but it must still be validated, queryable, and testable.
5. Registry admission must reject a dataset from satisfying `normative_authority` requirements when:
  - the upstream is a mirror or artifact host only,
  - verification metadata is missing,
  - publication status is unknown and no admission note exists,
  - the only locator is an unregistered GitHub repository.

## F. GS1 Authority Handling Rules
1. Normative authority is not inferred from name, brand, or namespace alone.
2. For GS1, default normative authority is `gs1.org`, `www.gs1.org`, and `ref.gs1.org`.
3. `github.com/gs1/*` is not automatically authoritative.
4. A GitHub-hosted GS1 artifact is acceptable only when one of these is true:
  - it is explicitly registered as a `canonical_technical_artifact`, or
  - the registry stores evidence that GitHub is the canonical publication channel for that specific artifact.
5. Even when a GitHub-hosted GS1 artifact is admitted, its `sourceRole` remains `canonical_technical_artifact` unless the registry stores explicit evidence that it is also the normative publication surface.
6. Registry admission and evaluation must distinguish:
  - `normative_authority`
  - `canonical_technical_artifact`
  - `supplemental_source`

## G. Provenance-To-Capability Mapping

| Capability | Phase 3 provenance requirement |
| --- | --- |
| `CATALOG` | Dataset registry and standards-directory surfaces must expose dataset identity, authority tier, source role, publication status, immutable URI or source locator, and verification posture for admitted sources. |
| `KNOWLEDGE_BASE` | Retrieval returns must resolve through `source_chunks` and preserve `sourceChunkId`, `evidenceKey`, `citationLabel`, `datasetId`, and verification posture. `knowledge_embeddings` becomes a compatibility mirror, not the authority record. |
| `ESRS_MAPPING` | Mappings, gap outputs, and recommendations must carry `evidenceRefs` arrays pointing to one or more `source_chunks`, or an explicit insufficiency marker when no authoritative chunk exists. |
| `ASK_ISA` | Passing answers must cite verified, non-deprecated `source_chunks`. Stage-a abstention continues when chunk-level evidence is missing or stale. |
| `ADVISORY` | `decisionArtifacts`, report snapshots, exports, and diffs must preserve `sourceId`, `sourceChunkId`, `evidenceKey`, authority posture, and insufficiency markers for no-evidence cases. |
| `NEWS_HUB` | When NEWS_HUB flags regulations or reports as needing verification, it should reference the affected dataset/source identities so downstream verification and stale-report logic can target authoritative records. |

## H. Evaluation Mapping From Phase 1 To Phase 2/3

| Phase 1 metric | Current signal | Phase 3 stricter signal |
| --- | --- | --- |
| `kb.retrieval.top1_relevance` | Lexical proxy over corpus metadata fixtures | Gold cases must resolve expected `sourceChunkId` matches from authoritative `source_chunks`. |
| `kb.retrieval.top3_hit_rate` | Fixture retrieval over corpus slice metadata | Top-3 must include at least one expected authoritative chunk and preserve role/tier metadata. |
| `kb.context.usefulness` | Content/metadata usefulness proxy | Retrieved chunks must carry usable structural locators and chunk types that support reviewable citations. |
| `kb.provenance.completeness` | Fixture metadata completeness | Active retrieval rows must expose real `datasetId`, `sourceId`, `sourceChunkId`, `evidenceKey`, `authorityTier`, `sourceRole`, `publicationStatus`, `sourceLocator` or `immutableUri`, and `lastVerifiedDate`. |
| `kb.provenance.missing_detection` | Fixture detection of absent metadata | Missing or stale source/source_chunk fields must trigger `needsVerification`, insufficiency diagnostics, or citation failure. |
| `ask.citation.usability` | Fixture-based source payload quality | Answer citations must resolve to chunk-level labels, locators, and evidence keys usable by humans. |
| `ask.provenance.completeness` | Fixture-based answer/source metadata | A passing answer must cite verified chunk-level evidence with authority posture preserved from the source substrate. |
| `ask.unsupported_answer_rate` | Fixture detection of unsupported answers | Unsupported-answer detection must be driven by absence of matching authoritative `source_chunks`, not metadata proxies alone. |
| `ask.abstention.correctness` | Fixture expectations | Abstention must fire whenever no verified authoritative chunk satisfies stage-a rules. |
| `esrs.mapping.applicability_correctness` | Fixture decision cases | Mapping outputs must show at least one supporting `evidenceRef` or explicit insufficiency reason tied to source role and authority tier. |
| `esrs.mapping.evidence_trace_completeness` | Fixture required-field presence | `evidenceRefs` must resolve to stored `source_chunks` with usable locators. |
| `advisory.provenance.traceability` | Fixture traceability over mapping/diff payloads | Advisory artifacts must persist chunk-level evidence references and preserve them across snapshots and diffs. |
| `source_authority.normative_domain_classification` | Fixture domain classification | Registry admission and runtime helpers must classify admitted source locators and roles consistently with the rebuilt source substrate. |
| `source_authority.github_not_automatic_authority` | Fixture GitHub cases | Live registry/test cases must fail if unregistered `github.com/gs1/*` artifacts are promoted to normative authority. |
| `source_authority.registration_guardrail` | Fixture guardrail | Admission must require explicit registry basis for technical artifact sources. |

### Metric Stability Rule
- **TARGET:** Keep Phase 1 metric IDs stable.
- **TARGET:** Tighten signal source and diagnostics rather than inventing a replacement metric family.
- **TARGET:** Promote provenance-related metrics from proxy fixture mode to fixture-plus-runtime-backed mode after Phase 3 lands.

## I. Rebuild Sequence And Implementation Slices For Phase 3
1. **Registry admission convergence**
   - Extend dataset registry admission semantics for `sourceRole` and `admissionBasis`.
   - Extend authority derivation helpers intentionally for EFRAG and artifact-role handling.
2. **Schema convergence**
   - Converge duplicate provenance schema definitions around one target contract.
   - Add `datasetId`, `retrievedAt`, source-level `contentHash`, and any bridging fields needed for runtime compatibility.
3. **Authoritative source rebuild**
   - Rehydrate `sources` from registered authoritative inputs first: EUR-Lex / OJ, GS1 canonical surfaces, justified EFRAG/technical artifacts.
4. **Chunk build and compatibility bridge**
   - Rebuild `source_chunks` with structure-first chunking.
   - Add a compatibility bridge so every active `knowledge_embeddings` row resolves to one `source_chunks.id`.
5. **Citation and consumer cutover**
   - Update citation validation, ASK_ISA, ESRS mapping evidence references, and advisory persistence/export to consume chunk-level provenance.
6. **Evaluation tightening**
   - Re-run Phase 1 metrics using authoritative source/chunk signals and promote remaining proxy diagnostics only where justified.

## J. Validation And Acceptance Criteria
Phase 3 is not ready for workflow restoration until all of the following are true:
1. `sources` and `source_chunks` are populated for the approved authoritative source classes.
2. Every active `knowledge_embeddings` row has a queryable `sourceChunkId` bridge or equivalent resolver to `source_chunks.id`.
3. `buildKnowledgeEvidenceKey()` still emits `ke:<chunkId>:<contentHash>`, but `chunkId` resolves to authoritative chunk identity.
4. `validateCitations()` can return real `sourceId`, `sourceChunkId`, `authorityTier`, `sourceRole`, `publicationStatus`, `sourceLocator`, `immutableUri`, `lastVerifiedDate`, `needsVerification`, and `verificationReason`.
5. `kb.provenance.completeness`, `kb.provenance.missing_detection`, `ask.citation.usability`, `ask.provenance.completeness`, `esrs.mapping.evidence_trace_completeness`, and `advisory.provenance.traceability` can run against authoritative source/chunk evidence rather than metadata-only proxies.
6. `source_authority.github_not_automatic_authority` and `source_authority.registration_guardrail` continue to pass with live registry-backed cases.
7. `ASK_ISA` stage-a abstention still blocks unsupported answers when verified authoritative chunks are unavailable.
8. ESRS mapping no-mapping and low-confidence cases surface explicit insufficiency or review posture rather than fabricated evidence.
9. Advisory snapshots preserve evidence references across versioning and diff flows.
10. Runtime/documentation validation passes without introducing a parallel architecture authority.

## K. Risks, Unknowns, And Deferred Items
- **FACT:** Current repo has more than one schema surface for dataset registry and corpus governance; Phase 3 must converge them intentionally.
- **UNKNOWN:** Whether PDF page-level addressing is uniformly available across the initial authoritative corpus. Phase 3 may need char-span fallback for some classes.
- **UNKNOWN:** Final licensing and local-storage policy for every future artifact class; Phase 3 must not infer redistribution rights from source branding.
- **INTERPRETATION:** EFRAG authority handling needs explicit implementation because current code only derives `EU`, `GS1_Global`, `GS1_MO`, and `UNKNOWN`.
- **RECOMMENDATION:** Do not change `pgvector`, UI restoration, or broad architecture during Phase 3. Keep the work on source admission, source/chunk rebuild, citation cutover, and metric tightening only.
