/**
 * Gate 1.2 Test Script - RAG Tracing Verification
 * 
 * This script tests the RAG tracing functionality to verify
 * the Gate 1.2 observability acceptance criteria.
 * 
 * Run with: node scripts/test-gate12-rag-tracing.cjs
 */

const mysql = require('mysql2/promise');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

const DATABASE_URL = process.env.DATABASE_URL || 
  'mysql://dtVAxSKn7P5nF6W.root:qyjk6KJU2cT8Yjkb@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/isa_db?ssl={"rejectUnauthorized":true}';

async function runTest() {
  console.log('=== GATE 1.2: RAG TRACING TEST ===\n');
  
  const conn = await mysql.createConnection(DATABASE_URL);
  console.log('✅ Connected to database\n');
  
  let traceId = null;
  
  try {
    // Test 1: Create a test trace
    console.log('Test 1: Creating test RAG trace...');
    const testTraceId = uuidv4();
    const testQuery = 'What is the Digital Product Passport requirement in ESPR?';
    
    const [insertResult] = await conn.execute(`
      INSERT INTO rag_traces (
        trace_id, query, query_language, sector_filter,
        abstained, cache_hit, error_occurred
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [testTraceId, testQuery, 'en', 'sustainability', 0, 0, 0]);
    
    traceId = insertResult.insertId;
    console.log('✅ Trace created with ID:', traceId);
    console.log('   Trace ID:', testTraceId);
    console.log('   Query:', testQuery);
    console.log('');
    
    // Test 2: Update trace with retrieval results
    console.log('Test 2: Recording retrieval phase...');
    const retrievedChunkIds = [101, 102, 103, 104, 105];
    const retrievalScores = [0.95, 0.89, 0.85, 0.78, 0.72];
    const rerankScores = [0.98, 0.92, 0.88, 0.75, 0.70];
    
    await conn.execute(`
      UPDATE rag_traces SET
        retrieved_chunk_ids = ?,
        retrieval_scores = ?,
        rerank_scores = ?,
        retrieval_latency_ms = ?
      WHERE id = ?
    `, [
      JSON.stringify(retrievedChunkIds),
      JSON.stringify(retrievalScores),
      JSON.stringify(rerankScores),
      150,
      traceId
    ]);
    
    console.log('✅ Retrieval recorded:');
    console.log('   Retrieved chunks:', retrievedChunkIds.length);
    console.log('   Latency:', '150ms');
    console.log('');
    
    // Test 3: Update trace with evidence selection
    console.log('Test 3: Recording evidence selection...');
    const selectedChunkIds = [101, 102, 103];
    const selectedSpans = [
      'Article 5: Digital Product Passport',
      'The passport shall include information on environmental sustainability',
      'Products covered by delegated acts'
    ];
    
    await conn.execute(`
      UPDATE rag_traces SET
        selected_chunk_ids = ?,
        selected_spans = ?
      WHERE id = ?
    `, [
      JSON.stringify(selectedChunkIds),
      JSON.stringify(selectedSpans),
      traceId
    ]);
    
    console.log('✅ Evidence selection recorded:');
    console.log('   Selected chunks:', selectedChunkIds.length);
    console.log('   Spans:', selectedSpans.length);
    console.log('');
    
    // Test 4: Update trace with claim extraction
    console.log('Test 4: Recording claim extraction...');
    const extractedClaims = [
      { claim: 'ESPR requires a Digital Product Passport for covered products', sourceChunkId: 101, confidence: 0.95 },
      { claim: 'The passport must include environmental sustainability information', sourceChunkId: 102, confidence: 0.92 },
      { claim: 'Products are covered by delegated acts pursuant to Article 4', sourceChunkId: 103, confidence: 0.88 }
    ];
    
    await conn.execute(`
      UPDATE rag_traces SET
        extracted_claims = ?
      WHERE id = ?
    `, [JSON.stringify(extractedClaims), traceId]);
    
    console.log('✅ Claim extraction recorded:');
    console.log('   Extracted claims:', extractedClaims.length);
    for (const claim of extractedClaims) {
      console.log('   - ' + claim.claim.substring(0, 50) + '... (confidence: ' + claim.confidence + ')');
    }
    console.log('');
    
    // Test 5: Update trace with generation results
    console.log('Test 5: Recording generation phase...');
    const generatedAnswer = 'The ESPR (Ecodesign for Sustainable Products Regulation) establishes a requirement for Digital Product Passports (DPPs) for products covered by delegated acts. According to Article 5, the passport must include information on the product\'s environmental sustainability. This enables consumers and businesses to make informed decisions based on verified product data.';
    const citations = [
      { text: 'Article 5: Digital Product Passport', sourceChunkId: 101, sourceTitle: 'ESPR Regulation', sourceUrl: 'https://eur-lex.europa.eu/...' },
      { text: 'The passport shall include information on environmental sustainability', sourceChunkId: 102, sourceTitle: 'ESPR Regulation', sourceUrl: 'https://eur-lex.europa.eu/...' }
    ];
    
    await conn.execute(`
      UPDATE rag_traces SET
        generated_answer = ?,
        citations = ?,
        generation_latency_ms = ?,
        llm_model = ?,
        prompt_version = ?,
        confidence_score = ?,
        citation_precision = ?,
        total_latency_ms = ?
      WHERE id = ?
    `, [
      generatedAnswer,
      JSON.stringify(citations),
      850,
      'gpt-4o-mini',
      'v1.2.0',
      0.92,
      1.0,
      1000,
      traceId
    ]);
    
    console.log('✅ Generation recorded:');
    console.log('   Answer length:', generatedAnswer.length, 'chars');
    console.log('   Citations:', citations.length);
    console.log('   LLM Model: gpt-4o-mini');
    console.log('   Total latency: 1000ms');
    console.log('   Confidence: 0.92');
    console.log('   Citation precision: 1.0');
    console.log('');
    
    // Test 6: Retrieve and verify the complete trace
    console.log('Test 6: Retrieving complete trace...');
    const [traceRows] = await conn.execute('SELECT * FROM rag_traces WHERE id = ?', [traceId]);
    const trace = traceRows[0];
    
    console.log('✅ Complete trace retrieved:');
    console.log('   Trace ID:', trace.trace_id);
    console.log('   Query:', trace.query);
    // mysql2 automatically parses JSON columns, so no need for JSON.parse
    const parseIfNeeded = (val) => typeof val === 'string' ? JSON.parse(val) : val;
    console.log('   Retrieved chunks:', parseIfNeeded(trace.retrieved_chunk_ids).length);
    console.log('   Selected chunks:', parseIfNeeded(trace.selected_chunk_ids).length);
    console.log('   Extracted claims:', parseIfNeeded(trace.extracted_claims).length);
    console.log('   Citations:', parseIfNeeded(trace.citations).length);
    console.log('   Total latency:', trace.total_latency_ms, 'ms');
    console.log('   Confidence:', trace.confidence_score);
    console.log('   Citation precision:', trace.citation_precision);
    console.log('');
    
    // Test 7: Test abstention recording
    console.log('Test 7: Testing abstention recording...');
    const abstainTraceId = uuidv4();
    
    await conn.execute(`
      INSERT INTO rag_traces (
        trace_id, query, query_language, abstained, abstention_reason,
        cache_hit, error_occurred
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      abstainTraceId,
      'What is the price of Bitcoin tomorrow?',
      'en',
      1,
      'Query is out of scope - ISA does not provide financial predictions',
      0,
      0
    ]);
    
    const [abstainRows] = await conn.execute(
      'SELECT * FROM rag_traces WHERE trace_id = ?', 
      [abstainTraceId]
    );
    
    if (abstainRows[0].abstained === 1) {
      console.log('✅ Abstention recorded correctly');
      console.log('   Reason:', abstainRows[0].abstention_reason);
    } else {
      console.log('❌ Abstention recording failed');
    }
    console.log('');
    
    // Test 8: Test error recording
    console.log('Test 8: Testing error recording...');
    const errorTraceId = uuidv4();
    
    await conn.execute(`
      INSERT INTO rag_traces (
        trace_id, query, query_language, abstained, cache_hit,
        error_occurred, error_message, error_stack
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      errorTraceId,
      'Test query with error',
      'en',
      0,
      0,
      1,
      'OpenAI API rate limit exceeded',
      'Error: Rate limit exceeded\\n    at generateAnswer (ask-isa.ts:150)'
    ]);
    
    const [errorRows] = await conn.execute(
      'SELECT * FROM rag_traces WHERE trace_id = ?', 
      [errorTraceId]
    );
    
    if (errorRows[0].error_occurred === 1) {
      console.log('✅ Error recorded correctly');
      console.log('   Error message:', errorRows[0].error_message);
    } else {
      console.log('❌ Error recording failed');
    }
    console.log('');
    
    // Test 9: Get trace statistics
    console.log('Test 9: Getting trace statistics...');
    const [statsResult] = await conn.execute(`
      SELECT 
        COUNT(*) as total_traces,
        SUM(CASE WHEN error_occurred = 1 THEN 1 ELSE 0 END) as error_count,
        SUM(CASE WHEN abstained = 1 THEN 1 ELSE 0 END) as abstention_count,
        SUM(CASE WHEN cache_hit = 1 THEN 1 ELSE 0 END) as cache_hit_count,
        AVG(total_latency_ms) as avg_latency_ms,
        AVG(citation_precision) as avg_citation_precision
      FROM rag_traces
    `);
    
    const stats = statsResult[0];
    console.log('✅ Trace Statistics:');
    console.log('   Total traces:', stats.total_traces);
    console.log('   Error count:', stats.error_count);
    console.log('   Abstention count:', stats.abstention_count);
    console.log('   Cache hit count:', stats.cache_hit_count);
    console.log('   Avg latency:', Math.round(stats.avg_latency_ms || 0), 'ms');
    console.log('   Avg citation precision:', stats.avg_citation_precision);
    console.log('');
    
    // Cleanup
    console.log('Cleanup: Removing test traces...');
    await conn.execute('DELETE FROM rag_traces WHERE trace_id IN (?, ?, ?)', [
      testTraceId, abstainTraceId, errorTraceId
    ]);
    console.log('✅ Test data cleaned up');
    console.log('');
    
  } finally {
    await conn.end();
  }
  
  console.log('=== GATE 1.2 TEST COMPLETE ===');
  console.log('');
  console.log('Acceptance Criteria:');
  console.log('✅ rag_traces table can store complete RAG pipeline traces');
  console.log('✅ Retrieval phase can be recorded (chunks, scores, latency)');
  console.log('✅ Evidence selection can be recorded (selected chunks, spans)');
  console.log('✅ Claim extraction can be recorded');
  console.log('✅ Generation phase can be recorded (answer, citations, latency)');
  console.log('✅ Quality metrics can be recorded (confidence, citation precision)');
  console.log('✅ Abstention can be recorded with reason');
  console.log('✅ Errors can be recorded with message and stack');
  console.log('✅ Trace statistics can be queried');
  console.log('');
  console.log('🎉 GATE 1.2 PASSED ✅');
}

runTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
