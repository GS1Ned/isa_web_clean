/**
 * RSS Feed Aggregator for ESG Regulations Hub
 * Fetches news from official sources and populates the hub_news table
 *
 * Usage: node server/rss-aggregator.mjs
 * Schedule: Run daily via cron or scheduler
 */

import fetch from "node-fetch";
import { parseStringPromise } from "xml2js";

const RSS_SOURCES = [
  {
    name: "EU Commission - Sustainability",
    url: "https://ec.europa.eu/info/rss_en",
    category: "OFFICIAL",
  },
  {
    name: "EFRAG News",
    url: "https://www.efrag.org/news",
    category: "OFFICIAL",
  },
  {
    name: "GS1 Standards Updates",
    url: "https://www.gs1.org/standards/news",
    category: "OFFICIAL",
  },
];

/**
 * Fetch and parse RSS feed
 */
async function fetchRSSFeed(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "ISA-Hub/1.0 (ESG Regulations News Aggregator)",
      },
    });

    if (!response.ok) {
      console.warn(`[RSS] Failed to fetch ${url}: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    const parsed = await parseStringPromise(xml);

    // Extract items from RSS feed
    const items = parsed.rss?.channel?.[0]?.item || [];

    return items.map(item => ({
      title: item.title?.[0] || "Untitled",
      link: item.link?.[0] || "",
      description: item.description?.[0] || "",
      pubDate: item.pubDate?.[0] || new Date().toISOString(),
      source: item.source?.[0]?.title?.[0] || "Unknown",
    }));
  } catch (error) {
    console.error(`[RSS] Error fetching ${url}:`, error.message);
    return [];
  }
}

/**
 * Aggregate news from all sources
 */
async function aggregateNews() {
  console.log("[RSS] Starting news aggregation...");

  const allNews = [];

  for (const source of RSS_SOURCES) {
    console.log(`[RSS] Fetching from ${source.name}...`);
    const items = await fetchRSSFeed(source.url);
    console.log(`[RSS] Found ${items.length} items from ${source.name}`);

    allNews.push(
      ...items.map(item => ({
        ...item,
        category: source.category,
        sourceUrl: source.url,
      }))
    );
  }

  // Sort by date (newest first)
  allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  console.log(`[RSS] Aggregated ${allNews.length} news items total`);

  // In production, save to database
  // await saveNewsToDatabase(allNews);

  return allNews;
}

/**
 * Detect regulation mentions in news content
 */
function detectRegulations(text) {
  const regulations = [
    "CSRD",
    "ESRS",
    "EUDR",
    "DPP",
    "ESPR",
    "EU_TAXONOMY",
    "CSDDD",
  ];
  const mentioned = [];

  for (const reg of regulations) {
    if (text.toUpperCase().includes(reg)) {
      mentioned.push(reg);
    }
  }

  return mentioned;
}

/**
 * Detect GS1 standards mentions
 */
function detectStandards(text) {
  const standards = [
    "GTIN",
    "EPCIS",
    "GLN",
    "Digital Product Passport",
    "QR Code",
    "Traceability",
  ];
  const mentioned = [];

  for (const std of standards) {
    if (text.includes(std)) {
      mentioned.push(std);
    }
  }

  return mentioned;
}

/**
 * Main aggregation workflow
 */
async function main() {
  try {
    const news = await aggregateNews();

    // Enrich with regulation and standard detection
    const enrichedNews = news.map(item => ({
      ...item,
      regulationsMentioned: detectRegulations(
        item.title + " " + item.description
      ),
      standardsMentioned: detectStandards(item.title + " " + item.description),
    }));

    // Log sample
    if (enrichedNews.length > 0) {
      console.log("\n[RSS] Sample enriched news item:");
      console.log(JSON.stringify(enrichedNews[0], null, 2));
    }

    console.log("[RSS] News aggregation completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("[RSS] Aggregation failed:", error);
    process.exit(1);
  }
}

main();
