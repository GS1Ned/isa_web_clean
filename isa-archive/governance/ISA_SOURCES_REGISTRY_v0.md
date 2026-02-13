# ISA Sources Registry (seed) — EU + GS1 + EFRAG (v0)

Last verified: 2026-01-28

This is a **seed registry** of high-authority sources to harvest and keep current.  
Scope priority rule: **EU institutions → GS1 bodies → official specs/schemas → regulator guidance → industry**.

## 1) EFRAG (Sustainability reporting publications)

- EFRAG “Sustainability Reporting Publications” hub (HTML index; links to artefacts and guidance)  
  Source: EFRAG website  
  URL: (see citations in chat output)  
  Formats: HTML + linked PDFs  
  Status: “hub / index” (dynamic)

- ESRS “Set 1” machine-readable hub (XBRL site)  
  Source: EFRAG XBRL site  
  URL: (see citations in chat output)  
  Formats: HTML (per-standard pages; may link to XBRL/artefacts)  
  Status: “hub / index” (dynamic)

## 2) GS1 Global (standards landing pages + normative artefacts)

- GS1 EPCIS landing page(s) (HTML)  
  Source: GS1 Global  
  Formats: HTML + linked PDFs  
  Status: “standard landing page” (dynamic)

- GS1 Digital Link landing page (HTML) + standard PDF  
  Source: GS1 Global  
  Formats: HTML + PDF  
  Status: “standard landing page” + “normative PDF”

- GS1 Ref platform — EPCIS artefacts (HTML index; links to PDFs + artefacts including JSON/JSON-LD/XML definitions)  
  Source: ref.gs1.org  
  Formats: HTML + PDFs + artefact files  
  Status: “artefacts hub” (dynamic)

## 3) GS1 Netherlands (national guidance / manuals / PDFs)

- GS1 NL Data Source / datapool manuals (PDF)  
  Source: GS1 Netherlands  
  Formats: PDF  
  Status: “national implementation guidance” (versioned PDFs)

- GS1 NL “keurmerkcriteria” / quality criteria (PDF)  
  Source: GS1 Netherlands  
  Formats: PDF  
  Status: “national program / criteria” (versioned PDFs)

## 4) Next step for ISA: turn this into a canonical machine-readable registry

Target: `sources.registry.json` (canonical), generated from this seed and validated by schema, including:
- authority tier
- org (EU / GS1 / EFRAG)
- canonical identifier
- URL(s)
- format(s)
- version/date if present
- status (current / draft / superseded / withdrawn / unknown)
- last_verified (date)
- retrieval method (HTML index scrape / direct PDF / API)

