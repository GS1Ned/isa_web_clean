# GS1 Data Models Integration Status

**Document Version:** 2.0  
**Last Updated:** December 4, 2025  
**Purpose:** Track GS1 standards and data models integrated into ISA platform

---

## Overview

ISA bridges EU sustainability regulations (CSRD, ESRS, DPP, EUDR) with GS1 supply chain standards. This document tracks which GS1 standards and data models are integrated, planned, or missing.

**Integration Status Legend:**

- ✅ **Fully Integrated** - Data model ingested, mappings active, UI available
- 🟡 **Partially Integrated** - Conceptually modeled but incomplete attribute-level integration
- 📋 **Planned** - Documented in roadmap, schema designed, not yet implemented
- ❌ **Not Integrated** - Identified as relevant but no integration work started

---

## 1. Master Data Standards

### 1.1 GS1 Identification Standards

| Standard                                      | Status                  | Description                          | ISA Integration                                                   |
| --------------------------------------------- | ----------------------- | ------------------------------------ | ----------------------------------------------------------------- |
| **GTIN** (Global Trade Item Number)           | 🟡 Partially Integrated | Product identification               | Used in product mappings, not yet in full master data integration |
| **GLN** (Global Location Number)              | 🟡 Partially Integrated | Organization/location identification | Used in organization references                                   |
| **SSCC** (Serial Shipping Container Code)     | 🟡 Partially Integrated | Logistics unit identification        | Referenced in standards list, not in active use                   |
| **GPC** (Global Product Classification)       | 🟡 Partially Integrated | Product categorization               | Used for sector-based filtering, not full taxonomy ingested       |
| **GRAI** (Global Returnable Asset Identifier) | ❌ Not Integrated       | Returnable asset tracking            | Relevant for circular economy/PPWR                                |
| **GIAI** (Global Individual Asset Identifier) | ❌ Not Integrated       | Fixed asset tracking                 | Niche use cases                                                   |
| **GMN** (Global Model Number)                 | ❌ Not Integrated       | Model/design identification          | Lower priority                                                    |
| **GDTI** (Global Document Type Identifier)    | ❌ Not Integrated       | Document tracking                    | Lower priority                                                    |
| **GSRN** (Global Service Relation Number)     | ❌ Not Integrated       | Service relationship tracking        | Lower priority                                                    |

**Next Actions:**

- Ingest full GPC taxonomy for sector-based ESG requirement filtering
- Add GRAI for PPWR circular economy use cases

---

### 1.2 GS1 Data Source / GDSN Benelux Data Models

**Status:** ✅ **3 sectors fully integrated** (3,668 attributes total)

| Sector Model                           | Status              | Attributes Count | Mappings         | ESG Relevance                                                          |
| -------------------------------------- | ------------------- | ---------------- | ---------------- | ---------------------------------------------------------------------- |
| **Food, Health & Beauty** (FMCG 31335) | ✅ Fully Integrated | 473 attributes   | 217 mappings     | Packaging (44), sustainability (52), origin, nutrition, safety         |
| **DIY, Garden & Pet** (DHZTD 3.1.33)   | ✅ Fully Integrated | 3,009 attributes | 408 mappings     | Packaging (93), sustainability (128), chemicals, recyclability, energy |
| **Healthcare** (ECHO 3133)             | ✅ Fully Integrated | 186 attributes   | 0 mappings\*     | Medical device safety, sterility, regulatory compliance                |
| **Agriculture & Fresh**                | ❌ Not Integrated   | MEDIUM           | ~200+ attributes | Origin, farming methods, certifications                                |

\*Healthcare mappings pending MDR/IVDR regulation ingestion

**Database Schema:** ✅ **Implemented**

```sql
CREATE TABLE gs1_attributes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  attribute_code VARCHAR(100) NOT NULL,
  attribute_name VARCHAR(255) NOT NULL,
  sector ENUM('food_hb', 'diy_garden_pet', 'healthcare', 'agriculture') NOT NULL,
  description TEXT,
  datatype ENUM('text', 'number', 'boolean', 'date', 'code_list') NOT NULL,
  code_list_id INT NULL,
  is_mandatory BOOLEAN DEFAULT FALSE,
  esrs_relevance TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gs1_attribute_code_lists (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code_list_name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  description TEXT,
  attribute_id INT,
  FOREIGN KEY (attribute_id) REFERENCES gs1_attributes(id)
);
```

