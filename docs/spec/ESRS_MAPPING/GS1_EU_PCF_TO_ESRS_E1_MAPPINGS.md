# GS1 EU Carbon Footprint to ESRS E1 Mappings

**Date:** 14 January 2025  
**Purpose:** Map GS1 EU GDSN PCF attributes to ESRS E1 (Climate Change) datapoints

---

## Mapping Strategy

The GS1 EU GDSN Carbon Footprint Guideline provides **product-level** carbon footprint data, while ESRS E1 requires **company-level** GHG emissions reporting. The mapping connects these two levels through **product carbon footprint aggregation**.

### Key Concepts

**GS1 EU PCF Scope:**
- Product Carbon Footprint (PCF) per product/SKU
- Life cycle stages: Raw Materials, Manufacturing, Transport, Use, End-of-Life
- Measurement units: kg CO₂eq per functional unit, per kg, per 100g, etc.
- Methodologies: ISO 14067, GHG Protocol, PEF, etc.

**ESRS E1 Scope:**
- Company-level GHG emissions (Scope 1, 2, 3)
- Absolute emissions (tonnes CO₂eq)
- Intensity metrics (emissions per revenue, per employee, etc.)
- Targets and reduction trajectories

**Mapping Approach:**
1. **Direct Mapping:** GS1 PCF attributes that directly correspond to ESRS E1 datapoints
2. **Aggregation Mapping:** GS1 PCF data that can be aggregated to derive ESRS E1 metrics
3. **Methodology Alignment:** GS1 PCF methodologies that align with ESRS E1 requirements

---

## Attribute-Level Mappings

### 1. CFP Boundaries Code → ESRS E1 Scope Classification

| GS1 EU PCF Code | GS1 Definition | ESRS E1 Datapoint | Mapping Type |
|-----------------|----------------|-------------------|--------------|
| **RAW_MATERIALS** | Emissions from production/extraction, packaging, storage, warehousing and transportation of raw materials | **E1-6_03** (Scope 3 Category 1: Purchased goods and services) | Direct |
| **MANUFACTURING** | Emissions from manufacturing/production of the product | **E1-6_01** (Scope 1: Direct emissions) + **E1-6_02** (Scope 2: Indirect emissions from energy) | Aggregation |
| **TRANSPORT_FINAL_PRODUCT** | Emissions from distribution to retail network or downstream stakeholders | **E1-6_07** (Scope 3 Category 4: Upstream transportation and distribution) | Direct |
| **USE** | Emissions when product is used by consumer | **E1-6_14** (Scope 3 Category 11: Use of sold products) | Direct |
| **END_OF_LIFE** | Emissions when product is disposed, recycled, recovered | **E1-6_15** (Scope 3 Category 12: End-of-life treatment of sold products) | Direct |
| **CRADLE_TO_GATE** | Total emissions from raw materials to factory gate | **E1-6_01** + **E1-6_02** + **E1-6_03** | Aggregation |
| **CRADLE_TO_GRAVE** | Total emissions from raw materials to disposal | **E1-6_01** + **E1-6_02** + **E1-6_03** + **E1-6_07** + **E1-6_14** + **E1-6_15** | Aggregation |
| **CRADLE_TO_CONSUMPTION** | Total emissions from raw materials to consumption | **E1-6_01** + **E1-6_02** + **E1-6_03** + **E1-6_07** | Aggregation |

**Mapping Confidence:** HIGH - GS1 boundaries directly align with GHG Protocol Scope 3 categories

### 2. CFP Value + Measurement Unit → ESRS E1 GHG Emissions

| GS1 EU PCF Attribute | GS1 Data Type | ESRS E1 Datapoint | Transformation Required |
|----------------------|---------------|-------------------|-------------------------|
| **cfpValue** (BMS 8704) | Numeric | **E1-6_01** to **E1-6_22** (Scope 1/2/3 emissions) | **Aggregation:** Sum product-level PCF values across all products, weighted by sales volume, to derive company-level emissions |
| **cfpValue/@measurementUnitCode** (BMS 8705) | Code (KG_CO2_EQ_PER_*) | ESRS E1 requires **tonnes CO₂eq** | **Unit Conversion:** Convert kg CO₂eq to tonnes CO₂eq (÷ 1000) |
| **cfpFunctionalUnit** (BMS 8707) | Text | ESRS E1 intensity denominators (E1-4_05, E1-4_08, etc.) | **Functional Unit Mapping:** Map product functional units to company-level intensity metrics (e.g., "per kg product" → "per tonne of production") |

**Mapping Confidence:** MEDIUM - Requires product-level to company-level aggregation logic

### 3. CFP Methodology Code → ESRS E1 Calculation Methodology

