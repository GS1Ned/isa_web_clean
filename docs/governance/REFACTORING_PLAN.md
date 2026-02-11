# ISA Repository Refactoring Plan

**Created:** 2026-02-10  
**Status:** READY FOR EXECUTION  
**Goal:** Clean repository, remove outdated governance, consolidate around 6 core capabilities

---

## Executive Summary

This plan refactors ISA into a clean, production-ready codebase organized around 6 core capabilities:
1. **Ask ISA** - RAG-powered Q&A
2. **News Hub** - Regulatory news aggregation
3. **Knowledge Base** - Semantic search and embeddings
4. **Catalog** - Dataset registry and standards
5. **ESRS Mapping** - Regulation-to-standard mappings
6. **Advisory** - Compliance advisory reports

**Actions:**
- Remove all "Lane" governance references (outdated)
- Archive unused/experimental code
- Consolidate documentation
- Organize code by capability
- Clean up dependencies
- Update all references

---

## Phase 1: Governance Cleanup (Remove "Lanes")

### 1.1 Remove Lane References from Code
**Files to update:**

```bash
# Search for Lane references
grep -r "Lane [ABC]" --include="*.ts" --include="*.tsx" --include="*.md" .

# Files requiring updates:
- docs/governance/_root/ISA_GOVERNANCE.md
- docs/planning/COMPLETION_DELIVERY_PLAN.md
- .amazonq/rules/memory-bank/product.md
- README.md
- server/routers/advisory-reports.ts (governance notices)
- server/advisory-report-export.ts (governance notices)
```

**Actions:**
- [ ] Replace "Lane C" with "Production Mode"
- [ ] Replace "Lane B" with "External Deployment"
- [ ] Replace "Lane A" with "Development Mode"
- [ ] Remove escalation format requirements
- [ ] Simplify governance to: Data Integrity + Citation Accuracy + Version Control

### 1.2 Simplify Governance Documentation
**Create new simplified governance:**

```markdown
# ISA Governance Principles

1. **Data Integrity:** All datasets include source, version, SHA256, last_verified_date
2. **Citation Accuracy:** All AI content includes mandatory citations
3. **Version Control:** All changes tracked in Git with conventional commits
4. **Transparency:** Decisions documented with rationale
5. **Reversibility:** Changes can be rolled back via Git

**Critical Changes Requiring Review:**
- Schema changes affecting data integrity
- New data sources or ingestion pipelines
- Changes to AI prompts or mapping logic
- Advisory report publication
```

---

## Phase 2: Archive Unused/Experimental Code

### 2.1 Identify Code to Archive
**Experimental/Unused Features:**

```
ARCHIVE (move to isa-archive/):
- EPCIS Tools (exploratory, not production-ready)
  - server/epcis-*.ts
  - server/routers/batch-epcis.ts
  - server/eudr-analyzer.ts
  - client/src/pages/EpcisUpload.tsx
  - client/src/pages/EudrMapper.tsx

- Unused admin tools
  - server/routers/benchmarking.ts
  - server/routers/collaboration.ts
  - server/routers/impact-simulator.ts
  - server/routers/remediation.ts
  - server/routers/stakeholder-dashboard.ts
  - server/routers/template-analytics.ts

- Experimental features
  - server/cellar-*.ts (EUR-Lex integration - incomplete)
  - server/automated-cellar-sync.ts
  - server/services/ab-testing/

- Duplicate/legacy code
  - server/ask-isa-enhanced.ts (use ask-isa.ts)
  - server/generate-all-embeddings*.ts (multiple versions)
  - server/news-sources-phase3.ts (use news-sources.ts)
```

### 2.2 Archive Documentation
**Move to isa-archive/docs/:**

```
- docs/governance/reviews/ (old reviews)
- docs/governance/agent-prompts/ (outdated)
- docs/evidence/_research/ (research notes)
- docs/evidence/_benchmarks/ (old benchmarks)
- docs/archive/ (already archived)
- docs/legacy/ (legacy docs)
- docs/screenshots/ (old screenshots)
- docs/templates/ (unused templates)
- docs/agent_collaboration/ (outdated protocol)
- docs/datasets/ (old dataset docs)
- docs/data/ (external artefacts)
- docs/gs1_research/ (research phase complete)
- docs/references/ (old references)
```

---

## Phase 3: Reorganize by Capability

### 3.1 New Directory Structure

