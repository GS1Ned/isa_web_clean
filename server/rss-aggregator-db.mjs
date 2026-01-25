/**
 * Enhanced RSS Feed Aggregator with Database Integration
 * Fetches news from official sources and saves to hub_news table
 *
 * Usage: node server/rss-aggregator-db.mjs
 * Or schedule with cron: 0 2 * * * cd /home/ubuntu/isa_web && node server/rss-aggregator-db.mjs
 */

import fetch from "node-fetch";
import { parseStringPromise } from "xml2js";
import mysql from "mysql2/promise";

// Configuration
const RSS_FEEDS = [
  {
    url: "https://ec.europa.eu/commission/presscorner/rss/en",
    title: "EU Commission Press Corner",
    category: "EU_OFFICIAL",
  },
  {
    url: "https://www.efrag.org/news",
    title: "EFRAG News",
    category: "EFRAG",
  },
  {
    url: "https://www.gs1.org/news-and-events",
    title: "GS1 News",
    category: "GS1",
  },
];

// Regulation keywords to detect
const REGULATION_KEYWORDS = {
  CSRD: ["CSRD", "Corporate Sustainability Reporting Directive"],
  ESRS: ["ESRS", "European Sustainability Reporting Standard"],
  EUDR: ["EUDR", "Deforestation Regulation", "Deforestation Directive"],
  DPP: ["DPP", "Digital Product Passport", "Digital Product Passports"],
  PPWR: ["PPWR", "Packaging and Packaging Waste Regulation"],
  EU_TAXONOMY: ["EU Taxonomy", "Taxonomy Regulation"],
};

// GS1 Standards keywords
const GS1_KEYWORDS = {
  GTIN: ["GTIN", "Global Trade Item Number"],
  EPCIS: ["EPCIS", "Electronic Product Code Information Services"],
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
  if (text.includes("guidance") || text.includes("guide")) return "GUIDANCE";
  if (text.includes("amend") || text.includes("amendment")) return "AMENDMENT";
  return "NEW_LAW";
}

/**
 * Fetch and parse RSS feed
 */
async function fetchRSSFeed(feedUrl) {
  try {
    const response = await fetch(feedUrl);
    const text = await response.text();
    const parsed = await parseStringPromise(text);
    return parsed.rss?.channel?.[0]?.item || [];
  } catch (error) {
    console.error(`Error fetching ${feedUrl}:`, error.message);
    return [];
  }
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
      newsItem.title,
      newsItem.summary,
      newsItem.content,
      newsItem.newsType,
      newsItem.relatedRegulationIds
        ? JSON.stringify(newsItem.relatedRegulationIds)
        : null,
      newsItem.sourceUrl,
      newsItem.sourceTitle,
      newsItem.publishedDate || new Date(),
    ];

    await connection.execute(query, values);
    console.log(`✓ Saved: ${newsItem.title}`);
    return true;
  } catch (error) {
    console.error(`Error saving news: ${error.message}`);
    return false;
  }
}

/**
 * Process RSS feed items
 */
async function processRSSItems(connection, feedConfig, items) {
  let savedCount = 0;

  for (const item of items) {
    const title = item.title?.[0] || "";
    const description = item.description?.[0] || "";
    const link = item.link?.[0] || "";
    const pubDate = item.pubDate?.[0] ? new Date(item.pubDate[0]) : new Date();

    // Skip if title is empty
    if (!title) continue;

    // Detect related regulations
    const detectedRegulations = detectRegulations(`${title} ${description}`);

    // Skip if no relevant regulations mentioned
    if (detectedRegulations.length === 0) continue;

    // Determine news type
    const newsType = determineNewsType(title, description);

    // Create news item
    const newsItem = {
      title: title.substring(0, 512),
      summary: description.substring(0, 500),
      content: description,
      newsType,
      relatedRegulationIds: detectedRegulations
        .map(reg => {
          // Map regulation names to IDs (1-6 based on seed data)
          const regMap = {
            CSRD: 1,
            ESRS: 2,
            EUDR: 3,
            DPP: 4,
            PPWR: 5,
            EU_TAXONOMY: 6,
          };
          return regMap[reg];
        })
        .filter(Boolean),
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
  console.log("🔄 Starting RSS aggregation...");

  // Create database connection
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "isa_web",
    });

    let totalSaved = 0;

    // Process each RSS feed
    for (const feedConfig of RSS_FEEDS) {
      console.log(`\n📰 Processing ${feedConfig.title}...`);
      const items = await fetchRSSFeed(feedConfig.url);
      console.log(`   Found ${items.length} items`);

      const saved = await processRSSItems(connection, feedConfig, items);
      console.log(`   Saved ${saved} relevant items`);
      totalSaved += saved;
    }

    console.log(`\n✅ Aggregation complete! Saved ${totalSaved} news items.`);
  } catch (error) {
    console.error("❌ Aggregation failed:", error.message);
  } finally {
    if (connection) await connection.end();
  }
}

// Run aggregation
aggregateNews();
