---
DOC_TYPE: SPEC
CAPABILITY: ADVISORY
COMPONENT: runtime
FUNCTION_LABEL: "Advisory report generation, diffing and artifact governance"
OWNER: gs1ned-isa
STATUS: active
LAST_VERIFIED: 2026-03-04
VERIFICATION_METHOD: repo-evidence
---

# ADVISORY Runtime Contract

## Canonical Role
ADVISORY produces, versions and compares advisory outputs and related ESG artefact surfaces. It is the durable stakeholder-deliverable layer that packages the outputs of the other capabilities into shareable reports, diffs, and governed artefacts.

## Runtime Surfaces (Code Truth)
<!-- EVIDENCE:implementation:server/routers.ts -->
- Top-level `appRouter` surfaces: `advisory`, `advisoryReports`, `advisoryDiff`, `esgArtefacts`.
- Modules:
  - `server/routers/advisory.ts`
  - `server/routers/advisory-reports.ts`
  - `server/routers/advisory-diff.ts`
  - `server/routers/esg-artefacts.ts`

## Data Surfaces (Ownership Contract)
<!-- EVIDENCE:implementation:docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json -->
- Owned tables:
  - `advisory_reports`
  - `advisory_report_versions`
- Schema anchors:
  - `drizzle/schema.ts`
  - `drizzle/schema_advisory_reports.ts`

## Input / Output Contract (Current)
- Inputs: advisory generation/diff procedure inputs and report selection/version criteria.
- Outputs: advisory report payloads, version metadata, and diff artifacts.
- `advisoryDiff.listVersions` may return a merged migration-era version inventory that combines legacy file-backed advisory versions with snapshot-backed versions discovered from `advisory_reports` and `advisory_report_versions`.
- `advisory.getSummary`, `advisory.getFull`, and `advisory.getMetadata` may return normalized legacy advisory read-model payloads so current advisory UIs remain stable across version-shape drift while migration to snapshot-backed advisory reports continues.
- `advisory.getOverview` may return a normalized `summary` + `metadata` bundle plus the latest persisted advisory report, so active dashboard and traceability surfaces can bridge legacy advisory read-model data with report-backed delivery metadata.
- Advisory explorer-style mapping, gap, and recommendation surfaces may consume the normalized `advisory.getFull` read-model payload instead of legacy per-section file reads when the client only needs read-only filtered exploration.
- Advisory explorer-style filter inventories may be derived client-side from the normalized `advisory.getFull` payload, rather than fetched through separate regulation or sector compatibility endpoints.
- Legacy advisory section endpoints such as `advisory.getMappings`, `advisory.getGaps`, `advisory.getRecommendations`, `advisory.getRegulations`, and `advisory.getSectorModels` may project compatibility payloads from the normalized advisory read-model instead of reading advisory JSON files directly.
- When current advisory payloads do not carry legacy `regulationsCovered` arrays, `advisory.getRegulations` may derive a compatibility inventory from normalized mapping and gap standards instead of returning an empty list.
- `advisory.getDiff` remains a compatibility surface and may delegate to the same snapshot-aware runtime used by `advisoryDiff.computeDiff`, rather than loading legacy diff JSON directly.
- `advisoryDiff.computeDiff` may add additive `snapshotBacked` and `decisionArtifactDiff` fields when a current advisory report plus matching version snapshot exist for the requested advisory versions; otherwise it falls back to the legacy file/script diff result.
- `advisoryDiff.getAdvisorySummary` may return the normalized current advisory summary for the active advisory version and fall back to legacy summary files for older requested versions.
- Legacy diff file/script access remains centralized in shared compatibility helpers rather than spread across routers.
- `advisory_reports` records may persist additive upstream `decisionArtifacts` envelopes from `ESRS_MAPPING` for downstream export, review, and traceability.
- `advisory_report_versions` snapshots may persist the same additive `decisionArtifacts` envelopes so version history preserves the decision-core evidence available at the time the snapshot was created.
- Advisory diff and compare surfaces may prefer `advisory_reports` plus `advisory_report_versions` snapshot-backed `decisionArtifactDiff` summaries over legacy file-based advisory diff JSON when snapshot-backed data exists.
- Human-readable advisory export layers may serialise additive upstream `decisionArtifact` envelopes from `ESRS_MAPPING` without replacing the underlying capability-specific payload.
- Field-level payload shape remains code-truth in ADVISORY router procedures.

## Verification
<!-- EVIDENCE:implementation:scripts/probe/advisory_health.sh -->
- Smoke probe: `scripts/probe/advisory_health.sh`
- Tests:
  - `server/routers/advisory-reports.test.ts`
  - `server/advisory-report-export.test.ts`
  - `server/advisory-report-versioning.test.ts`
  - `server/routers/__tests__/capability-heartbeat.test.ts`
- Method guidance:
  - `docs/spec/ADVISORY/ADVISORY_METHOD.md`
- Canonical gate alignment:
  - `bash scripts/gates/doc-code-validator.sh --canonical-only`
  - `python3 scripts/validate_planning_and_traceability.py`

## Operational Unknowns
- External publication cadence and approval workflow SLAs are UNKNOWN from repository-only evidence.
- Production notification/escalation policies for advisory diffs are UNKNOWN from repository-only evidence.

## Evidence
<!-- EVIDENCE:implementation:server/routers/advisory.ts -->
<!-- EVIDENCE:implementation:server/routers/advisory-reports.ts -->
<!-- EVIDENCE:implementation:server/routers/advisory-diff.ts -->
<!-- EVIDENCE:implementation:server/routers/esg-artefacts.ts -->

**Contract Status:** CURRENT_EVIDENCE_BACKED
