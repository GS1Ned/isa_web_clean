import { generateRegulationEsrsMappings } from "./regulation-esrs-mapper";
import { getDb } from "./db";
import { serverLogger } from "./_core/logger-wiring";


/**
 * Batch generate ESRS datapoint mappings for all regulations
 * Run this script to populate the platform with mappings
 */

async function batchGenerateEsrsMappings() {
  console.log("=== Batch ESRS Mapping Generation ===\n");

  const db = await getDb();
  if (!db) {
    serverLogger.error("❌ Database not available");
    process.exit(1);
  }

  // Fetch all regulations
  const { regulations } = await import("../drizzle/schema");
  const allRegulations = await db.select().from(regulations);

  console.log(`Found ${allRegulations.length} regulations\n`);

  if (allRegulations.length === 0) {
    console.log("No regulations found. Run CELLAR sync first.");
    process.exit(0);
  }

  // Statistics
  let successCount = 0;
  let failureCount = 0;
  let totalMappings = 0;
  const results: Array<{
    id: number;
    title: string;
    mappingsCount: number;
    success: boolean;
    error?: string;
  }> = [];

  // Process each regulation
  for (let i = 0; i < allRegulations.length; i++) {
    const regulation = allRegulations[i];
    const progress = `[${i + 1}/${allRegulations.length}]`;

    console.log(`${progress} Processing: ${regulation.title}`);

    try {
      const result = await generateRegulationEsrsMappings(regulation.id);

      if (result.success) {
        successCount++;
        totalMappings += result.mappingsCount;
        console.log(`  ✅ Generated ${result.mappingsCount} mappings`);

        results.push({
          id: regulation.id,
          title: regulation.title,
          mappingsCount: result.mappingsCount,
          success: true,
        });
      } else {
        failureCount++;
        console.log(`  ❌ Failed: ${result.error}`);

        results.push({
          id: regulation.id,
          title: regulation.title,
          mappingsCount: 0,
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      failureCount++;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.log(`  ❌ Error: ${errorMessage}`);

      results.push({
        id: regulation.id,
        title: regulation.title,
        mappingsCount: 0,
        success: false,
        error: errorMessage,
      });
    }

    // Small delay to avoid rate limiting
    if (i < allRegulations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log("");
  }

  // Print summary
  console.log("=== Batch Generation Complete ===\n");
  console.log(`Total Regulations: ${allRegulations.length}`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failures: ${failureCount}`);
  console.log(`📊 Total Mappings: ${totalMappings}`);
  console.log(
    `📈 Average per Regulation: ${(totalMappings / successCount).toFixed(1)}`
  );

  // Print distribution
  console.log("\n=== Mapping Distribution ===\n");
  const distribution = results
    .filter(r => r.success)
    .reduce(
      (acc, r) => {
        const bucket = Math.floor(r.mappingsCount / 5) * 5; // Group by 5s
        const key = `${bucket}-${bucket + 4}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

  Object.entries(distribution)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .forEach(([range, count]) => {
      console.log(`  ${range} mappings: ${count} regulations`);
    });

  // Print failures if any
  if (failureCount > 0) {
    console.log("\n=== Failures ===\n");
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`  - ${r.title}: ${r.error}`);
      });
  }

  console.log("\n✅ Batch generation complete!");
}

// Run if executed directly
batchGenerateEsrsMappings()
  .then(() => process.exit(0))
  .catch(error => {
    serverLogger.error("Fatal error:", error);
    process.exit(1);
  });

export { batchGenerateEsrsMappings };
