import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL_POSTGRES || 'postgresql://postgres.gwlszaepkwtjrqfgejin:wibjez-hUzmeh-8desqy@aws-1-eu-north-1.pooler.supabase.com:6543/postgres', {
  ssl: { rejectUnauthorized: false }
});

async function run() {
  // Create alert_history table
  await sql`
    CREATE TABLE IF NOT EXISTS alert_history (
      id SERIAL PRIMARY KEY,
      alert_type VARCHAR(50) NOT NULL,
      severity VARCHAR(20) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      metadata JSONB,
      notification_sent INTEGER DEFAULT 0 NOT NULL,
      acknowledged_at TIMESTAMPTZ,
      acknowledged_by INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )
  `;
  console.log('Created alert_history table');

  // Add missing columns to error_log
  const errorLogCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'error_log'`;
  const elCols = errorLogCols.map(r => r.column_name);
  
  const errorLogAlters = [
    ['operation', 'VARCHAR(255)'],
    ['user_id', 'INTEGER'],
    ['request_id', 'VARCHAR(128)'],
    ['resolved', 'INTEGER DEFAULT 0 NOT NULL'],
    ['resolved_at', 'TIMESTAMPTZ'],
    ['resolved_by', 'VARCHAR(255)'],
    ['notes', 'TEXT'],
  ];

  for (const [col, type] of errorLogAlters) {
    if (elCols.indexOf(col) === -1) {
      await sql.unsafe(`ALTER TABLE error_log ADD COLUMN ${col} ${type}`);
      console.log(`Added ${col} column to error_log`);
    }
  }

  // Add missing columns to performance_log
  const perfLogCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'performance_log'`;
  const plCols = perfLogCols.map(r => r.column_name);

  const perfLogAlters = [
    ['success', 'INTEGER DEFAULT 1 NOT NULL'],
    ['user_id', 'INTEGER'],
    ['request_id', 'VARCHAR(128)'],
  ];

  for (const [col, type] of perfLogAlters) {
    if (plCols.indexOf(col) === -1) {
      await sql.unsafe(`ALTER TABLE performance_log ADD COLUMN ${col} ${type}`);
      console.log(`Added ${col} column to performance_log`);
    }
  }

  // Create indexes for alert_history
  await sql`CREATE INDEX IF NOT EXISTS alert_history_type_idx ON alert_history(alert_type)`;
  await sql`CREATE INDEX IF NOT EXISTS alert_history_severity_idx ON alert_history(severity)`;
  await sql`CREATE INDEX IF NOT EXISTS alert_history_created_at_idx ON alert_history(created_at)`;
  console.log('Created alert_history indexes');

  console.log('All monitoring table migrations complete');
  await sql.end();
}

run().catch(e => { console.error(e); process.exit(1); });
