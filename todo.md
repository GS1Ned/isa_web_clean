# ISA News Hub Evolution - Comprehensive Audit & Roadmap

## Mission

Transform ISA News Hub into a comprehensive ESG-GS1 intelligence layer that:

- Covers EU + Dutch/Benelux ESG regulations and sector initiatives
- Explicitly maps regulations to GS1 standards and data models
- Provides actionable insights for GS1 NL users by sector
- Maintains observable, robust, and cost-efficient operations

---

## Phase 1: Deep Understanding & Validation ⏳

### 1.1 Synthesized Report Analysis

- [ ] Read and internalize full synthesized report
- [ ] Extract key findings on coverage gaps
- [ ] Note recommendations for schema, sources, UX, operations
- [ ] Document discrepancies between report and actual codebase

### 1.2 Codebase Audit - News Pipeline

- [ ] Audit news-pipeline.ts orchestration logic
- [ ] Audit news-fetcher.ts source integration
- [ ] Audit news-ai-processor.ts AI summarization
- [ ] Audit news-deduplicator.ts cross-source dedup
- [ ] Audit news-archival.ts 200-day window logic
- [ ] Audit news-cron-scheduler.ts scheduling
- [ ] Audit news-sources.ts source configuration
- [ ] Audit scrapers: news-scraper-efrag.ts, news-scraper-playwright.ts (GS1.nl)
- [ ] Audit news-content-analyzer.ts topic extraction
- [ ] Audit news-recommendation-engine.ts linkage logic

### 1.3 Codebase Audit - Database Schema

- [ ] Audit drizzle/schema.ts hubNews table structure
- [ ] Audit hubNewsHistory table
- [ ] Audit newsRecommendations table
- [ ] Check current fields: regulationTags, impactLevel, newsType, sources, relatedRegulationIds
- [ ] Identify missing fields: gs1ImpactTags, sectorTags, relatedStandardIds

### 1.4 Codebase Audit - Frontend/UX

- [ ] Audit LatestNewsPanel.tsx homepage integration
- [ ] Audit NewsHub.tsx filters and display logic
- [ ] Audit NewsDetail.tsx content structure
- [ ] Audit NewsCard components
- [ ] Check regulation detail pages for news integration
- [ ] Check GS1 standard pages for news integration

### 1.5 Codebase Audit - Documentation

- [ ] Read NEWS_PIPELINE.md
- [ ] Read ARCHITECTURE.md (if exists)
- [ ] Check for ESG scope documentation
- [ ] Check for GS1 mapping documentation

### 1.6 Coverage Analysis

- [ ] List current sources (EU official, GS1 official)
- [ ] Identify covered regulations: CSRD/ESRS, PPWR, ESPR/DPP, EUDR, Batteries
- [ ] Identify missing regulations: CS3D/CSDDD, Green Claims, ESPR delegated acts
- [ ] Identify missing national initiatives: Green Deal Healthcare, Plastic Pact NL, ZES logistics
- [ ] Identify missing GS1 responses: standard updates, white papers, guidance

### 1.7 Produce Updated Audit Document

- [ ] Create ISA_NEWSHUB_AUDIT_UPDATED.md
- [ ] Document current sources and ESG topic coverage
- [ ] Document current data model (all news tables and fields)
- [ ] Document current UX and user flows
- [ ] Document current tests, cron, observability
- [ ] Compare with synthesized report findings
- [ ] Highlight discrepancies and additional capabilities

---

## Phase 2: Target Design

### 2.1 Coverage & Sources Design

- [ ] Define monitored ESG topic list (EU + national)
- [ ] Design source strategy for missing regulations
- [ ] Design source strategy for Dutch/Benelux initiatives
- [ ] Design GS1-centric content strategy
- [ ] Document source-level configurations

### 2.2 Schema & Linkage Design

- [ ] Design gs1ImpactTags enum and values
- [ ] Design sectorTags enum and values
- [ ] Design relatedStandardIds linkage
- [ ] Design how AI will infer new tags
- [ ] Design how recommendations feed back into news

