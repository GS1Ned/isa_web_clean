Status: CANONICAL
Last Updated: 2026-03-04

# ISA Data Plane Architecture

## Purpose
This document is the canonical technical contract for ISA's shared data plane: storage, provenance, retrieval, and data-plane evolution. It complements `docs/spec/ARCHITECTURE.md` by describing the common substrate beneath the six capabilities without redefining product ownership.

## Canonical Authority
- Governance root: `docs/governance/_root/ISA_GOVERNANCE.md`
- Technical documentation canon: `docs/governance/TECHNICAL_DOCUMENTATION_CANON.md`
- System architecture (`CURRENT` / `TARGET`): `docs/spec/ARCHITECTURE.md`
- Core capability contract: `docs/spec/ADVISORY/ISA_CORE_CONTRACT.md`
- Ownership contract: `docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json`
- Shared primitive contract: `docs/architecture/panel/_generated/PRIMITIVE_DICTIONARY.json`
- Code truth: `server/db.ts`, `server/db-connection.ts`, `drizzle/schema*.ts`, `server/services/corpus-governance/index.ts`, `server/services/canonical-facts/index.ts`, `data/metadata/dataset_registry.json`

## 1. Current Data Plane (Canonical, As-Built)

### 1.1 Relational Core

**FACT:** The current runtime uses a MySQL-compatible relational core through `drizzle-orm/mysql2` and `mysql2/promise`.

**FACT:** Primary runtime connection entrypoints are:
- `server/db.ts`
- `server/db-connection.ts`

**FACT:** Canonical relational table definitions are declared in `drizzle/schema.ts` and supplemental `drizzle/schema*.ts` files via `mysqlTable(...)`.

### 1.2 Authority And Provenance Substrate

**FACT:** `CATALOG` owns the dataset and governance registry surfaces, including `dataset_registry` and related source metadata contracts.

**FACT:** `KNOWLEDGE_BASE` owns the retrieval and citation substrate, including `sources`, `source_chunks`, `knowledge_embeddings`, and ingestion provenance tables.

**FACT:** Authority and publication metadata already exist in the relational model, including fields such as:
- `authorityTier`
- `licenseType`
- `publicationStatus`
- `immutableUri`
- `lastVerifiedDate` / `lastVerifiedAt`

**FACT:** Content hashing is already part of the current substrate through `contentHash` fields on chunk and embedding records.

**FACT:** Deterministic evidence binding already exists through `evidenceKey = ke:<sourceChunkId>:<contentHash>` in `server/services/canonical-facts/index.ts`.

### 1.3 Retrieval Substrate

**FACT:** The current retrieval path is built on the authoritative corpus and embedding records, with search and retrieval logic in:
- `server/db-knowledge.ts`
- `server/db-knowledge-vector.ts`
- `server/hybrid-search.ts`
- `server/embedding.ts`

**FACT:** The current repo truth supports vector-backed retrieval over the relational corpus. The canonical contract does not currently require a separate production graph store or triplestore.

### 1.4 Capability Persistence On The Shared Core

The shared relational core persists both source-of-truth data and capability outputs:

| Capability | Shared data-plane role |
| --- | --- |
| `CATALOG` | authoritative registry of regulations, standards, datasets, and governance artefacts |
| `KNOWLEDGE_BASE` | corpus, chunks, embeddings, provenance, citation substrate |
| `ESRS_MAPPING` | mapping outputs, confidence, recommendation and roadmap data |
| `ASK_ISA` | conversations, feedback, traces, grounded explanation outputs |
| `NEWS_HUB` | change intelligence, pipeline observability, regulatory event history |
| `ADVISORY` | versioned reports, diffs, and stakeholder deliverables |

## 2. Target Data Plane (Canonical)

### 2.1 Stable Target Shape

**TARGET:** ISA keeps a vendor-agnostic shared data plane with four additive layers:
1. Relational authority core
2. Evidence and provenance layer
3. Retrieval layer
4. Optional semantic/graph projection layer

### 2.2 Relational Authority Core

**TARGET:** The relational core remains the system of record for:
- source registry and dataset registry
- governance documents and lifecycle metadata
- mapping outputs and recommendation artefacts
- advisory outputs and operational traces
- user-facing persisted state that requires transactional guarantees

### 2.3 Evidence And Provenance Layer

**TARGET:** Every durable ISA claim must be traceable through:
- source identity
- authority tier
- publication status
- version scope
- immutable or versioned URI when available
- content hash or equivalent snapshot identity
- verification timestamps and verification outcome
- deterministic evidence keys for downstream citation and auditing

### 2.4 Retrieval Layer

**TARGET:** Retrieval remains a first-class shared primitive built from the authoritative corpus, combining lexical and vector access over evidence-backed source material.

**TARGET:** Retrieval policy must stay authority-aware, version-aware, and citation-bound. It must not become a free-form answer layer detached from provenance.

### 2.5 Optional Semantic / Graph Projection

**TARGET:** A graph or semantic projection may be introduced later for canonical facts, typed relations, diffs, and impact analysis.

**TARGET:** Any graph layer must remain additive until it is backed by runtime code, validation, and canonical contracts. It is not a current hard dependency.

## 3. Data Plane Principles

- `Authority-first`: higher-authority sources outrank supportive or derivative material.
- `Evidence-first`: no durable claim without a traceable evidence binding.
- `Version-first`: facts, mappings, and recommendations must be scoped to version/status where applicable.
- `Diff-first`: updates and supersession should be treated as first-class events.
- `Additive-first`: current relational truth is extended by additive metadata and services before any disruptive engine or topology change.
- `Capability-owned outputs`: product surfaces remain capability-owned even when they share one substrate.

## 4. Engine Policy

**FACT:** The current codebase is MySQL-compatible.

**TARGET:** The canonical architecture does not treat TiDB, CockroachDB, YugabyteDB, Neon, or any other engine as an architecture fact unless and until a dedicated migration decision is adopted and implemented.

**TARGET:** Any future engine migration requires a reviewable ADR or equivalent canonical decision artifact that covers:
- workload fit
- schema compatibility
- migration and rollback path
- validation impact
- local/dev parity
- operational ownership

Until such a decision exists, the canonical term is:

`MySQL-compatible relational DB`

## 5. Non-Goals

- Do not use temporary research files, chat transcripts, or ad hoc prompts as data-plane authority.
- Do not redefine capability ownership inside the data-plane contract.
- Do not introduce a mandatory graph/triple-store dependency as a `CURRENT` fact without repo evidence.
- Do not hardcode a vendor migration target in product or capability docs before the migration contract exists.
