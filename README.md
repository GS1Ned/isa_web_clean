# ISA — Intelligent Standards Architect

**Status:** Active Development  
**Governance Mode:** Lane C (User-Decision Mode)  
**Last Updated:** 2025-12-17

---

## Overview

ISA (Intelligent Standards Architect) is a revolutionary sustainability compliance platform that maps EU regulations (CSRD, ESRS, EUDR, DPP) to GS1 standards using AI-powered analysis and a comprehensive knowledge graph.

**Core Value Proposition:**
- Map EU ESG regulations to GS1 NL/Benelux sector data models
- Provide actionable compliance guidance for GS1 Netherlands members
- Maintain authoritative, versioned advisory outputs with full traceability

---

## Governance

**⚠️ IMPORTANT:** This project operates under strict governance requirements.

**Current Governance Mode:** Lane C — User-Decision Mode

All development activities are subject to the governance framework defined in:

📄 **[ISA_GOVERNANCE.md](./ISA_GOVERNANCE.md)**

**Key Governance Principles:**
- Mandatory escalation for all potentially impactful decisions
- No assumptions, no "safe defaults", no forward execution without approval
- Data integrity, security, transparency, reversibility, and user authority are inviolable
- Silence is NOT consent

**For Developers:**
- Read ISA_GOVERNANCE.md before making any changes
- Follow mandatory escalation format for all Lane C triggers
- Perform governance self-checks before and after work
- When in doubt, escalate

---

## Project Structure

```
isa_web/
├── ISA_GOVERNANCE.md          # Authoritative governance framework
├── ROADMAP.md                 # Development roadmap
├── ROADMAP_GITHUB_INTEGRATION.md  # GitHub workflow documentation
├── todo.md                    # Development task tracking
├── client/                    # Frontend application (React 19 + Tailwind 4)
├── server/                    # Backend application (Express 4 + tRPC 11)
├── drizzle/                   # Database schema and migrations
├── data/                      # Dataset files and metadata
├── docs/                      # Documentation and governance policies
└── scripts/                   # Automation and utility scripts
```

---

## Technology Stack

**Frontend:**
- React 19 with TypeScript
- Tailwind CSS 4
- shadcn/ui components
- Wouter (routing)
- tRPC client

**Backend:**
- Express 4
- tRPC 11 (type-safe API)
- Drizzle ORM
- MySQL/TiDB database
- Manus OAuth

**AI/ML:**
- OpenAI GPT-4 (advisory generation, Q&A)
- OpenAI text-embedding-3-small (semantic search)
- LLM-powered regulation-to-standard mapping

**Infrastructure:**
- Manus hosting platform
- GitHub (version control and CI/CD)
- Playwright (web scraping)
- Vitest (testing)

---

## Key Features

### ESG Hub
- 38 EU regulations tracked (CSRD, ESRS, EUDR, DPP, PPWR, etc.)
- 1,184 ESRS datapoints from EFRAG IG3
- 60+ GS1 standards catalog
- 450+ AI-powered regulation-to-standard mappings
- Real-time news feed (7 sources, 100% health rate)
- Compliance calendar with deadline tracking
- Regulation comparison tool

### EPCIS Tools
- Supply chain traceability visualization
- EUDR geolocation mapper
- Barcode scanner for GTIN lookup
- EPCIS event upload (JSON/XML)
- Compliance report generation

### Advisory System
- Versioned advisory outputs (v1.0, v1.1)
- Dataset registry with provenance tracking
- Advisory diff computation
- GS1-to-ESRS mapping engine
- Compliance roadmap generator

### Ask ISA
- RAG-powered Q&A system
- 30 production queries with mandatory citations
- Query guardrails (6 allowed types, 5 forbidden types)
- Confidence scoring and citation validation
- Conversation history

### Admin Tools
- News pipeline management
- Regulatory change log
- Scraper health monitoring
- Coverage analytics
- Pipeline observability
- ESRS-GS1 mapping explorer

---

## Development Workflow

### GitHub-First Workflow

**⚠️ All development MUST follow GitHub workflow as of 2025-12-17.**

**Repository:** https://github.com/GS1-ISA/isa

**Workflow:**
1. Create feature branch from main
2. Make changes in local sandbox
3. Commit with conventional commit messages (feat, fix, docs, refactor, test, chore, data)
4. Push to GitHub
5. Open pull request
6. CI checks run automatically
7. Request review from CODEOWNERS
8. Merge after approval

**Sync Cadence:** Minimum once per development day

**Documentation:** See [ROADMAP_GITHUB_INTEGRATION.md](./ROADMAP_GITHUB_INTEGRATION.md)

### Local Development

**Prerequisites:**
- Node.js 22.13.0
- pnpm package manager
- MySQL/TiDB database

**Setup:**
```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm db:push

# Start development server
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm tsc
```

**Environment Variables:**
- All system environment variables are pre-configured in Manus platform
- See `server/_core/env.ts` for available environment variables
- Never commit `.env` files

---

## Data Governance

### Dataset Registry

ISA maintains a machine-readable dataset registry at:

📄 **data/metadata/dataset_registry.json**

**Registry Version:** 1.4.0 (Locked)

**Registered Datasets:**
- 15 canonical datasets
- 11,197+ total records
- 100% MVP requirements covered

