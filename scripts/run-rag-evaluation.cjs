/**
 * ISA RAG Evaluation Harness
 * 
 * Automated quality testing using the Golden QA dataset.
 * Runs Ask ISA queries against golden pairs and measures:
 * - Answer correctness (semantic similarity)
 * - Citation accuracy (expected vs actual sources)
 * - Abstention appropriateness
 * - Response latency
 * 
 * Usage:
 *   node scripts/run-rag-evaluation.cjs [options]
 * 
 * Options:
 *   --limit N       Run only N test cases (default: all)
 *   --domain X      Filter by domain (gs1_standards, dpp, etc.)
 *   --difficulty X  Filter by difficulty (easy, medium, hard)
 *   --dry-run       Show what would be tested without running
 *   --verbose       Show detailed output for each test
 */

const mysql = require('mysql2/promise');
const crypto = require('crypto');

// Configuration
const CONFIG = {
  // OpenAI for semantic similarity
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiBaseUrl: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
  
  // Database
  db: {
    host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: 'dtVAxSKn7P5nF6W.root',
    password: 'qyjk6KJU2cT8Yjkb',
    database: 'isa_db',
    ssl: { rejectUnauthorized: true }
  },
  
  // Evaluation thresholds
  thresholds: {
    semanticSimilarityMin: 0.7,  // Minimum cosine similarity for "correct"
    citationPrecisionMin: 0.5,   // At least 50% of expected citations present
    maxLatencyMs: 10000          // Maximum acceptable latency
  }
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    limit: null,
    domain: null,
    difficulty: null,
    dryRun: false,
    verbose: false
  };
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--limit':
        options.limit = parseInt(args[++i], 10);
        break;
      case '--domain':
        options.domain = args[++i];
        break;
      case '--difficulty':
        options.difficulty = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
    }
  }
  
  return options;
}

// Fetch golden QA pairs from database
async function fetchGoldenPairs(conn, options) {
  let query = 'SELECT * FROM golden_qa_pairs WHERE is_active = 1';
  const params = [];
  
  if (options.domain) {
    query += ' AND domain = ?';
    params.push(options.domain);
  }
  
  if (options.difficulty) {
    query += ' AND difficulty = ?';
    params.push(options.difficulty);
  }
  
  query += ' ORDER BY domain, difficulty';
  
  if (options.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
  }
  
  const [rows] = await conn.query(query, params);
  return rows;
}

// Simulate Ask ISA query (in production, this would call the actual API)
async function queryAskISA(question, conn) {
  const startTime = Date.now();
  
  // For now, we simulate by doing a vector search
  // In production, this would call the actual Ask ISA endpoint
  
  try {
    // Get embedding for question
    const embedding = await getEmbedding(question);
    
    // Search knowledge base
    const [results] = await conn.query(`
      SELECT id, content, sourceType, authority_level,
             (1 - VEC_COSINE_DISTANCE(embedding, ?)) as similarity
      FROM knowledge_embeddings
      WHERE 1 - VEC_COSINE_DISTANCE(embedding, ?) > 0.3
      ORDER BY similarity DESC
      LIMIT 5
    `, [JSON.stringify(embedding), JSON.stringify(embedding)]);
    
    const latencyMs = Date.now() - startTime;
    
    if (results.length === 0) {
      return {
        answer: null,
        citations: [],
        abstained: true,
        abstentionReason: 'NO_RELEVANT_RESULTS',
        latencyMs
      };
    }
    
    // Generate answer using retrieved context
    const context = results.map(r => r.content).join('\n\n');
    const answer = await generateAnswer(question, context);
    
    return {
      answer,
      citations: results.map(r => ({
        sourceType: r.sourceType,
        similarity: r.similarity,
        authorityLevel: r.authority_level
      })),
      abstained: false,
      abstentionReason: null,
      latencyMs: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      answer: null,
      citations: [],
      abstained: true,
      abstentionReason: 'ERROR',
      error: error.message,
      latencyMs: Date.now() - startTime
    };
  }
}

// Get embedding from OpenAI
async function getEmbedding(text) {
  const response = await fetch(`${CONFIG.openaiBaseUrl}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.openaiApiKey}`
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text
    })
  });
  
  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.data[0].embedding;
}

