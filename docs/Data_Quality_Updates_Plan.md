# ISA Data Quality Enhancement Plan

**Based on Colleague Report Insights**  
**Date:** November 29, 2025

## Executive Summary

This document outlines specific data quality improvements for ISA's regulation database, informed by two comprehensive colleague reports on EU ESG regulations. The updates focus on **timeline accuracy**, **description enhancement**, and **GS1 mapping rationale improvements**.

---

## Part 1: Regulation Timeline Updates

### Critical Deadline Corrections

#### 1. EUDR (EU Deforestation Regulation)

**Current Status:** Entry into force: June 30, 2026  
**Correction Needed:** Two-phase implementation

**Updated Timeline:**

- **December 30, 2026:** Large operators (>500 employees, >€150M turnover)
- **June 30, 2027:** SMEs and smaller operators
- **Key Context:** 12-month delay announced October 2024 due to implementation challenges

**Rationale from Report:**

> "The EUDR was delayed by 12 months in October 2024, pushing the large operator deadline to December 30, 2026, and SME deadline to June 30, 2027."

**Database Update:**

```sql
UPDATE regulations
SET effectiveDate = '2026-12-30',
    description = CONCAT(description, ' Implementation: Large operators (>500 employees) by Dec 30, 2026; SMEs by June 30, 2027. Delayed 12 months from original Oct 2024 timeline.')
WHERE title LIKE '%EUDR%' OR title LIKE '%Deforestation%';
```

---

#### 2. PPWR (Packaging and Packaging Waste Regulation)

**Current Status:** Entry into force: May 21, 2027  
**Verification Needed:** August 2026 application date

**Updated Context:**

- **August 2026:** Regulation becomes applicable
- **Key Requirement:** Granular material sub-type fees (e.g., PET_TRANSPARENT vs. PET_OPAQUE)
- **Dutch Context:** Verpact implements differentiated EPR fees

**Rationale from Report:**

> "PPWR introduces granular packaging material sub-types requiring precise GS1 GDSN attributes like packagingMaterialTypeCode."

**Database Update:**

```sql
UPDATE regulations
SET description = CONCAT(description, ' Application date: August 2026. Requires granular material sub-type classification (e.g., PET_TRANSPARENT, PET_OPAQUE, HDPE_NATURAL) for EPR fee calculation. Dutch implementation: Verpact differentiated fees.')
WHERE title LIKE '%PPWR%' OR title LIKE '%Packaging%';
```

---

#### 3. VSME (Voluntary SME Standard)

**Current Status:** Needs verification  
**Correction Needed:** July 30, 2025 adoption date

**Updated Timeline:**

- **July 30, 2025:** VSME adopted by European Commission
- **Key Feature:** Simplified ESRS for SMEs (<250 employees)
- **Reporting Format:** XBRL taxonomy for digital submission

**Rationale from Report:**

> "VSME was adopted on July 30, 2025, providing a simplified sustainability reporting standard for SMEs."

**Database Update:**

```sql
UPDATE regulations
SET effectiveDate = '2025-07-30',
    description = CONCAT(description, ' Adopted July 30, 2025. Simplified ESRS for SMEs (<250 employees). Reporting format: XBRL taxonomy for digital submission.')
WHERE title LIKE '%VSME%' OR title LIKE '%Voluntary SME%';
```

---

#### 4. DPP/Battery Passport

**Current Status:** Entry into force: May 24, 2029  
**Verification Needed:** February 18, 2027 mandatory date

**Updated Timeline:**

- **February 18, 2027:** Battery passports become mandatory
- **2027-2028:** Textile DPP rollout (sector-specific)
- **Key Technology:** GS1 Digital Link for QR code access

**Rationale from Report:**

> "Battery passports become mandatory on February 18, 2027, requiring lifecycle and recycling information accessible via GS1 Digital Link."

**Database Update:**

