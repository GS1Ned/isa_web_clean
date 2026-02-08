# ISA Development Roadmap

**Date:** 2026-02-04  
**Version:** 1.0.0  
**Status:** ACTIVE  

## Executive Summary

This document is the **sole authoritative source** for defining ISA development roadmap priorities and strategic directions. It outlines the strategic development priorities for ISA (Intelligent Standards Assistant) across short-term (0-2 weeks), medium-term (2-8 weeks), and long-term (2-6 months) horizons. The focus is on maximizing product quality, governance compliance, and operational efficiency. Any other document referencing roadmap items should defer to this file.

## Current State Assessment

### Completed Milestones

| Phase | Status | Key Deliverables |
|-------|--------|------------------|
| Phase 1-2: Documentation Canonicalization | ✅ Complete | 375 docs indexed, 12 clusters identified |
| Phase 3: Canonical Spec Synthesis | ✅ Complete | 12 canonical specs, 1,010 traced claims |
| Phase 4: Repository Consolidation | ✅ Complete | CLUSTER_REGISTRY.json, 102→35 scripts |
| Production Deployment | ✅ Active | gs1isa.com operational |

### Current Metrics

- **Knowledge Base:** 4,621 items
- **RAG Quality:** 95% pass rate on golden dataset
- **Script Count:** 35 canonical scripts (66% reduction)
- **Canonical Specs:** 12 cluster-based specifications
- **Open Conflicts:** 53 (22 high priority)

## Short-Term Priorities (0-2 weeks)

### 1. Merge Pending PR #76 (Phase 3 Completion)

**Priority:** HIGH  
**Status:** Awaiting review  
**Impact:** Enables spec-based governance

**Actions:**
- Review and merge PR #76 with Phase 3 fixes
- Verify all quality gates pass post-merge

### 2. Resolve High-Priority Conflicts

**Priority:** HIGH  
**Status:** Pending  
**Impact:** Reduces governance ambiguity

**Actions:**
- Review 22 high-priority conflicts in CONFLICT_REGISTER.md
- Create resolution proposals for top 5 conflicts
- Update canonical specs with resolutions

### 3. Enable CI Validation Gates

**Priority:** MEDIUM  
**Status:** Blocked (workflow permissions)  
**Impact:** Prevents drift in specs and registry

**Actions:**
- Manually add `cluster-registry-check.yml` workflow
- Manually add `spec-validation.yml` workflow
- Verify both gates trigger correctly

## Medium-Term Priorities (2-8 weeks)

### 4. Migrate proto_crawl_catalogue.py

**Priority:** MEDIUM  
**Status:** Pending  
**Impact:** Completes deprecated script cleanup

**Actions:**
- Analyze proto_crawl_catalogue.py functionality
- Migrate to scripts/isa-catalogue/ canonical scripts
- Update update-gs1-efrag-catalogue.yml workflow
- Remove proto_crawl_catalogue.py

### 5. Enhance RAG Evaluation Pipeline

**Priority:** MEDIUM  
**Status:** Pending  
**Impact:** Improves answer quality monitoring

**Actions:**
- Expand golden dataset from 20 to 50 questions
- Add automated regression testing
- Implement quality score trending

### 6. Implement Observability/Tracing Cluster

**Priority:** MEDIUM  
**Status:** Research needed  
**Impact:** Enables production debugging

**Actions:**
- Research observability patterns for RAG systems
- Define canonical observability spec
- Implement tracing infrastructure

### 7. Database Schema Governance

**Priority:** MEDIUM  
**Status:** Pending  
**Impact:** Prevents schema drift

**Actions:**
- Document current schema in canonical spec
- Add schema validation to CI
- Create migration governance process

## Long-Term Priorities (2-6 months)

### 8. Multi-Language Support

**Priority:** LOW  
**Status:** Future  
**Impact:** Expands user base

**Actions:**
- Evaluate translation requirements
- Design multi-language knowledge base architecture
- Implement language detection and routing

### 9. Advanced Advisory Features

**Priority:** LOW  
**Status:** Future  
**Impact:** Increases user value

**Actions:**
- Implement company-specific advisory generation
- Add regulatory change tracking
- Enable custom compliance dashboards

### 10. API Productization

**Priority:** LOW  
**Status:** Future  
**Impact:** Enables integrations

**Actions:**
- Design public API specification
- Implement rate limiting and authentication
- Create API documentation and SDKs

## Governance Maintenance

### Ongoing Tasks

| Task | Frequency | Owner |
|------|-----------|-------|
| CLUSTER_REGISTRY.json updates | Per script change | Auto (CI) |
| Canonical spec reviews | Monthly | ISA Core Team |
| Conflict resolution | Bi-weekly | ISA Core Team |
| DEPRECATION_MAP updates | Per deprecation | Auto (synthesis) |

### Quality Gates

**Note:** The definitive source of truth for workflow execution and quality gate logic resides in the `.github/workflows/*.yml` files. The table below provides a high-level overview and documentation reference.

| Gate | Trigger | Validator |
|------|---------|-----------|
| IRON Protocol | PR to main | iron-gate.yml |
| Console Usage | PR to main | console-check.yml |
| Cluster Registry | Script changes | validate_cluster_registry.py |
| Spec Validation | Spec changes | validate_specs.py |

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Spec drift from code | Medium | High | CI validation gates |
| Knowledge base staleness | Medium | Medium | Automated ingestion pipelines |
| Conflict accumulation | Low | Medium | Bi-weekly resolution reviews |
| CI permission gaps | High | Low | Manual workflow addition |

## Success Metrics

### Short-Term (2 weeks)
- [ ] All pending PRs merged
- [ ] CI validation gates active
- [ ] High-priority conflicts reduced by 50%

### Medium-Term (8 weeks)
- [ ] All deprecated scripts removed
- [ ] Golden dataset expanded to 50 questions
- [ ] Observability cluster implemented

### Long-Term (6 months)
- [ ] RAG quality maintained at >95%
- [ ] Zero untraceable normative statements
- [ ] API productization complete

## Appendix: File Locations

| Artifact | Path |
|----------|------|
| Canonical Specs | `docs/spec/*.md` |
| Cluster Registry | `docs/governance/CLUSTER_REGISTRY.json` |
| Conflict Register | `docs/spec/CONFLICT_REGISTER.md` |
| Deprecation Map | `docs/spec/DEPRECATION_MAP.md` |
| Traceability Matrix | `docs/spec/TRACEABILITY_MATRIX.csv` |
| CI Workflows (pending) | `/home/ubuntu/ci_workflows/` |

---

*This roadmap is a living document and should be updated as priorities evolve.*
