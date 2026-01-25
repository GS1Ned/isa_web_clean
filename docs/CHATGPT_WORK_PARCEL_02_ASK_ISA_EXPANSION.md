# ChatGPT Work Parcel #2: Ask ISA Query Library Expansion

**Date:** 15 December 2025  
**Priority:** HIGH (Phase 2.1 foundation)  
**Estimated Effort:** 3-4 hours  
**Dependencies:** Work Parcel #1 (7 documentation files) completed

---

## Objective

Expand the **Ask ISA Query Library** with 30 additional example queries across 6 categories, aligned to ISA Design Contract constraints and current advisory scope (v1.1).

---

## Context

The current `ASK_ISA_QUERY_LIBRARY.md` contains placeholder examples. We need a comprehensive query library that:

1. **Demonstrates allowed question types** (per ISA Design Contract)
2. **Covers all ISA advisory sections** (mappings, gaps, recommendations)
3. **Spans all 3 sectors** (DIY, FMCG, Healthcare)
4. **References real datasets** (from dataset registry v1.3.0)
5. **Shows version-aware queries** (v1.0 vs v1.1 comparisons)

---

## ISA Design Contract Constraints (CRITICAL)

### ✅ Allowed Question Types

1. **Gap queries** - "Which gaps exist for [regulation] in [sector]?"
2. **Mapping queries** - "Which GS1 NL attributes cover [ESRS datapoint]?"
3. **Version comparison queries** - "What changed between v1.0 and v1.1 for [topic]?"
4. **Dataset provenance queries** - "Which datasets underpin [recommendation]?"
5. **Recommendation queries** - "What are the short-term recommendations for [sector]?"
6. **Coverage queries** - "What is the coverage percentage for [ESRS topic] in [sector]?"

### ❌ Prohibited Question Types

1. **General ESG explanations** - "What is CSRD?" → Refuse, redirect to official sources
2. **Hypothetical questions** - "What should GS1 do about DPP?" → Refuse, cite existing recommendations only
3. **Speculative questions** - "Will GS1 NL adopt PCF in 2026?" → Refuse, cite regulatory change log only
4. **Out-of-scope questions** - "How do I calculate Scope 3 emissions?" → Refuse, not advisory scope
5. **Conversational prompts** - "Tell me about sustainability" → Refuse, not a query interface

---

## Current ISA Advisory Scope (v1.1)

### Sectors Covered
- **DIY/Garden/Pet** (DHZTD) - GS1 NL v3.1.33 (1,221 attributes)
- **FMCG** (Food/Health/Beauty) - GS1 NL v3.1.33.5 (1,224 attributes)
- **Healthcare** (ECHO) - GS1 NL v3.1.33 (1,222 attributes)

### Regulations Covered
- **CSRD** (Corporate Sustainability Reporting Directive)
- **ESRS** (European Sustainability Reporting Standards) - E1, E2, E3, E4, E5, S1
- **EUDR** (EU Deforestation Regulation)
- **CSDDD** (Corporate Sustainability Due Diligence Directive)

### Gap Status (v1.1)
- **Gap #1 (Product Carbon Footprint):** PARTIAL (GS1 EU solution exists, GS1 NL adoption pending)
- **Gap #2 (GS1 Digital Link Resolver):** COMPLETE (GS1 resolver standard v1.1.0 published)
- **Gap #3 (Digital Product Passport):** PARTIAL (GS1 provisional DPP standard published)
- **Gap #4 (Supplier Due Diligence):** MISSING
- **Gap #5 (Circularity Data):** MISSING

### Dataset Registry (v1.3.0)
- `esrs.datapoints.ig3` - ESRS datapoints (EFRAG IG3, Sep 2024)
- `gs1nl.benelux.diy_garden_pet.v3.1.33` - DIY sector model
- `gs1nl.benelux.fmcg.v3.1.33.5` - FMCG sector model
- `gs1nl.benelux.healthcare.v3.1.33` - Healthcare sector model
- `gs1eu.gdsn.carbon_footprint.v1.0` - GS1 EU PCF standard (Feb 2025)

---

## Deliverable: 30 Example Queries

Generate **30 example queries** distributed across **6 categories** (5 queries per category). Each query must include:

1. **Query text** (natural language question)
2. **Category** (Gap, Mapping, Version, Dataset, Recommendation, Coverage)
3. **Expected answer structure** (brief description of what ISA should return)
4. **Citations required** (advisory IDs, dataset IDs, sections)
5. **Sector scope** (DIY, FMCG, Healthcare, or All)

### Category Distribution

| Category | Count | Examples |
|----------|-------|----------|
| Gap queries | 5 | "Which gaps exist for EUDR in FMCG?" |
| Mapping queries | 5 | "Which GS1 NL attributes partially cover ESRS E1-6?" |
| Version comparison queries | 5 | "What changed between v1.0 and v1.1 for Gap #1?" |
| Dataset provenance queries | 5 | "Which datasets underpin the PCF recommendation?" |
| Recommendation queries | 5 | "What are the short-term recommendations for DIY?" |
| Coverage queries | 5 | "What is the coverage percentage for ESRS E1 in Healthcare?" |

---

## Output Format

Deliver queries in **Markdown table format** with the following columns:

```markdown
| # | Query Text | Category | Sector | Expected Answer | Citations Required |
|---|------------|----------|--------|-----------------|-------------------|
| 1 | Which gaps exist for EUDR in FMCG? | Gap | FMCG | List of gaps with status (MISSING/PARTIAL/COMPLETE) | GAP-001, GAP-004, dataset IDs |
| 2 | Which GS1 NL attributes partially cover ESRS E1-6? | Mapping | All | List of attributes with coverage % | MAP-E1-6-*, gs1nl.benelux.*.v3.1.33 |
```

---

## Quality Criteria

1. **Realistic queries** - Questions GS1 NL stakeholders would actually ask
2. **Sector balance** - At least 8 queries per sector (DIY, FMCG, Healthcare)
3. **Version awareness** - At least 5 queries referencing v1.0 vs v1.1 changes
4. **Dataset traceability** - All queries cite specific dataset IDs from registry v1.3.0
5. **No prohibited types** - Zero general ESG explanations or hypothetical questions

---

## Success Criteria

✅ 30 queries delivered in Markdown table format  
✅ All 6 categories covered (5 queries each)  
✅ All queries cite advisory IDs, dataset IDs, or sections  
✅ All queries aligned to ISA Design Contract constraints  
✅ All queries answerable from ISA v1.1 advisory scope

---

## Next Steps After Delivery

1. Manus will ingest the expanded query library into `/docs/ASK_ISA_QUERY_LIBRARY.md`
2. Queries will be used to validate "Ask ISA" RAG pipeline (Phase 2.1)
3. Queries will be tested with GS1 NL stakeholders for realism and clarity

---

## Reference Documents

- `/docs/ISA_First_Advisory_Report_GS1NL_v1.1_UPDATE.md` - Current advisory scope
- `/docs/ISA_DEVELOPMENT_ROADMAP_TO_FINAL_PRODUCT.md` - Phase 2.1 requirements
- `/docs/CHATGPT_INTEGRATION_CONTRACT.md` - Schema and taxonomy
- `/data/metadata/dataset_registry.json` - Dataset IDs and versions

---

**Deadline:** 48 hours  
**Contact:** Manus ISA Execution Agent