**Completed Actions:**

1. ✅ Obtained GS1 Benelux data model files (FMCG 31335, DHZTD 3.1.33, ECHO 3133)
2. ✅ Built parsers: gs1-benelux-parser.ts (FMCG/ECHO), gs1-diy-parser.ts (DHZTD)
3. ✅ Ingested all 3 sectors (3,668 total attributes)
4. ✅ Created 625 attribute-to-regulation mappings
5. ✅ Built GS1AttributesPanel UI component

**Next Actions:**

1. Add MDR/IVDR regulations to enable Healthcare sector mappings
2. Investigate DIY picklist format for code list ingestion
3. Ingest Agriculture sector (if GS1 Benelux model available)
4. Add GPC Brick filtering for category-specific recommendations

---

### 1.3 GS1 Global Data Model

| Component                       | Status            | Description                             | ISA Integration                        |
| ------------------------------- | ----------------- | --------------------------------------- | -------------------------------------- |
| **GS1 Global Data Model (GDM)** | ❌ Not Integrated | Harmonized global attribute definitions | Needed for scaling beyond NL/Benelux   |
| **GS1 Master Data Standards**   | ❌ Not Integrated | Business rules for data quality         | Future integration for data validation |

**Next Actions:**

- Ingest GDM core attributes as separate layer linked to Benelux models
- Use for cross-country ISA deployment

---

## 2. Event & Traceability Standards

### 2.1 EPCIS 2.0 + Core Business Vocabulary (CBV)

**Critical Gap:** Event schemas and templates not yet integrated

| Component                 | Status     | Priority | ESG Use Cases                                           |
| ------------------------- | ---------- | -------- | ------------------------------------------------------- |
| **EPCIS 2.0 Event Model** | 📋 Planned | **HIGH** | EUDR traceability, PPWR lifecycle tracking, food safety |
| **CBV Vocabulary**        | 📋 Planned | **HIGH** | Standardized event types, business steps, dispositions  |
| **Event Templates**       | 📋 Planned | **HIGH** | Canonical flows for timber chain, packaging lifecycle   |

**Database Schema Planned:**

```sql
CREATE TABLE epcis_event_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  template_name VARCHAR(255) NOT NULL,
  event_type ENUM('object', 'aggregation', 'transformation', 'transaction', 'association') NOT NULL,
  use_case VARCHAR(255),
  regulation_id INT,
  esrs_datapoint_id INT,
  event_schema JSON NOT NULL,
  cbv_vocabulary JSON,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (regulation_id) REFERENCES regulations(id),
  FOREIGN KEY (esrs_datapoint_id) REFERENCES esrs_datapoints(id)
);
```

**Priority Event Templates:**

1. **EUDR Timber Chain:** Harvesting → Transport → Processing → Import
2. **PPWR Packaging Lifecycle:** Production → Distribution → Use → Collection → Recycling
3. **Food Traceability:** Farming → Processing → Packaging → Distribution → Retail

**Next Actions:**

1. Research EPCIS 2.0 JSON schema structure
2. Create 2-3 canonical event templates for EUDR and PPWR
3. Link event types to specific ESRS datapoints (E1, E2, E5)
4. Build event template generator in ISA UI

---

### 2.2 GS1 Logistics Standards

| Standard                              | Status                  | Description             | ESG Relevance                     |
| ------------------------------------- | ----------------------- | ----------------------- | --------------------------------- |
| **SSCC** (Shipping Container)         | 🟡 Partially Integrated | Logistics unit tracking | Scope 3 emissions, waste tracking |
| **GSIN** (Shipment Identification)    | ❌ Not Integrated       | Shipment-level tracking | Transport emissions               |
| **GINC** (Consignment Identification) | ❌ Not Integrated       | Consignment tracking    | Logistics optimization            |

**Next Actions:**

