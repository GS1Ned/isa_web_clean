# ISA Advisory Outputs: Dual-Format Model

**Document Type:** Technical Documentation  
**Date:** December 13, 2025  
**Purpose:** Explain ISA advisory dual-output model (Markdown + JSON) and usage guidelines

---

## Executive Summary

ISA advisory reports are produced in **two parallel formats**: human-readable Markdown and machine-readable JSON. Both formats represent the same analytical content with full traceability to the frozen dataset registry. The Markdown format serves as the canonical source for human consumption, while the JSON format enables programmatic access, API integration, and version comparison.

**Why Dual Outputs Matter:**  
Human analysts need narrative context, explanations, and recommendations in prose form. Software systems need structured data with stable IDs, typed fields, and schema validation. By maintaining both formats in parallel, ISA serves both audiences without compromise. The JSON format is not a summary—it is a **lossless, faithful representation** of the Markdown advisory with added structure for machine processing.

**Key Principle:**  
The Markdown advisory is the **source of truth** for analytical conclusions. The JSON advisory is a **structured extraction** of that truth, preserving all mappings, gaps, and recommendations with stable IDs and dataset references. Neither format is generated from the other—both are produced from the same underlying analysis.

---

## 1. Format Comparison

### 1.1 Markdown Advisory

**Purpose:** Human-readable advisory report for GS1 NL leadership and standards team

**File:** `docs/ISA_First_Advisory_Report_GS1NL.md`  
**Advisory ID:** `ISA_ADVISORY_v1.0`  
**Word Count:** ~15,000 words  
**Status:** IMMUTABLE (locked as part of ISA v1.0 baseline)

**Structure:**
- Executive Summary (narrative)
- Regulatory Coverage Snapshot (prose + tables)
- Mapping Results (6 Markdown tables: ESRS E1, E2, E5, S1/S2, EUDR, DPP)
- Gap Analysis (7 gaps with narrative descriptions)
- Standards Evolution Signals (short/medium/long-term recommendations)
- Confidence & Traceability Section (dataset lineage, limitations)

**Strengths:**
- Rich narrative context and explanations
- Sector-specific examples and rationale
- Strategic recommendations with business impact
- Accessible to non-technical stakeholders

**Limitations:**
- Not machine-readable
- No stable IDs for mappings, gaps, recommendations
- Cannot be queried programmatically
- Version comparison requires manual diff

---

### 1.2 JSON Advisory

**Purpose:** Machine-readable advisory output for API integration, version comparison, and automated analysis

**File:** `data/advisories/ISA_ADVISORY_v1.0.json`  
**Schema:** `shared/schemas/advisory-output.schema.json`  
**Advisory ID:** `ISA_ADVISORY_v1.0`  
**Size:** ~150 KB  
**Status:** Schema-validated, traceable to frozen dataset registry v1.0.0

**Structure:**
```json
{
  "advisoryId": "ISA_ADVISORY_v1.0",
  "version": "1.0.0",
  "publicationDate": "2025-12-13",
  "datasetRegistryVersion": "1.0.0",
  "regulationsCovered": [...],
  "sectorModelsCovered": [...],
  "mappingResults": [32 mappings with stable IDs],
  "gaps": [7 gaps with stable IDs],
  "recommendations": [10 recommendations with stable IDs],
  "metadata": {statistics}
}
```

**Strengths:**
- Schema-validated structure
- Stable IDs for all entities (MAP-E1-001, GAP-001, REC-001)
- Programmatically queryable
- Version comparison via JSON diff
- API-ready for external integration

**Limitations:**
- No narrative context or explanations
- Requires schema knowledge to interpret
- Not human-friendly for reading

---

## 2. Relationship Between Formats

### 2.1 Content Parity

**100% Content Coverage:**  
The JSON advisory contains **all** mappings, gaps, and recommendations from the Markdown advisory. No information is lost in the JSON extraction.

**Verification:**
- Markdown: 6 mapping tables (ESRS E1, E2, E5, S1/S2, EUDR, DPP)
- JSON: 32 mapping results (all rows from 6 tables)
- Markdown: 7 gaps (3 critical, 2 moderate, 2 low-priority)
- JSON: 7 gaps with same categorization
- Markdown: 10 recommendations (3 short-term, 4 medium-term, 3 long-term)
- JSON: 10 recommendations with same timeframes

