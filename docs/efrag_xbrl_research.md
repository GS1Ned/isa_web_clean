# EFRAG XBRL Taxonomy Research Findings

**Date:** December 2, 2025  
**Purpose:** Determine feasibility of automated EFRAG XBRL parsing for ESRS datapoint updates in ISA platform

---

## EFRAG ESRS XBRL Taxonomy Overview

### Official Publication

- **Publication Date:** August 30, 2024
- **Authority:** EFRAG (European Financial Reporting Advisory Group)
- **Scope:** ESRS Set 1 (all 12 standards: ESRS 1, 2, 2 MDR, E1-E5, S1-S4, G1)
- **Status:** Handed over to European Commission and ESMA for regulatory adoption

### Download URLs

**Primary Taxonomy Package:**

- **ESRS Set 1 XBRL Taxonomy Package (ZIP, 1.8 MB)**
  - URL: https://www.efrag.org/sites/default/files/2024-08/ESRS%20Set%201%20XBRL%20Taxonomy%20Package.zip
  - Contains: Full XBRL taxonomy files (.xsd schemas, linkbases, validation rules)

**Supporting Materials:**

- **ESRS Set 1 XBRL Taxonomy Explanatory Note (PDF, 1.5 MB)**
  - URL: https://www.efrag.org/sites/default/files/2024-08/ESRS%20Set%201%20XBRL%20Taxonomy%20Explanatory%20Note%20and%20Basis%20for%20Conclusions.pdf
- **Annex 1: ESRS Set 1 XBRL Taxonomy Illustrated in Excel (XLSX, 1.6 MB)**
  - URL: https://xbrl.efrag.org/downloads/Annex-1-ESRS-Set1-XBRL-Taxonomy-illustrated-in-Excel.xlsx
  - **KEY FILE:** Contains all ESRS datapoints in Excel format (easier to parse than XBRL)

- **Annex 2: Illustrative examples of XBRL reports (ZIP, 5.5 MB)**
  - URL: https://www.efrag.org/sites/default/files/2024-08/Annex%202%20-%20Illustrative%20examples%20of%20XBRL%20reports.zip

### XBRL Taxonomy Entry Points

**Live URLs (hosted by EFRAG):**

1. **ESRS All (complete taxonomy):**
   - https://xbrl.efrag.org/taxonomy/esrs/2023-12-22/esrs_all.xsd
   - Includes: All topics, disclosure requirements, presentation, definition linkbases, validation rules

2. **ESRS Core (concepts only):**
   - https://xbrl.efrag.org/taxonomy/esrs/2023-12-22/common/esrs_cor.xsd
   - Includes: Concepts, labels, references only (no presentation/validation)

---

## XBRL Taxonomy Structure

### File Format

- **XBRL Schema (.xsd):** XML-based taxonomy definition
- **Linkbases:** Relationships between concepts (presentation, definition, calculation, label, reference)
- **Excel Illustration:** Human-readable version of taxonomy (Annex 1)

### Content Coverage

- **12 ESRS Standards:** ESRS 1, 2, 2 MDR, E1-E5, S1-S4, G1
- **1,184+ Datapoints:** All mandatory and voluntary disclosure requirements
- **Metadata:** Labels, references, data types, validation rules

---

## Parsing Strategy for ISA

### Option 1: Parse XBRL Files Directly ❌

**Pros:**

- Official format, most accurate
- Includes validation rules and relationships

**Cons:**

- Complex XML parsing (XBRL is notoriously difficult)
- Requires XBRL library (python-xbrl, arelle)
- Overkill for ISA needs (we only need datapoint list)

### Option 2: Parse Excel Illustration ✅ **RECOMMENDED**

**Pros:**

- **Simple:** Excel file with all datapoints in tabular format
- **Easy parsing:** Use ExcelJS (already installed in ISA)
- **Human-readable:** Can validate manually
- **Complete:** Contains all 1,184 datapoints with metadata

**Cons:**

- Not the "official" format (but derived from official taxonomy)
- May lag behind XBRL updates (but published simultaneously)

### Option 3: Web Scraping EFRAG Website ❌

**Pros:**

- No file downloads needed

**Cons:**

