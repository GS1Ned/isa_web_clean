#!/usr/bin/env node
/**
 * DPP Granular Content Ingestion Script
 * Ingests granular DPP content to fix citation gaps
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const crypto = require('crypto');

const OPENAI_API_URL = 'https://api.openai.com/v1/embeddings';
const EMBEDDING_MODEL = 'text-embedding-3-small';

async function generateEmbeddingsBatch(texts, apiKey) {
  if (texts.length === 0) return [];
  
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts.map(t => t.substring(0, 32000)),
      encoding_format: 'float',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.data.sort((a, b) => a.index - b.index).map(d => d.embedding);
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: OPENAI_API_KEY required');
    process.exit(1);
  }

  const dryRun = process.argv.includes('--dry-run');
  
  console.log('🚀 DPP Granular Content Ingestion');
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log('');

  // Load granular DPP content
  const contentPath = path.join(__dirname, '../data/dpp-content/dpp-granular-fixes.json');
  if (!fs.existsSync(contentPath)) {
    console.error('ERROR: DPP granular content file not found:', contentPath);
    process.exit(1);
  }

  const dppData = JSON.parse(fs.readFileSync(contentPath, 'utf-8'));
  const dppContent = dppData.content;
  console.log(`📄 Loaded ${dppContent.length} granular DPP content items`);

  // Connect to database
  const conn = await mysql.createConnection({
    host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: 'dtVAxSKn7P5nF6W.root',
    password: 'qyjk6KJU2cT8Yjkb',
    database: 'isa_db',
    ssl: { rejectUnauthorized: true }
  });

  // Check for existing content to avoid duplicates
  const [existing] = await conn.query(`
    SELECT title FROM knowledge_embeddings 
    WHERE sourceType = 'dpp_component'
  `);
  const existingTitles = new Set(existing.map(e => e.title));
  console.log(`   Found ${existingTitles.size} existing DPP component entries`);

  // Filter out duplicates
  const newContent = dppContent.filter(item => !existingTitles.has(item.title));
  console.log(`   ${newContent.length} new items to ingest`);

  if (newContent.length === 0) {
    console.log('✅ No new content to ingest');
    await conn.end();
    return;
  }

  if (dryRun) {
    console.log('');
    console.log('📋 Items to ingest:');
    for (const item of newContent) {
      console.log(`   - ${item.title}`);
      console.log(`     Source: ${item.source}`);
      console.log(`     Authority: ${item.authorityLevel}`);
    }
    console.log('');
    console.log('Run without --dry-run to ingest');
    await conn.end();
    return;
  }

  // Generate embeddings in batch
  console.log('');
  console.log('🔄 Generating embeddings...');
  const texts = newContent.map(item => `${item.title}\n\n${item.content}`);
  const embeddings = await generateEmbeddingsBatch(texts, apiKey);
  console.log(`   Generated ${embeddings.length} embeddings`);

  // Insert into database
  console.log('');
  console.log('💾 Inserting into database...');
  let inserted = 0;

  // Get max sourceId to avoid conflicts
  const [maxId] = await conn.query('SELECT MAX(sourceId) as maxId FROM knowledge_embeddings');
  let nextSourceId = (maxId[0].maxId || 100000) + 1;

  for (let i = 0; i < newContent.length; i++) {
    const item = newContent[i];
    const embedding = embeddings[i];

    try {
      const contentHash = crypto.createHash('sha256').update(item.content).digest('hex');
      await conn.query(`
        INSERT INTO knowledge_embeddings 
        (sourceId, title, content, contentHash, sourceType, source_authority, authority_level, embedding, embeddingModel, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        nextSourceId++,
        item.title,
        item.content,
        contentHash,
        item.sourceType,
        item.source,
        String(item.authorityLevel),
        JSON.stringify(embedding),
        'text-embedding-3-small'
      ]);
      inserted++;
      console.log(`   ✅ ${item.title}`);
    } catch (err) {
      console.error(`   ❌ ${item.title}: ${err.message}`);
    }
  }

  console.log('');
  console.log('============================================================');
  console.log('📊 INGESTION SUMMARY');
  console.log('============================================================');
  console.log(`   Total items in file: ${dppContent.length}`);
  console.log(`   Already existed: ${dppContent.length - newContent.length}`);
  console.log(`   New items: ${newContent.length}`);
  console.log(`   Successfully inserted: ${inserted}`);
  console.log('');

  // Verify total DPP content
  const [count] = await conn.query(`
    SELECT COUNT(*) as cnt FROM knowledge_embeddings 
    WHERE sourceType = 'dpp_component'
  `);
  console.log(`✅ Total DPP component entries now: ${count[0].cnt}`);

  await conn.end();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
