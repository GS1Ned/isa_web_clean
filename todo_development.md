# ISA v1.1 Development TODO

**Date:** 17 December 2025  
**Status:** Active Development  
**Priority:** Immediate Features from ISA Future Development Plan

---

## Critical Fix (Blocking)

- [x] Fix schema-content divergence in esrs_datapoints table (esrsStandard → esrs_standard)

---

## Feature 1: Regulatory Change Log UI (2-3 days)

### Public UI (/regulatory-changes)
- [x] Create RegulatorChanges.tsx page component (already exists)
- [x] List view with filters (source type, source org, date range, ISA version)
- [x] Detail view with full entry metadata
- [x] Statistics dashboard (entries by source type, timeline visualization)
- [x] GS1 Style Guide compliance

### Admin UI (/admin/regulatory-changes)
- [x] Admin UI integrated in RegulatoryChangeLog.tsx
- [x] Create form with all required fields (sourceType, sourceOrg, title, description, url, documentHash, etc.)
- [x] Delete capabilities (edit not needed - immutable design)
- [x] Bulk import from news pipeline
- [x] Validation with Zod schemas

### Backend Integration
- [x] Enhanced database helpers with pagination support
- [x] tRPC procedures with pagination and delete
- [x] News pipeline integration already exists
- [x] TypeScript compilation passing

### Testing
- [x] 25 Vitest tests passing (CRUD, authorization, pagination, filtering, validation)
- [x] GS1 Style Guide compliance verified
- [x] TypeScript: 0 errors

---

## Feature 2: Ask ISA RAG Query Interface (3-4 days)

### Backend Infrastructure (COMPLETE ✅)
- [x] Guardrails implementation with query classification
- [x] Query library with 30 production queries
- [x] Enhanced citation validation system
- [x] Confidence scoring based on source count
- [x] 4 new tRPC procedures (getProductionQueries, getQueriesByCategory, getQueriesBySector, searchQueries)
- [x] 28 Vitest tests passing (query classification, refusal patterns, citation validation, confidence scoring)

### Frontend UI (TODO)
- [ ] Query interface at /ask with autocomplete
- [ ] Response display with citation blocks
- [ ] Query history (last 10 queries per user)
- [ ] Refusal message display with suggested alternatives
- [ ] Confidence indicator (high/medium/low)
- [ ] Integration with existing Ask ISA page

### Query Interface UI (/ask)
- [ ] Create AskISA.tsx page component
- [ ] Query input with autocomplete from Query Library (30 queries)
- [ ] Response display with citation blocks
- [ ] Query history (last 10 queries per user)
- [ ] Refusal messages for out-of-scope questions

### RAG Pipeline
- [ ] Ingest GS1 Reference Portal bundle (352 documents) into vector store
- [ ] Query processing: embedding → similarity search → LLM answer
- [ ] Citation extraction (dataset ID, advisory section, source URL)
- [ ] Confidence scoring (high/medium/low based on source count)

### Guardrails Enforcement
- [ ] Allowed query types: Gap, Mapping, Version, Dataset, Recommendation, Coverage
- [ ] Forbidden query types: General ESG, hypotheticals, speculation, certification
- [ ] Refusal patterns implementation
- [ ] Maximum response length: 500 words

### Testing
- [ ] Validate all 30 queries from Query Library
- [ ] 100% citation completeness
- [ ] Response accuracy validation
- [ ] Performance: <2s per query (95th percentile)
- [ ] 15+ Vitest tests

---

## Feature 3: Advisory Diff Computation (4-5 days)

### Diff Computation Engine
- [ ] Create advisory-diff.ts module
- [ ] Input: ISA v1.0 JSON + ISA v1.1 JSON
- [ ] Output: Structured diff JSON (added/removed/modified)
- [ ] Diff types: Gap added, Gap closed, Recommendation implemented, etc.

### Diff Visualization UI (/advisory-diff)
- [ ] Create AdvisoryDiff.tsx component
- [ ] Side-by-side comparison view (v1.0 left, v1.1 right)
- [ ] Highlight changes (green/red/yellow)
- [ ] Filter by diff type
- [ ] Export diff as PDF report

### Diff Metrics Dashboard
- [ ] Summary statistics (X gaps closed, Y recommendations implemented)
- [ ] Timeline visualization
- [ ] Impact assessment

### Testing
- [ ] Diff computation deterministic
- [ ] All changes traceable to sources
- [ ] GS1 Style Guide compliance
- [ ] 10+ Vitest tests

---

## Quality Gates (All Features)

- [ ] GS1 Style Guide compliance (automated lint checks pass)
- [ ] 100% citation completeness (where applicable)
- [ ] TypeScript: 0 errors
- [ ] All Vitest tests passing
- [ ] Performance targets met
- [ ] Traceability maintained

---

## Completion Checklist

- [ ] All 3 immediate priority features implemented
- [ ] All quality gates passed
- [ ] Documentation updated
- [ ] Checkpoint saved
- [ ] User notification sent