- Model logistics identifiers for Scope 3 emissions calculations
- Link to EPCIS events for end-to-end traceability

---

## 3. Web & Digital Product Passport Standards

### 3.1 GS1 Digital Link + GS1 Web Vocabulary

**Status:** ✅ **GS1 Web Vocabulary fully integrated** (608 terms)

| Component                        | Status              | Coverage          | DPP Relevance                            |
| -------------------------------- | ------------------- | ----------------- | ---------------------------------------- |
| **GS1 Web Vocabulary (JSON-LD)** | ✅ Fully Integrated | 608 terms (v1.17) | 75 DPP-relevant properties               |
| **GS1 Digital Link URI Syntax**  | 📋 Planned          | -                 | Web-friendly product identifiers for DPP |
| **DPP GS1 Guidance**             | 📋 Planned          | -                 | Official GS1 EU DPP implementation guide |

**Web Vocabulary Coverage:**

- DPP-relevant properties: 75
- ESRS-relevant properties: 16
- EUDR-relevant properties: 45
- Packaging-related properties: 69
- Sustainability-related properties: 67

**Database Schema:** ✅ **Implemented**

```sql
CREATE TABLE gs1_web_vocabulary (
  id INT PRIMARY KEY AUTO_INCREMENT,
  property_name VARCHAR(255) NOT NULL,
  property_uri VARCHAR(500) NOT NULL,
  class_name VARCHAR(255),
  description TEXT,
  datatype VARCHAR(100),
  dpp_requirement_id INT,
  esrs_datapoint_id INT,
  example_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (esrs_datapoint_id) REFERENCES esrs_datapoints(id)
);
```

**Key Properties Ingested:**

- Product identification: gtin, brand, productName
- Sustainability: recyclablePackaging, sustainabilityCertification, consumerRecyclingInstructions
- Materials: material, materialComposition, chemicalSubstance
- Origin: countryOfOrigin, placeOfItemActivity
- Compliance: regulatoryInformation, regulatoryIdentifier (EUDR)
- DPP: gs1:dpp link type for Digital Product Passport

**Completed Actions:**

1. ✅ Downloaded GS1 Web Vocabulary v1.17 (2.3MB JSON-LD)
2. ✅ Built gs1-web-vocab-parser.ts to extract classes and properties
3. ✅ Ingested 608 terms with DPP/ESRS/EUDR relevance flags
4. ✅ Integrated into GS1AttributesPanel UI component

**Next Actions:**

1. Map Web Vocabulary properties to ESRS datapoints (Phase 42)
2. Build Digital Link URI generator in ISA (Phase 43)
3. Create property-to-regulation mappings for DPP compliance (Phase 43)

---

## 4. Messaging & EDI Standards

### 4.1 GS1 EDI Messages

| Message Type | Status            | Description      | ESG Relevance                                  |
| ------------ | ----------------- | ---------------- | ---------------------------------------------- |
| **ORDERS**   | ❌ Not Integrated | Purchase orders  | Sustainability clauses, packaging requirements |
| **DESADV**   | ❌ Not Integrated | Despatch advice  | Shipment details for Scope 3                   |
| **INVOIC**   | ❌ Not Integrated | Invoices         | Sustainability charges, green tariffs          |
| **RECADV**   | ❌ Not Integrated | Receiving advice | Return packaging tracking                      |

**Priority:** Medium (future integration for transactional ESG data)

---

## 5. Sector-Specific Extensions

### 5.1 Packaging & Sustainability Attributes (PAC List)

**Status:** ✅ **Packaging attributes integrated** (206 total across all sectors)

| Attribute Category                 | Status              | Count           | Regulations Supported  |
| ---------------------------------- | ------------------- | --------------- | ---------------------- |
| **Packaging Materials**            | ✅ Fully Integrated | 206 attributes  | PPWR, SUP Directive    |
| **Recyclability Flags**            | ✅ Fully Integrated | Included in 206 | PPWR, Circular Economy |
| **CO₂ Emissions Data**             | 📋 Planned          | -               | CSRD/ESRS E1           |
| **Single-Use Plastic (SUP) Flags** | ✅ Fully Integrated | Included in 206 | SUP Directive          |
| **Packaging Weight/Volume**        | ✅ Fully Integrated | Included in 206 | PPWR reporting         |

