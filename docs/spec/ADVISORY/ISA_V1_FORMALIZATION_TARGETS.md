# ISA v1.0 Formalization Targets

**Document Type:** Development Roadmap  
**Date:** December 13, 2025  
**Purpose:** Identify extraction candidates from ISA v1.0 advisory for next development phase  
**Status:** Planning (not implemented)

---

## Executive Summary

ISA v1.0 advisory report contains implicit structures, logic, and patterns that can be formalized into schemas, APIs, and automated workflows. This document identifies five extraction candidates for next development phase: advisory output schema, gap taxonomy, confidence scoring logic, automated recommendation generation, and interactive dataset explorer.

**What This Document Provides:**  
This document catalogs formalization opportunities discovered during ISA v1.0 advisory generation. Each target includes current state assessment, formalization proposal, proposed implementation approach, and next steps. These targets are **not implemented**—they serve as a roadmap for ISA v1.1+ development.

**Why Formalization Matters:**  
ISA v1.0 advisory is a 15,000-word Markdown document with mapping results, gap analysis, and recommendations embedded in prose. Without formalization, ISA cannot scale to multiple regulations, sector models, or advisory versions. Formalization enables machine-readable outputs, automated analysis, and version-controlled comparisons.

---

## 1. Advisory Output Schema

### 1.1 Current State

**Problem:**  
ISA v1.0 advisory report is a Markdown document. Mapping results (e.g., "ESRS E1-6 Product Carbon Footprint → Missing in GS1 NL") are embedded in prose tables. Gap analysis and recommendations are narrative text. This makes:
- **Version comparison impossible:** No structured way to compare ISA v1.0 vs. v1.1 gap closure
- **Automated analysis blocked:** Cannot programmatically query "Which ESRS datapoints have zero GS1 NL coverage?"
- **Integration limited:** External systems cannot consume ISA advisory outputs via API

**Current Advisory Structure:**
```
ISA_First_Advisory_Report_GS1NL.md (15,000 words)
├── Executive Summary (prose)
├── Regulatory Coverage Snapshot (prose + tables)
├── Mapping Results (6 Markdown tables)
│   ├── ESRS E1 (Climate Change) → GS1 NL
│   ├── ESRS E2 (Pollution) → GS1 NL
│   ├── ESRS E5 (Circular Economy) → GS1 NL
│   ├── ESRS S1/S2 (Social) → GS1 NL
│   ├── EUDR → GS1 NL
│   └── DPP → GS1 NL
├── Gap Analysis (7 gaps in prose)
├── Standards Evolution Signals (prose recommendations)
└── Confidence & Traceability (prose)
```

**Example Mapping Result (Current Format):**
```markdown
| ESRS Datapoint | GS1 NL Coverage | Confidence | Rationale |
|----------------|-----------------|------------|-----------|
| Product carbon footprint | Missing | Missing | No GS1 NL attribute exists for PCF |
| Energy efficiency class | DIY: Energy Efficiency Class | Partial | Covers energy, not full carbon footprint |
```

### 1.2 Formalization Proposal

**Goal:**  
Create structured JSON schema for advisory outputs enabling machine-readable mapping results, programmatic gap analysis, and automated recommendation generation.

**Proposed Schema:**

```typescript
interface AdvisoryOutput {
  // Metadata
  advisoryId: string;              // e.g., "ISA_ADVISORY_v1.0"
  version: string;                 // e.g., "1.0.0"
  publicationDate: string;         // ISO 8601 date
  datasetRegistryVersion: string;  // e.g., "1.0.0"
  author: string;                  // e.g., "ISA Execution Agent"
  
  // Scope
  regulationsCovered: Regulation[];
  sectorModelsCovered: SectorModel[];
  
  // Outputs
  mappingResults: MappingResult[];
  gapAnalysis: Gap[];
  recommendations: Recommendation[];
  
  // Statistics
  metadata: {
    totalDatapointsAnalyzed: number;
    totalAttributesEvaluated: number;
    totalRecordsUsed: number;
    totalMappings: number;
    directMappings: number;
    partialMappings: number;
    missingMappings: number;
  };
}

interface Regulation {
  id: string;                      // e.g., "csrd_esrs"
  name: string;                    // e.g., "CSRD/ESRS"
  legalStatus: "binding" | "proposed" | "voluntary";
  effectiveDate: string;           // ISO 8601 date
  datasetIds: string[];            // e.g., ["esrs.datapoints.ig3"]
}

interface SectorModel {
  id: string;                      // e.g., "gs1nl.benelux.diy_garden_pet.v3.1.33"
  name: string;                    // e.g., "GS1 NL DIY/Garden/Pets"
  version: string;                 // e.g., "3.1.33"
  totalAttributes: number;         // e.g., 3009
}

interface MappingResult {
  mappingId: string;               // e.g., "MAP-001"
  esrsDatapoint: string;           // e.g., "Product carbon footprint"
  esrsDisclosureRequirement: string; // e.g., "E1-6"
  esrsStandard: string;            // e.g., "ESRS E1"
  gs1nlAttribute: string | null;   // e.g., "Energy Efficiency Class" or null
  gs1nlAttributeCode: string | null; // e.g., "ENERGY_EFFICIENCY_CLASS" or null
  sector: string[];                // e.g., ["DIY", "FMCG"]
  confidence: "direct" | "partial" | "missing";
  confidenceScore: number;         // 0-100
  rationale: string;               // Explanation of mapping
  datasetReferences: string[];     // e.g., ["esrs.datapoints.ig3", "gs1nl.benelux.diy_garden_pet.v3.1.33"]
}

interface Gap {
  gapId: string;                   // e.g., "GAP-001"
  title: string;                   // e.g., "Product Carbon Footprint"
  category: "critical" | "moderate" | "low-priority";
  impact: "high" | "medium" | "low";
  urgency: "high" | "medium" | "low";
  affectedRegulations: string[];   // e.g., ["ESRS E1-6"]
  affectedSectors: string[];       // e.g., ["DIY", "FMCG", "Healthcare"]
  description: string;
  recommendedAction: string;
  datasetReferences: string[];     // e.g., ["esrs.datapoints.ig3"]
  relatedMappings: string[];       // Mapping IDs
}

interface Recommendation {
  recommendationId: string;        // e.g., "REC-001"
  timeframe: "short-term" | "medium-term" | "long-term";
  category: "documentation" | "data_model" | "strategic";
  title: string;
  description: string;
  relatedGaps: string[];           // Gap IDs
  estimatedEffort: "low" | "medium" | "high";
  implementationStatus: "proposed" | "in_progress" | "completed" | "deferred";
  implementedInVersion: string | null; // e.g., "GS1 NL v3.1.34"
}
```

