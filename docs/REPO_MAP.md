# ISA Repository Map

Status: SUPPORTING
Canonical replacement: `docs/INDEX.md`
Last reviewed: 2026-03-06
Scope: Navigation/support only; not source-of-truth for architecture, planning, or operations.

## Purpose

Use this file for a quick structural orientation to the repository.
For authority questions, follow the canonical chain instead of this support map.

## Canonical First-Read Chain

1. `README.md`
2. `AGENT_START_HERE.md`
3. `docs/INDEX.md`
4. `docs/governance/TECHNICAL_DOCUMENTATION_CANON.md`
5. `docs/spec/ARCHITECTURE.md`
6. `docs/spec/ISA_DATA_PLANE_ARCHITECTURE.md`
7. `docs/planning/NEXT_ACTIONS.json`

## Repository Zones

| Area | Path | Primary purpose |
| --- | --- | --- |
| Frontend | `client/` | React app and UI surfaces |
| Backend | `server/` | Express, tRPC, services, runtime logic |
| Database schema | `drizzle/` | Drizzle schema and MySQL migration history |
| Postgres migration line | `drizzle_pg/` | Postgres schema and isolated PG migration history |
| Scripts | `scripts/` | Dev, validation, ingest, and governance automation |
| Data | `data/` | Dataset metadata and source material |
| Canonical docs | `docs/governance/`, `docs/spec/`, `docs/planning/`, `docs/decisions/` | Authority, contracts, planning, decisions |
| Generated architecture contracts | `docs/architecture/panel/_generated/` | Machine-readable manifests and validation bundle |
| Historical archive | `isa-archive/` | Historical reference only |
| External/reference corpus | `openclaw_audit/` | Non-canonical audit/source material used by some local config |

## Code Entrypoints

| Topic | Path |
| --- | --- |
| Server entry | `server/_core/index.ts` |
| Client entry | `client/src/main.tsx` |
| Root API router | `server/routers.ts` |
| Default DB/runtime helpers | `server/db.ts` |
| Environment validation | `server/_core/env.ts` |
| Main schema | `drizzle/schema.ts` |
| Postgres connection path | `server/db-connection-pg.ts` |

## Where To Look First

| Question | Best starting point |
| --- | --- |
| What is ISA? | `README.md` |
| How should an agent work here? | `AGENT_START_HERE.md` and `docs/agent/AGENT_MAP.md` |
| What is canonical technical truth? | `docs/governance/TECHNICAL_DOCUMENTATION_CANON.md` |
| What is the system architecture? | `docs/spec/ARCHITECTURE.md` |
| What is the data-plane contract? | `docs/spec/ISA_DATA_PLANE_ARCHITECTURE.md` |
| What is the current work queue? | `docs/planning/NEXT_ACTIONS.json` |
| Which capability owns what? | `docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json` |

## Scope Rule

Do not use this file to determine:
- current work status
- canonical architecture authority
- deployment truth
- policy precedence

Those scopes belong to the canonical replacements listed above.
