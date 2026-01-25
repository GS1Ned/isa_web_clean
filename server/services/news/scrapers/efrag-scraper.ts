/**
 * EFRAG (European Financial Reporting Advisory Group) Scraper (RSS-based)
 *
 * Fetches ESRS-related updates from EFRAG RSS feed
 * Focus: ESRS standards, implementation guidance, Q&A
 */

import Parser from "rss-parser";
import { serverLogger } from "../../../_core/logger-wiring";


export interface EFRAGArticle {
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

export async function scrapeEFRAGNews(): Promise<EFRAGArticle[]> {
  try {
    console.log("[EFRAG Scraper] Fetching RSS feed...");

    // EFRAG RSS feed for news and updates
    const feedUrl = "https://www.efrag.org/Assets/RSS/News.xml";

    const feed = await parser.parseURL(feedUrl);
    console.log(`[EFRAG Scraper] Found ${feed.items.length} news items`);

    const articles: EFRAGArticle[] = [];

    // ESRS keywords for filtering
    const esrsKeywords = [
      "esrs",
      "sustainability reporting",
      "csrd",
      "implementation guidance",
      "european sustainability reporting",
      "disclosure requirement",
      "materiality",
      "double materiality",
      "value chain",
      "climate",
      "environmental",
      "social",
      "governance",
    ];

    for (const item of feed.items) {
      if (!item.title || !item.link) continue;

      const textContent =
        `${item.title} ${item.contentSnippet || item.description || ""}`.toLowerCase();
      const isRelevant = esrsKeywords.some(keyword =>
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

    console.log(`[EFRAG Scraper] Filtered to ${articles.length} ESRS articles`);
    return articles;
  } catch (error) {
    serverLogger.error(error, { context: "[EFRAG Scraper] Error:" });
    return [];
  }
}

// CLI execution for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeEFRAGNews()
    .then(articles => {
      console.log("\n=== EFRAG Scraping Results ===");
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
