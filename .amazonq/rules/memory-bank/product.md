# ISA Product Overview

## Repo Anchors

### Canonical Navigation
- `/AGENT_START_HERE.md` - Agent entrypoint
- `/README.md` - Project overview
- `/REPO_TREE.md` - Repository structure
- `/AGENTS.md` - Agent collaboration guide
- `/package.json` - Dependencies and scripts

### Refactor / Governance Evidence
- `/docs/planning/refactoring/FILE_INVENTORY.json` - Complete file registry (828 files)
- `/docs/planning/refactoring/QUALITY_SCORECARDS.json` - Capability quality scores
- `/docs/planning/refactoring/EVIDENCE_MARKERS.json` - Traceability markers
- `/docs/planning/refactoring/FINAL_STATUS_REPORT.md` - Refactoring completion status
- `/docs/planning/refactoring/EXECUTION_SUMMARY.md` - Phase-by-phase results
- `/docs/planning/refactoring/MOVE_PLAN.json` - File relocation plan
- `/docs/planning/refactoring/MOVE_EXECUTION_LOG.json` - Relocation audit trail

### Gate Runner
- `/scripts/refactor/validate_gates.sh` - 5 automated validation gates

**Rule**: Any statement about repository state must link to one of the anchors above (file path), or it is considered unverified.

## How to Validate (One Pass)

Run the gate runner to verify repository state:
```bash
bash scripts/refactor/validate_gates.sh
```

Then confirm these artifacts exist and are current:
- `docs/planning/refactoring/FILE_INVENTORY.json` (828 files, 100% classified)
- `docs/planning/refactoring/QUALITY_SCORECARDS.json` (overall score 71.7/100)
- `docs/planning/refactoring/FINAL_STATUS_REPORT.md` (all gates passing)

## Project Purpose

ISA (Intelligent Standards Architect) is a sustainability compliance intelligence platform that connects EU ESG regulations to GS1 standards through AI-powered analysis and a structured knowledge graph. It provides regulation-to-standard mapping intelligence for GS1 Netherlands members navigating EU sustainability compliance requirements.

## Core Value Proposition

- **Regulatory Intelligence**: Ingests regulatory content from authoritative sources (EUR-Lex, EFRAG)
- **Standards Processing**: Processes GS1 technical standards (GDSN, EPCIS, WebVoc)
- **AI-Assisted Mapping**: Generates structured mappings between regulations and standards
- **Knowledge Graph**: Enables querying of compliance relationships and timelines
- **Versioned Advisory**: Provides advisory outputs with full provenance tracking

## Key Features

### ESG Hub
- Tracks 38 EU regulations with compliance timelines
- Regulation comparison tool
- Real-time news feed from 7 monitored sources
- 1,184 ESRS datapoints from EFRAG IG3
- 60+ GS1 standards catalog

### Advisory System
- Generates versioned advisory outputs (v1.0, v1.1)
- Full dataset provenance tracking
- Advisory diff computation
- GS1-to-ESRS mapping engine
- All outputs subject to governance review

### Ask ISA
- RAG-powered Q&A system with 30 production queries
- Mandatory citations for all responses
- Query guardrails (6 allowed types, 5 forbidden types)
- Confidence scoring
- Source citation tracking

### EPCIS Tools (Exploratory)
- EUDR geolocation mapper
- Barcode scanner
- EPCIS event upload (JSON/XML)
- Compliance report generation
- NOT production-ready

### Admin Tools
- News pipeline management
- Regulatory change log
- Scraper health monitoring
- Coverage analytics
- Pipeline observability
- ESRS-GS1 mapping explorer

## Target Users

- **Primary**: GS1 Netherlands members and stakeholders
- **Geographic Focus**: EU regulations + Dutch/Benelux initiatives
- **Use Cases**: Sustainability compliance navigation, regulatory mapping, standards alignment

## Scope Boundaries

### What ISA Does NOT Do
- Provide legal advice or compliance guarantees
- Claim 100% coverage of any regulation or standard
- Offer real-time regulatory updates (scheduled intervals only)
- Replace professional ESG consultants or auditors
- Support jurisdictions outside EU + Dutch/Benelux
- Provide production-ready EPCIS validation
- Offer public API access (internal use only)

### Coverage Limits
- **Geographic**: EU regulations + Dutch/Benelux only
- **Regulatory**: Focus on CSRD/ESRS, EUDR, DPP, PPWR, Batteries
- **Standards**: GS1 standards only (no ISO, UNECE, or other SDOs)
- **Language**: English only
- **Temporal**: Datasets verified as of documented last_verified_date