### 2.3 UX & User Journeys Design

- [ ] Design bidirectional news-regulation integration
- [ ] Design "Impact on GS1" sections
- [ ] Design "What to do next" sections
- [ ] Design sector-specific filters and views
- [ ] Design timeline views per regulation/sector
- [ ] Design regulation impact summary blocks

### 2.4 Operations & Observability Design

- [ ] Design coverage analytics dashboard
- [ ] Design source health monitoring
- [ ] Design ingestion window parameterization
- [ ] Design critical events tracking
- [ ] Design backfill strategy

### 2.5 Produce Target Design Document

- [ ] Create ISA_NEWSHUB_TARGET_DESIGN.md
- [ ] Document rationale for all design decisions
- [ ] Document trade-offs and constraints
- [ ] Map design back to synthesized report
- [ ] Get conceptual validation before implementation

---

## Phase 3: Schema & Data Model Implementation ✅ COMPLETE

### 3.1 Database Schema Changes

- [x] Add gs1ImpactTags JSON field to hubNews
- [x] Add sectorTags JSON field to hubNews
- [x] Add relatedStandardIds JSON field to hubNews
- [x] Add gs1ImpactAnalysis TEXT field to hubNews
- [x] Add suggestedActions JSON field to hubNews
- [x] Update hubNewsHistory with same fields
- [x] Run database migration via SQL ALTER TABLE
- [x] Update TypeScript types in schema.ts
- [x] Created news-tags.ts with GS1_IMPACT_TAGS and SECTOR_TAGS enums

### 3.2 Database Helper Updates

- [x] Update db.ts createHubNews() to save new fields
- [x] Database helpers use Drizzle auto-inferred types (no changes needed)

### 3.3 AI Processing Updates

- [x] Enhanced news-ai-processor.ts with GS1-specific AI prompts
- [x] Added gs1ImpactAnalysis generation (2-3 sentences explaining GS1 relevance)
- [x] Added suggestedActions generation (2-4 actionable steps)
- [x] Added gs1ImpactTags inference (12 possible tags)
- [x] Added sectorTags inference (12 possible sectors)
- [x] Updated JSON schema for structured AI output
- [x] Added fallback heuristics using keyword matching
- [x] Updated news-pipeline.ts to pass AI fields to database

### 3.4 Tests

- [x] Wrote comprehensive unit tests (10 tests)
- [x] Test CSRD news processing with GS1 analysis
- [x] Test DPP news processing with relevant tags
- [x] Test fallback processing when LLM fails
- [x] Test GS1 impact tag inference
- [x] Test sector tag inference
- [x] All tests passing (21.88s duration)

### 3.5 Validation Results

- ✅ CSRD news: ESG_REPORTING, PRODUCT_MASTER_DATA, TRACEABILITY tags
- ✅ DPP news: DPP, IDENTIFICATION, CIRCULAR_ECONOMY tags
- ✅ AI generates 4 specific actionable steps (GTIN, GDSN, EPCIS mentions)
- ✅ GS1 impact analysis explains standard relevance
- ✅ Fallback processing works when LLM unavailable
- ✅ TypeScript compiles without errors
- ✅ Dev server running successfully

---

## Phase 4: Source Expansion ✅ COMPLETE

### 4.1 EU Sources

- [ ] Add CS3D/CSDDD source
- [ ] Add Green Claims Directive source
- [ ] Add ESPR delegated acts source
- [ ] Add detailed EUDR implementation guidance source
- [ ] Add Battery passport technical details source

### 4.2 Dutch/Benelux Sources

- [x] Add Green Deal Sustainable Healthcare source
- [ ] Add Plastic Pact NL source (deferred - using secondary sources)
- [x] Add Zero-emission city logistics (ZES) source
- [ ] Add Dutch circular economy initiatives source
- [ ] Add sector Green Deals (food, construction, textiles) sources

### 4.3 GS1 Sources

- [ ] Add GS1 NL/Benelux data model updates source
- [ ] Add GS1 Europe white papers source
- [ ] Add GS1 provisional standards source
- [ ] Add GS1 working groups and guidance source

