import { getDb } from './server/db';
import { sql } from 'drizzle-orm';

async function test() {
  console.log('Testing database connection...');
  
  const db = await getDb();
  if (!db) {
    console.log('Database connection failed');
    process.exit(1);
  }
  console.log('Database connection successful');
  
  // Count records in key tables
  const result = await db.execute(sql`SELECT 
    (SELECT COUNT(*) FROM regulations) as regulations,
    (SELECT COUNT(*) FROM gs1_standards) as gs1_standards,
    (SELECT COUNT(*) FROM knowledge_embeddings) as knowledge_embeddings
  `);
  console.log('Current database state:', result[0]);
  
  // Check for NULL embeddings
  const nullEmbeddings = await db.execute(sql`SELECT 
    (SELECT COUNT(*) FROM regulations WHERE embedding IS NULL) as regulations_null,
    (SELECT COUNT(*) FROM gs1_standards WHERE embedding IS NULL) as standards_null
  `);
  console.log('Records without embeddings:', nullEmbeddings[0]);
  
  process.exit(0);
}

test().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
