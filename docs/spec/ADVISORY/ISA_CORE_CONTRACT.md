# ISA Core Contract
Status: ACTIVE
Last Updated: 2026-02-20

## Canonical Authority
- Governance root: `docs/governance/_root/ISA_GOVERNANCE.md`
- Agent navigation authority: `docs/agent/AGENT_MAP.md`
- System architecture (CURRENT/TARGET canonical): `docs/spec/ARCHITECTURE.md`
- Capability ownership contract: `docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json`
- Shared primitive contract: `docs/architecture/panel/_generated/PRIMITIVE_DICTIONARY.json`
- Capability graph contract: `docs/architecture/panel/_generated/CAPABILITY_GRAPH.json`
- Evidence pointer contract: `docs/architecture/panel/_generated/EVIDENCE_INDEX.json`
- Canonical conflict source: `docs/spec/CONFLICT_REGISTER.md`

## Core Capabilities (Canonical)
- ASK_ISA
- NEWS_HUB
- KNOWLEDGE_BASE
- CATALOG
- ESRS_MAPPING
- ADVISORY

## Capability Ownership Rule
- Every router, table, schema, and contract surface must have exactly one owning capability.
- If no single capability owner is defensible, ownership is `SHARED_PLATFORM`.
- Cross-capability concepts promoted to shared platform must be represented in `docs/architecture/panel/_generated/PRIMITIVE_DICTIONARY.json`.
- Repository drift from manifest must be remediated or explicitly recorded as CURRENT->TARGET delta.
- Manifest contract status must classify each mapped surface/table/module as `CURRENT` or `TARGET_PLANNED_BLOCKED`.

## Non-scope / Exclusions
- Anything not required to support the six core capabilities end-to-end.
- Experimental prototypes, dumps, and legacy flows not referenced by canonical anchors.
- CI gates may be temporarily disabled during NO_GATES_WINDOW; drift prevention remains mandatory.
