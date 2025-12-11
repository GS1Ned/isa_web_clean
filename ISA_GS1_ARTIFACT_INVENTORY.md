# ISA GS1 Artefact Inventory

**Date:** December 10, 2025  
**Purpose:** Track canonical GS1 artefacts for ISA alignment  
**Status:** Inventory of present, acquired, and missing artefacts

---

## Already Present in ISA

### 1. GS1 Web Vocabulary (Ontology)

**Name:** GS1 Web Vocabulary  
**Version:** Latest (continuously updated)  
**Type:** Ontology (JSON-LD)  
**Size:** 2.3MB  
**Canonical URL:** https://www.gs1.org/voc/  
**Local Path:** `/home/ubuntu/isa_web/data/gs1_web_vocab/gs1Voc.jsonld`

**Relevance for ISA:**

- Core GS1 semantic model
- Defines all GS1 entities, properties, and relationships
- Used by Ask ISA for semantic understanding
- Critical for GS1 standards mapping

**Status:** ✅ PRESENT - Already integrated

**ISA Integration:**

- Referenced by semantic mapping logic
- Supports Ask ISA knowledge base
- Informs `gs1_standards` table structure

---

### 2. GS1 NL Data Attribute System (DAS) Explanations

**Name:** GS1 DAS - Explanation on Attributes  
**Version:** 1.2.3 (August 2025)  
**Type:** Reference PDF  
**Size:** 2.2MB (English) + 1.7MB (Dutch)  
**Canonical URL:** GS1 Netherlands member portal (authentication required)  
**Local Path:** `/home/ubuntu/upload/202311-ld-gs1das-explanation-on-attributes-123_aug25.pdf`

**Relevance for ISA:**

- Comprehensive guide to GS1 NL attributes
- Maps to Benelux FMCG and DHZTD data models
- Critical for ESG → GS1 attribute mapping

**Status:** ✅ PRESENT - Summarized in EXTERNAL_REFERENCES.md

**ISA Integration:**

- Informs `gs1_standards` table
- Supports `regulation_gs1_mappings`
- Referenced by News Hub GS1 impact analysis

---

### 3. GS1 Benelux Data Models (DHZTD, FMCG)

