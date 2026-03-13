---
DOC_TYPE: SPEC
CAPABILITY: ESRS_MAPPING
COMPONENT: runtime
FUNCTION_LABEL: "Mapping between ESRS requirements and GS1 attributes"
OWNER: gs1ned-isa
STATUS: active
LAST_VERIFIED: 2026-03-11
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
- Runtime confidence semantics are currently aligned across attribute recommendations and ESRS decision artefacts: `high >= 0.75`, `medium >= 0.50`, else `low`.
- `attributeRecommender.getAvailableRegulations()` now prefers catalog-backed regulation inventory from `regulations.regulationType` / `regulations.title` and merges compatibility entries only to preserve stable UX coverage for known EU policy surfaces.
- `attributeRecommender.getSampleAttributes()` now prefers decision-core mapping inventory from `gs1_attribute_esrs_mapping` (`gs1AttributeId`, `gs1AttributeName`, `confidence`) and preserves only core GS1 identifiers as compatibility fallback when mappings are sparse.
- `gapAnalyzer.getSampleAttributes()` now reuses the same mapping-backed deduplication and confidence ranking as `attributeRecommender.getSampleAttributes()`, while preserving the gap-analyzer route's existing snake_case payload shape.
- `gapAnalyzer.analyze()` summary totals now scope to the requirements actually evaluated: all mapped ESRS requirements for `general`, or sector-relevant requirements only for non-general sector runs. The active Gap Analyzer UI now labels those counts explicitly and no longer overstates company-size scoping.
- `attributeRecommender.getAvailableSectors()` remains a curated UI taxonomy for now because current catalog sector coverage is narrower than the user-facing recommender sector surface.

## Calibrated Vs Heuristic Mapping Surfaces
- Governed exact-match calibration surface:
  - Source of truth: `server/mappings/esrs-gs1-calibration-data.ts`
  - Generated review manifest: `data/governance/calibrations.manifest.json`
  - Purpose: reviewer-approved exact-match overrides for recurring high-value cases
- Heuristic static fallback surface:
  - Source of truth: `server/mappings/esrs-gs1-mapping-data.ts`
  - Purpose: breadth-preserving compatibility fallback when no governed exact-match calibration applies
- Review contract:
  1. Edit `server/mappings/esrs-gs1-calibration-data.ts`
  2. Regenerate `data/governance/calibrations.manifest.json` with `pnpm exec tsx scripts/governance/build_calibration_manifest.ts`
  3. Run `bash scripts/gates/calibration-manifest-sync.sh`
  4. Re-run the targeted ESRS mapping tests and capability eval bundle used for mapping-governance slices
- The manifest is governance-only and must not change runtime behavior. Runtime code continues to consume `server/mappings/esrs-gs1-calibration-data.ts` directly.

## Verification
<!-- EVIDENCE:implementation:scripts/probe/esrs_mapping_health.sh -->
- Smoke probe: `scripts/probe/esrs_mapping_health.sh`
- Capability evaluation includes stage-aware positive mapping fixtures plus explicit negative-case coverage fixtures under `data/evaluation/golden/esrs_mapping/*`.
- ESRS capability evaluation emits benchmark-mix diagnostics for direct, partial, and explicit no-mapping gold-set coverage.
- ESRS capability evaluation also emits additive decision-posture diagnostics so benchmark outputs preserve how many cases currently land in `decision_grade`, `review_required`, and `insufficient_evidence` bands, plus how often review or human escalation would be expected under the current confidence contract.
- Drift detection preserves capability-level benchmark composition metadata so benchmark-profile changes enter transition mode instead of masquerading as pure score drift.
- Tests:
  - `server/gs1-mapping-engine.test.ts`
  - `server/isa-capability-drift.test.ts`
  - `server/routers/__tests__/capability-heartbeat.test.ts`
- Canonical gate alignment:
  - `bash scripts/gates/doc-code-validator.sh --canonical-only`
  - `python3 scripts/gates/manifest-ownership-drift.py`

