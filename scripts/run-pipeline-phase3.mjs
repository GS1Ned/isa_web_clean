/**
 * Run Pipeline with Phase 3 Sources
 * Fetches articles from all enabled sources including new Phase 3 sources
 */

import { runNewsPipeline } from "../server/news-pipeline.ts";

console.log("=== Running News Pipeline with Phase 3 Sources ===\n");
console.log("Mode: normal (incremental fetch)");
console.log("Triggered by: manual\n");

try {
  const result = await runNewsPipeline({
    mode: "normal",
    triggeredBy: "manual",
  });

  console.log("\n=== Pipeline Results ===");
  console.log(`Success: ${result.success}`);
  console.log(`Mode: ${result.mode}`);
  console.log(`Max Age Days: ${result.maxAgeDays}`);
  console.log(`Duration: ${(result.duration / 1000).toFixed(2)}s`);
  console.log();
  console.log("Statistics:");
  console.log(`  Fetched: ${result.fetched}`);
  console.log(`  Processed: ${result.processed}`);
  console.log(`  Inserted: ${result.inserted}`);
  console.log(`  Skipped: ${result.skipped}`);
  
  if (result.errors.length > 0) {
    console.log();
    console.log("Errors:");
    result.errors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err}`);
    });
  }

  console.log("\n=== Pipeline Complete ===");
} catch (error) {
  console.error("Pipeline failed:", error);
  process.exit(1);
}