```
isa_web_clean/
├── capabilities/                    # NEW: Organize by capability
│   ├── ask-isa/
│   │   ├── server/
│   │   │   ├── routers/ask-isa.ts
│   │   │   ├── prompts/
│   │   │   ├── guardrails.ts
│   │   │   ├── cache.ts
│   │   │   └── query-library.ts
│   │   ├── client/
│   │   │   └── pages/AskISA.tsx
│   │   ├── tests/
│   │   │   └── ask-isa-integration.test.ts
│   │   └── README.md
│   │
│   ├── news-hub/
│   │   ├── server/
│   │   │   ├── pipeline.ts
│   │   │   ├── scrapers/
│   │   │   ├── event-processor.ts
│   │   │   └── admin-router.ts
│   │   ├── client/
│   │   │   └── pages/NewsHub.tsx
│   │   ├── tests/
│   │   └── README.md
│   │
│   ├── knowledge-base/
│   │   ├── server/
│   │   │   ├── db-knowledge.ts
│   │   │   ├── hybrid-search.ts
│   │   │   └── embedding.ts
│   │   ├── client/
│   │   │   └── pages/AdminKnowledgeBase.tsx
│   │   ├── tests/
│   │   └── README.md
│   │
│   ├── catalog/
│   │   ├── server/
│   │   │   ├── routers/dataset-registry.ts
│   │   │   ├── routers/standards-directory.ts
│   │   │   └── db-dataset-registry.ts
│   │   ├── client/
│   │   │   └── pages/DatasetRegistry.tsx
│   │   ├── tests/
│   │   └── README.md
│   │
│   ├── esrs-mapping/
│   │   ├── server/
│   │   │   ├── routers/esrs-gs1-mapping.ts
│   │   │   ├── db-esrs-gs1-mapping.ts
│   │   │   └── mappings/
│   │   ├── client/
│   │   │   └── pages/HubEsrsGs1Mappings.tsx
│   │   ├── tests/
│   │   └── README.md
│   │
│   └── advisory/
│       ├── server/
│       │   ├── routers/advisory.ts
│       │   ├── routers/advisory-reports.ts
│       │   └── report-export.ts
│       ├── client/
│       │   └── pages/AdvisoryDashboard.tsx
│       ├── tests/
│       └── README.md
│
├── core/                            # Shared infrastructure
│   ├── server/
│   │   ├── db/                      # Database layer
│   │   ├── auth/                    # Authentication
│   │   ├── llm/                     # LLM integration
│   │   └── utils/                   # Utilities
│   ├── client/
│   │   ├── components/ui/           # UI components
│   │   ├── hooks/                   # React hooks
│   │   └── lib/                     # Client utilities
│   └── shared/                      # Shared types
│
├── data/                            # Dataset files (unchanged)
├── docs/                            # Simplified documentation
│   ├── capabilities/                # Per-capability docs
│   ├── architecture/                # System architecture
│   ├── deployment/                  # Deployment guides
│   └── governance/                  # Simplified governance
│
├── scripts/                         # Automation scripts
├── isa-archive/                     # Archived code/docs
└── tests/                           # Integration tests
```

### 3.2 Migration Strategy

**Option A: Gradual Migration (Recommended)**
- Keep current structure
- Add `capabilities/` directory alongside existing
- Gradually move code to new structure
- Update imports incrementally
- Remove old structure when complete

**Option B: Big Bang Migration**
- Create new structure
- Move all code at once
- Update all imports
- Higher risk but cleaner

**Recommendation:** Option A - Gradual migration over 2-3 weeks

---

## Phase 4: Consolidate Documentation

### 4.1 New Documentation Structure

```
docs/
├── README.md                        # Documentation index
├── GETTING_STARTED.md               # Quick start guide
├── ARCHITECTURE.md                  # System architecture
├── DEPLOYMENT.md                    # Deployment guide
├── GOVERNANCE.md                    # Simplified governance
│
├── capabilities/                    # Per-capability docs
│   ├── ask-isa.md
│   ├── news-hub.md
│   ├── knowledge-base.md
│   ├── catalog.md
│   ├── esrs-mapping.md
│   └── advisory.md
│
├── development/                     # Developer docs
│   ├── setup.md
│   ├── testing.md
│   ├── contributing.md
│   └── code-style.md
│
├── operations/                      # Operations docs
│   ├── monitoring.md
│   ├── backup-restore.md
│   ├── troubleshooting.md
│   └── runbook.md
│
└── api/                             # API documentation
    ├── trpc-endpoints.md
    └── database-schema.md
```

### 4.2 Documentation Consolidation

