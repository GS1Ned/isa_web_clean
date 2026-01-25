# GS1 Digital Product Passport - Provisional Application Standard

**Source:** GS1 General Specifications Change Notification (GSCN) WR# 23-103  
**Date:** 09-Apr-2025  
**Status:** Provisional (NOT ratified)  
**Pages:** 15

---

## Executive Summary

This provisional GS1 AIDC Application Standard provides normative guidance for ESPR/DPP implementation, specifying which GS1 identifiers, key qualifiers, and data carriers are required for products subject to the EU Digital Product Passport regulation.

**Key Message:** The standard defines how to use GTIN (with qualifiers), GLN (for operators and facilities), and GS1 Digital Link URI syntax in 2D barcodes to enable DPP data access.

---

## Regulatory Context

### ESPR (Ecodesign for Sustainable Products Regulation)

**Adopted:** 2024 by European Commission under EU Green Deal framework  
**Goal:** Reduce lifecycle environmental impacts through efficient digital solutions  
**Key Instrument:** Digital Product Passport (DPP)

**DPP Definition:** A mandatory data structure that simplifies digital access to product-specific information related to sustainability and circularity, enabling B2B, B2C and B2G data exchange.

**Access Method:** Via electronic means through scan of internationally standardised data carrier, enabling direct data accessibility.

**Timeline:** First DPPs fully operational and accessible through EU prioritised products by February 2027.

**Scope:** Product categories defined in delegated acts. Explicitly **excluded**: food, feed, medicinal products, motor vehicles.

---

## Core Identification Requirements

### 1. Product Identification (2.1.X.1)

**Unique Product Identifier Required**

The ISO/IEC 15459 compliant unique product identifier in the GS1 system **SHALL be the GTIN**, possibly in conjunction with a product version, batch/lot or serial number.

**GTIN Formats Allowed:**

- GTIN-8
- GTIN-12
- GTIN-13
- GTIN-14 (NOT for retail point-of-sale)

**Application Identifier (AI) Usage:**

- **Made-to-Stock products:** AI (01) encodes the GTIN
- **Made-to-Order products:** AI (03) encodes the compound GTIN
  - Note: AI (03) has not been approved for retail channel including online marketplaces

**Granularity Levels:**

Delegated acts will specify minimum granularity level (GTIN, GTIN with version, GTIN with batch/lot, or GTIN with serial number) mandatory per product type or lifecycle stage.

**Required Key Qualifiers (depending on delegated act):**

- **Batch/lot number:** AI (10)
- **Serial number:** AI (21)
- **GTIN version number:** AI (22)
- **Made-to-Order variation number:** AI (242)

**Uniqueness Rules:**

- Once a GTIN is assigned to a product under ESPR, it SHALL not be reused per GS1 standards
- The entire identifier (GTIN + mandatory key qualifier) SHALL not be reused for the lifecycle of the product

**GS1 Digital Link URI Syntax:**

Two functions supported by GS1 Digital Link:

1. **Full URI with brand owner domain** → enables link to public DPP information without additional software
2. **Structured URI** → identifier can be parsed from URI, providing unique, persistent, granular identifier for private DPP data including back-up DPP data

### 2. Economic Operator Identification (2.1.X.4)

**Unique Operator Identifier Required**

Economic operators include: manufacturer/brand owner, authorised representative, importer, distributor, dealer, fulfilment service provider.

**GS1 Key:**

- **Party GLN** (Global Location Number)

**Responsibility:** The economic operator responsible for assigning the GTIN is the GTIN allocator and for creating the DPP is the brand owner. The economic operator responsible for making the DPP data available is the one placing the product on the market (e.g., brand owner/manufacturer or authorised representative within EU, or importer).

**Application Identifier:**

- **AI (417)** - Party GLN (if required by delegated act within AIDC carrier for the party responsible for the DPP)

### 3. Facility Identification (2.1.X.5)

**Unique Facility Identifier Required**

Facilities are locations or buildings involved in the value chain of a product. For DPP, the identifier is required for the facility where the product was produced.

**GS1 Key:**

- **GLN of a physical location**

---

## Data Carrier Specifications

### Carrier Choices (Section 2.1.X.1)

**Three approved data carrier options:**

1. **QR Code with GS1 Digital Link URI syntax**
2. **Data Matrix with GS1 Digital Link URI syntax**
3. **EPC/RFID**

**Note:** When EPC/RFID is used, it SHALL be in addition to QR Code or Data Matrix. The SGTIN EPC corresponding to compound key of AI (01) and AI (21) must be used. When the associated barcode carries AI (21), this SHALL encode the same brand owner assigned Serial Number used to encode the Serial Number component of the SGTIN EPC on the EPC/RFID tag.

