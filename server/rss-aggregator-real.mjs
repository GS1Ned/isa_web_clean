/**
 * Real RSS Feed Aggregator with rss-parser
 * Fetches news from official EU Commission, EFRAG, and GS1 sources
 *
 * Usage: node server/rss-aggregator-real.mjs
 * Or schedule with cron: 0 2 * * * cd /home/ubuntu/isa_web && node server/rss-aggregator-real.mjs
 */

import Parser from "rss-parser";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const parser = new Parser({
  customFields: {
    item: [
      ["content:encoded", "fullContent"],
      ["description", "description"],
    ],
  },
});

// Real RSS feed sources from official organizations
const RSS_FEEDS = [
  {
    url: "https://ec.europa.eu/commission/presscorner/rss/en",
    title: "EU Commission Press Corner",
    category: "EU_OFFICIAL",
    priority: "high",
  },
  {
    url: "https://www.efrag.org/news",
    title: "EFRAG News & Updates",
    category: "EFRAG",
    priority: "high",
  },
  {
    url: "https://www.gs1.org/news-and-events/news",
    title: "GS1 Global News",
    category: "GS1",
    priority: "medium",
  },
];

// Regulation keywords for matching
const REGULATION_KEYWORDS = {
  CSRD: [
    "CSRD",
    "Corporate Sustainability Reporting Directive",
    "sustainability reporting",
  ],
  ESRS: [
    "ESRS",
    "European Sustainability Reporting Standard",
    "sustainability standard",
  ],
  EUDR: ["EUDR", "Deforestation Regulation", "deforestation", "forest"],
  DPP: ["DPP", "Digital Product Passport", "digital passport"],
  PPWR: ["PPWR", "Packaging and Packaging Waste Regulation", "packaging waste"],
  EU_TAXONOMY: ["EU Taxonomy", "Taxonomy Regulation", "sustainable activities"],
  ESPR: ["ESPR", "Green Claims Directive", "green claims"],
  CSDDD: [
    "CSDDD",
    "Corporate Sustainability Due Diligence Directive",
    "due diligence",
  ],
};

// GS1 Standards keywords
const GS1_KEYWORDS = {
  GTIN: ["GTIN", "Global Trade Item Number"],
  EPCIS: ["EPCIS", "Electronic Product Code"],
  GS1_DIGITAL_LINK: ["GS1 Digital Link", "Digital Link"],
  GLN: ["GLN", "Global Location Number"],
  SSCC: ["SSCC", "Serial Shipping Container Code"],
};

/**
 * Detect regulations mentioned in text
 */
function detectRegulations(text) {
  const detected = [];
  for (const [key, keywords] of Object.entries(REGULATION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        detected.push(key);
        break;
      }
    }
  }
  return detected;
}

/**
 * Detect GS1 standards mentioned in text
 */
function detectStandards(text) {
  const detected = [];
  for (const [key, keywords] of Object.entries(GS1_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        detected.push(key);
        break;
      }
    }
  }
  return detected;
}

/**
 * Determine news type based on content
 */
function determineNewsType(title, content) {
  const text = `${title} ${content}`.toLowerCase();

  if (text.includes("proposed") || text.includes("proposal")) return "PROPOSAL";
  if (text.includes("enforcement") || text.includes("enforcement action"))
    return "ENFORCEMENT";
  if (text.includes("court") || text.includes("judgment"))
    return "COURT_DECISION";
  if (
    text.includes("guidance") ||
    text.includes("guide") ||
    text.includes("implementation")
  )
    return "GUIDANCE";
  if (text.includes("amend") || text.includes("amendment")) return "AMENDMENT";
  if (text.includes("deadline") || text.includes("date")) return "DEADLINE";
  return "NEW_LAW";
}

/**
 * Map regulation names to database IDs
 */
function getRegulationIds(regulations) {
  const regMap = {
    CSRD: 1,
    ESRS: 2,
    EUDR: 3,
    DPP: 4,
    PPWR: 5,
    EU_TAXONOMY: 6,
    ESPR: 7,
    CSDDD: 8,
  };

  return regulations.map(reg => regMap[reg]).filter(id => id !== undefined);
}

/**
 * Save news item to database
 */
async function saveNewsToDatabase(connection, newsItem) {
  try {
    const query = `
      INSERT INTO hub_news 
      (title, summary, content, newsType, relatedRegulationIds, sourceUrl, sourceTitle, publishedDate, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE updatedAt = NOW()
    `;

    const values = [
      newsItem.title.substring(0, 512),
      newsItem.summary.substring(0, 500),
      newsItem.content.substring(0, 5000),
      newsItem.newsType,
      newsItem.relatedRegulationIds.length > 0
        ? JSON.stringify(newsItem.relatedRegulationIds)
        : null,
      newsItem.sourceUrl.substring(0, 512),
      newsItem.sourceTitle.substring(0, 255),
      newsItem.publishedDate || new Date(),
    ];

    await connection.execute(query, values);
    console.log(`  ✓ ${newsItem.title.substring(0, 60)}...`);
    return true;
  } catch (error) {
    console.error(`  ✗ Error saving: ${error.message}`);
    return false;
  }
}

/**
 * Process RSS feed items
 */
async function processRSSItems(connection, feedConfig, feed) {
  let savedCount = 0;

  if (!feed.items || feed.items.length === 0) {
    console.log(`  No items found`);
    return 0;
  }

  console.log(`  Processing ${feed.items.length} items...`);

  for (const item of feed.items) {
    const title = item.title || "";
    const description = item.description || "";
    const content = item.fullContent || description;
    const link = item.link || "";
    const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();

    // Skip if title is empty
    if (!title) continue;

    // Detect related regulations
    const detectedRegulations = detectRegulations(`${title} ${description}`);

    // Skip if no relevant regulations mentioned
    if (detectedRegulations.length === 0) continue;

    // Determine news type
    const newsType = determineNewsType(title, content);

    // Get regulation IDs
    const regulationIds = getRegulationIds(detectedRegulations);

    // Create news item
    const newsItem = {
      title,
      summary: description,
      content,
      newsType,
      relatedRegulationIds: regulationIds,
      sourceUrl: link,
      sourceTitle: feedConfig.title,
      publishedDate: pubDate,
    };

    // Save to database
    const saved = await saveNewsToDatabase(connection, newsItem);
    if (saved) savedCount++;
  }

  return savedCount;
}

/**
 * Main aggregation function
 */
async function aggregateNews() {
  console.log("🔄 Starting real RSS aggregation...\n");

  let connection;
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "isa_web",
    });

    let totalSaved = 0;

    // Process each RSS feed
    for (const feedConfig of RSS_FEEDS) {
      console.log(`📰 Fetching: ${feedConfig.title}`);

      try {
        const feed = await parser.parseURL(feedConfig.url);
        const saved = await processRSSItems(connection, feedConfig, feed);
        console.log(`  Saved ${saved} relevant items\n`);
        totalSaved += saved;
      } catch (error) {
        console.log(`  ✗ Failed to fetch: ${error.message}\n`);
      }
    }

    console.log(
      `✅ Aggregation complete! Saved ${totalSaved} news items total.`
    );
  } catch (error) {
    console.error("❌ Aggregation failed:", error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

// Run aggregation
aggregateNews();
