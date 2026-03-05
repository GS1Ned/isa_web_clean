Status: CANONICAL
Last Updated: 2026-03-05

# ISA Data Plane Architecture

## Purpose
This is the canonical data-plane contract for ISA: persistence substrate, provenance model, retrieval substrate, migration invariants, and engine-policy semantics across all six capabilities.

## Canonical Authority Chain
- Governance root: `docs/governance/_root/ISA_GOVERNANCE.md`
- Technical canon: `docs/governance/TECHNICAL_DOCUMENTATION_CANON.md`
- System contract: `docs/spec/ARCHITECTURE.md`
- Data-plane migration ADR: `docs/decisions/ADR-0001_SUPABASE_POSTGRES_DATA_PLANE.md`
- Ownership contract: `docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json`
- Primitive contract: `docs/architecture/panel/_generated/PRIMITIVE_DICTIONARY.json`
- Code truth: `server/db.ts`, `server/db-connection.ts`, `drizzle/schema*.ts`, `server/services/corpus-governance/index.ts`, `server/services/canonical-facts/index.ts`

## 1) Current Data Plane (As-Built)

### 1.1 Relational Core
**FACT:** Current runtime uses a MySQL-compatible relational core through `drizzle-orm/mysql2` + `mysql2`.

**FACT:** Runtime entrypoints are:
- `server/db.ts`
- `server/db-connection.ts`

**FACT:** Current canonical table declarations are in `drizzle/schema*.ts` via `mysqlTable(...)`.

**FACT (2026-03-05 tranche):** Parallel Postgres subset declarations now exist in `drizzle_pg/schema.ts` via `pgTable(...)` for top-3 journey migration slices.

### 1.2 Authority, Provenance, Evidence
**FACT:** Provenance/evidence metadata exists in the relational model (`authorityTier`, `licenseType`, `publicationStatus`, `immutableUri`, verification timestamps, content hashes).

**FACT:** Deterministic evidence binding exists through `evidenceKey = ke:<sourceChunkId>:<contentHash>`.

### 1.3 Retrieval Substrate
**FACT:** Retrieval is implemented on the shared corpus + embeddings path (`server/db-knowledge.ts`, `server/db-knowledge-vector.ts`, `server/hybrid-search.ts`, `server/embedding.ts`).

## 2) Target Data Plane (Confirmed)

### 2.1 Engine Target
**TARGET:** ISA target engine is Postgres-compatible relational DB with Supabase Postgres as reference managed platform and Supabase Local as local parity runtime.

**TARGET:** Drizzle remains the ORM.

**TARGET:** Migration is rebuild + rehydration from authoritative sources plus deterministic regeneration of derived artifacts.

### 2.2 Scope Boundaries (This Migration Line)
**TARGET (IN):**
- Postgres engine migration path
- Supabase Local parity
- Parallel Postgres migration history (`drizzle_pg/`)

**TARGET (OUT):**
- Supabase Auth, Storage, Realtime adoption
- pgvector-serving/retrieval redesign in this migration line
- dual-write runtime

### 2.3 Shared-Layer Target Model
1. Relational authority core
2. Evidence/provenance layer
3. Retrieval substrate (contract-preserving)
4. Optional semantic projection (additive, not required for cutover)

## 3) Migration Invariants (Merge-Blocking)

1. MySQL migration history is immutable.
2. Postgres migration history is parallel and isolated.
3. Ask ISA citation/evidence integrity is non-regressive.
4. ESRS negative fixtures stay negative.
5. Upsert/ingest semantics remain idempotent.
6. Advisory hot filters use normalized relational join paths (not JSON containment as primary hot path).
7. DB migration line remains DB-only (no required `@supabase/supabase-js` runtime coupling).

## 4) Migration Phases (Canonical IDs)

- `ISA2-0010`: Canon + ADR convergence
- `ISA2-0011`: Tooling parity foundation
- `ISA2-0012`: Gate portability for mixed dialects
- `ISA2-0013a` / `ISA2-0014`: Ask ISA PG subset + parity gates
- `ISA2-0015a` / `ISA2-0015b`: ESRS mapping PG subset + parity gates
- `ISA2-0016`: Advisory PG subset + normalized model
- `ISA2-0017`: Rehydration and deterministic rebuild harness
- `ISA2-0018`: CI parity + limited runtime seam
- `ISA2-0019`: Cutover readiness review
- `ISA2-0020`: Runtime cutover

### 4.1 Current Implementation Evidence (in-progress slices)
- `drizzle_pg/schema.ts` (top-3 subset `pgTable(...)` declarations)
- `drizzle_pg/migrations/0000_isa_top3_subset.sql` (parallel Postgres migration history root)
- `scripts/dev/postgres-apply-migrations.sh` + `scripts/dev/postgres-parity-smoke.sh` (deterministic local/CI apply + smoke path)
- `drizzle/migrations/0024_add_advisory_target_join_tables.sql` (CURRENT mysql additive normalization for advisory hot filters)
- `server/db-advisory-reports.ts` + `server/services/news-impact/index.ts` (join-table hot-path usage with JSON fallback compatibility)

## 5) Quality Gate Semantics

### Top-3 Journey Gates
- Ask ISA: citation presence/validity mandatory.
- ESRS Mapping: negative fixtures must not regress to false positives.
- Advisory: versioned outputs remain reproducible and evidence-linked.

### Operational Gates
- Postgres migrations apply deterministically in local/CI.
- Rebuild harness can construct top-3 journey substrate from authoritative source manifests.

## 6) Rehydration Policy

**FACT:** TiDB continuity/export is not a dependency.

**TARGET:** Authoritative rebuild inputs are source registries and canonical ingestion manifests (EU-Lex/EFRAG/GS1 and related authority set as defined by capability contracts).

**TARGET:** Derived artifacts (embeddings/indexes/mapping materializations) are regenerated deterministically and validated by stage-aware eval thresholds.

## 7) Engine Policy Contract

**FACT:** Current engine remains MySQL-compatible until cutover readiness is accepted.

**TARGET:** Postgres/Supabase becomes default only after `ISA2-0019` readiness criteria are satisfied.

**TARGET:** Engine switch without ADR-backed governance evidence is blocked by gate.

## 8) Non-Goals

- No architecture authority from ad hoc research notes or chat transcripts.
- No parallel target-state documents outside canonical chain.
- No hidden runtime coupling to Supabase platform features outside DB scope.
