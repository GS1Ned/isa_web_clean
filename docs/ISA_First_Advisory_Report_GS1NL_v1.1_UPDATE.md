# ISA First Advisory Report for GS1 Netherlands - v1.1 UPDATE

**Report Type:** Advisory Analysis Update  
**Audience:** GS1 Netherlands Leadership  
**Original Date:** December 13, 2025 (v1.0)  
**Update Date:** January 14, 2025 (v1.1)  
**ISA Version:** 1.0 (Registry v1.3.0)  
**Author:** ISA Execution Agent

---

## Update Summary

This document updates **Section 4.1 (Critical Gaps)** of the ISA First Advisory Report for GS1 Netherlands (v1.0, December 13, 2025) to reflect the publication of the **GS1 EU GDSN Implementation Guideline for Exchanging Carbon Footprint Data v1.0** (February 2025).

**What Changed:**
- **Gap #1 (Product Carbon Footprint)** status revised from **MISSING** to **PARTIAL**
- **GS1 EU solution** recognized: Official PCF standard published (9 GDSN attributes, 28 code values)
- **GS1 NL recommendation** updated: Adopt GS1 EU PCF attributes in v3.1.34 release

**Why This Matters:**
The original ISA v1.0 report (Dec 13, 2025) concluded that GS1 NL had **zero coverage** for Product Carbon Footprint (PCF). However, **GS1 EU published an official GDSN PCF standard in February 2025**, providing a complete solution for product-level carbon footprint data exchange. GS1 NL now has a **clear adoption path** rather than needing to design PCF attributes from scratch.

---

## Updated Section 4.1: Critical Gaps

### Gap #1: Product Carbon Footprint (PCF) - **STATUS REVISED**

#### Original Assessment (ISA v1.0, Dec 13, 2025)

**ESG Requirement:** ESRS E1-6 (mandatory for large companies from 2025)  
**GS1 NL Coverage:** **MISSING** across all three sector models  
**Impact:** High - PCF is becoming a baseline requirement for retail procurement (Albert Heijn, Jumbo, Action all requesting PCF data)  
**Recommended Action:** Add "Product Carbon Footprint (kg CO2e)" and "PCF Calculation Method" attributes to all three sector models in v3.1.34 release

**Dataset References:**
- `esrs.datapoints.ig3` (E1-6 datapoints)
- `gs1nl.benelux.diy_garden_pet.v3.1.33` (no PCF attributes)
- `gs1nl.benelux.fmcg.v3.1.33.5` (no PCF attributes)
- `gs1nl.benelux.healthcare.v3.1.33` (no PCF attributes)

---

#### Updated Assessment (ISA v1.1, Jan 14, 2025)

**ESG Requirement:** ESRS E1-6 (mandatory for large companies from 2025)  
**GS1 EU Coverage:** **COMPLETE** - Official GDSN PCF standard published (Feb 2025)  
**GS1 NL Coverage:** **MISSING** - PCF attributes not yet adopted in GS1 NL sector models  
**Impact:** High → **MODERATE** (downgraded) - Official GS1 solution exists, adoption is now the priority  
**Urgency:** HIGH → **MEDIUM** (downgraded) - Clear adoption path available

**Recommended Action (REVISED):**  
Adopt GS1 EU GDSN Carbon Footprint attributes in GS1 NL sector models v3.1.34 release (Q3-Q4 2025). Do not design proprietary PCF attributes—use the official GS1 EU standard to ensure global interoperability.

**Dataset References:**
- `gs1eu.gdsn.carbon_footprint.v1.0` **(NEW)** - Official GS1 EU PCF standard (9 attributes, 28 code values)
- `esrs.datapoints.ig3` (E1-6 datapoints)
- `gs1nl.benelux.diy_garden_pet.v3.1.33` (no PCF attributes)
- `gs1nl.benelux.fmcg.v3.1.33.5` (no PCF attributes)
- `gs1nl.benelux.healthcare.v3.1.33` (no PCF attributes)

---

### GS1 EU Carbon Footprint Guideline v1.0 (Feb 2025)

**Publisher:** GS1 in Europe  
**Status:** Ratified  
**Publication Date:** February 2025  
**Scope:** Product Carbon Footprint (PCF) data exchange via GDSN

**What It Provides:**

The GS1 EU GDSN Implementation Guideline for Exchanging Carbon Footprint Data v1.0 defines **9 GDSN BMS attributes** for product-level carbon footprint data exchange:

#### CarbonFootPrintHeader Attributes (3)

| BMS ID | GDSN Name | Attribute Name | Data Type | Mandatory |
|--------|-----------|----------------|-----------|-----------|
| 8700 | cfpCountryCode | CFP Target Market Code | Code (ISO 3166-1) | No |
| 8716 | cfpDate | CFP Date | Date | No |
| 8712 | cfpValueVerificationCode | CFP Value Verification Code | Code (3 values) | No |

