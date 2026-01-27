# Changelog — EU_ESG_to_GS1_Mapping v1.1

All notable changes to this artefact set are documented in this file.

## [1.1.3] - 2026-01-27

### Added
- **BL-010:** Expanded corpus with ESPR (Ecodesign for Sustainable Products Regulation)
  - Added ESPR instrument to corpus.json (EU 2024/1781)
  - Added 4 ESPR obligations (ESPR-O1 to ESPR-O4) covering Digital Product Passport requirements
  - Added 4 atomic requirements (AR-ESPR-1 to AR-ESPR-4)
  - Added 4 data requirements (DR-ESPR-1 to DR-ESPR-4)
  - Added 4 GS1 mappings with STRONG mapping strength for DPP use cases
  - Added scoring with highest scores (30/30) for DPP-related requirements

### Key Insight
- ESPR/DPP is now the highest-priority regulation for GS1 standards alignment
- Digital Product Passport requirements directly align with GS1 Digital Link, GTIN, and GDSN
- 3 of 4 ESPR data requirements have "strong" GS1 mapping strength (highest in corpus)

### Evidence
- ESPR (EU 2024/1781): https://data.europa.eu/eli/reg/2024/1781/oj
- Articles 9, 11, 27 verified via EUR-Lex

---

## [1.1.2] - 2026-01-27

### Added
- **BL-020:** Created `gs1_sources.json` with authoritative GS1 standard metadata
  - GTIN: Global Trade Item Number (canonical URL, specification, version)
  - GLN: Global Location Number (canonical URL, specification, version)
  - GDSN: Global Data Synchronisation Network (canonical URL, specification, version)
  - EPCIS/CBV: Electronic Product Code Information Services / Core Business Vocabulary (canonical URL, ISO standards)
  - Digital Link: GS1 Digital Link (canonical URL, specification, version)
  - SSCC: Serial Shipping Container Code (canonical URL, specification, version)

### Evidence
- All canonical URLs verified against GS1.org official documentation
- Each standard includes: full name, description, canonical URL, specification URL, current version, scope, key attributes

---

## [1.1.1] - 2026-01-27

### Fixed
- **BL-001:** Replaced all placeholder article references with exact article numbers
  - PPWR-O1: "Operative articles (placing on the market and prevention)" → Article 15(1)
  - PPWR-O2: "Relevant operative articles" → Article 48
  - FL-O1: "Operative prohibition article" → Article 3
  - FL-O2: "Investigation and enforcement provisions" → Articles 15-24

### Evidence
- PPWR (EU 2025/40): https://eur-lex.europa.eu/eli/reg/2025/40/oj
- Forced Labour (EU 2024/3015): https://eur-lex.europa.eu/eli/reg/2024/3015/oj

### Validation
- Placeholder scan: 0 remaining (was 4)
- Legal traceability: EVIDENCE-GRADE

## [1.1.0] - 2026-01-25

### Added
- Initial v1.1 release with obligation_id links in atomic and data requirements
- Complete referential integrity across all layers
- 11 corpus instruments, 24 obligations, 24 atomic requirements, 24 data requirements
