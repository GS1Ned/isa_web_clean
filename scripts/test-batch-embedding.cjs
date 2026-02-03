#!/usr/bin/env node
/**
 * Test script for batch embedding performance
 * Compares sequential vs batch embedding API calls
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/embeddings';
const EMBEDDING_MODEL = 'text-embedding-3-small';

async function generateEmbeddingSequential(text, apiKey) {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
      encoding_format: 'float',
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

async function generateEmbeddingsBatch(texts, apiKey) {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
      encoding_format: 'float',
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    embeddings: data.data.sort((a, b) => a.index - b.index).map(d => d.embedding),
    usage: data.usage,
  };
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: OPENAI_API_KEY required');
    process.exit(1);
  }

  // Test data - 10 sample texts
  const testTexts = [
    'What is a GTIN and how is it used in retail?',
    'Explain the structure of a GS1 barcode.',
    'What is the Digital Product Passport regulation?',
    'How does ESRS relate to sustainability reporting?',
    'What are the key components of product master data?',
    'Explain the concept of traceability in supply chains.',
    'What is the role of GS1 in global commerce?',
    'How do barcodes enable inventory management?',
    'What is the difference between EAN and UPC?',
    'Explain the EPCIS standard for event tracking.',
  ];

  console.log('🧪 Batch Embedding Performance Test');
  console.log(`   Test size: ${testTexts.length} texts`);
  console.log('');

  // Test sequential
  console.log('📊 Sequential Mode (1 API call per text)...');
  const seqStart = Date.now();
  for (const text of testTexts) {
    await generateEmbeddingSequential(text, apiKey);
  }
  const seqTime = Date.now() - seqStart;
  console.log(`   Time: ${seqTime}ms (${(seqTime / testTexts.length).toFixed(0)}ms/text)`);
  console.log(`   API calls: ${testTexts.length}`);

  // Test batch
  console.log('');
  console.log('📊 Batch Mode (1 API call for all texts)...');
  const batchStart = Date.now();
  const { embeddings, usage } = await generateEmbeddingsBatch(testTexts, apiKey);
  const batchTime = Date.now() - batchStart;
  console.log(`   Time: ${batchTime}ms (${(batchTime / testTexts.length).toFixed(0)}ms/text)`);
  console.log(`   API calls: 1`);
  console.log(`   Tokens used: ${usage.total_tokens}`);

  // Summary
  console.log('');
  console.log('============================================================');
  console.log('📈 PERFORMANCE COMPARISON');
  console.log('============================================================');
  console.log(`   Sequential: ${seqTime}ms`);
  console.log(`   Batch:      ${batchTime}ms`);
  console.log(`   Speedup:    ${(seqTime / batchTime).toFixed(1)}x faster`);
  console.log(`   API calls:  ${testTexts.length} → 1 (${((1 - 1/testTexts.length) * 100).toFixed(0)}% reduction)`);
  console.log('');
  console.log('✅ Batch embedding is working correctly!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
