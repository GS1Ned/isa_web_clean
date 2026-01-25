/**
 * GS1 Netherlands News Scraper
 * Scrapes sustainability-related news from GS1.nl
 */

import axios from "axios";
import * as cheerio from "cheerio";
import { serverLogger } from "./_core/logger-wiring";


export interface ScrapedArticle {
  title: string;
  url: string;
  publishedAt: string;
  summary?: string;
  imageUrl?: string;
}

/**
 * Scrape GS1 Netherlands sustainability news
 */
export async function scrapeGS1NetherlandsNews(): Promise<ScrapedArticle[]> {
  const articles: ScrapedArticle[] = [];

  try {
    // Fetch sustainability-filtered news page (pre-filtered by GS1)
    // All articles from this category are ESG-relevant
    const response = await axios.get(
      "https://www.gs1.nl/gs1-in-actie/nieuws-en-events/nieuws/?sector=Duurzaamheid",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 15000,
      }
    );

    const $ = cheerio.load(response.data);

    // Find all news article containers
    // GS1.nl uses a grid layout with article cards
    $("article, .news-item, .card, [class*='news'], [class*='article']").each(
      (_: number, element: any) => {
        const $card = $(element);

        // Try to find the article link
        const $link = $card.find("a[href*='/nieuws/']").first();
        if (!$link.length) return;

        const href = $link.attr("href");
        if (!href || href === "/gs1-in-actie/nieuws-en-events/nieuws/") return;

        // Extract title from heading tags or link text
        let title = $card
          .find("h1, h2, h3, h4, .title, [class*='title'], [class*='heading']")
          .first()
          .text()
          .trim();
        if (!title || title === "lees artikel") {
          // Fallback: try to get title from link text or nearby elements
          title = $link.attr("title") || $link.attr("aria-label") || "";
        }

        if (!title || title.length < 10) return; // Skip if no valid title

        // Extract publish date
        const dateText = $card
          .find("time, .date, [class*='date'], [class*='published']")
          .first()
          .text()
          .trim();
        let publishedAt = new Date();

        if (dateText) {
          // Try multiple date formats
          const dateMatch = dateText.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
          if (dateMatch) {
            const [, day, month, year] = dateMatch;
            publishedAt = new Date(`${year}-${month}-${day}`);
          } else {
            // Try ISO format or other formats
            const parsed = new Date(dateText);
            if (!isNaN(parsed.getTime())) {
              publishedAt = parsed;
            }
          }
        }

        // Extract image URL
        const $img = $card.find("img").first();
        const imageUrl = $img.attr("src") || $img.attr("data-src");

        // Build full URL
        const fullUrl = href.startsWith("http")
          ? href
          : `https://www.gs1.nl${href}`;

        articles.push({
          title,
          url: fullUrl,
          publishedAt: publishedAt.toISOString(),
          imageUrl: imageUrl?.startsWith("http")
            ? imageUrl
            : imageUrl
              ? `https://www.gs1.nl${imageUrl}`
              : undefined,
        });
      }
    );

    // If no articles found with above selectors, try a different approach
    if (articles.length === 0) {
      // Look for all links in the news section
      $("a[href*='/nieuws/2025/'], a[href*='/nieuws/2024/']").each(
        (_: number, element: any) => {
          const $link = $(element);
          const href = $link.attr("href");

          if (!href) return;

          // Get title from link's aria-label, title attribute, or hint attribute
          let title =
            $link.attr("aria-label") ||
            $link.attr("title") ||
            $link.attr("hint") ||
            "";

          // If still no title, try getting text from the link itself
          if (!title || title === "lees artikel") {
            const linkText = $link.text().trim();
            if (
              linkText &&
              linkText !== "lees artikel" &&
              linkText.length > 10
            ) {
              title = linkText;
            }
          }

          if (!title || title.length < 10) return;

          const fullUrl = href.startsWith("http")
            ? href
            : `https://www.gs1.nl${href}`;

          // Extract date from URL (e.g., /nieuws/2025/article-slug/)
          const yearMatch = href.match(/\/nieuws\/(\d{4})\//);
          const year = yearMatch
            ? parseInt(yearMatch[1])
            : new Date().getFullYear();

          // Check if we already have this article
          if (articles.some(a => a.url === fullUrl)) return;

          articles.push({
            title,
            url: fullUrl,
            publishedAt: new Date(`${year}-01-01`).toISOString(), // Default to Jan 1 of the year
          });
        }
      );
    }

    serverLogger.info(`[GS1 NL Scraper] Found ${articles.length} articles`);
    return articles.slice(0, 20); // Return top 20 most recent
  } catch (error) {
    serverLogger.error("[GS1 NL Scraper] Error:", error);
    return [];
  }
}

/**
 * Scrape full article content from detail page
 */
export async function scrapeGS1ArticleDetail(
  url: string
): Promise<string | null> {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Extract main content
    const content = $("article, .article-content, .content, main")
      .first()
      .find("p")
      .map((_: number, el: any) => $(el).text().trim())
      .get()
      .join("\n\n");

    return content || null;
  } catch (error) {
    serverLogger.error(`[GS1 NL Scraper] Error fetching detail for ${url}:`, error);
    return null;
  }
}
