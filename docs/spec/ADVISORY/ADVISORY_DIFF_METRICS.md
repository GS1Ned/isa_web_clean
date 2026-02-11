# ISA Advisory Diff Metrics

**Document Type:** Technical Specification  
**Date:** December 14, 2025  
**Purpose:** Define canonical metrics for comparing ISA advisory versions (e.g., v1.0 vs. v1.1)

---

## Executive Summary

This document defines the **canonical diff metrics** for comparing ISA advisory versions. These metrics enable quantitative tracking of standards evolution, gap closure, and recommendation implementation over time. All metrics are computed from the machine-readable JSON advisory format and are designed to be deterministic, reproducible, and suitable for automated regression testing.

**Why Diff Metrics Matter:**  
ISA advisories will evolve as regulations change, GS1 standards are updated, and gaps are addressed. To measure progress and communicate improvements to stakeholders, we need **standardized metrics** that answer questions like: "How many gaps were closed in v1.1?" or "Did ESRS E1 coverage improve?" Diff metrics provide the quantitative foundation for these answers.

**Key Principle:**  
Diff metrics are **derived from JSON advisory structure**, not from Markdown prose. This ensures metrics are machine-computable and version-comparable. Metrics focus on **coverage deltas**, **gap lifecycle**, **recommendation lifecycle**, and **traceability changes**.

---

## 1. Coverage Deltas

### 1.1 Mapping Confidence Transitions

**Definition:** Track changes in mapping confidence levels between advisory versions.

**Metric Structure:**
```json
{
  "coverageDeltas": {
    "totalMappings": {
      "v1.0": 32,
      "v1.1": 35,
      "delta": +3
    },
    "confidenceTransitions": {
      "missing_to_partial": 2,
      "missing_to_direct": 1,
      "partial_to_direct": 3,
      "direct_to_partial": 0,
      "partial_to_missing": 0,
      "direct_to_missing": 0
    },
    "confidenceDistribution": {
      "v1.0": {"direct": 9, "partial": 5, "missing": 18},
      "v1.1": {"direct": 13, "partial": 7, "missing": 15}
    },
    "coverageRate": {
      "v1.0": 0.4375,  // (9 direct + 5 partial) / 32
      "v1.1": 0.5714   // (13 direct + 7 partial) / 35
    },
    "coverageImprovement": 0.1339  // 13.39% improvement
  }
}
```

**Computation Logic:**
1. Load v1.0 and v1.1 advisory JSON files
2. Create mapping ID → confidence map for each version
3. For each mapping ID present in both versions, record confidence transition
4. Count new mappings (in v1.1 but not v1.0)
5. Count removed mappings (in v1.0 but not v1.1)
6. Calculate coverage rate: (direct + partial) / total
7. Calculate coverage improvement: v1.1 coverage rate - v1.0 coverage rate

**Expected Inputs:**
- `data/advisories/ISA_ADVISORY_v1.0.json`
- `data/advisories/ISA_ADVISORY_v1.1.json`

**Key Questions Answered:**
- How many mappings improved from missing → partial or partial → direct?
- Did overall coverage rate increase?
- Were any mappings downgraded (direct → partial or partial → missing)?

---

### 1.2 Regulation-Specific Coverage

**Definition:** Track coverage changes for each regulation (CSRD/ESRS, EUDR, DPP).

**Metric Structure:**
```json
{
  "regulationCoverage": {
    "ESRS E1": {
      "v1.0": {"direct": 0, "partial": 1, "missing": 4, "total": 5},
      "v1.1": {"direct": 2, "partial": 2, "missing": 1, "total": 5},
      "coverageRate": {"v1.0": 0.20, "v1.1": 0.80},
      "improvement": 0.60
    },
    "ESRS E2": {
      "v1.0": {"direct": 0, "partial": 1, "missing": 3, "total": 4},
      "v1.1": {"direct": 1, "partial": 1, "missing": 2, "total": 4},
      "coverageRate": {"v1.0": 0.25, "v1.1": 0.50},
      "improvement": 0.25
    },
    "EUDR": {
      "v1.0": {"direct": 1, "partial": 1, "missing": 3, "total": 5},
      "v1.1": {"direct": 2, "partial": 2, "missing": 1, "total": 5},
      "coverageRate": {"v1.0": 0.40, "v1.1": 0.80},
      "improvement": 0.40
    }
  }
}
```

