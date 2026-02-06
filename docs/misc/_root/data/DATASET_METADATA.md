# ISA Dataset Metadata Catalog

This document tracks all external datasets ingested into ISA, including version information, source files, and effective dates.

## Dataset Inventory

### GDSN Datamodel 3.1.32

**Domain:** GDSN  
**Version:** 3.1.32  
**Status:** Previous (superseded by 3.1.33 from 2025-11-15)  
**Effective From:** 2025-08-23  
**Effective To:** 2025-11-15  
**Source Files:**
- `data/gs1/gdsn/gdsn_classes.json` (1,194 classes)
- `data/gs1/gdsn/gdsn_classAttributes.json` (2,262 class-attribute mappings)
- `data/gs1/gdsn/gdsn_validationRules.json` (1,050 validation rules)

**Source Archive:** `data/external/archive2_docs/GDSN Current v3.1.32.zip`  
**Ingested At:** 2025-12-12  
**Notes:** GS1 global GDSN 3.1.32 datamodel + validation rules. In production from 2025-08-23 to 2025-11-15.

---

### ESRS IG3 Datapoints (Set 1 Taxonomy)

**Domain:** ESRS  
**Version:** Set 1 2024-08-30  
**Status:** Current  
**Effective From:** 2024-08-30  
**Effective To:** null  
**Source Files:**
- `data/efrag/EFRAGIG3ListofESRSDataPoints.xlsx` (1,186 datapoints expected)

**Source URL:** https://www.skatturinn.is/media/arsreikningaskra/EFRAG-IG-3-List-of-ESRS-Data-Points.xlsx  
**Ingested At:** 2025-12-11 (INGEST-03 complete)  
**Notes:** Official EU disclosure requirements for sustainability reporting. All 12 ESRS standards (ESRS 2, 2 MDR, E1-E5, S1-S4, G1).

---

### CBV ESG Curated Vocabularies

**Domain:** CBV  
**Version:** 2025-Q4 (curated)  
**Status:** Current  
**Effective From:** 2025-12-12  
**Effective To:** null  
**Source Files:**
- `data/cbv/cbv_esg_curated.json` (8 vocabulary categories)

**Source:** Curated from GS1 Core Business Vocabulary Standard  
**Ingested At:** 2025-12-12  
**Notes:** ESG-relevant CBV vocabularies mapped to EUDR/CSRD/PPWR regulations. Includes BizSteps, Dispositions, TransactionTypes, SensorTypes.

---

### GS1 Digital Link Relationship Types

**Domain:** Digital Link  
**Version:** 1.2  
**Status:** Current  
**Effective From:** 2024-01-01  
**Effective To:** null  
**Source Files:**
- `data/digital_link/linktypes.json` (60 link types)

**Source URL:** https://www.gs1.org/voc/?show=linktypes  
**Ingested At:** 2025-12-12  
**Notes:** GS1 Digital Link relationship types for semantic web linking.

---

### Critical Tracking Events (CTEs) and Key Data Elements (KDEs)

**Domain:** ESG Traceability  
**Version:** 1.0  
**Status:** Current  
**Effective From:** 2025-12-12  
**Effective To:** null  
**Source Files:**
- `data/esg/ctes_and_kdes.json` (6 CTE records)

**Source:** GS1 ESG traceability standards  
**Ingested At:** Pending (INGEST-04)  
**Notes:** Critical Tracking Events and Key Data Elements for EUDR/CSDDD compliance.

---

### DPP Identification Rules

**Domain:** Digital Product Passport  
**Version:** 1.0  
**Status:** Current  
**Effective From:** 2025-12-12  
**Effective To:** null  
**Source Files:**
- `data/esg/dpp_identifier_components.json` (7 components)
- `data/esg/dpp_identification_rules.json` (18 rules)

**Source:** GS1 Standards Enabling DPP  
**Ingested At:** Pending (INGEST-05)  
**Notes:** GS1 key components (GTIN, GLN, SSCC, etc.) and identification rules for DPP by product category.

---

## Versioning Strategy

ISA follows a version-aware data model:

1. **Track dataset versions centrally** - All ingested data is linked to a specific version
2. **Link ingested rows to source version** - Each canonical table includes `standard_version_id` FK
3. **Explicit version awareness in outputs** - All ISA analysis displays source version metadata
4. **Support historical and future views** - Query data "as-of" specific dates

### Future Versions

- **GDSN 3.1.33** - In production from 2025-11-15 (to be ingested as INGEST-02b)
- **GDSN 3.1.35** - Planned for May 2026 (future release)
- **ESRS Set 2** - Expected 2026 (future taxonomy updates)

## File Checksums

```bash
# GDSN 3.1.32
sha256sum data/gs1/gdsn/gdsn_classes.json
sha256sum data/gs1/gdsn/gdsn_classAttributes.json
sha256sum data/gs1/gdsn/gdsn_validationRules.json

# ESRS IG3
sha256sum data/efrag/EFRAGIG3ListofESRSDataPoints.xlsx

# CBV ESG
sha256sum data/cbv/cbv_esg_curated.json

# Digital Link
sha256sum data/digital_link/linktypes.json
```

## Maintenance

This catalog should be updated whenever:
- New dataset versions are ingested
- Effective dates change (e.g., GDSN 3.1.33 becomes current)
- Source files are updated or replaced
- New data domains are added to ISA
