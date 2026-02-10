# ISA Complete Repository Refactoring & Manus Handover Plan

**Created:** 2026-02-10  
**Status:** COMPREHENSIVE REFACTORING FOR MANUS HANDOVER  
**Goal:** Prepare production-ready, optimally organized repository for AI agent development

---

## Executive Summary

**Objective:** Transform ISA into an exemplary codebase optimized for Manus AI agent development with:
- Zero outdated code, data, or documentation
- Perfect architectural foundation
- Meticulous project management artifacts
- Expert-level technical documentation
- Synthesized best-of-breed implementations
- Clear roadmap for future development

**Core Capabilities (Foundation):**
1. **Ask ISA** - RAG-powered Q&A with citations
2. **News Hub** - Regulatory news aggregation & analysis
3. **Knowledge Base** - Semantic search & embeddings
4. **Catalog** - Dataset registry & standards directory
5. **ESRS Mapping** - Regulation-to-standard intelligence
6. **Advisory** - Compliance advisory reports

---

## Phase 0: Comprehensive Audit & Baseline

### 0.1 Complete Repository Scan
**Identify ALL outdated content:**

```bash
# Scan for outdated references
- Last modified > 6 months ago
- References to deprecated features
- Duplicate implementations
- Incomplete features
- Experimental code
- Old date references (2024, early 2025)
- Deprecated dependencies
- Unused imports
- Dead code paths
```

### 0.2 Data Currency Audit
**Verify all data freshness:**

```
CHECK ALL DATASETS:
- data/efrag/ - Verify ESRS datapoints current
- data/gs1/ - Verify GS1 standards current
- data/gs1nl/ - Verify sector models current
- data/advisories/ - Remove outdated versions
- data/cbv/ - Verify CBV vocabularies current
- data/standards/ - Remove old standards docs

REMOVE:
- Any dataset with last_verified_date > 6 months old
- Duplicate dataset versions
- Incomplete ingestion results
- Test/sample data in production paths
```

### 0.3 Code Quality Baseline
**Establish quality metrics:**

```
MEASURE:
- Test coverage: Current 90.1% → Target 100%
- TypeScript errors: Current 0 → Maintain 0
- Duplicate code: Identify all duplicates
- Cyclomatic complexity: Flag >10
- Code smells: Run linter analysis
- Dead code: Identify unused exports
- Import cycles: Detect circular dependencies
```

---

## Phase 1: Complete Cleanup (Week 1)

### 1.1 Remove ALL Outdated Governance
**Delete outdated governance concepts:**

```
REMOVE COMPLETELY:
- All "Lane A/B/C" references (outdated)
- docs/governance/reviews/ (historical)
- docs/governance/agent-prompts/ (outdated)
- docs/governance/IRON_*.md (deprecated protocol)
- docs/governance/AUDIT_EXECUTION_MODE.md
- docs/governance/NO_GATES_WINDOW.md
- docs/governance/KNOWN_FAILURE_MODES.md
- docs/governance/LLM_STRUCTURAL_RISK_ASSESSMENT.md
- docs/governance/TEMPORAL_GUARDRAILS.md
- docs/governance/VALIDATION_SUMMARY.md
- docs/governance/WORK_PRIORITIZATION.md
- docs/governance/CLUSTER_REGISTRY.* (outdated)
- docs/governance/DATE_*.md (outdated)
```

### 1.2 Remove ALL Outdated Documentation
**Delete historical/research docs:**

