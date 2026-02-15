import { getDb } from '../server/db.js';
import { readFileSync } from 'fs';
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);


async function runMigration() {
  const db = await getDb();
  if (!db) {
    cliErr('Database not available');
    process.exit(1);
  }

  const sql = readFileSync('./drizzle/migrations/0016_add_regulatory_tracking_columns.sql', 'utf-8');
  
  try {
    cliOut('Running migration: 0016_add_regulatory_tracking_columns.sql');
    await db.execute(sql);
    cliOut('✓ Migration completed successfully');
  } catch (error) {
    cliErr('✗ Migration failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

runMigration();
