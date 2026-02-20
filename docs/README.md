# ISA Documentation Index

- Repository tree: [/REPO_TREE.md](/REPO_TREE.md)


**Intelligent Standards Architect (ISA)** - Compliance Intelligence Platform  
**Last Updated:** December 4, 2025

---

## 📋 Project Status & Planning

| Document                                       | Status     | Description                                                     | Last Updated |
| ---------------------------------------------- | ---------- | --------------------------------------------------------------- | ------------ |
| **[STATUS.md](./STATUS.md)**                   | ✅ Current | Single source of truth for project status, metrics, and roadmap | Dec 4, 2025  |
| **[CHANGELOG.md](./CHANGELOG.md)**             | ✅ Current | Partner-facing progress tracking and release notes              | Dec 4, 2025  |
| **[GS1_DATA_MODELS.md](./GS1_DATA_MODELS.md)** | ✅ Current | Comprehensive GS1 standards integration inventory               | Dec 4, 2025  |

---

## 🏗️ Architecture & Design

| Document                                 | Status          | Description                                           | Last Updated |
| ---------------------------------------- | --------------- | ----------------------------------------------------- | ------------ |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | 🔄 Needs Update | System design, data flows, and technical architecture | Outdated     |

**Recommended Update:** Refresh architecture diagram with current implementation state (3-sector GS1 integration, vector embeddings, automation pipelines)

---

## 🔬 Research & Analysis

| Document                                               | Status     | Description                                             | Last Updated |
| ------------------------------------------------------ | ---------- | ------------------------------------------------------- | ------------ |
| **[eurlex_research.md](./eurlex_research.md)**         | ✅ Current | EUR-Lex API research and CELLAR SPARQL connector design | Dec 4, 2025  |
| **[efrag_xbrl_research.md](./efrag_xbrl_research.md)** | ✅ Current | EFRAG XBRL taxonomy research and parser design          | Dec 4, 2025  |

---

## 📊 Quick Stats (as of Dec 4, 2025)

### Data Coverage

- **Regulations:** 38 (CSRD, ESRS, PPWR, DPP, EUDR, EU Taxonomy)
- **GS1 Standards:** 60 (GTIN, GLN, EPCIS, Digital Link, Web Vocabulary)
- **GS1 Attributes:** 3,668 across 3 sectors (Food/H&B, DIY/Garden/Pet, Healthcare)
- **GS1 Web Vocabulary:** 608 terms (75 DPP, 16 ESRS, 45 EUDR relevant)
- **ESRS Datapoints:** 2,074 (ESRS 1 & 2)
- **Attribute Mappings:** 625 (regulation-to-attribute links)
- **Vector Embeddings:** 98 (regulations + standards)

### Features

- ✅ ESG Hub (regulation browser)
- ✅ GS1 Standards Registry
- ✅ Ask ISA (RAG with vector search, 0.6s avg)
- ✅ GS1 Attribute Mapper (regulation → data fields)
- ✅ Weekly EUR-Lex auto-ingestion (CELLAR)
- ✅ Quarterly EFRAG XBRL sync
- 🚧 Cron monitoring dashboard (Phase 42)
- 🚧 ESRS IG3 datapoints (Phase 42)
- 📋 EPCIS event templates (Phase 43)
- 📋 User auth & personalization (Phase 44)

---

## 🎯 Current Phase: Phase 42

**Focus:** Documentation & Feature Gap Closure

**Priorities:**

1. ✅ Documentation master index (STATUS.md, CHANGELOG.md, GS1_DATA_MODELS.md)
2. 🚧 GS1 Attribute Mapper v0.1 operationalization
3. 🚧 ESRS IG3 datapoint ingestion
4. 🚧 Cron reliability hardening + monitoring dashboard

---

## 🔗 External References

### GS1 Standards

- [GS1 Web Vocabulary](https://www.gs1.org/voc/)
- [GS1 Digital Link](https://www.gs1.org/standards/gs1-digital-link)
- [EPCIS 2.0](https://www.gs1.org/standards/epcis)
- [GS1 Global Data Model](https://www.gs1.org/standards/gdm)

### EU Regulations

- [EUR-Lex](https://eur-lex.europa.eu/)
- [EFRAG ESRS](https://www.efrag.org/en/projects/esrs)
- [CSRD](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022L2464)
- [PPWR](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1252)

---

## 📞 Contact & Support

**Project Owner:** GS1 Netherlands  
**Development Platform:** Manus AI  
**Repository:** `/home/ubuntu/isa_web/`  
**Documentation:** `/home/ubuntu/isa_web/docs/`

---

## 📝 Documentation Guidelines

### When to Update

- **STATUS.md:** After each phase completion or significant milestone
- **CHANGELOG.md:** After each checkpoint (version release)
- **GS1_DATA_MODELS.md:** When new GS1 standards or data models are integrated
- **ARCHITECTURE.md:** When system design changes (new components, data flows)

### Status Badges

- ✅ **Current:** Up-to-date and accurate
- 🔄 **Needs Update:** Contains outdated information
- 📋 **Planned:** Not yet created but documented in roadmap
- 🚧 **In Progress:** Being actively developed

### Versioning

- **Major version (X.0):** Significant architectural changes or feature additions
- **Minor version (X.Y):** Incremental updates, bug fixes, content additions

---

**Last Review:** December 4, 2025  
**Next Review:** After Phase 42 completion

## Ask ISA quick links

- Runbook: `docs/governance/ASK_ISA_SMOKE_RUNBOOK.md`
- Smoke script: `scripts/probe/ask_isa_smoke.py`
- Ask ISA spec: `docs/spec/ASK_ISA.md`
- Contract: `docs/spec/ASK_ISA/RUNTIME_CONTRACT.md`
- Planning: `docs/planning/NEXT_ACTIONS.json`
- Repo tree: `REPO_TREE.md`