**Stable ID Assignment:**  
The JSON format adds stable IDs to enable cross-referencing:
- **Mapping IDs:** `MAP-{Standard}-{Sequence}` (e.g., MAP-E1-001, MAP-EUDR-003)
- **Gap IDs:** `GAP-{Sequence}` (e.g., GAP-001, GAP-007)
- **Recommendation IDs:** `REC-{Sequence}` (e.g., REC-001, REC-010)

These IDs are **permanent** and must not change across advisory versions. Future ISA versions may add new IDs but must not reassign existing ones.

### 2.2 Dataset Traceability

**Frozen Registry References:**  
Both Markdown and JSON advisory reference the same frozen dataset registry v1.0.0. All dataset IDs used in the advisory are validated against the frozen registry.

**Dataset IDs Used:**
1. `esrs.datapoints.ig3` (ESRS Datapoints, 1,186 records)
2. `gs1nl.benelux.diy_garden_pet.v3.1.33` (GS1 NL DIY, 3,009 attributes)
3. `gs1nl.benelux.fmcg.v3.1.33.5` (GS1 NL FMCG, 473 attributes)
4. `gs1nl.benelux.healthcare.v3.1.33` (GS1 NL Healthcare, 185 attributes)
5. `gs1.ctes_kdes` (GS1 CTEs/KDEs, 50 records)
6. `gdsn.current.v3.1.32` (GDSN Current, 4,293 records)
7. `eu.dpp.identification_rules` (EU DPP Rules, 26 records)
8. `gs1.cbv_digital_link` (GS1 CBV and Digital Link, 84 records)

**Validation:**  
The JSON advisory is validated to ensure all dataset references exist in the frozen registry. Any unknown dataset ID will cause validation failure.

### 2.3 Confidence Levels

**Qualitative Confidence (ISA v1.0):**  
ISA v1.0 uses three qualitative confidence levels for mapping results:
- **Direct:** GS1 NL attribute directly satisfies regulation requirement
- **Partial:** GS1 NL attribute partially satisfies, additional data needed
- **Missing:** No GS1 NL attribute exists to satisfy requirement

**JSON Representation:**
```json
{
  "mappingId": "MAP-E1-002",
  "regulationDatapoint": "Product carbon footprint",
  "confidence": "missing",
  "confidenceScore": null,
  "rationale": "No GS1 NL attribute exists for product-level carbon footprint"
}
```

**Future Enhancement:**  
The JSON schema includes a `confidenceScore` field (0-100) for quantitative confidence scoring. ISA v1.0 sets this to `null` (not calculated). Future ISA versions may implement the confidence scoring algorithm described in `ISA_V1_FORMALIZATION_TARGETS.md`.

---

## 3. Usage Guidelines

### 3.1 When to Use Markdown

**Use Markdown advisory for:**
- Human reading and comprehension
- Presenting findings to GS1 NL leadership
- Understanding strategic context and business impact
- Learning about regulatory requirements and sector-specific gaps
- Citing ISA analysis in external documents

**Example Use Cases:**
- GS1 NL standards team reviews Markdown advisory to understand ESRS E1 gaps
- GS1 NL leadership presents Markdown executive summary to board
- External consultant cites Markdown advisory in regulatory compliance report

### 3.2 When to Use JSON

**Use JSON advisory for:**
- Programmatic access to mapping results, gaps, recommendations
- API integration (e.g., GS1 NL standards dashboard)
- Version comparison (ISA v1.0 vs. v1.1)
- Automated gap tracking and recommendation implementation status
- External system integration (e.g., regulatory compliance tools)

**Example Use Cases:**
- GS1 NL standards dashboard queries JSON advisory to display gap closure progress
- Automated script compares ISA v1.0 vs. v1.1 JSON to generate diff report
- External compliance tool imports JSON advisory to map ESRS datapoints to GS1 NL attributes

### 3.3 API Access Patterns

**Query Examples:**

**1. Find all missing mappings for ESRS E1:**
```javascript
const e1Missing = advisory.mappingResults.filter(m => 
  m.regulationStandard === "ESRS E1" && m.confidence === "missing"
);
// Returns: MAP-E1-001, MAP-E1-002, MAP-E1-004, MAP-E1-005
```

**2. Get all critical gaps:**
```javascript
const criticalGaps = advisory.gaps.filter(g => g.category === "critical");
// Returns: GAP-001 (PCF), GAP-002 (Circularity), GAP-003 (EUDR)
```