**Computation Logic:**
1. Group mappings by `regulationStandard` field
2. Count confidence distribution for each regulation in v1.0 and v1.1
3. Calculate coverage rate per regulation
4. Identify regulations with highest/lowest improvement

**Key Questions Answered:**
- Which regulation saw the most coverage improvement?
- Are there regulations with declining coverage?
- Which regulation has the lowest coverage rate in v1.1?

---

### 1.3 Sector-Specific Coverage

**Definition:** Track coverage changes for each GS1 NL sector model (DIY, FMCG, Healthcare).

**Metric Structure:**
```json
{
  "sectorCoverage": {
    "DIY": {
      "v1.0": {"direct": 4, "partial": 2, "missing": 8, "total": 14},
      "v1.1": {"direct": 6, "partial": 3, "missing": 5, "total": 14},
      "coverageRate": {"v1.0": 0.43, "v1.1": 0.64},
      "improvement": 0.21
    },
    "FMCG": {
      "v1.0": {"direct": 3, "partial": 2, "missing": 6, "total": 11},
      "v1.1": {"direct": 5, "partial": 2, "missing": 4, "total": 11},
      "coverageRate": {"v1.0": 0.45, "v1.1": 0.64},
      "improvement": 0.19
    },
    "Healthcare": {
      "v1.0": {"direct": 2, "partial": 1, "missing": 4, "total": 7},
      "v1.1": {"direct": 2, "partial": 2, "missing": 3, "total": 7},
      "coverageRate": {"v1.0": 0.43, "v1.1": 0.57},
      "improvement": 0.14
    }
  }
}
```

**Computation Logic:**
1. For each mapping, extract affected sectors from `sectors` field
2. Count confidence distribution per sector
3. Handle "All" sector by counting it for all three sectors
4. Calculate coverage rate per sector

**Key Questions Answered:**
- Which sector has the highest coverage improvement?
- Are there sectors lagging behind in coverage?
- Which sector has the most missing mappings in v1.1?

---

## 2. Gap Lifecycle

### 2.1 Gap Status Changes

**Definition:** Track gap creation, closure, and severity changes between versions.

**Metric Structure:**
```json
{
  "gapLifecycle": {
    "v1.0": {"total": 7, "critical": 3, "moderate": 2, "low-priority": 2},
    "v1.1": {"total": 5, "critical": 2, "moderate": 2, "low-priority": 1},
    "newGaps": [
      {"gapId": "GAP-008", "title": "New gap title", "category": "moderate"}
    ],
    "closedGaps": [
      {"gapId": "GAP-001", "title": "Product Carbon Footprint (PCF)", "category": "critical"},
      {"gapId": "GAP-002", "title": "Recycled Content and Recyclability Metrics", "category": "critical"},
      {"gapId": "GAP-007", "title": "Climate Physical Risk Indicators", "category": "low-priority"}
    ],
    "severityChanges": [
      {"gapId": "GAP-004", "v1.0": "moderate", "v1.1": "low-priority", "reason": "ESRS S2-4 guidance clarified"}
    ],
    "gapClosureRate": 0.4286,  // 3 closed / 7 total in v1.0
    "criticalGapReduction": 0.3333  // (3 - 2) / 3
  }
}
```

**Computation Logic:**
1. Load gap arrays from v1.0 and v1.1
2. Create gapId → gap map for each version
3. Identify new gaps (in v1.1 but not v1.0)
4. Identify closed gaps (in v1.0 but not v1.1)
5. For gaps in both versions, check for severity changes
6. Calculate gap closure rate: closed gaps / v1.0 total gaps
7. Calculate critical gap reduction: (v1.0 critical - v1.1 critical) / v1.0 critical

**Expected Inputs:**
- `data/advisories/ISA_ADVISORY_v1.0.json` → `gaps` array
- `data/advisories/ISA_ADVISORY_v1.1.json` → `gaps` array

**Key Questions Answered:**
- How many gaps were closed in v1.1?
- Were any new gaps identified?
- Did any gaps change severity (e.g., critical → moderate)?
- What is the gap closure rate?

---

### 2.2 Gap-to-Mapping Correlation

**Definition:** Track which gaps are addressed by mapping improvements.