#### CarbonFootprintDetail Attributes (6)

| BMS ID | GDSN Name | Attribute Name | Data Type | Repeatable |
|--------|-----------|----------------|-----------|------------|
| 8702 | cfpBoundariesCode | CFP Boundaries Code | Code (8 values) | Yes |
| 8704 | cfpValue | CFP Value | Numeric | Yes |
| 8705 | cfpValue/@measurementUnitCode | CFP Value Measurement Unit Code | Code (5 values) | Yes |
| 8707 | cfpFunctionalUnit | CFP Functional Unit | Text | Yes |
| 8710 | cfpMethodologyCode | CFP Methodology Code | Code (10 values) | Yes |
| 8714 | cfpAccountingCode | CFP Accounting Code | Code (2 values) | Yes |

**Code Lists (28 values total):**
- **CfpValueVerificationCode** (3): External Verification, Not Verified, Peer Reviewed
- **CfpBoundariesCode** (8): Raw Materials, Manufacturing, Transport, Use, End-of-Life, Cradle-to-Gate, Cradle-to-Grave, Cradle-to-Consumption
- **MeasurementUnitCode** (5): kg CO₂eq per kg, per 100g, per 100ml, per functional unit, EUR CO₂eq per kg
- **CfpMethodologyCode** (10): ISO 14067, GHG Protocol, PEF, EPD, PCR, ISO 14064, etc.
- **CfpAccountingCode** (2): Attributional, Consequential

---

### Alignment with ESRS E1 (Climate Change)

The GS1 EU PCF attributes provide **product-level** carbon footprint data, which can be **aggregated** to meet ESRS E1 **company-level** GHG emissions reporting requirements.

**Key Mappings:**

| GS1 EU PCF Attribute | ESRS E1 Datapoint | Mapping Type |
|----------------------|-------------------|--------------|
| **cfpBoundariesCode = RAW_MATERIALS** | E1-6_03 (Scope 3 Category 1: Purchased goods and services) | Direct |
| **cfpBoundariesCode = MANUFACTURING** | E1-6_01 (Scope 1) + E1-6_02 (Scope 2) | Aggregation |
| **cfpBoundariesCode = TRANSPORT_FINAL_PRODUCT** | E1-6_07 (Scope 3 Category 4: Upstream transportation) | Direct |
| **cfpBoundariesCode = USE** | E1-6_14 (Scope 3 Category 11: Use of sold products) | Direct |
| **cfpBoundariesCode = END_OF_LIFE** | E1-6_15 (Scope 3 Category 12: End-of-life treatment) | Direct |
| **cfpValue + cfpValue/@measurementUnitCode** | E1-6_01 to E1-6_22 (Scope 1/2/3 emissions in tonnes CO₂eq) | Aggregation + Unit Conversion |
| **cfpMethodologyCode** | ESRS E1-6 AR 44 (GHG Protocol, ISO 14067, PEF) | Methodology Alignment |

**Transformation Required:**
- **Product-level → Company-level:** Aggregate product PCF values weighted by sales volume
- **Unit conversion:** Convert kg CO₂eq to tonnes CO₂eq (÷ 1000)
- **Temporal alignment:** Ensure PCF assessment date falls within ESRS reporting period

**Detailed Mapping Analysis:**  
See `/docs/GS1_EU_PCF_TO_ESRS_E1_MAPPINGS.md` for complete mapping logic and aggregation formulas.

---

### Updated Recommendation for GS1 NL

#### Original Recommendation (ISA v1.0, Dec 13, 2025)

> Add "Product Carbon Footprint (kg CO2e)" and "PCF Calculation Method" attributes to all three sector models in v3.1.34 release.

**Problem:** This recommendation implied GS1 NL should design PCF attributes independently, which would create fragmentation and interoperability issues.

#### Revised Recommendation (ISA v1.1, Jan 14, 2025)

**Adopt GS1 EU GDSN Carbon Footprint attributes in GS1 NL sector models v3.1.34 release (Q3-Q4 2025).**

**Implementation Steps:**

1. **Adopt GS1 EU PCF Attributes (9 attributes, 28 code values)**
   - Add all 9 GDSN BMS attributes to GS1 NL DIY, FMCG, and Healthcare sector models
   - Use exact GDSN attribute names and BMS IDs (8700, 8702, 8704, 8705, 8707, 8710, 8712, 8714, 8716)
   - Import all 5 code lists (CfpValueVerificationCode, CfpBoundariesCode, MeasurementUnitCode, CfpMethodologyCode, CfpAccountingCode)

2. **Mark as Optional Initially, Recommended for Sustainability-Focused Retailers**
   - Set all PCF attributes to **optional** (not mandatory) in v3.1.34
   - Add guidance note: "Recommended for products sold to sustainability-focused retailers (e.g., Albert Heijn, Jumbo, Action)"
   - Plan to make PCF attributes **mandatory** for FMCG and DIY sectors in v3.2.0 (2026)

