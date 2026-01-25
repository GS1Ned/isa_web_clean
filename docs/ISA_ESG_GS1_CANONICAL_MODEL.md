# ISA ESG & GS1 Canonical Model

**Version:** 1.0  
**Last Updated:** December 11, 2025  
**Status:** Active

---

## Executive Summary

This document defines the **canonical ESG/traceability data model** for the Intelligent Standards Architect (ISA) platform, integrating knowledge from:

1. **GS1 Position Paper:** "Accelerating value chain digitalisation" (2024)
2. **GS1 DPP Provisional Application Standard:** WR# 23-103 (09-Apr-2025)
3. **Existing GS1 artefacts:** General Specifications, System Architecture, GDM, EPCIS/CBV

This model provides the foundation for ISA's cross-regulation harmonization approach, enabling companies to address ESG requirements efficiently without duplicating efforts.

---

## Core Philosophy

### Cross-Regulation Harmonization

**Problem Statement:** Companies face multiple overlapping ESG regulations (CSRD, CSDDD, EUDR, ESPR/DPP, PPWR, etc.) and often treat each in isolation, leading to:

- Duplicated data collection efforts
- Inconsistent data formats
- Manual, inefficient processes (email, Excel)
- Lack of scalability

**ISA's Approach:** Implement a **harmonized cross-regulation data layer** that:

- Identifies **Common Data Categories** that span multiple regulations
- Maps regulations to **Critical Tracking Events (CTEs)** and **Key Data Elements (KDEs)**
- Shows how **GS1 standards** (GTIN, GLN, EPCIS, GDSN, Digital Link) enable compliance across regulations
- Emphasizes **value beyond compliance** (efficiency, decision-making, future-proofing)

### Regulation Classification

**Company-Level Regulations:**

- CSRD (Corporate Sustainability Reporting Directive)
- CSDDD (Corporate Sustainability Due Diligence Directive)
- TCFD (Task Force on Climate-Related Financial Disclosures)

**Product-Level Regulations:**

- EUDR (EU Deforestation Regulation)
- PPWR (Packaging and Packaging Waste Regulation)
- ESPR (Ecodesign for Sustainable Products Regulation)
- DPP (Digital Product Passport)
- CPR (Construction Product Regulation)
- Batteries Regulation

**ISA Implementation:** The `regulations` table includes a `regulationType` enum that distinguishes these categories. ISA should add a `regulationLevel` field (company/product/both) to enable filtering and targeted guidance.

---

## Common Data Categories

### Definition

**Common Data Categories** are harmonized data elements that appear across multiple ESG regulations, representing opportunities for unified data collection and sharing.

### ISA Data Model

**Table:** `esg_data_categories`

**Fields:**

- `categoryId` (unique identifier, e.g., "contact_information")
- `categoryName` (human-readable name)
- `description` (detailed explanation)
- `regulationLevel` (company/product/both)
- `exampleRegulations` (JSON array of regulation codes)
- `likelyGS1Standards` (JSON array of applicable GS1 standards)
- `likelyESGUseCases` (JSON array of use case descriptions)

### Canonical List

1. **Contact Information** - Names, addresses, emails of operators/traders
2. **Country of Production** - Origin country, trade register numbers
3. **Product Description & Information** - Material composition, intended use, lifespan, recyclability
4. **Quantity** - Product quantities for tracking and reporting
5. **GHG Emissions** - Greenhouse gas emissions (scopes 1, 2, 3)
6. **Energy Consumption** - Energy usage across operations and products
7. **Water Usage** - Water consumption and withdrawal data
8. **Origin and Sourcing** - Raw material origin, sourcing practices
9. **Recyclability & Circular Economy** - Recycling, repair, refurbishment attributes
10. **Hazardous Substances** - Substances of concern, chemicals
11. **Human Rights & Social** - Labor practices, human rights, social impact
12. **Governance & Business Conduct** - Corporate governance, ethics, anti-corruption

### ISA UX Integration

**Regulation Detail Pages:**

- Show which Common Data Categories each regulation requires
- Provide visual indicators (icons, color coding) for category overlap
- Link to GS1 standards that enable each category

**Mapping Explorer:**

- Filter regulations by Common Data Category
- Show cross-regulation data reuse opportunities
- Highlight efficiency gains from harmonized approach

---

## Critical Tracking Events (CTEs) & Key Data Elements (KDEs)

### Definition

**Critical Tracking Events (CTEs)** are the critical moments in a product's value chain where data must be recorded for effective traceability.

**Key Data Elements (KDEs)** are the specific data points captured at each CTE, following the **5W+1H framework:**

- **Who** - Physical location handling a product (Where)
- **What** - Product identification, batch/lot/serial, quantity, raw materials
- **When** - Time of event
- **Why** - Activity (bizStep in EPCIS)

### ISA Data Model

**Table:** `critical_tracking_events`

**Fields:**

- `cteId` (unique identifier, e.g., "cte_raw_material_sourcing")
- `cteName` (human-readable name)
- `description` (detailed explanation)
- `typicalKDEs` (JSON array of KDE objects with kde/description/gs1Standard)
- `exampleStandards` (JSON array of applicable GS1 standards)
- `exampleRegulations` (JSON array of regulation codes)