**Example Mapping Result (Proposed JSON Format):**
```json
{
  "mappingId": "MAP-001",
  "esrsDatapoint": "Product carbon footprint",
  "esrsDisclosureRequirement": "E1-6",
  "esrsStandard": "ESRS E1",
  "gs1nlAttribute": null,
  "gs1nlAttributeCode": null,
  "sector": ["DIY", "FMCG", "Healthcare"],
  "confidence": "missing",
  "confidenceScore": 0,
  "rationale": "No GS1 NL attribute exists for product-level carbon footprint across all three sector models",
  "datasetReferences": ["esrs.datapoints.ig3", "gs1nl.benelux.diy_garden_pet.v3.1.33", "gs1nl.benelux.fmcg.v3.1.33.5", "gs1nl.benelux.healthcare.v3.1.33"]
}
```

### 1.3 Implementation Approach

**Phase 1: Schema Definition (1-2 days)**
1. Define complete TypeScript interfaces for advisory outputs
2. Create JSON Schema for validation
3. Add schema to ISA repository (`shared/schemas/advisory-output.schema.json`)

**Phase 2: Dual Output Generation (3-5 days)**
4. Extend advisory generation to produce both Markdown (human-readable) and JSON (machine-readable)
5. Create `server/generate-advisory-json.ts` script
6. Validate JSON output against schema

**Phase 3: Database Storage (2-3 days)**
7. Create `advisory_outputs` database table
8. Store JSON advisory outputs with version tracking
9. Create tRPC procedures for querying advisory outputs

**Phase 4: Version Comparison (3-5 days)**
10. Build advisory comparison engine
11. Generate diff reports (ISA v1.0 vs. v1.1)
12. Create comparison visualization UI

**Total Estimated Effort:** 9-15 days

### 1.4 Benefits

✅ **Machine-Readable Outputs:**  
External systems can consume ISA advisory via API (e.g., GS1 NL standards team dashboard)

✅ **Version Comparison:**  
Automatically compare ISA v1.0 vs. v1.1 to track gap closure, new mappings, recommendation implementation

✅ **Automated Analysis:**  
Programmatically query "Which ESRS datapoints have zero GS1 NL coverage?" without parsing Markdown

✅ **Integration-Ready:**  
ISA advisory outputs can be integrated into GS1 NL standards development workflows

✅ **Audit Trail:**  
Every mapping result includes dataset references, confidence scores, and rationale for traceability

### 1.5 Next Steps (Not Implemented)

1. Review and finalize TypeScript interfaces with stakeholders
2. Create JSON Schema for validation
3. Implement dual output generation (Markdown + JSON)
4. Store JSON advisory outputs in database
5. Build version comparison engine

---

## 2. Gap Taxonomy

### 2.1 Current State

**Problem:**  
ISA v1.0 uses implicit gap categories (critical/moderate/low-priority) and impact/urgency dimensions. Gap classification is based on domain knowledge, not formal rules. This makes:
- **Inconsistent classification:** Different analysts may classify same gap differently
- **No reproducibility:** Cannot explain why "Product Carbon Footprint" is critical vs. moderate
- **Version comparison blocked:** Cannot track gap category changes over time (e.g., "low-priority" → "critical" as deadline approaches)

**Current Gap Classification (ISA v1.0):**
```
Gap: Product Carbon Footprint
Category: Critical
Impact: High
Urgency: High
Rationale: (implicit domain knowledge)
```

**Gap Classification Logic (Implicit):**
- **Critical:** Regulatory deadline <12 months, affects >50% of market, blocks compliance
- **Moderate:** Regulatory deadline 12-24 months, affects 25-50% of market, partial workaround exists
- **Low-Priority:** Regulatory deadline >24 months, affects <25% of market, or conditional requirement

### 2.2 Formalization Proposal

**Goal:**  
Create explicit gap taxonomy with classification rules enabling consistent gap identification, automated prioritization, and gap closure tracking.

**Proposed Taxonomy Structure:**

```typescript
interface GapTaxonomy {
  version: string;                 // e.g., "1.0.0"
  categories: GapCategory[];
  impactLevels: ImpactLevel[];
  urgencyLevels: UrgencyLevel[];
  classificationRules: ClassificationRule[];
}

interface GapCategory {
  id: string;                      // e.g., "critical"
  name: string;                    // e.g., "Critical"
  description: string;
  criteria: string[];              // e.g., ["Affects >50% of market", "Regulatory deadline <12 months"]
  priority: number;                // 1 (highest) to 3 (lowest)
}

interface ImpactLevel {
  id: string;                      // e.g., "high"
  name: string;                    // e.g., "High Impact"
  description: string;
  indicators: string[];            // e.g., ["Blocks compliance", "Affects multiple sectors"]
  score: number;                   // 1-10
}

interface UrgencyLevel {
  id: string;                      // e.g., "high"
  name: string;                    // e.g., "High Urgency"
  description: string;
  timeframe: string;               // e.g., "0-6 months"
  score: number;                   // 1-10
}

interface ClassificationRule {
  ruleId: string;                  // e.g., "RULE-001"
  condition: string;               // e.g., "If regulation is binding AND deadline <12 months"
  category: string;                // e.g., "critical"
  impact: string;                  // e.g., "high"
  urgency: string;                 // e.g., "high"
  rationale: string;
}
```

**Example Gap Categories:**