```
DELETE ENTIRELY:
- docs/evidence/ (all - historical research)
- docs/decisions/ (archive only, not delete)
- docs/legacy/ (all)
- docs/archive/ (all)
- docs/screenshots/ (all)
- docs/templates/ (unused)
- docs/agent_collaboration/ (outdated protocol)
- docs/datasets/ (superseded by DATASETS_CATALOG.md)
- docs/data/ (external artefacts - outdated)
- docs/gs1_research/ (research complete)
- docs/references/ (old references)
- docs/misc/ (miscellaneous old docs)
- docs/ops/spellcheck/ (outdated)
- All *_PHASE*.md files (phase-based docs)
- All *_v0.md, *_v1.md files (old versions)
- All *_DRAFT.md files (drafts)
- All *_SUMMARY.md files (summaries)
- All *_REPORT.md files (old reports)
- All *_ANALYSIS.md files (old analysis)
- All *_ASSESSMENT.md files (old assessments)
```

### 1.3 Remove ALL Experimental/Incomplete Code
**Delete non-production code:**

```
DELETE COMPLETELY:
- server/epcis-*.ts (all EPCIS - exploratory)
- server/eudr-analyzer.ts
- server/cellar-*.ts (all - incomplete EUR-Lex)
- server/automated-cellar-sync.ts
- server/batch-epcis-processor.ts
- server/seed-epcis-events.ts
- server/seed-eudr-data.ts
- client/src/pages/EpcisUpload.tsx
- client/src/pages/EudrMapper.tsx
- client/src/pages/IndustryTemplates.tsx (if not used)
- server/routers/benchmarking.ts
- server/routers/collaboration.ts
- server/routers/impact-simulator.ts
- server/routers/remediation.ts
- server/routers/stakeholder-dashboard.ts
- server/routers/template-analytics.ts
- server/routers/realtime.ts (if not used)
- server/routers/notification-preferences.ts (if not used)
- server/services/ab-testing/ (all)
- server/services/authority-scoring/ (if not used)
```

### 1.4 Remove ALL Duplicate Code
**Consolidate duplicates:**

```
IDENTIFY & MERGE:
- server/ask-isa.ts + server/ask-isa-enhanced.ts → Single best version
- server/generate-all-embeddings*.ts (4 versions) → Single optimized version
- server/news-sources.ts + server/news-sources-phase3.ts → Single version
- server/db-news-helpers.ts + server/db-news-helpers-additions.ts → Merge
- server/utils/server-logger.ts + server/utils/pipeline-logger.ts → Single logger
- Multiple scraper implementations → Unified scraper framework
```

### 1.5 Remove Outdated Data Files
**Clean data directory:**

```
DELETE:
- data/adb_release_2.11.csv (old)
- data/cbv_bizstep_raw.txt (raw - use processed)
- data/epcis_classes_raw.txt (raw)
- data/epcis_fields_raw.txt (raw)
- data/gdm_combined_models.csv (superseded)
- data/gs1_position_paper_summary.md (old)
- data/gs1_standards_recent_updates.txt (old)
- data/dpp_standard_summary.md (old)
- data/DATASET_METADATA.md (superseded by registry)
- artifacts/ (all - old archives)
- EU_ESG_to_GS1_Mapping_v1.1/ (if superseded)
```

---

## Phase 2: Code Synthesis & Optimization (Weeks 2-3)

### 2.1 Synthesize Best Implementations
**For each capability, create optimal version:**

#### Ask ISA - Synthesized Best Version
```typescript
// Combine best features from:
// - server/routers/ask-isa.ts (current)
// - server/ask-isa-enhanced.ts (enhancements)
// - server/routers/ask-isa-v2.ts (if exists)

SYNTHESIZE:
✓ Best prompt engineering (from all versions)
✓ Optimal caching strategy
✓ Best guardrails implementation
✓ Most efficient search algorithm
✓ Best citation extraction
✓ Optimal error handling
✓ Best observability/tracing
```

#### News Hub - Synthesized Best Version
```typescript
// Combine best features from:
// - server/news-pipeline.ts
// - server/news-event-processor.ts
// - server/news-*.ts (all news modules)

SYNTHESIZE:
✓ Most reliable scraping approach
✓ Best deduplication algorithm
✓ Optimal event detection
✓ Best AI tagging strategy
✓ Most efficient storage
✓ Best health monitoring
```

