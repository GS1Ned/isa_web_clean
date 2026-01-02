import { getDb } from './db';
import { hubNews, regulations } from '../drizzle/schema';
import { sql, count, and, gte, lte, eq } from 'drizzle-orm';

/**
 * Get news count per regulation
 */
export async function getNewsByRegulation() {
  const db = await getDb();
  
  const allNews = await db!.select({
    regulationTags: hubNews.regulationTags,
  }).from(hubNews);
  
  // Count occurrences of each regulation tag
  const counts = new Map<string, number>();
  allNews.forEach(news => {
    if (Array.isArray(news.regulationTags)) {
      news.regulationTags.forEach((tag: string) => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    }
  });
  
  return Array.from(counts.entries())
    .map(([regulation, count]) => ({ regulation, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get news count per sector
 */
export async function getNewsBySector() {
  const db = await getDb();
  
  const allNews = await db!.select({
    sectorTags: hubNews.sectorTags,
  }).from(hubNews);
  
  // Count occurrences of each sector tag
  const counts = new Map<string, number>();
  allNews.forEach(news => {
    if (Array.isArray(news.sectorTags)) {
      news.sectorTags.forEach((tag: string) => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    }
  });
  
  return Array.from(counts.entries())
    .map(([sector, count]) => ({ sector, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get news count per GS1 impact area
 */
export async function getNewsByGS1Impact() {
  const db = await getDb();
  
  const allNews = await db!.select({
    gs1ImpactTags: hubNews.gs1ImpactTags,
  }).from(hubNews);
  
  // Count occurrences of each GS1 impact tag
  const counts = new Map<string, number>();
  allNews.forEach(news => {
    if (Array.isArray(news.gs1ImpactTags)) {
      news.gs1ImpactTags.forEach((tag: string) => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    }
  });
  
  return Array.from(counts.entries())
    .map(([impactArea, count]) => ({ impactArea, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get news count per source type
 */
export async function getNewsBySource() {
  const db = await getDb();
  
  const allNews = await db!.select({
    sourceType: hubNews.sourceType,
  }).from(hubNews);
  
  // Count occurrences of each source type
  const counts = new Map<string, number>();
  allNews.forEach(news => {
    const sourceType = news.sourceType || 'UNKNOWN';
    counts.set(sourceType, (counts.get(sourceType) || 0) + 1);
  });
  
  return Array.from(counts.entries())
    .map(([sourceType, count]) => ({ sourceType, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get news count per month (time series)
 */
export async function getNewsByMonth(months: number = 6) {
  const db = await getDb();
  
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);
  
  const allNews = await db!.select({
    publishedDate: hubNews.publishedDate,
    createdAt: hubNews.createdAt,
  }).from(hubNews);
  
  // Group by month
  const counts = new Map<string, number>();
  allNews.forEach(news => {
    const dateStr = news.publishedDate || news.createdAt;
    if (dateStr) {
      const date = new Date(dateStr);
      if (date >= cutoffDate) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        counts.set(monthKey, (counts.get(monthKey) || 0) + 1);
      }
    }
  });
  
  return Array.from(counts.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Get coverage statistics summary
 */
export async function getCoverageStatistics() {
  const db = await getDb();
  
  const [totalNewsResult,
    totalRegulationsResult,
    byRegulation,
    bySector,
    bySource,
    byMonth,
  ] = await Promise.all([
    db!.select({ count: count() }).from(hubNews),
    db!.select({ count: count() }).from(regulations),
    getNewsByRegulation(),
    getNewsBySector(),
    getNewsBySource(),
    getNewsByMonth(6),
  ]);
  
  const totalNews = totalNewsResult[0].count;
  const totalRegulations = totalRegulationsResult[0].count;
  
  // Calculate coverage percentage (regulations with at least 1 news article)
  const regulationsWithNews = byRegulation.length;
  const coveragePercentage = totalRegulations > 0 
    ? Math.round((regulationsWithNews / totalRegulations) * 100)
    : 0;
  
  return {
    totalNews,
    totalRegulations,
    regulationsWithNews,
    coveragePercentage,
    topRegulations: byRegulation.slice(0, 10),
    topSectors: bySector.slice(0, 10),
    sourceDistribution: bySource,
    monthlyTrend: byMonth,
  };
}

/**
 * Get coverage gaps (regulations with no news)
 */
export async function getCoverageGaps() {
  const db = await getDb();
  
  const [allRegulations, byRegulation] = await Promise.all([
    db!.select({
      id: regulations.id,
      title: regulations.title,
      celexId: regulations.celexId,
      regulationType: regulations.regulationType,
    }).from(regulations),
    getNewsByRegulation(),
  ]);
  
  const regulationsWithNews = new Set(byRegulation.map(r => r.regulation));
  
  // Find regulations with no news coverage
  const gaps = allRegulations.filter(reg => {
    // Check if any news mentions this regulation by title or CELEX ID
    const title = reg.title || '';
    const celexId = reg.celexId || '';
    return !regulationsWithNews.has(title) && !regulationsWithNews.has(celexId);
  });
  
  return gaps.map(reg => ({
    id: reg.id,
    title: reg.title,
    celexId: reg.celexId,
    type: reg.regulationType,
    newsCount: 0,
  }));
}