| GS1 EU PCF Methodology | GS1 Code | ESRS E1 Requirement | Alignment |
|------------------------|----------|---------------------|-----------|
| **Carbon Footprint Standard (ISO 14067)** | CARBON_FOOTPRINT_STANDARD | ESRS E1-6 AR 44: "GHG Protocol Corporate Accounting and Reporting Standard" | ✅ **Compatible** - ISO 14067 is recognized by ESRS as acceptable methodology |
| **GHG Protocol** | GHG_PROTOCOL | ESRS E1-6 AR 44: "GHG Protocol Corporate Accounting and Reporting Standard" | ✅ **Fully Aligned** - Same standard |
| **Product Environmental Footprint (PEF)** | PEF | ESRS E1-6 AR 44: "PEF method" | ✅ **Fully Aligned** - Explicitly mentioned in ESRS |
| **Environmental Product Declaration (EPD)** | EPD, PCR_EDF | ESRS E1-6 AR 44: "ISO 14064-1" | ✅ **Compatible** - EPD follows ISO 14025, which is compatible with ISO 14064-1 |
| **ISO 14064** | ISO_14064 | ESRS E1-6 AR 44: "ISO 14064-1" | ✅ **Fully Aligned** - Same standard |

**Mapping Confidence:** HIGH - GS1 methodologies are explicitly recognized by ESRS E1

### 4. CFP Accounting Code → ESRS E1 LCA Approach

| GS1 EU PCF Accounting | GS1 Code | ESRS E1 Requirement | Alignment |
|-----------------------|----------|---------------------|-----------|
| **Attributional LCA (ALCA)** | ATTRIBUTIONAL | ESRS E1-6 AR 44: "Attributional approach" | ✅ **Fully Aligned** - ESRS explicitly allows attributional LCA |
| **Consequential LCA (CLCA)** | CONSEQUENTIAL | ESRS E1-6 AR 44: "Consequential approach" | ✅ **Fully Aligned** - ESRS explicitly allows consequential LCA |

**Mapping Confidence:** HIGH - GS1 accounting codes directly match ESRS terminology

### 5. CFP Date → ESRS E1 Reporting Period

| GS1 EU PCF Attribute | GS1 Data Type | ESRS E1 Datapoint | Mapping |
|----------------------|---------------|-------------------|---------|
| **cfpDate** (BMS 8716) | Date | ESRS 2 BP-2: Reporting period | **Temporal Alignment:** Ensure PCF assessment date falls within ESRS reporting period (typically calendar year or fiscal year) |

**Mapping Confidence:** MEDIUM - Requires temporal alignment logic

### 6. CFP Value Verification Code → ESRS E1 Assurance

| GS1 EU PCF Verification | GS1 Code | ESRS E1 Requirement | Alignment |
|-------------------------|----------|---------------------|-----------|
| **External Verification** | EXTERNAL_VERIFICATION | ESRS E1-6 AR 45: "Third-party verification" | ✅ **Fully Aligned** - ESRS requires third-party assurance for Scope 1, 2, 3 emissions |
| **Peer Reviewed** | PEER_REVIEWED | ESRS E1-6 AR 45: "Internal review" | ⚠️ **Partial** - ESRS prefers third-party verification, but internal review is acceptable for Scope 3 |
| **Not Verified** | NOT_VERIFIED | ESRS E1-6 AR 45: "Unverified data" | ⚠️ **Acceptable for Scope 3** - ESRS allows unverified Scope 3 data with disclosure |

**Mapping Confidence:** MEDIUM - ESRS has stricter verification requirements than GS1 minimum

### 7. CFP Target Market Code → ESRS E1 Geographic Segmentation

| GS1 EU PCF Attribute | GS1 Data Type | ESRS E1 Datapoint | Mapping |
|----------------------|---------------|-------------------|---------|
| **cfpCountryCode** (BMS 8700) | Code (ISO 3166-1) | ESRS E1-6: Geographic breakdown of emissions | **Geographic Segmentation:** Use country code to allocate product emissions to geographic regions for ESRS reporting |

**Mapping Confidence:** LOW - ESRS does not require country-level segmentation for product emissions

---

## Aggregation Logic: Product PCF → Company GHG Emissions

### Formula

To derive company-level ESRS E1 emissions from GS1 product-level PCF data:

```
Company Scope X Emissions (tonnes CO₂eq) = 
  Σ (Product PCF Value × Sales Volume × Unit Conversion Factor)
  
Where:
- Product PCF Value: cfpValue (BMS 8704) for boundary code matching Scope X
- Sales Volume: Number of units sold in reporting period
- Unit Conversion Factor: Converts measurement unit to tonnes CO₂eq
  * KG_CO2_EQ_PER_KG → multiply by (product weight in kg / 1000)
  * KG_CO2_EQ_PER_100G → multiply by (product weight in kg / 100 / 1000)
  * KG_CO2_EQ_PER_FU → multiply by (1 / 1000)
```

### Example Calculation

**Product:** Plastic Bottle (500ml)  
**GS1 PCF Data:**
- cfpBoundariesCode: MANUFACTURING
- cfpValue: 8.28
- cfpValue/@measurementUnitCode: KG_CO2_EQ_PER_100G
- Product weight: 25g (0.025 kg)

