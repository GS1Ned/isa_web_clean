import { scrapeGS1NetherlandsNews } from "./server/news-scraper-gs1nl.ts";
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);


cliOut("Testing GS1 NL scraper...");

try {
  const articles = await scrapeGS1NetherlandsNews();
  cliOut(`\n✅ Found ${articles.length} articles:\n`);

  articles.slice(0, 5).forEach((article, i) => {
    cliOut(`${i + 1}. ${article.title}`);
    cliOut(`   URL: ${article.url}`);
    cliOut(`   Date: ${article.publishedAt.toLocaleDateString()}\n`);
  });
} catch (error) {
  cliErr("❌ Error:", error);
}
