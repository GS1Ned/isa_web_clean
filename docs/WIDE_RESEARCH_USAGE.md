# Wide Research Usage Guide for ISA

**Author:** Manus AI  
**Date:** December 17, 2025  
**Purpose:** Document when and how to use Manus Wide Research for parallel processing in ISA workflows

---

## Overview

Wide Research is Manus's parallel processing architecture that deploys hundreds of independent agents, each with its own fresh context window. This solves the context window limitation that causes traditional AI systems to degrade beyond 8-10 items.

**Key Insight:** In sequential processing, item #50 receives degraded attention because the context window is cluttered with items #1-49. Wide Research gives each item its own dedicated agent and full context window, ensuring uniform quality at any scale.

---

## When to Use Wide Research in ISA

### ✅ Use Wide Research For:

1. **Batch Ingestion (50+ items)**
   - Ingesting 50+ GS1 GDSN attributes
   - Processing 100+ ESRS datapoints
   - Importing multiple standards documents simultaneously

2. **Cross-Standard Mapping**
   - Mapping ISA schema to 20+ external standards in parallel
   - Generating ESRS-GS1 mappings for all 21 ESRS sub-topics
   - Creating sector-specific compliance mappings

3. **Batch News Enrichment (100+ articles)**
   - AI enrichment of 100+ news articles
   - Regulation tagging across large news batches
   - GS1 impact analysis for multiple articles

4. **Multi-Sector Advisory Generation**
   - Creating advisories for 5+ sectors simultaneously
   - Generating compliance reports for multiple industries
   - Comparative analysis across sectors

5. **Validation at Scale**
   - Validating 200+ product records against ISA schema
   - Checking 100+ regulations for compliance gaps
   - Quality assurance across large datasets

---

### ❌ Do NOT Use Wide Research For:

1. **Small batches (< 10 items)** - Sequential processing is faster
2. **Dependent tasks** - Items that require results from previous items
3. **Single complex items** - Deep analysis of one regulation or standard
4. **Interactive workflows** - Tasks requiring human feedback between items

---

## ISA-Specific Use Cases

### Use Case 1: Batch GS1 GDSN Attribute Ingestion

**Scenario:** Ingest all 50 GS1 GDSN attribute definitions from Excel file

**Prompt Template:**
```
Ingest all 50 GS1 GDSN attribute definitions from this Excel file and create structured schema.

For each attribute, extract:
- Attribute ID (e.g., "additionalTradeItemDescription")
- Data type (string, number, boolean, date)
- Definition (from column B)
- Business rules (from column C)
- ESRS mapping (if mentioned in notes)

Output format: JSON object with schema:
{
  "attributeId": "string",
  "dataType": "string",
  "definition": "string",
  "businessRules": "string",
  "esrsMapping": "string | null"
}
```

