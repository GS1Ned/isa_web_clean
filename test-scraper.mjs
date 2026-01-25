import { scrapeGS1NetherlandsNews } from "./server/news-scraper-gs1nl.ts";

console.log("Testing GS1 NL scraper...");

try {
  const articles = await scrapeGS1NetherlandsNews();
  console.log(`\n✅ Found ${articles.length} articles:\n`);

  articles.slice(0, 5).forEach((article, i) => {
    console.log(`${i + 1}. ${article.title}`);
    console.log(`   URL: ${article.url}`);
    console.log(`   Date: ${article.publishedAt.toLocaleDateString()}\n`);
  });
} catch (error) {
  console.error("❌ Error:", error);
}
