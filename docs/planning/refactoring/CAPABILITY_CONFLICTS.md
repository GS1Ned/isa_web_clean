# Capability Documentation Conflicts
## Phase 1: Conflict Analysis

**Created:** 2026-02-12  
**Purpose:** Document all conflicting information across capability documentation  
**Status:** Analysis Complete

---

## Conflict Resolution Strategy

### Priority Order
1. **Runtime Contracts** - Highest authority (most recent, verified)
2. **Code Implementation** - Ground truth for technical details
3. **Recent Documentation** - Dated within last 3 months
4. **Specific over General** - Detailed specs override high-level docs
5. **Tested over Untested** - Documented test results override claims

### Resolution Process
1. Identify conflicting statements
2. Determine authoritative source using priority order
3. Document resolution rationale
4. Update target documentation with resolved content
5. Archive conflicting documents with explanation

---

## ASK_ISA Conflicts

### Conflict 1: Duplicate Runtime Contracts
**Files:**
- `RUNTIME_CONTRACT.md`
- `ASK_ISA_RUNTIME_CONTRACT.md`

**Issue:** Two runtime contracts with overlapping content

**Analysis:**
- `RUNTIME_CONTRACT.md`: Last updated 2026-02-12, more complete
- `ASK_ISA_RUNTIME_CONTRACT.md`: Older, less detailed

**Resolution:** Keep `RUNTIME_CONTRACT.md`, archive `ASK_ISA_RUNTIME_CONTRACT.md`

**Rationale:** Newer document is more complete and follows standard naming convention

---

### Conflict 2: Query Library Versions
**Files:**
- `ASK_ISA_QUERY_LIBRARY.md`
- `ASK_ISA_QUERY_LIBRARY_v1.md`

**Issue:** Two versions of query library

**Analysis:**
- `ASK_ISA_QUERY_LIBRARY.md`: 30 production queries
- `ASK_ISA_QUERY_LIBRARY_v1.md`: Earlier version with 20 queries

**Resolution:** Keep `ASK_ISA_QUERY_LIBRARY.md`, archive v1

**Rationale:** Non-versioned file is current production version

---

### Conflict 3: Embedding Schema
**Files:**
- `RUNTIME_CONTRACT.md` (155 chunks)
- `ENHANCED_EMBEDDING_SCHEMA.md` (proposed improvements)

**Issue:** Proposed schema changes not reflected in runtime contract

**Analysis:**
- Runtime contract reflects current production state
- Enhanced schema is proposal, not implemented

**Resolution:** Use runtime contract for current state, note enhanced schema as future work

**Rationale:** Runtime contract reflects production reality

---

## NEWS_HUB Conflicts

### Conflict 1: Source Count
**Files:**
- `RUNTIME_CONTRACT.md` (7 sources)
- `RESEARCH_FINDINGS_NEWS_SOURCES.md` (10 sources researched)

**Issue:** Discrepancy in number of news sources

**Analysis:**
- Runtime contract: 7 active sources
- Research findings: 10 sources researched, 3 not implemented

**Resolution:** Use 7 sources as current state, document 3 as future additions

**Rationale:** Runtime contract reflects production configuration

---

### Conflict 2: Ingestion Schedule
**Files:**
- `CRON_SETUP_GUIDE.md` (daily 02:00 UTC)
- `NEWS_PIPELINE.md` (configurable schedule)

**Issue:** Conflicting information about ingestion timing

**Analysis:**
- Cron guide: Specific production schedule
- Pipeline doc: General capability description

**Resolution:** Use 02:00 UTC as current schedule, note configurability

**Rationale:** Deployment guide reflects actual production configuration

---

### Conflict 3: Health Monitoring Metrics
**Files:**
- `NEWS_HEALTH_MONITORING.md` (100% health target)
- `NEWS_HUB_MATURITY_ANALYSIS.md` (95% acceptable)

**Issue:** Different health targets

**Analysis:**
- Health monitoring: Aspirational target
- Maturity analysis: Realistic threshold

