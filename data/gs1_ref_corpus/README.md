# GS1 Reference Corpus

**Source:** https://ref.gs1.org/sitemap.xml  
**Crawl Date:** 2025-12-15  
**Total Documents:** 372

## Authority Classification

Per user instructions, documents are classified by authority level:

| Authority | Description | Document Types | Count |
|-----------|-------------|----------------|-------|
| **Authoritative** | Primary normative sources | PDF, XLSX, JSON-LD, RDF, TTL, XSD, SHACL | 123 |
| **Context** | Explanatory reference only | HTML pages | 248 |

## Directory Structure

```
gs1_ref_corpus/
├── metadata/
│   ├── metadata.jsonl      # Canonical manifest (source of truth)
│   ├── metadata.csv        # Human-readable mirror
│   └── manifest.json       # Crawl-level provenance
├── pdf/batch_001/          # Normative GS1 specification PDFs
├── xlsx/batch_001/         # Controlled vocabularies, code lists, data models
├── structured/batch_001/   # JSON-LD, RDF, TTL, XSD, SHACL artefacts
├── html_context/           # HTML pages (explanatory context only)
└── gs1_document_index.json # Processed document index
```

## Document Statistics

### By Extension
| Extension | Count | Description |
|-----------|-------|-------------|
| html | 228 | Context pages |
| json | 45 | JSON schemas and data |
| xml | 40 | XML schemas and data |
| xsd | 16 | XSD schemas |
| xlsx | 9 | Excel data models |
| jsonld | 6 | JSON-LD ontologies |
| pdf | 3 | Specification documents |
| ttl | 3 | Turtle ontologies |

### By GS1 Standard
| Standard | Count |
|----------|-------|
| General | 256 |
| TDT (Tag Data Translation) | 86 |
| EPCIS | 19 |
| EDI | 4 |
| Architecture | 2 |
| ADB (Attribute Definitions) | 2 |
| GDM (Global Data Model) | 2 |
| Application Identifiers | 1 |

## Key Authoritative Documents

### PDFs (Normative Specifications)
1. **GS1-Architecture-a-i12-2024-10-18.pdf** - GS1 System Architecture v12
2. **GS1_Architecture_Principles_i4_a_2022-06-08.pdf** - Architecture Principles v4
3. **GS1_GS1US_DiDs_VC_Whitepaper.pdf** - Decentralised Identifiers & Verifiable Credentials

### XLSX (Data Models)
1. **gs1_global_data_model_release_2.16.xlsx** - GDM v2.16
2. **GS1_Attribute_Definitions_for_Business_v2.11.xlsx** - ADB v2.11
3. **EDI_EANCOM_CL.xlsx** - EANCOM Code Lists
4. **EDI_XML_CL.xlsx** - XML Code Lists

### Structured Artefacts (Ontologies & Schemas)
1. **epcis-ontology.jsonld** / **epcis-ontology.ttl** - EPCIS 2.0 Ontology
2. **cbv-ontology.jsonld** / **cbv-ontology.ttl** - CBV 2.0 Ontology
3. **epcglobal-epcis-2_0.xsd** - EPCIS 2.0 XML Schema
4. **GS1_Application_Identifiers.jsonld** - AI definitions
5. **openapi.json** - EPCIS 2.0 REST API specification

## Usage Guidelines

### For RAG Ingestion
1. Use `gs1_document_index.json` to enumerate documents
2. Filter by `authority: "authoritative"` for primary sources
3. Use `sha256` field for integrity verification
4. Preserve `url` as stable identifier

### For Knowledge Graph Construction
1. Start with ontologies (`.jsonld`, `.ttl`)
2. Extract entities from data models (`.xlsx`)
3. Link to regulations via ISA mapping tables
4. Use HTML context for disambiguation only

### Do NOT
- Infer facts from HTML-only entries unless corroborated by authoritative sources
- Merge documents across batches unless URLs match exactly
- Ignore version hints in URLs and filenames

## Integrity Verification

All documents have SHA256 checksums in `metadata.jsonl`. Verify with:

```bash
sha256sum -c <(jq -r '.sha256 + "  " + .local_path' metadata.jsonl)
```

## Related ISA Datasets

This corpus complements:
- `esrs.datapoints.ig3` - ESRS datapoints for ESG→GS1 mapping
- `gs1nl.benelux.*` - GS1 NL sector data models
- `gdsn.current.*` - GDSN current release
- `eu.dpp.identification_rules` - DPP identification rules
