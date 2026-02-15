import { ingestEsrsDatapoints } from "../server/ingest/INGEST-03_esrs_datapoints";
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);


async function main() {
  cliOut("Starting ESRS datapoints ingestion...");
  const result = await ingestEsrsDatapoints({ verbose: true });
  cliOut("Ingestion result:", JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch((err) => {
  cliErr("Error:", err);
  process.exit(1);
});
