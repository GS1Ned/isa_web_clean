# Ask ISA query library

## Purpose

This document provides example queries for Ask ISA (ISA query interface). Ask ISA is read-only and must answer using locked advisory artefacts and the frozen dataset registry.

## Allowed query types

- Gap queries: "Which gaps exist for [regulation] in [sector]?"
- Mapping queries: "Which GS1 NL attributes cover [ESRS datapoint]?"
- Version comparison queries: "What changed between v1.0 and v1.1 for [topic]?"
- Dataset provenance queries: "Which datasets underpin [recommendation]?"
- Recommendation queries: "What are the short-term recommendations for [sector]?"
- Coverage queries: "What is the coverage percentage for [ESRS topic] in [sector]?"

## Forbidden query types

- General ESG explanations: "What is CSRD?" → Refuse, redirect to official sources
- Hypothetical questions: "What should GS1 do about DPP?" → Refuse, cite existing recommendations only
- Speculative questions: "Will GS1 NL adopt PCF in 2026?" → Refuse, cite regulatory change log only
- Out-of-scope questions: "How do I calculate Scope 3 emissions?" → Refuse, not advisory scope
- Conversational prompts: "Tell me about sustainability" → Refuse, not a query interface

## Query examples (30 queries across 6 categories)

| # | Query text | Category | Sector | Expected answer | Citations required |
|---|------------|----------|--------|-----------------|-------------------|
| 1 | Which gaps exist for CSRD (Corporate Sustainability Reporting Directive) and ESRS (European Sustainability Reporting Standards) in DIY? | Gap | DIY | List gaps relevant to CSRD/ESRS for DIY with status (MISSING/PARTIAL/COMPLETE) and brief rationale | ISA_ADVISORY_v1.1; GAP-001..GAP-005; gs1nl.benelux.diy_garden_pet.v3.1.33; esrs.datapoints.ig3 |
| 2 | Which gaps exist for EUDR (EU Deforestation Regulation) in FMCG? | Gap | FMCG | List EUDR-related gaps for FMCG with status and cited evidence | ISA_ADVISORY_v1.1; GAP-005; gs1nl.benelux.fmcg.v3.1.33.5; esrs.datapoints.ig3 |
| 3 | What is the status of Gap #1 (Product Carbon Footprint) in healthcare? | Gap | Healthcare | Gap status with supporting datasets and any referenced recommendation IDs | ISA_ADVISORY_v1.1; GAP-001; REC-*; gs1eu.gdsn.carbon_footprint.v1.0; gs1nl.benelux.healthcare.v3.1.33 |
| 4 | Which critical gaps remain MISSING across all sectors in ISA v1.1? | Gap | All | Cross-sector list of MISSING gaps, including severity and which sectors are affected | ISA_ADVISORY_v1.1; GAP-004; GAP-005; gs1nl.benelux.*.v3.1.33* |
| 5 | Which gaps are PARTIAL in DIY and what evidence supports the PARTIAL classification? | Gap | DIY | List PARTIAL gaps in DIY with evidence references and dataset provenance | ISA_ADVISORY_v1.1; GAP-*; gs1nl.benelux.diy_garden_pet.v3.1.33; gs1eu.gdsn.carbon_footprint.v1.0 |
| 6 | Which GS1 Netherlands attributes cover ESRS E1 (Climate change) datapoints for DIY and where are the gaps? | Mapping | DIY | Attribute list grouped by mapping status (direct/partial/missing) with mapping IDs and coverage notes | ISA_ADVISORY_v1.1; MAP-*; esrs.datapoints.ig3; gs1nl.benelux.diy_garden_pet.v3.1.33 |
| 7 | Which GS1 Netherlands attributes partially cover ESRS E1-6 (Gross Scopes 1, 2 and 3 emissions) for FMCG? | Mapping | FMCG | List of partially covering attributes with mapping IDs and notes on missing elements | ISA_ADVISORY_v1.1; MAP-E1-6-*; esrs.datapoints.ig3; gs1nl.benelux.fmcg.v3.1.33.5 |
| 8 | Which healthcare attributes map to deforestation due diligence requirements relevant to EUDR? | Mapping | Healthcare | Mapping results linking EUDR-related requirements to healthcare attributes, noting missing coverage | ISA_ADVISORY_v1.1; MAP-*; GAP-005; gs1nl.benelux.healthcare.v3.1.33 |
| 9 | Which GS1 Netherlands attributes are referenced by the Digital Product Passport (DPP) gap analysis for DIY? | Mapping | DIY | Mapping list for DPP-related coverage with mapping IDs, gap references and dataset provenance | ISA_ADVISORY_v1.1; GAP-003; MAP-*; eu.dpp.identification_rules; gs1nl.benelux.diy_garden_pet.v3.1.33 |
| 10 | Which mappings exist for supplier due diligence and which are missing for FMCG? | Mapping | FMCG | Mapping coverage summary for supplier due diligence, highlighting missing mappings | ISA_ADVISORY_v1.1; GAP-004; MAP-*; gs1nl.benelux.fmcg.v3.1.33.5 |
| 11 | What changed between ISA v1.0 and v1.1 for Gap #1 (Product Carbon Footprint)? | Version comparison | All | Diff summary of Gap #1 status and supporting evidence and dataset additions | ISA_ADVISORY_v1.0; ISA_ADVISORY_v1.1; GAP-001; gs1eu.gdsn.carbon_footprint.v1.0 |
| 12 | Which gaps were upgraded from MISSING to PARTIAL in v1.1 and why? | Version comparison | All | List upgraded gaps, old vs new status, cited reason and datasets | ISA_ADVISORY_v1.0; ISA_ADVISORY_v1.1; GAP-*; dataset registry v1.3.0 |
| 13 | What new dataset entries were introduced in dataset registry v1.3.0 to support v1.1? | Version comparison | All | Dataset IDs added and why they matter to coverage or recommendations | dataset registry v1.3.0; gs1eu.gdsn.carbon_footprint.v1.0; ISA_ADVISORY_v1.1 |
| 14 | What changed between v1.0 and v1.1 in recommendations for FMCG regarding Product Carbon Footprint? | Version comparison | FMCG | Recommendation diffs, including new or updated recommendation IDs and referenced datasets | ISA_ADVISORY_v1.0; ISA_ADVISORY_v1.1; REC-*; gs1nl.benelux.fmcg.v3.1.33.5; gs1eu.gdsn.carbon_footprint.v1.0 |
| 15 | What changed between v1.0 and v1.1 in overall mapping coverage for DIY? | Version comparison | DIY | Coverage delta with cited mapping counts and affected topics | ISA_ADVISORY_v1.0; ISA_ADVISORY_v1.1; MAP-*; gs1nl.benelux.diy_garden_pet.v3.1.33 |
| 16 | Which datasets underpin the Product Carbon Footprint recommendations for DIY? | Dataset provenance | DIY | Dataset list with dataset IDs, versions and how each supports the recommendation | ISA_ADVISORY_v1.1; REC-*; gs1eu.gdsn.carbon_footprint.v1.0; gdsn.current.v3.1.32; gs1nl.benelux.diy_garden_pet.v3.1.33 |
| 17 | What is the authoritative source of ESRS E1 datapoint definitions used in the advisory? | Dataset provenance | All | Identify dataset ID, version and publication date for ESRS datapoints source | dataset registry v1.3.0; esrs.datapoints.ig3; ISA_ADVISORY_v1.1 |
| 18 | Which GS1 Netherlands sector model version is used for healthcare analysis and how many attributes were evaluated? | Dataset provenance | Healthcare | Sector model dataset ID, version, record counts and where used in advisory | dataset registry v1.3.0; gs1nl.benelux.healthcare.v3.1.33; ISA_ADVISORY_v1.1 |
| 19 | Which datasets underpin Gap #5 (Circularity data) assessment in FMCG? | Dataset provenance | FMCG | Dataset list used, plus identification of missing datasets if stated in advisory | ISA_ADVISORY_v1.1; GAP-005; gs1nl.benelux.fmcg.v3.1.33.5; gs1nl.benelux.validation_rules.v3.1.33.4 |
| 20 | Which datasets are referenced by the Digital Product Passport gap and recommendations for healthcare? | Dataset provenance | Healthcare | Dataset IDs and how each is referenced by GAP-003 and related REC entries | ISA_ADVISORY_v1.1; GAP-003; REC-*; eu.dpp.identification_rules; gs1nl.benelux.healthcare.v3.1.33 |
| 21 | What are the short-term recommendations for DIY for 2025–2026? | Recommendation | DIY | List short-term recommendations with IDs, rationale and dataset provenance | ISA_ADVISORY_v1.1; REC-* (timeframe=short); gs1nl.benelux.diy_garden_pet.v3.1.33; dataset registry v1.3.0 |
| 22 | What are the short-term recommendations for FMCG to address Product Carbon Footprint? | Recommendation | FMCG | Recommendations focused on PCF, including any dependency on GS1 EU publications | ISA_ADVISORY_v1.1; REC-*; GAP-001; gs1eu.gdsn.carbon_footprint.v1.0 |
| 23 | Which recommendations require adoption or alignment with GS1 in Europe publications for healthcare? | Recommendation | Healthcare | Recommendation list where provenance includes GS1 EU dataset IDs | ISA_ADVISORY_v1.1; REC-*; gs1eu.gdsn.carbon_footprint.v1.0 |
| 24 | What are the medium-term recommendations for healthcare to address supplier due diligence? | Recommendation | Healthcare | Medium-term recommendation list tied to supplier due diligence gap | ISA_ADVISORY_v1.1; REC-* (timeframe=medium); GAP-004; gs1nl.benelux.healthcare.v3.1.33 |
| 25 | What are the long-term recommendations for FMCG to close Circularity data gaps? | Recommendation | FMCG | Long-term recommendation list linked to circularity gap with cited dataset provenance | ISA_ADVISORY_v1.1; REC-* (timeframe=long); GAP-005; gs1nl.benelux.fmcg.v3.1.33.5 |
| 26 | What is the coverage percentage for ESRS E1 (Climate change) in DIY and which topics drive the missing coverage? | Coverage | DIY | Coverage percentage plus top missing subtopics and referenced gap IDs | ISA_ADVISORY_v1.1; MAP-*; GAP-*; esrs.datapoints.ig3; gs1nl.benelux.diy_garden_pet.v3.1.33 |
| 27 | What is the coverage percentage for EUDR-related requirements in FMCG and which GS1 attributes contribute to coverage? | Coverage | FMCG | Coverage percentage for EUDR scope with attribute contributors and missing areas | ISA_ADVISORY_v1.1; MAP-*; GAP-005; gs1nl.benelux.fmcg.v3.1.33.5 |
| 28 | Which ESRS topic has the highest coverage in healthcare in ISA v1.1? | Coverage | Healthcare | Identify top-covered ESRS topic with cited mapping counts | ISA_ADVISORY_v1.1; MAP-*; esrs.datapoints.ig3; gs1nl.benelux.healthcare.v3.1.33 |
| 29 | What percentage of Digital Product Passport identification requirements are covered in DIY and what remains missing? | Coverage | DIY | Coverage percentage for DPP identification scope with remaining missing items and gaps | ISA_ADVISORY_v1.1; GAP-003; MAP-*; eu.dpp.identification_rules; gs1nl.benelux.diy_garden_pet.v3.1.33 |
| 30 | What is the coverage percentage for supplier due diligence in healthcare and which gaps explain the missing coverage? | Coverage | Healthcare | Coverage percentage and explanation of missing coverage citing GAP-004 and any related mappings | ISA_ADVISORY_v1.1; GAP-004; MAP-*; gs1nl.benelux.healthcare.v3.1.33 |

