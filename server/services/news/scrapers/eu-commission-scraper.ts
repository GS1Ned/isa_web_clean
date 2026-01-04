/**
 * EU Commission Press Releases Scraper
 *
 * Fetches sustainability-related press releases from EU Commission
 * This is the most reliable source for official EU regulatory announcements
 */

import Parser from "rss-parser";
import { serverLogger } from "../../../_core/logger-wiring";


export interface EUCommissionArticle {
  title: string;
  url: string;
  publishedAt: Date;
  summary: string;
}

const parser = new Parser({
  customFields: {
    item: ["description", "pubDate", "link", "content:encoded"],
  },
});

export async function scrapeEUCommissionNews(): Promise<EUCommissionArticle[]> {
  try {
    console.log("[EU Commission Scraper] Fetching press releases...");

    // Try multiple EU Commission RSS feeds
    const feeds = [
      "https://ec.europa.eu/commission/presscorner/api/documents.rss?pagenumber=0&pagesize=50&language=en",
      "https://ec.europa.eu/newsroom/env/rss.cfm",
      "https://environment.ec.europa.eu/rss_en",
    ];

    let allArticles: EUCommissionArticle[] = [];

    for (const feedUrl of feeds) {
      try {
        console.log(`[EU Commission Scraper] Trying feed: ${feedUrl}`);
        const feed = await parser.parseURL(feedUrl);
        console.log(
          `[EU Commission Scraper] Found ${feed.items.length} items in feed`
        );

        // Sustainability keywords for filtering
        const sustainabilityKeywords = [
          "csrd",
          "esrs",
          "sustainability",
          "reporting",
          "corporate",
          "eudr",
          "deforestation",
          "dpp",
          "digital product passport",
          "ppwr",
          "packaging",
          "waste",
          "circular economy",
          "csddd",
          "due diligence",
          "supply chain",
          "esg",
          "green deal",
          "taxonomy",
          "disclosure",
          "environment",
        ];

        for (const item of feed.items) {
          if (!item.title || !item.link) continue;

          const textContent =
            `${item.title} ${item.contentSnippet || item.description || ""}`.toLowerCase();
          const isRelevant = sustainabilityKeywords.some(keyword =>
            textContent.includes(keyword)
          );

          if (!isRelevant) continue;

          // Parse date
          let publishedAt = new Date();
          if (item.pubDate) {
            const parsedDate = new Date(item.pubDate);
            if (!isNaN(parsedDate.getTime())) {
              publishedAt = parsedDate;
            }
          } else if (item.isoDate) {
            publishedAt = new Date(item.isoDate);
          }

          // Get summary from content:encoded or description
          let summary = item.contentSnippet || item.description || item.title;
          if (item["content:encoded"]) {
            // Strip HTML tags
            summary = item["content:encoded"]
              .replace(/<[^>]*>/g, "")
              .substring(0, 300);
          }

          allArticles.push({
            title: item.title,
            url: item.link,
            publishedAt,
            summary,
          });
        }

        // If we got results from this feed, we can stop trying others
        if (allArticles.length > 0) {
          console.log(
            `[EU Commission Scraper] Successfully fetched ${allArticles.length} articles from ${feedUrl}`
          );
          break;
        }
      } catch (feedError) {
        console.log(
          `[EU Commission Scraper] Feed ${feedUrl} failed, trying next...`
        );
        continue;
      }
    }

    console.log(
      `[EU Commission Scraper] Total filtered articles: ${allArticles.length}`
    );
    return allArticles;
  } catch (error) {
    serverLogger.error(error, { context: "[EU Commission Scraper] Error:" });
    return [];
  }
}

// CLI execution for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeEUCommissionNews()
    .then(articles => {
      console.log("\n=== EU Commission Scraping Results ===");
      console.log(`Total articles: ${articles.length}\n`);

      articles.slice(0, 10).forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   URL: ${article.url}`);
        console.log(`   Date: ${article.publishedAt.toISOString()}`);
        console.log(`   Summary: ${article.summary.substring(0, 150)}...`);
        console.log("");
      });
    })
    .catch(console.error);
}
