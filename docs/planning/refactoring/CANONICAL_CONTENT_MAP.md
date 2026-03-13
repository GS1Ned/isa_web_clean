# Canonical Content Map
## Phase 1: Content Source Analysis

**Created:** 2026-02-12  
**Purpose:** Identify authoritative content sources for each capability's target documentation  
**Status:** Analysis Complete

---

## ASK_ISA

### Golden Documents
1. **RUNTIME_CONTRACT.md** (Primary) - Most complete, recently updated
2. **ASK_ISA_GUARDRAILS.md** - Authoritative guardrails specification
3. **TESTING_GUIDE.md** - Complete test strategy
4. **DEPLOYMENT.md** - Deployment procedures

### Content Extraction Plan

#### CAPABILITY_SPEC.md
- **Purpose**: RUNTIME_CONTRACT.md § Purpose
- **Architecture**: RUNTIME_CONTRACT.md § Entry Points + Data Dependencies
- **Guardrails**: ASK_ISA_GUARDRAILS.md (entire document)
- **Security**: TRUST_RISK_ANALYSIS.md § Security Considerations
- **Data Model**: RUNTIME_CONTRACT.md § Data Dependencies
- **Quality Attributes**: RUNTIME_CONTRACT.md § Invariants
- **Operational Requirements**: RUNTIME_CONTRACT.md § Failure Modes

#### API_REFERENCE.md
- **tRPC Procedures**: Extract from `server/routers/ask-isa.ts`
- **Input Schemas**: RUNTIME_CONTRACT.md § Inputs/Outputs
- **Output Schemas**: RUNTIME_CONTRACT.md § Inputs/Outputs
- **Examples**: ASK_ISA_QUERY_LIBRARY.md (30 production queries)
- **Error Codes**: Extract from code

#### IMPLEMENTATION_GUIDE.md
- **Prerequisites**: DEPLOYMENT.md § Prerequisites
- **Setup**: DEPLOYMENT.md § Setup Steps
- **Workflow**: AGENT_MAP.md § Development Flow
- **Patterns**: Extract from code analysis
- **Best Practices**: TRUST_RISK_ANALYSIS.md § Recommendations

#### TESTING_GUIDE.md
- **Strategy**: TESTING_GUIDE.md (keep as-is, enhance)
- **Fixtures**: Extract from `server/routers/ask-isa.test.ts`
- **Scenarios**: ASK_ISA_TEST_RESULTS.md

#### DEPLOYMENT.md
- **Steps**: DEPLOYMENT.md (keep as-is, enhance)
- **Verification**: ASK_ISA_SMOKE_RUNBOOK.md

#### TROUBLESHOOTING.md
- **Common Issues**: ASK_ISA_SMOKE_RUNBOOK.md § Troubleshooting
- **Error Codes**: Extract from code
- **Debug Procedures**: TRUST_RISK_ANALYSIS.md § Risk Mitigation

### Gaps Identified
- No formal API reference (need to extract from code)
- Limited troubleshooting documentation
- Missing implementation patterns documentation

---

## NEWS_HUB

### Golden Documents
1. **RUNTIME_CONTRACT.md** (Primary)
2. **NEWS_PIPELINE.md** - Complete pipeline architecture
3. **CRON_SETUP_GUIDE.md** - Deployment procedures
4. **NEWS_HEALTH_MONITORING.md** - Operational monitoring

### Content Extraction Plan

#### CAPABILITY_SPEC.md
- **Purpose**: RUNTIME_CONTRACT.md § Purpose
- **Architecture**: NEWS_PIPELINE.md § Architecture
- **Data Flow**: NEWS_PIPELINE.md § Pipeline Stages
- **Sources**: RESEARCH_FINDINGS_NEWS_SOURCES.md
- **Data Model**: RUNTIME_CONTRACT.md § Data Dependencies
- **Quality Attributes**: NEWS_HUB_MATURITY_ANALYSIS.md § Metrics

#### API_REFERENCE.md
- **tRPC Procedures**: Extract from `server/news-admin-router.ts`
- **Schemas**: RUNTIME_CONTRACT.md § Inputs/Outputs
- **Events**: CRITICAL_EVENTS_TAXONOMY.md

#### IMPLEMENTATION_GUIDE.md
- **Setup**: CRON_SETUP_GUIDE.md § Prerequisites
- **Scraping**: NEWS_PIPELINE.md § Scraping Stage
- **Enrichment**: NEWS_PIPELINE.md § Enrichment Stage
- **Patterns**: Extract from code

#### TESTING_GUIDE.md
- **Strategy**: Extract from code analysis
- **Fixtures**: Extract from test files
- **Scenarios**: NEWS_HUB_MATURITY_ANALYSIS.md § Test Cases

#### DEPLOYMENT.md
- **Prerequisites**: CHROMIUM_INSTALLATION_GUIDE.md
- **Cron Setup**: CRON_SETUP_GUIDE.md + CRON_DEPLOYMENT.md
- **Verification**: NEWS_HEALTH_MONITORING.md