#### Knowledge Base - Synthesized Best Version
```typescript
// Combine best features from:
// - server/hybrid-search.ts
// - server/bm25-search.ts
// - server/knowledge-vector-search.ts
// - server/embedding.ts

SYNTHESIZE:
✓ Optimal hybrid search weights
✓ Best embedding strategy
✓ Most efficient indexing
✓ Best relevance scoring
✓ Optimal caching
```

### 2.2 Architectural Improvements
**Refactor for optimal architecture:**

```
IMPROVEMENTS:
1. Dependency Injection
   - Remove tight coupling
   - Make services testable
   - Enable mocking

2. Error Handling
   - Consistent error types
   - Proper error propagation
   - User-friendly messages

3. Logging
   - Structured logging everywhere
   - Consistent log levels
   - Correlation IDs

4. Configuration
   - Environment-based config
   - Type-safe configuration
   - Validation on startup

5. Database Layer
   - Connection pooling
   - Query optimization
   - Transaction management
   - Migration strategy

6. API Design
   - Consistent naming
   - Proper HTTP methods
   - Standard error responses
   - API versioning strategy
```

### 2.3 Performance Optimization
**Optimize critical paths:**

```
OPTIMIZE:
- Ask ISA query: <3s (currently ~5s)
- News scraping: Parallel execution
- Embedding generation: Batch processing
- Database queries: Add indexes
- API responses: Response caching
- Frontend: Code splitting, lazy loading
```

---

## Phase 3: Perfect Documentation for Manus (Week 4)

### 3.1 Technical Architecture Documentation
**Create comprehensive architecture docs:**

```
docs/architecture/
├── README.md                        # Architecture overview
├── system-design.md                 # High-level design
├── data-flow.md                     # Data flow diagrams
├── database-schema.md               # Complete schema docs
├── api-design.md                    # API architecture
├── security-architecture.md         # Security design
├── deployment-architecture.md       # Deployment topology
└── decision-records/                # ADRs for key decisions
    ├── 001-typescript-stack.md
    ├── 002-trpc-api.md
    ├── 003-drizzle-orm.md
    └── ...
```

### 3.2 Capability Documentation
**Per-capability complete docs:**

```
docs/capabilities/
├── ask-isa.md
│   ├── Overview
│   ├── Architecture
│   ├── Data Flow
│   ├── API Endpoints
│   ├── Configuration
│   ├── Testing Strategy
│   ├── Performance Metrics
│   ├── Known Limitations
│   └── Future Enhancements
│
├── news-hub.md (same structure)
├── knowledge-base.md (same structure)
├── catalog.md (same structure)
├── esrs-mapping.md (same structure)
└── advisory.md (same structure)
```

### 3.3 Development Documentation
**Complete developer guides:**

```
docs/development/
├── README.md                        # Dev docs index
├── getting-started.md               # Setup guide
├── development-workflow.md          # Git workflow, PR process
├── coding-standards.md              # Code style, patterns
├── testing-guide.md                 # Testing strategy
├── debugging-guide.md               # Common issues
├── performance-guide.md             # Performance best practices
└── contributing.md                  # Contribution guidelines
```

### 3.4 Operations Documentation
**Complete ops runbooks:**

```
docs/operations/
├── README.md                        # Ops docs index
├── deployment.md                    # Deployment procedures
├── monitoring.md                    # Monitoring setup
├── alerting.md                      # Alert configuration
├── backup-restore.md                # Backup procedures
├── disaster-recovery.md             # DR procedures
├── troubleshooting.md               # Common issues
├── runbook.md                       # Daily operations
└── incident-response.md             # Incident handling
```

---

## Phase 4: Meticulous Project Management (Week 5)

### 4.1 Product Roadmap
**Create comprehensive roadmap:**

