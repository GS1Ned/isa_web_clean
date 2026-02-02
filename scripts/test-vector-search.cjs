const mysql = require('mysql2/promise');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function testQuery() {
  const conn = await mysql.createConnection({
    host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: 'dtVAxSKn7P5nF6W.root',
    password: 'qyjk6KJU2cT8Yjkb',
    database: 'isa_db',
    ssl: { rejectUnauthorized: true }
  });
  
  // Test embedding query
  const testQuestion = 'Wat is een GTIN?';
  console.log('Testing question:', testQuestion);
  
  // First get embedding
  const embResponse = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + OPENAI_API_KEY
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: testQuestion
    })
  });
  
  if (!embResponse.ok) {
    console.log('Embedding error:', embResponse.status);
    const text = await embResponse.text();
    console.log(text);
    await conn.end();
    return;
  }
  
  const embData = await embResponse.json();
  const embedding = embData.data[0].embedding;
  console.log('Got embedding, length:', embedding.length);
  
  // Test vector search - embedding is stored as JSON array, need to cast to CHAR first
  try {
    const embStr = JSON.stringify(embedding);
    const [results] = await conn.query(`
      SELECT id, content, sourceType, authority_level,
             (1 - VEC_COSINE_DISTANCE(
               VEC_FROM_TEXT(CAST(embedding AS CHAR)), 
               VEC_FROM_TEXT(?)
             )) as similarity
      FROM knowledge_embeddings
      ORDER BY similarity DESC
      LIMIT 5
    `, [embStr]);
    
    console.log('Search results:', results.length);
    if (results.length > 0) {
      for (const r of results) {
        console.log(`  - ${r.sourceType} (auth: ${r.authority_level}, sim: ${r.similarity.toFixed(3)})`);
        console.log(`    ${r.content.substring(0, 100)}...`);
      }
    }
  } catch (err) {
    console.error('Vector search error:', err.message);
  }
  
  await conn.end();
}

testQuery().catch(console.error);
