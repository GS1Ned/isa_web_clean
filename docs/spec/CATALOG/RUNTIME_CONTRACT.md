---
DOC_TYPE: SPEC
CAPABILITY: CATALOG
COMPONENT: runtime
FUNCTION_LABEL: "Canonical registries for regulations, standards and datasets"
OWNER: gs1ned-isa
STATUS: active
LAST_VERIFIED: 2026-02-20
VERIFICATION_METHOD: repo-evidence
---

# CATALOG Runtime Contract

## Canonical Role
CATALOG is the source-of-record capability for regulation, standards, ESRS datapoint, initiative, and dataset registry surfaces.

## Runtime Surfaces (Code Truth)
<!-- EVIDENCE:implementation:server/routers.ts -->
- Top-level `appRouter` surfaces: `regulations`, `standards`, `gs1Standards`, `standardsDirectory`, `esrs`, `dutchInitiatives`, `datasetRegistry`, `governanceDocuments`, `gs1Attributes`, `gs1nlAttributes`.
- Modules:
  - `server/routers/regulations.ts`
  - `server/routers/standards.ts`
  - `server/gs1-standards-router.ts`
  - `server/routers/standards-directory.ts`
  - `server/routers/esrs.ts`
  - `server/routers/dataset-registry.ts`
  - `server/routers/governance-documents.ts`
  - `server/routers/gs1-attributes.ts`
  - `server/routers/gs1nl-attributes.ts`

## Data Surfaces (Ownership Contract)
<!-- EVIDENCE:implementation:docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json -->
- Owned tables:
  - `regulations`
  - `gs1_standards`
  - `esrs_datapoints`
  - `dutch_initiatives`
  - `regulation_standard_mappings`
  - `dataset_registry`
  - `governance_documents`
  - `gs1_attributes`
  - `gs1_web_vocabulary`
- Schema anchors:
  - `drizzle/schema.ts`
  - `drizzle/schema_dataset_registry.ts`
  - `drizzle/schema_governance_documents.ts`

## Input / Output Contract (Current)
- Inputs: typed query/filter parameters for catalog retrieval and administrative updates for dataset/governance entries.
- Outputs: typed registry payloads from catalog routers.
- Field-level payload definitions remain code-truth in tRPC router procedures.

## Authority Metadata Expectations
- Dataset registry create/update flows must preserve or derive these governance-critical fields:
  - `authorityTier`
  - `publicationStatus`
  - `immutableUri`
  - source locator field from `source`, `downloadUrl`, or `apiEndpoint`
  - `lastVerifiedDate`
- Standards directory detail responses must expose these transparency fields:
  - `authoritativeSourceUrl`
  - `datasetIdentifier`
  - `lastVerifiedDate`
  - `needsVerification`
  - `verificationReason`
  - `verificationAgeDays`
  - `verificationFreshnessBucket`
- Canonical derivation helper for dataset authority tier:
  - `server/catalog-authority.ts`
- Canonical derivation helper for verification posture:
  - `server/verification-posture.ts`

## Verification
<!-- EVIDENCE:implementation:scripts/probe/catalog_health.sh -->
- Smoke probe: `scripts/probe/catalog_health.sh`
- Tests:
  - `server/catalog-authority.test.ts`
  - `server/routers/dataset-registry.test.ts`
  - `server/routers/standards-directory.test.ts`
  - `server/routers/__tests__/capability-heartbeat.test.ts`
- Canonical gate alignment:
  - `bash scripts/gates/doc-code-validator.sh --canonical-only`
  - `python3 scripts/gates/manifest-ownership-drift.py`

## Operational Unknowns
- Production data volume growth limits and query SLAs are UNKNOWN from repository-only evidence.
- External source refresh SLAs for upstream registries are UNKNOWN from repository-only evidence.

## Evidence
<!-- EVIDENCE:implementation:server/routers/regulations.ts -->
<!-- EVIDENCE:implementation:server/routers/standards.ts -->
<!-- EVIDENCE:implementation:server/routers/dataset-registry.ts -->
<!-- EVIDENCE:implementation:server/gs1-standards-router.ts -->

**Contract Status:** CURRENT_EVIDENCE_BACKED
