import {
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);

  scrapeEFRAGNewsPlaywright,
  scrapeEFRAGArticleDetail,
} from "./server/news-scraper-efrag.js";
import { processNewsItem } from "./server/news-ai-processor.js";

cliOut("[TEST] Testing EFRAG pipeline with AI processing...\n");

// Step 1: Scrape news list
cliOut("Step 1: Scraping EFRAG news list...");
const articles = await scrapeEFRAGNewsPlaywright();
cliOut(`✅ Found ${articles.length} articles\n`);

if (articles.length === 0) {
  cliOut("❌ No articles found");
  process.exit(1);
}

// Step 2: Get full content for first article
const firstArticle = articles[0];
cliOut(`Step 2: Fetching full content for: "${firstArticle.title}"`);
const fullContent = await scrapeEFRAGArticleDetail(firstArticle.url);
cliOut(`✅ Content length: ${fullContent?.length || 0} characters\n`);

if (!fullContent) {
  cliOut("❌ No content fetched");
  process.exit(1);
}

// Step 3: Process with AI
cliOut("Step 3: Processing with AI...");
const processed = await processNewsItem({
  title: firstArticle.title,
  url: firstArticle.url,
  publishedAt: firstArticle.publishedAt,
  content: fullContent,
  sourceType: "EU_OFFICIAL",
});

cliOut("\n✅ AI Processing Result:");
cliOut("Summary:", processed.summary?.substring(0, 200) + "...");
cliOut("Regulation Tags:", processed.regulationTags);
cliOut("Impact Level:", processed.impactLevel);
cliOut("Related Regulation IDs:", processed.relatedRegulationIds);

process.exit(0);