| Category | Priority | Criteria | Example |
|----------|----------|----------|---------|
| **Critical** | 1 | Regulatory deadline <12 months, affects >50% of market, blocks compliance | Product Carbon Footprint (ESRS E1-6 mandatory 2025) |
| **Moderate** | 2 | Regulatory deadline 12-24 months, affects 25-50% of market, partial workaround exists | Supplier Sustainability Certifications (ESRS S2-4 conditional) |
| **Low-Priority** | 3 | Regulatory deadline >24 months, affects <25% of market, or conditional requirement | Microplastics Disclosure (ESRS E2-4 conditional) |

**Example Classification Rules:**

```typescript
const classificationRules: ClassificationRule[] = [
  {
    ruleId: "RULE-001",
    condition: "regulation.legalStatus === 'binding' AND regulation.deadline < 12 months AND gap.marketCoverage > 50%",
    category: "critical",
    impact: "high",
    urgency: "high",
    rationale: "Binding regulation with imminent deadline affecting majority of market requires immediate action"
  },
  {
    ruleId: "RULE-002",
    condition: "regulation.legalStatus === 'binding' AND regulation.deadline >= 12 months AND regulation.deadline < 24 months",
    category: "moderate",
    impact: "medium",
    urgency: "medium",
    rationale: "Binding regulation with 12-24 month deadline requires medium-term planning"
  },
  {
    ruleId: "RULE-003",
    condition: "regulation.legalStatus === 'binding' AND regulation.requirement === 'conditional'",
    category: "low-priority",
    impact: "low",
    urgency: "low",
    rationale: "Conditional requirement affects subset of companies, lower priority"
  }
];
```

### 2.3 Implementation Approach

**Phase 1: Taxonomy Definition (2-3 days)**
1. Define complete gap taxonomy with categories, impact levels, urgency levels
2. Document classification rules with conditions and rationale
3. Create `shared/schemas/gap-taxonomy.schema.json`

**Phase 2: Classification Algorithm (3-5 days)**
4. Implement gap classification algorithm
5. Create `server/classify-gap.ts` module
6. Validate algorithm against ISA v1.0 manual classifications

**Phase 3: Database Integration (2-3 days)**
7. Create `gap_taxonomy` database table
8. Store gap classifications with version tracking
9. Create tRPC procedures for gap queries

**Phase 4: Gap Tracking (3-5 days)**
10. Build gap closure tracking system
11. Track gap status changes over advisory versions
12. Generate gap closure reports

**Total Estimated Effort:** 10-16 days

### 2.4 Benefits

✅ **Consistent Classification:**  
All gaps classified using same rules, eliminating analyst bias

✅ **Reproducible Analysis:**  
Every gap classification includes rule ID and rationale for audit trail

✅ **Automated Prioritization:**  
Gaps automatically prioritized based on impact/urgency scores

✅ **Gap Closure Tracking:**  
Track gap status changes over time (e.g., "critical" → "resolved" in ISA v1.1)

✅ **Cross-Regulation Analysis:**  
Compare gap patterns across CSRD, EUDR, DPP to identify common themes

### 2.5 Next Steps (Not Implemented)

1. Define complete gap taxonomy with stakeholder input
2. Document classification rules with examples
3. Implement gap classification algorithm
4. Validate algorithm against ISA v1.0 gaps
5. Build gap tracking database

---

## 3. Confidence Scoring Logic

### 3.1 Current State

**Problem:**  
ISA v1.0 uses three qualitative confidence levels (Direct, Partial, Missing) for ESRS→GS1 NL mappings. Confidence assignment is based on domain knowledge, not quantitative scoring. This makes:
- **Subjective assessment:** No objective criteria for "partial" vs. "missing"
- **No granularity:** Cannot distinguish between "strong partial" (score 75) and "weak partial" (score 45)
- **Threshold tuning impossible:** Cannot adjust confidence thresholds based on validation results

**Current Confidence Levels (ISA v1.0):**
```
Direct: GS1 NL attribute directly satisfies ESRS datapoint
Partial: GS1 NL attribute partially satisfies, additional data needed
Missing: No GS1 NL attribute exists
```

**Example Confidence Assessment (Current):**
```
ESRS: Product carbon footprint
GS1 NL: Energy Efficiency Class
Confidence: Partial
Rationale: (implicit domain knowledge - "energy efficiency relates to carbon but is not PCF")
```

### 3.2 Formalization Proposal

**Goal:**  
Create explicit confidence scoring algorithm enabling reproducible mapping confidence assessment, quantitative similarity scores, and automated confidence level assignment.

**Proposed Scoring Algorithm:**

