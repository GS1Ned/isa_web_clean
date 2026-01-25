/**
 * Populate Quick Win Fields
 * Derive decision_value_type and stability_risk for existing events
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

console.log('🚀 Populating decision_value_type and stability_risk...\n');

// Get all events
const events = await db
  .select()
  .from(schema.regulatoryEvents);

console.log(`📊 Found ${events.length} events to process\n`);

/**
 * Derive decision_value_type from delta analysis
 * Rule-based logic based on keywords in delta fields
 */
function deriveDecisionValueType(event) {
  const deltaText = [
    event.whatChanged || '',
    event.newInformation || '',
    event.decisionImpact || ''
  ].join(' ').toLowerCase();
  
  // Check for obligation keywords
  if (deltaText.match(/\b(must|shall|required|mandatory|obligation|compliance)\b/)) {
    return 'OBLIGATION_CHANGE';
  }
  
  // Check for timing keywords
  if (deltaText.match(/\b(deadline|timeline|postpone|delay|enforcement|date|phase|transition)\b/)) {
    return 'TIMING_CHANGE';
  }
  
  // Check for scope keywords
  if (deltaText.match(/\b(scope|coverage|applies to|exemption|threshold|sector|company size)\b/)) {
    return 'SCOPE_CHANGE';
  }
  
  // Check for data requirement keywords
  if (deltaText.match(/\b(data|reporting|disclosure|metric|indicator|template|format|standard)\b/)) {
    return 'DATA_REQUIREMENT';
  }
  
  // Check for interpretation keywords
  if (deltaText.match(/\b(guidance|clarif|interpret|faq|explanation|understanding)\b/)) {
    return 'INTERPRETATION_CLARIFICATION';
  }
  
  // Default: assumption invalidated
  return 'ASSUMPTION_INVALIDATED';
}

/**
 * Derive stability_risk from lifecycle_state
 * Fixed rule-based logic as specified
 */
function deriveStabilityRisk(lifecycleState) {
  const highRiskStates = ['PROPOSAL', 'DELEGATED_ACT_DRAFT'];
  const mediumRiskStates = ['GUIDANCE'];
  const lowRiskStates = ['ADOPTED', 'POLITICAL_AGREEMENT', 'DELEGATED_ACT_ADOPTED', 'ENFORCEMENT_SIGNAL', 'POSTPONED_OR_SOFTENED'];
  
  if (highRiskStates.includes(lifecycleState)) {
    return 'HIGH';
  } else if (mediumRiskStates.includes(lifecycleState)) {
    return 'MEDIUM';
  } else if (lowRiskStates.includes(lifecycleState)) {
    return 'LOW';
  }
  
  // Default to MEDIUM if unknown
  return 'MEDIUM';
}

let updated = 0;

for (const event of events) {
  const decisionValueType = deriveDecisionValueType(event);
  const stabilityRisk = deriveStabilityRisk(event.lifecycleState);
  
  console.log(`[${updated + 1}/${events.length}] Event ${event.id}: ${event.eventTitle.substring(0, 60)}...`);
  console.log(`  Decision Value: ${decisionValueType}`);
  console.log(`  Stability Risk: ${stabilityRisk} (lifecycle: ${event.lifecycleState})`);
  
  await db
    .update(schema.regulatoryEvents)
    .set({
      decisionValueType,
      stabilityRisk
    })
    .where(eq(schema.regulatoryEvents.id, event.id));
  
  updated++;
}

console.log('\n' + '='.repeat(60));
console.log('✅ Population Complete');
console.log('='.repeat(60));
console.log(`Total events updated: ${updated}`);

// Get statistics
const stats = await db
  .select()
  .from(schema.regulatoryEvents);

const decisionValueCounts = stats.reduce((acc, e) => {
  acc[e.decisionValueType] = (acc[e.decisionValueType] || 0) + 1;
  return acc;
}, {});

const stabilityRiskCounts = stats.reduce((acc, e) => {
  acc[e.stabilityRisk] = (acc[e.stabilityRisk] || 0) + 1;
  return acc;
}, {});

console.log('\nDecision Value Type distribution:');
Object.entries(decisionValueCounts).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}`);
});

console.log('\nStability Risk distribution:');
Object.entries(stabilityRiskCounts).forEach(([risk, count]) => {
  console.log(`  ${risk}: ${count}`);
});

await connection.end();
console.log('\n✅ Script complete');
