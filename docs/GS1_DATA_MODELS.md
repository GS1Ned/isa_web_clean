# GS1 Data Models Integration Status

**Document Version:** 1.0  
**Last Updated:** December 4, 2024  
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

| Standard | Status | Description | ISA Integration |
|----------|--------|-------------|-----------------|
| **GTIN** (Global Trade Item Number) | 🟡 Partially Integrated | Product identification | Used in product mappings, not yet in full master data integration |
| **GLN** (Global Location Number) | 🟡 Partially Integrated | Organization/location identification | Used in organization references |
| **SSCC** (Serial Shipping Container Code) | 🟡 Partially Integrated | Logistics unit identification | Referenced in standards list, not in active use |
| **GPC** (Global Product Classification) | 🟡 Partially Integrated | Product categorization | Used for sector-based filtering, not full taxonomy ingested |
| **GRAI** (Global Returnable Asset Identifier) | ❌ Not Integrated | Returnable asset tracking | Relevant for circular economy/PPWR |
| **GIAI** (Global Individual Asset Identifier) | ❌ Not Integrated | Fixed asset tracking | Niche use cases |
| **GMN** (Global Model Number) | ❌ Not Integrated | Model/design identification | Lower priority |
| **GDTI** (Global Document Type Identifier) | ❌ Not Integrated | Document tracking | Lower priority |
| **GSRN** (Global Service Relation Number) | ❌ Not Integrated | Service relationship tracking | Lower priority |

**Next Actions:**
- Ingest full GPC taxonomy for sector-based ESG requirement filtering
- Add GRAI for PPWR circular economy use cases

---

### 1.2 GS1 Data Source / GDSN Benelux Data Models

**Critical Gap:** Full attribute catalogs not yet ingested

| Sector Model | Status | Priority | Attributes Count | ESG Relevance |
|--------------|--------|----------|------------------|---------------|
| **Food, Health & Beauty** | 📋 Planned | **HIGH** | ~500+ attributes | Packaging, materials, origin, nutrition, safety, sustainability flags |
| **DIY, Garden & Pet** | 📋 Planned | **HIGH** | ~400+ attributes | Materials, chemicals, recyclability, hazard classifications |
| **Healthcare (ECHO)** | 📋 Planned | **MEDIUM** | ~300+ attributes | Medical device safety, materials, sterilization, traceability |
| **Agriculture & Fresh** | ❌ Not Integrated | MEDIUM | ~200+ attributes | Origin, farming methods, certifications |

**Database Schema Planned:**
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

**Next Actions:**
1. Obtain GS1 Benelux data model files (Excel/PDF format)
2. Build parser to extract attributes, datatypes, code lists
3. Ingest Food/H&B sector first (highest ESG impact)
4. Link attributes to ESRS datapoints via Attribute Mapper

---

### 1.3 GS1 Global Data Model

| Component | Status | Description | ISA Integration |
|-----------|--------|-------------|-----------------|
| **GS1 Global Data Model (GDM)** | ❌ Not Integrated | Harmonized global attribute definitions | Needed for scaling beyond NL/Benelux |
| **GS1 Master Data Standards** | ❌ Not Integrated | Business rules for data quality | Future integration for data validation |

**Next Actions:**
- Ingest GDM core attributes as separate layer linked to Benelux models
- Use for cross-country ISA deployment

---

## 2. Event & Traceability Standards

### 2.1 EPCIS 2.0 + Core Business Vocabulary (CBV)

**Critical Gap:** Event schemas and templates not yet integrated

| Component | Status | Priority | ESG Use Cases |
|-----------|--------|----------|---------------|
| **EPCIS 2.0 Event Model** | 📋 Planned | **HIGH** | EUDR traceability, PPWR lifecycle tracking, food safety |
| **CBV Vocabulary** | 📋 Planned | **HIGH** | Standardized event types, business steps, dispositions |
| **Event Templates** | 📋 Planned | **HIGH** | Canonical flows for timber chain, packaging lifecycle |

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

| Standard | Status | Description | ESG Relevance |
|----------|--------|-------------|---------------|
| **SSCC** (Shipping Container) | 🟡 Partially Integrated | Logistics unit tracking | Scope 3 emissions, waste tracking |
| **GSIN** (Shipment Identification) | ❌ Not Integrated | Shipment-level tracking | Transport emissions |
| **GINC** (Consignment Identification) | ❌ Not Integrated | Consignment tracking | Logistics optimization |

