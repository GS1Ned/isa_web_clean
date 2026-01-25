# ISA News Hub - Overzicht van Bronnen en Features

## Samenvatting

De ISA (Intelligent Standards Architect) website heeft een uitgebreide **News Hub** die ESG-gerelateerd nieuws verzamelt, analyseert en presenteert. Het systeem richt zich op EU-regelgeving en GS1-standaarden met AI-gestuurde analyse en aanbevelingen.

---

## 📰 Actieve Nieuwsbronnen

### EU Officiële Bronnen (Credibility Score: 1.0)

1. **EUR-Lex Official Journal** (`eurlex-oj`)
   - Type: EU_OFFICIAL
   - Methode: Playwright scraper (geen RSS)
   - Focus: Officiële publicaties in Official Journal L-serie
   - Keywords: CSRD, ESRS, EUDR, DPP, PPWR, ESPR, sustainability, climate, deforestation
   - Status: ✅ Actief

2. **European Commission Press Corner** (`eu-commission-environment`)
   - Type: EU_OFFICIAL
   - RSS: `https://ec.europa.eu/commission/presscorner/api/rss?language=en`
   - Focus: Officiële persberichten van de Europese Commissie
   - Keywords: CSRD, ESRS, EUDR, DPP, PPWR, ESPR, Green Deal, circular economy
   - Status: ✅ Actief

3. **EFRAG - Sustainability Reporting** (`efrag-sustainability`)
   - Type: EU_OFFICIAL
   - RSS: `https://www.efrag.org/rss`
   - Focus: ESRS standaarden en sustainability reporting
   - Keywords: ESRS, CSRD, sustainability reporting, disclosure, datapoint
   - Status: ✅ Actief

### GS1 Officiële Bronnen (Credibility Score: 0.9)

4. **GS1 Netherlands News** (`gs1-nl-news`)
   - Type: GS1_OFFICIAL
   - RSS: `https://www.gs1.nl/rss.xml`
   - Focus: Nederlandse GS1 nieuws en updates
   - Keywords: CSRD, ESRS, EUDR, DPP, PPWR, traceability, EPCIS, Digital Product Passport
   - Status: ✅ Actief

5. **GS1 in Europe Updates** (`gs1-eu-updates`)
   - Type: GS1_OFFICIAL
   - RSS: `https://www.gs1.eu/news-events/rss`
   - Focus: Europese GS1 updates en standaarden
   - Keywords: CSRD, ESRS, EUDR, DPP, PPWR, ESPR, EU regulation, traceability
   - Status: ✅ Actief

### Nederlandse Nationale Bronnen (Credibility Score: 0.95)

6. **Green Deal Duurzame Zorg** (`greendeal-healthcare`)
   - Type: DUTCH_NATIONAL
   - Focus: Duurzaamheid in de gezondheidszorg
   - Keywords: healthcare, sustainability, circular economy, medical devices, CSRD, ESRS
   - Status: ✅ Actief

7. **Op weg naar ZES** (`zes-logistics`)
   - Type: DUTCH_NATIONAL
   - Focus: Zero-emission zones en logistiek
   - Keywords: zero-emission, logistics, freight, electric vehicles, urban mobility, CO2, Scope 3
   - Status: ✅ Actief

### Uitgeschakelde Bronnen

- **EUR-Lex Press Releases** - Geblokkeerd door AWS WAF CAPTCHA
- **GS1 Global News** - Geblokkeerd door Azure WAF

---

## 🗄️ Database Structuur

### Hoofdtabel: `hub_news`

**Basis Velden:**
- `id`, `title`, `summary`, `content`
- `newsType`: NEW_LAW, AMENDMENT, ENFORCEMENT, COURT_DECISION, GUIDANCE, PROPOSAL
- `publishedDate`, `createdAt`, `updatedAt`

**Bron Informatie:**
- `sourceUrl`, `sourceTitle`, `sourceType`
- `credibilityScore` (0.00 - 1.00)
- `sources` (JSON - meerdere bronnen bij deduplicatie)
- `isAutomated` (0/1)
- `retrievedAt`