**Metric Structure:**
```json
{
  "gapMappingCorrelation": {
    "GAP-001": {
      "title": "Product Carbon Footprint (PCF)",
      "status": "closed",
      "relatedMappings": ["MAP-E1-002"],
      "mappingImprovements": [
        {"mappingId": "MAP-E1-002", "v1.0": "missing", "v1.1": "direct"}
      ]
    },
    "GAP-002": {
      "title": "Recycled Content and Recyclability Metrics",
      "status": "closed",
      "relatedMappings": ["MAP-E5-002", "MAP-E5-003"],
      "mappingImprovements": [
        {"mappingId": "MAP-E5-002", "v1.0": "missing", "v1.1": "direct"},
        {"mappingId": "MAP-E5-003", "v1.0": "missing", "v1.1": "partial"}
      ]
    }
  }
}
```

**Computation Logic:**
1. For each closed gap, extract `relatedMappings` field
2. For each related mapping, check confidence transition from v1.0 to v1.1
3. Verify gap closure is correlated with mapping improvement
4. Flag gaps closed without mapping improvement (possible data inconsistency)

**Key Questions Answered:**
- Were gap closures driven by mapping improvements?
- Are there gaps closed without corresponding mapping changes?
- Which mappings contributed to the most gap closures?

---

## 3. Recommendation Lifecycle

### 3.1 Recommendation Implementation Status

**Definition:** Track recommendation implementation progress between versions.

**Metric Structure:**
```json
{
  "recommendationLifecycle": {
    "v1.0": {"total": 10, "proposed": 10, "in_progress": 0, "completed": 0, "deferred": 0},
    "v1.1": {"total": 10, "proposed": 6, "in_progress": 2, "completed": 2, "deferred": 0},
    "statusChanges": [
      {
        "recommendationId": "REC-004",
        "title": "Add PCF Attributes",
        "v1.0": "proposed",
        "v1.1": "completed",
        "implementedInVersion": "3.1.34"
      },
      {
        "recommendationId": "REC-005",
        "title": "Add Circularity Metrics",
        "v1.0": "proposed",
        "v1.1": "in_progress",
        "implementedInVersion": null
      }
    ],
    "implementationRate": 0.20,  // 2 completed / 10 total
    "shortTermCompletionRate": 0.33  // 1 completed / 3 short-term recommendations
  }
}
```

**Computation Logic:**
1. Load recommendation arrays from v1.0 and v1.1
2. For each recommendation, compare `implementationStatus` field
3. Track status transitions (proposed → in_progress → completed)
4. Extract `implementedInVersion` for completed recommendations
5. Calculate implementation rate: completed / total
6. Calculate completion rate by timeframe (short/medium/long-term)

**Expected Inputs:**
- `data/advisories/ISA_ADVISORY_v1.0.json` → `recommendations` array
- `data/advisories/ISA_ADVISORY_v1.1.json` → `recommendations` array

**Key Questions Answered:**
- How many recommendations were implemented in v1.1?
- Which recommendations are in progress?
- What is the implementation rate for short-term recommendations?
- Were any recommendations deferred?

---

### 3.2 Recommendation-to-Gap Correlation

**Definition:** Track which recommendations address which gaps.

**Metric Structure:**
```json
{
  "recommendationGapCorrelation": {
    "REC-004": {
      "title": "Add PCF Attributes",
      "status": "completed",
      "relatedGaps": ["GAP-001"],
      "gapsClosed": ["GAP-001"]
    },
    "REC-005": {
      "title": "Add Circularity Metrics",
      "status": "in_progress",
      "relatedGaps": ["GAP-002"],
      "gapsClosed": []
    }
  }
}
```

**Computation Logic:**
1. For each recommendation, extract `relatedGaps` field
2. Check if related gaps are closed in v1.1
3. Verify recommendation completion is correlated with gap closure
4. Flag completed recommendations without gap closure (possible data inconsistency)

**Key Questions Answered:**
- Did completed recommendations close their related gaps?
- Are there recommendations marked completed but gaps still open?
- Which recommendations have the highest gap-closure impact?

---

## 4. Traceability Deltas

### 4.1 Dataset Registry Version Changes

**Definition:** Track dataset registry version changes and their impact.

