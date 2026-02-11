# ISA Repository Investigation & Refactoring Status Report
**Date:** 2026-02-11  
**Agent:** Amazon Q  
**Scope:** Complete repository analysis, News Hub investigation, 6-capability alignment

---

## Executive Summary

I have **NOT** fully investigated and refactored all content. I have:

1. ✅ **Fixed immediate blockers**: Schema migrations (87→82 test failures), environment setup
2. ✅ **Completed P1-0002**: Ask ISA smoke harness verified working
3. 🔄 **Started P1-0003**: News Hub baseline architecture mapping (IN PROGRESS)
4. ❌ **NOT completed**: Full documentation refactoring to align with 6 capabilities
5. ❌ **NOT completed**: Comprehensive repository refactoring plan

---

## What I Know About News Hub (Deployed Version)

### Current Production State

**Architecture:** Fully automated news aggregation + AI processing pipeline

**Components:**
- **13 Active Sources** (7 EU Official, 3 GS1 Official, 3 Dutch National)
  - EUR-Lex Official Journal (Playwright scraper)
  - EU Commission Press Corner (RSS)
  - EC Circular Economy (RSS)
  - EFRAG Sustainability (RSS)
  - GS1 Netherlands (RSS)
  - GS1 Europe (RSS)
  - Green Deal Duurzame Zorg (Playwright scraper)
  - Op weg naar ZES (Playwright scraper)
  - Rijksoverheid IenW (RSS)
  - Rijksoverheid Green Deals (RSS)
  - AFM CSRD (RSS)
  - **Phase 3 sources** (PHASE3_SOURCES imported but not yet documented)

**Database Schema:**
- `hub_news` table (active news < 200 days)
- `hub_news_history` table (archived news > 200 days)
- **31 columns** including:
  - Core: title, summary, content, newsType, publishedDate
  - Regulatory: regulationTags, impactLevel, sourceType
  - **NEW (Phase 8)**: gs1ImpactAnalysis, suggestedActions, gs1ImpactTags, sectorTags
  - **NEW (just added)**: regulatory_state, is_negative_signal, confidence_level, negative_signal_keywords, regulatory_event_id

**AI Processing:**
- OpenAI GPT-4 structured extraction
- Generates: headline, whatHappened, whyItMatters
- Extracts: regulation tags, impact level, news type
- **Phase 8 additions**: GS1 impact analysis, suggested actions, sector tags
- Fallback: keyword-based extraction

**Automation:**
- Daily ingestion: 2 AM (cron)
- Weekly archival: Sunday 3 AM (cron)
- Manual triggers available via admin UI

**Admin Tools:**
- `/admin/news-pipeline` - Manual triggers, statistics
- `/admin/coverage-analytics` - News distribution, source health
- `/admin/pipeline-observability` - Execution logs, AI quality metrics

**Frontend:**
- `/news-hub` - Full news feed with search/filter
- Homepage `LatestNewsPanel` - Top 6 recent items
- `NewsCard` component - Individual news display

### Phase 3 Expansion (Partially Implemented)

**Research completed** (see `docs/spec/newshub/RESEARCH_FINDINGS_NEWS_SOURCES.md`):
- 8 new source areas identified
- Priority: CS3D/CSDDD (HIGH), Green Claims (HIGH), ESPR Delegated Acts (HIGH)
- 4 sources with RSS available (EASY implementation)
- 3 sources requiring structured HTML scraping (MEDIUM)
- 1 source requiring complex scraping (HARD)

**Implementation status:**
- `server/news-sources-phase3.ts` exists but is **EMPTY** (created as stub)
- PHASE3_SOURCES imported in news-sources.ts but undefined
- Research findings documented but not yet implemented

### Known Issues

1. **Schema mismatch**: Fixed regulatory tracking columns (migration 0016)
2. **GS1 Global RSS disabled**: Azure WAF blocks automated requests
3. **EUR-Lex RSS disabled**: AWS WAF CAPTCHA challenge
4. **Phase 3 sources**: Research complete but implementation pending
5. **Test failures**: 82 tests still failing (down from 87)

---

## 6 Core Capabilities: Current Alignment Status

### 1. ASK_ISA ✅ (Well-Documented)

**Status:** DONE (P1-0002 completed)

**Documentation:**
- `docs/spec/ASK_ISA.md` - Minimal spec
- `docs/spec/contracts/ASK_ISA_RUNTIME_CONTRACT.md` - Runtime contract
- `docs/governance/ASK_ISA_SMOKE_RUNBOOK.md` - Smoke test runbook
- `scripts/probe/ask_isa_smoke.py` - Working smoke test

**Code Entrypoints:**
- `server/prompts/ask_isa/index.ts` - Prompt templates
- `server/routers/ask-isa.ts` - tRPC router
- `client/src/pages/AskISA.tsx` - UI component

**Gaps:** None identified

