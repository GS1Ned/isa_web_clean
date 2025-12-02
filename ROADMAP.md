# ISA Development Roadmap

**Last Updated:** December 2, 2025  
**Current Version:** 6a030890  
**Status:** Active Development

---

## Vision

Transform ISA into the **leading platform for EU sustainability compliance intelligence**, enabling organizations to instantly understand which GS1 standards and data attributes are required for compliance with rapidly evolving EU regulations.

---

## Current Status (December 2025)

### ✅ Completed Features

**Core Platform:**
- React 19 + Tailwind 4 + tRPC 11 full-stack application
- TiDB database with 12 tables and comprehensive schema
- Manus OAuth authentication with role-based access control
- Responsive design with shadcn/ui components
- Site-wide disclaimer banner (non-official GS1 publication warning)

**ESG Hub:**
- 35 EU regulations with AI-enhanced descriptions
- Regulation detail pages with ESRS datapoint mappings
- Category and status filtering
- External links to EUR-Lex and official sources

**GS1 Standards:**
- 60 GS1 standards catalog (GTIN, GLN, Digital Link, EPCIS, etc.)
- Category-based organization
- Technical specifications and applicability documentation

**ESRS Datapoints:**
- 1,184 EFRAG disclosure requirements
- 449 AI-generated regulation→datapoint mappings
- Mandatory/voluntary classification
- Implementation phase tracking

**Dutch Initiatives:**
- 10 national compliance programs
- Sector filtering (Textiles, Healthcare, Construction, Packaging)
- Integration with EU regulations and GS1 standards
- Detail pages with compliance requirements

**Ask ISA - RAG-Powered Q&A:**
- Natural language question interface
- LLM-based semantic search (155 unique knowledge chunks)
- Source citations with relevance scores
- Conversation history and follow-up questions
- Admin knowledge base manager with one-click generation

**Admin Panel:**
- Knowledge base statistics dashboard
- Embedding generation per source type
- Progress tracking and error reporting
- Analytics and monitoring (planned)

---

## Roadmap Overview

```
Q4 2024 (Completed)
├─ Core platform development
├─ ESG Hub with regulations and standards
├─ ESRS datapoints integration
├─ Dutch initiatives
└─ Ask ISA RAG system

Q1 2025 (In Progress)
├─ Platform stabilization
├─ Documentation (ARCHITECTURE, DATA_MODEL, INGESTION, DATASET_INVENTORY)
├─ EUR-Lex auto-ingestion pipeline
└─ EFRAG XBRL parser

Q2 2025 (Planned)
├─ Automated data pipelines
├─ Change monitoring and alerts
├─ Conversation history sidebar
└─ Export to PDF

Q3 2025 (Planned)
├─ Digital Product Passport integration
├─ Multi-language support
└─ Public API

Q4 2025 (Planned)
├─ Blockchain verification
├─ Advanced analytics
└─ Enterprise features
```

---

## Q1 2025: Stabilization & Automation

**Goal:** Transform ISA from manual prototype to automated production platform

### 1. Platform Stabilization ✅ IN PROGRESS

**Status:** 80% complete

- [x] Fix console errors and clean up dead code
- [x] Create comprehensive architecture documentation
- [x] Document data model and database schema
- [x] Document ingestion flows and dataset inventory
- [x] Create roadmap and maintenance plan
- [ ] Write unit tests for critical paths
- [ ] Set up error monitoring and logging
- [ ] Implement health check endpoints

**Priority:** 🔴 Critical  
**ETA:** December 15, 2024

---

### 2. EUR-Lex Auto-Ingestion Pipeline

**Goal:** Automatically discover and ingest new EU sustainability regulations

**Features:**
- Weekly cron job querying EUR-Lex API
- CELEX format parser for regulation metadata
- LLM-enhanced description generation
- Duplicate detection by CELEX number
- Admin notification of new regulations

