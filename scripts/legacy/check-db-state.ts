import { getDb } from '../server/db.js';
import { hubNews } from '../drizzle/schema.js';
import { sql } from 'drizzle-orm';

async function checkDatabaseState() {
  const db = await getDb();
  if (!db) {
    console.log('Database not available');
    process.exit(1);
  }
  
  const recentNews = await db.select().from(hubNews).orderBy(sql`publishedDate DESC`).limit(5);
  
  console.log('=== Database State Check ===');
  console.log('Recent news count:', recentNews.length);
  
  if (recentNews.length > 0) {
    const latest = recentNews[0];
    console.log('\nLatest news:');
    console.log('  Title:', latest.title);
    console.log('  Published:', latest.publishedAt);
    console.log('  Has gs1ImpactTags:', !!latest.gs1ImpactTags);
    console.log('  Has sectorTags:', !!latest.sectorTags);
    console.log('  Has gs1ImpactAnalysis:', !!latest.gs1ImpactAnalysis);
    console.log('  Has suggestedActions:', !!latest.suggestedActions);
    
    if (latest.gs1ImpactTags) {
      console.log('  gs1ImpactTags:', latest.gs1ImpactTags);
    }
    if (latest.sectorTags) {
      console.log('  sectorTags:', latest.sectorTags);
    }
  }
  
  process.exit(0);
}

checkDatabaseState().catch(console.error);