**Regelgeving & Impact:**
- `relatedRegulationIds` (JSON array)
- `regulationTags` (JSON array - CSRD, ESRS, EUDR, DPP, etc.)
- `impactLevel`: LOW, MEDIUM, HIGH

**GS1-Specifieke Velden:**
- `gs1ImpactTags` (JSON) - 12 mogelijke tags:
  - ESG_REPORTING, DPP, TRACEABILITY, PRODUCT_MASTER_DATA
  - IDENTIFICATION, CIRCULAR_ECONOMY, SUPPLY_CHAIN_VISIBILITY
  - COMPLIANCE, INTEROPERABILITY, DATA_QUALITY
  - SERIALIZATION, SUSTAINABILITY_METRICS
  
- `sectorTags` (JSON) - 12 sectoren:
  - RETAIL, HEALTHCARE, LOGISTICS, MANUFACTURING
  - FOOD_BEVERAGE, FASHION_TEXTILES, ELECTRONICS
  - CONSTRUCTION, CHEMICALS, AUTOMOTIVE, AGRICULTURE, GENERAL

- `relatedStandardIds` (JSON) - Links naar GS1 standaarden
- `gs1ImpactAnalysis` (TEXT) - AI-gegenereerde analyse (2-3 zinnen)
- `suggestedActions` (JSON) - 2-4 concrete actiepunten

### Ondersteunende Tabellen

**`hub_news_history`**
- Archivering van oude nieuws (200-dagen window)
- Zelfde structuur als `hub_news`
- Extra velden: `originalId`, `archivedAt`, `originalCreatedAt`, `originalUpdatedAt`

**`news_recommendations`**
- Links tussen nieuws en regelgeving/standaarden
- Velden: `newsId`, `regulationType`, `regulationId`, `standardId`, `relevanceScore`, `reasoning`

---

## 🔧 Backend Features & Code

### 1. News Pipeline Orchestratie

**Bestand:** `server/news-pipeline.ts`

Hoofdfuncties:
- `runNewsPipeline(mode)` - Hoofdorchestrator
- Modes: `full`, `fetch-only`, `process-only`, `dedupe-only`
- Stappen:
  1. Fetch nieuws van bronnen
  2. AI processing (samenvatting, tags, analyse)
  3. Deduplicatie (cross-source)
  4. Aanbevelingen genereren
  5. Archivering (>200 dagen)

### 2. News Fetching

**Bestand:** `server/news-fetcher.ts`

- Haalt nieuws op van alle actieve bronnen
- Ondersteunt RSS feeds en custom scrapers
- Retry logica met exponential backoff
- Filtering op ESG keywords

**Scrapers:**
- `server/news-scraper-efrag.ts` - EFRAG sustainability
- `server/news-scraper-eurlex.ts` - EUR-Lex Official Journal
- `server/news-scraper-gs1nl.ts` - GS1 Netherlands (Playwright)
- `server/news-scraper-gs1eu.ts` - GS1 Europe
- `server/news-scraper-greendeal.ts` - Green Deal Healthcare
- `server/news-scraper-zes.ts` - Zero-emission zones

### 3. AI Processing

**Bestand:** `server/news-ai-processor.ts`

AI-gegenereerde content:
- **Samenvatting** (3-4 zinnen)
- **GS1 Impact Analyse** (2-3 zinnen over relevantie voor GS1 standaarden)
- **Suggested Actions** (2-4 concrete actiepunten)
- **Tags Inferentie:**
  - `gs1ImpactTags` (12 mogelijke waarden)
  - `sectorTags` (12 sectoren)
  - `regulationTags` (CSRD, ESRS, EUDR, etc.)
  - `impactLevel` (LOW/MEDIUM/HIGH)
  - `newsType` (NEW_LAW, AMENDMENT, etc.)