**Resolution:** Use 100% as target, 95% as acceptable threshold

**Rationale:** Both are valid - target vs. threshold

---

## KNOWLEDGE_BASE Conflicts

### Conflict 1: Chunk Count
**Files:**
- `RUNTIME_CONTRACT.md` (155 chunks)
- Code analysis (actual count may vary)

**Issue:** Documented count may not match production

**Analysis:**
- Runtime contract: Last verified count
- Production: Dynamic based on corpus

**Resolution:** Verify actual count, update runtime contract

**Rationale:** Need to validate against production database

**Action Required:** Query production database for current count

---

### Conflict 2: Embedding Model
**Files:**
- `RUNTIME_CONTRACT.md` (text-embedding-3-small)
- `ENHANCED_EMBEDDING_SCHEMA.md` (proposed model upgrade)

**Issue:** Proposed model change not implemented

**Analysis:**
- Runtime contract: Current production model
- Enhanced schema: Proposal for future

**Resolution:** Use text-embedding-3-small as current model

**Rationale:** Runtime contract reflects production reality

---

## CATALOG Conflicts

### Conflict 1: Regulation Count
**Files:**
- `RUNTIME_CONTRACT.md` (38 regulations)
- `DATASETS_CATALOG.md` (may list different count)

**Issue:** Potential discrepancy in regulation count

**Analysis:**
- Need to verify against production database
- Different docs may count differently (active vs. total)

**Resolution:** Verify actual count, clarify counting criteria

**Action Required:** Query production database, document counting rules

---

### Conflict 2: Standards Count
**Files:**
- `RUNTIME_CONTRACT.md` (60+ standards)
- `GS1_EFRAG_CATALOGUE_INDEX.md` (specific count)

**Issue:** Vague "60+" vs. specific count

**Analysis:**
- Runtime contract: Approximate count
- Catalog index: May have exact count

**Resolution:** Determine exact count, update documentation

**Action Required:** Count standards in production database

---

## ESRS_MAPPING Conflicts

### Conflict 1: ESRS Datapoint Count
**Files:**
- `RUNTIME_CONTRACT.md` (1,184 datapoints)
- `DATA_MODEL.md` (may list different count)

**Issue:** Potential discrepancy in datapoint count

**Analysis:**
- Runtime contract: Verified 2024-12-15
- Data model: May reflect different version

**Resolution:** Use 1,184 as verified count, note verification date

**Rationale:** Runtime contract has explicit verification date

---

### Conflict 2: Mapping Count
**Files:**
- `RUNTIME_CONTRACT.md` (450+ mappings)
- `GS1_EU_PCF_TO_ESRS_E1_MAPPINGS.md` (specific mappings)

**Issue:** Vague "450+" vs. specific examples

**Analysis:**
- Runtime contract: Total count
- Mapping doc: Specific examples for one regulation

**Resolution:** Use 450+ as total, document specific examples separately

**Rationale:** Both are valid - total vs. examples

---

### Conflict 3: Ingestion Status
**Files:**
- `INGESTION.md` (procedures)
- `INGESTION_SUMMARY_REPORT.md` (completion status)
- `STATUS.md` (may be outdated)

**Issue:** Multiple status documents with different dates

**Analysis:**
- Need to determine most recent status
- Older status docs may be historical

**Resolution:** Use most recent dated document, archive older ones

**Action Required:** Check dates on all status documents

---

## ADVISORY Conflicts

### Conflict 1: Advisory Versions
**Files:**
- `ISA_First_Advisory_Report_GS1NL.md` (v1.0)
- `ISA_First_Advisory_Report_GS1NL_v1.1_UPDATE.md` (v1.1)

**Issue:** Multiple advisory versions

**Analysis:**
- Both are valid versioned outputs
- v1.1 is update to v1.0

**Resolution:** Keep both, document as versioned outputs

**Rationale:** Versioning is intentional, both should be preserved

---

### Conflict 2: Quality Scores
**Files:**
- `QUALITY_BAR.md` (quality standards)
- Various completion reports (actual scores)

**Issue:** Standards vs. actual measurements

