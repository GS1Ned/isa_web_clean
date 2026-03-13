# ISA External References

**Purpose:** Lightweight summaries of heavy reference materials with canonical URLs  
**Date:** December 10, 2025  
**Status:** Replaces ~20MB of PDFs in /upload with structured summaries

---

## EFRAG Implementation Guidance (ESG/ESRS)

### IG1: Materiality Assessment

**Title:** EFRAG Implementation Guidance 1 - Materiality Assessment  
**Version:** Final (December 2023)  
**Size:** 1.6MB PDF  
**Canonical URL:** https://www.efrag.org/lab6

**Relevance for ISA:**

- Explains double materiality (impact + financial materiality)
- Guides companies on determining which ESRS datapoints are material
- Critical for understanding which ESG regulations trigger which reporting requirements

**Key Concepts:**

- **Impact Materiality:** Sustainability matters affecting people and environment
- **Financial Materiality:** Sustainability matters affecting company's financial performance
- **Material Topics:** Topics companies must report on based on materiality assessment
- **Stakeholder Engagement:** Process for identifying material topics

**ISA Integration:**

- Informs regulation → ESRS datapoint mappings
- Helps explain why certain datapoints are mandatory vs. voluntary
- Supports Ask ISA responses about materiality

**Local Copy:** `/home/ubuntu/upload/IG1MaterialityAssessment_final.pdf`

---

### IG2: Value Chain

**Title:** EFRAG Implementation Guidance 2 - Value Chain  
**Version:** Final (December 2023)  
**Size:** 1.4MB PDF  
**Canonical URL:** https://www.efrag.org/lab6

**Relevance for ISA:**

- Defines upstream and downstream value chain boundaries
- Explains Scope 3 emissions reporting requirements
- Critical for understanding GS1 traceability standards' role in ESG compliance

**Key Concepts:**

- **Upstream Value Chain:** Suppliers, raw materials, logistics
- **Downstream Value Chain:** Distribution, retail, end-of-life
- **Scope 3 Emissions:** Indirect emissions across value chain
- **Data Collection:** How to gather value chain data for ESRS reporting

**ISA Integration:**

- Maps to GS1 EPCIS (traceability events)
- Links to GS1 standards for supply chain visibility
- Supports News Hub coverage of value chain regulations

**Local Copy:** `/home/ubuntu/upload/EFRAGIG2ValueChain_final.pdf`

---

### IG3: List of ESRS Datapoints - Explanatory Note

**Title:** EFRAG Implementation Guidance 3 - List of ESRS Datapoints (Explanatory Note)  
**Version:** Final (December 2023)  
**Size:** 682KB PDF  
**Canonical URL:** https://www.efrag.org/lab6

**Relevance for ISA:**

- Explains structure and logic of ESRS datapoint list
- Clarifies mandatory vs. voluntary datapoints
- Critical for ISA's regulation → ESRS datapoint mappings

**Key Concepts:**

- **Datapoint Structure:** Disclosure Requirement → Datapoint → Sub-datapoint
- **Mandatory Datapoints:** Required for all companies (e.g., E1-1 GHG emissions)
- **Voluntary Datapoints:** Required only if material (e.g., E2 water consumption)
- **Phase-in Provisions:** Delayed implementation for certain datapoints

**ISA Integration:**

- Core reference for `esrs_datapoints` table (1,184 records)
- Informs `regulation_esrs_mappings` table (449 mappings)
- Supports Ask ISA knowledge base

**Local Copy:** `/home/ubuntu/upload/efrag-ig-3-list-of-esrs-data-points---explanatory-note.pdf`

---

### IG3: List of ESRS Datapoints - Feedback Statement

**Title:** EFRAG IG3 Feedback Statement  
**Version:** Final (December 2023)  
**Size:** 662KB PDF  
**Canonical URL:** https://www.efrag.org/lab6

**Relevance for ISA:**

- Documents stakeholder feedback on IG3
- Explains changes made to datapoint list based on feedback
- Provides context for datapoint definitions

**Key Concepts:**

- Stakeholder concerns about datapoint complexity
- Clarifications on datapoint definitions
- Changes to mandatory/voluntary classification

**ISA Integration:**

- Background context for ESRS datapoint structure
- Helps explain datapoint evolution over time

**Local Copy:** `/home/ubuntu/upload/efrag-ig-3-list-of-esrs-data-points---feedback-statement.pdf`

---

### IG3: Addendum - Technical Adjustments

**Title:** Addendum to IG3 - Technical Adjustments to IG3 List of Datapoints  
**Version:** December 20, 2024 (edited January 7, 2025)  
**Size:** 289KB PDF  
**Canonical URL:** https://www.efrag.org/lab6

**Relevance for ISA:**

- Latest updates to ESRS datapoint list
- Technical corrections and clarifications
- Important for keeping ISA's ESRS data current

**Key Concepts:**

- Datapoint definition corrections
- New datapoints added
- Deprecated datapoints removed

**ISA Integration:**

- Should inform future updates to `esrs_datapoints` table
- News Hub should track these technical changes

**Local Copy:** `/home/ubuntu/upload/2024-12-20AddendumtoIG3-TechnicaladjustmentstoIG3ListofDatapoints-cleanincl.editon7Jan2025.pdf`

---

## GS1 Netherlands Data Attribute System (DAS)

### GS1 DAS Attribute Explanation (English)

**Title:** GS1 DAS - Explanation on Attributes (Version 1.2.3)  
**Version:** August 2025  
**Size:** 2.2MB PDF  
**Language:** English  
**Canonical URL:** GS1 Netherlands member portal (authentication required)

**Relevance for ISA:**

