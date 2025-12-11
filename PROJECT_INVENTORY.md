# ISA Project Inventory

**Date:** December 10, 2025  
**Purpose:** Comprehensive inventory for size reduction and GS1 alignment  
**Total Project Size:** 791MB

---

## Directory-Level Breakdown

| Directory      | Size  | % of Total | Classification                      |
| -------------- | ----- | ---------- | ----------------------------------- |
| `node_modules` | 752MB | 95.1%      | DEPENDENCIES (exclude from cleanup) |
| `dist`         | 19MB  | 2.4%       | BUILD_OUTPUT (regenerable)          |
| `.git`         | 10MB  | 1.3%       | VERSION_CONTROL (preserve)          |
| `data`         | 3.9MB | 0.5%       | CORE_DATA_MODEL + HEAVY_REFERENCE   |
| `docs`         | 1.7MB | 0.2%       | CORE_DOMAIN_DOC + MEDIA             |
| `client`       | 1.6MB | 0.2%       | CORE_CODE                           |
| `server`       | 1.3MB | 0.2%       | CORE_CODE                           |
| `drizzle`      | 576KB | 0.1%       | CORE_CODE (schema + migrations)     |
| `.manus`       | 284KB | <0.1%      | PLATFORM_CONFIG (preserve)          |
| `scripts`      | 112KB | <0.1%      | CORE_CODE                           |
| `shared`       | 20KB  | <0.1%      | CORE_CODE                           |
| `patches`      | 8KB   | <0.1%      | CORE_CODE                           |

**Total (excluding node_modules):** 39MB

---

## File Classification

### CORE_CODE (Preserve)

**Total:** ~3.0MB

- `client/src/**/*.tsx` - React components (1.6MB)
- `server/**/*.ts` - Backend logic, routers, scrapers (1.3MB)
- `drizzle/schema.ts` - Database schema (576KB)
- `scripts/**/*.ts` - ETL and utility scripts (112KB)
- `shared/**/*.ts` - Shared types (20KB)
- Config files: `package.json`, `tsconfig.json`, `vite.config.ts`, etc.

**Action:** PRESERVE ALL

---

### CORE_DATA_MODEL (Preserve, but optimize)

**Total:** ~2.5MB

**Current Files:**

1. `data/gs1_web_vocab/gs1Voc.jsonld` - 2.3MB
   - GS1 Web Vocabulary (canonical ontology)
   - Used by: semantic mapping, Ask ISA knowledge base
   - **Action:** KEEP (essential for GS1 alignment)

2. `data/efrag/esrs-set1-taxonomy-2024-08-30.xlsx` - 1.6MB
   - EFRAG ESRS taxonomy
   - Used by: ESRS datapoint ingestion
   - **Action:** KEEP (core ESG data source)

**Total After Optimization:** 3.9MB (no reduction possible, both essential)

---

### CORE_DOMAIN_DOC (Preserve, consolidate)

**Total:** ~1.7MB

**Documentation Files (text):**

- `ARCHITECTURE.md` - 76KB ✅ Recently updated
- `DATA_MODEL.md` - 64KB ✅ Recently updated
- `ROADMAP.md` - 28KB ✅ Recently updated
- `NEWS_PIPELINE.md` - 12KB
- `STATUS.md` - 12KB
- `GS1_DATA_MODELS.md` - 16KB
- `Dutch_Initiatives_Data_Model.md` - 12KB
- `CHANGELOG.md` - 8KB
- `README.md` - 8KB
- Other planning docs - ~50KB

**Total Text Docs:** ~300KB

**Media Files (diagrams):**

- `docs/isa_implementation_timeline.png` - 564KB
- `docs/isa_architecture.png` - 408KB
- `docs/isa_data_flow.png` - 244KB
- `docs/isa_cicd_pipeline.png` - 104KB

**Total Media:** ~1.3MB

**Action:**

- PRESERVE all text docs (essential understanding)
- PRESERVE diagrams (valuable visual references)
- **Potential savings:** Minimal (~100KB by removing duplicate/outdated docs)