```typescript
interface ConfidenceScore {
  score: number;                   // 0-100
  level: "direct" | "partial" | "missing";
  factors: ConfidenceFactors;
  rationale: string;
}

interface ConfidenceFactors {
  semanticSimilarity: number;      // 0-100 (keyword/concept overlap)
  dataTypeMatch: number;           // 0-100 (numeric, text, boolean, enum)
  unitMatch: number;               // 0-100 (kg, %, m², etc.)
  scopeMatch: number;              // 0-100 (product-level, batch-level, company-level)
  validationRuleMatch: number;     // 0-100 (mandatory, conditional, optional)
}

function calculateConfidence(
  esrsDatapoint: ESRSDatapoint,
  gs1nlAttribute: GS1NLAttribute
): ConfidenceScore {
  // Weighted scoring algorithm
  const semanticSimilarity = calculateSemanticSimilarity(esrsDatapoint.name, gs1nlAttribute.name);
  const dataTypeMatch = calculateDataTypeMatch(esrsDatapoint.dataType, gs1nlAttribute.dataType);
  const unitMatch = calculateUnitMatch(esrsDatapoint.unit, gs1nlAttribute.unit);
  const scopeMatch = calculateScopeMatch(esrsDatapoint.scope, gs1nlAttribute.scope);
  const validationRuleMatch = calculateValidationRuleMatch(esrsDatapoint, gs1nlAttribute);
  
  // Weighted average (weights sum to 1.0)
  const score = (
    semanticSimilarity * 0.4 +
    dataTypeMatch * 0.2 +
    unitMatch * 0.2 +
    scopeMatch * 0.1 +
    validationRuleMatch * 0.1
  );
  
  // Assign confidence level based on thresholds
  const level = score >= 80 ? "direct" : score >= 40 ? "partial" : "missing";
  
  return {
    score,
    level,
    factors: { semanticSimilarity, dataTypeMatch, unitMatch, scopeMatch, validationRuleMatch },
    rationale: generateRationale(level, factors)
  };
}

// Semantic similarity calculation (keyword matching + LLM embeddings)
function calculateSemanticSimilarity(esrsName: string, gs1nlName: string): number {
  // Step 1: Keyword matching (0-50 points)
  const esrsKeywords = extractKeywords(esrsName);
  const gs1nlKeywords = extractKeywords(gs1nlName);
  const keywordOverlap = calculateJaccardSimilarity(esrsKeywords, gs1nlKeywords);
  const keywordScore = keywordOverlap * 50;
  
  // Step 2: LLM embeddings (0-50 points)
  const esrsEmbedding = getLLMEmbedding(esrsName);
  const gs1nlEmbedding = getLLMEmbedding(gs1nlName);
  const cosineSimilarity = calculateCosineSimilarity(esrsEmbedding, gs1nlEmbedding);
  const embeddingScore = cosineSimilarity * 50;
  
  return keywordScore + embeddingScore;
}

// Data type matching
function calculateDataTypeMatch(esrsType: string, gs1nlType: string): number {
  const typeMapping = {
    "numeric": ["numeric", "integer", "decimal", "float"],
    "text": ["text", "string", "varchar"],
    "boolean": ["boolean", "yes_no"],
    "enum": ["enum", "code_list"],
    "date": ["date", "datetime", "timestamp"]
  };
  
  // Exact match: 100 points
  if (esrsType === gs1nlType) return 100;
  
  // Compatible types: 70 points
  for (const [category, types] of Object.entries(typeMapping)) {
    if (types.includes(esrsType) && types.includes(gs1nlType)) return 70;
  }
  
  // Incompatible types: 0 points
  return 0;
}

// Unit matching
function calculateUnitMatch(esrsUnit: string | null, gs1nlUnit: string | null): number {
  if (!esrsUnit && !gs1nlUnit) return 100; // Both unitless
  if (!esrsUnit || !gs1nlUnit) return 50;  // One unitless
  
  // Exact match: 100 points
  if (esrsUnit === gs1nlUnit) return 100;
  
  // Unit conversion possible: 80 points (e.g., kg → g, m² → cm²)
  if (isConvertible(esrsUnit, gs1nlUnit)) return 80;
  
  // Incompatible units: 0 points
  return 0;
}

// Scope matching
function calculateScopeMatch(esrsScope: string, gs1nlScope: string): number {
  const scopeHierarchy = ["product", "batch", "company", "supply_chain"];
  
  // Exact match: 100 points
  if (esrsScope === gs1nlScope) return 100;
  
  // Adjacent levels: 70 points (e.g., product vs. batch)
  const esrsIndex = scopeHierarchy.indexOf(esrsScope);
  const gs1nlIndex = scopeHierarchy.indexOf(gs1nlScope);
  if (Math.abs(esrsIndex - gs1nlIndex) === 1) return 70;
  
  // Non-adjacent levels: 40 points
  return 40;
}

// Validation rule matching
function calculateValidationRuleMatch(esrsDatapoint: ESRSDatapoint, gs1nlAttribute: GS1NLAttribute): number {
  // ESRS mandatory + GS1 NL mandatory: 100 points
  if (esrsDatapoint.mandatory && gs1nlAttribute.mandatory) return 100;
  
  // ESRS mandatory + GS1 NL conditional: 70 points
  if (esrsDatapoint.mandatory && gs1nlAttribute.conditional) return 70;
  
  // ESRS mandatory + GS1 NL optional: 40 points
  if (esrsDatapoint.mandatory && gs1nlAttribute.optional) return 40;
  
  // ESRS conditional/voluntary: 80 points (less strict)
  return 80;
}
```

**Confidence Level Thresholds:**

| Level | Score Range | Definition | Example |
|-------|-------------|------------|---------|
| **Direct** | 80-100 | GS1 NL attribute directly satisfies ESRS datapoint requirement | ESRS "Product name" → GS1 NL "Product Description" (score: 95) |
| **Partial** | 40-79 | GS1 NL attribute partially satisfies requirement, additional data needed | ESRS "Product carbon footprint" → GS1 NL "Energy Efficiency Class" (score: 55) |
| **Missing** | 0-39 | No GS1 NL attribute exists to satisfy requirement | ESRS "Recycled content %" → No GS1 NL attribute (score: 0) |

**Example Confidence Assessment (Proposed):**
```json
{
  "esrsDatapoint": "Product carbon footprint",
  "gs1nlAttribute": "Energy Efficiency Class",
  "score": 55,
  "level": "partial",
  "factors": {
    "semanticSimilarity": 45,
    "dataTypeMatch": 70,
    "unitMatch": 0,
    "scopeMatch": 100,
    "validationRuleMatch": 70
  },
  "rationale": "Partial match: semantic similarity 45% (energy efficiency relates to carbon but is not PCF), data type compatible (both numeric), unit mismatch (kgCO2e vs. energy class), scope match (both product-level), validation rule compatible (both mandatory)"
}
```

### 3.3 Implementation Approach

**Phase 1: Algorithm Design (3-5 days)**
1. Define complete confidence scoring algorithm with factor weights
2. Implement semantic similarity calculation (keyword matching + LLM embeddings)
3. Implement data type, unit, scope, validation rule matching functions

**Phase 2: LLM Integration (2-3 days)**
4. Integrate LLM embeddings API for semantic similarity
5. Create embedding cache to avoid redundant API calls
6. Validate embedding-based similarity against manual assessments