- Comprehensive guide to GS1 NL Data Attribute System
- Explains all attributes in Benelux FMCG and DHZTD data models
- Critical for mapping ESG regulations to GS1 attributes

**Key Concepts:**

- **Data Attributes:** Standardized product information fields (e.g., GTIN, brand, net content)
- **Attribute Groups:** Logical groupings (identification, classification, measurements, etc.)
- **Validation Rules:** Data quality requirements for each attribute
- **Sector Applicability:** Which attributes apply to which sectors (FMCG, healthcare, textiles)

**ISA Integration:**

- Informs `gs1_standards` table (60 standards)
- Maps to `regulation_gs1_mappings` table
- Supports Ask ISA responses about GS1 attributes
- Critical for News Hub GS1 impact analysis

**Local Copy:** `/home/ubuntu/upload/202311-ld-gs1das-explanation-on-attributes-123_aug25.pdf`

---

### GS1 DAS Toelichting op Velden (Dutch)

**Title:** GS1 DAS - Toelichting op Velden (Versie 1.2.3)  
**Version:** Augustus 2025  
**Size:** 1.7MB PDF  
**Language:** Dutch  
**Canonical URL:** GS1 Netherlands member portal (authentication required)

**Relevance for ISA:**

- Dutch version of GS1 DAS attribute explanation
- Same content as English version, for Dutch-speaking users

**ISA Integration:**

- Reference for Dutch GS1 NL users
- Supports multi-language future roadmap

**Local Copy:** `/home/ubuntu/upload/202311-ld-gs1das-toelichting-op-velden-123_aug25.pdf`

---

## GS1 Benelux DHZTD (Duurzame Huishoudelijke Zorg en Textiel Detailhandel)

### DHZTD GDSN Industry Agreements

**Title:** DHZTD GDSN Industry Agreements  
**Version:** 3.1.19  
**Size:** 1.6MB PDF  
**Canonical URL:** GS1 Netherlands (https://www.gs1.nl)

**Relevance for ISA:**

- Industry agreements for sustainable household care and textile retail
- Defines data exchange standards between suppliers and retailers
- Links GS1 standards to Dutch sustainability initiatives

**Key Concepts:**

- **GDSN:** Global Data Synchronization Network
- **Industry Agreements:** Sector-specific data requirements
- **Sustainability Attributes:** Environmental and social product data
- **Data Quality:** Validation rules for DHZTD data model

**ISA Integration:**

- Connects to `dutch_initiatives` table (Green Deal Textiel, etc.)
- Maps to GS1 Benelux data models
- Supports News Hub coverage of Dutch initiatives

**Local Copy:** `/home/ubuntu/upload/DHZTD_GDSN_IndustryAgreements_3.1.19.pdf`

---

## Global Product Classification (GPC)

### GPC in a Nutshell

**Title:** GPC in a Nutshell  
**Version:** June 2024  
**Size:** 292KB PDF  
**Canonical URL:** https://www.gs1.org/standards/gpc

**Relevance for ISA:**

- Introduction to GS1 Global Product Classification
- Explains GPC hierarchy (Segment → Family → Class → Brick)
- Critical for understanding product categorization in ESG context

**Key Concepts:**

- **GPC Hierarchy:** 4-level classification system
- **GPC Codes:** 8-digit codes for product categories
- **Sector Coverage:** All product categories (food, non-food, services)
- **Use Cases:** Master data management, product search, regulatory compliance

**ISA Integration:**

- Potential future integration for product-level ESG analysis
- Supports sector-specific regulation mapping
- Relevant for News Hub sector tagging

**Local Copy:** `/home/ubuntu/upload/gpc-in-a-nutshell_jun24-def.pdf`

---

## GS1 Standards Release Notes

### GS1 November 2025 Publication Release Notes

**Title:** Release Notes for November 2025 Publication  
**Version:** November 2025  
**Size:** 347KB PDF  
**Canonical URL:** https://www.gs1.org/standards/release-notes

**Relevance for ISA:**

- Latest changes to GS1 standards
- New Application Identifiers (AIs)
- Updates to General Specifications, Digital Link, EPCIS, etc.

**Key Concepts:**

- **New AIs:** Application Identifiers for new data elements
- **Standard Updates:** Changes to existing GS1 standards
- **Deprecations:** Retired or superseded standards
- **Effective Dates:** When changes take effect

**ISA Integration:**

- News Hub should track GS1 standard changes
- Ask ISA should reference latest standard versions
- Regulation mappings may need updates based on new AIs

**Local Copy:** `/home/ubuntu/upload/ReleasenotesNovember2025Publication.pdf`

---

## Summary Statistics

**Total Reference Materials:** 13 PDFs  
**Total Size:** ~20MB  
**Storage Location:** `/home/ubuntu/upload/` (outside ISA project tree)  
**Status:** Summarized above, PDFs retained in /upload as backup

**Canonical Sources:**

- EFRAG: https://www.efrag.org/lab6
- GS1 Global: https://www.gs1.org/standards
- GS1 Netherlands: https://www.gs1.nl (member portal)

**ISA Integration:**

- All materials inform ISA's ESG → GS1 mapping logic
- Critical for Ask ISA knowledge base
- Support News Hub regulation and GS1 impact analysis

---

## Usage Guidelines

**For ISA Development:**

1. Consult this document for quick reference
2. Access local PDFs in /upload only when detailed information is needed
3. Prefer canonical URLs for latest versions
4. Update this document when new versions are released

**For GS1 Artefact Acquisition:**

- Use canonical URLs to obtain latest versions
- Check EFRAG and GS1 websites for updates
- Document new artefacts in this file