## Operational Notes
- Current decision artefacts expose heuristic confidence with a stable contract: `confidence.level` in `{high, medium, low}`, `confidence.score` in `[0,1]`, `confidence.basis` as a human-readable explanation, additive `confidence.reviewRecommended` to flag non-high-confidence outputs for downstream review, and additive `confidence.uncertaintyClass` / `confidence.escalationAction` fields so downstream delivery layers do not invent their own review thresholds.
- Current score banding is conservative and evidence-backed in code: `high >= 0.75`, `medium >= 0.50`, else `low`.
- Active ESRS tool surfaces now consume that same posture contract directly: `client/src/pages/GapAnalyzer.tsx` and `client/src/pages/ToolsComplianceRoadmap.tsx` render explicit downstream review guidance from the stable decision artefact instead of inferring their own review semantics.

## Confidence Decay Contract (E-03)
<!-- EVIDENCE:implementation:server/db-esrs-gs1-mapping.ts -->
Mapping confidence degrades automatically when source material becomes stale or when an underlying regulation has been flagged for verification. The decay rules are deterministic and applied at query time:

| Condition | Effect |
|-----------|--------|
| Source age ≥ 90 days | `high` → `medium` (one step down) |
| Source age ≥ 180 days | `high` → `low`, `medium` → `low` (floor to low) |
| `regulation.needs_verification = true` | `high` → `medium` (one step down, additive with age) |

- `effectiveConfidence` is the output confidence after applying all decay steps.
- `decayReason` is a comma-separated string of the decay triggers applied (e.g. `"source_age_90d, regulation_needs_verification"`), or `null` if no decay occurred.
- Implementation: `computeEffectiveConfidence()` / `applyDecayToRows()` in `server/db-esrs-gs1-mapping.ts`.
- The `regulation.needs_verification` flag is set by `flagRegulationsNeedVerification()` in `server/services/news-impact/index.ts` when NEWS_HUB ingests a news article with `ENFORCEMENT_SIGNAL`, `DELEGATED_ACT_DRAFT`, or `DELEGATED_ACT_ADOPTED` regulatory state.

## Abstention Contract
When a mapping query returns zero results or all results have `effectiveConfidence = low` with `decayReason` set, the caller is expected to:
1. Surface `reviewRecommended = true` to the UI layer
2. Set `escalationAction = "HUMAN_REVIEW"` rather than suppressing the result
3. Never present a `low`-confidence decayed mapping as authoritative without surfacing the `decayReason`

Abstention (returning no recommendation) is reserved for cases where no mapping exists at all, not for cases where a low-confidence mapping exists. Low-confidence mappings carry signal; they must be surfaced with their decay context rather than omitted.

## Phase-3 Provenance Target (Decision-Evidence Contract)
- Canonical target contract: `docs/spec/KNOWLEDGE_BASE/PROVENANCE_REBUILD_SPEC.md`
- Mapping, roadmap, gap, and recommendation outputs should carry chunk-level `evidenceRefs` once Phase 3 lands.
- No-mapping and insufficient-evidence cases must preserve explicit insufficiency markers instead of fabricating authority.
- Phase 1 decision-quality metrics stay stable but tighten from fixture-only trace proxies to authoritative source-chunk evidence.

## Operational Unknowns
- External calibration of ESRS mapping confidence against reviewed gold sets remains UNKNOWN from repository-only evidence.
- Production workload and latency SLOs for mapping-heavy requests are UNKNOWN from repository-only evidence.

## Evidence
<!-- EVIDENCE:implementation:server/routers/esrs-gs1-mapping.ts -->
<!-- EVIDENCE:implementation:server/routers/esrs-roadmap.ts -->
<!-- EVIDENCE:implementation:server/routers/gap-analyzer.ts -->
<!-- EVIDENCE:implementation:server/routers/attribute-recommender.ts -->

**Contract Status:** CURRENT_EVIDENCE_BACKED
