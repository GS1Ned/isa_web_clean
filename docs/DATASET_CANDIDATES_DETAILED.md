# ISA Dataset Candidates - Detailed Analysis

**Generated:** 2025-12-13  
**Source:** INVENTORY_BEFORE.csv  
**Total Candidates:** 82 files  
**Total Size:** 56.4 MB

---

## Overview

Dataset candidates are files with data formats (.xlsx, .csv, .json, .pdf, .zip) and reasonable size (>1KB). This analysis groups them by directory and provides classification recommendations.

---

## Summary by Directory

| Directory | Files | Total Size | Status |
|-----------|-------|------------|--------|
| data/ | 68 files | 53.7 MB | Mixed (canonical + archival + duplicates) |
| docs/ | 2 files | 24.3 KB | Canonical (schema files) |
| drizzle/ | 3 files | 420.0 KB | Supporting (database snapshots) |
| tmp_isa_ingest_missing_files/ | 6 files | 2.9 MB | **REMOVE** (temporary extraction) |
| isa_ingest_missing_files.zip | 1 file | 586.3 KB | **REMOVE** (temporary archive) |
| server/ | 1 file | 51.6 KB | Supporting (EPCIS schema) |
| package.json | 1 file | 4.6 KB | Canonical (project config) |

---

## Detailed File-by-File Analysis

### 1. CANONICAL Datasets (Keep in data/canonical/)

#### GS1 NL/Benelux Sector Models (Already Ingested)
- ✅ `data/standards/gs1-nl/benelux-datasource/v3.1.33/GS1 Data Source Datamodel 3.1.33.xlsx` (7.5 MB)
  - **Status:** CANONICAL
  - **Dataset ID:** gs1nl.benelux.diy_garden_pet.v3.1.33
  - **Ingested:** Yes (3,009 attributes)
  
- ✅ `data/standards/gs1-nl/benelux-datasource/v3.1.33/benelux-fmcg-data-model-31335-nederlands.xlsx` (1.9 MB)
  - **Status:** CANONICAL
  - **Dataset ID:** gs1nl.benelux.fmcg.v3.1.33.5
  - **Ingested:** Yes (473 attributes)
  
- ✅ `data/standards/gs1-nl/benelux-datasource/v3.1.33/common-echo-datamodel_3133.xlsx` (409 KB)
  - **Status:** CANONICAL
  - **Dataset ID:** gs1nl.benelux.healthcare.v3.1.33
  - **Ingested:** Yes (185 attributes)
  
- ✅ `data/standards/gs1-nl/benelux-datasource/v3.1.33/overview_of_validation_rules_for_the_benelux-31334.xlsx` (1.7 MB)
  - **Status:** CANONICAL
  - **Dataset ID:** gs1nl.benelux.validation_rules.v3.1.33.4
  - **Ingested:** Yes (847 rules, 1,055 code lists)

#### ESRS Datapoints
- ✅ `data/efrag/EFRAGIG3ListofESRSDataPoints.xlsx` (248.6 KB)
  - **Status:** CANONICAL
  - **Dataset ID:** esrs.datapoints.ig3
  - **Ingested:** Yes (1,186 datapoints)
  - **Note:** Duplicate exists in tmp_isa_ingest_missing_files/

- ⚠️ `data/efrag/esrs-set1-taxonomy-2024-08-30.xlsx` (1.6 MB)
  - **Status:** CANONICAL (new version)
  - **Dataset ID:** esrs.taxonomy.v2024-08-30
  - **Ingested:** No
  - **Action:** Should be ingested or marked as future version

#### GDSN Current (v3.1.32)
- ✅ `data/gs1/gdsn/gdsn_classes.json` (332.6 KB)
  - **Status:** CANONICAL
  - **Dataset ID:** gdsn.current.v3.1.32
  - **Ingested:** Yes (1,194 product classes)
  - **Note:** Duplicate in tmp_isa_ingest_missing_files/

- ✅ `data/gs1/gdsn/gdsn_classAttributes.json` (1.3 MB)
  - **Status:** CANONICAL
  - **Dataset ID:** gdsn.current.v3.1.32
  - **Ingested:** Yes (2,049 attributes)
  - **Note:** Duplicate in tmp_isa_ingest_missing_files/

- ✅ `data/gs1/gdsn/gdsn_validationRules.json` (1.1 MB)
  - **Status:** CANONICAL
  - **Dataset ID:** gdsn.current.v3.1.32
  - **Ingested:** Yes (1,050 validation rules)
  - **Note:** Duplicate in tmp_isa_ingest_missing_files/

#### CTEs/KDEs and DPP Rules
- ✅ `data/esg/ctes_and_kdes.json` (7.8 KB)
  - **Status:** CANONICAL
  - **Dataset ID:** gs1.ctes_kdes
  - **Ingested:** Yes (50 records)
  - **Note:** Duplicate in data/external/archive2_docs/