3. **Align Validation Rules with ESRS Requirements**
   - Add validation rule: If `cfpBoundariesCode = MANUFACTURING`, then `cfpMethodologyCode` is mandatory
   - Add validation rule: If `cfpValue` is provided, then `cfpValue/@measurementUnitCode` is mandatory
   - Add validation rule: If `cfpValue/@measurementUnitCode = KG_CO2_EQ_PER_FU`, then `cfpFunctionalUnit` is mandatory

4. **Provide Implementation Guidance**
   - Publish GS1 NL-specific PCF implementation guide (Dutch + English)
   - Include examples for DIY (building materials), FMCG (food products), and Healthcare (medical devices)
   - Provide mapping guidance: GS1 EU PCF → ESRS E1 (company-level aggregation)

5. **Monitor GS1 EU Updates**
   - Track GS1 EU PCF guideline updates (v1.1, v1.2, etc.)
   - Ensure GS1 NL sector models stay aligned with latest GS1 EU standard

---

### Impact Assessment

**Before GS1 EU PCF Guideline (ISA v1.0, Dec 13, 2025):**
- **Severity:** CRITICAL
- **Urgency:** HIGH
- **Solution:** GS1 NL must design PCF attributes from scratch
- **Risk:** Fragmentation, interoperability issues, delayed adoption

**After GS1 EU PCF Guideline (ISA v1.1, Jan 14, 2025):**
- **Severity:** MODERATE (downgraded)
- **Urgency:** MEDIUM (downgraded)
- **Solution:** GS1 NL adopts official GS1 EU standard
- **Benefit:** Global interoperability, faster adoption, regulatory alignment

**Key Insight:**  
The publication of the GS1 EU GDSN Carbon Footprint Guideline v1.0 transforms Gap #1 from a **design challenge** into an **adoption challenge**. GS1 NL no longer needs to invent PCF attributes—it simply needs to adopt the official GS1 EU standard and provide Dutch implementation guidance.

---

### Dataset Registry Update

**ISA Dataset Registry v1.3.0** (released Jan 14, 2025) now includes:

```json
{
  "id": "gs1eu.gdsn.carbon_footprint.v1.0",
  "title": "GS1 EU GDSN Implementation Guideline for Exchanging Carbon Footprint Data",
  "publisher": "GS1 in Europe",
  "version": "1.0",
  "status": "ratified",
  "pubDate": "2025-02",
  "isaUsage": "MVP-critical",
  "ingestionStatus": "complete",
  "recordCount": 37
}
```

**ISA Database Tables:**
- `gs1_eu_carbon_footprint_attributes` (9 records)
- `gs1_eu_carbon_footprint_code_lists` (28 records)

---

## Conclusion

The GS1 EU GDSN Carbon Footprint Guideline v1.0 (Feb 2025) provides a **complete, official solution** for Product Carbon Footprint (PCF) data exchange. This significantly reduces the urgency and complexity of Gap #1 for GS1 NL.

**Immediate Action Required:**  
GS1 NL should prioritize **adopting** (not designing) GS1 EU PCF attributes in sector models v3.1.34 (Q3-Q4 2025). This ensures global interoperability, accelerates market adoption, and positions GS1 NL as aligned with official GS1 EU standards.

**Strategic Opportunity:**  
By adopting GS1 EU PCF attributes, GS1 NL can position itself as the **ESG data backbone** for the Dutch market while maintaining full alignment with global GS1 standards. This creates a defensible competitive advantage and ensures GS1 NL standards remain relevant in the sustainability-driven economy.

---

**Report Updated By:** ISA Execution Agent  
**ISA Version:** 1.0 (Dataset Registry v1.3.0)  
**Update Date:** January 14, 2025  
**Original Report Date:** December 13, 2025  
**Contact:** GS1 Netherlands Standards Team

---

## Appendix: Changelog

### v1.1 (Jan 14, 2025)
- **Added:** GS1 EU GDSN Carbon Footprint Guideline v1.0 analysis
- **Updated:** Gap #1 status from MISSING to PARTIAL
- **Revised:** Recommendation from "design PCF attributes" to "adopt GS1 EU PCF standard"
- **Added:** GS1 EU PCF → ESRS E1 mapping analysis
- **Updated:** Dataset registry to v1.3.0 (includes gs1eu.gdsn.carbon_footprint.v1.0)

### v1.0 (Dec 13, 2025)
- Initial ISA First Advisory Report for GS1 Netherlands
- Analyzed 3,667 GS1 NL attributes against 1,186 ESRS datapoints
- Identified 5 critical gaps (PCF, circularity, traceability, DPP, validation rules)