```sql
UPDATE regulations
SET effectiveDate = '2027-02-18',
    description = CONCAT(description, ' Battery passports mandatory Feb 18, 2027. Textile DPP rollout 2027-2028 (sector-specific). Access technology: GS1 Digital Link QR codes.')
WHERE title LIKE '%Battery%' OR title LIKE '%DPP%';
```

---

## Part 2: Description Enhancements

### Adding Regulatory Context

#### 1. CSRD - "Dual-Speed" Regulatory Environment

**Enhancement:** Add strategic context about corporate simplification vs. product granularity

**New Description Section:**

> **Regulatory Trend Context:** CSRD represents a "dual-speed" regulatory environment where corporate-level reporting is being simplified (CSRD Omnibus raising thresholds from 250 to 500 employees), while product-level requirements (EUDR, DPP) demand unprecedented granularity (geolocation, material composition, traceability chains). This creates a strategic gap where companies need precise supply chain data for product compliance even as corporate reporting becomes more streamlined.

**Rationale from Report:**

> "The regulatory landscape shows a dual-speed pattern: corporate simplification (CSRD Omnibus) versus product granularity (EUDR geolocation, DPP material passports)."

---

#### 2. EUDR - TRACES System Integration

**Enhancement:** Add technical implementation details for Due Diligence Statements

**New Description Section:**

> **Implementation System:** EUDR compliance requires submission of Due Diligence Statements (DDS) through the EU TRACES system. Each DDS receives a unique reference number that must be communicated in supply chain documentation. GS1 EDI implementation: Use RFF+DDR segment for DDS Reference Numbers and RFF+DDV segment for DDS Verification Codes.

**Rationale from Report:**

> "EUDR operators must submit Due Diligence Statements to TRACES and communicate DDS reference numbers via EDI segment RFF+DDR."

---

#### 3. PPWR - Verpact Fee Structure

**Enhancement:** Add Dutch market context for packaging EPR

**New Description Section:**

> **Dutch Implementation (Verpact):** Netherlands' EPR system Verpact implements differentiated fees based on material sub-types. Example: PET_TRANSPARENT bottles (high recyclability) pay lower fees than PET_OPAQUE (lower recyclability). This requires precise GDSN attribute packagingMaterialTypeCode population in product master data.

**Rationale from Report:**

> "Verpact differentiates EPR fees by material sub-type (e.g., PET_TRANSPARENT vs. PET_OPAQUE), requiring granular GS1 GDSN attributes."

---

#### 4. VSME - XBRL Taxonomy Reference

**Enhancement:** Add digital reporting format context

**New Description Section:**

> **Digital Reporting:** VSME reporting uses XBRL (eXtensible Business Reporting Language) taxonomy for structured digital submission. This enables automated validation and reduces manual data entry errors. SMEs should prepare data in XBRL-compatible formats or use EFRAG-approved software tools.

**Rationale from Report:**

> "VSME adopts XBRL taxonomy for digital sustainability reporting, enabling automated validation and data exchange."

---

#### 5. DPP Regulations - GS1 Digital Link Context

**Enhancement:** Add technical access mechanism details

**New Description Section:**

> **Access Technology:** Digital Product Passports must be accessible via GS1 Digital Link-enabled QR codes. Structure: `https://id.gs1.org/01/{GTIN}/21/{serialNumber}?linkType=sustainabilityInfo`. This allows consumers and authorities to access product sustainability data by scanning a single QR code, replacing multiple separate labels.

**Rationale from Report:**

> "DPP regulations mandate GS1 Digital Link for QR code access, consolidating multiple product information requirements into a single scannable code."

---

## Part 3: GS1 Standard Mapping Rationale Improvements

### Adding Technical Format Context

#### 1. EUDR → EPCIS Mapping

**Current Rationale:** (Generic description)  
**Enhanced Rationale:**

> **Technical Implementation:** EUDR traceability requirements map to EPCIS 2.0 events capturing product movement through supply chains. Key implementation:
>
> - **ObjectEvent:** Record product creation with geolocation (latitude/longitude within 1 arc-minute precision)
> - **TransformationEvent:** Track processing steps (e.g., coffee beans → roasted coffee)
> - **AggregationEvent:** Link individual products to shipping containers
> - **EDI Integration:** Communicate DDS Reference Numbers via RFF+DDR segment in DESADV messages
>
> **EUDR Article Reference:** Article 9 (Due Diligence System), Article 10 (Geolocation Requirements)