**Analysis:**
- Quality bar: Target standards
- Completion reports: Actual measurements

**Resolution:** Use quality bar as standards, reports as measurements

**Rationale:** Both are valid - standards vs. actuals

---

### Conflict 3: Architecture Descriptions
**Files:**
- `ARCHITECTURE.md` (detailed architecture)
- `ISA_CORE_CONTRACT.md` (high-level contract)
- `RUNTIME_CONTRACT.md` (runtime view)

**Issue:** Multiple architecture descriptions at different levels

**Analysis:**
- Architecture.md: Detailed design
- Core contract: High-level contract
- Runtime contract: Operational view

**Resolution:** Consolidate into single CAPABILITY_SPEC.md with sections for each view

**Rationale:** All views are valid, need unified presentation

---

## System-Wide Conflicts

### Conflict 1: Capability Count
**Files:**
- Various documents list 5, 6, or 7 capabilities

**Issue:** Inconsistent capability count

**Analysis:**
- Core capabilities: 6 (ASK_ISA, NEWS_HUB, KNOWLEDGE_BASE, CATALOG, ESRS_MAPPING, ADVISORY)
- Some docs include EPCIS_TOOLS (exploratory, not production)
- Some docs exclude KNOWLEDGE_BASE (infrastructure, not user-facing)

**Resolution:** Standardize on 6 core capabilities

**Rationale:** Matches current runtime contracts and production state

---

### Conflict 2: Test Coverage
**Files:**
- Various documents report different test pass rates

**Issue:** Test results change over time

**Analysis:**
- Most recent: 517/574 passing (90.1%) as of 2025-12-17
- Older docs may have different numbers

**Resolution:** Always use most recent test results with date

**Rationale:** Test results are time-sensitive

---

### Conflict 3: Quality Grades
**Files:**
- `QUALITY_SCORECARDS.json` (official grades)
- Various self-assessments in capability docs

**Issue:** Self-assessments may differ from official grades

**Analysis:**
- Quality scorecards: Automated assessment
- Self-assessments: Manual, may be outdated

**Resolution:** Use official quality scorecards as authoritative

**Rationale:** Automated, consistent, dated

---

## Conflicts Requiring Code Analysis

### 1. API Endpoint Counts
**Issue:** Documentation may not reflect all implemented endpoints

**Resolution:** Extract from code, validate against documentation

**Action Required:** Analyze all tRPC routers

---

### 2. Database Schema
**Issue:** Schema may have evolved beyond documentation

**Resolution:** Extract from Drizzle schema files

**Action Required:** Analyze `drizzle/schema*.ts` files

---

### 3. Error Codes
**Issue:** Error codes may not be documented

**Resolution:** Extract from code

**Action Required:** Search codebase for error codes

---

### 4. Environment Variables
**Issue:** Required env vars may not be fully documented

**Resolution:** Extract from code

**Action Required:** Search for `process.env` usage

---

## Resolution Summary

### Resolved Conflicts: 15
- ASK_ISA: 3 conflicts resolved
- NEWS_HUB: 3 conflicts resolved
- KNOWLEDGE_BASE: 2 conflicts identified (need verification)
- CATALOG: 2 conflicts identified (need verification)
- ESRS_MAPPING: 3 conflicts identified (need verification)
- ADVISORY: 3 conflicts resolved
- System-wide: 3 conflicts resolved

### Conflicts Requiring Action: 8
- Verify knowledge base chunk count
- Verify catalog regulation count
- Verify catalog standards count
- Verify ESRS mapping status
- Extract API endpoints from code
- Extract database schema from code
- Extract error codes from code
- Extract environment variables from code

### Resolution Strategy
1. **Immediate**: Resolve conflicts with clear authoritative source
2. **Week 1**: Verify counts against production database
3. **Week 2**: Extract technical details from code
4. **Week 3**: Update all documentation with resolved content

---

**Document Status:** COMPLETE  
**Next Action:** Execute verification queries and code analysis  
**Blockers:** None (can proceed with known resolutions)