**Metric Structure:**
```json
{
  "traceabilityDeltas": {
    "datasetRegistryVersion": {
      "v1.0": "1.0.0",
      "v1.1": "1.1.0",
      "changed": true
    },
    "datasetChanges": {
      "added": [
        {"id": "esrs.datapoints.ig4", "version": "IG4-2025", "records": 1250}
      ],
      "removed": [],
      "updated": [
        {"id": "gs1nl.benelux.diy_garden_pet.v3.1.34", "v1.0": "3.1.33", "v1.1": "3.1.34", "recordDelta": +15}
      ]
    },
    "totalRecordsUsed": {
      "v1.0": 11197,
      "v1.1": 12462,
      "delta": +1265
    }
  }
}
```

**Computation Logic:**
1. Compare `datasetRegistryVersion` field
2. Load dataset registry files for both versions
3. Identify added, removed, and updated datasets
4. Calculate total records delta
5. Track which mappings reference changed datasets

**Expected Inputs:**
- `data/metadata/dataset_registry_v1.0_FROZEN.json`
- `data/metadata/dataset_registry_v1.1_FROZEN.json`

**Key Questions Answered:**
- Did the dataset registry version change?
- Which datasets were added or updated?
- How many total records are used in v1.1 vs. v1.0?

---

### 4.2 Source Artifact Hash Changes

**Definition:** Track changes to source artifact SHA256 hashes.

**Metric Structure:**
```json
{
  "sourceArtifactChanges": {
    "advisoryMarkdown": {
      "v1.0": "c0a27b2f558a64ee526f6d79d1a066a72b66688fdcd8509cce64031e911b8d52",
      "v1.1": "d1b38c3g669b75ff637g7e8ad2b177b83c77799gedde9519ddf75142f22c9e63",
      "changed": true
    },
    "datasetRegistry": {
      "v1.0": "e2f655a9095ef4fa089d360b19189d73f9f6415762cd03baed0b7e97b6dcbc14",
      "v1.1": "f3g766b0106fg5gb190f471c20190e84g7g7526873de04cbfe0c8f08c7edcd25",
      "changed": true
    },
    "schema": {
      "v1.0": "aef56bd7f4a660d670a35cc0a06b4f5904cc4ed1b238cfafc8495dc1119d91f0",
      "v1.1": "aef56bd7f4a660d670a35cc0a06b4f5904cc4ed1b238cfafc8495dc1119d91f0",
      "changed": false
    }
  }
}
```

**Computation Logic:**
1. Extract `sourceArtifacts` from both advisory versions
2. Compare SHA256 hashes for each artifact
3. Flag changed artifacts
4. Verify hash changes correlate with expected updates

**Expected Inputs:**
- `data/advisories/ISA_ADVISORY_v1.0.json` → `sourceArtifacts`
- `data/advisories/ISA_ADVISORY_v1.1.json` → `sourceArtifacts`

**Key Questions Answered:**
- Did the Markdown advisory source change?
- Did the dataset registry change?
- Did the schema change?
- Are hash changes consistent with version changes?

---

## 5. Composite Metrics

### 5.1 Overall Progress Score

**Definition:** Aggregate metric combining coverage improvement, gap closure, and recommendation implementation.

**Metric Structure:**
```json
{
  "overallProgress": {
    "coverageImprovement": 0.1339,  // 13.39% coverage rate increase
    "gapClosureRate": 0.4286,       // 42.86% of gaps closed
    "recommendationImplementationRate": 0.20,  // 20% of recommendations completed
    "progressScore": 0.2542,        // Weighted average
    "progressGrade": "B"            // A/B/C/D/F grading
  }
}
```

**Computation Logic:**
1. Calculate coverage improvement (see 1.1)
2. Calculate gap closure rate (see 2.1)
3. Calculate recommendation implementation rate (see 3.1)
4. Compute weighted average: (0.4 × coverage + 0.4 × gap closure + 0.2 × recommendation)
5. Assign letter grade: A (>0.4), B (0.3-0.4), C (0.2-0.3), D (0.1-0.2), F (<0.1)

**Key Questions Answered:**
- What is the overall progress from v1.0 to v1.1?
- Which dimension (coverage, gaps, recommendations) improved most?
- How does v1.1 grade compared to v1.0?

---

### 5.2 Regression Detection

**Definition:** Identify negative changes (coverage decline, new gaps, recommendation deferrals).