- ✅ `data/esg/dpp_identification_rules.json` (10.6 KB)
  - **Status:** CANONICAL
  - **Dataset ID:** eu.dpp.identification_rules
  - **Ingested:** Yes (18 rules)
  - **Note:** Duplicate in data/external/archive2_docs/

- ✅ `data/esg/dpp_identifier_components.json` (8.1 KB)
  - **Status:** CANONICAL
  - **Dataset ID:** eu.dpp.identification_rules
  - **Ingested:** Yes (8 components)
  - **Note:** Duplicate in data/external/archive2_docs/

- ✅ `data/esg/common_data_categories.json` (6.3 KB)
  - **Status:** CANONICAL
  - **Ingested:** Unclear
  - **Action:** Verify ingestion status

#### CBV and Digital Link
- ✅ `data/cbv/cbv_esg_curated.json` (12.2 KB)
  - **Status:** CANONICAL
  - **Dataset ID:** gs1.cbv_digital_link
  - **Ingested:** Yes (24 CBV vocabularies)
  - **Note:** Multiple duplicates (data/cbv_esg_curated.json, tmp_isa_ingest_missing_files/)

- ✅ `data/digital_link/linktypes.json` (13.6 KB)
  - **Status:** CANONICAL
  - **Dataset ID:** gs1.cbv_digital_link
  - **Ingested:** Yes (60 Digital Link types)
  - **Note:** Duplicates in data/gs1_link_types/ and tmp_isa_ingest_missing_files/

---

### 2. SUPPORTING Files (Keep in data/supporting/)

#### Reference Documentation
- 📄 `data/external/archive2_docs/GS1-Standards-Enabling-DPP.pdf` (1.7 MB)
  - **Status:** SUPPORTING
  - **Type:** Reference document
  - **Action:** Keep as supporting reference

- 📄 `data/external/archive2_docs/Core Business Vocabulary (CBV) Standard.pdf` (1.3 MB)
  - **Status:** SUPPORTING
  - **Type:** Standard specification
  - **Action:** Keep as supporting reference

- 📄 `data/standards/gs1-nl/benelux-datasource/v3.1.33/202311-ld-gs1das-toelichting-op-velden-123_aug25.pdf` (1.7 MB)
  - **Status:** SUPPORTING
  - **Type:** Field explanations (Dutch)
  - **Action:** Keep as supporting documentation

#### Supporting Data Files
- 📊 `data/adb_release_2.11.csv` (511.4 KB)
  - **Status:** SUPPORTING
  - **Type:** ADB release data
  - **Action:** Verify if needed for MVP

- 📊 `data/gdm_combined_models.csv` (255.7 KB)
  - **Status:** SUPPORTING
  - **Type:** Combined GDM models
  - **Action:** Verify if needed for MVP

- 📊 `data/cbv_bizstep.json` (3.4 KB)
  - **Status:** SUPPORTING
  - **Type:** CBV business step vocabulary
  - **Action:** Keep as supporting reference

#### Schema Files
- 📋 `server/epcis-schema.json` (51.6 KB)
  - **Status:** SUPPORTING
  - **Type:** EPCIS JSON schema
  - **Action:** Keep in server/ (used by application)

- 📋 `docs/DATASETS_CATALOG.json` (12.5 KB)
  - **Status:** CANONICAL
  - **Type:** Dataset catalog (machine-readable)
  - **Action:** Keep in docs/

- 📋 `docs/datasets-catalog.schema.json` (11.8 KB)
  - **Status:** CANONICAL
  - **Type:** Catalog JSON schema
  - **Action:** Keep in docs/

#### Database Snapshots
- 🗄️ `drizzle/meta/0002_snapshot.json` (149.0 KB)
- 🗄️ `drizzle/meta/0001_snapshot.json` (135.6 KB)
- 🗄️ `drizzle/meta/0000_snapshot.json` (135.2 KB)
  - **Status:** SUPPORTING
  - **Type:** Drizzle ORM migration snapshots
  - **Action:** Keep (required for database migrations)

---

### 3. ARCHIVAL Files (Move to data/archive/)

#### Older Versions
- 📦 `data/standards/gs1-nl/benelux-datasource/v3.1.33/3131_common-echo-datamodel_24-05-2025-v3.xlsx` (985.7 KB)
  - **Status:** ARCHIVAL
  - **Reason:** Older version of ECHO datamodel (v3.1.31 vs v3.1.33)
  - **Action:** Move to data/archive/gs1-nl/v3.1.31/

#### Archive2 Duplicates
- 📦 `data/external/archive2_docs/taxonomy.json` (2.2 MB)
- 📦 `data/external/archive2_docs/taxonomy.xlsx` (215.6 KB)
- 📦 `data/external/archive2_docs/ESRS-Set1-XBRL-Taxonomy.zip` (1.8 MB)
  - **Status:** ARCHIVAL
  - **Reason:** Archive2 reference materials (external repo snapshot)
  - **Action:** Keep in data/external/archive2_docs/ (already properly located)

