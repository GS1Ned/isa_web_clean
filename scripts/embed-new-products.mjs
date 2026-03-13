/**
 * Generate knowledge embeddings for new products not yet embedded.
 * Adds embeddings for the ~405 new products from OFF v2 ingestion.
 */
import postgres from 'postgres';
import { createHash } from 'crypto';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL_POSTGRES;

if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');
if (!DATABASE_URL) throw new Error('DATABASE_URL_POSTGRES not set');

const sql = postgres(DATABASE_URL, { ssl: { rejectUnauthorized: false } });

const BATCH_SIZE = 50; // OpenAI supports up to 2048 inputs
const EMBED_MODEL = 'text-embedding-3-small';

async function generateEmbeddings(texts) {
  const resp = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenAI API error ${resp.status}: ${err}`);
  }
  const data = await resp.json();
  return data.data.map(d => d.embedding);
}

async function main() {
  console.log('=== Generate Embeddings for New Products ===\n');
  
  // Find products that don't have embeddings yet
  const allProducts = await sql`
    SELECT p.id, p.gtin, p.product_name, p.brand, p.categories, 
           p.target_market, p.nutrition_grades, p.eco_score,
           p.ingredients_text, p.net_content, p.packaging
    FROM products p
    WHERE NOT EXISTS (
      SELECT 1 FROM knowledge_embeddings ke 
      WHERE ke.source_type = 'product' AND ke.source_id = p.id
    )
  `;
  
  console.log(`Products without embeddings: ${allProducts.length}`);
  
  if (allProducts.length === 0) {
    console.log('All products already have embeddings!');
    await sql.end();
    return;
  }
  
  // Prepare records
  const records = allProducts.map(r => {
    const content = [
      `Product: ${r.product_name || 'Unknown'}`,
      r.gtin ? `GTIN/EAN: ${r.gtin}` : null,
      r.brand ? `Merk: ${r.brand}` : null,
      r.categories ? `Categorieën: ${r.categories.substring(0, 300)}` : null,
      r.target_market ? `Doelmarkt: ${r.target_market}` : null,
      r.nutrition_grades ? `Nutri-Score: ${r.nutrition_grades.toUpperCase()}` : null,
      r.eco_score ? `Eco-Score: ${r.eco_score}` : null,
      r.net_content ? `Inhoud: ${r.net_content}` : null,
      r.packaging ? `Verpakking: ${r.packaging.substring(0, 200)}` : null,
      r.ingredients_text ? `Ingrediënten: ${r.ingredients_text.substring(0, 300)}` : null,
      'Bron: Open Food Facts. Dit product is beschikbaar op de Nederlandse markt.',
    ].filter(Boolean).join('. ');
    
    return {
      source_type: 'product',
      source_id: r.id,
      source_authority: 'Open Food Facts',
      title: `Product: ${r.product_name || r.gtin}`,
      content,
    };
  });
  
  let inserted = 0;
  
  // Process in batches
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const texts = batch.map(r => r.content);
    
    try {
      const embeddings = await generateEmbeddings(texts);
      
      for (let j = 0; j < batch.length; j++) {
        const rec = batch[j];
        const vecStr = `[${embeddings[j].join(',')}]`;
        const contentHash = createHash('sha256').update(rec.content).digest('hex');
        
        await sql`
          INSERT INTO knowledge_embeddings (source_type, source_id, source_authority, title, content, content_hash, embedding, created_at)
          VALUES (${rec.source_type}, ${rec.source_id}::integer, ${rec.source_authority}, ${rec.title}, ${rec.content}, ${contentHash}, ${vecStr}::vector, NOW())
          ON CONFLICT DO NOTHING
        `;
        inserted++;
      }
      
      console.log(`  Batch ${Math.floor(i/BATCH_SIZE)+1}/${Math.ceil(records.length/BATCH_SIZE)}: ${batch.length} embeddings (total: ${inserted})`);
    } catch (err) {
      console.error(`  Batch error: ${err.message}`);
    }
    
    // Rate limit delay
    if (i + BATCH_SIZE < records.length) {
      await new Promise(r => setTimeout(r, 300));
    }
  }
  
  const total = await sql`SELECT count(*) as cnt FROM knowledge_embeddings`;
  const byType = await sql`SELECT source_type, count(*) as cnt FROM knowledge_embeddings GROUP BY source_type ORDER BY cnt DESC`;
  
  console.log(`\n=== Results ===`);
  console.log(`New embeddings: ${inserted}`);
  console.log(`Total embeddings: ${total[0].cnt}`);
  console.log('\nBreakdown:');
  for (const r of byType) console.log(`  ${r.source_type}: ${r.cnt}`);
  
  await sql.end();
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
