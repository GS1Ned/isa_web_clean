/**
 * seed-news.mjs — Seed hub_news with realistic EU ESG regulatory news articles
 * Uses direct SQL inserts to populate the news hub for demo/presentation purposes.
 */
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL_POSTGRES;
if (!DATABASE_URL) { console.error("DATABASE_URL_POSTGRES not set"); process.exit(1); }

const sql = postgres(DATABASE_URL, { ssl: "require", prepare: false });

const newsArticles = [
  {
    title: "CSRD First Wave: 11,700 EU Companies Begin Sustainability Reporting",
    summary: "The first wave of companies subject to the Corporate Sustainability Reporting Directive (CSRD) must publish their sustainability reports for fiscal year 2024. This marks the largest expansion of mandatory ESG disclosure in EU history.",
    content: "Starting January 2025, approximately 11,700 large EU companies that were already subject to the Non-Financial Reporting Directive (NFRD) must now comply with the more comprehensive CSRD requirements. These companies must report according to the European Sustainability Reporting Standards (ESRS), covering environmental, social, and governance topics. The double materiality assessment is a cornerstone requirement, obligating companies to report both on how sustainability matters affect the company and how the company impacts people and the environment. GS1 standards play a crucial role in enabling the data collection and traceability needed for CSRD compliance, particularly through EPCIS for supply chain tracking and Digital Link for product-level sustainability data.",
    newsType: "ENFORCEMENT",
    relatedRegulationIds: JSON.stringify([1]),
    sourceUrl: "https://ec.europa.eu/finance/sustainability-reporting",
    sourceTitle: "European Commission - CSRD Implementation",
    credibilityScore: "0.95",
    gs1ImpactTags: JSON.stringify(["EPCIS", "Digital Link", "GS1 DataMatrix"]),
    sectorTags: JSON.stringify(["All Sectors", "Manufacturing", "Retail"]),
    relatedStandardIds: JSON.stringify([1, 2, 3]),
    gs1ImpactAnalysis: "GS1 EPCIS enables granular supply chain traceability data required for Scope 3 emissions reporting under ESRS E1. Digital Link provides product-level access to sustainability data sheets.",
    suggestedActions: JSON.stringify(["Implement EPCIS for supply chain events", "Deploy GS1 Digital Link for product sustainability data", "Map GS1 data attributes to ESRS datapoints"]),
    impactLevel: "HIGH",
    sourceType: "EU_OFFICIAL",
    regulatoryState: "ENFORCEMENT_SIGNAL",
    confidenceLevel: "CONFIRMED_LAW",
    isAutomated: 0,
  },
  {
    title: "EUDR Deforestation Regulation: Supply Chain Traceability Requirements Take Effect",
    summary: "The EU Deforestation Regulation (EUDR) requires companies to prove their supply chains are deforestation-free through geolocation data and due diligence statements.",
    content: "The EUDR mandates that operators and traders placing specific commodities (cattle, cocoa, coffee, oil palm, rubber, soya, wood) on the EU market must conduct due diligence to ensure products are deforestation-free and legally produced. Companies must collect geolocation coordinates of production plots and submit due diligence statements. GS1 standards are essential for EUDR compliance: EPCIS provides the event-level traceability framework, GLN identifies supply chain parties, and GTIN links products to their origin data. The regulation affects an estimated 2.5 million operators across the EU.",
    newsType: "NEW_LAW",
    relatedRegulationIds: JSON.stringify([3]),
    sourceUrl: "https://environment.ec.europa.eu/topics/forests/deforestation_en",
    sourceTitle: "European Commission - Deforestation Regulation",
    credibilityScore: "0.93",
    gs1ImpactTags: JSON.stringify(["EPCIS", "GLN", "GTIN", "GS1 DataMatrix"]),
    sectorTags: JSON.stringify(["Agriculture", "Food & Beverage", "Forestry", "Retail"]),
    relatedStandardIds: JSON.stringify([1, 2, 4, 5]),
    gs1ImpactAnalysis: "EPCIS event data provides the traceability backbone for EUDR compliance. GLN identifies all parties in the supply chain. GTIN with batch/lot enables product-to-origin linking required for due diligence statements.",
    suggestedActions: JSON.stringify(["Map supply chains using GS1 GLN", "Implement EPCIS for commodity traceability", "Link GTIN to geolocation data via Digital Link"]),
    impactLevel: "HIGH",
    sourceType: "EU_OFFICIAL",
    regulatoryState: "ADOPTED",
    confidenceLevel: "CONFIRMED_LAW",
    isAutomated: 0,
  },
  {
    title: "ESPR Digital Product Passport: GS1 Standards Selected as Foundation",
    summary: "The Ecodesign for Sustainable Products Regulation (ESPR) establishes Digital Product Passports (DPP) with GS1 standards as the recommended identification and data carrier framework.",
    content: "The ESPR introduces Digital Product Passports for products sold in the EU, starting with batteries, textiles, and electronics. The European Commission has recognized GS1 standards as a key enabler: GS1 Digital Link provides the URI structure for DPP access, GTIN serves as the primary product identifier, and GS1 DataMatrix is the recommended data carrier. The DPP must contain information on durability, reparability, recyclability, and carbon footprint. This regulation represents the most significant integration of GS1 standards into EU regulatory infrastructure to date.",
    newsType: "NEW_LAW",
    relatedRegulationIds: JSON.stringify([4]),
    sourceUrl: "https://ec.europa.eu/environment/ecodesign-sustainable-products",
    sourceTitle: "European Commission - ESPR",
    credibilityScore: "0.97",
    gs1ImpactTags: JSON.stringify(["Digital Link", "GTIN", "GS1 DataMatrix", "EDI"]),
    sectorTags: JSON.stringify(["Manufacturing", "Electronics", "Textiles", "Batteries"]),
    relatedStandardIds: JSON.stringify([2, 3, 6]),
    gs1ImpactAnalysis: "GS1 Digital Link is the recommended URI resolver for DPP access. GTIN provides the globally unique product identifier. GS1 DataMatrix serves as the physical data carrier on products. This is a landmark moment for GS1 standards in EU regulation.",
    suggestedActions: JSON.stringify(["Prepare GS1 Digital Link infrastructure", "Ensure GTIN assignment for all product lines", "Implement GS1 DataMatrix on packaging"]),
    impactLevel: "HIGH",
    sourceType: "EU_OFFICIAL",
    regulatoryState: "ADOPTED",
    confidenceLevel: "CONFIRMED_LAW",
    isAutomated: 0,
  },
  {
    title: "CSDDD Corporate Due Diligence: Supply Chain Accountability Strengthened",
    summary: "The Corporate Sustainability Due Diligence Directive (CSDDD) requires large companies to identify, prevent, and mitigate adverse human rights and environmental impacts throughout their value chains.",
    content: "The CSDDD establishes mandatory human rights and environmental due diligence obligations for large EU companies and non-EU companies with significant EU turnover. Companies must map their value chains, identify risks, and take appropriate measures. GS1 standards enable the supply chain visibility required: EPCIS tracks product movements and transformations, GLN identifies all value chain participants, and the GS1 Global Data Model provides standardized product attribute exchange. The directive affects approximately 13,000 EU companies and 4,000 non-EU companies.",
    newsType: "NEW_LAW",
    relatedRegulationIds: JSON.stringify([5]),
    sourceUrl: "https://ec.europa.eu/commission/presscorner/detail/en/ip_24_1235",
    sourceTitle: "European Commission - CSDDD Adoption",
    credibilityScore: "0.92",
    gs1ImpactTags: JSON.stringify(["EPCIS", "GLN", "Global Data Model"]),
    sectorTags: JSON.stringify(["All Sectors", "Manufacturing", "Mining", "Textiles"]),
    relatedStandardIds: JSON.stringify([1, 4, 5]),
    gs1ImpactAnalysis: "EPCIS provides the event-level visibility needed for value chain mapping. GLN enables identification of all supply chain partners. The Global Data Model standardizes the product and party attributes needed for due diligence assessments.",
    suggestedActions: JSON.stringify(["Map value chain using GLN", "Implement EPCIS for supply chain visibility", "Establish risk assessment framework using GS1 data"]),
    impactLevel: "HIGH",
    sourceType: "EU_OFFICIAL",
    regulatoryState: "ADOPTED",
    confidenceLevel: "CONFIRMED_LAW",
    isAutomated: 0,
  },
  {
    title: "ESRS E1 Climate Change: Scope 3 Emissions Reporting Requires Supply Chain Data",
    summary: "ESRS E1 mandates detailed climate-related disclosures including Scope 3 emissions, requiring unprecedented supply chain data collection and GS1-enabled traceability.",
    content: "The European Sustainability Reporting Standard E1 (Climate Change) requires companies to disclose their greenhouse gas emissions across all three scopes, with particular emphasis on Scope 3 (value chain emissions). This requires granular data from suppliers and logistics partners. GS1 EPCIS is critical for tracking product movements and calculating transport emissions. The GS1 Global Data Model enables standardized exchange of product carbon footprint data. Companies must also set science-based targets and disclose transition plans. The standard applies to all CSRD-reporting companies starting with FY2024.",
    newsType: "GUIDANCE",
    relatedRegulationIds: JSON.stringify([1, 2]),
    sourceUrl: "https://www.efrag.org/lab6",
    sourceTitle: "EFRAG - ESRS E1 Implementation Guidance",
    credibilityScore: "0.90",
    gs1ImpactTags: JSON.stringify(["EPCIS", "Global Data Model", "EDI"]),
    sectorTags: JSON.stringify(["All Sectors", "Logistics", "Manufacturing"]),
    relatedStandardIds: JSON.stringify([1, 5, 7]),
    gs1ImpactAnalysis: "EPCIS event data enables Scope 3 emissions calculation by tracking product movements, transformations, and logistics. The Global Data Model provides standardized product carbon footprint attributes for supplier data exchange.",
    suggestedActions: JSON.stringify(["Deploy EPCIS for logistics emissions tracking", "Use GS1 EDI for supplier carbon data exchange", "Map GS1 attributes to ESRS E1 datapoints"]),
    impactLevel: "HIGH",
    sourceType: "EU_OFFICIAL",
    regulatoryState: "GUIDANCE",
    confidenceLevel: "CONFIRMED_LAW",
    isAutomated: 0,
  },
  {
    title: "EU Taxonomy Regulation: Technical Screening Criteria Updated for 2026",
    summary: "The EU Taxonomy technical screening criteria have been updated with new activities and thresholds, requiring companies to reassess their taxonomy-eligible and aligned activities.",
    content: "The European Commission has published updated technical screening criteria for the EU Taxonomy, expanding the list of economic activities and refining thresholds for substantial contribution to environmental objectives. Companies reporting under CSRD must disclose their taxonomy-eligible and taxonomy-aligned revenues, CapEx, and OpEx. GS1 product classification (GPC) helps map products to taxonomy-eligible activities, while EPCIS data supports the verification of environmental performance claims.",
    newsType: "AMENDMENT",
    relatedRegulationIds: JSON.stringify([6]),
    sourceUrl: "https://ec.europa.eu/sustainable-finance/taxonomy",
    sourceTitle: "European Commission - EU Taxonomy Updates",
    credibilityScore: "0.88",
    gs1ImpactTags: JSON.stringify(["GPC", "EPCIS", "Global Data Model"]),
    sectorTags: JSON.stringify(["Finance", "Manufacturing", "Energy", "Construction"]),
    relatedStandardIds: JSON.stringify([1, 7]),
    gs1ImpactAnalysis: "GS1 Global Product Classification (GPC) enables systematic mapping of product portfolios to taxonomy-eligible activities. EPCIS data supports environmental performance verification.",
    suggestedActions: JSON.stringify(["Map product portfolio using GPC to taxonomy activities", "Collect environmental performance data via EPCIS"]),
    impactLevel: "MEDIUM",
    sourceType: "EU_OFFICIAL",
    regulatoryState: "ADOPTED",
    confidenceLevel: "CONFIRMED_LAW",
    isAutomated: 0,
  },
  {
    title: "GS1 Netherlands Launches ESG Data Quality Initiative",
    summary: "GS1 Netherlands announces a comprehensive initiative to help Dutch companies improve ESG data quality using GS1 standards, with focus on CSRD and ESPR compliance.",
    content: "GS1 Netherlands has launched a dedicated ESG Data Quality Initiative to support Dutch companies in meeting EU sustainability reporting and product passport requirements. The initiative provides tools, guidance, and training on using GS1 standards (EPCIS, Digital Link, GS1 DataMatrix, Global Data Model) for ESG data collection, validation, and exchange. A pilot program with 50 Dutch companies across retail, food, and manufacturing sectors will test end-to-end data flows from product origin to sustainability report.",
    newsType: "GUIDANCE",
    relatedRegulationIds: JSON.stringify([1, 4]),
    sourceUrl: "https://www.gs1.nl/esg-data-quality",
    sourceTitle: "GS1 Netherlands - ESG Data Quality",
    credibilityScore: "0.85",
    gs1ImpactTags: JSON.stringify(["All GS1 Standards"]),
    sectorTags: JSON.stringify(["Retail", "Food & Beverage", "Manufacturing"]),
    relatedStandardIds: JSON.stringify([1, 2, 3, 4, 5, 6, 7]),
    gs1ImpactAnalysis: "This initiative directly demonstrates how GS1 standards enable ESG compliance. The pilot results will provide concrete implementation patterns for the broader GS1 community.",
    suggestedActions: JSON.stringify(["Join the GS1 NL ESG pilot program", "Assess current GS1 standard adoption for ESG readiness"]),
    impactLevel: "MEDIUM",
    sourceType: "GS1_OFFICIAL",
    regulatoryState: "GUIDANCE",
    confidenceLevel: "MARKET_PRACTICE",
    isAutomated: 0,
  },
  {
    title: "ESRS S1 Own Workforce: Social Reporting Requirements and Data Challenges",
    summary: "ESRS S1 requires detailed workforce disclosures including working conditions, equal treatment, and health & safety metrics, creating new data collection challenges.",
    content: "The ESRS S1 standard on Own Workforce requires companies to disclose comprehensive information about their employees and non-employee workers. This includes metrics on adequate wages, working time, social dialogue, diversity, and occupational health & safety. Companies must report on policies, actions, and targets related to their workforce. While primarily a social standard, GS1 standards support the underlying data infrastructure: GLN identifies work locations, and standardized data exchange via EDI enables consistent HR data aggregation across multinational operations.",
    newsType: "GUIDANCE",
    relatedRegulationIds: JSON.stringify([1, 2]),
    sourceUrl: "https://www.efrag.org/lab6",
    sourceTitle: "EFRAG - ESRS S1 Implementation",
    credibilityScore: "0.87",
    gs1ImpactTags: JSON.stringify(["GLN", "EDI"]),
    sectorTags: JSON.stringify(["All Sectors"]),
    relatedStandardIds: JSON.stringify([4, 5]),
    gs1ImpactAnalysis: "GLN provides standardized location identification for workforce reporting across multiple sites. EDI enables consistent data exchange for HR metrics aggregation.",
    suggestedActions: JSON.stringify(["Map workforce locations using GLN", "Standardize HR data exchange using GS1 EDI"]),
    impactLevel: "MEDIUM",
    sourceType: "EU_OFFICIAL",
    regulatoryState: "GUIDANCE",
    confidenceLevel: "CONFIRMED_LAW",
    isAutomated: 0,
  },
  {
    title: "Battery Regulation: First Digital Product Passport Pilot Results Published",
    summary: "The EU Battery Regulation's Digital Product Passport pilot has published initial results, demonstrating GS1 Digital Link as the primary access mechanism for battery sustainability data.",
    content: "The first pilot results for the EU Battery Regulation's Digital Product Passport (DPP) have been published, showing successful implementation of GS1 Digital Link as the URI resolver for battery passport data. The pilot covered 15 battery manufacturers across 6 EU member states, testing end-to-end data flows from raw material sourcing to end-of-life recycling information. GS1 DataMatrix was used as the physical data carrier, with GTIN providing unique battery identification. The results demonstrate that GS1 standards can support the full DPP lifecycle.",
    newsType: "GUIDANCE",
    relatedRegulationIds: JSON.stringify([7]),
    sourceUrl: "https://ec.europa.eu/environment/batteries",
    sourceTitle: "European Commission - Battery Regulation DPP Pilot",
    credibilityScore: "0.91",
    gs1ImpactTags: JSON.stringify(["Digital Link", "GTIN", "GS1 DataMatrix"]),
    sectorTags: JSON.stringify(["Batteries", "Automotive", "Electronics"]),
    relatedStandardIds: JSON.stringify([2, 3, 6]),
    gs1ImpactAnalysis: "This pilot validates GS1 Digital Link as the DPP access mechanism. GTIN provides unique identification, and GS1 DataMatrix serves as the physical carrier. The results set a precedent for other product categories under ESPR.",
    suggestedActions: JSON.stringify(["Review pilot results for DPP implementation patterns", "Prepare GS1 Digital Link infrastructure for DPP"]),
    impactLevel: "HIGH",
    sourceType: "EU_OFFICIAL",
    regulatoryState: "GUIDANCE",
    confidenceLevel: "CONFIRMED_LAW",
    isAutomated: 0,
  },
  {
    title: "Dutch Implementation of CSRD: ACM Guidance for Netherlands-Based Companies",
    summary: "The Dutch Authority for Consumers and Markets (ACM) has published guidance on CSRD implementation for Netherlands-based companies, with specific attention to supply chain data requirements.",
    content: "The ACM has released comprehensive guidance for Dutch companies preparing for CSRD compliance. The guidance emphasizes the importance of supply chain data quality and recommends GS1 standards for product and location identification. Dutch companies in the first reporting wave (FY2024) must ensure their sustainability reports meet ESRS requirements. The ACM guidance specifically references GS1 Netherlands' ESG Data Quality Initiative as a resource for companies seeking to improve their data collection capabilities.",
    newsType: "GUIDANCE",
    relatedRegulationIds: JSON.stringify([1]),
    sourceUrl: "https://www.acm.nl/nl/csrd-guidance",
    sourceTitle: "ACM - CSRD Implementation Guidance",
    credibilityScore: "0.89",
    gs1ImpactTags: JSON.stringify(["GTIN", "GLN", "EPCIS"]),
    sectorTags: JSON.stringify(["All Sectors"]),
    relatedStandardIds: JSON.stringify([1, 4, 5]),
    gs1ImpactAnalysis: "The ACM's endorsement of GS1 standards for CSRD data collection validates the GS1 approach to ESG compliance. This guidance will influence how Dutch companies implement their data collection strategies.",
    suggestedActions: JSON.stringify(["Review ACM guidance for CSRD requirements", "Align data collection with GS1 standards as recommended"]),
    impactLevel: "MEDIUM",
    sourceType: "DUTCH_NATIONAL",
    regulatoryState: "GUIDANCE",
    confidenceLevel: "GUIDANCE_INTERPRETATION",
    isAutomated: 0,
  },
];

