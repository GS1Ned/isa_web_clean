import { serverLogger } from "./_core/logger-wiring";

/**
 * EFRAG News Playwright Scraper
 * Scrapes sustainability reporting news from EFRAG
 */

interface ScrapedArticle {
  title: string;
  url: string;
  publishedAt: Date;
  summary?: string;
  imageUrl?: string;
}

/**
 * Dynamically import Playwright (optional dependency)
 */
async function getPlaywright() {
  try {
    return await import("playwright");
  } catch (error) {
    serverLogger.info("[EFRAG Scraper] Playwright not available - scraping disabled");
    return null;
  }
}

/**
 * Scrape EFRAG sustainability reporting news
 */
export async function scrapeEFRAGNewsPlaywright(): Promise<ScrapedArticle[]> {
  // Check if Playwright is available
  const playwright = await getPlaywright();
  if (!playwright) {
    serverLogger.info("[EFRAG Scraper] Skipping - Playwright not installed");
    return [];
  }

  let browser: any = null;

  try {
    serverLogger.info("[EFRAG Scraper] Launching browser...");
    browser = await playwright.chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to EFRAG sustainability reporting news
    serverLogger.info("[EFRAG Scraper] Navigating to EFRAG news page...");
    await page.goto("https://www.efrag.org/en/sustainability-reporting/news", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Wait for news items to load
    await page.waitForSelector('[class*="article"]', { timeout: 10000 });

    // Extract news articles
    const articles = await page.evaluate(() => {
      const results: Array<{
        title: string;
        url: string;
        dateText: string;
      }> = [];

      // Find all news items (cards with article class)
      const newsItems = document.querySelectorAll('[class*="article"]');

      newsItems.forEach(item => {
        // Get title and URL
        const titleLink = item.querySelector(
          "h2 a, h3 a, h4 a, .card__title a"
        );
        if (!titleLink) return;

        const title = titleLink.textContent?.trim() || "";
        const href = titleLink.getAttribute("href") || "";
        if (!title || !href) return;

        // Get date
        const dateEl = item.querySelector(
          '.field--name-field-date, time, [class*="date"]'
        );
        const dateText = dateEl?.textContent?.trim() || "";

        results.push({
          title,
          url: href,
          dateText,
        });
      });

      return results;
    });

    serverLogger.info(`[EFRAG Scraper] Found ${articles.length} raw articles`);

    // Process and deduplicate
    const seen = new Set<string>();
    const processed: ScrapedArticle[] = [];

    for (const article of articles) {
      // Build full URL
      const fullUrl = article.url.startsWith("http")
        ? article.url
        : `https://www.efrag.org${article.url}`;

      // Skip duplicates
      if (seen.has(fullUrl)) continue;
      seen.add(fullUrl);

      // Parse date
      let publishedAt = new Date();
      if (article.dateText) {
        // Try DD.MM.YYYY format (EFRAG uses this)
        const match = article.dateText.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
        if (match) {
          const [, day, month, year] = match;
          publishedAt = new Date(`${year}-${month}-${day}`);
        } else {
          // Try other formats
          const parsed = new Date(article.dateText);
          if (!isNaN(parsed.getTime())) {
            publishedAt = parsed;
          }
        }
      }

      processed.push({
        title: article.title,
        url: fullUrl,
        publishedAt,
      });
    }

    await browser.close();

    serverLogger.info(`[EFRAG Scraper] Returning ${processed.length} unique articles`);
    return processed.slice(0, 20); // Return top 20 most recent
  } catch (error) {
    serverLogger.error("[EFRAG Scraper] Error:", error);
    if (browser) {
      await browser.close();
    }
    return [];
  }
}

/**
 * Scrape full article content from detail page
 */
export async function scrapeEFRAGArticleDetail(
  url: string
): Promise<string | null> {
  // Check if Playwright is available
  const playwright = await getPlaywright();
  if (!playwright) {
    serverLogger.info("[EFRAG Scraper] Skipping detail scrape - Playwright not installed");
    return null;
  }

  let browser: any = null;

  try {
    browser = await playwright.chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    // Extract main content
    const content = await page.evaluate(() => {
      const main = document.querySelector(
        "article, .field--name-body, .content, main"
      );
      if (!main) return null;

      // Remove scripts, styles, nav
      const unwanted = main.querySelectorAll("script, style, nav, .navigation");
      unwanted.forEach(el => el.remove());

      return main.textContent?.trim() || null;
    });

    await browser.close();
    return content;
  } catch (error) {
    serverLogger.error("[EFRAG Scraper] Error scraping detail:", error);
    if (browser) {
      await browser.close();
    }
    return null;
  }
}

// CLI test execution
if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write("Testing EFRAG scraper...\n");
  scrapeEFRAGNewsPlaywright()
    .then(articles => {
      process.stdout.write(`\n✅ Scraped ${articles.length} articles:\n`);
      articles.forEach((article, i) => {
        process.stdout.write(`\n${i + 1}. ${article.title}\n`);
        process.stdout.write(`   URL: ${article.url}\n`);
        process.stdout.write(`   Date: ${article.publishedAt.toISOString().split("T")[0]}\n`);
      });
    })
    .catch(error => {
      serverLogger.error("❌ Scraper failed:", error);
      process.exit(1);
    });
}
