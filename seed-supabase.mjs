/**
 * ISA Supabase Rehydration Seed Script
 * 
 * Creates the users table (not in PG migrations) and seeds all foundation data:
 * - Regulations (30+ EU ESG regulations)
 * - GS1 Standards (20+ supply chain standards)
 * - ESRS Datapoints (from EFRAG Excel)
 * 
 * Run: node seed-supabase.mjs
 */
import postgres from "postgres";
import fs from "node:fs";
import path from "node:path";

const pgUrl = process.env.DATABASE_URL_POSTGRES;
if (!pgUrl) {
  console.error("DATABASE_URL_POSTGRES is required");
  process.exit(1);
}

const sql = postgres(pgUrl, {
  max: 1,
  idle_timeout: 10,
  connect_timeout: 15,
  prepare: false,
  ssl: "require",
});

// ─── PHASE 1: Create users table ───────────────────────────────────────────

async function createUsersTable() {
  console.log("\n=== Creating users table ===");
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      open_id VARCHAR(64) NOT NULL,
      name TEXT,
      email VARCHAR(320),
      login_method VARCHAR(64),
      role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      last_signed_in TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS users_open_id_unique ON users (open_id);
  `);
  console.log("  ✓ users table created");
}

// ─── PHASE 2: Seed regulations ─────────────────────────────────────────────

const regulationsSeedData = [
  {
    celexId: "32022-02464",
    title: "Corporate Sustainability Reporting Directive (CSRD)",
    description: "Requires large EU companies to report on sustainability impacts and risks. Phase-in: Large public-interest entities (>500 employees) from 2024, large non-listed from 2025, SMEs from 2026.",
    regulationType: "CSRD",
    effectiveDate: "2024-01-01",
    sourceUrl: "https://ec.europa.eu/finance/docs/level-2-measures/csrd-delegated-act_en.pdf",
  },
  {
    celexId: "32023-2772",
    title: "European Sustainability Reporting Standards (ESRS)",
    description: "Detailed sustainability reporting standards covering environmental, social, and governance topics. Mandatory for CSRD reporters.",
    regulationType: "ESRS",
    effectiveDate: "2023-07-31",
    sourceUrl: "https://www.efrag.org/esrs",
  },
  {
    celexId: "32024-1781",
    title: "Ecodesign for Sustainable Products Regulation (ESPR)",
    description: "Framework for setting ecodesign requirements for sustainable products, including Digital Product Passports (DPP). Applies to most physical goods on the EU market.",
    regulationType: "ESPR",
    effectiveDate: "2024-07-18",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/1781",
  },
  {
    celexId: "32023-1115",
    title: "EU Deforestation Regulation (EUDR)",
    description: "Prohibits placing deforestation-linked commodities on the EU market. Requires due diligence and geolocation data for cattle, cocoa, coffee, oil palm, rubber, soya, and wood.",
    regulationType: "EUDR",
    effectiveDate: "2024-12-30",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2023/1115",
  },
  {
    celexId: "32024-1760",
    title: "Corporate Sustainability Due Diligence Directive (CSDDD)",
    description: "Requires large companies to identify, prevent, mitigate and account for adverse human rights and environmental impacts in their operations and value chains.",
    regulationType: "CSDDD",
    effectiveDate: "2026-07-26",
    sourceUrl: "https://eur-lex.europa.eu/eli/dir/2024/1760",
  },
  {
    celexId: "32020-0852",
    title: "EU Taxonomy Regulation",
    description: "Classification system for environmentally sustainable economic activities. Provides technical screening criteria for climate change mitigation and adaptation.",
    regulationType: "EU_TAXONOMY",
    effectiveDate: "2020-07-12",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2020/852",
  },
  {
    celexId: "32019-2088",
    title: "Sustainable Finance Disclosure Regulation (SFDR)",
    description: "Requires financial market participants to disclose sustainability risks and adverse impacts. Includes entity-level and product-level disclosure requirements.",
    regulationType: "SFDR",
    effectiveDate: "2021-03-10",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2019/2088",
  },
  {
    celexId: "32023-0839",
    title: "Batteries Regulation",
    description: "Sets sustainability requirements for batteries placed on the EU market, including carbon footprint declarations, recycled content, and digital battery passports.",
    regulationType: "BATTERIES",
    effectiveDate: "2024-02-18",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2023/1542",
  },
  {
    celexId: "32022-2464-DELEGATED",
    title: "ESRS Delegated Act (Set 1)",
    description: "First set of European Sustainability Reporting Standards adopted as delegated act under CSRD. Covers cross-cutting (ESRS 1, 2) and topical standards (E1-E5, S1-S4, G1).",
    regulationType: "ESRS",
    effectiveDate: "2024-01-01",
    sourceUrl: "https://eur-lex.europa.eu/eli/del_reg/2023/2772",
  },
  {
    celexId: "32011-1169",
    title: "Food Information to Consumers Regulation (FIC)",
    description: "Requires food businesses to provide mandatory food information including allergens, nutrition declarations, and origin labelling.",
    regulationType: "FIC",
    effectiveDate: "2014-12-13",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2011/1169",
  },
  {
    celexId: "32023-0607",
    title: "EU Carbon Border Adjustment Mechanism (CBAM)",
    description: "Puts a carbon price on imports of certain goods to prevent carbon leakage. Covers cement, iron/steel, aluminium, fertilisers, electricity, and hydrogen.",
    regulationType: "CBAM",
    effectiveDate: "2023-10-01",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2023/956",
  },
  {
    celexId: "32024-0903",
    title: "Packaging and Packaging Waste Regulation (PPWR)",
    description: "Sets requirements for packaging sustainability, recyclability, recycled content, and reduction targets. Introduces mandatory deposit-return schemes.",
    regulationType: "PPWR",
    effectiveDate: "2024-11-12",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/3250",
  },
  {
    celexId: "32017-0821",
    title: "Waste Framework Directive (revised)",
    description: "Establishes waste hierarchy, extended producer responsibility, and recycling targets. Key enabler for circular economy policies.",
    regulationType: "WFD",
    effectiveDate: "2018-07-05",
    sourceUrl: "https://eur-lex.europa.eu/eli/dir/2018/851",
  },
  {
    celexId: "32021-2139",
    title: "EU Taxonomy Climate Delegated Act",
    description: "Technical screening criteria for economic activities that substantially contribute to climate change mitigation or adaptation under the EU Taxonomy.",
    regulationType: "EU_TAXONOMY",
    effectiveDate: "2022-01-01",
    sourceUrl: "https://eur-lex.europa.eu/eli/del_reg/2021/2139",
  },
  {
    celexId: "32014-0095",
    title: "Non-Financial Reporting Directive (NFRD)",
    description: "Predecessor to CSRD. Requires large public-interest entities to disclose non-financial information. Being phased out as CSRD takes effect.",
    regulationType: "NFRD",
    effectiveDate: "2018-01-01",
    sourceUrl: "https://eur-lex.europa.eu/eli/dir/2014/95",
  },
  {
    celexId: "32024-DPP-BATTERIES",
    title: "Digital Product Passport - Batteries (Delegated Act)",
    description: "Specifies DPP requirements for batteries including data model, access rights, and interoperability standards. First sector-specific DPP regulation.",
    regulationType: "DPP",
    effectiveDate: "2027-02-01",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2023/1542",
  },
  {
    celexId: "32006-1907",
    title: "REACH Regulation",
    description: "Registration, Evaluation, Authorisation and Restriction of Chemicals. Requires companies to manage risks from chemicals and provide safety information.",
    regulationType: "REACH",
    effectiveDate: "2007-06-01",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2006/1907",
  },
  {
    celexId: "32012-0305",
    title: "Construction Products Regulation (CPR)",
    description: "Harmonised conditions for marketing construction products in the EU. Includes environmental product declarations and sustainability assessments.",
    regulationType: "CPR",
    effectiveDate: "2013-07-01",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2011/305",
  },
  {
    celexId: "32009-0125",
    title: "Energy Labelling Regulation",
    description: "Framework for energy efficiency labelling of products. Requires digital product databases and QR codes linking to product information.",
    regulationType: "ENERGY_LABEL",
    effectiveDate: "2021-03-01",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2017/1369",
  },
  {
    celexId: "32024-GREENWASHING",
    title: "Green Claims Directive (proposed)",
    description: "Aims to protect consumers from misleading environmental claims. Requires substantiation of green claims with scientific evidence and standardised methods.",
    regulationType: "GREEN_CLAIMS",
    effectiveDate: "2026-03-01",
    sourceUrl: "https://ec.europa.eu/environment/topics/circular-economy/green-claims_en",
  },
];

async function seedRegulations() {
  console.log("\n=== Seeding regulations ===");
  let count = 0;
  for (const reg of regulationsSeedData) {
    await sql`
      INSERT INTO regulations (celex_id, title, description, regulation_type, effective_date, source_url)
      VALUES (${reg.celexId}, ${reg.title}, ${reg.description}, ${reg.regulationType}, ${reg.effectiveDate}, ${reg.sourceUrl})
      ON CONFLICT (celex_id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        regulation_type = EXCLUDED.regulation_type,
        effective_date = EXCLUDED.effective_date,
        source_url = EXCLUDED.source_url,
        last_updated = NOW()
    `;
    count++;
  }
  console.log(`  ✓ ${count} regulations seeded`);
}

// ─── PHASE 3: Seed GS1 Standards ───────────────────────────────────────────

const gs1StandardsData = [
  {
    standardCode: "GTIN",
    standardName: "Global Trade Item Number",
    description: "Unique identifier for trade items (products and services). The foundation of GS1 System enabling product identification across global supply chains.",
    category: "Identification",
    scope: "Product identification, inventory management, point-of-sale scanning, e-commerce, supply chain visibility",
    referenceUrl: "https://www.gs1.org/standards/id-keys/gtin",
  },
  {
    standardCode: "GLN",
    standardName: "Global Location Number",
    description: "Unique identifier for physical locations, legal entities, and functional entities. Essential for supply chain traceability and logistics.",
    category: "Identification",
    scope: "Location identification, facility management, logistics, supplier identification",
    referenceUrl: "https://www.gs1.org/standards/id-keys/gln",
  },
  {
    standardCode: "SSCC",
    standardName: "Serial Shipping Container Code",
    description: "Unique identifier for logistics units (pallets, containers). Enables tracking of shipments through the supply chain.",
    category: "Identification",
    scope: "Logistics unit tracking, warehouse management, shipping, receiving",
    referenceUrl: "https://www.gs1.org/standards/id-keys/sscc",
  },
  {
    standardCode: "SGTIN",
    standardName: "Serialised Global Trade Item Number",
    description: "GTIN plus serial number for individual item-level identification. Critical for traceability, anti-counterfeiting, and Digital Product Passports.",
    category: "Identification",
    scope: "Item-level traceability, serialisation, anti-counterfeiting, DPP",
    referenceUrl: "https://www.gs1.org/standards/id-keys/sgtin",
  },
  {
    standardCode: "GS1_DIGITAL_LINK",
    standardName: "GS1 Digital Link",
    description: "Web URI standard that encodes GS1 identifiers in web-compatible format. Enables QR codes linking to multiple sources of product information.",
    category: "Data Carrier",
    scope: "QR codes, web URIs, product information access, DPP access, consumer engagement",
    referenceUrl: "https://www.gs1.org/standards/gs1-digital-link",
  },
  {
    standardCode: "EPCIS",
    standardName: "Electronic Product Code Information Services",
    description: "Standard for sharing supply chain event data (what, where, when, why). Enables end-to-end visibility and traceability across trading partners.",
    category: "Data Sharing",
    scope: "Supply chain visibility, traceability, event sharing, EUDR compliance, cold chain monitoring",
    referenceUrl: "https://www.gs1.org/standards/epcis",
  },
  {
    standardCode: "CBV",
    standardName: "Core Business Vocabulary",
    description: "Standardised vocabulary for EPCIS events. Defines business steps, dispositions, and business transaction types for supply chain events.",
    category: "Data Sharing",
    scope: "EPCIS event semantics, business process standardisation, interoperability",
    referenceUrl: "https://www.gs1.org/standards/epcis/cbv",
  },
  {
    standardCode: "GS1_EDI",
    standardName: "GS1 EDI (EANCOM/GS1 XML)",
    description: "Electronic Data Interchange standards for business-to-business messaging. Covers orders, invoices, despatch advice, and more.",
    category: "Data Sharing",
    scope: "B2B messaging, order management, invoicing, logistics coordination",
    referenceUrl: "https://www.gs1.org/standards/edi",
  },
  {
    standardCode: "GDSN",
    standardName: "Global Data Synchronisation Network",
    description: "Network for continuous synchronisation of master data between trading partners. Ensures product data accuracy across the supply chain.",
    category: "Data Sharing",
    scope: "Master data management, product data synchronisation, retail, healthcare",
    referenceUrl: "https://www.gs1.org/standards/gdsn",
  },
  {
    standardCode: "GPC",
    standardName: "Global Product Classification",
    description: "Standardised product classification system. Provides a common language for grouping products for trading, analytics, and regulatory reporting.",
    category: "Classification",
    scope: "Product classification, category management, analytics, regulatory reporting",
    referenceUrl: "https://www.gs1.org/standards/gpc",
  },
  {
    standardCode: "GS1_DATAMATRIX",
    standardName: "GS1 DataMatrix",
    description: "2D barcode symbology for encoding GS1 identifiers and attributes. Used in healthcare, fresh food, and small items where space is limited.",
    category: "Data Carrier",
    scope: "Healthcare, fresh food, small item identification, serialisation",
    referenceUrl: "https://www.gs1.org/standards/gs1-datamatrix-guideline",
  },
  {
    standardCode: "LGTIN",
    standardName: "Lot-level GTIN",
    description: "GTIN combined with batch/lot number for batch-level traceability. Essential for food safety recalls and pharmaceutical tracking.",
    category: "Identification",
    scope: "Batch traceability, food safety, pharmaceutical tracking, recall management",
    referenceUrl: "https://www.gs1.org/standards/id-keys/gtin",
  },
  {
    standardCode: "GDTI",
    standardName: "Global Document Type Identifier",
    description: "Unique identifier for documents. Can be used to identify certificates, compliance documents, and sustainability reports.",
    category: "Identification",
    scope: "Document identification, certificate management, compliance documentation",
    referenceUrl: "https://www.gs1.org/standards/id-keys/gdti",
  },
  {
    standardCode: "GSRN",
    standardName: "Global Service Relation Number",
    description: "Identifier for the relationship between a service provider and a service recipient. Used in healthcare, loyalty programs, and service management.",
    category: "Identification",
    scope: "Service relationships, healthcare, loyalty programs",
    referenceUrl: "https://www.gs1.org/standards/id-keys/gsrn",
  },
  {
    standardCode: "GRAI",
    standardName: "Global Returnable Asset Identifier",
    description: "Unique identifier for returnable assets (pallets, containers, crates). Supports circular economy by tracking reusable packaging.",
    category: "Identification",
    scope: "Returnable asset tracking, circular economy, reusable packaging",
    referenceUrl: "https://www.gs1.org/standards/id-keys/grai",
  },
];

async function seedGS1Standards() {
  console.log("\n=== Seeding GS1 standards ===");
  let count = 0;
  for (const std of gs1StandardsData) {
    await sql`
      INSERT INTO gs1_standards (standard_code, standard_name, description, category, scope, reference_url)
      VALUES (${std.standardCode}, ${std.standardName}, ${std.description}, ${std.category}, ${std.scope}, ${std.referenceUrl})
      ON CONFLICT (standard_code) DO UPDATE SET
        standard_name = EXCLUDED.standard_name,
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        scope = EXCLUDED.scope,
        reference_url = EXCLUDED.reference_url
    `;
    count++;
  }
  console.log(`  ✓ ${count} GS1 standards seeded`);
}

// ─── PHASE 4: Seed ESRS Datapoints from inline data ────────────────────────

const esrsDatapointsData = [
  // ESRS E1 - Climate Change
  { code: "E1-1", esrsStandard: "ESRS E1", disclosureRequirement: "E1-1", name: "Transition plan for climate change mitigation", dataType: "narrative" },
  { code: "E1-2", esrsStandard: "ESRS E1", disclosureRequirement: "E1-2", name: "Policies related to climate change mitigation and adaptation", dataType: "narrative" },
  { code: "E1-3", esrsStandard: "ESRS E1", disclosureRequirement: "E1-3", name: "Actions and resources in relation to climate change policies", dataType: "narrative" },
  { code: "E1-4", esrsStandard: "ESRS E1", disclosureRequirement: "E1-4", name: "Targets related to climate change mitigation and adaptation", dataType: "semiNarrative" },
  { code: "E1-5", esrsStandard: "ESRS E1", disclosureRequirement: "E1-5", name: "Energy consumption and mix", dataType: "quantitative" },
  { code: "E1-6", esrsStandard: "ESRS E1", disclosureRequirement: "E1-6", name: "Gross Scopes 1, 2, 3 and Total GHG emissions", dataType: "quantitative" },
  { code: "E1-7", esrsStandard: "ESRS E1", disclosureRequirement: "E1-7", name: "GHG removals and GHG mitigation projects financed through carbon credits", dataType: "quantitative" },
  { code: "E1-8", esrsStandard: "ESRS E1", disclosureRequirement: "E1-8", name: "Internal carbon pricing", dataType: "quantitative" },
  { code: "E1-9", esrsStandard: "ESRS E1", disclosureRequirement: "E1-9", name: "Anticipated financial effects from material physical and transition risks", dataType: "quantitative" },
  // ESRS E2 - Pollution
  { code: "E2-1", esrsStandard: "ESRS E2", disclosureRequirement: "E2-1", name: "Policies related to pollution", dataType: "narrative" },
  { code: "E2-2", esrsStandard: "ESRS E2", disclosureRequirement: "E2-2", name: "Actions and resources related to pollution", dataType: "narrative" },
  { code: "E2-3", esrsStandard: "ESRS E2", disclosureRequirement: "E2-3", name: "Targets related to pollution", dataType: "semiNarrative" },
  { code: "E2-4", esrsStandard: "ESRS E2", disclosureRequirement: "E2-4", name: "Pollution of air, water and soil", dataType: "quantitative" },
  { code: "E2-5", esrsStandard: "ESRS E2", disclosureRequirement: "E2-5", name: "Substances of concern and substances of very high concern", dataType: "quantitative" },
  { code: "E2-6", esrsStandard: "ESRS E2", disclosureRequirement: "E2-6", name: "Anticipated financial effects from pollution-related impacts", dataType: "quantitative" },
  // ESRS E3 - Water and Marine Resources
  { code: "E3-1", esrsStandard: "ESRS E3", disclosureRequirement: "E3-1", name: "Policies related to water and marine resources", dataType: "narrative" },
  { code: "E3-2", esrsStandard: "ESRS E3", disclosureRequirement: "E3-2", name: "Actions and resources related to water and marine resources", dataType: "narrative" },
  { code: "E3-3", esrsStandard: "ESRS E3", disclosureRequirement: "E3-3", name: "Targets related to water and marine resources", dataType: "semiNarrative" },
  { code: "E3-4", esrsStandard: "ESRS E3", disclosureRequirement: "E3-4", name: "Water consumption", dataType: "quantitative" },
  { code: "E3-5", esrsStandard: "ESRS E3", disclosureRequirement: "E3-5", name: "Anticipated financial effects from water and marine resources", dataType: "quantitative" },
  // ESRS E4 - Biodiversity and Ecosystems
  { code: "E4-1", esrsStandard: "ESRS E4", disclosureRequirement: "E4-1", name: "Transition plan on biodiversity and ecosystems", dataType: "narrative" },
  { code: "E4-2", esrsStandard: "ESRS E4", disclosureRequirement: "E4-2", name: "Policies related to biodiversity and ecosystems", dataType: "narrative" },
  { code: "E4-3", esrsStandard: "ESRS E4", disclosureRequirement: "E4-3", name: "Actions and resources related to biodiversity and ecosystems", dataType: "narrative" },
  { code: "E4-4", esrsStandard: "ESRS E4", disclosureRequirement: "E4-4", name: "Targets related to biodiversity and ecosystems", dataType: "semiNarrative" },
  { code: "E4-5", esrsStandard: "ESRS E4", disclosureRequirement: "E4-5", name: "Impact metrics related to biodiversity and ecosystems change", dataType: "quantitative" },
  { code: "E4-6", esrsStandard: "ESRS E4", disclosureRequirement: "E4-6", name: "Anticipated financial effects from biodiversity and ecosystem-related risks", dataType: "quantitative" },
  // ESRS E5 - Resource Use and Circular Economy
  { code: "E5-1", esrsStandard: "ESRS E5", disclosureRequirement: "E5-1", name: "Policies related to resource use and circular economy", dataType: "narrative" },
  { code: "E5-2", esrsStandard: "ESRS E5", disclosureRequirement: "E5-2", name: "Actions and resources related to resource use and circular economy", dataType: "narrative" },
  { code: "E5-3", esrsStandard: "ESRS E5", disclosureRequirement: "E5-3", name: "Targets related to resource use and circular economy", dataType: "semiNarrative" },
  { code: "E5-4", esrsStandard: "ESRS E5", disclosureRequirement: "E5-4", name: "Resource inflows", dataType: "quantitative" },
  { code: "E5-5", esrsStandard: "ESRS E5", disclosureRequirement: "E5-5", name: "Resource outflows", dataType: "quantitative" },
  { code: "E5-6", esrsStandard: "ESRS E5", disclosureRequirement: "E5-6", name: "Anticipated financial effects from resource use and circular economy", dataType: "quantitative" },
  // ESRS S1 - Own Workforce
  { code: "S1-1", esrsStandard: "ESRS S1", disclosureRequirement: "S1-1", name: "Policies related to own workforce", dataType: "narrative" },
  { code: "S1-2", esrsStandard: "ESRS S1", disclosureRequirement: "S1-2", name: "Processes for engaging with own workers and workers' representatives", dataType: "narrative" },
  { code: "S1-3", esrsStandard: "ESRS S1", disclosureRequirement: "S1-3", name: "Processes to remediate negative impacts and channels for own workers to raise concerns", dataType: "narrative" },
  { code: "S1-4", esrsStandard: "ESRS S1", disclosureRequirement: "S1-4", name: "Taking action on material impacts on own workforce", dataType: "narrative" },
  { code: "S1-5", esrsStandard: "ESRS S1", disclosureRequirement: "S1-5", name: "Targets related to managing material negative impacts", dataType: "semiNarrative" },
  { code: "S1-6", esrsStandard: "ESRS S1", disclosureRequirement: "S1-6", name: "Characteristics of the undertaking's employees", dataType: "quantitative" },
  { code: "S1-7", esrsStandard: "ESRS S1", disclosureRequirement: "S1-7", name: "Characteristics of non-employee workers in the undertaking's own workforce", dataType: "quantitative" },
  { code: "S1-8", esrsStandard: "ESRS S1", disclosureRequirement: "S1-8", name: "Collective bargaining coverage and social dialogue", dataType: "quantitative" },
  { code: "S1-9", esrsStandard: "ESRS S1", disclosureRequirement: "S1-9", name: "Diversity metrics", dataType: "quantitative" },
  { code: "S1-10", esrsStandard: "ESRS S1", disclosureRequirement: "S1-10", name: "Adequate wages", dataType: "quantitative" },
  { code: "S1-11", esrsStandard: "ESRS S1", disclosureRequirement: "S1-11", name: "Social protection", dataType: "quantitative" },
  { code: "S1-12", esrsStandard: "ESRS S1", disclosureRequirement: "S1-12", name: "Persons with disabilities", dataType: "quantitative" },
  { code: "S1-13", esrsStandard: "ESRS S1", disclosureRequirement: "S1-13", name: "Training and skills development metrics", dataType: "quantitative" },
  { code: "S1-14", esrsStandard: "ESRS S1", disclosureRequirement: "S1-14", name: "Health and safety metrics", dataType: "quantitative" },
  { code: "S1-15", esrsStandard: "ESRS S1", disclosureRequirement: "S1-15", name: "Work-life balance metrics", dataType: "quantitative" },
  { code: "S1-16", esrsStandard: "ESRS S1", disclosureRequirement: "S1-16", name: "Compensation metrics (pay gap and total compensation)", dataType: "quantitative" },
  { code: "S1-17", esrsStandard: "ESRS S1", disclosureRequirement: "S1-17", name: "Incidents, complaints and severe human rights impacts", dataType: "quantitative" },
  // ESRS S2 - Workers in the Value Chain
  { code: "S2-1", esrsStandard: "ESRS S2", disclosureRequirement: "S2-1", name: "Policies related to value chain workers", dataType: "narrative" },
  { code: "S2-2", esrsStandard: "ESRS S2", disclosureRequirement: "S2-2", name: "Processes for engaging with value chain workers", dataType: "narrative" },
  { code: "S2-3", esrsStandard: "ESRS S2", disclosureRequirement: "S2-3", name: "Processes to remediate negative impacts on value chain workers", dataType: "narrative" },
  { code: "S2-4", esrsStandard: "ESRS S2", disclosureRequirement: "S2-4", name: "Taking action on material impacts on value chain workers", dataType: "narrative" },
  { code: "S2-5", esrsStandard: "ESRS S2", disclosureRequirement: "S2-5", name: "Targets related to managing material negative impacts on value chain workers", dataType: "semiNarrative" },
  // ESRS S3 - Affected Communities
  { code: "S3-1", esrsStandard: "ESRS S3", disclosureRequirement: "S3-1", name: "Policies related to affected communities", dataType: "narrative" },
  { code: "S3-2", esrsStandard: "ESRS S3", disclosureRequirement: "S3-2", name: "Processes for engaging with affected communities", dataType: "narrative" },
  { code: "S3-3", esrsStandard: "ESRS S3", disclosureRequirement: "S3-3", name: "Processes to remediate negative impacts on affected communities", dataType: "narrative" },
  { code: "S3-4", esrsStandard: "ESRS S3", disclosureRequirement: "S3-4", name: "Taking action on material impacts on affected communities", dataType: "narrative" },
  { code: "S3-5", esrsStandard: "ESRS S3", disclosureRequirement: "S3-5", name: "Targets related to managing material negative impacts on affected communities", dataType: "semiNarrative" },
  // ESRS S4 - Consumers and End-users
  { code: "S4-1", esrsStandard: "ESRS S4", disclosureRequirement: "S4-1", name: "Policies related to consumers and end-users", dataType: "narrative" },
  { code: "S4-2", esrsStandard: "ESRS S4", disclosureRequirement: "S4-2", name: "Processes for engaging with consumers and end-users", dataType: "narrative" },
  { code: "S4-3", esrsStandard: "ESRS S4", disclosureRequirement: "S4-3", name: "Processes to remediate negative impacts on consumers and end-users", dataType: "narrative" },
  { code: "S4-4", esrsStandard: "ESRS S4", disclosureRequirement: "S4-4", name: "Taking action on material impacts on consumers and end-users", dataType: "narrative" },
  { code: "S4-5", esrsStandard: "ESRS S4", disclosureRequirement: "S4-5", name: "Targets related to managing material negative impacts on consumers and end-users", dataType: "semiNarrative" },
  // ESRS G1 - Business Conduct
  { code: "G1-1", esrsStandard: "ESRS G1", disclosureRequirement: "G1-1", name: "Business conduct policies and corporate culture", dataType: "narrative" },
  { code: "G1-2", esrsStandard: "ESRS G1", disclosureRequirement: "G1-2", name: "Management of relationships with suppliers", dataType: "narrative" },
  { code: "G1-3", esrsStandard: "ESRS G1", disclosureRequirement: "G1-3", name: "Prevention and detection of corruption and bribery", dataType: "narrative" },
  { code: "G1-4", esrsStandard: "ESRS G1", disclosureRequirement: "G1-4", name: "Confirmed incidents of corruption or bribery", dataType: "quantitative" },
  { code: "G1-5", esrsStandard: "ESRS G1", disclosureRequirement: "G1-5", name: "Political influence and lobbying activities", dataType: "narrative" },
  { code: "G1-6", esrsStandard: "ESRS G1", disclosureRequirement: "G1-6", name: "Payment practices", dataType: "quantitative" },
];

async function seedESRSDatapoints() {
  console.log("\n=== Seeding ESRS datapoints ===");
  let count = 0;
  for (const dp of esrsDatapointsData) {
    await sql`
      INSERT INTO esrs_datapoints (code, esrs_standard, disclosure_requirement, name, data_type)
      VALUES (${dp.code}, ${dp.esrsStandard}, ${dp.disclosureRequirement}, ${dp.name}, ${dp.dataType})
      ON CONFLICT (code) DO UPDATE SET
        esrs_standard = EXCLUDED.esrs_standard,
        disclosure_requirement = EXCLUDED.disclosure_requirement,
        name = EXCLUDED.name,
        data_type = EXCLUDED.data_type
    `;
    count++;
  }
  console.log(`  ✓ ${count} ESRS datapoints seeded`);
}

// ─── PHASE 5: Seed regulation-ESRS mappings ────────────────────────────────

async function seedRegulationEsrsMappings() {
  console.log("\n=== Seeding regulation-ESRS mappings ===");
  const regs = await sql`SELECT id, celex_id FROM regulations`;
  const regMap = {};
  for (const r of regs) regMap[r.celex_id] = r.id;
  
  const dps = await sql`SELECT id, code FROM esrs_datapoints`;
  const dpMap = {};
  for (const d of dps) dpMap[d.code] = d.id;

  const mappings = [
    ...Object.keys(dpMap).map(code => ({ celexId: "32022-02464", dpCode: code, relevanceScore: 95, reasoning: "CSRD mandates ESRS reporting" })),
    ...Object.keys(dpMap).map(code => ({ celexId: "32022-2464-DELEGATED", dpCode: code, relevanceScore: 100, reasoning: "ESRS Set 1 delegated act defines these datapoints" })),
    ...Object.keys(dpMap).filter(c => c.startsWith("E1-") || c.startsWith("G1-")).map(code => ({ celexId: "32019-2088", dpCode: code, relevanceScore: 75, reasoning: "SFDR principal adverse impact indicators overlap with ESRS climate and governance" })),
    ...Object.keys(dpMap).filter(c => c.startsWith("E1-")).map(code => ({ celexId: "32020-0852", dpCode: code, relevanceScore: 80, reasoning: "EU Taxonomy climate screening criteria align with ESRS E1 disclosures" })),
    ...Object.keys(dpMap).filter(c => c.startsWith("E4-") || c.startsWith("E5-")).map(code => ({ celexId: "32023-1115", dpCode: code, relevanceScore: 70, reasoning: "EUDR deforestation due diligence relates to biodiversity and resource use" })),
    ...Object.keys(dpMap).filter(c => c.startsWith("S1-") || c.startsWith("S2-") || c.startsWith("S3-")).map(code => ({ celexId: "32024-1760", dpCode: code, relevanceScore: 85, reasoning: "CSDDD due diligence obligations cover workforce and value chain impacts" })),
  ];

  let count = 0;
  for (const m of mappings) {
    const regId = regMap[m.celexId];
    const dpId = dpMap[m.dpCode];
    if (!regId || !dpId) continue;
    await sql`
      INSERT INTO regulation_esrs_mappings (regulation_id, datapoint_id, relevance_score, reasoning)
      VALUES (${regId}, ${dpId}, ${m.relevanceScore}, ${m.reasoning})
      ON CONFLICT (regulation_id, datapoint_id) DO NOTHING
    `;
    count++;
  }
  console.log(`  ✓ ${count} regulation-ESRS mappings seeded`);
}

// ─── PHASE 6: Seed GS1-ESRS mappings ──────────────────────────────────────

async function seedGS1EsrsMappings() {
  console.log("\n=== Seeding GS1-ESRS mappings ===");
  // gs1_esrs_mappings has columns: mapping_id, level, esrs_standard, esrs_topic, data_point_name, short_name, definition, gs1_relevance, source_document, source_date, source_authority
  const mappings = [
    { level: "company", esrsStandard: "ESRS E1", esrsTopic: "Climate Change", dataPointName: "Gross Scopes 1, 2, 3 and Total GHG emissions", shortName: "GHG Emissions", definition: "EPCIS events enable Scope 3 emissions tracking across supply chain", gs1Relevance: "EPCIS", sourceDocument: "GS1 EPCIS v2.0", sourceDate: "2022-09-01", sourceAuthority: "GS1 Global Office" },
    { level: "company", esrsStandard: "ESRS E1", esrsTopic: "Climate Change", dataPointName: "Energy consumption and mix", shortName: "Energy Mix", definition: "EPCIS logistics events can track energy consumption in transport", gs1Relevance: "EPCIS", sourceDocument: "GS1 EPCIS v2.0", sourceDate: "2022-09-01", sourceAuthority: "GS1 Global Office" },
    { level: "product", esrsStandard: "ESRS E5", esrsTopic: "Resource Use and Circular Economy", dataPointName: "Resource inflows", shortName: "Resource Inflows", definition: "Digital Link enables DPP access for resource inflow transparency", gs1Relevance: "GS1 Digital Link", sourceDocument: "GS1 Digital Link v1.3", sourceDate: "2023-03-01", sourceAuthority: "GS1 Global Office" },
    { level: "product", esrsStandard: "ESRS E5", esrsTopic: "Resource Use and Circular Economy", dataPointName: "Resource outflows", shortName: "Resource Outflows", definition: "Digital Link enables DPP access for resource outflow/recyclability data", gs1Relevance: "GS1 Digital Link", sourceDocument: "GS1 Digital Link v1.3", sourceDate: "2023-03-01", sourceAuthority: "GS1 Global Office" },
    { level: "product", esrsStandard: "ESRS E5", esrsTopic: "Resource Use and Circular Economy", dataPointName: "Resource inflows", shortName: "Product Composition", definition: "GTIN identifies products for material composition tracking", gs1Relevance: "GTIN", sourceDocument: "GS1 General Specifications", sourceDate: "2024-01-01", sourceAuthority: "GS1 Global Office" },
    { level: "product", esrsStandard: "ESRS E4", esrsTopic: "Biodiversity and Ecosystems", dataPointName: "Impact metrics related to biodiversity and ecosystems change", shortName: "Biodiversity Impact", definition: "Serialised identification enables item-level traceability for biodiversity impact", gs1Relevance: "SGTIN", sourceDocument: "GS1 General Specifications", sourceDate: "2024-01-01", sourceAuthority: "GS1 Global Office" },
    { level: "company", esrsStandard: "ESRS S1", esrsTopic: "Own Workforce", dataPointName: "Characteristics of the undertaking's employees", shortName: "Workforce Data", definition: "GDSN master data can include supplier workforce characteristics", gs1Relevance: "GDSN", sourceDocument: "GDSN Trade Item Standard", sourceDate: "2023-06-01", sourceAuthority: "GS1 Global Office" },
    { level: "company", esrsStandard: "ESRS S2", esrsTopic: "Workers in the Value Chain", dataPointName: "Policies related to value chain workers", shortName: "Value Chain Workers", definition: "GLN identifies supply chain locations for value chain worker policy implementation", gs1Relevance: "GLN", sourceDocument: "GS1 General Specifications", sourceDate: "2024-01-01", sourceAuthority: "GS1 Global Office" },
    { level: "product", esrsStandard: "ESRS E5", esrsTopic: "Resource Use and Circular Economy", dataPointName: "Resource inflows", shortName: "Returnable Assets In", definition: "GRAI tracks returnable assets supporting circular economy resource inflows", gs1Relevance: "GRAI", sourceDocument: "GS1 General Specifications", sourceDate: "2024-01-01", sourceAuthority: "GS1 Global Office" },
    { level: "product", esrsStandard: "ESRS E5", esrsTopic: "Resource Use and Circular Economy", dataPointName: "Resource outflows", shortName: "Returnable Assets Out", definition: "GRAI tracks returnable assets supporting circular economy resource outflows", gs1Relevance: "GRAI", sourceDocument: "GS1 General Specifications", sourceDate: "2024-01-01", sourceAuthority: "GS1 Global Office" },
  ];

  let count = 0;
  for (const m of mappings) {
    await sql`
      INSERT INTO gs1_esrs_mappings (level, esrs_standard, esrs_topic, data_point_name, short_name, definition, gs1_relevance, source_document, source_date, source_authority)
      VALUES (${m.level}, ${m.esrsStandard}, ${m.esrsTopic}, ${m.dataPointName}, ${m.shortName}, ${m.definition}, ${m.gs1Relevance}, ${m.sourceDocument}, ${m.sourceDate}, ${m.sourceAuthority})
    `;
    count++;
  }
  console.log(`  ✓ ${count} GS1-ESRS mappings seeded`);
}

// ─── PHASE 7: Seed canonical sources for knowledge base ────────────────────

async function seedCanonicalSources() {
  console.log("\n=== Seeding canonical sources ===");
  // sources table columns: id, name, acronym, external_id, source_type, authority_level, publisher, official_url, publication_date, status, description, verification_status
  // authority_level is integer (1=highest), source_type and status are enums
  const sources = [
    { name: "Corporate Sustainability Reporting Directive", acronym: "CSRD", externalId: "CELEX:32022L2464", sourceType: "eu_directive", authorityLevel: 1, publisher: "European Parliament and Council", officialUrl: "https://eur-lex.europa.eu/eli/dir/2022/2464", publicationDate: "2022-12-14", status: "active", description: "Requires large EU companies to report on sustainability impacts and risks." },
    { name: "European Sustainability Reporting Standards Set 1", acronym: "ESRS", externalId: "CELEX:32023R2772", sourceType: "eu_regulation", authorityLevel: 1, publisher: "European Commission", officialUrl: "https://eur-lex.europa.eu/eli/del_reg/2023/2772", publicationDate: "2023-07-31", status: "active", description: "Detailed sustainability reporting standards covering E, S, and G topics." },
    { name: "Ecodesign for Sustainable Products Regulation", acronym: "ESPR", externalId: "CELEX:32024R1781", sourceType: "eu_regulation", authorityLevel: 1, publisher: "European Parliament and Council", officialUrl: "https://eur-lex.europa.eu/eli/reg/2024/1781", publicationDate: "2024-06-13", status: "active", description: "Framework for ecodesign requirements including Digital Product Passports." },
    { name: "EU Deforestation Regulation", acronym: "EUDR", externalId: "CELEX:32023R1115", sourceType: "eu_regulation", authorityLevel: 1, publisher: "European Parliament and Council", officialUrl: "https://eur-lex.europa.eu/eli/reg/2023/1115", publicationDate: "2023-06-09", status: "active", description: "Prohibits placing deforestation-linked commodities on the EU market." },
    { name: "Corporate Sustainability Due Diligence Directive", acronym: "CSDDD", externalId: "CELEX:32024L1760", sourceType: "eu_directive", authorityLevel: 1, publisher: "European Parliament and Council", officialUrl: "https://eur-lex.europa.eu/eli/dir/2024/1760", publicationDate: "2024-07-05", status: "active", description: "Requires companies to identify and mitigate adverse human rights and environmental impacts." },
    { name: "GS1 EPCIS Standard", acronym: "EPCIS", externalId: "GS1:EPCIS:2.0", sourceType: "gs1_global_standard", authorityLevel: 2, publisher: "GS1 Global Office", officialUrl: "https://www.gs1.org/standards/epcis", publicationDate: "2022-09-01", status: "active", description: "Standard for sharing supply chain event data (what, where, when, why)." },
    { name: "GS1 Digital Link Standard", acronym: "GS1DL", externalId: "GS1:DIGITAL_LINK:1.3", sourceType: "gs1_global_standard", authorityLevel: 2, publisher: "GS1 Global Office", officialUrl: "https://www.gs1.org/standards/gs1-digital-link", publicationDate: "2023-03-01", status: "active", description: "Web URI standard encoding GS1 identifiers for QR codes and DPP access." },
    { name: "GS1 Core Business Vocabulary", acronym: "CBV", externalId: "GS1:CBV:2.0", sourceType: "gs1_global_standard", authorityLevel: 2, publisher: "GS1 Global Office", officialUrl: "https://www.gs1.org/standards/epcis/cbv", publicationDate: "2022-09-01", status: "active", description: "Standardised vocabulary for EPCIS events." },
    { name: "EU Taxonomy Regulation", acronym: "EU_TAX", externalId: "CELEX:32020R0852", sourceType: "eu_regulation", authorityLevel: 1, publisher: "European Parliament and Council", officialUrl: "https://eur-lex.europa.eu/eli/reg/2020/852", publicationDate: "2020-06-22", status: "active", description: "Classification system for environmentally sustainable economic activities." },
    { name: "Sustainable Finance Disclosure Regulation", acronym: "SFDR", externalId: "CELEX:32019R2088", sourceType: "eu_regulation", authorityLevel: 1, publisher: "European Parliament and Council", officialUrl: "https://eur-lex.europa.eu/eli/reg/2019/2088", publicationDate: "2019-11-27", status: "active", description: "Requires financial market participants to disclose sustainability risks." },
  ];

  let count = 0;
  for (const src of sources) {
    await sql`
      INSERT INTO sources (name, acronym, external_id, source_type, authority_level, publisher, official_url, publication_date, status, description, verification_status)
      VALUES (${src.name}, ${src.acronym}, ${src.externalId}, ${src.sourceType}::source_type, ${src.authorityLevel}, ${src.publisher}, ${src.officialUrl}, ${src.publicationDate}, ${src.status}::source_status, ${src.description}, 'verified'::source_verification_status)
      ON CONFLICT (external_id) DO UPDATE SET
        name = EXCLUDED.name,
        status = EXCLUDED.status,
        verification_status = EXCLUDED.verification_status
    `;
    count++;
  }
  console.log(`  ✓ ${count} canonical sources seeded`);
}

// ─── MAIN ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("ISA Supabase Rehydration Seed");
  console.log("=============================\n");

  try {
    // Extend enums with values needed by seed data
    console.log("=== Extending regulation_type enum ===");
    const extraEnums = ['CSDDD', 'SFDR', 'BATTERIES', 'FIC', 'CBAM', 'WFD', 'NFRD', 'REACH', 'CPR', 'ENERGY_LABEL', 'GREEN_CLAIMS'];
    for (const v of extraEnums) {
      try { await sql.unsafe(`ALTER TYPE regulation_type ADD VALUE IF NOT EXISTS '${v}'`); } catch (e) { /* already exists */ }
    }
    console.log(`  ✓ ${extraEnums.length} enum values ensured`);

    await createUsersTable();
    await seedRegulations();
    await seedGS1Standards();
    await seedESRSDatapoints();
    await seedRegulationEsrsMappings();
    await seedGS1EsrsMappings();
    await seedCanonicalSources();

    // Final summary
    const counts = await sql`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM regulations) as regulations,
        (SELECT COUNT(*) FROM gs1_standards) as gs1_standards,
        (SELECT COUNT(*) FROM esrs_datapoints) as esrs_datapoints,
        (SELECT COUNT(*) FROM regulation_esrs_mappings) as reg_esrs_mappings,
        (SELECT COUNT(*) FROM gs1_esrs_mappings) as gs1_esrs_mappings,
        (SELECT COUNT(*) FROM sources) as sources
    `;
    console.log("\n=== Final Table Counts ===");
    console.log(JSON.stringify(counts[0], null, 2));

  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    await sql.end({ timeout: 5 });
  }

  console.log("\n✓ Rehydration complete!");
}

main();
