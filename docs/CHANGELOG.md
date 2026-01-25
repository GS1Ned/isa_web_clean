# ISA Changelog

All notable changes to the Intelligent Standards Architect (ISA) project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to semantic versioning principles.

---

## [Unreleased] - Phase 42 (In Progress)

### Added

- STATUS.md as single source of truth for project status
- CHANGELOG.md for partner-facing progress tracking
- Documentation master index with status badges

### Changed

- GS1_DATA_MODELS.md updated to reflect current 3-sector coverage

### Planned

- GS1 Attribute Mapper v0.1 operationalization
- ESRS IG3 datapoint ingestion
- Cron reliability hardening + monitoring dashboard

---

## [46f0e76a] - 2025-12-04 - Phase 41: Multi-Sector GS1 Expansion

### Added

- **DIY/Garden/Pet Sector Integration**
  - 3,009 attributes from GS1 Benelux DHZTD 3.1.33 model
  - 93 packaging-related attributes
  - 128 sustainability-related attributes
  - 408 attribute-to-regulation mappings (PPWR, DPP, CSRD, ESRS, REACH)
- **Healthcare Sector Integration**
  - 186 attributes from GS1 Benelux ECHO 3133 model
  - Medical device identification and safety attributes
  - Regulatory compliance attributes (MDR/IVDR ready)

- **Multi-Sector Infrastructure**
  - gs1-diy-parser.ts for DHZTD Fielddefinitions parsing
  - create-multi-sector-mappings.ts for sector-specific mapping rules
  - Multi-sector integration tests (9/11 passed)

### Changed

- Total GS1 Data Source coverage: 473 → 3,668 attributes (677% increase)
- Total attribute-to-regulation mappings: 217 → 625 (188% increase)
- GS1AttributesPanel component now supports all 3 sectors

### Fixed

- None

### Known Issues

- Healthcare sector has 0 mappings (MDR/IVDR regulations not in database)
- DIY picklist format requires investigation (0 code lists parsed)

---

## [88d3ed38] - 2025-12-04 - Phase 40: GS1 Data Model Integration

### Added

- **GS1 Data Source Benelux (Food/H&B)**
  - 473 attributes from FMCG data model 31335
  - 282 code list enumerated values
  - 44 packaging-related attributes
  - 52 sustainability-related attributes
  - 217 attribute-to-regulation mappings

- **GS1 Web Vocabulary**
  - 608 terms from GS1 Web Vocabulary v1.17 (JSON-LD)
  - 75 DPP-relevant properties
  - 16 ESRS-relevant properties
  - 45 EUDR-relevant properties
  - gs1:dpp link type for Digital Product Passport

- **Database Schema**
  - gs1_attributes table (sector, datatype, code lists)
  - gs1_attribute_code_lists table (enumerated values)
  - gs1_web_vocabulary table (JSON-LD classes/properties)
  - epcis_event_templates table (schema created, ingestion deferred)
  - attribute_regulation_mappings table (attribute-to-regulation links)

- **UI Components**
  - GS1AttributesPanel component with tabbed interface
  - Integrated into regulation detail pages as 4th tab
  - Data Source attributes + Web Vocabulary terms display
  - Relevance scoring, verification badges, code list expansion

- **Documentation**
  - GS1_DATA_MODELS.md comprehensive standards inventory
  - Integration roadmap (Phases 40-43)
  - Data sources and maintenance info

### Changed

- Regulation detail pages now show "GS1 Attributes" tab
- tRPC router extended with 4 new procedures for GS1 attributes

### Fixed

- None

---

## [2e49bb2c] - 2025-12-04 - Phase 39: Automation Infrastructure

### Added

- **Weekly EUR-Lex Auto-Ingestion**
  - CELLAR SPARQL connector for regulation discovery
  - Deduplication logic (checks celexId before insert)
  - Email notifications for new regulations found
  - Embedding generation integrated into ingestion pipeline
  - weekly-cellar-ingestion.ts script (ready for cron deployment)

- **EFRAG XBRL Parser**
  - Excel parser for ESRS Set 1 XBRL Taxonomy
  - 2,074 ESRS datapoints extracted (ESRS 1 & 2)
  - Quarterly sync pipeline ready
  - efrag-xbrl-parser.ts script

- **Vector Embeddings Migration**
  - OpenAI text-embedding-3-small integration (1536 dimensions)
  - 98 embeddings generated (38 regulations + 60 standards)
  - Ask ISA migrated from LLM scoring to vector similarity search
  - **100x performance improvement** (60s → 0.6s avg query time)
  - db-knowledge-vector.ts for fast semantic search

### Changed

- Ask ISA query performance: 60s → 0.6s (100x faster)
- Database schema: added `embedding` JSON columns to regulations and gs1_standards tables

### Fixed

- None

---

## Earlier Phases (Pre-Changelog)

### Phase 1-38: Foundation & Core Features

- ESG Hub with 38 regulations (CSRD, ESRS, PPWR, DPP, EUDR, EU Taxonomy)
- GS1 Standards Registry with 60 standards
- Regulation detail pages with ESRS datapoints
- GS1 standard detail pages
- Ask ISA (RAG) with LLM-based search
- Database schema design
- Frontend UI with Tailwind 4 + shadcn/ui
- tRPC backend with Express 4
- Manus OAuth integration (not yet implemented)

---

## Versioning Scheme

**Format:** `[commit_hash] - YYYY-MM-DD - Phase N: Title`

- **commit_hash:** Git commit hash from webdev checkpoint
- **Date:** Checkpoint creation date
- **Phase:** Sequential phase number
- **Title:** Descriptive phase name

---

## Categories

- **Added:** New features, data sources, or capabilities
- **Changed:** Modifications to existing functionality
- **Deprecated:** Features marked for future removal
- **Removed:** Features that have been deleted
- **Fixed:** Bug fixes and corrections
- **Security:** Security-related changes
- **Known Issues:** Documented limitations or bugs

---

## Upcoming Releases

### Phase 42: Documentation & Feature Gap Closure

- STATUS.md, GS1_DATA_MODELS.md, CHANGELOG.md
- GS1 Attribute Mapper v0.1 operationalization
- ESRS IG3 datapoint ingestion
- Cron reliability hardening + monitoring dashboard

### Phase 43: DPP & Traceability

- DPP JSON-LD profiles ingestion
- EPCIS event templates (EUDR pilot)
- PAC packaging dataset

### Phase 44: User Features & Healthcare

- User auth + saved analyses
- MDR/IVDR regulations
- Compliance alerts + timeline awareness

---

**Maintained by:** GS1 Netherlands + Manus AI Platform  
**Last Updated:** December 4, 2025
