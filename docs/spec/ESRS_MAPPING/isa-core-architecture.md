# ISA Core Architecture (Supplemental Reference)

**Status:** SUPPLEMENTAL (non-canonical for system CURRENT/TARGET)  
**Last Updated:** 2026-02-20  
**Canonical System Architecture:** `docs/spec/ARCHITECTURE.md`

---

## Scope

This file is retained as a supplemental historical/analysis reference.
It no longer defines the canonical system CURRENT/TARGET state.

System-level truth now lives in:
- `docs/spec/ARCHITECTURE.md` (single canonical CURRENT + TARGET)
- `docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json`
- `docs/architecture/panel/_generated/PRIMITIVE_DICTIONARY.json`
- `docs/architecture/panel/_generated/CAPABILITY_GRAPH.json`

---

## Authority Rule

If this file conflicts with:
- `docs/governance/_root/ISA_GOVERNANCE.md`
- `docs/agent/AGENT_MAP.md`
- `docs/spec/ARCHITECTURE.md`

then this file is non-authoritative and must be reconciled or ignored for decision-making.

---

## Verified Supplemental Sources

- `server/routers.ts`
- `drizzle/schema.ts`
- `client/src/App.tsx`
- `docs/architecture/panel/ATAM_SCENARIOS.md`
- `docs/architecture/panel/ATAM_RISKS_SENSITIVITIES_TRADEOFFS.md`
- `docs/sre/SLO_CATALOG.md`

---

## Maintenance Note

Use this file only for supplemental architecture narrative.
Do not introduce canonical CURRENT/TARGET claims here.
