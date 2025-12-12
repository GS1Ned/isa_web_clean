import { ingestGdsnCurrent } from "../server/ingest/INGEST-02_gdsn_current";

async function main() {
  console.log("Testing INGEST-02 (GDSN Current) in dry-run mode...\n");
  
  const result = await ingestGdsnCurrent({
    dryRun: true,
    verbose: true,
    limit: 10,
  });

  console.log("\n=== Dry Run Result ===");
  console.log(JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log("\n✅ Dry run successful!");
  } else {
    console.log("\n❌ Dry run failed!");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
