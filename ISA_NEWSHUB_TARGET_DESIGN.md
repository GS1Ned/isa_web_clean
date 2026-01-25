# ISA News Hub - Target Design Document

**Date**: December 10, 2025  
**Version**: Target State for Evolution  
**Purpose**: Define the comprehensive design for transforming ISA News Hub into an ESG-GS1 intelligence layer

---

## Executive Summary

This document defines the target architecture, data model, UX, and operations for ISA's News Hub evolution. The design transforms the News Hub from a "regulatory news aggregator" into a **comprehensive ESG-GS1 intelligence layer** that:

1. **Covers EU + Dutch/Benelux ESG landscape** - Captures all major regulations and national/sector initiatives
2. **Explicitly maps to GS1 standards** - Shows which standards and data models are impacted
3. **Provides sector-specific views** - Filters and insights tailored to retail, healthcare, logistics, etc.
4. **Delivers actionable guidance** - Tells users what to do, not just what happened
5. **Maintains observable operations** - Coverage analytics, health monitoring, and quality metrics

**Design Principles**:

- **Additive, not disruptive**: Preserve existing functionality while adding new capabilities
- **Cost-conscious**: Minimize LLM API calls through smart caching and batching
- **Maintainable**: Clear enums, documented schemas, modular architecture
- **User-centric**: Design for GS1 NL members (not generic ESG audience)

---

## 1. Schema & Data Model Design

### 1.1 hubNews Table Enhancements

**New Fields to Add**:

```typescript
export const hubNews = mysqlTable("hub_news", {
  // ... existing fields ...

  // NEW: GS1 Impact Tags
  gs1ImpactTags: json("gs1ImpactTags").$type<string[]>(),
  // Enum values: IDENTIFICATION, PACKAGING_ATTRIBUTES, ESG_REPORTING,
  // DUE_DILIGENCE, TRACEABILITY, DPP, BATTERY_PASSPORT, HEALTHCARE_SUSTAINABILITY,
  // FOOD_SAFETY, LOGISTICS_OPTIMIZATION, CIRCULAR_ECONOMY

  // NEW: Sector Tags
  sectorTags: json("sectorTags").$type<string[]>(),
  // Enum values: RETAIL, HEALTHCARE, FOOD, LOGISTICS, DIY, CONSTRUCTION,
  // TEXTILES, ELECTRONICS, AUTOMOTIVE, CHEMICALS, PACKAGING

  // NEW: Related Standard IDs (direct linkage)
  relatedStandardIds: json("relatedStandardIds").$type<string[]>(),
  // e.g. ["gtin", "gln", "epcis", "gdsn", "digital-link"]

  // NEW: AI-generated GS1 impact analysis
  gs1ImpactAnalysis: text("gs1ImpactAnalysis"),
  // Structured text: "This regulation affects [X] by requiring [Y].
  // GS1 standards [Z] can help companies comply by [W]."

  // NEW: Suggested actions
  suggestedActions: json("suggestedActions").$type<string[]>(),
  // e.g. ["Review packaging data model", "Update GDSN attributes",
  // "Implement EPCIS events"]

  // ... existing fields ...
});
```

**Rationale**:

- `gs1ImpactTags`: Enables filtering by GS1 use case (e.g., "show me all DPP-related news")
- `sectorTags`: Enables sector-specific views (e.g., "healthcare sustainability news")
- `relatedStandardIds`: Direct linkage for bidirectional navigation
- `gs1ImpactAnalysis`: Rich text explaining GS1 relevance (AI-generated)
- `suggestedActions`: Actionable next steps for users

**Migration Strategy**:

1. Add new columns with `ALTER TABLE` (nullable initially)
2. Backfill existing news with AI re-processing (optional, can be done gradually)
3. Update all insert/update queries to include new fields

### 1.2 GS1 Impact Tags Enum

**Defined Values**:

```typescript
export const GS1_IMPACT_TAGS = {
  IDENTIFICATION: "IDENTIFICATION", // GTIN, GLN, SSCC, GRAI, etc.
  PACKAGING_ATTRIBUTES: "PACKAGING_ATTRIBUTES", // Material, recyclability, dimensions
  ESG_REPORTING: "ESG_REPORTING", // CSRD/ESRS data requirements
  DUE_DILIGENCE: "DUE_DILIGENCE", // Supply chain transparency, EUDR
  TRACEABILITY: "TRACEABILITY", // EPCIS, batch tracking, origin
  DPP: "DPP", // Digital Product Passport requirements
  BATTERY_PASSPORT: "BATTERY_PASSPORT", // Battery-specific DPP
  HEALTHCARE_SUSTAINABILITY: "HEALTHCARE_SUSTAINABILITY", // Green Deal Healthcare
  FOOD_SAFETY: "FOOD_SAFETY", // Food traceability, allergens
  LOGISTICS_OPTIMIZATION: "LOGISTICS_OPTIMIZATION", // Zero-emission zones, efficiency
  CIRCULAR_ECONOMY: "CIRCULAR_ECONOMY", // Reuse, repair, recycling
  PRODUCT_MASTER_DATA: "PRODUCT_MASTER_DATA", // GDSN, data quality
} as const;

export type GS1ImpactTag = keyof typeof GS1_IMPACT_TAGS;
```