---

### EXTERNAL_REPO_ARCHIVE (Remove)

**Total:** 0MB

**Finding:** NO external repository zip files found in ISA project directory

**Expected files (from directive):**

- vc-data-model-verifier-main.zip
- gs1-data-source-datamodel-3133.zip
- EPCIS-master.zip
- WebVoc-master.zip
- GS1DigitalLinkToolkit.js-master.zip
- etc.

**Status:** ✅ Already clean - no zip archives to remove

**Action:** SKIP Slice A (already complete)

---

### LARGE_DATASET (Convert to curated formats)

**Total:** ~70MB (in /home/ubuntu/upload, not in project)

**Files in /home/ubuntu/upload:**

#### GPC (Global Product Classification)

1. `GPCasofNovember2025v20251127GB.json` - 32MB
2. `GPCasofNovember2025v20251127GB.xlsx` - 6.2MB
3. `gpc-in-a-nutshell_jun24-def.pdf` - 292KB

**Status:** NOT currently in ISA project tree  
**Usage:** Not yet integrated into ISA  
**Action:**

- Create curated GPC subset (codes + descriptions + hierarchy)
- Extract to CSV (~500KB estimated)
- Document canonical source: gs1.org/gpc

#### GS1 Benelux Data Models

1. `202511-GS1BeneluxDHZTD3.1.33-EN_0.xlsx` - 12MB
2. `202511-GS1BeneluxDHZTD3.1.33-NL.xlsx` - 12MB
3. `benelux-fmcg-data-model-31335-english.xlsx` - 2.0MB
4. `benelux-fmcg-data-model-31335-nederlands.xlsx` - 2.0MB
5. `common-echo-datamodel_3133.xlsx` - 409KB
6. `overview_of_validation_rules_for_the_benelux-31334.xlsx` - 1.7MB
7. `gs1-data-source-datamodel-3133.zip` - 20MB

**Total Benelux:** ~52MB

**Status:** NOT in ISA project tree (in /upload only)  
**Current Integration:** `server/gs1-benelux-parser.ts` exists but may not use these files  
**Action:**

- Determine which attributes ISA actually needs
- Extract to curated CSV/JSON (~2MB estimated)
- Move originals out of active tree or document download links

#### EFRAG/ESG Reference Materials

1. `EFRAGIG3ListofESRSDataPoints(1)(1).xlsx` - 249KB
2. `DraftEFRAGIG3ListofESRSDataPoints231222.xlsx` - 165KB
3. Multiple EFRAG IG PDFs (IG1, IG2, IG3) - ~10MB total

**Status:** Some in /upload, some may be duplicates  
**Current Integration:** ISA uses ESRS taxonomy XLSX in `data/efrag/`  
**Action:** See HEAVY_REFERENCE section below

---

### HEAVY_REFERENCE (Replace with summaries + URLs)

**Total:** ~20MB (in /upload)

**EFRAG Implementation Guidance PDFs:**

1. `IG1MaterialityAssessment_final.pdf` - 1.6MB
2. `EFRAGIG2ValueChain_final.pdf` - 1.4MB
3. `efrag-ig-3-list-of-esrs-data-points---explanatory-note.pdf` - 682KB
4. `efrag-ig-3-list-of-esrs-data-points---feedback-statement.pdf` - 662KB
5. Draft versions and duplicates - ~5MB

**Total EFRAG PDFs:** ~10MB

**GS1 NL DAS Attribute Explanation:**

1. `202311-ld-gs1das-explanation-on-attributes-123_aug25.pdf` - 2.2MB (English)
2. `202311-ld-gs1das-toelichting-op-velden-123_aug25.pdf` - 1.7MB (Dutch)

**Total GS1 NL:** ~4MB

**DHZTD GDSN Industry Agreements:**

1. `DHZTD_GDSN_IndustryAgreements_3.1.19.pdf` - 1.6MB

**GPC Reference:**

1. `gpc-in-a-nutshell_jun24-def.pdf` - 292KB

