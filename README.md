# ISA — Intelligent Standards Architect

![Validation Gates](https://img.shields.io/badge/gates-6%2F6%20passing-success)
![Quality Score](https://img.shields.io/badge/quality-75%2F100-yellow)
![Semantic Validity](https://img.shields.io/badge/semantic-91.9%25-success)
![Evidence Markers](https://img.shields.io/badge/evidence-145%20markers-blue)
![Test Coverage](https://img.shields.io/badge/tests-90.1%25-yellow)
![Contract Completeness](https://img.shields.io/badge/contracts-70%25-yellow)

<!-- ISA:REPO_ASSESSMENT_LINKS:BEGIN -->
## Repository assessment

- Canonical how-to: `docs/reference/REPO_ASSESSMENT_HOWTO.md`
<!-- ISA:REPO_ASSESSMENT_LINKS:END -->


**Status:** Phase 9 Consolidation Complete  
**Last Updated:** 2025-12-17  
**Phase:** 9 (Consolidation, Hardening, Close-Out)

---

## What ISA Is

ISA (Intelligent Standards Architect) is a sustainability compliance intelligence platform that connects EU ESG regulations to GS1 standards through AI-powered analysis and a structured knowledge graph.

**Core Capabilities (verified as of 2025-12-17):**

ISA provides **regulation-to-standard mapping intelligence** for GS1 Netherlands members navigating EU sustainability compliance requirements. The platform ingests regulatory content from authoritative sources (EUR-Lex, EFRAG), processes GS1 technical standards (GDSN, EPCIS, WebVoc), and generates structured mappings using AI-assisted analysis. Users can query the knowledge graph, explore compliance timelines, and access versioned advisory outputs that trace every data point back to its source.

The system operates under strict governance constraints that prioritize data integrity, citation accuracy, and version control. All AI-generated content includes mandatory citations, all datasets carry provenance metadata, and all potentially impactful decisions are tracked in version control.

---

## What ISA Is NOT

**ISA does NOT:**
- Provide legal advice or compliance guarantees
- Claim 100% coverage of any regulation or standard
- Offer real-time regulatory updates (news pipeline operates on scheduled intervals)
- Replace professional ESG consultants or auditors
- Guarantee currency beyond explicitly timestamped verification dates
- Support jurisdictions outside EU + Dutch/Benelux focus
- Provide production-ready EPCIS validation (tools are exploratory)
- Offer public API access (internal use only)

**Scope Boundaries:**
- **Geographic:** EU regulations + Dutch/Benelux initiatives only
- **Temporal:** Datasets verified as of their documented `last_verified_date`
- **Regulatory:** Focus on CSRD/ESRS, EUDR, DPP, PPWR, Batteries (not exhaustive)
- **Standards:** GS1 standards only (no ISO, UNECE, or other SDOs)
- **Audience:** GS1 Netherlands members and stakeholders

---

## Verified Coverage (as of 2025-12-17)

<!-- EVIDENCE:requirement:data/metadata/dataset_registry.json -->
**Regulations Tracked:** 38 EU regulations  
<!-- EVIDENCE:requirement:data/efrag/esrs_datapoints_efrag_ig3.json -->
**ESRS Datapoints:** 1,184 datapoints from EFRAG IG3 (verified 2024-12-15)  
<!-- EVIDENCE:requirement:data/gs1/gs1_standards_catalog.json -->
**GS1 Standards:** 60+ standards cataloged (verified 2024-11-30)  
<!-- EVIDENCE:implementation:server/gs1-mapping-engine.ts -->
**AI Mappings:** 450+ regulation-to-standard mappings (generated 2024-12-10)  
<!-- EVIDENCE:implementation:server/news-sources.ts -->
**News Sources:** 7 sources monitored (100% health rate as of 2025-12-17)  
<!-- EVIDENCE:requirement:data/advisories/ -->
**Advisory Reports:** 2 versions (v1.0, v1.1) under governance review  
<!-- EVIDENCE:decision:docs/test-failure-analysis-2025-12-17.md -->
**Test Coverage:** 517/574 tests passing (90.1%)

**Known Gaps (intentionally deferred):**
- CS3D/CSDDD detailed implementation guidance
- ESPR delegated acts (pending publication)
- Sector-specific Green Deals (partial coverage)
- Real-time regulatory change detection
- Multi-language support (English only)
- EPCIS 2.0 validation (exploratory only)

---

## Governance Principles

<!-- EVIDENCE:requirement:docs/governance/_root/ISA_GOVERNANCE.md -->
ISA operates under strict governance constraints that prioritize data integrity, citation accuracy, and version control.

**Authoritative Governance Document:**  
<!-- EVIDENCE:requirement:docs/governance/_root/ISA_GOVERNANCE.md -->
📄 **[ISA_GOVERNANCE.md](./docs/governance/_root/ISA_GOVERNANCE.md)**

**Key Governance Principles:**
1. **Data Integrity:** All datasets include source, version, format, last_verified_date
2. **Citation Accuracy:** All AI-generated content includes mandatory citations
3. **Version Control:** All changes tracked in Git with conventional commits
4. **Transparency:** All decisions documented with rationale and alternatives
5. **Reversibility:** All changes can be rolled back via Git

**Critical Changes Requiring Review:**
- Schema changes affecting data integrity
- New data sources or ingestion pipelines
- Changes to AI prompts or mapping logic
- Advisory report publication
- Governance framework modifications
- External integrations or API exposure

**For Developers:**
- Read docs/governance/_root/ISA_GOVERNANCE.md before making any changes
- Follow governance principles for all critical changes
- Perform governance self-checks before and after work
- When in doubt, escalate

---

## Technology Stack

<!-- EVIDENCE:implementation:package.json -->
**Frontend:** React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui + Wouter + tRPC client  
<!-- EVIDENCE:implementation:server/_core/index.ts -->
**Backend:** Express 4 + tRPC 11 + Drizzle ORM + MySQL/TiDB + Manus OAuth  
<!-- EVIDENCE:implementation:server/embedding.ts -->
**AI/ML:** OpenAI GPT-4 (advisory, Q&A) + text-embedding-3-small (semantic search)  
<!-- EVIDENCE:implementation:vite.config.ts -->
**Infrastructure:** Manus hosting + GitHub (version control) + Playwright (scraping) + Vitest (testing)

---

## Project Structure

```
isa_web_clean/
├── AGENT_START_HERE.md                 # Canonical agent entrypoint
├── docs/REPO_MAP.md                    # Evidence-bound repository map
├── docs/planning/INDEX.md              # Canonical planning index
├── docs/spec/INDEX.md                  # Specs index (capabilities)
├── docs/governance/_root/ISA_GOVERNANCE.md # Authoritative governance framework
├── REPO_TREE.md                        # CI-generated repo tree snapshot
├── todo.md                             # Deprecated pointer to canonical planning
├── client/                             # Frontend (Vite/React)
├── server/                             # Backend (Express + tRPC)
├── drizzle/                            # Database schema and migrations
├── scripts/                            # Automation and probes
└── data/                               # Dataset files and metadata
```

**Documentation Map:** See [docs/README.md](./docs/README.md) for full documentation structure.

---

## Key Features

### ESG Hub
Tracks 38 EU regulations with compliance timelines, regulation comparison tool, and real-time news feed from 7 sources. Includes 1,184 ESRS datapoints from EFRAG IG3 and 60+ GS1 standards catalog.

### Advisory System
Generates versioned advisory outputs (v1.0, v1.1) with full dataset provenance tracking, advisory diff computation, and GS1-to-ESRS mapping engine. All outputs subject to governance review before publication.

### Ask ISA
RAG-powered Q&A system with 30 production queries, mandatory citations, query guardrails (6 allowed types, 5 forbidden types), and confidence scoring. All responses include source citations.

### EPCIS Tools
Exploratory supply chain traceability tools including EUDR geolocation mapper, barcode scanner, EPCIS event upload (JSON/XML), and compliance report generation. NOT production-ready.

### Admin Tools
News pipeline management, regulatory change log, scraper health monitoring, coverage analytics, pipeline observability, and ESRS-GS1 mapping explorer.

---

## Development Workflow

### GitHub-First Workflow (Required as of 2025-12-17)

**Repository:** https://github.com/GS1Ned/isa_web_clean

**Workflow:**
1. Create feature branch from main
2. Make changes in local sandbox
3. Commit with conventional commit messages (feat, fix, docs, refactor, test, chore, data)
4. Push to GitHub
5. Open pull request with governance checklist
6. CI checks run automatically
7. Request review from repo maintainers
8. Merge after approval

**Sync Cadence:** Minimum once per development day

**Documentation:** See [docs/planning/INDEX.md](./docs/planning/INDEX.md) and [.github/PULL_REQUEST_TEMPLATE.md](./.github/PULL_REQUEST_TEMPLATE.md)

### Local Development

**Prerequisites:** Node.js 22.13.0 + pnpm + MySQL/TiDB

**Setup:**
```
isa_web_clean/
 ├── docs/governance/_root/ISA_GOVERNANCE.md  # Authoritative governance framework
 ├── docs/planning/INDEX.md                  # Canonical planning index
 ├── todo.md                                 # Deprecated pointer to canonical planning
 ├── client/                 # Frontend (React 19 + Tailwind 4)
 ├── server/                 # Backend (Express 4 + tRPC 11)
 ├── drizzle/                # Database schema and migrations
 ├── data/                   # Dataset files and metadata
 ├── docs/                   # Documentation (see docs/README.md)
 └── scripts/                # Automation scripts
```

### Dataset Registry

ISA maintains a machine-readable dataset registry at:

📄 **data/metadata/dataset_registry.json**

**Registry Version:** 1.4.0 (Locked as of 2025-12-15)

**Registered Datasets:** 15 canonical datasets, 11,197+ total records, 100% MVP requirements covered

**Key Datasets:**
- ESRS Datapoints (EFRAG IG3): 1,186 records (verified 2024-12-15)
- GS1 NL Benelux Sector Models: 3,667 attributes (verified 2024-11-30)
- GS1 Validation Rules: 847 rules + 1,055 code lists (verified 2024-11-25)
- GDSN Current: 4,293 records (verified 2024-11-20)
- GS1 WebVoc: 4,373 terms (verified 2024-11-15)
- EFRAG ESRS XBRL Taxonomy: 5,430 concepts (verified 2024-12-01)

### Data Provenance

All datasets include: publisher, jurisdiction, version, release date, SHA256 checksums, lineage, source URLs, ingestion date, and ingestion method.

**Documentation:** See [docs/DATASETS_CATALOG.md](./docs/DATASETS_CATALOG.md)

---

## Testing

**Framework:** Vitest  
**Status (as of 2025-12-17):** 517/574 tests passing (90.1%), 57 non-critical failures, TypeScript: 0 errors

**Test Categories:**
- Unit tests (server/\*.test.ts)
- Integration tests (server/\*-integration.test.ts)
- Router tests (server/routers/\*.test.ts)

**Run Tests:**
```bash
pnpm test                        # All tests
pnpm test server/routers.test.ts # Specific file
pnpm test --watch                # Watch mode
```

**Test Failure Analysis:** See [docs/test-failure-analysis-2025-12-17.md](./docs/test-failure-analysis-2025-12-17.md)

---

## Documentation

### Core Documentation
- [ISA_GOVERNANCE.md](./docs/governance/_root/ISA_GOVERNANCE.md) - Authoritative governance framework
- [docs/spec/ARCHITECTURE.md](./docs/spec/ARCHITECTURE.md) - System architecture (current state)
- [docs/planning/INDEX.md](./docs/planning/INDEX.md) - Planning index (canonical)
- [docs/planning/NEXT_ACTIONS.json](./docs/planning/NEXT_ACTIONS.json) - Execution queue (canonical)
- [docs/README.md](./docs/README.md) - Documentation map

### Data & Ingestion
- [docs/DATASETS_CATALOG.md](./docs/DATASETS_CATALOG.md) - Dataset inventory
- [docs/NEWS_PIPELINE.md](./docs/NEWS_PIPELINE.md) - News pipeline architecture

### Advisory System
- [docs/ISA_First_Advisory_Report_GS1NL.md](./docs/ISA_First_Advisory_Report_GS1NL.md) - Advisory v1.0
- [docs/ADVISORY_METHOD.md](./docs/ADVISORY_METHOD.md) - Advisory methodology

### Quality & Testing
- [docs/QUALITY_BAR.md](./docs/QUALITY_BAR.md) - Quality standards
- [docs/test-failure-analysis-2025-12-17.md](./docs/test-failure-analysis-2025-12-17.md) - Test analysis

**Full Documentation Map:** See [docs/README.md](./docs/README.md)

---

## Security

**Security Policy:** No `SECURITY.md` is present in this repository.

**Reporting Security Issues:** Define a private reporting channel and add `SECURITY.md` when ready.

---

## Contributing

**⚠️ GOVERNANCE REQUIREMENT:** All contributions subject to ISA governance framework.

**Before Contributing:**
1. Read [ISA_GOVERNANCE.md](./docs/governance/_root/ISA_GOVERNANCE.md)
2. Understand governance principles
3. Follow governance requirements for critical changes
4. Ensure all changes comply with governance principles

**Contribution Workflow:**
1. Fork repository (or create branch if write access)
2. Create feature branch (feature/your-feature-name)
3. Make changes following governance requirements
4. Write tests for new functionality
5. Ensure all tests pass (pnpm test)
6. Ensure TypeScript compiles (pnpm tsc)
7. Commit with conventional commit messages
8. Push to GitHub
9. Open pull request with governance checklist
10. Request review from CODEOWNERS
11. Address review feedback
12. Merge after approval

**Commit Message Format:**
```
<type>: <description>

[optional body]

[optional footer]
```

**Types:** feat, fix, docs, refactor, test, chore, data

---

## License

**Status:** Not yet determined (pending governance decision)

**⚠️ GOVERNANCE ESCALATION REQUIRED:** Licensing decisions require review and approval.

---

## Contact

**Project Owner:** GS1 Netherlands  
**Development Agent:** Manus AI  
**Governance Steward:** ISA Executive Steward

**Repository:** https://github.com/GS1Ned/isa_web_clean  
**Issues:** https://github.com/GS1Ned/isa_web_clean/issues

---

## Acknowledgments

**Data Sources:** EFRAG, EUR-Lex, GS1 Global Office, GS1 Netherlands, GS1 Europe, European Commission

**Technology Partners:** Manus (hosting and AI infrastructure), OpenAI (LLM and embeddings), GitHub (version control and CI/CD)

---

**Phase 9 Status:** Consolidation Complete  
**Last Updated:** 2025-12-17

For governance questions or escalations, refer to [ISA_GOVERNANCE.md](./docs/governance/_root/ISA_GOVERNANCE.md).