**Packaging Attribute Coverage by Sector:**

- Food/H&B: 44 packaging-related attributes
- DIY/Garden/Pet: 93 packaging-related attributes
- Healthcare: 0 packaging-related attributes (medical devices)
- GS1 Web Vocabulary: 69 packaging-related properties

**Completed Actions:**

1. ✅ Extracted packaging attributes from all 3 Benelux sectors
2. ✅ Flagged packaging-related attributes in database (packagingRelated field)
3. ✅ Created 408 DIY packaging attribute mappings to PPWR/DPP
4. ✅ Created 217 Food/H&B packaging attribute mappings

**Next Actions:**

- Add dedicated CO₂ emissions attributes (requires PAC list or GDSN extension)
- Link packaging attributes to PPWR Article-specific requirements

---

## 6. Integration Roadmap

### Phase 40 (Completed - Dec 2025): GS1 Data Model Foundation

- ✅ Create GS1_DATA_MODELS.md documentation
- ✅ Design database schema for gs1_attributes, gs1_web_vocabulary, epcis_event_templates
- ✅ Ingest GS1 Benelux Food/H&B attributes (473 attributes)
- ✅ Ingest GS1 Digital Link + Web Vocabulary (608 terms)
- ✅ Create 217 attribute-to-regulation mappings
- ✅ Build GS1AttributesPanel UI component
- 📋 Create EPCIS event templates for EUDR and PPWR (deferred to Phase 43)

### Phase 41 (Completed - Dec 2025): Multi-Sector Expansion

- ✅ Ingest DIY/Garden/Pet sector attributes (3,009 attributes)
- ✅ Ingest Healthcare (ECHO) sector attributes (186 attributes)
- ✅ Create 408 DIY attribute-to-regulation mappings
- ✅ Build multi-sector integration tests
- 📋 Add Agriculture & Fresh sector attributes (pending data model)

### Phase 42 (Current - Dec 2025): Documentation & Feature Gap Closure

- ✅ Create STATUS.md, CHANGELOG.md, update GS1_DATA_MODELS.md
- 👉 Operationalize GS1 Attribute Mapper v0.1 (in progress)
- 👉 Ingest ESRS IG3 datapoints (in progress)
- 👉 Harden cron reliability + monitoring dashboard (in progress)

### Phase 43 (Planned - Q1 2026): DPP & Traceability

- DPP JSON-LD profiles ingestion
- EPCIS event templates (EUDR pilot)
- PAC packaging dataset
- Digital Link URI generator

### Phase 44 (Planned - Q2 2026): User Features & Healthcare

- User auth + saved analyses
- MDR/IVDR regulations
- Compliance alerts + timeline awareness

### Phase 45 (Planned - Q3 2026): Global Expansion

- Ingest GS1 Global Data Model
- Add cross-country attribute harmonization
- Support multi-language attribute descriptions

---

## 7. Data Sources & References

**GS1 Benelux Data Models:**

- Food, Health & Beauty Data Model (Excel/PDF from GS1 NL)
- DIY, Garden & Pet Data Model (Excel/PDF from GS1 NL)
- Healthcare ECHO Data Model (Excel/PDF from GS1 NL)

**GS1 Global Standards:**

- GS1 Web Vocabulary: https://www.gs1.org/voc/
- GS1 Digital Link: https://www.gs1.org/standards/gs1-digital-link
- EPCIS 2.0: https://www.gs1.org/standards/epcis
- GS1 Global Data Model: https://www.gs1.org/standards/gdm

**GS1 DPP Guidance:**

- GS1 EU Digital Product Passport Implementation Guide

---

## 8. Contact & Maintenance

**Document Owner:** ISA Development Team  
**GS1 NL Contact:** [To be added]  
**Update Frequency:** Quarterly or upon major integration milestones

**Change Log:**

- 2025-12-04 (v2.0): Updated with Phase 40-41 completion status, 3-sector coverage (3,668 attributes)
- 2024-12-04 (v1.0): Initial version created based on gap analysis
