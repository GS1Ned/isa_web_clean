# Dutch/Benelux News Sources Research

## 1. Green Deal Duurzame Zorg (Sustainable Healthcare)

**Official Website:** https://www.greendealduurzamezorg.nl/service/nieuws/

**Structure:**

- News page with article cards showing title, date, excerpt
- Publication dates in format: "1 december 2025"
- Each article has a "Lees meer" (Read more) link
- No visible RSS feed
- Articles appear in reverse chronological order

**Content Topics:**

- Healthcare sustainability initiatives
- Green Teams in hospitals
- Sustainable procurement in healthcare
- Energy efficiency in healthcare facilities
- Circular economy in medical devices
- Sustainable food in long-term care
- Mental health and nature (Groene GGZ)
- Carbon footprint reduction

**Sample Articles (Dec 2025):**

1. "50 nieuwe partijen tekenen Green Deal Duurzame Zorg 3.0" (1 Dec 2025)
2. "Duurzame inkoop vraagt om dialoog" (19 Nov 2025)
3. "Nieuwe samenwerking versnelt verduurzaming van voeding in langdurige zorg" (17 Nov 2025)

**ESG Relevance:**

- HIGH - Direct connection to CSRD (healthcare sector sustainability reporting)
- MEDIUM - Connection to ESRS S1 (workforce health and safety)
- MEDIUM - Connection to circular economy (medical devices, packaging)

**GS1 Relevance:**

- Medical device identification (GTIN, GDSN)
- Healthcare supply chain traceability (EPCIS)
- Sustainable procurement data standards

**Scraping Strategy:**

- Playwright scraper needed (JavaScript-rendered content)
- Parse article cards from news listing page
- Extract: title, date, excerpt, detail URL
- Follow detail URLs to get full article content
- No RSS feed available - must scrape HTML

---

## 2. Verpact (Successor to Plastic Pact NL)

**Official Website:** https://www.verpact.nl/nl/actueel

**Background:**

- Plastic Pact NL ended January 1, 2024
- Verpact is the official Extended Producer Responsibility (EPR) organization
- Manages circular economy for packaging in Netherlands
- Government-mandated packaging waste management

**Structure:**

- News page appears to have technical issues (timeout)
- Alternative sources: KIDV, Verpakkingsmanagement.nl, DutchNews.nl
- Press releases and policy updates available
- Focus on packaging circularity, recycling targets, deposit systems

**Content Topics:**

- Packaging recycling targets and results
- Tariff differentiation for recyclable packaging
- Deposit systems (statiegeld) for bottles and cans
- Circular economy policy updates
- Recycling infrastructure developments
- Producer responsibility regulations

**Sample Articles (2025):**

1. "Verpact maakt afvalbeheer- en statiegeldtarieven 2026 bekend"
2. "Tariefdifferentiatie recyclebare verpakkingen succesvol" (46% plastic packaging received discount)
3. "Verpact bundelt krachten onder één merknaam" (Jul 2025)
4. "Verpact: 2024 packaging recycling targets largely met" (Nov 2025)

**ESG Relevance:**

- HIGH - Direct connection to PPWR (Packaging and Packaging Waste Regulation)
- HIGH - Connection to circular economy targets
- MEDIUM - Connection to ESPR (Ecodesign for Sustainable Products Regulation)

**GS1 Relevance:**

- Packaging identification (GTIN for packaging SKUs)
- Material composition data (GDSN attributes)
- Recyclability information (GS1 Web Vocabulary)
- Deposit system tracking (EPCIS for returnable packaging)

**Scraping Strategy:**

- PRIMARY SOURCE: Industry news sites (Verpakkingsmanagement.nl, KIDV.nl)
- SECONDARY SOURCE: DutchNews.nl for policy updates
- RSS feeds may be available on industry sites
- Frequency: Monthly scraping (policy updates ~1-2x per month)

---

## 3. Zero-Emission Zones (ZES / Op weg naar ZES)

**Official Website:** https://opwegnaarzes.nl/actueel/nieuws

**Background:**

- 18 Dutch cities launched ZEZ-F (Zero-Emission Zones for Freight) in January 2025
- Expanding to 29 municipalities by 2030
- National framework for urban freight decarbonization
- Government-backed initiative with logistics broker support

**Structure:**

- Main site: opwegnaarzes.nl ("On the Way to ZES")
- News section: /actueel/nieuws
- Entrepreneur stories: /actueel/verhalen-van-ondernemers
- Static information pages (access rules, exemptions, municipalities)