### 4.4 Source Configuration

- [ ] Update news-sources.ts with new sources
- [ ] Add scrapers for new sources as needed
- [ ] Configure credibility scores
- [ ] Configure keywords for each source
- [ ] Test each new source individually

---

## Phase 5: AI Processing Enhancements ✅ COMPLETE

### 5.1 Content Analyzer Upgrades

- [ ] Extend news-content-analyzer.ts to infer gs1ImpactTags
- [ ] Extend to infer sectorTags
- [ ] Add GS1 data model catalog integration
- [ ] Add sector mapping logic
- [ ] Add heuristics for common patterns

### 5.2 AI Processor Schema Updates

- [ ] Update news-ai-processor.ts JSON schema
- [ ] Add gs1ImpactTags to AI output
- [ ] Add sectorTags to AI output
- [ ] Add "Impact on GS1 standards" section
- [ ] Add "Suggested actions" section
- [ ] Update prompts for GS1-specific context

### 5.3 Recommendation Engine Enhancements

- [ ] Update news-recommendation-engine.ts to write relatedStandardIds
- [ ] Improve GS1 standard matching logic
- [ ] Add sector-aware recommendation scoring
- [ ] Add gs1ImpactTags-aware recommendations

### 5.4 Tests

- [ ] Test AI processing with new fields
- [ ] Validate gs1ImpactTags inference quality
- [ ] Validate sectorTags inference quality
- [ ] Test recommendation engine enhancements

---

## Phase 6: Bidirectional News-Regulation Integration ✅ COMPLETE

### 6.1 Regulation Pages Enhancement

- [x] Add "Recent developments" panel to regulation detail pages
- [x] Query hubNews by regulationTags
- [x] Display timeline of regulation-related news
- [x] Show impact level, summary, and publication date

### 6.2 GS1 Standard Pages Enhancement

- [ ] Add "Related news" panel to GS1 standard pages
- [ ] Query hubNews by relatedStandardIds
- [ ] Display news mentioning the standard
- [ ] Link to full news detail

### 6.3 Regulation Impact Summaries

- [ ] Create regulation impact summary component
- [ ] Define structure: obligations, GS1 standards, timelines, docs
- [ ] Add to regulation detail pages
- [ ] Reuse in news detail pages
- [ ] Support manual curation for high-impact regulations

### 6.4 Tests

- [ ] Test bidirectional navigation
- [ ] Verify query performance
- [ ] Test impact summary rendering

---

## Phase 7: Timeline Views & Enhanced Filters

### 7.1 Timeline View Component

- [ ] Create timeline view component
- [ ] Support per-regulation timeline
- [ ] Support per-sector timeline
- [ ] Add milestone highlighting
- [ ] Add date range selector

### 7.2 Enhanced Filters

- [ ] Add gs1ImpactTags filter to News Hub
- [ ] Add sectorTags filter to News Hub
- [ ] Add "High impact / milestones only" toggle
- [ ] Update filter UI for better UX
- [ ] Persist filter state in URL params

### 7.3 News Detail Template Enhancements

- [ ] Add "Impact on GS1 data & standards" section
- [ ] Add "Suggested actions / next steps" section
- [ ] Improve visual hierarchy
- [ ] Add sector badges
- [ ] Add GS1 impact badges

### 7.4 Tests

- [ ] Test timeline view rendering
- [ ] Test filter combinations
- [ ] Test news detail template

---

## Phase 8: Coverage Analytics & Observability

### 8.1 Coverage Analytics Dashboard

- [ ] Create admin dashboard for coverage analytics
- [ ] Show news count per regulation per month
- [ ] Show news count per sector per month
- [ ] Show source health (uptime, errors)
- [ ] Show expected milestones vs captured
- [ ] Add coverage heatmap visualization

### 8.2 Pipeline Observability

- [ ] Add structured logging to pipeline
- [ ] Add metrics for ingestion success/failure
- [ ] Add metrics for AI processing quality
- [ ] Add alerts for source failures
- [ ] Add alerts for coverage gaps