**Rationale from Report:**

> "EUDR requires geolocation data (latitude/longitude) for production sites, which maps to EPCIS ObjectEvent readPoint with geo:lat and geo:long attributes."

---

#### 2. PPWR → GDSN Mapping

**Current Rationale:** (Generic description)  
**Enhanced Rationale:**

> **Technical Implementation:** PPWR recyclability labeling requirements map to GDSN packaging attributes. Key XML tags:
>
> - `<packagingMaterialTypeCode>`: Material sub-type (e.g., PET_TRANSPARENT, HDPE_NATURAL)
> - `<packagingRecyclabilityCode>`: Recyclability classification (RECYCLABLE, NOT_RECYCLABLE, CONDITIONALLY_RECYCLABLE)
> - `<packagingRecycledContentPercentage>`: Post-consumer recycled content (0-100%)
> - `<packagingWeight>`: Weight for EPR fee calculation
>
> **PPWR Article Reference:** Article 11 (Recyclability Labeling), Article 44 (EPR Requirements)
>
> **Example GDSN XML:**
>
> ```xml
> <packagingInformation>
>   <packagingMaterialTypeCode>PET_TRANSPARENT</packagingMaterialTypeCode>
>   <packagingRecyclabilityCode>RECYCLABLE</packagingRecyclabilityCode>
>   <packagingRecycledContentPercentage>25</packagingRecycledContentPercentage>
> </packagingInformation>
> ```

**Rationale from Report:**

> "PPWR Article 11 requires recyclability labeling, which maps to GDSN attribute packagingMaterialTypeCode with values like PET_TRANSPARENT."

---

#### 3. DPP → GS1 Web Vocabulary Mapping

**Current Rationale:** (Generic description)  
**Enhanced Rationale:**

> **Technical Implementation:** DPP sustainability information maps to GS1 Web Vocabulary (JSON-LD) properties accessible via GS1 Digital Link. Key properties:
>
> - `gs1:sustainabilityInfo`: Link to full DPP data
> - `gs1:materialComposition`: Material breakdown (e.g., 60% cotton, 40% polyester)
> - `gs1:countryOfOrigin`: Production country (ISO 3166-1 alpha-2)
> - `gs1:recyclingInformation`: End-of-life instructions
>
> **ESPR Article Reference:** Article 8 (Digital Product Passport Requirements)
>
> **Example JSON-LD:**
>
> ```json
> {
>   "@context": "https://gs1.org/voc/",
>   "@type": "Product",
>   "gtin": "09506000134352",
>   "sustainabilityInfo": "https://example.com/dpp/09506000134352",
>   "materialComposition": [
>     { "material": "cotton", "percentage": 60 },
>     { "material": "polyester", "percentage": 40 }
>   ]
> }
> ```

**Rationale from Report:**

> "DPP regulations require sustainability information accessible via GS1 Digital Link, which resolves to JSON-LD structured data using GS1 Web Vocabulary properties."

---

#### 4. CSRD → ESRS Datapoints Mapping

**Current Rationale:** (Generic description)  
**Enhanced Rationale:**

> **Technical Implementation:** CSRD reporting requirements map to 1,184 EFRAG-defined ESRS datapoints organized by topic (E1-E5, S1-S4, G1). Key mapping:
>
> - **E1-5 (GHG Emissions):** Scope 1, 2, 3 emissions in tonnes CO2e
> - **E2-4 (Water Consumption):** Total water withdrawal in cubic meters
> - **S1-6 (Workforce Diversity):** Gender pay gap percentage
> - **G1-1 (Business Conduct):** Anti-corruption policies (yes/no)
>
> **Reporting Format:** XBRL taxonomy with ESRS datapoint codes (e.g., `ESRS_E1-5_GHG_Scope1`)
>
> **CSRD Article Reference:** Article 19a (Sustainability Reporting), Article 29b (ESRS Adoption)