**Best Practice:** If an ESPR compliant data carrier is already an option in the relevant GS1 identification standard, use only one single data carrier for multiple applications (e.g., scanning at POS and/or in general distribution, access to DPP information, consumer engagement).

**Symbol Placement:**

- Data carrier shall be placed on the product itself or, if not possible, on its packaging or documentation accompanying it
- For multiple barcodes needed for different applications, see section 4.15.1 non-adjacent placement rule

### Product Category-Specific Requirements (2.1.X.6)

**Currently Defined Categories:**

| Product Category                                                                     | Required Granularity Level | Required Data Carrier Options | Regulation   |
| ------------------------------------------------------------------------------------ | -------------------------- | ----------------------------- | ------------ |
| LMT batteries, industrial batteries with capacity >2 kWh, electric vehicle batteries | GTIN + serial number       | QR Code                       | EU 2023/1542 |
| Construction products                                                                | TBD                        | TBD                           | EU 2024/3110 |

**Note:** This section will be continuously updated as more regulations and delegated acts are finalized.

---

## Trade Item Components & Subassemblies (2.1.X.2)

**Scope:** Trade item components (including packaging components), parts or subassemblies that are not subject to ESPR themselves, but are traded between business partners, and may have data that contributes to required DPP data for their parent product.

**Identification:**

- Same GTIN formats allowed (GTIN-8, GTIN-12, GTIN-13, GTIN-14)
- Made-to-Stock: AI (01)
- Made-to-Order: AI (03)

**Required Key Qualifiers (for AI 03):**

- Batch/lot number: AI (10)
- Serial number: AI (21)
- Made-to-Order variation number: AI (242)

**Note:** For parts/components not traded between business partners (internally produced, not sold in aftermarket), this section may be considered but internal numbering may be sufficient.

**Note:** For packaging components used in production that are not themselves traded products (produced internally), see section 2.6.11.

---

## Second-Hand Products (2.1.X.3)

**Scope:** Second-hand products (used, repurposed, refurbished, second life) are explicitly **out of scope**. The requirement for a DPP per ESPR only applies to new products.

**Exception:** A new product carrying an ESPR compliant identification and data carrier according to section 2.1.X.1 becomes a non-new trade item after its first use or customer purchase.

**Allocation Rules:** See section 2.1.15 for rules when a non-new trade item will use the pre-existing GTIN (used when first placed on market) or where a new GTIN is required. See section 6.9 for barcode placement.

---

## Key Terminology & Definitions (Section 9.1)

**Updated Definitions for DPP:**

| Term                                                     | Definition                                                                                                                                                                                                                                                                                      |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **batch/lot**                                            | A subset of a specific trade item associated with a production run, e.g. a specific manufacturing plant, specific date(s) and time(s).                                                                                                                                                          |
| **circular supply chain**                                | Encompasses the supply chain and post-customer lifecycle stages, e.g. repair, recycling.                                                                                                                                                                                                        |
| **trade item component/part**                            | A trade item intended to be incorporated into another trade item without any transformation to the trade item that is incorporated (see intermediary product).                                                                                                                                  |
| **consumer**                                             | A person who buys, hires or receives a product for own use (e.g., retail shopper, online shopper).                                                                                                                                                                                              |
| **delegated act**                                        | Adopted by European Commission to supplement or amend certain elements of a legislative act. For example, a delegated act to the ESPR (EU) 2024/1781 will specify the granularity level of the unique product identification and data requirements for the DPP for a specific product category. |
| **digital product passport**                             | A set of data specific to a physical product that includes the information specified by regulation or industry and that is accessible via electronic means through an AIDC data carrier that links to the information about a product through it's lifecycle.                                   |
| **economic operator**                                    | A business or other organisation which supplies goods, data, or services within the context of market operations.                                                                                                                                                                               |
| **facility**                                             | Locations (e.g., building, kiosk) involved in the value chain or used by actors involved in the value chain.                                                                                                                                                                                    |
| **intermediary product [BRAD: intermediary trade item]** | A trade item that requires further manufacturing or transformation such as mixing, coating or assembling to make it suitable for customers.                                                                                                                                                     |
| **life cycle**                                           | The consecutive and interlinked stages of a product's life, which includes for example raw material acquisition or generation from natural resources, pre-processing, manufacturing, storage, distribution, installation, use, maintenance, repair, upgrading, refurbishment and re-use.        |
| **non-new trade item**                                   | A trade item that is being made available for sale or use after its first use or customer purchase (e.g., used, repurposed, refurbished, second life). [GenSpecs section 2.1.1.4]                                                                                                               |
| **product category [BRAD: trade item category]**         | Trade items that serve similar purposes and are similar in terms of use, or have similar functional properties, and are similar in terms of consumer/customer perception (e.g., apparel, consumer electronics, food and beverage, technical industries, construction).                          |
| **product version**                                      | An alphanumeric attribute of a GTIN assigned to a retail consumer trade item variant version for its lifetime.                                                                                                                                                                                  |
| **recycling**                                            | Any recovery operation by which waste materials are reprocessed into products, materials or substances whether for the original or other purposes.                                                                                                                                              |
| **refurbishment**                                        | Actions carried out to prepare, clean, test, service and, where necessary repair a non-new trade item in order to restore its performance or functionality within the intended use.                                                                                                             |
| **remanufacturing**                                      | A process in which a new trade item is produced from existing trade items and in which at least one change is made that substantially affects the performance, purpose or type of the trade item.                                                                                               |
| **repair**                                               | Actions carried out to return a defective or waste trade item to a condition where it fulfils its intended use.                                                                                                                                                                                 |
| **responsible economic operator**                        | A party who has the responsibility for provision of DPP information.                                                                                                                                                                                                                            |
| **second-hand product**                                  | Tangible movable product that is suitable for further use as it is or after repair or refurbishment.                                                                                                                                                                                            |
| **supply chain**                                         | The full lifecycle of a product from raw materials to delivery to the customer (see also "circular supply chain").                                                                                                                                                                              |
| **trade item instance**                                  | An individual trade item, e.g. a specific can of soup.                                                                                                                                                                                                                                          |
| **value chain**                                          | All activities and processes that are part of the life cycle of a product, as well as its possible remanufacturing.                                                                                                                                                                             |

