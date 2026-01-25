# ISA Data Ingestion Documentation

**Last Updated:** December 2, 2025  
**Status:** Manual ingestion with planned automation

---

## Overview

ISA currently uses **manual data ingestion** for all datasets. This document describes existing ingestion processes and planned automation pipelines.

---

## Current Ingestion Status

| Dataset                  | Records | Method              | Frequency | Automation Status |
| ------------------------ | ------- | ------------------- | --------- | ----------------- |
| EU Regulations           | 35      | Manual seed script  | One-time  | ❌ Not automated  |
| GS1 Standards            | 60      | Manual seed script  | One-time  | ❌ Not automated  |
| ESRS Datapoints          | 1,184   | Manual CSV import   | One-time  | ❌ Not automated  |
| Dutch Initiatives        | 10      | Manual seed script  | One-time  | ❌ Not automated  |
| Regulation→ESRS Mappings | 449     | AI batch generation | One-time  | ❌ Not automated  |
| Knowledge Embeddings     | 155     | Admin UI generation | On-demand | ✅ UI-based       |

---

## 1. EU Regulations Ingestion

### Current Process (Manual)

**Source:** Hand-curated list of 35 key EU sustainability regulations

**Steps:**

1. Research regulation on EUR-Lex
2. Extract metadata (name, acronym, effective date, applicability)
3. Write AI-enhanced description using LLM
4. Add to seed script: `server/seed-regulations.ts`
5. Run: `node server/seed-regulations.mjs`

**Sample Seed Data:**

```typescript
{
  name: "EU Deforestation Regulation",
  acronym: "EUDR",
  category: "environmental",
  status: "adopted",
  effectiveDate: new Date("2024-12-30"),
  applicability: "Companies placing products on EU market",
  description: "Requires due diligence to ensure products are deforestation-free...",
  officialUrl: "https://eur-lex.europa.eu/eli/reg/2023/1115/oj"
}
```

### Planned Automation (EUR-Lex Crawler)

**Goal:** Automatically discover and ingest new EU sustainability regulations

**Pipeline:**

1. **Crawler:** Query EUR-Lex API for new regulations in categories:
   - Environment (15.10)
   - Social affairs (05)
   - Consumer protection (15.20)
2. **Parser:** Extract regulation metadata from CELEX format
3. **LLM Enhancement:** Generate human-readable descriptions
4. **Validation:** Check for duplicates by CELEX number
5. **Storage:** Insert into `regulations` table
6. **Notification:** Alert admin of new regulations

**Trigger:** Weekly cron job

**Status:** 🔴 Not implemented

---

## 2. GS1 Standards Ingestion

### Current Process (Manual)

**Source:** GS1 official documentation and standards catalog

**Steps:**

1. Browse GS1 website for standards
2. Extract metadata (name, acronym, category, technical specs)
3. Write description and applicability
4. Add to seed script: `server/seed-gs1-standards.ts`
5. Run: `node server/seed-gs1-standards.mjs`

**Sample Seed Data:**

```typescript
{
  standardName: "Global Trade Item Number",
  acronym: "GTIN",
  category: "identification",
  description: "Unique identifier for products in global supply chains...",
  applicability: "All products sold in retail or B2B",
  technicalSpecs: "8, 12, 13, or 14-digit numeric code...",
  officialUrl: "https://www.gs1.org/standards/id-keys/gtin"
}
```

### Planned Automation (GS1 API Integration)

**Goal:** Sync with GS1 official standards database

**Pipeline:**

1. **API Call:** Query GS1 standards API (if available)
2. **Parser:** Extract standard metadata
3. **Diff Detection:** Compare with existing records
4. **Update:** Insert new standards, update changed ones
5. **Notification:** Alert admin of changes

**Trigger:** Monthly cron job

**Status:** 🟡 Waiting for GS1 API access

---

## 3. ESRS Datapoints Ingestion

### Current Process (Manual CSV Import)

**Source:** EFRAG ESRS XBRL Taxonomy (official Excel/CSV export)

**Steps:**

