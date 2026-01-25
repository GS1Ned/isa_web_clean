# ISA Currency Disclosure

**Document Version:** 1.0  
**Last Updated:** 2025-12-17  
**Purpose:** Explain verification limits and temporal boundaries of ISA data

---

## Purpose

This document clarifies the **temporal boundaries** and **verification limits** of all data in ISA. It replaces generic claims of "current" or "up-to-date" with explicit timestamps and scoped statements.

---

## Verification Philosophy

ISA operates under strict governance constraints (Lane C) that require **explicit verification dates** for all datasets. We do NOT claim:
- "Real-time" regulatory updates
- "Always current" data
- "Continuously updated" content
- "Latest" versions without timestamps

Instead, we provide:
- **Explicit verification dates** for each dataset
- **Scoped statements** ("verified as of YYYY-MM-DD")
- **Known gaps** documented with rationale
- **Update cadence** for each data source

---

## Dataset Verification Status (as of 2025-12-17)

### Regulations (38 EU Regulations)
**Last Verified:** 2025-12-10  
**Source:** EUR-Lex Official Journal  
**Update Cadence:** Manual review quarterly  
**Known Gaps:**
- CS3D/CSDDD detailed implementation guidance (pending publication)
- ESPR delegated acts (pending publication)
- Regulation amendments published after 2025-12-10

**Verification Method:** Manual review of EUR-Lex Official Journal, cross-referenced with EFRAG and European Commission websites.

### ESRS Datapoints (1,184 Datapoints)
**Last Verified:** 2024-12-15  
**Source:** EFRAG Implementation Guidance 3 (IG3)  
**Version:** EFRAG IG3 (December 2024)  
**Update Cadence:** Quarterly (aligned with EFRAG releases)  
**Known Gaps:**
- EFRAG IG4 updates (if published after 2024-12-15)
- Sector-specific ESRS extensions (pending EFRAG publication)

**Verification Method:** Direct extraction from EFRAG XBRL taxonomy and IG3 documentation.

### GS1 Standards (60+ Standards)
**Last Verified:** 2024-11-30  
**Source:** GS1 Global Office, GS1 Europe, GS1 Netherlands  
**Update Cadence:** Quarterly (aligned with GS1 release cycles)  
**Known Gaps:**
- GS1 standards published or updated after 2024-11-30
- Provisional standards not yet in official catalog
- Working group drafts not publicly available

**Verification Method:** Manual review of GS1 official websites and reference portal (ref.gs1.org).

### GS1 NL/Benelux Sector Models (3,667 Attributes)
**Last Verified:** 2024-11-30  
**Source:** GS1 Netherlands Data Source  
**Version:** 3.1.33 (DIY/Garden & Pet), 3.1.33.5 (FMCG)  
**Update Cadence:** Irregular (per GS1 NL release)  
**Known Gaps:**
- Sector models updated after 2024-11-30
- New sectors added after verification date

**Verification Method:** Direct extraction from GS1 Netherlands official data model files.

### GS1 Validation Rules (847 Rules + 1,055 Code Lists)
**Last Verified:** 2024-11-25  
**Source:** GS1 Netherlands Data Source  
**Version:** 3.1.33.4 (DIY/Garden & Pet)  
**Update Cadence:** Irregular (per GS1 NL release)  
**Known Gaps:**
- Validation rules updated after 2024-11-25

**Verification Method:** Direct extraction from GS1 Netherlands official validation files.

### GDSN Current (4,293 Records)
**Last Verified:** 2024-11-20  
**Source:** GS1 GDSN 3.1 Standard  
**Version:** 3.1 (current production version)  
**Update Cadence:** Irregular (per GS1 GDSN release)  
**Known Gaps:**
- GDSN 4.0 updates (if published after 2024-11-20)

**Verification Method:** Direct extraction from GS1 GDSN official documentation.

### GS1 WebVoc (4,373 Terms)
**Last Verified:** 2024-11-15  
**Source:** GS1 Web Vocabulary (gs1.org/voc)  
**Version:** Continuously updated (snapshot as of 2024-11-15)  
**Update Cadence:** Monthly (re-crawl)  
**Known Gaps:**
- Terms added or modified after 2024-11-15

