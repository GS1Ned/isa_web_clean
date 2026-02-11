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


⸻

File 3: /docs/ASK_ISA_QUERY_LIBRARY.md

# Ask ISA query library

## Purpose

This document provides example queries for Ask ISA (ISA query interface). Ask ISA is read-only and must answer using locked advisory artefacts and the frozen dataset registry.

## Allowed query types

- Advisory summary questions (what are the gaps, what changed, what is covered)
- Mapping lookup questions (which GS1 attributes relate to a requirement)
- Gap exploration questions (what is missing for a domain or sector)
- Recommendation lookup questions (what is recommended, by timeframe)

## Forbidden query types

- Speculation about future regulatory outcomes
- Hypothetical scenarios not grounded in locked artefacts
- Advice that is not traceable to sources
- Anything that requires customer data

## Query examples

### Advisory summary

1. "Summarise ISA_ADVISORY_v1.0 for DIY sector."
2. "List critical gaps in ISA_ADVISORY_v1.0."
3. "What regulations are covered in ISA_ADVISORY_v1.0?"
4. "Show mapping coverage percentages for ISA_ADVISORY_v1.0."

### Mappings

5. "List all mappings for sector FMCG in ISA_ADVISORY_v1.0."
6. "Show mappings with status missing for regulation EUDR."
7. "Find mappings related to domain tag PCF."
8. "List partial mappings for Healthcare."

### Gaps

9. "Show all gaps with severity critical."
10. "Which gaps relate to TRACEABILITY?"
11. "List gaps for DIY only."
12. "Show gap descriptions and linked recommendations."

### Recommendations

13. "List short-term recommendations and their linked gaps."
14. "Show medium-term recommendations for CIRCULARITY."
15. "Which recommendations address DEFORESTATION?"

## Expected answer format

Every answer must cite:
- Advisory ID and version
- Dataset registry version
- Any dataset IDs referenced
- Source artefact hashes when available

Example citation block:

- Advisory: ISA_ADVISORY_v1.0 (v1.0.0)
- Dataset registry: dataset_registry_v1.0_FROZEN.json (v1.0.0)
- Datasets referenced: esrs.datapoints.ig3, gs1nl.benelux.diy_garden_pet.v3.1.33


⸻

File 4: /docs/ASK_ISA_GUARDRAILS.md

# Ask ISA guardrails

## Purpose

Ask ISA is a controlled, read-only query interface for ISA. It answers questions using locked artefacts only and must be traceable, versioned and non-speculative.

## Hard constraints

Ask ISA must:
- Read only from locked advisory JSON and Markdown artefacts
- Validate dataset IDs against the frozen dataset registry
- Cite advisory ID, version and source artefact hashes
- Refuse questions outside advisory scope
- Use British English spelling and GS1 style rules for human-readable output

Ask ISA must not:
- Generate new analysis or new conclusions
- Introduce new datasets or sources
- Use customer data
- Provide conversational opinion
- Answer beyond the current advisory scope

## Required citations

Every response must include:
- Advisory ID and version
- Registry version
- Dataset IDs used
- Source artefact hashes when available

## Refusal patterns

If a question is out of scope, Ask ISA must respond with:
- A brief refusal
- The reason (out of scope, not in advisory, not in registry)
- The closest available in-scope alternative based on locked artefacts

## Examples of out-of-scope questions

- "What will the EU require next year for carbon labels?"
- "Can you estimate Scope 3 emissions for this product?"
- "Should GS1 NL mandate a new attribute for all sectors?"

## Examples of acceptable questions

- "List critical gaps for DIY in ISA_ADVISORY_v1.0."
- "Which recommendations address PCF in ISA_ADVISORY_v1.0?"
- "Show mappings for regulation DPP and sector FMCG."


⸻

File 5: /docs/GS1_STYLE_QUICK_REFERENCE.md

# GS1 style quick reference

## Purpose

This is a quick reference for applying GS1 Style Guide Release 5.6 to ISA human-readable outputs.

## Applies to

Applies to:
- Advisory reports
- Governance documents
- Guidance and templates intended for GS1 stakeholders

