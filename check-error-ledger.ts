import { getDb } from './server/db';

async function main() {
  const db = await getDb();
  try {
    const result = await db.execute('SHOW TABLES LIKE "error_ledger"');
    console.log('error_ledger exists:', result[0].length > 0);
    if (result[0].length > 0) {
      const desc = await db.execute('DESCRIBE error_ledger');
      console.log('Columns:', desc[0].map((r: any) => r.Field).join(', '));
    } else {
      console.log('❌ Table does not exist - this explains INSERT failures during tests');
    }
  } catch (e: any) {
    console.error('Error:', e.message);
  }
  process.exit(0);
}

main();
