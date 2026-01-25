# GS1 Artefacts Requiring User Upload

**Date:** December 10, 2025  
**Purpose:** Complete list of GS1 artefacts that could not be obtained automatically  
**Status:** Awaiting user upload for 5 high-priority artefacts

---

## High-Priority Artefacts (CRITICAL/HIGH)

### 1. GS1 System Architecture

**Name:** GS1 System Architecture  
**Requested Version:** Release 12.0 (October 2024) or later  
**Type:** Standard document  
**Estimated Size:** ~100 pages, ~3MB PDF

**Why Needed for ISA:**

- **Priority:** HIGH
- Explains how all GS1 standards fit together (identification, data carriers, data exchange)
- Defines Single Semantic Model and semantic alignment principles
- Shows relationships between GS1 standards that ISA must understand
- Critical for holistic GS1 → ESG mapping

**Why Not Accessible:**

- User mentioned having this document (Release 12.0, Oct 2024)
- Not freely available via public search
- May require GS1 authentication or purchase

**Preferred Format:** PDF (for reference) + architecture diagram extraction if possible

**How ISA Will Use It:**

- Inform ISA architecture understanding
- Support holistic GS1 → ESG mapping
- Help explain GS1 standards hierarchy to users
- Update `gs1_standards` table with architecture context

---

### 2. GS1 Global Data Model (Standard Document)

**Name:** GS1 Global Data Model  
**Requested Version:** Release 2.16 or later  
**Type:** Standard document  
**Estimated Size:** ~200 pages, ~5MB PDF

**Why Needed for ISA:**

- **Priority:** CRITICAL
- Defines all GS1 master data attributes (structure, definitions, usage)
- Foundation for mapping ESG data requirements to GS1 attributes
- Explains attribute relationships and dependencies
- Critical for `regulation_gs1_mappings` table

**Why Not Accessible:**

- User mentioned having "strict dataset" (Release 2.16 XLSX)
- Need the **standard document PDF** for comprehensive understanding
- Dataset alone doesn't provide full context and usage guidance
- May require GS1 authentication or purchase

**Preferred Format:** PDF (standard document) + CSV (attribute definitions extracted from PDF or existing dataset)

**How ISA Will Use It:**

- Inform `gs1_standards` table with attribute details
- Critical for `regulation_gs1_mappings` (ESG → GS1 attribute mappings)
- Support Ask ISA responses about GS1 attributes
- Enhance News Hub GS1 impact analysis

**Note:** User has "GS1 Global Data Model – strict dataset (Release 2.16)" in XLSX format. This is helpful but the standard document PDF is still needed for full context.

---

### 3. GS1 Attribute Definitions for Business (ADB)

**Name:** GS1 Attribute Definitions for Business  
**Requested Version:** Release 2.11 or later  
**Type:** Standard document  
**Estimated Size:** ~150 pages, ~4MB PDF

**Why Needed for ISA:**

- **Priority:** HIGH
- Business-friendly attribute definitions (complements GDM)
- Explains how to use GDM attributes in practice
- Provides real-world examples and use cases
- Critical for ESG → GS1 attribute mapping with business context

**Why Not Accessible:**

- Not found via public search
- May require GS1 authentication or purchase
- Likely member-only content

**Preferred Format:** PDF (for reference) + CSV (attribute definitions with business context)

**How ISA Will Use It:**

- Complement GDM standard document
- Support `regulation_gs1_mappings` with business context
- Help Ask ISA provide practical, business-friendly guidance
- Enhance user understanding of GS1 attributes

---

### 4. GS1 Digital Link Standard - URI Syntax

**Name:** GS1 Digital Link Standard - URI Syntax  
**Requested Version:** Version 1.2 or later  
**Type:** Standard document  
**Estimated Size:** ~80 pages, ~2MB PDF

**Why Needed for ISA:**

- **Priority:** HIGH
- Defines how to encode GS1 keys in URLs (GTIN, GLN, etc. → Digital Link)
- **CRITICAL for Digital Product Passport (DPP) compliance**
- Supports PPWR and ESPR regulations (both require DPP)
- Foundation for ISA's future DPP integration (Q2 2026 roadmap)