**Sales Volume:** 1,000,000 units sold in 2024

**Calculation:**
```
Manufacturing Emissions (Scope 1+2) = 
  8.28 kg CO₂eq/100g × (25g / 100g) × 1,000,000 units / 1000
  = 8.28 × 0.25 × 1,000,000 / 1000
  = 2,070 tonnes CO₂eq
```

This value would be reported in **ESRS E1-6_01** (Scope 1) and/or **E1-6_02** (Scope 2), depending on the breakdown of manufacturing emissions.

---

## Gap Analysis: GS1 EU PCF vs. ESRS E1

### What GS1 EU PCF Provides

✅ **Product-level carbon footprint** for individual SKUs  
✅ **Life cycle stage breakdown** (raw materials, manufacturing, transport, use, end-of-life)  
✅ **Methodology transparency** (ISO 14067, GHG Protocol, PEF, etc.)  
✅ **Verification status** (external, peer-reviewed, not verified)  
✅ **Functional unit basis** for product comparisons  

### What ESRS E1 Requires (Beyond GS1 PCF)

❌ **Company-level aggregation** - GS1 provides product-level data, ESRS requires company-level totals  
❌ **Scope 1/2/3 breakdown** - GS1 boundaries don't perfectly map to GHG Protocol scopes  
❌ **Absolute emissions in tonnes CO₂eq** - GS1 allows various measurement units  
❌ **Intensity metrics** - GS1 functional units don't directly translate to ESRS intensity denominators  
❌ **Temporal alignment** - GS1 PCF date may not match ESRS reporting period  
❌ **Third-party assurance** - GS1 allows unverified data, ESRS requires assurance for Scope 1/2  

### Bridging the Gap

**ISA Recommendation:**
1. **Aggregate product PCF data** to company-level emissions using sales volume weighting
2. **Map GS1 boundaries** to GHG Protocol Scope 3 categories
3. **Convert measurement units** to tonnes CO₂eq
4. **Align temporal boundaries** to ESRS reporting period
5. **Ensure third-party verification** for Scope 1/2 emissions
6. **Document methodology** and assumptions in ESRS narrative disclosures

---

## ISA v1.0 Gap #1 Resolution

**Before (ISA First Advisory Report, 13 Dec 2024):**
> **Gap #1: Product Carbon Footprint (MISSING)**
> - **GS1 NL Coverage:** ZERO - No PCF attributes in any sector model
> - **ESRS Requirement:** ESRS E1-6 (Scope 1, 2, 3 emissions)
> - **Recommendation:** Add PCF attributes in GS1 NL v3.1.34 release

**After (With GS1 EU Carbon Footprint Guideline v1.0, Feb 2025):**
> **Gap #1: Product Carbon Footprint (PARTIAL)**
> - **GS1 EU Coverage:** COMPLETE - 9 GDSN PCF attributes (Feb 2025)
> - **GS1 NL Coverage:** ZERO - PCF attributes not yet adopted in GS1 NL sector models
> - **ESRS Requirement:** ESRS E1-6 (Scope 1, 2, 3 emissions)
> - **GS1 Solution:** GS1 EU GDSN PCF Guideline v1.0 provides official standard
> - **Recommendation:** Adopt GS1 EU GDSN PCF attributes in GS1 NL v3.1.34 release

**Impact:**
- **Severity:** CRITICAL → **MODERATE** (downgraded)
- **Urgency:** HIGH → **MEDIUM** (downgraded)
- **Solution:** GS1 EU has published official PCF standard, GS1 NL needs to adopt it

---

## Conclusion

The GS1 EU GDSN Carbon Footprint Guideline v1.0 provides a **solid foundation** for product-level carbon footprint data exchange, which can be **aggregated and transformed** to meet ESRS E1 company-level GHG emissions reporting requirements.

**Key Strengths:**
- Official GS1 EU standard (ratified Feb 2025)
- Methodology alignment with ESRS E1 (ISO 14067, GHG Protocol, PEF)
- Life cycle stage breakdown compatible with GHG Protocol Scope 3 categories
- Verification status transparency

**Key Limitations:**
- Product-level data requires aggregation to company-level
- Measurement units require conversion to tonnes CO₂eq
- Temporal alignment may require adjustment
- GS1 NL sector models (v3.1.33) have not yet adopted these attributes

**ISA Recommendation:**
1. **Immediate:** Register GS1 EU PCF Guideline v1.0 in ISA dataset registry
2. **Short-term:** Update ISA v1.0 Gap Analysis to reflect GS1 EU solution
3. **Medium-term:** Advocate for GS1 NL adoption of GS1 EU PCF attributes in v3.1.34
4. **Long-term:** Develop ISA aggregation logic to transform product PCF → company GHG emissions

---

**Document Status:** COMPLETE  
**Next Action:** Update ISA v1.0 Gap Analysis and dataset registry