**Metric Structure:**
```json
{
  "regressions": {
    "coverageDeclines": [
      {"mappingId": "MAP-E2-001", "v1.0": "partial", "v1.1": "missing", "reason": "GS1 NL attribute deprecated"}
    ],
    "newCriticalGaps": [
      {"gapId": "GAP-008", "title": "New critical gap", "category": "critical"}
    ],
    "deferredRecommendations": [
      {"recommendationId": "REC-007", "title": "Update Validation Rules", "status": "deferred"}
    ],
    "regressionCount": 3,
    "regressionSeverity": "moderate"
  }
}
```

**Computation Logic:**
1. Identify mappings with confidence decline (direct → partial, partial → missing)
2. Identify new critical gaps
3. Identify recommendations moved to "deferred" status
4. Count total regressions
5. Assign severity: high (>5), moderate (3-5), low (1-2), none (0)

**Key Questions Answered:**
- Were there any negative changes in v1.1?
- Did any mappings lose coverage?
- Were any new critical gaps identified?
- Were any recommendations deferred?

---

## 6. Implementation Guidelines

### 6.1 Diff Computation Script

**Script Location:** `scripts/compute_advisory_diff.js`

**Usage:**
```bash
pnpm diff:advisory v1.0 v1.1 > data/advisories/ISA_ADVISORY_v1.0_to_v1.1_DIFF.json
```

**Script Structure:**
```javascript
#!/usr/bin/env node
const fs = require('fs');

// Load advisories
const v1_0 = JSON.parse(fs.readFileSync('./data/advisories/ISA_ADVISORY_v1.0.json', 'utf8'));
const v1_1 = JSON.parse(fs.readFileSync('./data/advisories/ISA_ADVISORY_v1.1.json', 'utf8'));

// Compute coverage deltas
const coverageDeltas = computeCoverageDeltas(v1_0, v1_1);

// Compute gap lifecycle
const gapLifecycle = computeGapLifecycle(v1_0, v1_1);

// Compute recommendation lifecycle
const recommendationLifecycle = computeRecommendationLifecycle(v1_0, v1_1);

// Compute traceability deltas
const traceabilityDeltas = computeTraceabilityDeltas(v1_0, v1_1);

// Compute composite metrics
const overallProgress = computeOverallProgress(coverageDeltas, gapLifecycle, recommendationLifecycle);
const regressions = detectRegressions(coverageDeltas, gapLifecycle, recommendationLifecycle);

// Output diff JSON
const diff = {
  comparisonId: "ISA_ADVISORY_v1.0_to_v1.1",
  baseVersion: "1.0.0",
  targetVersion: "1.1.0",
  generatedAt: new Date().toISOString(),
  coverageDeltas,
  gapLifecycle,
  recommendationLifecycle,
  traceabilityDeltas,
  overallProgress,
  regressions
};

console.log(JSON.stringify(diff, null, 2));
```

---

### 6.2 Regression Testing

**Test Location:** `server/advisory-diff.test.ts`

**Test Cases:**
1. **Coverage improvement test:** Verify coverage rate increases or stays constant
2. **Gap closure test:** Verify gap count decreases or stays constant
3. **No critical gap introduction:** Verify no new critical gaps added
4. **Recommendation progress test:** Verify implementation rate increases
5. **Traceability integrity test:** Verify dataset registry version is valid
6. **Hash consistency test:** Verify source artifact hashes match actual files

**Example Test:**
```typescript
import { describe, it, expect } from 'vitest';
import { computeAdvisoryDiff } from './advisory-diff';

describe('ISA Advisory Diff Regression Tests', () => {
  it('should not introduce new critical gaps', () => {
    const diff = computeAdvisoryDiff('v1.0', 'v1.1');
    expect(diff.regressions.newCriticalGaps.length).toBe(0);
  });

  it('should improve or maintain coverage rate', () => {
    const diff = computeAdvisoryDiff('v1.0', 'v1.1');
    expect(diff.coverageDeltas.coverageImprovement).toBeGreaterThanOrEqual(0);
  });

  it('should close at least one gap', () => {
    const diff = computeAdvisoryDiff('v1.0', 'v1.1');
    expect(diff.gapLifecycle.closedGaps.length).toBeGreaterThan(0);
  });
});
```

---

