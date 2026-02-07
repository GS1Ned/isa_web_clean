/**
 * Seed sample GS1 NL news articles
 * Based on actual articles from GS1.nl sustainability section
 */

import { getDb } from "./server/db.ts";
import { hubNews } from "./drizzle/schema.ts";

const sampleArticles = [
  {
    title: "QR-code powered by GS1 helpt om voedselverspilling te voorkomen",
    summary:
      "GS1 QR-codes bieden consumenten toegang tot productinformatie die helpt bij het verminderen van voedselverspilling.",
    content:
      "GS1 QR-codes maken het mogelijk om consumenten direct te informeren over houdbaarheid, bewaaradviezen en receptsuggesties. Dit draagt bij aan het verminderen van voedselverspilling.",
    sourceUrl:
      "https://www.gs1.nl/gs1-in-actie/nieuws-en-events/nieuws/2025/qr-code-powered-by-gs1-helpt-om-voedselverspilling-te-voorkomen/",
    publishedAt: new Date("2025-09-08"),
    sourceType: "GS1_OFFICIAL",
    regulationTags: JSON.stringify(["DPP", "PPWR"]),
    impactLevel: "MEDIUM",
    isAutomated: true,
    retrievedAt: new Date(),
  },
  {
    title: "Complexe verpakkingswetgeving vraagt om eenduidige oplossing",
    summary:
      "De nieuwe Europese verpakkingswetgeving (PPWR) stelt hoge eisen aan productdata en traceerbaarheid.",
    content:
      "Met de komst van de Packaging and Packaging Waste Regulation (PPWR) moeten bedrijven gedetailleerde informatie over verpakkingen delen. GS1 standaarden bieden hiervoor de oplossing.",
    sourceUrl:
      "https://www.gs1.nl/gs1-in-actie/nieuws-en-events/nieuws/2025/complexe-verpakkingswetgeving-vraagt-om-eenduidige-oplossing/",
    publishedAt: new Date("2025-12-01"),
    sourceType: "GS1_OFFICIAL",
    regulationTags: JSON.stringify(["PPWR", "ESPR"]),
    impactLevel: "HIGH",
    isAutomated: true,
    retrievedAt: new Date(),
  },
  {
    title:
      "Nederlandse textiel- en modesector op weg naar Digital Product Passport",
    summary:
      "De Nederlandse mode-industrie bereidt zich voor op de verplichte Digital Product Passport voor textielproducten.",
    content:
      "De EU Digital Product Passport (DPP) wordt verplicht voor textielproducten. Nederlandse bedrijven werken samen met GS1 om de benodigde data-infrastructuur op te zetten.",
    sourceUrl:
      "https://www.gs1.nl/gs1-in-actie/nieuws-en-events/nieuws/2025/nederlandse-textiel-en-modesector-op-weg-naar-digital-product-passport/",
    publishedAt: new Date("2025-10-29"),
    sourceType: "GS1_OFFICIAL",
    regulationTags: JSON.stringify(["DPP", "ESPR"]),
    impactLevel: "HIGH",
    isAutomated: true,
    retrievedAt: new Date(),
  },
  {
    title: "Dit betekent de (straks verplichte) QR-code voor retailers",
    summary:
      "Vanaf 2027 worden QR-codes op producten verplicht in de EU. Wat betekent dit voor retailers?",
    content:
      "De EU maakt QR-codes verplicht op alle producten als onderdeel van de Digital Product Passport wetgeving. Retailers moeten zich voorbereiden op deze transitie.",
    sourceUrl:
      "https://www.gs1.nl/gs1-in-actie/nieuws-en-events/nieuws/2025/dit-betekent-de-straks-verplichte-qr-code-voor-retailers/",
    publishedAt: new Date("2025-09-25"),
    sourceType: "GS1_OFFICIAL",
    regulationTags: JSON.stringify(["DPP", "ESPR"]),
    impactLevel: "HIGH",
    isAutomated: true,
    retrievedAt: new Date(),
  },
  {
    title:
      "Nieuwe white paper: 'Packaging and Packaging Waste Regulation and GS1 Standards'",
    summary:
      "GS1 publiceert white paper over hoe GS1 standaarden helpen bij naleving van de PPWR.",
    content:
      "De nieuwe white paper legt uit hoe GS1 standaarden bedrijven ondersteunen bij het voldoen aan de Packaging and Packaging Waste Regulation (PPWR).",
    sourceUrl:
      "https://www.gs1.nl/gs1-in-actie/nieuws-en-events/nieuws/2025/nieuwe-white-paper-packaging-and-packaging-waste-regulation-and-gs1-standards/",
    publishedAt: new Date("2025-07-14"),
    sourceType: "GS1_OFFICIAL",
    regulationTags: JSON.stringify(["PPWR"]),
    impactLevel: "MEDIUM",
    isAutomated: true,
    retrievedAt: new Date(),
  },
  {
    title:
      "Nieuwe white paper: 'Corporate Sustainability Reporting Directive (CSRD) & GS1 Standards'",
    summary:
      "GS1 lanceert white paper over de rol van GS1 standaarden in CSRD-rapportage.",
    content:
      "De Corporate Sustainability Reporting Directive (CSRD) vereist gedetailleerde duurzaamheidsrapportage. GS1 standaarden faciliteren het verzamelen en delen van deze data.",
    sourceUrl:
      "https://www.gs1.nl/gs1-in-actie/nieuws-en-events/nieuws/2025/nieuwe-white-paper-corporate-sustainability-reporting-directive-csrd-gs1-standards/",
    publishedAt: new Date("2025-03-27"),
    sourceType: "GS1_OFFICIAL",
    regulationTags: JSON.stringify(["CSRD", "ESRS"]),
    impactLevel: "HIGH",
    isAutomated: true,
    retrievedAt: new Date(),
  },
  {
    title:
      "Uniforme duurzaamheidsdata onontbeerlijk in transitie naar circulaire economie",
    summary:
      "Gestandaardiseerde duurzaamheidsdata is cruciaal voor de transitie naar een circulaire economie.",
    content:
      "Voor een succesvolle circulaire economie is uniforme uitwisseling van duurzaamheidsdata essentieel. GS1 standaarden bieden het raamwerk hiervoor.",
    sourceUrl:
      "https://www.gs1.nl/gs1-in-actie/nieuws-en-events/nieuws/2025/uniforme-duurzaamheidsdata-onontbeerlijk-in-transitie-naar-circulaire-economie/",
    publishedAt: new Date("2025-03-17"),
    sourceType: "GS1_OFFICIAL",
    regulationTags: JSON.stringify(["ESPR", "DPP"]),
    impactLevel: "MEDIUM",
    isAutomated: true,
    retrievedAt: new Date(),
  },
];

async function seedNews() {
  console.log("Seeding sample news articles...\n");

  const db = await getDb();
  if (!db) {
    console.error("❌ Database not available");
    return;
  }

  try {
    for (const article of sampleArticles) {
      await db.insert(hubNews).values(article);
      console.log(`✅ Inserted: ${article.title}`);
    }

    console.log(`\n✅ Successfully seeded ${sampleArticles.length} articles`);
  } catch (error) {
    console.error("❌ Error seeding news:", error);
  }
}

seedNews();
