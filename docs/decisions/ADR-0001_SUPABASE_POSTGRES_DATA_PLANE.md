Status: DECISION_CONFIRMED (Human)
Date: 2026-02-22
Last Updated: 2026-03-05
Scope: ISA Web data plane (all capabilities)
Supersedes: Implicit MySQL/TiDB future-target wording
Does Not Supersede: CURRENT implementation reality (`drizzle-orm/mysql2`, `mysql2`) until cutover is completed

# ADR-0001 — Supabase/Postgres as ISA Data Plane Target

## Decision

ISA's target data-plane engine is Postgres-compatible relational DB, with Supabase Postgres as the reference managed platform and Supabase Local as the local parity environment.

- Drizzle remains the ORM.
- TiDB export/import continuity is not assumed.
- Migration path is rebuild + rehydration from authoritative sources plus deterministic regeneration of derived artifacts.

## Context

CURRENT runtime is MySQL-compatible (`drizzle-orm/mysql2`, `mysql2`) and must stay functional until top-3 journey parity is proven on Postgres.

The migration decision is necessary because TiDB continuity is no longer reliable for deterministic lifecycle management and ISA requires stronger local parity and operational predictability for evidence-first flows.

## Scope Boundaries (Hard)

- Included:
  - Postgres engine + Supabase Local parity
  - Drizzle ORM
  - Parallel Postgres migration history (`drizzle_pg/`)
- Explicitly excluded in this migration line:
  - Supabase Auth/Storage/Realtime adoption
  - pgvector-serving redesign or retrieval substrate redesign
  - dual-write architecture

## Migration Invariants (Merge-Blocking)

1. MySQL migrations are immutable.
2. Postgres migrations live in a separate history path (`drizzle_pg/`).
3. Ask ISA citation/evidence integrity remains non-regressive.
4. ESRS negative fixtures remain negative.
5. Ingest/upsert semantics remain idempotent.
6. Advisory hot filters use normalized join paths (not JSON containment as primary hot path).
7. DB migration line remains DB-only (no runtime `@supabase/supabase-js` coupling required).

## Acceptance Gates

Top-3 user journeys (Ask ISA, ESRS_MAPPING, ADVISORY) must pass parity checks before default runtime cutover.

- Ask ISA: citation presence/validity stays mandatory.
- ESRS_MAPPING: negative fixtures do not regress to false positives.
- ADVISORY: versioned outputs remain reproducible and evidence-linked.

Operational acceptance requires deterministic local/CI Postgres migration execution and reproducible rebuild from authoritative datasets.

## Execution Plan (Canonical IDs)

- ISA2-0010: Canon + ADR convergence
- ISA2-0011: Tooling parity foundation (Supabase Local + CI Postgres scaffold)
- ISA2-0012: Gate portability for mixed dialects
- ISA2-0013a / ISA2-0014: Ask ISA Postgres schema subset + parity gates
- ISA2-0015a / ISA2-0015b: ESRS_MAPPING subset + parity gates
- ISA2-0016: Advisory subset + normalized filtering model
- ISA2-0017: Rehydration + deterministic rebuild harness
- ISA2-0018: CI parity + limited runtime seam
- ISA2-0019: Cutover readiness review
- ISA2-0020: Runtime cutover

## References

- `docs/spec/ISA_DATA_PLANE_ARCHITECTURE.md`
- `docs/spec/ARCHITECTURE.md`
- `docs/spec/INTEGRATION_CONTRACTS.md`
- `docs/planning/NEXT_ACTIONS.json`