**Usage in AI Prompts**:

- LLM will be asked to select 1-3 tags per news item
- Fallback heuristics if LLM fails (keyword matching)

### 1.3 Sector Tags Enum

**Defined Values**:

```typescript
export const SECTOR_TAGS = {
  RETAIL: "RETAIL", // General retail, e-commerce
  HEALTHCARE: "HEALTHCARE", // Hospitals, pharma, medical devices
  FOOD: "FOOD", // Food production, distribution, retail
  LOGISTICS: "LOGISTICS", // Transport, warehousing, 3PL
  DIY: "DIY", // Home improvement, construction retail
  CONSTRUCTION: "CONSTRUCTION", // Building materials, contractors
  TEXTILES: "TEXTILES", // Apparel, fashion, fabrics
  ELECTRONICS: "ELECTRONICS", // Consumer electronics, IT hardware
  AUTOMOTIVE: "AUTOMOTIVE", // Vehicles, parts, batteries
  CHEMICALS: "CHEMICALS", // Industrial chemicals, REACH
  PACKAGING: "PACKAGING", // Packaging manufacturers, converters
  GENERAL: "GENERAL", // Cross-sector or not sector-specific
} as const;

export type SectorTag = keyof typeof SECTOR_TAGS;
```

**Usage**:

- AI infers sectors based on content
- Users filter News Hub by sector
- Sector-specific landing pages (e.g., "Healthcare ESG News")

### 1.4 Recommendation Engine Enhancements

**Current**: Generates newsRecommendations linking news → resources

**Enhancement**: Write back into hubNews

```typescript
// After generating recommendations, update hubNews:
await db
  .update(hubNews)
  .set({
    relatedStandardIds: extractedStandardIds,
    // Optionally update relatedRegulationIds if new ones found
  })
  .where(eq(hubNews.id, newsId));
```

**Benefit**: Enables bidirectional queries without joining newsRecommendations

---

## 2. Source Expansion Strategy

### 2.1 Priority 1: Dutch/Benelux National Sources

**Green Deal Sustainable Healthcare**:

- **URL**: `https://www.greendealzorg.nl/nieuws`
- **Type**: INDUSTRY (sector initiative)
- **Scraping**: Playwright (no RSS available)
- **Keywords**: healthcare, sustainability, medical, hospital, waste, emissions, green procurement
- **Credibility**: 0.8 (voluntary pact, but government-backed)

**Plastic Pact NL**:

- **URL**: `https://www.plasticpact.nl/nieuws`
- **Type**: INDUSTRY (sector initiative)
- **Scraping**: Playwright or RSS if available
- **Keywords**: plastic, packaging, recyclability, recycled content, circular economy
- **Credibility**: 0.8

**Zero-Emission City Logistics (ZES)**:

- **URL**: `https://www.zes-amsterdam.nl/nieuws` (or similar for Rotterdam, Utrecht)
- **Type**: INDUSTRY (municipal initiative)
- **Scraping**: Playwright
- **Keywords**: zero-emission, city logistics, electric vehicles, urban delivery
- **Credibility**: 0.8

**Dutch Government Climate Portal**:

- **URL**: `https://www.klimaatakkoord.nl/actueel`
- **Type**: EU_OFFICIAL (national government)
- **Scraping**: Playwright
- **Keywords**: climate agreement, circular economy, Green Deal, sustainability targets
- **Credibility**: 1.0

### 2.2 Priority 2: Missing EU Regulations

**CS3D/CSDDD Specific Sources**:

- Add "CS3D" to REGULATION_KEYWORDS
- Monitor EU Commission CSDDD-specific pages

**Green Claims Directive**:

- **URL**: `https://ec.europa.eu/commission/presscorner/` (filter for Green Claims)
- **Keywords**: green claims, greenwashing, environmental claims, substantiation
- Add to REGULATION_KEYWORDS

**ESPR Delegated Acts**:

- **URL**: `https://ec.europa.eu/info/law/better-regulation/have-your-say`
- **Scraping**: Monitor "Have Your Say" portal for ESPR delegated acts
- **Keywords**: ESPR, delegated act, ecodesign, product-specific rules