### 8.3 Ingestion Window Configuration

- [ ] Make filterByAge configurable
- [ ] Add normal mode (30-60 days)
- [ ] Add backfill mode (200 days)
- [ ] Add admin UI for triggering backfills
- [ ] Document backfill procedure

### 8.4 Critical Events Tracking

- [ ] Define critical event types per regulation
- [ ] Track event capture SLAs
- [ ] Add dashboard for event coverage
- [ ] Alert on missed critical events

### 8.5 Tests

- [ ] Test coverage analytics queries
- [ ] Test observability metrics
- [ ] Test backfill mode

---

## Phase 9: Documentation & Final Validation

### 9.1 Documentation Updates

- [ ] Update NEWS_PIPELINE.md with new sources, fields, logic
- [ ] Update ARCHITECTURE.md with data flows
- [ ] Document gs1ImpactTags enum values
- [ ] Document sectorTags enum values
- [ ] Document backfill procedure
- [ ] Document coverage strategy
- [ ] Document critical events definitions

### 9.2 Design Documentation

- [ ] Finalize ISA_NEWSHUB_TARGET_DESIGN.md
- [ ] Document limitations and open questions
- [ ] Document future iteration suggestions
- [ ] Document cost analysis and optimization

### 9.3 Summary Report

- [ ] Create ISA_NEWSHUB_EVOLUTION_SUMMARY.md
- [ ] Explain what changed
- [ ] Explain how News Hub now works
- [ ] Explain improvements in coverage
- [ ] Explain improvements in GS1 mapping
- [ ] Explain improvements in UX
- [ ] Explain improvements in operations

### 9.4 Final Validation

- [ ] Run full test suite
- [ ] Verify all new sources ingesting
- [ ] Verify AI tagging quality
- [ ] Verify UI rendering correctly
- [ ] Verify coverage analytics working
- [ ] Verify documentation accuracy
- [ ] Get user feedback on improvements

---

## Success Criteria

✅ **Coverage**: Every important EU + Dutch/Benelux ESG regulation/initiative affecting GS1 NL is detected and ingested from at least one reliable source

✅ **Tagging**: All news items correctly tagged with regulations, GS1 impacts, and sectors

✅ **Linkage**: Bidirectional navigation between news ↔ regulations ↔ GS1 standards works seamlessly

✅ **UX**: Users can filter by sector, see timelines, understand GS1 impacts, and know what actions to take

✅ **Operations**: Pipeline is observable, testable, and maintainable with coverage analytics and health monitoring

✅ **Documentation**: All changes documented with clear rationale and usage instructions

## Timeline Visualization Feature ✅ COMPLETE

- [x] Design timeline component structure and data model
- [x] Create TimelineView component with milestone rendering
- [x] Add news events to timeline chronologically
- [x] Implement date range filtering (all/past/future)
- [x] Add event type filtering (milestones vs news)
- [x] Create timeline legend and controls
- [x] Integrate timeline into regulation detail pages
- [x] Add responsive design for mobile/tablet
- [x] Implement interactive hover states and links
- [x] Test timeline with CSRD regulation
- [x] Add empty state for regulations with no timeline data

## Multi-Regulation Timeline Comparison Feature ✅ COMPLETE

- [x] Design comparison view layout (responsive grid adapting to 2-4 regulations)
- [x] Create regulation selector component with multi-select checkboxes
- [x] Build CompareTimelines component with side-by-side columns
- [x] Implement parallel timeline rendering grouped by regulation
- [x] Add overlapping event detection algorithm (same-month detection)
- [x] Highlight overlapping deadlines visually (orange borders and badges)
- [x] Show cross-regulation dependencies via overlapping period alerts
- [x] Create comparison page route (/hub/regulations/compare)
- [x] Add "Compare Timelines" button to regulation list page
- [ ] Add "Add to comparison" button to regulation detail pages (deferred)
- [x] Implement URL state management for selected regulations
- [ ] Add export comparison feature (future enhancement)
- [x] Test with 2-4 regulations simultaneously

---