Does not apply to:
- JSON schemas and API responses
- Code, database schemas and test artefacts

## High-impact rules

1. Use British English spelling
2. Use DD Month YYYY date format
3. Use sentence case headings
4. Spell out abbreviations on first use
5. Avoid Oxford commas
6. Use a neutral and factual tone
7. Keep terminology consistent across documents

## Examples

- Date: 15 January 2025
- Abbreviation: European Sustainability Reporting Standards (ESRS)
- Heading: "Regulatory change log entry guide"
- List: "A, B and C"

## ISA conventions aligned to GS1

- Use stable IDs for advisory artefacts (MAP-*, GAP-*, REC-*)
- Cite versions for datasets, advisories and schemas
- Prefer short sentences and clear verbs


⸻

File 6: /docs/ADVISORY_METHOD.md

# Advisory method

## Purpose

This document defines how ISA produces advisory outputs from locked artefacts. It describes the method at a level suitable for GS1 (Global Standards One) stakeholders without exposing implementation details.

## Inputs

ISA advisory outputs are based on:
- A frozen dataset registry and registered datasets
- A locked advisory artefact (Markdown and JSON forms)
- Documented mappings, gaps and recommendations within the advisory scope

ISA does not use:
- Customer data
- Unregistered external sources at query time

## Method overview

1. Scope definition
- Identify the regulations and sectors covered by the advisory
- Confirm the frozen registry version

2. Evidence extraction
- Use only registered datasets and locked artefacts
- Maintain provenance to source artefacts

3. Mapping representation
- Represent relationships as mapping results with stable identifiers
- Track mapping status (direct, partial, missing)

4. Gap identification
- Record gaps as structured items with severity
- Link each gap to the affected regulation, sector and domain tags

5. Recommendation formulation
- Provide recommendations by timeframe (short, medium, long)
- Link recommendations to gaps and expected standards evolution implications

## Traceability requirements

Every advisory output must include:
- Advisory ID and version
- Registry version and dataset IDs
- Source artefact paths and hashes where available
- Deterministic ordering for diffability

## Limitations

- ISA does not guarantee future regulatory outcomes
- ISA outputs are only valid for the versions of datasets and standards recorded in the advisory provenance


⸻

File 7: /docs/REGULATORY_LANDSCAPE_SUMMARIES.md

# Regulatory landscape summaries

## Purpose

This document provides short, factual summaries of key regulatory areas relevant to ISA. It is supporting context for standards development and does not constitute advisory output.

## Scope and constraints

- Focus on EU and relevant Dutch initiatives
- Avoid speculative statements about future requirements
- Use this document to inform prioritisation, not to replace locked advisory outputs

## Coverage areas

### ESG reporting

- Corporate sustainability reporting requirements create structured disclosure needs that influence what product and supply chain data should exist and how it should be exchanged.

### Deforestation and traceability

- Supply chain traceability expectations increase the need for consistent event, location and provenance data.

### Digital Product Passport

- Product passport initiatives increase the need for consistent identifiers, link resolution and attributes supporting durability, repairability and circularity.

### Packaging and circularity

- Packaging and circularity initiatives increase demand for standardised packaging composition data, recyclability indicators and waste-related attributes.

## How ISA uses these summaries

ISA uses this document to:
- Identify candidate domains for future dataset acquisition
- Inform future advisory scope selection
- Provide non-binding context for GS1 NL standards planning

ISA does not use this document to:
- Generate new advisory conclusions
- Answer Ask ISA queries beyond locked artefacts


⸻

GS1 style checklist validation, line-by-line

If you want the strictest possible validation, paste the 7 files back here and I will do a true line-by-line audit against:
	•	British English spelling
	•	date format
	•	heading case
	•	abbreviation expansion
	•	Oxford comma detection
	•	tone and scope constraints

⸻

Checksums and Manus ingestion prompt

If you still want them included in the same response, say: “add checksum commands + Manus ingestion prompt”, and I’ll provide the exact sha256sum command and the single prompt to accompany these 7 files.
