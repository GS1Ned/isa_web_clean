# External GS1 / ESG Repositories (Archive 2)

This document catalogues the external GS1 / ESG–related repositories contained in `Archive 2.zip` and explains their relevance to ISA.

Each entry includes:
- Standards and regulations it relates to
- Role within ISA (reference, ingestion candidate, test-case source)
- Priority for future work

## WebVoc (GS1 Web Vocabulary)

- Source: `Archive 2/WebVoc-master.zip`
- Standards: GS1 Web Vocabulary, GS1 Digital Link
- Main contents:
  - GS1 Web Vocabulary terms (classes, properties, code lists, link types)
  - JSON-LD / RDF/Turtle vocab definitions
- ISA relevance:
  - Canonical semantic model for many GS1 concepts and link types that ISA will refer to in DPP, EUDR, and other ESG contexts.
  - Basis for modelling Digital Link payload semantics and knowledge-graph structures.
- Role:
  - `semantic_reference`
  - Potential future ingestion target (KG bootstrapping, link-type catalogue)
- Priority: **HIGH**

## vc-data-model-verifier

- Source: `Archive 2/vc-data-model-verifier-main.zip`
- Standards: GS1 Verifiable Credentials (VC), decentralized identifiers
- Main contents:
  - Code for verifying that GS1 VCs conform to GS1 VC data models.
  - Rules / configuration for VC validation.
- ISA relevance:
  - Shows how GS1 expects VCs to be validated against published data models.
  - Useful if ISA later ingests VCs as evidence for ESG claims.
- Role:
  - `validation_reference`
  - `test_case_source` (VC payloads and rule examples)
- Priority: **MEDIUM–HIGH**

## VC-Data-Model

- Source: `Archive 2/VC-Data-Model-main.zip`
- Standards: GS1 Verifiable Credentials
- Main contents:
  - Data models / JSON Schemas for GS1 Verifiable Credentials.
- ISA relevance:
  - Canonical definitions for GS1 VC structures.
  - Potential mapping bridge between VC fields and ESRS / GS1 attributes.
- Role:
  - `schema_reference`
  - Possible future ingestion for VC schema catalogue.
- Priority: **MEDIUM–HIGH**

## TDS (Tag Data Standard tools)

- Source: `Archive 2/TDS-main.zip`
- Standards: GS1 Tag Data Standard (TDS)
- Main contents:
  - Utilities/tools related to GS1 Tag Data Standard that are not covered by TDT.
- ISA relevance:
  - Technical reference for encoding/decoding identifiers carried on tags.
  - Helpful if ISA ever needs to translate between tag-level encodings and higher-level identifiers.
- Role:
  - `technical_reference`
- Priority: **MEDIUM**

## moduleCount

- Source: `Archive 2/moduleCount-main.zip`
- Standards: Barcode / symbol layout (indirect)
- Main contents:
  - Small JS/HTML/CSS utility (likely about module counts / visual barcode aspects).
- ISA relevance:
  - Minor; potential reference for barcode visualization or demonstration.
- Role:
  - `low_priority_reference`
- Priority: **LOW**

## linkset

- Source: `Archive 2/linkset-master.zip`
- Standards: GS1 Digital Link
- Main contents:
  - Example linksets in JSON-LD.
  - Demo material for GS1 Digital Link linkset usage.
- ISA relevance:
  - Very relevant for how to publish ESG/DPP information as linksets attached to identifiers.
  - Informative for designing ISA's Digital Link/DPP export mechanisms.
- Role:
  - `pattern_reference`
  - `test_case_source` for linksets
- Priority: **HIGH**

## interpretGS1scan

- Source: `Archive 2/interpretGS1scan-master.zip`
- Standards: GS1 barcodes, GS1 Digital Link
- Main contents:
  - JavaScript library to interpret various GS1 scan inputs (AIs, GS1 keys, Digital Link URIs).
- ISA relevance:
  - Strong reference for ingest-side parsing of identifiers entered or scanned by users.
  - Provides edge cases and example inputs for ISA's identifier normalization.
- Role:
  - `parsing_reference`
  - `test_case_source`