**Phase 3: Threshold Tuning (2-3 days)**
7. Validate scoring algorithm against ISA v1.0 manual confidence assessments
8. Tune confidence thresholds (80/40) based on validation results
9. Adjust factor weights (0.4/0.2/0.2/0.1/0.1) if needed

**Phase 4: API Integration (2-3 days)**
10. Create tRPC procedure for confidence scoring
11. Build confidence scoring UI for interactive mapping
12. Store confidence scores in database

**Total Estimated Effort:** 9-14 days

### 3.4 Benefits

✅ **Reproducible Assessment:**  
Every mapping confidence includes quantitative score and factor breakdown

✅ **Granular Confidence:**  
Distinguish between "strong partial" (score 75) and "weak partial" (score 45)

✅ **Threshold Tuning:**  
Adjust confidence thresholds based on validation results (e.g., 80/40 → 85/50)

✅ **Automated Mapping:**  
Automatically suggest GS1 NL attributes for ESRS datapoints based on confidence scores

✅ **Audit Trail:**  
Every confidence score includes factor breakdown and rationale for traceability

### 3.5 Next Steps (Not Implemented)

1. Finalize confidence scoring algorithm with stakeholder input
2. Implement semantic similarity calculation with LLM embeddings
3. Validate algorithm against ISA v1.0 manual assessments
4. Tune confidence thresholds and factor weights
5. Build confidence scoring API

---

## 4. Automated Recommendation Generation

### 4.1 Current State

**Problem:**  
ISA v1.0 recommendations are manually written based on gap analysis and domain knowledge. Recommendations are categorized by timeframe (short/medium/long-term) and type (documentation/data model/strategic). This makes:
- **Manual effort required:** Every advisory version requires manual recommendation writing
- **Inconsistent recommendations:** Different analysts may recommend different actions for same gap
- **No implementation tracking:** Cannot track whether GS1 NL implemented ISA v1.0 recommendations

**Current Recommendation Structure (ISA v1.0):**
```
Recommendation: Add Product Carbon Footprint to GS1 NL sector models
Timeframe: Medium-term (Q3-Q4 2025)
Category: Data Model
Description: (manually written prose)
Related Gaps: GAP-001
```

### 4.2 Formalization Proposal

**Goal:**  
Create recommendation generation engine enabling automated recommendation generation from gap analysis, recommendation prioritization, and implementation tracking.

**Proposed Recommendation Engine:**

```typescript
interface RecommendationEngine {
  generateRecommendations(gaps: Gap[]): Recommendation[];
  prioritizeRecommendations(recommendations: Recommendation[]): Recommendation[];
  trackImplementation(recommendationId: string, status: ImplementationStatus): void;
}

interface RecommendationTemplate {
  templateId: string;              // e.g., "TMPL-001"
  gapType: string;                 // e.g., "missing_attribute"
  timeframe: "short-term" | "medium-term" | "long-term";
  category: "documentation" | "data_model" | "strategic";
  titleTemplate: string;           // e.g., "Add {attribute_name} to {sector_model}"
  descriptionTemplate: string;
  estimatedEffort: "low" | "medium" | "high";
  conditions: string[];            // e.g., ["gap.category === 'critical'"]
}

interface ImplementationStatus {
  status: "proposed" | "in_progress" | "completed" | "deferred";
  implementedInVersion: string | null; // e.g., "GS1 NL v3.1.34"
  implementationDate: string | null;
  notes: string;
}

// Recommendation generation algorithm
function generateRecommendations(gaps: Gap[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  for (const gap of gaps) {
    // Find matching templates
    const templates = findMatchingTemplates(gap);
    
    for (const template of templates) {
      // Generate recommendation from template
      const recommendation = applyTemplate(gap, template);
      recommendations.push(recommendation);
    }
  }
  
  // Prioritize recommendations
  return prioritizeRecommendations(recommendations);
}

// Template matching
function findMatchingTemplates(gap: Gap): RecommendationTemplate[] {
  const templates: RecommendationTemplate[] = [
    {
      templateId: "TMPL-001",
      gapType: "missing_attribute",
      timeframe: "medium-term",
      category: "data_model",
      titleTemplate: "Add {attribute_name} to {sector_model} sector model",
      descriptionTemplate: "Extend {sector_model} sector model to include {attribute_name} attribute in v{next_version} release. This addresses {regulation} requirement {datapoint_id}. Recommended data type: {data_type}. Validation rule: {validation_rule}.",
      estimatedEffort: "medium",
      conditions: ["gap.category === 'critical'", "gap.type === 'missing_attribute'"]
    },
    {
      templateId: "TMPL-002",
      gapType: "partial_attribute",
      timeframe: "short-term",
      category: "documentation",
      titleTemplate: "Publish implementation guidance for {attribute_name}",
      descriptionTemplate: "Create implementation guide showing how to use existing {existing_attribute} attribute to partially satisfy {regulation} requirement {datapoint_id}. Include mapping examples and data transformation rules.",
      estimatedEffort: "low",
      conditions: ["gap.category === 'moderate'", "gap.type === 'partial_attribute'"]
    },
    {
      templateId: "TMPL-003",
      gapType: "validation_rule_misalignment",
      timeframe: "short-term",
      category: "data_model",
      titleTemplate: "Update validation rule {rule_id} to align with {regulation}",
      descriptionTemplate: "Modify validation rule {rule_id} to reflect {regulation} mandatory/conditional logic. Flag {attribute_name} as mandatory when {condition}. Update validation rule documentation to reference {regulation} requirement.",
      estimatedEffort: "low",
      conditions: ["gap.type === 'validation_rule_misalignment'"]
    },
    {
      templateId: "TMPL-004",
      gapType: "strategic_positioning",
      timeframe: "long-term",
      category: "strategic",
      titleTemplate: "Position GS1 NL as {strategic_role} for {market_segment}",
      descriptionTemplate: "Establish GS1 NL as {strategic_role} for {market_segment}. Coordinate with {stakeholders} to launch {initiative}. Develop {deliverables} to support Dutch market compliance with {regulation}.",
      estimatedEffort: "high",
      conditions: ["gap.category === 'critical'", "gap.impact === 'high'"]
    }
  ];
  
  return templates.filter(template => 
    template.conditions.every(condition => evaluateCondition(condition, gap))
  );
}

// Template application
function applyTemplate(gap: Gap, template: RecommendationTemplate): Recommendation {
  // Extract variables from gap
  const variables = extractVariables(gap);
  
  // Replace placeholders in template
  const title = replacePlaceholders(template.titleTemplate, variables);
  const description = replacePlaceholders(template.descriptionTemplate, variables);
  
  return {
    recommendationId: generateRecommendationId(),
    timeframe: template.timeframe,
    category: template.category,
    title,
    description,
    relatedGaps: [gap.gapId],
    estimatedEffort: template.estimatedEffort,
    implementationStatus: "proposed",
    implementedInVersion: null
  };
}

// Recommendation prioritization
function prioritizeRecommendations(recommendations: Recommendation[]): Recommendation[] {
  return recommendations.sort((a, b) => {
    // Priority: short-term > medium-term > long-term
    const timeframePriority = { "short-term": 3, "medium-term": 2, "long-term": 1 };
    const timeframeDiff = timeframePriority[a.timeframe] - timeframePriority[b.timeframe];
    if (timeframeDiff !== 0) return -timeframeDiff;
    
    // Priority: low effort > medium effort > high effort
    const effortPriority = { "low": 3, "medium": 2, "high": 1 };
    const effortDiff = effortPriority[a.estimatedEffort] - effortPriority[b.estimatedEffort];
    if (effortDiff !== 0) return -effortDiff;
    
    // Priority: data_model > documentation > strategic
    const categoryPriority = { "data_model": 3, "documentation": 2, "strategic": 1 };
    return -(categoryPriority[a.category] - categoryPriority[b.category]);
  });
}
```

