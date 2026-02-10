# ISA Product Overview

## What ISA Is

ISA (Intelligent Standards Architect) is a sustainability compliance intelligence platform that connects EU ESG regulations to GS1 standards through AI-powered analysis and a structured knowledge graph.

## Core Value Proposition

ISA provides **regulation-to-standard mapping intelligence** for GS1 Netherlands members navigating EU sustainability compliance requirements. The platform ingests regulatory content from authoritative sources (EUR-Lex, EFRAG), processes GS1 technical standards (GDSN, EPCIS, WebVoc), and generates structured mappings using AI-assisted analysis.

## Key Capabilities

### ESG Hub
- Tracks 38 EU regulations with compliance timelines
- Regulation comparison tool
- Real-time news feed from 7 monitored sources
- 1,184 ESRS datapoints from EFRAG IG3 (verified 2024-12-15)
- 60+ GS1 standards catalog (verified 2024-11-30)

### Advisory System
- Generates versioned advisory outputs (v1.0, v1.1)
- Full dataset provenance tracking
- Advisory diff computation between versions
- GS1-to-ESRS mapping engine with 450+ AI-generated mappings
- All outputs subject to Lane C governance review

### Ask ISA (RAG-powered Q&A)
- 30 production queries with mandatory citations
- Query guardrails: 6 allowed types, 5 forbidden types
- Confidence scoring for all responses
- Semantic search using OpenAI text-embedding-3-small
- All responses include source citations

### EPCIS Tools (Exploratory)
- EUDR geolocation mapper
- Barcode scanner integration
- EPCIS event upload (JSON/XML)
- Compliance report generation
- **Note:** NOT production-ready, exploratory only

### Admin Tools
- News pipeline management
- Regulatory change log
- Scraper health monitoring (7 sources, 100% health rate)
- Coverage analytics
- Pipeline observability
- ESRS-GS1 mapping explorer

## Target Users

- **Primary:** GS1 Netherlands members and stakeholders
- **Geographic Focus:** EU regulations + Dutch/Benelux initiatives
- **Use Cases:** ESG compliance navigation, standard selection, regulatory intelligence

## Verified Coverage (as of 2025-12-17)

- **Regulations Tracked:** 38 EU regulations
- **ESRS Datapoints:** 1,184 from EFRAG IG3
- **GS1 Standards:** 60+ cataloged
- **AI Mappings:** 450+ regulation-to-standard mappings
- **News Sources:** 7 monitored (100% health)
- **Advisory Reports:** 2 versions (v1.0, v1.1)
- **Test Coverage:** 517/574 tests passing (90.1%)

## What ISA Is NOT

ISA does NOT:
- Provide legal advice or compliance guarantees
- Claim 100% coverage of any regulation or standard
- Offer real-time regulatory updates (scheduled intervals only)
- Replace professional ESG consultants or auditors
- Guarantee currency beyond timestamped verification dates
- Support jurisdictions outside EU + Dutch/Benelux
- Provide production-ready EPCIS validation
- Offer public API access (internal use only)

## Scope Boundaries

- **Geographic:** EU regulations + Dutch/Benelux initiatives only
- **Temporal:** Datasets verified as of documented last_verified_date
- **Regulatory:** Focus on CSRD/ESRS, EUDR, DPP, PPWR, Batteries (not exhaustive)
- **Standards:** GS1 standards only (no ISO, UNECE, or other SDOs)
- **Audience:** GS1 Netherlands members and stakeholders

## Known Gaps (Intentionally Deferred)

- CS3D/CSDDD detailed implementation guidance
- ESPR delegated acts (pending publication)
- Sector-specific Green Deals (partial coverage)
- Real-time regulatory change detection
- Multi-language support (English only)
- EPCIS 2.0 validation (exploratory only)

## Governance Mode

**Current Mode:** Lane C (User-Decision Mode)

ISA operates under strict governance constraints that prioritize:
1. **Data Integrity:** All datasets include source, version, format, last_verified_date
2. **Citation Accuracy:** All AI-generated content includes mandatory citations
3. **User Authority:** Silence is NOT consent; explicit approval required for Lane C triggers
4. **Transparency:** All decisions documented with rationale and alternatives
5. **Reversibility:** All changes tracked in version control with rollback capability

Lane C triggers requiring escalation:
- Schema changes affecting data integrity
- New data sources or ingestion pipelines
- Changes to AI prompts or mapping logic
- Advisory report generation or publication
- Governance framework modifications
- External integrations or API exposure

## Project Status

- **Phase:** 9 (Consolidation, Hardening, Close-Out)
- **Status:** Phase 9 Consolidation Complete
- **Last Updated:** 2025-12-17
- **Repository:** https://github.com/GS1Ned/isa_web_clean
