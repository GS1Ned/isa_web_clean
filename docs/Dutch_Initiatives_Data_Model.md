# Dutch Compliance Initiatives: Data Model & Integration Plan

## Overview

This document defines the data model and integration strategy for 5 Dutch national compliance initiatives that complement EU ESG regulations. These initiatives provide localized compliance intelligence for GS1 Netherlands members.

---

## Dutch Initiatives Summary

### 1. UPV Textiel (Extended Producer Responsibility - Textiles)

**Type:** National EPR Scheme  
**Status:** Fully Active (since 2025)  
**Scope:** Textile producers/importers in Netherlands  
**Key Requirements:**

- Annual reporting on weight of textiles placed on market
- 2025 Target: 50% of textiles must be prepared for reuse or recycling
- Reporting deadline: Mid-year (preceding calendar year data)
- Managed by Producer Responsibility Organizations (PROs)

**GS1 Relevance:**

- GDSN attributes for textile composition
- GS1 Web Vocabulary for material traceability
- Weight and material data for EPR calculations

**Related EU Regulations:** Revised Waste Framework Directive (Oct 16, 2025)

---

### 2. Green Deal Duurzame Zorg 3.0 (Sustainable Healthcare)

**Type:** Voluntary Covenant  
**Status:** Active (2022-2026)  
**Scope:** Dutch cure and care sectors  
**Monitoring:** RIVM (National Institute for Public Health)

**Key Targets:**

- 55% CO2 reduction by 2030
- 50% reduction in primary raw materials by 2030
- Focus: Medication residues in water, circular operations

**GS1 Relevance:**

- GTIN for medical products
- GS1 Healthcare standards for supply chain traceability
- Carbon footprint data (GS1 Web Vocabulary)

**Related EU Regulations:** CSRD (corporate sustainability reporting), ESPR (circular economy)

---

### 3. DSGO (Digitaal Stelsel Gebouwde Omgeving - Digital Built Environment)

**Type:** Data Sharing Framework  
**Status:** Operational (v1.3 current release)  
**Scope:** Construction and built environment sector  
**Function:** Federated system for data sharing between software platforms

**Key Features:**

- Logistics and material data exchange
- Building information modeling (BIM) integration
- Circular material passports for construction

**GS1 Relevance:**

- GTIN for construction materials
- GS1 Digital Link for material passports
- EPCIS for construction supply chain traceability

**Related EU Regulations:** ESPR (Digital Product Passport), Construction Products Regulation

---

### 4. Denim Deal 2.0

**Type:** Voluntary Covenant (International)  
**Status:** Active (expanded internationally)  
**Scope:** Denim/jeans industry

**Key Target:**

- 1 billion pairs of jeans containing 20% Post-Consumer Recycled (PCR) cotton
- Circular standard for denim fiber

**Participants:** Brands, recyclers, weavers

**GS1 Relevance:**

- GDSN textile composition attributes
- GS1 Web Vocabulary for recycled content percentage
- Traceability of PCR cotton through supply chain

**Related EU Regulations:** UPV Textiel, ESPR, Green Claims Directive

---

### 5. Verpact (Packaging Waste Management)

**Type:** National EPR Scheme (formerly Afvalfonds Verpakkingen)  
**Status:** Active  
**Scope:** All packaging placed on Dutch market  
**Function:** Manages waste management contributions for packaging

**Key Requirements:**

- Detailed material sub-type data for fee calculation ("Tariefdifferentiatie")
- Weight-based fees (accurate to gram)
- Distinction between material sub-types (e.g., PET_TRANSPARENT vs PET_OPAQUE)
- Recycled content percentage for fee modulation

**GS1 Relevance (CRITICAL):**

- `packagingMaterialTypeCode` (must be granular, not generic "PLASTIC")
- `packagingRecyclingSchemeCode` (value: "VERPACT")
- `packagingRecyclabilityAssessmentSpecificationCode` (e.g., "KIDV Recycle Check")
- `packagingRecycledContent` (percentage)
- `packagingWeight` (accurate to gram)

**Related EU Regulations:** PPWR (Packaging and Packaging Waste Regulation)

---

## Database Schema Design

### New Table: `dutchInitiatives`

```typescript
export const dutchInitiatives = mysqlTable("dutch_initiatives", {
  id: int("id").primaryKey().autoincrement(),

  // Basic Information
  initiativeName: varchar("initiative_name", { length: 255 }).notNull(),
  shortName: varchar("short_name", { length: 100 }).notNull(), // e.g., "UPV Textiel", "DSGO"
  initiativeType: varchar("initiative_type", { length: 100 }).notNull(), // "EPR Scheme", "Voluntary Covenant", "Data Framework"
  status: varchar("status", { length: 100 }).notNull(), // "Active", "Proposed", "Pilot"

  // Scope & Sector
  sector: varchar("sector", { length: 255 }).notNull(), // "Textiles", "Healthcare", "Construction", "Packaging"
  scope: text("scope").notNull(), // Detailed description of what's covered

  // Timeline
  startDate: datetime("start_date"), // When initiative started
  endDate: datetime("end_date"), // For covenants with expiry (e.g., Green Deal 2022-2026)
  reportingDeadline: varchar("reporting_deadline", { length: 255 }), // e.g., "Mid-year annually"

  // Targets & Requirements
  keyTargets: text("key_targets").notNull(), // JSON array of targets
  complianceRequirements: text("compliance_requirements").notNull(), // What companies must do

  // GS1 Integration
  gs1Relevance: text("gs1_relevance").notNull(), // How GS1 standards apply
  requiredGS1Standards: text("required_gs1_standards"), // JSON array of standard IDs
  requiredGDSNAttributes: text("required_gdsn_attributes"), // JSON array of attribute names

  // Relationships
  relatedEURegulations: text("related_eu_regulations"), // JSON array of regulation IDs
  managingOrganization: varchar("managing_organization", { length: 255 }), // e.g., "RIVM", "Verpact"

  // Resources
  officialUrl: varchar("official_url", { length: 500 }),
  documentationUrl: varchar("documentation_url", { length: 500 }),

  // Metadata
  createdAt: datetime("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow(),
});
```

