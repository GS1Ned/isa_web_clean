# ISA Data Needs, Priorities & Development Challenges

**Generated:** 2025-12-15  
**Status:** Pre-delivery assessment for ISA MVP

---

## Executive Summary

ISA currently has **72 database tables** and **~6,000 ingested records** across ESRS, GDSN, CTEs/KDEs, DPP, and CBV datasets. The GS1 Reference Corpus adds 372 documents (41 authoritative). However, critical gaps remain in **ESRS-to-GS1 mapping completeness**, **sector-specific guidance**, and **RAG pipeline infrastructure** for Ask ISA.

---

## Part 1: Documents & Datasets Needed Most Urgently

### 🔴 CRITICAL (Blocking MVP Delivery)

#### 1.1 ESRS-to-GS1 Attribute Mapping Matrix
**What:** Complete mapping between 1,175 ESRS datapoints and GS1 GDSN/ADB attributes  
**Why:** Core value proposition of ISA - "which GS1 attributes satisfy which ESRS requirements"  
**Current State:** Partial mappings exist but not validated or complete  

**Preferred Format:**
```json
{
  "esrs_datapoint_id": "E1-6_01",
  "esrs_datapoint_name": "Scope 1 GHG emissions",
  "gs1_attribute_ids": ["carbonFootprintValue", "carbonFootprintUnit"],
  "mapping_confidence": "HIGH|MEDIUM|LOW",
  "mapping_rationale": "Direct semantic match",
  "gaps": ["No GS1 attribute for verification methodology"],
  "source_document": "GS1 EU PCF Guideline v1.0"
}
```

**Metadata Required:**
- `mapping_id` (unique identifier)
- `esrs_standard` (E1, E2, S1, etc.)
- `gs1_standard` (GDSN, ADB, EPCIS)
- `validation_status` (draft, reviewed, approved)
- `last_updated` (ISO date)
- `author` (who created/validated)

---

#### 1.2 GS1 NL Sector-Specific Implementation Guides
**What:** Official GS1 NL guidance for DIY/Garden, FMCG, Healthcare sectors  
**Why:** ISA serves GS1 NL users who need sector-specific recommendations  
**Current State:** Have data models, missing implementation guidance  

**Preferred Format:** PDF or structured Markdown with:
```yaml
sector: "DIY/Garden"
regulation: "ESPR/DPP"
gs1_standards_applicable:
  - standard: "GDSN"
    attributes: ["materialComposition", "recyclability"]
    implementation_notes: "..."
  - standard: "EPCIS"
    events: ["ObjectEvent", "TransformationEvent"]
timeline:
  - milestone: "DPP pilot"
    date: "2026-Q2"
```

**Metadata Required:**
- `sector_code` (DIY, FMCG, HEALTHCARE, etc.)
- `regulation_ids` (link to regulations table)
- `gs1_standard_ids` (link to standards)
- `publication_date`
- `effective_date`
- `language` (NL, EN)

---

#### 1.3 EFRAG ESRS Implementation Guidance (IG-3)
**What:** Complete EFRAG Implementation Guidance for ESRS  
**Why:** Authoritative interpretation of ESRS datapoint requirements  
**Current State:** Have datapoints, missing official guidance documents  

**Preferred Format:** PDF + structured extraction as JSON:
```json
{
  "guidance_id": "IG3-E1-001",
  "esrs_standard": "E1",
  "disclosure_requirement": "E1-6",
  "guidance_text": "...",
  "examples": [...],
  "cross_references": ["GRI 305-1", "TCFD"]
}
```

---

### 🟠 HIGH PRIORITY (Required for Full Functionality)

#### 1.4 GS1 Digital Link Implementation Examples
**What:** Real-world examples of Digital Link URIs for DPP compliance  
**Why:** Users need concrete examples, not just specifications  
**Current State:** Have spec, missing practical examples  

**Preferred Format:**
```json
{
  "example_id": "DL-DPP-001",
  "product_category": "Batteries",
  "gtin": "01234567890123",
  "digital_link_uri": "https://id.gs1.org/01/01234567890123",
  "resolver_response": {
    "dpp_url": "https://example.com/dpp/...",
    "sustainability_info": "..."
  },
  "regulation": "Battery Regulation"
}
```

---

#### 1.5 Dutch ESG Initiative Details
**What:** Structured data on Green Deal Healthcare, Plastic Pact NL, ZES logistics  
**Why:** ISA covers Dutch/Benelux scope, not just EU  
**Current State:** Basic entries exist, missing detailed requirements  

**Preferred Format:**
```json
{
  "initiative_id": "NL-GD-HEALTHCARE",
  "name": "Green Deal Sustainable Healthcare",
  "description": "...",
  "signatories": ["..."],
  "commitments": [
    {
      "commitment_id": "GDH-001",
      "description": "50% CO2 reduction by 2030",
      "gs1_relevance": "EPCIS for supply chain visibility"
    }
  ],
  "timeline": [...],
  "source_url": "https://..."
}
```

---

