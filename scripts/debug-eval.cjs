const mysql = require('mysql2/promise');

function cosineSimilarity(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function test() {
  const conn = await mysql.createConnection({
    host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: 'dtVAxSKn7P5nF6W.root',
    password: 'qyjk6KJU2cT8Yjkb',
    database: 'isa_db',
    ssl: { rejectUnauthorized: true }
  });
  
  // Get embedding for test question
  const question = 'Wat is een GTIN?';
  console.log('Getting embedding for:', question);
  
  const embResponse = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: question
    })
  });
  
  if (embResponse.status !== 200) {
    console.log('Embedding error:', await embResponse.text());
    await conn.end();
    return;
  }
  
  const embData = await embResponse.json();
  const queryEmbedding = embData.data[0].embedding;
  console.log('Got embedding, length:', queryEmbedding.length);
  
  // Load knowledge base
  console.log('Loading knowledge base...');
  const [rows] = await conn.query('SELECT id, content, sourceType, authority_level, embedding FROM knowledge_embeddings WHERE isDeprecated = 0 LIMIT 100');
  console.log('Loaded', rows.length, 'items');
  
  // Calculate similarities
  const results = [];
  for (const row of rows) {
    if (row.embedding === null || row.embedding === undefined) {
      console.log('Skipping row', row.id, '- no embedding');
      continue;
    }
    if (!Array.isArray(row.embedding)) {
      console.log('Skipping row', row.id, '- embedding is not array, type:', typeof row.embedding);
      continue;
    }
    
    const similarity = cosineSimilarity(queryEmbedding, row.embedding);
    if (similarity > 0.3) {
      results.push({
        id: row.id,
        sourceType: row.sourceType,
        similarity,
        content: row.content.substring(0, 50)
      });
    }
  }
  
  results.sort((a, b) => b.similarity - a.similarity);
  console.log('\nTop results:');
  for (const r of results.slice(0, 5)) {
    console.log(`  ${r.id}: ${r.sourceType} (sim: ${r.similarity.toFixed(3)}) - ${r.content}...`);
  }
  
  // Now test answer generation
  if (results.length > 0) {
    console.log('\nGenerating answer...');
    const context = results.slice(0, 3).map(r => r.content).join('\n\n');
    
    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Je bent ISA, de Intelligent Standards Assistant van GS1 Nederland.' },
          { role: 'user', content: `Context:\n${context}\n\nVraag: ${question}` }
        ],
        max_tokens: 200
      })
    });
    
    if (chatResponse.status !== 200) {
      console.log('Chat error:', await chatResponse.text());
    } else {
      const chatData = await chatResponse.json();
      console.log('Answer:', chatData.choices[0].message.content);
    }
  }
  
  await conn.end();
}

test().catch(console.error);
