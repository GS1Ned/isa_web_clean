import { getDb } from '../../server/db';
import { sql } from 'drizzle-orm';
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);


async function test() {
  cliOut('Testing database connection...');
  
  const db = await getDb();
  if (!db) {
    cliOut('Database connection failed');
    process.exit(1);
  }
  cliOut('Database connection successful');
  
  // Count records in key tables
  const result = await db.execute(sql`SELECT 
    (SELECT COUNT(*) FROM regulations) as regulations,
    (SELECT COUNT(*) FROM gs1_standards) as gs1_standards,
    (SELECT COUNT(*) FROM knowledge_embeddings) as knowledge_embeddings
  `);
  cliOut('Current database state:', result[0]);
  
  // Check for NULL embeddings
  const nullEmbeddings = await db.execute(sql`SELECT 
    (SELECT COUNT(*) FROM regulations WHERE embedding IS NULL) as regulations_null,
    (SELECT COUNT(*) FROM gs1_standards WHERE embedding IS NULL) as standards_null
  `);
  cliOut('Records without embeddings:', nullEmbeddings[0]);
  
  process.exit(0);
}

test().catch((err) => {
  cliErr('Error:', err);
  process.exit(1);
});