**3. Find recommendations for a specific gap:**
```javascript
const pcfRecommendations = advisory.recommendations.filter(r => 
  r.relatedGaps.includes("GAP-001")
);
// Returns: REC-004 (Add PCF Attributes), REC-008 (ESG Data Backbone)
```

**4. Calculate gap closure rate (ISA v1.0 vs. v1.1):**
```javascript
const v1Gaps = loadAdvisory("ISA_ADVISORY_v1.0.json").gaps.length;
const v1_1Gaps = loadAdvisory("ISA_ADVISORY_v1.1.json").gaps.length;
const closureRate = ((v1Gaps - v1_1Gaps) / v1Gaps) * 100;
// Example: (7 - 5) / 7 = 28.6% gap closure
```

---

## 4. Schema Reference

### 4.1 Schema Location

**File:** `shared/schemas/advisory-output.schema.json`  
**Schema ID:** `https://isa.manus.space/schemas/advisory-output.schema.json`  
**Version:** 1.0 (aligned with ISA v1.0)

### 4.2 Top-Level Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `advisoryId` | string | Yes | Unique advisory identifier (e.g., ISA_ADVISORY_v1.0) |
| `version` | string | Yes | Semantic version (e.g., 1.0.0) |
| `publicationDate` | string (date) | Yes | Publication date (ISO 8601) |
| `datasetRegistryVersion` | string | Yes | Dataset registry version used (e.g., 1.0.0) |
| `author` | string | Yes | Advisory author (e.g., ISA Execution Agent) |
| `markdownSource` | string | No | Path to canonical Markdown source |
| `regulationsCovered` | array | Yes | List of regulations analyzed |
| `sectorModelsCovered` | array | Yes | List of GS1 sector models analyzed |
| `mappingResults` | array | Yes | Regulation-to-standard mapping results |
| `gaps` | array | Yes | Identified gaps in standards coverage |
| `recommendations` | array | Yes | Standards evolution recommendations |
| `metadata` | object | Yes | Advisory statistics |

### 4.3 Mapping Result Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mappingId` | string | Yes | Unique mapping ID (e.g., MAP-E1-001) |
| `regulationDatapoint` | string | Yes | Regulation datapoint name |
| `disclosureRequirement` | string | Yes | Disclosure requirement code (e.g., E1-6) |
| `regulationStandard` | string | Yes | Regulation standard (e.g., ESRS E1) |
| `gs1Attribute` | string/null | Yes | GS1 attribute name (null if missing) |
| `gs1AttributeCode` | string/null | No | GS1 attribute code (null if missing) |
| `sectors` | array | Yes | Affected sectors (DIY, FMCG, Healthcare, All) |
| `confidence` | string | Yes | Confidence level (direct, partial, missing) |
| `confidenceScore` | number/null | No | Quantitative score 0-100 (null if not calculated) |
| `rationale` | string | Yes | Explanation of mapping confidence |
| `datasetReferences` | array | Yes | Dataset IDs used for this mapping |

### 4.4 Gap Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `gapId` | string | Yes | Unique gap ID (e.g., GAP-001) |
| `title` | string | Yes | Gap title |
| `category` | string | Yes | Gap category (critical, moderate, low-priority) |
| `impact` | string | Yes | Business impact (high, medium, low) |
| `urgency` | string | Yes | Implementation urgency (high, medium, low) |
| `affectedRegulations` | array | Yes | Regulation requirements affected |
| `affectedSectors` | array | Yes | Sector models affected |
| `description` | string | Yes | Detailed gap description |
| `recommendedAction` | string | Yes | Recommended action to address gap |
| `datasetReferences` | array | Yes | Dataset IDs related to this gap |
| `relatedMappings` | array | No | Mapping IDs related to this gap |

### 4.5 Recommendation Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `recommendationId` | string | Yes | Unique recommendation ID (e.g., REC-001) |
| `timeframe` | string | Yes | Implementation timeframe (short-term, medium-term, long-term) |
| `category` | string | Yes | Recommendation category (documentation, data_model, strategic) |
| `title` | string | Yes | Recommendation title |
| `description` | string | Yes | Detailed recommendation description |
| `relatedGaps` | array | Yes | Gap IDs addressed by this recommendation |
| `estimatedEffort` | string | Yes | Estimated effort (low, medium, high) |
| `implementationStatus` | string | No | Implementation status (proposed, in_progress, completed, deferred) |
| `implementedInVersion` | string/null | No | GS1 NL version where implemented (null if not yet) |