- 📦 `data/external/archive2_docs/ctes_and_kdes.json` (7.8 KB)
- 📦 `data/external/archive2_docs/dpp_identification_rules.json` (10.6 KB)
- 📦 `data/external/archive2_docs/dpp_identifier_components.json` (8.1 KB)
  - **Status:** ARCHIVAL (duplicates)
  - **Reason:** Duplicates of canonical files in data/esg/
  - **Action:** Keep as archival reference (already in archive2_docs)

#### Metadata
- 📋 `data/metadata/external_repos_archive2.json` (4.6 KB)
  - **Status:** SUPPORTING
  - **Type:** Archive2 metadata
  - **Action:** Keep in data/metadata/

---

### 4. REMOVE (Move to /_Quarantine_Pending_Removal/)

#### Temporary Files
- ❌ `tmp_isa_ingest_missing_files/` (entire directory, 6 files, 2.9 MB)
  - **Reason:** Temporary extraction of files for ingestion (duplicates canonical files)
  - **Files:**
    - gdsn_classAttributes.json (1.3 MB) - duplicate
    - gdsn_validationRules.json (1.1 MB) - duplicate
    - gdsn_classes.json (332.6 KB) - duplicate
    - EFRAGIG3ListofESRSDataPoints.xlsx (248.6 KB) - duplicate
    - linktypes.json (13.6 KB) - duplicate
    - cbv_esg_curated.json (12.2 KB) - duplicate
  - **Action:** Move entire directory to quarantine

- ❌ `isa_ingest_missing_files.zip` (586.3 KB)
  - **Reason:** Temporary archive (source of tmp_isa_ingest_missing_files/)
  - **Action:** Move to quarantine

#### Duplicate Files
- ❌ `data/cbv_esg_curated.json` (12.8 KB)
  - **Reason:** Duplicate of data/cbv/cbv_esg_curated.json
  - **Action:** Move to quarantine

- ❌ `data/gs1_link_types/linktypes.json` (12.6 KB)
  - **Reason:** Duplicate of data/digital_link/linktypes.json
  - **Action:** Move to quarantine (or consolidate directories)

---

### 5. UNCLEAR / NEEDS REVIEW

#### GS1 NL Supporting Files
- ⚠️ `data/standards/gs1-nl/benelux-datasource/v3.1.33/GS1 Data Source webinterface 3.1.33.xlsx` (7.5 MB)
  - **Status:** UNCLEAR
  - **Type:** Web interface data model (possibly duplicate or supplementary)
  - **Action:** Review to determine if canonical or supporting

- ⚠️ `data/standards/gs1-nl/benelux-datasource/v3.1.33/GS1 Data Source Change Datamodel 3.1.33.xlsx` (2.3 MB)
  - **Status:** UNCLEAR
  - **Type:** Change log or delta model
  - **Action:** Review to determine if supporting or archival

- ⚠️ `data/standards/gs1-nl/benelux-datasource/v3.1.33/overview-changes-release-31333-nl.xlsx` (262.3 KB)
  - **Status:** SUPPORTING
  - **Type:** Release change overview
  - **Action:** Keep as supporting documentation

---

## Classification Summary

| Classification | Files | Size | Action |
|----------------|-------|------|--------|
| CANONICAL | 18 files | 18.2 MB | Keep in data/canonical/ or current location |
| SUPPORTING | 15 files | 5.8 MB | Keep in data/supporting/ or current location |
| ARCHIVAL | 10 files | 5.3 MB | Keep in data/archive/ or data/external/archive2_docs/ |
| REMOVE | 14 files | 3.5 MB | Move to /_Quarantine_Pending_Removal/ |
| UNCLEAR | 3 files | 10.0 MB | Requires manual review |

**Total Duplicates Identified:** 8 files (3.0 MB can be removed)

---

## Recommendations

### Immediate Actions
1. **Remove temporary files:** Move tmp_isa_ingest_missing_files/ and .zip to quarantine
2. **Consolidate duplicates:** Remove duplicate CBV and link type files
3. **Review unclear files:** Determine status of GS1 NL webinterface and change datamodel files

### Dataset Registry Updates
1. **Add ESRS taxonomy:** Register esrs-set1-taxonomy-2024-08-30.xlsx as new version
2. **Complete all canonical datasets:** Ensure all ingested datasets have registry entries
3. **Add lineage links:** Connect archival versions to current versions via supersedes/supersededBy

### Directory Restructuring
1. **Consolidate CBV files:** Merge data/cbv/ and data/cbv_esg_curated.json
2. **Consolidate link types:** Merge data/digital_link/ and data/gs1_link_types/
3. **Create canonical structure:** Move all canonical datasets to data/canonical/ with clear subdirectories

---

**Generated by:** ISA Dataset Governance Script  
**Next Step:** Execute classification and move plan
