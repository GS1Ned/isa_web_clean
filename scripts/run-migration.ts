import { getDb } from '../server/db.js';
import { readFileSync } from 'fs';

async function runMigration() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    process.exit(1);
  }

  const sql = readFileSync('./drizzle/migrations/0016_add_regulatory_tracking_columns.sql', 'utf-8');
  
  try {
    console.log('Running migration: 0016_add_regulatory_tracking_columns.sql');
    await db.execute(sql);
    console.log('✓ Migration completed successfully');
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

runMigration();
