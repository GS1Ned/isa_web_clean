import { scrapeGS1NetherlandsNewsPlaywright } from "./server/news-scraper-playwright.ts";

console.log("Testing Playwright scraper for GS1.nl...\n");

try {
  const articles = await scrapeGS1NetherlandsNewsPlaywright();

  console.log(`\n✅ Found ${articles.length} articles:\n`);

  articles.forEach((article, i) => {
    console.log(`${i + 1}. ${article.title}`);
    console.log(`   URL: ${article.url}`);
    console.log(`   Date: ${article.publishedAt.toLocaleDateString("nl-NL")}`);
    if (article.imageUrl) {
      console.log(`   Image: ${article.imageUrl.substring(0, 60)}...`);
    }
    console.log();
  });

  console.log(`\n✅ Scraper test completed successfully`);
} catch (error) {
  console.error("❌ Error:", error);
  process.exit(1);
}