**Content Topics:**

- Zero-emission zone rollout updates
- Electric van and truck adoption statistics
- Access rules and transition periods
- Exemption policies
- Logistics broker services
- Municipality-specific implementations
- Impact on urban air quality and CO2 emissions

**Sample News (2025):**

1. "Netherlands leads Europe's transition to zero-emission freight" (Oct 2025)
2. "Dutch Zero-Emission Zones Boost Switch To Electric Vans" (Oct 2025)
3. "18 cities introduce zero-emission zones" (Jan 2025)

**ESG Relevance:**

- HIGH - Connection to CSRD Scope 3 emissions (logistics)
- MEDIUM - Connection to ESRS E1 (Climate Change)
- MEDIUM - Connection to urban sustainability initiatives

**GS1 Relevance:**

- Logistics tracking (EPCIS for zero-emission delivery)
- Vehicle identification for access control
- Supply chain visibility (last-mile delivery)
- Carbon footprint tracking (transport emissions)

**Scraping Strategy:**

- Playwright scraper needed (JavaScript-rendered content)
- Target URL: https://opwegnaarzes.nl/actueel/nieuws
- Parse news articles and entrepreneur stories
- Extract: title, date, excerpt, detail URL
- Follow detail URLs for full content
- Frequency: Monthly scraping (policy updates ~1-2x per month)

---

## Technical Notes

**Green Deal Zorg Scraper Requirements:**

- Use Playwright (site uses JavaScript rendering)
- Target URL: https://www.greendealduurzamezorg.nl/service/nieuws/
- Article selector: Need to inspect DOM for article cards
- Date parsing: Dutch date format "1 december 2025"
- Full content: Follow "Lees meer" links to detail pages
- Frequency: Weekly scraping (news published ~2-3x per month)

**Integration with News Pipeline:**

- Add to news-sources.ts as "GREENDEAL_HEALTHCARE"
- Source type: "Dutch National"
- Credibility: HIGH (government-backed initiative)
- Keywords: healthcare, sustainability, circular economy, medical devices
- Expected volume: 2-3 articles per month

---

## Implementation Summary

### Recommended Approach

Based on research, implement **2 out of 3 sources** for Phase 4:

**Priority 1: Green Deal Duurzame Zorg** ✅

- Clear news page with regular updates (2-3 articles/month)
- High ESG relevance (healthcare sustainability)
- Strong GS1 connection (medical devices, supply chain)
- Playwright scraper feasible

**Priority 2: Op weg naar ZES (Zero-Emission Zones)** ✅

- Active government initiative (launched Jan 2025)
- High policy impact (29 municipalities by 2030)
- Strong logistics/supply chain focus
- Playwright scraper feasible

**Deferred: Verpact** ⏸️

- Website has technical issues (timeout errors)
- Can use secondary sources (KIDV, Verpakkingsmanagement) instead
- Lower publication frequency
- Consider adding in future iteration

### Technical Implementation Plan

**Phase 4.1: Green Deal Zorg Scraper**

1. Create `server/news/news-scraper-greendeal.ts`
2. Target: https://www.greendealduurzamezorg.nl/service/nieuws/
3. Parse article cards, extract title/date/excerpt/URL
4. Follow detail URLs for full content
5. Add to news-sources.ts as "GREENDEAL_HEALTHCARE"

**Phase 4.2: ZES Scraper**

1. Create `server/news/news-scraper-zes.ts`
2. Target: https://opwegnaarzes.nl/actueel/nieuws
3. Parse news articles and entrepreneur stories
4. Extract title/date/excerpt/URL, follow detail URLs
5. Add to news-sources.ts as "ZES_LOGISTICS"

**Phase 4.3: Integration**

1. Update news-fetcher.ts to call both scrapers
2. Update news-cron-scheduler.ts to include Dutch sources
3. Test end-to-end pipeline with Dutch content
4. Verify AI processor handles Dutch language articles

### Expected Impact

**Coverage Expansion:**

- Current: 2 EU official sources (GS1.nl, EFRAG)
- After Phase 4: 4 sources (2 EU + 2 Dutch)
- Geographic coverage: EU-wide + Netherlands-specific

**Topic Expansion:**

- Healthcare sustainability (Green Deal Zorg)
- Urban logistics and emissions (ZES)
- Packaging circularity (future: Verpact via secondary sources)

**User Value:**

- GS1 NL members get Dutch-specific compliance intelligence
- Sector-specific insights (healthcare, logistics, packaging)
- National policy updates alongside EU regulations
