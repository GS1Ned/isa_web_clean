# GS1 EU Carbon Footprint Guideline - Extraction Notes

**Source:** GDSN-Implementation-Guideline-for-exchanging-Carbon-Footprint-Data-3.pdf  
**Version:** 1.0, Ratified, Feb 2025  
**Publisher:** GS1 in Europe  
**Pages:** 14

---

## Document Structure (from Table of Contents)

1. Introduction (p. 5)
2. Importance of Carbon Footprint Data (p. 6)
3. Structure of the Guideline (p. 7)
4. **Carbon Footprint attributes** (p. 8-13)
   - 4.1 Class: CarbonFootPrintHeader
     - 4.1.1 CFP Target Market Code (BMS ID 8700)
     - 4.1.2 CFP Date (BMS ID 8716)
     - 4.1.3 CFP Value Verification Code (BMS ID 8712)
   - 4.2 Class: CarbonFootprintDetail
     - 4.2.1 CFP Boundaries Code (BMS ID 8702)
     - 4.2.2 CFP Value (BMS ID 8704)
     - 4.2.3 CFP Value Measurement Unit Code (BMS ID 8705)
     - 4.2.4 CFP Functional Unit (BMS ID 8707)
     - 4.2.5 CFP Methodology Code (BMS ID 8710)
     - 4.2.6 CFP Accounting Code (BMS ID 8714)
5. Example (p. 14)

---

## Key Concepts Extracted

### Scope 1, 2, 3 Emissions (GHG Protocol)

From page 5:
- **Scope 1:** Direct GHG emissions from sources owned or controlled by the reporting company (fuel combustion in facilities or vehicles)
- **Scope 2:** Indirect GHG emissions from generation of purchased electricity, steam, heating, or cooling consumed by the reporting entity
- **Scope 3:** All other indirect GHG emissions throughout a company's value chain (upstream and downstream activities, emissions from suppliers, transportation, sold products)

### Life Cycle Assessment (LCA) vs. Product Carbon Footprint (PCF)

- **LCA:** Comprehensive evaluation of environmental impacts throughout entire life cycle (climate change, land use, resource depletion, biodiversity loss, water use, pollution) - follows ISO 14040 and ISO 14044
- **PCF:** Application of LCA methodology focusing solely on GHG emissions associated with a product - follows GHG Protocol Product Standard or ISO 14067

**PCF is measured in CO₂ equivalents (CO₂eq)** - allows comparison of different greenhouse gases by expressing them in terms of CO₂ that would produce the same warming effect.

---

## Carbon Footprint Attributes (GDSN BMS IDs)

### Class: CarbonFootPrintHeader

| Attribute | BMS ID | Description | Page |
|-----------|--------|-------------|------|
| CFP Target Market Code | 8700 | Target market for the carbon footprint data | 8 |
| CFP Date | 8716 | Date of the carbon footprint calculation | 8 |
| CFP Value Verification Code | 8712 | Verification status of the carbon footprint value | 8 |

### Class: CarbonFootprintDetail

| Attribute | BMS ID | Description | Page |
|-----------|--------|-------------|------|
| CFP Boundaries Code | 8702 | Scope boundaries (Scope 1, 2, 3, or combinations) | 9 |
| CFP Value | 8704 | Numeric value of the carbon footprint | 10 |
| CFP Value Measurement Unit Code | 8705 | Unit of measurement (e.g., kg CO₂eq) | 10 |
| CFP Functional Unit | 8707 | Functional unit for the PCF calculation | 11 |
| CFP Methodology Code | 8710 | Methodology used for calculation (e.g., ISO 14067, GHG Protocol) | 11 |
| CFP Accounting Code | 8714 | Accounting approach (e.g., cradle-to-gate, cradle-to-grave) | 12 |

**Total: 9 GDSN attributes for Product Carbon Footprint exchange**

---

## Next Steps

1. View pages 8-13 to extract detailed attribute definitions, code lists, and examples
2. Create database schema for gs1_eu_carbon_footprint_attributes table
3. Map attributes to ESRS E1 datapoints
4. Create ingestion script
5. Update ISA v1.0 Gap Analysis
