import { ingestGdsnCurrent } from "../server/ingest/INGEST-02_gdsn_current";
import { ingestCtesKdes } from "../server/ingest/INGEST-04_ctes_kdes";
import { ingestDppIdentificationRules } from "../server/ingest/INGEST-05_dpp_rules";
import { ingestCbvDigitalLink } from "../server/ingest/INGEST-06_cbv_digital_link";

async function main() {
  console.log("=".repeat(80));
  console.log("ISA Data Ingestion - Batch Execution");
  console.log("Tasks: INGEST-02, 04, 05, 06");
  console.log("=".repeat(80));
  console.log();

  const startTime = Date.now();
  const results: Record<string, any> = {};

  // INGEST-02: GDSN Current
  console.log("\n" + "=".repeat(80));
  console.log("INGEST-02: GDSN Current v3.1.32");
  console.log("=".repeat(80));
  try {
    results.ingest02 = await ingestGdsnCurrent({ verbose: true });
  } catch (error) {
    console.error("INGEST-02 failed:", error);
    results.ingest02 = { success: false, error: String(error) };
  }

  // INGEST-04: CTEs and KDEs
  console.log("\n" + "=".repeat(80));
  console.log("INGEST-04: CTEs and KDEs");
  console.log("=".repeat(80));
  try {
    results.ingest04 = await ingestCtesKdes({ verbose: true });
  } catch (error) {
    console.error("INGEST-04 failed:", error);
    results.ingest04 = { success: false, error: String(error) };
  }

  // INGEST-05: DPP Identification Rules
  console.log("\n" + "=".repeat(80));
  console.log("INGEST-05: DPP Identification Rules");
  console.log("=".repeat(80));
  try {
    results.ingest05 = await ingestDppIdentificationRules({ verbose: true });
  } catch (error) {
    console.error("INGEST-05 failed:", error);
    results.ingest05 = { success: false, error: String(error) };
  }

  // INGEST-06: CBV Vocabularies & Digital Link Types
  console.log("\n" + "=".repeat(80));
  console.log("INGEST-06: CBV Vocabularies & Digital Link Types");
  console.log("=".repeat(80));
  try {
    results.ingest06 = await ingestCbvDigitalLink({ verbose: true });
  } catch (error) {
    console.error("INGEST-06 failed:", error);
    results.ingest06 = { success: false, error: String(error) };
  }

  const totalDuration = Date.now() - startTime;

  // Summary
  console.log("\n" + "=".repeat(80));
  console.log("FINAL SUMMARY");
  console.log("=".repeat(80));
  console.log();

  const summary = {
    ingest02: {
      name: "GDSN Current",
      success: results.ingest02?.success || false,
      records: results.ingest02?.recordsInserted || 0,
      duration: results.ingest02?.duration || 0,
    },
    ingest04: {
      name: "CTEs/KDEs",
      success: results.ingest04?.success || false,
      records: results.ingest04?.recordsInserted || 0,
      duration: results.ingest04?.duration || 0,
    },
    ingest05: {
      name: "DPP Rules",
      success: results.ingest05?.success || false,
      records: results.ingest05?.recordsInserted || 0,
      duration: results.ingest05?.duration || 0,
    },
    ingest06: {
      name: "CBV/Digital Link",
      success: results.ingest06?.success || false,
      records: results.ingest06?.recordsInserted || 0,
      duration: results.ingest06?.duration || 0,
    },
  };

  console.table(summary);

  const totalRecords = Object.values(summary).reduce(
    (sum, task) => sum + task.records,
    0
  );
  const allSuccess = Object.values(summary).every((task) => task.success);

  console.log();
  console.log(`Total Records Ingested: ${totalRecords}`);
  console.log(`Total Duration: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`);
  console.log(`Overall Status: ${allSuccess ? "✅ SUCCESS" : "❌ FAILED"}`);
  console.log();

  if (!allSuccess) {
    console.error("Some ingestion tasks failed. Check logs above for details.");
    process.exit(1);
  }

  console.log("✅ All ingestion tasks completed successfully!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