**Example Recommendation Templates:**

| Gap Type | Timeframe | Template |
|----------|-----------|----------|
| Missing attribute (critical) | Medium-term | "Add {attribute_name} attribute to {sector_model} sector model in v{next_version} release. This addresses {regulation} requirement {datapoint_id}." |
| Partial attribute (moderate) | Short-term | "Extend {existing_attribute} attribute in {sector_model} to include {missing_field}. Publish implementation guidance by {deadline}." |
| Validation rule misalignment | Short-term | "Update validation rule {rule_id} to align with {regulation} mandatory/conditional logic. Flag {attribute_name} as mandatory when {condition}." |
| Strategic positioning | Long-term | "Position GS1 NL as {strategic_role} for {market_segment}. Coordinate with {stakeholders} to establish {initiative}." |

### 4.3 Implementation Approach

**Phase 1: Template Library (2-3 days)**
1. Define recommendation templates for all gap types
2. Create template matching conditions
3. Store templates in `shared/recommendation-templates.json`

**Phase 2: Generation Engine (3-5 days)**
4. Implement recommendation generation algorithm
5. Create `server/generate-recommendations.ts` module
6. Validate generated recommendations against ISA v1.0 manual recommendations

**Phase 3: Implementation Tracking (2-3 days)**
7. Create `recommendation_tracking` database table
8. Build implementation status update API
9. Create tRPC procedures for recommendation queries

**Phase 4: Dashboard (3-5 days)**
10. Build recommendation dashboard UI
11. Display recommendations by timeframe/category
12. Track implementation status over advisory versions

**Total Estimated Effort:** 10-16 days

### 4.4 Benefits

✅ **Automated Generation:**  
Recommendations automatically generated from gap analysis, reducing manual effort

✅ **Consistent Recommendations:**  
All recommendations follow same templates, eliminating analyst bias

✅ **Implementation Tracking:**  
Track recommendation implementation status across advisory versions

✅ **Prioritization:**  
Recommendations automatically prioritized by timeframe, effort, and category

✅ **Stakeholder Visibility:**  
GS1 NL standards team can view recommendations and update implementation status

### 4.5 Next Steps (Not Implemented)

1. Define recommendation templates with stakeholder input
2. Implement recommendation generation engine
3. Validate generated recommendations against ISA v1.0
4. Build recommendation tracking database
5. Create recommendation dashboard UI

---

## 5. Interactive Dataset Explorer

### 5.1 Current State

**Problem:**  
ISA v1.0 dataset registry is a JSON file. Users cannot browse datasets, search attributes, or visualize coverage gaps without manual file inspection. This makes:
- **Poor discoverability:** Cannot find "Which GS1 NL attributes relate to packaging?"
- **No visualization:** Cannot see ESRS→GS1 NL mapping coverage at a glance
- **Manual export required:** Cannot export dataset subsets for analysis

**Current Dataset Access:**
```
data/metadata/dataset_registry.json (JSON file)
├── 9 datasets
├── 11,197 records
└── No UI for browsing/searching
```

### 5.2 Formalization Proposal

**Goal:**  
Create interactive dataset explorer UI enabling browse, search, visualize, and export functionality for ISA dataset registry.

**Proposed UI Features:**

#### 5.2.1 Dataset Overview Dashboard

**Purpose:** High-level view of ISA dataset registry

**Components:**
- Dataset cards (9 cards) with record counts, versions, publishers
- Total statistics (11,197 records, 9 datasets, registry v1.0.0)
- Quick links to dataset detail pages
- Registry lock status indicator

**Example Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ ISA Dataset Registry v1.0.0 (LOCKED)                        │
├─────────────────────────────────────────────────────────────┤
│ Total Datasets: 9 | Total Records: 11,197                   │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ │ ESRS         │ │ GS1 NL DIY   │ │ GS1 NL FMCG  │        │
│ │ Datapoints   │ │ Sector Model │ │ Sector Model │        │
│ │ 1,186 records│ │ 3,009 records│ │ 473 records  │        │
│ │ EFRAG        │ │ GS1 NL       │ │ GS1 NL       │        │
│ └──────────────┘ └──────────────┘ └──────────────┘        │
│ [View Details]   [View Details]   [View Details]           │
└─────────────────────────────────────────────────────────────┘
```

#### 5.2.2 Attribute Search Interface

**Purpose:** Full-text search across 3,667 GS1 NL attributes

**Features:**
- Search by keyword (e.g., "packaging", "carbon", "recycled")
- Filter by sector (DIY, FMCG, Healthcare)
- Filter by ESG relevance (packaging, sustainability, social)
- Filter by data type (text, numeric, boolean, enum)
- Display search results with attribute code, name, sector, data type

**Example Search Results:**
```
Search: "packaging"
Filters: Sector: All | ESG: Packaging | Data Type: All