## Validation summary

**Category distribution:** 5 gap, 5 mapping, 5 version comparison, 5 dataset provenance, 5 recommendation, 5 coverage (30 total)

**Sector balance:** DIY (10 queries), FMCG (10 queries), Healthcare (8 queries), All (2 queries)

**Version awareness:** 5 queries explicitly reference v1.0 vs v1.1 changes (#11-#15)

**Prohibited question types:** None included (no general ESG explanations, hypotheticals, speculation, out-of-scope or conversational prompts)

## Expected answer format

Every answer must cite:
- Advisory ID and version
- Dataset registry version
- Any dataset IDs referenced
- Source artefact hashes when available

Example citation block:

```
Advisory: ISA_ADVISORY_v1.1 (v1.1.0)
Dataset registry: dataset_registry_v1.3.0_FROZEN.json (v1.3.0)
Datasets referenced: esrs.datapoints.ig3, gs1nl.benelux.diy_garden_pet.v3.1.33
```

## Usage notes

- These queries are designed for Phase 2.1 (Ask ISA Query Interface MVP, Q3 2025)
- Queries will validate RAG pipeline design and citation extraction
- Queries will be tested with GS1 NL stakeholders for realism and clarity
- All queries are answerable from ISA v1.1 advisory scope and dataset registry v1.3.0
