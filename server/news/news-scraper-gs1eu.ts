/**
 * GS1 Europe News Scraper
 * Scrapes news from https://gs1.eu/news/ using Playwright
 * RSS endpoint is blocked by Cloudflare, so we scrape the HTML page
 */

import { chromium, type Browser, type Page } from "playwright";
import type { RawNewsItem } from "../news-fetcher";
import { NEWS_SOURCES } from "../news-sources";
import { serverLogger } from "../_core/logger-wiring";


interface GS1EUArticle {
  title: string;
  url: string;
  summary: string;
  publishedAt: Date;
  imageUrl?: string;
}

const GS1_EU_NEWS_URL = "https://gs1.eu/news/";
const GS1_EU_SOURCE = NEWS_SOURCES.find(s => s.id === "gs1-eu-updates")!;

/**
 * Scrape GS1 Europe news listing page
 */
export async function scrapeGS1EuropeNews(): Promise<RawNewsItem[]> {
  let browser: Browser | null = null;

  try {
    console.log("[GS1 EU Scraper] Launching browser...");
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    console.log("[GS1 EU Scraper] Navigating to GS1 Europe news page...");
    await page.goto(GS1_EU_NEWS_URL, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Extract articles from the page
    const articles = await page.evaluate(() => {
      const items: Array<{
        title: string;
        url: string;
        summary: string;
        date: string;
        imageUrl?: string;
      }> = [];

      // GS1 EU uses WordPress with article cards
      // Try multiple selectors for different page layouts
      const articleSelectors = [
        "article",
        ".post",
        ".news-item",
        ".card",
        '[class*="news"]',
        '[class*="article"]',
      ];

      let articleElements: Element[] = [];
      for (const selector of articleSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          articleElements = Array.from(elements);
          break;
        }
      }

      // If no articles found with specific selectors, try generic approach
      if (articleElements.length === 0) {
        // Look for links with dates nearby
        const links = document.querySelectorAll("a[href*='/news/']");
        links.forEach(link => {
          const href = link.getAttribute("href");
          const text = link.textContent?.trim();
          if (href && text && text.length > 20) {
            items.push({
              title: text,
              url: href.startsWith("http") ? href : `https://gs1.eu${href}`,
              summary: "",
              date: new Date().toISOString(),
            });
          }
        });
      } else {
        articleElements.forEach(article => {
          // Find title and link
          const titleEl =
            article.querySelector("h2 a, h3 a, .title a, a.title") ||
            article.querySelector("h2, h3, .title");
          const linkEl =
            article.querySelector("a[href*='/news/']") ||
            article.querySelector("a");

          // Find date
          const dateEl = article.querySelector(
            "time, .date, .post-date, [class*='date']"
          );

          // Find summary/excerpt
          const summaryEl = article.querySelector(
            ".excerpt, .summary, p, .description"
          );

          // Find image
          const imgEl = article.querySelector("img");

          const title = titleEl?.textContent?.trim();
          let url = linkEl?.getAttribute("href");
          const dateStr =
            dateEl?.getAttribute("datetime") || dateEl?.textContent?.trim();
          const summary = summaryEl?.textContent?.trim();
          const imageUrl = imgEl?.getAttribute("src");

          if (title && url) {
            // Ensure absolute URL
            if (!url.startsWith("http")) {
              url = `https://gs1.eu${url}`;
            }

            items.push({
              title,
              url,
              summary: summary || "",
              date: dateStr || new Date().toISOString(),
              imageUrl: imageUrl || undefined,
            });
          }
        });
      }

      return items;
    });

    console.log(`[GS1 EU Scraper] Found ${articles.length} articles`);

    // Deduplicate by URL
    const seen = new Set<string>();
    const uniqueArticles = articles.filter(a => {
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    });

    console.log(
      `[GS1 EU Scraper] Returning ${uniqueArticles.length} unique articles`
    );

    // Convert to RawNewsItem format
    const newsItems: RawNewsItem[] = uniqueArticles
      .filter(article => {
        // Filter by date - only last 3 months
        const articleDate = parseDate(article.date);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return articleDate >= threeMonthsAgo;
      })
      .map(article => ({
        title: article.title,
        link: article.url,
        pubDate: parseDate(article.date).toISOString(),
        content: article.summary || "",
        contentSnippet: article.summary || "",
        creator: GS1_EU_SOURCE.name,
        categories: [],
        guid: article.url,
        source: GS1_EU_SOURCE,
      }));

    return newsItems;
  } catch (error) {
    serverLogger.error("[GS1 EU Scraper] Error:", error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Scrape full article content from GS1 Europe article page
 */
export async function scrapeGS1EUArticleDetail(
  url: string
): Promise<string | null> {
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    await page.waitForTimeout(1000);

    const content = await page.evaluate(() => {
      // Try multiple selectors for article content
      const contentSelectors = [
        ".entry-content",
        ".post-content",
        ".article-content",
        "article .content",
        ".content-area",
        "main article",
        ".single-post-content",
      ];

      for (const selector of contentSelectors) {
        const el = document.querySelector(selector);
        if (el) {
          // Remove scripts, styles, and navigation
          el.querySelectorAll("script, style, nav, .share, .social").forEach(
            e => e.remove()
          );
          return el.textContent?.trim() || null;
        }
      }

      // Fallback: get main content
      const main = document.querySelector("main, article, .main");
      if (main) {
        return main.textContent?.trim() || null;
      }

      return null;
    });

    return content;
  } catch (error) {
    serverLogger.error(`[GS1 EU Scraper] Error fetching article ${url}:`, error);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Parse various date formats
 */
function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();

  // Try ISO format first
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Try common European formats (DD/MM/YYYY, DD-MM-YYYY)
  const euMatch = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (euMatch) {
    const [, day, month, year] = euMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Try "Month DD, YYYY" format
  const usMatch = dateStr.match(
    /(\w+)\s+(\d{1,2}),?\s+(\d{4})/
  );
  if (usMatch) {
    const [, month, day, year] = usMatch;
    const monthIndex = getMonthIndex(month);
    if (monthIndex >= 0) {
      return new Date(parseInt(year), monthIndex, parseInt(day));
    }
  }

  // Default to now if parsing fails
  return new Date();
}

function getMonthIndex(month: string): number {
  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
  ];
  return months.indexOf(month.toLowerCase());
}
