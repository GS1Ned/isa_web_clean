import {
  scrapeEFRAGNewsPlaywright,
  scrapeEFRAGArticleDetail,
} from "./server/news-scraper-efrag.js";
import { processNewsItem } from "./server/news-ai-processor.js";

console.log("[TEST] Testing EFRAG pipeline with AI processing...\n");

// Step 1: Scrape news list
console.log("Step 1: Scraping EFRAG news list...");
const articles = await scrapeEFRAGNewsPlaywright();
console.log(`✅ Found ${articles.length} articles\n`);

if (articles.length === 0) {
  console.log("❌ No articles found");
  process.exit(1);
}

// Step 2: Get full content for first article
const firstArticle = articles[0];
console.log(`Step 2: Fetching full content for: "${firstArticle.title}"`);
const fullContent = await scrapeEFRAGArticleDetail(firstArticle.url);
console.log(`✅ Content length: ${fullContent?.length || 0} characters\n`);

if (!fullContent) {
  console.log("❌ No content fetched");
  process.exit(1);
}

// Step 3: Process with AI
console.log("Step 3: Processing with AI...");
const processed = await processNewsItem({
  title: firstArticle.title,
  url: firstArticle.url,
  publishedAt: firstArticle.publishedAt,
  content: fullContent,
  sourceType: "EU_OFFICIAL",
});

console.log("\n✅ AI Processing Result:");
console.log("Summary:", processed.summary?.substring(0, 200) + "...");
console.log("Regulation Tags:", processed.regulationTags);
console.log("Impact Level:", processed.impactLevel);
console.log("Related Regulation IDs:", processed.relatedRegulationIds);

process.exit(0);