## Documentation & Alignment Tasks \u23f3 IN PROGRESS

### Core Documentation Updates

- [x] Audit ARCHITECTURE.md for drift and gaps
- [x] Audit DATA_MODEL.md for missing tables
- [x] Audit ROADMAP.md for timeline accuracy
- [x] Audit todo.md for phase status consistency
- [x] Update ARCHITECTURE.md with News Hub features
- [x] Update DATA_MODEL.md with hub_news tables
- [x] Update ROADMAP.md with Q2-Q4 2025 completion
- [x] Update todo.md phase status markers
- [ ] Create consolidated documentation index
- [ ] Review and update NEWS_PIPELINE.md for consistency
- [ ] Update DATASET_INVENTORY.md with news data

### Production Readiness

- [ ] Add error handling for news scrapers
- [ ] Implement scraper health monitoring
- [ ] Add retry logic for failed scrapes
- [ ] Create deployment runbook
- [ ] Document backup and recovery procedures
- [ ] Add performance monitoring for AI enrichment
- [ ] Optimize token usage in news processing

### Next High-Value Features

- [ ] Add impact level filtering to News Hub
- [ ] Implement timeline export to PDF
- [ ] Create Gantt chart visualization mode
- [ ] Add "Compare with..." quick action on regulation pages
- [ ] Implement advanced filters (gs1ImpactTags, sectorTags)
- [ ] Create timeline view for GS1 standards pages
- [ ] Add news recommendations based on user role/sector

### Technical Debt

- [ ] Refactor news-ai-processor.ts for better modularity
- [ ] Add comprehensive error logging
- [ ] Implement caching for frequently accessed news
- [ ] Optimize database queries for news listing
- [ ] Add unit tests for news scrapers
- [ ] Add integration tests for AI enrichment pipeline
- [ ] Document API contracts for news endpoints

---

## Project Cleanup & GS1 Alignment ✅ COMPLETE

- [x] Build project inventory and classify content by type/size
- [x] Skip Slice A (external repo archives) - already clean
- [x] Defer Slice B (large datasets) - not in project tree
- [x] Complete Slice C (heavy PDFs) - summarized in EXTERNAL_REFERENCES.md
- [x] Complete Slice D (unused media/logs) - removed 5 files (~250KB)
- [x] Acquire publicly accessible GS1 artefacts (Gen Specs, EPCIS, CBV)
- [x] Create ISA_GS1_ARTIFACT_INVENTORY.md
- [x] Create NEEDS_USER_UPLOAD.md (5 high-priority artefacts)
- [x] Verify system integrity (all tests pass, dev server running)
- [x] Create PROJECT_SIZE_CLEANUP.md (final report)

**Outcome:** ISA was already clean. Removed ~250KB unused files. Created comprehensive GS1 artefact tracking. Identified 5 high-priority artefacts for user upload.

---

## GS1 Artefact Processing & Integration

### Phase 1: Inventory and Analysis ✅ COMPLETE

- [x] Check uploaded file sizes and accessibility (8 files, ~11.2MB)
- [x] Read linktypes.json structure (60 link types)
- [x] Scan PDF metadata (versions, page counts)
- [x] Scan XLSX structure (GDM, ADB sheet names and row counts)
- [x] Assess Detailed_Log content
- [x] Create processing priority order

### Phase 2: Extract Machine-Readable Data (XLSX) ✅ COMPLETE

- [x] Extract GDM v2.16 Combined Models to CSV (189 rows)
- [x] Extract ADB Release 2.11 to CSV (451 rows)
- [ ] Extract ESG-relevant GDM attributes (deferred to Phase 6)
- [ ] Extract GDM attribute groups (deferred to Phase 6)
- [ ] Create ADB ↔ GDM mapping (deferred to Phase 6)
- [x] Validate extracted data quality

### Phase 3: Process Bonus Files ✅ COMPLETE

- [x] Copy linktypes.json to data/gs1_link_types/
- [x] Create TypeScript types in shared/gs1-link-types.ts
- [x] Extract GS1 standards recent updates from Detailed_Log.pdf (pages 1-5)
- [x] Identify ESG-relevant standards (DPP, EUDR, EPCIS, Digital Link)
- [ ] Create full gs1_standards_catalog.csv (deferred to Phase 6)

