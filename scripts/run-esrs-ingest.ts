import { ingestEsrsDatapoints } from "../server/ingest/INGEST-03_esrs_datapoints";

async function main() {
  console.log("Starting ESRS datapoints ingestion...");
  const result = await ingestEsrsDatapoints({ verbose: true });
  console.log("Ingestion result:", JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
