import { getDb } from '../server/db';
import { hubNews } from '../drizzle/schema';
import { desc, isNotNull, sql } from 'drizzle-orm';

async function checkNewFields() {
  console.log('Checking articles with new regulatory intelligence fields...\n');
  
  const db = await getDb();
  
  // Get latest 10 articles
  const articles = await db.select({
    id: hubNews.id,
    title: hubNews.title,
    regulatoryState: hubNews.regulatoryState,
    confidenceLevel: hubNews.confidenceLevel,
    isNegativeSignal: hubNews.isNegativeSignal,
  })
  .from(hubNews)
  .orderBy(desc(hubNews.id))
  .limit(10);
  
  console.log('Latest 10 articles:');
  console.log('='.repeat(100));
  
  for (const article of articles) {
    console.log(`ID: ${article.id}`);
    console.log(`Title: ${article.title?.substring(0, 60)}...`);
    console.log(`Regulatory State: ${article.regulatoryState || 'NULL'}`);
    console.log(`Confidence Level: ${article.confidenceLevel || 'NULL'}`);
    console.log(`Is Negative Signal: ${article.isNegativeSignal || 'NULL'}`);
    console.log('-'.repeat(100));
  }
  
  // Count articles with new fields populated
  const withState = await db.select({ count: sql<number>`count(*)` })
    .from(hubNews)
    .where(isNotNull(hubNews.regulatoryState));
  
  const withConfidence = await db.select({ count: sql<number>`count(*)` })
    .from(hubNews)
    .where(isNotNull(hubNews.confidenceLevel));
  
  const withNegative = await db.select({ count: sql<number>`count(*)` })
    .from(hubNews)
    .where(sql`${hubNews.isNegativeSignal} = 1`);
  
  const total = await db.select({ count: sql<number>`count(*)` })
    .from(hubNews);
  
  console.log('\nSummary:');
  console.log(`Total articles: ${total[0].count}`);
  console.log(`With regulatory_state: ${withState[0].count}`);
  console.log(`With confidence_level: ${withConfidence[0].count}`);
  console.log(`With is_negative_signal=true: ${withNegative[0].count}`);
  
  process.exit(0);
}

checkNewFields().catch(console.error);