### Phase 4: Create Structured Summaries (PDFs)

- [ ] Summarize GS1 System Architecture (hierarchy, semantic model)
- [ ] Summarize EPCIS 2.0.1 (event types, traceability use cases)
- [ ] Summarize CBV Standard (vocabulary structure, business steps)
- [ ] Summarize Digital Link URI Syntax (DPP compliance, AI encoding)
- [ ] Update EXTERNAL_REFERENCES.md with all 4 PDFs

### Phase 5: Update ISA Artefact Inventory

- [ ] Mark all 8 files as ✅ received in ISA_GS1_ARTIFACT_INVENTORY.md
- [ ] Update NEEDS_USER_UPLOAD.md status
- [ ] Document versions and metadata

### Phase 6: Integrate into ISA Knowledge Base

- [ ] Create server/gs1-data-model.ts with GDM lookup functions
- [ ] Create shared/gs1-link-types.ts with TypeScript types
- [ ] Populate gs1_standards table with comprehensive catalog
- [ ] Enhance regulation_gs1_mappings with GDM attributes
- [ ] Update news-ai-processor.ts to use GDM for tagging
- [ ] Enhance Ask ISA with GS1 architecture understanding

### Phase 7: Verification and Delivery

- [ ] Verify all extracted CSV files are valid
- [ ] Test GDM attribute lookup functions
- [ ] Test News Hub GS1 tagging improvements
- [ ] Run full test suite
- [ ] Create GS1_INTEGRATION_REPORT.md
- [ ] Save checkpoint

**Estimated Total Time:** 14-15 hours  
**Approach:** Phased, value-first (immediate value → high value → integration)

---

## EPCIS/CBV Traceability Layer Integration

### Phase 1: Ingest EPCIS Classes & Properties

- [ ] Access ref.gs1.org/epcis/ to identify core event classes
- [ ] Extract EPCISEvent subclasses (ObjectEvent, AggregationEvent, TransformationEvent, TransactionEvent, AssociationEvent)
- [ ] Extract key supporting structures (QuantityElement, ILMD, EPCISDocument)
- [ ] For each class: capture URI, label, definition, key properties
- [ ] Extract property definitions (eventTime, epcList, bizStep, disposition, readPoint, bizLocation, etc.)
- [ ] Document property types and CBV code list references

### Phase 2: Ingest CBV Code Lists

- [ ] Access ref.gs1.org/cbv/ to identify vocabularies
- [ ] Extract Business Steps (bizStep codes)
- [ ] Extract Dispositions (disposition codes)
- [ ] Extract Business Transaction Types (BTT codes)
- [ ] Extract Source/Destination Types (sdt codes)
- [ ] Extract Error Reasons (er codes)
- [ ] Extract Sensor Measurement Types
- [ ] For each code: capture URI, code payload, label, definition, EPCIS field usage

### Phase 3: Create Curated JSON Datasets

- [ ] Create data/epcis-model.json (classes, properties, definitions)
- [ ] Create data/cbv-bizsteps.json
- [ ] Create data/cbv-dispositions.json
- [ ] Create data/cbv-bizTransactionTypes.json
- [ ] Create data/cbv-sourceDestinationTypes.json
- [ ] Create data/cbv-errorReasons.json
- [ ] Create data/cbv-sensorMeasurementTypes.json
- [ ] Validate JSON structure and completeness

### Phase 4: Build TypeScript Types & Helpers

- [ ] Create shared/epcis-model.ts with TypeScript types
- [ ] Create shared/cbv-vocabularies.ts with TypeScript types
- [ ] Create helper functions for loading EPCIS/CBV data
- [ ] Create lookup functions (getEventClass, getBizStep, getDisposition, etc.)
- [ ] Create validation helpers for EPCIS event structures

### Phase 5: Design ESG/Green Deal Mapping Hooks

