---
DOC_TYPE: SPEC
CAPABILITY: ESRS_MAPPING
COMPONENT: runtime
FUNCTION_LABEL: "Mapping between ESRS requirements and GS1 attributes"
OWNER: gs1ned-isa
STATUS: active
LAST_VERIFIED: 2026-02-20
VERIFICATION_METHOD: repo-evidence
---

# ESRS_MAPPING Runtime Contract

## Canonical Role
ESRS_MAPPING maintains procedure surfaces for ESRS-to-GS1 mapping, roadmap generation, gap analysis and attribute recommendation. It is the decision core of ISA because it converts evidence and reference data into actionable compliance guidance.

## Runtime Surfaces (Code Truth)
<!-- EVIDENCE:implementation:server/routers.ts -->
- Top-level `appRouter` surfaces: `esrsGs1Mapping`, `esrsRoadmap`, `gapAnalyzer`, `attributeRecommender`.
- Modules:
  - `server/routers/esrs-gs1-mapping.ts`
  - `server/routers/esrs-roadmap.ts`
  - `server/routers/gap-analyzer.ts`
  - `server/routers/attribute-recommender.ts`

## Data Surfaces (Ownership Contract)
<!-- EVIDENCE:implementation:docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json -->
- Owned tables:
  - `gs1_esrs_mappings`
  - `gs1_attribute_esrs_mapping`
  - `regulation_esrs_mappings`
  - `mapping_feedback`
  - `esg_gs1_mappings`
- Schema anchors:
  - `drizzle/schema.ts`
  - `drizzle/schema_gs1_esrs_mappings.ts`

## Input / Output Contract (Current)
- Inputs: typed mapping, roadmap and recommendation requests via ESRS_MAPPING tRPC procedures.
- Outputs: mapping records, gap-analysis outputs and recommendation payloads.
- Field-level payloads remain code-truth in router implementations.

## Verification
<!-- EVIDENCE:implementation:scripts/probe/esrs_mapping_health.sh -->
- Smoke probe: `scripts/probe/esrs_mapping_health.sh`
- Capability evaluation includes stage-aware positive mapping fixtures plus explicit negative-case coverage fixtures under `data/evaluation/golden/esrs_mapping/*`.
- ESRS capability evaluation emits benchmark-mix diagnostics for direct, partial, and explicit no-mapping gold-set coverage.
- Tests:
  - `server/gs1-mapping-engine.test.ts`
  - `server/routers/__tests__/capability-heartbeat.test.ts`
- Canonical gate alignment:
  - `bash scripts/gates/doc-code-validator.sh --canonical-only`
  - `python3 scripts/gates/manifest-ownership-drift.py`

## Operational Unknowns
- Runtime confidence calibration policy for mapping outputs is UNKNOWN from repository-only evidence.
- Production workload and latency SLOs for mapping-heavy requests are UNKNOWN from repository-only evidence.

## Evidence
<!-- EVIDENCE:implementation:server/routers/esrs-gs1-mapping.ts -->
<!-- EVIDENCE:implementation:server/routers/esrs-roadmap.ts -->
<!-- EVIDENCE:implementation:server/routers/gap-analyzer.ts -->
<!-- EVIDENCE:implementation:server/routers/attribute-recommender.ts -->

**Contract Status:** CURRENT_EVIDENCE_BACKED
