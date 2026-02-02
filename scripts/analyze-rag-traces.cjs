/**
 * RAG Trace Analysis Tool
 * Version: 1.0
 * Last Updated: February 2, 2026
 * 
 * Purpose: Analyze RAG traces to identify patterns, issues, and quality metrics
 * 
 * Usage:
 *   node scripts/analyze-rag-traces.cjs [--limit N] [--since YYYY-MM-DD] [--export]
 * 
 * Options:
 *   --limit N        Analyze last N traces (default: 100)
 *   --since DATE     Analyze traces since DATE
 *   --export         Export results to JSON file
 */

const mysql = require('mysql2/promise');

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || 
  'mysql://dtVAxSKn7P5nF6W.root:qyjk6KJU2cT8Yjkb@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/isa_db';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  limit: 100,
  since: null,
  export: false,
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--limit' && args[i + 1]) {
    options.limit = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--since' && args[i + 1]) {
    options.since = args[i + 1];
    i++;
  } else if (args[i] === '--export') {
    options.export = true;
  }
}

// ============================================================================
// Analysis Functions
// ============================================================================

/**
 * Calculate traceability score from answer text
 */
function calculateTraceabilityScore(answer, numSources) {
  if (!answer) return { score: 0, details: 'No answer' };
  
  // Extract sentences (simple split)
  const sentences = answer
    .replace(/([.!?])\s+/g, '$1\n')
    .split('\n')
    .filter(s => s.trim().length > 20);
  
  // Count citations
  const citationRegex = /\[Source\s*(\d+)\]/gi;
  let totalCitations = 0;
  let sentencesWithCitations = 0;
  const citedSources = new Set();
  
  for (const sentence of sentences) {
    const matches = sentence.match(citationRegex);
    if (matches && matches.length > 0) {
      sentencesWithCitations++;
      totalCitations += matches.length;
      matches.forEach(m => {
        const num = parseInt(m.match(/\d+/)[0], 10);
        citedSources.add(num);
      });
    }
  }
  
  const citationRate = sentences.length > 0 ? sentencesWithCitations / sentences.length : 0;
  const sourceUtilization = numSources > 0 ? citedSources.size / numSources : 0;
  
  return {
    score: citationRate,
    sentencesTotal: sentences.length,
    sentencesCited: sentencesWithCitations,
    totalCitations,
    uniqueSourcesCited: citedSources.size,
    sourceUtilization,
  };
}

/**
 * Analyze abstention patterns
 */
function analyzeAbstentions(traces) {
  const abstentions = traces.filter(t => t.abstention_reason);
  const reasons = {};
  
  for (const trace of abstentions) {
    const reason = trace.abstention_reason || 'unknown';
    reasons[reason] = (reasons[reason] || 0) + 1;
  }
  
  return {
    total: abstentions.length,
    rate: traces.length > 0 ? abstentions.length / traces.length : 0,
    byReason: reasons,
  };
}

/**
 * Analyze latency distribution
 */
function analyzeLatency(traces) {
  const latencies = traces
    .filter(t => t.retrieval_latency_ms || t.generation_latency_ms)
    .map(t => ({
      retrieval: t.retrieval_latency_ms || 0,
      generation: t.generation_latency_ms || 0,
      total: (t.retrieval_latency_ms || 0) + (t.generation_latency_ms || 0),
    }));
  
  if (latencies.length === 0) {
    return { available: false };
  }
  
  const retrievalTimes = latencies.map(l => l.retrieval).sort((a, b) => a - b);
  const generationTimes = latencies.map(l => l.generation).sort((a, b) => a - b);
  const totalTimes = latencies.map(l => l.total).sort((a, b) => a - b);
  
  const percentile = (arr, p) => arr[Math.floor(arr.length * p)] || 0;
  
  return {
    available: true,
    count: latencies.length,
    retrieval: {
      p50: percentile(retrievalTimes, 0.5),
      p90: percentile(retrievalTimes, 0.9),
      p99: percentile(retrievalTimes, 0.99),
    },
    generation: {
      p50: percentile(generationTimes, 0.5),
      p90: percentile(generationTimes, 0.9),
      p99: percentile(generationTimes, 0.99),
    },
    total: {
      p50: percentile(totalTimes, 0.5),
      p90: percentile(totalTimes, 0.9),
      p99: percentile(totalTimes, 0.99),
    },
  };
}

/**
 * Analyze confidence distribution
 */
function analyzeConfidence(traces) {
  const confidences = traces
    .filter(t => t.confidence_score !== null && t.confidence_score !== undefined)
    .map(t => t.confidence_score);
  
  if (confidences.length === 0) {
    return { available: false };
  }
  
  const sorted = [...confidences].sort((a, b) => a - b);
  const sum = confidences.reduce((a, b) => a + b, 0);
  
  return {
    available: true,
    count: confidences.length,
    mean: sum / confidences.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p25: sorted[Math.floor(sorted.length * 0.25)],
    p50: sorted[Math.floor(sorted.length * 0.5)],
    p75: sorted[Math.floor(sorted.length * 0.75)],
    distribution: {
      low: confidences.filter(c => c < 0.5).length,
      medium: confidences.filter(c => c >= 0.5 && c < 0.8).length,
      high: confidences.filter(c => c >= 0.8).length,
    },
  };
}

/**
 * Analyze traceability across all traces
 */