### 2. NEWS_HUB 🔄 (Partially Documented)

**Status:** IN_PROGRESS (P1-0003)

**Documentation:**
- `docs/spec/NEWS_HUB.md` - **MINIMAL** (only 13 lines, needs expansion)
- `docs/NEWS_PIPELINE.md` - **COMPREHENSIVE** (detailed architecture, 500+ lines)
- `docs/spec/newshub/RESEARCH_FINDINGS_NEWS_SOURCES.md` - Phase 3 research

**Code Entrypoints:**
- `server/news-sources.ts` - Source configuration (13 sources)
- `server/news-fetcher.ts` - RSS aggregation
- `server/news-ai-processor.ts` - AI processing
- `server/news-pipeline.ts` - Orchestration
- `server/news-archival.ts` - Archival system
- `server/news-cron-scheduler.ts` - Automation
- `server/services/news/scrapers/` - Playwright scrapers (3 files)
- `client/src/pages/NewsHub.tsx` - UI component

**Gaps:**
- `docs/spec/NEWS_HUB.md` needs expansion to match NEWS_PIPELINE.md detail
- Phase 3 sources implementation pending
- No baseline architecture diagram
- Missing end-to-end flow documentation in spec

### 3. KNOWLEDGE_BASE 📝 (Minimally Documented)

**Status:** READY (not yet started)

**Documentation:**
- `docs/spec/KNOWLEDGE_BASE.md` - **MINIMAL** (only goal/inputs/outputs)

**Code Entrypoints:**
- `server/db-knowledge.ts` - Database operations
- `server/routers/knowledge-base.ts` - tRPC router
- Admin UI for embedding generation

**Gaps:**
- No detailed architecture documentation
- No runtime contract
- No smoke test
- Needs full investigation

### 4. CATALOG 📝 (Minimally Documented)

**Status:** READY (not yet started)

**Documentation:**
- `docs/spec/CATALOG.md` - **MINIMAL** (only goal/inputs/outputs)

**Code Entrypoints:**
- Regulations: `server/db.ts`, `client/src/pages/Regulations.tsx`
- Standards: `server/routers/standards-directory.ts`, `client/src/pages/Standards.tsx`
- ESRS Datapoints: `server/routers/esrs-datapoints.ts`

**Gaps:**
- No unified catalog architecture
- Scattered across multiple routers
- No runtime contract
- Needs consolidation

### 5. ESRS_MAPPING 📝 (Minimally Documented)

**Status:** READY (not yet started)

**Documentation:**
- `docs/spec/ESRS_MAPPING.md` - **MINIMAL** (only goal/inputs/outputs)

**Code Entrypoints:**
- `server/mappings/` - Mapping engine
- `server/routers/gs1-esrs-mappings.ts` - tRPC router
- Database: `drizzle/schema_gs1_esrs_mappings.ts`

**Gaps:**
- No detailed mapping methodology
- No runtime contract
- No validation process documentation

### 6. ADVISORY 📝 (Minimally Documented)

**Status:** READY (not yet started)

**Documentation:**
- `docs/spec/ADVISORY.md` - **MINIMAL** (only goal/inputs/outputs)
- `docs/ISA_First_Advisory_Report_GS1NL.md` - v1.0 report
- `docs/ADVISORY_METHOD.md` - Methodology

**Code Entrypoints:**
- `server/routers/advisory-reports.ts` - tRPC router
- `server/advisory-diff.ts` - Version comparison
- Database: `drizzle/schema_advisory_reports.ts`

**Gaps:**
- No runtime contract
- No generation process documentation in spec
- Needs consolidation with methodology doc

---

## Documentation Refactoring Status

### What HAS Been Refactored

1. ✅ **Core Contract** (`docs/core/ISA_CORE_CONTRACT.md`) - Defines 6 capabilities
2. ✅ **Spec Index** (`docs/spec/INDEX.md`) - Links to all 6 capability specs
3. ✅ **Planning System** (`docs/planning/NEXT_ACTIONS.json`) - Tracks P1 tasks for each capability
4. ✅ **Ask ISA** - Full documentation suite (spec + contract + runbook)

### What HAS NOT Been Refactored

1. ❌ **NEWS_HUB spec** - Needs expansion from 13 lines to match NEWS_PIPELINE.md
2. ❌ **KNOWLEDGE_BASE spec** - Needs detailed architecture
3. ❌ **CATALOG spec** - Needs unified architecture (currently scattered)
4. ❌ **ESRS_MAPPING spec** - Needs methodology documentation
5. ❌ **ADVISORY spec** - Needs generation process documentation
6. ❌ **Runtime contracts** - Only Ask ISA has one, need 5 more
7. ❌ **Smoke tests** - Only Ask ISA has one, need 5 more
8. ❌ **Architecture diagrams** - None exist for any capability
9. ❌ **End-to-end flow docs** - Missing for all capabilities except Ask ISA

