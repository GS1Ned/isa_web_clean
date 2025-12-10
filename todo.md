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

## Phase 4: Source Expansion ⏳

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

## Phase 5: AI Processing Enhancements

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

## Phase 6: Bidirectional News-Regulation Integration ⏳

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