function analyzeTraceability(traces) {
  const scores = traces
    .filter(t => t.generated_response)
    .map(t => {
      const numSources = t.retrieved_chunks ? 
        (typeof t.retrieved_chunks === 'string' ? JSON.parse(t.retrieved_chunks) : t.retrieved_chunks).length : 5;
      return calculateTraceabilityScore(t.generated_response, numSources);
    });
  
  if (scores.length === 0) {
    return { available: false };
  }
  
  const avgScore = scores.reduce((a, b) => a + b.score, 0) / scores.length;
  const avgUtilization = scores.reduce((a, b) => a + b.sourceUtilization, 0) / scores.length;
  
  return {
    available: true,
    count: scores.length,
    avgCitationRate: avgScore,
    avgSourceUtilization: avgUtilization,
    distribution: {
      excellent: scores.filter(s => s.score >= 0.9).length,
      good: scores.filter(s => s.score >= 0.7 && s.score < 0.9).length,
      acceptable: scores.filter(s => s.score >= 0.5 && s.score < 0.7).length,
      poor: scores.filter(s => s.score < 0.5).length,
    },
  };
}

// ============================================================================
// Main Analysis
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('RAG TRACE ANALYSIS');
  console.log('='.repeat(60));
  console.log(`Options: limit=${options.limit}, since=${options.since || 'all'}, export=${options.export}`);
  console.log('');
  
  // Connect to database
  const conn = await mysql.createConnection({
    uri: DATABASE_URL,
    ssl: { rejectUnauthorized: true },
  });
  
  try {
    // Build query
    let query = 'SELECT * FROM rag_traces';
    const params = [];
    
    if (options.since) {
      query += ' WHERE created_at >= ?';
      params.push(options.since);
    }
    
    query += ` ORDER BY created_at DESC LIMIT ${options.limit}`;
    
    // Fetch traces
    const [traces] = await conn.execute(query, params);
    
    console.log(`Analyzing ${traces.length} traces...`);
    console.log('');
    
    if (traces.length === 0) {
      console.log('No traces found. The RAG tracing system may not be active yet.');
      console.log('Traces will appear here once Ask ISA queries are processed with tracing enabled.');
      return;
    }
    
    // Run analyses
    const results = {
      summary: {
        totalTraces: traces.length,
        dateRange: {
          earliest: traces[traces.length - 1]?.created_at,
          latest: traces[0]?.created_at,
        },
      },
      abstentions: analyzeAbstentions(traces),
      latency: analyzeLatency(traces),
      confidence: analyzeConfidence(traces),
      traceability: analyzeTraceability(traces),
    };
    
    // Print results
    console.log('SUMMARY');
    console.log('-'.repeat(40));
    console.log(`Total traces: ${results.summary.totalTraces}`);
    console.log(`Date range: ${results.summary.dateRange.earliest} to ${results.summary.dateRange.latest}`);
    console.log('');
    
    console.log('ABSTENTION ANALYSIS');
    console.log('-'.repeat(40));
    console.log(`Abstention rate: ${(results.abstentions.rate * 100).toFixed(1)}%`);
    console.log(`Total abstentions: ${results.abstentions.total}`);
    if (Object.keys(results.abstentions.byReason).length > 0) {
      console.log('By reason:');
      for (const [reason, count] of Object.entries(results.abstentions.byReason)) {
        console.log(`  ${reason}: ${count}`);
      }
    }
    console.log('');
    
    console.log('LATENCY ANALYSIS');
    console.log('-'.repeat(40));
    if (results.latency.available) {
      console.log(`Retrieval p50/p90/p99: ${results.latency.retrieval.p50}/${results.latency.retrieval.p90}/${results.latency.retrieval.p99} ms`);
      console.log(`Generation p50/p90/p99: ${results.latency.generation.p50}/${results.latency.generation.p90}/${results.latency.generation.p99} ms`);
      console.log(`Total p50/p90/p99: ${results.latency.total.p50}/${results.latency.total.p90}/${results.latency.total.p99} ms`);
    } else {
      console.log('No latency data available');
    }
    console.log('');
    
    console.log('CONFIDENCE ANALYSIS');
    console.log('-'.repeat(40));
    if (results.confidence.available) {
      console.log(`Mean confidence: ${(results.confidence.mean * 100).toFixed(1)}%`);
      console.log(`Range: ${(results.confidence.min * 100).toFixed(1)}% - ${(results.confidence.max * 100).toFixed(1)}%`);
      console.log(`Distribution: low=${results.confidence.distribution.low}, medium=${results.confidence.distribution.medium}, high=${results.confidence.distribution.high}`);
    } else {
      console.log('No confidence data available');
    }
    console.log('');
    
    console.log('TRACEABILITY ANALYSIS');
    console.log('-'.repeat(40));
    if (results.traceability.available) {
      console.log(`Average citation rate: ${(results.traceability.avgCitationRate * 100).toFixed(1)}%`);
      console.log(`Average source utilization: ${(results.traceability.avgSourceUtilization * 100).toFixed(1)}%`);
      console.log(`Distribution: excellent=${results.traceability.distribution.excellent}, good=${results.traceability.distribution.good}, acceptable=${results.traceability.distribution.acceptable}, poor=${results.traceability.distribution.poor}`);
    } else {
      console.log('No traceability data available');
    }
    console.log('');
    
    // Export if requested
    if (options.export) {
      const fs = require('fs');
      const filename = `rag-trace-analysis-${new Date().toISOString().split('T')[0]}.json`;
      fs.writeFileSync(filename, JSON.stringify(results, null, 2));
      console.log(`Results exported to ${filename}`);
    }
    
    console.log('='.repeat(60));
    console.log('ANALYSIS COMPLETE');
    console.log('='.repeat(60));
    
  } finally {
    await conn.end();
  }
}

main().catch(err => {
  console.error('Analysis failed:', err.message);
  process.exit(1);
});
