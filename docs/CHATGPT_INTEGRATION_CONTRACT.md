# ChatGPT Integration Contract for Documentation Deliverables

**Date:** 15 January 2025  
**ISA Version:** 1.0  
**Purpose:** Provide minimal integration contract for ChatGPT documentation deliverables

---

## 1. Regulatory Change Log Schema

### Database Table: `regulatory_change_log`

```typescript
export const regulatoryChangeLog = mysqlTable("regulatory_change_log", {
  id: int("id").autoincrement().primaryKey(),
  
  // Required fields
  entryDate: timestamp("entryDate").notNull(), // Date entry was created
  sourceType: mysqlEnum("sourceType", [
    "EU_DIRECTIVE",
    "EU_REGULATION", 
    "EU_DELEGATED_ACT",
    "EU_IMPLEMENTING_ACT",
    "EFRAG_IG",
    "EFRAG_QA",
    "EFRAG_TAXONOMY",
    "GS1_AISBL",
    "GS1_EUROPE",
    "GS1_NL"
  ]).notNull(),
  sourceOrg: varchar("sourceOrg", { length: 255 }).notNull(), // e.g., "European Commission", "EFRAG", "GS1 in Europe"
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description").notNull(), // What changed, why it matters
  url: varchar("url", { length: 512 }).notNull(), // Source document URL
  documentHash: varchar("documentHash", { length: 64 }), // SHA256 hash for traceability
  
  // Optional fields
  impactAssessment: text("impactAssessment"), // Brief impact analysis (1-2 sentences)
  isaVersionAffected: varchar("isaVersionAffected", { length: 16 }), // e.g., "v1.1", "v1.2"
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
```

### Controlled Vocabularies

**sourceType:**
- `EU_DIRECTIVE` - EU Directive (e.g., CSRD)
- `EU_REGULATION` - EU Regulation (e.g., EUDR, DPP)
- `EU_DELEGATED_ACT` - Delegated Act under existing regulation
- `EU_IMPLEMENTING_ACT` - Implementing Act with technical specifications
- `EFRAG_IG` - EFRAG Implementation Guidance (e.g., IG3, IG4)
- `EFRAG_QA` - EFRAG Q&A document
- `EFRAG_TAXONOMY` - EFRAG XBRL Taxonomy update
- `GS1_AISBL` - GS1 AISBL (global) publication
- `GS1_EUROPE` - GS1 in Europe publication
- `GS1_NL` - GS1 Netherlands publication

**Domain Tags (provisional, used in impactAssessment):**
- `TRACEABILITY` - Supply chain traceability requirements
- `PCF` - Product Carbon Footprint
- `CIRCULARITY` - Circular economy, recycled content, recyclability
- `PACKAGING` - Packaging attributes and compliance
- `DEFORESTATION` - Deforestation-free supply chains
- `DPP` - Digital Product Passport
- `ESG_REPORTING` - ESG disclosure and reporting
- `PRODUCT_MASTER_DATA` - Product identification and master data

**Sector Identifiers (used in impactAssessment):**
- `DIY` - DIY/Garden/Pet sector (GS1 NL DHZTD)
- `FMCG` - Food/Health/Beauty sector (GS1 NL FMCG)
- `HEALTHCARE` - Healthcare sector (GS1 NL ECHO)

### Validation Rules

- `entryDate`: ISO 8601 format (YYYY-MM-DD)
- `url`: Must be valid HTTPS URL to authoritative source
- `documentHash`: Optional SHA256 hash (64 hex characters)
- `isaVersionAffected`: Semantic versioning format (vX.Y or vX.Y.Z)
- `title`: Max 512 characters
- `description`: Required, no max length (text field)
- `impactAssessment`: Optional, 1-3 sentences recommended

---

## 2. Advisory Output Schema

### Advisory JSON File Paths

**Schema file:**
- Path: `/docs/schemas/advisory.schema.json` (NOT YET CREATED)
- Schema $id: `https://isa.gs1nl.org/schemas/advisory/v1.0`
- Version: `1.0`

**Hardened advisory JSON:**
- Path: `/docs/advisories/ISA_Advisory_GS1NL_v{version}.json` (NOT YET CREATED)
- Current version: `v1.0`
- Advisory ID format: `ISA-ADV-GS1NL-{version}` (e.g., `ISA-ADV-GS1NL-v1.0`)

**Frozen dataset registry:**
- Path: `/data/metadata/dataset_registry.json` (EXISTS)
- Registry version: `v1.3.0`

### Confidence Score Rules

- **Range:** 0.0 to 1.0 (decimal)
- **Null handling:** `null` allowed for "not assessed" or "not applicable"
- **Interpretation:**
  - `0.0-0.3`: Low confidence (speculative, needs verification)
  - `0.4-0.6`: Medium confidence (partial evidence)
  - `0.7-0.9`: High confidence (strong evidence)
  - `1.0`: Absolute confidence (verified, locked)

---

## 3. Tag Taxonomy

### Domain Tags (Canonical List v0.1)

```json
[
  "TRACEABILITY",
  "PCF",
  "CIRCULARITY", 
  "PACKAGING",
  "DEFORESTATION",
  "DPP",
  "ESG_REPORTING",
  "PRODUCT_MASTER_DATA",
  "SUPPLY_CHAIN_VISIBILITY",
  "CHEMICAL_COMPLIANCE",
  "ENERGY_EFFICIENCY",
  "WATER_MANAGEMENT",
  "WASTE_MANAGEMENT",
  "SOCIAL_COMPLIANCE",
  "GOVERNANCE"
]
```

