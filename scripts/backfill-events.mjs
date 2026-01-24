/**
 * Backfill Events Script
 * Process existing articles to create regulatory events
 * Phase 2 validation: Test infrastructure with real data
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';
import { detectEventFromArticle, createOrUpdateEvent } from '../server/news-event-processor.ts';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

console.log('🚀 Starting event backfill for existing articles...\n');

// Get all articles without events
const articles = await db
  .select({
    id: schema.hubNews.id,
    title: schema.hubNews.title,
    content: schema.hubNews.content,
    summary: schema.hubNews.summary,
    regulationTags: schema.hubNews.regulationTags,
    publishedDate: schema.hubNews.publishedDate,
    sourceType: schema.hubNews.sourceType,
    regulatoryEventId: schema.hubNews.regulatoryEventId,
  })
  .from(schema.hubNews);

console.log(`📊 Found ${articles.length} total articles`);
const unlinkedArticles = articles.filter(a => !a.regulatoryEventId);
console.log(`🔗 ${unlinkedArticles.length} articles need event processing\n`);

let processed = 0;
let eventsCreated = 0;
let eventsUpdated = 0;
let noEventDetected = 0;
let errors = 0;

for (const article of unlinkedArticles) {
  try {
    console.log(`\n[${processed + 1}/${unlinkedArticles.length}] Processing: ${article.title.substring(0, 60)}...`);
    
    const eventDetection = await detectEventFromArticle({
      id: article.id,
      title: article.title,
      content: article.content,
      summary: article.summary,
      regulationTags: Array.isArray(article.regulationTags) ? article.regulationTags : [],
      publishedDate: article.publishedDate,
      sourceType: article.sourceType,
    });
    
    if (eventDetection) {
      const eventResult = await createOrUpdateEvent(article.id, eventDetection);
      
      if (eventResult.isNew) {
        eventsCreated++;
        console.log(`  ✅ Created event: ${eventDetection.eventTitle}`);
        console.log(`     Status: ${eventResult.status} | Score: ${eventResult.completenessScore}%`);
      } else {
        eventsUpdated++;
        console.log(`  🔄 Updated event: ${eventDetection.eventTitle}`);
        console.log(`     Status: ${eventResult.status} | Score: ${eventResult.completenessScore}%`);
      }
    } else {
      noEventDetected++;
      console.log(`  ⚠️  No regulatory event detected`);
    }
    
    processed++;
  } catch (error) {
    errors++;
    console.error(`  ❌ Error processing article ${article.id}:`, error.message);
  }
}

console.log('\n' + '='.repeat(60));
console.log('📈 Backfill Summary');
console.log('='.repeat(60));
console.log(`Total articles processed: ${processed}`);
console.log(`Events created: ${eventsCreated}`);
console.log(`Events updated: ${eventsUpdated}`);
console.log(`No event detected: ${noEventDetected}`);
console.log(`Errors: ${errors}`);

// Get final event statistics
const eventStats = await db
  .select({
    total: schema.regulatoryEvents.id,
    status: schema.regulatoryEvents.status,
    completenessScore: schema.regulatoryEvents.completenessScore,
    primaryRegulation: schema.regulatoryEvents.primaryRegulation,
  })
  .from(schema.regulatoryEvents);

console.log('\n' + '='.repeat(60));
console.log('📊 Event Statistics');
console.log('='.repeat(60));
console.log(`Total events in database: ${eventStats.length}`);

const statusCounts = eventStats.reduce((acc, e) => {
  acc[e.status] = (acc[e.status] || 0) + 1;
  return acc;
}, {});

console.log('\nStatus distribution:');
Object.entries(statusCounts).forEach(([status, count]) => {
  console.log(`  ${status}: ${count}`);
});

const avgScore = eventStats.reduce((sum, e) => sum + (e.completenessScore || 0), 0) / eventStats.length;
console.log(`\nAverage completeness score: ${avgScore.toFixed(1)}%`);

const regulationCounts = eventStats.reduce((acc, e) => {
  acc[e.primaryRegulation] = (acc[e.primaryRegulation] || 0) + 1;
  return acc;
}, {});

console.log('\nEvents by regulation:');
Object.entries(regulationCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([reg, count]) => {
    console.log(`  ${reg}: ${count}`);
  });

await connection.end();
console.log('\n✅ Backfill complete');