**Technical Approach:**
- Use EUR-Lex REST API (https://eur-lex.europa.eu/content/help/data-reuse/webservice.html)
- Query categories: Environment (15.10), Social (05), Consumer (15.20)
- Store raw XML for audit trail
- Generate AI summaries using Manus Forge LLM

**Priority:** 🟡 High  
**ETA:** January 31, 2025

---

### 3. EFRAG XBRL Parser

**Goal:** Auto-update ESRS datapoints when EFRAG releases new taxonomy versions

**Features:**
- Quarterly check for new XBRL taxonomy releases
- Parse XBRL XML structure to extract datapoints
- Diff detection (new, modified, deprecated datapoints)
- Update knowledge base automatically
- Admin notification of taxonomy changes

**Technical Approach:**
- Monitor EFRAG website for taxonomy ZIP files
- Use XML parser to extract datapoint metadata
- Compare with existing records using datapointId
- Mark deprecated datapoints instead of deleting

**Priority:** 🟡 High  
**ETA:** February 28, 2025

---

### 4. Knowledge Base Optimization

**Goal:** Improve Ask ISA answer quality and relevance

**Features:**
- Migrate to vector embeddings when Manus adds API
- Implement hybrid search (keyword + semantic)
- Add user feedback mechanism (thumbs up/down)
- Track answer quality metrics
- A/B test different prompts

**Technical Approach:**
- Replace LLM scoring with proper vector embeddings
- Use cosine similarity for fast retrieval
- Store user feedback in database
- Analyze feedback to improve prompts

**Priority:** 🟢 Medium  
**ETA:** March 31, 2025

---

## Q2 2025: Automation & UX Enhancements

### 5. Change Monitoring & Alerts

**Goal:** Notify users of regulation amendments and compliance deadline changes

**Features:**
- Track EUR-Lex for regulation amendments
- Detect changes in effective dates and applicability
- User subscription to specific regulations
- Email/in-app notifications of changes
- Change history timeline

**Priority:** 🟡 High  
**ETA:** April 30, 2025

---

### 6. Conversation History Sidebar

**Goal:** Enable users to resume previous Ask ISA sessions

**Features:**
- Persistent conversation list in Ask ISA interface
- Search conversations by title or content
- Delete old conversations
- Share conversation links
- Export conversations to PDF

**Priority:** 🟢 Medium  
**ETA:** May 15, 2025

---

### 7. Export to PDF

**Goal:** Generate professional compliance reports from Ask ISA answers

**Features:**
- "Export Answer" button on each Q&A exchange
- PDF includes question, answer, and source citations
- Branded header with ISA logo and disclaimer
- Table of contents for multi-question exports
- Downloadable and shareable

**Priority:** 🟢 Medium  
**ETA:** May 31, 2025

---

### 8. Advanced Filtering

**Goal:** More targeted Ask ISA searches

**Features:**
- Source type filters (Regulations only, Standards only, etc.)
- Date range filters (regulations effective after X date)
- Mandatory vs. voluntary ESRS datapoints
- Sector-specific filtering for Dutch initiatives

**Priority:** 🟢 Medium  
**ETA:** June 30, 2025

---

## Q3 2025: Advanced Features

### 9. Digital Product Passport (DPP) Integration

**Goal:** Enable DPP creation and verification using GS1 Digital Link

**Features:**
- DPP template generator based on regulation requirements
- GS1 Digital Link QR code generation
- Blockchain-backed verification (IPFS + Ethereum)
- Product attribute mapping to ESRS datapoints
- Compliance checklist per product

**Priority:** 🟡 High  
**ETA:** September 30, 2025

---

### 10. Multi-Language Support

**Goal:** Translate regulations and standards to Dutch, German, French

**Features:**
- Language selector in navigation
- Translate regulation descriptions using LLM
- Translate Ask ISA answers
- Preserve source citations in original language
- Support for EU official languages

**Priority:** 🟢 Medium  
**ETA:** September 30, 2025

---

### 11. Public API

**Goal:** Enable third-party integrations

**Features:**
- REST API for regulations, standards, ESRS datapoints
- GraphQL endpoint for complex queries
- API key authentication
- Rate limiting and usage tracking
- Developer documentation

**Priority:** 🟢 Medium  
**ETA:** September 30, 2025

---

## Q4 2025: Enterprise & Scale

### 12. Blockchain Verification

**Goal:** Immutable audit trail for compliance claims

**Features:**
- Store compliance attestations on blockchain
- IPFS for large documents (DPPs, reports)
- Ethereum smart contracts for verification
- QR code linking to blockchain records
- Public verification portal

**Priority:** 🔵 Low  
**ETA:** December 31, 2025

---

### 13. Advanced Analytics

**Goal:** Insights into compliance trends and gaps

**Features:**
- Dashboard showing regulation adoption rates
- Gap analysis: company data vs. ESRS requirements
- Benchmark against industry peers
- Predictive analytics for upcoming regulations
- Compliance readiness score

**Priority:** 🟢 Medium  
**ETA:** December 31, 2025

---

### 14. Enterprise Features

**Goal:** Support large organizations with complex needs

**Features:**
- Multi-tenant architecture (separate workspaces)
- Team collaboration (shared Q&A, comments)
- Custom regulation tracking lists
- Bulk data import/export
- SSO integration (SAML, OIDC)

**Priority:** 🔵 Low  
**ETA:** December 31, 2025

---

## Backlog (Future Considerations)

### Data Expansion
- [ ] Add 100+ more EU regulations
- [ ] Integrate ISO 14000 series standards
- [ ] Add CDP, GRI, SASB frameworks
- [ ] Include national regulations (UK, US, China)
- [ ] Sector-specific deep dives (textiles, food, electronics)

### UX Improvements
- [ ] Interactive compliance wizard
- [ ] Regulation comparison tool (side-by-side)
- [ ] Visual timeline of regulation deadlines
- [ ] Customizable dashboard widgets
- [ ] Mobile app (iOS/Android)

### AI Enhancements
- [ ] Fine-tune LLM on compliance domain
- [ ] Automated regulation summarization
- [ ] Predictive compliance risk scoring
- [ ] Natural language report generation
- [ ] Chatbot for guided compliance

### Integrations
- [ ] ERP integration (SAP, Oracle)
- [ ] PLM integration (product data)
- [ ] Sustainability platforms (CDP, EcoVadis)
- [ ] Supply chain platforms (TradeLens, IBM Food Trust)
- [ ] Certification bodies (B Corp, Fair Trade)

---

## Success Metrics

### Platform Health
- **Uptime:** >99.5%
- **Response Time:** <500ms (p95)
- **Error Rate:** <0.1%
- **Test Coverage:** >80%

### Data Quality
- **Regulation Coverage:** 100+ EU regulations by end of 2025
- **Mapping Accuracy:** >90% AI-generated mappings validated
- **Data Freshness:** <30 days lag from official sources
- **Knowledge Base Coverage:** >90% of unique concepts

### User Engagement
- **Ask ISA Usage:** 1,000+ questions/month by Q4 2025
- **Answer Quality:** >4.0/5.0 average rating
- **Return Users:** >50% monthly active users
- **Session Duration:** >5 minutes average

### Business Impact
- **User Acquisition:** 500+ registered users by end of 2025
- **Enterprise Customers:** 10+ paying organizations
- **API Usage:** 10,000+ API calls/month
- **Revenue:** €50,000 ARR by end of 2025

---

## Risk Management

### Technical Risks
- **Manus API Limitations:** LLM scoring slower than vector embeddings
  - **Mitigation:** Migrate to vector DB when API available
- **Database Scalability:** TiDB may struggle at 100,000+ knowledge chunks
  - **Mitigation:** Implement caching and partitioning
- **LLM Costs:** High token usage for Ask ISA
  - **Mitigation:** Cache responses, optimize prompts

### Data Risks
- **Regulation Changes:** EUR-Lex structure may change
  - **Mitigation:** Robust parser with fallback to manual
- **EFRAG Taxonomy Updates:** Breaking changes in XBRL format
  - **Mitigation:** Version tracking and migration scripts
- **Data Quality:** AI-generated mappings may be inaccurate
  - **Mitigation:** Manual review, user feedback, validation

### Business Risks
- **Competition:** Other platforms may launch similar features
  - **Mitigation:** Focus on GS1 integration as unique differentiator
- **Regulatory Changes:** EU may restrict AI use in compliance
  - **Mitigation:** Maintain human-in-the-loop validation
- **User Adoption:** Low engagement with Ask ISA
  - **Mitigation:** User research, UX improvements, marketing

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Dec 1, 2024 | Use LLM scoring instead of vector embeddings | Manus Forge API doesn't support embeddings endpoint |
| Dec 2, 2024 | Add site-wide disclaimer banner | Legal protection for non-official GS1 status |
| Dec 2, 2024 | Create comprehensive documentation | Enable autonomous development and maintenance |
| Dec 2, 2024 | Prioritize EUR-Lex automation in Q1 2025 | Highest ROI for data freshness |

---

## Contact

**Product Owner:** GS1 Netherlands  
**Development Team:** Manus AI Platform  
**Roadmap Maintainer:** ISA Development Team  
**Last Update:** December 2, 2025

---

## Contributing

This roadmap is a living document. Priorities may shift based on:
- User feedback and feature requests
- Regulatory changes and compliance deadlines
- Technical constraints and opportunities
- Business goals and resource availability

**Update Frequency:** Monthly review, quarterly major revisions