**Key Datasets:**
- ESRS Datapoints (EFRAG IG3): 1,186 records
- GS1 NL Benelux Sector Models: 3,667 attributes
- GS1 Validation Rules: 847 rules + 1,055 code lists
- GDSN Current: 4,293 records
- GS1 WebVoc: 4,373 terms
- EFRAG ESRS XBRL Taxonomy: 5,430 concepts

### Data Provenance

All datasets include:
- Publisher and jurisdiction
- Version and release date
- SHA256 checksums
- Lineage and source URLs
- Ingestion date and method

**Documentation:** See [docs/DATASETS_CATALOG.md](./docs/DATASETS_CATALOG.md)

---

## Testing

**Test Framework:** Vitest

**Current Status:**
- 517/574 tests passing (90.1%)
- 57 test failures (all non-critical, categorized in test-failure-analysis-2025-12-17.md)
- TypeScript: 0 errors
- All production features working

**Test Categories:**
- Unit tests (server/\*.test.ts)
- Integration tests (server/\*-integration.test.ts)
- Router tests (server/routers/\*.test.ts)

**Run Tests:**
```bash
# All tests
pnpm test

# Specific test file
pnpm test server/routers.test.ts

# Watch mode
pnpm test --watch
```

---

## Documentation

### Governance
- [ISA_GOVERNANCE.md](./ISA_GOVERNANCE.md) - Authoritative governance framework
- [docs/GITHUB_PROVISIONING_REPORT.md](./docs/GITHUB_PROVISIONING_REPORT.md) - GitHub setup report

### Development
- [ROADMAP.md](./ROADMAP.md) - Development roadmap
- [ROADMAP_GITHUB_INTEGRATION.md](./ROADMAP_GITHUB_INTEGRATION.md) - GitHub workflow
- [todo.md](./todo.md) - Task tracking
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System architecture
- [docs/DATA_MODEL.md](./docs/DATA_MODEL.md) - Database schema

### Data & Ingestion
- [docs/DATASETS_CATALOG.md](./docs/DATASETS_CATALOG.md) - Dataset inventory
- [docs/INGESTION.md](./docs/INGESTION.md) - Data ingestion pipelines
- [docs/DATASET_INVENTORY.md](./docs/DATASET_INVENTORY.md) - Dataset registry

### News Hub
- [docs/NEWS_PIPELINE.md](./docs/NEWS_PIPELINE.md) - News pipeline architecture
- [docs/NEWS_HEALTH_MONITORING.md](./docs/NEWS_HEALTH_MONITORING.md) - Health monitoring

### Advisory System
- [docs/ISA_First_Advisory_Report_GS1NL.md](./docs/ISA_First_Advisory_Report_GS1NL.md) - First advisory report
- [docs/ADVISORY_METHOD.md](./docs/ADVISORY_METHOD.md) - Advisory methodology

### Agent Collaboration
- [docs/MANUS_BEST_PRACTICES_FOR_ISA.md](./docs/MANUS_BEST_PRACTICES_FOR_ISA.md) - Best practices
- [docs/ISA_AGENT_COLLABORATION.md](./docs/ISA_AGENT_COLLABORATION.md) - Collaboration framework

---

## Security

**Security Policy:** See [SECURITY.md](https://github.com/GS1-ISA/isa/blob/main/SECURITY.md) in GitHub repository

**Key Security Measures:**
- No secrets committed to repository
- Least-privilege access patterns
- Fine-grained authentication tokens
- Secret scanning enabled (org-level)
- Dependabot alerts enabled (org-level)
- Push protection enabled (org-level)

**Reporting Security Issues:**
- Email: security@gs1.nl (placeholder - update with real contact)
- Do NOT open public issues for security vulnerabilities

---

## Contributing

**⚠️ GOVERNANCE REQUIREMENT:** All contributions are subject to ISA governance framework.

**Before Contributing:**
1. Read [ISA_GOVERNANCE.md](./ISA_GOVERNANCE.md)
2. Understand current governance mode (Lane C)
3. Follow mandatory escalation format for all Lane C triggers
4. Ensure all changes comply with red-line principles

**Contribution Workflow:**
1. Fork repository (or create branch if you have write access)
2. Create feature branch (feature/your-feature-name)
3. Make changes following governance requirements
4. Write tests for new functionality
5. Ensure all tests pass (pnpm test)
6. Ensure TypeScript compiles (pnpm tsc)
7. Commit with conventional commit messages
8. Push to GitHub
9. Open pull request
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

**⚠️ GOVERNANCE ESCALATION REQUIRED:** Licensing decisions require user approval under Lane C.

---

## Contact

**Project Owner:** GS1 Netherlands  
**Development Agent:** Manus AI  
**Governance Steward:** ISA Executive Steward

**Repository:** https://github.com/GS1-ISA/isa  
**Issues:** https://github.com/GS1-ISA/isa/issues

---

## Acknowledgments

**Data Sources:**
- EFRAG (European Financial Reporting Advisory Group)
- EUR-Lex (EU Publications Office)
- GS1 Global Office
- GS1 Netherlands
- GS1 Europe
- European Commission

**Technology Partners:**
- Manus (hosting and AI infrastructure)
- OpenAI (LLM and embeddings)
- GitHub (version control and CI/CD)

---

**Last Updated:** 2025-12-17  
**Governance Mode:** Lane C (User-Decision Mode)  
**Status:** Active Development

For governance questions or escalations, refer to [ISA_GOVERNANCE.md](./ISA_GOVERNANCE.md).
