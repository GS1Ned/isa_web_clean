#!/usr/bin/env node
/**
 * Fix Empty Embeddings Script
 * 
 * Regenerates embeddings for records that have valid content but empty embedding arrays.
 * Part of post-Gate 2 consolidation work.
 * 
 * Usage: OPENAI_API_KEY=xxx node scripts/fix-empty-embeddings.cjs [--dry-run] [--batch-size N]
 */

const mysql = require('mysql2/promise');

// Configuration
const BATCH_SIZE = parseInt(process.argv.find(a => a.startsWith('--batch-size='))?.split('=')[1] || '10');
const DRY_RUN = process.argv.includes('--dry-run');
const EMBEDDING_MODEL = 'text-embedding-3-small';

async function getEmbedding(text, apiKey) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text.substring(0, 8000) // Truncate to avoid token limits
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }
  
  const data = await response.json();
  return data.data[0].embedding;
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }
  
  console.log('🔧 Fix Empty Embeddings Script');
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log(`   Batch size: ${BATCH_SIZE}`);
  console.log(`   Model: ${EMBEDDING_MODEL}`);
  console.log('');
  
  const conn = await mysql.createConnection({
    host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: 'dtVAxSKn7P5nF6W.root',
    password: 'qyjk6KJU2cT8Yjkb',
    database: 'isa_db',
    ssl: { rejectUnauthorized: true }
  });
  
  try {
    // Get records with empty embeddings
    const [emptyRecords] = await conn.query(`
      SELECT id, content, sourceType
      FROM knowledge_embeddings 
      WHERE JSON_LENGTH(embedding) = 0
      ORDER BY id
    `);
    
    console.log(`📋 Found ${emptyRecords.length} records with empty embeddings`);
    
    if (emptyRecords.length === 0) {
      console.log('✅ No empty embeddings to fix');
      return;
    }
    
    if (DRY_RUN) {
      console.log('');
      console.log('DRY RUN - Would process:');
      for (const r of emptyRecords.slice(0, 5)) {
        console.log(`  ID ${r.id}: ${r.sourceType} - ${r.content.substring(0, 50)}...`);
      }
      if (emptyRecords.length > 5) {
        console.log(`  ... and ${emptyRecords.length - 5} more`);
      }
      return;
    }
    
    // Process in batches
    let fixed = 0;
    let failed = 0;
    
    for (let i = 0; i < emptyRecords.length; i += BATCH_SIZE) {
      const batch = emptyRecords.slice(i, i + BATCH_SIZE);
      console.log(`\n📦 Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(emptyRecords.length/BATCH_SIZE)}`);
      
      for (const record of batch) {
        try {
          process.stdout.write(`   ID ${record.id}... `);
          
          const embedding = await getEmbedding(record.content, apiKey);
          
          await conn.query(
            'UPDATE knowledge_embeddings SET embedding = ? WHERE id = ?',
            [JSON.stringify(embedding), record.id]
          );
          
          console.log('✅');
          fixed++;
          
          // Rate limiting - 100ms between requests
          await new Promise(r => setTimeout(r, 100));
          
        } catch (error) {
          console.log(`❌ ${error.message}`);
          failed++;
        }
      }
    }
    
    console.log('');
    console.log('============================================================');
    console.log('📊 SUMMARY');
    console.log('============================================================');
    console.log(`   Total processed: ${emptyRecords.length}`);
    console.log(`   Fixed: ${fixed}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Success rate: ${((fixed / emptyRecords.length) * 100).toFixed(1)}%`);
    
  } finally {
    await conn.end();
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
