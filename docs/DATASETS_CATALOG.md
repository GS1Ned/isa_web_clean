# ISA Dataset Catalog

**Version:** 1.0.0  
**Generated:** 2025-12-12  
**Status:** Day-1 Baseline

---

## Overview

This catalog documents all canonical datasets used by ISA for advisory and mapping outputs. Every dataset entry includes versioning metadata, lineage information, and refresh plans to ensure traceability and trust in ISA recommendations.

**Total Datasets:** 5  
**Total Records:** 5,628  
**Coverage:** EU regulations, GS1 standards, GS1 NL sector models

---

## Dataset Inventory

### 1. ESRS Datapoints (EFRAG IG3)

**Dataset ID:** `esrs.datapoints.ig3`  
**Publisher:** EFRAG (EU Body)  
**Status:** Current  
**Priority:** High (MVP)

**Description:**  
European Sustainability Reporting Standards datapoints from EFRAG Implementation Guidance 3. Core dataset for ESRS-to-GS1 mapping.

**Coverage:**
- 1,186 datapoints ingested
- Linked to CSRD regulation (CELEX 32022L2464)
- Covers governance, environmental, and social reporting requirements

**Version:**
- Current: IG3-2024 (Published: 2024-11-01)
- Location: `data/efrag/EFRAGIG3ListofESRSDataPoints(1)(1).xlsx`
- Format: Excel (.xlsx)

**Refresh Plan:**
- Cadence: Semiannual
- Next Review: 2025-06-01
- Watch: https://www.efrag.org/en/news-and-calendar
- Notes: Monitor for IG4 or updated ESRS releases

**Canonical Domains:**
- Regulatory landscape
- Governance and reporting
- Environmental footprints and impacts

**Intended Use:**
- Advisory evidence
- Mapping reference
- Regulation text reference

---

### 2. GDSN Current v3.1.32

**Dataset ID:** `gdsn.current.v3.1.32`  
**Publisher:** GS1 Global  
**Status:** Current  
**Priority:** High (MVP)

**Description:**  
GS1 Global Data Synchronisation Network data model - current production version. Primary GS1 standard for product master data mapping.

**Coverage:**
- 4,293 records total:
  - 1,194 product classes
  - 2,049 attributes
  - 1,050 validation rules

**Version:**
- Current: 3.1.32 (Published: 2024-01-01, Effective: 2024-01-01)
- Location: `data/gs1/gdsn/` (classes, attributes, rules)
- Format: JSON (.json)

**Refresh Plan:**
- Cadence: Quarterly
- Next Review: 2025-03-01
- Watch: https://www.gs1.org/standards/gdsn/release-notes
- Notes: Monitor for v3.1.33 or v3.1.35 releases

**Canonical Domains:**
- GS1 standards models
- Product identity and master data

**Intended Use:**
- Mapping reference
- Standard model reference
- Terminology vocab

**Access:**
- Type: Licensed
- License: GS1 Standards License
- Auth Required: Yes (GS1 membership or license agreement)

---

### 3. GS1 Critical Tracking Events and Key Data Elements

**Dataset ID:** `gs1.ctes_kdes`  
**Publisher:** GS1 Global  
**Status:** Current  
**Priority:** High (MVP)

**Description:**  
GS1 traceability framework: Critical Tracking Events (CTEs) and Key Data Elements (KDEs) for supply chain transparency. Essential for EUDR and supply chain traceability requirements.

**Coverage:**
- 50 records total:
  - 6 Critical Tracking Events
  - 9 Key Data Elements
  - 35 mappings

**Version:**
- Current: 2024 (Published: 2024-01-01)
- Location: `data/esg/CTEs_and_KDEs.json`
- Format: JSON (.json)

**Linked Standards:**
- GS1 EPCIS 2.0

**Linked Regulations:**
- EU Deforestation Regulation (EUDR) - In Force

**Refresh Plan:**
- Cadence: Annual
- Next Review: 2025-06-01
- Watch: https://www.gs1.org/standards/epcis
- Notes: Monitor for EPCIS 2.1 updates

**Canonical Domains:**
- Traceability and events
- Social and due diligence

**Intended Use:**
- Mapping reference
- Terminology vocab
- Advisory evidence

---

### 4. Digital Product Passport Identification Rules

**Dataset ID:** `eu.dpp.identification_rules`  
**Publisher:** European Commission (EU Body)  
**Status:** Current  
**Priority:** High (MVP)

**Description:**  
EU Digital Product Passport identification requirements and product category rules. Critical for DPP compliance mapping to GS1 identifiers.

**Coverage:**
- 26 records total:
  - 8 component categories
  - 18 product rules

**Version:**
- Current: 2024 (Published: 2024-01-01)
- Location: `data/esg/DPP_*.json` (components and rules files)
- Format: JSON (.json)

