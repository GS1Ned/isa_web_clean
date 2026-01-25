import { getDb } from '../server/db';
import { hubNews } from '../drizzle/schema';
import { count } from 'drizzle-orm';

const db = await getDb();

// Total news count
const totalResult = await db.select({ count: count() }).from(hubNews);
console.log('Total news articles:', totalResult[0].count);

// Get all news to analyze in memory
const allNews = await db.select({
  id: hubNews.id,
  sourceType: hubNews.sourceType,
  regulationTags: hubNews.regulationTags,
  gs1ImpactTags: hubNews.gs1ImpactTags,
  sectorTags: hubNews.sectorTags,
  publishedDate: hubNews.publishedDate,
  createdAt: hubNews.createdAt
}).from(hubNews);

console.log('\nTotal fetched:', allNews.length);

// Analyze by source type
const bySource = new Map<string, number>();
allNews.forEach(news => {
  const st = news.sourceType || 'UNKNOWN';
  bySource.set(st, (bySource.get(st) || 0) + 1);
});
console.log('\nNews by source type:', Object.fromEntries(bySource));

// Analyze by regulation tags
const byRegulation = new Map<string, number>();
allNews.forEach(news => {
  if (Array.isArray(news.regulationTags)) {
    news.regulationTags.forEach((tag: string) => {
      byRegulation.set(tag, (byRegulation.get(tag) || 0) + 1);
    });
  }
});
const topRegulations = Array.from(byRegulation.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);
console.log('\nTop regulation tags:', topRegulations);

// Analyze by GS1 impact tags
const byGS1Impact = new Map<string, number>();
allNews.forEach(news => {
  if (Array.isArray(news.gs1ImpactTags)) {
    news.gs1ImpactTags.forEach((tag: string) => {
      byGS1Impact.set(tag, (byGS1Impact.get(tag) || 0) + 1);
    });
  }
});
const topGS1Impact = Array.from(byGS1Impact.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);
console.log('\nTop GS1 impact tags:', topGS1Impact);

// Analyze by sector
const bySector = new Map<string, number>();
allNews.forEach(news => {
  if (Array.isArray(news.sectorTags)) {
    news.sectorTags.forEach((tag: string) => {
      bySector.set(tag, (bySector.get(tag) || 0) + 1);
    });
  }
});
const topSectors = Array.from(bySector.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);
console.log('\nTop sector tags:', topSectors);

process.exit(0);
