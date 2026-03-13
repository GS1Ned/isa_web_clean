/**
 * Run GS1 Mapping Algorithm
 *
 * Generates regulation-to-standard mappings for all regulations in the database.
 *
 * Run with: npx tsx server/run-gs1-mapping.ts
 */

import { mapAllRegulations } from "./gs1-mapping-engine";
import { serverLogger } from "./_core/logger-wiring";


async function runMapping() {
  serverLogger.info("🔗 Starting GS1 mapping algorithm...\n");

  try {
    const results = await mapAllRegulations();

    serverLogger.info("\n✅ Mapping completed successfully!\n");
    serverLogger.info(`📊 Statistics:`);
    serverLogger.info(`   - Regulations processed: ${results.length}`);
    serverLogger.info(
      `   - Total mappings generated: ${results.reduce((sum, r) => sum + r.mappingsCount, 0)}`
    );
    serverLogger.info(
      `   - Average mappings per regulation: ${(results.reduce((sum, r) => sum + r.mappingsCount, 0) / results.length).toFixed(1)}`
    );

    serverLogger.info("\n📋 Mappings by regulation:");
    for (const result of results) {
      serverLogger.info(
        `   - Regulation ${result.regulationId}: ${result.mappingsCount} standards mapped`
      );
    }
  } catch (error) {
    serverLogger.error("\n❌ Mapping failed:", error);
    throw error;
  }
}

runMapping()
  .then(() => {
    serverLogger.info("\n🎉 Done!");
    process.exit(0);
  })
  .catch(error => {
    serverLogger.error("\n💥 Fatal error:", error);
    process.exit(1);
  });