### 2.3 Priority 3: GS1-Specific Content

**GS1 NL Data Model Updates**:

- **Strategy**: Manual curation + automated detection
- **Source**: GS1 NL internal announcements (may require API or manual input)
- **Fallback**: Create news items manually when GS1 NL publishes data model changes

**GS1 Europe White Papers**:

- **URL**: `https://www.gs1.eu/resources`
- **Scraping**: Playwright (monitor publications page)
- **Keywords**: white paper, guidance, DPP, EUDR, CSRD, sustainability

**GS1 Global Standards Updates**:

- **URL**: `https://www.gs1.org/standards/development-work-groups`
- **Scraping**: Monitor work group pages for ESG-related updates
- **Keywords**: work group, standard update, EPCIS, Digital Link, GDSN

### 2.4 Source Configuration Template

```typescript
{
  id: "green-deal-healthcare-nl",
  name: "Green Deal Sustainable Healthcare (NL)",
  type: "INDUSTRY",
  websiteUrl: "https://www.greendealzorg.nl/nieuws",
  credibilityScore: 0.8,
  keywords: ["healthcare", "sustainability", "medical", "hospital", "waste", "emissions"],
  enabled: true,
  requiresPlaywright: true, // No RSS available
  sectorHint: ["HEALTHCARE"], // Help AI with sector tagging
  gs1ImpactHint: ["HEALTHCARE_SUSTAINABILITY", "ESG_REPORTING"], // Help AI with GS1 tagging
}
```

**Rationale for Hints**:

- Reduces LLM API calls by providing context
- Improves tagging accuracy
- Enables fallback heuristics if LLM fails

---

## 3. AI Processing Enhancements

### 3.1 Extended AI Output Schema

**New Schema**:

```typescript
export interface EnhancedProcessedNews {
  // Existing fields
  headline: string;
  whatHappened: string;
  whyItMatters: string;
  regulationTags: string[];
  impactLevel: "LOW" | "MEDIUM" | "HIGH";
  newsType:
    | "NEW_LAW"
    | "AMENDMENT"
    | "ENFORCEMENT"
    | "COURT_DECISION"
    | "GUIDANCE"
    | "PROPOSAL";

  // NEW: GS1-specific fields
  gs1ImpactTags: string[]; // 1-3 tags from GS1_IMPACT_TAGS enum
  sectorTags: string[]; // 1-3 tags from SECTOR_TAGS enum
  gs1ImpactAnalysis: string; // 2-3 sentences explaining GS1 relevance
  suggestedActions: string[]; // 2-4 actionable next steps
}
```

**Updated System Prompt**:

```
You are an ESG regulatory intelligence analyst specializing in GS1 supply chain standards.

Your audience: GS1 Netherlands members (retailers, manufacturers, logistics providers, healthcare organizations).

Your task: Analyze news about EU and Dutch sustainability regulations and explain:
1. What happened (regulatory change)
2. Why it matters (business impact)
3. How GS1 standards help (specific identifiers, data models, processes)
4. What users should do next (actionable steps)

Focus on regulations: CSRD, ESRS, EUDR, DPP, PPWR, ESPR, CSDDD, EU Taxonomy, Battery Regulation, REACH, Green Claims, CS3D.

Focus on GS1 standards: GTIN, GLN, SSCC, EPCIS, GDSN, Digital Link, GS1 Web Vocabulary, packaging attributes.

Return JSON with this structure:
{
  "headline": "Clear, concise headline (max 100 chars)",
  "whatHappened": "2 sentences describing the regulatory change",
  "whyItMatters": "1 sentence explaining impact on companies/supply chains",
  "regulationTags": ["CSRD", "ESRS"], // relevant regulation acronyms
  "impactLevel": "HIGH" | "MEDIUM" | "LOW",
  "newsType": "NEW_LAW" | "AMENDMENT" | "ENFORCEMENT" | "COURT_DECISION" | "GUIDANCE" | "PROPOSAL",

  "gs1ImpactTags": ["DPP", "TRACEABILITY"], // 1-3 tags from: IDENTIFICATION, PACKAGING_ATTRIBUTES, ESG_REPORTING, DUE_DILIGENCE, TRACEABILITY, DPP, BATTERY_PASSPORT, HEALTHCARE_SUSTAINABILITY, FOOD_SAFETY, LOGISTICS_OPTIMIZATION, CIRCULAR_ECONOMY, PRODUCT_MASTER_DATA

  "sectorTags": ["RETAIL", "HEALTHCARE"], // 1-3 tags from: RETAIL, HEALTHCARE, FOOD, LOGISTICS, DIY, CONSTRUCTION, TEXTILES, ELECTRONICS, AUTOMOTIVE, CHEMICALS, PACKAGING, GENERAL

  "gs1ImpactAnalysis": "2-3 sentences explaining which GS1 standards/identifiers/data models are relevant and how they help companies comply. Be specific about GTIN, GLN, EPCIS, GDSN, Digital Link, packaging attributes, etc.",

  "suggestedActions": [
    "Review GDSN packaging attributes for recyclability data",
    "Implement EPCIS events for traceability",
    "Update product master data with sustainability fields"
  ] // 2-4 actionable next steps for GS1 NL members
}
```

