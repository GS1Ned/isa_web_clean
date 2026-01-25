import { runNewsPipeline } from './server/news-pipeline.js';

console.log('=== Starting ESG News Pipeline ===');
console.log('Start time:', new Date().toISOString());

try {
  const result = await runNewsPipeline({ 
    mode: 'incremental',
    triggeredBy: 'manual'
  });
  
  console.log('\n=== Pipeline Completed ===');
  console.log('End time:', new Date().toISOString());
  console.log('Result:', JSON.stringify(result, null, 2));
  
  process.exit(result.success ? 0 : 1);
} catch (error) {
  console.error('\n=== Pipeline Failed ===');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
