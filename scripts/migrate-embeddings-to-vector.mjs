/**
 * Migrate knowledge_embeddings from jsonb to pgvector
 * 
 * 1. Add a real vector(1536) column
 * 2. Copy data from jsonb embedding column
 * 3. Drop old column, rename new
 * 4. Create IVFFlat index for fast similarity search
 */
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL_POSTGRES, { ssl: { rejectUnauthorized: false } });

async function main() {
  console.log('=== Migrating embeddings to pgvector ===');
  
  // Step 1: Add vector column
  console.log('[1/5] Adding vector column...');
  await sql`ALTER TABLE knowledge_embeddings ADD COLUMN IF NOT EXISTS embedding_vec vector(1536)`;
  
  // Step 2: Copy jsonb embeddings to vector column
  console.log('[2/5] Converting jsonb to vector...');
  const count = await sql`SELECT count(*) as c FROM knowledge_embeddings WHERE embedding IS NOT NULL`;
  console.log(`  ${count[0].c} rows to convert`);
  
  // Convert in batches
  const rows = await sql`SELECT id, embedding FROM knowledge_embeddings WHERE embedding IS NOT NULL`;
  let converted = 0;
  for (const row of rows) {
    try {
      // embedding is stored as jsonb array
      const arr = typeof row.embedding === 'string' ? JSON.parse(row.embedding) : row.embedding;
      if (Array.isArray(arr) && arr.length === 1536) {
        const vecStr = `[${arr.join(',')}]`;
        await sql`UPDATE knowledge_embeddings SET embedding_vec = ${vecStr}::vector WHERE id = ${row.id}`;
        converted++;
      } else {
        console.log(`  Skipping id=${row.id}: array length=${Array.isArray(arr) ? arr.length : 'not array'}`);
      }
    } catch (err) {
      console.log(`  Error converting id=${row.id}: ${err.message}`);
    }
  }
  console.log(`  Converted: ${converted}/${rows.length}`);
  
  // Step 3: Drop old column, rename new
  console.log('[3/5] Swapping columns...');
  await sql`ALTER TABLE knowledge_embeddings DROP COLUMN IF EXISTS embedding`;
  await sql`ALTER TABLE knowledge_embeddings RENAME COLUMN embedding_vec TO embedding`;
  
  // Step 4: Create index for fast similarity search
  console.log('[4/5] Creating IVFFlat index...');
  try {
    // For small datasets (<1000), use exact search (no index needed, or use HNSW)
    // IVFFlat needs at least lists * 39 rows, so with 174 rows, lists=4 is safe
    await sql`CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_vec 
              ON knowledge_embeddings 
              USING ivfflat (embedding vector_cosine_ops) 
              WITH (lists = 4)`;
    console.log('  IVFFlat index created');
  } catch (err) {
    console.log(`  Index creation failed (may need more rows): ${err.message}`);
    // Fallback: no index, exact scan is fine for <1000 rows
  }
  
  // Step 5: Verify
  console.log('[5/5] Verifying...');
  const verify = await sql`
    SELECT count(*) as total,
           count(embedding) as with_vec
    FROM knowledge_embeddings
  `;
  console.log(`  Total: ${verify[0].total}, With vector: ${verify[0].with_vec}`);
  
  // Test cosine similarity
  const testRow = await sql`SELECT id, embedding FROM knowledge_embeddings LIMIT 1`;
  if (testRow.length > 0) {
    const testResult = await sql`
      SELECT id, title, 1 - (embedding <=> ${testRow[0].embedding}::vector) as similarity
      FROM knowledge_embeddings
      ORDER BY embedding <=> ${testRow[0].embedding}::vector
      LIMIT 3
    `;
    console.log('  Test similarity search:');
    testResult.forEach(r => console.log(`    id=${r.id} sim=${r.similarity} title=${r.title?.substring(0,50)}`));
  }
  
  console.log('');
  console.log('Done! Vector search is now available via pgvector.');
  
  await sql.end();
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
