# Changelog — EU_ESG_to_GS1_Mapping v1.1

All notable changes to this artefact set are documented in this file.

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
