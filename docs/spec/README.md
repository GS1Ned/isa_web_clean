# ISA Technical Specs

Status: CANONICAL INDEX  
Last Updated: 2026-03-09

## Canonical Entry

- `docs/governance/TECHNICAL_DOCUMENTATION_CANON.md`

## Canonical Technical Specs

- `docs/spec/ARCHITECTURE.md`
- `docs/spec/ADVISORY/ISA_CORE_CONTRACT.md`
- `docs/spec/ISA_DATA_PLANE_ARCHITECTURE.md`
- `docs/spec/KNOWLEDGE_BASE/PROVENANCE_REBUILD_SPEC.md`
- `docs/decisions/ADR-0001_SUPABASE_POSTGRES_DATA_PLANE.md`
- `docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json`
- `docs/architecture/panel/_generated/PRIMITIVE_DICTIONARY.json`
- `docs/architecture/panel/_generated/CAPABILITY_GRAPH.json`
- `docs/architecture/panel/_generated/MINIMAL_VALIDATION_BUNDLE.json`

## Capability Runtime Contracts

- `docs/spec/ASK_ISA/RUNTIME_CONTRACT.md`
- `docs/spec/NEWS_HUB/RUNTIME_CONTRACT.md`
- `docs/spec/KNOWLEDGE_BASE/RUNTIME_CONTRACT.md`
- `docs/spec/CATALOG/RUNTIME_CONTRACT.md`
- `docs/spec/ESRS_MAPPING/RUNTIME_CONTRACT.md`
- `docs/spec/ADVISORY/RUNTIME_CONTRACT.md`

## Supporting Technical Governance

- `docs/spec/CONFLICT_REGISTER.md`
- `docs/spec/KNOWLEDGE_BASE/PROVENANCE_PHASE3_HANDOFF.md`
- `docs/spec/DEPRECATION_MAP.md`
- `docs/spec/TRACEABILITY_MATRIX.csv`
- `docs/planning/NEXT_ACTIONS.json`
- `docs/governance/OPENCLAW_POLICY_ENVELOPE.md`

## Support-Only Artifacts

- `docs/spec/DEPRECATION_MAP.md` is a transitional support artifact. Use `docs/governance/DOCUMENT_STATUS_MODEL.md` and `docs/governance/TECHNICAL_DOCUMENTATION_CANON.md` for canonical status and precedence truth.
- `docs/spec/TRACEABILITY_MATRIX.csv` is a transitional support artifact for claim lineage and backlog joins; it is not architecture or planning authority.
- Use `docs/governance/TECHNICAL_DOCUMENTATION_CANON.md`, `docs/spec/ARCHITECTURE.md`, capability `RUNTIME_CONTRACT.md` files, and `docs/planning/NEXT_ACTIONS.json` for authoritative architecture and planning truth.
- Older `docs/spec/*/CAPABILITY_SPEC.md` files are supplemental design references. Use capability runtime contracts and code for current-state truth.
- Use `docs/spec/KNOWLEDGE_BASE/PROVENANCE_REBUILD_SPEC.md` before changing authoritative source admission, `sources` / `source_chunks`, evidence keys, or chunk-level citation semantics.

## Usage Rules

- Read canonical technical docs before reading supplemental strategy or historical narrative.
- Treat large historical planning and architecture documents as background only.
- Merge new technical truth into the canonical set above instead of creating parallel architecture or roadmap files.