// Generate answer using GPT
async function generateAnswer(question, context) {
  const response = await fetch(`${CONFIG.openaiBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.openaiApiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Je bent ISA, de Intelligent Standards Assistant van GS1 Nederland. Beantwoord de vraag op basis van de gegeven context. Wees beknopt maar volledig.'
        },
        {
          role: 'user',
          content: `Context:\n${context}\n\nVraag: ${question}`
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    })
  });
  
  if (!response.ok) {
    throw new Error(`Chat API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

// Calculate semantic similarity between two texts
async function calculateSemanticSimilarity(text1, text2) {
  const [emb1, emb2] = await Promise.all([
    getEmbedding(text1),
    getEmbedding(text2)
  ]);
  
  // Cosine similarity
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < emb1.length; i++) {
    dotProduct += emb1[i] * emb2[i];
    norm1 += emb1[i] * emb1[i];
    norm2 += emb2[i] * emb2[i];
  }
  
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

// Calculate citation precision
function calculateCitationPrecision(expectedCitations, actualCitations) {
  if (!expectedCitations || expectedCitations.length === 0) {
    return 1.0; // No citations expected
  }
  
  const expected = new Set(Array.isArray(expectedCitations) ? expectedCitations : JSON.parse(expectedCitations));
  const actual = new Set(actualCitations.map(c => c.sourceType));
  
  let matches = 0;
  for (const exp of expected) {
    if (actual.has(exp)) {
      matches++;
    }
  }
  
  return matches / expected.size;
}

// Evaluate a single test case
async function evaluateTestCase(pair, conn, options) {
  const result = {
    id: pair.id,
    question: pair.question,
    domain: pair.domain,
    difficulty: pair.difficulty,
    passed: false,
    metrics: {}
  };
  
  try {
    // Query Ask ISA
    const response = await queryAskISA(pair.question, conn);
    result.response = response;
    
    // Check abstention
    if (pair.expected_abstain && response.abstained) {
      result.passed = true;
      result.metrics.abstentionCorrect = true;
      return result;
    }
    
    if (pair.expected_abstain && !response.abstained) {
      result.passed = false;
      result.metrics.abstentionCorrect = false;
      result.failureReason = 'Should have abstained but answered';
      return result;
    }
    
    if (!pair.expected_abstain && response.abstained) {
      result.passed = false;
      result.metrics.abstentionCorrect = false;
      result.failureReason = `Unexpected abstention: ${response.abstentionReason}`;
      return result;
    }
    
    // Calculate semantic similarity
    const similarity = await calculateSemanticSimilarity(
      pair.expected_answer,
      response.answer
    );
    result.metrics.semanticSimilarity = similarity;
    
    // Calculate citation precision
    const citationPrecision = calculateCitationPrecision(
      pair.expected_citations,
      response.citations
    );
    result.metrics.citationPrecision = citationPrecision;
    
    // Check latency
    result.metrics.latencyMs = response.latencyMs;
    
    // Determine pass/fail
    const passedSimilarity = similarity >= CONFIG.thresholds.semanticSimilarityMin;
    const passedCitation = citationPrecision >= CONFIG.thresholds.citationPrecisionMin;
    const passedLatency = response.latencyMs <= CONFIG.thresholds.maxLatencyMs;
    
    result.passed = passedSimilarity && passedCitation && passedLatency;
    
    if (!result.passed) {
      const failures = [];
      if (!passedSimilarity) failures.push(`similarity ${similarity.toFixed(2)} < ${CONFIG.thresholds.semanticSimilarityMin}`);
      if (!passedCitation) failures.push(`citation ${citationPrecision.toFixed(2)} < ${CONFIG.thresholds.citationPrecisionMin}`);
      if (!passedLatency) failures.push(`latency ${response.latencyMs}ms > ${CONFIG.thresholds.maxLatencyMs}ms`);
      result.failureReason = failures.join(', ');
    }
    
  } catch (error) {
    result.passed = false;
    result.error = error.message;
    result.failureReason = `Error: ${error.message}`;
  }
  
  return result;
}

// Store evaluation results
async function storeEvaluationResults(conn, runId, results) {
  for (const result of results) {
    await conn.query(`
      INSERT INTO evaluation_results 
      (id, golden_pair_id, run_id, generated_answer, citations_used, 
       semantic_similarity, citation_precision, latency_ms, passed, 
       failure_reason, evaluated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      crypto.randomUUID(),
      result.id,
      runId,
      result.response?.answer || null,
      JSON.stringify(result.response?.citations || []),
      result.metrics?.semanticSimilarity || null,
      result.metrics?.citationPrecision || null,
      result.metrics?.latencyMs || null,
      result.passed ? 1 : 0,
      result.failureReason || null
    ]);
  }
}

// Main evaluation function
async function runEvaluation() {
  const options = parseArgs();
  
  console.log('🧪 ISA RAG Evaluation Harness\n');
  console.log('Configuration:');
  console.log(`   Limit: ${options.limit || 'all'}`);
  console.log(`   Domain: ${options.domain || 'all'}`);
  console.log(`   Difficulty: ${options.difficulty || 'all'}`);
  console.log(`   Dry run: ${options.dryRun}`);
  console.log(`   Verbose: ${options.verbose}\n`);
  
  const conn = await mysql.createConnection(CONFIG.db);
  
  try {
    // Fetch golden pairs
    const pairs = await fetchGoldenPairs(conn, options);
    console.log(`📋 Found ${pairs.length} test cases\n`);
    
    if (options.dryRun) {
      console.log('Test cases that would be run:');
      for (const pair of pairs) {
        console.log(`   [${pair.domain}/${pair.difficulty}] ${pair.question.substring(0, 60)}...`);
      }
      return;
    }
    
    // Run evaluation
    const runId = crypto.randomUUID();
    const results = [];
    let passed = 0;
    let failed = 0;
    
    console.log('Running evaluation...\n');
    
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      process.stdout.write(`   [${i + 1}/${pairs.length}] ${pair.question.substring(0, 40)}... `);
      
      const result = await evaluateTestCase(pair, conn, options);
      results.push(result);
      
      if (result.passed) {
        passed++;
        console.log('✅ PASS');
      } else {
        failed++;
        console.log(`❌ FAIL: ${result.failureReason}`);
      }
      
      if (options.verbose && result.response?.answer) {
        console.log(`      Expected: ${pair.expected_answer.substring(0, 100)}...`);
        console.log(`      Got: ${result.response.answer.substring(0, 100)}...`);
        console.log(`      Similarity: ${result.metrics?.semanticSimilarity?.toFixed(3) || 'N/A'}`);
        console.log('');
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Store results
    await storeEvaluationResults(conn, runId, results);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 EVALUATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`   Run ID: ${runId}`);
    console.log(`   Total: ${results.length}`);
    console.log(`   Passed: ${passed} (${(passed / results.length * 100).toFixed(1)}%)`);
    console.log(`   Failed: ${failed} (${(failed / results.length * 100).toFixed(1)}%)`);
    
    // Metrics summary
    const validResults = results.filter(r => r.metrics?.semanticSimilarity != null);
    if (validResults.length > 0) {
      const avgSimilarity = validResults.reduce((sum, r) => sum + r.metrics.semanticSimilarity, 0) / validResults.length;
      const avgCitation = validResults.reduce((sum, r) => sum + (r.metrics.citationPrecision || 0), 0) / validResults.length;
      const avgLatency = validResults.reduce((sum, r) => sum + (r.metrics.latencyMs || 0), 0) / validResults.length;
      
      console.log('\n📈 Average Metrics:');
      console.log(`   Semantic Similarity: ${avgSimilarity.toFixed(3)}`);
      console.log(`   Citation Precision: ${avgCitation.toFixed(3)}`);
      console.log(`   Latency: ${avgLatency.toFixed(0)}ms`);
    }
    
    // By domain
    const byDomain = {};
    for (const result of results) {
      const domain = result.domain;
      if (!byDomain[domain]) {
        byDomain[domain] = { passed: 0, failed: 0 };
      }
      if (result.passed) {
        byDomain[domain].passed++;
      } else {
        byDomain[domain].failed++;
      }
    }
    
    console.log('\n📊 By Domain:');
    for (const [domain, stats] of Object.entries(byDomain)) {
      const total = stats.passed + stats.failed;
      const rate = (stats.passed / total * 100).toFixed(1);
      console.log(`   ${domain}: ${stats.passed}/${total} (${rate}%)`);
    }
    
    console.log('\n✅ Evaluation complete. Results stored in evaluation_results table.');
    
  } finally {
    await conn.end();
  }
}

// Run
runEvaluation().catch(console.error);