async function seedNews() {
  console.log(`Seeding ${newsArticles.length} news articles...`);
  
  for (let i = 0; i < newsArticles.length; i++) {
    const a = newsArticles[i];
    const publishedDate = new Date(Date.now() - (i * 3 * 24 * 60 * 60 * 1000)); // Stagger by 3 days
    
    try {
      await sql.unsafe(`
        INSERT INTO hub_news 
          (title, summary, content, "newsType", "relatedRegulationIds", "sourceUrl", "sourceTitle",
           "credibilityScore", "gs1ImpactTags", "sectorTags", "relatedStandardIds", "gs1ImpactAnalysis",
           "suggestedActions", "publishedDate", "regulationTags", "impactLevel", "sourceType",
           "retrievedAt", "isAutomated", "sources", "regulatory_state", "confidence_level",
           "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      `, [
        a.title, a.summary, a.content, a.newsType,
        a.relatedRegulationIds, a.sourceUrl, a.sourceTitle,
        a.credibilityScore, a.gs1ImpactTags, a.sectorTags,
        a.relatedStandardIds, a.gs1ImpactAnalysis, a.suggestedActions,
        publishedDate.toISOString(), a.relatedRegulationIds, // regulationTags = same as relatedRegulationIds
        a.impactLevel, a.sourceType,
        new Date().toISOString(), a.isAutomated,
        JSON.stringify([{ name: a.sourceTitle, url: a.sourceUrl }]),
        a.regulatoryState, a.confidenceLevel,
        publishedDate.toISOString(), new Date().toISOString()
      ]);
      console.log(`  [${i+1}/${newsArticles.length}] ${a.title.substring(0, 60)}...`);
    } catch (e) {
      console.error(`  FAIL: ${e.message.substring(0, 100)}`);
    }
  }

  const count = await sql`SELECT COUNT(*) as cnt FROM hub_news`;
  console.log(`\nTotal hub_news records: ${count[0].cnt}`);
  await sql.end();
}

seedNews();
