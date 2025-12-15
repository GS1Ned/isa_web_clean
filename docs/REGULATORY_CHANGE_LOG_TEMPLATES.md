# Regulatory change log templates

## Purpose

This document provides canonical templates for creating entries in the ISA regulatory change log. Entries must be traceable to an authoritative source and suitable for audit, comparison and advisory regeneration.

## Scope

In scope:
- Authoritative EU and Dutch sources
- Authoritative publications from EFRAG and GS1 organisations (GS1 AISBL, GS1 in Europe, GS1 Netherlands)

Out of scope:
- News feeds, alerts and content aggregation
- Commentary without a source document
- Customer or market data

## Required fields template

Use this template for every entry.

### Canonical entry (JSON)

{
  "entryDate": "YYYY-MM-DD",
  "sourceType": "EU_DIRECTIVE | EU_REGULATION | EU_DELEGATED_ACT | EU_IMPLEMENTING_ACT | EFRAG_IG | EFRAG_QA | EFRAG_TAXONOMY | GS1_AISBL | GS1_EUROPE | GS1_NL",
  "sourceOrg": "Authoritative publisher name",
  "title": "Document title",
  "description": "What changed and why it matters",
  "url": "https://authoritative-source.example/path",
  "documentHash": "64-hex sha256 or null",
  "impactAssessment": "1–3 sentences describing likely ISA impact",
  "isaVersionAffected": "vX.Y or vX.Y.Z"
}

Required field guidance
	•	entryDate: date the log entry is created, not necessarily publication date
	•	sourceType: use controlled vocabulary only
	•	sourceOrg: use full organisation name
	•	title: include version identifier if present
	•	description: state the change, avoid speculation
	•	url: link to the canonical source page or the most direct official download page
	•	documentHash: add after downloading the source file
	•	impactAssessment: include domain tags and sectors where relevant
	•	isaVersionAffected: use semantic versioning

Optional fields patterns

Use these patterns when helpful.

Publication and effective dates

If the source is time-bound, include publication and effective dates inside description or impactAssessment.
	•	Publication date: DD Month YYYY
	•	Effective date: DD Month YYYY
	•	If unknown, state “effective date not specified”

Domain tags and sectors

Add tags and sectors inside impactAssessment using this format.
	•	Domain tags: TRACEABILITY, PCF, CIRCULARITY, PACKAGING, DEFORESTATION, DPP, ESG_REPORTING, PRODUCT_MASTER_DATA
	•	Sectors: DIY, FMCG, HEALTHCARE

Example:

impactAssessment: “Domain tags: PCF, PRODUCT_MASTER_DATA. Sectors: DIY, FMCG. Likely affects mapping coverage for Product Carbon Footprint attributes.”

Entry type templates

EU regulation or directive

{
  "entryDate": "YYYY-MM-DD",
  "sourceType": "EU_REGULATION",
  "sourceOrg": "European Commission",
  "title": "Regulation title and number, version if applicable",
  "description": "Summarise the change and its relevance to product and supply chain information requirements.",
  "url": "https://eur-lex.europa.eu/...",
  "documentHash": null,
  "impactAssessment": "Domain tags: TRACEABILITY. Sectors: DIY. Likely affects GS1 data model evolution priorities.",
  "isaVersionAffected": "v1.1"
}

EFRAG implementation guidance or Q&A

{
  "entryDate": "YYYY-MM-DD",
  "sourceType": "EFRAG_IG",
  "sourceOrg": "EFRAG",
  "title": "ESRS implementation guidance title and version",
  "description": "Summarise the guidance and any clarifications relevant to disclosures, datapoints or taxonomy.",
  "url": "https://www.efrag.org/...",
  "documentHash": null,
  "impactAssessment": "Domain tags: ESG_REPORTING. Sectors: DIY, FMCG, HEALTHCARE. Likely affects advisory methodology and mappings.",
  "isaVersionAffected": "v1.2"
}

GS1 publication

{
  "entryDate": "YYYY-MM-DD",
  "sourceType": "GS1_NL",
  "sourceOrg": "GS1 Netherlands",
  "title": "Publication title, release and version",
  "description": "Summarise the publication and its relevance to GS1 data models, validation rules or exchange standards.",
  "url": "https://www.gs1.nl/...",
  "documentHash": null,
  "impactAssessment": "Domain tags: PRODUCT_MASTER_DATA. Sectors: DIY. May require registry update and advisory comparison.",
  "isaVersionAffected": "v1.1"
}

Quality gates

Before accepting an entry:
	•	URL is authoritative and stable
	•	Title includes version if present
	•	Description is factual and concise
	•	documentHash is added when a file is downloaded
	•	impactAssessment includes domain tags and sectors when applicable

---

## File 2: `/docs/REGULATORY_CHANGE_LOG_ENTRY_GUIDE.md`

# Regulatory change log entry guide

## Purpose

This guide explains how to create high-quality entries in the ISA regulatory change log to support advisory regeneration, traceability and version comparison.

## What a good entry looks like

A good entry is:
- Verifiable and source-backed
- Minimal but complete
- Written for standards developers and programme leadership
- Clear about relevance to GS1 standards and sector data models

## Step-by-step workflow

1. Identify the authoritative source
- Prefer primary publishers (EUR-Lex, European Commission, EFRAG, GS1 AISBL, GS1 in Europe, GS1 Netherlands)
- Avoid third-party summaries unless they link directly to the primary source

2. Confirm version and status
- Capture the document version identifier
- If the publication is a draft or consultation, state this in description

3. Create the entry using the canonical template
- Use controlled vocabulary for sourceType
- Use British English spelling
- Keep description factual

4. Download and hash the source document when possible
- Save the file in the repository under the agreed reference location
- Compute SHA256 and store it in documentHash

5. Write the impactAssessment
- Keep to 1–3 sentences
- Use domain tags and sector identifiers
- State likely impact, not guaranteed outcomes

6. Set isaVersionAffected
- Use the next plausible ISA version milestone
- If unknown, omit or set to a placeholder that will be resolved during planning

## Common mistakes to avoid

- Linking to non-authoritative pages
- Mixing analysis into description
- Overstating certainty about future requirements
- Using inconsistent naming for sectors or domains
- Creating entries that cannot be hashed or verified

## Editorial rules

- Dates: DD Month YYYY
- Headings: sentence case
- Abbreviations: spell out on first use
- No Oxford commas

## Acceptance checklist

An entry is acceptable if:
- All required fields are present
- URL is HTTPS and authoritative
- Title includes version or identifier if available
- documentHash is present when a file exists locally
- impactAssessment includes domain tags and sectors where applicable
- Language is factual and restrained