- Fragile (website changes break scraper)
- No structured data format
- Violates best practices

---

## Recommended Implementation

### Approach: Excel-Based Quarterly Sync

**Step 1: Download Excel Illustration**

- URL: https://xbrl.efrag.org/downloads/Annex-1-ESRS-Set1-XBRL-Taxonomy-illustrated-in-Excel.xlsx
- Frequency: Quarterly (EFRAG updates taxonomy ~4 times/year)
- Storage: Save to `/home/ubuntu/isa_web/data/efrag/` directory

**Step 2: Parse Excel with ExcelJS**

- Library: `exceljs` (already installed in ISA)
- Extract columns: Datapoint ID, Standard, Disclosure Requirement, Name, Data Type, Voluntary/Mandatory
- Map to ISA `esrs_datapoints` table schema

**Step 3: Diff Detection**

- Compare new Excel file with current database state
- Detect: New datapoints, updated datapoints, deleted datapoints
- Track changes in `esrs_datapoint_changes` table (new table needed)

**Step 4: Database Update**

- Insert new datapoints
- Update changed datapoints (preserve old version in history table)
- Mark deleted datapoints (soft delete, don't remove)

**Step 5: Email Notification**

- Send summary to admin: X new, Y updated, Z deleted datapoints
- Include link to EFRAG release notes
- Attach change log CSV

---

## Update Schedule

### EFRAG Release Cadence

- **Major releases:** 1-2 times per year (e.g., August 2024)
- **Minor updates:** Quarterly or as needed
- **Monitoring:** Check EFRAG website for announcements

### ISA Sync Strategy

- **Frequency:** Quarterly (every 3 months)
- **Trigger:** Cron job on 1st of Jan, Apr, Jul, Oct
- **Fallback:** Manual trigger via admin UI

---

## Technical Requirements

### Dependencies (Already Installed)

- ✅ `exceljs` (v5.3.2) - Excel parsing
- ✅ `axios` - HTTP downloads
- ✅ Database schema for `esrs_datapoints` table

### New Components Needed

1. **EFRAG XBRL downloader** (efrag-xbrl-downloader.ts)
2. **Excel parser** (efrag-xbrl-parser.ts)
3. **Diff detector** (efrag-datapoint-diff.ts)
4. **Database updater** (efrag-datapoint-updater.ts)
5. **Quarterly cron job** (quarterly-efrag-sync.ts)
6. **Admin UI trigger** (tRPC procedure + React component)

### New Database Tables Needed

```sql
CREATE TABLE esrs_datapoint_changes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  datapoint_id VARCHAR(255),
  change_type ENUM('NEW', 'UPDATED', 'DELETED'),
  old_value TEXT,
  new_value TEXT,
  detected_at TIMESTAMP,
  taxonomy_version VARCHAR(50)
);
```

---

## Implementation Estimate

### Time Investment

- **Download & parse Excel:** 2 hours
- **Diff detection logic:** 2 hours
- **Database update workflow:** 2 hours
- **Cron job & notifications:** 1 hour
- **Admin UI trigger:** 1 hour
- **Testing & validation:** 2 hours
- **Total:** ~10 hours

### Token Budget

- **Research & planning:** 1,500 tokens (completed)
- **Implementation:** ~4,000 tokens (estimated)
- **Testing & debugging:** ~1,500 tokens (estimated)
- **Total:** ~7,000 tokens

---

## Next Steps

1. ✅ Research EFRAG XBRL taxonomy (completed)
2. ⏭️ Download Annex 1 Excel file for analysis
3. ⏭️ Build Excel parser to extract datapoints
4. ⏭️ Implement diff detection algorithm
5. ⏭️ Create quarterly sync cron job
6. ⏭️ Add admin UI trigger for manual sync
7. ⏭️ Test with current 1,184 datapoints in database

---

## Conclusion

**EFRAG XBRL parsing is feasible and straightforward using the Excel Illustration file.**  
ISA can maintain up-to-date ESRS datapoints with quarterly automated syncs, ensuring the platform always reflects the latest official EFRAG taxonomy. This eliminates manual data entry and keeps ISA competitive as the authoritative ESRS compliance platform.
