# ISA Product Overview

## Project Identity

**Name:** ISA (Intelligent Standards Architect)  
**Type:** Sustainability compliance intelligence platform  
**Owner:** GS1 Netherlands  
**Status:** Phase 9 Consolidation Complete (as of 2025-12-17)

## Purpose

ISA connects EU ESG regulations to GS1 standards through AI-powered analysis and a structured knowledge graph. It provides regulation-to-standard mapping intelligence for GS1 Netherlands members navigating EU sustainability compliance requirements.

## Core Value Proposition

- **Regulatory Intelligence:** Ingests content from authoritative sources (EUR-Lex, EFRAG)
- **Standards Processing:** Processes GS1 technical standards (GDSN, EPCIS, WebVoc)
- **AI-Assisted Mapping:** Generates structured regulation-to-standard mappings
- **Knowledge Graph:** Enables querying, compliance timeline exploration, and versioned advisory outputs
- **Full Traceability:** Every data point traces back to its source with provenance metadata

## Key Features

### 1. ESG Hub
- Tracks 38 EU regulations with compliance timelines
- Regulation comparison tool
- Real-time news feed from 7 monitored sources
- 1,184 ESRS datapoints from EFRAG IG3
- 60+ GS1 standards catalog

### 2. Advisory System
- Generates versioned advisory outputs (v1.0, v1.1)
- Full dataset provenance tracking
- Advisory diff computation
- GS1-to-ESRS mapping engine
- All outputs subject to governance review

### 3. Ask ISA (RAG-powered Q&A)
- 30 production queries
- Mandatory citations for all responses
- Query guardrails (6 allowed types, 5 forbidden types)
- Confidence scoring
- Source citation tracking

### 4. EPCIS Tools (Exploratory)
- EUDR geolocation mapper
- Barcode scanner
- EPCIS event upload (JSON/XML)
- Compliance report generation
- **Note:** NOT production-ready

### 5. Admin Tools
- News pipeline management
- Regulatory change log
- Scraper health monitoring
- Coverage analytics
- Pipeline observability
- ESRS-GS1 mapping explorer

## Target Users

- **Primary:** GS1 Netherlands members and stakeholders
- **Geographic Focus:** EU regulations + Dutch/Benelux initiatives
- **Use Cases:** ESG compliance navigation, standard selection, regulatory tracking

## Verified Coverage (as of 2025-12-17)

- **Regulations:** 38 EU regulations tracked
- **ESRS Datapoints:** 1,184 from EFRAG IG3 (verified 2024-12-15)
- **GS1 Standards:** 60+ cataloged (verified 2024-11-30)
- **AI Mappings:** 450+ regulation-to-standard mappings (generated 2024-12-10)
- **News Sources:** 7 sources (100% health rate)
- **Advisory Reports:** 2 versions (v1.0, v1.1)
- **Test Coverage:** 517/574 tests passing (90.1%)

## What ISA Is NOT

- Does NOT provide legal advice or compliance guarantees
- Does NOT claim 100% coverage of any regulation or standard
- Does NOT offer real-time regulatory updates (scheduled intervals only)
- Does NOT replace professional ESG consultants or auditors
- Does NOT support jurisdictions outside EU + Dutch/Benelux
- Does NOT provide production-ready EPCIS validation
- Does NOT offer public API access (internal use only)

## Scope Boundaries

- **Geographic:** EU regulations + Dutch/Benelux initiatives only
- **Temporal:** Datasets verified as of documented `last_verified_date`
- **Regulatory:** Focus on CSRD/ESRS, EUDR, DPP, PPWR, Batteries (not exhaustive)
- **Standards:** GS1 standards only (no ISO, UNECE, or other SDOs)
- **Language:** English only

## Governance Principles

ISA operates under strict governance constraints:

1. **Data Integrity:** All datasets include source, version, format, last_verified_date
2. **Citation Accuracy:** All AI-generated content includes mandatory citations
3. **Version Control:** All changes tracked in Git with conventional commits
4. **Transparency:** All decisions documented with rationale and alternatives
5. **Reversibility:** All changes can be rolled back via Git

**Authoritative Document:** `docs/governance/_root/ISA_GOVERNANCE.md`

## Known Gaps (Intentionally Deferred)

- CS3D/CSDDD detailed implementation guidance
- ESPR delegated acts (pending publication)
- Sector-specific Green Deals (partial coverage)
- Real-time regulatory change detection
- Multi-language support
- EPCIS 2.0 validation (exploratory only)