**Cost Optimization**:

- Cache AI responses by content hash (avoid re-processing identical articles)
- Batch processing where possible
- Use source hints to reduce prompt complexity

### 3.2 Content Analyzer Enhancements

**Current**: Extracts topics, regulation mentions, standard mentions

**Enhancement**: Add sector and GS1 impact inference

```typescript
export interface EnhancedContentAnalysis {
  // Existing
  topics: string[];
  regulationMentions: string[];
  standardMentions: string[];
  impactAreas: string[];
  deadlines: Date[];
  actionableInsights: string[];

  // NEW
  inferredSectors: string[]; // Based on keywords (healthcare, retail, logistics, etc.)
  inferredGS1Impacts: string[]; // Based on keywords (packaging, traceability, DPP, etc.)
  confidence: number; // 0.0 - 1.0 confidence in inference
}
```

**Heuristic Rules** (fallback if LLM fails):

```typescript
const SECTOR_KEYWORDS = {
  HEALTHCARE: [
    "hospital",
    "medical",
    "pharma",
    "healthcare",
    "patient",
    "clinical",
  ],
  RETAIL: ["retail", "store", "consumer", "e-commerce", "shopping"],
  FOOD: ["food", "beverage", "agriculture", "farm", "grocery"],
  LOGISTICS: ["logistics", "transport", "delivery", "warehouse", "3PL"],
  // ... etc
};

const GS1_IMPACT_KEYWORDS = {
  DPP: ["digital product passport", "DPP", "product data", "QR code"],
  TRACEABILITY: [
    "traceability",
    "track and trace",
    "EPCIS",
    "supply chain visibility",
  ],
  PACKAGING_ATTRIBUTES: [
    "packaging",
    "recyclability",
    "material",
    "recycled content",
  ],
  // ... etc
};
```

---

## 4. UX & User Journey Design

### 4.1 Enhanced News Hub Filters

**New Filters to Add**:

1. **GS1 Impact Filter**:

   ```typescript
   <Select value={gs1ImpactFilter} onValueChange={setGS1ImpactFilter}>
     <SelectTrigger>GS1 Impact</SelectTrigger>
     <SelectContent>
       <SelectItem value="all">All Impacts</SelectItem>
       <SelectItem value="DPP">Digital Product Passport</SelectItem>
       <SelectItem value="TRACEABILITY">Traceability</SelectItem>
       <SelectItem value="PACKAGING_ATTRIBUTES">Packaging Data</SelectItem>
       <SelectItem value="ESG_REPORTING">ESG Reporting</SelectItem>
       // ... etc
     </SelectContent>
   </Select>
   ```

2. **Sector Filter**:

   ```typescript
   <Select value={sectorFilter} onValueChange={setSectorFilter}>
     <SelectTrigger>Sector</SelectTrigger>
     <SelectContent>
       <SelectItem value="all">All Sectors</SelectItem>
       <SelectItem value="RETAIL">Retail</SelectItem>
       <SelectItem value="HEALTHCARE">Healthcare</SelectItem>
       <SelectItem value="FOOD">Food & Beverage</SelectItem>
       <SelectItem value="LOGISTICS">Logistics</SelectItem>
       // ... etc
     </SelectContent>
   </Select>
   ```

3. **Milestones Only Toggle**:
   ```typescript
   <Switch
     checked={milestonesOnly}
     onCheckedChange={setMilestonesOnly}
   >
     <Label>High Impact Milestones Only</Label>
   </Switch>
   ```

**Filter Logic**:

- Filters are cumulative (AND logic)
- URL params for shareable filtered views
- Reset button to clear all filters

### 4.2 Timeline View Component

**Design**:

```typescript
<TimelineView
  mode="regulation" // or "sector"
  regulationId="CSRD" // if mode="regulation"
  sectorId="HEALTHCARE" // if mode="sector"
/>
```

**Features**:

- Vertical timeline with date markers
- News items grouped by month
- Milestone indicators (HIGH impact items)
- Click to expand full news detail
- Export timeline as PDF

**Implementation**:

- Query hubNews filtered by regulation or sector
- Sort by publishedDate DESC
- Group by month
- Highlight HIGH impact items