#### TROUBLESHOOTING.md
- **Common Issues**: NEWS_HEALTH_MONITORING.md § Issues
- **Health Monitoring**: NEWS_HEALTH_MONITORING.md § Monitoring
- **Debug**: Extract from code

### Gaps Identified
- No formal API reference
- Limited testing documentation
- Missing implementation patterns

---

## KNOWLEDGE_BASE

### Golden Documents
1. **RUNTIME_CONTRACT.md** (Primary, but incomplete)
2. **data-knowledge-model.md** - Data model specification

### Content Extraction Plan

#### CAPABILITY_SPEC.md
- **Purpose**: RUNTIME_CONTRACT.md § Purpose
- **Architecture**: Extract from code analysis
- **Data Model**: data-knowledge-model.md
- **Embeddings**: Extract from `server/_core/embedding.ts`

#### API_REFERENCE.md
- **Database Schema**: Extract from `drizzle/schema.ts`
- **Embedding API**: Extract from `server/_core/embedding.ts`
- **Search API**: Extract from `server/hybrid-search.ts`

#### IMPLEMENTATION_GUIDE.md
- **Corpus Ingestion**: Extract from `server/services/corpus-ingestion/`
- **Embedding Generation**: Extract from code
- **Search**: Extract from code

#### TESTING_GUIDE.md
- **Strategy**: Extract from code analysis
- **Fixtures**: Extract from test files
- **Scenarios**: Create from scratch

#### DEPLOYMENT.md
- **Prerequisites**: Extract from code
- **KB Generation**: Extract from code
- **Verification**: Create from scratch

#### TROUBLESHOOTING.md
- **Common Issues**: Create from scratch
- **Empty KB**: Create from scratch
- **Search Quality**: Create from scratch

### Gaps Identified
- **CRITICAL**: Most documentation missing
- No testing guide
- No deployment guide
- No troubleshooting guide
- Limited API documentation
- Needs extensive code analysis

---

## CATALOG

### Golden Documents
1. **RUNTIME_CONTRACT.md** (Primary)
2. **DATASETS_CATALOG.md** - Complete dataset inventory
3. **ISA_INFORMATION_ARCHITECTURE.md** - Information architecture

### Content Extraction Plan

#### CAPABILITY_SPEC.md
- **Purpose**: RUNTIME_CONTRACT.md § Purpose
- **Architecture**: ISA_INFORMATION_ARCHITECTURE.md
- **Data Sources**: DATASETS_CATALOG.md
- **Coverage**: GS1_EFRAG_CATALOGUE_INDEX.md

#### API_REFERENCE.md
- **tRPC Procedures**: Extract from `server/routers/catalog.ts`
- **Schemas**: Extract from code
- **Filters**: Extract from code

#### IMPLEMENTATION_GUIDE.md
- **Data Ingestion**: DATASETS_CATALOG.md § Ingestion
- **Catalog Updates**: Extract from code
- **Patterns**: Extract from code

#### TESTING_GUIDE.md
- **Strategy**: Extract from code analysis
- **Fixtures**: Extract from test files
- **Scenarios**: Create from scratch

#### DEPLOYMENT.md
- **Prerequisites**: Extract from code
- **Data Loading**: Extract from ingestion scripts
- **Verification**: Create from scratch

#### TROUBLESHOOTING.md
- **Common Issues**: Create from scratch
- **Data Quality**: Create from scratch
- **Debug**: Extract from code

### Gaps Identified
- No formal API reference
- Limited testing documentation
- No deployment guide
- No troubleshooting guide

---

## ESRS_MAPPING

### Golden Documents
1. **RUNTIME_CONTRACT.md** (Primary)
2. **DATA_MODEL.md** - Complete data model
3. **INGESTION.md** - Ingestion procedures
4. **GS1_DATA_MODELS.md** - GS1 data models

### Content Extraction Plan

#### CAPABILITY_SPEC.md
- **Purpose**: RUNTIME_CONTRACT.md § Purpose
- **Architecture**: isa-core-architecture.md
- **Mapping Engine**: Extract from `server/gs1-mapping-engine.ts`
- **Data Model**: DATA_MODEL.md

#### API_REFERENCE.md
- **Mapping API**: Extract from `server/gs1-mapping-engine.ts`
- **Schemas**: GS1_DATA_MODELS.md
- **Examples**: GS1_EU_PCF_TO_ESRS_E1_MAPPINGS.md

#### IMPLEMENTATION_GUIDE.md
- **Data Ingestion**: INGESTION.md
- **Mapping Generation**: Extract from code
- **Patterns**: Extract from code

#### TESTING_GUIDE.md
- **Strategy**: test-failure-analysis-2025-12-17.md
- **Fixtures**: Extract from test files
- **Scenarios**: Extract from tests

#### DEPLOYMENT.md
- **Prerequisites**: INGESTION_SUMMARY_REPORT.md
- **Data Loading**: INGESTION.md
- **Verification**: Extract from code

