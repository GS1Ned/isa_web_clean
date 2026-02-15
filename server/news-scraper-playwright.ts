import { serverLogger } from "./_core/logger-wiring";

/**
 * Production Web Scraper using Playwright
 * Handles JavaScript-rendered content from GS1.nl sustainability feed
 *
 * NOTE: Playwright is optional (devDependency) to avoid deployment timeouts
 * Browsers are installed on first cron run, not during deployment
 */

export interface ScrapedArticle {
  title: string;
  url: string;
  publishedAt: Date;
  summary?: string;
  imageUrl?: string;
}

// Dynamically import Playwright (optional dependency)
async function getPlaywright() {
  try {
    const playwright = await import("playwright");
    return playwright;
  } catch (error) {
    serverLogger.warn("[Playwright Scraper] Playwright not available - scraping disabled");
    serverLogger.warn(
      "[Playwright Scraper] Install with: pnpm add -D playwright && npx playwright install chromium"
    );
    return null;
  }
}

/**
 * Scrape GS1 Netherlands sustainability news with Playwright
 * Handles JavaScript-rendered content and dynamic loading
 */
export async function scrapeGS1NetherlandsNewsPlaywright(): Promise<
  ScrapedArticle[]
> {
  // Check if Playwright is available
  const playwright = await getPlaywright();
  if (!playwright) {
    serverLogger.info("[Playwright Scraper] Skipping scrape - Playwright not installed");
    return [];
  }

  let browser: any = null;

  try {
    serverLogger.info("[Playwright Scraper] Launching browser...");

    // Launch headless browser
    browser = await playwright.chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    serverLogger.info("[Playwright Scraper] Navigating to GS1.nl sustainability news...");

    // Navigate to main news page (sustainability filter returns 0 results)
    await page.goto(
      "https://www.gs1.nl/gs1-in-actie/nieuws-en-events/nieuws/",
      {
        waitUntil: "networkidle",
        timeout: 30000,
      }
    );

    // Wait for page to fully load
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000); // Give time for dynamic content

    serverLogger.info("[Playwright Scraper] Extracting articles...");

    // Extract all article data
    const articles = await page.evaluate(() => {
      const results: Array<{
        title: string;
        url: string;
        dateText: string;
        imageUrl?: string;
      }> = [];

      // Find all links to news articles (broader selector)
      const links = document.querySelectorAll("a[href]");
      const newsLinks = Array.from(links).filter(link => {
        const href = link.getAttribute("href") || "";
        return href.includes("/nieuws/2025/") || href.includes("/nieuws/2024/");
      });

      newsLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (!href || href === "/gs1-in-actie/nieuws-en-events/nieuws/") return;

        // Get title from various possible sources
        let title =
          link.getAttribute("title") ||
          link.getAttribute("aria-label") ||
          link.getAttribute("hint") ||
          "";

        // If title not in attributes, try to find it in nearby heading or text
        if (!title || title === "lees artikel" || title.length < 10) {
          // Look for heading elements near the link
          const parent = link.closest(
            'article, .news-item, .card, [class*="news"]'
          );
          if (parent) {
            const heading = parent.querySelector(
              'h1, h2, h3, h4, .title, [class*="title"]'
            );
            if (heading) {
              title = heading.textContent?.trim() || "";
            }
          }

          // Fallback: use link text if still no title
          if (!title || title.length < 10) {
            title = link.textContent?.trim() || "";
          }
        }

        // Skip if still no valid title
        if (!title || title === "lees artikel" || title.length < 10) return;

        // Get date
        const parent = link.closest(
          'article, .news-item, .card, [class*="news"]'
        );
        let dateText = "";
        if (parent) {
          const dateEl = parent.querySelector('time, .date, [class*="date"]');
          dateText = dateEl?.textContent?.trim() || "";
        }

        // Get image
        let imageUrl = "";
        if (parent) {
          const img = parent.querySelector("img");
          imageUrl =
            img?.getAttribute("src") || img?.getAttribute("data-src") || "";
        }

        // Build full URL
        const fullUrl = href.startsWith("http")
          ? href
          : `https://www.gs1.nl${href}`;

        results.push({
          title,
          url: fullUrl,
          dateText,
          imageUrl: imageUrl.startsWith("http")
            ? imageUrl
            : imageUrl
              ? `https://www.gs1.nl${imageUrl}`
              : undefined,
        });
      });

      return results;
    });

    serverLogger.info(`[Playwright Scraper] Found ${articles.length} raw articles`);

    // Process and deduplicate
    const seen = new Set<string>();
    const processed: ScrapedArticle[] = [];

    for (const article of articles) {
      // Skip duplicates
      if (seen.has(article.url)) continue;
      seen.add(article.url);

      // Parse date
      let publishedAt = new Date();
      if (article.dateText) {
        // Try DD-MM-YYYY format
        const match = article.dateText.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
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
      } else {
        // Extract year from URL if no date
        const yearMatch = article.url.match(/\/nieuws\/(\d{4})\//);
        if (yearMatch) {
          publishedAt = new Date(`${yearMatch[1]}-01-01`);
        }
      }

      processed.push({
        title: article.title,
        url: article.url,
        publishedAt,
        imageUrl: article.imageUrl,
      });
    }

    await browser.close();

    serverLogger.info(`[Playwright Scraper] Returning ${processed.length} unique articles`);
    return processed.slice(0, 20); // Return top 20 most recent
  } catch (error) {
    serverLogger.error("[Playwright Scraper] Error:", error);
    if (browser) {
      await browser.close();
    }
    return [];
  }
}

/**
 * Scrape full article content from detail page
 */
export async function scrapeArticleDetailPlaywright(
  url: string
): Promise<string | null> {
  // Check if Playwright is available
  const playwright = await getPlaywright();
  if (!playwright) {
    serverLogger.info("[Playwright Scraper] Skipping detail scrape - Playwright not installed");
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
        "article, .article-content, .content, main"
      );
      if (!main) return null;

      const paragraphs = main.querySelectorAll("p");
      return Array.from(paragraphs)
        .map(p => p.textContent?.trim())
        .filter(Boolean)
        .join("\n\n");
    });

    await browser.close();
    return content || null;
  } catch (error) {
    serverLogger.error(`[Playwright Scraper] Error fetching detail for ${url}:`, error);
    if (browser) {
      await browser.close();
    }
    return null;
  }
}

// CLI execution for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeGS1NetherlandsNewsPlaywright()
    .then(articles => {
      const out = (line: string) => process.stdout.write(line.endsWith("\n") ? line : `${line}\n`);
      out("\n=== Scraping Results ===");
      out(`Total articles: ${articles.length}\n`);

      articles.forEach((article, index) => {
        out(`${index + 1}. ${article.title}`);
        out(`   URL: ${article.url}`);
        out(`   Date: ${article.publishedAt.toISOString()}`);
        out("");
      });
    })
    .catch(err => {
      process.stderr.write(`${String(err)}\n`);
      process.exitCode = 1;
    });
}