**Merge these into single docs:**
- All spec/*.md → capabilities/*.md
- All governance/*.md → GOVERNANCE.md
- All planning/*.md → Keep only NEXT_ACTIONS.json + BACKLOG.csv
- All evidence/*.md → Archive (historical)

---

## Phase 5: Clean Up Dependencies

### 5.1 Remove Unused Dependencies

```json
// package.json - Remove these:
{
  "dependencies": {
    // Remove if EPCIS archived:
    // - EPCIS-related packages
    
    // Remove if not used:
    // - @aws-sdk/* (if S3 not used)
    // - jspdf, jspdf-autotable (if PDF export not used)
    // - playwright (if scraping moved to separate service)
  }
}
```

### 5.2 Consolidate Utilities

**Merge duplicate utilities:**
- `server/utils/server-logger.ts` + `server/utils/pipeline-logger.ts` → Single logger
- Multiple embedding generation scripts → Single script
- Multiple news scraper versions → Single version

---

## Phase 6: Update Configuration

### 6.1 Update Navigation Files

**.ai/CAPABILITY_GRAPH.json:**
```json
{
  "capabilities": [
    {
      "id": "ASK_ISA",
      "path": "capabilities/ask-isa/",
      "spec": "docs/capabilities/ask-isa.md",
      "server": "capabilities/ask-isa/server/",
      "client": "capabilities/ask-isa/client/",
      "tests": "capabilities/ask-isa/tests/"
    }
    // ... other capabilities
  ]
}
```

### 6.2 Update Memory Bank

Update `.amazonq/rules/memory-bank/`:
- Remove Lane references
- Update directory structure
- Update capability organization

---

## Phase 7: Testing & Validation

### 7.1 Test Migration

**After each phase:**
- [ ] Run full test suite: `pnpm test`
- [ ] Verify TypeScript compilation: `pnpm check`
- [ ] Test dev server: `pnpm dev`
- [ ] Verify all 6 capabilities work
- [ ] Check database connections
- [ ] Validate API endpoints

### 7.2 Update Tests

**Update test imports:**
- Update all import paths to new structure
- Consolidate duplicate tests
- Remove tests for archived code
- Ensure 100% pass rate

---

## Execution Plan

### Week 1: Governance & Documentation
- [ ] Day 1-2: Remove Lane references from all files
- [ ] Day 3-4: Consolidate documentation
- [ ] Day 5: Update memory bank and navigation

### Week 2: Archive & Clean
- [ ] Day 1-2: Archive experimental code
- [ ] Day 3-4: Archive old documentation
- [ ] Day 5: Clean up dependencies

### Week 3: Reorganize (Gradual)
- [ ] Day 1: Create `capabilities/` structure
- [ ] Day 2-3: Move Ask ISA capability
- [ ] Day 4-5: Move News Hub capability

### Week 4: Reorganize (Continued)
- [ ] Day 1-2: Move remaining capabilities
- [ ] Day 3-4: Update all imports
- [ ] Day 5: Remove old structure

### Week 5: Testing & Finalization
- [ ] Day 1-2: Fix all tests
- [ ] Day 3: Update configuration
- [ ] Day 4: Final validation
- [ ] Day 5: Documentation review

---

## Success Criteria

✅ **Code Organization:**
- All code organized by capability
- No duplicate code
- Clear separation of concerns
- Consistent naming conventions

✅ **Documentation:**
- Single source of truth for each topic
- No outdated references
- Clear navigation
- Up-to-date examples

✅ **Governance:**
- No "Lane" references
- Simplified governance model
- Clear decision criteria
- Documented processes

✅ **Testing:**
- 100% test pass rate (574/574)
- All imports updated
- No broken references
- CI/CD passing

✅ **Dependencies:**
- No unused packages
- Up-to-date versions
- Clear dependency tree
- Minimal bundle size

---

## Risk Mitigation

**Risk 1: Breaking Changes**
- Mitigation: Gradual migration, test after each step
- Rollback: Git branches for each phase

**Risk 2: Lost Functionality**
- Mitigation: Archive instead of delete, document what's archived
- Rollback: Can restore from archive

**Risk 3: Import Hell**
- Mitigation: Use automated refactoring tools, update incrementally
- Rollback: Git reset to before migration

**Risk 4: Test Failures**
- Mitigation: Fix tests immediately, don't accumulate failures
- Rollback: Revert problematic changes

---

## Post-Refactoring Benefits

1. **Clearer Structure:** Easy to find code by capability
2. **Faster Onboarding:** New developers understand organization
3. **Better Maintenance:** Changes isolated to capabilities
4. **Easier Testing:** Tests co-located with code
5. **Simpler Governance:** No confusing "Lane" system
6. **Cleaner Codebase:** No experimental/unused code
7. **Better Documentation:** Single source of truth
8. **Faster Development:** Less cognitive overhead

---

## Next Steps

1. **Review this plan** - Confirm approach
2. **Create backup branch** - `git checkout -b pre-refactor-backup`
3. **Start Week 1** - Governance cleanup
4. **Daily standups** - Track progress
5. **Weekly reviews** - Adjust plan as needed

---

**Status:** READY FOR EXECUTION  
**Estimated Duration:** 5 weeks  
**Confidence:** HIGH
