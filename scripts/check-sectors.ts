import { getDb } from '../server/db.js';
import { sql } from 'drizzle-orm';

async function checkSectors() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    process.exit(1);
  }

  const result = await db.execute(
    sql`SELECT sector, COUNT(*) as count FROM gs1_attributes GROUP BY sector`
  );

  console.log('Sectors in database:');
  console.table(result[0]);

  process.exit(0);
}

checkSectors().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