```
docs/planning/ROADMAP.md

STRUCTURE:
├── Vision & Strategy
│   ├── Product vision
│   ├── Target users
│   ├── Success metrics
│   └── Competitive landscape
│
├── Current State (Q1 2026)
│   ├── Capabilities delivered
│   ├── Technical debt
│   ├── Known issues
│   └── Performance baseline
│
├── Q2 2026 - Stabilization
│   ├── Fix remaining test failures
│   ├── Performance optimization
│   ├── Documentation completion
│   └── Production deployment
│
├── Q3 2026 - Enhancement
│   ├── Advanced search features
│   ├── Multi-language support
│   ├── Mobile optimization
│   └── API v2
│
└── Q4 2026 - Scale
    ├── Multi-tenant support
    ├── Advanced analytics
    ├── Integration marketplace
    └── Enterprise features
```

### 4.2 Detailed Backlog
**Structured backlog with priorities:**

```
docs/planning/BACKLOG.md

STRUCTURE:
├── P0 - Critical (Production Blockers)
│   ├── Fix 57 failing tests
│   ├── Production infrastructure
│   ├── Security hardening
│   └── Performance optimization
│
├── P1 - High (Core Features)
│   ├── Ask ISA enhancements
│   ├── News Hub improvements
│   ├── Advisory system v2
│   └── API documentation
│
├── P2 - Medium (Nice to Have)
│   ├── Advanced filtering
│   ├── Export features
│   ├── User preferences
│   └── Notification system
│
└── P3 - Low (Future)
    ├── Mobile app
    ├── Offline mode
    ├── Advanced visualizations
    └── AI assistant
```

### 4.3 Work Packages
**Detailed work packages for Manus:**

```
docs/planning/work-packages/

EACH PACKAGE INCLUDES:
├── WP-001-test-suite-completion.md
│   ├── Objective
│   ├── Scope
│   ├── Prerequisites
│   ├── Tasks (detailed)
│   ├── Acceptance Criteria
│   ├── Estimated Effort
│   ├── Dependencies
│   ├── Risks & Mitigation
│   └── Success Metrics
│
├── WP-002-ask-isa-optimization.md
├── WP-003-news-hub-enhancement.md
├── WP-004-knowledge-base-scaling.md
├── WP-005-catalog-expansion.md
├── WP-006-esrs-mapping-v2.md
├── WP-007-advisory-automation.md
└── ...
```

### 4.4 Technical Specifications
**Detailed specs for each feature:**

```
docs/specifications/

EACH SPEC INCLUDES:
├── Feature Overview
├── User Stories
├── Functional Requirements
├── Non-Functional Requirements
├── API Specification
├── Data Model
├── UI/UX Design
├── Security Considerations
├── Performance Requirements
├── Testing Strategy
├── Rollout Plan
└── Success Metrics
```

---

## Phase 5: Optimal Repository Structure (Week 6)

### 5.1 Final Directory Structure

