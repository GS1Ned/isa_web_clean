import { runNewsPipeline } from './server/news-pipeline.js';
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);


cliOut('=== Starting ESG News Pipeline ===');
cliOut('Start time:', new Date().toISOString());

try {
  const result = await runNewsPipeline({ 
    mode: 'incremental',
    triggeredBy: 'manual'
  });
  
  cliOut('\n=== Pipeline Completed ===');
  cliOut('End time:', new Date().toISOString());
  cliOut('Result:', JSON.stringify(result, null, 2));
  
  process.exit(result.success ? 0 : 1);
} catch (error) {
  cliErr('\n=== Pipeline Failed ===');
  cliErr('Error:', error.message);
  cliErr('Stack:', error.stack);
  process.exit(1);
}
