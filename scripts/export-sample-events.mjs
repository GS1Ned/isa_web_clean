/**
 * Export Sample Events
 * Show full delta analysis for representative events
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

// Get 3 sample events
const events = await db
  .select()
  .from(schema.regulatoryEvents)
  .limit(3);

console.log('=' .repeat(80));
console.log('SAMPLE REGULATORY EVENTS WITH DELTA ANALYSIS');
console.log('='.repeat(80));

for (const event of events) {
  console.log('\n' + '─'.repeat(80));
  console.log(`EVENT ${event.id}: ${event.eventTitle}`);
  console.log('─'.repeat(80));
  
  console.log('\n📋 METADATA');
  console.log(`   Primary Regulation: ${event.primaryRegulation}`);
  console.log(`   Event Type: ${event.eventType}`);
  console.log(`   Lifecycle State: ${event.lifecycleState}`);
  console.log(`   Status: ${event.status}`);
  console.log(`   Completeness Score: ${event.completenessScore}%`);
  console.log(`   Confidence Level: ${event.confidenceLevel || 'N/A'}`);
  console.log(`   Delta Validation: ${event.deltaValidationPassed ? 'PASSED' : 'FAILED'}`);
  console.log(`   Quarter: ${event.eventQuarter}`);
  
  let sourceIds = [];
  try {
    sourceIds = typeof event.sourceArticleIds === 'string' 
      ? JSON.parse(event.sourceArticleIds) 
      : event.sourceArticleIds || [];
  } catch (e) {
    sourceIds = [];
  }
  console.log(`   Linked Articles: ${Array.isArray(sourceIds) ? sourceIds.length : 0}`);
  
  console.log('\n📊 DELTA ANALYSIS (5 Required Fields)');
  console.log('\n   1️⃣  PREVIOUS ASSUMPTION');
  console.log(`   ${event.previousAssumption || 'N/A'}`);
  
  console.log('\n   2️⃣  NEW INFORMATION');
  console.log(`   ${event.newInformation || 'N/A'}`);
  
  console.log('\n   3️⃣  WHAT CHANGED');
  console.log(`   ${event.whatChanged || 'N/A'}`);
  
  console.log('\n   4️⃣  WHAT DID NOT CHANGE');
  console.log(`   ${event.whatDidNotChange || 'N/A'}`);
  
  console.log('\n   5️⃣  DECISION IMPACT');
  console.log(`   ${event.decisionImpact || 'N/A'}`);
  
  if (event.eventSummary) {
    console.log('\n📝 EVENT SUMMARY');
    console.log(`   ${event.eventSummary}`);
  }
}

console.log('\n' + '='.repeat(80));
console.log('END OF SAMPLE EVENTS');
console.log('='.repeat(80));

await connection.end();