**Verification Method:** Automated crawl of GS1 Web Vocabulary JSON-LD endpoint.

### EFRAG ESRS XBRL Taxonomy (5,430 Concepts)
**Last Verified:** 2024-12-01  
**Source:** EFRAG XBRL Taxonomy  
**Version:** ESRS XBRL Taxonomy 1.0 (December 2024)  
**Update Cadence:** Quarterly (aligned with EFRAG releases)  
**Known Gaps:**
- Taxonomy updates published after 2024-12-01

**Verification Method:** Direct extraction from EFRAG XBRL taxonomy ZIP file.

### GS1 EU Carbon Footprint Attributes (37 Records)
**Last Verified:** 2025-01-14  
**Source:** GS1 EU GDSN Implementation Guideline for Exchanging Carbon Footprint Data  
**Version:** 1.0 (February 2025)  
**Update Cadence:** One-time (sectoral release)  
**Known Gaps:**
- Future versions or amendments (if published after 2025-01-14)

**Verification Method:** Manual extraction from GS1 EU official PDF guideline.

### GS1 Reference Portal Bundle (352 Documents)
**Last Verified:** 2025-12-15  
**Source:** GS1 Reference Portal (ref.gs1.org)  
**Version:** Snapshot as of 2025-12-15  
**Update Cadence:** Quarterly (re-crawl sitemap)  
**Known Gaps:**
- Documents added or modified after 2025-12-15

**Verification Method:** Sitemap-based crawl with SHA256 checksums for integrity verification.

### Dutch Initiatives (10 National Programs)
**Last Verified:** 2025-12-10  
**Source:** Dutch government websites, sector Green Deals  
**Update Cadence:** Manual review quarterly  
**Known Gaps:**
- New initiatives launched after 2025-12-10
- Initiative updates not yet reflected in official sources

**Verification Method:** Manual review of Dutch government and sector websites.

### News Hub (29 Articles as of 2025-12-17)
**Last Verified:** 2025-12-17 (automated daily pipeline)  
**Source:** 7 sources (EUR-Lex, EFRAG, GS1 Global, GS1 Europe, GS1 NL, Green Deal Zorg, ZES)  
**Update Cadence:** Daily (automated pipeline at 02:00 UTC)  
**Known Gaps:**
- News published between pipeline runs
- Sources not yet integrated (e.g., Plastic Pact NL)

**Verification Method:** Automated web scraping with AI-powered enrichment and quality scoring.

### AI-Generated Mappings (450+ Mappings)
**Last Verified:** 2024-12-10  
**Source:** AI-assisted analysis (GPT-4)  
**Update Cadence:** Manual review quarterly  
**Known Gaps:**
- Mappings not yet reviewed by domain experts
- New regulations or standards requiring mapping

**Verification Method:** AI-assisted analysis with mandatory citation to source regulations and standards.

---

## Advisory Reports

### ISA Advisory v1.0
**Generated:** 2024-12-08  
**Status:** Lane C review (publication deferred)  
**Verification Scope:** CSRD/ESRS regulations mapped to GS1 standards as of 2024-12-08  
**Known Limitations:**
- Does not include regulations published after 2024-12-08
- AI-generated mappings require domain expert review
- Does not constitute legal or compliance advice

### ISA Advisory v1.1
**Generated:** 2024-12-12  
**Status:** Lane C review (publication deferred)  
**Verification Scope:** Updated CSRD/ESRS mappings with additional GS1 standards as of 2024-12-12  
**Known Limitations:**
- Same limitations as v1.0
- Incremental update only (not comprehensive refresh)

---

## Ask ISA Knowledge Base

**Last Updated:** 2025-12-10  
**Knowledge Chunks:** 155 semantic chunks  
**Source Coverage:**
- 38 EU regulations (verified 2025-12-10)
- 60+ GS1 standards (verified 2024-11-30)
- 1,184 ESRS datapoints (verified 2024-12-15)
- 10 Dutch initiatives (verified 2025-12-10)