**GS1 Release Notes:**

1. `ReleasenotesNovember2025Publication.pdf` - 347KB

**Status:** All in /upload directory, NOT in ISA project tree  
**Usage:** Reference-only (not parsed programmatically)  
**Action:**

- Create Markdown summaries for each
- Document canonical URLs (EFRAG, GS1)
- Remove PDFs from active tree (keep in /upload as backup)
- **Estimated savings:** ~20MB (if moved out of project)

---

### MEDIA (Optimize)

**Total:** ~1.3MB (in docs/) + screenshots

**Diagrams in docs/:**

- `isa_implementation_timeline.png` - 564KB
- `isa_architecture.png` - 408KB
- `isa_data_flow.png` - 244KB
- `isa_cicd_pipeline.png` - 104KB

**Status:** Used by documentation  
**Action:** PRESERVE (valuable visual references)

**Screenshots in /home/ubuntu/screenshots:**

- Various ref.gs1.org, gs1.nl, gs1isa.com screenshots
- Used for: debugging, reference

**Action:**

- Remove old/unused screenshots
- **Estimated savings:** ~2-5MB

---

### LOGS_AND_SCRATCH (Remove)

**Total:** Unknown (need to search)

**Expected locations:**

- `*.log` files
- Debug JSON/CSV dumps
- Temporary test data

**Action:** Search and remove (Phase 5)

---

## Size Reduction Opportunities

### High-Impact (>10MB savings)

1. **LARGE_DATASET in /upload:** ~70MB
   - Convert GPC (38MB) → curated CSV (~500KB)
   - Convert Benelux models (52MB) → curated CSV (~2MB)
   - **Savings:** ~65MB

2. **HEAVY_REFERENCE PDFs in /upload:** ~20MB
   - Replace with Markdown summaries + URLs
   - **Savings:** ~20MB

**Total High-Impact:** ~85MB savings

### Medium-Impact (1-10MB)

3. **Build output (dist/):** 19MB
   - Can be regenerated
   - **Savings:** 19MB (if removed from git)

4. **Screenshots:** ~5MB
   - Remove old/unused
   - **Savings:** ~3-5MB

**Total Medium-Impact:** ~22-24MB savings

### Low-Impact (<1MB)

5. **Duplicate/outdated docs:** ~100KB
6. **Logs and scratch files:** Unknown

**Total Low-Impact:** ~100KB-1MB

---

## Current Project Status

### ✅ Already Clean

- No external repository zip files
- No large datasets in active project tree
- No heavy PDFs in active project tree
- Code is well-organized and minimal

### ⚠️ Optimization Opportunities

- Large datasets in /upload not yet integrated
- Heavy PDFs in /upload not yet summarized
- Build output in git (19MB)

### 📊 Size Summary

**Current ISA Project Tree:** 791MB

- node_modules: 752MB (exclude)
- Active code + data + docs: 39MB

**After Cleanup (estimated):**

- Active code + data + docs: 15-20MB
- **Savings:** 19-24MB (50-60% reduction in active tree)

---

## Next Steps

1. **Skip Slice A** - No external repo archives to remove
2. **Execute Slice B** - Convert large datasets (if needed for ISA)
3. **Execute Slice C** - Summarize heavy PDFs
4. **Execute Slice D** - Remove unused media/logs
5. **Verify** - Run tests and builds after each slice

---

## GS1 Artefact Status

### Already Present

1. ✅ GS1 Web Vocabulary (gs1Voc.jsonld) - 2.3MB
2. ✅ GS1 NL DAS Attribute Explanations (PDFs in /upload)
3. ✅ GS1 Benelux Data Models (XLSX in /upload)
4. ✅ GPC November 2025 (JSON/XLSX in /upload)

### Missing (Need to Acquire)

See Phase 6 for full GS1 artefact acquisition plan

---

## Dependencies to Check

Before removing any file, verify:

1. Not imported by TypeScript code
2. Not referenced in documentation
3. Not used by ETL scripts
4. Not required by tests
5. Canonical source exists and is accessible