```
isa_web_clean/
├── .github/
│   ├── workflows/                   # CI/CD pipelines
│   ├── ISSUE_TEMPLATE/              # Issue templates
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
│
├── capabilities/                    # Core capabilities
│   ├── ask-isa/
│   │   ├── server/
│   │   │   ├── router.ts
│   │   │   ├── service.ts
│   │   │   ├── prompts/
│   │   │   ├── guardrails.ts
│   │   │   └── cache.ts
│   │   ├── client/
│   │   │   ├── AskISA.tsx
│   │   │   └── components/
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   ├── docs/
│   │   │   ├── README.md
│   │   │   ├── architecture.md
│   │   │   └── api.md
│   │   └── package.json (if needed)
│   │
│   ├── news-hub/ (same structure)
│   ├── knowledge-base/ (same structure)
│   ├── catalog/ (same structure)
│   ├── esrs-mapping/ (same structure)
│   └── advisory/ (same structure)
│
├── core/                            # Shared infrastructure
│   ├── server/
│   │   ├── database/
│   │   │   ├── connection.ts
│   │   │   ├── migrations/
│   │   │   └── schema/
│   │   ├── auth/
│   │   │   ├── oauth.ts
│   │   │   └── middleware.ts
│   │   ├── llm/
│   │   │   ├── client.ts
│   │   │   └── prompts/
│   │   ├── logging/
│   │   │   └── logger.ts
│   │   └── utils/
│   │
│   ├── client/
│   │   ├── components/
│   │   │   ├── ui/ (shadcn/ui)
│   │   │   └── shared/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── styles/
│   │
│   └── shared/
│       ├── types/
│       ├── constants/
│       └── utils/
│
├── data/                            # Datasets (cleaned)
│   ├── metadata/
│   │   └── dataset_registry.json
│   ├── efrag/ (current only)
│   ├── gs1/ (current only)
│   ├── gs1nl/ (current only)
│   ├── advisories/ (current only)
│   └── cbv/ (current only)
│
├── docs/                            # Documentation
│   ├── README.md
│   ├── GETTING_STARTED.md
│   ├── architecture/
│   ├── capabilities/
│   ├── development/
│   ├── operations/
│   ├── planning/
│   │   ├── ROADMAP.md
│   │   ├── BACKLOG.md
│   │   ├── work-packages/
│   │   └── specifications/
│   └── governance/
│       └── GOVERNANCE.md (simplified)
│
├── scripts/                         # Automation
│   ├── setup/
│   ├── deployment/
│   ├── maintenance/
│   └── testing/
│
├── tests/                           # Integration tests
│   ├── integration/
│   ├── e2e/
│   └── performance/
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── drizzle.config.ts
├── README.md
└── LICENSE
```

### 5.2 Configuration Files
**Optimal configuration:**

```
ROOT LEVEL:
- package.json (cleaned dependencies)
- tsconfig.json (strict mode)
- vitest.config.ts (comprehensive)
- drizzle.config.ts (optimized)
- .env.example (complete)
- .gitignore (comprehensive)
- .prettierrc (consistent formatting)
- .eslintrc.json (strict linting)
- .nvmrc (Node version)
- LICENSE (selected)
- README.md (comprehensive)
```

---

## Phase 6: Quality Assurance (Week 7)

### 6.1 Complete Test Coverage

```
ACHIEVE 100% COVERAGE:
- Fix all 57 failing tests
- Add missing unit tests
- Add integration tests for all capabilities
- Add E2E tests for critical paths
- Add performance tests
- Add security tests
```

### 6.2 Code Quality Gates

```
ENFORCE:
- TypeScript: 0 errors (strict mode)
- ESLint: 0 warnings
- Prettier: All files formatted
- Test coverage: 100%
- Performance: All benchmarks pass
- Security: No vulnerabilities
- Documentation: All public APIs documented
```

### 6.3 Performance Benchmarks

```
ESTABLISH BASELINES:
- Ask ISA query: <3s p95
- News scraping: <30s per source
- Embedding generation: <5s per chunk
- API response: <500ms p95
- Page load: <2s p95
- Database queries: <100ms p95
```

---

## Phase 7: Manus Handover Package (Week 8)

### 7.1 Handover Documentation

```
docs/manus-handover/
├── README.md                        # Handover overview
├── repository-guide.md              # Repo navigation
├── development-setup.md             # Setup instructions
├── architecture-overview.md         # System architecture
├── capability-guide.md              # Capability details
├── testing-guide.md                 # Testing approach
├── deployment-guide.md              # Deployment process
├── troubleshooting.md               # Common issues
└── next-steps.md                    # Recommended priorities
```

### 7.2 Manus-Specific Artifacts

```
.manus/
├── context.md                       # Project context for Manus
├── capabilities.json                # Capability definitions
├── work-queue.json                  # Prioritized work items
├── architecture.json                # Machine-readable architecture
├── dependencies.json                # Dependency graph
└── quality-gates.json               # Quality requirements
```