---

## 5. Validation

### 5.1 Schema Validation

**Tool:** `scripts/validate_advisory.py`  
**Purpose:** Validate JSON advisory against canonical schema

**Usage:**
```bash
cd /home/ubuntu/isa_web
python3 scripts/validate_advisory.py
```

**Validation Checks:**
1. **Schema compliance:** JSON structure matches advisory-output.schema.json
2. **Completeness:** All 7 gaps, 10 recommendations, 32 mappings included
3. **Dataset references:** All dataset IDs exist in frozen registry v1.0.0
4. **Registry version:** datasetRegistryVersion matches frozen registry (1.0.0)
5. **Statistics:** Metadata counts match actual array lengths

**Example Output:**
```
✅ Schema validation PASSED
📊 Completeness Verification:
   Gaps: 7/7 ✅
   Recommendations: 10/10 ✅
   Mapping results: 32 ✅
   Dataset references: All valid ✅
   Registry version: 1.0.0 ✅
```

### 5.2 Content Integrity

**Verification Process:**
1. **Manual review:** Compare JSON mappings against Markdown tables
2. **Gap verification:** Confirm all 7 gaps from Markdown are in JSON
3. **Recommendation verification:** Confirm all 10 recommendations from Markdown are in JSON
4. **Dataset traceability:** Verify all dataset IDs reference frozen registry v1.0.0

**Integrity Guarantee:**  
ISA v1.0 JSON advisory is a **faithful, lossless extraction** of the Markdown advisory. No mappings, gaps, or recommendations were added, removed, or modified during JSON generation.

---

## 6. Future Advisory Versions

### 6.1 Versioning Rules

**Advisory Version Numbering:**
- **Major version (X.0.0):** New regulations covered, new sector models added, methodology changes
- **Minor version (1.X.0):** Dataset updates, gap re-assessment, recommendation refinements
- **Patch version (1.0.X):** Typo fixes, clarifications, no analytical changes

**Example:**
- **ISA v1.0:** First advisory (CSRD/ESRS, EUDR, DPP → GS1 NL DIY/FMCG/Healthcare)
- **ISA v1.1:** Same regulations, updated ESRS IG4 datapoints, GS1 NL v3.1.34 sector models
- **ISA v2.0:** Add CSDDD (Corporate Sustainability Due Diligence Directive), add GS1 NL Textiles sector

### 6.2 Backward Compatibility

**Stable ID Preservation:**  
Future ISA versions must preserve existing mapping, gap, and recommendation IDs. New entities may be added with new IDs, but existing IDs must not be reassigned.

**Example:**
- ISA v1.0: GAP-001 (Product Carbon Footprint)
- ISA v1.1: GAP-001 (same gap, may have updated status or description)
- ISA v1.1: GAP-008 (new gap, new ID)

**Schema Evolution:**  
The advisory output schema may be extended in future versions (e.g., add new fields), but existing fields must remain compatible. Schema version will be tracked separately from advisory version.

### 6.3 Version Comparison

**Diff Workflow:**
1. Load ISA v1.0 JSON advisory
2. Load ISA v1.1 JSON advisory
3. Compare gap arrays to identify closed gaps
4. Compare mapping results to identify new direct/partial mappings
5. Compare recommendations to identify implemented recommendations

**Example Comparison Metrics:**
- Gap closure rate: (v1.0 gaps - v1.1 gaps) / v1.0 gaps
- Mapping improvement: (v1.1 direct mappings - v1.0 direct mappings) / v1.0 total mappings
- Recommendation implementation: Count of recommendations with implementationStatus = "completed"

---

## 7. Integration Examples

### 7.1 GS1 NL Standards Dashboard

**Use Case:** Display ISA advisory results in GS1 NL internal dashboard

**Implementation:**
1. Load JSON advisory via HTTP GET
2. Display gap cards with category badges (critical/moderate/low-priority)
3. Show mapping coverage by regulation (ESRS E1, E2, E5, etc.)
4. Track recommendation implementation status
5. Generate gap closure progress chart (ISA v1.0 vs. v1.1)

**API Endpoint:**
```
GET /api/advisories/ISA_ADVISORY_v1.0.json
```

### 7.2 Regulatory Compliance Tool

