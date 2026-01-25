/**
 * EUR-Lex Official Journal Playwright Scraper
 * 
 * Scrapes the Official Journal L series daily view for recent EU legislation.
 * The RSS feed is broken (returns HTML error page), so we use Playwright to
 * scrape the daily view page directly.
 * 
 * Source: https://eur-lex.europa.eu/oj/daily-view/L-series/default.html
 */

import type { RawNewsItem } from '../news-fetcher';
import { NEWS_SOURCES } from '../news-sources';
import { serverLogger } from "../_core/logger-wiring";


// Dynamic import for Playwright to handle deployment without browser
async function getPlaywright() {
  try {
    const playwright = await import('playwright');
    return playwright;
  } catch (error) {
    console.log('[EUR-Lex Scraper] Playwright not available, returning empty results');
    return null;
  }
}

export interface EURLexArticle {
  title: string;
  url: string;
  celexNumber: string;
  publishedDate: Date;
  category: string;
}

/**
 * Scrape EUR-Lex Official Journal L series for recent legislation
 */
export async function scrapeEURLexOfficialJournal(): Promise<EURLexArticle[]> {
  const playwright = await getPlaywright();
  if (!playwright) {
    return [];
  }

  const { chromium } = playwright;
  let browser;
  
  try {
    console.log('[EUR-Lex Scraper] Launching browser...');
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    
    console.log('[EUR-Lex Scraper] Navigating to Official Journal L series...');
    await page.goto('https://eur-lex.europa.eu/oj/daily-view/L-series/default.html', {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });
    
    // Wait for content to load
    await page.waitForSelector('.EurlexContent', { timeout: 15000 }).catch(() => {
      console.log('[EUR-Lex Scraper] Content selector not found, trying alternative...');
    });
    
    // Extract legislation items
    const articles = await page.evaluate(() => {
      const items: Array<{
        title: string;
        url: string;
        celexNumber: string;
        category: string;
      }> = [];
      
      // Find all legislation links in the page
      const links = document.querySelectorAll('a[href*="/legal-content/"]');
      
      links.forEach((link) => {
        const anchor = link as HTMLAnchorElement;
        const title = anchor.textContent?.trim() || '';
        const url = anchor.href;
        
        // Extract CELEX number from URL or nearby element
        const celexMatch = url.match(/CELEX:(\d+[A-Z]\d+)/i) || 
                          url.match(/\/(\d{4}\/\d+)/);
        const celexNumber = celexMatch ? celexMatch[1] : '';
        
        // Determine category from parent section
        let category = 'Legislation';
        const parentSection = anchor.closest('.panel-group, .accordion-group, div[class*="section"]');
        if (parentSection) {
          const sectionTitle = parentSection.querySelector('button, .panel-title, h3, h4');
          if (sectionTitle) {
            category = sectionTitle.textContent?.trim() || 'Legislation';
          }
        }
        
        // Only include items with meaningful titles
        if (title.length > 20 && url.includes('eur-lex.europa.eu')) {
          items.push({
            title,
            url,
            celexNumber,
            category
          });
        }
      });
      
      return items;
    });
    
    // Get the date from the page header
    const dateText = await page.evaluate(() => {
      const dateElement = document.querySelector('.oj-date, .date-display, h1 + *');
      return dateElement?.textContent?.trim() || '';
    });
    
    // Parse the date (format: "16 December 2025")
    let publishedDate = new Date();
    if (dateText) {
      const parsed = new Date(dateText);
      if (!isNaN(parsed.getTime())) {
        publishedDate = parsed;
      }
    }
    
    console.log(`[EUR-Lex Scraper] Found ${articles.length} legislation items`);
    
    // Convert to EURLexArticle format
    const result: EURLexArticle[] = articles.map(article => ({
      ...article,
      publishedDate
    }));
    
    // Deduplicate by URL
    const seen = new Set<string>();
    const unique = result.filter(article => {
      if (seen.has(article.url)) return false;
      seen.add(article.url);
      return true;
    });
    
    console.log(`[EUR-Lex Scraper] Returning ${unique.length} unique items`);
    return unique;
    
  } catch (error) {
    serverLogger.error('[EUR-Lex Scraper] Error:', error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Filter EUR-Lex articles for ESG relevance
 */
export function filterESGRelevant(articles: EURLexArticle[]): EURLexArticle[] {
  const esgKeywords = [
    // Environmental
    'environment', 'climate', 'emission', 'carbon', 'sustainability', 'sustainable',
    'biodiversity', 'deforestation', 'forest', 'pollution', 'waste', 'recycl',
    'circular economy', 'energy', 'renewable', 'green', 'eco-design', 'ecodesign',
    // Social
    'human rights', 'labour', 'labor', 'worker', 'supply chain', 'due diligence',
    'forced labour', 'child labour', 'social',
    // Governance
    'reporting', 'disclosure', 'transparency', 'corporate governance',
    // Specific regulations
    'csrd', 'esrs', 'eudr', 'csddd', 'sfdr', 'taxonomy', 'dpp', 'digital product passport',
    'packaging', 'battery', 'batteries', 'textile', 'espr', 'ppwr'
  ];
  
  return articles.filter(article => {
    const titleLower = article.title.toLowerCase();
    const categoryLower = article.category.toLowerCase();
    
    return esgKeywords.some(keyword => 
      titleLower.includes(keyword) || categoryLower.includes(keyword)
    );
  });
}

/**
 * Convert EUR-Lex articles to RawNewsItem format
 */
export function convertToRawNewsItems(articles: EURLexArticle[]): RawNewsItem[] {
  const source = NEWS_SOURCES.find(s => s.id === 'eurlex-oj') || {
    id: 'eurlex-oj',
    name: 'EUR-Lex Official Journal',
    type: 'EU_OFFICIAL' as const,
    rssUrl: '',
    keywords: [],
    credibilityScore: 1.0,
    enabled: true
  };
  
  return articles.map(article => ({
    title: article.title,
    link: article.url,
    pubDate: article.publishedDate.toISOString(),
    content: `${article.category}: ${article.celexNumber || 'New legislation'}`,
    contentSnippet: article.title.substring(0, 200),
    creator: 'European Union',
    categories: detectRegulationTags(article.title),
    guid: article.url,
    source
  }));
}

/**
 * Detect regulation tags from title
 */
function detectRegulationTags(title: string): string[] {
  const tags: string[] = [];
  const titleLower = title.toLowerCase();
  
  const regulationPatterns: Record<string, string[]> = {
    'CSRD': ['corporate sustainability reporting', 'csrd', 'sustainability reporting directive'],
    'ESRS': ['esrs', 'european sustainability reporting standard'],
    'EUDR': ['deforestation', 'eudr', 'deforestation regulation', 'forest'],
    'CSDDD': ['due diligence', 'csddd', 'supply chain', 'corporate sustainability due diligence'],
    'SFDR': ['sfdr', 'sustainable finance disclosure'],
    'EU Taxonomy': ['taxonomy', 'sustainable activities'],
    'DPP': ['digital product passport', 'product passport'],
    'PPWR': ['packaging', 'ppwr', 'packaging waste'],
    'ESPR': ['ecodesign', 'eco-design', 'espr', 'sustainable products'],
    'Battery Regulation': ['battery', 'batteries'],
    'REACH': ['reach', 'chemical', 'chemicals'],
    'CBAM': ['cbam', 'carbon border', 'carbon adjustment']
  };
  
  for (const [tag, patterns] of Object.entries(regulationPatterns)) {
    if (patterns.some(pattern => titleLower.includes(pattern))) {
      tags.push(tag);
    }
  }
  
  return tags;
}

/**
 * Main function to fetch EUR-Lex news
 */
export async function fetchEURLexNews(): Promise<RawNewsItem[]> {
  const articles = await scrapeEURLexOfficialJournal();
  const esgArticles = filterESGRelevant(articles);
  return convertToRawNewsItems(esgArticles);
}