**Fallback:** Keyword-based heuristics wanneer LLM faalt

### 4. Deduplicatie

**Bestand:** `server/news-deduplicator.ts`

- Cross-source deduplicatie op basis van:
  - Titel similarity (Levenshtein distance)
  - Publicatiedatum (binnen 7 dagen)
  - Content overlap
- Merge strategie: hoogste credibility score wint
- Behoudt alle bronnen in `sources` array

### 5. Content Analyse

**Bestand:** `server/news-content-analyzer.ts`

- Topic extractie
- Keyword matching voor regelgeving
- Impact level bepaling
- Sector identificatie

### 6. Aanbevelingen

**Bestand:** `server/news-recommendation-engine.ts`

- Linkt nieuws aan regelgeving en standaarden
- Relevance scoring
- Bidirectionele links (nieuws ↔ regelgeving)

### 7. Archivering

**Bestand:** `server/news-archival.ts`

- Verplaatst nieuws ouder dan 200 dagen naar `hub_news_history`
- Behoudt alle data voor historische analyse

### 8. Scheduling

**Bestand:** `server/news-cron-scheduler.ts`

- Automatische pipeline uitvoering
- Configureerbare intervallen
- Cron-based scheduling

### 9. Health Monitoring

**Bestand:** `server/news-health-monitor.ts`

- Source health checks
- Pipeline execution monitoring
- Error tracking en alerting

### 10. Admin API

**Bestand:** `server/news-admin-router.ts`

tRPC procedures voor admin:
- `admin.news.runPipeline` - Handmatige pipeline uitvoering
- `admin.news.getPipelineLogs` - Logging inzage
- `admin.news.getSourceHealth` - Bron status
- CRUD operaties voor nieuws

---

## 🎨 Frontend Features

### 1. News Hub Pagina

**Bestand:** `client/src/pages/NewsHub.tsx`

Features:
- Overzicht van alle nieuws
- Filters:
  - Regelgeving (CSRD, ESRS, EUDR, DPP, PPWR, etc.)
  - Impact Level (LOW, MEDIUM, HIGH)
  - Sector (12 sectoren)
  - GS1 Impact Tags (12 tags)
  - Bron Type (EU_OFFICIAL, GS1_OFFICIAL, etc.)
  - Datum range
- Zoekfunctionaliteit
- Paginering
- Sortering (datum, relevantie)

### 2. News Detail Pagina

**Bestand:** `client/src/pages/NewsDetail.tsx`

Toont:
- Volledige artikel content
- GS1 Impact Analyse
- Suggested Actions (actiepunten)
- Gerelateerde regelgeving
- Gerelateerde GS1 standaarden
- Bron informatie en credibility score
- Tags (regelgeving, sector, GS1 impact)

### 3. Latest News Panel

**Bestand:** `client/src/components/LatestNewsPanel.tsx`

- Widget voor homepage
- Toont meest recente nieuws
- Compact formaat
- Link naar volledige News Hub

### 4. News Timeline

**Bestand:** `client/src/components/NewsTimeline.tsx`

- Chronologische weergave
- Gebruikt op regelgeving detail pagina's
- Toont "Recent developments" per regelgeving

### 5. News Cards

**Bestanden:**
- `client/src/components/NewsCard.tsx` - Standaard card
- `client/src/components/NewsCardCompact.tsx` - Compacte versie
- `client/src/components/NewsCardSkeleton.tsx` - Loading state

### 6. Admin Dashboard

**Bestanden:**
- `client/src/pages/AdminNewsPipelineManager.tsx` - Pipeline management
- `client/src/pages/NewsAdmin.tsx` - Nieuws CRUD
- `client/src/pages/AdminNewsPanel.tsx` - Admin overzicht

Features:
- Handmatige pipeline uitvoering
- Pipeline logs inzage
- Source health monitoring
- Nieuws bewerken/verwijderen
- Bulk operaties

---

## 🔍 Belangrijke Keywords & Regelgeving

