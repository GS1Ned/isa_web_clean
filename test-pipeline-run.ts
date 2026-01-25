import { runNewsPipeline } from './server/news-pipeline';

async function main() {
  console.log('Starting manual pipeline test...');
  const result = await runNewsPipeline('manual');
  console.log('\n=== PIPELINE RESULT ===');
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}

main().catch(console.error);