## 7. Visualization

### 7.1 Coverage Improvement Chart

**Chart Type:** Stacked bar chart

**X-Axis:** Advisory version (v1.0, v1.1)  
**Y-Axis:** Mapping count  
**Stacks:** Direct (green), Partial (yellow), Missing (red)

**Purpose:** Visualize coverage improvement at a glance.

---

### 7.2 Gap Closure Funnel

**Chart Type:** Sankey diagram

**Flow:** v1.0 gaps → closed/open/new → v1.1 gaps

**Purpose:** Show gap lifecycle transitions.

---

### 7.3 Recommendation Implementation Timeline

**Chart Type:** Gantt chart

**X-Axis:** Time (advisory versions)  
**Y-Axis:** Recommendation ID  
**Bars:** Proposed (gray), In Progress (blue), Completed (green), Deferred (red)

**Purpose:** Track recommendation implementation progress over time.

---

## 8. File Locations

**Diff Output:**
- Path: `data/advisories/ISA_ADVISORY_v1.0_to_v1.1_DIFF.json`
- Format: JSON
- Generated by: `scripts/compute_advisory_diff.js`

**Diff Computation Script:**
- Path: `scripts/compute_advisory_diff.js`
- Language: Node.js (CommonJS)
- Usage: `pnpm diff:advisory v1.0 v1.1`

**Regression Tests:**
- Path: `server/advisory-diff.test.ts`
- Framework: Vitest
- Usage: `pnpm test advisory-diff`

---

## 9. Best Practices

### 9.1 For Diff Computation

**Deterministic Ordering:**
- Always sort arrays by stable IDs before comparison
- Use canonical ordering (see `ADVISORY_OUTPUTS.md`)

**Null Handling:**
- Treat `null` and `undefined` as equivalent for optional fields
- Use `0` for missing confidence scores (see schema)

**ID Stability:**
- Never reassign existing mapping/gap/recommendation IDs
- Use ID-based comparison, not array index

**Version Comparison:**
- Always compare same advisory type (e.g., ISA_ADVISORY_v1.0 vs. ISA_ADVISORY_v1.1)
- Do not compare advisories for different regulations or sectors

### 9.2 For Regression Testing

**Automated Tests:**
- Run diff regression tests on every advisory generation
- Fail CI/CD pipeline if critical regressions detected

**Manual Review:**
- Review diff output before publishing new advisory version
- Verify regressions are intentional (e.g., attribute deprecated)

**Documentation:**
- Document all regressions in advisory release notes
- Explain why coverage declined or gaps increased

---

## 10. Future Enhancements

### 10.1 Confidence Score Deltas (ISA v1.2+)

Once quantitative confidence scores are implemented (see `ISA_V1_FORMALIZATION_TARGETS.md`), add:
- **Average confidence score change:** Track average confidence score improvement
- **Confidence score distribution:** Visualize confidence score histogram
- **Confidence score regression:** Detect mappings with declining scores

### 10.2 Multi-Version Comparison (ISA v2.0+)

Extend diff metrics to compare 3+ versions:
- **Trend analysis:** Track coverage improvement trend over time
- **Gap closure velocity:** Measure gap closure rate per version
- **Recommendation backlog:** Track recommendation implementation lag

### 10.3 Cross-Regulation Comparison (ISA v2.0+)

Compare different regulations (e.g., CSRD vs. CSDDD):
- **Regulation coverage comparison:** Which regulation has better GS1 coverage?
- **Gap overlap analysis:** Which gaps affect multiple regulations?
- **Recommendation prioritization:** Which recommendations address most gaps?

---

## 11. References

**ISA v1.0 Advisory (JSON):**  
`data/advisories/ISA_ADVISORY_v1.0.json`

**Advisory Output Schema:**  
`shared/schemas/advisory-output.schema.json`

**Advisory Outputs Documentation:**  
`docs/ADVISORY_OUTPUTS.md`

**Formalization Targets:**  
`docs/ISA_V1_FORMALIZATION_TARGETS.md`

---

**Document Status:** FINAL  
**Diff Metrics Version:** 1.0  
**Next Review:** ISA v1.1 advisory generation

---

*This document defines the canonical diff metrics for comparing ISA advisory versions, enabling quantitative tracking of standards evolution, gap closure, and recommendation implementation.*