### Sector Identifiers

```json
{
  "DIY": "DIY/Garden/Pet (GS1 NL DHZTD v3.1.33)",
  "FMCG": "Food/Health/Beauty (GS1 NL FMCG v3.1.33.5)",
  "HEALTHCARE": "Healthcare (GS1 NL ECHO v3.1.33)"
}
```

---

## 4. File Locations for New Documentation

### Target Directory Structure

All new documentation files should be placed in:

```
/docs/
  ├── REGULATORY_CHANGE_LOG_TEMPLATES.md
  ├── REGULATORY_CHANGE_LOG_ENTRY_GUIDE.md
  ├── ASK_ISA_QUERY_LIBRARY.md
  ├── ASK_ISA_GUARDRAILS.md
  ├── GS1_STYLE_QUICK_REFERENCE.md
  ├── ADVISORY_METHOD.md
  └── REGULATORY_LANDSCAPE_SUMMARIES.md
```

### Naming Convention

- **Required:** UPPERCASE filenames with underscores (e.g., `REGULATORY_CHANGE_LOG_TEMPLATES.md`)
- **Required:** `.md` extension (Markdown format)
- **Required:** British English spelling throughout
- **Required:** GS1 Style Guide Release 5.6 compliance (see `/docs/GS1_STYLE_ADOPTION_GUIDE.md`)

---

## 5. Additional Context

### ISA Design Contract Constraints

**Regulatory Change Log:**
- Track ONLY authoritative EU/Dutch sources
- Versioned, immutable, machine-readable entries
- Traceable to source documents
- NO news feed, NO generic ESG alerts, NO content aggregation

**"Ask ISA" Query Interface:**
- Read-only queries over locked artifacts
- MUST cite advisory IDs, dataset IDs, versions
- NO conversational AI, NO speculation, NO hypothetical scenarios
- NO answering beyond current advisory scope

### GS1 Style Guide Top 5 Rules

1. **British English spelling** (organisation, colour, analyse)
2. **Date format:** DD Month YYYY (e.g., 15 January 2025)
3. **Abbreviations:** Spell out on first use (e.g., "European Sustainability Reporting Standards (ESRS)")
4. **Sentence case headings** (not Title Case)
5. **No Oxford commas** (A, B and C, not A, B, and C)

### Dataset Registry Structure

Current datasets registered (v1.3.0):
- `esrs.datapoints.ig3` - 1,186 ESRS datapoints
- `gs1nl.benelux.diy_garden_pet.v3.1.33` - 3,009 attributes
- `gs1nl.benelux.fmcg.v3.1.33.5` - 473 attributes
- `gs1nl.benelux.healthcare.v3.1.33` - 185 attributes
- `gs1nl.benelux.validation_rules.v3.1.33.4` - 847 rules, 1,055 code lists
- `gdsn.current.v3.1.32` - 4,293 records
- `gs1.ctes_kdes` - 50 records
- `eu.dpp.identification_rules` - 26 records
- `gs1.cbv_digital_link` - 84 records

---

## 6. Seed Entry Examples (Placeholders)

### Example 1: GS1 EU Carbon Footprint Guideline v1.0

```json
{
  "entryDate": "2025-02-15",
  "sourceType": "GS1_EUROPE",
  "sourceOrg": "GS1 in Europe",
  "title": "GDSN Implementation Guideline for Exchanging Carbon Footprint Data v1.0",
  "description": "Official GS1 EU standard for Product Carbon Footprint (PCF) data exchange via GDSN. Defines 9 GDSN BMS attributes for exchanging carbon footprint data across the value chain.",
  "url": "https://gs1.eu/wp-content/uploads/2025/02/GDSN-Implementation-Guideline-for-exchanging-Carbon-Footprint-Data-3.pdf",
  "documentHash": "TBD_COMPUTE_AFTER_DOWNLOAD",
  "impactAssessment": "Addresses ISA Gap #1 (Product Carbon Footprint) with PARTIAL solution. GS1 NL adoption pending in v3.1.34 release.",
  "isaVersionAffected": "v1.1"
}
```

### Example 2: EFRAG Implementation Guidance 4 (Hypothetical)

```json
{
  "entryDate": "2025-06-01",
  "sourceType": "EFRAG_IG",
  "sourceOrg": "EFRAG",
  "title": "ESRS Implementation Guidance 4: Scope 3 Emissions Reporting",
  "description": "Clarifies ESRS E1 requirements for Scope 3 emissions reporting, including supply chain data collection and calculation methodologies.",
  "url": "https://www.efrag.org/lab6/item/TBD",
  "documentHash": null,
  "impactAssessment": "May impact GS1 traceability standards (EPCIS, GDSN) if supply chain emissions data exchange becomes mandatory.",
  "isaVersionAffected": "v1.2"
}
```

---

## End of Integration Contract

**Next Steps for ChatGPT:**
1. Use this contract to generate 7 documentation deliverables
2. Follow schema exactly for regulatory change log templates
3. Use domain tags and sector identifiers consistently
4. Adhere to GS1 Style Guide Release 5.6 rules
5. Place all files in `/docs/` with UPPERCASE naming