**Next Actions:**
- Model logistics identifiers for Scope 3 emissions calculations
- Link to EPCIS events for end-to-end traceability

---

## 3. Web & Digital Product Passport Standards

### 3.1 GS1 Digital Link + GS1 Web Vocabulary

**Critical Gap:** JSON-LD properties and URI patterns not ingested

| Component | Status | Priority | DPP Relevance |
|-----------|--------|----------|---------------|
| **GS1 Digital Link URI Syntax** | 📋 Planned | **HIGH** | Web-friendly product identifiers for DPP |
| **GS1 Web Vocabulary (JSON-LD)** | 📋 Planned | **HIGH** | Semantic product data for DPP/ESPR |
| **DPP GS1 Guidance** | 📋 Planned | **HIGH** | Official GS1 EU DPP implementation guide |

**Database Schema Planned:**
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

**Key Properties to Ingest:**
- Product identification (gtin, brand, productName)
- Sustainability (recyclablePackaging, sustainabilityCertification, carbonFootprint)
- Materials (material, materialComposition, chemicalSubstance)
- Origin (countryOfOrigin, placeOfItemActivity)
- Compliance (regulatoryPermit, certification, safetyDataSheet)

**Next Actions:**
1. Parse GS1 Web Vocabulary JSON-LD schema
2. Extract all classes and properties
3. Map properties to DPP requirements and ESRS datapoints
4. Build Digital Link URI generator in ISA

---

## 4. Messaging & EDI Standards

### 4.1 GS1 EDI Messages

| Message Type | Status | Description | ESG Relevance |
|--------------|--------|-------------|---------------|
| **ORDERS** | ❌ Not Integrated | Purchase orders | Sustainability clauses, packaging requirements |
| **DESADV** | ❌ Not Integrated | Despatch advice | Shipment details for Scope 3 |
| **INVOIC** | ❌ Not Integrated | Invoices | Sustainability charges, green tariffs |
| **RECADV** | ❌ Not Integrated | Receiving advice | Return packaging tracking |

**Priority:** Medium (future integration for transactional ESG data)

---

## 5. Sector-Specific Extensions

### 5.1 Packaging & Sustainability Attributes (PAC List)

**Critical Gap:** Packaging-related attributes not yet ingested

| Attribute Category | Status | Priority | Regulations Supported |
|--------------------|--------|----------|----------------------|
| **Packaging Materials** | 📋 Planned | **HIGH** | PPWR, SUP Directive |
| **Recyclability Flags** | 📋 Planned | **HIGH** | PPWR, Circular Economy |
| **CO₂ Emissions Data** | 📋 Planned | **HIGH** | CSRD/ESRS E1 |
| **Single-Use Plastic (SUP) Flags** | 📋 Planned | **HIGH** | SUP Directive |
| **Packaging Weight/Volume** | 📋 Planned | MEDIUM | PPWR reporting |

**Next Actions:**
- Extract packaging attributes from Benelux Food/H&B and DIY models
- Create dedicated PAC attribute category
- Link to PPWR and SUP Directive requirements

---

## 6. Integration Roadmap

### Phase 40 (Current): GS1 Data Model Foundation
- ✅ Create GS1_DATA_MODELS.md documentation
- 📋 Design database schema for gs1_attributes, gs1_web_vocabulary, epcis_event_templates
- 📋 Ingest GS1 Benelux Food/H&B attributes
- 📋 Ingest GS1 Digital Link + Web Vocabulary
- 📋 Create EPCIS event templates for EUDR and PPWR

### Phase 41 (Q1 2025): Attribute Mapper Enhancement
- Build UI for "GS1 attributes you need" on regulation pages
- Show attributes and events on GS1 standard detail pages
- Add sector-based attribute recommendations
- Implement attribute search and filtering

### Phase 42 (Q2 2025): Full Benelux Coverage
- Ingest DIY/Garden/Pet sector attributes
- Ingest Healthcare (ECHO) sector attributes
- Add Agriculture & Fresh sector attributes
- Complete PAC list integration

### Phase 43 (Q3 2025): Global Expansion
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
- 2024-12-04: Initial version created based on gap analysis