1. Download ESRS taxonomy from EFRAG website
2. Convert Excel to CSV
3. Map columns to ISA schema:
   - `datapointId` → Official EFRAG ID
   - `esrsStandard` → E1, E2, S1, G1, etc.
   - `topic` → Climate, Water, Workers, etc.
   - `name` → Datapoint question
   - `mandatory` → Boolean flag
4. Import via SQL or seed script
5. Run: `node server/seed-esrs-datapoints.mjs`

**Sample Seed Data:**

```typescript
{
  datapointId: "E1-1_01",
  esrsStandard: "E1",
  topic: "Climate Change",
  subtopic: "GHG Emissions",
  name: "Gross Scope 1 GHG emissions in metric tonnes of CO2 equivalent",
  description: "Total direct GHG emissions from sources owned or controlled...",
  dataType: "quantitative",
  mandatory: true,
  phase: "phase1"
}
```

### Planned Automation (XBRL Parser)

**Goal:** Auto-update ESRS datapoints when EFRAG releases new taxonomy versions

**Pipeline:**

1. **Monitor:** Check EFRAG website for new XBRL taxonomy releases
2. **Download:** Fetch latest taxonomy ZIP file
3. **Parse:** Extract datapoints from XBRL XML structure
4. **Diff Detection:** Compare with existing datapoints
5. **Update:** Insert new, update changed, mark deprecated
6. **Notification:** Alert admin of taxonomy changes

**Trigger:** Quarterly check (EFRAG updates ~2x per year)

**Status:** 🔴 Not implemented

---

## 4. Dutch Initiatives Ingestion

### Current Process (Manual)

**Source:** Dutch government websites, industry associations

**Steps:**

1. Research Dutch compliance programs
2. Extract metadata (name, sector, status, targets)
3. Write descriptions and requirements
4. Add to seed script: `server/seed-dutch-initiatives.ts`
5. Run: `node server/seed-dutch-initiatives.mjs`

**Sample Seed Data:**

```typescript
{
  name: "Uitgebreide Producentenverantwoordelijkheid Textiel",
  acronym: "UPV Textiel",
  sector: "textiles",
  status: "active",
  scope: "Extended Producer Responsibility for textile products...",
  keyTargets: "95% collection rate by 2025, 50% recycling by 2030",
  complianceRequirements: "Register with PRO, report sales data, pay fees",
  reportingDeadline: new Date("2025-03-31"),
  officialUrl: "https://www.rijksoverheid.nl/upv-textiel"
}
```

### Planned Automation (Web Scraper)

**Goal:** Monitor Dutch government websites for new initiatives

**Pipeline:**

1. **Scraper:** Crawl Rijksoverheid.nl and industry sites
2. **Parser:** Extract initiative metadata
3. **LLM Enhancement:** Generate structured descriptions
4. **Validation:** Check for duplicates
5. **Storage:** Insert into `dutch_initiatives` table
6. **Notification:** Alert admin of new initiatives

**Trigger:** Monthly check

**Status:** 🔴 Not implemented

---

## 5. AI-Generated Mappings

### Regulation → ESRS Datapoints (449 mappings)

**Process:**

1. **Batch Generation:** Use LLM to analyze each regulation
2. **Prompt:** "Which ESRS datapoints are triggered by this regulation?"
3. **LLM Response:** Returns list of datapoint IDs with relevance scores
4. **Validation:** Check scores are 0.00-1.00
5. **Storage:** Insert into `regulation_esrs_mappings`

**Script:** `server/generate-regulation-esrs-mappings.ts`

**Sample Prompt:**

```
Regulation: EU Deforestation Regulation (EUDR)
Description: Requires companies to prove products are deforestation-free...

Which ESRS datapoints must be disclosed to comply with this regulation?
Return JSON array: [{ datapointId: "E1-5_03", relevanceScore: 0.92, reasoning: "..." }]
```

**Quality Control:**

- Manual review of high-relevance mappings (>0.90)
- Spot-check random sample of 10%
- User feedback mechanism (thumbs up/down)

---

### Regulation → GS1 Standards (Planned)

**Process:** Same as ESRS mappings but for GS1 standards

**Status:** 🔴 Not implemented