**Use Case:** External compliance tool imports ISA advisory to map ESRS datapoints to GS1 NL attributes

**Implementation:**
1. Import JSON advisory into compliance tool database
2. Map ESRS datapoints to GS1 NL attributes using mapping results
3. Flag missing mappings as compliance gaps
4. Generate compliance report for Dutch businesses

**Data Flow:**
```
ISA JSON Advisory → Compliance Tool → ESRS Compliance Report
```

### 7.3 Automated Gap Tracking

**Use Case:** Automated script tracks gap closure over time

**Implementation:**
1. Load ISA v1.0 JSON advisory (baseline)
2. Load ISA v1.1 JSON advisory (updated)
3. Compare gap arrays to identify closed gaps
4. Generate gap closure report
5. Send notification to GS1 NL standards team

**Script:**
```python
import json

v1 = json.load(open("ISA_ADVISORY_v1.0.json"))
v1_1 = json.load(open("ISA_ADVISORY_v1.1.json"))

v1_gap_ids = {g["gapId"] for g in v1["gaps"]}
v1_1_gap_ids = {g["gapId"] for g in v1_1["gaps"]}

closed_gaps = v1_gap_ids - v1_1_gap_ids
print(f"Closed gaps: {closed_gaps}")
```

---

## 8. File Locations

### 8.1 Advisory Files

**Markdown Advisory:**
- Path: `docs/ISA_First_Advisory_Report_GS1NL.md`
- Advisory ID: `ISA_ADVISORY_v1.0`
- Status: IMMUTABLE (locked)

**JSON Advisory:**
- Path: `data/advisories/ISA_ADVISORY_v1.0.json`
- Advisory ID: `ISA_ADVISORY_v1.0`
- Status: Schema-validated

**Schema:**
- Path: `shared/schemas/advisory-output.schema.json`
- Schema ID: `https://isa.manus.space/schemas/advisory-output.schema.json`
- Version: 1.0

### 8.2 Supporting Files

**Dataset Registry (Frozen):**
- Path: `data/metadata/dataset_registry_v1.0_FROZEN.json`
- Version: 1.0.0
- Status: FROZEN

**Lock Record:**
- Path: `docs/ISA_V1_LOCK_RECORD.md`
- Purpose: ISA v1.0 governance documentation

**Formalization Targets:**
- Path: `docs/ISA_V1_FORMALIZATION_TARGETS.md`
- Purpose: Roadmap for ISA v1.1+ development

**Validation Script:**
- Path: `scripts/validate_advisory.py`
- Purpose: Validate JSON advisory against schema

**Extraction Script:**
- Path: `scripts/extract_advisory_v1.py`
- Purpose: Generate JSON advisory from Markdown source

---

## 9. Best Practices

### 9.1 For Advisory Consumers

**Human Readers:**
- Start with Markdown executive summary for high-level overview
- Read gap analysis for critical gaps and recommended actions
- Review mapping tables for sector-specific coverage
- Cite Markdown advisory in external documents (not JSON)

**API Developers:**
- Use JSON advisory for programmatic access
- Validate JSON against schema before processing
- Cache JSON advisory to avoid repeated file reads
- Use stable IDs (MAP-*, GAP-*, REC-*) for cross-referencing

**Standards Teams:**
- Use Markdown for strategic planning and stakeholder communication
- Use JSON for gap tracking and recommendation implementation status
- Compare JSON advisories across versions to measure progress
- Update recommendation implementationStatus when standards are released

### 9.2 For Advisory Producers

**Markdown First:**
- Write Markdown advisory as the primary analytical output
- Ensure all mappings, gaps, and recommendations are in Markdown
- Lock Markdown advisory before JSON extraction

**JSON Extraction:**
- Generate JSON advisory from Markdown using extraction script
- Assign stable IDs to all mappings, gaps, recommendations
- Validate JSON against schema before publishing
- Verify 100% content parity with Markdown

**Traceability:**
- Reference frozen dataset registry for all dataset IDs
- Include dataset references in all mappings and gaps
- Document limitations and scope in both Markdown and JSON

---

## 10. References

**ISA v1.0 Advisory (Markdown):**  
`docs/ISA_First_Advisory_Report_GS1NL.md`

**ISA v1.0 Advisory (JSON):**  
`data/advisories/ISA_ADVISORY_v1.0.json`