**Linked Regulations:**
- Ecodesign for Sustainable Products Regulation (ESPR) - In Force

**Refresh Plan:**
- Cadence: Ad-hoc
- Next Review: 2025-03-01
- Watch: https://ec.europa.eu/environment/ecodesign
- Notes: Monitor for delegated acts and implementing regulations

**Canonical Domains:**
- Regulatory landscape
- Product identity and master data
- Circularity and packaging

**Intended Use:**
- Regulation text reference
- Mapping reference
- Advisory evidence

**Access:**
- Type: Open
- License: EU Open Data License

---

### 5. GS1 CBV Vocabularies and Digital Link Types

**Dataset ID:** `gs1.cbv_digital_link`  
**Publisher:** GS1 Global  
**Status:** Current  
**Priority:** Medium (MVP)

**Description:**  
GS1 Core Business Vocabulary (CBV) terms and Digital Link link types for product identification and traceability. Supporting vocabulary for traceability and identification mapping.

**Coverage:**
- 84 records total:
  - 24 CBV vocabularies
  - 60 Digital Link types

**Version:**
- Current: 2024 (Published: 2024-01-01)
- Location: `data/cbv/` and `data/digital_link/`
- Format: JSON (.json)

**Linked Standards:**
- GS1 Core Business Vocabulary (CBV) 2.0
- GS1 Digital Link 1.2

**Refresh Plan:**
- Cadence: Annual
- Next Review: 2025-06-01
- Watch: https://www.gs1.org/standards/cbv
- Notes: Monitor for CBV 2.1 and Digital Link 1.3 releases

**Canonical Domains:**
- GS1 standards models
- Terminology and taxonomies
- Product identity and master data

**Intended Use:**
- Terminology vocab
- Identifier reference
- Mapping reference

**Access:**
- Type: Open
- License: GS1 Standards License

---

## Dataset Metadata Requirements

Per MANUS_EXECUTION_BRIEF Section 5.1, every dataset must include:

| Field | Status |
|-------|--------|
| dataset_id | ✅ Present |
| title | ✅ Present |
| publisher | ✅ Present |
| jurisdiction | ✅ Present |
| domain | ✅ Present |
| version | ✅ Present |
| status | ✅ Present |
| publication_date | ✅ Present |
| retrieved_at | ✅ Present |
| source_url | ✅ Present |
| license | ✅ Present |
| checksum_sha256 | ✅ Present |
| local_path | ✅ Present |
| format | ✅ Present |
| effective_from/to | ✅ Present (where applicable) |
| notes | ✅ Present |

---

## Planned Datasets (Post-MVP)

### GS1 NL Data Source / Benelux Model
- **Status:** Planned
- **Priority:** Critical for MVP completion
- **Notes:** Awaiting official GS1 NL delivery of sector-specific data model

### GDSN Future (v3.1.33 or v3.1.35)
- **Status:** Planned
- **Priority:** High
- **Notes:** For scenario-based advisory outputs and gap analysis

### EU Regulations Full Text
- **Status:** Planned
- **Priority:** Medium
- **Scope:** CSRD, ESPR, PPWR, EUDR, Batteries Regulation
- **Notes:** Curated extracts for requirement mapping

---

## Versioning Policy

**Current vs Future:**
- "Current" = officially released and active in production use
- "Future" = published/announced release for near-future effective window
- "Draft" = proposed or consultation stage
- "Deprecated" = superseded by newer version

**Version Coexistence:**
- Current and future versions must coexist in catalog
- Default outputs reference current versions
- Future versions enable scenario-based advisory outputs
- Planned versions without files are explicitly marked "planned/unverified"

---

## Refresh Triggers

Datasets are reviewed and updated based on:

1. **Scheduled Reviews:** Per dataset update cadence (quarterly, semiannual, annual)
2. **Event Triggers:**
   - GS1 standard releases
   - EU regulation publication or amendment
   - EFRAG guidance updates
3. **Manual Triggers:**
   - GS1 NL priority request
   - Regulatory deadline approaching
   - Mapping gap identified

---

## Quality Assurance

All datasets undergo:

1. **Checksum Validation:** SHA-256 verification on ingestion
2. **Schema Validation:** Format and structure checks
3. **Coverage Assessment:** Record count verification
4. **Lineage Documentation:** Source and transformation tracking
5. **Version Tracking:** Explicit version labels and effective dates

---

## Machine-Readable Catalog

A JSON version of this catalog is available at:
- **Path:** `docs/DATASETS_CATALOG.json`
- **Schema:** `docs/datasets-catalog.schema.json`
- **Format:** JSON Schema Draft 2020-12

Use the JSON catalog for automated validation and tooling integration.

---

**Last Updated:** 2025-12-12  
**Owner:** ISA Project Team  
**Canonical Document:** Yes (v1.0)
