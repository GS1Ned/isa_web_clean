import { config } from 'dotenv';
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);

config({ override: true });
import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';

async function runMigration() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  const sql = readFileSync('./drizzle/migrations/0016_add_regulatory_tracking_columns.sql', 'utf-8');
  
  try {
    cliOut('Running migration: 0016_add_regulatory_tracking_columns.sql');
    await connection.query(sql);
    cliOut('✓ Migration completed successfully');
  } catch (error) {
    cliErr('✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
  
  process.exit(0);
}

runMigration();