**Advisory Output Schema:**  
`shared/schemas/advisory-output.schema.json`

**ISA v1.0 Lock Record:**  
`docs/ISA_V1_LOCK_RECORD.md`

**Frozen Dataset Registry:**  
`data/metadata/dataset_registry_v1.0_FROZEN.json`

---

**Document Status:** FINAL  
**Advisory Format Version:** 1.0  
**Next Review:** ISA v1.1 advisory generation

---

*This document defines the dual-format model for ISA advisory outputs, ensuring both human readability and machine processability with full traceability to the frozen dataset registry.*


---

## 11. Canonical Ordering Rules

### 11.1 Purpose

**Why Canonical Ordering Matters:**  
ISA advisory JSON files must have **deterministic, reproducible structure** to enable clean version diffs. Without canonical ordering, JSON diffs would show spurious changes (e.g., array element reordering) that don't represent actual analytical changes. Canonical ordering ensures that `git diff` and JSON diff tools produce meaningful, human-readable comparisons.

**Key Principle:**  
All arrays in advisory JSON are sorted by **stable IDs** in ascending lexicographic order. This ordering is applied automatically by the `canonicalize:advisory` script and is enforced by validation.

---

### 11.2 Ordering Rules

**Mapping Results:**
- **Sort Key:** `mappingId` (ascending)
- **Example:** MAP-DPP-001, MAP-DPP-002, ..., MAP-E1-001, MAP-E1-002, ..., MAP-EUDR-001

**Gaps:**
- **Sort Key:** `gapId` (ascending)
- **Example:** GAP-001, GAP-002, GAP-003, ..., GAP-007

**Recommendations:**
- **Sort Key:** `recommendationId` (ascending)
- **Example:** REC-001, REC-002, REC-003, ..., REC-010

**Regulations Covered:**
- **Sort Key:** `id` (ascending)
- **Example:** csrd_esrs, dpp, eudr

**Sector Models Covered:**
- **Sort Key:** `id` (ascending)
- **Example:** gs1nl.benelux.diy_garden_pet.v3.1.33, gs1nl.benelux.fmcg.v3.1.33.5, gs1nl.benelux.healthcare.v3.1.33

---

### 11.3 Uniqueness Enforcement

**No Duplicate IDs:**  
The `canonicalize:advisory` script removes duplicate entries based on stable IDs. If a duplicate is found, only the first occurrence is kept.

**Validation:**  
The `validate:advisory` script checks for duplicate IDs and fails if any are found.

---

### 11.4 Diff-Friendly JSON

**Formatting:**
- Indent: 2 spaces
- Trailing newline: Required (POSIX compliance)
- No trailing commas
- UTF-8 encoding without BOM

**Example Diff (v1.0 → v1.1):**
```diff
   "mappingResults": [
     {
       "mappingId": "MAP-E1-002",
       "regulationDatapoint": "Product carbon footprint",
-      "confidence": "missing",
-      "confidenceScore": 0,
+      "confidence": "direct",
+      "confidenceScore": null,
+      "gs1Attribute": "Product Carbon Footprint",
+      "gs1AttributeCode": "PRODUCT_CARBON_FOOTPRINT",
     }
   ]
```

This diff clearly shows the mapping improved from "missing" to "direct" with a new GS1 attribute added.

---

### 11.5 Canonicalization Script

**Script:** `scripts/canonicalize_advisory.cjs`

**Usage:**
```bash
pnpm canonicalize:advisory
```

**What It Does:**
1. Loads advisory JSON
2. Sorts all arrays by stable IDs
3. Removes duplicate entries
4. Writes back with deterministic formatting

**Idempotency:**  
Running the script multiple times on the same file produces identical output (no changes).

**Safety:**  
The script only reorders and deduplicates—it never changes analytical content (mappings, gaps, recommendations).

---

### 11.6 Best Practices

**Before Committing:**
- Always run `pnpm canonicalize:advisory` before committing advisory JSON
- Verify `git diff` shows only meaningful changes

**After Editing:**
- If manually editing advisory JSON, run canonicalization to restore order
- Use `validate:advisory` to check for errors

**Version Comparison:**
- Canonical ordering ensures `git diff` between advisory versions is readable
- Use diff tools (e.g., `jq`, `diff-json`) for structured comparison

---

*Canonical ordering rules ensure ISA advisory JSON files are diff-friendly, reproducible, and suitable for version control.*