Results: 107 attributes

┌─────────────────────────────────────────────────────────────┐
│ Attribute Code | Name | Sector | Data Type | ESG Relevance │
├─────────────────────────────────────────────────────────────┤
│ PACK_MATERIAL  | Packaging Material | DIY | Enum | Packaging │
│ PACK_WEIGHT    | Packaging Weight | DIY | Numeric | Packaging │
│ RECYCLABLE     | Recyclable | DIY | Boolean | Packaging │
└─────────────────────────────────────────────────────────────┘
```

#### 5.2.3 Mapping Visualization

**Purpose:** Visualize ESRS→GS1 NL mapping coverage

**Visualization Type:** Sankey diagram

**Features:**
- Left side: ESRS disclosure requirements (E1, E2, E5, S1, S2)
- Right side: GS1 NL sector models (DIY, FMCG, Healthcare)
- Flows: Mapping results color-coded by confidence (green=direct, yellow=partial, red=missing)
- Interactive drill-down to mapping details
- Export mapping results to CSV/JSON

**Example Sankey Diagram:**
```
ESRS E1 (Climate) ──────────────────────> GS1 NL DIY (Partial)
                  └────────────────────> GS1 NL FMCG (Missing)
                  └────────────────────> GS1 NL Healthcare (Missing)

ESRS E5 (Circular) ─────────────────────> GS1 NL DIY (Partial)
                   └────────────────────> GS1 NL FMCG (Partial)
                   └────────────────────> GS1 NL Healthcare (Missing)
```

#### 5.2.4 Gap Analysis Dashboard

**Purpose:** Display 7 gaps with category, impact, urgency

**Features:**
- Gap cards with category badge (critical/moderate/low-priority)
- Filter by category, impact, urgency
- Show affected regulations and sectors
- Link to recommendations for each gap
- Track gap status over advisory versions

**Example Gap Card:**
```
┌─────────────────────────────────────────────────────────────┐
│ [CRITICAL] Product Carbon Footprint                         │
├─────────────────────────────────────────────────────────────┤
│ Impact: High | Urgency: High                                │
│ Affected Regulations: ESRS E1-6                             │
│ Affected Sectors: DIY, FMCG, Healthcare                     │
│ Description: No GS1 NL attribute exists for PCF             │
│ Recommendation: Add PCF attribute in v3.1.34 release        │
│ Status: Proposed                                            │
└─────────────────────────────────────────────────────────────┘
```

#### 5.2.5 Dataset Lineage Viewer

**Purpose:** Display dataset provenance and change history

**Features:**
- Dataset metadata (version, release date, publisher, hash)
- Ingestion status (last ingested, target tables, refresh cadence)
- Download links to canonical files
- Dataset change history across registry versions
- Dependency graph (which datasets are used by which advisory)

**Example Lineage View:**
```
┌─────────────────────────────────────────────────────────────┐
│ Dataset: ESRS Datapoints (EFRAG IG3)                        │
├─────────────────────────────────────────────────────────────┤
│ Version: IG3-2024                                           │
│ Release Date: 2024-11-01                                    │
│ Publisher: EFRAG                                            │
│ SHA256: 90f15872c489786d86c445d8dc02e00783eb16ecd998d6e1f5a43ad48edd8be9 │
│ Records: 1,186                                              │
│ Ingestion Module: server/ingest-esrs-datapoints.ts         │
│ Target Tables: esrs_datapoints                             │
│ Refresh Cadence: Semiannual                                │
│ Last Ingested: 2025-12-13                                  │
│ Used By: ISA_ADVISORY_v1.0                                 │
│ [Download Canonical File] [View Change History]            │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Implementation Approach

**Phase 1: Dataset Overview (2-3 days)**
1. Create dataset overview dashboard UI
2. Display dataset cards with statistics
3. Add registry lock status indicator

**Phase 2: Attribute Search (3-5 days)**
4. Build attribute search API (tRPC procedure)
5. Implement search and filter logic
6. Create search results UI

**Phase 3: Mapping Visualization (5-7 days)**
7. Implement Sankey diagram visualization
8. Add interactive drill-down to mapping details
9. Create export functionality (CSV/JSON)

**Phase 4: Gap Dashboard (3-5 days)**
10. Build gap analysis dashboard UI
11. Display gap cards with filters
12. Link gaps to recommendations

**Phase 5: Dataset Lineage (3-5 days)**
13. Create dataset detail pages
14. Display lineage information
15. Add download links and change history

**Total Estimated Effort:** 16-25 days

### 5.4 Benefits

✅ **Improved Discoverability:**  
Users can browse and search 11,197 records without manual file inspection

✅ **Visual Coverage Analysis:**  
Sankey diagram shows ESRS→GS1 NL mapping coverage at a glance

✅ **Gap Visibility:**  
Gap dashboard makes critical gaps immediately visible to stakeholders

✅ **Dataset Traceability:**  
Lineage viewer provides complete provenance for every dataset

✅ **Export Functionality:**  
Users can export dataset subsets for external analysis

### 5.5 Next Steps (Not Implemented)

1. Design dataset explorer UI mockups
2. Build tRPC API procedures for dataset queries
3. Implement search and filter logic
4. Create Sankey diagram visualization
5. Build gap dashboard and dataset lineage viewer

---

## 6. Implementation Roadmap

### 6.1 Priority Ranking

Based on impact, effort, and dependencies, the recommended implementation order is:

| Priority | Target | Estimated Effort | Impact | Dependencies |
|----------|--------|------------------|--------|--------------|
| **1** | Advisory Output Schema | 9-15 days | High | None |
| **2** | Gap Taxonomy | 10-16 days | High | Advisory Output Schema |
| **3** | Confidence Scoring Logic | 9-14 days | Medium | Advisory Output Schema |
| **4** | Automated Recommendation Generation | 10-16 days | Medium | Gap Taxonomy |
| **5** | Interactive Dataset Explorer | 16-25 days | Medium | Advisory Output Schema |

**Total Estimated Effort:** 54-86 days (10-17 weeks)

### 6.2 Phased Rollout

**Phase 1: Structured Outputs (Weeks 1-4)**
- Implement Advisory Output Schema
- Generate dual outputs (Markdown + JSON)
- Store JSON advisory outputs in database

**Phase 2: Gap Management (Weeks 5-8)**
- Implement Gap Taxonomy
- Build gap classification algorithm
- Create gap tracking database

**Phase 3: Automated Analysis (Weeks 9-12)**
- Implement Confidence Scoring Logic
- Build confidence scoring API
- Integrate LLM embeddings for semantic similarity

**Phase 4: Recommendation Engine (Weeks 13-16)**
- Implement Automated Recommendation Generation
- Build recommendation tracking system
- Create recommendation dashboard

**Phase 5: User Interface (Weeks 17-20)**
- Implement Interactive Dataset Explorer
- Build dataset overview, search, visualization
- Create gap dashboard and lineage viewer

### 6.3 Success Metrics

**Advisory Output Schema:**
- ✅ 100% of ISA v1.0 mapping results converted to JSON
- ✅ Version comparison report generated (ISA v1.0 vs. v1.1)
- ✅ External API integration tested (GS1 NL standards dashboard)

**Gap Taxonomy:**
- ✅ 100% of ISA v1.0 gaps classified using formal rules
- ✅ Gap classification algorithm validated (>90% agreement with manual classification)
- ✅ Gap closure tracking operational (track status changes over versions)

**Confidence Scoring Logic:**
- ✅ Confidence scores generated for all 1,186 ESRS datapoints
- ✅ Scoring algorithm validated (>80% agreement with manual confidence levels)
- ✅ Confidence threshold tuning completed

**Automated Recommendation Generation:**
- ✅ Recommendations generated for all 7 gaps
- ✅ Generated recommendations validated (>80% match with manual recommendations)
- ✅ Implementation tracking operational

**Interactive Dataset Explorer:**
- ✅ All 11,197 records browsable via UI
- ✅ Attribute search operational (full-text search + filters)
- ✅ Sankey diagram visualization deployed
- ✅ Gap dashboard and lineage viewer operational

---

## 7. Constraints and Assumptions

### 7.1 Constraints

**No Implementation:**  
This document identifies formalization targets but does not implement them. All proposed schemas, algorithms, and UI features are **planning artifacts only**.

**No Code Changes:**  
No changes to ISA codebase, database schema, or UI are made as part of ISA v1.0 lock process.

**No New Datasets:**  
Formalization targets are based on ISA v1.0 dataset registry (9 datasets, 11,197 records). No new datasets are added.

**No Advisory Regeneration:**  
ISA v1.0 advisory report remains unchanged. Formalization targets do not modify advisory content.

### 7.2 Assumptions

**Stakeholder Buy-In:**  
Assumes GS1 NL stakeholders approve formalization approach and provide input on schemas, taxonomies, and templates.

**LLM API Access:**  
Assumes LLM embeddings API is available for semantic similarity calculation (confidence scoring).

**Database Schema Evolution:**  
Assumes database schema can be extended to store advisory outputs, gap classifications, confidence scores, and recommendations.

**UI Framework:**  
Assumes React + tRPC + Tailwind stack is sufficient for interactive dataset explorer UI.

**Effort Estimates:**  
Effort estimates assume single full-time developer with ISA domain knowledge. Actual effort may vary based on team size and experience.

---

## 8. Next Steps

### 8.1 Immediate Actions (Not Implemented)

1. **Review Formalization Targets:**  
   Present this document to GS1 NL stakeholders for feedback and approval

2. **Prioritize Implementation:**  
   Confirm priority ranking and phased rollout plan

3. **Define Success Criteria:**  
   Finalize success metrics for each formalization target

4. **Allocate Resources:**  
   Assign development team and timeline for Phase 1 (Advisory Output Schema)

### 8.2 Long-Term Actions (Future ISA Versions)

5. **Implement Advisory Output Schema (ISA v1.1):**  
   Generate dual outputs (Markdown + JSON) for ISA v1.1 advisory

6. **Implement Gap Taxonomy (ISA v1.1):**  
   Classify gaps using formal rules, track gap closure over versions

7. **Implement Confidence Scoring (ISA v1.2):**  
   Generate quantitative confidence scores for all mappings

8. **Implement Recommendation Engine (ISA v1.2):**  
   Automate recommendation generation from gap analysis

9. **Implement Dataset Explorer (ISA v2.0):**  
   Build interactive UI for browsing, searching, and visualizing datasets

---

## 9. References

**ISA v1.0 Lock Record:**  
- `/home/ubuntu/isa_web/docs/ISA_V1_LOCK_RECORD.md`

**ISA v1.0 Advisory Report:**  
- `/home/ubuntu/isa_web/docs/ISA_First_Advisory_Report_GS1NL.md`

**Dataset Registry v1.0:**  
- `/home/ubuntu/isa_web/data/metadata/dataset_registry_v1.0_FROZEN.json`

**Dataset Registry Lock:**  
- `/home/ubuntu/isa_web/data/metadata/REGISTRY_LOCK.md`

---

**Document Status:** FINAL  
**Implementation Status:** NOT IMPLEMENTED (planning only)  
**Next Review:** ISA v1.1 development kickoff

---

*This document identifies formalization targets for ISA v1.1+ development. No implementation is performed as part of ISA v1.0 lock process.*