**Why Not Accessible:**

- Not found via public search
- May require GS1 authentication or purchase
- Standard document likely member-only

**Preferred Format:** PDF (for reference) + JSON (URI syntax rules and patterns)

**How ISA Will Use It:**

- Inform DPP-related regulation mappings (PPWR, ESPR)
- Support News Hub coverage of Digital Link updates
- Foundation for future DPP integration roadmap (Q2 2026)
- Help Ask ISA explain Digital Link to users

---

### 5. EPCIS & CBV Standard Version 2.0 (Standard Document)

**Name:** EPCIS & Core Business Vocabulary (CBV) Standard  
**Requested Version:** Version 2.0  
**Type:** Standard document  
**Estimated Size:** ~200 pages, ~5MB PDF

**Why Needed for ISA:**

- **Priority:** CRITICAL
- Defines event-based traceability standard (GS1's flagship data sharing standard)
- **Required for CSRD Scope 3 emissions, EUDR, PPWR compliance**
- Critical for mapping ESG traceability requirements to GS1
- Foundation for supply chain visibility and transparency

**Why Not Accessible:**

- Found EPCIS Implementation Guideline (publicly accessible)
- Found CBV reference at ref.gs1.org (publicly accessible)
- **Need full standard document PDF** for comprehensive understanding
- Standard document likely requires authentication or purchase

**Preferred Format:** PDF (standard document) + JSON Schema (EPCIS 2.0 event definitions)

**How ISA Will Use It:**

- Inform traceability-related regulation mappings (CSRD, EUDR, PPWR)
- Support News Hub coverage of EPCIS updates
- Enhance `regulation_gs1_mappings` with traceability context
- Foundation for future EPCIS integration (server/epcis-integration.test.ts exists)

**Note:** ISA already has some EPCIS awareness (test file exists), but needs full standard for comprehensive integration.

---

## Medium-Priority Artefacts (Optional)

### 6. GS1-Conformant Resolver Standard

**Name:** GS1-Conformant Resolver Standard  
**Requested Version:** Version 1.1 or later  
**Type:** Standard document  
**Estimated Size:** ~60 pages, ~2MB PDF

**Why Needed for ISA:**

- **Priority:** MEDIUM
- Defines how to resolve Digital Links to product data
- Relevant for DPP implementation
- Supports traceability use cases

**Why Not Accessible:**

- May require GS1 authentication

**Preferred Format:** PDF (for reference)

**How ISA Will Use It:**

- Future: DPP integration
- Inform resolver architecture understanding

---

### 7. EPC Tag Data Standard (TDS)

**Name:** EPC Tag Data Standard  
**Requested Version:** Version 1.13 or later  
**Type:** Standard document  
**Estimated Size:** ~100 pages, ~3MB PDF

**Why Needed for ISA:**

- **Priority:** MEDIUM
- Defines RFID tag encoding for GS1 keys
- Relevant for traceability and anti-counterfeiting
- Supports EUDR and PPWR use cases

**Why Not Accessible:**

- May require GS1 authentication

**Preferred Format:** PDF (for reference)

**How ISA Will Use It:**

- Inform RFID-related regulation mappings
- Support traceability standards understanding

---

## Low-Priority Artefacts (Future)

### 8. GS1 Product Image Specification Standard

**Name:** GS1 Product Image Specification  
**Requested Version:** Release 4.4 or later  
**Type:** Standard document  
**Estimated Size:** ~80 pages, ~3MB PDF

**Why Needed for ISA:**

- **Priority:** LOW
- Defines product image standards for e-commerce
- May support DPP image requirements

**Why Not Accessible:**

- May require GS1 authentication

**Preferred Format:** PDF (for reference)

**How ISA Will Use It:**

- Future: DPP integration (low priority)

---

### 9. 2D Barcodes at Retail Point-of-Sale Implementation Guideline

**Name:** 2D Barcodes at Retail POS Implementation Guideline  
**Requested Version:** Release 1.0  
**Type:** Implementation guideline  
**Estimated Size:** ~100 pages, ~4MB PDF

**Why Needed for ISA:**

- **Priority:** LOW
- Retail-specific barcode guidance
- May be relevant for PPWR (packaging data carriers)

**Why Not Accessible:**

- May require GS1 authentication

**Preferred Format:** PDF (for reference)

**How ISA Will Use It:**

- Future: PPWR data carrier requirements (low priority)

---

## Summary

### High-Priority (Please Upload)

1. ❌ GS1 System Architecture 12.0 (HIGH) - ~3MB PDF
2. ❌ GS1 Global Data Model standard document (CRITICAL) - ~5MB PDF
3. ❌ GS1 Attribute Definitions for Business (HIGH) - ~4MB PDF
4. ❌ GS1 Digital Link Standard (HIGH) - ~2MB PDF
5. ❌ EPCIS & CBV 2.0 standard document (CRITICAL) - ~5MB PDF

**Total High-Priority:** 5 artefacts, ~19MB

### Medium-Priority (Optional)

6. ❌ GS1-Conformant Resolver Standard (MEDIUM) - ~2MB PDF
7. ❌ EPC Tag Data Standard (MEDIUM) - ~3MB PDF

**Total Medium-Priority:** 2 artefacts, ~5MB

### Low-Priority (Future)

8. ❌ GS1 Product Image Specification (LOW) - ~3MB PDF
9. ❌ 2D Barcodes at Retail POS Guideline (LOW) - ~4MB PDF

**Total Low-Priority:** 2 artefacts, ~7MB

**Grand Total:** 9 artefacts, ~31MB

---

## Upload Instructions

### Where to Upload

Please upload files to the Manus workspace. They will be accessible at `/home/ubuntu/upload/`

### Preferred Naming Convention

- Use descriptive names with version numbers
- Example: `GS1-System-Architecture-12.0-Oct2024.pdf`
- Example: `GS1-Global-Data-Model-2.16.pdf`
- Example: `EPCIS-CBV-2.0-Standard.pdf`

### After Upload

Once uploaded, I will:

1. Verify file accessibility and integrity
2. Create structured summaries in EXTERNAL_REFERENCES.md
3. Extract machine-readable data (AIs, attributes, event definitions) to CSV/JSON
4. Update ISA_GS1_ARTIFACT_INVENTORY.md with status
5. Integrate into ISA's GS1 → ESG mapping logic

---

## Alternative: Publicly Accessible Artefacts

### Already Found (No Upload Needed)

1. ✅ **GS1 General Specifications 25.0**
   - URL: https://documents.gs1us.org/adobe/assets/deliver/urn:aaid:aem:afbf55ad-0151-4a0c-8454-d494c0dc9527/GS1-General-Specifications.pdf
   - Status: 522 pages, publicly accessible
   - Action: Documented URL, will extract AI definitions

2. ✅ **EPCIS Implementation Guideline**
   - URL: https://www.gs1.org/docs/epc/EPCIS_Guideline.pdf
   - Status: Publicly accessible
   - Action: Documented URL, complements EPCIS standard

3. ✅ **CBV Standard (Core Business Vocabulary)**
   - URL: https://ref.gs1.org/standards/cbv/
   - Status: Publicly accessible via ref.gs1.org
   - Action: Documented URL, complements EPCIS standard

---

## Questions?

If you have questions about:

- **Why a specific artefact is needed:** See "Why Needed for ISA" sections above
- **Which version to upload:** Latest available version is preferred, but any recent version (2023+) is acceptable
- **Alternative formats:** PDF is preferred for standards, but XLSX/CSV/JSON are acceptable for datasets
- **Priority:** Focus on High-Priority artefacts first (5 artefacts, ~19MB)

---

**Last Updated:** December 10, 2025  
**Status:** Awaiting user upload for 5 high-priority GS1 artefacts  
**Next Steps:** User uploads → Verification → Extraction → Integration into ISA