---

### Dutch Initiatives → Regulations (Planned)

**Process:** Map Dutch initiatives to relevant EU regulations

**Status:** 🔴 Not implemented

---

## 6. Knowledge Base Generation

### Current Process (Admin UI)

**Location:** `/admin/knowledge-base`

**Steps:**

1. Admin selects source type (regulations, standards, ESRS, initiatives)
2. Click "Generate Embeddings"
3. System processes all records:
   - Extract content (title + description + key fields)
   - Generate content hash (SHA-256)
   - Check for duplicates
   - Store in `knowledge_embeddings` table
4. Display progress and statistics

**Deduplication:**

- Content hash prevents storing identical chunks
- Explains why 1,184 ESRS datapoints → only 55 unique chunks

**Coverage:**

- 35 regulations → 35 chunks (100%)
- 60 GS1 standards → 60 chunks (100%)
- 1,184 ESRS datapoints → 55 chunks (5%)
- 10 Dutch initiatives → 5 chunks (50%)
- **Total: 155 unique knowledge chunks**

### Planned Automation (Auto-Refresh)

**Goal:** Automatically regenerate knowledge base when source data changes

**Pipeline:**

1. **Trigger:** Database update hook on regulations/standards/ESRS/initiatives
2. **Extract:** Get updated record
3. **Generate:** Create knowledge chunk
4. **Store:** Upsert into `knowledge_embeddings`
5. **Notification:** Log update

**Status:** 🔴 Not implemented

---

## 7. Change Monitoring

### Planned Features

**Regulation Amendment Tracking:**

- Monitor EUR-Lex for regulation amendments
- Detect changes in effective dates, applicability, or requirements
- Notify users of changes affecting their compliance

**ESRS Taxonomy Updates:**

- Track EFRAG taxonomy version changes
- Identify new, modified, or deprecated datapoints
- Update knowledge base automatically

**GS1 Standard Revisions:**

- Monitor GS1 website for standard updates
- Detect new versions or technical changes
- Alert users of breaking changes

**Status:** 🔴 Not implemented

---

## Automation Roadmap

### Phase 1: Foundation (Q1 2025)

- ✅ Manual seed scripts for all datasets
- ✅ Admin UI for knowledge base generation
- 🔴 Automated EUR-Lex crawler
- 🔴 EFRAG XBRL parser

### Phase 2: Automation (Q2 2025)

- 🔴 Weekly EUR-Lex ingestion cron job
- 🔴 Quarterly ESRS taxonomy sync
- 🔴 Monthly Dutch initiatives scraper
- 🔴 Auto-refresh knowledge base on data changes

### Phase 3: Monitoring (Q3 2025)

- 🔴 Regulation amendment detection
- 🔴 Change notification system
- 🔴 User subscription to regulation updates
- 🔴 Email alerts for compliance deadlines

---

## Data Quality Assurance

### Validation Rules

- All URLs must be accessible (HTTP 200)
- Relevance scores must be 0.00-1.00
- Dates must be valid and future-dated where appropriate
- Mandatory flags must match official EFRAG taxonomy

### Quality Checks

- **Weekly:** Validate all regulation URLs
- **Monthly:** Spot-check AI-generated mappings
- **Quarterly:** Review ESRS datapoint accuracy against official taxonomy
- **Annually:** Full audit of all datasets

### Error Handling

- Log all ingestion errors to database
- Alert admin of failed ingestions
- Retry failed records up to 3 times
- Manual review queue for problematic records

---

## Performance Considerations

### Batch Processing

- Process records in batches of 10 to avoid API rate limits
- Use parallel processing where possible
- Implement exponential backoff for API failures

### Caching

- Cache LLM responses for identical prompts
- Store intermediate results to resume failed batches
- Use content hashing to avoid re-processing unchanged records

### Monitoring

- Track ingestion duration and success rates
- Alert if ingestion takes >2x expected time
- Monitor database growth and storage usage

---

## Contact

**Data Ingestion Owner:** ISA Development Team  
**Automation Status:** Manual (automation planned for Q1-Q2 2025)  
**Last Update:** December 2, 2025
