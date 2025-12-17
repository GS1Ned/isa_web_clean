# GS1 Artefacts Alignment Validation Report

**Date:** December 11, 2025  
**Purpose:** Validate consistency between ISA's ESG canonical model and existing GS1 artefacts  
**Status:** Validated

---

## Validation Scope

This report validates alignment between:

**New Knowledge Sources:**

1. GS1 Position Paper: "Accelerating value chain digitalisation" (2024)
2. GS1 DPP Provisional Application Standard (WR# 23-103, 09-Apr-2025)

**Existing GS1 Artefacts:**

1. GS1 General Specifications (GenSpecs)
2. GS1 System Architecture
3. GS1 Global Data Model (GDM)
4. EPCIS / CBV (Core Business Vocabulary)
5. GS1 NL Sector Data Models (Benelux FMCG, DIY/TD, DAS)

---

## Validation Findings

### 1. GS1 General Specifications

#### ✅ Consistent Areas

**GTIN Allocation Rules:**

- Position paper and DPP standard both reference GenSpecs section 4 (GTIN Management Standard)
- ISA's DPP identification model follows GTIN allocation rules for Made-to-Stock (AI 01) and Made-to-Order (AI 03)
- Uniqueness requirement ("once assigned, SHALL not be reused") aligns with GenSpecs GTIN Management Standard

**GLN Usage:**

- DPP standard specifies Party GLN for economic operators and GLN for facilities, consistent with GenSpecs section 4.5
- ISA's supply chain node model already uses GLN field, aligned with GenSpecs

**Application Identifiers:**

- DPP standard references GenSpecs section 3 for AI definitions
- ISA's identifier model uses canonical AI codes: (01), (03), (10), (21), (22), (242), (417)

**Data Carrier Specifications:**

- DPP standard references GenSpecs section 5.12 (Symbol Specification Tables)
- Symbol X-dimensions, quality specifications, and quiet zones align with GenSpecs

#### ⚠️ Pending Changes (from DPP Provisional Standard)

The DPP provisional standard includes multiple ACTION items indicating ongoing work requests to modify GenSpecs:

1. **Terminology Update:** Rename "Made-to-Order GTIN" to "Compound GTIN" to clarify that AI (03) is used with mandatory key qualifiers
2. **AI (22) Expansion:** Allow use of AI (22) for party change notifications (not requiring GTIN change but communicating minor changes at GTIN version level)
3. **Indicator Digit 9 Deprecation:** Deprecate use of Indicator digit 9 for Custom Trade Items, use AI (03) with Made-to-Order variation number for configurable products instead
4. **ASP Development:** Develop Application Standard Profiles (ASPs) for Fixed/Variable Measure Trade Items Scanned in General Distribution
5. **Extended Packaging Applications:** Update section 2.1.13.1 to allow use with product packaging, product documentation, or direct marking

**ISA Action:** Monitor GenSpecs updates and update ISA's terminology and guidance when these changes are ratified.

#### 🔍 Clarifications Needed

**GTIN-14 Restriction:** DPP standard states "GTIN-14 not permitted for retail point-of-sale." ISA should clarify this restriction in DPP readiness checker and warn users if they select GTIN-14 for retail products.

**AI (03) Retail Restriction:** DPP standard states "AI (03) has not been approved on products sold in the retail channel including online marketplaces." ISA should warn users about this limitation.

---

### 2. GS1 System Architecture

#### ✅ Consistent Areas

**Layered Data Model:**

- Position paper's value chain data layers (data generation → collection → sharing → processing → reporting) align with System Architecture's conceptual model
- ISA's approach of separating identification (GTIN/GLN) from data sharing (EPCIS) from master data (GDSN) aligns with System Architecture

**Digital Link as Bridge:**

- DPP standard's emphasis on GS1 Digital Link URI syntax as the carrier for DPP data aligns with System Architecture's vision of Digital Link as the bridge between physical and digital
- ISA should emphasize Digital Link in UX as the "universal key" to product information

**Standards Interoperability:**

- Position paper's recommendation to use GTIN, GLN, EPCIS, GDSN, GDM together aligns with System Architecture's integrated standards approach
- ISA's mapping tables (regulation↔standard, data category↔standard) support this interoperability view

#### 🔍 No Conflicts Detected

The position paper and DPP standard do not introduce concepts that conflict with System Architecture. They provide application-level guidance that sits on top of the architectural foundation.

---

### 3. GS1 Global Data Model (GDM)

#### ✅ Consistent Areas

**Attribute Definitions:**

- Position paper's Common Data Categories (product description, material composition, recyclability, hazardous substances) map to GDM attribute groups
- DPP standard's product information requirements align with GDM attributes

**Data Semantics:**

- GDM provides the canonical vocabulary for product attributes
- ISA's Common Data Categories should reference GDM attribute codes for precise semantic alignment

#### 🔄 Integration Opportunities

**Explicit Mapping:**
ISA should create explicit mappings between Common Data Categories and GDM attribute groups:

| Common Data Category              | GDM Attribute Group                                             |
| --------------------------------- | --------------------------------------------------------------- |
| Product Description & Information | Product Identification, Product Description                     |
| Recyclability & Circular Economy  | Packaging Marked Label Accreditation, Recyclability Information |
| Hazardous Substances              | Hazardous Materials, Chemical Composition                       |
| Origin and Sourcing               | Country of Origin, Sourcing Information                         |
| Energy Consumption                | Energy Efficiency, Power Consumption                            |

**Attribute Code Integration:**

- ISA should store GDM attribute codes in the `esg_data_categories` table
- ISA should provide GDM attribute lookup in regulation detail pages

#### 🔍 No Conflicts Detected

The position paper and DPP standard do not contradict GDM. They provide regulatory context for why certain GDM attributes are increasingly important.

---

### 4. EPCIS / CBV

#### ✅ Consistent Areas

**Event Model:**

- Position paper's Critical Tracking Events (CTEs) map directly to EPCIS event types:
  - Raw Material Sourcing → ObjectEvent (OBSERVE) or TransactionEvent
  - Production/Manufacturing → TransformationEvent or ObjectEvent (ADD)
  - Distribution/Shipping → ObjectEvent (OBSERVE) with bizStep=shipping
  - Receiving → ObjectEvent (OBSERVE) with bizStep=receiving
  - Retail Sale → ObjectEvent (OBSERVE) with bizStep=retail_selling
  - End of Life → ObjectEvent (OBSERVE) with bizStep=recycling/repairing/destroying

**Key Data Elements:**

- Position paper's KDEs (5W+1H framework) map to EPCIS event fields:
  - Who/Where → readPoint, bizLocation (GLN)
  - What (product) → epcList (GTIN)
  - What (batch/lot) → epcList with LGTIN (GTIN + AI 10)
  - What (serial) → epcList with SGTIN (GTIN + AI 21)
  - What (quantity) → quantityList
  - When → eventTime, eventTimeZoneOffset
  - Why → bizStep, disposition

**CBV Vocabulary:**

- Position paper's activity types (sourcing, manufacturing, shipping, receiving, retail_selling, recycling) align with CBV bizStep vocabulary
- ISA's CTE model should reference canonical CBV bizStep URIs

#### 🔄 Integration Opportunities

**CTE-to-EPCIS Template Mapping:**
ISA should provide EPCIS event templates for each CTE:

```json
{
  "cte": "cte_production_manufacturing",
  "epcisEventType": "TransformationEvent",
  "requiredFields": {
    "eventTime": "timestamp",
    "eventTimeZoneOffset": "+01:00",
    "bizStep": "urn:epcglobal:cbv:bizstep:commissioning",
    "bizLocation": "GLN of production facility",
    "inputEPCList": ["GTIN + AI(10) of raw materials"],
    "outputEPCList": ["GTIN + AI(10) of finished products"],
    "ilmd": {
      "productionDate": "AI(11)",
      "batchLot": "AI(10)"
    }
  }
}
```

**EPCIS Validation:**

- ISA should validate user-submitted EPCIS events against CTE/KDE requirements
- ISA should check that required KDEs are present in EPCIS event fields

#### 🔍 No Conflicts Detected

The position paper's CTE/KDE framework is a simplified, regulation-focused view of EPCIS. It does not contradict EPCIS/CBV but rather provides a use-case-specific interpretation.

---

### 5. GS1 NL Sector Data Models

#### ✅ Consistent Areas

**Sector-Specific Guidance:**

- GS1 NL sector models (Benelux FMCG, DIY/TD, DAS) provide additional granularity for specific industries
- Position paper's cross-regulation approach is sector-agnostic but compatible with sector models

**Identifier Usage:**

- Sector models specify GTIN/GLN usage patterns for specific product categories (e.g., variable measure items in FMCG, components in DIY)
- DPP standard's product category identification rules can be layered on top of sector models

#### 🔄 Integration Opportunities

**Sector-Specific DPP Guidance:**
ISA should provide sector-specific guidance for DPP implementation:

**FMCG Sector:**

- Variable measure items (fresh produce, meat, cheese) may require AI (310n) net weight in addition to GTIN
- Batch/lot tracking (AI 10) is standard practice for food safety, can be reused for DPP

**DIY/TD Sector:**

- Construction products are in DPP scope (EU 2024/3110)
- Components and parts may require hierarchical GTIN structure (parent product + component GTINs)
- Direct part marking may be required for durable products

**DAS (Drogisterij & Apotheek Sector):**

- Cosmetics and personal care products may fall under ESPR/DPP in future delegated acts
- Batch/lot tracking (AI 10) is standard for safety and recall, can be reused for DPP

**ISA Action:**

- Add sector filter to DPP readiness checker
- Provide sector-specific examples and best practices
- Map sector models to ISA's Common Data Categories

#### 🔍 No Conflicts Detected

Sector models provide additional detail but do not conflict with the position paper or DPP standard.

---

## Tensions & Contradictions

### None Detected

No material contradictions were found between the position paper, DPP provisional standard, and existing GS1 artefacts. The new documents provide:

1. **Regulatory Context:** Why ESG regulations drive demand for GS1 standards
2. **Application Guidance:** How to apply GS1 standards to specific regulations (ESPR/DPP)
3. **Cross-Regulation View:** How to harmonize data collection across multiple regulations

These perspectives complement rather than contradict existing GS1 artefacts.

### Minor Inconsistencies

**Terminology Variations:**

- "Trade item" (GenSpecs) vs "Product" (DPP standard, position paper)
  - **Resolution:** ISA should use "product" in user-facing content, "trade item" in technical documentation
- "Economic operator" (DPP standard) vs "Party" (GenSpecs)
  - **Resolution:** ISA should use "economic operator" in regulatory context, "party" in GS1 standards context

**Provisional Status:**

- DPP standard is provisional (not ratified), subject to change
  - **Resolution:** ISA should clearly label DPP guidance as "provisional" and track updates

---

## Recommendations for ISA

### Immediate Actions

1. **Update Regulation Detail Pages:**
   - Add "Common Data Categories" section showing which categories each regulation requires
   - Add "Critical Tracking Events" section showing which CTEs are relevant for compliance
   - Add "GS1 Standards" section showing how GTIN, GLN, EPCIS, GDSN enable compliance

2. **Create DPP Readiness Checker:**
   - Input: product category
   - Output: in-scope determination, required identifiers, required data carriers, delegated act status
   - Warnings: GTIN-14 restriction for retail, AI (03) restriction for retail channel

3. **Create Traceability Planner:**
   - Interactive tool to map product flows and identify CTEs
   - For each CTE, show required KDEs and applicable GS1 standards
   - Generate EPCIS event templates

4. **Update Landing Page:**
   - Emphasize cross-regulation harmonization narrative
   - Highlight efficiency gains from unified data collection
   - Show value beyond compliance (decision-making, future-proofing)

### Future Enhancements

1. **GDM Integration:**
   - Create explicit mappings between Common Data Categories and GDM attribute groups
   - Provide GDM attribute lookup in regulation detail pages
   - Store GDM attribute codes in `esg_data_categories` table

2. **Sector-Specific Guidance:**
   - Add sector filter to DPP readiness checker
   - Provide sector-specific examples (FMCG, DIY/TD, DAS)
   - Map sector models to Common Data Categories

3. **EPCIS Validation:**
   - Validate user-submitted EPCIS events against CTE/KDE requirements
   - Provide EPCIS event templates for each CTE
   - Check that required KDEs are present in EPCIS event fields

4. **Digital Link URI Builder:**
   - Interactive tool to construct proper GS1 Digital Link URIs
   - Validate identifier syntax
   - Generate QR Code / Data Matrix previews
   - Provide symbol specification guidance

5. **GenSpecs Update Tracking:**
   - Monitor GenSpecs updates related to DPP provisional standard
   - Update ISA terminology when "Made-to-Order GTIN" → "Compound GTIN" change is ratified
   - Update guidance when AI (22) expansion is approved
   - Update guidance when ASPs for Fixed/Variable Measure Trade Items are published

---

## Conclusion

The GS1 position paper and DPP provisional standard are **fully consistent** with existing GS1 artefacts (General Specifications, System Architecture, GDM, EPCIS/CBV, sector models). They provide:

1. **Regulatory Context:** Explaining why ESG regulations drive demand for GS1 standards
2. **Application Guidance:** Showing how to apply GS1 standards to specific regulations
3. **Cross-Regulation Harmonization:** Demonstrating how to avoid duplicated efforts

ISA's canonical model successfully integrates this new knowledge while maintaining alignment with the broader GS1 standards ecosystem. The recommended actions will enhance ISA's value proposition by providing concrete, regulation-specific guidance grounded in official GS1 standards.

**Validation Status:** ✅ **APPROVED** - No material conflicts detected. ISA can proceed with implementation.
