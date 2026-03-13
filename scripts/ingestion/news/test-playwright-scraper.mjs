import { scrapeGS1NetherlandsNewsPlaywright } from "./server/news-scraper-playwright.ts";
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);


cliOut("Testing Playwright scraper for GS1.nl...\n");

try {
  const articles = await scrapeGS1NetherlandsNewsPlaywright();

  cliOut(`\n✅ Found ${articles.length} articles:\n`);

  articles.forEach((article, i) => {
    cliOut(`${i + 1}. ${article.title}`);
    cliOut(`   URL: ${article.url}`);
    cliOut(`   Date: ${article.publishedAt.toLocaleDateString("nl-NL")}`);
    if (article.imageUrl) {
      cliOut(`   Image: ${article.imageUrl.substring(0, 60)}...`);
    }
    cliOut();
  });

  cliOut(`\n✅ Scraper test completed successfully`);
} catch (error) {
  cliErr("❌ Error:", error);
  process.exit(1);
}