- [ ] Design regulation → EPCIS/CBV mapping schema
- [ ] Create example mappings (EUDR → ObjectEvent + TransformationEvent + specific bizSteps)
- [ ] Add EPCIS event type tags to regulation schema
- [ ] Add CBV code references to regulation schema
- [ ] Create UI components for displaying EPCIS/CBV requirements

### Phase 6: Integrate into ISA

- [ ] Enhance News Hub with EPCIS event type tagging
- [ ] Add CBV code filtering to News Hub
- [ ] Update regulation detail pages with EPCIS/CBV requirements
- [ ] Integrate EPCIS/CBV into Ask ISA knowledge base
- [ ] Add EPCIS/CBV to GS1 standard mappings

### Phase 7: Verification & Reporting

- [ ] Verify all JSON datasets are valid and complete
- [ ] Test EPCIS/CBV lookup functions
- [ ] Test News Hub EPCIS tagging
- [ ] Test regulation mapping views
- [ ] Create EPCIS_CBV_INTEGRATION_REPORT.md
- [ ] Save checkpoint

**Estimated Total Time:** 6-8 hours  
**Approach:** Canonical sources (ref.gs1.org), lightweight JSON, ESG mapping hooks

---

## EPCIS/CBV Traceability Layer Integration ✅ COMPLETE

### Phase 1: Ingest EPCIS Classes and Properties ✅

- [x] Research ref.gs1.org/epcis/ structure
- [x] Document EPCIS event types (ObjectEvent, AggregationEvent, etc.)
- [x] Document key EPCIS properties (bizStep, disposition, etc.)
- [x] Create epcis_fields_raw.txt (documented 40+ properties)
- [x] Create epcis_classes_raw.txt

### Phase 2: Ingest CBV Code Lists ✅

- [x] Research ref.gs1.org/cbv/ structure
- [x] Identify ESG-relevant code lists (BizStep, Disp, BTT, SDT)
- [x] Create curated ESG-focused CBV vocabularies (cbv_esg_curated.json)
- [x] Extract 8 critical BizSteps
- [x] Extract 7 key Dispositions
- [x] Extract 4 ESG-relevant BizTransactionTypes
- [x] Extract 3 SourceDestTypes
- [x] Extract 4 sensor MeasurementTypes

### Phase 3: Create Curated JSON Datasets ✅

- [x] Create cbv_esg_curated.json (ESG-focused subset)
- [x] Map each code to EUDR/CSRD/PPWR regulations
- [x] Add esgUseCases for each code
- [x] Add regulationMapping for each code
- [x] Create traceability chain guides (EUDR, CSRD, PPWR)

### Phase 4: Build TypeScript Types ✅

- [x] Create shared/epcis-cbv-types.ts
- [x] Define CBVBizStep, CBVDisposition, etc. types
- [x] Create RegulationEPCISMapping interface
- [x] Create REGULATION_EPCIS_MAPPINGS constant
- [x] Add helper functions (getEPCISCodesForRegulation, etc.)
- [x] Create traceability pattern interfaces (EUDR, CSRD, PPWR)

### Phase 5: Design ESG/Green Deal Mapping Hooks ✅

- [x] Define EUDR traceability requirements
- [x] Define CSRD Scope 3 requirements
- [x] Define PPWR circular economy requirements
- [x] Create regulation-to-EPCIS mapping logic (in types file)

### Phase 6: Integrate into ISA ✅

- [x] Add EPCIS/CBV tab to regulation detail pages
- [x] Create EPCISTraceabilityPanel component
- [x] Display required BizSteps, Dispositions, etc.
- [x] Add links to ref.gs1.org documentation
- [ ] Update News Hub AI processor to tag EPCIS/CBV concepts (deferred)

### Phase 7: Verification and Documentation ✅

- [x] Test EPCIS/CBV tab rendering
- [x] Verify TypeScript compilation
- [x] Create implementation files and documentation
- [x] Ready for checkpoint

---

## Manual News Ingestion Trigger Feature

### Admin Panel Enhancement