## Verified Coverage (as of 2025-12-17)

- **Regulations Tracked**: 38 EU regulations
- **ESRS Datapoints**: 1,184 datapoints from EFRAG IG3
- **GS1 Standards**: 60+ standards cataloged
- **AI Mappings**: 450+ regulation-to-standard mappings
- **News Sources**: 7 sources monitored (100% health rate)
- **Advisory Reports**: 2 versions (v1.0, v1.1)
- **Test Coverage**: 517/574 tests passing (90.1%)

## Governance Principles

ISA operates under strict governance constraints:

1. **Data Integrity**: All datasets include source, version, format, last_verified_date
2. **Citation Accuracy**: All AI-generated content includes mandatory citations
3. **Version Control**: All changes tracked in Git with conventional commits
4. **Transparency**: All decisions documented with rationale and alternatives
5. **Reversibility**: All changes can be rolled back via Git

**Authoritative Governance**: docs/governance/_root/ISA_GOVERNANCE.md

## Capabilities → Repo Surface

### ASK_ISA
**Runtime Contract**: `/docs/spec/ASK_ISA/RUNTIME_CONTRACT.md`  
**Code**: `/server/routers/ask-isa.ts`, `/server/services/rag-tracing/`, `/client/src/pages/AskISA.tsx`  
**Quality**: A grade (100/100) per `/docs/planning/refactoring/QUALITY_SCORECARDS.json`

RAG-powered Q&A system with mandatory citations, query guardrails, and confidence scoring.

### NEWS_HUB
**Runtime Contract**: `/docs/spec/NEWS_HUB/RUNTIME_CONTRACT.md`  
**Code**: `/server/news-*.ts`, `/server/routers/news.ts`, `/client/src/pages/NewsHub.tsx`  
**Quality**: C grade (70/100) per `/docs/planning/refactoring/QUALITY_SCORECARDS.json`

News pipeline with 7 monitored sources, AI processing, and health monitoring.

### KNOWLEDGE_BASE
**Runtime Contract**: `/docs/spec/KNOWLEDGE_BASE/RUNTIME_CONTRACT.md`  
**Code**: `/server/embedding.ts`, `/server/hybrid-search.ts`, `/server/bm25-search.ts`  
**Quality**: F grade (50/100) per `/docs/planning/refactoring/QUALITY_SCORECARDS.json`

Corpus ingestion, embedding generation, and hybrid search infrastructure.

### CATALOG
**Runtime Contract**: `/docs/spec/CATALOG/RUNTIME_CONTRACT.md`  
**Code**: `/server/routers/catalog.ts`, `/client/src/pages/HubRegulations.tsx`, `/data/`  
**Quality**: C grade (70/100) per `/docs/planning/refactoring/QUALITY_SCORECARDS.json`

Regulation and standards catalog with 38 EU regulations and 60+ GS1 standards.

### ESRS_MAPPING
**Runtime Contract**: `/docs/spec/ESRS_MAPPING/RUNTIME_CONTRACT.md`  
**Code**: `/server/gs1-mapping-engine.ts`, `/server/ingest/INGEST-03_esrs_datapoints.ts`  
**Quality**: C grade (70/100) per `/docs/planning/refactoring/QUALITY_SCORECARDS.json`

GS1-to-ESRS mapping engine with 1,184 ESRS datapoints from EFRAG IG3.

### ADVISORY
**Runtime Contract**: `/docs/spec/ADVISORY/RUNTIME_CONTRACT.md`  
**Code**: `/server/routers/advisory.ts`, `/data/advisories/`, `/scripts/validate_advisory_schema.cjs`  
**Quality**: C grade (70/100) per `/docs/planning/refactoring/QUALITY_SCORECARDS.json`

Versioned advisory outputs (v1.0, v1.1) with full provenance tracking and diff computation.

## Operational Truth

Production readiness is defined by the gate runner and generated scorecards/inventory:
- **Gate Runner**: `/scripts/refactor/validate_gates.sh` (5/5 gates passing)
- **Final Status**: `/docs/planning/refactoring/FINAL_STATUS_REPORT.md` (COMPLETE status)
- **Quality Scores**: `/docs/planning/refactoring/QUALITY_SCORECARDS.json` (71.7/100 overall)
- **File Registry**: `/docs/planning/refactoring/FILE_INVENTORY.json` (828 files, 0% UNKNOWN)

All capabilities have runtime contracts and are classified in the file inventory.