### New Junction Table: `initiativeRegulationMappings`

```typescript
export const initiativeRegulationMappings = mysqlTable(
  "initiative_regulation_mappings",
  {
    id: int("id").primaryKey().autoincrement(),
    initiativeId: int("initiative_id")
      .notNull()
      .references(() => dutchInitiatives.id),
    regulationId: int("regulation_id")
      .notNull()
      .references(() => regulations.id),
    relationshipType: varchar("relationship_type", { length: 100 }).notNull(), // "Implements", "Complements", "Aligns With"
    description: text("description"), // How they relate
    createdAt: datetime("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  }
);
```

### New Junction Table: `initiativeStandardMappings`

```typescript
export const initiativeStandardMappings = mysqlTable(
  "initiative_standard_mappings",
  {
    id: int("id").primaryKey().autoincrement(),
    initiativeId: int("initiative_id")
      .notNull()
      .references(() => dutchInitiatives.id),
    standardId: int("standard_id")
      .notNull()
      .references(() => gs1Standards.id),
    criticality: varchar("criticality", { length: 50 }).notNull(), // "CRITICAL", "RECOMMENDED", "OPTIONAL"
    implementationNotes: text("implementation_notes"), // Specific guidance
    createdAt: datetime("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  }
);
```

---

## Frontend UI Design

### New Page: `/hub/dutch-initiatives`

**Layout:**

- Hero section: "Dutch Compliance Initiatives for GS1 Members"
- Filter bar: By sector, status, initiative type
- Card grid: 5 initiative cards with key info
- Each card links to detail page

### New Page: `/hub/dutch-initiatives/:id`

**Sections:**

1. **Overview:** Name, status, timeline, managing organization
2. **Key Targets:** Bullet list of compliance targets
3. **GS1 Implementation Guide:**
   - Required standards (linked to standards pages)
   - GDSN attributes table (with examples)
   - Implementation checklist
4. **Related EU Regulations:** Cards linking to regulation detail pages
5. **Resources:** Official links, documentation, contact info

### Integration Points:

**On Regulation Detail Pages:**

- Add "Dutch Initiatives" tab showing related national programs
- Example: PPWR detail page shows Verpact initiative

**On GS1 Standards Pages:**

- Add "Used By Dutch Initiatives" section
- Example: GDSN page shows it's required for Verpact and UPV Textiel

---

## Implementation Phases

### Phase 1: Database & Seed Data (Current)

- [x] Design schema
- [ ] Add tables to `drizzle/schema.ts`
- [ ] Run `pnpm db:push`
- [ ] Create seed script with 5 initiatives
- [ ] Populate junction tables (initiative↔regulation, initiative↔standard)

### Phase 2: Backend Procedures

- [ ] Add `dutchInitiatives.list` tRPC procedure
- [ ] Add `dutchInitiatives.getById` procedure
- [ ] Add `dutchInitiatives.getByRegulation` procedure
- [ ] Add `dutchInitiatives.getBySector` procedure

### Phase 3: Frontend UI

- [ ] Create `HubDutchInitiatives.tsx` list page
- [ ] Create `HubDutchInitiativeDetail.tsx` detail page
- [ ] Add routes to `App.tsx`
- [ ] Add "Dutch Initiatives" link to ESG Hub navigation
- [ ] Integrate with regulation detail pages (new tab)

### Phase 4: Testing & Documentation

- [ ] Write tests for tRPC procedures
- [ ] Test UI navigation and filtering
- [ ] Create user documentation
- [ ] Update ISA roadmap with Dutch initiatives feature

---

## Value Proposition

**For GS1 Netherlands Members:**

- Localized compliance intelligence beyond EU regulations
- Practical implementation guidance with GS1 standards
- Sector-specific initiatives (textiles, healthcare, construction, packaging)
- Direct links between national and EU requirements

**Competitive Differentiation:**

- Only platform mapping Dutch initiatives to GS1 standards
- Unique value for Dutch market (GS1 Netherlands customers)
- Demonstrates ISA's ability to integrate national/regional requirements

**Estimated Effort:** 4-6 hours (schema + seed + backend + frontend)
**Estimated Value:** HIGH (unique market differentiator for GS1 NL)
