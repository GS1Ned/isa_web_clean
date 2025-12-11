import { scrapeEFRAGArticleDetail } from "./server/news-scraper-efrag.js";

const url =
  "https://www.efrag.org/en/news-and-calendar/news/efrag-launches-the-esrs-knowledge-hub-a-new-digital-gateway-to-sustainability-reporting";

console.log("[TEST] Scraping EFRAG article detail...");
console.log("[TEST] URL:", url);

const content = await scrapeEFRAGArticleDetail(url);

console.log("[TEST] Content length:", content?.length || 0);
console.log("[TEST] First 500 chars:", content?.substring(0, 500));
console.log("[TEST] Last 200 chars:", content?.substring(content.length - 200));

process.exit(0);