**Name:** GS1 Benelux DHZTD Data Model  
**Version:** 3.1.33 (November 2025)  
**Type:** XLSX data model  
**Size:** 12MB (English) + 12MB (Dutch)  
**Canonical URL:** GS1 Netherlands (https://www.gs1.nl)  
**Local Path:** `/home/ubuntu/upload/202511-GS1BeneluxDHZTD3.1.33-EN_0.xlsx`

**Relevance for ISA:**

- Sector-specific data model for sustainable household care and textiles
- Links GS1 attributes to Dutch sustainability initiatives
- Critical for Dutch Initiatives integration

**Status:** ✅ PRESENT - Not yet fully integrated into ISA

**ISA Integration:**

- `server/gs1-benelux-parser.ts` exists for parsing
- Should inform `dutch_initiatives` table
- Future: Extract curated attribute list

---

### 4. Global Product Classification (GPC)

**Name:** GPC as of November 2025  
**Version:** November 2025 (v20251127GB)  
**Type:** JSON/XLSX/XML classification hierarchy  
**Size:** 32MB (JSON) + 6.2MB (XLSX)  
**Canonical URL:** https://www.gs1.org/standards/gpc  
**Local Path:** `/home/ubuntu/upload/GPCasofNovember2025v20251127GB.json`

**Relevance for ISA:**

- Global product classification standard
- 4-level hierarchy (Segment → Family → Class → Brick)
- Potential for product-level ESG analysis

**Status:** ✅ PRESENT - Not yet integrated into ISA

**ISA Integration:**

- Future: Extract curated GPC codes for sector mapping
- Could enhance News Hub sector tagging
- Relevant for product-specific regulations (e.g., PPWR, ESPR)

---

## High-Priority GS1 Artefacts to Acquire

### A. Data Model and Master Data

#### A1. GS1 General Specifications Standard

**Name:** GS1 General Specifications  
**Latest Version:** Release 25.0 (January 2025)  
**Type:** Standard document (PDF)  
**Canonical URL:** https://www.gs1.org/standards/barcodes-epcrfid-id-keys/gs1-general-specifications  
**Estimated Size:** ~500 pages, ~10MB PDF

**Relevance for ISA:**

- **CRITICAL** - Foundation of all GS1 standards
- Defines GTINs, GLNs, SSCCs, and all identification keys
- Specifies Application Identifiers (AIs) for data carriers
- Required for understanding GS1 barcode and Digital Link syntax

**ISA Integration:**

- Should inform `gs1_standards` table (currently has 60 standards)
- Critical for mapping ESG regulations to GS1 identification requirements
- Supports News Hub analysis of GS1 standard updates

**Acquisition Status:** ❌ NOT FOUND - Need user to provide

**Why Not Accessible:**

- GS1 General Specifications requires authentication or purchase
- Not freely available via ref.gs1.org
- User has mentioned having this document - need upload

**Preferred Format:** PDF (for reference) + extracted AI/key definitions (CSV/JSON)

---

#### A2. GS1 System Architecture

**Name:** GS1 System Architecture  
**Latest Version:** Release 12.0 (October 2024)  
**Type:** Standard document (PDF)  
**Canonical URL:** https://www.gs1.org/standards/gs1-system-architecture  
**Estimated Size:** ~100 pages, ~3MB PDF

**Relevance for ISA:**

- **HIGH** - Explains how all GS1 standards fit together
- Defines Single Semantic Model and semantic alignment
- Shows relationships between identification, data carriers, and data exchange

**ISA Integration:**

- Informs ISA architecture understanding
- Supports holistic GS1 → ESG mapping
- Helps explain GS1 standards hierarchy

**Acquisition Status:** ❌ NOT FOUND - Need user to provide

**Why Not Accessible:**

- May require authentication
- User mentioned having this document

**Preferred Format:** PDF (for reference) + architecture diagram extraction

---

#### A3. GS1 Global Data Model (GDM) - Standard Document

**Name:** GS1 Global Data Model  
**Latest Version:** Release 2.16 or later  
**Type:** Standard document (PDF)  
**Canonical URL:** https://www.gs1.org/standards/gs1-global-data-model  
**Estimated Size:** ~200 pages, ~5MB PDF

**Relevance for ISA:**

- **CRITICAL** - Defines all GS1 master data attributes
- Explains attribute structure, definitions, and usage
- Foundation for mapping ESG data requirements to GS1 attributes

**ISA Integration:**

- Should inform `gs1_standards` table
- Critical for `regulation_gs1_mappings`
- Supports Ask ISA responses about GS1 attributes

**Acquisition Status:** ⚠️ PARTIAL - Have "strict dataset" XLSX, need standard document

**Why Not Accessible:**

- Standard document may require authentication
- User mentioned having "strict dataset" (Release 2.16)

**Preferred Format:** PDF (standard document) + CSV (attribute definitions extracted)

---

#### A4. GS1 Attribute Definitions for Business (ADB)

**Name:** GS1 Attribute Definitions for Business  
**Latest Version:** Release 2.11 or later  
**Type:** Standard document (PDF)  
**Canonical URL:** https://www.gs1.org/standards/attribute-definitions-business  
**Estimated Size:** ~150 pages, ~4MB PDF

**Relevance for ISA:**

- **HIGH** - Business-friendly attribute definitions
- Explains how to use GDM attributes in practice
- Critical for ESG → GS1 attribute mapping

**ISA Integration:**

- Complements GDM standard document
- Supports `regulation_gs1_mappings` with business context
- Helps Ask ISA provide practical guidance

**Acquisition Status:** ❌ NOT FOUND - Need user to provide

**Why Not Accessible:**

- May require authentication
- Not found via public search

**Preferred Format:** PDF (for reference) + CSV (attribute definitions)

---

### B. Digital Product Identity / Digital Link / Resolver

#### B1. GS1 Digital Link Standard - URI Syntax

**Name:** GS1 Digital Link Standard - URI Syntax  
**Latest Version:** Version 1.2 or later  
**Type:** Standard document (PDF)  
**Canonical URL:** https://www.gs1.org/standards/gs1-digital-link  
**Estimated Size:** ~80 pages, ~2MB PDF

**Relevance for ISA:**

- **HIGH** - Defines how to encode GS1 keys in URLs
- Critical for Digital Product Passport (DPP) compliance
- Supports PPWR and ESPR regulations

**ISA Integration:**

- Should inform DPP-related regulation mappings
- Supports News Hub coverage of Digital Link updates
- Future: DPP integration roadmap (Q2 2026)

**Acquisition Status:** ❌ NOT FOUND - Need user to provide

**Why Not Accessible:**

- May require authentication
- Not found via public search

**Preferred Format:** PDF (for reference) + URI syntax rules (JSON)

---

#### B2. GS1-Conformant Resolver Standard

**Name:** GS1-Conformant Resolver Standard  
**Latest Version:** Version 1.1 or later  
**Type:** Standard document (PDF)  
**Canonical URL:** https://www.gs1.org/standards/resolver  
**Estimated Size:** ~60 pages, ~2MB PDF

**Relevance for ISA:**

- **MEDIUM** - Defines how to resolve Digital Links to product data
- Relevant for DPP implementation
- Supports traceability use cases

**ISA Integration:**

- Future: DPP integration
- Informs resolver architecture understanding

**Acquisition Status:** ❌ NOT FOUND - Need user to provide

**Why Not Accessible:**

- May require authentication

**Preferred Format:** PDF (for reference)

---

### C. Traceability and Event Data

#### C1. EPCIS & CBV Standard Version 2.0

**Name:** EPCIS & Core Business Vocabulary (CBV) Standard  
**Latest Version:** Version 2.0  
**Type:** Standard document (PDF)  
**Canonical URL:** https://www.gs1.org/standards/epcis  
**Estimated Size:** ~200 pages, ~5MB PDF

**Relevance for ISA:**

- **CRITICAL** - Defines event-based traceability standard
- Required for CSRD Scope 3 emissions, EUDR, PPWR compliance
- Critical for mapping ESG traceability requirements to GS1

**ISA Integration:**

- Should inform traceability-related regulation mappings
- Supports News Hub coverage of EPCIS updates
- `server/epcis-integration.test.ts` exists - shows EPCIS awareness

**Acquisition Status:** ❌ NOT FOUND - Need user to provide

**Why Not Accessible:**

- Standard document may require authentication
- Public EPCIS GitHub repo exists but may not have latest standard PDF

**Preferred Format:** PDF (standard document) + JSON Schema (EPCIS 2.0 events)

---

#### C2. EPC Tag Data Standard (TDS)

**Name:** EPC Tag Data Standard  
**Latest Version:** Version 1.13 or later  
**Type:** Standard document (PDF)  
**Canonical URL:** https://www.gs1.org/standards/tds  
**Estimated Size:** ~100 pages, ~3MB PDF

**Relevance for ISA:**

- **MEDIUM** - Defines RFID tag encoding
- Relevant for traceability and anti-counterfeiting
- Supports EUDR and PPWR use cases

**ISA Integration:**

- Informs RFID-related regulation mappings
- Supports traceability standards understanding

**Acquisition Status:** ❌ NOT FOUND - Need user to provide

**Why Not Accessible:**

- May require authentication

**Preferred Format:** PDF (for reference)

---

### D. Web-Based Vocabularies and Machine-Readable Resources

#### D1. GS1 Application Identifier Browser Dataset

**Name:** GS1 Application Identifier Browser  
**Latest Version:** Continuously updated  
**Type:** Machine-readable dataset (JSON-LD or similar)  
**Canonical URL:** https://www.gs1.org/standards/barcodes/application-identifiers  
**Estimated Size:** ~500KB JSON

**Relevance for ISA:**

- **HIGH** - Machine-readable list of all AIs
- Critical for barcode parsing and validation
- Supports Digital Link and General Specifications understanding

**ISA Integration:**

- Should inform AI-related regulation mappings
- Supports Ask ISA responses about AIs
- Could enhance News Hub AI update tracking

**Acquisition Status:** ⚠️ SEARCHABLE - May be accessible via web scraping

**Why Not Fully Accessible:**

- May require parsing from HTML tables
- JSON-LD version may exist but not easily discoverable

**Preferred Format:** JSON (AI code, title, format, description)

---

#### D2. GS1 Barcode Syntax Resource (BSR)

**Name:** GS1 Barcode Syntax Resource  
**Latest Version:** Continuously updated  
**Type:** Machine-readable syntax rules  
**Canonical URL:** https://ref.gs1.org/tools/gs1-barcode-syntax-resource/  
**Estimated Size:** Unknown

**Relevance for ISA:**

- **MEDIUM** - Machine-readable barcode syntax validation
- Supports barcode parsing and validation
- Relevant for data carrier compliance

**ISA Integration:**

- Future: Barcode validation features
- Informs barcode-related regulation mappings

**Acquisition Status:** ⚠️ SEARCHABLE - May be accessible via API or web scraping

**Why Not Fully Accessible:**

- May require API access or parsing from web interface

**Preferred Format:** JSON (syntax rules)

---

### E. Media and POS / 2D in Retail

#### E1. GS1 Product Image Specification Standard

**Name:** GS1 Product Image Specification  
**Latest Version:** Release 4.4 or later  
**Type:** Standard document (PDF)  
**Canonical URL:** https://www.gs1.org/standards/product-image-specification  
**Estimated Size:** ~80 pages, ~3MB PDF

**Relevance for ISA:**

- **LOW** - Defines product image standards
- Relevant for e-commerce and digital product information
- May support DPP image requirements

**ISA Integration:**

- Future: DPP integration
- Low priority for current ESG focus

**Acquisition Status:** ❌ NOT FOUND - Low priority

**Preferred Format:** PDF (for reference)

---

#### E2. 2D Barcodes at Retail Point-of-Sale Implementation Guideline

**Name:** 2D Barcodes at Retail POS Implementation Guideline  
**Latest Version:** Release 1.0  
**Type:** Implementation guideline (PDF)  
**Canonical URL:** https://www.gs1.org/standards/2d-barcodes-retail-pos  
**Estimated Size:** ~100 pages, ~4MB PDF

**Relevance for ISA:**

- **LOW** - Retail-specific barcode guidance
- May be relevant for PPWR (packaging data carriers)
- Low priority for current ESG focus

**Acquisition Status:** ❌ NOT FOUND - Low priority

**Preferred Format:** PDF (for reference)

---

## Summary Statistics

### Already Present

- ✅ GS1 Web Vocabulary (2.3MB JSON-LD)
- ✅ GS1 NL DAS Explanations (4MB PDFs)
- ✅ GS1 Benelux Data Models (24MB XLSX)
- ✅ GPC November 2025 (38MB JSON/XLSX)

**Total Present:** ~68MB (mostly outside ISA project tree)

### High-Priority Missing (CRITICAL/HIGH)

1. ❌ GS1 General Specifications 25.0 (CRITICAL)
2. ❌ GS1 System Architecture 12.0 (HIGH)
3. ⚠️ GS1 Global Data Model standard document (CRITICAL - have dataset only)
4. ❌ GS1 Attribute Definitions for Business (HIGH)
5. ❌ GS1 Digital Link Standard (HIGH)
6. ❌ EPCIS & CBV 2.0 (CRITICAL)

**Total High-Priority:** 6 artefacts

### Medium-Priority Missing

7. ❌ GS1-Conformant Resolver Standard
8. ❌ EPC Tag Data Standard
9. ⚠️ GS1 Application Identifier Browser (may be web-scrapable)
10. ⚠️ GS1 Barcode Syntax Resource (may be web-scrapable)

**Total Medium-Priority:** 4 artefacts

### Low-Priority Missing

11. ❌ GS1 Product Image Specification
12. ❌ 2D Barcodes at Retail POS Guideline

**Total Low-Priority:** 2 artefacts

---

## Next Steps

### Phase 6 Actions

1. **Attempt Web Acquisition:**
   - Search ref.gs1.org for publicly accessible versions
   - Check GS1 GitHub repositories for open-source artefacts
   - Parse Application Identifier Browser if accessible

2. **Create NEEDS_USER_UPLOAD List:**
   - Compile list of artefacts that require authentication/purchase
   - Specify preferred formats for each
   - Document why each is needed for ISA

3. **Update ISA Integration:**
   - Document how each artefact will be used
   - Plan extraction scripts for large documents
   - Design curated CSV/JSON formats for machine-readable data

---

## Canonical Sources

**Primary:**

- GS1 Global: https://www.gs1.org/standards
- GS1 Reference Portal: https://ref.gs1.org
- GS1 Web Vocabulary: https://www.gs1.org/voc/

**Secondary:**

- GS1 GitHub: https://github.com/gs1
- GS1 Netherlands: https://www.gs1.nl
- EFRAG: https://www.efrag.org/lab6

**Authentication Required:**

- GS1 Member Portal (for some standards)
- GS1 Netherlands Member Portal (for DAS, Benelux models)