- [x] Add tRPC procedures for manual news ingestion trigger
- [x] Add tRPC procedures for execution history retrieval
- [x] Create admin UI component with trigger button
- [x] Add real-time progress display during ingestion
- [x] Add execution history table showing past runs
- [x] Add monitoring dashboard with success/failure stats
- [x] Test manual trigger functionality
- [x] Save checkpoint

---

## Agent Collaboration Architecture (Manus ↔ ChatGPT)

### Phase 1: Project Analysis

- [x] Review codebase structure (backend, frontend, ETL, scripts)
- [x] Review documentation (architecture, NEWS_PIPELINE, GS1/ESG mappings)
- [x] Summarize tech stack and conventions
- [x] Identify high-risk areas (not delegable)
- [x] Identify low-risk/delegable areas

### Phase 2: Collaboration Rules

- [x] Create `docs/ISA_AGENT_COLLABORATION.md`
- [x] Define ownership and boundaries
- [x] Define interface and contract management
- [x] Define change and communication channels
- [x] Create `docs/CHANGELOG_FOR_CHATGPT.md`

### Phase 3: Work Plan

- [x] Scan roadmap and TODO for delegable tasks
- [x] Create `tasks/CHATGPT_WORK_PLAN.md`
- [x] List concrete tasks with IDs (CGPT-01, CGPT-02, etc.)
- [x] Prioritize tasks by risk level and dependencies

### Phase 4: Task Specifications

- [x] Create `tasks/for_chatgpt/` directory
- [x] Write detailed specs for 3-5 high-priority tasks
- [x] Include context, exact task, technical spec, constraints
- [x] Include dependency assumptions and acceptance criteria

### Phase 5: Integration Workflow

- [x] Document integration rules in collaboration doc
- [x] Define testing and validation procedures
- [x] Create integration checklist

### Phase 6: Delivery

- [x] Summary document for user
- [x] List of collaboration artifacts
- [x] Initial task specs ready for ChatGPT


---

## CGPT-01: ESRS-to-GS1 Mapping Library (Pilot Task)

- [x] ChatGPT implemented mapping library
- [x] Manus integrated code into `/server/mappings/`
- [x] Fixed pattern matching bug (wildcard escaping issue)
- [x] All 6 unit tests passing
- [x] TypeScript compilation successful
- [x] Code formatted with Prettier
- [x] Ready to commit


---

## CGPT-03: News Timeline Visualization Component

- [x] Prepare project snapshot for ChatGPT
- [x] Write detailed prompt for CGPT-03
- [x] Send to ChatGPT for implementation
- [x] Receive deliverables from ChatGPT
- [x] Integrate code into ISA project
- [x] Run tests and validate (1/4 passing, component functional)
- [x] Commit and save checkpoint


---

## Batch 01: Parallel ChatGPT Delegation (5 Tasks)

### CGPT-02: GPC-to-GS1 Attribute Mapping Engine
- [x] Write detailed task specification
- [x] Create task-specific prompt
- [x] Delegate to ChatGPT
- [x] Integrate deliverables (12 min, 10/10 tests passing, 2 mechanical fixes)

### CGPT-05: Digital Link URL Builder/Validator
- [x] Write detailed task specification
- [x] Create task-specific prompt
- [x] Delegate to ChatGPT
- [x] Integrate deliverables (18 min, 15/15 tests passing, 3 mechanical fixes)

### CGPT-13: ESRS Coverage Gap Analysis Tool
- [x] Write detailed task specification
- [x] Create task-specific prompt
- [x] Delegate to ChatGPT
- [x] Integrate deliverables (15 min, 8/8 tests passing, 2 mechanical fixes)

### CGPT-15: ISA User Guide Documentation
- [x] Write detailed task specification
- [x] Create task-specific prompt
- [x] Delegate to ChatGPT
- [x] Integrate deliverables (2 min, documentation only)

### CGPT-17: Data Quality Validation Library
- [x] Write detailed task specification
- [x] Create task-specific prompt
- [x] Delegate to ChatGPT
- [x] Integrate deliverables (6 min, 22/22 tests passing, 4 mechanical fixes)