**Expected Outcome:**
- 10x faster than sequential processing
- Uniform quality (item #50 receives same depth as item #1)
- Consistent schema validation across all items

---

### Use Case 2: Multi-Regulation Compliance Mapping

**Scenario:** Map ISA core schema to 20 EU regulations simultaneously

**Prompt Template:**
```
Analyze how ISA core schema supports compliance with these 20 EU regulations:
[List of regulation names and CELEX numbers]

For each regulation, identify:
- Which ISA data fields are required for compliance
- Which GS1 standards are relevant
- Compliance gaps (missing data fields)
- Implementation complexity (low/medium/high)

Output format: JSON object with schema:
{
  "regulationName": "string",
  "celexNumber": "string",
  "requiredFields": ["string"],
  "relevantStandards": ["string"],
  "complianceGaps": ["string"],
  "implementationComplexity": "low" | "medium" | "high"
}
```

**Expected Outcome:**
- Parallel analysis of all 20 regulations
- No "lost-in-the-middle" issues
- Consistent evaluation criteria across all regulations

---

### Use Case 3: Batch News Enrichment

**Scenario:** AI enrichment of 100 news articles with regulation tags and GS1 impact analysis

**Prompt Template:**
```
Analyze these 100 news articles and enrich each with:
- Regulation tags (which EU regulations are mentioned or impacted)
- GS1 impact tags (which GS1 standards are relevant)
- Sector tags (which industries are affected)
- Impact level (low, medium, high, critical)
- Suggested actions (what should GS1 members do)

Output format: JSON object with schema:
{
  "newsId": "string",
  "regulationTags": ["string"],
  "gs1ImpactTags": ["string"],
  "sectorTags": ["string"],
  "impactLevel": "low" | "medium" | "high" | "critical",
  "suggestedActions": ["string"]
}
```

**Expected Outcome:**
- 10x faster enrichment
- Consistent tagging quality across all articles
- No degradation in later items

---

### Use Case 4: Multi-Sector Advisory Generation

**Scenario:** Generate sector-specific ESRS-GS1 compliance advisories for 5 sectors

**Prompt Template:**
```
Generate sector-specific ESRS-GS1 compliance advisories for:
- Textiles sector
- Healthcare sector
- Construction sector
- Packaging sector
- Food & Beverage sector

For each sector, analyze:
- Which ESRS requirements are most relevant
- Which GS1 standards are commonly used
- Sector-specific compliance challenges
- Recommended GS1 attributes for ESRS reporting

Output format: JSON object following ISA_ADVISORY schema with keys: textiles, healthcare, construction, packaging, food_beverage
```

**Expected Outcome:**
- 5x faster multi-sector generation
- Uniform quality across all sectors
- Consistent advisory structure

---

## Best Practices for ISA

### 1. Be Specific About Structure

**✅ Good:**
```
Create table with columns: standard_name, attribute_id, esrs_mapping, confidence_level, source_reference
```

**❌ Bad:**
```
Research these standards and create a report
```

---

### 2. Specify Scale Upfront

**✅ Good:**
```
Analyze all 100 GS1 GDSN attributes in this list
```

**❌ Bad:**
```
Analyze some attributes
```

---

### 3. Include Evaluation Criteria

**✅ Good:**
```
Rate each mapping on:
- Coverage (does it address all ESRS requirements?)
- Accuracy (is the mapping technically correct?)
- Source authority (is it from GS1 official documentation?)
- Implementation complexity (low/medium/high)
```

**❌ Bad:**
```
Compare these mappings
```

---

### 4. Ensure Consistency Across Parallel Agents

**Critical for ISA:** Regulatory context requires consistent terminology and schema validation.

**Include in each subtask prompt:**
- **Shared schema definitions** (e.g., "ESRS E1 refers to Climate Change sub-topic")
- **Terminology glossary** (e.g., "GTIN = Global Trade Item Number")
- **Validation rules** (e.g., "All datapoint IDs must match regex: ESRS [A-Z]\d+-\d+")

**Example:**
```
Shared Context (include in every subtask):
- ESRS = European Sustainability Reporting Standards
- GS1 = Global Standards 1 (supply chain standards organization)
- GDSN = Global Data Synchronization Network
- EPCIS = Electronic Product Code Information Services

Validation Rules:
- All ESRS datapoint IDs must match format: ESRS [A-Z]\d+-\d+ (e.g., ESRS E1-1)
- All GS1 attribute IDs must be camelCase (e.g., additionalTradeItemDescription)
- Confidence levels must be: high, medium, or low
```

---

### 5. Handle Dependencies Carefully

**Wide Research is best for independent items.** ISA may have dependencies between standards (e.g., ESRS E1 references ESRS E5).

**For dependent tasks:**
- Use sequential processing
- Or use hierarchical decomposition (process dependencies first, then use Wide Research for independent items)

**Example:**
```
Sequential Phase 1: Process ESRS E1-E5 (environmental standards)
Wide Research Phase 2: Map each of 5 environmental standards to GS1 attributes in parallel
```

---

## Implementation Checklist

### Before Using Wide Research:

- [ ] Confirm task involves 50+ independent items
- [ ] Define clear output schema (JSON structure)
- [ ] Specify evaluation criteria
- [ ] Include shared context and validation rules
- [ ] Identify any dependencies between items
- [ ] Prepare test set (10-20 items) for validation

### During Wide Research Execution:

- [ ] Monitor progress (check intermediate results)
- [ ] Validate sample outputs against schema
- [ ] Check for consistency across items
- [ ] Log any errors or anomalies

### After Wide Research Completion:

- [ ] Validate all outputs against schema
- [ ] Check for duplicate IDs or missing references
- [ ] Compare quality of first vs. last items (should be uniform)
- [ ] Measure performance (time saved vs. sequential processing)
- [ ] Document lessons learned

---

## Performance Expectations

### Sequential Processing (Baseline):
- **50 items:** ~25 minutes (30 seconds per item)
- **100 items:** ~50 minutes
- **Quality degradation:** Item #50 receives 30% less attention than item #1

### Wide Research (Parallel):
- **50 items:** ~3 minutes (all processed simultaneously)
- **100 items:** ~5 minutes
- **Quality:** Uniform (item #50 receives same attention as item #1)

**Speedup:** 10x faster for large batches

---

## Monitoring & Validation

### Quality Metrics to Track:

1. **Schema adherence:** % of outputs conforming to schema
2. **Consistency:** Variance in output quality across items
3. **Completeness:** % of items successfully processed
4. **Accuracy:** % of outputs validated against ground truth (if available)

### Red Flags:

- **High variance in output quality** → Review shared context and validation rules
- **Schema violations** → Clarify output format in prompt
- **Missing fields** → Add explicit requirements for all fields
- **Inconsistent terminology** → Strengthen terminology glossary

---

## Conclusion

Wide Research is a powerful tool for scaling ISA's data processing, mapping, and analysis workflows. By following these best practices—specifying structure, scale, and evaluation criteria upfront, and ensuring consistency across parallel agents—ISA can achieve 10x speedup while maintaining uniform quality at any scale.

**Key Takeaways:**
- Use for 50+ independent items
- Specify clear output schema and evaluation criteria
- Include shared context and validation rules
- Expect 10x speedup with uniform quality
- Monitor for consistency and schema adherence