**Abbreviations:**

- **DPP:** Digital Product Passport
- **ESPR:** Ecodesign for Sustainable Products Regulation

---

## Symbol Specifications

### Symbol X-dimensions and Quality

The standard provides detailed symbol specification tables for different scanning environments:

**Table 1:** Trade items scanned in general retail POS and not general distribution  
**Table 2:** Trade items scanned in general distribution only  
**Table 3:** Trade items scanned at general retail POS and general distribution  
**Table 4:** Trade items not scanned at POS or general retail - also not scanned in general distribution or regulated healthcare  
**Table 7:** Direct part marking

**Key Technical Requirements:**

For **QR Code and Data Matrix with GS1 Digital Link URI:**

- X-dimension ranges from 0.380mm to 0.990mm depending on application
- Minimum symbol height determined by X-dimension and data encoded
- Quality specification: 1.5/08/660 to 1.5/20/660 depending on table
- **GS1 Digital Link URI syntax SHALL use the uncompressed form**

For **Data Matrix (non-POS applications, Table 4):**

- X-dimension: 0.380mm (minimum), 0.380mm (target), 0.495mm (maximum)
- Minimum quality: 1.5/12/660
- Aperture: 80% of smallest X-dimension

**Symbol Placement:**

- Quiet Zone requirements: 1X to 4X on all four sides depending on symbol type
- For direct part marking, specific aperture and quality requirements apply

---

## ISA Integration Points

This DPP standard provides **normative technical specifications** for ISA:

1. **Product category scope** - ISA should maintain a registry of ESPR product categories with their specific identification requirements
2. **Identifier granularity rules** - ISA should guide users on which GTIN qualifiers (batch/lot/serial/version) are mandatory for their product category
3. **Data carrier selection** - ISA should recommend QR Code or Data Matrix with GS1 Digital Link URI as primary carriers
4. **Economic operator & facility identification** - ISA should capture GLN requirements for parties and locations
5. **Component/subassembly tracking** - ISA should support hierarchical product structures where components contribute to parent DPP data
6. **Second-hand product handling** - ISA should clarify that DPP requirements apply only to new products
7. **GS1 Digital Link URI** - ISA should provide tools/validators for proper GS1 Digital Link URI syntax construction

---

## Canonical URLs

- DPP Standard: Not publicly available (uploaded provisional document, WR# 23-103)
- ESPR Regulation: [EU 2024/1781](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1781)
- Batteries Regulation: [EU 2023/1542](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1542)
- Construction Products Regulation: [EU 2024/3110](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R3110)
- ESPR FAQ 61: Referenced for "one globally unique identifier" requirement
- GS1 Reference: https://ref.gs1.org

---

## Important Caveats

**This is a PROVISIONAL standard:**

- NOT ratified by GS1
- Outcome of listed actions is uncertain
- All aspects subject to change prior to ratification
- Multiple ACTION items indicate ongoing work requests to modify GenSpecs sections

**Key Pending Actions:**

- Rename "Made-to-Order GTIN" to "Compound GTIN"
- Allow AI (22) for party change notifications
- Deprecate Indicator digit 9 for Custom Trade Items
- Develop Application Standard Profiles (ASPs) for Fixed/Variable Measure Trade Items in General Distribution
- Complete Product Category column in section 2.1.X.6
- Update symbol specifications for Data Matrix and QR Code with GS1 Digital Link
- Align aperture values to 80% of smallest X-dimension
- Update glossary definitions