**Rationale from Report:**

> "CSRD mandates reporting against ESRS datapoints, which are structured in XBRL taxonomy format for digital submission and automated validation."

---

## Part 4: Implementation Roadmap

### Phase 1: Timeline Corrections (1 hour)

1. Update EUDR deadline to Dec 30, 2026 (large operators)
2. Verify PPWR application date (Aug 2026)
3. Update VSME adoption date (July 30, 2025)
4. Update Battery Passport mandatory date (Feb 18, 2027)
5. Run database migration script
6. Verify updates in compliance calendar UI

### Phase 2: Description Enhancements (2 hours)

1. Add "dual-speed" context to CSRD
2. Add TRACES system reference to EUDR
3. Add Verpact fee structure to PPWR
4. Add XBRL taxonomy reference to VSME
5. Add GS1 Digital Link context to DPP regulations
6. Update regulation detail pages
7. Verify enhanced descriptions display correctly

### Phase 3: GS1 Mapping Rationale Updates (2 hours)

1. Update EUDR→EPCIS mapping with EDI segment references
2. Update PPWR→GDSN mapping with XML tag examples
3. Update DPP→Web Vocabulary mapping with JSON-LD examples
4. Update CSRD→ESRS mapping with XBRL taxonomy context
5. Add article/section references to all mappings
6. Update GS1 standards detail pages
7. Verify mapping rationales display correctly

### Phase 4: Testing & Validation (1 hour)

1. Run full test suite (target: 100% passing)
2. Verify timeline updates in compliance calendar
3. Test enhanced descriptions on regulation detail pages
4. Validate GS1 mapping rationales on standards pages
5. Check cross-references between regulations and standards
6. Perform accessibility audit (screen reader compatibility)

### Phase 5: Checkpoint & Documentation (30 min)

1. Save checkpoint with descriptive message
2. Update todo.md with completed tasks
3. Document changes in CHANGELOG.md
4. Prepare user-facing release notes

---

## Success Metrics

**Timeline Accuracy:**

- ✅ 100% of key regulations have accurate effective dates
- ✅ Multi-phase implementation timelines clearly documented
- ✅ Compliance calendar reflects updated deadlines

**Description Quality:**

- ✅ 80%+ of regulations have enhanced context sections
- ✅ Technical implementation details added to 10+ regulations
- ✅ Dutch market context added where applicable

**GS1 Mapping Quality:**

- ✅ 90%+ of mappings include technical format examples
- ✅ Article/section references added to all mappings
- ✅ Code examples (XML, JSON-LD, EDI) provided for key mappings

**User Experience:**

- ✅ Time-to-insight reduced by 30% (fewer clicks to find implementation details)
- ✅ Regulation detail pages 40% more informative
- ✅ GS1 standards pages provide actionable technical guidance

---

## Risk Mitigation

**Data Accuracy Risk:**

- **Mitigation:** Cross-reference all updates against official EU sources (EUR-Lex, EFRAG)
- **Validation:** Have GS1 Netherlands expert review timeline changes before deployment

**User Confusion Risk:**

- **Mitigation:** Add "Last Updated" timestamps to regulation detail pages
- **Communication:** Publish changelog highlighting timeline corrections

**Technical Debt Risk:**

- **Mitigation:** Document all database update scripts in version control
- **Rollback Plan:** Keep previous checkpoint for quick rollback if issues arise

---

## Next Steps

**Immediate Action:** Begin Phase 1 - Timeline Corrections

- Start with EUDR deadline update (highest user impact)
- Use webdev_execute_sql for targeted database updates
- Verify changes in compliance calendar UI

**Progress Reporting:** After each phase completion, provide update summarizing:

- What was updated
- Verification results
- Any issues encountered
- Next phase readiness

---

**Status:** Ready to execute Phase 1. Proceeding with EUDR timeline correction now.