**Update Cadence:** Manual refresh quarterly  
**Known Gaps:**
- Content published after last knowledge base refresh
- Requires manual regeneration to include new sources

**Verification Method:** Automated knowledge chunk generation from verified datasets with content hash deduplication.

---

## Temporal Language Guidelines

### APPROVED Language
- "Verified as of 2025-12-17"
- "Last updated 2024-12-15"
- "Snapshot as of 2025-12-10"
- "Dataset version 3.1.33 (released 2024-11-15)"
- "News pipeline last executed 2025-12-17 02:00 UTC"

### PROHIBITED Language
- "Current" (without date)
- "Up-to-date" (without date)
- "Latest" (without version/date)
- "Most recent" (without date)
- "Real-time"
- "Always"
- "Continuously"
- "Ongoing" (without date range)

---

## Update Cadence Summary

| Data Source | Update Cadence | Last Verified |
|-------------|----------------|---------------|
| Regulations | Quarterly (manual) | 2025-12-10 |
| ESRS Datapoints | Quarterly (aligned with EFRAG) | 2024-12-15 |
| GS1 Standards | Quarterly (aligned with GS1) | 2024-11-30 |
| GS1 NL Sector Models | Irregular (per GS1 NL release) | 2024-11-30 |
| GS1 Validation Rules | Irregular (per GS1 NL release) | 2024-11-25 |
| GDSN Current | Irregular (per GS1 GDSN release) | 2024-11-20 |
| GS1 WebVoc | Monthly (automated crawl) | 2024-11-15 |
| EFRAG XBRL Taxonomy | Quarterly (aligned with EFRAG) | 2024-12-01 |
| GS1 EU PCF Attributes | One-time (sectoral release) | 2025-01-14 |
| GS1 Reference Portal | Quarterly (automated crawl) | 2025-12-15 |
| Dutch Initiatives | Quarterly (manual) | 2025-12-10 |
| News Hub | Daily (automated pipeline) | 2025-12-17 |
| AI Mappings | Quarterly (manual review) | 2024-12-10 |
| Ask ISA Knowledge Base | Quarterly (manual refresh) | 2025-12-10 |

---

## Verification Methodology

### Automated Verification
- **Web Scraping:** Playwright-based automated crawling with content hash comparison
- **API Polling:** Scheduled checks for new releases (where APIs available)
- **Checksum Validation:** SHA256 checksums for all downloaded files

### Manual Verification
- **Domain Expert Review:** Quarterly review of AI-generated mappings
- **Source Monitoring:** Manual checks of official websites for new releases
- **Governance Self-Checks:** Pre- and post-work validation of data integrity

### Continuous Monitoring
- **News Pipeline:** Daily automated execution with quality scoring
- **Scraper Health:** Real-time monitoring of source availability and reliability
- **Coverage Analytics:** Monthly review of regulation and sector coverage gaps

---

## Known Limitations

### Temporal Limitations
- **Lag Time:** Manual verification introduces 1-3 month lag for some datasets
- **Publication Delays:** Official sources may not publish updates on predictable schedules
- **Snapshot Nature:** All data represents point-in-time snapshots, not continuous streams

### Coverage Limitations
- **Geographic Scope:** EU + Dutch/Benelux only (no other jurisdictions)
- **Standards Scope:** GS1 only (no ISO, UNECE, or other SDOs)
- **Language Scope:** English only (no multi-language support)

### Technical Limitations
- **AI-Generated Content:** Requires domain expert review before publication
- **Scraper Reliability:** Dependent on source website stability and structure
- **Manual Processes:** Some datasets require manual extraction and verification

---

## Contact & Questions

For questions about data currency or verification status:

**Repository:** https://github.com/GS1-ISA/isa  
**Issues:** https://github.com/GS1-ISA/isa/issues

**Governance Steward:** ISA Executive Steward  
**Project Owner:** GS1 Netherlands

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-17  
**Next Review:** 2025-03-17 (quarterly)
