# ISA Core Architecture

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** ISA Core Architecture
- **Scope:** CURRENT state of isa core architecture
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

**Current Architecture Evidence:**
1. `server/_core/index.ts` - Core server infrastructure
2. `server/routers.ts` - tRPC router registry
3. `drizzle/schema.ts` - Database schema
4. `client/src/App.tsx` - Frontend routing
5. `docs/architecture/panel/ATAM_SCENARIOS.md` - Quality attribute scenarios
6. `docs/architecture/panel/ATAM_RISKS_SENSITIVITIES_TRADEOFFS.md` - Architecture risks
7. `docs/sre/SLO_CATALOG.md` - SLO definitions
8. `docs/governance/_root/ISA_GOVERNANCE.md` - Governance framework

## 3. System Components

### Frontend (React 19 + Vite)
- **Entry:** `client/src/App.tsx`
- **Routing:** Wouter (patched)
- **State:** TanStack Query + tRPC client
- **UI:** shadcn/ui + Tailwind CSS 4

### Backend (Express + tRPC)
- **Entry:** `server/_core/index.ts`
- **Routers:** `server/routers/*.ts` (6 capabilities)
- **Services:** `server/services/` (RAG, mappings, news)
- **Auth:** Manus OAuth (`server/_core/auth.ts`)

### Database (Drizzle ORM + TiDB)
- **Schema:** `drizzle/schema*.ts`
- **Migrations:** `drizzle/migrations/`
- **Tables:** 20+ tables (regulations, standards, mappings, news, etc.)

### Data Layer
- **Registry:** `data/metadata/dataset_registry.json`
- **ESRS:** `data/efrag/esrs_datapoints_efrag_ig3.json`
- **GS1:** `data/gs1/gs1_standards_catalog.json`
- **Advisories:** `data/advisories/advisory_v*.json`

## 4. Core Invariants

**INV-1: Governance-First**
All critical changes require governance self-check. Advisory publication requires Lane C review.
- Evidence: `docs/governance/_root/ISA_GOVERNANCE.md`

**INV-2: Citation Accuracy**
All AI-generated content must include mandatory citations to source documents.
- Evidence: `server/services/ask-isa/ask-isa-guardrails.ts`

**INV-3: Data Provenance**
All datasets must include source, version, format, last_verified_date, SHA256 checksums.
- Evidence: `data/metadata/dataset_registry.json`

**INV-4: Schema Validation**
All proof artifacts must validate against JSON schemas.
- Evidence: `scripts/gates/validate-proof-artifacts.sh`

**INV-5: No Unverifiable Claims**
Anything not verifiable is UNKNOWN and cannot score ≥9/10.
- Evidence: `docs/architecture/panel/KICKOFF_PACKAGE.md`

## 5. Interfaces & Pipelines

### API Layer (tRPC)
- **Router Registry:** `server/routers.ts`
- **Ask ISA:** `server/routers/ask-isa.ts`
- **Advisory:** `server/routers/advisory.ts`
- **Catalog:** `server/routers/catalog.ts`
- **News Hub:** `server/routers/news.ts`
- **ESRS Mapping:** `server/routers/esrs-mapping.ts`
- **Knowledge Base:** `server/routers/knowledge-base.ts`

### Data Pipelines
- **News Scraping:** `server/news-scraper.ts` (7 sources, cron-triggered)
- **ESRS Ingestion:** `server/ingest/INGEST-03_esrs_datapoints.ts`
- **GS1 Ingestion:** `server/ingest/INGEST-04_gs1_standards.ts`
- **Embedding Generation:** `server/embedding.ts`
- **Advisory Generation:** `scripts/advisory/generate_advisory_v1.py`

### Frontend Routes
- **ESG Hub:** `/hub/*` (regulations, standards, news)
- **Ask ISA:** `/ask-isa`
- **Advisory:** `/advisory`
- **Admin:** `/admin/*` (news pipeline, mappings, health)

## 6. Governance & Change Control

**Governance Framework:** `docs/governance/_root/ISA_GOVERNANCE.md`

**Key Principles:**
1. Data integrity: All datasets include provenance metadata
2. Citation accuracy: All AI content includes mandatory citations
3. Version control: All changes tracked in Git
4. Transparency: All decisions documented with rationale
5. Reversibility: All changes can be rolled back

