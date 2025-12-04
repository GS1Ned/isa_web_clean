/**
 * Test Vector Search Performance
 * 
 * Validates that vector-based search is working correctly and measures performance.
 */

import { vectorSearchKnowledge, buildContextFromVectorResults } from './db-knowledge-vector';

async function testVectorSearch() {
  console.log('='.repeat(60));
  console.log('TESTING VECTOR SEARCH PERFORMANCE');
  console.log('='.repeat(60));
  console.log();

  const testQueries = [
    'What is CSRD?',
    'Tell me about Digital Product Passport requirements',
    'What GS1 standards are relevant for sustainability reporting?',
    'How do I implement EPCIS for supply chain traceability?',
    'What are the ESRS disclosure requirements for climate change?',
  ];

  for (const query of testQueries) {
    console.log(`\n📝 Query: "${query}"`);
    console.log('-'.repeat(60));

    const startTime = Date.now();
    
    try {
      const results = await vectorSearchKnowledge(query, 5);
      const duration = Date.now() - startTime;

      console.log(`⏱️  Search completed in ${duration}ms`);
      console.log(`📊 Found ${results.length} results\n`);

      if (results.length > 0) {
        console.log('Top 3 Results:');
        results.slice(0, 3).forEach((result, idx) => {
          console.log(`  ${idx + 1}. [${result.type}] ${result.title}`);
          console.log(`     Similarity: ${Math.round(result.similarity * 100)}%`);
        });
      } else {
        console.log('❌ No results found');
      }

      // Test context building
      if (results.length > 0) {
        const contextStart = Date.now();
        const context = await buildContextFromVectorResults(results.slice(0, 3));
        const contextDuration = Date.now() - contextStart;
        
        console.log(`\n📄 Context built in ${contextDuration}ms`);
        console.log(`   Length: ${context.length} characters`);
      }

      console.log(`\n✅ Total time: ${Date.now() - startTime}ms`);

    } catch (error) {
      console.error(`❌ Search failed:`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('TEST COMPLETE');
  console.log('='.repeat(60));
  
  process.exit(0);
}

testVectorSearch();