- Priority: **HIGH**

## GS1DL-resolver-testsuite

- Source: `Archive 2/GS1DL-resolver-testsuite-master.zip`
- Standards: GS1 Digital Link
- Main contents:
  - Test suite for GS1 Digital Link resolvers.
  - PHP-based testing harness and test cases.
- ISA relevance:
  - Reference test cases for Digital Link resolution correctness.
  - Valuable if ISA or an associated service interacts with or implements a resolver.
- Role:
  - `conformance_test_reference`
- Priority: **MEDIUM–HIGH**

## GS1DigitalLinkToolkit.js

- Source: `Archive 2/GS1DigitalLinkToolkit.js-master.zip`
- Standards: GS1 Digital Link
- Main contents:
  - JavaScript toolkit to transform GS1 identifiers/element strings into Digital Link URIs.
- ISA relevance:
  - Clear patterns and examples for Digital Link URI construction.
  - Good sanity check / test-reference for ISA's own Digital Link utilities.
- Role:
  - `generation_reference`
  - `test_case_source`
- Priority: **HIGH**

## gs1-syntax-engine

- Source: `Archive 2/gs1-syntax-engine-main.zip`
- Standards: GS1 Barcode Syntax
- Main contents:
  - GS1 Barcode Syntax Engine (C and other language bindings).
  - Reference implementation of GS1 syntax processing for AIs and Digital Link.
- ISA relevance:
  - Canonical behavioral reference for Application Identifier and syntax validation.
  - Ideal source for designing ISA's data-quality and AI-validation modules.
- Role:
  - `validation_reference`
  - Potential `ingestion_candidate` together with Syntax Dictionary.
- Priority: **HIGH**

## gs1-syntax-dictionary

- Source: `Archive 2/gs1-syntax-dictionary-main.zip`
- Standards: GS1 Barcode Syntax (Application Identifiers)
- Main contents:
  - Machine-readable dictionary of all GS1 Application Identifiers and syntax rules.
- ISA relevance:
  - Highly ingestible data describing every AI: lengths, format, semantics.
  - Can be mapped into `validation_rules` / `ai_definitions` tables inside ISA.
- Role:
  - `ingestion_candidate` (structured dictionary)
  - `schema_reference`
- Priority: **HIGH**

## gs1-digital-link-uri-simple-parser

- Source: `Archive 2/gs1-digital-link-uri-simple-parser-main.zip`
- Standards: GS1 Digital Link
- Main contents:
  - Simple parser for Digital Link URIs.
- ISA relevance:
  - Additional parsing patterns and tests to cross-check ISA's Digital Link parsing logic.
- Role:
  - `parsing_reference`
  - `test_case_source`
- Priority: **MEDIUM**

## GS1_DigitalLink_Resolver_CE

- Source: `Archive 2/GS1_DigitalLink_Resolver_CE-master.zip`
- Standards: GS1 Digital Link
- Main contents:
  - Reference Digital Link resolver implementation ("CE").
- ISA relevance:
  - End-to-end reference for how a resolver behaves and how linksets are served.
- Role:
  - `architecture_reference`
  - `conformance_reference`
- Priority: **MEDIUM**

## gmn-helpers

- Source: `Archive 2/gmn-helpers-master.zip`
- Standards: GS1 Global Model Number (GMN)
- Main contents:
  - Helper scripts / utilities for GMN generation/validation.
- ISA relevance:
  - Relevant if ISA expands to GMN-based product models.
- Role:
  - `identifier_reference`
  - `test_case_source`
- Priority: **MEDIUM**

## GDSN Legacy v3.1.31

- Source: `Archive 2/GDSN Legacy v3.1.31.zip`
- Standards: GDSN v3.1.31
- Main contents:
  - Legacy GDSN dataset (classes, attributes, rules).
- ISA relevance:
  - Historical reference snapshot; useful for:
    - Backward compatibility,
    - Version comparison versus current GDSN.
- Role:
  - `historical_reference`
- Priority: **LOW–MEDIUM**

## Flex Schema