### 4.3 Enhanced News Detail Template

**New Sections**:

```tsx
<NewsDetailPage>
  {/* Existing */}
  <Header title={news.title} metadata={...} />
  <Section title="What Happened">{news.whatHappened}</Section>
  <Section title="Why It Matters">{news.whyItMatters}</Section>

  {/* NEW */}
  <Section title="Impact on GS1 Standards & Data">
    <p>{news.gs1ImpactAnalysis}</p>
    <GS1ImpactBadges tags={news.gs1ImpactTags} />
    <RelatedStandards ids={news.relatedStandardIds} />
  </Section>

  {/* NEW */}
  <Section title="What You Should Do">
    <ActionChecklist items={news.suggestedActions} />
  </Section>

  {/* Existing */}
  <Section title="Regulation Tags">
    <RegulationBadges tags={news.regulationTags} />
  </Section>

  {/* NEW */}
  <Section title="Relevant Sectors">
    <SectorBadges tags={news.sectorTags} />
  </Section>

  {/* Existing */}
  <Section title="Recommended Resources">
    <RecommendedResources newsId={news.id} />
  </Section>

  {/* Existing */}
  <Section title="Sources">
    <MultiSourceDisplay sources={news.sources} />
  </Section>
</NewsDetailPage>
```

**Visual Design**:

- GS1 Impact badges: Purple gradient
- Sector badges: Blue gradient
- Action checklist: Interactive checkboxes (save state to user profile)

### 4.4 Bidirectional Integration

**Regulation Detail Page**:

```tsx
<RegulationDetailPage regulationId="CSRD">
  {/* Existing regulation content */}

  {/* NEW */}
  <Section title="Recent Developments">
    <NewsTimeline regulationId="CSRD" limit={10} showMilestonesOnly={false} />
  </Section>

  {/* NEW */}
  <Section title="GS1 Standards Impacted">
    <RelatedStandardsList regulationId="CSRD" />
  </Section>
</RegulationDetailPage>
```

**GS1 Standard Detail Page**:

```tsx
<StandardDetailPage standardId="epcis">
  {/* Existing standard content */}

  {/* NEW */}
  <Section title="Related Regulatory News">
    <NewsCardList
      standardId="epcis"
      limit={5}
    />
  </Section>

  {/* NEW */}
  <Section title="Regulations Requiring This Standard">
    <RegulationBadges regulationIds={...} />
  </Section>
</StandardDetailPage>
```

**Query Implementation**:

```typescript
// Regulation → News
const recentNews = await db
  .select()
  .from(hubNews)
  .where(
    sql`JSON_CONTAINS(${hubNews.regulationTags}, ${JSON.stringify([regulationId])})`
  )
  .orderBy(desc(hubNews.publishedDate))
  .limit(10);

// Standard → News
const relatedNews = await db
  .select()
  .from(hubNews)
  .where(
    sql`JSON_CONTAINS(${hubNews.relatedStandardIds}, ${JSON.stringify([standardId])})`
  )
  .orderBy(desc(hubNews.publishedDate))
  .limit(5);
```

### 4.5 Regulation Impact Summary Blocks

**Design**:

```tsx
<RegulationImpactSummary regulationId="CSRD">
  <SummarySection title="Key Obligations">
    <ul>
      <li>Annual sustainability reporting for large companies</li>
      <li>Double materiality assessment required</li>
      <li>Value chain data collection mandatory</li>
    </ul>
  </SummarySection>

  <SummarySection title="GS1 Standards Involved">
    <StandardBadge id="gtin" label="GTIN - Product Identification" />
    <StandardBadge id="gln" label="GLN - Location Identification" />
    <StandardBadge id="gdsn" label="GDSN - Product Data Sharing" />
  </SummarySection>

  <SummarySection title="Key Timelines">
    <Timeline>
      <Event date="2024-01-01">CSRD enters into force</Event>
      <Event date="2025-01-01">First reports due (large EU companies)</Event>
      <Event date="2026-01-01">Extended to listed SMEs</Event>
    </Timeline>
  </SummarySection>

  <SummarySection title="GS1 Resources">
    <ResourceLink href="/resources/csrd-guide">
      CSRD Compliance Guide
    </ResourceLink>
    <ResourceLink href="/resources/gdsn-esg">GDSN ESG Attributes</ResourceLink>
  </SummarySection>
</RegulationImpactSummary>
```

**Data Source**:

- Initially: Manual curation for top 10 regulations
- Future: AI-generated from aggregated news + regulation text
- Stored in: New table `regulationImpactSummaries` or as static content

---

## 5. Operations & Observability Design

### 5.1 Coverage Analytics Dashboard

**Metrics to Track**:

1. **News Volume**:
   - Total news items per month
   - News per regulation per month
   - News per sector per month
   - News per source per month

2. **Source Health**:
   - Uptime % per source
   - Fetch errors per source
   - Average articles per fetch
   - Last successful fetch timestamp

3. **AI Processing Quality**:
   - % of items with valid gs1ImpactTags
   - % of items with valid sectorTags
   - % of items with gs1ImpactAnalysis
   - Average LLM processing time

4. **Coverage Heatmap**:
   - Matrix: Regulations (rows) × Months (columns)
   - Cell color: Number of news items
   - Identify blind spots (empty cells)

5. **Critical Events**:
   - Expected milestones per regulation
   - Captured vs missed milestones
   - SLA compliance %

**Dashboard UI**:

```tsx
<CoverageAnalyticsDashboard>
  <MetricCard title="Total News (Last 30 Days)" value={245} trend="+12%" />
  <MetricCard title="Source Uptime" value="94%" trend="-2%" />
  <MetricCard title="AI Tagging Quality" value="87%" trend="+5%" />

  <Chart title="News Volume by Regulation">
    <BarChart data={newsPerRegulation} />
  </Chart>

  <Chart title="Coverage Heatmap">
    <Heatmap rows={regulations} cols={months} data={newsCount} />
  </Chart>

  <Table title="Source Health">
    <SourceHealthRow source="EFRAG" uptime="98%" lastFetch="2 hours ago" />
    <SourceHealthRow source="GS1 NL" uptime="95%" lastFetch="1 hour ago" />
    // ... etc
  </Table>

  <Table title="Critical Events Tracking">
    <EventRow
      regulation="CSRD"
      event="First reports due"
      expected="2025-01-01"
      captured={true}
    />
    <EventRow
      regulation="EUDR"
      event="Enforcement date"
      expected="2024-12-30"
      captured={false}
      alert={true}
    />
    // ... etc
  </Table>
</CoverageAnalyticsDashboard>
```

**Access Control**:

- Admin-only (not public)
- Role: `admin` in user table

### 5.2 Structured Logging & Metrics

**Log Levels**:

- `INFO`: Normal operations (fetch started, fetch completed)
- `WARN`: Recoverable errors (source timeout, AI fallback)
- `ERROR`: Critical failures (database error, LLM API failure)

**Log Format** (JSON):

```json
{
  "timestamp": "2025-12-10T12:00:00Z",
  "level": "INFO",
  "component": "news-fetcher",
  "action": "fetch_completed",
  "sourceId": "efrag-sustainability",
  "itemsFound": 6,
  "duration": 12.5,
  "metadata": {
    "url": "https://www.efrag.org/en/sustainability-reporting/news",
    "method": "playwright"
  }
}
```

**Metrics to Collect**:

```typescript
// Counters
news_items_fetched_total{source="efrag", status="success"}
news_items_processed_total{status="success|failed"}
news_items_deduplicated_total
news_items_filtered_non_esg_total

// Gauges
news_items_in_db_total
news_sources_enabled_total
news_sources_healthy_total

// Histograms
news_fetch_duration_seconds{source="efrag"}
news_ai_processing_duration_seconds
news_recommendation_generation_duration_seconds
```

**Storage**:

- Logs: Console (captured by platform)
- Metrics: In-memory (for now), future: Prometheus/Grafana

### 5.3 Alerting Rules

**Alerts to Implement**:

1. **Source Down**:
   - Trigger: Source fails 3 consecutive fetches
   - Action: Email admin, log ERROR

2. **Coverage Gap**:
   - Trigger: No news for regulation X in 30 days
   - Action: Email admin, log WARN

3. **AI Processing Failure**:
   - Trigger: >20% of items fail AI processing
   - Action: Email admin, log ERROR

4. **Critical Event Missed**:
   - Trigger: Expected milestone not captured within 7 days
   - Action: Email admin, log ERROR

**Implementation**:

- Check conditions during cron runs
- Store alert state in database (avoid duplicate alerts)
- Use `notifyOwner()` helper for email notifications

### 5.4 Backfill Strategy

**Configurable Ingestion Window**:

```typescript
export interface PipelineConfig {
  mode: "normal" | "backfill";
  ageFilterDays: number; // 30 for normal, 200 for backfill
  enableAIProcessing: boolean; // true for normal, optional for backfill
  enableRecommendations: boolean; // true for normal, optional for backfill
}
```

**Backfill Procedure**:

1. **Admin triggers backfill** via UI or CLI
2. **Pipeline runs with backfill config**:
   - Fetch items from last 200 days
   - Skip AI processing (use keyword fallback) to save cost
   - Skip recommendations (generate later)
