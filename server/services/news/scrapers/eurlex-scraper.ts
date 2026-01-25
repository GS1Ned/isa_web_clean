/**
 * EUR-Lex Press Releases Scraper (RSS-based)
 *
 * Fetches sustainability-related press releases from EUR-Lex RSS feed
 * Focus: CSRD, ESRS, EUDR, DPP, PPWR, CSDDD announcements
 */

import Parser from "rss-parser";
import { serverLogger } from "../../../_core/logger-wiring";


export interface EURLexArticle {
  title: string;
  url: string;
  publishedAt: Date;
  summary: string;
}

const parser = new Parser({
  customFields: {
    item: ["description", "pubDate", "link"],
  },
});

export async function scrapeEURLexNews(): Promise<EURLexArticle[]> {
  try {
    console.log("[EUR-Lex Scraper] Fetching RSS feed...");

    // EUR-Lex doesn't have a public RSS feed, so we'll use EU Commission press releases
    // which includes EUR-Lex regulatory announcements
    const feedUrl =
      "https://ec.europa.eu/commission/presscorner/api/documents.rss?pagenumber=0&pagesize=50&language=en";

    const feed = await parser.parseURL(feedUrl);
    console.log(`[EUR-Lex Scraper] Found ${feed.items.length} press releases`);

    const articles: EURLexArticle[] = [];

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
      }

      articles.push({
        title: item.title,
        url: item.link,
        publishedAt,
        summary: item.contentSnippet || item.description || item.title,
      });
    }

    console.log(
      `[EUR-Lex Scraper] Filtered to ${articles.length} sustainability articles`
    );
    return articles;
  } catch (error) {
    serverLogger.error(error, { context: "[EUR-Lex Scraper] Error:" });
    return [];
  }
}

// CLI execution for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeEURLexNews()
    .then(articles => {
      console.log("\n=== EUR-Lex Scraping Results ===");
      console.log(`Total articles: ${articles.length}\n`);

      articles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   URL: ${article.url}`);
        console.log(`   Date: ${article.publishedAt.toISOString()}`);
        console.log(`   Summary: ${article.summary.substring(0, 150)}...`);
        console.log("");
      });
    })
    .catch(console.error);
}