### Gemonitorde Regelgeving

1. **CSRD** - Corporate Sustainability Reporting Directive
2. **ESRS** - European Sustainability Reporting Standards
3. **EUDR** - EU Deforestation Regulation
4. **DPP** - Digital Product Passport
5. **PPWR** - Packaging and Packaging Waste Regulation
6. **ESPR** - Ecodesign for Sustainable Products Regulation
7. **CSDDD** - Corporate Sustainability Due Diligence Directive
8. **EU Taxonomy** - Taxonomy Regulation
9. **Battery Regulation** - Battery passport
10. **REACH** - Chemicals regulation

### GS1 Impact Tags (12 categorieën)

1. **ESG_REPORTING** - Sustainability reporting en disclosure
2. **DPP** - Digital Product Passport implementatie
3. **TRACEABILITY** - Supply chain traceability
4. **PRODUCT_MASTER_DATA** - Product data management
5. **IDENTIFICATION** - Product identificatie (GTIN, etc.)
6. **CIRCULAR_ECONOMY** - Circulaire economie
7. **SUPPLY_CHAIN_VISIBILITY** - Supply chain transparantie
8. **COMPLIANCE** - Regulatory compliance
9. **INTEROPERABILITY** - Data interoperabiliteit
10. **DATA_QUALITY** - Data kwaliteit
11. **SERIALIZATION** - Product serialisatie
12. **SUSTAINABILITY_METRICS** - Duurzaamheidsmetrieken

### Sector Tags (12 sectoren)

1. **RETAIL** - Detailhandel
2. **HEALTHCARE** - Gezondheidszorg
3. **LOGISTICS** - Logistiek en transport
4. **MANUFACTURING** - Productie
5. **FOOD_BEVERAGE** - Voedsel en dranken
6. **FASHION_TEXTILES** - Mode en textiel
7. **ELECTRONICS** - Elektronica
8. **CONSTRUCTION** - Bouw
9. **CHEMICALS** - Chemie
10. **AUTOMOTIVE** - Automotive
11. **AGRICULTURE** - Landbouw
12. **GENERAL** - Algemeen

---

## 🔄 News Pipeline Workflow

```
1. FETCH (news-fetcher.ts)
   ├─ RSS feeds ophalen
   ├─ Custom scrapers uitvoeren
   ├─ ESG keyword filtering
   └─ Opslaan in database (raw)

2. AI PROCESSING (news-ai-processor.ts)
   ├─ Samenvatting genereren
   ├─ GS1 impact analyse
   ├─ Suggested actions
   ├─ Tags inferentie (regelgeving, sector, GS1)
   ├─ Impact level bepaling
   └─ Database update met AI velden

3. DEDUPLICATIE (news-deduplicator.ts)
   ├─ Cross-source matching
   ├─ Merge duplicaten
   └─ Sources array bijwerken

4. AANBEVELINGEN (news-recommendation-engine.ts)
   ├─ Link naar regelgeving
   ├─ Link naar GS1 standaarden
   └─ Relevance scoring

5. ARCHIVERING (news-archival.ts)
   ├─ Nieuws > 200 dagen identificeren
   ├─ Verplaatsen naar hub_news_history
   └─ Cleanup actieve tabel
```

---

## 📊 Data Flow

```
Externe Bronnen (RSS/Scrapers)
    ↓
News Fetcher (filtering)
    ↓
Database (hub_news - raw)
    ↓
AI Processor (LLM + fallback)
    ↓
Database (hub_news - enriched)
    ↓
Deduplicator (cross-source)
    ↓
Recommendation Engine
    ↓
Database (news_recommendations)
    ↓
Frontend (NewsHub, NewsDetail)
    ↓
Gebruiker
```

---

## 🧪 Testing