---

## Repository Refactoring Plans

### Current State

**No comprehensive refactoring plan exists.** The repository has:

- ✅ **Good:** Clear 6-capability contract
- ✅ **Good:** Minimal specs for all 6 capabilities
- ✅ **Good:** Planning system (NEXT_ACTIONS.json)
- ⚠️ **Partial:** Some capabilities well-documented (Ask ISA, News Hub pipeline)
- ❌ **Missing:** Unified documentation structure
- ❌ **Missing:** Runtime contracts for 5 capabilities
- ❌ **Missing:** Smoke tests for 5 capabilities
- ❌ **Missing:** Architecture diagrams

### Where Refactoring Fits in Development Plans

**From NEXT_ACTIONS.json:**

**P0 (DONE):**
- P0-0001: Lock canonical plan-as-code entrypoints ✅
- P0-0002: Define manual preflight checklist ✅
- P0-0003: Finalize ISA Core Contract ✅
- P0-0004: Create minimal specs for all 6 capabilities ✅

**P1 (IN PROGRESS):**
- P1-0001: Ask ISA runtime contract ✅ DONE
- P1-0002: Ask ISA smoke harness ✅ DONE (just completed)
- P1-0003: News Hub baseline architecture 🔄 IN_PROGRESS (current task)

**P1 (READY - Not Started):**
- P1-0004: Knowledge Base runtime contract + entrypoints
- P1-0005: Catalog runtime contract + entrypoints
- P1-0006: ESRS Mapping runtime contract + entrypoints
- P1-0007: Advisory runtime contract + entrypoints

**Implied Next Steps (Not Yet in NEXT_ACTIONS):**
- Smoke tests for remaining 5 capabilities
- Architecture diagrams for all 6 capabilities
- End-to-end flow documentation
- Code consolidation (e.g., unified Catalog router)
- Test suite stabilization (82 failures remaining)

### Refactoring Priority Recommendation

**Phase 1 (Current):** Complete P1-0003 (News Hub baseline)
- Expand NEWS_HUB.md spec to match NEWS_PIPELINE.md detail
- Document baseline architecture (ingest → store → expose → UI)
- Link all code entrypoints
- Create architecture diagram

**Phase 2:** Complete P1-0004 through P1-0007
- Runtime contracts for remaining 4 capabilities
- Code entrypoint documentation
- Baseline architecture for each

**Phase 3:** Smoke tests + validation
- Smoke tests for remaining 5 capabilities
- Integration tests for end-to-end flows
- Test suite stabilization

**Phase 4:** Consolidation + diagrams
- Architecture diagrams for all 6 capabilities
- Code consolidation where needed (Catalog, etc.)
- Documentation cleanup

---

## Test Suite Status

**Current:** 82 failed, 955 passed (1037 total) = 92.1% pass rate

**Recent Progress:**
- Fixed regulatory tracking columns (migration 0016): 87 → 82 failures
- Fixed dataset_registry schema mappings: Reduced failures
- Fixed environment variable loading: Tests now run reliably

**Remaining Issues:**
- Dataset registry column name mismatches (source vs sourceUrl, etc.)
- Standards directory test failures (GS1 Web Vocabulary missing)
- Various schema mismatches in other tables

**Blocker Status:** NOT a blocker for documentation work, but should be addressed in parallel

---

## Immediate Next Actions

1. **Complete P1-0003** (News Hub baseline):
   - Expand `docs/spec/NEWS_HUB.md` with architecture details
   - Document baseline flow: ingest → store → expose → UI
   - Link all code entrypoints
   - Mark as DONE in NEXT_ACTIONS.json

2. **Implement Phase 3 News Sources**:
   - Populate `server/news-sources-phase3.ts` with researched sources
   - Add CS3D/CSDDD, Green Claims, ESPR sources
   - Test new sources
   - Update documentation

3. **Start P1-0004** (Knowledge Base):
   - Investigate current implementation
   - Create runtime contract
   - Document architecture
   - Create smoke test

4. **Fix remaining test failures**:
   - Address dataset_registry column mappings
   - Fix standards directory tests
   - Target 95%+ pass rate

---

## Conclusion

**I have NOT fully investigated and refactored all content.** I have:

- ✅ Fixed immediate blockers (schema, environment)
- ✅ Completed Ask ISA documentation suite
- 🔄 Started News Hub baseline (in progress)
- ❌ NOT refactored documentation for remaining 4 capabilities
- ❌ NOT created comprehensive refactoring plan (this document is the first step)

**The refactoring plan fits into development as P1 tasks** (runtime contracts + entrypoints for each capability), followed by smoke tests, then consolidation.

**News Hub is well-implemented but poorly documented in the spec.** The comprehensive NEWS_PIPELINE.md exists but NEWS_HUB.md spec is minimal. This is the current focus of P1-0003.
