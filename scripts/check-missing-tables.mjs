import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL_POSTGRES || 'postgresql://postgres.gwlszaepkwtjrqfgejin:wibjez-hUzmeh-8desqy@aws-1-eu-north-1.pooler.supabase.com:6543/postgres', {
  ssl: { rejectUnauthorized: false }
});

const needed = [
  'pipeline_execution_log', 'regulatory_events', 'user_saved_items',
  'gs1_attribute_code_lists', 'gs1_web_vocabulary', 'attribute_regulation_mappings',
  'scraper_executions', 'scraper_health_summary', 'roadmap_templates',
  'template_actions', 'template_milestones', 'supply_chain_risks',
  'epcis_events', 'supply_chain_nodes', 'compliance_scores',
  'compliance_evidence', 'compliance_roadmaps', 'roadmap_actions',
  'roadmap_milestones', 'template_usage', 'notification_preferences',
  'alert_history', 'error_log', 'performance_log', 'error_ledger',
  'alert_cooldowns'
];

async function run() {
  const rows = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
  const existing = new Set(rows.map(r => r.tablename));
  
  const missing = needed.filter(t => existing.has(t) === false);
  if (missing.length === 0) {
    console.log('All needed tables exist in Postgres!');
  } else {
    console.log('Missing tables:');
    missing.forEach(t => console.log('  ' + t));
  }
  
  console.log(`\nExisting: ${existing.size}, Needed: ${needed.length}, Missing: ${missing.length}`);
  await sql.end();
}

run().catch(e => { console.error(e); process.exit(1); });