**Test Bestanden:**
- `server/news-ai-processor.test.ts` - AI processing tests (10 tests)
- `server/news-pipeline.test.ts` - Pipeline orchestratie tests
- `server/news-deduplicator.test.ts` - Deduplicatie tests
- `server/news-recommendation-engine.test.ts` - Aanbevelingen tests
- `server/news-health-monitor.test.ts` - Health monitoring tests
- `server/news-filters.test.ts` - Filter logica tests

**Test Coverage:**
- ✅ CSRD nieuws processing met GS1 analyse
- ✅ DPP nieuws processing met relevante tags
- ✅ Fallback processing wanneer LLM faalt
- ✅ GS1 impact tag inferentie
- ✅ Sector tag inferentie
- ✅ Deduplicatie logica
- ✅ Recommendation scoring

---

## 📝 Configuratie Bestanden

1. **`server/news-sources.ts`** - Bronnen configuratie
2. **`server/news-pipeline-config.ts`** - Pipeline instellingen
3. **`shared/news-tags.ts`** - Tag definities (GS1_IMPACT_TAGS, SECTOR_TAGS)

---

## 🚀 Gebruik

### Handmatig Pipeline Uitvoeren

Via Admin Dashboard:
1. Ga naar `/admin/news-pipeline`
2. Selecteer mode (full/fetch-only/process-only)
3. Klik "Run Pipeline"
4. Bekijk logs en resultaten

Via Code:
```typescript
import { runNewsPipeline } from './server/news-pipeline';

await runNewsPipeline('full');
```

### Nieuws Ophalen in Frontend

```typescript
// Alle nieuws
const { data: news } = trpc.news.getAll.useQuery({
  limit: 20,
  offset: 0,
  filters: {
    regulationTags: ['CSRD', 'ESRS'],
    sectorTags: ['RETAIL'],
    impactLevel: 'HIGH'
  }
});

// Enkel nieuws item
const { data: article } = trpc.news.getById.useQuery({ id: 123 });

// Nieuws per regelgeving
const { data: relatedNews } = trpc.news.getByRegulation.useQuery({
  regulationId: 5
});
```

---

## 📈 Statistieken & Monitoring

**Beschikbare Metrics:**
- Aantal actieve bronnen
- Aantal opgehaalde artikelen per bron
- AI processing success rate
- Deduplicatie ratio
- Average credibility score
- Coverage per regelgeving
- Coverage per sector

**Health Checks:**
- Source availability
- RSS feed status
- Scraper status
- AI service status
- Database status

---

## 🔮 Toekomstige Uitbreidingen (Todo)

Zie `todo.md` voor volledige roadmap, maar belangrijkste items:

### Phase 4: Source Expansion
- [ ] CS3D/CSDDD bron toevoegen
- [ ] Green Claims Directive bron
- [ ] ESPR delegated acts bron
- [ ] Plastic Pact NL bron
- [ ] GS1 white papers bron

### Phase 6: Bidirectional Integration
- [ ] "Related news" panel op GS1 standaard pagina's
- [ ] Regulation impact summaries
- [ ] Timeline views per sector

### Phase 7: UX Enhancements
- [ ] Sector-specific landing pages
- [ ] "What this means for you" personalisatie
- [ ] Email notifications voor nieuwe regelgeving

---

## 📚 Documentatie

- **`NEWS_PIPELINE.md`** - Gedetailleerde pipeline documentatie
- **`todo.md`** - Volledige roadmap en audit
- **`ISA_NEWS_OVERVIEW.md`** - Dit document

---

## Conclusie

De ISA News Hub is een robuust systeem dat:
- ✅ 7 actieve bronnen monitort (EU + GS1 + NL)
- ✅ AI-gestuurde analyse en tagging
- ✅ GS1-specifieke impact analyse
- ✅ Bidirectionele links met regelgeving
- ✅ Uitgebreide filtering en zoekfunctionaliteit
- ✅ Admin dashboard voor management
- ✅ Automatische scheduling en archivering
- ✅ Comprehensive testing (21+ tests)

Het systeem is klaar voor uitbreiding met meer bronnen en features volgens de roadmap in `todo.md`.
