/**
 * Op weg naar ZES (Zero-Emission Zones) News Scraper
 *
 * Scrapes zero-emission logistics news from the official ZES website.
 * Uses Playwright for JavaScript-rendered content.
 *
 * Source: https://opwegnaarzes.nl/actueel/nieuws
 * Frequency: 1-2 articles per month
 * Topics: Zero-emission zones, electric vehicles, urban logistics, freight transport
 */

import type { RawNewsItem } from "../news-fetcher";
import { NEWS_SOURCES } from "../news-sources";
import { serverLogger } from "../_core/logger-wiring";


/**
 * Scrapes ZES news articles
 * Returns empty array if Playwright is unavailable (deployment environment)
 */
export async function scrapeZESNews(): Promise<RawNewsItem[]> {
  try {
    // Dynamic import to handle optional Playwright dependency
    const playwright = await import("playwright");
    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    serverLogger.info("[ZES] Fetching news from https://opwegnaarzes.nl/actueel/nieuws");
    await page.goto("https://opwegnaarzes.nl/actueel/nieuws", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Wait for article content to load
    await page
      .waitForSelector("article, .news-item, .post", { timeout: 10000 })
      .catch(() => {
        serverLogger.warn("[ZES] No article selector found, trying alternative approach");
      });

    // Extract article data from the page
    const articles = await page.evaluate(() => {
      const items: Array<{
        title: string;
        url: string;
        publishedAt: string;
        excerpt: string;
      }> = [];

      // Find all article links (based on Kirby CMS structure observed)
      const articleLinks = document.querySelectorAll(
        'a[href*="/actueel/nieuws/"]'
      );

      articleLinks.forEach(link => {
        const anchor = link as HTMLAnchorElement;
        const href = anchor.href;

        // Skip if not a valid article URL
        if (
          !href ||
          href.includes("/actueel/nieuws") === false ||
          href === window.location.href
        ) {
          return;
        }

        // Find the article container
        let container =
          anchor.closest("article") ||
          anchor.closest(".post") ||
          anchor.closest("div");

        // Extract title
        let title = anchor.textContent?.trim() || "";
        const heading = container?.querySelector("h1, h2, h3, h4");
        if (heading && heading.textContent) {
          title = heading.textContent.trim();
        }

        // Extract date (Dutch format: "1 december 2025")
        let publishedAt = "";
        const dateText = container?.textContent || "";
        const dateMatch = dateText.match(
          /(\d{1,2})\s+(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)\s+(\d{4})/i
        );
        if (dateMatch) {
          publishedAt = dateMatch[0];
        }

        // Extract excerpt
        let excerpt = "";
        const paragraphs = container?.querySelectorAll("p");
        if (paragraphs && paragraphs.length > 0) {
          excerpt = Array.from(paragraphs)
            .map(p => p.textContent?.trim() || "")
            .filter(text => text.length > 20)
            .join(" ")
            .substring(0, 300);
        }

        // Only add if we have minimum required data
        if (title && href && title.length > 5) {
          items.push({
            title,
            url: href,
            publishedAt,
            excerpt,
          });
        }
      });

      return items;
    });

    serverLogger.info(`[ZES] Found ${articles.length} articles on listing page`);

    // Fetch full content for each article
    const fullArticles: RawNewsItem[] = [];

    for (const article of articles.slice(0, 10)) {
      // Limit to 10 most recent
      try {
        const detailPage = await context.newPage();
        await detailPage.goto(article.url, {
          waitUntil: "networkidle",
          timeout: 20000,
        });

        const fullContent = await detailPage.evaluate(() => {
          // Extract main article content
          const mainContent = document.querySelector(
            "article, .content, .post-content, main"
          );
          if (!mainContent) return "";

          // Remove navigation, headers, footers
          const unwanted = mainContent.querySelectorAll(
            "nav, header, footer, .menu, .navigation"
          );
          unwanted.forEach(el => el.remove());

          return mainContent.textContent?.trim() || "";
        });

        await detailPage.close();

        // Parse Dutch date to ISO format
        const publishedDate = parseDutchDate(article.publishedAt);

        // Get the source object from NEWS_SOURCES
        const sourceObj = NEWS_SOURCES.find(s => s.id === "zes-logistics")!;

        fullArticles.push({
          title: article.title,
          link: article.url,
          pubDate: publishedDate,
          content: fullContent || article.excerpt,
          contentSnippet: article.excerpt || fullContent.substring(0, 300),
          source: sourceObj,
        });

        serverLogger.info(`[ZES] Scraped: ${article.title}`);
      } catch (error) {
        serverLogger.error(`[ZES] Error scraping detail page ${article.url}:`, error);
      }
    }

    await browser.close();
    serverLogger.info(`[ZES] Successfully scraped ${fullArticles.length} articles`);
    return fullArticles;
  } catch (error: any) {
    if (
      error.code === "MODULE_NOT_FOUND" ||
      error.message?.includes("playwright")
    ) {
      serverLogger.info("[ZES] Playwright not available (deployment mode), returning empty array");
      return [];
    }
    serverLogger.error("[ZES] Scraping error:", error);
    return [];
  }
}

/**
 * Parse Dutch date format to ISO date string
 * Input: "1 december 2025" or "19 november 2025"
 * Output: "2025-12-01" or "2025-11-19"
 */
function parseDutchDate(dutchDate: string): string {
  if (!dutchDate) {
    return new Date().toISOString().split("T")[0]; // Default to today
  }

  const monthMap: Record<string, string> = {
    januari: "01",
    februari: "02",
    maart: "03",
    april: "04",
    mei: "05",
    juni: "06",
    juli: "07",
    augustus: "08",
    september: "09",
    oktober: "10",
    november: "11",
    december: "12",
  };

  const match = dutchDate.match(
    /(\d{1,2})\s+(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)\s+(\d{4})/i
  );

  if (match) {
    const day = match[1].padStart(2, "0");
    const month = monthMap[match[2].toLowerCase()];
    const year = match[3];
    return `${year}-${month}-${day}`;
  }

  return new Date().toISOString().split("T")[0]; // Fallback to today
}