- Source: `Archive 2/Flex Schema.zip`
- Standards: Generic schema pattern (not strictly GS1-only)
- Main contents:
  - Lightweight schema definitions (JSON/YAML).
- ISA relevance:
  - Example patterns for schema modularization and flexibility.
- Role:
  - `pattern_reference`
- Priority: **LOW**

## EUDR-tool

- Source: `Archive 2/EUDR-tool-main.zip`
- Standards / Regulations: EUDR (European Union Deforestation Regulation), GS1 Web Vocabulary
- Main contents:
  - Tool to generate EUDR notifications using GS1 Web Vocabulary.
- ISA relevance:
  - Very important example of a regulation-specific tool built on GS1 vocab.
  - Offers concrete patterns for mapping supply-chain data to EUDR requirements via WebVoc.
- Role:
  - `pattern_reference`
  - `test_case_source` for EUDR modules
- Priority: **HIGH**

## EPCIS

- Source: `Archive 2/EPCIS-master.zip`
- Standards: EPCIS, CBV
- Main contents:
  - EPCIS/CBV examples, RDF diagrams, XSL tools for EPCIS 1.2/2.0 conversions.
- ISA relevance:
  - Rich material for traceability modelling and EPCIS event semantics.
  - Good example events and transformations for ISA's traceability and validation modules.
- Role:
  - `traceability_reference`
  - `test_case_source`
- Priority: **HIGH**

## digital-link.js

- Source: `Archive 2/digital-link.js-master.zip`
- Standards: GS1 Digital Link
- Main contents:
  - JavaScript library (by Digimarc) for generating and validating Digital Link URIs.
- ISA relevance:
  - Independent implementation to cross-check ISA's DL logic.
  - Provides additional examples and edge cases.
- Role:
  - `generation_reference`
  - `validation_reference`
- Priority: **HIGH**

## Digital-Template-to-XBRL-Converter

- Source: `Archive 2/Digital-Template-to-XBRL-Converter-main.zip`
- Standards / Regulations: EFRAG ESRS, XBRL
- Main contents:
  - Excel-to-XBRL converter for the VSME Digital Template (ESG reporting).
- ISA relevance:
  - Shows how ESRS-aligned templates are mapped to XBRL.
  - Useful reference for ISA's future XBRL export strategy and ESRS alignment.
- Role:
  - `esg_reference`
  - `export_pattern_reference`
- Priority: **HIGH**

---

## Summary Statistics

**Total repositories:** 20

**By Priority:**
- HIGH: 11 repositories
- MEDIUM-HIGH: 3 repositories
- MEDIUM: 4 repositories
- LOW-MEDIUM: 1 repository
- LOW: 1 repository

**By Role:**
- Reference (semantic, validation, parsing, generation, etc.): 18
- Ingestion candidates: 2 (gs1-syntax-dictionary, WebVoc link types)
- Test case sources: 10

**By Standard/Regulation:**
- GS1 Digital Link: 9 repositories
- GS1 Web Vocabulary: 2 repositories
- EPCIS/CBV: 1 repository
- GDSN: 1 repository
- ESRS/XBRL: 1 repository
- EUDR: 1 repository
- GS1 Verifiable Credentials: 2 repositories
- Other GS1 standards: 3 repositories

---

## Usage Guidelines

1. **Discovery:** Use the machine-readable index (`data/metadata/external_repos_archive2.json`) to filter repositories by standard, regulation, role, or priority.

2. **On-demand extraction:** The archive is stored at `data/external/Archive_2.zip`. Extract specific repositories only when needed for a task.

3. **Ingestion planning:** When defining new INGEST-XX tasks based on these repositories, reference the repository ID from the JSON index in the task specification.

4. **Reference usage:** When implementing features (Digital Link, EPCIS, DPP, validation), consult relevant repositories for patterns, test cases, and conformance checks.

5. **Future expansion:** As ISA evolves, additional repositories may be added to this archive. Update both this catalogue and the JSON index accordingly.

---

**Last updated:** December 11, 2025  
**Archive location:** `data/external/Archive_2.zip` (63 MB)  
**Index location:** `data/metadata/external_repos_archive2.json`