### Canonical CTEs

1. **Raw Material Sourcing** - Origin location → producer
   - KDEs: GLN (origin), GTIN (material), AI (10) batch/lot, AI (30) quantity, AI (11) date, EPCIS bizStep
2. **Production/Manufacturing** - Raw materials → finished products
   - KDEs: GLN (facility), GTIN (product), AI (10) batch, AI (21) serial, AI (30) quantity, AI (11) date, GTIN+AI(10) inputs, EPCIS commissioning
3. **Distribution/Shipping** - Producer → distributor/retailer
   - KDEs: GLN (from/to), GTIN, AI (10) batch, AI (30) quantity, AI (11) date, EPCIS shipping
4. **Receiving** - Arrival at distribution center/warehouse
   - KDEs: GLN (location), GTIN, AI (10) batch, AI (30) quantity, timestamp, EPCIS receiving
5. **Retail Sale** - Sale to end consumer
   - KDEs: GLN (store), GTIN, AI (10) batch, AI (21) serial, AI (30) quantity, timestamp, EPCIS retail_selling
6. **End of Life / Recycling** - Collection for recycling/refurbishment
   - KDEs: GLN (facility), GTIN, AI (10) batch, AI (21) serial, AI (30) quantity, timestamp, EPCIS recycling/repairing/destroying

### ISA UX Integration

**Traceability Planner:**

- Interactive tool to map product flows and identify CTEs
- For each CTE, show required KDEs and applicable GS1 standards
- Generate EPCIS event templates for each CTE

**Regulation Compliance Checker:**

- Input: product category, target regulations
- Output: required CTEs and KDEs for compliance
- Show GS1 standards implementation roadmap

---

## DPP Identification Model

### ESPR/DPP Scope

**In Scope:** Apparel, textiles, footwear, furniture, tyres, bed mattresses, detergents, paints, lubricants, toys, energy-related products, ICT products, electronics, batteries, construction products, intermediary products (iron, steel, chemicals, aluminium)

**Explicitly Excluded:** Food, feed, medicinal products, motor vehicles

### Product Identification Rules

**GTIN (Global Trade Item Number):**

- Formats: GTIN-8, GTIN-12, GTIN-13, GTIN-14
- Application Identifiers:
  - Made-to-Stock: AI (01)
  - Made-to-Order: AI (03) - NOT approved for retail channel
- Uniqueness: Once assigned under ESPR, SHALL not be reused

**Key Qualifiers (depending on delegated act):**

- **Batch/Lot:** AI (10) - for production batch tracking
- **Serial Number:** AI (21) - for individual product instances
- **Version Number:** AI (22) - for product version tracking
- **Made-to-Order Variation:** AI (242) - for configurable products

**Granularity Determination:**
Delegated acts specify minimum granularity level (GTIN, GTIN+version, GTIN+batch/lot, GTIN+serial) per product category.

### Economic Operator Identification

**Party GLN (Global Location Number):**

- Required for: manufacturer/brand owner, authorised representative, importer, distributor, dealer, fulfilment service provider
- Application Identifier: AI (417) - if required by delegated act in AIDC carrier
- Responsibility: Economic operator responsible for making DPP data available is the one placing product on market

### Facility Identification

**GLN of Physical Location:**

- Required for: facility where product was produced
- Use case: Country of production verification, value chain transparency

### Data Carrier Specifications

**Approved Carriers:**

1. **QR Code with GS1 Digital Link URI** (uncompressed)
2. **Data Matrix with GS1 Digital Link URI** (uncompressed)
3. **EPC/RFID** (in addition to QR/Data Matrix, not as replacement)

**GS1 Digital Link Functions:**

- **Public DPP Access:** Full URI with brand owner domain → direct web content access
- **Private DPP Data Access:** Structured URI → identifier parsing for database lookup

**Symbol Placement:**

- Primary: on product itself
- Fallback: on packaging or documentation
- Consideration: must accommodate product lifespan

### ISA Data Model

**Table:** `dpp_product_categories`

**Fields:**

- `productCategory` (unique name)
- `inScope` (boolean)
- `gtinLevel` (allowed GTIN formats)
- `qualifiersRequired` (JSON array: ["batch_lot", "serial_number"])
- `qualifierAIs` (JSON object: {"serial_number": "AI (21)"})
- `glnPartyRequired`, `glnFacilityRequired` (booleans)
- `madeToStockAI`, `madeToOrderAI` (AI codes)
- `recommendedCarriers` (JSON array)
- `regulation` (regulation reference)
- `delegatedActStatus` (finalized/pending/excluded)
- `notes` (additional guidance)

### ISA UX Integration

**DPP Readiness Checker:**

- Input: product category
- Output:
  - In-scope determination
  - Required identifier granularity (GTIN + qualifiers)
  - Required economic operator identification (GLN)
  - Required facility identification (GLN)
  - Recommended data carriers
  - Delegated act status
- Actionable next steps

**Identifier Builder:**

