/**
 * Populate database with live GS1.nl articles scraped via Playwright
 */
import { scrapeGS1NetherlandsNewsPlaywright } from "./server/news-scraper-playwright.ts";
import { processNewsItem } from "./server/news-ai-processor.ts";
import { createHubNews } from "./server/db.ts";
import { generateRecommendations } from "./server/news-recommendation-engine.ts";

console.log("🚀 Fetching live news from GS1.nl...\n");

try {
  // Scrape articles
  const articles = await scrapeGS1NetherlandsNewsPlaywright();
  console.log(`✅ Scraped ${articles.length} articles\n`);

  if (articles.length === 0) {
    console.log("❌ No articles found");
    process.exit(1);
  }

  // Process each article
  let inserted = 0;
  for (const article of articles.slice(0, 10)) {
    console.log(`Processing: ${article.title.substring(0, 60)}...`);

    try {
      // AI processing
      const processed = await processNewsItem({
        title: article.title,
        link: article.url,
        pubDate: article.publishedAt.toISOString(),
        content: "",
        contentSnippet: "",
        source: {
          id: "gs1-nl-news",
          name: "GS1 Netherlands News",
          type: "GS1_OFFICIAL",
          rssUrl: "",
          keywords: [],
          enabled: true,
          credibilityScore: 0.9,
        },
      });

      if (!processed) {
        console.log("  ⚠️  AI processing failed, skipping");
        continue;
      }

      // Insert into database
      const result = await createHubNews({
        title: processed.headline,
        summary: processed.summary,
        content: processed.whyItMatters,
        sourceUrl: article.url,
        publishedAt: article.publishedAt,
        sourceType: "GS1_OFFICIAL",
        impactLevel: processed.impactLevel,
        regulationTags: JSON.stringify(processed.regulationTags),
        isAutomated: true,
        retrievedAt: new Date(),
      });

      const newsId = result.id;
      console.log(`  ✅ Inserted with ID ${newsId}`);

      // Generate recommendations
      try {
        await generateRecommendations(
          newsId,
          processed.headline,
          processed.summary,
          processed.whyItMatters
        );
      } catch (error) {
        console.log(`  ⚠️  Recommendations failed: ${error.message}`);
      }
      inserted++;
    } catch (error) {
      console.error(`  ❌ Error:`, error.message);
    }
  }

  console.log(
    `\n🎉 Successfully inserted ${inserted}/${articles.length} articles`
  );
} catch (error) {
  console.error("❌ Fatal error:", error);
  process.exit(1);
}
