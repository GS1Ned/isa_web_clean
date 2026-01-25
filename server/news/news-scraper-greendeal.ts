/**
 * Green Deal Duurzame Zorg (Sustainable Healthcare) News Scraper
 *
 * Scrapes healthcare sustainability news from the official Green Deal Zorg website.
 * Uses Playwright for JavaScript-rendered content.
 *
 * Source: https://www.greendealduurzamezorg.nl/service/nieuws/
 * Frequency: 2-3 articles per month
 * Topics: Healthcare sustainability, circular economy, medical devices, green teams
 */

import type { RawNewsItem } from "../news-fetcher";
import { NEWS_SOURCES } from "../news-sources";
import { serverLogger } from "../_core/logger-wiring";


/**
 * Scrapes Green Deal Zorg news articles
 * Returns empty array if Playwright is unavailable (deployment environment)
 */
export async function scrapeGreenDealZorg(): Promise<RawNewsItem[]> {
  try {
    // Dynamic import to handle optional Playwright dependency
    const playwright = await import("playwright");
    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log(
      "[Green Deal Zorg] Fetching news from https://www.greendealduurzamezorg.nl/service/nieuws/"
    );
    await page.goto("https://www.greendealduurzamezorg.nl/service/nieuws/", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Wait for article cards to load
    await page
      .waitForSelector("article, .news-item, .article-card", { timeout: 10000 })
      .catch(() => {
        console.log(
          "[Green Deal Zorg] No article selector found, trying alternative approach"
        );
      });

    // Extract article data from the page
    const articles = await page.evaluate(() => {
      const items: Array<{
        title: string;
        url: string;
        publishedAt: string;
        excerpt: string;
      }> = [];

      // Find all article links (based on observed HTML structure)
      const articleLinks = document.querySelectorAll('a[href*="/nieuws/"]');

      articleLinks.forEach(link => {
        const anchor = link as HTMLAnchorElement;
        const href = anchor.href;

        // Skip if not a valid article URL
        if (
          !href ||
          href.includes("/service/nieuws/") ||
          href === window.location.href
        ) {
          return;
        }

        // Find the article container (parent elements)
        let container =
          anchor.closest("article") ||
          anchor.closest(".news-item") ||
          anchor.closest("div");

        // Extract title (from link text or heading)
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

    console.log(
      `[Green Deal Zorg] Found ${articles.length} articles on listing page`
    );

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
        const sourceObj = NEWS_SOURCES.find(
          s => s.id === "greendeal-healthcare"
        )!;

        fullArticles.push({
          title: article.title,
          link: article.url,
          pubDate: publishedDate,
          content: fullContent || article.excerpt,
          contentSnippet: article.excerpt || fullContent.substring(0, 300),
          source: sourceObj,
        });

        console.log(`[Green Deal Zorg] Scraped: ${article.title}`);
      } catch (error) {
        serverLogger.error(`[Green Deal Zorg] Error scraping detail page ${article.url}:`, error);
      }
    }

    await browser.close();
    console.log(
      `[Green Deal Zorg] Successfully scraped ${fullArticles.length} articles`
    );
    return fullArticles;
  } catch (error: any) {
    if (
      error.code === "MODULE_NOT_FOUND" ||
      error.message?.includes("playwright")
    ) {
      console.log(
        "[Green Deal Zorg] Playwright not available (deployment mode), returning empty array"
      );
      return [];
    }
    serverLogger.error("[Green Deal Zorg] Scraping error:", error);
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