**Critical Changes Requiring Review:**
- Schema changes affecting data integrity
- New data sources or ingestion pipelines
- Changes to AI prompts or mapping logic
- Advisory report publication
- Governance framework modifications

**Validation Gates:** `scripts/gates/`
- canonical-docs-allowlist.sh
- doc-code-validator.sh
- validate-proof-artifacts.sh
- security-gate.sh
- governance-gate.sh
- slo-policy-check.sh

## 7. Observability

### Logging
- **Infrastructure:** `server/_core/logger-wiring.ts`
- **Coverage:** 50.2% (measured by observability-contract.sh)
- **Format:** Structured JSON logs with context prefixes

### Tracing
- **RAG Tracing:** `server/services/rag-tracing/trace-logger.ts`
- **Status:** Partial (no distributed tracing)

### Metrics
- **Status:** UNKNOWN (no metrics collection infrastructure)
- **SLOs Defined:** 9 SLOs in `docs/sre/SLO_CATALOG.md`
- **Error Budget:** `docs/sre/ERROR_BUDGET_POLICY.md`

### Monitoring
- **News Pipeline:** `server/news-pipeline-status.ts`
- **Scraper Health:** Database table + admin UI
- **Test Results:** `test-results/ci/*.json`

### Gates
- **Observability Contract:** `scripts/gates/observability-contract.sh`
- **Status:** FAIL (50.2% logging coverage, no tracing/metrics)

## 8. Quality & Testing

### Test Infrastructure
- **Framework:** Vitest
- **Coverage:** 90.1% pass rate (517/574 tests)
- **Status:** 57 failures (20 flaky, 25 broken, 10 obsolete, 2 environment)
- **Analysis:** `docs/TEST_FAILURE_TRIAGE.md`

### Proof Artifacts
- **Schemas:** `docs/quality/schemas/*.schema.json` (11 schemas)
- **Artifacts:** `test-results/ci/*.json` (9/11 generated)
- **Validation:** `scripts/gates/validate-proof-artifacts.sh` (9 PASS, 0 FAIL, 2 SKIP)

### Architecture Review
- **Framework:** Repo-Tight v5
- **ATAM Artifacts:** `docs/architecture/panel/ATAM_*.md`
- **Baseline Score:** 6.2/10 overall
- **Target:** ≥9/10 with schema-valid proof artifacts

### Known Gaps
- D3 Security: No secret scanning, authz tests, dependency scanning
- D4 Reliability: No SLO monitoring, success rate tracking
- D5 Performance: No latency monitoring, load testing
- D8 Observability: No distributed tracing, metrics collection

## 9. References

### Canonical Documents
- `docs/INDEX.md` - Documentation index
- `docs/REPO_MAP.md` - Repository map
- `docs/governance/_root/ISA_GOVERNANCE.md` - Governance framework
- `docs/architecture/panel/KICKOFF_PACKAGE.md` - Architecture review kickoff
- `docs/sre/SLO_CATALOG.md` - SLO definitions
- `docs/sre/ERROR_BUDGET_POLICY.md` - Error budget policy

### Runtime Contracts
- `docs/spec/ASK_ISA/RUNTIME_CONTRACT.md`
- `docs/spec/ADVISORY/RUNTIME_CONTRACT.md`
- `docs/spec/CATALOG/RUNTIME_CONTRACT.md`
- `docs/spec/NEWS_HUB/RUNTIME_CONTRACT.md`
- `docs/spec/KNOWLEDGE_BASE/RUNTIME_CONTRACT.md`
- `docs/spec/ESRS_MAPPING/RUNTIME_CONTRACT.md`

### Generated Artifacts
- `docs/architecture/panel/_generated/ARCHITECTURE_SCORECARD.json`
- `docs/architecture/panel/_generated/REF_INDEX.json`
- `docs/architecture/panel/_generated/INBOUND_LINKS.json`
- `docs/evidence/_generated/catalogue.json`
- `docs/sre/_generated/error_budget_status.json`
- `test-results/ci/*.json`

---

**Document Status:** SSOT (Single Source of Truth)  
**Last Updated:** 2026-02-12  
**Maintainer:** ISA Repository Steward