3. **Post-backfill processing**:
   - Admin reviews items
   - Manually trigger AI processing for important items
   - Generate recommendations in batch

**CLI Command**:

```bash
pnpm run news:backfill --days=200 --source=efrag-sustainability --skip-ai
```

### 5.5 Critical Events Tracking

**Data Model**:

```typescript
export const criticalEvents = mysqlTable("critical_events", {
  id: int("id").primaryKey().autoincrement(),
  regulationId: varchar("regulation_id", { length: 50 }).notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull(), // ADOPTION, ENFORCEMENT, DELEGATED_ACT, GUIDANCE, DELAY
  eventName: varchar("event_name", { length: 255 }).notNull(),
  expectedDate: date("expected_date"),
  capturedDate: date("captured_date"),
  newsId: int("news_id"), // Link to hubNews if captured
  sla: int("sla").default(7), // Days allowed for capture
  status: mysqlEnum("status", ["EXPECTED", "CAPTURED", "MISSED"]).default(
    "EXPECTED"
  ),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
```

**Example Events**:

```typescript
const CRITICAL_EVENTS_CSRD = [
  {
    regulationId: "CSRD",
    eventType: "ENFORCEMENT",
    eventName: "First reports due (large EU companies)",
    expectedDate: "2025-01-01",
    sla: 7,
  },
  {
    regulationId: "CSRD",
    eventType: "ENFORCEMENT",
    eventName: "Extended to listed SMEs",
    expectedDate: "2026-01-01",
    sla: 7,
  },
];
```

**Tracking Logic**:

- During news ingestion, check if news matches any expected event
- If match found, update `capturedDate` and `newsId`, set status to "CAPTURED"
- Daily cron checks for events past `expectedDate + sla` with status "EXPECTED" → mark as "MISSED" and alert

---

## 6. Cost Analysis & Optimization

### 6.1 LLM API Cost Estimation

**Current Usage**:

- ~10 articles/day from GS1.nl + EFRAG
- ~1,500 tokens per article (input + output)
- Cost: ~$0.01 per article (assuming GPT-4o pricing)
- **Monthly cost**: ~$3

**With Enhancements**:

- +10 articles/day from Dutch/Benelux sources
- +Extended schema (gs1ImpactAnalysis, suggestedActions)
- ~2,500 tokens per article
- Cost: ~$0.015 per article
- **Monthly cost**: ~$9

**Optimization Strategies**:

1. **Cache by content hash**: Avoid re-processing identical articles
2. **Batch processing**: Process multiple articles in single LLM call (not supported by structured output, skip)
3. **Source hints**: Reduce prompt complexity with sectorHint and gs1ImpactHint
4. **Fallback heuristics**: Use keyword matching if LLM fails (avoid retry costs)
5. **Selective AI processing**: Only process HIGH/MEDIUM impact items with full AI, use heuristics for LOW

**Expected Savings**: ~30% reduction → **Monthly cost: ~$6**

### 6.2 Database Query Optimization

**New Indexes Needed**:

```sql
CREATE INDEX gs1ImpactTags_idx ON hub_news ((CAST(gs1ImpactTags AS CHAR(255)) COLLATE utf8mb4_bin));
CREATE INDEX sectorTags_idx ON hub_news ((CAST(sectorTags AS CHAR(255)) COLLATE utf8mb4_bin));
CREATE INDEX relatedStandardIds_idx ON hub_news ((CAST(relatedStandardIds AS CHAR(255)) COLLATE utf8mb4_bin));
```

**Note**: MySQL JSON indexing is limited; consider full-text search or materialized views for complex queries

**Query Patterns**:

- Filter by gs1ImpactTags: Use `JSON_CONTAINS()`
- Filter by sectorTags: Use `JSON_CONTAINS()`
- Bidirectional lookups: Use `relatedStandardIds` for fast joins

### 6.3 Scraping Cost & Rate Limiting

**Playwright Browser Usage**:

- ~3 sources with Playwright (EFRAG, GS1.nl, + new Dutch sources)
- ~10 articles/day × 3 sources = 30 page loads/day
- Minimal cost (browser CPU/memory)

**Rate Limiting**:

- Respect robots.txt
- Add delays between requests (1-2 seconds)
- Rotate user agents (avoid detection)

**Expected Impact**: Negligible cost, no rate limit issues expected

---

## 7. Implementation Roadmap

### Phase 3: Schema & Data Model (Est: 2-3 hours)

- Add new columns to hubNews and hubNewsHistory
- Define GS1_IMPACT_TAGS and SECTOR_TAGS enums
- Update TypeScript types
- Write migration script
- Update db-news-helpers.ts

### Phase 4: Source Expansion (Est: 4-6 hours)