- Interactive tool to construct proper GS1 Digital Link URIs
- Validate identifier syntax
- Generate QR Code / Data Matrix previews
- Provide symbol specification guidance (X-dimension, quality, quiet zone)

---

## Alignment with Existing GS1 Artefacts

### GS1 General Specifications

**Consistency:**

- GTIN allocation rules: ISA's DPP model follows GenSpecs section 4 (GTIN Management Standard)
- GLN usage: ISA follows GenSpecs section 4.5 (GLN rules)
- AI usage: ISA references GenSpecs section 3 (Application Identifiers)
- Data carrier specifications: ISA follows GenSpecs section 5.12 (Symbol Specification Tables)

**Pending GenSpecs Changes (from DPP provisional standard):**

- Rename "Made-to-Order GTIN" to "Compound GTIN"
- Allow AI (22) for party change notifications
- Deprecate Indicator digit 9 for Custom Trade Items
- Develop ASPs for Fixed/Variable Measure Trade Items in General Distribution

### GS1 System Architecture

**Consistency:**

- ISA's layered approach aligns with System Architecture's data generation → collection → processing → reporting layers
- ISA emphasizes Digital Link as the bridge between physical products and digital data
- ISA supports EPCIS as the canonical event-sharing standard

### GS1 Global Data Model (GDM)

**Consistency:**

- ISA's Common Data Categories map to GDM attribute definitions
- ISA references GDM for product composition, recyclability, hazardous substances attributes
- ISA should integrate GDM attribute codes in future releases for precise mapping

**Integration Opportunity:**

- Create explicit mappings between ISA's Common Data Categories and GDM attribute groups
- Use GDM as the canonical source for product attribute definitions

### EPCIS / CBV

**Consistency:**

- ISA's CTEs map directly to EPCIS event types (ObjectEvent, TransactionEvent, TransformationEvent)
- ISA's KDEs map to EPCIS event fields (bizStep, disposition, readPoint, bizLocation, epcList, quantityList)
- ISA's 5W+1H framework aligns with EPCIS's "What, When, Where, Why" model

**Integration:**

- ISA's `epcisEvents` table already stores EPCIS events
- ISA should provide CTE-to-EPCIS event template mappings
- ISA should validate EPCIS events against CTE/KDE requirements

### GS1 NL Sector Data Models

**Consistency:**

- ISA's approach is sector-agnostic but should reference sector-specific models (Benelux FMCG, DIY/TD, DAS) where applicable
- Sector models provide additional granularity for specific industries

**Integration Opportunity:**

- Add sector-specific guidance layers in ISA
- Map sector models to ISA's Common Data Categories and CTEs

---

## Canonical URLs & References

**GS1 Standards:**

- GS1 General Specifications: https://ref.gs1.org
- GS1 System Architecture: https://www.gs1.org/standards/system-architecture
- GS1 Global Data Model: https://www.gs1.org/standards/gs1-global-data-model
- EPCIS: https://www.gs1.org/standards/epcis
- GS1 Digital Link: https://www.gs1.org/standards/gs1-digital-link

**EU Regulations:**

- ESPR: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1781
- Batteries Regulation: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1542
- Construction Products Regulation: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R3110

**GS1 Position Papers:**

- Accelerating value chain digitalisation (2024) - internal document
- Digital Product Passport Provisional Application Standard (WR# 23-103) - internal document

---

## ISA Implementation Roadmap

### Phase 1: Data Model (Completed)

- ✅ Created `esg_data_categories` table
- ✅ Created `critical_tracking_events` table
- ✅ Created `dpp_product_categories` table
- ✅ Created mapping tables (regulation↔data category, data category↔standard)
- ✅ Created JSON seed data files

### Phase 2: UX Integration (In Progress)

- 🔄 Update regulation detail pages to show Common Data Categories
- 🔄 Create Traceability Planner (CTE/KDE mapping tool)
- 🔄 Create DPP Readiness Checker
- 🔄 Create Identifier Builder (GS1 Digital Link URI generator)
- 🔄 Update landing page with cross-regulation harmonization narrative

### Phase 3: Advanced Features (Future)

- ⏳ EPCIS event template generator
- ⏳ GDM attribute integration
- ⏳ Sector-specific guidance layers
- ⏳ Automated compliance gap analysis
- ⏳ Supply chain visualization with CTE overlay

---

## Open Questions & Future Research

1. **GDM Integration:** How to create explicit mappings between ISA's Common Data Categories and GDM attribute groups?
2. **Sector Models:** Which GS1 NL sector models should be prioritized for integration?
3. **EPCIS Validation:** How to validate user-submitted EPCIS events against CTE/KDE requirements?
4. **Digital Link Resolver:** Should ISA provide a Digital Link resolver service for testing?
5. **Delegated Acts:** How to track and update DPP product category requirements as delegated acts are finalized?

---

## Change Log

**Version 1.0 (December 11, 2024):**

- Initial canonical model based on GS1 position paper and DPP provisional standard
- Defined Common Data Categories, CTEs/KDEs, and DPP identification model
- Documented alignment with existing GS1 artefacts
- Created implementation roadmap