#### TROUBLESHOOTING.md
- **Common Issues**: KNOWN_FAILURE_MODES.md
- **Mapping Quality**: Extract from code
- **Debug**: test-failure-analysis-2025-12-17.md

### Gaps Identified
- No formal API reference
- Limited deployment documentation
- Needs code analysis for patterns

---

## ADVISORY

### Golden Documents
1. **RUNTIME_CONTRACT.md** (Primary)
2. **ARCHITECTURE.md** - Complete architecture
3. **ADVISORY_METHOD.md** - Methodology specification
4. **API_REFERENCE.md** - Existing API reference (enhance)
5. **QUALITY_BAR.md** - Quality standards

### Content Extraction Plan

#### CAPABILITY_SPEC.md
- **Purpose**: RUNTIME_CONTRACT.md § Purpose
- **Architecture**: ARCHITECTURE.md
- **Methodology**: ADVISORY_METHOD.md
- **Versioning**: ADVISORY_OUTPUTS.md
- **Data Model**: Extract from code
- **Quality Attributes**: QUALITY_BAR.md

#### API_REFERENCE.md
- **Base**: API_REFERENCE.md (keep, enhance)
- **tRPC Procedures**: Extract from `server/routers/advisory.ts`
- **Diff API**: ADVISORY_DIFF_METRICS.md

#### IMPLEMENTATION_GUIDE.md
- **Advisory Generation**: ADVISORY_METHOD.md
- **Diff Computation**: ADVISORY_DIFF_METRICS.md
- **Style Guide**: STYLE_GUIDE_ADOPTION.md
- **Patterns**: Extract from code

#### TESTING_GUIDE.md
- **Strategy**: QUALITY_BAR.md
- **Fixtures**: Extract from test files
- **Validation**: Extract from validation scripts

#### DEPLOYMENT.md
- **Prerequisites**: Extract from code
- **Generation**: ADVISORY_METHOD.md § Process
- **Publication**: Extract from governance docs

#### TROUBLESHOOTING.md
- **Common Issues**: Create from scratch
- **Quality Issues**: QUALITY_BAR.md § Issues
- **Debug**: Extract from code

### Gaps Identified
- No deployment guide
- Limited troubleshooting documentation
- Needs code analysis for patterns

---

## System-Wide Documentation

### Golden Documents
1. **ISA_CAPABILITY_MAP.md** - Capability overview
2. **PRODUCTION_READINESS.md** - Production criteria
3. **TRACEABILITY_MATRIX.csv** - Dependency tracking

### Content Extraction Plan

#### ARCHITECTURE.md
- **System Overview**: ISA_CAPABILITY_MAP.md
- **Capabilities**: Aggregate from capability specs
- **Infrastructure**: Extract from code + deployment docs
- **Data Flow**: Aggregate from capability architectures

#### INTEGRATION_CONTRACTS.md
- **Dependencies**: TRACEABILITY_MATRIX.csv
- **Shared Models**: Extract from `drizzle/schema.ts`
- **Events**: Aggregate from capability specs
- **APIs**: Aggregate from capability API references

#### DEPLOYMENT_GUIDE.md
- **Prerequisites**: PRODUCTION_READINESS.md
- **Order**: Determine from dependency analysis
- **Verification**: Aggregate from capability deployment docs
- **Rollback**: Extract from deployment docs

### Gaps Identified
- No formal integration contracts documentation
- No end-to-end deployment guide
- Needs dependency analysis

---

## Content Quality Assessment

### High Quality (>80% complete)
- ASK_ISA: RUNTIME_CONTRACT.md, TESTING_GUIDE.md, DEPLOYMENT.md
- NEWS_HUB: NEWS_PIPELINE.md, CRON_SETUP_GUIDE.md
- ADVISORY: ARCHITECTURE.md, ADVISORY_METHOD.md, API_REFERENCE.md

### Medium Quality (50-80% complete)
- ASK_ISA: ASK_ISA_GUARDRAILS.md
- NEWS_HUB: RUNTIME_CONTRACT.md, NEWS_HEALTH_MONITORING.md
- CATALOG: DATASETS_CATALOG.md, ISA_INFORMATION_ARCHITECTURE.md
- ESRS_MAPPING: DATA_MODEL.md, INGESTION.md
- ADVISORY: RUNTIME_CONTRACT.md, QUALITY_BAR.md

### Low Quality (<50% complete)
- KNOWLEDGE_BASE: All documents (needs major work)
- All capabilities: API references (need extraction from code)
- All capabilities: Troubleshooting guides (need creation)

---

## Next Steps

1. **Week 1**: Complete this content extraction for all capabilities
2. **Week 2**: Create system-wide architecture documents
3. **Weeks 3-4**: Consolidate capability documentation using this map
4. **Week 5**: Validate completeness and consistency
5. **Week 6**: Archive old docs and update cross-references

---

**Document Status:** COMPLETE  
**Next Action:** Begin Phase 2 (Architecture Documentation)