- Add 4-5 Dutch/Benelux sources
- Implement Playwright scrapers for new sources
- Add CS3D, Green Claims to keywords
- Test each source individually

### Phase 5: AI Processing Enhancements (Est: 3-4 hours)

- Update news-ai-processor.ts schema
- Add gs1ImpactTags, sectorTags, gs1ImpactAnalysis, suggestedActions to prompt
- Implement fallback heuristics in news-content-analyzer.ts
- Add source hints to news-sources.ts
- Test AI output quality

### Phase 6: Bidirectional Integration (Est: 3-4 hours)

- Add "Recent developments" panel to regulation pages
- Add "Related news" panel to GS1 standard pages
- Implement regulation impact summary component
- Update recommendation engine to write relatedStandardIds

### Phase 7: Timeline & Filters (Est: 2-3 hours)

- Add gs1ImpactTags and sectorTags filters to News Hub
- Add "Milestones Only" toggle
- Implement timeline view component
- Update News Detail template with new sections

### Phase 8: Coverage Analytics (Est: 4-5 hours)

- Build coverage analytics dashboard
- Implement structured logging
- Add metrics collection
- Implement alerting rules
- Add backfill mode to pipeline
- Implement critical events tracking

### Phase 9: Documentation (Est: 2-3 hours)

- Update NEWS_PIPELINE.md
- Update ARCHITECTURE.md
- Document enums and schemas
- Write ISA_NEWSHUB_EVOLUTION_SUMMARY.md
- Update README with new features

**Total Estimated Time**: 20-28 hours

---

## 8. Risks & Mitigation

### Risk 1: AI Tagging Quality

**Risk**: LLM may incorrectly infer gs1ImpactTags or sectorTags

**Mitigation**:

- Implement fallback heuristics (keyword matching)
- Add source hints to guide AI
- Manual review of HIGH impact items
- Iterative prompt refinement based on quality metrics

### Risk 2: Source Reliability

**Risk**: New Dutch/Benelux sources may have unstable URLs or anti-scraping

**Mitigation**:

- Test each source thoroughly before enabling
- Implement retry logic with exponential backoff
- Add source health monitoring and alerts
- Have backup sources for each topic

### Risk 3: Performance Degradation

**Risk**: New filters and queries may slow down News Hub

**Mitigation**:

- Add database indexes for new JSON fields
- Implement query result caching
- Use pagination (already implemented)
- Monitor query performance metrics

### Risk 4: Cost Overruns

**Risk**: Extended AI schema may increase LLM API costs

**Mitigation**:

- Implement content hash caching
- Use selective AI processing (HIGH/MEDIUM only)
- Monitor monthly costs and set budget alerts
- Have fallback to keyword-based processing

### Risk 5: User Confusion

**Risk**: Too many filters and options may overwhelm users

**Mitigation**:

- Progressive disclosure (advanced filters collapsed by default)
- Preset filter combinations (e.g., "Healthcare News", "DPP Updates")
- User onboarding tooltips
- A/B test new UI elements

---

## 9. Success Metrics

### Coverage Metrics

- ✅ **100% of top 10 EU regulations** covered with at least 1 source
- ✅ **80% of Dutch/Benelux initiatives** covered with at least 1 source
- ✅ **90% of critical events** captured within SLA (7 days)

### Quality Metrics

- ✅ **85%+ of news items** have valid gs1ImpactTags
- ✅ **85%+ of news items** have valid sectorTags
- ✅ **90%+ of news items** have gs1ImpactAnalysis
- ✅ **Source uptime** >95%

### User Engagement Metrics

- ✅ **News Hub page views** increase by 50%
- ✅ **Average time on News Detail** increases by 30%
- ✅ **Filter usage** >40% of sessions
- ✅ **Regulation/Standard page views** from news links increase by 40%

### Operational Metrics

- ✅ **Zero missed critical events** in first 3 months
- ✅ **LLM API costs** stay under $10/month
- ✅ **Pipeline uptime** >99%
- ✅ **Average news ingestion time** <5 minutes

---

## 10. Conclusion

This target design transforms ISA's News Hub from a regulatory news aggregator into a comprehensive ESG-GS1 intelligence layer. The design is:

- **Comprehensive**: Covers EU + Dutch/Benelux, all sectors, all GS1 use cases
- **Actionable**: Provides explicit GS1 impact analysis and suggested actions
- **Observable**: Full coverage analytics and health monitoring
- **Cost-efficient**: Optimized LLM usage, estimated $6/month
- **User-centric**: Sector-specific views, timeline visualization, bidirectional navigation
- **Maintainable**: Clear enums, documented schemas, modular architecture

**Next Steps**: Proceed to Phase 3 (Schema Implementation) and iterate through Phases 4-9.
