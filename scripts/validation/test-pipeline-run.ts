import { runNewsPipeline } from './server/news-pipeline';
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);


async function main() {
  cliOut('Starting manual pipeline test...');
  const result = await runNewsPipeline('manual');
  cliOut('\n=== PIPELINE RESULT ===');
  cliOut(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}

main().catch((err) => cliErr(err));
