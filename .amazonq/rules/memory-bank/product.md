# ISA Product Overview

## Project Identity

**Name:** ISA (Intelligent Standards Architect)  
**Version:** 1.0.0  
**Status:** Phase 9 Consolidation Complete (as of 2025-12-17)

## Purpose

ISA is a sustainability compliance intelligence platform that connects EU ESG regulations to GS1 standards through AI-powered analysis and a structured knowledge graph. It provides regulation-to-standard mapping intelligence for GS1 Netherlands members navigating EU sustainability compliance requirements.

## Value Proposition

ISA bridges the gap between complex EU sustainability regulations (CSRD/ESRS, EUDR, DPP, PPWR, Batteries) and practical GS1 technical standards implementation. The platform:

- Ingests regulatory content from authoritative sources (EUR-Lex, EFRAG)
- Processes GS1 technical standards (GDSN, EPCIS, WebVoc)
- Generates structured mappings using AI-assisted analysis
- Enables users to query the knowledge graph
- Provides compliance timelines and versioned advisory outputs
- Traces every data point back to its source

## Core Capabilities

### 1. ESG Hub
Regulatory tracking and monitoring system:
- Tracks 38 EU regulations with compliance timelines
- Regulation comparison tool
- Real-time news feed from 7 sources (100% health rate)
- 1,184 ESRS datapoints from EFRAG IG3
- 60+ GS1 standards catalog

### 2. Advisory System
Versioned advisory report generation:
- Generates versioned advisory outputs (v1.0, v1.1)
- Full dataset provenance tracking
- Advisory diff computation
- GS1-to-ESRS mapping engine (450+ mappings)
- All outputs subject to governance review before publication

### 3. Ask ISA
RAG-powered Q&A system:
- 30 production queries
- Mandatory citations for all responses
- Query guardrails (6 allowed types, 5 forbidden types)
- Confidence scoring
- Source citation tracking

### 4. EPCIS Tools (Exploratory)
Supply chain traceability tools:
- EUDR geolocation mapper
- Barcode scanner
- EPCIS event upload (JSON/XML)
- Compliance report generation
- **Note:** NOT production-ready, exploratory only

### 5. Admin Tools
System management and monitoring:
- News pipeline management
- Regulatory change log
- Scraper health monitoring
- Coverage analytics
- Pipeline observability
- ESRS-GS1 mapping explorer

## Target Users

**Primary Audience:** GS1 Netherlands members and stakeholders

**User Roles:**
- Sustainability compliance officers
- ESG data managers
- Supply chain professionals
- GS1 standards implementers
- Regulatory affairs specialists

## Key Use Cases

1. **Regulation-to-Standard Mapping:** Discover which GS1 standards support specific EU regulatory requirements
2. **Compliance Timeline Planning:** Track upcoming regulatory deadlines and prepare implementation roadmaps
3. **Knowledge Discovery:** Query the knowledge graph to find relevant standards, datapoints, and guidance
4. **Advisory Report Generation:** Generate versioned advisory reports with full provenance tracking
5. **News Monitoring:** Stay informed about regulatory changes and GS1 standards updates
6. **Gap Analysis:** Identify coverage gaps between regulations and available standards

## Scope and Boundaries

### What ISA IS
- Regulation-to-standard mapping intelligence platform
- Knowledge graph for EU ESG regulations and GS1 standards
- Advisory report generation system with governance controls
- News monitoring and aggregation system
- RAG-powered Q&A system with mandatory citations

### What ISA IS NOT
- Legal advice or compliance guarantee provider
- Real-time regulatory update service
- Replacement for professional ESG consultants or auditors
- Production-ready EPCIS validation system
- Public API service (internal use only)
- Multi-jurisdiction compliance platform (EU + Dutch/Benelux only)

### Geographic Scope
- **Primary:** EU regulations
- **Secondary:** Dutch/Benelux initiatives
- **Out of Scope:** Non-EU jurisdictions

### Regulatory Scope
- **In Scope:** CSRD/ESRS, EUDR, DPP, PPWR, Batteries Regulation
- **Partial Coverage:** Sector-specific Green Deals
- **Out of Scope:** CS3D/CSDDD detailed implementation guidance, ESPR delegated acts (pending publication)

### Standards Scope
- **In Scope:** GS1 standards only (GDSN, EPCIS, WebVoc, Digital Link, etc.)
- **Out of Scope:** ISO, UNECE, or other SDO standards

### Temporal Scope
- Datasets verified as of their documented `last_verified_date`
- No guarantee of currency beyond explicitly timestamped verification dates
- News pipeline operates on scheduled intervals (not real-time)

## Verified Coverage (as of 2025-12-17)

- **Regulations Tracked:** 38 EU regulations
- **ESRS Datapoints:** 1,184 datapoints from EFRAG IG3 (verified 2024-12-15)
- **GS1 Standards:** 60+ standards cataloged (verified 2024-11-30)
- **AI Mappings:** 450+ regulation-to-standard mappings (generated 2024-12-10)
- **News Sources:** 7 sources monitored (100% health rate)
- **Advisory Reports:** 2 versions (v1.0, v1.1) under governance review
- **Test Coverage:** 517/574 tests passing (90.1%)

## Governance Principles

ISA operates under strict governance constraints:

1. **Data Integrity:** All datasets include source, version, format, last_verified_date
2. **Citation Accuracy:** All AI-generated content includes mandatory citations
3. **Version Control:** All changes tracked in Git with conventional commits
4. **Transparency:** All decisions documented with rationale and alternatives
5. **Reversibility:** All changes can be rolled back via Git

**Authoritative Governance Document:** `docs/governance/_root/ISA_GOVERNANCE.md`

## Quality Metrics

- **Validation Gates:** 6/6 passing
- **Quality Score:** 75/100
- **Semantic Validity:** 91.9%
- **Evidence Markers:** 145 markers
- **Test Coverage:** 90.1%
- **Contract Completeness:** 70%

## Known Limitations

- English language only (no multi-language support)
- Scheduled news updates (not real-time)
- EPCIS 2.0 validation is exploratory only
- No 100% coverage guarantee for any regulation or standard
- Datasets verified as of documented dates (not continuously updated)
- Internal use only (no public API access)
