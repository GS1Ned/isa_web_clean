# ISA Core Contract
Status: CANONICAL
Last Updated: 2026-03-04

## Canonical Authority
- Governance root: `docs/governance/_root/ISA_GOVERNANCE.md`
- Agent navigation authority: `docs/agent/AGENT_MAP.md`
- System architecture (CURRENT/TARGET canonical): `docs/spec/ARCHITECTURE.md`
- Shared data plane contract: `docs/spec/ISA_DATA_PLANE_ARCHITECTURE.md`
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

## Product Mission
ISA is a GS1-centered actionable compliance advisor for GS1 Netherlands and adjacent stakeholders. ISA exists to connect regulatory requirements to standards, attributes, evidence, and stakeholder-ready outputs.

## Capability Intent Hierarchy
- `CATALOG`
  - authority backbone for regulations, standards, ESRS datapoints, datasets, and governance artefacts
- `KNOWLEDGE_BASE`
  - evidence retrieval backbone with corpus, embeddings, provenance, and citation substrate
- `ESRS_MAPPING`
  - decision core for gap analysis, attribute recommendation, and roadmap logic
- `ASK_ISA`
  - interactive explanation and exploration surface over the evidence and decision layers
- `NEWS_HUB`
  - regulatory change-intelligence surface that informs the compliance cockpit and downstream advisory updates
- `ADVISORY`
  - durable deliverables layer for versioned reports, diffs, and stakeholder-ready outputs

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
- Generic ESG reporting tooling, compliance certification, or customer-data validation services are not ISA's core mission.
- Free-form speculative AI output without evidence, provenance, and scope discipline is out of contract.