### 7.3 Knowledge Transfer

```
PROVIDE:
- Video walkthrough of codebase (30 min)
- Architecture decision records
- Code review guidelines
- Testing strategy
- Deployment procedures
- Monitoring setup
- Incident response procedures
```

---

## Execution Timeline

### Week 1: Complete Cleanup
- Day 1-2: Audit & identify all outdated content
- Day 3-4: Remove outdated governance, docs, code
- Day 5: Remove outdated data, verify deletions

### Week 2-3: Code Synthesis
- Day 1-3: Synthesize Ask ISA + News Hub
- Day 4-6: Synthesize Knowledge Base + Catalog
- Day 7-9: Synthesize ESRS Mapping + Advisory
- Day 10: Architectural improvements

### Week 4: Documentation
- Day 1-2: Architecture documentation
- Day 3-4: Capability documentation
- Day 5: Development & operations docs

### Week 5: Project Management
- Day 1: Product roadmap
- Day 2: Detailed backlog
- Day 3-4: Work packages
- Day 5: Technical specifications

### Week 6: Repository Structure
- Day 1-2: Create new structure
- Day 3-4: Migrate code
- Day 5: Update all references

### Week 7: Quality Assurance
- Day 1-3: Fix all tests
- Day 4: Code quality gates
- Day 5: Performance benchmarks

### Week 8: Manus Handover
- Day 1-2: Handover documentation
- Day 3: Manus-specific artifacts
- Day 4: Knowledge transfer
- Day 5: Final review & sign-off

---

## Success Criteria

✅ **Zero Outdated Content**
- No references to deprecated features
- No outdated data (all <6 months old)
- No experimental/incomplete code
- No duplicate implementations
- No old documentation

✅ **Perfect Code Quality**
- 100% test coverage (574/574 passing)
- 0 TypeScript errors
- 0 ESLint warnings
- All code formatted
- No security vulnerabilities
- No performance regressions

✅ **Optimal Architecture**
- Clear separation of concerns
- Consistent patterns throughout
- Proper dependency injection
- Comprehensive error handling
- Structured logging everywhere
- Optimized performance

✅ **Exemplary Documentation**
- Complete architecture docs
- Per-capability documentation
- Comprehensive developer guides
- Complete operations runbooks
- Detailed project management artifacts
- Clear handover documentation

✅ **Manus-Ready**
- Clear capability structure
- Machine-readable artifacts
- Prioritized work queue
- Quality gates defined
- Knowledge transfer complete

---

## Risk Management

**Risk 1: Breaking Changes During Refactor**
- Mitigation: Comprehensive test suite, gradual migration
- Rollback: Git branches for each phase

**Risk 2: Lost Functionality**
- Mitigation: Thorough audit before deletion, archive everything
- Rollback: Restore from archive

**Risk 3: Timeline Overrun**
- Mitigation: Prioritize critical items, parallel work streams
- Contingency: Extend timeline, reduce scope

**Risk 4: Quality Regression**
- Mitigation: Continuous testing, quality gates
- Rollback: Revert problematic changes

---

## Post-Refactoring Benefits

1. **Optimal for Manus Development**
   - Clear structure
   - Complete documentation
   - Prioritized work queue
   - Quality gates

2. **Production-Ready**
   - Zero technical debt
   - 100% test coverage
   - Optimized performance
   - Complete documentation

3. **Maintainable**
   - Clear architecture
   - Consistent patterns
   - Comprehensive tests
   - Good documentation

4. **Scalable**
   - Modular design
   - Performance optimized
   - Clear extension points
   - Documented patterns

---

**Status:** READY FOR EXECUTION  
**Duration:** 8 weeks  
**Confidence:** VERY HIGH  
**Next Step:** Begin Week 1 - Complete Cleanup