#### 1.6 EUDR Due Diligence Statement Schema
**What:** Technical schema for EUDR due diligence statements  
**Why:** EUDR compliance requires geolocation + supply chain data  
**Current State:** Have basic rules, missing technical implementation  

**Preferred Format:** JSON Schema or XSD:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "EUDR Due Diligence Statement",
  "properties": {
    "operator_id": {...},
    "product_description": {...},
    "geolocation_data": {...},
    "supply_chain_actors": {...}
  }
}
```

---

### 🟡 MEDIUM PRIORITY (Enhances Quality)

#### 1.7 GS1 Web Vocabulary Complete Dump
**What:** Full RDF/JSON-LD export of gs1.org/voc  
**Why:** Enables semantic linking and knowledge graph  
**Current State:** Have partial extracts, need complete vocabulary  

**Preferred Format:** JSON-LD or Turtle (TTL)

---

#### 1.8 GDSN Release Notes & Change History
**What:** Changelog of GDSN attribute additions/changes  
**Why:** Track which attributes are new vs established  
**Current State:** Have current release, missing history  

**Preferred Format:**
```json
{
  "release": "3.1.32",
  "date": "2024-11-01",
  "changes": [
    {
      "type": "ADDED",
      "attribute": "carbonFootprintValue",
      "description": "..."
    }
  ]
}
```

---

#### 1.9 Cross-Reference Tables (GRI, TCFD, CDP)
**What:** Mappings between ESRS and other ESG frameworks  
**Why:** Many companies report to multiple frameworks  
**Current State:** Not present  

**Preferred Format:**
```json
{
  "esrs_datapoint": "E1-6_01",
  "gri_indicator": "305-1",
  "tcfd_recommendation": "Metrics a)",
  "cdp_question": "C6.1"
}
```

---

## Part 2: Task Prioritisation

### 🔴 LARGE Tasks (>1 week effort)

| Priority | Task | Effort | Impact | Blockers |
|----------|------|--------|--------|----------|
| **L1** | Build Ask ISA RAG pipeline | 2-3 weeks | Critical | Embeddings infrastructure |
| **L2** | Complete ESRS-GS1 mapping matrix | 2 weeks | Critical | Domain expertise needed |
| **L3** | Implement advisory regeneration engine | 2 weeks | High | Mapping matrix completion |
| **L4** | Build gap analysis visualisation | 1-2 weeks | High | Frontend complexity |
| **L5** | Production deployment & monitoring | 1 week | Critical | Infrastructure setup |

---

### 🟠 MEDIUM Tasks (2-5 days effort)

| Priority | Task | Effort | Impact | Dependencies |
|----------|------|--------|--------|--------------|
| **M1** | Generate embeddings for 41 authoritative docs | 3 days | High | OpenAI API |
| **M2** | Build sector-specific recommendation engine | 4 days | High | Mapping matrix |
| **M3** | Implement timeline comparison feature polish | 2 days | Medium | None |
| **M4** | Add Dutch initiative detailed content | 3 days | Medium | Data acquisition |
| **M5** | Create 30-query validation test suite | 3 days | High | Ask ISA MVP |
| **M6** | Implement news pipeline GS1 tagging | 2 days | Medium | AI processing |
| **M7** | Build compliance score calculator | 4 days | High | Mapping matrix |

---

### 🟢 SMALL Tasks (<2 days effort)

| Priority | Task | Effort | Impact | Dependencies |
|----------|------|--------|--------|--------------|
| **S1** | Fix TypeScript errors (16 current) | 4 hours | Blocking | None |
| **S2** | Add missing use-toast hook | 1 hour | Blocking | None |
| **S3** | Update README with current architecture | 4 hours | Medium | None |
| **S4** | Add loading states to all pages | 4 hours | Medium | None |
| **S5** | Implement error boundaries | 4 hours | Medium | None |
| **S6** | Add vitest coverage for mapping procedures | 1 day | High | None |
| **S7** | Create data freshness indicators | 4 hours | Low | None |
| **S8** | Add export functionality for advisories | 1 day | Medium | None |

---

## Part 3: Biggest Development Challenges to Delivery

### Challenge 1: RAG Pipeline Architecture (CRITICAL)
**Problem:** Ask ISA requires semantic search over 372+ documents with citation extraction  
**Complexity:**
- Chunking strategy for mixed document types (PDF, XLSX, JSON-LD, XSD)
- Embedding model selection and cost management
- Vector database setup (Pinecone, Weaviate, or pgvector)
- Citation extraction and source attribution
- Guardrails for out-of-scope queries

**Mitigation:**
- Start with 41 authoritative documents only
- Use OpenAI embeddings (already configured)
- Implement simple chunking first, refine later
- Build 30-query test suite for validation

---

### Challenge 2: ESRS-GS1 Mapping Completeness (CRITICAL)
**Problem:** 1,175 ESRS datapoints × hundreds of GS1 attributes = massive mapping task  
**Complexity:**
- Requires domain expertise in both ESRS and GS1
- Many mappings are partial or require interpretation
- No authoritative source for complete mapping
- Need confidence scoring and gap identification

**Mitigation:**
- Focus on E1 (Climate) and E5 (Circular Economy) first
- Use AI-assisted mapping with human validation
- Accept "PARTIAL" mappings with documented gaps
- Iterate based on user feedback

---

### Challenge 3: Multi-Regulation Timeline Coordination (HIGH)
**Problem:** CSRD, ESPR, EUDR, Battery Regulation have overlapping but different timelines  
**Complexity:**
- Milestones change frequently
- Sector-specific variations
- Dependencies between regulations
- User needs personalised views

**Mitigation:**
- Build flexible timeline data model (done)
- Implement comparison view (done)
- Add notification system for changes
- Source from official EU publications

---

### Challenge 4: Sector-Specific Recommendations (HIGH)
**Problem:** DIY/Garden, FMCG, Healthcare have different GS1 implementations  
**Complexity:**
- Different attribute sets per sector
- Different regulatory priorities
- Different maturity levels
- Limited sector-specific guidance from GS1 NL

**Mitigation:**
- Start with DIY/Garden (most complete data model)
- Use GS1 NL data models as foundation
- Generate recommendations from mapping matrix
- Validate with GS1 NL stakeholders

---

### Challenge 5: Data Freshness & Monitoring (MEDIUM)
**Problem:** Regulations and standards change; ISA must stay current  
**Complexity:**
- Multiple source systems to monitor
- No standard change notification mechanism
- Manual update process is error-prone
- Version control for advisories

**Mitigation:**
- News pipeline already monitors key sources
- Add data freshness indicators to UI
- Implement advisory versioning
- Schedule quarterly data refresh

---

### Challenge 6: Production Infrastructure (MEDIUM)
**Problem:** Moving from sandbox to production deployment  
**Complexity:**
- Database migration and scaling
- Authentication and authorization
- Performance optimization
- Monitoring and alerting

**Mitigation:**
- Manus platform handles hosting
- Use checkpoint system for rollback
- Implement health checks
- Add error tracking

---

## Part 4: Recommended Delivery Sequence

### Phase A: Foundation (Week 1-2)
1. ✅ Fix blocking TypeScript errors
2. ✅ Complete GS1 ref corpus ingestion
3. Generate embeddings for authoritative documents
4. Build basic Ask ISA query interface

### Phase B: Core Value (Week 3-4)
5. Complete E1/E5 ESRS-GS1 mappings
6. Implement gap analysis visualisation
7. Build sector recommendation engine
8. Add compliance score calculator

### Phase C: Polish (Week 5-6)
9. Implement advisory regeneration
10. Add Dutch initiative details
11. Build 30-query validation suite
12. Production deployment

---

## Part 5: Data Delivery Preferences

### Preferred Formats by Type

| Data Type | Preferred Format | Alternative | Notes |
|-----------|------------------|-------------|-------|
| Mappings | JSON/JSONL | CSV | Include confidence scores |
| Documents | PDF | Markdown | Preserve original formatting |
| Schemas | JSON Schema | XSD | Machine-readable |
| Ontologies | JSON-LD | TTL | Include @context |
| Code Lists | JSON | XLSX | Include descriptions |
| Timelines | JSON | CSV | ISO 8601 dates |

### Required Metadata for All Datasets

```json
{
  "dataset_id": "unique-identifier",
  "title": "Human-readable title",
  "description": "What this dataset contains",
  "publisher": "Organisation name",
  "version": "Semantic version or date",
  "release_date": "2025-01-15",
  "effective_date": "2025-01-15",
  "language": ["EN", "NL"],
  "license": "CC-BY-4.0 | proprietary | ...",
  "source_url": "https://...",
  "sha256": "checksum for integrity",
  "record_count": 1234,
  "schema": "JSON Schema or description",
  "update_cadence": "quarterly | annual | ad-hoc",
  "isa_domain_tags": ["ESRS", "GS1", "DPP"]
}
```

---

## Appendix: Current ISA Data Inventory

### Database Tables (72 total)
- **Core:** users, regulations, ctes, kdes, esrsDatapoints
- **GS1:** gdsnClasses, gdsnClassAttributes, cbvVocabularies, digitalLinkTypes
- **Mappings:** attributeRegulationMappings, regulationStandardMappings, cteKdeMappings
- **News:** hubNews, hubNewsHistory, newsRecommendations
- **Compliance:** complianceScores, complianceEvidence, remediationSteps
- **Analytics:** supplyChainNodes, supplyChainEdges, supplyChainRisks

### Ingested Record Counts
- ESRS Datapoints: 1,175
- GDSN Classes/Attributes: 4,293
- CTEs/KDEs: 50
- DPP Rules: 26
- CBV Vocabularies: 84
- GS1 Ref Corpus: 372 documents

### Data Directories
- `/data/gs1_ref_corpus/` - 372 documents from ref.gs1.org
- `/data/advisories/` - Generated advisory documents
- `/data/standards/` - GS1 NL sector data models
- `/data/efrag/` - ESRS source materials
- `/data/esg/` - ESG regulation documents
